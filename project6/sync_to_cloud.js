/**
 * Cloud Sync Simulation for Project 6
 * This script simulates uploading data to a cloud provider (Google Drive / Dropbox).
 * In a real scenario, you would use 'googleapis' or 'dropbox' npm packages.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Použití: node sync_to_cloud.js <soubor_k_synchronizaci>');
    process.exit(1);
}

const sourceFile = args[0];
const cloudSimDir = path.join(__dirname, 'Cloud_Sync_Sim');

if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Soubor neexistuje: ${sourceFile}`);
    process.exit(1);
}

// Create simulation directory
if (!fs.existsSync(cloudSimDir)) {
    fs.mkdirSync(cloudSimDir);
    console.log(`📁 Vytvořena složka pro simulaci cloudu: ${cloudSimDir}`);
}

const fileName = path.basename(sourceFile);
const destFile = path.join(cloudSimDir, fileName);

console.log(`☁️ Synchronizuji ${fileName} do cloudu...`);

// Simulate network delay
setTimeout(() => {
    try {
        fs.copyFileSync(sourceFile, destFile);
        console.log(`✅ Synchronizace dokončena!`);
        console.log(`📍 Soubor je bezpečně uložen v: ${destFile}`);
        console.log(`ℹ️ (V reálné aplikaci by zde proběhl upload přes API na Google Drive nebo Dropbox)`);
    } catch (err) {
        console.error(`❌ Chyba při synchronizaci: ${err.message}`);
    }
}, 1500);
