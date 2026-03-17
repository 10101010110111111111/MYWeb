const fs = require('fs');
const path = require('path');

/**
 * Merge multiple candle data files (CSV/TXT) into one.
 * Includes gap detection and automatic timeframe analysis.
 * Usage: node merge_candles.js <output_file> <input_file1> <input_file2> ...
 */

const args = process.argv.slice(2);
if (args.length < 3) {
    console.log('Použití: node merge_candles.js <vystupni_soubor> <vstup1> <vstup2> [...]');
    process.exit(1);
}

const outputFile = args[0];
const inputFiles = args.slice(1);

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

// Gap check
let gapCount = 0;
if (interval > 0) {
    for (let i = 1; i < sortedTimestamps.length; i++) {
        const diff = Number(sortedTimestamps[i]) - Number(sortedTimestamps[i-1]);
        if (diff > interval) {
            const missing = Math.round(diff / interval) - 1;
            console.warn(`❌ MEZERA detekována mezi ${sortedTimestamps[i-1]} a ${sortedTimestamps[i]} (chybí cca ${missing} svíček)`);
            gapCount++;
        }
    }
}

if (gapCount === 0 && interval > 0) {
    console.log('✅ Žádné mezery nebyly nalezeny. Data jsou spojitá.');
} else if (gapCount > 0) {
    console.warn(`⚠️ Celkem nalezeno ${gapCount} mezer.`);
}

console.log(`✍️ Zapisuji do: ${outputFile}`);
const outputStream = fs.createWriteStream(outputFile);

sortedTimestamps.forEach((ts, index) => {
    outputStream.write(allCandles.get(ts) + (index === sortedTimestamps.length - 1 ? '' : '\n'));
});

outputStream.end();
console.log('✨ Hotovo! Finální soubor obsahuje ' + sortedTimestamps.length + ' svíček.');
