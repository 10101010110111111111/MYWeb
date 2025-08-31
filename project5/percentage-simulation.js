class PercentageSimulationManager {
  constructor(mainSimulation) {
    this.mainSimulation = mainSimulation
    this.isRunning = false
    this.isPaused = false
    this.totalHands = 0
    this.completedHands = 0
    this.startTime = null
    this.lastUpdateTime = null
    this.handsPerSecond = 0
    
    // Deck management
    this.currentDeck = []
    this.runningCount = 0
    this.cardsDealt = 0
    this.shufflePoint = 0 // When to shuffle (halfway through)
    
    // Results tracking by true count
    this.results = {}
    this.initializeResults()
    
    this.initializeElements()
    this.setupEventListeners()
  }

  initializeResults() {
    // Initialize results for all possible true counts (-10 to +10)
    for (let tc = -10; tc <= 10; tc++) {
      this.results[tc] = {
        hands: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        blackjacks: 0,
        // EV tracking
        totalNetUnits: 0, // Sum of net units won/lost
        totalInitialBets: 0, // Sum of initial bets (for weighted average)
        ev: 0 // Expected Value in %
      }
    }
  }

  initializeElements() {
    this.elements = {
      percentageSimHands: document.getElementById("percentageSimHands"),
      percentageSimStrategy: document.getElementById("percentageSimStrategy"),
      percentageSimCounting: document.getElementById("percentageSimCounting"),
      percentageSimDecks: document.getElementById("percentageSimDecks"),
      percentageSimShuffle: document.getElementById("percentageSimShuffle"),
      startPercentageSimBtn: document.getElementById("startPercentageSimBtn"),
      stopPercentageSimBtn: document.getElementById("stopPercentageSimBtn"),
      percentageProgressSection: document.getElementById("percentageProgressSection"),
      simConfig: document.getElementById("simConfig"),
      percentageHandsCompleted: document.getElementById("percentageHandsCompleted"),
      percentageHandsRemaining: document.getElementById("percentageHandsRemaining"),
      percentageSimSpeed: document.getElementById("percentageSimSpeed"),
      percentageProgressFill: document.getElementById("percentageProgressFill"),
      percentageProgressText: document.getElementById("percentageProgressText"),
      percentageResultsSection: document.getElementById("percentageResultsSection"),
      totalPercentageHands: document.getElementById("totalPercentageHands"),
      overallPercentageWinRate: document.getElementById("overallPercentageWinRate"),
      percentageSimTime: document.getElementById("percentageSimTime"),
      percentageResultsBody: document.getElementById("percentageResultsBody"),
      expandAllResultsBtn: document.getElementById("expandAllResultsBtn"),
      expandedResults: document.getElementById("expandedResults"),
      expandedResultsBody: document.getElementById("expandedResultsBody")
    }
  }

  setupEventListeners() {
    // Add null checks for UI elements
    if (this.elements.startPercentageSimBtn) {
      this.elements.startPercentageSimBtn.addEventListener("click", () => this.startSimulation())
    }
    if (this.elements.stopPercentageSimBtn) {
      this.elements.stopPercentageSimBtn.addEventListener("click", () => this.stopSimulation())
    }
    if (this.elements.expandAllResultsBtn) {
      this.elements.expandAllResultsBtn.addEventListener("click", () => this.toggleExpandedResults())
    }
    
    // Quick option buttons
    document.querySelectorAll('.quick-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const value = parseInt(e.target.dataset.value)
        if (this.elements.percentageSimHands) {
          this.elements.percentageSimHands.value = value
        }
        this.updateQuickOptionButtons(value)
      })
    })
  }

  updateQuickOptionButtons(activeValue) {
    document.querySelectorAll('.quick-option-btn').forEach(btn => {
      btn.classList.remove('active')
      if (parseInt(btn.dataset.value) === activeValue) {
        btn.classList.add('active')
      }
    })
  }

  updateConfigurationDisplay() {
    const deckCount = this.elements.percentageSimDecks.value
    const shufflePoint = (parseFloat(this.elements.percentageSimShuffle.value) * 100).toFixed(0)
    const countingSystem = this.elements.percentageSimCounting.options[this.elements.percentageSimCounting.selectedIndex].text
    
    const configText = `${deckCount} Deck${deckCount > 1 ? 's' : ''}, ${shufflePoint}% Shuffle, ${countingSystem}`
    this.elements.simConfig.textContent = configText
  }

  startSimulation() {
    if (this.isRunning) return

    const handsToSimulate = parseInt(this.elements.percentageSimHands.value)
    if (handsToSimulate < 100000) {
      alert("Minimum 100,000 hands required for percentage simulation")
      return
    }

    this.totalHands = handsToSimulate
    this.completedHands = 0
    this.startTime = Date.now()
    this.lastUpdateTime = this.startTime
    this.isRunning = true
    this.isPaused = false

    // Initialize deck and counting
    this.initializeDeck()
    this.runningCount = 0
    this.cardsDealt = 0

    // Reset results
    this.initializeResults()

    // Update UI
    this.elements.startPercentageSimBtn.disabled = true
    this.elements.stopPercentageSimBtn.disabled = false
    this.elements.percentageProgressSection.style.display = "block"
    this.elements.percentageResultsSection.style.display = "none"
    
    // Update configuration display
    this.updateConfigurationDisplay()

    // Start simulation in background
    this.runSimulation()
  }

  stopSimulation() {
    this.isRunning = false
    this.isPaused = true
    this.elements.startPercentageSimBtn.disabled = false
    this.elements.stopPercentageSimBtn.disabled = true
  }

  async runSimulation() {
    const batchSize = 1000 // Process 1000 hands at a time
    const updateInterval = 100 // Update UI every 100ms

    while (this.isRunning && this.completedHands < this.totalHands) {
      const handsToProcess = Math.min(batchSize, this.totalHands - this.completedHands)
      
      // Process batch of hands
      for (let i = 0; i < handsToProcess; i++) {
        if (!this.isRunning) break
        
        try {
          const result = this.simulateSingleHand()
          this.recordResult(result)
          this.completedHands++
        } catch (error) {
          console.error('Error in simulateSingleHand:', error)
          console.log('Current state:', {
            cardsDealt: this.cardsDealt,
            runningCount: this.runningCount,
            deckLength: this.currentDeck.length,
            shufflePoint: this.shufflePoint
          })
          break // Stop simulation on error
        }
      }

      // Update UI periodically
      if (this.completedHands % updateInterval === 0) {
        this.updateProgress()
        // Allow browser to process other tasks
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    if (this.completedHands >= this.totalHands) {
      this.completeSimulation()
    }
  }

  initializeDeck() {
    const deckCount = parseInt(this.elements.percentageSimDecks.value)
    const shufflePoint = parseFloat(this.elements.percentageSimShuffle.value)
    
    this.currentDeck = this.createDeck(deckCount)
    this.shuffleDeck(this.currentDeck)
    this.shufflePoint = Math.floor(this.currentDeck.length * shufflePoint)
  }

  simulateSingleHand() {
    // Deal initial cards (running count is updated in dealCard)
    const playerCards = [this.dealCard(), this.dealCard()]
    const dealerCards = [this.dealCard(), this.dealCard()]
    
    // Calculate true count AFTER dealing initial cards but BEFORE playing the hand
    // remainingDecks = number of cards left in deck / 52
    const remainingDecks = Math.max(this.currentDeck.length / 52, 1/52) // Safety: minimum 1 card
    const trueCount = this.runningCount / remainingDecks
    
    // Play hand according to strategy
    const result = this.playHand(playerCards, dealerCards, trueCount)
    
    // Check if we need to shuffle after completing the hand (at halfway point)
    if (this.cardsDealt >= this.shufflePoint) {
      // Mid-shoe shuffle: preserve running count for continuous shoe simulation
      this.shuffleDeck() // Shuffle current deck without recreating
      this.cardsDealt = 0 // Reset cards dealt counter
      // DON'T reset runningCount - keep continuous count
    }
    
    return {
      trueCount: Math.max(-10, Math.min(10, Math.floor(trueCount))), // Clamp to [-10, 10] range
      result: result
    }
  }
  
  

    dealCard() {
    if (this.currentDeck.length === 0) {
      // Create new deck but DON'T reset running count for continuous shoe simulation
      this.createNewDeck()
    }
    const card = this.currentDeck.pop()
    this.cardsDealt++
    
    // Update running count based on card value
    const countValue = this.getCardCountValue(card)
    this.runningCount += countValue
    
    return card
  }
  

  createDeck(deckCount = 8) {
    const suits = ['♠', '♥', '♦', '♣']
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const deck = []
    
    // Create specified number of decks
    for (let deckNum = 0; deckNum < deckCount; deckNum++) {
      for (const suit of suits) {
        for (const value of values) {
          deck.push({ suit, value })
        }
      }
    }
    
    return deck
  }

  createNewDeck() {
    // Create new deck without resetting running count (for continuous shoe)
    const deckCount = parseInt(this.elements.percentageSimDecks.value)
    this.currentDeck = this.createDeck(deckCount)
    this.shuffleDeck(this.currentDeck)
    // Don't reset runningCount or cardsDealt - keep continuous count
  }

  shuffleDeck(deck = null) {
    if (deck) {
      // Shuffle given deck
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        [deck[i], deck[j]] = [deck[j], deck[i]]
      }
    } else {
      // Shuffle currentDeck without recreating it
      for (let i = this.currentDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        [this.currentDeck[i], this.currentDeck[j]] = [this.currentDeck[j], this.currentDeck[i]]
      }
      // shufflePoint stays the same
    }
  }
  
  

  getCardCountValue(card) {
    const countingSystem = this.elements.percentageSimCounting.value
    const value = card.value
    
    switch (countingSystem) {
      case 'hilo':
        if (['2', '3', '4', '5', '6'].includes(value)) return 1
        if (['7', '8', '9'].includes(value)) return 0
        if (['10', 'J', 'Q', 'K', 'A'].includes(value)) return -1
        break
      case 'wong':
        if (value === '2') return 0.5
        if (value === '3') return 1
        if (value === '4') return 1
        if (value === '5') return 1.5
        if (value === '6') return 1
        if (value === '7') return 0.5
        if (value === '8') return 0
        if (value === '9') return -0.5
        if (['10', 'J', 'Q', 'K'].includes(value)) return -1
        if (value === 'A') return -1
        break
      case 'ko':
        if (['2', '3', '4', '5', '6', '7'].includes(value)) return 1
        if (['8', '9'].includes(value)) return 0
        if (['10', 'J', 'Q', 'K', 'A'].includes(value)) return -1
        break
      case 'hiopt1':
        if (['3', '4', '5', '6'].includes(value)) return 1
        if (['7', '8', '9'].includes(value)) return 0
        if (['2', '10', 'J', 'Q', 'K', 'A'].includes(value)) return -1
        break
      default:
        console.warn(`Unknown counting system: ${countingSystem}, using Hi-Lo`)
        // Fallback to Hi-Lo
        if (['2', '3', '4', '5', '6'].includes(value)) return 1
        if (['7', '8', '9'].includes(value)) return 0
        if (['10', 'J', 'Q', 'K', 'A'].includes(value)) return -1
        break
    }
    return 0
  }

  playHand(playerCards, dealerCards, trueCount) {
    const strategy = this.elements.percentageSimStrategy.value
    const tc = Math.floor(trueCount)
    
    // Check for blackjack first
    const playerBJ = this.isBlackjack(playerCards)
    const dealerBJ = this.isBlackjack(dealerCards)
    
    if (playerBJ && dealerBJ) {
      return 'push' // Both blackjack = push
    }
    if (playerBJ && !dealerBJ) {
      return 'blackjack' // Player blackjack wins 1.5:1
    }
    if (!playerBJ && dealerBJ) {
      return 'loss' // Dealer blackjack = immediate loss
    }
    
    // Handle insurance if dealer shows Ace
    let insuranceBet = 0
    if (dealerCards[0].value === 'A') {
      insuranceBet = this.handleInsurance(trueCount, strategy)
    }

    // Play player hand
    let playerValue = this.calculateHandValue(playerCards)
    while (playerValue < 21) {
      const action = this.getPlayerAction(playerCards, dealerCards[0], tc, strategy)
      if (action === 'stand') break
      if (action === 'double') {
        const newCard = this.dealCard()
        playerCards.push(newCard)
        break
      }
      if (action === 'hit') {
        const newCard = this.dealCard()
        playerCards.push(newCard)
        playerValue = this.calculateHandValue(playerCards)
      }
    }

    // Check for bust
    if (playerValue > 21) {
      return 'loss'
    }

    // Play dealer hand
    let dealerValue = this.calculateHandValue(dealerCards)
    while (dealerValue < 17) {
      const newCard = this.dealCard()
      dealerCards.push(newCard)
      dealerValue = this.calculateHandValue(dealerCards)
    }

    // Determine result
    if (dealerValue > 21) {
      return 'win'
    }
    if (playerValue > dealerValue) {
      return 'win'
    }
    if (playerValue < dealerValue) {
      return 'loss'
    }
    return 'push'
  }

  handleInsurance(trueCount, strategy) {
    const tc = Math.floor(trueCount)
    
    // Insurance strategy based on true count
    // Take insurance when true count >= 3 (basic strategy)
    if (tc >= 3) {
      return 0.5 // Insurance bet = 0.5x original bet
    }
    
    // For advanced strategy, we could add more sophisticated rules
    // but for percentage simulation, we'll use basic strategy
    return 0 // No insurance
  }

  getPlayerAction(playerCards, dealerUpCard, trueCount, strategy) {
    const playerValue = this.calculateHandValue(playerCards)
    const dealerValue = this.getCardValue(dealerUpCard)
    
    // Basic strategy decisions
    if (strategy === 'basic') {
      return this.getBasicStrategyAction(playerCards, dealerValue)
    } else {
      // Basic strategy + deviations
      return this.getAdvancedStrategyAction(playerCards, dealerValue, trueCount)
    }
  }

  getBasicStrategyAction(playerCards, dealerValue) {
    const playerValue = this.calculateHandValue(playerCards)
    const isSoft = this.isSoftHand(playerCards)
    
    // Hard totals
    if (!isSoft) {
      if (playerValue >= 17) return 'stand'
      if (playerValue <= 11) return 'hit'
      if (playerValue === 12) return dealerValue >= 4 && dealerValue <= 6 ? 'stand' : 'hit'
      if (playerValue === 13 || playerValue === 14 || playerValue === 15 || playerValue === 16) {
        return dealerValue >= 2 && dealerValue <= 6 ? 'stand' : 'hit'
      }
    }
    
    // Soft totals
    if (isSoft) {
      if (playerValue >= 19) return 'stand'
      if (playerValue === 18) return dealerValue >= 9 ? 'hit' : 'stand'
      if (playerValue === 17) return dealerValue >= 3 && dealerValue <= 6 ? 'double' : 'hit'
      if (playerValue === 16) return dealerValue >= 4 && dealerValue <= 6 ? 'double' : 'hit'
      if (playerValue === 15) return dealerValue >= 4 && dealerValue <= 6 ? 'double' : 'hit'
      if (playerValue === 14) return dealerValue >= 5 && dealerValue <= 6 ? 'double' : 'hit'
      if (playerValue === 13) return dealerValue >= 5 && dealerValue <= 6 ? 'double' : 'hit'
    }
    
    return 'hit'
  }

  getAdvancedStrategyAction(playerCards, dealerValue, trueCount) {
    // Start with basic strategy
    let action = this.getBasicStrategyAction(playerCards, dealerValue)
    
    // Apply deviations based on true count
    const deviations = this.getDeviations(playerCards, dealerValue, trueCount)
    if (deviations) {
      action = deviations
    }
    
    return action
  }

  getDeviations(playerCards, dealerValue, trueCount) {
    const playerValue = this.calculateHandValue(playerCards)
    const isSoft = this.isSoftHand(playerCards)
    const tc = Math.floor(trueCount)
    
    // Illustrious 18 deviations (simplified)
    if (!isSoft) {
      // 16 vs 10: Stand at TC >= 0
      if (playerValue === 16 && dealerValue === 10 && tc >= 0) return 'stand'
      
      // 15 vs 10: Stand at TC >= 4
      if (playerValue === 15 && dealerValue === 10 && tc >= 4) return 'stand'
      
      // 12 vs 2: Stand at TC >= 3
      if (playerValue === 12 && dealerValue === 2 && tc >= 3) return 'stand'
      
      // 12 vs 3: Stand at TC >= 2
      if (playerValue === 12 && dealerValue === 3 && tc >= 2) return 'stand'
      
      // 11 vs A: Double at TC >= 1
      if (playerValue === 11 && dealerValue === 11 && tc >= 1) return 'double'
      
      // 10 vs 10: Double at TC >= 4
      if (playerValue === 10 && dealerValue === 10 && tc >= 4) return 'double'
      
      // 10 vs A: Double at TC >= 4
      if (playerValue === 10 && dealerValue === 11 && tc >= 4) return 'double'
      
      // 9 vs 2: Double at TC >= 1
      if (playerValue === 9 && dealerValue === 2 && tc >= 1) return 'double'
      
      // 9 vs 7: Double at TC >= 3
      if (playerValue === 9 && dealerValue === 7 && tc >= 3) return 'double'
    }
    
    return null // No deviation applies
  }

  recordResult(result) {
    const tc = result.trueCount
    if (tc >= -10 && tc <= 10) {
      this.results[tc].hands++
      
      // Calculate net units for EV
      let netUnits = 0
      const initialBet = 1 // Standard 1 unit bet for percentage simulation
      
      if (result.result === 'blackjack') {
        this.results[tc].blackjacks++
        this.results[tc].wins++
        netUnits = 1.5 // Blackjack pays 3:2 = 1.5 units
      } else if (result.result === 'win') {
        this.results[tc].wins++
        netUnits = 1 // Regular win pays 1:1 = 1 unit
      } else if (result.result === 'loss') {
        this.results[tc].losses++
        netUnits = -1 // Loss = -1 unit
      } else if (result.result === 'push') {
        this.results[tc].pushes++
        netUnits = 0 // Push = 0 units
      }
      
      // Update EV tracking
      this.results[tc].totalNetUnits += netUnits
      this.results[tc].totalInitialBets += initialBet
      
      // Calculate current EV
      if (this.results[tc].totalInitialBets > 0) {
        this.results[tc].ev = (this.results[tc].totalNetUnits / this.results[tc].totalInitialBets) * 100
      }
    }
  }

  updateProgress() {
    const now = Date.now()
    const elapsed = (now - this.startTime) / 1000
    const progress = (this.completedHands / this.totalHands) * 100
    
    // Calculate hands per second
    if (elapsed > 0) {
      this.handsPerSecond = Math.round(this.completedHands / elapsed)
    }
    
    // Update UI
    this.elements.percentageHandsCompleted.textContent = this.completedHands.toLocaleString()
    this.elements.percentageHandsRemaining.textContent = (this.totalHands - this.completedHands).toLocaleString()
    this.elements.percentageSimSpeed.textContent = this.handsPerSecond.toLocaleString()
    this.elements.percentageProgressFill.style.width = `${progress}%`
    this.elements.percentageProgressText.textContent = `${progress.toFixed(2)}% Complete`
  }

  completeSimulation() {
    this.isRunning = false
    this.elements.startPercentageSimBtn.disabled = false
    this.elements.stopPercentageSimBtn.disabled = true
    this.elements.percentageResultsSection.style.display = "block"
    
    // Calculate final statistics
    const totalTime = (Date.now() - this.startTime) / 1000
    let totalWins = 0
    let totalHands = 0
    
    for (let tc = -10; tc <= 10; tc++) {
      totalWins += this.results[tc].wins
      totalHands += this.results[tc].hands
    }
    
    const overallWinRate = totalHands > 0 ? (totalWins / totalHands) * 100 : 0
    
    // Update summary
    this.elements.totalPercentageHands.textContent = totalHands.toLocaleString()
    this.elements.overallPercentageWinRate.textContent = `${overallWinRate.toFixed(4)}%`
    this.elements.percentageSimTime.textContent = `${totalTime.toFixed(1)}s`
    
    // Display results
    this.displayResults()
  }

  displayResults() {
    const tbody = this.elements.percentageResultsBody
    tbody.innerHTML = ''
    
    // Calculate total hands for frequency calculation
    const totalHands = this.completedHands
    
    // Show results for true counts -5 to +5
    for (let tc = -5; tc <= 5; tc++) {
      const result = this.results[tc]
      if (result.hands > 0) {
        const winRate = (result.wins / result.hands) * 100
        const frequency = (result.hands / totalHands) * 100
        const evClass = result.ev >= 0 ? 'positive-ev' : 'negative-ev'
        const row = document.createElement('tr')
        row.innerHTML = `
          <td>${tc}</td>
          <td>${result.hands.toLocaleString()}</td>
          <td class="frequency">${frequency.toFixed(2)}%</td>
          <td class="ev-value ${evClass}">${result.ev.toFixed(4)}%</td>
          <td class="win-percentage">${winRate.toFixed(4)}%</td>
          <td>${result.wins.toLocaleString()}</td>
          <td>${result.losses.toLocaleString()}</td>
          <td>${result.pushes.toLocaleString()}</td>
          <td>${result.blackjacks.toLocaleString()}</td>
        `
        tbody.appendChild(row)
      }
    }
  }

  toggleExpandedResults() {
    const expanded = this.elements.expandedResults
    const btn = this.elements.expandAllResultsBtn
    
    if (expanded.style.display === 'none') {
      expanded.style.display = 'block'
      btn.textContent = 'Hide Extended Results'
      this.displayExpandedResults()
    } else {
      expanded.style.display = 'none'
      btn.textContent = 'Show All Counts (-10 to +10)'
    }
  }

  displayExpandedResults() {
    const tbody = this.elements.expandedResultsBody
    tbody.innerHTML = ''
    
    // Calculate total hands for frequency calculation
    const totalHands = this.completedHands
    
    // Show results for all true counts -10 to +10
    for (let tc = -10; tc <= 10; tc++) {
      const result = this.results[tc]
      const winRate = result.hands > 0 ? (result.wins / result.hands) * 100 : 0
      const frequency = result.hands > 0 ? (result.hands / totalHands) * 100 : 0
      const evClass = result.ev >= 0 ? 'positive-ev' : 'negative-ev'
      const row = document.createElement('tr')
      row.innerHTML = `
        <td>${tc}</td>
        <td>${result.hands.toLocaleString()}</td>
        <td class="frequency">${frequency.toFixed(2)}%</td>
        <td class="ev-value ${evClass}">${result.ev.toFixed(4)}%</td>
        <td class="win-percentage">${winRate.toFixed(4)}%</td>
        <td>${result.wins.toLocaleString()}</td>
        <td>${result.losses.toLocaleString()}</td>
        <td>${result.pushes.toLocaleString()}</td>
        <td>${result.blackjacks.toLocaleString()}</td>
      `
      tbody.appendChild(row)
    }
  }

  // Utility methods
  calculateHandValue(cards, forceAceAs11 = false) {
    let value = 0
    let aces = 0
    
    for (const card of cards) {
      if (card.value === 'A') {
        aces++
        value += 11
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10
      } else {
        value += parseInt(card.value)
      }
    }
    
    // Adjust for aces (unless forcing Ace as 11)
    if (!forceAceAs11) {
      while (value > 21 && aces > 0) {
        value -= 10
        aces--
      }
    }
    
    return value
  }

  getCardValue(card) {
    if (card.value === 'A') return 11
    if (['K', 'Q', 'J'].includes(card.value)) return 10
    return parseInt(card.value)
  }

  isSoftHand(cards) {
    let hasAce = cards.some(c => c.value === 'A')
    if (!hasAce) return false
    
    let valueWithAce = this.calculateHandValue(cards, true) // Force Ace as 11
    let valueWithoutAce = this.calculateHandValue(cards, false) // Normal calculation
    
    return valueWithAce <= 21 && valueWithAce !== valueWithoutAce
  }
  

  isBlackjack(cards) {
    return cards.length === 2 && this.calculateHandValue(cards) === 21
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // This will be initialized by the main simulation
  window.PercentageSimulationManager = PercentageSimulationManager
})
