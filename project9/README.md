# Poker Calculator - Detailní Popis Metod

## Přehled Aplikace
Poker Calculator je JavaScript aplikace pro výpočet pravděpodobností v Texas Hold'em pokeru. Používá kompletní enumeraci všech možných kombinací karet pro přesný výpočet šancí na výhru.

## Hlavní Třída: PokerCalculator

### Konstruktor (constructor)
```javascript
constructor()
```
**Účel:** Inicializuje základní proměnné a nastavení aplikace
**Proměnné:**
- `players[]` - pole hráčů s jejich kartami
- `communityCards[]` - společné karty na stole
- `selectedCards` - Set již použitých karet
- `currentPlayerCount` - aktuální počet hráčů
- `cardPickerTarget` - cíl pro výběr karty
- `cardValues[]` - hodnoty karet (2-A)
- `cardSuits[]` - barvy karet (hearts, diamonds, clubs, spades)
- `suitSymbols{}` - symboly pro barvy (♥, ♦, ♣, ♠)
- `suitColors{}` - barvy pro zobrazení (red/black)

### Inicializace (init)
```javascript
init()
```
**Účel:** Spustí aplikaci
**Akce:**
1. Nastaví event listenery
2. Vygeneruje hráče
3. Aktualizuje UI

### Nastavení Event Listenerů (setupEventListeners)
```javascript
setupEventListeners()
```
**Účel:** Připojí všechny event listenery k UI prvkům
**Listenery:**
- Změna počtu hráčů
- Tlačítka pro výpočet, reset, náhodné karty
- Tlačítka pro náhodný flop/turn/river
- Tlačítka pro výběr karet
- Kliknutí na sloty karet

### Generování Hráčů (generatePlayers)
```javascript
generatePlayers()
```
**Účel:** Vytvoří pole hráčů podle aktuálního počtu
**Struktura hráče:**
```javascript
{
    id: number,
    name: string,
    active: boolean,
    cards: [card1, card2]
}
```

### Aktualizace UI (updateUI)
```javascript
updateUI()
```
**Účel:** Překreslí celé uživatelské rozhraní
**Volá:** `renderPlayers()` a `renderCommunityCards()`

### Renderování Hráčů (renderPlayers)
```javascript
renderPlayers()
```
**Účel:** Vykreslí všechny hráče s jejich kartami
**Funkce:**
- Vytvoří HTML pro každého hráče
- Přidá toggle pro aktivaci/deaktivaci
- Přidá sloty pro karty s click listenery
- Zobrazí aktivní/neaktivní stav

### Renderování Karty (renderCard)
```javascript
renderCard(card)
```
**Účel:** Vytvoří HTML pro zobrazení karty
**Parametry:** `card` - objekt karty {value, suit}
**Výstup:** HTML string s kartou nebo placeholder

### Renderování Společných Karet (renderCommunityCards)
```javascript
renderCommunityCards()
```
**Účel:** Vykreslí společné karty na stole (flop, turn, river)
**Funkce:**
- Najde všechny sloty pro společné karty
- Vyplní je kartami nebo placeholdery
- Přidá click listenery pro výběr karet

### Přepnutí Hráče (togglePlayer)
```javascript
togglePlayer(playerId)
```
**Účel:** Aktivuje/deaktivuje hráče
**Parametry:** `playerId` - ID hráče
**Akce:** Změní `active` stav hráče a překreslí UI

### Otevření Výběru Karet (openCardPicker)
```javascript
openCardPicker(target)
```
**Účel:** Otevře výběr karet pro daný slot
**Parametry:** `target` - DOM element slotu karty
**Akce:** Nastaví `cardPickerTarget` a resetuje výběry

### Zavření Výběru Karet (closeCardPicker)
```javascript
closeCardPicker()
```
**Účel:** Zavře výběr karet
**Akce:** Nastaví `cardPickerTarget` na null

### Výběr Karty (selectCard)
```javascript
selectCard(value, suit)
```
**Účel:** Vybere kartu a aplikuje ji na slot
**Parametry:** `value` - hodnota karty, `suit` - barva karty
**Akce:**
1. Odstraní všechny výběry
2. Přidá výběr na kliknutou kartu
3. Zavolá `setCard()`

