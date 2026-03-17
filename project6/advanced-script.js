class AdvancedCryptoDataManager {
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
        this.historicalFillSwitch = document.getElementById('historicalFill');
        this.batchSizeInput = document.getElementById('batchSize');
        this.reviewContent = document.getElementById('reviewContent');
        this.reviewPanel = document.getElementById('reviewPanel');
        
        // Progress bar elements
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.progressActivity = document.getElementById('progressActivity');
        this.activityText = document.getElementById('activityText');
        this.progressStats = document.getElementById('progressStats');
        this.completedStat = document.getElementById('completedStat');
        this.totalStat = document.getElementById('totalStat');
        this.successStat = document.getElementById('successStat');
        this.errorStat = document.getElementById('errorStat');
        
        this.timeframes = ['1m', '5m', '30m', '1H', '4H', '12H', '24H', '1W'];
        
        // Rozšířený seznam kryptoměn pro pokročilé použití
        this.allCryptos = [
            'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT', 'XRP/USDT',
            'DOT/USDT', 'DOGE/USDT', 'AVAX/USDT', 'SHIB/USDT', 'MATIC/USDT', 'LTC/USDT',
            'TRX/USDT', 'UNI/USDT', 'ATOM/USDT', 'LINK/USDT', 'XLM/USDT', 'BCH/USDT',
            'ETC/USDT', 'MANA/USDT', 'SAND/USDT', 'AXS/USDT', 'ICP/USDT', 'FIL/USDT',
            'THETA/USDT', 'VET/USDT', 'FTT/USDT', 'HBAR/USDT', 'NEAR/USDT', 'ENJ/USDT',
            'FLOW/USDT', 'CHZ/USDT', 'BAT/USDT', 'ZEC/USDT', 'DASH/USDT', 'XMR/USDT'
        ];
        
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
        this.historicalFillSwitch.addEventListener('change', () => this.updateStatusBasedOnSettings());
        this.batchSizeInput.addEventListener('change', () => this.updateStatusBasedOnSettings());
    }

    updateStatusBasedOnSettings() {
        const createNew = this.createNewFilesSwitch.checked;
        const candleLimit = parseInt(this.candleLimitInput.value);
        const useCsv = this.useCsvExtensionSwitch.checked;
        const downloadWithoutZip = this.downloadWithoutZipSwitch.checked;
        const historicalFill = this.historicalFillSwitch.checked;
        const batchSize = parseInt(this.batchSizeInput.value);
        
        let statusText = `⚙️ Pokročilé nastavení: ${candleLimit.toLocaleString()} svíček, `;
        statusText += createNew ? 'vytváření nových souborů ✓, ' : 'pouze existující soubory, ';
        statusText += useCsv ? '.csv formát, ' : '.txt formát, ';
        statusText += downloadWithoutZip ? 'jednotlivé soubory, ' : 'ZIP archiv, ';
        statusText += historicalFill ? `historické doplnění ✓, ` : 'pouze nová data, ';
        statusText += `batch velikost: ${batchSize}`;
        
        this.updateStatus(statusText, 'info');
    }

    handleFolderUpload(event) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) {
            this.uploadedFiles.clear();
            this.selectedFilesElement.classList.remove('has-files');
            this.updateStatus('Žádné soubory nebyly vybrány', 'info');
            return;
        }

        this.selectedFilesElement.innerHTML = '';
        this.uploadedFiles.clear();

        files.forEach(file => {
            if (file.name.match(/\.(txt|csv|dat)$/)) {
                this.uploadedFiles.set(file.name, file);
                
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <i class="fas fa-file-alt"></i>
                    <span>${file.name}</span>
                    <small>(${(file.size / 1024).toFixed(1)} KB)</small>
                `;
                this.selectedFilesElement.appendChild(fileItem);
            }
        });

        if (this.uploadedFiles.size > 0) {
            this.selectedFilesElement.classList.add('has-files');
            const folderStructure = this.analyzeFolderStructure();
            this.displayFolderStructure(folderStructure);
        } else {
            this.updateStatus('Žádné platné soubory nebyly nalezeny (.txt, .csv, .dat)', 'error');
        }
    }

    analyzeFolderStructure() {
        const structure = new Map();
        
        for (const [fileName, file] of this.uploadedFiles) {
            let cryptoPair, timeframe;
            
            if (fileName.includes('/')) {
                // Složková struktura: BTC/USDT/1m.txt
                const parts = fileName.split('/');
                if (parts.length >= 3) {
                    cryptoPair = `${parts[0]}/${parts[1]}`;
                    timeframe = parts[2].replace(/\.(txt|csv|dat)$/, '');
                }
            } else {
                // Flat struktura: BTC_USDT_1m.txt
                const match = fileName.match(/^(.+)_(.+)_(.+)\.(txt|csv|dat)$/);
                if (match) {
                    cryptoPair = `${match[1]}/${match[2]}`;
                    timeframe = match[3];
                } else {
                    // Jednoduché jméno souboru
                    const baseName = fileName.replace(/\.(txt|csv|dat)$/, '');
                    if (this.timeframes.includes(baseName)) {
                        cryptoPair = 'UNKNOWN/USDT';
                        timeframe = baseName;
                    } else {
                        cryptoPair = 'UNKNOWN/USDT';
                        timeframe = '1m';
                    }
                }
            }
            
            if (!structure.has(cryptoPair)) {
                structure.set(cryptoPair, new Map());
            }
            
            structure.get(cryptoPair).set(timeframe, {
                file: file,
                fileName: fileName
            });
        }
        
        return structure;
    }

    async displayFolderStructure(structure) {
        let statusText = `📁 Nalezeno ${structure.size} krypto párů:\n`;
        
        for (const [cryptoPair, timeframes] of structure) {
            statusText += `  • ${cryptoPair}: ${timeframes.size} timeframů\n`;
            for (const [timeframe, info] of timeframes) {
                try {
                    const content = await this.readFileContent(info.file);
                    const candles = this.parseFileContent(content);
                    if (candles.length > 0) {
                        const stats = this.analyzeCandleContinuity(candles, timeframe);
                        const continuity = stats.hasGaps ? `⚠️ MEZERY (${stats.gapCount})` : '✅ Spojité';
                        statusText += `    - ${timeframe}: ${candles.length.toLocaleString()} svíček, ${continuity}\n`;
                    }
                } catch (e) {
                    statusText += `    - ${timeframe}: Chyba při čtení\n`;
                }
            }
        }
        
        this.updateStatus(statusText, 'success');
    }

    renderCryptoList() {
        const cryptoList = document.getElementById('cryptoList');
        const showMoreBtn = document.getElementById('showMoreBtn');
        
        cryptoList.innerHTML = '';
        
        this.allCryptos.forEach(crypto => {
            const cryptoItem = document.createElement('div');
            cryptoItem.className = 'crypto-item';
            
            const isActive = this.isCryptoActive(crypto);
            if (isActive) {
                cryptoItem.classList.add('active');
            }
            
            cryptoItem.innerHTML = `
                <input type="checkbox" class="crypto-checkbox" data-crypto="${crypto}" ${isActive ? 'checked' : ''}>
                <span>${crypto}</span>
            `;
            
            const checkbox = cryptoItem.querySelector('.crypto-checkbox');
            checkbox.addEventListener('change', (e) => {
                this.toggleCrypto(crypto, e.target.checked);
                cryptoItem.classList.toggle('active', e.target.checked);
            });
            
            cryptoItem.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
            
            cryptoList.appendChild(cryptoItem);
        });

        showMoreBtn.addEventListener('click', () => {
            cryptoList.classList.toggle('expanded');
            const isExpanded = cryptoList.classList.contains('expanded');
            showMoreBtn.innerHTML = `
                <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'}"></i>
                ${isExpanded ? 'Zobrazit méně' : 'Zobrazit více'}
            `;
        });

        this.updateCryptoSummary();
    }

    isCryptoActive(crypto) {
        const saved = localStorage.getItem('activeCryptos');
        if (!saved) {
            // Výchozí aktivní kryptoměny pro pokročilé použití
            const defaultActive = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT', 'XRP/USDT', 'DOT/USDT', 'DOGE/USDT'];
            return defaultActive.includes(crypto);
        }
        return JSON.parse(saved).includes(crypto);
    }

    toggleCrypto(crypto, active) {
        let activeCryptos = this.getActiveCryptos();
        
        if (active && !activeCryptos.includes(crypto)) {
            activeCryptos.push(crypto);
        } else if (!active) {
            activeCryptos = activeCryptos.filter(c => c !== crypto);
        }
        
        localStorage.setItem('activeCryptos', JSON.stringify(activeCryptos));
        this.updateCryptoSummary();
    }

    getActiveCryptos() {
        const saved = localStorage.getItem('activeCryptos');
        if (!saved) {
            return ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT', 'XRP/USDT', 'DOT/USDT', 'DOGE/USDT'];
        }
        return JSON.parse(saved);
    }

    updateCryptoSummary() {
        const activeCount = this.getActiveCryptos().length;
        const totalCount = this.allCryptos.length;
        
        const summaryElement = document.getElementById('cryptoSummary');
        if (summaryElement) {
            summaryElement.textContent = `Aktivní: ${activeCount}/${totalCount} kryptoměn (rozšířený seznam)`;
        }
    }

    async handleDownload() {
        try {
            this.updateStatus('🚀 Spouštím pokročilé generování dat...', 'processing');
            
            let processedData;
            
            if (this.uploadedFiles.size > 0) {
                processedData = await this.processUploadedFiles();
            } else {
                processedData = await this.generateAdvancedDefaultData();
            }
            
            this.displayReviewPanel(processedData);
            
            if (this.downloadWithoutZipSwitch.checked) {
                await this.downloadAdvancedWithoutZip(processedData);
            } else {
                await this.downloadAdvancedAsZip(processedData);
            }
            
        } catch (error) {
            console.error('Error during download:', error);
            this.updateStatus(`❌ Chyba při stahování: ${error.message}`, 'error');
        }
    }

    async processUploadedFiles() {
        const folderStructure = this.analyzeFolderStructure();
        const processedData = new Map();
        const candleLimit = parseInt(this.candleLimitInput.value);
        const createNewFiles = this.createNewFilesSwitch.checked;
        const historicalFill = this.historicalFillSwitch.checked;

        this.updateStatus('📂 Zpracovávám nahrané soubory...', 'processing');
        this.showProgress('Analyzuji nahrané soubory...');

        let totalOperations = 0;
        let completedOperations = 0;
        let successCount = 0;
        let errorCount = 0;

        // Počítání operací s okamžitou odezvou
        this.updateActivity('🔍 Počítám operace...');
        await new Promise(resolve => setTimeout(resolve, 100)); // Krátká pauza pro zobrazení
        
        for (const [cryptoPair, timeframes] of folderStructure) {
            totalOperations += timeframes.size;
            if (createNewFiles) {
                totalOperations += this.timeframes.length - timeframes.size;
            }
        }

        this.updateStats(0, totalOperations, 0, 0);
        this.updateActivity(`📊 Zpracovávám ${totalOperations} operací...`);

        for (const [cryptoPair, timeframes] of folderStructure) {
            processedData.set(cryptoPair, new Map());
            
            // Zpracuj existující soubory
            for (const [timeframe, fileData] of timeframes) {
                const currentActivity = `📂 Čtu ${cryptoPair} ${timeframe}`;
                this.updateProgress(completedOperations, totalOperations, `Zpracovávám ${cryptoPair} ${timeframe}`, currentActivity);
                
                try {
                    this.updateActivity(`📄 Načítám soubor ${fileData.fileName}...`);
                    const content = await this.readFileContent(fileData.file);
                    const existingCandles = this.parseFileContent(content);
                    
                    let enhancedCandles = existingCandles;
                    
                    if (existingCandles.length > 0) {
                        // Doplň nová data (od posledního záznamu do současnosti)
                        this.updateActivity(`📈 Stahování nových dat pro ${cryptoPair} ${timeframe}...`);
                        console.log(`📈 Doplňuji nová data pro ${cryptoPair} ${timeframe} (${existingCandles.length} existujících)`);
                        const newCandles = await this.fetchNewCandles(cryptoPair, timeframe, existingCandles, candleLimit);
                        console.log(`✅ Staženo ${newCandles.length} nových svíček`);
                        
                        enhancedCandles = [...existingCandles, ...newCandles];
                        
                        // Historické doplnění pokud je povoleno (do minulosti)
                        if (historicalFill) {
                            this.updateActivity(`📊 Historické doplnění ${cryptoPair} ${timeframe}...`);
                            console.log(`📊 Spouštím historické doplnění pro ${cryptoPair} ${timeframe}`);
                            const historicalCandles = await this.fetchHistoricalCandles(cryptoPair, timeframe, existingCandles, candleLimit);
                            console.log(`✅ Staženo ${historicalCandles.length} historických svíček`);
                            enhancedCandles = [...historicalCandles, ...enhancedCandles];
                        }
                        
                        console.log(`🎯 Celkem: ${enhancedCandles.length} svíček pro ${cryptoPair} ${timeframe}`);
                    } else {
                        this.updateActivity(`🆕 Generuji dataset pro ${cryptoPair} ${timeframe}...`);
                        console.log(`🆕 Generuji nový dataset pro ${cryptoPair} ${timeframe}`);
                        enhancedCandles = await this.fetchNewCandles(cryptoPair, timeframe, null, candleLimit);
                    }
                    
                    this.updateActivity(`🔧 Finalizuji ${cryptoPair} ${timeframe}...`);
                    
                    // Seřaď podle timestampu (BEZ ořezávání!)
                    enhancedCandles.sort((a, b) => a.timestamp - b.timestamp);
                    
                    // Odstraň duplikáty (pokud by nějaké byly)
                    const uniqueCandles = [];
                    const seenTimestamps = new Set();
                    
                    for (const candle of enhancedCandles) {
                        if (!seenTimestamps.has(candle.timestamp)) {
                            seenTimestamps.add(candle.timestamp);
                            uniqueCandles.push(candle);
                        }
                    }
                    
                    enhancedCandles = uniqueCandles;
                    processedData.get(cryptoPair).set(timeframe, enhancedCandles);
                    successCount++;
                    
                } catch (error) {
                    console.error(`Error processing ${cryptoPair} ${timeframe}:`, error);
                    errorCount++;
                }
                
                completedOperations++;
                this.updateProgress(completedOperations, totalOperations, `Dokončeno: ${cryptoPair} ${timeframe}`);
                this.updateStats(completedOperations, totalOperations, successCount, errorCount);
                await new Promise(resolve => setTimeout(resolve, 50)); // Kratší pauza
            }
            
            // Vytvoř nové soubory pokud je povoleno
            if (createNewFiles) {
                for (const timeframe of this.timeframes) {
                    if (!timeframes.has(timeframe)) {
                        this.updateProgress(completedOperations, totalOperations, `Vytvářím ${cryptoPair} ${timeframe}`);
                        
                        try {
                            const newCandles = await this.fetchNewCandles(cryptoPair, timeframe, null, candleLimit);
                            processedData.get(cryptoPair).set(timeframe, newCandles);
                        } catch (error) {
                            console.error(`Error creating ${cryptoPair} ${timeframe}:`, error);
                        }
                        
                        completedOperations++;
                        this.updateProgress(completedOperations, totalOperations, `Dokončeno: ${cryptoPair} ${timeframe}`);
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            }
        }
        
        this.hideProgress();
        return processedData;
    }

    async generateAdvancedDefaultData() {
        this.updateStatus('🌟 Generuji pokročilý dataset...', 'processing');
        this.showProgress();
        
        const defaultData = new Map();
        const candleLimit = parseInt(this.candleLimitInput.value);
        const activeCryptos = this.getActiveCryptos();
        const batchSize = parseInt(this.batchSizeInput.value);
        const historicalFill = this.historicalFillSwitch.checked;
        
        const totalOperations = activeCryptos.length * this.timeframes.length;
        let successCount = 0;
        let errorCount = 0;
        let completedOperations = 0;
        
        // Zpracování v batch dávkách
        for (let i = 0; i < activeCryptos.length; i += batchSize) {
            const batch = activeCryptos.slice(i, i + batchSize);
            
            await Promise.all(batch.map(async (cryptoPair, batchIndex) => {
                defaultData.set(cryptoPair, new Map());
                
                for (let j = 0; j < this.timeframes.length; j++) {
                    const timeframe = this.timeframes[j];
                    
                    const currentProgress = `${cryptoPair} ${timeframe} (${i + batchIndex + 1}/${activeCryptos.length})`;
                    this.updateProgress(completedOperations, totalOperations, currentProgress);
                    
                    try {
                        let candles = await this.fetchNewCandles(cryptoPair, timeframe, null, Math.min(1000, candleLimit));
                        
                        // Historické doplnění pro pokročilé použití
                        if (historicalFill && candles.length > 0 && candleLimit > 1000) {
                            const additionalCandles = await this.fetchHistoricalCandles(cryptoPair, timeframe, candles, candleLimit);
                            candles = [...additionalCandles, ...candles];
                            candles.sort((a, b) => a.timestamp - b.timestamp);
                            
                            // Odstraň duplikáty místo ořezávání
                            const uniqueCandles = [];
                            const seenTimestamps = new Set();
                            
                            for (const candle of candles) {
                                if (!seenTimestamps.has(candle.timestamp)) {
                                    seenTimestamps.add(candle.timestamp);
                                    uniqueCandles.push(candle);
                                }
                            }
                            
                            candles = uniqueCandles;
                        }
                        
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
                    }
                    
                    completedOperations++;
                    const finalProgress = `Dokončeno: ${cryptoPair} ${timeframe}`;
                    this.updateProgress(completedOperations, totalOperations, finalProgress);
                    
                    await new Promise(resolve => setTimeout(resolve, 120)); // Rate limiting
                }
                
                // Odstranění crypto pokud nejsou žádná data
                if (defaultData.get(cryptoPair).size === 0) {
                    defaultData.delete(cryptoPair);
                    console.warn(`🗑️ Odstraňuji ${cryptoPair} - žádná data se nepodařila stáhnout`);
                }
            }));
        }
        
        this.hideProgress();
        
        if (defaultData.size === 0) {
            throw new Error('Nepodařilo se stáhnout žádná data z Binance API. Zkontrolujte internetové připojení.');
        }
        
        this.updateStatus(`✅ Pokročilé generování dokončeno: ${successCount} souborů, ${errorCount} chyb`, 'success');
        return defaultData;
    }

    async fetchNewCandles(cryptoPair, timeframe, existingCandles = null, limit = 1000) {
        const symbol = cryptoPair.replace('/', '');
        const interval = this.convertTimeframeForBinance(timeframe);
        
        let startTime = null;
        if (existingCandles && existingCandles.length > 0) {
            const lastCandle = existingCandles[existingCandles.length - 1];
            startTime = lastCandle.timestamp + 1; // Start hned po poslední svíčce
        }
        
        const allCandles = [];
        const maxCandlesPerRequest = 1000;
        let remainingCandles = Math.min(limit, 10000000);
        
        // OPRAVA: Pokud nemáme startTime a chceme víc než 1000 svíček, 
        // musíme buď vypočítat start v minulosti, nebo použít historické stahování.
        // Nejjednodušší je nastavit startTime na (nyní - limit * interval).
        if (!startTime && remainingCandles > maxCandlesPerRequest) {
            const totalMs = remainingCandles * this.getTimeframeMilliseconds(timeframe);
            startTime = Date.now() - totalMs;
            console.log(`🆕 Výpočet počátečního času pro ${cryptoPair}: ${new Date(startTime).toISOString()}`);
        }
        
        while (remainingCandles > 0) {
            const requestLimit = Math.min(maxCandlesPerRequest, remainingCandles);
            
            let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${requestLimit}`;
            if (startTime) {
                url += `&startTime=${startTime}`;
            }
            
            try {
                const response = await fetch(url);
                if (response.status === 429) {
                    this.updateActivity('⚠️ Rate limit Hit! Čekám 60s...');
                    await new Promise(resolve => setTimeout(resolve, 60000));
                    continue;
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!data || data.length === 0) {
                    break;
                }
                
                const candles = data.map(kline => ({
                    timestamp: parseInt(kline[0]),
                    open: parseFloat(kline[1]),
                    high: parseFloat(kline[2]),
                    low: parseFloat(kline[3]),
                    close: parseFloat(kline[4]),
                    volume: parseFloat(kline[5])
                }));
                
                allCandles.push(...candles);
                remainingCandles -= candles.length;
                
                // Zobrazit informaci v UI
                const progressMsg = `📥 Staženo ${allCandles.length.toLocaleString()} / ${limit.toLocaleString()} svíček...`;
                this.updateActivity(progressMsg);
                
                if (candles.length < requestLimit) {
                    break;
                }
                
                startTime = candles[candles.length - 1].timestamp + this.getTimeframeMilliseconds(timeframe);
                
                await new Promise(resolve => setTimeout(resolve, 120));
                
            } catch (error) {
                console.error(`Error fetching ${cryptoPair} ${timeframe}:`, error);
                throw error;
            }
        }
        
        return allCandles;
    }

    async fetchHistoricalCandles(cryptoPair, timeframe, existingCandles, limit) {
        console.log(`🔄 Zahajuji historické doplnění pro ${cryptoPair} ${timeframe}, limit: ${limit}`);
        
        const symbol = cryptoPair.replace('/', '');
        const interval = this.convertTimeframeForBinance(timeframe);
        
        // Najdi nejstarší svíčku
        const oldestCandle = existingCandles[0];
        let endTime = oldestCandle.timestamp - this.getTimeframeMilliseconds(timeframe);
        
        console.log(`📅 Nejstarší svíčka: ${new Date(oldestCandle.timestamp).toISOString()}`);
        console.log(`📅 Stahování historických dat před: ${new Date(endTime).toISOString()}`);
        
        const allCandles = [];
        const maxCandlesPerRequest = 1000;
        let remainingCandles = Math.min(limit, 10000000); // Zvýšeno na 10M pro mega-testy
        let requestCount = 0;
        
        while (remainingCandles > 0 && endTime > 0 && requestCount < 10000) { // Zvýšeno na 10000 pro 10M svíček
            const requestLimit = Math.min(maxCandlesPerRequest, remainingCandles);
            
            let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${requestLimit}&endTime=${endTime}`;
            
            // Pro robustnost: nastavíme endTime pro další request na start nejstarší svíčky minus 1 milisekunda
            // Tím zajistíme, že Binance vrátí svíčku, která končí těsně před tou aktuální.

            
            try {
                const response = await fetch(url);
                if (response.status === 429) {
                    this.updateActivity('⚠️ Rate limit Hit! Čekám 60s...');
                    await new Promise(resolve => setTimeout(resolve, 60000));
                    continue;
                }
                if (!response.ok) {
                    console.error(`❌ HTTP Error: ${response.status}`);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!data || data.length === 0) {
                    console.log(`⚠️ Žádná další historická data pro ${cryptoPair} ${timeframe}`);
                    break;
                }
                
                const candles = data.map(kline => ({
                    timestamp: parseInt(kline[0]),
                    open: parseFloat(kline[1]),
                    high: parseFloat(kline[2]),
                    low: parseFloat(kline[3]),
                    close: parseFloat(kline[4]),
                    volume: parseFloat(kline[5])
                }));
                
                // Seřaď od nejstarší k nejnovější a přidej na začátek
                candles.sort((a, b) => a.timestamp - b.timestamp);
                allCandles.unshift(...candles);
                remainingCandles -= candles.length;
                requestCount++;
                
                // Zobrazit informaci v UI
                const progressMsg = `📥 Staženo ${allCandles.length.toLocaleString()} / ${limit.toLocaleString()} historických svíček...`;
                this.updateActivity(progressMsg);
                
                console.log(`✅ Request ${requestCount}: staženo ${candles.length} svíček, celkem: ${allCandles.length}, zbývá: ${remainingCandles}`);
                
                if (candles.length < requestLimit) {
                    console.log(`⚠️ Méně dat než očekáváno, končím historické doplnění`);
                    break;
                }
                
                // Posun endTime na jednu milisekundu před nejstarší svíčku z této dávky
                endTime = candles[0].timestamp - 1;
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.error(`❌ Error fetching historical ${cryptoPair} ${timeframe}:`, error);
                break;
            }
        }
        
        console.log(`🎯 Historické doplnění dokončeno: ${allCandles.length} svíček za ${requestCount} requestů`);
        return allCandles;
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
        return mapping[timeframe] || '1m';
    }

    getTimeframeMilliseconds(timeframe) {
        const mapping = {
            '1m': 60 * 1000,
            '5m': 5 * 60 * 1000,
            '30m': 30 * 60 * 1000,
            '1H': 60 * 60 * 1000,
            '4H': 4 * 60 * 60 * 1000,
            '12H': 12 * 60 * 60 * 1000,
            '24H': 24 * 60 * 60 * 1000,
            '1W': 7 * 24 * 60 * 60 * 1000
        };
        return mapping[timeframe] || 60 * 1000;
    }

    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    parseFileContent(content) {
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
        
        return candles.sort((a, b) => a.timestamp - b.timestamp);
    }

    formatCandleData(candle) {
        return `${candle.timestamp},${candle.open},${candle.high},${candle.low},${candle.close},${candle.volume}`;
    }

    analyzeCandleContinuity(candles, timeframe) {
        if (candles.length < 2) return { hasGaps: false, gapCount: 0 };
        
        const interval = this.getTimeframeMilliseconds(timeframe);
        let gapCount = 0;
        
        for (let i = 1; i < candles.length; i++) {
            const diff = candles[i].timestamp - candles[i-1].timestamp;
            if (diff > interval) {
                gapCount++;
            }
        }
        
        return {
            hasGaps: gapCount > 0,
            gapCount: gapCount
        };
    }

    displayReviewPanel(data) {
        const reviewContent = this.reviewContent;
        reviewContent.innerHTML = '';
        
        let totalFiles = 0;
        let totalCandles = 0;
        
        for (const [cryptoPair, timeframes] of data) {
            for (const [timeframe, candles] of timeframes) {
                totalFiles++;
                totalCandles += candles.length;
                
                const extension = this.useCsvExtensionSwitch.checked ? 'csv' : 'txt';
                const fileName = `${cryptoPair.replace('/', '_')}_${timeframe}.${extension}`;
                
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                
                const stats = this.analyzeCandleContinuity(candles, timeframe);
                const startDate = new Date(candles[0].timestamp).toLocaleDateString();
                const endDate = new Date(candles[candles.length - 1].timestamp).toLocaleDateString();
                
                reviewItem.innerHTML = `
                    <div class="review-item-main">
                        <span class="review-item-name">${fileName}</span>
                        <span class="review-item-count">${candles.length.toLocaleString()} svíček</span>
                    </div>
                    <div class="review-item-details">
                        <small>📅 ${startDate} - ${endDate}</small>
                        <small style="color: ${stats.hasGaps ? '#ff4d4d' : '#4CAF50'}">
                            ${stats.hasGaps ? `⚠️ Mezery: ${stats.gapCount}` : '✅ Spojité'}
                        </small>
                    </div>
                `;
                reviewContent.appendChild(reviewItem);
            }
        }
        
        this.reviewPanel.style.display = 'block';
        this.updateStatus(`📊 Přehled: ${totalFiles} souborů s celkem ${totalCandles.toLocaleString()} svíčkami`, 'success');
    }

    async downloadAdvancedWithoutZip(data) {
        const batchSize = parseInt(this.batchSizeInput.value);
        let downloadedFiles = 0;
        let totalFiles = 0;
        
        for (const timeframes of data.values()) {
            totalFiles += timeframes.size;
        }
        
        this.updateStatus(`🚀 Začínám pokročilé stahování ${totalFiles} souborů...`, 'processing');
        this.showProgress();
        
        let batchCount = 0;
        
        for (const [cryptoPair, timeframes] of data) {
            for (const [timeframe, candles] of timeframes) {
                const extension = this.useCsvExtensionSwitch.checked ? 'csv' : 'txt';
                const fileName = `${cryptoPair.replace('/', '_')}_${timeframe}.${extension}`;
                const content = candles.map(candle => this.formatCandleData(candle)).join('\n');
                
                this.downloadFile(fileName, content);
                downloadedFiles++;
                batchCount++;
                
                this.updateProgress(downloadedFiles, totalFiles, fileName);
                
                if (batchCount >= batchSize) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    batchCount = 0;
                    this.updateStatus(`📥 Staženo ${downloadedFiles}/${totalFiles} souborů (batch pauza)`, 'processing');
                } else {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
        }
        
        this.hideProgress();
        this.updateStatus(`✅ Pokročilé stahování dokončeno: ${downloadedFiles} souborů!`, 'success');
    }

    async downloadAdvancedAsZip(data) {
        this.updateStatus('📦 Vytvářím pokročilý ZIP archiv...', 'processing');
        
        const zip = new JSZip();
        
        for (const [cryptoPair, timeframes] of data) {
            const cryptoFolder = zip.folder(cryptoPair.replace('/', '_'));
            
            for (const [timeframe, candles] of timeframes) {
                const extension = this.useCsvExtensionSwitch.checked ? 'csv' : 'txt';
                const fileName = `${timeframe}.${extension}`;
                const content = candles.map(candle => this.formatCandleData(candle)).join('\n');
                
                cryptoFolder.file(fileName, content);
            }
        }
        
        const blob = await zip.generateAsync({type: 'blob'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'advanced_crypto_data.zip';
        a.click();
        URL.revokeObjectURL(url);
        
        this.updateStatus('✅ Pokročilý ZIP archiv byl stažen!', 'success');
    }

    downloadFile(fileName, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    updateStatus(message, type = 'info') {
        this.statusElement.textContent = message;
        this.statusElement.className = `status-content ${type}`;
    }

    showProgress(activity = 'Zahajuji zpracování...') {
        if (this.progressContainer) {
            this.progressContainer.style.display = 'flex';
            this.showActivity(activity);
            this.showStats();
        }
    }

    hideProgress() {
        if (this.progressContainer) {
            this.progressContainer.style.display = 'none';
            this.hideActivity();
            this.hideStats();
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

    showStats() {
        if (this.progressStats) {
            this.progressStats.style.display = 'grid';
        }
    }

    hideStats() {
        if (this.progressStats) {
            this.progressStats.style.display = 'none';
        }
    }

    updateActivity(text) {
        this.showActivity(text);
    }

    updateStats(completed, total, success = 0, errors = 0) {
        if (this.completedStat) this.completedStat.textContent = completed.toLocaleString();
        if (this.totalStat) this.totalStat.textContent = total.toLocaleString();
        if (this.successStat) this.successStat.textContent = success.toLocaleString();
        if (this.errorStat) this.errorStat.textContent = errors.toLocaleString();
    }

    updateProgress(current, total, description = '', activity = '') {
        if (!this.progressFill || !this.progressText) return;
        
        // Pokud je current 0, zobraz indeterminate progress nebo popis
        if (current === 0 && total > 0) {
            this.progressFill.classList.add('indeterminate');
            this.progressFill.style.width = '100%';
            this.progressText.textContent = description || 'Inicializace...';
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

// Initialize the Advanced Data Manager
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedCryptoDataManager();
});
