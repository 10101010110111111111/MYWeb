# 🎰 Blackjack Wong Halves Card Counter

Moderní webová aplikace pro počítání karet pomocí Wong Halves systému s kompletní Basic Strategy a Illustrious 18 deviations.

## ✨ Funkce

### 🃏 Card Counter
- **Wong Halves systém** - přesné počítání karet
- **Vizuální feedback** - animované efekty při přidávání karet
- **Real-time výpočty** - Running Count, True Count, zbývající karty
- **Historie karet** - posledních 10 přidaných karet
- **Undo/Reset** - možnost vrátit poslední kartu nebo resetovat vše

### 📊 Basic Strategy
- **Kompletní tabulky** pro všechny situace
- **Normal Hands** - základní kombinace
- **Soft Hands** - kombinace s esem
- **Pairs** - páry karet
- **Barevné kódování** pro snadnou orientaci

### 🎯 Illustrious 18 Deviations
- **Nejdůležitější count-based deviations**
- **Index hodnoty** s barevným kódováním
- **Přehledné tabulky** pro rychlé rozhodování

### 🎨 Moderní UI/UX
- **Responsivní design** - funguje na všech zařízeních
- **Animace a efekty** - plynulé přechody a hover efekty
- **Gradient pozadí** - moderní vzhled
- **Emoji navigace** - intuitivní ovládání

## 🚀 Jak používat

### Instalace
1. Stáhněte všechny soubory do jedné složky
2. Otevřete `index.html` v prohlížeči
3. Aplikace je připravena k použití!

### Ovládání Card Counteru
- **Klávesy 1-9, 0** - přidání karet (1=eso, 0=10)
- **Backspace** - vrátit poslední kartu
- **Delete** - resetovat vše
- **Šipky ←/→** - navigace mezi stránkami

### Navigace
- **⬅️➡️ Šipky** - přepínání mezi stránkami
- **Počítání** - hlavní card counter
- **Basic Strategy** - kompletní strategické tabulky
- **Deviace** - Illustrious 18 deviations

## 🎨 Barevné kódování

### Card Counter
- 🟢 **Zelená** - pozitivní hodnoty
- 🔴 **Červená** - negativní hodnoty
- ⚪ **Šedá** - neutrální hodnoty

### Basic Strategy
- 🔴 **Červená** - Hit (H)
- 🟢 **Zelená** - Stand (S)
- 🟡 **Oranžová** - Double (D)
- 🟣 **Fialová** - Split (P)

### Deviations
- 🟢 **Zelená** - pozitivní indexy (+)
- 🔴 **Červená** - negativní indexy (-)
- ⚪ **Šedá** - nulové hodnoty (0)

## 📁 Struktura souborů

```
;D/
├── index.html          # Hlavní HTML soubor
├── script.js           # JavaScript logika
├── styles.css          # CSS styly
├── basicStrtegy.html   # Basic Strategy tabulky
├── deviations.html     # Illustrious 18 deviations
├── units.jpg           # Wong Halves obrázek
└── README.md           # Tento soubor
```

## 🛠️ Technické detaily

### Technologie
- **HTML5** - struktura
- **CSS3** - styly a animace
- **Vanilla JavaScript** - funkcionalita
- **Responsive Design** - mobilní optimalizace

### Prohlížeče
- ✅ Chrome (doporučeno)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Funkce
- **Local Storage** - data se ukládají lokálně
- **Haptic Feedback** - vibrace na mobilních zařízeních
- **Keyboard Navigation** - plná podpora klávesnice
- **Touch Support** - dotykové ovládání

## 🎯 Wong Halves Systém

### Hodnoty karet
- **A (Eso)**: -1
- **2**: +0.5
- **3**: +1
- **4**: +1
- **5**: +1.5
- **6**: +1
- **7**: +0.5
- **8**: 0
- **9**: -0.5
- **10, J, Q, K**: -1

### Výpočty
- **Running Count** = součet všech hodnot
- **True Count** = Running Count / zbývající balíčky
- **Zbývající karty** = celkový počet - odehrané karty

## 📱 Mobilní použití

Aplikace je plně optimalizována pro mobilní zařízení:
- **Touch-friendly** tlačítka
- **Responsive layout**
- **Haptic feedback**
- **Optimální velikosti** pro dotykové ovládání

## 🔧 Možné rozšíření

- Přidání více counting systémů
- Statistiky a analýzy
- Uložení více her
- Export dat
- Zvukové efekty
- Dark mode

## 📄 Licence

Tento projekt je open source a volně k použití pro vzdělávací účely.

## 🤝 Přispívání

Pokud chcete přispět k projektu:
1. Fork repozitáře
2. Vytvořte feature branch
3. Commit změny
4. Push do branch
5. Otevřete Pull Request

---

**Užijte si počítání karet! 🃏✨** 