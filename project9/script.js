// Poker Calculator Application
class PokerCalculator {
    constructor() {
        this.players = [];
        this.communityCards = [];
        this.selectedCards = new Set();
        this.currentPlayerCount = 2;
        this.cardPickerTarget = null;
        
        // Card values and suits
        this.cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.cardSuits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.suitSymbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        this.suitColors = {
            'hearts': 'red',
            'diamonds': 'red',
            'clubs': 'black',
            'spades': 'black'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generatePlayers();
        this.updateUI();
    }
    
    setupEventListeners() {
        // Player count change
        document.getElementById('playerCount').addEventListener('change', (e) => {
            this.currentPlayerCount = parseInt(e.target.value);
            this.generatePlayers();
            this.updateUI();
        });
        

        
        // Action buttons
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.calculateProbabilities();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetAll();
        });
        
        document.getElementById('randomBtn').addEventListener('click', () => {
            this.generateRandomCards();
        });
        
        // Community card random buttons
        document.getElementById('randomFlopBtn').addEventListener('click', () => {
            this.generateRandomFlop();
        });
        
        document.getElementById('randomTurnBtn').addEventListener('click', () => {
            this.generateRandomTurn();
        });
        
        document.getElementById('randomRiverBtn').addEventListener('click', () => {
            this.generateRandomRiver();
        });
        
        document.getElementById('clearBoardBtn').addEventListener('click', () => {
            this.clearBoard();
        });
        
