const fs = require('fs');
const path = require('path');

/**
 * Merge multiple candle data files (CSV/TXT) into one.
 * Includes gap detection and automatic timeframe analysis.
 * Usage: node merge_candles.js <output_file> <input_file1> <input_file2> ...
 */

const args = process.argv.slice(2);
const fillGaps = args.includes('--fill-gaps');
const filteredArgs = args.filter(arg => arg !== '--fill-gaps');

if (filteredArgs.length < 3) {
    console.log('Použití: node merge_candles.js <vystupni_soubor> <vstup1> <vstup2> [...] [--fill-gaps]');
    console.log('  --fill-gaps    Automaticky doplní chybějící svíčky pomocí lineární interpolace.');
    process.exit(1);
}

const outputFile = filteredArgs[0];
const inputFiles = filteredArgs.slice(1);

let allCandles = new Map();

console.log(`🚀 Začínám slučování ${inputFiles.length} souborů...`);

inputFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        console.warn(`⚠️ Soubor neexistuje: ${file}`);
        return;
    }

    console.log(`📖 Čtu soubor: ${file}`);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.trim().split('\n');

    let count = 0;
    lines.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(',');
        if (parts.length >= 6) {
            const timestamp = parts[0].trim();
            if (allCandles.has(timestamp)) {
                // If data differs, we could warn, but usually we just keep one
                const existing = allCandles.get(timestamp);
                if (existing !== line.trim()) {
                    // console.warn(`Note: Duplicate timestamp ${timestamp} with different data found. Keeping the latest encountered.`);
                }
            }
            allCandles.set(timestamp, line.trim());
            count++;
        }
    });
    console.log(`✅ Načteno ${count} řádků.`);
});

console.log(`📊 Celkem unikátních svíček před seřazením: ${allCandles.size}`);

// Sort by timestamp
const sortedTimestamps = Array.from(allCandles.keys()).sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    return numA - numB;
});

// detect interval
let interval = 0;
if (sortedTimestamps.length > 1) {
    const diffs = [];
    for (let i = 1; i < Math.min(sortedTimestamps.length, 11); i++) {
        diffs.push(Number(sortedTimestamps[i]) - Number(sortedTimestamps[i-1]));
    }
    // Mode of diffs as interval
    const counts = {};
    diffs.forEach(d => counts[d] = (counts[d] || 0) + 1);
    interval = Number(Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b));
    
    const intervalNames = {
        60000: '1m',
        300000: '5m',
        1800000: '30m',
        3600000: '1h',
        14400000: '4h',
        43200000: '12h',
        86400000: '1d',
        604800000: '1w'
    };
    console.log(`📈 Detekovaný interval: ${interval} ms (${intervalNames[interval] || 'neznámý'})`);
}

// Gap check and filling
let gapCount = 0;
let filledCount = 0;

if (interval > 0) {
    // We need to work with a copy of the list because we might insert new values
    const originalTimestamps = [...sortedTimestamps];
    
    for (let i = 1; i < originalTimestamps.length; i++) {
        const prevTs = Number(originalTimestamps[i-1]);
        const nextTs = Number(originalTimestamps[i]);
        const diff = nextTs - prevTs;
        
        if (diff > interval) {
            const missingCount = Math.round(diff / interval) - 1;
            console.warn(`❌ MEZERA detekována mezi ${prevTs} a ${nextTs} (chybí cca ${missingCount} svíček)`);
            gapCount++;
            
            if (fillGaps && missingCount > 0) {
                console.log(`🔧 Doplňuji ${missingCount} svíček pomocí interpolace...`);
                
                const prevData = allCandles.get(prevTs.toString()).split(',');
                const nextData = allCandles.get(nextTs.toString()).split(',');
                
                // Fields: timestamp, open, high, low, close, volume
                const pOpen = Number(prevData[1]);
                const pHigh = Number(prevData[2]);
                const pLow = Number(prevData[3]);
                const pClose = Number(prevData[4]);
                const pVol = Number(prevData[5]);
                
                const nOpen = Number(nextData[1]);
                const nHigh = Number(nextData[2]);
                const nLow = Number(nextData[3]);
                const nClose = Number(nextData[4]);
                const nVol = Number(nextData[5]);
                
                for (let k = 1; k <= missingCount; k++) {
                    const currentTs = prevTs + (k * interval);
                    const ratio = k / (missingCount + 1);
                    
                    // Simple linear interpolation
                    const iOpen = (pOpen + (nOpen - pOpen) * ratio).toFixed(8);
                    const iHigh = (pHigh + (nHigh - pHigh) * ratio).toFixed(8);
                    const iLow = (pLow + (nLow - pLow) * ratio).toFixed(8);
                    const iClose = (pClose + (nClose - pClose) * ratio).toFixed(8);
                    const iVol = (pVol + (nVol - pVol) * ratio).toFixed(2);
                    
                    const interpolatedLine = `${currentTs},${iOpen},${iHigh},${iLow},${iClose},${iVol}`;
                    allCandles.set(currentTs.toString(), interpolatedLine);
                    filledCount++;
                }
            }
        }
    }
}

// Re-sort if we filled gaps
let finalTimestamps = sortedTimestamps;
if (filledCount > 0) {
    finalTimestamps = Array.from(allCandles.keys()).sort((a, b) => Number(a) - Number(b));
    console.log(`✨ Doplněno ${filledCount} svíček. Celkový počet: ${finalTimestamps.length}`);
}

if (gapCount === 0 && interval > 0) {
    console.log('✅ Žádné mezery nebyly nalezeny. Data jsou spojitá.');
} else if (gapCount > 0) {
    console.warn(`⚠️ Celkem nalezeno ${gapCount} mezer.`);
}

console.log(`✍️ Zapisuji do: ${outputFile}`);
const outputStream = fs.createWriteStream(outputFile);

finalTimestamps.forEach((ts, index) => {
    outputStream.write(allCandles.get(ts) + (index === finalTimestamps.length - 1 ? '' : '\n'));
});

outputStream.end();
console.log('✨ Hotovo! Finální soubor obsahuje ' + sortedTimestamps.length + ' svíček.');
