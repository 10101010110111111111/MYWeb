class AdvancedBlackjackSimulation {
  constructor() {
    this.deckCount = 8
    this.totalCards = this.deckCount * 52
    this.shufflePoint = Math.floor(this.totalCards * 0.25)

    this.shoe = []
    this.runningCount = 0
    this.trueCount = 0
    this.cardsDealt = 0

    this.totalHands = 0
    this.currentHandNumber = 0
    this.isRunning = false
    this.isPaused = false
    this.speed = 50
    this.gameMode = "simulation"
    this.countingSystem = "hilo"

    // OPRAVENÝ BETTING SYSTEM
    this.chips = 1000 // Starting chips
    this.unitSize = 100 // 1 unit = 100 chips
    this.currentBet = this.unitSize // Will be calculated based on true count
    this.insuranceBet = 0
    this.rebuyCount = 0 // Track number of re-buys

    // Game state for player mode
    this.playerHands = []
    this.dealerHand = []
    this.currentPlayerHandIndex = 0
    this.waitingForPlayerAction = false
    this.dealerHoleCard = null
    this.insuranceOffered = false

    // Statistics tracking
    this.trueCountStats = {}

    this.initializeElements()
    this.setupEventListeners()
    this.setupCountingSystems()
    this.setupIllustrious18()
    this.initializeShoe()
    this.updateDisplay()

    // Add test button for debugging
    const testBtn = document.createElement("button")
    testBtn.textContent = "Test Deviations"
    testBtn.onclick = () => this.testDeviationLogic()
    testBtn.style.margin = "10px"
    document.querySelector(".controls").appendChild(testBtn)

    // Initialize multi-simulation manager
    this.multiSimManager = new MultiSimulationManager(this)
  }

  // OPRAVENÁ FUNKCE PRO VÝPOČET SÁZKY
  calculateBetSize() {
    const tc = this.countingSystem === "ko" ? this.runningCount : Math.floor(this.trueCount)
    let units = 1 // Default bet

    // Pro KO systém používáme running count místo true count
    if (this.countingSystem === "ko") {
      // KO systém - používáme running count
      if (tc < 1) {
        units = 1 // Spectator mode - jen 1 unit když jsme ve nevýhodě
      } else if (tc >= 4) {
        units = 8
      } else if (tc >= 3) {
        units = 6
      } else if (tc >= 2) {
        units = 4
      } else if (tc >= 1) {
        units = 2
      }
    } else {
      // Vyvážené systémy - používáme true count
      if (tc < 1) {
        units = 1 // Spectator mode - jen 1 unit když jsme ve nevýhodě
      } else if (tc >= 4) {
        units = 8
      } else if (tc >= 3) {
        units = 6
      } else if (tc >= 2) {
        units = 4
      } else if (tc >= 1) {
        units = 2
      }
    }

    const betAmount = units * this.unitSize

    // Check if we have enough chips
    if (this.chips < betAmount) {
      this.rebuy()
    }

    return betAmount
  }

  rebuy() {
            this.chips += 1000
    this.rebuyCount++
    this.log(`Re-buy #${this.rebuyCount}: Added 10,000 chips. Total: ${this.chips}`)
  }

  setupCountingSystems() {
    this.countingSystems = {
      hilo: {
        name: "Hi-Lo",
        values: {
          2: 1,
          3: 1,
          4: 1,
          5: 1,
          6: 1,
          7: 0,
          8: 0,
          9: 0,
          10: -1,
          J: -1,
          Q: -1,
          K: -1,
          A: -1,
        },
        balanced: true,
        initialRunningCount: 0,
      },
      wong: {
        name: "Wong Halves",
        values: {
          2: 0.5,
          3: 1,
          4: 1,
          5: 1.5,
          6: 1,
          7: 0.5,
          8: 0,
          9: -0.5,
          10: -1,
          J: -1,
          Q: -1,
          K: -1,
          A: -1,
        },
        balanced: true,
        initialRunningCount: 0,
      },
      ko: {
        name: "KO (Knock Out)",
        values: {
          2: 1,
          3: 1,
          4: 1,
          5: 1,
          6: 1,
          7: 1,
          8: 0,
          9: 0,
          10: -1,
          J: -1,
          Q: -1,
          K: -1,
          A: -1,
        },
        balanced: false,
        // OPRAVENÉ POČÁTEČNÍ HODNOTY PRO KO SYSTÉM
        getInitialRunningCount: (deckCount) => {
          const initialCounts = {
            1: 0,
            2: -4,
            6: -20,
            8: -28,
          }
          return initialCounts[deckCount] || -4 * (deckCount - 1)
        },
      },
      hiopt1: {
        name: "Hi-Opt I",
        values: {
          2: 0,
          3: 1,
          4: 1,
          5: 1,
          6: 1,
          7: 0,
          8: 0,
          9: 0,
          10: -1,
          J: -1,
          Q: -1,
          K: -1,
          A: 0,
        },
        balanced: true,
        initialRunningCount: 0,
      },
    }
  }

  setupIllustrious18() {
    this.illustrious18 = [
      { player: 16, dealer: 10, action: "stand", trueCount: 0, description: "16 vs 10: Stand if TC ≥ 0" },
      { player: 15, dealer: 10, action: "stand", trueCount: 4, description: "15 vs 10: Stand if TC ≥ 4" },
      { player: 20, dealer: 5, action: "stand", trueCount: 5, description: "20 vs 5: Stand if TC ≥ 5" },
      { player: 20, dealer: 6, action: "stand", trueCount: 4, description: "20 vs 6: Stand if TC ≥ 4" },
      { player: 16, dealer: 9, action: "stand", trueCount: 5, description: "16 vs 9: Stand if TC ≥ 5" },
      { player: 13, dealer: 2, action: "stand", trueCount: -1, description: "13 vs 2: Stand if TC ≥ -1" },
      { player: 12, dealer: 3, action: "stand", trueCount: 2, description: "12 vs 3: Stand if TC ≥ 2" },
      { player: 12, dealer: 2, action: "stand", trueCount: 3, description: "12 vs 2: Stand if TC ≥ 3" },
      { player: 11, dealer: 1, action: "double", trueCount: 1, description: "11 vs A: Double if TC ≥ 1" },
      { player: 16, dealer: 8, action: "stand", trueCount: 4, description: "16 vs 8: Stand if TC ≥ 4" },
      { player: 15, dealer: 9, action: "stand", trueCount: 2, description: "15 vs 9: Stand if TC ≥ 2" },
      { player: 14, dealer: 2, action: "stand", trueCount: 3, description: "14 vs 2: Stand if TC ≥ 3" },
      { player: 13, dealer: 3, action: "stand", trueCount: -2, description: "13 vs 3: Stand if TC ≥ -2" },
      { player: 12, dealer: 4, action: "stand", trueCount: 0, description: "12 vs 4: Stand if TC ≥ 0" },
      { player: 12, dealer: 5, action: "stand", trueCount: -2, description: "12 vs 5: Stand if TC ≥ -2" },
      { player: 12, dealer: 6, action: "stand", trueCount: -1, description: "12 vs 6: Stand if TC ≥ -1" },
      { player: 13, dealer: 4, action: "stand", trueCount: -3, description: "13 vs 4: Stand if TC ≥ -3" },
      { player: 10, dealer: 1, action: "double", trueCount: 4, description: "10 vs A: Double if TC ≥ 4" },
    ]
  }

  initializeElements() {
    this.elements = {
      gameMode: document.getElementById("gameMode"),
      countingSystem: document.getElementById("countingSystem"),
      startBtn: document.getElementById("startBtn"),
      pauseBtn: document.getElementById("pauseBtn"),
      resetBtn: document.getElementById("resetBtn"),
      deckCount: document.getElementById("deckCount"),
      speed: document.getElementById("speed"),
      speedControl: document.getElementById("speedControl"),

      runningCount: document.getElementById("runningCount"),
      trueCount: document.getElementById("trueCount"),
      remainingDecks: document.getElementById("remainingDecks"),
      cardsLeft: document.getElementById("cardsLeft"),
      totalHands: document.getElementById("totalHands"),
      currentHand: document.getElementById("currentHand"),
      overallWinRate: document.getElementById("overallWinRate"),
      bankroll: document.getElementById("bankroll"),
      currentBet: document.getElementById("currentBet"),

      dealerHand: document.getElementById("dealerHand"),
      dealerValue: document.getElementById("dealerValue"),
      playerHands: document.getElementById("playerHands"),
      actionLog: document.getElementById("actionLog"),

      playerControls: document.getElementById("playerControls"),
      hitBtn: document.getElementById("hitBtn"),
      standBtn: document.getElementById("standBtn"),
      doubleBtn: document.getElementById("doubleBtn"),
      splitBtn: document.getElementById("splitBtn"),
      insuranceBtn: document.getElementById("insuranceBtn"),
      declineInsuranceBtn: document.getElementById("declineInsuranceBtn"),
      strategyHint: document.getElementById("strategyHint"),

      statsBody: document.getElementById("statsBody"),
      exportBtn: document.getElementById("exportBtn"),
      showDeviationsBtn: document.getElementById("showDeviationsBtn"),
      detailModal: document.getElementById("detailModal"),
      modalTitle: document.getElementById("modalTitle"),
      modalContent: document.getElementById("modalContent"),
      deviationsModal: document.getElementById("deviationsContent"),
      deviationsContent: document.getElementById("deviationsContent"),
    }
  }

  setupEventListeners() {
    this.elements.gameMode.addEventListener("change", (e) => {
      this.gameMode = e.target.value
      this.updateModeDisplay()
      this.resetSimulation()
    })

    this.elements.countingSystem.addEventListener("change", (e) => {
      this.countingSystem = e.target.value
      this.resetSimulation()
    })

    this.elements.startBtn.addEventListener("click", () => this.startGame())
    this.elements.pauseBtn.addEventListener("click", () => this.pauseSimulation())
    this.elements.resetBtn.addEventListener("click", () => this.resetSimulation())

    this.elements.deckCount.addEventListener("change", (e) => {
      this.deckCount = Number.parseInt(e.target.value)
      this.totalCards = this.deckCount * 52
      this.shufflePoint = Math.floor(this.totalCards * 0.25)
      this.resetSimulation()
    })

    this.elements.speed.addEventListener("change", (e) => {
      this.speed = Number.parseInt(e.target.value)
    })

    this.elements.hitBtn.addEventListener("click", () => this.playerHit())
    this.elements.standBtn.addEventListener("click", () => this.playerStand())
    this.elements.doubleBtn.addEventListener("click", () => this.playerDouble())
    this.elements.splitBtn.addEventListener("click", () => this.playerSplit())
    this.elements.insuranceBtn.addEventListener("click", () => this.playerInsurance())
    this.elements.declineInsuranceBtn.addEventListener("click", () => this.playerDeclineInsurance())

    this.elements.exportBtn.addEventListener("click", () => this.exportData())
    this.elements.showDeviationsBtn.addEventListener("click", () => this.showDeviationsModal())

    document.querySelector(".close").addEventListener("click", () => {
      this.elements.detailModal.style.display = "none"
    })

    document.querySelector(".close-deviations").addEventListener("click", () => {
      this.elements.deviationsModal.style.display = "none"
    })

    window.addEventListener("click", (e) => {
      if (e.target === this.elements.detailModal) {
        this.elements.detailModal.style.display = "none"
      }
      if (e.target === this.elements.deviationsModal) {
        this.elements.deviationsModal.style.display = "none"
      }
    })

    this.updateModeDisplay()
  }

  updateModeDisplay() {
    const isPlayerMode = this.gameMode === "player"
    this.elements.speedControl.style.display = isPlayerMode ? "none" : "block"
    this.elements.playerControls.style.display = isPlayerMode ? "flex" : "none"

    if (isPlayerMode) {
      this.elements.startBtn.textContent = "Deal Hand"
    } else {
      this.elements.startBtn.textContent = "Start Simulation"
    }
  }

  // OPRAVENÁ FUNKCE PRO INICIALIZACI SHOE
  initializeShoe() {
    this.shoe = []
    const suits = ["♠", "♥", "♦", "♣"]
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

    // Create the specified number of decks
    for (let deck = 0; deck < this.deckCount; deck++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          this.shoe.push({
            rank: rank,
            suit: suit,
            value: this.getCardValue(rank),
            countValue: this.getCountValue(rank),
          })
        }
      }
    }

    // Verify deck construction
    this.verifyDeckConstruction()

    this.shuffleShoe()
    this.cardsDealt = 0

    // OPRAVENÉ NASTAVENÍ POČÁTEČNÍHO RUNNING COUNT PRO KO SYSTÉM
    const system = this.countingSystems[this.countingSystem]
    if (system.balanced) {
      this.runningCount = 0
    } else {
      // Pro KO systém nastavíme počáteční running count
      this.runningCount = system.getInitialRunningCount(this.deckCount)
    }

    this.calculateTrueCount()

    this.log(
      `Shoe initialized. ${this.countingSystem.toUpperCase()} system: Initial running count = ${this.runningCount}`,
    )
  }

  verifyDeckConstruction() {
    // Count each unique card to verify proper deck construction
    const cardCounts = {}
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

    // Initialize counts
    for (const rank of ranks) {
      cardCounts[rank] = 0
    }

    // Count cards in shoe
    for (const card of this.shoe) {
      cardCounts[card.rank]++
    }

    // Verify each card appears exactly (deckCount * 4) times
    const expectedCount = this.deckCount * 4
    let isValid = true

    for (const rank of ranks) {
      if (cardCounts[rank] !== expectedCount) {
        console.error(`Card ${rank} appears ${cardCounts[rank]} times, expected ${expectedCount}`)
        isValid = false
      }
    }

    if (isValid) {
      this.log(
        `Deck verified: ${this.deckCount} decks, ${this.shoe.length} total cards, each rank appears ${expectedCount} times`,
      )
    } else {
      this.log("ERROR: Deck construction failed verification!")
    }
  }

  shuffleShoe() {
    for (let i = this.shoe.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.shoe[i], this.shoe[j]] = [this.shoe[j], this.shoe[i]]
    }

    const system = this.countingSystems[this.countingSystem]
    const initialCount = system.balanced ? 0 : system.getInitialRunningCount(this.deckCount)

    this.log(`Shoe shuffled. ${system.name} system: Running count reset to ${initialCount}`)
  }

  getCardValue(rank) {
    if (rank === "A") return 11
    if (["J", "Q", "K"].includes(rank)) return 10
    return Number.parseInt(rank)
  }

  getCountValue(rank) {
    return this.countingSystems[this.countingSystem].values[rank] || 0
  }

  dealCard() {
    if (this.shoe.length === 0) {
      this.log("Shoe empty - reshuffling")
      this.initializeShoe()
      return this.dealCard()
    }

    const card = this.shoe.pop()
    this.cardsDealt++
    this.runningCount += card.countValue
    this.calculateTrueCount()

    return card
  }

  calculateTrueCount() {
    const remainingCards = this.totalCards - this.cardsDealt
    const remainingDecks = remainingCards / 52

    if (this.countingSystems[this.countingSystem].balanced) {
      this.trueCount = remainingDecks > 0 ? this.runningCount / remainingDecks : 0
    } else {
      // Pro nevyvážené systémy (KO) používáme running count
      this.trueCount = this.runningCount
    }
  }

  calculateHandValue(hand) {
    let value = 0
    let aces = 0

    for (const card of hand) {
      if (card.rank === "A") {
        aces++
        value += 11
      } else {
        value += card.value
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10
      aces--
    }

    return value
  }

  isBlackjack(hand) {
    return hand.length === 2 && this.calculateHandValue(hand) === 21
  }

  isSoft(hand) {
    let value = 0
    let aces = 0

    for (const card of hand) {
      if (card.rank === "A") {
        aces++
        value += 11
      } else {
        value += card.value
      }
    }

    return value <= 21 && aces > 0
  }

  canSplit(hand) {
    return hand.length === 2 && hand[0].rank === hand[1].rank
  }

  canDouble(hand) {
    return hand.length === 2
  }

  getBasicStrategyAction(playerHand, dealerUpCard, canDouble = true, canSplitHand = true) {
    const playerValue = this.calculateHandValue(playerHand)
    const dealerValue = dealerUpCard.value === 11 ? 1 : dealerUpCard.value
    const isPair = this.canSplit(playerHand)
    const isSoftHand = this.isSoft(playerHand)

    // Check for deviations first
    const deviation = this.checkForDeviation(playerHand, dealerUpCard)
    if (deviation) {
      return deviation
    }

    // 1. Check pairs first
    if (isPair && canSplitHand) {
      const rank = playerHand[0].rank

      if (rank === "A" || rank === "8") return "split"
      if (["10", "J", "Q", "K"].includes(rank)) return "stand"
      if (rank === "9") {
        if ([2, 3, 4, 5, 6, 8, 9].includes(dealerValue)) return "split"
        return "stand"
      }
      if (rank === "7") {
        if (dealerValue <= 7) return "split"
        return "hit"
      }
      if (rank === "6") {
        if (dealerValue <= 6) return "split"
        return "hit"
      }
      if (rank === "5") {
        if (dealerValue <= 9 && canDouble) return "double"
        return "hit"
      }
      if (rank === "4") {
        if ([5, 6].includes(dealerValue)) return "split"
        return "hit"
      }
      if (["2", "3"].includes(rank)) {
        if (dealerValue <= 7) return "split"
        return "hit"
      }
    }

    // 2. Check soft hands
    if (isSoftHand) {
      if (playerValue >= 19) return "stand"
      if (playerValue === 18) {
        if ([2, 7, 8].includes(dealerValue)) return "stand"
        if ([3, 4, 5, 6].includes(dealerValue) && canDouble) return "double"
        if ([3, 4, 5, 6].includes(dealerValue) && !canDouble) return "stand"
        return "hit"
      }
      if (playerValue === 17) {
        if ([3, 4, 5, 6].includes(dealerValue) && canDouble) return "double"
        return "hit"
      }
      if ([15, 16].includes(playerValue)) {
        if ([4, 5, 6].includes(dealerValue) && canDouble) return "double"
        return "hit"
      }
      if ([13, 14].includes(playerValue)) {
        if ([5, 6].includes(dealerValue) && canDouble) return "double"
        return "hit"
      }
      return "hit"
    }

    // 3. Hard totals
    if (playerValue >= 17) return "stand"
    if ([13, 14, 15, 16].includes(playerValue)) {
      if (dealerValue <= 6) return "stand"
      return "hit"
    }
    if (playerValue === 12) {
      if ([4, 5, 6].includes(dealerValue)) return "stand"
      return "hit"
    }
    if (playerValue === 11) {
      if (dealerValue !== 1 && canDouble) return "double"
      return "hit"
    }
    if (playerValue === 10) {
      if (dealerValue <= 9 && canDouble) return "double"
      return "hit"
    }
    if (playerValue === 9) {
      if ([3, 4, 5, 6].includes(dealerValue) && canDouble) return "double"
      return "hit"
    }

    return "hit"
  }

  checkForDeviation(playerHand, dealerUpCard) {
    const playerValue = this.calculateHandValue(playerHand)
    const dealerValue = dealerUpCard.value === 11 ? 1 : dealerUpCard.value

    // Pro KO systém používáme running count, pro ostatní true count
    const currentCount = this.countingSystem === "ko" ? this.runningCount : Math.floor(this.trueCount)

    for (const deviation of this.illustrious18) {
      if (deviation.player === playerValue && deviation.dealer === dealerValue) {
        const shouldUseDeviation = currentCount >= deviation.trueCount

        // Debug logging for verification
        if (this.gameMode === "player" || (this.gameMode === "simulation" && Math.random() < 0.01)) {
          const countType = this.countingSystem === "ko" ? "RC" : "TC"
          console.log(`DEVIATION CHECK: ${playerValue} vs ${dealerValue}`)
          console.log(`  ${countType}: ${currentCount}`)
          console.log(`  Threshold: ${deviation.trueCount}`)
          console.log(`  Should use deviation: ${shouldUseDeviation}`)
          console.log(`  Action: ${shouldUseDeviation ? deviation.action : "basic strategy"}`)
        }

        if (shouldUseDeviation) {
          return deviation.action
        }
      }
    }

    return null
  }

  shouldTakeInsurance() {
    // Pro KO systém používáme running count, pro ostatní true count
    const count = this.countingSystem === "ko" ? this.runningCount : Math.floor(this.trueCount)
    const shouldTake = count >= 3

    // Debug log pro ověření
    if (this.gameMode === "simulation") {
      const countType = this.countingSystem === "ko" ? "RC" : "TC"
      console.log(`Insurance check: ${countType}=${count}, Should take: ${shouldTake}`)
    }
    return shouldTake
  }

  async startGame() {
    if (this.gameMode === "simulation") {
      this.startSimulation()
    } else {
      this.dealPlayerHand()
    }
  }

  async startSimulation() {
    this.isRunning = true
    this.isPaused = false
    this.elements.startBtn.disabled = true
    this.elements.pauseBtn.disabled = false

    this.log("Starting simulation...")

    while (this.isRunning && !this.isPaused) {
      await this.playSimulationHand()

      if (this.totalHands >= 100000) {
        this.log("Simulation completed: 100,000 hands played.")
        this.stopSimulation()
        break
      }
    }
  }

  async dealPlayerHand() {
    if (this.waitingForPlayerAction) return

    if (this.cardsDealt >= this.totalCards - this.shufflePoint) {
      this.initializeShoe()
    }

    this.currentHandNumber++
    this.insuranceOffered = false
    this.insuranceBet = 0

    // Calculate bet based on true count
    this.currentBet = this.calculateBetSize()

    // Check if we have enough chips for the bet
    if (this.chips < this.currentBet) {
      this.rebuy()
    }

    // OPRAVENO: Odečteme sázku PŘED rozdáním karet
    this.chips -= this.currentBet

    this.playerHands = [
      {
        hand: [this.dealCard(), this.dealCard()],
        bet: this.currentBet,
        doubled: false,
        finished: false,
      },
    ]

    this.dealerHand = [this.dealCard(), this.dealCard()]
    this.currentPlayerHandIndex = 0

    this.displayPlayerHands(true)
    this.updateDisplay()

    const count = this.countingSystem === "ko" ? this.runningCount : Math.floor(this.trueCount)
    const units = this.currentBet / this.unitSize
    const countType = this.countingSystem === "ko" ? "RC" : "TC"

    this.log(
      `New hand dealt. Bet: ${units} units (${this.currentBet} chips) at ${countType} ${count}. Player: ${this.getHandString(this.playerHands[0].hand)}, Dealer: ${this.dealerHand[0].rank}${this.dealerHand[0].suit}`,
    )

    // Check for dealer blackjack (only if dealer shows Ace or 10-value)
    const dealerUpCard = this.dealerHand[0]
    const dealerHasBlackjackPossibility = dealerUpCard.rank === "A" || dealerUpCard.value === 10

    if (dealerHasBlackjackPossibility && this.isBlackjack(this.dealerHand)) {
      if (this.isBlackjack(this.playerHands[0].hand)) {
        this.log("Both player and dealer have blackjack - Push!")
        this.endHand("push")
      } else {
        this.log("Dealer has blackjack - Player loses!")
        this.endHand("loss")
      }
      return
    }

    // Check for player blackjack
    if (this.isBlackjack(this.playerHands[0].hand)) {
      this.log("Player has blackjack!")
      this.endHand("blackjack")
      return
    }

    // IMPORTANT: Insurance is ONLY offered when dealer shows ACE, not 10-value cards
    if (this.dealerHand[0].rank === "A") {
      this.offerInsurance()
    } else {
      this.enablePlayerActions()
    }
  }

  offerInsurance() {
    this.insuranceOffered = true
    this.elements.insuranceBtn.style.display = "block"
    this.elements.insuranceBtn.disabled = false
    this.elements.declineInsuranceBtn.style.display = "block"
    this.elements.declineInsuranceBtn.disabled = false

    // Disable other actions while insurance decision is pending
    this.elements.hitBtn.disabled = true
    this.elements.standBtn.disabled = true
    this.elements.doubleBtn.disabled = true
    this.elements.splitBtn.disabled = true

    this.updateStrategyHint("insurance")
    this.log("Insurance offered - dealer shows Ace. Choose Insurance or Decline.")
  }

  playerInsurance() {
    this.insuranceBet = this.currentBet / 2

    // Check if we have enough chips for insurance
    if (this.chips < this.insuranceBet) {
      this.rebuy()
    }

    this.chips -= this.insuranceBet
    this.elements.insuranceBtn.style.display = "none"
    this.elements.declineInsuranceBtn.style.display = "none"
    this.log(`Insurance taken for ${this.insuranceBet} chips`)

    // Check if dealer has blackjack
    if (this.isBlackjack(this.dealerHand)) {
      // Insurance pays 2:1 (return bet + 2x bet)
      const insurancePayout = this.insuranceBet + this.insuranceBet * 2
      this.chips += insurancePayout
      this.log(
        `Dealer has blackjack - Insurance pays ${this.insuranceBet * 2} chips (2:1) + ${this.insuranceBet} bet returned = ${insurancePayout} total`,
      )

      if (this.isBlackjack(this.playerHands[0].hand)) {
        this.endHand("push")
      } else {
        this.endHand("loss")
      }
    } else {
      this.log(`Dealer does not have blackjack - Insurance lost (${this.insuranceBet} chips)`)
      this.enablePlayerActions()
    }

    this.updateDisplay()
  }

  playerDeclineInsurance() {
    this.elements.insuranceBtn.style.display = "none"
    this.elements.declineInsuranceBtn.style.display = "none"
    this.log("Insurance declined")

    // Check if dealer has blackjack
    if (this.isBlackjack(this.dealerHand)) {
      this.log("Dealer has blackjack")
      if (this.isBlackjack(this.playerHands[0].hand)) {
        this.endHand("push")
      } else {
        this.endHand("loss")
      }
    } else {
      this.log("Dealer does not have blackjack - continue playing")
      this.enablePlayerActions()
    }

    this.updateDisplay()
  }

  enablePlayerActions() {
    this.waitingForPlayerAction = true
    this.elements.insuranceBtn.style.display = "none"
    this.elements.declineInsuranceBtn.style.display = "none"

    const currentHand = this.playerHands[this.currentPlayerHandIndex]

    // OPRAVENO: Doubleovat a splitovat můžeme jen s 2 kartami
    const canDouble = this.canDouble(currentHand.hand) && this.chips >= currentHand.bet
    const canSplit = this.canSplit(currentHand.hand) && this.chips >= currentHand.bet && this.playerHands.length < 4

    this.elements.hitBtn.disabled = false
    this.elements.standBtn.disabled = false
    this.elements.doubleBtn.disabled = !canDouble
    this.elements.splitBtn.disabled = !canSplit

    this.updateStrategyHint()
  }

  updateStrategyHint(action = null) {
    if (action === "insurance") {
      const shouldTake = this.shouldTakeInsurance()
      const count = this.countingSystem === "ko" ? this.runningCount : this.trueCount.toFixed(1)
      const countType = this.countingSystem === "ko" ? "RC" : "TC"

      this.elements.strategyHint.textContent = shouldTake
        ? `Basic Strategy + Count: TAKE INSURANCE (${countType}: ${count})`
        : `Basic Strategy + Count: DECLINE INSURANCE (${countType}: ${count})`

      // Clear previous recommendations
      this.elements.insuranceBtn.classList.remove("recommended")
      this.elements.declineInsuranceBtn.classList.remove("recommended")

      // Highlight recommended choice
      if (shouldTake) {
        this.elements.insuranceBtn.classList.add("recommended")
      } else {
        this.elements.declineInsuranceBtn.classList.add("recommended")
      }
      return
    }

    if (!this.waitingForPlayerAction) return

    const currentHand = this.playerHands[this.currentPlayerHandIndex]

    // OPRAVENO: Po hitu už nemůžeme doubleovat ani splitovat
    const canDouble =
      this.canDouble(currentHand.hand) && !this.elements.doubleBtn.disabled && this.chips >= currentHand.bet
    const canSplit =
      this.canSplit(currentHand.hand) &&
      !this.elements.splitBtn.disabled &&
      this.chips >= currentHand.bet &&
      this.playerHands.length < 4

    const recommendedAction = this.getBasicStrategyAction(currentHand.hand, this.dealerHand[0], canDouble, canSplit)

    // Clear previous recommendations
    document.querySelectorAll(".action-btn").forEach((btn) => btn.classList.remove("recommended"))

    // Highlight recommended action
    switch (recommendedAction) {
      case "hit":
        this.elements.hitBtn.classList.add("recommended")
        break
      case "stand":
        this.elements.standBtn.classList.add("recommended")
        break
      case "double":
        if (canDouble) this.elements.doubleBtn.classList.add("recommended")
        else this.elements.hitBtn.classList.add("recommended") // Fallback to hit if can't double
        break
      case "split":
        if (canSplit) this.elements.splitBtn.classList.add("recommended")
        else this.elements.hitBtn.classList.add("recommended") // Fallback to hit if can't split
        break
    }

    const count = this.countingSystem === "ko" ? this.runningCount : this.trueCount.toFixed(1)
    const countType = this.countingSystem === "ko" ? "RC" : "TC"

    this.elements.strategyHint.textContent = `Basic Strategy + Count: ${recommendedAction.toUpperCase()} (${countType}: ${count})`
  }

  playerHit() {
    if (!this.waitingForPlayerAction) return

    const currentHand = this.playerHands[this.currentPlayerHandIndex]
    currentHand.hand.push(this.dealCard())

    this.displayPlayerHands(true)
    this.updateDisplay()

    const handValue = this.calculateHandValue(currentHand.hand)
    this.log(`Player hits: ${this.getHandString(currentHand.hand)} (${handValue})`)

    if (handValue > 21) {
      this.log("Player busts!")
      this.finishCurrentHand()
    } else {
      // OPRAVENO: Po hitu už nemůžeme doubleovat ani splitovat
      this.elements.doubleBtn.disabled = true
      this.elements.splitBtn.disabled = true
      this.updateStrategyHint()
    }
  }

  playerStand() {
    if (!this.waitingForPlayerAction) return

    const currentHand = this.playerHands[this.currentPlayerHandIndex]
    const handValue = this.calculateHandValue(currentHand.hand)
    this.log(`Player stands with ${handValue}`)

    this.finishCurrentHand()
  }

  playerDouble() {
    if (!this.waitingForPlayerAction) return

    const currentHand = this.playerHands[this.currentPlayerHandIndex]

    if (this.chips < currentHand.bet) {
      this.log("Insufficient funds to double")
      return
    }

    this.chips -= currentHand.bet
    currentHand.bet *= 2
    currentHand.doubled = true
    currentHand.hand.push(this.dealCard())

    this.displayPlayerHands(true)
    this.updateDisplay()

    const handValue = this.calculateHandValue(currentHand.hand)
    this.log(`Player doubles: ${this.getHandString(currentHand.hand)} (${handValue})`)

    this.finishCurrentHand()
  }

  playerSplit() {
    if (!this.waitingForPlayerAction) return

    const currentHand = this.playerHands[this.currentPlayerHandIndex]

    if (this.chips < currentHand.bet) {
      this.log("Cannot split - insufficient funds")
      return
    }

    if (this.playerHands.length >= 4) {
      this.log("Cannot split - maximum 4 hands reached")
      return
    }

    if (!this.canSplit(currentHand.hand)) {
      this.log("Cannot split - cards don't match")
      return
    }

    this.chips -= currentHand.bet

    const card1 = currentHand.hand[0]
    const card2 = currentHand.hand[1]

    this.playerHands[this.currentPlayerHandIndex] = {
      hand: [card1, this.dealCard()],
      bet: currentHand.bet,
      doubled: false,
      finished: false,
    }

    this.playerHands.splice(this.currentPlayerHandIndex + 1, 0, {
      hand: [card2, this.dealCard()],
      bet: currentHand.bet,
      doubled: false,
      finished: false,
    })

    this.displayPlayerHands(true)
    this.updateDisplay()

    this.log(`Player splits ${card1.rank}s - now playing ${this.playerHands.length} hands`)
    this.updateStrategyHint()
  }

  finishCurrentHand() {
    this.playerHands[this.currentPlayerHandIndex].finished = true
    this.currentPlayerHandIndex++

    if (this.currentPlayerHandIndex < this.playerHands.length) {
      this.log(`Playing hand ${this.currentPlayerHandIndex + 1}`)
      this.updateStrategyHint()
    } else {
      this.waitingForPlayerAction = false
      this.disablePlayerActions()
      setTimeout(() => this.playDealer(), 1000)
    }
  }

  disablePlayerActions() {
    this.elements.hitBtn.disabled = true
    this.elements.standBtn.disabled = true
    this.elements.doubleBtn.disabled = true
    this.elements.splitBtn.disabled = true
    this.elements.insuranceBtn.style.display = "none"
    this.elements.declineInsuranceBtn.style.display = "none"
    this.elements.strategyHint.textContent = ""

    document.querySelectorAll(".action-btn").forEach((btn) => btn.classList.remove("recommended"))
  }

  async playDealer() {
    this.displayPlayerHands(false)

    let dealerValue = this.calculateHandValue(this.dealerHand)
    this.log(`Dealer reveals: ${this.getHandString(this.dealerHand)} (${dealerValue})`)

    while (dealerValue < 17 || (dealerValue === 17 && this.isSoft(this.dealerHand))) {
      await this.sleep(1000)
      this.dealerHand.push(this.dealCard())
      dealerValue = this.calculateHandValue(this.dealerHand)
      this.displayPlayerHands(false)
      this.log(`Dealer hits: ${this.getHandString(this.dealerHand)} (${dealerValue})`)
    }

    if (dealerValue > 21) {
      this.log("Dealer busts!")
    } else {
      this.log(`Dealer stands with ${dealerValue}`)
    }

    this.evaluateHands()
  }

  evaluateHands() {
    const dealerValue = this.calculateHandValue(this.dealerHand)
    const dealerBusted = dealerValue > 21

    let totalWinnings = 0
    let totalBetAmount = 0

    for (let i = 0; i < this.playerHands.length; i++) {
      const hand = this.playerHands[i]
      const playerValue = this.calculateHandValue(hand.hand)
      const playerBusted = playerValue > 21
      let result,
        winnings = 0

      totalBetAmount += hand.bet

      if (playerBusted) {
        result = "loss"
        winnings = 0 // Player loses bet (already deducted)
        this.log(`Hand ${i + 1}: ${this.getHandString(hand.hand)} (${playerValue}) - BUST - Lost ${hand.bet} chips`)
      } else if (dealerBusted) {
        result = "win"
        winnings = hand.bet * 2 // Return bet + equal amount (1:1 payout)
        this.log(
          `Hand ${i + 1}: ${this.getHandString(hand.hand)} (${playerValue}) - WIN vs Dealer Bust - Won ${hand.bet} chips (1:1)`,
        )
      } else if (playerValue > dealerValue) {
        result = "win"
        winnings = hand.bet * 2 // Return bet + equal amount (1:1 payout)
        this.log(
          `Hand ${i + 1}: ${this.getHandString(hand.hand)} (${playerValue}) - WIN vs ${dealerValue} - Won ${hand.bet} chips (1:1)`,
        )
      } else if (playerValue < dealerValue) {
        result = "loss"
        winnings = 0 // Player loses bet (already deducted)
        this.log(
          `Hand ${i + 1}: ${this.getHandString(hand.hand)} (${playerValue}) - LOSS vs ${dealerValue} - Lost ${hand.bet} chips`,
        )
      } else {
        result = "push"
        winnings = hand.bet // Return original bet
        this.log(
          `Hand ${i + 1}: ${this.getHandString(hand.hand)} (${playerValue}) - PUSH vs ${dealerValue} - Bet returned`,
        )
      }

      totalWinnings += winnings
    }

    // Add winnings to chips
    this.chips += totalWinnings
    this.totalHands++

    // Log total result
    const netResult = totalWinnings - totalBetAmount
    if (totalWinnings > 0) {
      this.log(
        `Total payout: ${totalWinnings} chips | Net result: ${netResult >= 0 ? "+" : ""}${netResult} chips | Balance: ${this.chips}`,
      )
    } else {
      this.log(`Total lost: ${totalBetAmount} chips | Balance: ${this.chips}`)
    }

    this.updateDisplay()

    setTimeout(() => {
      this.elements.startBtn.disabled = false
    }, 2000)
  }

  endHand(result) {
    let winnings = 0

    switch (result) {
      case "blackjack":
        // Blackjack pays 3:2 (bet + 1.5x bet)
        const blackjackPayout = Math.floor(this.currentBet * 1.5)
        winnings = this.currentBet + blackjackPayout
        this.log(`Blackjack! Payout: ${this.currentBet} (bet) + ${blackjackPayout} (3:2) = ${winnings} chips`)
        break
      case "win":
        // Regular win pays 1:1 (bet + equal amount)
        winnings = this.currentBet * 2
        this.log(`Win! Payout: ${this.currentBet} (bet) + ${this.currentBet} (1:1) = ${winnings} chips`)
        break
      case "push":
        // Push returns original bet
        winnings = this.currentBet
        this.log(`Push! Bet returned: ${this.currentBet} chips`)
        break
      case "loss":
        // Loss - no payout (bet already deducted)
        winnings = 0
        this.log(`Loss! Lost ${this.currentBet} chips`)
        break
    }

    // Add winnings to chips
    this.chips += winnings
    this.totalHands++

    this.log(`Balance after hand: ${this.chips} chips`)
    this.updateDisplay()

    setTimeout(() => {
      this.elements.startBtn.disabled = false
    }, 2000)
  }

  async playSimulationHand() {
    if (this.cardsDealt >= this.totalCards - this.shufflePoint) {
      this.initializeShoe()
    }

    this.currentHandNumber++
    const handCount = this.countingSystem === "ko" ? this.runningCount : Math.floor(this.trueCount)

    if (!this.trueCountStats[handCount]) {
      this.trueCountStats[handCount] = {
        games: 0,
        points: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        blackjacks: 0,
      }
    }

    // Calculate bet for simulation (in chips)
    const betSize = this.calculateBetSize()
    if (this.chips < betSize) {
      this.rebuy()
    }
    this.chips -= betSize

    const playerHand = [this.dealCard(), this.dealCard()]
    const dealerHand = [this.dealCard(), this.dealCard()]

    this.displaySimulationHands([{ hand: playerHand, bet: betSize }], dealerHand, true)

    const countType = this.countingSystem === "ko" ? "RC" : "TC"
    this.log(
      `Hand ${this.currentHandNumber}: ${countType}=${handCount}, Player: ${this.getHandString(playerHand)}, Dealer: ${dealerHand[0].rank}${dealerHand[0].suit}`,
    )

    // Přidat kontrolu deviací v simulaci
    const playerValue = this.calculateHandValue(playerHand)
    const dealerUpValue = dealerHand[0].value === 11 ? 1 : dealerHand[0].value
    const deviation = this.checkForDeviation(playerHand, dealerHand[0])
    if (deviation) {
      this.log(
        `Using deviation: ${playerValue} vs ${dealerUpValue} -> ${deviation.toUpperCase()} (${countType}: ${handCount})`,
      )
    }

    await this.sleep(this.speed)

    const playerBJ = this.isBlackjack(playerHand)
    const dealerBJ = this.isBlackjack(dealerHand)

    // Handle insurance in simulation mode (only when dealer shows Ace)
    if (dealerHand[0].rank === "A" && !playerBJ) {
      const shouldTakeInsurance = this.shouldTakeInsurance()
      const count = this.countingSystem === "ko" ? this.runningCount : this.trueCount.toFixed(1)
      const countType = this.countingSystem === "ko" ? "RC" : "TC"

      this.log(`Insurance decision: ${countType}=${count}, Should take: ${shouldTakeInsurance}`)

      if (shouldTakeInsurance) {
        this.log(`Simulation takes insurance (${countType}: ${count})`)
        if (dealerBJ) {
          this.log("Insurance pays 2:1 - breaks even on insurance")
          // Insurance breaks even, continue with main hand
        } else {
          this.log("Insurance lost")
          // Continue with main hand, insurance bet lost
        }
      } else {
        this.log(`Simulation declines insurance (${countType}: ${count})`)
      }
    }

    // Handle payouts for simulation mode
    let simulationPayout = 0

    if (playerBJ && dealerBJ) {
      // Push - return bet
      simulationPayout = betSize
      this.updateStats(handCount, "push", false)
      this.log("Both have blackjack - Push")
    } else if (playerBJ) {
      // Blackjack pays 3:2
      simulationPayout = betSize + Math.floor(betSize * 1.5)
      this.updateStats(handCount, "blackjack", true)
      this.log("Player blackjack!")
    } else if (dealerBJ) {
      // Loss - no payout
      simulationPayout = 0
      this.updateStats(handCount, "loss", false)
      this.log("Dealer blackjack")
    } else {
      // Play out the hand and calculate payouts
      const playerHands = await this.playPlayerHandsSimulation([{ hand: playerHand, bet: betSize }], dealerHand[0])

      this.displaySimulationHands(playerHands, dealerHand, false)
      await this.sleep(this.speed)

      while (this.calculateHandValue(dealerHand) < 17) {
        dealerHand.push(this.dealCard())
        this.displaySimulationHands(playerHands, dealerHand, false)
        await this.sleep(this.speed)
      }

      const dealerValue = this.calculateHandValue(dealerHand)
      const dealerBusted = dealerValue > 21

      let totalGames = 0
      let totalPoints = 0

      for (const handObj of playerHands) {
        const playerValue = this.calculateHandValue(handObj.hand)
        let result

        if (playerValue > 21) {
          result = "loss"
          // No payout for bust
        } else if (dealerBusted) {
          result = "win"
          simulationPayout += handObj.bet * 2 // Return bet + winnings
        } else if (playerValue > dealerValue) {
          result = "win"
          simulationPayout += handObj.bet * 2 // Return bet + winnings
        } else if (playerValue < dealerValue) {
          result = "loss"
          // No payout for loss
        } else {
          result = "push"
          simulationPayout += handObj.bet // Return original bet
        }

        totalGames++
        if (result === "win") {
          totalPoints++
          this.trueCountStats[handCount].wins++
        } else if (result === "push") {
          totalPoints += 0.5
          this.trueCountStats[handCount].pushes++
        } else {
          this.trueCountStats[handCount].losses++
        }
      }

      this.trueCountStats[handCount].games += totalGames
      this.trueCountStats[handCount].points += totalPoints
    }

    // Add the payout to chips
    this.chips += simulationPayout

    // Log the result
    if (simulationPayout > betSize) {
      const netWin = simulationPayout - betSize
      this.log(`Simulation won ${netWin} chips! Balance: ${this.chips}`)
    } else if (simulationPayout === betSize) {
      this.log(`Simulation push - bet returned. Balance: ${this.chips}`)
    } else if (simulationPayout === 0) {
      this.log(`Simulation lost ${betSize} chips. Balance: ${this.chips}`)
    }

    this.totalHands++
    this.updateDisplay()
    this.updateStatsTable()

    await this.sleep(this.speed)
  }

  updateStats(count, result, isBlackjack) {
    this.trueCountStats[count].games++

    if (result === "win" || result === "blackjack") {
      this.trueCountStats[count].wins++
      this.trueCountStats[count].points += isBlackjack ? 1.5 : 1
      if (isBlackjack) this.trueCountStats[count].blackjacks++
    } else if (result === "push") {
      this.trueCountStats[count].pushes++
      this.trueCountStats[count].points += 0.5
    } else {
      this.trueCountStats[count].losses++
    }
  }

  async playPlayerHandsSimulation(playerHands, dealerUpCard) {
    const finalHands = []

    for (let i = 0; i < playerHands.length; i++) {
      const handObj = playerHands[i]
      const currentHand = [...handObj.hand]
      let canDouble = currentHand.length === 2
      let canSplit = this.canSplit(currentHand) && currentHand.length === 2

      while (true) {
        const handValue = this.calculateHandValue(currentHand)

        if (handValue > 21) {
          break
        }

        const action = this.getBasicStrategyAction(currentHand, dealerUpCard, canDouble, canSplit)

        if (action === "stand") {
          break
        } else if (action === "hit") {
          currentHand.push(this.dealCard())
          canDouble = false
          canSplit = false
        } else if (action === "double") {
          currentHand.push(this.dealCard())
          handObj.bet *= 2
          break
        } else if (action === "split") {
          this.log(`Simulation splits ${currentHand[0].rank}s`)
          const hand1 = [currentHand[0], this.dealCard()]
          const hand2 = [currentHand[1], this.dealCard()]

          playerHands.splice(i, 1, { hand: hand1, bet: handObj.bet }, { hand: hand2, bet: handObj.bet })

          const splitResults = await this.playPlayerHandsSimulation(playerHands.slice(i, i + 2), dealerUpCard)
          finalHands.push(...splitResults)

          i++
          break
        }
      }

      if (!canSplit || this.getBasicStrategyAction(currentHand, dealerUpCard, canDouble, canSplit) !== "split") {
        finalHands.push({ hand: currentHand, bet: handObj.bet })
      }
    }

    return finalHands
  }

  displaySimulationHands(playerHands, dealerHand, hideDealerHole) {
    // Display dealer hand
    this.elements.dealerHand.innerHTML = ""
    dealerHand.forEach((card, index) => {
      const cardElement = document.createElement("div")
      cardElement.className = "card"
      if (["♥", "♦"].includes(card.suit)) {
        cardElement.classList.add("red")
      }

      if (hideDealerHole && index === 1) {
        cardElement.textContent = "?"
        cardElement.style.background = "#333"
        cardElement.style.color = "white"
      } else {
        cardElement.textContent = card.rank + card.suit
      }

      this.elements.dealerHand.appendChild(cardElement)
    })

    const dealerValue = hideDealerHole
      ? this.calculateHandValue([dealerHand[0]]) + "?"
      : this.calculateHandValue(dealerHand)
    this.elements.dealerValue.textContent = dealerValue

    // Display player hands
    this.elements.playerHands.innerHTML = ""
    playerHands.forEach((handObj, handIndex) => {
      const handDiv = document.createElement("div")
      handDiv.className = "player-hand"

      if (this.isBlackjack(handObj.hand)) {
        handDiv.classList.add("blackjack")
      }

      const title = document.createElement("h4")
      title.textContent = `Hand ${handIndex + 1} (Bet: ${handObj.bet})`
      handDiv.appendChild(title)

      const handElement = document.createElement("div")
      handElement.className = "hand"

      handObj.hand.forEach((card) => {
        const cardElement = document.createElement("div")
        cardElement.className = "card"
        if (["♥", "♦"].includes(card.suit)) {
          cardElement.classList.add("red")
        }
        cardElement.textContent = card.rank + card.suit
        handElement.appendChild(cardElement)
      })

      handDiv.appendChild(handElement)

      const valueElement = document.createElement("div")
      valueElement.className = "hand-value"
      valueElement.textContent = `Value: ${this.calculateHandValue(handObj.hand)}`
      handDiv.appendChild(valueElement)

      this.elements.playerHands.appendChild(handDiv)
    })
  }

  displayPlayerHands(hideDealerHole = true) {
    // Display dealer hand
    this.elements.dealerHand.innerHTML = ""
    this.dealerHand.forEach((card, index) => {
      const cardElement = document.createElement("div")
      cardElement.className = "card"
      if (["♥", "♦"].includes(card.suit)) {
        cardElement.classList.add("red")
      }

      if (hideDealerHole && index === 1) {
        cardElement.textContent = "?"
        cardElement.style.background = "#333"
        cardElement.style.color = "white"
      } else {
        cardElement.textContent = card.rank + card.suit
      }

      this.elements.dealerHand.appendChild(cardElement)
    })

    const dealerValue = hideDealerHole
      ? this.calculateHandValue([this.dealerHand[0]]) + "?"
      : this.calculateHandValue(this.dealerHand)
    this.elements.dealerValue.textContent = dealerValue

    // Display player hands
    this.elements.playerHands.innerHTML = ""
    this.playerHands.forEach((handObj, handIndex) => {
      const handDiv = document.createElement("div")
      handDiv.className = "player-hand"

      if (this.isBlackjack(handObj.hand)) {
        handDiv.classList.add("blackjack")
      }

      if (handIndex === this.currentPlayerHandIndex && this.waitingForPlayerAction) {
        handDiv.style.border = "3px solid #ffd700"
      }

      const title = document.createElement("h4")
      title.textContent = `Hand ${handIndex + 1} (Bet: ${handObj.bet} chips)`
      if (handObj.doubled) title.textContent += " - DOUBLED"
      handDiv.appendChild(title)

      const handElement = document.createElement("div")
      handElement.className = "hand"

      handObj.hand.forEach((card) => {
        const cardElement = document.createElement("div")
        cardElement.className = "card"
        if (["♥", "♦"].includes(card.suit)) {
          cardElement.classList.add("red")
        }
        cardElement.textContent = card.rank + card.suit
        handElement.appendChild(cardElement)
      })

      handDiv.appendChild(handElement)

      const valueElement = document.createElement("div")
      valueElement.className = "hand-value"
      valueElement.textContent = `Value: ${this.calculateHandValue(handObj.hand)}`
      handDiv.appendChild(valueElement)

      this.elements.playerHands.appendChild(handDiv)
    })
  }

  getHandString(hand) {
    return hand.map((card) => card.rank + card.suit).join(" ")
  }

  updateDisplay() {
    this.elements.runningCount.textContent = this.runningCount.toFixed(1)

    // Pro KO systém zobrazujeme running count i jako true count
    if (this.countingSystem === "ko") {
      this.elements.trueCount.textContent = `${this.runningCount.toFixed(1)} (RC)`
    } else {
      this.elements.trueCount.textContent = this.trueCount.toFixed(1)
    }

    const remainingCards = this.totalCards - this.cardsDealt
    const remainingDecks = remainingCards / 52
    this.elements.remainingDecks.textContent = remainingDecks.toFixed(1)
    this.elements.cardsLeft.textContent = remainingCards

    this.elements.totalHands.textContent = this.totalHands
    this.elements.currentHand.textContent = this.currentHandNumber
    this.elements.bankroll.textContent = `${this.chips} chips`

    // Update re-buy count display
    if (!document.getElementById("rebuyDisplay")) {
      const rebuyDisplay = document.createElement("div")
      rebuyDisplay.id = "rebuyDisplay"
      rebuyDisplay.className = "stat-item"
      rebuyDisplay.innerHTML = '<label>Re-buys:</label><span id="rebuyCount">0</span>'
      document.querySelector(".game-stats").appendChild(rebuyDisplay)
    }
    document.getElementById("rebuyCount").textContent = this.rebuyCount

    const units = this.currentBet / this.unitSize
    this.elements.currentBet.textContent = `${units} units (${this.currentBet} chips)`

    let totalGames = 0
    let totalPoints = 0

    for (const tc in this.trueCountStats) {
      totalGames += this.trueCountStats[tc].games
      totalPoints += this.trueCountStats[tc].points
    }

    const winRate = totalGames > 0 ? ((totalPoints / totalGames) * 100).toFixed(2) : 0
    this.elements.overallWinRate.textContent = winRate + "%"
  }

  updateStatsTable() {
    const tbody = this.elements.statsBody
    tbody.innerHTML = ""

    const sortedTCs = Object.keys(this.trueCountStats)
      .map((tc) => Number.parseInt(tc))
      .sort((a, b) => a - b)

    for (const tc of sortedTCs) {
      const stats = this.trueCountStats[tc]
      if (stats.games === 0) continue

      const row = document.createElement("tr")
      const successRate = ((stats.points / stats.games) * 100).toFixed(1)
      const winRate = ((stats.wins / stats.games) * 100).toFixed(1)
      const pushRate = ((stats.pushes / stats.games) * 100).toFixed(1)
      const lossRate = ((stats.losses / stats.games) * 100).toFixed(1)

      if (successRate > 50) {
        row.classList.add("positive")
      } else if (successRate < 45) {
        row.classList.add("negative")
      }

      const countLabel = this.countingSystem === "ko" ? `${tc > 0 ? "+" : ""}${tc} (RC)` : `${tc > 0 ? "+" : ""}${tc}`

      row.innerHTML = `
                <td>${countLabel}</td>
                <td>${stats.games}</td>
                <td>${stats.points.toFixed(1)}</td>
                <td>${successRate}% | ${stats.points.toFixed(1)}/${stats.games}</td>
                <td>${winRate}%</td>
                <td>${pushRate}%</td>
                <td>${lossRate}%</td>
                <td>${stats.blackjacks}</td>
            `

      row.addEventListener("click", () => this.showDetailModal(tc, stats))
      tbody.appendChild(row)
    }
  }

  showDetailModal(tc, stats) {
    const countType = this.countingSystem === "ko" ? "Running Count" : "True Count"
    this.elements.modalTitle.textContent = `${countType} ${tc > 0 ? "+" : ""}${tc} Details`

    const successRate = ((stats.points / stats.games) * 100).toFixed(2)
    const expectedValue = (stats.points / stats.games - 0.5).toFixed(4)

    this.elements.modalContent.innerHTML = `
            <div class="detail-stat">
                <span><strong>${countType}:</strong></span>
                <span>${tc > 0 ? "+" : ""}${tc}</span>
            </div>
            <div class="detail-stat">
                <span><strong>Total Games Played:</strong></span>
                <span>${stats.games}</span>
            </div>
            <div class="detail-stat">
                <span><strong>Total Points Earned:</strong></span>
                <span>${stats.points.toFixed(1)}</span>
            </div>
            <div class="detail-stat">
                <span><strong>Success Rate:</strong></span>
                <span>${successRate}%</span>
            </div>
            <div class="detail-stat">
                <span><strong>Wins:</strong></span>
                <span>${stats.wins} (${((stats.wins / stats.games) * 100).toFixed(1)}%)</span>
            </div>
            <div class="detail-stat">
                <span><strong>Pushes:</strong></span>
                <span>${stats.pushes} (${((stats.pushes / stats.games) * 100).toFixed(1)}%)</span>
            </div>
            <div class="detail-stat">
                <span><strong>Losses:</strong></span>
                <span>${stats.losses} (${((stats.losses / stats.games) * 100).toFixed(1)}%)</span>
            </div>
            <div class="detail-stat">
                <span><strong>Blackjacks:</strong></span>
                <span>${stats.blackjacks} (${((stats.blackjacks / stats.games) * 100).toFixed(1)}%)</span>
            </div>
            <div class="detail-stat">
                <span><strong>Expected Value:</strong></span>
                <span>${expectedValue > 0 ? "+" : ""}${expectedValue}</span>
            </div>
            <div class="detail-stat">
                <span><strong>Points per Game:</strong></span>
                <span>${(stats.points / stats.games).toFixed(3)}</span>
            </div>
        `

    this.elements.detailModal.style.display = "block"
  }

  showDeviationsModal() {
    this.elements.deviationsContent.innerHTML = `
            <div class="counting-system-info">
                <h4>Current Counting System: ${this.countingSystems[this.countingSystem].name}</h4>
                <div class="card-values">
                    ${Object.entries(this.countingSystems[this.countingSystem].values)
                      .map(
                        ([card, value]) => `
                            <div class="card-value-item">
                                <strong>${card}</strong><br>${value > 0 ? "+" : ""}${value}
                            </div>
                        `,
                      )
                      .join("")}
                </div>
                ${
                  this.countingSystem === "ko"
                    ? `
                <p><strong>KO System Initial Running Count:</strong> ${this.countingSystems.ko.getInitialRunningCount(this.deckCount)} for ${this.deckCount} decks</p>
                <p><strong>Note:</strong> KO is an unbalanced system. Use Running Count directly (no True Count conversion needed).</p>
                `
                    : ""
                }
            </div>
            
            <h4>Illustrious 18 Deviations</h4>
            <p>These deviations are applied when the ${this.countingSystem === "ko" ? "running count" : "true count"} reaches the specified threshold:</p>
            
            ${this.illustrious18
              .map(
                (deviation) => `
                <div class="deviation-item">
                    <h4>${deviation.player} vs ${deviation.dealer === 1 ? "A" : deviation.dealer}</h4>
                    <p><strong>Action:</strong> ${deviation.action.toUpperCase()}</p>
                    <p><strong>${this.countingSystem === "ko" ? "Running Count" : "True Count"} Threshold:</strong> ${deviation.trueCount > 0 ? "+" : ""}${deviation.trueCount}</p>
                    <p><strong>Description:</strong> ${deviation.description}</p>
                </div>
            `,
              )
              .join("")}
            
            <div class="deviation-item">
                <h4>Insurance</h4>
                <p><strong>Action:</strong> TAKE</p>
                <p><strong>${this.countingSystem === "ko" ? "Running Count" : "True Count"} Threshold:</strong> +3</p>
                <p><strong>Description:</strong> Take insurance when ${this.countingSystem === "ko" ? "running count" : "true count"} is +3 or higher (only offered when dealer shows Ace)</p>
            </div>
        `

    this.elements.deviationsModal.style.display = "block"
  }

  pauseSimulation() {
    this.isPaused = true
    this.elements.startBtn.disabled = false
    this.elements.pauseBtn.disabled = true
    this.log("Simulation paused.")
  }

  stopSimulation() {
    this.isRunning = false
    this.isPaused = false
    this.elements.startBtn.disabled = false
    this.elements.pauseBtn.disabled = true
  }

  resetSimulation() {
    this.stopSimulation()
    this.totalHands = 0
    this.currentHandNumber = 0
          this.chips = 1000 // Reset to starting chips
    this.rebuyCount = 0 // Reset re-buy count
    this.trueCountStats = {}
    this.playerHands = []
    this.dealerHand = []
    this.waitingForPlayerAction = false
    this.initializeShoe()
    this.updateDisplay()
    this.updateStatsTable()
    this.elements.dealerHand.innerHTML = ""
    this.elements.playerHands.innerHTML = ""
    this.elements.dealerValue.textContent = "0"
    this.disablePlayerActions()
    this.log("Game reset. Starting with 10,000 chips.")
  }

  exportData() {
    const data = {
      totalHands: this.totalHands,
      deckCount: this.deckCount,
      countingSystem: this.countingSystem,
      gameMode: this.gameMode,
      chips: this.chips,
      rebuyCount: this.rebuyCount,
      trueCountStats: this.trueCountStats,
      illustrious18: this.illustrious18,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `blackjack_simulation_${this.countingSystem}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  log(message) {
    this.elements.actionLog.textContent = message
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  testDeviationLogic() {
    console.clear()
    console.log("=== TESTING ILLUSTRIOUS 18 DEVIATIONS ===")
    console.log("Testing 16 vs 10 at different counts:")

    // Test 16 vs 10 at different counts
    const testCases = [
      { count: -2, expected: "hit" },
      { count: -1, expected: "hit" },
      { count: 0, expected: "stand" },
      { count: 1, expected: "stand" },
      { count: 2, expected: "stand" },
    ]

    const originalRC = this.runningCount
    const originalTC = this.trueCount

    for (const testCase of testCases) {
      if (this.countingSystem === "ko") {
        this.runningCount = testCase.count
      } else {
        this.trueCount = testCase.count
      }

      const playerHand = [
        { rank: "10", suit: "♠", value: 10, countValue: -1 },
        { rank: "6", suit: "♥", value: 6, countValue: 1 },
      ]
      const dealerUpCard = { rank: "10", suit: "♦", value: 10, countValue: -1 }

      const action = this.getBasicStrategyAction(playerHand, dealerUpCard, false, false)
      const passed = action === testCase.expected

      const countType = this.countingSystem === "ko" ? "RC" : "TC"
      console.log(
        `${countType} ${testCase.count}: Expected ${testCase.expected}, Got ${action} ${passed ? "✅" : "❌"}`,
      )
    }

    // Test insurance logic
    console.log("\nTesting Insurance Logic:")
    const insuranceTests = [
      { count: 2, expected: false },
      { count: 3, expected: true },
      { count: 4, expected: true },
    ]

    for (const test of insuranceTests) {
      if (this.countingSystem === "ko") {
        this.runningCount = test.count
      } else {
        this.trueCount = test.count
      }

      const shouldTake = this.shouldTakeInsurance()
      const passed = shouldTake === test.expected
      const countType = this.countingSystem === "ko" ? "RC" : "TC"
      console.log(`${countType} ${test.count}: Expected ${test.expected}, Got ${shouldTake} ${passed ? "✅" : "❌"}`)
    }

    // Restore original counts
    this.runningCount = originalRC
    this.trueCount = originalTC
    console.log("=== TEST COMPLETE ===")
    const countType = this.countingSystem === "ko" ? "RC" : "TC"
    const currentCount = this.countingSystem === "ko" ? this.runningCount : this.trueCount
    console.log(`${countType} restored to: ${currentCount.toFixed(1)}`)

    // Also show results in the action log
    this.log(`Deviation tests completed - check console for results`)
  }
}

// Initialize the simulation when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new AdvancedBlackjackSimulation()
})
