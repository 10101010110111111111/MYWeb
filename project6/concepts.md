# 🚀 Detailní Koncepty pro Rozšíření Projektu 6

Tento dokument slouží jako technická specifikace a roadmapa pro budoucí vývoj pokročilých funkcí aplikace.

---

## 1. 🧠 ML-Ready Export (Příprava pro AI)
**Cíl:** Transformovat surová krypto data do formátu optimalizovaného pro trénování modelů hlubokého učení (LSTM, Transformer, GRU).

### Technické detaily:
- **Normalizační Engine:**
    - **Min-Max Scaling:** Přepočet všech cen v rámci souboru do rozsahu `[0, 1]`. Klíčové pro stabilitu váhy neuronů.
    - **Z-Score Normalization:** Centrování dat kolem nuly s jednotkovou směrodatnou odchylkou. Ideální pro data s extrémními výkyvy (volatilitou).
    - **Log Returns:** Místo absolutních cen exportovat procentuální změny v logaritmickém měřítku.
- **Feature Engineering (Příznaky):**
    - Automatický výpočet **HL/2** (střední cena), **OC/2** (střed těla svíčky).
    - Přidání sloupců pro **Volatility** (ATR - Average True Range).
    - **Time Encoding:** Převod unixového času na cyklické funkce `sin(hour)` a `cos(hour)`, aby model chápal denní cykly.
- **Struktura okna (Sliding Window):**
    - Uživatel definuje `Input_Length` (např. 60 svíček) a `Label_Length` (např. 5 svíček pro predikci).
    - Export vytvoří 3D tensor/matici připravenou pro knihovny jako TensorFlow nebo PyTorch.

---

## 2. 📊 Cross-Timeframe Confluence (Soutok grafů)
**Cíl:** Synchronizace dat napříč různými časovými měřítky pro identifikaci silných obchodních signálů.

### Technické detaily:
- **Master-Slave Synchronizace:**
    - Implementace `Event Bus` v JavaScriptu. Pohyb kurzoru (crosshair) v 1m grafu okamžitě vykreslí odpovídající vertikální linku v 1h a 1d grafu.
- **Confluence Scoring System:**
    - Algoritmus vypočítá "index shody". Příklad: Pokud 1h trend je `BULLISH` a 15m RSI je `OVERSOLD`, skóre konfluence je vysoké (např. 85%).
- **Visual Overlay:**
    - **Trend Clouds:** Stínování pozadí 1m grafu barvou odpovídající trendu z vyššího timeframe (např. zelené pozadí, pokud je 4H svíčka rostoucí).
    - **Multi-Level Support/Resistance:** Automatické vykreslení hladin supportu z 1D grafu přímo do 5m grafu.

---

## 5. 📉 Backtesting Sandbox (Testování strategií)
**Cíl:** Simulace obchodování na milionech historických svíček s realistickými parametry trhu.

### Technické detaily:
- **Execution Engine:**
    - Smyčka procházející polem svíček (event-driven simulation).
    - **Slippage Model:** Simulace skluzu ceny při vstupu (přičtení 0.01 - 0.05% k ceně).
    - **Compound Interest:** Možnost simulovat reinvestování zisků nebo fixní velikost pozice.
- **Strategy Builder:**
    - Modulární systém, kde uživatel kombinuje podmínky: `(EMA20 crossover EMA50) && (RSI < 30)`.
- **Reporting & Statisika:**
    - **Equity Curve:** Graf vývoje kapitálu v čase.
    - **Drawdown Analysis:** Výpočet největšího poklesu od vrcholu (klíčové pro řízení rizika).
    - **Sharpe Ratio:** Poměr výnosu k riziku (volatilitě).

---

## 10. 🖥️ Desktop CLI Tool (Wrapper)
**Cíl:** Automatizace správy dat bez nutnosti spouštět grafické rozhraní prohlížeče.

### Technické detaily:
- **Architecture:**
    - Node.js aplikace využívající `axios` pro komunikaci s Binance API a `fs-extra` pro robustní práci se soubory.
- **Command Set:**
    - `fetch --pair BTCUSDT --tf 1m --limit 1M`: Stáhne milion svíček.
    - `analyze --file data.csv`: Vypíše statistiku mezer a anomálií do terminálu.
    - `sync --auto`: Spustí cyklickou aktualizaci všech lokálních souborů v definovaných intervalech.
- **Integrovatelnost:**
    - Výstupy v JSON formátu pro snadné propojení s jinými skripty (např. automatické spuštění ML trénování po stažení nových dat).
    - Podpora pro `.env` soubory (nastavení API klíčů pro budoucí integraci s privátními daty).
