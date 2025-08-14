# 🔒 BEZPEČNOSTNÍ SYSTÉM PRO CHRÁNĚNÉ PROJEKTY

## 📋 Přehled problému

**Původní problém:** Uživatelé mohli přistupovat k chráněným projektům jednoduše změnou URL (např. z `project2` na `project3`) bez znalosti hesla.

**Řešení:** Implementován vícevrstvý bezpečnostní systém s server-side a client-side ochranou.

## 🛡️ Implementované bezpečnostní vrstvy

### 1. **Server-side ochrana (.htaccess)**
- Každý chráněný projekt má vlastní `.htaccess` soubor
- Blokuje přímý přístup k HTML souborům
- Přesměrovává všechny požadavky na kontrolní skript
- Kontroluje autentifikační cookies

### 2. **PHP middleware (login-check.php)**
- Kontroluje session data
- Validuje přihlášení uživatele
- Poskytuje chráněný obsah pouze po autentifikaci
- Generuje 404 chyby pro neexistující soubory

### 3. **Autentifikační systém (project-auth.php)**
- Zpracovává přihlašovací požadavky
- Spravuje session a cookies
- Loguje všechny přístupy pro bezpečnost
- Validuje hesla pro jednotlivé projekty

### 4. **Přihlašovací rozhraní (login-project.php)**
- Moderní, responzivní design
- Dynamické názvy projektů
- Bezpečnostní validace na klientské straně
- Přesměrování po úspěšném přihlášení

### 5. **JavaScript middleware (security-middleware.js)**
- Dodatečná ochrana na klientské straně
- Sleduje změny URL v reálném čase
- Automatické přesměrování na přihlášení
- Správa autentifikace v localStorage/sessionStorage

## 🔐 Chráněné projekty a hesla

| Projekt | Název | Heslo | Status |
|---------|-------|--------|---------|
| project3 | BJ Full Counter | `tools2024` | ✅ Chráněn |
| project5 | Black Jack Simulator | `blackjack2024` | ✅ Chráněn |
| project6 | DropShop E-commerce | `dropshop2024` | ✅ Chráněn |
| project11 | Krypto Data Manager | `krypto2024` | ✅ Chráněn |
| project13 | Secret Project | `secret2024` | ✅ Chráněn |

## 🚀 Jak to funguje

### **Přístup k chráněnému projektu:**

1. **Uživatel zadá URL** → `https://marianvystavel.cz/project3/`
2. **Apache (.htaccess)** → Blokuje přímý přístup k HTML
3. **Přesměrování** → Na `login-check.php` s parametry
4. **Kontrola session** → Pokud není přihlášen → přesměrování na přihlášení
5. **Přihlášení** → Uživatel zadá heslo
6. **Validace** → `project-auth.php` ověří heslo
7. **Přístup povolen** → Session nastavena, cookie vytvořena
8. **Zobrazení obsahu** → Chráněný projekt se načte

### **Bezpečnostní kontroly:**

- ✅ **URL manipulace** - Blokováno .htaccess
- ✅ **Přímý přístup** - Blokováno PHP middleware
- ✅ **Session hijacking** - Chráněno secure cookies
- ✅ **Brute force** - Logování pokusů o přihlášení
- ✅ **Client-side bypass** - JavaScript middleware

## 📁 Struktura souborů

```
/
├── .htaccess                    # Hlavní Apache pravidla
├── login-check.php             # PHP middleware pro kontrolu
├── project-auth.php            # Autentifikační API
├── login-project.php           # Přihlašovací rozhraní
├── security-middleware.js      # JavaScript middleware
├── access_log.txt              # Log přístupů (generován automaticky)
├── project3/
│   ├── .htaccess              # Ochrana project3
│   └── index.html             # Chráněný obsah
├── project5/
│   ├── .htaccess              # Ochrana project5
│   └── index.html             # Chráněný obsah
├── project6/
│   ├── .htaccess              # Ochrana project6
│   └── index.html             # Chráněný obsah
└── project11/
    ├── .htaccess              # Ochrana project11
    └── index.html             # Chráněný obsah
```

## ⚙️ Konfigurace

### **Přidání nového chráněného projektu:**

1. **Vytvořit .htaccess** v adresáři projektu:
```apache
# OCHRANA PROJEKTU
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f
RewriteCond %{REQUEST_FILENAME} \.html$
RewriteRule ^(.*)$ /login-check.php?project=PROJECT_NAME&file=$1 [L,QSA]
```

2. **Přidat heslo** do `project-auth.php`:
```php
$projectPasswords = [
    // ... existující projekty ...
    'PROJECT_NAME' => 'NEW_PASSWORD'
];
```

3. **Přidat do JavaScript middleware**:
```javascript
this.protectedProjects = {
    // ... existující projekty ...
    'PROJECT_NAME': 'NEW_PASSWORD'
};
```

### **Změna hesla:**

1. Upravit heslo v `project-auth.php`
2. Upravit heslo v `security-middleware.js`
3. Odhlásit všechny uživatele (smazat cookies)

## 🔍 Monitoring a logování

### **Log soubor: `access_log.txt`**
```
[2024-01-15 14:30:25] project3 - SUCCESS - IP: 192.168.1.100
[2024-01-15 14:31:10] project3 - FAILED - IP: 192.168.1.100
[2024-01-15 14:32:45] project5 - SUCCESS - IP: 10.0.0.50
```

### **Sledované události:**
- ✅ Úspěšná přihlášení
- ❌ Neúspěšná přihlášení
- 📍 IP adresy
- 🕒 Časové razítko
- 🎯 Název projektu

## 🚨 Bezpečnostní doporučení

### **Pro produkční nasazení:**

1. **HTTPS povinné** - Všechny komunikace přes SSL/TLS
2. **Silná hesla** - Minimálně 12 znaků, kombinace znaků
3. **Rate limiting** - Omezení pokusů o přihlášení
4. **IP whitelist** - Povolení pouze z důvěryhodných IP
5. **Pravidelné audity** - Kontrola log souborů
6. **Backup sessions** - Zálohování session dat

### **Monitoring:**
- Sledování neúspěšných pokusů o přihlášení
- Detekce podezřelých IP adres
- Analýza vzorů přístupu
- Upozornění na neobvyklou aktivitu

## 🧪 Testování

### **Test bezpečnosti:**

1. **Přímý přístup** → `https://marianvystavel.cz/project3/`
   - ✅ Měl by být přesměrován na přihlášení

2. **Změna URL** → `https://marianvystavel.cz/project5/`
   - ✅ Měl by být přesměrován na přihlášení

3. **Přístup bez hesla** → Pokus o obejití
   - ✅ Měl by být blokován

4. **Správné heslo** → `blackjack2024` pro project5
   - ✅ Měl by povolit přístup

## 📞 Podpora

**Problémy s implementací:**
- Zkontrolovat Apache mod_rewrite
- Ověřit PHP session support
- Kontrolovat log soubory
- Testovat na různých prohlížečích

**Kontakt:** Marian Vystavěl

---

**⚠️ DŮLEŽITÉ:** Tento systém poskytuje silnou ochranu, ale není 100% bezpečný proti všem útokům. Pravidelně aktualizujte hesla a monitorujte log soubory.
