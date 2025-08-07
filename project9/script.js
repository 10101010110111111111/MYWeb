// Poker Calculator - Vanilla JavaScript Implementation

// Constants
const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const CARD_SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const SUIT_SYMBOLS = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
};
const SUIT_COLORS = {
    hearts: 'red',
    diamonds: 'red',
    clubs: 'black',
    spades: 'black'
};
const HAND_RANKINGS = [
    'High Card',
    'One Pair', 
    'Two Pair',
    'Three of a Kind',
    'Straight',
    'Flush',
    'Full House',
    'Four of a Kind',
    'Straight Flush',
    'Royal Flush'
];

// Global State
let players = [];
let communityCards = [null, null, null, null, null];
let selectedCards = new Set();
let isCalculating = false;
let cardPickerTarget = null;

// DOM Elements
const elements = {
    playerCount: null,
    playersGrid: null,
    communityCards: null,
    alert: null,
    alertIcon: null,
    alertMessage: null,
    calculateBtn: null,
    resetBtn: null,
    randomCardsBtn: null,
    randomFlopBtn: null,
    randomTurnBtn: null,
    randomRiverBtn: null,
    clearBoardBtn: null,
    progressCard: null,
    progressFill: null,
    progressPercentage: null,
    resultsCard: null,
    cardPickerModal: null,
    cardPickerGrid: null,
    cardPickerDescription: null,
    cancelPickerBtn: null,
    activePlayersCount: null,
    playersWithCardsCount: null,
    boardCardCount: null,
    calculationTime: null,
    totalCombinations: null,
    resultsOverview: null,
    resultsDetailed: null,
    tabButtons: null,
    tabContents: null
};

// Initialize DOM elements
function initializeElements() {
    elements.playerCount = document.getElementById('player-count');
    elements.playersGrid = document.getElementById('players-grid');
    elements.communityCards = document.getElementById('community-cards');
    elements.alert = document.getElementById('alert');
    elements.alertIcon = elements.alert?.querySelector('.alert-icon');
    elements.alertMessage = elements.alert?.querySelector('.alert-message');
    elements.calculateBtn = document.getElementById('calculate-btn');
    elements.resetBtn = document.getElementById('reset-btn');
    elements.randomCardsBtn = document.getElementById('random-cards-btn');
    elements.randomFlopBtn = document.getElementById('random-flop-btn');
    elements.randomTurnBtn = document.getElementById('random-turn-btn');
    elements.randomRiverBtn = document.getElementById('random-river-btn');
    elements.clearBoardBtn = document.getElementById('clear-board-btn');
    elements.progressCard = document.getElementById('progress-card');
    elements.progressFill = document.getElementById('progress-fill');
    elements.progressPercentage = document.getElementById('progress-percentage');
    elements.resultsCard = document.getElementById('results-card');
    elements.cardPickerModal = document.getElementById('card-picker-modal');
    elements.cardPickerGrid = document.getElementById('card-picker-grid');
    elements.cardPickerDescription = document.getElementById('card-picker-description');
    elements.cancelPickerBtn = document.getElementById('cancel-picker-btn');
    elements.activePlayersCount = document.getElementById('active-players-count');
    elements.playersWithCardsCount = document.getElementById('players-with-cards-count');
    elements.boardCardCount = document.getElementById('board-card-count');
    elements.calculationTime = document.getElementById('calculation-time');
    elements.totalCombinations = document.getElementById('total-combinations');
    elements.resultsOverview = document.getElementById('results-overview');
    elements.resultsDetailed = document.getElementById('results-detailed');
    elements.tabButtons = document.querySelectorAll('.tab-button');
    elements.tabContents = document.querySelectorAll('.tab-content');
}

// Utility Functions
function cardToString(card) {
    return `${card.value}${card.suit[0]}`;
}

function isCardUsed(card) {
    return selectedCards.has(cardToString(card));
}

function getCardValue(value) {
    if (value === 'A') return 14;
    if (value === 'K') return 13;
    if (value === 'Q') return 12;
    if (value === 'J') return 11;
    return parseInt(value);
}

function showAlert(type, message) {
    if (!elements.alert) return;
    
    elements.alert.className = `alert ${type}`;
    elements.alertIcon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    elements.alertMessage.textContent = message;
    elements.alert.classList.remove('hidden');
    
    setTimeout(() => {
        elements.alert.classList.add('hidden');
    }, 3000);
}

