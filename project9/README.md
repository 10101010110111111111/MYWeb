# Poker Calculator - Kompletní Dokumentace

## 📋 Přehled Aplikace

Poker Calculator je pokročilá JavaScript aplikace pro výpočet přesných pravděpodobností v Texas Hold'em pokeru. Aplikace používá kompletní enumeraci všech možných kombinací karet pro 100% přesné výsledky.

### 🎯 Klíčové Funkce
- **Kompletní enumerace** všech možných kombinací
- **Paralelní zpracování** pomocí Web Workers
- **Optimalizované algoritmy** s cachováním
- **Přesné poker pravidla** podle oficiálních standardů
- **Real-time progress tracking**

---

## 🃏 Poker Pravidla - Texas Hold'em

### Základní Pravidla
1. **Každý hráč dostane 2 karty** (hole cards)
2. **5 společných karet** se rozdá postupně (flop, turn, river)
3. **Nejlepší 5-kartová kombinace** z 7 dostupných karet vyhrává

### Pořadí Rukou (od nejvyšší po nejnižší)

#### 1. **Royal Flush** (9 bodů)
- **Definice**: A-K-Q-J-10 stejné barvy
- **Příklad**: ♠A ♠K ♠Q ♠J ♠10
- **Algoritmus**: `isRoyalFlush()` - kontroluje straight flush s nejvyššími kartami

#### 2. **Straight Flush** (8 bodů)
- **Definice**: 5 po sobě jdoucích karet stejné barvy
- **Příklad**: ♥7 ♥6 ♥5 ♥4 ♥3
- **Algoritmus**: `checkFlush()` + `checkStraight()` + `getStraightHigh()`

#### 3. **Four of a Kind** (7 bodů)
- **Definice**: 4 karty stejné hodnoty + 1 kicker
- **Příklad**: ♠A ♥A ♦A ♣A ♠K
- **Algoritmus**: `hasFourOfAKind()` + `getFourOfAKindValue()`

#### 4. **Full House** (6 bodů)
- **Definice**: 3 karty stejné hodnoty + 2 karty stejné hodnoty
- **Příklad**: ♠A ♥A ♦A ♠K ♥K
- **Algoritmus**: `hasFullHouse()` + `getThreeOfAKindValues()` + `getPairValues()`

#### 5. **Flush** (5 bodů)
- **Definice**: 5 karet stejné barvy (ne po sobě jdoucích)
- **Příklad**: ♠A ♠K ♠7 ♠4 ♠2
- **Algoritmus**: `checkFlush()` + `getFlushValues()`

#### 6. **Straight** (4 body)
- **Definice**: 5 po sobě jdoucích karet (různé barvy)
- **Speciální případ**: A-2-3-4-5 (wheel) - A se počítá jako 1
- **Příklad**: ♠5 ♥4 ♦3 ♣2 ♠A (wheel)
- **Algoritmus**: `checkStraight()` + `getStraightHigh()`

#### 7. **Three of a Kind** (3 body)
- **Definice**: 3 karty stejné hodnoty + 2 kickery
- **Příklad**: ♠A ♥A ♦A ♠K ♥Q
- **Algoritmus**: `hasThreeOfAKind()` + `getThreeOfAKindValue()`

#### 8. **Two Pair** (2 body)
- **Definice**: 2 páry + 1 kicker
- **Příklad**: ♠A ♥A ♠K ♥K ♠Q
- **Algoritmus**: `hasTwoPair()` + `getTwoPairValues()`

#### 9. **One Pair** (1 bod)
- **Definice**: 1 pár + 3 kickery
- **Příklad**: ♠A ♥A ♠K ♥Q ♠J
- **Algoritmus**: `hasOnePair()` + `getPairValue()`

#### 10. **High Card** (0 bodů)
- **Definice**: Žádná kombinace, nejvyšší karta rozhoduje
- **Příklad**: ♠A ♥K ♦Q ♣J ♠9
- **Algoritmus**: Seřazení karet podle hodnoty

---

## 🔧 Detailní Popis Metod

### Konstruktor a Inicializace

#### `constructor()`
```javascript
constructor() {
    this.players = [];
    this.communityCards = [];
    this.selectedCards = new Set();
    this.currentPlayerCount = 2;
    this.cardPickerTarget = null;
    
    // Card values and suits
    this.cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.cardSuits = ['hearts', 'diamonds', 'clubs', 'spades'];
    
    // Performance optimizations
    this.handCache = new Map();
    this.combinationCache = new Map();
    this.cardValueMap = new Map();
    this.maxCacheSize = 10000;
}
```
**Účel**: Inicializuje základní proměnné a optimalizace
**Klíčové komponenty**:
- Pole hráčů a společných karet
- Set pro sledování použitých karet
- Cache pro optimalizaci výkonu
- Pre-computed mapy pro rychlý přístup

