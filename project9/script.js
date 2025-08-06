// Poker Calculator Application
// (Původní třída PokerCalculator byla odstraněna pro refaktorování.)

// --- Constants from utils.js ---
export const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const CARD_SUITS = ['s', 'c', 'h', 'd'];
export const RANK_NAMES = [
  'high card',
  'one pair',
  'two pair',
  'three of a kind',
  'straight',
  'flush',
  'full house',
  'four of a kind',
  'straight flush',
  'royal flush'
];

const NUMERICAL_VALUES = {
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14
};

const STRAIGHTS = [
  'AKQJT',
  'KQJT9',
  'QJT98',
  'JT987',
  'T9876',
  '98765',
  '87654',
  '76543',
  '65432',
  '5432A'
];

// --- Utility functions from utils.js ---
export function numericalValue (card) {
  const cardStr = Array.isArray(card) ? card[0] : card[0];
  return NUMERICAL_VALUES[cardStr] || parseInt(cardStr);
}

export function numericalSort (a, b) {
  const aStr = Array.isArray(a) ? a[0] : a[0];
  const bStr = Array.isArray(b) ? b[0] : b[0];
  return numericalValue(bStr) - numericalValue(aStr);
}

export function convertToHex (input) {
  const inputArray = Array.isArray(input) ? input : input.split('');
  return inputArray
    .map(c => numericalValue(c).toString(16))
    .join('');
}

export function parseCards (string) {
  if (!string) {
    return undefined;
  }
  return string.match(/[AKQJT2-9.][schd.]/g) || undefined;
}

export function percent (number) {
  if (number === 0) {
    return '·';
  }
  if (number > 0 && number < 0.001) {
    return '0.1%';
  }
  return `${round(number * 100)}%`;
}

export function seconds (ms) {
  if (ms >= 1000) {
    return `${round(ms / 1000)}s`;
  }
  return `${ms}ms`;
}

export function getStraight (hand) {
  const values = Array.isArray(hand) ? hand.join('') : hand;
  const suffix = values[0] === 'A' ? 'A' : ''; // Append A to capture 5432A
  for (let i = 0; i !== STRAIGHTS.length; i++) {
    if (`${values}${suffix}`.includes(STRAIGHTS[i])) {
      return convertToHex(STRAIGHTS[i]);
    }
  }
  return null;
}

export function padStart (string, length, padString = ' ') {
  if (string.length >= length) {
    return string;
  }
  return padString.repeat(length - string.length) + string;
}

export function padEnd (string, length, padString = ' ') {
  if (string.length >= length) {
    return string;
  }
  return string + padString.repeat(length - string.length);
}

function round (number, dp = 2) {
  const multiplier = dp * 10;
  return (Math.round(number * multiplier) / multiplier).toFixed(dp);
}

// --- Deck functions from deck.js ---
export function createDeck (withoutCards = []) {
  const deck = [];
  for (let i = 0; i !== CARD_VALUES.length; i++) {
    for (let j = 0; j !== CARD_SUITS.length; j++) {
      const card = CARD_VALUES[i] + CARD_SUITS[j];
      if (!withoutCards.includes(card)) {
        deck.push(card);
      }
    }
  }
  return deck;
}

export function deal (withoutCards, count) {
  const cards = [];
  while (cards.length !== count) {
    const index = Math.floor(Math.random() * FULL_DECK.length);
    const card = FULL_DECK[index];
    if (!cards.includes(card) && !withoutCards.includes(card)) {
      cards.push(card);
    }
  }
  return cards;
}

// --- Lookup data (simplified version) ---
const lookup = {
  rank: {}, // Will be populated with rank data
  flush: {} // Will be populated with flush data
};

