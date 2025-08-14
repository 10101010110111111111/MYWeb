#!/bin/bash

# BUILD SCRIPT PRO REACT PROJEKT
# Tento script sestaví a připraví projekt pro nasazení na web

echo "🚀 Spouštím build React projektu..."

# Kontrola, zda je nainstalován Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js není nainstalován!"
    echo "Stáhněte si Node.js z: https://nodejs.org/"
    exit 1
fi

# Kontrola verze Node.js (potřebujeme alespoň 18)
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Potřebujete Node.js verzi 18 nebo vyšší!"
    echo "Aktuální verze: $(node -v)"
    exit 1
fi

echo "✅ Node.js verze: $(node -v)"

# Instalace závislostí
echo "📦 Instaluji závislosti..."
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install
elif [ -f "yarn.lock" ]; then
    yarn install
else
    npm install
fi

# Sestavení projektu
echo "🔨 Sestavuji projekt..."
if [ -f "pnpm-lock.yaml" ]; then
    pnpm build
elif [ -f "yarn.lock" ]; then
    yarn build
else
    npm run build
fi

# Kontrola, zda se build povedl
if [ $? -eq 0 ]; then
    echo "✅ Build úspěšný!"
    echo "📁 Statické soubory jsou v adresáři: out/"
    echo ""
    echo "🌐 PRO NASAZENÍ NA WEB:"
    echo "1. Nahrajte obsah adresáře 'out/' na váš webhosting"
    echo "2. Nastavte index.html jako výchozí stránku"
    echo "3. Ujistěte se, že server podporuje SPA routing"
    echo ""
    echo "📋 Obsah out/ adresáře:"
    ls -la out/
else
    echo "❌ Build selhal!"
    exit 1
fi
