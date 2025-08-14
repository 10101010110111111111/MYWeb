@echo off
chcp 65001 >nul
echo 🚀 Spouštím build React projektu...

REM Kontrola, zda je nainstalován Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js není nainstalován!
    echo Stáhněte si Node.js z: https://nodejs.org/
    pause
    exit /b 1
)

REM Kontrola verze Node.js
for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 18 (
    echo ❌ Potřebujete Node.js verzi 18 nebo vyšší!
    echo Aktuální verze: 
    node --version
    pause
    exit /b 1
)

echo ✅ Node.js verze: 
node --version

REM Instalace závislostí
echo 📦 Instaluji závislosti...
if exist "pnpm-lock.yaml" (
    pnpm install
) else if exist "yarn.lock" (
    yarn install
) else (
    npm install
)

REM Sestavení projektu
echo 🔨 Sestavuji projekt...
if exist "pnpm-lock.yaml" (
    pnpm build
) else if exist "yarn.lock" (
    yarn build
) else (
    npm run build
)

REM Kontrola, zda se build povedl
if %errorlevel% equ 0 (
    echo ✅ Build úspěšný!
    echo 📁 Statické soubory jsou v adresáři: out/
    echo.
    echo 🌐 PRO NASAZENÍ NA WEB:
    echo 1. Nahrajte obsah adresáře 'out/' na váš webhosting
    echo 2. Nastavte index.html jako výchozí stránku
    echo 3. Ujistěte se, že server podporuje SPA routing
    echo.
    echo 📋 Obsah out/ adresáře:
    dir out
) else (
    echo ❌ Build selhal!
    pause
    exit /b 1
)

pause