function addCardToSelected(card) {
    selectedCards.add(cardToString(card));
}

function removeCardFromSelected(card) {
    selectedCards.delete(cardToString(card));
}

// Player Management
function generatePlayers() {
    const count = parseInt(elements.playerCount.value);
    players = [];
    
    for (let i = 0; i < count; i++) {
        players.push({
            id: i,
            name: `Player ${i + 1}`,
            cards: [null, null],
            active: true
        });
    }
    
    renderPlayers();
    updateCounts();
}

function togglePlayer(playerIndex) {
    const player = players[playerIndex];
    if (!player) return;
    
    const wasActive = player.active;
    
    if (wasActive) {
        // Remove cards from selected when deactivating
        if (player.cards[0]) removeCardFromSelected(player.cards[0]);
        if (player.cards[1]) removeCardFromSelected(player.cards[1]);
        player.cards = [null, null];
        player.active = false;
    } else {
        player.active = true;
    }
    
    renderPlayers();
    updateCounts();
    showAlert('success', `${player.name} ${player.active ? 'activated' : 'deactivated'}`);
}

function setPlayerCard(playerIndex, cardIndex, card) {
    const player = players[playerIndex];
    if (!player) return;
    
    // Remove old card from selected
    if (player.cards[cardIndex]) {
        removeCardFromSelected(player.cards[cardIndex]);
    }
    
    // Set new card
    player.cards[cardIndex] = card;
    
    // Add new card to selected
    if (card) {
        addCardToSelected(card);
    }
    
    renderPlayers();
    updateCounts();
}

// Community Cards Management
function setCommunityCard(index, card) {
    // Remove old card from selected
    if (communityCards[index]) {
        removeCardFromSelected(communityCards[index]);
    }
    
    // Set new card
    communityCards[index] = card;
    
    // Add new card to selected
    if (card) {
        addCardToSelected(card);
    }
    
    renderCommunityCards();
    updateCounts();
}

// Rendering Functions
function renderCard(card, onClick) {
    const cardEl = document.createElement('div');
    cardEl.className = 'poker-card';
    
    if (!card) {
        cardEl.classList.add('empty');
        cardEl.innerHTML = '+';
        if (onClick) cardEl.addEventListener('click', onClick);
        return cardEl;
    }
    
    cardEl.classList.add(SUIT_COLORS[card.suit]);
    cardEl.innerHTML = `
        <div class="card-value">${card.value}</div>
        <div class="card-suit">${SUIT_SYMBOLS[card.suit]}</div>
    `;
    
    if (onClick) cardEl.addEventListener('click', onClick);
    return cardEl;
}

function renderPlayers() {
    if (!elements.playersGrid) return;
    
    elements.playersGrid.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerEl = document.createElement('div');
        playerEl.className = `player-card ${player.active ? 'active' : 'inactive'}`;
        
        playerEl.innerHTML = `
            <div class="player-header">
                <div class="player-name">${player.name}</div>
                <div class="player-toggle">
                    <div class="toggle-switch ${player.active ? 'active' : ''}" data-player="${index}"></div>
                    <span style="font-size: 0.875rem; color: var(--text-light);">Active</span>
                </div>
            </div>
            <div class="player-cards" id="player-cards-${index}">
            </div>
        `;
        
        // Add toggle event listener
        const toggle = playerEl.querySelector('.toggle-switch');
        toggle.addEventListener('click', () => togglePlayer(index));
        
        // Add cards
        const cardsContainer = playerEl.querySelector(`#player-cards-${index}`);
        cardsContainer.appendChild(renderCard(player.cards[0], () => openCardPicker('player', index, 0)));
        cardsContainer.appendChild(renderCard(player.cards[1], () => openCardPicker('player', index, 1)));
        
        elements.playersGrid.appendChild(playerEl);
    });
}

function renderCommunityCards() {
    if (!elements.communityCards) return;
    
    elements.communityCards.innerHTML = '';
    
    const labels = ['Flop 1', 'Flop 2', 'Flop 3', 'Turn', 'River'];
    
    communityCards.forEach((card, index) => {
        const container = document.createElement('div');
        container.className = 'community-card-container';
        
        const cardEl = renderCard(card, () => openCardPicker('community', index));
        const label = document.createElement('div');
        label.className = 'community-label';
        label.textContent = labels[index];
        
        container.appendChild(cardEl);
        container.appendChild(label);
        elements.communityCards.appendChild(container);
    });
}