### Nastavení Karty (setCard)
```javascript
setCard(value, suit)
```
**Účel:** Nastaví kartu na konkrétní slot
**Parametry:** `value` - hodnota karty, `suit` - barva karty
**Funkce:**
- Kontroluje, zda karta není již použita
- Odstraní starou kartu ze `selectedCards`
- Nastaví novou kartu na slot
- Přidá kartu do `selectedCards`
- Překreslí UI

### Generování Náhodných Karet (generateRandomCards)
```javascript
generateRandomCards()
```
**Účel:** Vygeneruje náhodné karty pro všechny hráče
**Akce:**
1. Resetuje vše
2. Pro každého hráče vygeneruje 2 náhodné karty
3. Přidá karty do `selectedCards`
4. Aktualizuje UI

### Získání Náhodné Karty (getRandomCard)
```javascript
getRandomCard()
```
**Účel:** Vygeneruje náhodnou nepoužitou kartu
**Výstup:** Objekt karty {value, suit}
**Logika:** Generuje karty dokud nenajde nepoužitou

### Generování Náhodného Flopu (generateRandomFlop)
```javascript
generateRandomFlop()
```
**Účel:** Vygeneruje náhodné 3 karty pro flop
**Akce:**
1. Odstraní existující flop karty
2. Vygeneruje 3 nové náhodné karty
3. Nastaví pozice flop1, flop2, flop3

### Generování Náhodného Turnu (generateRandomTurn)
```javascript
generateRandomTurn()
```
**Účel:** Vygeneruje náhodnou kartu pro turn
**Akce:**
1. Odstraní existující turn kartu
2. Vygeneruje novou náhodnou kartu
3. Nastaví pozici turn

### Generování Náhodného Riveru (generateRandomRiver)
```javascript
generateRandomRiver()
```
**Účel:** Vygeneruje náhodnou kartu pro river
**Akce:**
1. Odstraní existující river kartu
2. Vygeneruje novou náhodnou kartu
3. Nastaví pozici river

### Vyčištění Stolu (clearBoard)
```javascript
clearBoard()
```
**Účel:** Odstraní všechny společné karty
**Akce:**
1. Odstraní všechny karty ze `selectedCards`
2. Vyčistí `communityCards`
3. Aktualizuje UI

### Reset Všeho (resetAll)
```javascript
resetAll()
```
**Účel:** Resetuje celou aplikaci
**Akce:**
1. Vyčistí karty všech hráčů
2. Vyčistí společné karty
3. Vyčistí `selectedCards`
4. Aktualizuje UI

### Výpočet Pravděpodobností (calculateProbabilities)
```javascript
async calculateProbabilities()
```
**Účel:** Hlavní metoda pro výpočet šancí na výhru
**Funkce:**
1. Kontroluje, zda jsou alespoň 2 aktivní hráči s kartami
2. Zobrazí loading
3. Spustí kompletní enumeraci
4. Zobrazí výsledky

### Kompletní Enumerace (runCompleteEnumeration)
```javascript
async runCompleteEnumeration(activePlayers)
```
**Účel:** Provede kompletní výpočet všech možných kombinací
**Parametry:** `activePlayers` - pole aktivních hráčů
**Logika:**
1. Vytvoří výsledky pro každého hráče
2. Pokud jsou všechny karty na stole, vyhodnotí jednou
3. Jinak generuje všechny kombinace zbývajících karet
4. Pro každou kombinaci vyhodnotí vítěze
5. Aktualizuje progress bar

### Generování Kombinací (generateCombinations)
```javascript
generateCombinations(deck, r)
```
**Účel:** Generuje všechny kombinace karet délky r
**Parametry:** `deck` - balíček karet, `r` - délka kombinace
**Algoritmus:** Backtracking pro generování kombinací

### Vyhodnocení Vítěze (evaluateWinner)
```javascript
evaluateWinner(activePlayers, completedBoard)
```
**Účel:** Najde vítěze mezi hráči
**Parametry:** `activePlayers` - hráči, `completedBoard` - kompletní stůl
**Výstup:** Index vítěze nebo 'tie'

### Vytvoření Balíčku (createDeck)
```javascript
createDeck()
```
**Účel:** Vytvoří balíček nepoužitých karet
**Výstup:** Pole karet, které nejsou v `selectedCards`