// --- Rank functions from rank.js ---
export function rankValues (values) {
  // Ensure values is an array
  const valueArray = Array.isArray(values) ? values : values.split('');
  
  let total = 0;
  let max = 0;
  const cardMatches = {};
  for (let i = 0; i !== valueArray.length; i++) {
    cardMatches[valueArray[i]] = 0;
    for (let j = 0; j !== valueArray.length; j++) {
      if (i === j) continue; // TODO: Could this be i <= j?
      const first = valueArray[i];
      const second = valueArray[j];
      if (first === second) {
        cardMatches[first]++;
        total++;
        max = Math.max(cardMatches[first], max);
      }
    }
  }
  const matches = total / 2;
  const straight = getStraight(dedupe(valueArray).join('')); // Dedupe to match straights like AKKKQJT
  const sortedValues = valueArray.sort((a, b) => cardMatches[b] - cardMatches[a]);
  const kickers = convertToHex(sortedValues.join(''));

  if (max > 3) {
    return undefined;
  }
  if (max === 3) {
    return '7' + kickers.slice(0, 4) + getHighestKicker(kickers.slice(4)); // four of a kind
  }
  if (max === 2 && matches > 3) {
    return '6' + kickers.slice(0, 5); // full house
  }
  if (straight) {
    return '4' + straight; // straight
  }
  if (max === 2) {
    return '3' + kickers.slice(0, 5); // three of a kind
  }
  if (max === 1 && matches > 1) {
    return '2' + kickers.slice(0, 4) + getHighestKicker(kickers.slice(4)); // two pair
  }
  if (max === 1) {
    return '1' + kickers.slice(0, 5); // one pair
  }
  return '0' + kickers.slice(0, 5); // high card
}

export function rankHand (input) {
  const hand = input.slice(0).sort(numericalSort);
  const values = hand.map(c => c[0]);
  const suits = hand.map(c => c[1]);
  
  // Use rankValues for now since lookup data is not populated
  const rank = rankValues(values.join(''));
  const flush = getFlush(suits.sort().join(''));

  if (!rank) {
    throw Error(`Invalid hand: ${hand.join(' ')}`);
  }

  const straight = rank[0] === '4';

  if (straight && flush) {
    const flushed = hand.filter(c => c[1] === flush).map(c => c[0]);
    const kickers = getStraight(flushed.join(''));
    if (kickers) {
      // royal or straight flush
      return (kickers[0] === 'e' ? '9' : '8') + kickers;
    }
  }
  if (flush) {
    // Fix kickers for flush
    // ie the highest cards of the flush suit
    const flushCards = hand.filter(c => c[1] === flush).slice(0, 5);
    const kickers = convertToHex(flushCards.map(c => c[0]).join(''));
    return '5' + kickers; // flush
  }
  return rank;
}

export function getFlush (string) {
  const match = string.match(/(s{5}|c{5}|d{5}|h{5})/);
  return match ? match[0][0] : undefined;
}

function getHighestKicker (string) {
  return string.split('').sort().reverse()[0];
}

function dedupe (array) {
  return array.filter(function (item, index, array) {
    return array.indexOf(item) === index;
  });
}

// --- Calculate functions from calculate.js ---
export function calculateEquity (hands, board = [], iterations = 100000, exhaustive = false) {
  let results = hands.map(hand => ({
    hand,
    count: 0,
            wins: 0,
            ties: 0,
    handChances: RANK_NAMES.map(name => ({ name, count: 0 }))
  }));
  if (board.length === 5) {
    results = analyse(results, board);
  } else if (board.length >= 3) {
    const deck = createDeck(board.concat(...hands));
    for (let i = 0; i !== deck.length; i++) {
      if (board.length === 4) {
        results = analyse(results, board.concat(deck[i]));
        continue;
      }
      for (let j = 0; j !== deck.length; j++) {
        if (i >= j) continue;
        results = analyse(results, board.concat([ deck[i], deck[j] ]));
      }
    }
  } else if (exhaustive) {
    const deck = createDeck(board.concat(...hands));
    for (let a = 0; a !== deck.length; a++) {
      for (let b = 0; b !== deck.length; b++) {
        if (a <= b) continue;
        for (let c = 0; c !== deck.length; c++) {
          if (b <= c) continue;
          for (let d = 0; d !== deck.length; d++) {
            if (c <= d) continue;
            for (let e = 0; e !== deck.length; e++) {
              if (d <= e) continue;
              results = analyse(results, [deck[a], deck[b], deck[c], deck[d], deck[e]]);
            }
          }
        }
      }
    }
  } else {
    for (let i = 0; i !== iterations; i++) {
      const randomCards = deal([].concat(...hands), 5 - board.length);
      results = analyse(results, board.concat(randomCards));
    }
  }
  const maxWins = Math.max(...results.map(hand => hand.wins));
  return results.map(hand => ({
    ...hand,
    favourite: hand.wins === maxWins
  }));
}