        // Card picker buttons
        document.querySelectorAll('.card-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = e.currentTarget.dataset.value;
                const suit = e.currentTarget.dataset.suit;
                this.selectCard(value, suit);
            });
        });
    }
    
    generatePlayers() {
        this.players = [];
        for (let i = 1; i <= this.currentPlayerCount; i++) {
            this.players.push({
                id: i,
                name: `Hráč ${i}`,
                active: true,
                cards: [null, null]
            });
        }
    }
    
    updateUI() {
        this.renderPlayers();
        this.renderCommunityCards();
    }
    
    renderPlayers() {
        const playersGrid = document.getElementById('playersGrid');
        playersGrid.innerHTML = '';
        
        this.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = `player-card ${player.active ? 'active' : ''}`;
            playerCard.innerHTML = `
                <div class="player-header">
                    <div class="player-name">${player.name}</div>
                    <div class="player-toggle">
                        <span>${player.active ? 'Aktivní' : 'Neaktivní'}</span>
                        <div class="toggle-switch ${player.active ? 'active' : ''}" 
                             onclick="pokerCalculator.togglePlayer(${player.id})"></div>
                    </div>
                </div>
                <div class="player-cards">
                    <div class="card-slot" data-player="${player.id}" data-card="0">
                        ${this.renderCard(player.cards[0])}
                    </div>
                    <div class="card-slot" data-player="${player.id}" data-card="1">
                        ${this.renderCard(player.cards[1])}
                    </div>
                </div>
            `;
            
            // Add click listeners for card slots
            const cardSlots = playerCard.querySelectorAll('.card-slot');
            cardSlots.forEach(slot => {
                slot.addEventListener('click', (e) => {
                    this.openCardPicker(slot);
                });
            });
            
            playersGrid.appendChild(playerCard);
        });
    }
    
    renderCard(card) {
        if (!card) {
            return `
                <div class="card-placeholder">
                    <i class="fas fa-plus"></i>
                    <span>Karta</span>
                </div>
            `;
        }
        
        const colorClass = this.suitColors[card.suit];
        return `
            <div class="card ${colorClass}">
                <div>${card.value}</div>
                <div>${this.suitSymbols[card.suit]}</div>
            </div>
        `;
    }
    
    renderCommunityCards() {
        const communityCards = document.querySelectorAll('.card-slot[data-position]');
        communityCards.forEach(slot => {
            const position = slot.dataset.position;
            const card = this.communityCards.find(c => c.position === position);
            
            if (card) {
                const colorClass = this.suitColors[card.suit];
                slot.innerHTML = `
                    <div class="card ${colorClass}">
                        <div>${card.value}</div>
                        <div>${this.suitSymbols[card.suit]}</div>
                    </div>
                `;
            } else {
                slot.innerHTML = `
                    <div class="card-placeholder">
                        <i class="fas fa-plus"></i>
                        <span>${this.getPositionName(position)}</span>
                    </div>
                `;
            }
            
            slot.addEventListener('click', (e) => {
                this.openCardPicker(slot);
            });
        });
    }
    
    getPositionName(position) {
        const names = {
            'flop1': 'Flop 1',
            'flop2': 'Flop 2',
            'flop3': 'Flop 3',
            'turn': 'Turn',
            'river': 'River'
        };
        return names[position] || position;
    }
    
    togglePlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.active = !player.active;
            this.updateUI();
        }
    }
    
    openCardPicker(target) {
        this.cardPickerTarget = target;
        
        // Reset selections
        document.querySelectorAll('.card-item').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    
    closeCardPicker() {
        this.cardPickerTarget = null;
    }
    
    selectCard(value, suit) {
        // Remove all selections
        document.querySelectorAll('.card-item').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selection to clicked card
        event.currentTarget.classList.add('selected');
        
        // Set the card immediately
        this.setCard(value, suit);
    }
    
    setCard(value, suit) {
        const card = { value, suit };
        const cardString = `${value}${suit}`;
        
        // Check if card is already used
        if (this.selectedCards.has(cardString)) {
            alert('Tato karta je již použita!');
            return;
        }
        
        if (this.cardPickerTarget.dataset.player) {
            // Player card
            const playerId = parseInt(this.cardPickerTarget.dataset.player);
            const cardIndex = parseInt(this.cardPickerTarget.dataset.card);
            const player = this.players.find(p => p.id === playerId);
            
            if (player) {
                // Remove old card from selected cards
                if (player.cards[cardIndex]) {
                    const oldCardString = `${player.cards[cardIndex].value}${player.cards[cardIndex].suit}`;
                    this.selectedCards.delete(oldCardString);
                }
                
                player.cards[cardIndex] = card;
                this.selectedCards.add(cardString);
                this.renderPlayers();
            }
        } else {
            // Community card
            const position = this.cardPickerTarget.dataset.position;
            
            // Remove old card from selected cards
            const existingCard = this.communityCards.find(c => c.position === position);
            if (existingCard) {
                const oldCardString = `${existingCard.value}${existingCard.suit}`;
                this.selectedCards.delete(oldCardString);
            }
            
            // Remove existing card at this position
            this.communityCards = this.communityCards.filter(c => c.position !== position);
            
            // Add new card
            this.communityCards.push({ ...card, position });
            this.selectedCards.add(cardString);
            this.renderCommunityCards();
        }
        
        this.closeCardPicker();
    }
    
    generateRandomCards() {
        this.resetAll();
        
        // Generate random player cards
        this.players.forEach(player => {
            for (let i = 0; i < 2; i++) {
                const card = this.getRandomCard();
                player.cards[i] = card;
                this.selectedCards.add(`${card.value}${card.suit}`);
            }
        });
        
        this.updateUI();
    }
    
    getRandomCard() {
        let card;
        do {
            const value = this.cardValues[Math.floor(Math.random() * this.cardValues.length)];
            const suit = this.cardSuits[Math.floor(Math.random() * this.cardSuits.length)];
            card = { value, suit };
        } while (this.selectedCards.has(`${card.value}${card.suit}`));
        
        return card;
    }
    
    generateRandomFlop() {
        // Remove existing flop cards from selectedCards
        this.communityCards.forEach(card => {
            if (card.position === 'flop1' || card.position === 'flop2' || card.position === 'flop3') {
                this.selectedCards.delete(`${card.value}${card.suit}`);
            }
        });
        
        // Remove existing flop cards
        this.communityCards = this.communityCards.filter(card => 
            card.position !== 'flop1' && card.position !== 'flop2' && card.position !== 'flop3'
        );
        
        // Generate new flop cards
        for (let i = 1; i <= 3; i++) {
            const card = this.getRandomCard();
            const position = `flop${i}`;
            this.communityCards.push({ ...card, position });
            this.selectedCards.add(`${card.value}${card.suit}`);
        }
        
        this.updateUI();
    }
    
    generateRandomTurn() {
        // Remove existing turn card from selectedCards
        this.communityCards.forEach(card => {
            if (card.position === 'turn') {
                this.selectedCards.delete(`${card.value}${card.suit}`);
            }
        });
        
        // Remove existing turn card
        this.communityCards = this.communityCards.filter(card => card.position !== 'turn');
        
        // Generate new turn card
        const card = this.getRandomCard();
        this.communityCards.push({ ...card, position: 'turn' });
        this.selectedCards.add(`${card.value}${card.suit}`);
        
        this.updateUI();
    }
    
    generateRandomRiver() {
        // Remove existing river card from selectedCards
        this.communityCards.forEach(card => {
            if (card.position === 'river') {
                this.selectedCards.delete(`${card.value}${card.suit}`);
            }
        });
        
        // Remove existing river card
        this.communityCards = this.communityCards.filter(card => card.position !== 'river');
        
        // Generate new river card
        const card = this.getRandomCard();
        this.communityCards.push({ ...card, position: 'river' });
        this.selectedCards.add(`${card.value}${card.suit}`);
        
        this.updateUI();
    }
    
    clearBoard() {
        // Remove all community cards from selectedCards
        this.communityCards.forEach(card => {
            this.selectedCards.delete(`${card.value}${card.suit}`);
        });
        
        // Clear all community cards
        this.communityCards = [];
        
        this.updateUI();
    }
    
    resetAll() {
        this.players.forEach(player => {
            player.cards = [null, null];
        });
        this.communityCards = [];
        this.selectedCards.clear();
        this.updateUI();
    }
    
    async calculateProbabilities() {
        const activePlayers = this.players.filter(p => p.active && p.cards[0] && p.cards[1]);
        
        if (activePlayers.length < 2) {
            alert('Potřebujete alespoň 2 aktivní hráče s kartami!');
            return;
        }
        
        this.showLoading();
        
        const startTime = performance.now();
        const results = await this.runCompleteEnumeration(activePlayers);
        const endTime = performance.now();
        
        this.hideLoading();
        this.displayResults(results, endTime - startTime);
    }
    
    async runCompleteEnumeration(activePlayers) {
        const results = activePlayers.map(player => ({
            player,
            wins: 0,
            ties: 0,
            total: 0,
            currentHand: null,
            handStats: {
                'Royal flush': 0,
                'Straight flush': 0,
                'Four-of-a-Kind': 0,
                'Full house': 0,
                'Flush': 0,
                'Straight': 0,
                'Three-of-a-Kind': 0,
                'Two pair': 0,
                'One pair': 0,
                'High card': 0
            }
        }));
        
        // Calculate current hand strength for each player
        if (this.communityCards.length >= 3) {
            const currentBoard = this.communityCards.map(card => ({ value: card.value, suit: card.suit }));
            results.forEach(result => {
                result.currentHand = this.evaluateHand([...result.player.cards, ...currentBoard]);
            });
        }
        
        // Create deck with remaining cards
        const deck = this.createDeck();
        const needed = 5 - this.communityCards.length;
        
        if (needed === 0) {
            // All community cards are set, just evaluate once
            const completedBoard = this.communityCards.map(card => ({ value: card.value, suit: card.suit }));
            const winner = this.evaluateWinner(activePlayers, completedBoard);
            
            // Record hand statistics
            activePlayers.forEach((player, index) => {
                const hand = this.evaluateHand([...player.cards, ...completedBoard]);
                const handName = this.getHandDisplayName(hand.name);
                if (results[index].handStats[handName] !== undefined) {
                    results[index].handStats[handName]++;
                }
            });
            
            if (winner === 'tie') {
                results.forEach(r => r.ties++);
            } else {
                results[winner].wins++;
            }
            results.forEach(r => r.total++);
        } else {
            // Generate all possible combinations of remaining cards
            const combinations = this.generateCombinations(deck, needed);
            const totalCombinations = combinations.length;
            
            console.log(`Počet hráčů: ${activePlayers.length}, Zbývající karty: ${deck.length}, Potřebné karty: ${needed}`);
            console.log(`Celkový počet kombinací: ${totalCombinations.toLocaleString()}`);
            
            const batchSize = Math.max(1000, Math.floor(totalCombinations / 100)); // Update progress every 1%
            
            for (let i = 0; i < totalCombinations; i++) {
                const combination = combinations[i];
                const completedBoard = [
                    ...this.communityCards.map(card => ({ value: card.value, suit: card.suit })),
                    ...combination
                ];
                
                // Record hand statistics for each player
                activePlayers.forEach((player, index) => {
                    const hand = this.evaluateHand([...player.cards, ...completedBoard]);
                    const handName = this.getHandDisplayName(hand.name);
                    if (results[index].handStats[handName] !== undefined) {
                        results[index].handStats[handName]++;
                    }
                });
                
                const winner = this.evaluateWinner(activePlayers, completedBoard);
                
                if (winner === 'tie') {
                    results.forEach(r => r.ties++);
                } else {
                    results[winner].wins++;
                }
                results.forEach(r => r.total++);
                
                // Update progress
                if (i % batchSize === 0 || i === totalCombinations - 1) {
                    const progress = ((i + 1) / totalCombinations) * 100;
                    document.getElementById('progressFill').style.width = `${progress}%`;
                    
                    // Allow UI to update
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
        }
        
        return results;
    }
    

    
    // Helper function to generate combinations for board completion
    generateCombinations(deck, r) {
        const combinations = [];
        
        function backtrack(start, current) {
            if (current.length === r) {
                combinations.push([...current]);
                return;
            }
            
            for (let i = start; i < deck.length; i++) {
                current.push(deck[i]);
                backtrack(i + 1, current);
                current.pop();
            }
        }
        
        backtrack(0, []);
        return combinations;
    }
    
    evaluateWinner(activePlayers, completedBoard) {
        // Evaluate each player's hand
        const playerHands = activePlayers.map(player => ({
            player,
            hand: this.evaluateHand([...player.cards, ...completedBoard])
        }));
        
        // Find winner
        return this.findWinner(playerHands);
    }
    
    createDeck() {
        const deck = [];
        for (const value of this.cardValues) {
            for (const suit of this.cardSuits) {
                const cardString = `${value}${suit}`;
                if (!this.selectedCards.has(cardString)) {
                    deck.push({ value, suit });
                }
            }
        }
        return deck;
    }
    
    completeBoard(deck) {
        const board = this.communityCards.map(card => ({ value: card.value, suit: card.suit }));
        const needed = 5 - board.length;
        
        for (let i = 0; i < needed; i++) {
            const randomIndex = Math.floor(Math.random() * deck.length);
            board.push(deck.splice(randomIndex, 1)[0]);
        }
        
        return board;
    }
    
    evaluateHand(cards) {
        // Generate all possible 5-card combinations from the 7 cards
        const combinations = this.generateCombinations(cards, 5);
        
        let bestHand = null;
        
        // Evaluate each 5-card combination and find the best one
        combinations.forEach(combo => {
            const values = combo.map(c => this.getCardValue(c.value));
            const suits = combo.map(c => c.suit);
            
            // Count value frequencies
            const valueCounts = {};
            values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
            
            // Get sorted values for kicker comparison
            const sortedValues = [...values].sort((a, b) => b - a);
            
            // Check for flush
            const flush = this.checkFlush(suits);
            
            // Check for straight
            const straight = this.checkStraight(values);
            
            let currentHand = null;
            
            // Determine hand rank and get kickers
            if (flush && straight) {
                const straightHigh = this.getStraightHigh(values);
                // Check for Royal Flush: exactly 10-J-Q-K-A of the same suit
                const isRoyal = this.isRoyalFlush(values, suits);
                currentHand = { 
                    rank: isRoyal ? 9 : 8, 
                    name: isRoyal ? 'Royal Flush' : 'Straight Flush', 
                    kickers: [straightHigh]
                };
            } else if (this.hasFourOfAKind(valueCounts)) {
                const fourValue = this.getFourOfAKindValue(valueCounts);
                const kicker = sortedValues.find(v => v !== fourValue);
                currentHand = { 
                    rank: 7, 
                    name: 'Four of a Kind', 
                    kickers: [fourValue, kicker]
                };
            } else if (this.hasFullHouse(valueCounts)) {
                const threeValue = this.getThreeOfAKindValue(valueCounts);
                const pairValue = this.getPairValue(valueCounts, threeValue);
                currentHand = { 
                    rank: 6, 
                    name: 'Full House', 
                    kickers: [threeValue, pairValue]
                };
            } else if (flush) {
                const flushValues = this.getFlushValues(values, suits);
                currentHand = { 
                    rank: 5, 
                    name: 'Flush', 
                    kickers: flushValues
                };
            } else if (straight) {
                const straightHigh = this.getStraightHigh(values);
                currentHand = { 
                    rank: 4, 
                    name: 'Straight', 
                    kickers: [straightHigh]
                };
            } else if (this.hasThreeOfAKind(valueCounts)) {
                const threeValue = this.getThreeOfAKindValue(valueCounts);
                const kickers = sortedValues.filter(v => v !== threeValue).slice(0, 2);
                currentHand = { 
                    rank: 3, 
                    name: 'Three of a Kind', 
                    kickers: [threeValue, ...kickers]
                };
            } else if (this.hasTwoPair(valueCounts)) {
                const pairs = this.getTwoPairValues(valueCounts);
                const kicker = sortedValues.find(v => !pairs.includes(v)) || 0;
                currentHand = { 
                    rank: 2, 
                    name: 'Two Pair', 
                    kickers: [...pairs, kicker]
                };
            } else if (this.hasOnePair(valueCounts)) {
                const pairValue = this.getPairValue(valueCounts);
                const kickers = sortedValues.filter(v => v !== pairValue).slice(0, 3);
                currentHand = { 
                    rank: 1, 
                    name: 'One Pair', 
                    kickers: [pairValue, ...kickers]
                };
            } else {
                // High card
                currentHand = { 
                    rank: 0, 
                    name: 'High Card', 
                    kickers: sortedValues.slice(0, 5)
                };
            }
            
            // Update best hand if current is better
            if (!bestHand || this.isBetterHand(currentHand, bestHand)) {
                bestHand = currentHand;
            }
        });
        
        return bestHand;
    }
    
    // Helper function to generate combinations of cards
    generateCombinations(cards, r) {
        const combinations = [];
        
        function backtrack(start, current) {
            if (current.length === r) {
                combinations.push([...current]);
                return;
            }
            
            for (let i = start; i < cards.length; i++) {
                current.push(cards[i]);
                backtrack(i + 1, current);
                current.pop();
            }
        }
        
        backtrack(0, []);
        return combinations;
    }
    
    // Helper function to compare hands
    isBetterHand(hand1, hand2) {
        if (hand1.rank !== hand2.rank) {
            return hand1.rank > hand2.rank;
        }
        
        // Same rank, compare kickers
        const maxKickerLength = Math.max(hand1.kickers.length, hand2.kickers.length);
        
        for (let i = 0; i < maxKickerLength; i++) {
            const kicker1 = hand1.kickers[i] || 0;
            const kicker2 = hand2.kickers[i] || 0;
            
            if (kicker1 !== kicker2) {
                return kicker1 > kicker2;
            }
        }
        
        return false; // Hands are equal
    }
    
    getCardValue(value) {
        const valueMap = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return valueMap[value];
    }
    
    isRoyalFlush(values, suits) {
        // Check if we have exactly 10-J-Q-K-A of the same suit
        const royalValues = [10, 11, 12, 13, 14];
        
        // Check if we have exactly these 5 values
        const hasAllRoyalValues = royalValues.every(value => values.includes(value));
        if (!hasAllRoyalValues) return false;
        
        // Check if all 5 cards are of the same suit
        const royalCards = [];
        for (let i = 0; i < values.length; i++) {
            if (royalValues.includes(values[i])) {
                royalCards.push(suits[i]);
            }
        }
        
        // All royal cards must be of the same suit
        return royalCards.length === 5 && royalCards.every(suit => suit === royalCards[0]);
    }
    
    checkFlush(suits) {
        const suitCounts = {};
        suits.forEach(suit => suitCounts[suit] = (suitCounts[suit] || 0) + 1);
        return Object.values(suitCounts).some(count => count >= 5);
    }
    
    checkStraight(values) {
        const sortedValues = [...new Set(values)].sort((a, b) => a - b);
        
        // Check for regular straight (excluding wheel)
        for (let i = 0; i <= sortedValues.length - 5; i++) {
            if (sortedValues[i + 4] - sortedValues[i] === 4) {
                return true;
            }
        }
        
        // Check for wheel (A-2-3-4-5) - Ace can only be used as low card
        if (sortedValues.includes(14)) { // Ace
            const lowValues = sortedValues.filter(v => v <= 5 || v === 14);
            if (lowValues.length >= 5) {
                const lowStraight = [2, 3, 4, 5, 14];
                if (lowStraight.every(v => lowValues.includes(v))) {
                    return true;
                }
            }
            
            // Check for high straight (A-K-Q-J-10) - Ace can only be used as high card
            const highValues = sortedValues.filter(v => v >= 10 || v === 14);
            if (highValues.length >= 5) {
                const highStraight = [10, 11, 12, 13, 14];
                if (highStraight.every(v => highValues.includes(v))) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    hasFourOfAKind(valueCounts) {
        return Object.values(valueCounts).some(count => count === 4);
    }
    
    hasFullHouse(valueCounts) {
        const counts = Object.values(valueCounts).sort((a, b) => b - a);
        return counts.length >= 2 && counts[0] === 3 && counts[1] === 2;
    }
    
    hasThreeOfAKind(valueCounts) {
        return Object.values(valueCounts).some(count => count === 3);
    }
    
    hasTwoPair(valueCounts) {
        const pairs = Object.values(valueCounts).filter(count => count === 2);
        return pairs.length >= 2;
    }
    
    hasOnePair(valueCounts) {
        return Object.values(valueCounts).some(count => count === 2);
    }
    
    // Helper functions for getting kickers
    getStraightHigh(values) {
        const sortedValues = [...new Set(values)].sort((a, b) => a - b);
        
        // Check for wheel (A-2-3-4-5) - Ace can only be used as low card
        if (sortedValues.includes(14)) { // Ace
            const lowValues = sortedValues.filter(v => v <= 5 || v === 14);
            if (lowValues.length >= 5) {
                const lowStraight = [2, 3, 4, 5, 14];
                if (lowStraight.every(v => lowValues.includes(v))) {
                    return 5; // Wheel straight high is 5, not Ace
                }
            }
            
            // Check for high straight (A-K-Q-J-10) - Ace can only be used as high card
            const highValues = sortedValues.filter(v => v >= 10 || v === 14);
            if (highValues.length >= 5) {
                const highStraight = [10, 11, 12, 13, 14];
                if (highStraight.every(v => highValues.includes(v))) {
                    return 14; // High straight high is Ace
                }
            }
        }
        
        // Regular straight - find the highest card
        for (let i = 0; i <= sortedValues.length - 5; i++) {
            if (sortedValues[i + 4] - sortedValues[i] === 4) {
                return sortedValues[i + 4];
            }
        }
        
        // If no straight found, return highest card (for high card hands)
        return sortedValues[sortedValues.length - 1];
    }
    
    getFourOfAKindValue(valueCounts) {
        for (const [value, count] of Object.entries(valueCounts)) {
            if (count === 4) return parseInt(value);
        }
        return 0;
    }
    
    getThreeOfAKindValue(valueCounts) {
        for (const [value, count] of Object.entries(valueCounts)) {
            if (count === 3) return parseInt(value);
        }
        return 0;
    }
    
    getPairValue(valueCounts, excludeValue = null) {
        const pairs = [];
        for (const [value, count] of Object.entries(valueCounts)) {
            if (count === 2 && parseInt(value) !== excludeValue) {
                pairs.push(parseInt(value));
            }
        }
        return pairs.length > 0 ? Math.max(...pairs) : 0;
    }
    
    getTwoPairValues(valueCounts) {
        const pairs = [];
        for (const [value, count] of Object.entries(valueCounts)) {
            if (count === 2) {
                pairs.push(parseInt(value));
            }
        }
        return pairs.sort((a, b) => b - a).slice(0, 2); // Higher pair first, only first 2 pairs
    }
    
    getFlushValues(values, suits) {
        const suitCounts = {};
        suits.forEach(suit => suitCounts[suit] = (suitCounts[suit] || 0) + 1);
        
        const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5);
        if (!flushSuit) return [];
        
        const flushCards = [];
        for (let i = 0; i < values.length; i++) {
            if (suits[i] === flushSuit) {
                flushCards.push(values[i]);
            }
        }
        
        // Return the 5 highest cards of the flush suit for kicker comparison
        return flushCards.sort((a, b) => b - a).slice(0, 5);
    }
    
    findWinner(playerHands) {
        let bestRank = -1;
        let bestHands = [];
        
        // Find the highest hand rank
        playerHands.forEach(({ player, hand }) => {
            if (hand.rank > bestRank) {
                bestRank = hand.rank;
                bestHands = [{ player, hand }];
            } else if (hand.rank === bestRank) {
                bestHands.push({ player, hand });
            }
        });
        
        if (bestHands.length === 1) {
            return this.players.indexOf(bestHands[0].player);
        } else {
            // Multiple players with same hand rank - need to compare kickers
            const winner = this.compareHands(bestHands);
            if (winner === 'tie') {
                return 'tie';
            } else {
                return this.players.indexOf(winner);
            }
        }
    }
    
    compareHands(hands) {
        // Compare kickers according to poker rules
        const maxKickerLength = Math.max(...hands.map(h => h.hand.kickers.length));
        
        for (let i = 0; i < maxKickerLength; i++) {
            let maxValue = -1;
            let winners = [];
            
            hands.forEach(({ player, hand }) => {
                const kickerValue = hand.kickers[i] || 0;
                if (kickerValue > maxValue) {
                    maxValue = kickerValue;
                    winners = [player];
                } else if (kickerValue === maxValue) {
                    winners.push(player);
                }
            });
            
            if (winners.length === 1) {
                return winners[0];
            }
        }
        
        return 'tie';
    }
    
    getHandDisplayName(handName) {
        const nameMap = {
            'Straight Flush': 'Straight flush',
            'Four of a Kind': 'Four-of-a-Kind',
            'Full House': 'Full house',
            'Flush': 'Flush',
            'Straight': 'Straight',
            'Three of a Kind': 'Three-of-a-Kind',
            'Two Pair': 'Two pair',
            'One Pair': 'One pair',
            'High Card': 'High card'
        };
        return nameMap[handName] || handName;
    }
    

    
    calculateTotalCombinations() {
        const activePlayers = this.players.filter(p => p.active && p.cards[0] && p.cards[1]);
        const deck = this.createDeck();
        const needed = 5 - this.communityCards.length;
        
        if (needed === 0) {
            return 1;
        }
        
        // Calculate C(deck.length, needed)
        let numerator = 1;
        let denominator = 1;
        
        for (let i = 0; i < needed; i++) {
            numerator *= (deck.length - i);
            denominator *= (i + 1);
        }
        
        return numerator / denominator;
    }
    
    displayResults(results, calculationTime) {
        const resultsSection = document.getElementById('resultsSection');
        const handRanksTable = document.getElementById('handRanksTable');
        
        // Update info
        const totalCombinations = this.calculateTotalCombinations();
        const activePlayers = this.players.filter(p => p.active && p.cards[0] && p.cards[1]);
        const deckSize = this.createDeck().length;
        const neededCards = 5 - this.communityCards.length;
        
        document.getElementById('simulationInfo').textContent = `${totalCombinations.toLocaleString()} (${activePlayers.length} hráčů, ${deckSize} karet, ${neededCards} potřebných)`;
        document.getElementById('calculationTime').textContent = `${calculationTime.toFixed(2)}ms`;
        
        // Calculate overall statistics (assuming first player is "You")
        const youResult = results[0];
        const othersResults = results.slice(1);
        
        const youWinPercent = ((youResult.wins / youResult.total) * 100).toFixed(2);
        const youTiePercent = ((youResult.ties / youResult.total) * 100).toFixed(2);
        
        // Calculate others as sum of all remaining players
        const othersWins = othersResults.reduce((sum, r) => sum + r.wins, 0);
        const othersTies = othersResults.reduce((sum, r) => sum + r.ties, 0);
        
        // Use the same total as "you" for consistent calculation
        const othersWinPercent = ((othersWins / youResult.total) * 100).toFixed(2);
        const othersTiePercent = ((othersTies / youResult.total) * 100).toFixed(2);
        
        // Update overview statistics
        document.getElementById('youWinPercent').textContent = `${youWinPercent}%`;
        document.getElementById('youTiePercent').textContent = `${youTiePercent}%`;
        document.getElementById('othersWinPercent').textContent = `${othersWinPercent}%`;
        document.getElementById('othersTiePercent').textContent = `${othersTiePercent}%`;
        
        // Create hand ranks table
        const handRanks = [
            'Royal flush',
            'Straight flush',
            'Four-of-a-Kind', 
            'Full house',
            'Flush',
            'Straight',
            'Three-of-a-Kind',
            'Two pair',
            'One pair',
            'High card'
        ];
        
        handRanksTable.innerHTML = '';
        
        handRanks.forEach(rank => {
            const rankRow = document.createElement('div');
            rankRow.className = 'hand-rank-row';
            
            // Calculate actual statistics from results
            const youRankCount = youResult.handStats[rank] || 0;
            const othersRankCount = othersResults.reduce((sum, r) => sum + (r.handStats[rank] || 0), 0);
            
            const youRankPercent = ((youRankCount / youResult.total) * 100).toFixed(2);
            const othersRankPercent = ((othersRankCount / youResult.total) * 100).toFixed(2);
            
            rankRow.innerHTML = `
                <div class="rank-name">${rank}</div>
                <div class="rank-value you">${youRankPercent}%</div>
                <div class="rank-value others">${othersRankPercent}%</div>
            `;
            
            handRanksTable.appendChild(rankRow);
        });
        
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
        document.getElementById('progressFill').style.width = '0%';
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}

// Initialize the application
let pokerCalculator;

document.addEventListener('DOMContentLoaded', () => {
    pokerCalculator = new PokerCalculator();
}); 