#### `init()`
**Účel**: Spouští inicializaci aplikace
**Akce**: Nastavuje event listeners, generuje hráče, aktualizuje UI

### UI a Event Handling

#### `setupEventListeners()`
**Účel**: Nastavuje všechny event listeners s error handling
**Funkce**:
- Player count change s validací
- Action buttons (calculate, reset, random)
- Community card buttons
- Card picker buttons

#### `generatePlayers()`
**Účel**: Vytváří pole hráčů podle aktuálního počtu
**Struktura hráče**:
```javascript
{
    id: number,
    name: string,
    active: boolean,
    cards: [card1, card2]
}
```

#### `updateUI()`
**Účel**: Aktualizuje celé uživatelské rozhraní
**Akce**: Renderuje hráče, community karty, progress bar

### Renderování

#### `renderPlayers()`
**Účel**: Vykresluje všechny hráče s jejich kartami
**Funkce**:
- Zobrazuje pozice (UTG, BB, SB, atd.)
- Renderuje hole cards
- Zobrazuje aktivní/neaktivní stav
- Přidává click handlers pro výběr karet

#### `renderCard(card)`
**Účel**: Vykresluje jednotlivou kartu
**Funkce**:
- Zobrazuje hodnotu a barvu
- Používá správné symboly (♥, ♦, ♣, ♠)
- Aplikuje barvy (červená/černá)
- Zobrazuje placeholder pro prázdné karty

#### `renderCommunityCards()`
**Účel**: Vykresluje společné karty (flop, turn, river)
**Funkce**:
- Zobrazuje 5 pozic pro community karty
- Renderuje již nastavené karty
- Zobrazuje placeholder pro prázdné pozice

### Správa Karet

#### `openCardPicker(target)`
**Účel**: Otevře výběr karet pro danou pozici
**Parametry**: `target` - cílová pozice (player.card1, player.card2, community)
**Akce**: Zobrazí modal s výběrem karet

#### `selectCard(value, suit)`
**Účel**: Nastaví vybranou kartu na cílovou pozici
**Parametry**: `value` - hodnota karty, `suit` - barva
**Validace**: Kontroluje duplicity karet

#### `setCard(value, suit)`
**Účel**: Interní metoda pro nastavení karty
**Funkce**:
- Přidá kartu do selectedCards Set
- Aktualizuje UI
- Zavře card picker

### Generování Náhodných Karet

#### `generateRandomCards()`
**Účel**: Generuje náhodné karty pro všechny hráče
**Algoritmus**:
1. Vymaže všechny existující karty
2. Pro každého hráče vygeneruje 2 unikátní karty
3. Aktualizuje UI

#### `getRandomCard()`
**Účel**: Vrací náhodnou kartu, která ještě nebyla použita
**Algoritmus**:
- Generuje náhodnou hodnotu a barvu
- Kontroluje proti selectedCards Set
- Opakuje, dokud nenajde unikátní kartu

#### `generateRandomFlop()`, `generateRandomTurn()`, `generateRandomRiver()`
**Účel**: Generuje náhodné community karty pro danou fázi
**Funkce**: Přidává 3, 1, nebo 1 kartu podle fáze hry

### Výpočet Pravděpodobností

#### `calculateProbabilities()`
**Účel**: Hlavní metoda pro výpočet pravděpodobností
**Algoritmus**:
1. Validuje aktivní hráče s kartami
2. Zobrazí loading screen
3. Spustí kompletní enumeraci
4. Zobrazí výsledky

#### `runCompleteEnumeration(activePlayers)`
**Účel**: Spouští kompletní enumeraci všech možných kombinací
**Algoritmus**:
1. Vytvoří výsledkové objekty pro každého hráče
2. Vypočítá aktuální sílu ruky (pokud jsou community karty)
3. Rozhodne mezi Web Workers a single-threaded zpracováním
4. Vrátí výsledky

#### `runWithWorkers(activePlayers, deck, needed, results)`
**Účel**: Paralelní zpracování pomocí Web Workers
**Algoritmus**:
1. Určí počet workerů podle CPU jader
2. Rozdělí kombinace mezi workery
3. Počká na dokončení všech workerů
4. Sloučí výsledky

#### `runSingleThreaded(activePlayers, deck, needed, results)`
**Účel**: Fallback single-threaded zpracování
**Algoritmus**:
1. Generuje všechny kombinace
2. Pro každou kombinaci vyhodnotí vítěze
3. Aktualizuje progress bar
4. Umožňuje UI updates

