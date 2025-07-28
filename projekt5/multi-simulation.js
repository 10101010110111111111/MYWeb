class MultiSimulationManager {
  constructor(mainSimulation) {
    this.mainSimulation = mainSimulation
    this.workers = []
    this.isRunning = false
    this.results = []
    this.strategies = []
    this.completedSimulations = 0
    this.totalSimulations = 0

    this.initializeElements()
    this.setupEventListeners()
    this.setupStrategies()
  }

  initializeElements() {
    this.elements = {
      numSimulations: document.getElementById("numSimulations"),
      handsPerSim: document.getElementById("handsPerSim"),
      strategyComparison: document.getElementById("strategyComparison"),
      startMultiSimBtn: document.getElementById("startMultiSimBtn"),
      stopMultiSimBtn: document.getElementById("stopMultiSimBtn"),
      progressSection: document.getElementById("progressSection"),
      overallProgress: document.getElementById("overallProgress"),
      progressText: document.getElementById("progressText"),
      strategyProgress: document.getElementById("strategyProgress"),
      resultsSection: document.getElementById("resultsSection"),
      resultsSummary: document.getElementById("resultsSummary"),
      detailedResults: document.getElementById("detailedResults"),
    }
  }

  setupEventListeners() {
    this.elements.startMultiSimBtn.addEventListener("click", () => this.startMultiSimulation())
    this.elements.stopMultiSimBtn.addEventListener("click", () => this.stopMultiSimulation())
  }

  setupStrategies() {
    this.strategyConfigs = {
      single: [{ name: "Hi-Lo Basic", countingSystem: "hilo", bettingStrategy: "basic" }],
      "counting-systems": [
        { name: "Hi-Lo", countingSystem: "hilo", bettingStrategy: "basic" },
        { name: "Wong Halves", countingSystem: "wong", bettingStrategy: "basic" },
        { name: "KO System", countingSystem: "ko", bettingStrategy: "basic" },
        { name: "Hi-Opt I", countingSystem: "hiopt1", bettingStrategy: "basic" },
      ],
      "betting-strategies": [
        { name: "Spectator Betting", countingSystem: "hilo", bettingStrategy: "spectator" },
        { name: "Conservative Betting", countingSystem: "hilo", bettingStrategy: "conservative" },
        { name: "Basic Betting", countingSystem: "hilo", bettingStrategy: "basic" },
        { name: "Aggressive Betting", countingSystem: "hilo", bettingStrategy: "aggressive" },
      ],
    }
  }

  async startMultiSimulation() {
    const numSims = Number.parseInt(this.elements.numSimulations.value)
    const handsPerSim = Number.parseInt(this.elements.handsPerSim.value)
    const comparisonType = this.elements.strategyComparison.value

    this.strategies = this.strategyConfigs[comparisonType]
    this.totalSimulations = numSims * this.strategies.length
    this.completedSimulations = 0
    this.results = []
    this.isRunning = true

    // Update UI
    this.elements.startMultiSimBtn.disabled = true
    this.elements.stopMultiSimBtn.disabled = false
    this.elements.progressSection.style.display = "block"
    this.elements.resultsSection.style.display = "none"

    this.updateProgress()
    this.createStrategyProgressDisplay()

    // Start simulations for each strategy
    const promises = []
    for (const strategy of this.strategies) {
      for (let i = 0; i < numSims; i++) {
        promises.push(this.runSingleSimulation(strategy, handsPerSim, i))
      }
    }

    try {
      await Promise.all(promises)
      this.displayResults()
    } catch (error) {
      console.error("Multi-simulation error:", error)
    } finally {
      this.isRunning = false
      this.elements.startMultiSimBtn.disabled = false
      this.elements.stopMultiSimBtn.disabled = true
    }
  }

  async runSingleSimulation(strategy, handsPerSim, simIndex) {
    return new Promise((resolve) => {
      // Create a simulation worker (simulated with setTimeout for non-blocking execution)
      const worker = {
        strategy: strategy,
        simIndex: simIndex,
        handsPlayed: 0,
        targetHands: handsPerSim,
        chips: 1000,
        rebuyCount: 0,
        totalHands: 0,
        trueCountStats: {},
        runningCount: 0,
        trueCount: 0,
        cardsDealt: 0,
        shoe: [],
        deckCount: 8,
        totalCards: 8 * 52,
      }

      this.initializeWorkerShoe(worker)
      this.runWorkerSimulation(worker, resolve)
    })
  }

  initializeWorkerShoe(worker) {
    worker.shoe = []
    const suits = ["♠", "♥", "♦", "♣"]
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

    // Create decks
    for (let deck = 0; deck < worker.deckCount; deck++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          worker.shoe.push({
            rank: rank,
            suit: suit,
            value: this.getCardValue(rank),
            countValue: this.getCountValue(rank, worker.strategy.countingSystem),
          })
        }
      }
    }

    // Shuffle
    for (let i = worker.shoe.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[worker.shoe[i], worker.shoe[j]] = [worker.shoe[j], worker.shoe[i]]
    }

    worker.cardsDealt = 0

    // OPRAVENO: Nastavení počátečního running count pro KO systém
    if (worker.strategy.countingSystem === "ko") {
      const initialCounts = { 1: 0, 2: -4, 6: -20, 8: -28 }
      worker.runningCount = initialCounts[worker.deckCount] || -4 * (worker.deckCount - 1)
    } else {
      worker.runningCount = 0
    }

    worker.trueCount = 0
  }

  async runWorkerSimulation(worker, resolve) {
    const batchSize = 100 // Process hands in batches to prevent freezing

    const processBatch = () => {
      if (!this.isRunning || worker.handsPlayed >= worker.targetHands) {
        this.completeWorkerSimulation(worker, resolve)
        return
      }

      // Process a batch of hands
      for (let i = 0; i < batchSize && worker.handsPlayed < worker.targetHands && this.isRunning; i++) {
        this.playWorkerHand(worker)
        worker.handsPlayed++
        worker.totalHands++
      }

      this.updateWorkerProgress(worker)

      // Schedule next batch
      setTimeout(processBatch, 1)
    }

    processBatch()
  }

  playWorkerHand(worker) {
    // Check if need to reshuffle
    if (worker.cardsDealt >= worker.totalCards * 0.75) {
      this.initializeWorkerShoe(worker)
    }

    // OPRAVENO: Použití správného count pro různé systémy
    const handCount = worker.strategy.countingSystem === "ko" ? worker.runningCount : Math.floor(worker.trueCount)

    // Calculate bet
    const betSize = this.calculateWorkerBetSize(worker)

    // If spectator mode (bet = 0), just observe the hand
    if (betSize === 0) {
      // Deal cards but don't bet
      const playerHand = [this.dealWorkerCard(worker), this.dealWorkerCard(worker)]
      const dealerHand = [this.dealWorkerCard(worker), this.dealWorkerCard(worker)]

      // Play out the hand for counting purposes but no money involved
      const playerBJ = this.isBlackjack(playerHand)
      const dealerBJ = this.isBlackjack(dealerHand)

      if (!playerBJ && !dealerBJ) {
        // Play out player hand
        this.playWorkerPlayerHands([{ hand: playerHand, bet: 0 }], dealerHand[0], worker)

        // Dealer plays
        while (this.calculateHandValue(dealerHand) < 17) {
          dealerHand.push(this.dealWorkerCard(worker))
        }
      }

      // No payout in spectator mode
      return
    }

    // Normal betting logic continues here...
    if (worker.chips < betSize) {
              worker.chips += 1000
      worker.rebuyCount++
    }
    worker.chips -= betSize

    // Deal cards
    const playerHand = [this.dealWorkerCard(worker), this.dealWorkerCard(worker)]
    const dealerHand = [this.dealWorkerCard(worker), this.dealWorkerCard(worker)]

    const playerBJ = this.isBlackjack(playerHand)
    const dealerBJ = this.isBlackjack(dealerHand)

    let payout = 0

    if (playerBJ && dealerBJ) {
      payout = betSize // Push
    } else if (playerBJ) {
      payout = betSize + Math.floor(betSize * 1.5) // Blackjack 3:2
    } else if (dealerBJ) {
      payout = 0 // Loss
    } else {
      // Play out hand
      const finalPlayerHands = this.playWorkerPlayerHands([{ hand: playerHand, bet: betSize }], dealerHand[0], worker)

      // Dealer plays
      while (this.calculateHandValue(dealerHand) < 17) {
        dealerHand.push(this.dealWorkerCard(worker))
      }

      const dealerValue = this.calculateHandValue(dealerHand)
      const dealerBusted = dealerValue > 21

      // Calculate payouts
      for (const handObj of finalPlayerHands) {
        const playerValue = this.calculateHandValue(handObj.hand)

        if (playerValue > 21) {
          // Bust - no payout
        } else if (dealerBusted || playerValue > dealerValue) {
          payout += handObj.bet * 2 // Win
        } else if (playerValue === dealerValue) {
          payout += handObj.bet // Push
        }
        // Loss - no payout
      }
    }

    worker.chips += payout
  }

  playWorkerPlayerHands(playerHands, dealerUpCard, worker) {
    const finalHands = []

    for (const handObj of playerHands) {
      const currentHand = [...handObj.hand]
      let canDouble = currentHand.length === 2
      let canSplit = this.canSplit(currentHand) && currentHand.length === 2

      while (true) {
        const handValue = this.calculateHandValue(currentHand)

        if (handValue > 21) break

        const action = this.getWorkerBasicStrategyAction(currentHand, dealerUpCard, canDouble, canSplit, worker)

        if (action === "stand") {
          break
        } else if (action === "hit") {
          currentHand.push(this.dealWorkerCard(worker))
          canDouble = false
          canSplit = false
        } else if (action === "double") {
          currentHand.push(this.dealWorkerCard(worker))
          handObj.bet *= 2
          break
        } else if (action === "split") {
          const hand1 = [currentHand[0], this.dealWorkerCard(worker)]
          const hand2 = [currentHand[1], this.dealWorkerCard(worker)]

          const splitResults = this.playWorkerPlayerHands(
            [
              { hand: hand1, bet: handObj.bet },
              { hand: hand2, bet: handObj.bet },
            ],
            dealerUpCard,
            worker,
          )

          finalHands.push(...splitResults)
          return finalHands
        }
      }

      finalHands.push({ hand: currentHand, bet: handObj.bet })
    }

    return finalHands
  }

  calculateWorkerBetSize(worker) {
    // OPRAVENO: Použití správného count pro různé systémy
    const count = worker.strategy.countingSystem === "ko" ? worker.runningCount : Math.floor(worker.trueCount)
    const unitSize = 100
    let units = 1

    switch (worker.strategy.bettingStrategy) {
      case "spectator":
        if (count < 1)
          units = 0 // Spectator mode - no betting when disadvantaged
        else if (count >= 3) units = 3
        else if (count >= 2) units = 2
        else if (count >= 1) units = 1
        break

      case "conservative":
        if (count < 1)
          units = 1 // Always bet at least 1 unit
        else if (count >= 3) units = 4
        else if (count >= 2) units = 3
        else if (count >= 1) units = 2
        else units = 1
        break

      case "basic":
        if (count < 1)
          units = 1 // Always bet at least 1 unit
        else if (count >= 4) units = 8
        else if (count >= 3) units = 6
        else if (count >= 2) units = 4
        else if (count >= 1) units = 2
        else units = 1
        break

      case "aggressive":
        if (count < 1)
          units = 1 // Always bet at least 1 unit
        else if (count >= 4) units = 12
        else if (count >= 3) units = 9
        else if (count >= 2) units = 6
        else if (count >= 1) units = 3
        else units = 1
        break
    }

    return units * unitSize
  }

  dealWorkerCard(worker) {
    if (worker.shoe.length === 0) {
      this.initializeWorkerShoe(worker)
    }

    const card = worker.shoe.pop()
    worker.cardsDealt++
    worker.runningCount += card.countValue

    const remainingCards = worker.totalCards - worker.cardsDealt
    const remainingDecks = remainingCards / 52

    // OPRAVENO: True count jen pro vyvážené systémy
    if (worker.strategy.countingSystem === "ko") {
      worker.trueCount = worker.runningCount // Pro KO používáme RC
    } else {
      worker.trueCount = remainingDecks > 0 ? worker.runningCount / remainingDecks : 0
    }

    return card
  }

  getCardValue(rank) {
    if (rank === "A") return 11
    if (["J", "Q", "K"].includes(rank)) return 10
    return Number.parseInt(rank)
  }

  getCountValue(rank, countingSystem) {
    const systems = {
      hilo: { 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 0, 8: 0, 9: 0, 10: -1, J: -1, Q: -1, K: -1, A: -1 },
      wong: { 2: 0.5, 3: 1, 4: 1, 5: 1.5, 6: 1, 7: 0.5, 8: 0, 9: -0.5, 10: -1, J: -1, Q: -1, K: -1, A: -1 },
      ko: { 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 0, 9: 0, 10: -1, J: -1, Q: -1, K: -1, A: -1 },
      hiopt1: { 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 0, 8: 0, 9: 0, 10: -1, J: -1, Q: -1, K: -1, A: 0 },
    }
    return systems[countingSystem][rank] || 0
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

  canSplit(hand) {
    return hand.length === 2 && hand[0].rank === hand[1].rank
  }

  getWorkerBasicStrategyAction(playerHand, dealerUpCard, canDouble, canSplit, worker) {
    // Simplified basic strategy for workers
    const playerValue = this.calculateHandValue(playerHand)
    const dealerValue = dealerUpCard.value === 11 ? 1 : dealerUpCard.value

    // Check for splits
    if (canSplit) {
      const rank = playerHand[0].rank
      if (rank === "A" || rank === "8") return "split"
      if (["10", "J", "Q", "K"].includes(rank)) return "stand"
    }

    // Basic strategy
    if (playerValue >= 17) return "stand"
    if (playerValue >= 13 && dealerValue <= 6) return "stand"
    if (playerValue === 12 && [4, 5, 6].includes(dealerValue)) return "stand"
    if (playerValue === 11 && canDouble && dealerValue !== 1) return "double"
    if (playerValue === 10 && canDouble && dealerValue <= 9) return "double"

    return "hit"
  }

  updateWorkerProgress(worker) {
    // This would update individual worker progress if needed
  }

  completeWorkerSimulation(worker, resolve) {
    const result = {
      strategy: worker.strategy,
      simIndex: worker.simIndex,
      finalChips: worker.chips,
      rebuyCount: worker.rebuyCount,
      totalHands: worker.totalHands,
              netResult: worker.chips - 1000 - worker.rebuyCount * 1000,
        roi: ((worker.chips - 1000 - worker.rebuyCount * 1000) / (1000 + worker.rebuyCount * 1000)) * 100,
    }

    this.results.push(result)
    this.completedSimulations++
    this.updateProgress()

    resolve(result)
  }

  updateProgress() {
    const progressPercent = (this.completedSimulations / this.totalSimulations) * 100
    this.elements.overallProgress.style.width = `${progressPercent}%`
    this.elements.progressText.textContent = `${Math.round(progressPercent)}% Complete (${this.completedSimulations}/${this.totalSimulations})`

    this.updateStrategyProgress()
  }

  createStrategyProgressDisplay() {
    this.elements.strategyProgress.innerHTML = ""

    for (const strategy of this.strategies) {
      const strategyDiv = document.createElement("div")
      strategyDiv.className = "strategy-item"
      strategyDiv.id = `strategy-${strategy.name.replace(/\s+/g, "-")}`

      strategyDiv.innerHTML = `
        <div class="strategy-name">${strategy.name}</div>
        <div class="strategy-stats">
          <div class="stat-item-small">
            <label>Completed:</label>
            <span class="completed-count">0</span>
          </div>
          <div class="stat-item-small">
            <label>Avg Chips:</label>
            <span class="avg-chips">-</span>
          </div>
          <div class="stat-item-small">
            <label>Avg ROI:</label>
            <span class="avg-roi">-</span>
          </div>
          <div class="stat-item-small">
            <label>Avg Rebuys:</label>
            <span class="avg-rebuys">-</span>
          </div>
        </div>
      `

      this.elements.strategyProgress.appendChild(strategyDiv)
    }
  }

  updateStrategyProgress() {
    for (const strategy of this.strategies) {
      const strategyResults = this.results.filter((r) => r.strategy.name === strategy.name)
      const strategyDiv = document.getElementById(`strategy-${strategy.name.replace(/\s+/g, "-")}`)

      if (strategyDiv && strategyResults.length > 0) {
        const avgChips = strategyResults.reduce((sum, r) => sum + r.finalChips, 0) / strategyResults.length
        const avgROI = strategyResults.reduce((sum, r) => sum + r.roi, 0) / strategyResults.length
        const avgRebuys = strategyResults.reduce((sum, r) => sum + r.rebuyCount, 0) / strategyResults.length

        strategyDiv.querySelector(".completed-count").textContent = strategyResults.length
        strategyDiv.querySelector(".avg-chips").textContent = Math.round(avgChips).toLocaleString()
        strategyDiv.querySelector(".avg-roi").textContent = `${avgROI.toFixed(2)}%`
        strategyDiv.querySelector(".avg-rebuys").textContent = avgRebuys.toFixed(1)
      }
    }
  }

  displayResults() {
    this.elements.resultsSection.style.display = "block"

    // Calculate strategy summaries
    const strategySummaries = this.strategies.map((strategy) => {
      const strategyResults = this.results.filter((r) => r.strategy.name === strategy.name)

      const avgChips = strategyResults.reduce((sum, r) => sum + r.finalChips, 0) / strategyResults.length
      const avgROI = strategyResults.reduce((sum, r) => sum + r.roi, 0) / strategyResults.length
      const avgRebuys = strategyResults.reduce((sum, r) => sum + r.rebuyCount, 0) / strategyResults.length
      const winRate = (strategyResults.filter((r) => r.netResult > 0).length / strategyResults.length) * 100

      return {
        strategy,
        avgChips,
        avgROI,
        avgRebuys,
        winRate,
        simCount: strategyResults.length,
        results: strategyResults,
      }
    })

    // Sort by average ROI
    strategySummaries.sort((a, b) => b.avgROI - a.avgROI)

    this.displayStrategySummaries(strategySummaries)
    this.displayDetailedResults(strategySummaries)
  }

  displayStrategySummaries(summaries) {
    this.elements.resultsSummary.innerHTML = ""

    summaries.forEach((summary, index) => {
      const isWinner = index === 0 && summaries.length > 1
      const isLoser = index === summaries.length - 1 && summaries.length > 1 && index > 0

      const summaryDiv = document.createElement("div")
      summaryDiv.className = `strategy-result ${isWinner ? "winner" : isLoser ? "loser" : ""}`

      summaryDiv.innerHTML = `
        <h4>${summary.strategy.name} ${isWinner ? "🏆 WINNER" : isLoser ? "📉 LOWEST" : ""}</h4>
        <div class="result-stats">
          <div class="result-stat">
            <label>Average Final Chips:</label>
            <span>${Math.round(summary.avgChips).toLocaleString()}</span>
          </div>
          <div class="result-stat">
            <label>Average ROI:</label>
            <span class="${summary.avgROI > 0 ? "positive-result" : "negative-result"}">${summary.avgROI.toFixed(2)}%</span>
          </div>
          <div class="result-stat">
            <label>Win Rate:</label>
            <span>${summary.winRate.toFixed(1)}%</span>
          </div>
          <div class="result-stat">
            <label>Average Rebuys:</label>
            <span>${summary.avgRebuys.toFixed(1)}</span>
          </div>
          <div class="result-stat">
            <label>Simulations:</label>
            <span>${summary.simCount}</span>
          </div>
        </div>
      `

      this.elements.resultsSummary.appendChild(summaryDiv)
    })
  }

  displayDetailedResults(summaries) {
    this.elements.detailedResults.innerHTML = "<h4>Detailed Results</h4>"

    for (const summary of summaries) {
      const tableDiv = document.createElement("div")
      tableDiv.innerHTML = `
        <h5>${summary.strategy.name} - Individual Simulations</h5>
        <table class="simulation-table">
          <thead>
            <tr>
              <th>Sim #</th>
              <th>Final Chips</th>
              <th>Net Result</th>
              <th>ROI</th>
              <th>Rebuys</th>
              <th>Total Hands</th>
            </tr>
          </thead>
          <tbody>
            ${summary.results
              .map(
                (result) => `
              <tr>
                <td>${result.simIndex + 1}</td>
                <td>${result.finalChips.toLocaleString()}</td>
                <td class="${result.netResult > 0 ? "positive-result" : "negative-result"}">
                  ${result.netResult > 0 ? "+" : ""}${result.netResult.toLocaleString()}
                </td>
                <td class="${result.roi > 0 ? "positive-result" : "negative-result"}">
                  ${result.roi.toFixed(2)}%
                </td>
                <td>${result.rebuyCount}</td>
                <td>${result.totalHands.toLocaleString()}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `

      this.elements.detailedResults.appendChild(tableDiv)
    }
  }

  stopMultiSimulation() {
    this.isRunning = false
    this.elements.startMultiSimBtn.disabled = false
    this.elements.stopMultiSimBtn.disabled = true
  }
}
