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
        
        this.timeframes = ['1m', '5m', '30m', '1H', '4H', '12H', '24H', '1W'];
        this.defaultCryptos = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'ADA/USDT', 'AVAX/USDT', 'MATIC/USDT'];
        
        this.initializeEventListeners();
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
                const newCandles = await this.fetchNewCandles(cryptoPair, timeframe, lastCandle, candleLimit);
                const updatedCandles = [...candles, ...newCandles];
                
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
        this.updateStatus('Generuji výchozí data pro všechny kryptoměny...', 'processing');
        
        const defaultData = new Map();
        const candleLimit = parseInt(this.candleLimitInput.value);
        const totalCryptos = this.defaultCryptos.length;
        
        for (let i = 0; i < this.defaultCryptos.length; i++) {
            const cryptoPair = this.defaultCryptos[i];
            defaultData.set(cryptoPair, new Map());
            
            this.updateStatus(`Generuji data pro ${cryptoPair}... (${i + 1}/${totalCryptos})`, 'processing');
            
            for (const timeframe of this.timeframes) {
                const candles = await this.fetchNewCandles(cryptoPair, timeframe, null, candleLimit);
                defaultData.get(cryptoPair).set(timeframe, candles);
            }
        }
        
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
        // Simulace získání dat z Binance API
        // V reálné implementaci by zde byl skutečný API call
        
        const candles = [];
        const now = Date.now();
        const intervalMs = this.getTimeframeInterval(timeframe);
        
        let startTime = lastCandle ? lastCandle.timestamp + intervalMs : now - (limit * intervalMs);
        
        // Optimalizace pro větší množství dat - zpracování v dávkách
        const batchSize = 1000;
        const totalBatches = Math.ceil(limit / batchSize);
        
        for (let batch = 0; batch < totalBatches; batch++) {
            const batchStart = batch * batchSize;
            const batchEnd = Math.min((batch + 1) * batchSize, limit);
            
            for (let i = batchStart; i < batchEnd; i++) {
                const timestamp = startTime + (i * intervalMs);
                if (timestamp > now) break;
                
                // Simulace cenových dat s lepší volatilitou pro delší časové období
                const basePrice = this.getBasePrice(cryptoPair);
                const timeProgress = i / limit; // Progres v čase pro realističtější data
                const volatility = 0.02 + (timeProgress * 0.01); // Zvýšení volatility v čase
                
                // Realističtější cenový pohyb
                const trend = Math.sin(timeProgress * Math.PI * 2) * 0.01; // Cyklický trend
                const open = basePrice * (1 + trend + (Math.random() - 0.5) * volatility);
                const high = open * (1 + Math.random() * volatility * 0.5);
                const low = open * (1 - Math.random() * volatility * 0.5);
                const close = open * (1 + (Math.random() - 0.5) * volatility * 0.3);
                const volume = Math.random() * 1000000 * (1 + Math.random() * 2);
                
                candles.push({
                    timestamp: timestamp,
                    open: parseFloat(open.toFixed(8)),
                    high: parseFloat(high.toFixed(8)),
                    low: parseFloat(low.toFixed(8)),
                    close: parseFloat(close.toFixed(8)),
                    volume: parseFloat(volume.toFixed(2))
                });
            }
            
            // Uvolnění UI thread pro plynulé renderování
            if (batch < totalBatches - 1) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        
        return candles;
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

    downloadWithoutZip(data, fileExtension) {
        // Stahování jednotlivých souborů místo ZIP
        let downloadCount = 0;
        const totalFiles = this.countTotalFiles(data);
        
        data.forEach((timeframes, cryptoPair) => {
            const folderName = cryptoPair.replace('/', '_');
            
            timeframes.forEach((candles, timeframe) => {
                const content = this.formatCandleData(candles);
                const fileName = `${folderName}_${timeframe}${fileExtension}`;
                
                // Vytvoření blob a stažení souboru
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                downloadCount++;
                this.updateStatus(`Stahuji soubory... (${downloadCount}/${totalFiles})`, 'processing');
            });
        });
        
        setTimeout(() => {
            this.updateStatus(`Úspěšně staženo ${downloadCount} souborů!`, 'success');
        }, 1000);
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
}

// Inicializace aplikace
document.addEventListener('DOMContentLoaded', () => {
    new CryptoDataManager();
});

// Přidání JSZip knihovny pro vytváření ZIP souborů
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
document.head.appendChild(script);
