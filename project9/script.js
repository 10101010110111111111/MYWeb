// Poker Calculator Application
class PokerCalculator {
    constructor() {
        this.players = [];
        this.communityCards = [];
        this.selectedCards = new Set();
        this.currentPlayerCount = 9;
        this.simulationCount = 5000;
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
        
        // Simulation count change
        document.getElementById('simulationCount').addEventListener('change', (e) => {
            this.simulationCount = parseInt(e.target.value);
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
        
        // Card picker modal
        document.getElementById('closeCardPicker').addEventListener('click', () => {
            this.closeCardPicker();
        });
        
        // Card picker buttons
        document.querySelectorAll('.value-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCardValue(e.target.dataset.value);
            });
        });
        
        document.querySelectorAll('.suit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCardSuit(e.target.dataset.suit);
            });
        });
        
        // Modal backdrop click
        document.getElementById('cardPickerModal').addEventListener('click', (e) => {
            if (e.target.id === 'cardPickerModal') {
                this.closeCardPicker();
            }
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
        document.getElementById('cardPickerModal').style.display = 'flex';
        
        // Reset selections
        document.querySelectorAll('.value-btn, .suit-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    
    closeCardPicker() {
        document.getElementById('cardPickerModal').style.display = 'none';
        this.cardPickerTarget = null;
    }
    
    selectCardValue(value) {
        document.querySelectorAll('.value-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
        
        // Check if we have both value and suit selected
        const selectedValue = document.querySelector('.value-btn.selected');
        const selectedSuit = document.querySelector('.suit-btn.selected');
        
        if (selectedValue && selectedSuit) {
            this.setCard(selectedValue.dataset.value, selectedSuit.dataset.suit);
        }
    }
    
    selectCardSuit(suit) {
        document.querySelectorAll('.suit-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
        
        // Check if we have both value and suit selected
        const selectedValue = document.querySelector('.value-btn.selected');
        const selectedSuit = document.querySelector('.suit-btn.selected');
        
        if (selectedValue && selectedSuit) {
            this.setCard(selectedValue.dataset.value, selectedSuit.dataset.suit);
        }
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
        
        // Generate random community cards (flop only)
        for (let i = 0; i < 3; i++) {
            const card = this.getRandomCard();
            const position = `flop${i + 1}`;
            this.communityCards.push({ ...card, position });
            this.selectedCards.add(`${card.value}${card.suit}`);
        }
        
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
        const results = await this.runMonteCarloSimulation(activePlayers);
        const endTime = performance.now();
        
        this.hideLoading();
        this.displayResults(results, endTime - startTime);
    }
    
    async runMonteCarloSimulation(activePlayers) {
        const results = activePlayers.map(player => ({
            player,
            wins: 0,
            ties: 0,
            total: 0
        }));
        
        const batchSize = 100;
        const totalBatches = Math.ceil(this.simulationCount / batchSize);
        
        for (let batch = 0; batch < totalBatches; batch++) {
            const currentBatchSize = Math.min(batchSize, this.simulationCount - batch * batchSize);
            
            for (let i = 0; i < currentBatchSize; i++) {
                const winner = this.simulateHand(activePlayers);
                
                if (winner === 'tie') {
                    results.forEach(r => r.ties++);
                } else {
                    results[winner].wins++;
                }
                
                results.forEach(r => r.total++);
            }
            
            // Update progress
            const progress = ((batch + 1) / totalBatches) * 100;
            document.getElementById('progressFill').style.width = `${progress}%`;
            
            // Allow UI to update
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        return results;
    }
    
    simulateHand(activePlayers) {
        // Create deck with remaining cards
        const deck = this.createDeck();
        
        // Complete community cards if needed
        const completedBoard = this.completeBoard(deck);
        
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
        const board = [...this.communityCards];
        const needed = 5 - board.length;
        
        for (let i = 0; i < needed; i++) {
            const randomIndex = Math.floor(Math.random() * deck.length);
            board.push(deck.splice(randomIndex, 1)[0]);
        }
        
        return board;
    }
    
    evaluateHand(cards) {
        // Simple hand evaluation - in a real implementation, you'd use a proper poker library
        // This is a simplified version for demonstration
        const values = cards.map(c => this.getCardValue(c.value));
        const suits = cards.map(c => c.suit);
        
        // Check for flush
        const flush = this.checkFlush(suits);
        
        // Check for straight
        const straight = this.checkStraight(values);
        
        // Count value frequencies
        const valueCounts = {};
        values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
        
        // Determine hand rank
        if (flush && straight) return { rank: 8, name: 'Straight Flush' };
        if (this.hasFourOfAKind(valueCounts)) return { rank: 7, name: 'Four of a Kind' };
        if (this.hasFullHouse(valueCounts)) return { rank: 6, name: 'Full House' };
        if (flush) return { rank: 5, name: 'Flush' };
        if (straight) return { rank: 4, name: 'Straight' };
        if (this.hasThreeOfAKind(valueCounts)) return { rank: 3, name: 'Three of a Kind' };
        if (this.hasTwoPair(valueCounts)) return { rank: 2, name: 'Two Pair' };
        if (this.hasOnePair(valueCounts)) return { rank: 1, name: 'One Pair' };
        
        return { rank: 0, name: 'High Card' };
    }
    
    getCardValue(value) {
        const valueMap = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return valueMap[value];
    }
    
    checkFlush(suits) {
        const suitCounts = {};
        suits.forEach(suit => suitCounts[suit] = (suitCounts[suit] || 0) + 1);
        return Object.values(suitCounts).some(count => count >= 5);
    }
    
    checkStraight(values) {
        const sortedValues = [...new Set(values)].sort((a, b) => a - b);
        for (let i = 0; i <= sortedValues.length - 5; i++) {
            if (sortedValues[i + 4] - sortedValues[i] === 4) {
                return true;
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
    
    findWinner(playerHands) {
        let bestRank = -1;
        let winners = [];
        
        playerHands.forEach(({ player, hand }) => {
            if (hand.rank > bestRank) {
                bestRank = hand.rank;
                winners = [player];
            } else if (hand.rank === bestRank) {
                winners.push(player);
            }
        });
        
        if (winners.length === 1) {
            return this.players.indexOf(winners[0]);
        } else {
            return 'tie';
        }
    }
    
    displayResults(results, calculationTime) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsTable = document.getElementById('resultsTable');
        
        // Update info
        document.getElementById('simulationInfo').textContent = this.simulationCount.toLocaleString();
        document.getElementById('calculationTime').textContent = `${calculationTime.toFixed(2)}ms`;
        
        // Create results table
        resultsTable.innerHTML = `
            <div class="result-row result-header">
                <div>Hráč</div>
                <div>Karty</div>
                <div>Výhra</div>
                <div>Remíza</div>
                <div>Prohra</div>
            </div>
        `;
        
        results.forEach(result => {
            const winPercent = ((result.wins / result.total) * 100).toFixed(1);
            const tiePercent = ((result.ties / result.total) * 100).toFixed(1);
            const losePercent = (((result.total - result.wins - result.ties) / result.total) * 100).toFixed(1);
            
            const resultRow = document.createElement('div');
            resultRow.className = 'result-row';
            resultRow.innerHTML = `
                <div class="player-name">${result.player.name}</div>
                <div class="player-cards">
                    ${this.renderCard(result.player.cards[0])}
                    ${this.renderCard(result.player.cards[1])}
                </div>
                <div class="probability-cell">
                    <div class="probability-bar">
                        <div class="probability-fill win" style="width: ${winPercent}%"></div>
                        <div class="probability-text">${winPercent}%</div>
                    </div>
                </div>
                <div class="probability-cell">
                    <div class="probability-bar">
                        <div class="probability-fill tie" style="width: ${tiePercent}%"></div>
                        <div class="probability-text">${tiePercent}%</div>
                    </div>
                </div>
                <div class="probability-cell">
                    <div class="probability-bar">
                        <div class="probability-fill lose" style="width: ${losePercent}%"></div>
                        <div class="probability-text">${losePercent}%</div>
                    </div>
                </div>
            `;
            
            // Highlight winner
            if (parseFloat(winPercent) > 50) {
                resultRow.classList.add('winner');
            }
            
            resultsTable.appendChild(resultRow);
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