function analyse (results, board) {
  const ranks = results.map(result => {
    if (result.hand.includes('..')) {
      const randomCards = deal(board.concat(...results.map(r => r.hand)), 4);
      const hand = result.hand.map((card, index) => {
        if (card === '..') {
          return randomCards[index];
        }
        return card;
      });
      return rankHand(hand.concat(board));
    }
    return rankHand(result.hand.concat(board));
  });
  const bestRank = ranks.slice(0).sort().reverse()[0];
  const tie = ranks.filter(rank => rank === bestRank).length > 1;
  for (let i = 0; i !== results.length; i++) {
    if (ranks[i] === bestRank) {
      if (tie) {
        results[i].ties++;
            } else {
        results[i].wins++;
      }
    }
    results[i].count++;
    results[i].handChances[parseInt(ranks[i][0])].count++;
  }
        return results;
    }
    
// --- Console functions from console.js ---
const HAND_PATTERN = /^[AKQJT2-9.][schd.][AKQJT2-9.][schd.]$/;
const CONSOLE_COLORS = {
  black: '30',
  red: '31',
  green: '32',
  yellow: '33',
  blue: '34',
  magenta: '35',
  cyan: '36',
  white: '37',
  grey: '90'
};

export function color (string, color) {
  if (!color || !CONSOLE_COLORS[color]) {
    return string;
  }
  return `\x1b[${CONSOLE_COLORS[color]}m${string}\x1b[0m`;
}

export function colorCards (cards) {
  return cards.map(colorCard).join(' ');
}

function colorCard (card) {
  if (/^.[sc]$/.test(card)) {
    return color(card, 'blue');
  }
  if (/^.[dh]$/.test(card)) {
    return color(card, 'red');
  }
  if (card === '..') {
    return color(card, 'yellow');
  }
  return card;
}

export function getHands (argv = []) {
  return argv.filter(string => HAND_PATTERN.test(string));
}

export function hasOption (option, argv = []) {
  return argv.includes(option) || argv.includes('-' + option[2]);
}

export function getOption (option, argv = []) {
  const index = argv.indexOf(option);
  if (index === -1) {
    if (option.length !== 2) {
      return getOption('-' + option[2], argv);
    }
    return undefined;
  }
  const value = argv[index + 1];
  if (/^\d+$/.test(value)) {
    return parseInt(value);
  }
  return value;
}

// --- Poker odds functions from poker-odds.js ---
export function log (string, colorName) {
  if (!string) {
    return console.log('');
  }
  if (colorName) {
    return console.log(`  ${color(string, colorName)}`);
  }
  console.log(`  ${string}`);
}

// --- Generate lookup functions from generate-lookup.js ---
export function generateRankData () {
  const data = {};
  for (let a = 0; a !== CARD_VALUES.length; a++) {
    for (let b = 0; b !== CARD_VALUES.length; b++) {
      for (let c = 0; c !== CARD_VALUES.length; c++) {
        for (let d = 0; d !== CARD_VALUES.length; d++) {
          for (let e = 0; e !== CARD_VALUES.length; e++) {
            for (let f = 0; f !== CARD_VALUES.length; f++) {
              for (let g = 0; g !== CARD_VALUES.length; g++) {
                if (a < b || b < c || c < d || d < e || e < f || f < g) {
                  continue;
                }
                const values = [
                  CARD_VALUES[a],
                  CARD_VALUES[b],
                  CARD_VALUES[c],
                  CARD_VALUES[d],
                  CARD_VALUES[e],
                  CARD_VALUES[f],
                  CARD_VALUES[g]
                ];
                data[values.join('')] = rankValues(values);
              }
            }
          }
        }
      }
    }
  }
  return data;
}