function updateCounts() {
    const activePlayers = players.filter(p => p.active);
    const playersWithCards = players.filter(p => p.active && p.cards[0] && p.cards[1]);
    const boardCards = communityCards.filter(card => card !== null);
    
    if (elements.activePlayersCount) elements.activePlayersCount.textContent = activePlayers.length;
    if (elements.playersWithCardsCount) elements.playersWithCardsCount.textContent = playersWithCards.length;
    if (elements.boardCardCount) elements.boardCardCount.textContent = boardCards.length;
}

// Card Picker
function openCardPicker(type, index, cardIndex) {
    if (type === 'player' && !players[index]?.active) {
        showAlert('error', 'Player is not active! Activate them first.');
        return;
    }
    
    cardPickerTarget = { type, index, cardIndex };
    
    // Update description
    let description = '';
    if (type === 'player') {
        description = `Choose a card for ${players[index].name} - Card ${cardIndex + 1}`;
    } else {
        const labels = ['Flop 1', 'Flop 2', 'Flop 3', 'Turn', 'River'];
        description = `Choose a card for Community - ${labels[index]}`;
    }
    
    if (elements.cardPickerDescription) {
        elements.cardPickerDescription.textContent = description;
    }
    
    renderCardPicker();
    elements.cardPickerModal?.classList.remove('hidden');
}

function closeCardPicker() {
    cardPickerTarget = null;
    elements.cardPickerModal?.classList.add('hidden');
}

function selectCard(card) {
    if (!cardPickerTarget) return;
    
    if (isCardUsed(card)) {
        showAlert('error', 'This card is already in use!');
        return;
    }
    
    if (cardPickerTarget.type === 'player') {
        setPlayerCard(cardPickerTarget.index, cardPickerTarget.cardIndex, card);
    } else {
        setCommunityCard(cardPickerTarget.index, card);
    }
    
    closeCardPicker();
    showAlert('success', 'Card assigned successfully!');
}

function renderCardPicker() {
    if (!elements.cardPickerGrid) return;
    
    elements.cardPickerGrid.innerHTML = '';
    
    CARD_SUITS.forEach(suit => {
        const row = document.createElement('div');
        row.className = 'card-row';
        
        CARD_VALUES.forEach(value => {
            const card = { value, suit };
            const isUsed = isCardUsed(card);
            
            const cardEl = document.createElement('button');
            cardEl.className = `picker-card ${SUIT_COLORS[suit]} ${isUsed ? 'disabled' : ''}`;
            cardEl.innerHTML = `
                <div class="picker-card-value">${value}</div>
                <div class="picker-card-suit">${SUIT_SYMBOLS[suit]}</div>
            `;
            
            if (!isUsed) {
                cardEl.addEventListener('click', () => selectCard(card));
            }
            
            row.appendChild(cardEl);
        });
        
        elements.cardPickerGrid.appendChild(row);
    });
}

// Random Card Generation
function getRandomCard() {
    let attempts = 0;
    while (attempts < 1000) {
        const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
        const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
        const card = { value, suit };
        
        if (!isCardUsed(card)) {
            return card;
        }
        attempts++;
    }
    throw new Error('Unable to find available card');
}

function generateRandomCards() {
    try {
        // Clear all cards
        selectedCards.clear();
        
        // Reset community cards
        communityCards = [null, null, null, null, null];
        
        // Generate player cards
        players.forEach(player => {
            if (player.active) {
                player.cards[0] = getRandomCard();
                addCardToSelected(player.cards[0]);
                player.cards[1] = getRandomCard();
                addCardToSelected(player.cards[1]);
            } else {
                player.cards = [null, null];
            }
        });
        
        // Generate community cards
        for (let i = 0; i < 5; i++) {
            communityCards[i] = getRandomCard();
            addCardToSelected(communityCards[i]);
        }
        
        renderPlayers();
        renderCommunityCards();
        updateCounts();
        showAlert('success', 'Random cards generated successfully!');
    } catch (error) {
        showAlert('error', 'Failed to generate random cards');
    }
}

