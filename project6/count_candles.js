const fs = require('fs');

const file = process.argv[2];
if (!file) {
    console.log('Použití: node count_candles.js <soubor>');
    process.exit(1);
}

if (!fs.existsSync(file)) {
    console.error('Soubor neexistuje');
    process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');
const lines = content.trim().split('\n').filter(l => l.trim().length > 0);
console.log(`Počet svíček v souboru ${file}: ${lines.length}`);

if (lines.length > 0) {
    console.log('První řádek:', lines[0]);
    console.log('Poslední řádek:', lines[lines.length - 1]);
}
