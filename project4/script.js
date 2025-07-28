class PokerSimulator {
  constructor() {
    this.deck = []
    this.players = []
    this.communityCards = []
    this.gameNumber = 0
    this.isRunning = false
    this.isPaused = false
    this.speed = 1
    this.gameLog = []
    this.winStats = {}
    this.tieStats = {}
    this.appearanceStats = {} // Add this line
    this.intervalId = null

    this.suits = ["♠", "♥", "♦", "♣"]
    this.ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
    this.rankValues = {
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      J: 11,
      Q: 12,
      K: 13,
      A: 14,
    }

    this.handRankings = {
      "High Card": 1,
      "One Pair": 2,
      "Two Pair": 3,
      "Three of a Kind": 4,
      Straight: 5,
      Flush: 6,
      "Full House": 7,
      "Four of a Kind": 8,
      "Straight Flush": 9,
      "Royal Flush": 10,
    }

    this.initializeEventListeners()
    this.updatePlayersGrid()
  }

  initializeEventListeners() {
    document.getElementById("startBtn").addEventListener("click", () => this.startSimulation())
    document.getElementById("pauseBtn").addEventListener("click", () => this.pauseSimulation())
    document.getElementById("stopBtn").addEventListener("click", () => this.stopSimulation())

    document.getElementById("playerCount").addEventListener("change", () => this.updatePlayersGrid())
    document
      .getElementById("speedControl")
      .addEventListener("input", (e) => {
        this.speed = Number.parseInt(e.target.value)
        document.getElementById("speedValue").textContent = `${this.speed}x`
      })

    // Format toggle listeners
    ;["showFull", "showSuited", "showMerged"].forEach((id) => {
      document.getElementById(id).addEventListener("change", () => this.updateStatsTables())
    })

    document.getElementById("topFilter").addEventListener("change", () => this.updateStatsTables())
  }

  createDeck() {
    this.deck = []
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        this.deck.push({ rank, suit })
      }
    }
    this.shuffleDeck()
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]
    }
  }

  dealCard() {
    return this.deck.pop()
  }

  updatePlayersGrid() {
    const playerCount = Number.parseInt(document.getElementById("playerCount").value)
    const grid = document.getElementById("playersGrid")

    // Calculate grid layout
    let cols, rows
    if (playerCount <= 5) {
      cols = playerCount
      rows = 1
    } else {
      cols = Math.ceil(playerCount / 2)
      rows = 2
    }

    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
    grid.innerHTML = ""

    for (let i = 1; i <= playerCount; i++) {
      const playerDiv = document.createElement("div")
      playerDiv.className = "player-card"
      playerDiv.id = `player${i}`
      playerDiv.innerHTML = `
                <div class="player-name">Player ${i}</div>
                <div class="player-cards" id="player${i}Cards"></div>
                <div class="player-result" id="player${i}Result"></div>
            `
      grid.appendChild(playerDiv)
    }
  }

  startSimulation() {
    const playerCount = Number.parseInt(document.getElementById("playerCount").value)
    this.players = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      cards: [],
      bestHand: null,
    }))

    this.isRunning = true
    this.isPaused = false
    this.gameNumber = 0
    this.gameLog = []
    this.winStats = {}
    this.tieStats = {}
    this.appearanceStats = {} // Add this line

    document.getElementById("startBtn").disabled = true
    document.getElementById("pauseBtn").disabled = false
    document.getElementById("stopBtn").disabled = false
    document.getElementById("playerCount").disabled = true
    document.getElementById("gameStatus").textContent = "Running"

    this.runGame()
  }

  pauseSimulation() {
    if (this.isPaused) {
      this.isPaused = false
      document.getElementById("pauseBtn").textContent = "Pause"
      document.getElementById("gameStatus").textContent = "Running"
      this.runGame()
    } else {
      this.isPaused = true
      document.getElementById("pauseBtn").textContent = "Resume"
      document.getElementById("gameStatus").textContent = "Paused"
      if (this.intervalId) {
        clearTimeout(this.intervalId)
      }
    }
  }

  stopSimulation() {
    this.isRunning = false
    this.isPaused = false

    if (this.intervalId) {
      clearTimeout(this.intervalId)
    }

    document.getElementById("startBtn").disabled = false
    document.getElementById("pauseBtn").disabled = true
    document.getElementById("stopBtn").disabled = true
    document.getElementById("playerCount").disabled = false
    document.getElementById("gameStatus").textContent = "Stopped"
    document.getElementById("exportSection").style.display = "block"
  }

  runGame() {
    if (!this.isRunning || this.isPaused) return

    this.gameNumber++
    document.getElementById("gameNumber").textContent = this.gameNumber

    // Create and shuffle deck
    this.createDeck()

    // Deal hole cards
    this.players.forEach((player) => {
      player.cards = [this.dealCard(), this.dealCard()]
    })

    // Deal community cards
    this.communityCards = [this.dealCard(), this.dealCard(), this.dealCard(), this.dealCard(), this.dealCard()]

    // Evaluate hands
    this.evaluateHands()

    // Update display
    this.updateDisplay()

    // Log game
    this.logGame()

    // Update statistics
    this.updateStatistics()

    // Schedule next game
    const delay = Math.max(1, 5000 / this.speed)
    this.intervalId = setTimeout(() => this.runGame(), delay)
  }

  evaluateHands() {
    this.players.forEach((player) => {
      const allCards = [...player.cards, ...this.communityCards]
      player.bestHand = this.getBestHand(allCards)
    })
  }

  getBestHand(cards) {
    const combinations = this.getCombinations(cards, 5)
    let bestHand = null
    let bestRank = 0

    for (const combo of combinations) {
      const hand = this.evaluateHand(combo)
      if (hand.rank > bestRank || (hand.rank === bestRank && this.compareHands(hand, bestHand) > 0)) {
        bestHand = hand
        bestRank = hand.rank
      }
    }

    return bestHand
  }

  getCombinations(arr, k) {
    if (k === 1) return arr.map((x) => [x])
    if (k === arr.length) return [arr]

    const combinations = []
    for (let i = 0; i <= arr.length - k; i++) {
      const head = arr[i]
      const tailCombos = this.getCombinations(arr.slice(i + 1), k - 1)
      for (const combo of tailCombos) {
        combinations.push([head, ...combo])
      }
    }
    return combinations
  }

  evaluateHand(cards) {
    const sortedCards = cards.sort((a, b) => this.rankValues[b.rank] - this.rankValues[a.rank])
    const ranks = sortedCards.map((card) => card.rank)
    const suits = sortedCards.map((card) => card.suit)

    const rankCounts = {}
    ranks.forEach((rank) => (rankCounts[rank] = (rankCounts[rank] || 0) + 1))
    const counts = Object.values(rankCounts).sort((a, b) => b - a)
    const uniqueRanks = Object.keys(rankCounts).sort((a, b) => this.rankValues[b] - this.rankValues[a])

    const isFlush = suits.every((suit) => suit === suits[0])
    const isStraight = this.isStraight(ranks)
    const isRoyalStraight =
      ranks.includes("A") && ranks.includes("K") && ranks.includes("Q") && ranks.includes("J") && ranks.includes("10")

    let handType, rank, tiebreakers

    if (isFlush && isStraight && isRoyalStraight) {
      handType = "Royal Flush"
      rank = 10
      tiebreakers = []
    } else if (isFlush && isStraight) {
      handType = "Straight Flush"
      rank = 9
      tiebreakers = [this.getStraightHigh(ranks)]
    } else if (counts[0] === 4) {
      handType = "Four of a Kind"
      rank = 8
      const fourKind = uniqueRanks.find((r) => rankCounts[r] === 4)
      const kicker = uniqueRanks.find((r) => rankCounts[r] === 1)
      tiebreakers = [this.rankValues[fourKind], this.rankValues[kicker]]
    } else if (counts[0] === 3 && counts[1] === 2) {
      handType = "Full House"
      rank = 7
      const threeKind = uniqueRanks.find((r) => rankCounts[r] === 3)
      const pair = uniqueRanks.find((r) => rankCounts[r] === 2)
      tiebreakers = [this.rankValues[threeKind], this.rankValues[pair]]
    } else if (isFlush) {
      handType = "Flush"
      rank = 6
      tiebreakers = uniqueRanks.map((r) => this.rankValues[r])
    } else if (isStraight) {
      handType = "Straight"
      rank = 5
      tiebreakers = [this.getStraightHigh(ranks)]
    } else if (counts[0] === 3) {
      handType = "Three of a Kind"
      rank = 4
      const threeKind = uniqueRanks.find((r) => rankCounts[r] === 3)
      const kickers = uniqueRanks.filter((r) => rankCounts[r] === 1)
      tiebreakers = [this.rankValues[threeKind], ...kickers.map((r) => this.rankValues[r])]
    } else if (counts[0] === 2 && counts[1] === 2) {
      handType = "Two Pair"
      rank = 3
      const pairs = uniqueRanks.filter((r) => rankCounts[r] === 2)
      const kicker = uniqueRanks.find((r) => rankCounts[r] === 1)
      tiebreakers = [this.rankValues[pairs[0]], this.rankValues[pairs[1]], this.rankValues[kicker]]
    } else if (counts[0] === 2) {
      handType = "One Pair"
      rank = 2
      const pair = uniqueRanks.find((r) => rankCounts[r] === 2)
      const kickers = uniqueRanks.filter((r) => rankCounts[r] === 1)
      tiebreakers = [this.rankValues[pair], ...kickers.map((r) => this.rankValues[r])]
    } else {
      handType = "High Card"
      rank = 1
      tiebreakers = uniqueRanks.map((r) => this.rankValues[r])
    }

    return {
      type: handType,
      rank,
      tiebreakers,
      cards: sortedCards,
    }
  }

  isStraight(ranks) {
    const values = ranks.map((rank) => this.rankValues[rank]).sort((a, b) => b - a)

    // Check for regular straight
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] - values[i + 1] !== 1) {
        break
      }
      if (i === 3) return true
    }

    // Check for A-2-3-4-5 straight
    if (values.includes(14) && values.includes(5) && values.includes(4) && values.includes(3) && values.includes(2)) {
      return true
    }

    return false
  }

  getStraightHigh(ranks) {
    const values = ranks.map((rank) => this.rankValues[rank]).sort((a, b) => b - a)

    // Check for A-2-3-4-5 straight (wheel)
    if (values.includes(14) && values.includes(5) && values.includes(4) && values.includes(3) && values.includes(2)) {
      return 5 // 5-high straight
    }

    return Math.max(...values)
  }

  compareHands(hand1, hand2) {
    if (hand1.rank !== hand2.rank) {
      return hand1.rank - hand2.rank
    }

    for (let i = 0; i < Math.max(hand1.tiebreakers.length, hand2.tiebreakers.length); i++) {
      const val1 = hand1.tiebreakers[i] || 0
      const val2 = hand2.tiebreakers[i] || 0
      if (val1 !== val2) {
        return val1 - val2
      }
    }

    return 0
  }

  updateDisplay() {
    // Update community cards
    const communityDiv = document.getElementById("communityCards")
    communityDiv.innerHTML = ""
    this.communityCards.forEach((card) => {
      communityDiv.appendChild(this.createCardElement(card))
    })

    // Find winners
    const winners = this.findWinners()

    // Update players
    this.players.forEach((player) => {
      const playerDiv = document.getElementById(`player${player.id}`)
      const cardsDiv = document.getElementById(`player${player.id}Cards`)
      const resultDiv = document.getElementById(`player${player.id}Result`)

      // Clear previous cards
      cardsDiv.innerHTML = ""
      player.cards.forEach((card) => {
        cardsDiv.appendChild(this.createCardElement(card))
      })

      // Update result
      resultDiv.textContent = player.bestHand.type

      // Highlight winners
      if (winners.includes(player.id)) {
        playerDiv.classList.add("winner")
      } else {
        playerDiv.classList.remove("winner")
      }
    })
  }

  createCardElement(card) {
    const cardDiv = document.createElement("div")
    cardDiv.className = `card ${["♥", "♦"].includes(card.suit) ? "red" : "black"}`
    cardDiv.innerHTML = `
            <div class="card-rank">${card.rank}</div>
            <div class="card-suit">${card.suit}</div>
        `
    return cardDiv
  }

  findWinners() {
    let bestRank = 0
    let bestComparison = Number.NEGATIVE_INFINITY

    // Find the best hand rank and comparison value
    this.players.forEach((player) => {
      if (
        player.bestHand.rank > bestRank ||
        (player.bestHand.rank === bestRank &&
          this.compareHands(player.bestHand, { rank: bestRank, tiebreakers: [] }) > bestComparison)
      ) {
        bestRank = player.bestHand.rank
        bestComparison = this.compareHands(player.bestHand, { rank: bestRank, tiebreakers: [] })
      }
    })

    // Find all players with the best hand
    const winners = []
    let bestHand = null

    this.players.forEach((player) => {
      if (player.bestHand.rank === bestRank) {
        if (!bestHand) {
          bestHand = player.bestHand
          winners.push(player.id)
        } else {
          const comparison = this.compareHands(player.bestHand, bestHand)
          if (comparison > 0) {
            winners.length = 0
            winners.push(player.id)
            bestHand = player.bestHand
          } else if (comparison === 0) {
            winners.push(player.id)
          }
        }
      }
    })

    return winners
  }

  logGame() {
    const winners = this.findWinners()
    const gameEntry = {
      gameNumber: this.gameNumber,
      communityCards: [...this.communityCards],
      players: this.players.map((player) => ({
        id: player.id,
        cards: [...player.cards],
        bestHand: player.bestHand.type,
        isWinner: winners.includes(player.id),
      })),
      winners: winners,
    }

    this.gameLog.push(gameEntry)
  }

  updateStatistics() {
    const winners = this.findWinners()

    // Track appearances for all players
    this.players.forEach((player) => {
      const holeCards = player.cards.sort((a, b) => this.rankValues[b.rank] - this.rankValues[a.rank])

      // Generate different hand representations
      const fullHand = `${holeCards[0].rank}${holeCards[0].suit} ${holeCards[1].rank}${holeCards[1].suit}`
      const suitedHand = this.getSuitedRepresentation(holeCards)
      const mergedHand = this.getMergedRepresentation(holeCards)

      // Update appearance stats for all hands
      this.appearanceStats[fullHand] = (this.appearanceStats[fullHand] || 0) + 1
      this.appearanceStats[suitedHand] = (this.appearanceStats[suitedHand] || 0) + 1
      this.appearanceStats[mergedHand] = (this.appearanceStats[mergedHand] || 0) + 1
    })

    // Update win/tie stats only for winners
    winners.forEach((winnerId) => {
      const player = this.players.find((p) => p.id === winnerId)
      const holeCards = player.cards.sort((a, b) => this.rankValues[b.rank] - this.rankValues[a.rank])

      // Generate different hand representations
      const fullHand = `${holeCards[0].rank}${holeCards[0].suit} ${holeCards[1].rank}${holeCards[1].suit}`
      const suitedHand = this.getSuitedRepresentation(holeCards)
      const mergedHand = this.getMergedRepresentation(holeCards)

      // Update win stats
      if (winners.length === 1) {
        this.winStats[fullHand] = (this.winStats[fullHand] || 0) + 1
        this.winStats[suitedHand] = (this.winStats[suitedHand] || 0) + 1
        this.winStats[mergedHand] = (this.winStats[mergedHand] || 0) + 1
      } else {
        // It's a tie
        this.tieStats[fullHand] = (this.tieStats[fullHand] || 0) + 1
        this.tieStats[suitedHand] = (this.tieStats[suitedHand] || 0) + 1
        this.tieStats[mergedHand] = (this.tieStats[mergedHand] || 0) + 1
      }
    })

    this.updateStatsTables()
  }

  getSuitedRepresentation(cards) {
    const [card1, card2] = cards
    const suited = card1.suit === card2.suit ? "s" : "o"
    return `${card1.rank}${card2.rank}${suited}`
  }

  getMergedRepresentation(cards) {
    const [card1, card2] = cards
    return `${card1.rank}${card2.rank}`
  }

  updateStatsTables() {
    this.updateStatsTable("winsTable", this.winStats)
    this.updateStatsTable("tiesTable", this.tieStats)
    this.updateStatsTable("appearancesTable", this.appearanceStats)
    this.updateScoreTable("winScoreTable", this.winStats, this.appearanceStats, "win")
    this.updateScoreTable("tieScoreTable", this.tieStats, this.appearanceStats, "tie")
  }

  updateStatsTable(tableId, stats) {
    const table = document.getElementById(tableId)
    const tbody = table.querySelector("tbody")
    tbody.innerHTML = ""

    const showFull = document.getElementById("showFull").checked
    const showSuited = document.getElementById("showSuited").checked
    const showMerged = document.getElementById("showMerged").checked
    const topFilter = document.getElementById("topFilter").value

    // Filter stats based on selected formats
    const filteredStats = {}

    Object.entries(stats).forEach(([hand, count]) => {
      let shouldShow = false

      if (showFull && hand.includes("♠♥♦♣".split("").find((s) => hand.includes(s)))) {
        shouldShow = true
      }
      if (showSuited && (hand.endsWith("s") || hand.endsWith("o"))) {
        shouldShow = true
      }
      if (
        showMerged &&
        !hand.includes("♠") &&
        !hand.includes("♥") &&
        !hand.includes("♦") &&
        !hand.includes("♣") &&
        !hand.endsWith("s") &&
        !hand.endsWith("o")
      ) {
        shouldShow = true
      }

      if (shouldShow) {
        filteredStats[hand] = count
      }
    })

    // Sort by count
    const sortedStats = Object.entries(filteredStats).sort(([, a], [, b]) => b - a)

    // Apply top filter
    const limitedStats = topFilter === "all" ? sortedStats : sortedStats.slice(0, Number.parseInt(topFilter))

    // Populate table
    limitedStats.forEach(([hand, count]) => {
      const row = tbody.insertRow()
      row.insertCell(0).textContent = hand
      row.insertCell(1).textContent = count
    })
  }

  updateScoreTable(tableId, stats, appearanceStats, scoreType) {
    const table = document.getElementById(tableId)
    const tbody = table.querySelector("tbody")
    tbody.innerHTML = ""

    const showFull = document.getElementById("showFull").checked
    const showSuited = document.getElementById("showSuited").checked
    const showMerged = document.getElementById("showMerged").checked
    const topFilter = document.getElementById("topFilter").value

    // Calculate scores
    const scoreData = []

    Object.entries(stats).forEach(([hand, count]) => {
      let shouldShow = false

      if (showFull && hand.includes("♠♥♦♣".split("").find((s) => hand.includes(s)))) {
        shouldShow = true
      }
      if (showSuited && (hand.endsWith("s") || hand.endsWith("o"))) {
        shouldShow = true
      }
      if (
        showMerged &&
        !hand.includes("♠") &&
        !hand.includes("♥") &&
        !hand.includes("♦") &&
        !hand.includes("♣") &&
        !hand.endsWith("s") &&
        !hand.endsWith("o")
      ) {
        shouldShow = true
      }

      if (shouldShow && appearanceStats[hand]) {
        const appearances = appearanceStats[hand]
        const score = Math.round((count / appearances) * 1000)
        scoreData.push({
          hand,
          score,
          count,
          appearances,
          ratio: `${count}/${appearances}`,
        })
      }
    })

    // Sort by score (descending)
    scoreData.sort((a, b) => b.score - a.score)

    // Apply top filter
    const limitedData = topFilter === "all" ? scoreData : scoreData.slice(0, Number.parseInt(topFilter))

    // Populate table
    limitedData.forEach((item) => {
      const row = tbody.insertRow()
      row.insertCell(0).textContent = item.hand
      row.insertCell(1).textContent = item.score
      row.insertCell(2).textContent = item.ratio
    })
  }

  sortTableData(tableId, sortBy) {
    const table = document.getElementById(tableId)
    const tbody = table.querySelector("tbody")
    const rows = Array.from(tbody.querySelectorAll("tr"))

    rows.sort((a, b) => {
      if (sortBy === "hand") {
        return a.cells[0].textContent.localeCompare(b.cells[0].textContent)
      } else if (sortBy === "count") {
        const aVal = Number.parseInt(a.cells[1].textContent)
        const bVal = Number.parseInt(b.cells[1].textContent)
        return bVal - aVal
      } else if (sortBy === "score") {
        const aVal = Number.parseInt(a.cells[1].textContent)
        const bVal = Number.parseInt(b.cells[1].textContent)
        return bVal - aVal
      }
      return 0
    })

    tbody.innerHTML = ""
    rows.forEach((row) => tbody.appendChild(row))
  }
}