function generateRandomFlop() {
    try {
        // Clear existing flop cards from selected
        for (let i = 0; i < 3; i++) {
            if (communityCards[i]) {
                removeCardFromSelected(communityCards[i]);
            }
        }
        
        // Generate new flop
        for (let i = 0; i < 3; i++) {
            communityCards[i] = getRandomCard();
            addCardToSelected(communityCards[i]);
        }
        
        renderCommunityCards();
        updateCounts();
        showAlert('success', 'Random flop generated!');
    } catch (error) {
        showAlert('error', 'Failed to generate random flop');
    }
}

function generateRandomTurn() {
    if (!communityCards[0] || !communityCards[1] || !communityCards[2]) {
        showAlert('error', 'Generate flop first!');
        return;
    }
    
    try {
        // Clear existing turn card
        if (communityCards[3]) {
            removeCardFromSelected(communityCards[3]);
        }
        
        // Generate new turn
        communityCards[3] = getRandomCard();
        addCardToSelected(communityCards[3]);
        
        renderCommunityCards();
        updateCounts();
        showAlert('success', 'Random turn generated!');
    } catch (error) {
        showAlert('error', 'Failed to generate random turn');
    }
}

function generateRandomRiver() {
    if (!communityCards[3]) {
        showAlert('error', 'Generate turn first!');
        return;
    }
    
    try {
        // Clear existing river card
        if (communityCards[4]) {
            removeCardFromSelected(communityCards[4]);
        }
        
        // Generate new river
        communityCards[4] = getRandomCard();
        addCardToSelected(communityCards[4]);
        
        renderCommunityCards();
        updateCounts();
        showAlert('success', 'Random river generated!');
    } catch (error) {
        showAlert('error', 'Failed to generate random river');
    }
}

function clearBoard() {
    const hasCards = communityCards.some(card => card !== null);
    if (!hasCards) {
        showAlert('warning', 'Board is already empty!');
        return;
    }
    
    // Remove community cards from selected
    communityCards.forEach(card => {
        if (card) removeCardFromSelected(card);
    });
    
    communityCards = [null, null, null, null, null];
    renderCommunityCards();
    updateCounts();
    showAlert('success', 'Board cleared!');
}

function resetAll() {
    selectedCards.clear();
    
    players.forEach(player => {
        player.cards = [null, null];
        player.active = true;
    });
    
    communityCards = [null, null, null, null, null];
    
    renderPlayers();
    renderCommunityCards();
    updateCounts();
    
    // Hide results
    elements.resultsCard?.classList.add('hidden');
    
    showAlert('success', 'Everything reset!');
}