export function generateFlushData () {
  const data = {};
  for (let a = 0; a !== CARD_SUITS.length; a++) {
    for (let b = 0; b !== CARD_SUITS.length; b++) {
      for (let c = 0; c !== CARD_SUITS.length; c++) {
        for (let d = 0; d !== CARD_SUITS.length; d++) {
          for (let e = 0; e !== CARD_SUITS.length; e++) {
            for (let f = 0; f !== CARD_SUITS.length; f++) {
              for (let g = 0; g !== CARD_SUITS.length; g++) {
                const key = [
                  CARD_SUITS[a],
                  CARD_SUITS[b],
                  CARD_SUITS[c],
                  CARD_SUITS[d],
                  CARD_SUITS[e],
                  CARD_SUITS[f],
                  CARD_SUITS[g]
                ].sort().join('');
                data[key] = getFlush(key);
              }
            }
          }
        }
      }
    }
  }
  return data;
}

// --- UI State ---
let players = [];
let communityCards = [];
let selectedCards = new Set();
let currentPlayerCount = 2;

// --- UI Setup ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    generatePlayers();
    updateUI();
});

function setupEventListeners() {
    const playerCountElement = document.getElementById('playerCount');
    if (playerCountElement) {
        playerCountElement.addEventListener('change', (e) => {
            currentPlayerCount = parseInt(e.target.value);
            generatePlayers();
            updateUI();
        });
    }
    
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateProbabilities);
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAll);
    }
    
    const randomBtn = document.getElementById('randomBtn');
    if (randomBtn) {
        randomBtn.addEventListener('click', generateRandomCards);
    }

    // Nová tlačítka pro board
    const randomFlopBtn = document.getElementById('randomFlopBtn');
    if (randomFlopBtn) {
        randomFlopBtn.addEventListener('click', generateRandomFlop);
    }
    const randomTurnBtn = document.getElementById('randomTurnBtn');
    if (randomTurnBtn) {
        randomTurnBtn.addEventListener('click', generateRandomTurn);
    }
    const randomRiverBtn = document.getElementById('randomRiverBtn');
    if (randomRiverBtn) {
        randomRiverBtn.addEventListener('click', generateRandomRiver);
    }
    const clearBoardBtn = document.getElementById('clearBoardBtn');
    if (clearBoardBtn) {
        clearBoardBtn.addEventListener('click', clearBoard);
    }
}

function generatePlayers() {
    players = [];
    for (let i = 0; i < currentPlayerCount; i++) {
        players.push({
            id: i,
            cards: [null, null],
            active: true
        });
    }
}

function updateUI() {
    renderPlayers();
    renderCommunityCards();
}

function renderPlayers() {
    const grid = document.getElementById('playersGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    players.forEach((player, idx) => {
        const div = document.createElement('div');
        div.className = 'player-card';
        div.innerHTML = `
            <div class="player-header">
                <span class="player-name">Hráč ${idx + 1}</span>
                <div class="player-toggle">
                    <div class="toggle-switch ${player.active ? 'active' : ''}" data-player="${idx}"></div>
                </div>
            </div>
            <div class="player-cards">
                <div class="card ${player.cards[0] ? 'selected' : ''}" data-player="${idx}" data-card="0">
                    ${player.cards[0] || '<i class="fas fa-plus"></i>'}
                </div>
                <div class="card ${player.cards[1] ? 'selected' : ''}" data-player="${idx}" data-card="1">
                    ${player.cards[1] || '<i class="fas fa-plus"></i>'}
                </div>
            </div>
        `;
        grid.appendChild(div);
        
        // Add event listeners
        div.querySelectorAll('.card').forEach(cardEl => {
            cardEl.addEventListener('click', () => {
                openCardPicker(idx, parseInt(cardEl.dataset.card));
            });
        });
        
        div.querySelector('.toggle-switch').addEventListener('click', () => {
            togglePlayer(idx);
        });
    });
}

function renderCommunityCards() {
    const communitySection = document.querySelector('.community-cards');
    if (!communitySection) return;
    
    communitySection.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const cardSlot = document.createElement('div');
        cardSlot.className = 'card-slot';
        cardSlot.innerHTML = communityCards[i] || '<i class="fas fa-plus"></i>';
        cardSlot.addEventListener('click', () => {
            openCardPicker('community', i);
        });
        communitySection.appendChild(cardSlot);
    }
}

function togglePlayer(playerId) {
    players[playerId].active = !players[playerId].active;
    updateUI();
}