// Export functions
function exportData(type, format) {
  const simulator = window.pokerSimulator
  let data, filename

  if (type === "wins") {
    data = simulator.winStats
    filename = `poker_wins.${format}`
  } else if (type === "ties") {
    data = simulator.tieStats
    filename = `poker_ties.${format}`
  } else if (type === "appearances") {
    data = simulator.appearanceStats
    filename = `poker_appearances.${format}`
  } else if (type === "winScore") {
    data = calculateScoreData(simulator.winStats, simulator.appearanceStats, "win")
    filename = `poker_win_scores.${format}`
  } else if (type === "tieScore") {
    data = calculateScoreData(simulator.tieStats, simulator.appearanceStats, "tie")
    filename = `poker_tie_scores.${format}`
  } else if (type === "log") {
    data = simulator.gameLog
    filename = `poker_log.${format}`
  }

  let content
  if (format === "json") {
    content = JSON.stringify(data, null, 2)
  } else if (format === "csv" && (type === "wins" || type === "ties" || type === "appearances")) {
    const header = type === "appearances" ? "Hand,Appearances" : "Hand,Count"
    content =
      header +
      "\n" +
      Object.entries(data)
        .map(([hand, count]) => `"${hand}",${count}`)
        .join("\n")
  } else if (format === "csv" && (type === "winScore" || type === "tieScore")) {
    content =
      "Hand,Score,Count,Appearances,Ratio\n" +
      data.map((item) => `"${item.hand}",${item.score},${item.count},${item.appearances},"${item.ratio}"`).join("\n")
  } else if (format === "csv" && type === "log") {
    content = "Game,Board,Player1Cards,Player1Hand,Player1Result,Player2Cards,Player2Hand,Player2Result,Winners\n"
    content += data
      .map((game) => {
        const board = game.communityCards.map((c) => `${c.rank}${c.suit}`).join(" ")
        const playerData = game.players
          .map(
            (p) =>
              `"${p.cards.map((c) => `${c.rank}${c.suit}`).join(" ")}";"${p.bestHand}";"${p.isWinner ? "WIN" : "LOSE"}"`,
          )
          .join(";")
        const winners = game.winners.join(" ")
        return `${game.gameNumber};"${board}";${playerData};"${winners}"`
      })
      .join("\n")
  } else if (format === "txt" && type === "log") {
    content = data
      .map((game) => {
        let entry = `Game #${game.gameNumber}\n`
        entry += `Board: ${game.communityCards.map((c) => `${c.rank}${c.suit}`).join(" ")}\n`
        game.players.forEach((player) => {
          const cards = player.cards.map((c) => `${c.rank}${c.suit}`).join(" ")
          entry += `Player ${player.id}: ${cards} → ${player.bestHand}\n`
        })
        entry += `Winner(s): Player ${game.winners.join(", Player ")}\n\n`
        return entry
      })
      .join("")
  }

  downloadFile(content, filename)
}

function calculateScoreData(stats, appearanceStats, scoreType) {
  const scoreData = []

  Object.entries(stats).forEach(([hand, count]) => {
    if (appearanceStats[hand]) {
      const appearances = appearanceStats[hand]
      const score = Math.round((count / appearances) * 1000)
      scoreData.push({
        hand,
        score,
        count,
        appearances,
        ratio: `${count}/${appearances}`,
      })
    }
  })

  return scoreData.sort((a, b) => b.score - a.score)
}

// Global sorting function
function sortTable(tableId, sortBy) {
  const simulator = window.pokerSimulator

  // Update button states
  const tableSection = document.getElementById(tableId).closest(".table-section")
  const buttons = tableSection.querySelectorAll(".table-controls button")
  buttons.forEach((btn) => btn.classList.remove("active"))
  event.target.classList.add("active")

  simulator.sortTableData(tableId, sortBy)
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// Initialize the simulator when the page loads
window.addEventListener("DOMContentLoaded", () => {
  window.pokerSimulator = new PokerSimulator()
})