### Generování Kombinací

#### `generateCombinations(deck, r)`
**Účel**: Generuje všechny kombinace r karet z balíčku
**Algoritmus**: Iterativní přístup s cachováním
**Optimalizace**:
- Cache pro opakované kombinace
- Memory management s limitem velikosti
- Efektivní generování pomocí indexů

#### `generateFiveCardCombinations(cards, r)`
**Účel**: Generuje kombinace pro 5-kartové ruce z 7 karet
**Algoritmus**: Backtracking pro nalezení nejlepší 5-kartové kombinace

### Vyhodnocení Rukou

#### `evaluateHand(cards)`
**Účel**: Vyhodnotí nejlepší 5-kartovou kombinaci z 7 karet
**Algoritmus**:
1. Vytvoří cache key ze seřazených karet
2. Zkontroluje cache pro existující výsledek
3. Vyhodnotí všechny možné 5-kartové kombinace
4. Vrátí nejlepší kombinaci podle poker pravidel

#### `evaluateWinner(activePlayers, completedBoard)`
**Účel**: Určí vítěze mezi hráči pro daný board
**Algoritmus**:
1. Vyhodnotí ruce všech hráčů
2. Najde nejlepší ruce
3. Porovná kickery při remíze

### Poker Algoritmy

#### `isRoyalFlush(values, suits)`
**Účel**: Kontroluje, zda je to Royal Flush
**Algoritmus**:
1. Kontroluje, zda je to straight flush
2. Kontroluje, zda obsahuje A-K-Q-J-10
3. Kontroluje, zda jsou všechny karty stejné barvy

#### `checkFlush(suits)`
**Účel**: Kontroluje, zda je to flush
**Algoritmus**: Počítá karty každé barvy, hledá 5+ karet stejné barvy

#### `checkStraight(values)`
**Účel**: Kontroluje, zda je to straight
**Algoritmus**:
1. Seřadí unikátní hodnoty
2. Hledá 5 po sobě jdoucích karet
3. Speciální kontrola pro wheel (A-2-3-4-5)
4. Speciální kontrola pro high straight (A-K-Q-J-10)

#### `hasFourOfAKind(valueCounts)`
**Účel**: Kontroluje, zda je to four of a kind
**Algoritmus**: Hledá hodnotu s počtem 4

#### `hasFullHouse(valueCounts)`
**Účel**: Kontroluje, zda je to full house
**Algoritmus**: Kontroluje přítomnost trojice a páru

#### `hasThreeOfAKind(valueCounts)`
**Účel**: Kontroluje, zda je to three of a kind
**Algoritmus**: Hledá hodnotu s počtem 3

#### `hasTwoPair(valueCounts)`
**Účel**: Kontroluje, zda je to two pair
**Algoritmus**: Počítá páry, hledá 2+

#### `hasOnePair(valueCounts)`
**Účel**: Kontroluje, zda je to one pair
**Algoritmus**: Hledá hodnotu s počtem 2

### Pomocné Funkce pro Kickers

#### `getStraightHigh(values)`
**Účel**: Vrací nejvyšší kartu ve straight
**Algoritmus**:
1. Najde straight v hodnotách
2. Vrací nejvyšší kartu
3. Speciální logika pro wheel (vrací 5)

#### `getFourOfAKindValue(valueCounts)`
**Účel**: Vrací hodnotu four of a kind
**Algoritmus**: Najde hodnotu s počtem 4

#### `getThreeOfAKindValue(valueCounts)`
**Účel**: Vrací hodnotu three of a kind
**Algoritmus**: Najde hodnotu s počtem 3

#### `getThreeOfAKindValues(valueCounts)`
**Účel**: Vrací všechny hodnoty three of a kind (pro full house)
**Algoritmus**: Najde všechny hodnoty s počtem 3, seřadí sestupně

#### `getPairValue(valueCounts, excludeValue)`
**Účel**: Vrací nejvyšší hodnotu páru
**Parametry**: `excludeValue` - hodnota k vyloučení (pro full house)
**Algoritmus**: Najde nejvyšší hodnotu s počtem 2

#### `getPairValues(valueCounts, excludeValue)`
**Účel**: Vrací všechny hodnoty párů
**Algoritmus**: Najde všechny hodnoty s počtem 2, seřadí sestupně

#### `getTwoPairValues(valueCounts)`
**Účel**: Vrací hodnoty dvou párů
**Algoritmus**: Najde 2 nejvyšší hodnoty s počtem 2

