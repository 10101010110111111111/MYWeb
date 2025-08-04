# Texas Hold'em Poker Equity Calculator

## Popis systému

Tento systém implementuje kalkulačku pravděpodobnosti výhry (equity) pro Texas Hold'em poker pro 2 až 9 hráčů. Každý hráč má přesně dvě karty (hole cards) a část společných karet (flop, turn, river) může být zadaná nebo nezadaná.

## Funkce

### Základní funkce
- **2-9 hráčů**: Podporuje až 9 hráčů současně
- **Úplný výčet kombinací**: Počítá všechny možné kombinace boardu pro přesné výsledky
- **Společné karty**: Podporuje flop, turn a river
- **Aktivace/deaktivace hráčů**: Možnost vypnout hráče bez mazání karet

### Výpočet equity
Systém počítá:
- **Výherní šance** = (počet výher / počet simulací) × 100
- **Remízové šance** = (počet remíz / počet simulací) × 100
- **Celkové šance** = (výherní + remízové šance)

### Hand evaluation
Systém rozpoznává všechny standardní poker kombinace:
1. **High Card** (0) - Nejvyšší karta
2. **One Pair** (1) - Pár
3. **Two Pair** (2) - Dva páry
4. **Three of a Kind** (3) - Trojice
5. **Straight** (4) - Postupka
6. **Flush** (5) - Barva
7. **Full House** (6) - Full house
8. **Four of a Kind** (7) - Čtyři stejné
9. **Straight Flush** (8) - Postupka v barvě

## Použití

### 1. Nastavení hráčů
- Vyberte počet hráčů (2-9)
- Aktivujte/deaktivujte hráče pomocí přepínače
- Klikněte na kartu pro výběr hodnoty a barvy

### 2. Nastavení společných karet
- Klikněte na pozice flop, turn, river pro zadání karet
- Karty lze zadat v libovolném pořadí
- Nezadané karty se doplní náhodně během simulace

### 3. Spuštění výpočtu
- Klikněte na "Spočítat všechny kombinace"
- Sledujte progress bar během výpočtu všech možných kombinací

### 4. Výsledky
- Zobrazení procentuálních šancí pro každého hráče
- Barevné rozlišení: zelená (výhra), oranžová (remíza), červená (prohra)
- Zvýraznění favorita (více než 50% šancí na výhru)
- Zobrazení aktuální kombinace (pokud jsou zadány alespoň 3 společné karty)

## Technické detaily

### Úplný výčet kombinací
Pro výpočet equity se používá úplný výčet všech možných kombinací:
- Generování všech možných kombinací zbývajících karet pro board
- Vyhodnocení nejlepší kombinace pro každého hráče v každé kombinaci
- Porovnání kombinací a určení vítěze
- Počítání výher a remíz

### Matematické pozadí
Při 2 hráčích zbývá 48 karet a možných kombinací boardu je:
```
C(48,5) = 2,118,760
```

Při 6 hráčích zbývá 40 karet:
```
C(40,5) = 658,008
```

Proto se používá úplný výčet všech možných kombinací pro přesné výsledky.

### Hand evaluation algoritmus
1. **Flush detection**: Počítání karet stejné barvy
2. **Straight detection**: Hledání 5 po sobě jdoucích hodnot
3. **Value counting**: Počítání frekvencí hodnot
4. **Rank determination**: Určení nejvyšší kombinace

### Kicker comparison
Při stejných kombinacích se porovnávají kickery:
- Porovnání nejvyšších karet
- Při rovnosti se pokračuje na nižší karty
- Při úplné rovnosti je remíza

## Soubory

- `index.html` - Hlavní HTML struktura
- `script.js` - JavaScript logika aplikace
- `styles.css` - CSS styly a layout
- `README.md` - Tato dokumentace

## Spuštění

1. Otevřete `index.html` v moderním webovém prohlížeči
2. Nebo spusťte lokální server:
   ```bash
   python -m http.server 8000
   ```
   A pak navštivte `http://localhost:8000`

## Omezení

- Zjednodušené porovnání kickerů (pouze hole cards)
- Základní hand evaluation (pro produkční použití by bylo vhodné použít specializovanou knihovnu)
- Maximálně 9 hráčů (omezení UI)

## Budoucí vylepšení

- Pokročilé porovnání kickerů
- Export výsledků
- Historie simulací
- Rychlejší hand evaluation algoritmus
- Podpora pro více variant pokeru 