// Hand Evaluation
function evaluateHand(cards) {
    if (cards.length !== 7) {
        throw new Error('Hand evaluation requires exactly 7 cards');
    }

    const values = cards.map(card => getCardValue(card.value));
    const suits = cards.map(card => card.suit);
    
    // Count value frequencies
    const valueCounts = {};
    values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
    
    // Get sorted values for kicker comparison
    const sortedValues = [...values].sort((a, b) => b - a);
    
    // Check for flush
    const suitCounts = {};
    suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
    const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5);
    
    // Check for straight
    const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
    let straightHigh = 0;
    
    // Check for regular straight
    for (let i = 0; i <= uniqueValues.length - 5; i++) {
        if (uniqueValues[i + 4] - uniqueValues[i] === 4) {
            straightHigh = uniqueValues[i + 4];
            break;
        }
    }
    
    // Check for wheel (A-2-3-4-5)
    if (!straightHigh && uniqueValues.includes(14)) {
        const wheelValues = [2, 3, 4, 5, 14];
        if (wheelValues.every(v => uniqueValues.includes(v))) {
            straightHigh = 5; // 5 is high in wheel
        }
    }
    
    const isFlush = !!flushSuit;
    const isStraight = straightHigh > 0;
    
    // Check for royal flush
    if (isFlush && isStraight) {
        const flushCards = cards.filter(card => card.suit === flushSuit);
        const flushValues = flushCards.map(card => getCardValue(card.value));
        const royalValues = [10, 11, 12, 13, 14];
        
        if (royalValues.every(v => flushValues.includes(v))) {
            return { rank: 9, name: 'Royal Flush', kickers: [14] };
        }
        
        // Check if straight flush
        const flushUniqueValues = [...new Set(flushValues)].sort((a, b) => a - b);
        let flushStraightHigh = 0;
        
        for (let i = 0; i <= flushUniqueValues.length - 5; i++) {
            if (flushUniqueValues[i + 4] - flushUniqueValues[i] === 4) {
                flushStraightHigh = flushUniqueValues[i + 4];
                break;
            }
        }
        
        if (!flushStraightHigh && flushUniqueValues.includes(14)) {
            const wheelValues = [2, 3, 4, 5, 14];
            if (wheelValues.every(v => flushUniqueValues.includes(v))) {
                flushStraightHigh = 5;
            }
        }
        
        if (flushStraightHigh > 0) {
            return { rank: 8, name: 'Straight Flush', kickers: [flushStraightHigh] };
        }
    }
    
    // Check for four of a kind
    const fourValue = Object.keys(valueCounts).find(v => valueCounts[parseInt(v)] === 4);
    if (fourValue) {
        const kicker = sortedValues.find(v => v !== parseInt(fourValue)) || 0;
        return { rank: 7, name: 'Four of a Kind', kickers: [parseInt(fourValue), kicker] };
    }
    
    // Check for full house
    const threeValues = Object.keys(valueCounts).filter(v => valueCounts[parseInt(v)] === 3).map(v => parseInt(v));
    const pairValues = Object.keys(valueCounts).filter(v => valueCounts[parseInt(v)] === 2).map(v => parseInt(v));
    
    if (threeValues.length > 0 && (pairValues.length > 0 || threeValues.length > 1)) {
        const bestThree = Math.max(...threeValues);
        const bestPair = threeValues.length > 1 
            ? Math.max(...threeValues.filter(v => v !== bestThree))
            : Math.max(...pairValues);
        return { rank: 6, name: 'Full House', kickers: [bestThree, bestPair] };
    }
    
    // Check for flush
    if (isFlush) {
        const flushCards = cards.filter(card => card.suit === flushSuit);
        const flushValues = flushCards.map(card => getCardValue(card.value)).sort((a, b) => b - a).slice(0, 5);
        return { rank: 5, name: 'Flush', kickers: flushValues };
    }
    
    // Check for straight
    if (isStraight) {
        return { rank: 4, name: 'Straight', kickers: [straightHigh] };
    }
    
    // Check for three of a kind
    if (threeValues.length > 0) {
        const threeValue = Math.max(...threeValues);
        const kickers = sortedValues.filter(v => v !== threeValue).slice(0, 2);
        return { rank: 3, name: 'Three of a Kind', kickers: [threeValue, ...kickers] };
    }
    
    // Check for two pair
    if (pairValues.length >= 2) {
        const sortedPairs = pairValues.sort((a, b) => b - a).slice(0, 2);
        const kicker = sortedValues.find(v => !sortedPairs.includes(v)) || 0;
        return { rank: 2, name: 'Two Pair', kickers: [...sortedPairs, kicker] };
    }
    
    // Check for one pair
    if (pairValues.length > 0) {
        const pairValue = Math.max(...pairValues);
        const kickers = sortedValues.filter(v => v !== pairValue).slice(0, 3);
        return { rank: 1, name: 'One Pair', kickers: [pairValue, ...kickers] };
    }
    
    // High card
    return { rank: 0, name: 'High Card', kickers: sortedValues.slice(0, 5) };
}

function compareHands(hand1, hand2) {
    if (hand1.rank !== hand2.rank) {
        return hand1.rank - hand2.rank;
    }
    
    // Compare kickers
    for (let i = 0; i < Math.max(hand1.kickers.length, hand2.kickers.length); i++) {
        const kicker1 = hand1.kickers[i] || 0;
        const kicker2 = hand2.kickers[i] || 0;
        if (kicker1 !== kicker2) {
            return kicker1 - kicker2;
        }
    }
    
    return 0; // Tie
}