#### `getFlushValues(values, suits)`
**Účel**: Vrací nejvyšších 5 karet stejné barvy
**Algoritmus**:
1. Najde barvu s 5+ kartami
2. Seřadí karty této barvy sestupně
3. Vrátí nejvyšších 5

### Porovnání Rukou

#### `findWinner(playerHands)`
**Účel**: Najde vítěze mezi hráči
**Algoritmus**:
1. Najde nejvyšší rank mezi všemi rukami
2. Shromáždí všechny ruce s tímto rankem
3. Pokud je jen jedna, vrátí vítěze
4. Jinak porovná kickery

#### `compareHands(hands)`
**Účel**: Porovná ruce se stejným rankem pomocí kickerů
**Algoritmus**:
1. Porovná kickery v pořadí důležitosti
2. Vrátí hráče s nejvyšším kickerem
3. Při remíze pokračuje na další kicker
4. Při úplné remíze vrátí 'tie'

#### `isBetterHand(hand1, hand2)`
**Účel**: Porovná dvě ruce
**Algoritmus**:
1. Porovná ranky
2. Při stejných rankech porovná kickery
3. Vrátí true, pokud hand1 je lepší

### Utility Funkce

#### `getCardValue(value)`
**Účel**: Převede hodnotu karty na číslo
**Mapování**: 2=2, 3=3, ..., 10=10, J=11, Q=12, K=13, A=14

#### `getHandDisplayName(handName)`
**Účel**: Převede interní název ruky na zobrazovací formát
**Mapování**: 'Straight Flush' → 'Straight flush', atd.

#### `calculateTotalCombinations()`
**Účel**: Vypočítá celkový počet kombinací pro progress tracking
**Vzorec**: C(deck.length, needed_cards)

#### `calculateMaxPlayers()`
**Účel**: Vypočítá maximální možný počet hráčů
**Vzorec**: floor((available_cards - community_cards_needed) / 2)

### UI Funkce

#### `showLoading()`
**Účel**: Zobrazí loading screen
**Akce**: Zobrazí progress bar a zakáže tlačítka

#### `hideLoading()`
**Účel**: Skryje loading screen
**Akce**: Skryje progress bar a povolí tlačítka

#### `displayResults(results, calculationTime)`
**Účel**: Zobrazí výsledky výpočtu
**Funkce**:
- Zobrazí pravděpodobnosti výhry pro každého hráče
- Zobrazí statistiky rukou
- Zobrazí čas výpočtu
- Zobrazí aktuální ruce (pokud jsou community karty)

---

## 🚀 Optimalizace Výkonu

### Cachování
- **Hand Cache**: Ukládá výsledky vyhodnocení rukou
- **Combination Cache**: Ukládá generované kombinace
- **Memory Management**: Automatické čištění cache při překročení limitu

### Web Workers
- **Paralelní zpracování**: Využívá všechna CPU jádra
- **Fallback**: Automatický přechod na single-threaded při chybě
- **Progress Tracking**: Real-time zobrazení postupu

### Algoritmické Optimalizace
- **Pre-computed hodnoty**: Mapy pro rychlý přístup
- **Efektivní generování kombinací**: Iterativní místo rekurzivního
- **Optimalizované vyhodnocení**: Přímé vyhodnocení z 7 karet

---

## 📊 Očekávaný Výkon

### Rychlost
- **2 hráči, 1.7M kombinací**: 5-30 sekund
- **4 hráči, 1.1M kombinací**: 3-20 sekund
- **6 hráčů, 0.7M kombinací**: 2-15 sekund

### Přesnost
- **100% přesné výsledky** díky kompletní enumeraci
- **Správné poker pravidla** podle oficiálních standardů
- **Správné kickery** pro všechny typy rukou

---

## 🐛 Error Handling

### DOM Elementy
- Kontrola existence elementů před přidáním event listeners
- Graceful fallback při chybějících elementech

### Web Workers
- Try-catch bloky pro vytváření workerů
- Fallback na single-threaded zpracování
- Timeout handling (30 sekund)

### Cache Management
- Automatické čištění při překročení limitu
- Memory leak prevence

---

## 🔧 Technické Detaily

### Datové Struktury
- **Map**: Pro cache a rychlé vyhledávání
- **Set**: Pro sledování použitých karet
- **Array**: Pro kombinace a výsledky

### Asynchronní Zpracování
- **async/await**: Pro neblokující UI
- **Promise.all**: Pro paralelní zpracování
- **setTimeout**: Pro UI updates

### Memory Management
- **Cache size limits**: Prevenci memory leaks
- **Automatic cleanup**: Při resetu a překročení limitů
- **Efficient data structures**: Minimalizace paměťové náročnosti 