### Vyhodnocení Ruky (evaluateHand)
```javascript
evaluateHand(cards)
```
**Účel:** Vyhodnotí nejlepší možnou 5-kartovou kombinaci ze 7 karet
**Parametry:** `cards` - pole 7 karet
**Algoritmus:**
1. Generuje všechny 5-kartové kombinace
2. Pro každou kombinaci určí typ ruky
3. Vrátí nejlepší kombinaci

### Kontrola Flush (checkFlush)
```javascript
checkFlush(suits)
```
**Účel:** Kontroluje, zda je flush (5 karet stejné barvy)
**Parametry:** `suits` - pole barev karet
**Výstup:** boolean

### Kontrola Straight (checkStraight)
```javascript
checkStraight(values)
```
**Účel:** Kontroluje, zda je straight (5 po sobě jdoucích hodnot)
**Parametry:** `values` - pole hodnot karet
**Logika:** Kontroluje běžný straight i wheel (A-2-3-4-5)

### Kontrola Four of a Kind (hasFourOfAKind)
```javascript
hasFourOfAKind(valueCounts)
```
**Účel:** Kontroluje, zda jsou 4 karty stejné hodnoty
**Parametry:** `valueCounts` - objekt s počty hodnot
**Výstup:** boolean

### Kontrola Full House (hasFullHouse)
```javascript
hasFullHouse(valueCounts)
```
**Účel:** Kontroluje, zda je full house (3+2 stejné hodnoty)
**Parametry:** `valueCounts` - objekt s počty hodnot
**Výstup:** boolean

### Kontrola Three of a Kind (hasThreeOfAKind)
```javascript
hasThreeOfAKind(valueCounts)
```
**Účel:** Kontroluje, zda jsou 3 karty stejné hodnoty
**Parametry:** `valueCounts` - objekt s počty hodnot
**Výstup:** boolean

### Kontrola Two Pair (hasTwoPair)
```javascript
hasTwoPair(valueCounts)
```
**Účel:** Kontroluje, zda jsou 2 páry
**Parametry:** `valueCounts` - objekt s počty hodnot
**Výstup:** boolean

### Kontrola One Pair (hasOnePair)
```javascript
hasOnePair(valueCounts)
```
**Účel:** Kontroluje, zda je 1 pár
**Parametry:** `valueCounts` - objekt s počty hodnot
**Výstup:** boolean

### Získání Hodnoty Karty (getCardValue)
```javascript
getCardValue(value)
```
**Účel:** Převede hodnotu karty na číslo
**Parametry:** `value` - hodnota karty (string)
**Mapování:** 2=2, 3=3, ..., 10=10, J=11, Q=12, K=13, A=14

### Kontrola Royal Flush (isRoyalFlush)
```javascript
isRoyalFlush(values, suits)
```
**Účel:** Kontroluje, zda je royal flush (10-J-Q-K-A stejné barvy)
**Parametry:** `values` - hodnoty, `suits` - barvy
**Výstup:** boolean

### Získání Straight High (getStraightHigh)
```javascript
getStraightHigh(values)
```
**Účel:** Najde nejvyšší kartu ve straight
**Parametry:** `values` - hodnoty karet
**Logika:** Zohledňuje wheel (A-2-3-4-5) a běžný straight

### Získání Four of a Kind Value (getFourOfAKindValue)
```javascript
getFourOfAKindValue(valueCounts)
```
**Účel:** Najde hodnotu čtyř karet
**Parametry:** `valueCounts` - objekt s počty hodnot
**Výstup:** hodnota čtyř karet

### Získání Three of a Kind Value (getThreeOfAKindValue)
```javascript
getThreeOfAKindValue(valueCounts)
```
**Účel:** Najde hodnotu tří karet
**Parametry:** `valueCounts` - objekt s počty hodnot
**Výstup:** hodnota tří karet

### Získání Pair Value (getPairValue)
```javascript
getPairValue(valueCounts, excludeValue)
```
**Účel:** Najde hodnotu páru
**Parametry:** `valueCounts` - objekt s počty hodnot, `excludeValue` - hodnota k vyloučení
**Výstup:** hodnota páru

### Získání Two Pair Values (getTwoPairValues)
```javascript
getTwoPairValues(valueCounts)
```
**Účel:** Najde hodnoty dvou párů
**Parametry:** `valueCounts` - objekt s počty hodnot
**Výstup:** pole hodnot párů (seřazeno sestupně)

