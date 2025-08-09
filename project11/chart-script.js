class CryptoChartViewer {
    constructor() {
        this.chart = null;
        this.candleData = [];
        this.currentTool = 'cursor';
        this.isDrawing = false;
        this.drawings = [];
        this.startPoint = null;
        
        // Chart viewport settings
        this.viewport = {
            startIndex: 0,
            endIndex: 100,
            candleWidth: 8,
            minCandleWidth: 2,
            maxCandleWidth: 50,
            priceMin: 0,
            priceMax: 100,
            padding: { top: 20, right: 80, bottom: 40, left: 60 }
        };
        
        // Interaction state
        this.isPanning = false;
        this.lastMousePos = null;
        this.isVerticalZooming = false;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeCanvas();
        
        console.log('CryptoChartViewer initialized with currentTool:', this.currentTool);
        
        // Test mouse events on container
        const container = this.chartCanvas.parentElement;
        container.addEventListener('click', () => {
            console.log('🎯 CONTAINER CLICK - Events are working!');
        });
    }

    initializeElements() {
        this.fileInput = document.getElementById('dataFileInput');
        this.fileInfo = document.getElementById('fileInfo');
        this.chartPlaceholder = document.getElementById('chartPlaceholder');
        this.chartCanvas = document.getElementById('cryptoChart');
        this.drawingCanvas = document.getElementById('drawingCanvas');
        this.chartType = document.getElementById('chartType');
        this.timeRange = document.getElementById('timeRange');
        this.statusMessage = document.getElementById('statusMessage');
        this.mouseCoords = document.getElementById('mouseCoords');
        
        // Info elements
        this.cryptoName = document.getElementById('cryptoName');
        this.candleCount = document.getElementById('candleCount');
        this.timeSpan = document.getElementById('timeSpan');
        this.lastPrice = document.getElementById('lastPrice');
        
        // Tool buttons
        this.toolButtons = document.querySelectorAll('.tool-btn');
    }

    initializeEventListeners() {
        // File upload
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Chart controls
        this.chartType.addEventListener('change', () => this.updateChart());
        this.timeRange.addEventListener('change', () => this.updateChart());
        
        // Tool buttons
        this.toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTool(e.target.dataset.tool));
        });
        
        // Mouse tracking
        document.addEventListener('mousemove', (e) => this.updateMouseCoordinates(e));
    }

    initializeCanvas() {
        try {
            // Main chart canvas
            this.chartCtx = this.chartCanvas.getContext('2d');
            if (!this.chartCtx) {
                throw new Error('Failed to get 2D context for chart canvas');
            }
            
            // Drawing overlay canvas  
            this.drawingCtx = this.drawingCanvas.getContext('2d');
            if (!this.drawingCtx) {
                throw new Error('Failed to get 2D context for drawing canvas');
            }
            
            console.log('Canvas contexts initialized successfully');
            
            // Chart interaction events
            this.chartCanvas.addEventListener('mousedown', (e) => this.onMouseDown(e), { passive: false });
            this.chartCanvas.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: false });
            this.chartCanvas.addEventListener('mouseup', (e) => this.onMouseUp(e), { passive: false });
            this.chartCanvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
            this.chartCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
            
            // Drawing events on overlay
            this.drawingCanvas.addEventListener('mousedown', (e) => {
                if (this.currentTool === 'cursor') {
                    this.onMouseDown(e);
                } else {
                    this.startDrawing(e);
                }
            }, { passive: false });
            
            this.drawingCanvas.addEventListener('mousemove', (e) => {
                if (this.currentTool === 'cursor') {
                    this.onMouseMove(e);
                } else {
                    this.onDrawing(e);
                }
            }, { passive: false });
            
            this.drawingCanvas.addEventListener('mouseup', (e) => {
                if (this.currentTool === 'cursor') {
                    this.onMouseUp(e);
                } else {
                    this.stopDrawing();
                }
            }, { passive: false });
            
            this.drawingCanvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
            
            window.addEventListener('resize', () => this.resizeCanvas());
            
            // Initial resize
            this.resizeCanvas();
            
        } catch (error) {
            console.error('Canvas initialization failed:', error);
            this.updateStatus('Chyba inicializace canvasu', 'error');
        }
    }

    resizeCanvas() {
        const container = this.chartCanvas.parentElement;
        const width = container.clientWidth - 40;
        const height = container.clientHeight - 40;
        
        // Resize main chart canvas
        this.chartCanvas.width = width;
        this.chartCanvas.height = height;
        
        // Resize drawing overlay canvas
        this.drawingCanvas.width = width;
        this.drawingCanvas.height = height;
        
        // Redraw everything
        this.drawChart();
        this.redrawAll();
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.updateStatus('Načítám soubor...', 'processing');

        try {
            const content = await this.readFileContent(file);
            const data = this.parseFileContent(content, file.name);
            
            if (data.length === 0) {
                throw new Error('Soubor neobsahuje validní data');
            }

            this.candleData = data;
            console.log('Loaded candles:', data.length, 'First candle:', data[0]);
            
            this.updateFileInfo(file, data.length);
            this.createChart();
            this.updateChartInfo();
            this.updateStatus(`Úspěšně načteno ${data.length} svíček`, 'success');

        } catch (error) {
            this.updateStatus(`Chyba: ${error.message}`, 'error');
            console.error('Error loading file:', error);
        }
    }

    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    parseFileContent(content, fileName) {
        const lines = content.trim().split('\n');
        const data = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split(',');
            if (parts.length >= 6) {
                try {
                    const timestamp = parseInt(parts[0]);
                    const open = parseFloat(parts[1]);
                    const high = parseFloat(parts[2]);
                    const low = parseFloat(parts[3]);
                    const close = parseFloat(parts[4]);
                    const volume = parseFloat(parts[5]);
                    
                    // Validace dat
                    if (isNaN(timestamp) || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
                        continue;
                    }
                    
                    data.push({
                        timestamp: timestamp,
                        date: new Date(timestamp),
                        open: open,
                        high: high,
                        low: low,
                        close: close,
                        volume: volume
                    });
                } catch (error) {
                    console.warn(`Skipping invalid line ${i + 1}:`, line);
                }
            }
        }
        
        // Seřadíme data podle času
        data.sort((a, b) => a.timestamp - b.timestamp);
        
        return data;
    }

    updateFileInfo(file, dataLength) {
        this.fileInfo.innerHTML = `
            <div><strong>Soubor:</strong> ${file.name}</div>
            <div><strong>Velikost:</strong> ${(file.size / 1024).toFixed(2)} KB</div>
            <div><strong>Počet záznamů:</strong> ${dataLength}</div>
        `;
    }

    createChart() {
        this.chartPlaceholder.style.display = 'none';
        this.chartCanvas.style.display = 'block';
        this.drawingCanvas.style.pointerEvents = 'auto';

        // Initialize viewport - show last 100 candles
        const maxCandles = Math.min(this.candleData.length, 100);
        this.viewport.startIndex = Math.max(0, this.candleData.length - maxCandles);
        this.viewport.endIndex = this.candleData.length;
        
        console.log('Creating chart with viewport:', this.viewport.startIndex, 'to', this.viewport.endIndex);
        console.log('Canvas element:', this.chartCanvas);
        console.log('Canvas context:', this.chartCtx);
        
        // Ensure canvas is properly sized
        this.resizeCanvas();
        
        this.calculatePriceRange();
        this.drawChart();
    }

    testDraw() {
        if (!this.chartCtx) return;
        
        const ctx = this.chartCtx;
        const canvas = this.chartCanvas;
        
        // Clear and draw test
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(10, 10, 100, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText('TEST CANVAS', 20, 35);
        
        console.log('Test draw completed on canvas', canvas.width, 'x', canvas.height);
    }

    prepareChartData(data) {
        const chartType = this.chartType.value;
        
        if (chartType === 'candlestick' || chartType === 'ohlc') {
            // Pro svíčkový graf používáme close ceny pro základní čáru
            return {
                labels: data.map(item => item.date),
                datasets: [{
                    label: 'Close Price',
                    data: data.map(item => ({
                        x: item.date,
                        y: item.close,
                        open: item.open,
                        high: item.high,
                        low: item.low,
                        close: item.close
                    })),
                    borderColor: '#f0b90b',
                    backgroundColor: 'rgba(240, 185, 11, 0.1)',
                    borderWidth: 1,
                    fill: false
                }]
            };
        } else {
            // Čárový graf
            return {
                labels: data.map(item => item.date),
                datasets: [{
                    label: 'Close Price',
                    data: data.map(item => ({
                        x: item.date,
                        y: item.close
                    })),
                    borderColor: '#f0b90b',
                    backgroundColor: 'rgba(240, 185, 11, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            };
        }
    }

    getFilteredData() {
        const range = this.timeRange.value;
        if (range === 'all') {
            return this.candleData;
        } else {
            const count = parseInt(range.replace('last', ''));
            return this.candleData.slice(-count);
        }
    }

    calculatePriceRange() {
        if (this.candleData.length === 0) return;
        
        const visibleData = this.candleData.slice(this.viewport.startIndex, this.viewport.endIndex);
        
        if (visibleData.length === 0) return;
        
        let min = Infinity;
        let max = -Infinity;
        
        visibleData.forEach(candle => {
            min = Math.min(min, candle.low);
            max = Math.max(max, candle.high);
        });
        
        // Add 5% padding
        const padding = (max - min) * 0.05;
        this.viewport.priceMin = min - padding;
        this.viewport.priceMax = max + padding;
        
        console.log('Price range calculated:', this.viewport.priceMin, 'to', this.viewport.priceMax, 'from', visibleData.length, 'candles');
    }

    drawChart() {
        if (!this.chartCtx || this.candleData.length === 0) {
            console.log('Cannot draw chart:', !this.chartCtx ? 'No context' : 'No data');
            return;
        }
        
        const canvas = this.chartCanvas;
        const ctx = this.chartCtx;
        
        console.log('Drawing chart, canvas size:', canvas.width, 'x', canvas.height);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#2b3139';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        this.drawGrid(ctx);
        
        // Draw candles
        this.drawCandles(ctx);
        
        // Draw price axis
        this.drawPriceAxis(ctx);
        
        // Draw time axis
        this.drawTimeAxis(ctx);
        
        // Draw crosshair if hovering
        if (this.lastMousePos) {
            this.drawCrosshair(ctx, this.lastMousePos);
        }
        
        console.log('Chart drawn successfully');
    }

    drawGrid(ctx) {
        const canvas = this.chartCanvas;
        const padding = this.viewport.padding;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        const visibleCandles = this.viewport.endIndex - this.viewport.startIndex;
        const stepX = (canvas.width - padding.left - padding.right) / visibleCandles;
        
        for (let i = 0; i <= visibleCandles; i += 10) {
            const x = padding.left + i * stepX;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, canvas.height - padding.bottom);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        const priceRange = this.viewport.priceMax - this.viewport.priceMin;
        const stepY = (canvas.height - padding.top - padding.bottom) / 10;
        
        for (let i = 0; i <= 10; i++) {
            const y = padding.top + i * stepY;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(canvas.width - padding.right, y);
            ctx.stroke();
        }
    }

    drawPriceAxis(ctx) {
        const canvas = this.chartCanvas;
        const padding = this.viewport.padding;
        
        ctx.fillStyle = '#b7bdc6';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const priceRange = this.viewport.priceMax - this.viewport.priceMin;
        const stepY = (canvas.height - padding.top - padding.bottom) / 10;
        
        for (let i = 0; i <= 10; i++) {
            const y = padding.top + i * stepY;
            const price = this.viewport.priceMax - (priceRange * i / 10);
            
            ctx.fillText(price.toFixed(8), canvas.width - padding.right + 5, y);
        }
    }

    drawTimeAxis(ctx) {
        const canvas = this.chartCanvas;
        const padding = this.viewport.padding;
        
        ctx.fillStyle = '#b7bdc6';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const visibleCandles = this.viewport.endIndex - this.viewport.startIndex;
        const stepX = (canvas.width - padding.left - padding.right) / visibleCandles;
        
        for (let i = 0; i < visibleCandles; i += 20) {
            const dataIndex = this.viewport.startIndex + i;
            if (dataIndex < this.candleData.length) {
                const x = padding.left + i * stepX;
                const date = new Date(this.candleData[dataIndex].timestamp);
                const dateStr = date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' });
                
                ctx.fillText(dateStr, x, canvas.height - padding.bottom + 5);
            }
        }
    }

    drawCandles(ctx) {
        const canvas = this.chartCanvas;
        const padding = this.viewport.padding;
        
        const visibleCandles = this.viewport.endIndex - this.viewport.startIndex;
        const chartWidth = canvas.width - padding.left - padding.right;
        const stepX = chartWidth / visibleCandles;
        const candleWidth = Math.min(this.viewport.candleWidth, stepX * 0.8);
        
        console.log('Drawing candles:', visibleCandles, 'stepX:', stepX, 'candleWidth:', candleWidth);
        console.log('Price range:', this.viewport.priceMin, 'to', this.viewport.priceMax);
        
        for (let i = 0; i < visibleCandles; i++) {
            const dataIndex = this.viewport.startIndex + i;
            if (dataIndex >= this.candleData.length) break;
            
            const candle = this.candleData[dataIndex];
            const x = padding.left + i * stepX + stepX / 2;
            
            // Calculate Y positions
            const openY = this.priceToY(candle.open);
            const closeY = this.priceToY(candle.close);
            const highY = this.priceToY(candle.high);
            const lowY = this.priceToY(candle.low);
            
            // Determine colors (TradingView style)
            const isUp = candle.close > candle.open;
            const wickColor = isUp ? '#089981' : '#f23645';
            const bodyColor = isUp ? '#089981' : '#f23645';
            const fillColor = isUp ? '#0b1426' : '#f23645';
            
            // Draw wick (high-low line)
            ctx.strokeStyle = wickColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, highY);
            ctx.lineTo(x, lowY);
            ctx.stroke();
            
            // Draw body (open-close rectangle)
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.abs(closeY - openY);
            const rectX = x - candleWidth / 2;
            
            if (bodyHeight < 2) {
                // Doji - draw thin line
                ctx.strokeStyle = bodyColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(rectX, openY);
                ctx.lineTo(rectX + candleWidth, openY);
                ctx.stroke();
            } else {
                // Normal candle body (TradingView style)
                if (isUp) {
                    // Hollow green candle with dark fill
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(rectX, bodyTop, candleWidth, bodyHeight);
                    ctx.strokeStyle = bodyColor;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(rectX, bodyTop, candleWidth, bodyHeight);
                } else {
                    // Filled red candle
                    ctx.fillStyle = bodyColor;
                    ctx.fillRect(rectX, bodyTop, candleWidth, bodyHeight);
                }
            }
            
            // Debug: draw a small circle at x position (first 3 candles only)
            if (i < 3) {
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(x, highY - 5, 2, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    priceToY(price) {
        const canvas = this.chartCanvas;
        const padding = this.viewport.padding;
        const priceRange = this.viewport.priceMax - this.viewport.priceMin;
        const chartHeight = canvas.height - padding.top - padding.bottom;
        
        return padding.top + (this.viewport.priceMax - price) / priceRange * chartHeight;
    }

    yToPrice(y) {
        const canvas = this.chartCanvas;
        const padding = this.viewport.padding;
        const priceRange = this.viewport.priceMax - this.viewport.priceMin;
        const chartHeight = canvas.height - padding.top - padding.bottom;
        
        return this.viewport.priceMax - ((y - padding.top) / chartHeight) * priceRange;
    }

    drawCrosshair(ctx, mousePos) {
        const canvas = this.chartCanvas;
        const padding = this.viewport.padding;
        
        if (mousePos.x < padding.left || mousePos.x > canvas.width - padding.right ||
            mousePos.y < padding.top || mousePos.y > canvas.height - padding.bottom) {
            return;
        }
        
        ctx.strokeStyle = 'rgba(240, 185, 11, 0.8)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(mousePos.x, padding.top);
        ctx.lineTo(mousePos.x, canvas.height - padding.bottom);
        ctx.stroke();
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(padding.left, mousePos.y);
        ctx.lineTo(canvas.width - padding.right, mousePos.y);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Price label
        const price = this.yToPrice(mousePos.y);
        ctx.fillStyle = '#f0b90b';
        ctx.fillRect(canvas.width - padding.right, mousePos.y - 10, padding.right, 20);
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(price.toFixed(8), canvas.width - padding.right / 2, mousePos.y);
    }

    updateChart() {
        this.calculatePriceRange();
        this.drawChart();
    }

    updateChartInfo() {
        if (this.candleData.length === 0) return;

        const firstCandle = this.candleData[0];
        const lastCandle = this.candleData[this.candleData.length - 1];
        
        // Extrakce názvu kryptoměny ze souboru
        const fileName = this.fileInput.files[0]?.name || '';
        const cryptoMatch = fileName.match(/([A-Z]+)_([A-Z]+)/);
        const cryptoName = cryptoMatch ? `${cryptoMatch[1]}/${cryptoMatch[2]}` : 'Neznámá kryptoměna';
        
        this.cryptoName.textContent = cryptoName;
        this.candleCount.textContent = this.candleData.length.toLocaleString();
        this.timeSpan.textContent = `${firstCandle.date.toLocaleDateString()} - ${lastCandle.date.toLocaleDateString()}`;
        this.lastPrice.textContent = lastCandle.close.toFixed(8);
    }

    // Chart Interaction Methods
    onMouseDown(event) {
        console.log('🖱️ Mouse down event:', event.button, 'Current tool:', this.currentTool);
        
        const rect = event.target.getBoundingClientRect();
        const mousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        if (event.button === 0) { // Left click
            this.isPanning = true;
            this.lastMousePos = mousePos;
            this.chartCanvas.style.cursor = 'grabbing';
            this.drawingCanvas.style.pointerEvents = 'none'; // Disable overlay during pan
            console.log('🎯 Started panning at:', mousePos);
        }
        
        event.preventDefault();
        event.stopPropagation();
    }

    onMouseMove(event) {
        const rect = this.chartCanvas.getBoundingClientRect();
        const mousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        if (this.isPanning && this.lastMousePos) {
            // Pan functionality
            const deltaX = mousePos.x - this.lastMousePos.x;
            const candleCount = this.viewport.endIndex - this.viewport.startIndex;
            const chartWidth = this.chartCanvas.width - this.viewport.padding.left - this.viewport.padding.right;
            const pixelsPerCandle = chartWidth / candleCount;
            const candleDelta = Math.round(deltaX / pixelsPerCandle);
            
            console.log('Panning delta:', deltaX, 'candleDelta:', candleDelta);
            
            if (Math.abs(candleDelta) >= 1) {
                const newStartIndex = Math.max(0, this.viewport.startIndex - candleDelta);
                const newEndIndex = Math.min(this.candleData.length, newStartIndex + candleCount);
                
                // Ensure we don't go beyond data bounds
                if (newEndIndex <= this.candleData.length && newStartIndex >= 0) {
                    this.viewport.startIndex = newStartIndex;
                    this.viewport.endIndex = newEndIndex;
                    console.log('New viewport:', this.viewport.startIndex, 'to', this.viewport.endIndex);
                    this.updateChart();
                }
            }
            
            this.lastMousePos = mousePos;
        } else {
            // Just redraw crosshair
            this.drawChart();
            this.lastMousePos = mousePos;
        }
        
        event.preventDefault();
        event.stopPropagation();
    }

    onMouseUp(event) {
        console.log('🖱️ Mouse up event:', event.button);
        
        if (event.button === 0) { // Left click release
            this.isPanning = false;
            this.chartCanvas.style.cursor = 'crosshair';
            this.drawingCanvas.style.pointerEvents = 'auto'; // Re-enable overlay
            console.log('🛑 Stopped panning');
        }
        
        event.preventDefault();
        event.stopPropagation();
    }

    onWheel(event) {
        console.log('Wheel event:', event.deltaY, event.deltaX);
        
        // PREVENT default scrolling behavior
        event.preventDefault();
        event.stopPropagation();
        
        const rect = this.chartCanvas.getBoundingClientRect();
        const mousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        console.log('Wheel at position:', mousePos, 'Canvas size:', this.chartCanvas.width, 'x', this.chartCanvas.height);
        
        // Check if we're in the right sidebar area for vertical zoom
        if (mousePos.x > this.chartCanvas.width - this.viewport.padding.right) {
            // Vertical zoom (price scale)
            const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
            const priceRange = this.viewport.priceMax - this.viewport.priceMin;
            const center = (this.viewport.priceMax + this.viewport.priceMin) / 2;
            const newRange = priceRange * zoomFactor;
            
            this.viewport.priceMin = center - newRange / 2;
            this.viewport.priceMax = center + newRange / 2;
            
            console.log('Vertical zoom:', this.viewport.priceMin, 'to', this.viewport.priceMax);
            this.drawChart();
            this.updateStatus('Vertikální zoom', 'info');
            return;
        }
        
        // Horizontal zoom (candle width and count)
        const zoomIn = event.deltaY < 0;
        console.log('Horizontal zoom:', zoomIn ? 'in' : 'out');
        
        if (zoomIn) {
            // Zoom in - increase candle width, show fewer candles
            this.viewport.candleWidth = Math.min(this.viewport.maxCandleWidth, this.viewport.candleWidth * 1.1);
            
            const candleCount = this.viewport.endIndex - this.viewport.startIndex;
            const newCandleCount = Math.max(20, Math.round(candleCount * 0.9));
            const centerIndex = Math.round((this.viewport.startIndex + this.viewport.endIndex) / 2);
            
            this.viewport.startIndex = Math.max(0, centerIndex - Math.round(newCandleCount / 2));
            this.viewport.endIndex = Math.min(this.candleData.length, this.viewport.startIndex + newCandleCount);
            
        } else {
            // Zoom out - decrease candle width, show more candles
            this.viewport.candleWidth = Math.max(this.viewport.minCandleWidth, this.viewport.candleWidth * 0.9);
            
            const candleCount = this.viewport.endIndex - this.viewport.startIndex;
            const newCandleCount = Math.min(this.candleData.length, Math.round(candleCount * 1.1));
            const centerIndex = Math.round((this.viewport.startIndex + this.viewport.endIndex) / 2);
            
            this.viewport.startIndex = Math.max(0, centerIndex - Math.round(newCandleCount / 2));
            this.viewport.endIndex = Math.min(this.candleData.length, this.viewport.startIndex + newCandleCount);
        }
        
        console.log('New viewport after zoom:', this.viewport.startIndex, 'to', this.viewport.endIndex);
        this.updateChart();
        this.updateStatus(`Zoom: ${this.viewport.candleWidth.toFixed(1)}px šířka svíček`, 'info');
    }

    // Drawing Tools
    selectTool(tool) {
        if (tool === 'clear') {
            this.clearAllDrawings();
            return;
        }
        
        this.currentTool = tool;
        
        // Update cursor style
        if (tool === 'cursor') {
            this.chartCanvas.style.cursor = 'crosshair';
            this.drawingCanvas.style.pointerEvents = 'none';
        } else {
            this.chartCanvas.style.cursor = 'crosshair';
            this.drawingCanvas.style.pointerEvents = 'auto';
        }
        
        // Update UI
        this.toolButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === tool) {
                btn.classList.add('active');
            }
        });
        
        this.updateStatus(`Vybrán nástroj: ${tool}`, 'info');
    }

    startDrawing(event) {
        if (this.currentTool === 'cursor') return;
        
        this.isDrawing = true;
        const rect = this.drawingCanvas.getBoundingClientRect();
        this.startPoint = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    onDrawing(event) {
        if (!this.isDrawing || this.currentTool === 'cursor') return;
        
        const rect = this.drawingCanvas.getBoundingClientRect();
        const currentPoint = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        // Vyčistíme canvas a překreslíme všechny existující kresby
        this.redrawAll();
        
        // Nakreslíme současnou kresbu
        this.drawPreview(this.startPoint, currentPoint);
    }

    stopDrawing() {
        if (!this.isDrawing || this.currentTool === 'cursor') return;
        
        this.isDrawing = false;
        
        // Uložíme kresbu
        const rect = this.drawingCanvas.getBoundingClientRect();
        const endPoint = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        const drawing = {
            type: this.currentTool,
            start: this.startPoint,
            end: endPoint,
            color: '#f0b90b',
            width: 2
        };
        
        this.drawings.push(drawing);
        this.redrawAll();
    }

    drawPreview(start, end) {
        this.drawingCtx.strokeStyle = '#f0b90b';
        this.drawingCtx.lineWidth = 2;
        this.drawingCtx.beginPath();
        
        switch (this.currentTool) {
            case 'line':
                this.drawingCtx.moveTo(start.x, start.y);
                this.drawingCtx.lineTo(end.x, end.y);
                break;
            case 'horizontal':
                this.drawingCtx.moveTo(0, start.y);
                this.drawingCtx.lineTo(this.drawingCanvas.width, start.y);
                break;
            case 'vertical':
                this.drawingCtx.moveTo(start.x, 0);
                this.drawingCtx.lineTo(start.x, this.drawingCanvas.height);
                break;
            case 'rectangle':
                this.drawingCtx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
                this.drawingCtx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
                break;
        }
        
        this.drawingCtx.stroke();
    }

    redrawAll() {
        this.drawingCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        
        this.drawings.forEach(drawing => {
            this.drawingCtx.strokeStyle = drawing.color;
            this.drawingCtx.lineWidth = drawing.width;
            this.drawingCtx.beginPath();
            
            switch (drawing.type) {
                case 'line':
                    this.drawingCtx.moveTo(drawing.start.x, drawing.start.y);
                    this.drawingCtx.lineTo(drawing.end.x, drawing.end.y);
                    break;
                case 'horizontal':
                    this.drawingCtx.moveTo(0, drawing.start.y);
                    this.drawingCtx.lineTo(this.drawingCanvas.width, drawing.start.y);
                    break;
                case 'vertical':
                    this.drawingCtx.moveTo(drawing.start.x, 0);
                    this.drawingCtx.lineTo(drawing.start.x, this.drawingCanvas.height);
                    break;
                case 'rectangle':
                    this.drawingCtx.rect(drawing.start.x, drawing.start.y, 
                                       drawing.end.x - drawing.start.x, 
                                       drawing.end.y - drawing.start.y);
                    break;
                case 'circle':
                    const radius = Math.sqrt(Math.pow(drawing.end.x - drawing.start.x, 2) + 
                                           Math.pow(drawing.end.y - drawing.start.y, 2));
                    this.drawingCtx.arc(drawing.start.x, drawing.start.y, radius, 0, 2 * Math.PI);
                    break;
            }
            
            this.drawingCtx.stroke();
        });
    }

    clearAllDrawings() {
        this.drawings = [];
        this.redrawAll();
        this.updateStatus('Všechny kresby byly vymazány', 'info');
    }

    updateMouseCoordinates(event) {
        if (this.chartCanvas && this.candleData.length > 0) {
            const rect = this.chartCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Convert to chart coordinates
            const price = this.yToPrice(y);
            
            // Find closest candle index
            const padding = this.viewport.padding;
            if (x >= padding.left && x <= this.chartCanvas.width - padding.right) {
                const candleCount = this.viewport.endIndex - this.viewport.startIndex;
                const chartWidth = this.chartCanvas.width - padding.left - padding.right;
                const relativeX = x - padding.left;
                const candleIndex = Math.floor((relativeX / chartWidth) * candleCount) + this.viewport.startIndex;
                
                if (candleIndex >= 0 && candleIndex < this.candleData.length) {
                    const candle = this.candleData[candleIndex];
                    const date = new Date(candle.timestamp).toLocaleDateString('cs-CZ');
                    this.mouseCoords.textContent = `${date} | Cena: ${price.toFixed(8)} | O:${candle.open.toFixed(6)} H:${candle.high.toFixed(6)} L:${candle.low.toFixed(6)} C:${candle.close.toFixed(6)}`;
                } else {
                    this.mouseCoords.textContent = `Cena: ${price.toFixed(8)}`;
                }
            } else {
                this.mouseCoords.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
            }
        }
    }

    updateStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        
        // Auto-clear status after 5 seconds
        setTimeout(() => {
            this.statusMessage.textContent = 'Připraveno';
            this.statusMessage.className = 'status-message';
        }, 5000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CryptoChartViewer();
});