// Probability Calculation
async function calculateProbabilities() {
    const activePlayers = players.filter(p => p.active && p.cards[0] && p.cards[1]);
    
    if (activePlayers.length < 2) {
        showAlert('error', 'Need at least 2 active players with cards!');
        return;
    }
    
    const boardCards = communityCards.filter(card => card !== null);
    // No minimum board cards required - can calculate with 0-5 community cards

    isCalculating = true;
    elements.calculateBtn.disabled = true;
    elements.progressCard?.classList.remove('hidden');
    
    const startTime = Date.now();

    try {
        // Create deck without used cards
        const usedCardStrings = new Set();
        activePlayers.forEach(player => {
            player.cards.forEach(card => {
                if (card) usedCardStrings.add(cardToString(card));
            });
        });
        boardCards.forEach(card => usedCardStrings.add(cardToString(card)));

        const availableDeck = [];
        CARD_VALUES.forEach(value => {
            CARD_SUITS.forEach(suit => {
                const card = { value, suit };
                if (!usedCardStrings.has(cardToString(card))) {
                    availableDeck.push(card);
                }
            });
        });

        const neededCards = 5 - boardCards.length;

        // Generate all combinations of remaining cards
        const combinations = [];

        if (neededCards === 0) {
            // All 5 community cards are set
            combinations.push([]);
        } else if (neededCards === 1) {
            availableDeck.forEach(card => combinations.push([card]));
        } else if (neededCards === 2) {
            for (let i = 0; i < availableDeck.length; i++) {
                for (let j = i + 1; j < availableDeck.length; j++) {
                    combinations.push([availableDeck[i], availableDeck[j]]);
                }
            }
        } else if (neededCards === 3) {
            for (let i = 0; i < availableDeck.length; i++) {
                for (let j = i + 1; j < availableDeck.length; j++) {
                    for (let k = j + 1; k < availableDeck.length; k++) {
                        combinations.push([availableDeck[i], availableDeck[j], availableDeck[k]]);
                    }
                }
            }
        } else if (neededCards === 4) {
            for (let i = 0; i < availableDeck.length; i++) {
                for (let j = i + 1; j < availableDeck.length; j++) {
                    for (let k = j + 1; k < availableDeck.length; k++) {
                        for (let l = k + 1; l < availableDeck.length; l++) {
                            combinations.push([availableDeck[i], availableDeck[j], availableDeck[k], availableDeck[l]]);
                        }
                    }
                }
            }
        } else if (neededCards === 5) {
            // No community cards set - generate all 5
            for (let i = 0; i < availableDeck.length; i++) {
                for (let j = i + 1; j < availableDeck.length; j++) {
                    for (let k = j + 1; k < availableDeck.length; k++) {
                        for (let l = k + 1; l < availableDeck.length; l++) {
                            for (let m = l + 1; m < availableDeck.length; m++) {
                                combinations.push([availableDeck[i], availableDeck[j], availableDeck[k], availableDeck[l], availableDeck[m]]);
                            }
                        }
                    }
                }
            }
        }

        // Initialize results
        const calculationResults = activePlayers.map(player => ({
            player,
            wins: 0,
            ties: 0,
            total: 0,
            winPercentage: 0,
            tiePercentage: 0,
            handStats: Object.fromEntries(HAND_RANKINGS.map(rank => [rank, 0]))
        }));

        // Process each combination
        for (let i = 0; i < combinations.length; i++) {
            const combination = combinations[i];
            const completeBoard = [...boardCards, ...combination];
            
            // Evaluate each player's hand
            const playerHands = activePlayers.map((player, index) => {
                const allCards = [...player.cards.filter(c => c !== null), ...completeBoard];
                const hand = evaluateHand(allCards);
                calculationResults[index].handStats[hand.name]++;
                return { player, hand, index };
            });

            // Find winner(s)
            let bestRank = -1;
            let winners = [];

            playerHands.forEach(({ hand, index }) => {
                if (hand.rank > bestRank) {
                    bestRank = hand.rank;
                    winners = [index];
                } else if (hand.rank === bestRank) {
                    // Compare kickers
                    const comparison = compareHands(hand, playerHands[winners[0]].hand);
                    if (comparison > 0) {
                        winners = [index];
                    } else if (comparison === 0) {
                        winners.push(index);
                    }
                }
            });

            // Update results
            if (winners.length === 1) {
                calculationResults[winners[0]].wins++;
            } else {
                winners.forEach(winnerIndex => {
                    calculationResults[winnerIndex].ties++;
                });
            }

            calculationResults.forEach(result => result.total++);

            // Update progress
            if (i % Math.max(1, Math.floor(combinations.length / 100)) === 0) {
                const progress = (i / combinations.length) * 100;
                if (elements.progressFill) elements.progressFill.style.width = `${progress}%`;
                if (elements.progressPercentage) elements.progressPercentage.textContent = `${Math.round(progress)}%`;
                await new Promise(resolve => setTimeout(resolve, 0)); // Allow UI update
            }
        }

        // Calculate percentages
        calculationResults.forEach(result => {
            result.winPercentage = (result.wins / result.total) * 100;
            result.tiePercentage = (result.ties / result.total) * 100;
        });

        displayResults(calculationResults, Date.now() - startTime);
        showAlert('success', 'Calculation completed!');

    } catch (error) {
        console.error('Calculation error:', error);
        showAlert('error', 'Calculation failed!');
    } finally {
        isCalculating = false;
        elements.calculateBtn.disabled = false;
        elements.progressCard?.classList.add('hidden');
    }
}

