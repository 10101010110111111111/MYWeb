# 🚀 NASAZENÍ REACT PROJEKTU NA WEB

## 📋 Přehled možností

Máte několik možností, jak nasadit váš React projekt na web po pushnutí na GitHub:

### **1. 🆓 GitHub Pages (ZDARMA)**
### **2. 🚀 Vercel (ZDARMA, nejlepší pro Next.js)**
### **3. 🌐 Netlify (ZDARMA)**
### **4. 🖥️ Vlastní webhosting**

---

## 🆓 **GITHUB PAGES (DOPORUČUJI)**

### **Krok 1: Povolit GitHub Pages**
1. Jděte na váš GitHub repository
2. Klikněte na **Settings** → **Pages**
3. V **Source** vyberte **GitHub Actions**
4. Uložte nastavení

### **Krok 2: Push kódu**
```bash
git add .
git commit -m "Přidán React projekt s automatickým nasazením"
git push origin main
```

### **Krok 3: Automatické nasazení**
- GitHub Actions automaticky sestaví projekt
- Nasadí ho na `https://username.github.io/repository-name`
- Nebo na vaši vlastní doménu (pokud máte CNAME)

### **Výhody:**
- ✅ **ZDARMA**
- ✅ **Automatické** po každém push
- ✅ **Integrované** s GitHub
- ✅ **Jednoduché** nastavení

---

## 🚀 **VERCEL (NEJLEPŠÍ PRO NEXT.JS)**

### **Krok 1: Připojit Vercel**
1. Jděte na [vercel.com](https://vercel.com)
2. Přihlaste se s GitHub účtem
3. Klikněte **New Project**
4. Vyberte váš repository

### **Krok 2: Automatické nasazení**
- Vercel automaticky detekuje Next.js
- Sestaví a nasadí projekt
- Poskytne URL: `https://project-name.vercel.app`

### **Krok 3: Vlastní doména**
1. V **Settings** → **Domains**
2. Přidejte `project13.marianvystavel.cz`
3. Nastavte DNS záznamy

### **Výhody:**
- ✅ **ZDARMA** tier
- ✅ **Nejlepší** pro Next.js
- ✅ **Automatické** nasazení
- ✅ **Vlastní domény**
- ✅ **Analytics** a monitoring

---

## 🌐 **NETLIFY (ALTERNATIVA)**

### **Krok 1: Připojit Netlify**
1. Jděte na [netlify.com](https://netlify.com)
2. Přihlaste se s GitHub účtem
3. Klikněte **New site from Git**
4. Vyberte váš repository

### **Krok 2: Nastavení build**
- **Build command:** `npm run build`
- **Publish directory:** `out`
- **Base directory:** (prázdné)

### **Krok 3: Automatické nasazení**
- Netlify nasadí na `https://random-name.netlify.app`
- Můžete přidat vlastní doménu

---

## 🖥️ **VLASTNÍ WEBHOSTING**

### **Krok 1: Sestavit projekt lokálně**
```bash
# Windows
build.bat

# Linux/Mac
chmod +x build.sh
./build.sh
```

### **Krok 2: Nahrat soubory**
1. Otevřete adresář `out/`
2. Nahrajte **všechny soubory** na webhosting
3. Ujistěte se, že `index.html` je v root adresáři

### **Krok 3: Nastavit .htaccess**
- Nahrajte `.htaccess` soubor
- Zajistí správné SPA routing

---

## 🔧 **KONFIGURACE PRO AUTOMATICKÉ NASAZENÍ**

### **GitHub Actions (už máte)**
- Automaticky se spustí po push
- Sestaví projekt a nasadí na GitHub Pages

### **Vercel (doporučuji)**
- Automaticky se spustí po push
- Nejlepší výkon pro Next.js

### **Netlify**
- Automaticky se spustí po push
- Dobrá alternativa k Vercel

---

## 📱 **TESTOVÁNÍ NASAZENÍ**

### **Po nasazení zkontrolujte:**
1. ✅ **Hlavní stránka** se načte
2. ✅ **Routing funguje** (zkuste `/dashboard`, `/auth`)
3. ✅ **Obrázky a CSS** se načítají
4. ✅ **JavaScript funguje** správně

### **Časté problémy:**
- ❌ **404 chyby** → Chybí SPA routing
- ❌ **CSS nefunguje** → Špatné cesty k souborům
- ❌ **Routing nefunguje** → Chybí .htaccess/nginx config

---

## 🎯 **DOPORUČENÝ POSTUP**

### **Pro začátek:**
1. **GitHub Pages** - nejjednodušší, zdarma
2. **Vercel** - nejlepší pro Next.js, zdarma

### **Pro produkci:**
1. **Vercel** s vlastní doménou
2. **GitHub Pages** s CNAME
3. **Vlastní webhosting** s .htaccess

---

## 🚀 **RYCHLÉ NASAZENÍ**

### **Stačí udělat:**
```bash
git add .
git commit -m "React projekt připraven k nasazení"
git push origin main
```

### **Automaticky se stane:**
1. GitHub Actions sestaví projekt
2. Nasadí ho na web
3. Poskytne URL adresu

---

## 📞 **PODPORA**

**Problémy s nasazením:**
- Zkontrolujte GitHub Actions logy
- Ověřte, že build projde lokálně
- Kontrolujte cesty k souborům

**Kontakt:** Marian Vystavěl

---

**🎉 Váš React projekt bude viditelný na webu po každém push na GitHub!**
