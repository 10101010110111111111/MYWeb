# Krypto Data Manager - Projekt 11

## Popis projektu

Krypto Data Manager je webová aplikace pro správu a aktualizaci dat kryptoměn. Umožňuje uživatelům nahrát složku s existujícími daty kryptoměn a stáhnout aktualizovaná data s nejnovějšími informacemi.

## Funkce

### 1. Nahrávání složek s daty
- Uživatel může nahrát složku obsahující data kryptoměn
- Aplikace automaticky analyzuje strukturu složek a souborů
- Podporuje různé formáty souborů (.txt, .csv, atd.)

### 2. Struktura dat
Očekávaná struktura složky:
```
BTC/USDT/
├── 1m.txt
├── 5m.txt
├── 30m.txt
├── 1H.txt
├── 4H.txt
├── 12H.txt
├── 24H.txt
└── 1W.txt

ETH/USDT/
├── 1m.txt
├── 5m.txt
└── ...
```

### 3. Aktualizace dat
- Pokud uživatel nahraje složku, aplikace analyzuje nejnovější svíčky
- Automaticky doplní chybějící data až do současnosti
- Kombinuje stará data s novými

### 4. Stahování dat
- Pokud uživatel nenahraje složku, stáhne se kompletní sada dat
- Výchozí kryptoměny: BTC/USDT, ETH/USDT, SOL/USDT, BNB/USDT, ADA/USDT, AVAX/USDT, MATIC/USDT
- **Každý soubor obsahuje až 5000 svíček** (výchozí nastavení pro kompletní data)

### 5. Vytváření nových souborů
- **Switch pro vytváření nových souborů** (defaultně ZAPNUTO)
- Pokud je ZAPNUTO: Vytvoří se chybějící soubory pro všechny časové rámce
- Pokud je vypnuto: Aktualizují se pouze existující soubory

### 6. Časové rámce
Podporované časové rámce:
- 1m (1 minuta)
- 5m (5 minut)
- 30m (30 minut)
- 1H (1 hodina)
- 4H (4 hodiny)
- 12H (12 hodin)
- 24H (24 hodiny)
- 1W (1 týden)

## Formát dat

Každý soubor obsahuje data ve formátu CSV:
```
timestamp,open,high,low,close,volume
1640995200000,45000.50,45100.25,44950.75,45050.00,1234567.89
1640995260000,45050.00,45200.50,45025.25,45175.75,2345678.90
```

## Použití

1. Otevřete `index.html` v prohlížeči
2. Volitelně nahrajte složku s existujícími daty
3. Nastavte počet svíček (výchozí: 5000)
4. Zapněte/vypněte vytváření nových souborů
5. Klikněte na "Stáhnout data"
6. Stáhne se ZIP soubor s aktualizovanými daty

## Technologie

- HTML5
- CSS3 (moderní design s gradienty a animacemi)
- JavaScript (ES6+)
- JSZip (pro vytváření ZIP souborů)
- Font Awesome (ikony)

## Poznámky

- Aplikace simuluje získávání dat z Binance API
- V reálné implementaci by bylo potřeba implementovat skutečné API volání
- Data jsou generována s realistickými cenovými pohyby a volatilitou
- **Výchozí nastavení: 5000 svíček na soubor** pro kompletní historická data
- Aplikace je plně responzivní a funguje na všech zařízeních
- Optimalizováno pro zpracování velkého množství dat

## Struktura souborů

```
project11/
├── index.html      # Hlavní HTML stránka
├── styles.css      # CSS styly
├── script.js       # JavaScript logika
└── README.md       # Tento soubor
```