function displayResults(results, calculationTime) {
    if (!elements.resultsCard || !elements.resultsOverview || !elements.resultsDetailed) return;
    
    // Update calculation info
    if (elements.calculationTime) elements.calculationTime.textContent = calculationTime;
    if (elements.totalCombinations) elements.totalCombinations.textContent = results[0]?.total.toLocaleString() || '0';
    
    // Render overview
    elements.resultsOverview.innerHTML = '';
    results.forEach((result, index) => {
        const playerEl = document.createElement('div');
        playerEl.className = 'result-player';
        
        const losePercentage = 100 - result.winPercentage - result.tiePercentage;
        
        playerEl.innerHTML = `
            <div class="result-header">
                <div class="result-name">${result.player.name}</div>
                <div class="result-cards">
                    ${result.player.cards.map(card => card ? `
                        <div class="poker-card ${SUIT_COLORS[card.suit]}" style="width: 40px; height: 50px; font-size: 0.75rem;">
                            <div class="card-value">${card.value}</div>
                            <div class="card-suit">${SUIT_SYMBOLS[card.suit]}</div>
                        </div>
                    ` : '').join('')}
                </div>
            </div>
            <div class="result-stats">
                <div class="result-stat">
                    <div class="result-value win">${result.winPercentage.toFixed(1)}%</div>
                    <div class="result-label">Win</div>
                </div>
                <div class="result-stat">
                    <div class="result-value tie">${result.tiePercentage.toFixed(1)}%</div>
                    <div class="result-label">Tie</div>
                </div>
                <div class="result-stat">
                    <div class="result-value lose">${losePercentage.toFixed(1)}%</div>
                    <div class="result-label">Lose</div>
                </div>
            </div>
        `;
        
        elements.resultsOverview.appendChild(playerEl);
    });
    
    // Render detailed stats
    elements.resultsDetailed.innerHTML = '';
    results.forEach((result, index) => {
        const playerEl = document.createElement('div');
        playerEl.className = 'detailed-player';
        
        playerEl.innerHTML = `
            <div class="detailed-header">${result.player.name} - Hand Statistics</div>
            <div class="hand-stats-grid">
                ${HAND_RANKINGS.map(ranking => `
                    <div class="hand-stat">
                        <div class="hand-stat-value">${result.handStats[ranking]}</div>
                        <div class="hand-stat-label">${ranking}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        elements.resultsDetailed.appendChild(playerEl);
    });
    
    // Show results
    elements.resultsCard.classList.remove('hidden');
}

// Tab Management
function initializeTabs() {
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            // Update button states
            elements.tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update content visibility
            elements.tabContents.forEach(content => {
                if (content.id === `${tabName}-tab`) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
}

// Event Listeners
function setupEventListeners() {
    // Player count change
    elements.playerCount?.addEventListener('change', generatePlayers);
    
    // Action buttons
    elements.calculateBtn?.addEventListener('click', calculateProbabilities);
    elements.resetBtn?.addEventListener('click', resetAll);
    elements.randomCardsBtn?.addEventListener('click', generateRandomCards);
    elements.randomFlopBtn?.addEventListener('click', generateRandomFlop);
    elements.randomTurnBtn?.addEventListener('click', generateRandomTurn);
    elements.randomRiverBtn?.addEventListener('click', generateRandomRiver);
    elements.clearBoardBtn?.addEventListener('click', clearBoard);
    
    // Card picker modal
    elements.cancelPickerBtn?.addEventListener('click', closeCardPicker);
    elements.cardPickerModal?.addEventListener('click', (e) => {
        if (e.target === elements.cardPickerModal) {
            closeCardPicker();
        }
    });
    
    // Initialize tabs
    initializeTabs();
}

// Initialize Application
function init() {
    initializeElements();
    setupEventListeners();
    generatePlayers();
    renderCommunityCards();
    updateCounts();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
