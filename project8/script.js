class CryptoDataManager {
    constructor() {
        this.uploadedFiles = new Map();
        this.statusElement = document.getElementById('status');
        this.selectedFilesElement = document.getElementById('selectedFiles');
        this.folderInput = document.getElementById('folderInput');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.createNewFilesSwitch = document.getElementById('createNewFiles');
        this.candleLimitInput = document.getElementById('candleLimit');
        this.useCsvExtensionSwitch = document.getElementById('useCsvExtension');
        this.downloadWithoutZipSwitch = document.getElementById('downloadWithoutZip');
        this.reviewContent = document.getElementById('reviewContent');
        

        
        // Progress bar elements
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.progressActivity = document.getElementById('progressActivity');
        this.activityText = document.getElementById('activityText');
        
        this.timeframes = ['1m', '5m', '30m', '1H', '4H', '12H', '24H', '1W'];
        
        // Rozšířený seznam kryptoměn
        this.allCryptos = [
            'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'ADA/USDT', 
            'AVAX/USDT', 'MATIC/USDT', 'DOT/USDT', 'LINK/USDT', 'UNI/USDT',
            'LTC/USDT', 'BCH/USDT', 'XLM/USDT', 'VET/USDT', 'FIL/USDT',
            'ATOM/USDT', 'NEAR/USDT', 'FTM/USDT', 'ALGO/USDT', 'ICP/USDT',
            'XRP/USDT', 'DOGE/USDT', 'SHIB/USDT', 'TRX/USDT', 'EOS/USDT'
        ];
        
        this.visibleCryptos = 5; // Počet zobrazených kryptoměn
        this.cryptoStates = this.loadCryptoStates();
        this.selectedTargetFolder = null;
        
        this.initializeEventListeners();
        this.renderCryptoList();
    }

    initializeEventListeners() {
        this.folderInput.addEventListener('change', (e) => this.handleFolderUpload(e));
        this.downloadBtn.addEventListener('click', () => this.handleDownload());
        this.createNewFilesSwitch.addEventListener('change', () => this.updateStatusBasedOnSettings());
        this.candleLimitInput.addEventListener('change', () => this.updateStatusBasedOnSettings());
        this.useCsvExtensionSwitch.addEventListener('change', () => this.updateStatusBasedOnSettings());
        this.downloadWithoutZipSwitch.addEventListener('change', () => this.updateStatusBasedOnSettings());
    }

    updateStatusBasedOnSettings() {
        const createNew = this.createNewFilesSwitch.checked;
        const candleLimit = parseInt(this.candleLimitInput.value);
        const useCsv = this.useCsvExtensionSwitch.checked;
        const withoutZip = this.downloadWithoutZipSwitch.checked;
        
        let message = `Připraveno k použití`;
        if (createNew) {
            message += ` - Vytváření nových souborů: ZAPNUTO`;
        } else {
            message += ` - Vytváření nových souborů: vypnuto`;
        }
        message += ` - Limit svíček: ${candleLimit}`;
        
        let extension = '.txt';
        if (useCsv) extension = '.csv';
        
        message += ` - Přípona: ${extension}`;
        message += ` - Stahování: ${withoutZip ? 'bez ZIP' : 'ZIP soubor'}`;
        
        this.updateStatus(message);
    }

    updateStatus(message, type = 'info') {
        this.statusElement.innerHTML = `
            <p class="${type}">
                ${type === 'processing' ? '<span class="loading"></span>' : ''}
                ${message}
            </p>
        `;
        this.statusElement.className = `status ${type}`;
    }

    handleFolderUpload(event) {
        const files = Array.from(event.target.files);
        this.uploadedFiles.clear();
        
        if (files.length === 0) {
            this.selectedFilesElement.innerHTML = '<p>Žádné soubory nebyly vybrány</p>';
            return;
        }

        // Analýza struktury složek
        const folderStructure = this.analyzeFolderStructure(files);
        
        this.selectedFilesElement.innerHTML = this.generateFolderSummary(folderStructure);
        this.updateStatusBasedOnSettings();
    }

    analyzeFolderStructure(files) {
        const structure = new Map();
        
        files.forEach(file => {
            // Pro jednotlivé soubory nemáme webkitRelativePath
            const fileName = file.name;
            const timeframe = this.extractTimeframe(fileName);
            
            if (timeframe) {
                // Extrahování názvu kryptoměny z názvu souboru
                const fileNameWithoutExtension = fileName.replace(/\.(txt|csv)$/i, '');
                const parts = fileNameWithoutExtension.split('_');
                
                if (parts.length >= 2) {
                    const cryptoPair = `${parts[0]}/${parts[1]}`;
                    
                    if (!structure.has(cryptoPair)) {
                        structure.set(cryptoPair, new Map());
                    }
                    
                    structure.get(cryptoPair).set(timeframe, {
                        file: file,
                        content: null,
                        lastCandle: null
                    });
                }
            }
        });
        
        return structure;
    }

    extractTimeframe(fileName) {
        const timeframes = this.timeframes;
        // Odstranění přípony .txt nebo .csv pro analýzu
        const fileNameWithoutExtension = fileName.replace(/\.(txt|csv)$/i, '');
        
        for (const tf of timeframes) {
            if (fileNameWithoutExtension.includes(tf)) {
                return tf;
            }
        }
        return null;
    }

    generateFolderSummary(structure) {
        let html = '<h4>Nalezené složky:</h4>';
        
        structure.forEach((timeframes, cryptoPair) => {
            html += `<div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">`;
            html += `<strong>${cryptoPair}</strong><br>`;
            html += `<small>Existující časové rámce: ${Array.from(timeframes.keys()).join(', ')}</small>`;
            
            if (this.createNewFilesSwitch.checked) {
                const missingTimeframes = this.timeframes.filter(tf => !timeframes.has(tf));
                if (missingTimeframes.length > 0) {
                    html += `<br><small style="color: #4CAF50;">Bude vytvořeno: ${missingTimeframes.join(', ')}</small>`;
                }
            }
            
            html += `</div>`;
        });
        
        return html;
    }

    async handleDownload() {
        try {
            this.downloadBtn.disabled = true;
            this.updateStatus('Připravuji data ke stažení...', 'processing');
            
            const hasUploadedFiles = this.folderInput.files.length > 0;
            let finalData;
            
            if (hasUploadedFiles) {
                finalData = await this.processUploadedData();
            } else {
                finalData = await this.generateDefaultData();
            }
            
            this.downloadData(finalData);
            this.updateStatus('Data byla úspěšně připravena ke stažení!', 'success');
            
        } catch (error) {
            console.error('Chyba při zpracování dat:', error);
            this.updateStatus(`Chyba: ${error.message}`, 'error');
        } finally {
            this.downloadBtn.disabled = false;
        }
    }

    async processUploadedData() {
        this.updateStatus('Analyzuji nahraná data...', 'processing');
        
        const processedData = new Map();
        const folderStructure = this.analyzeFolderStructure(Array.from(this.folderInput.files));
        const createNewFiles = this.createNewFilesSwitch.checked;
        const candleLimit = parseInt(this.candleLimitInput.value);
        const useCsv = this.useCsvExtensionSwitch.checked;
        
        const totalCryptos = folderStructure.size;
        let processedCryptos = 0;
        
        for (const [cryptoPair, timeframes] of folderStructure) {
            processedData.set(cryptoPair, new Map());
            
            this.updateStatus(`Zpracovávám ${cryptoPair}... (${processedCryptos + 1}/${totalCryptos})`, 'processing');
            
            // Zpracování existujících souborů
            for (const [timeframe, fileData] of timeframes) {
                const content = await this.readFileContent(fileData.file);
                const candles = this.parseCandleData(content);
                const lastCandle = candles.length > 0 ? candles[candles.length - 1] : null;
                
                // Získání nových dat od poslední svíčky
                console.log(`📈 Doplňuji nová data pro ${cryptoPair} ${timeframe} (${candles.length} existujících)`);
                const newCandles = await this.fetchNewCandles(cryptoPair, timeframe, lastCandle, candleLimit);
                console.log(`✅ Staženo ${newCandles.length} nových svíček`);
                
                const updatedCandles = [...candles, ...newCandles];
                console.log(`🎯 Celkem: ${updatedCandles.length} svíček pro ${cryptoPair} ${timeframe}`);
                
                processedData.get(cryptoPair).set(timeframe, updatedCandles);
            }
            
            // Vytvoření chybějících souborů pokud je zapnuto
            if (createNewFiles) {
                for (const timeframe of this.timeframes) {
                    if (!timeframes.has(timeframe)) {
                        const candles = await this.fetchNewCandles(cryptoPair, timeframe, null, candleLimit);
                        processedData.get(cryptoPair).set(timeframe, candles);
                    }
                }
            }
            
            processedCryptos++;
        }
        
        return processedData;
    }

    async generateDefaultData() {
        this.updateStatus('Stahuji skutečná data z Binance...', 'processing');
        this.showProgress('Připravuji stahování dat...');
        
        const defaultData = new Map();
        const candleLimit = parseInt(this.candleLimitInput.value);
        const activeCryptos = this.getActiveCryptos();
        const totalOperations = activeCryptos.length * this.timeframes.length;
        let successCount = 0;
        let errorCount = 0;
        let completedOperations = 0;
        
        // Okamžitá odezva
        this.updateActivity(`🔢 Připravuji ${totalOperations} operací...`);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        for (let i = 0; i < activeCryptos.length; i++) {
            const cryptoPair = activeCryptos[i];
            defaultData.set(cryptoPair, new Map());
            
            for (let j = 0; j < this.timeframes.length; j++) {
                const timeframe = this.timeframes[j];
                
                // Update progress BEFORE operation
                const currentProgress = `${cryptoPair} ${timeframe} (${i + 1}/${activeCryptos.length})`;
                const currentActivity = `📊 Stahuji ${cryptoPair} ${timeframe}...`;
                this.updateProgress(completedOperations, totalOperations, currentProgress, currentActivity);
                
                try {
                    const candles = await this.fetchNewCandles(cryptoPair, timeframe, null, candleLimit);
                    if (candles && candles.length > 0) {
                        defaultData.get(cryptoPair).set(timeframe, candles);
                        successCount++;
                        console.log(`✅ ${cryptoPair} ${timeframe}: ${candles.length} svíček`);
                    } else {
                        console.warn(`⚠️ ${cryptoPair} ${timeframe}: Žádná data`);
                        errorCount++;
                    }
                } catch (error) {
                    console.error(`❌ ${cryptoPair} ${timeframe}: ${error.message}`);
                    errorCount++;
                    // Skip this crypto/timeframe combination but continue with others
                }
                
                // Update progress AFTER operation
                completedOperations++;
                const finalProgress = `Dokončeno: ${cryptoPair} ${timeframe}`;
                this.updateProgress(completedOperations, totalOperations, finalProgress);
                
                // Rate limiting between requests
                await new Promise(resolve => setTimeout(resolve, 150));
            }
            
            // Remove crypto if no data was downloaded
            if (defaultData.get(cryptoPair).size === 0) {
                defaultData.delete(cryptoPair);
                console.warn(`🗑️ Odstraňuji ${cryptoPair} - žádná data se nepodařila stáhnout`);
            }
            
            // Show crypto completion
            const cryptoProgress = Math.round(((i + 1) / activeCryptos.length) * 100);
            this.updateStatus(`Dokončeno: ${cryptoPair} (${cryptoProgress}% celkem)`, 'processing');
        }
        
        this.hideProgress();
        
        if (defaultData.size === 0) {
            throw new Error('Nepodařilo se stáhnout žádná data z Binance API. Zkontrolujte internetové připojení.');
        }
        
        this.updateStatus(`✅ Staženo ${successCount} souborů, ${errorCount} chyb z Binance API`, 'success');
        return defaultData;
    }

    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    parseCandleData(content) {
        const lines = content.trim().split('\n');
        const candles = [];
        
        for (const line of lines) {
            if (line.trim()) {
                const parts = line.split(',');
                if (parts.length >= 6) {
                    candles.push({
                        timestamp: parseInt(parts[0]),
                        open: parseFloat(parts[1]),
                        high: parseFloat(parts[2]),
                        low: parseFloat(parts[3]),
                        close: parseFloat(parts[4]),
                        volume: parseFloat(parts[5])
                    });
                }
            }
        }
        
        return candles;
    }

    async fetchNewCandles(cryptoPair, timeframe, lastCandle = null, limit = 5000) {
        this.updateStatus(`Stahování skutečných dat z Binance pro ${cryptoPair} ${timeframe}...`);
        
        try {
            // Convert our format to Binance format
            const symbol = cryptoPair.replace('/', '');
            const interval = this.convertTimeframeForBinance(timeframe);
            
            const allCandles = [];
            const maxPerRequest = 1000; // Binance limit
            let remaining = limit;
            let endTime = Date.now();
            
            // Make multiple API calls if needed (for more than 1000 candles)
            while (remaining > 0 && allCandles.length < limit) {
                const currentLimit = Math.min(remaining, maxPerRequest);
                
                // Binance API endpoint
                const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&endTime=${endTime}&limit=${currentLimit}`;
                
                console.log(`🔗 Stahování ${currentLimit} svíček z Binance:`, url);
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    if (response.status === 429) {
                        throw new Error('Rate limit exceeded - příliš mnoho požadavků na Binance API');
                    }
                    throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (!Array.isArray(data) || data.length === 0) {
                    console.log('Binance vrátilo prázdná data - dosažen konec dostupných dat');
                    break;
                }
                
                // Convert Binance format to our format
                const candles = data.map(kline => ({
                    timestamp: parseInt(kline[0]), // Open time
                    open: parseFloat(kline[1]),
                    high: parseFloat(kline[2]),
                    low: parseFloat(kline[3]),
                    close: parseFloat(kline[4]),
                    volume: parseFloat(kline[5])
                }));
                
                // Add to beginning (older data first)
                allCandles.unshift(...candles);
                
                // Update for next request (go further back in time)
                if (candles.length > 0) {
                    endTime = candles[0].timestamp - 1;
                }
                
                remaining -= candles.length;
                
                console.log(`✅ Staženo ${candles.length} svíček, celkem: ${allCandles.length}/${limit}`);
                this.updateStatus(`📡 Staženo ${allCandles.length}/${limit} svíček z Binance...`, 'processing');
                
                // Rate limiting - wait between requests
                if (remaining > 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                // Safety break if we got less data than requested
                if (candles.length < currentLimit) {
                    console.log('Dosažen konec dostupných dat na Binance');
                    break;
                }
            }
            
            // Sort by timestamp to ensure proper order
            allCandles.sort((a, b) => a.timestamp - b.timestamp);
            
            console.log(`✅ Celkem staženo ${allCandles.length} skutečných svíček z Binance pro ${cryptoPair}`);
            this.updateStatus(`✅ Staženo ${allCandles.length} skutečných svíček z Binance`, 'success');
            
            return allCandles;
            
        } catch (error) {
            console.error('❌ Chyba při stahování z Binance:', error);
            this.updateStatus(`❌ CHYBA: ${error.message} - Žádná data nestažena!`, 'error');
            
            // NO FALLBACK - return empty array instead of fake data
            throw new Error(`Nepodařilo se stáhnout data z Binance: ${error.message}`);
        }
    }

    convertTimeframeForBinance(timeframe) {
        const mapping = {
            '1m': '1m',
            '5m': '5m',
            '30m': '30m',
            '1H': '1h',
            '4H': '4h',
            '12H': '12h',
            '24H': '1d',
            '1W': '1w'
        };
        return mapping[timeframe] || '1h';
    }



    getTimeframeInterval(timeframe) {
        const intervals = {
            '1m': 60 * 1000,
            '5m': 5 * 60 * 1000,
            '30m': 30 * 60 * 1000,
            '1H': 60 * 60 * 1000,
            '4H': 4 * 60 * 60 * 1000,
            '12H': 12 * 60 * 60 * 1000,
            '24H': 24 * 60 * 60 * 1000,
            '1W': 7 * 24 * 60 * 60 * 1000
        };
        return intervals[timeframe] || 60 * 1000;
    }

    getBasePrice(cryptoPair) {
        const basePrices = {
            'BTC/USDT': 45000,
            'ETH/USDT': 3000,
            'SOL/USDT': 100,
            'BNB/USDT': 300,
            'ADA/USDT': 0.5,
            'AVAX/USDT': 25,
            'MATIC/USDT': 0.8
        };
        return basePrices[cryptoPair] || 100;
    }

    downloadData(data) {
        const zip = new JSZip();
        const useCsv = this.useCsvExtensionSwitch.checked;
        let fileExtension = '.txt';
        if (useCsv) fileExtension = '.csv';
        const withoutZip = this.downloadWithoutZipSwitch.checked;
        
        // Aktualizace review panelu
        this.updateReviewPanel(data, fileExtension);
        
        if (withoutZip) {
            this.downloadWithoutZip(data, fileExtension);
        } else {
            data.forEach((timeframes, cryptoPair) => {
                // Oprava: Změna názvu složky z BTC/USDT na BTC_USDT
                const folderName = cryptoPair.replace('/', '_');
                const cryptoFolder = zip.folder(folderName);
                
                timeframes.forEach((candles, timeframe) => {
                    const content = this.formatCandleData(candles);
                    cryptoFolder.file(`${timeframe}${fileExtension}`, content);
                });
            });
            
            zip.generateAsync({type: 'blob'}).then(content => {
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'crypto_data.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }
    }

    updateReviewPanel(data, fileExtension) {
        let reviewHtml = '';
        let totalFiles = 0;
        let totalCandles = 0;
        
        data.forEach((timeframes, cryptoPair) => {
            const folderName = cryptoPair.replace('/', '_');
            
            timeframes.forEach((candles, timeframe) => {
                const fileName = `${folderName}_${timeframe}${fileExtension}`;
                const candleCount = candles.length;
                
                reviewHtml += `
                    <div class="review-item">
                        <span class="review-file">${fileName}</span>
                        <span class="review-candles">${candleCount} svíček</span>
                    </div>
                `;
                
                totalFiles++;
                totalCandles += candleCount;
            });
        });
        
        reviewHtml += `
            <div class="review-item" style="border-top: 2px solid #ffd700; margin-top: 10px; padding-top: 10px;">
                <span class="review-file" style="font-weight: bold;">CELKEM:</span>
                <span class="review-candles" style="font-weight: bold;">${totalFiles} souborů, ${totalCandles} svíček</span>
            </div>
        `;
        
        this.reviewContent.innerHTML = reviewHtml;
    }

    async downloadWithoutZip(data, fileExtension) {
        const totalFiles = this.countTotalFiles(data);
        let downloadedFiles = 0;
        const batchSize = 8; // Stahujeme po 8 souborech (jeden časový rámec)
        
        // Kontrola vybrané cílové složky
        this.updateStatus(`Začínám stahování ${totalFiles} souborů...`, 'processing');
        this.showProgress();
        

        
        for (const [cryptoPair, timeframes] of data) {
            this.updateStatus(`Stahuji data pro ${cryptoPair}...`, 'processing');
            
            let batchCount = 0;
            for (const [timeframe, candles] of timeframes) {
                const fileName = `${cryptoPair.replace('/', '_')}_${timeframe}${fileExtension}`;
                const content = this.formatCandleData(candles);
                
                // Vytvoření a stažení souboru
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                
                // Pokud je vybraná cílová složka, pokusíme se ji použít
                if (this.selectedTargetFolder) {
                    // Vytvoříme relativní cestu k souboru
                    const relativePath = `${this.selectedTargetFolder}/${fileName}`;
                    a.setAttribute('data-downloadurl', `text/plain:${fileName}:${url}`);
                }
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                downloadedFiles++;
                batchCount++;
                this.updateProgress(downloadedFiles, totalFiles, fileName);
                
                // Pokud jsme dosáhli velikosti batch, počkáme déle
                if (batchCount >= batchSize) {
                    this.updateStatus(`Staženo ${downloadedFiles}/${totalFiles} souborů. Čekám na dokončení stahování...`, 'processing');
                    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sekundy pauza
                    batchCount = 0;
                } else {
                    // Krátký delay mezi soubory v rámci batch
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
        
        this.hideProgress();
        this.updateStatus(`Úspěšně staženo ${downloadedFiles} souborů!`, 'success');
    }


    
    countTotalFiles(data) {
        let count = 0;
        data.forEach((timeframes) => {
            count += timeframes.size;
        });
        return count;
    }

    formatCandleData(candles) {
        return candles.map(candle => 
            `${candle.timestamp},${candle.open},${candle.high},${candle.low},${candle.close},${candle.volume}`
        ).join('\n');
    }

    loadCryptoStates() {
        const saved = localStorage.getItem('cryptoDataManager_states');
        if (saved) {
            const states = JSON.parse(saved);
            // Zajistíme, že všechny kryptoměny mají stav
            const completeStates = {};
            this.allCryptos.forEach(crypto => {
                completeStates[crypto] = states[crypto] !== undefined ? states[crypto] : true;
            });
            return completeStates;
        } else {
            // Výchozí stav - všechny zapnuté
            const defaultStates = {};
            this.allCryptos.forEach(crypto => {
                defaultStates[crypto] = true;
            });
            return defaultStates;
        }
    }

    saveCryptoStates() {
        localStorage.setItem('cryptoDataManager_states', JSON.stringify(this.cryptoStates));
    }

    getActiveCryptos() {
        return this.allCryptos.filter(crypto => this.cryptoStates[crypto]);
    }

    renderCryptoList() {
        const cryptoListElement = document.getElementById('cryptoList');
        if (!cryptoListElement) return;

        cryptoListElement.innerHTML = ''; // Vymaže předchozí seznam

        const activeCryptos = this.getActiveCryptos();
        const totalCryptos = this.allCryptos.length;
        const visibleCryptos = this.visibleCryptos;

        let shownCount = 0;
        for (let i = 0; i < totalCryptos; i++) {
            const crypto = this.allCryptos[i];
            const isActive = activeCryptos.includes(crypto);

            const cryptoItem = document.createElement('div');
            cryptoItem.className = 'crypto-item';
            cryptoItem.innerHTML = `
                <input type="checkbox" id="crypto-${i}" ${isActive ? 'checked' : ''}>
                <label for="crypto-${i}">${crypto}</label>
            `;
            cryptoListElement.appendChild(cryptoItem);

            cryptoItem.addEventListener('change', () => {
                this.cryptoStates[crypto] = cryptoItem.querySelector('input').checked;
                this.saveCryptoStates();
                this.updateCryptoSummary();
            });

            shownCount++;
            if (shownCount >= visibleCryptos) break;
        }

        // Přidáme tlačítko pro zobrazení/skrytí dalších kryptoměn
        if (totalCryptos > 5) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = this.visibleCryptos === totalCryptos ? 'show-less-btn' : 'show-more-btn';
            
            if (this.visibleCryptos === totalCryptos) {
                toggleBtn.textContent = `Schovat další (${totalCryptos - 5})`;
                toggleBtn.addEventListener('click', () => {
                    this.visibleCryptos = 5;
                    this.renderCryptoList();
                });
            } else {
                toggleBtn.textContent = `Zobrazit další (${totalCryptos - visibleCryptos})`;
                toggleBtn.addEventListener('click', () => {
                    this.visibleCryptos = totalCryptos;
                    this.renderCryptoList();
                });
            }
            cryptoListElement.appendChild(toggleBtn);
        }

        // Přidáme tlačítka pro ovládání všech
        const controlButtons = document.createElement('div');
        controlButtons.className = 'crypto-controls';
        controlButtons.innerHTML = `
            <button class="control-btn" id="selectAllBtn">Zapnout všechny</button>
            <button class="control-btn" id="deselectAllBtn">Vypnout všechny</button>
        `;
        cryptoListElement.appendChild(controlButtons);

        // Event listeners pro tlačítka
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.allCryptos.forEach(crypto => {
                this.cryptoStates[crypto] = true;
            });
            this.saveCryptoStates();
            this.renderCryptoList();
            this.updateCryptoSummary();
        });

        document.getElementById('deselectAllBtn').addEventListener('click', () => {
            this.allCryptos.forEach(crypto => {
                this.cryptoStates[crypto] = false;
            });
            this.saveCryptoStates();
            this.renderCryptoList();
            this.updateCryptoSummary();
        });

        this.updateCryptoSummary();
    }

    updateCryptoSummary() {
        const activeCount = this.getActiveCryptos().length;
        const totalCount = this.allCryptos.length;
        const summaryElement = document.getElementById('cryptoSummary');
        if (summaryElement) {
            summaryElement.textContent = `Aktivní: ${activeCount}/${totalCount} kryptoměn`;
        }
    }





    showProgress(activity = 'Zahajuji zpracování...') {
        if (this.progressContainer) {
            this.progressContainer.style.display = 'flex';
            this.showActivity(activity);
        }
    }

    hideProgress() {
        if (this.progressContainer) {
            this.progressContainer.style.display = 'none';
            this.hideActivity();
        }
    }

    showActivity(text) {
        if (this.progressActivity && this.activityText) {
            this.progressActivity.style.display = 'flex';
            this.activityText.textContent = text;
        }
    }

    hideActivity() {
        if (this.progressActivity) {
            this.progressActivity.style.display = 'none';
        }
    }

    updateActivity(text) {
        this.showActivity(text);
    }

    updateProgress(current, total, description = '', activity = '') {
        if (!this.progressFill || !this.progressText) return;
        
        // Pokud je current 0, zobraz indeterminate progress
        if (current === 0 && total > 0) {
            this.progressFill.classList.add('indeterminate');
            this.progressFill.style.width = '100%';
            this.progressText.textContent = 'Inicializace...';
        } else {
            this.progressFill.classList.remove('indeterminate');
            const percentage = Math.round((current / total) * 100);
            this.progressFill.style.width = `${percentage}%`;
            
            if (description) {
                this.progressText.textContent = `${percentage}% - ${description}`;
            } else {
                this.progressText.textContent = `${percentage}% (${current}/${total})`;
            }
        }
        
        if (activity) {
            this.updateActivity(activity);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CryptoDataManager();
});

// Přidání JSZip knihovny pro vytváření ZIP souborů
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
document.head.appendChild(script);