### Získání Flush Values (getFlushValues)
```javascript
getFlushValues(values, suits)
```
**Účel:** Najde hodnoty karet ve flush
**Parametry:** `values` - hodnoty karet, `suits` - barvy karet
**Výstup:** pole 5 nejvyšších hodnot flush barvy

### Porovnání Rukou (isBetterHand)
```javascript
isBetterHand(hand1, hand2)
```
**Účel:** Porovná dvě ruce podle poker pravidel
**Parametry:** `hand1`, `hand2` - objekty rukou
**Logika:** Porovná rank, pak kickers
**Výstup:** boolean (hand1 > hand2)

### Nalezení Vítěze (findWinner)
```javascript
findWinner(playerHands)
```
**Účel:** Najde vítěze mezi hráči
**Parametry:** `playerHands` - pole objektů {player, hand}
**Výstup:** index vítěze nebo 'tie'

### Porovnání Rukou (compareHands)
```javascript
compareHands(hands)
```
**Účel:** Porovná ruce s stejným rankem podle kickerů
**Parametry:** `hands` - pole objektů {player, hand}
**Výstup:** vítězný hráč nebo 'tie'

### Získání Názvu Ruky (getHandDisplayName)
```javascript
getHandDisplayName(handName)
```
**Účel:** Převede název ruky na zobrazovací formát
**Parametry:** `handName` - název ruky
**Výstup:** zobrazovací název

### Výpočet Celkových Kombinací (calculateTotalCombinations)
```javascript
calculateTotalCombinations()
```
**Účel:** Vypočítá celkový počet možných kombinací
**Výstup:** počet kombinací C(deck.length, needed)

### Zobrazení Výsledků (displayResults)
```javascript
displayResults(results, calculationTime)
```
**Účel:** Zobrazí výsledky výpočtu
**Parametry:** `results` - výsledky, `calculationTime` - čas výpočtu
**Funkce:**
1. Aktualizuje informace o simulaci
2. Zobrazí procenta výher/remíz
3. Vytvoří tabulku s rozložením rukou
4. Zobrazí výsledky

### Zobrazení Loading (showLoading)
```javascript
showLoading()
```
**Účel:** Zobrazí loading overlay
**Akce:** Nastaví display na 'flex' pro loadingOverlay

### Skrytí Loading (hideLoading)
```javascript
hideLoading()
```
**Účel:** Skryje loading overlay
**Akce:** Nastaví display na 'none' pro loadingOverlay

## Pomocné Funkce

### Získání Názvu Pozice (getPositionName)
```javascript
getPositionName(position)
```
**Účel:** Převede pozici na zobrazovací název
**Mapování:** flop1→Flop 1, flop2→Flop 2, atd.

## Inicializace Aplikace
```javascript
document.addEventListener('DOMContentLoaded', () => {
    pokerCalculator = new PokerCalculator();
});
```
**Účel:** Vytvoří instanci aplikace po načtení DOM

## Klíčové Algoritmy

### 1. Kompletní Enumerace
- Generuje všechny možné kombinace zbývajících karet
- Pro každou kombinaci vyhodnotí vítěze
- Počítá statistiky pro každého hráče

### 2. Vyhodnocení Ruky
- Generuje všechny 5-kartové kombinace ze 7 karet
- Pro každou kombinaci určí typ ruky (flush, straight, atd.)
- Vrátí nejlepší možnou kombinaci

### 3. Porovnání Rukou
- Porovná rank rukou (royal flush > straight flush > ...)
- Při stejném ranku porovná kickers
- Zohledňuje poker pravidla pro kickery

### 4. Generování Kombinací
- Používá backtracking algoritmus
- Generuje kombinace bez opakování
- Optimalizováno pro výkon

## Výkonnostní Optimalizace

1. **Progress Bar** - aktualizuje se každých 1% kombinací
2. **Batch Processing** - zpracovává kombinace v dávkách
3. **Async/Await** - neblokuje UI během výpočtu
4. **Set pro Selected Cards** - rychlé vyhledávání použitých karet
5. **Memoizace** - ukládá výsledky vyhodnocení rukou

## Poker Pravidla Implementována

1. **Hodnocení rukou** - od Royal Flush po High Card
2. **Kickers** - správné porovnání při stejných rukách
3. **Wheel** - A-2-3-4-5 jako nejnižší straight
4. **Suit nezáleží** - kromě flush a royal flush
5. **Best 5 cards** - z 7 karet se vybere nejlepších 5 