// --- Card Picker Modal ---
let pickerTarget = null;
let pickerCardIdx = null;

// --- Sekvenční režim přidělování karet ---
let sequentialAssign = false;
let assignIndex = { player: 0, card: 0, board: 0 };
let assignHistory = [];

function openCardPicker(target, cardIdx) {
    // Pokud kliknu na hráče, začíná sekvenční režim
    if (typeof target === 'number') {
        sequentialAssign = true;
        assignIndex.player = target;
        assignIndex.card = players[target].cards[0] ? 1 : 0;
        assignIndex.board = 0;
    }
    pickerTarget = target;
    pickerCardIdx = cardIdx;
    showCardPickerModal();
}

function showCardPickerModal() {
    let modal = document.getElementById('cardPickerModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cardPickerModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `<div style="background:#fff;padding:24px;border-radius:12px;max-width:400px;max-height:80vh;overflow:auto;">
        <h3>Vyberte kartu</h3>
        <div id="pickerGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;"></div>
        <button id="undoPickerBtn" style="margin-top:16px;margin-right:8px;">Undo</button>
        <button id="closePickerBtn" style="margin-top:16px;">Zavřít</button>
    </div>`;
    document.getElementById('closePickerBtn').onclick = closeCardPicker;
    document.getElementById('undoPickerBtn').onclick = undoAssignCard;
    renderPickerGrid();
    modal.onclick = (e) => { if (e.target === modal) closeCardPicker(); };
}

function closeCardPicker() {
    const modal = document.getElementById('cardPickerModal');
    if (modal) modal.remove();
    pickerTarget = null;
    pickerCardIdx = null;
    sequentialAssign = false;
    assignIndex = { player: 0, card: 0, board: 0 };
}

function renderPickerGrid() {
    const grid = document.getElementById('pickerGrid');
    if (!grid) return;
    grid.innerHTML = '';
    CARD_VALUES.forEach(value => {
        CARD_SUITS.forEach(suit => {
            const card = value + suit;
            const btn = document.createElement('button');
            btn.textContent = cardToUnicode(card);
            btn.style.fontSize = '1.2em';
            btn.style.padding = '8px';
            btn.style.cursor = 'pointer';
            btn.onclick = () => selectCardSequential(card);
            // Disable if card is already used
            if (isCardUsed(card)) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            }
            grid.appendChild(btn);
        });
    });
}

function cardToUnicode(card) {
    const value = card[0] === 'T' ? '10' : card[0];
    const suit = card[1];
    let suitChar = '';
    if (suit === 'h') suitChar = '♥';
    if (suit === 'd') suitChar = '♦';
    if (suit === 'c') suitChar = '♣';
    if (suit === 's') suitChar = '♠';
    return value + suitChar;
}

function isCardUsed(card) {
    // Check all player cards and community cards
    for (const p of players) {
        if (p.cards.includes(card)) return true;
    }
    if (communityCards.includes(card)) return true;
    return false;
}

function selectCardSequential(card) {
    if (sequentialAssign) {
        // Nejprve hráči, pak board
        if (assignIndex.player < players.length) {
            players[assignIndex.player].cards[assignIndex.card] = card;
            assignHistory.push({ type: 'player', player: assignIndex.player, card: assignIndex.card, value: card });
            // Další karta pro stejného hráče, nebo další hráč
            if (assignIndex.card === 0) {
                assignIndex.card = 1;
            } else {
                assignIndex.player++;
                assignIndex.card = 0;
            }
        } else if (assignIndex.board < 5) {
            communityCards[assignIndex.board] = card;
            assignHistory.push({ type: 'board', board: assignIndex.board, value: card });
            assignIndex.board++;
        }
        updateUI();
        // Pokud už jsou rozdané všechny karty, zavři picker
        if (assignIndex.player >= players.length && assignIndex.board >= 5) {
            closeCardPicker();
        }
    } else {
        // fallback: klasické chování (při kliknutí na konkrétní kartu)
        if (pickerTarget === 'community') {
            communityCards[pickerCardIdx] = card;
            assignHistory.push({ type: 'board', board: pickerCardIdx, value: card });
        } else {
            players[pickerTarget].cards[pickerCardIdx] = card;
            assignHistory.push({ type: 'player', player: pickerTarget, card: pickerCardIdx, value: card });
        }
        closeCardPicker();
        updateUI();
    }
}

function undoAssignCard() {
    if (assignHistory.length === 0) return;
    const last = assignHistory.pop();
    if (last.type === 'player') {
        players[last.player].cards[last.card] = null;
        // Pokud jsme v sekvenčním režimu, nastav index zpět
        if (sequentialAssign) {
            assignIndex.player = last.player;
            assignIndex.card = last.card;
        }
    } else if (last.type === 'board') {
        communityCards[last.board] = null;
        if (sequentialAssign) {
            assignIndex.player = players.length; // už jsme na boardu
            assignIndex.board = last.board;
        }
    }
    updateUI();
    renderPickerGrid();
}

function generateRandomCards() {
    const deck = createDeck();
    let used = new Set();
    
    // Generate random cards for players
    players.forEach(player => {
        for (let i = 0; i < 2; i++) {
            let card;
            do {
                card = deck[Math.floor(Math.random() * deck.length)];
            } while (used.has(card));
            player.cards[i] = card;
            used.add(card);
        }
    });
    
    // Generate random community cards
    communityCards = [];
    for (let i = 0; i < 5; i++) {
        let card;
        do {
            card = deck[Math.floor(Math.random() * deck.length)];
        } while (used.has(card));
        communityCards.push(card);
        used.add(card);
    }
    
    updateUI();
}

function generateRandomFlop() {
    const deck = createDeck([...communityCards, ...players.flatMap(p => p.cards)]);
    let used = new Set([...communityCards, ...players.flatMap(p => p.cards)]);
    for (let i = 0; i < 3; i++) {
        let card;
        do {
            card = deck[Math.floor(Math.random() * deck.length)];
        } while (used.has(card));
        communityCards[i] = card;
        used.add(card);
    }
    updateUI();
}

function generateRandomTurn() {
    const deck = createDeck([...communityCards, ...players.flatMap(p => p.cards)]);
    let used = new Set([...communityCards, ...players.flatMap(p => p.cards)]);
    let card;
    do {
        card = deck[Math.floor(Math.random() * deck.length)];
    } while (used.has(card));
    communityCards[3] = card;
    updateUI();
}

function generateRandomRiver() {
    const deck = createDeck([...communityCards, ...players.flatMap(p => p.cards)]);
    let used = new Set([...communityCards, ...players.flatMap(p => p.cards)]);
    let card;
    do {
        card = deck[Math.floor(Math.random() * deck.length)];
    } while (used.has(card));
    communityCards[4] = card;
    updateUI();
}

function clearBoard() {
    communityCards = [];
    updateUI();
}

function resetAll() {
    players.forEach(player => {
        player.cards = [null, null];
        player.active = true;
    });
    communityCards = [];
    updateUI();
}

function calculateProbabilities() {
    const activePlayers = players.filter(p => p.active && p.cards[0] && p.cards[1]);
    
    if (activePlayers.length < 2) {
        alert('Potřebujete alespoň 2 aktivní hráče s kartami pro výpočet.');
        return;
    }
    
    const hands = activePlayers.map(p => p.cards);
    const board = communityCards.filter(card => card !== null);
    
    try {
        const results = calculateEquity(hands, board, 10000, false);
        displayResults(results);
    } catch (error) {
        console.error('Chyba při výpočtu:', error);
        alert('Došlo k chybě při výpočtu pravděpodobností.');
    }
}

function displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
    if (!resultsSection) return;
    
    resultsSection.innerHTML = `
        <h2>Výsledky</h2>
        <div class="results-grid">
            ${results.map((result, idx) => `
                <div class="result-row">
                    <div class="player-info">Hráč ${idx + 1}: ${result.hand.join(' ')}</div>
                    <div class="win-percent">${percent(result.wins / result.count)}</div>
                    <div class="tie-percent">${percent(result.ties / result.count)}</div>
                </div>
            `).join('')}
        </div>
    `;
        
        resultsSection.style.display = 'block';
}

// Initialize FULL_DECK after all functions are defined
const FULL_DECK = createDeck();