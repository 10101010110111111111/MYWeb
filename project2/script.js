class TicTacToeAI {
  static BOARD_SIZE = 20; // 20x20 grid
  static WIN_CONDITION = 5; // 5 in a row to win

  constructor() {
    this.board = Array(TicTacToeAI.BOARD_SIZE * TicTacToeAI.BOARD_SIZE).fill(null)
    this.currentPlayer = "X"
    this.gameActive = false
    this.isPlayerTurn = true
    this.aiDepth = 4
    this.simulationCount = 0
    this.settings = {
      aiSpeed: "standard",
    }
    this.playerName = "Player";
    this.movesThisGame = 0;
    this.initializeGame()
  }

  initializeGame() {
    this.createBoard()
    this.bindEvents()
    this.updateDisplay()
  }

  createBoard() {
    const gameBoard = document.getElementById("gameBoard")
    gameBoard.innerHTML = ""
    gameBoard.style.gridTemplateColumns = `repeat(${TicTacToeAI.BOARD_SIZE}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${TicTacToeAI.BOARD_SIZE}, 1fr)`;
    for (let i = 0; i < TicTacToeAI.BOARD_SIZE * TicTacToeAI.BOARD_SIZE; i++) {
      const cell = document.createElement("button")
      cell.className = "cell"
      cell.dataset.index = i
      cell.addEventListener("click", () => this.handleCellClick(i))
      gameBoard.appendChild(cell)
    }
  }

  bindEvents() {
    document.getElementById("newGameBtn").addEventListener("click", () => this.showWheelModal())
    document.getElementById("aiNormalBtn").addEventListener("click", () => this.setAIDifficulty("normal"))
    document.getElementById("aiHardBtn").addEventListener("click", () => this.setAIDifficulty("hard"))
    document.getElementById("aiInsaneBtn").addEventListener("click", () => this.setAIDifficulty("insane"))
    document.getElementById("spinWheel").addEventListener("click", () => this.spinWheel())
    document.getElementById("playAgain").addEventListener("click", () => this.showWheelModal())
    document.getElementById("exitGameOver").addEventListener("click", () => this.hideGameOverModal());
    // Set initial active difficulty
    this.updateAIDifficultyButtons();
  }

  showWheelModal() {
    // Reset wheel to starting position
    const wheel = document.getElementById("wheel")
    wheel.style.transform = "rotate(0deg)"
    
    document.getElementById("wheelModal").classList.remove("hidden")
    document.getElementById("wheelResult").classList.add("hidden")
    document.getElementById("spinWheel").style.display = "block"
  }

  spinWheel() {
    const wheel = document.getElementById("wheel")
    const spinBtn = document.getElementById("spinWheel")
    const result = document.getElementById("wheelResult")

    spinBtn.style.display = "none"

    // Random rotation between 720 and 1440 degrees (2-4 full rotations)
    const rotation = 720 + Math.random() * 720
    wheel.style.transform = `rotate(${rotation}deg)`

    setTimeout(() => {
      // Determine winner based on final rotation
      const finalRotation = rotation % 360
      const playerStarts = finalRotation < 180

      result.textContent = playerStarts ? "Player goes first!" : "AI goes first!"
      result.classList.remove("hidden")

      setTimeout(() => {
        this.startNewGame(playerStarts)
        document.getElementById("wheelModal").classList.add("hidden")
      }, 2000)
    }, 3000)
  }

  startNewGame(playerStarts) {
    this.board = Array(TicTacToeAI.BOARD_SIZE * TicTacToeAI.BOARD_SIZE).fill(null)
    this.gameActive = true
    this.currentPlayer = "X"
    this.isPlayerTurn = playerStarts
    this.movesThisGame = 0;
    this.updateBoard()
    this.updateDisplay()
    this.humanSymbol = playerStarts ? "X" : "O";

    if (!playerStarts) {
      setTimeout(() => this.makeAIMove(), 500)
    }
  }

  handleCellClick(index) {
    if (!this.gameActive || !this.isPlayerTurn || this.board[index] !== null) {
      return
    }

    this.makeMove(index, this.currentPlayer)

    if (this.gameActive) {
      this.isPlayerTurn = false
      setTimeout(() => this.makeAIMove(), 300)
    }
  }

  makeMove(index, player) {
    this.board[index] = player
    this.updateBoard()
    this.movesThisGame++;

    // Highlight last move
    this.highlightLastMove(index);

    const winner = this.checkWinner()
    if (winner) {
      this.endGame(winner)
      return
    }

    if (this.board.every((cell) => cell !== null)) {
      this.endGame("tie")
      return
    }

    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X"
    this.updateDisplay()
  }

  async makeAIMove() {
    if (!this.gameActive) return

    document.getElementById("aiThinking").classList.remove("hidden")

    // Add delay based on AI speed setting
    const delays = { fast: 500, standard: 1500, deep: 3000 }
    const delay = delays[this.settings.aiSpeed] || 1500

    await new Promise((resolve) => setTimeout(resolve, delay))

    const bestMove = this.getBestMove()

    document.getElementById("aiThinking").classList.add("hidden")

    if (bestMove !== -1) {
      this.makeMove(bestMove, this.currentPlayer)
    }

    this.isPlayerTurn = true
  }

  getBestMove() {
    const depths = { fast: 2, standard: 3, deep: 4 } // Normal: 2, Hard: 3, Insane: 4
    const maxDepth = depths[this.settings.aiSpeed] || 2
    const N = TicTacToeAI.BOARD_SIZE
    const board = this.board
    const player = this.currentPlayer
    const opponent = player === "X" ? "O" : "X"

    // If board is empty, play in the center
    if (board.every(cell => cell === null)) {
      const center = Math.floor(N / 2) * N + Math.floor(N / 2);
      return center;
    }

    // 1. Check for immediate win (5 in a row)
    const immediateWin = this.findImmediateWin(player);
    if (immediateWin !== -1) {
      return immediateWin;
    }

    // 2. Check for opponent's immediate win and block it
    const opponentWin = this.findImmediateWin(opponent);
    if (opponentWin !== -1) {
      return opponentWin;
    }

    // 3. Check for unstoppable 4-in-a-row threats
    const unstoppableFour = this.findUnstoppableFour(player);
    if (unstoppableFour !== -1) {
      return unstoppableFour;
    }

    // 4. Check for opponent's unstoppable 4-in-a-row and block it
    const opponentUnstoppable = this.findUnstoppableFour(opponent);
    if (opponentUnstoppable !== -1) {
      return opponentUnstoppable;
    }

    // 5. Check for open three (free 3-in-a-row with both ends open)
    const openThree = this.findOpenThree(player);
    if (openThree !== -1) {
      return openThree;
    }

    // 6. Block opponent's open three
    const opponentOpenThree = this.findOpenThree(opponent);
    if (opponentOpenThree !== -1) {
      return opponentOpenThree;
    }

    // --- Heuristic Move Generation: Only consider moves that extend/block lines of 2+ ---
    const candidateSet = new Set();
    const lines = this.getAllLines();
    for (const line of lines) {
      let playerCount = 0, opponentCount = 0, emptyCells = [];
      for (const pos of line) {
        if (board[pos] === player) playerCount++;
        else if (board[pos] === opponent) opponentCount++;
        else emptyCells.push(pos);
      }
      if ((playerCount >= 2 || opponentCount >= 2) && emptyCells.length > 0) {
        for (const pos of emptyCells) candidateSet.add(pos);
      }
    }
    if (candidateSet.size === 0) {
      for (let i = 0; i < board.length; i++) {
        if (board[i] !== null) {
          const row = Math.floor(i / N)
          const col = i % N
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = row + dr
              const nc = col + dc
              if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
                const idx = nr * N + nc
                if (board[idx] === null) candidateSet.add(idx)
              }
            }
          }
        }
      }
    }
    let candidateMoves = Array.from(candidateSet);

    // --- Threat detection: play forced win or block forced loss ---
    // 1. If any move creates an unstoppable four-in-a-row (open four or double threat), play it
    for (const i of candidateMoves) {
      board[i] = player;
      if (this.createsUnstoppableFour(board, player)) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
    // 2. If opponent can create such a threat, block it
    for (const i of candidateMoves) {
      board[i] = opponent;
      if (this.createsUnstoppableFour(board, opponent)) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }

    // Pattern recognition: check for immediate win or block
    for (const i of candidateMoves) {
      // Check win
      board[i] = player
      if (this.checkWinnerOnBoard(board) === player) {
        board[i] = null
        return i
      }
      board[i] = null
    }
    for (const i of candidateMoves) {
      // Check block
      board[i] = opponent
      if (this.checkWinnerOnBoard(board) === opponent) {
        board[i] = null
        return i
      }
      board[i] = null
    }
    // Enhanced move ordering: prioritize moves that create/block threats (lines of 2+)
    candidateMoves = candidateMoves.map(idx => {
      let threatScore = 0;
      for (const line of lines) {
        if (line.includes(idx)) {
          let pCount = 0, oCount = 0, eCount = 0;
          for (const pos of line) {
            if (pos === idx) continue;
            if (board[pos] === player) pCount++;
            else if (board[pos] === opponent) oCount++;
            else eCount++;
          }
          if (pCount >= 1 && oCount === 0) threatScore += pCount;
          if (oCount >= 1 && pCount === 0) threatScore += oCount;
        }
      }
      board[idx] = player;
      const myScore = this.evaluateBoard();
      board[idx] = opponent;
      const oppScore = this.evaluateBoard();
      board[idx] = null;
      return { idx, score: Math.max(myScore, -oppScore) + 10 * threatScore };
    }).sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(obj => obj.idx)

    let bestScore = Number.NEGATIVE_INFINITY
    let bestMove = -1
    for (const i of candidateMoves) {
      board[i] = player
      const score = this.minimax(0, maxDepth, false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
      board[i] = null
      if (score > bestScore) {
        bestScore = score
        bestMove = i
      }
    }
    if (bestMove === -1 && candidateMoves.length > 0) {
      bestMove = candidateMoves[Math.floor(Math.random() * candidateMoves.length)]
    }
    return bestMove
  }

  // Find immediate win (5 in a row) for a player
  findImmediateWin(player) {
    const lines = this.getAllLines();
    
    for (const line of lines) {
      let playerCount = 0;
      let emptyPos = -1;
      
      for (let i = 0; i < line.length; i++) {
        const pos = line[i];
        if (this.board[pos] === player) {
          playerCount++;
        } else if (this.board[pos] === null) {
          emptyPos = pos;
        } else {
          // Opponent piece found, this line is blocked
          playerCount = 0;
          break;
        }
      }
      
      // If we have 4 player pieces and 1 empty space, we can win
      if (playerCount === 4 && emptyPos !== -1) {
        return emptyPos;
      }
    }
    
    return -1; // No immediate win found
  }

  // Find unstoppable 4-in-a-row threats
  findUnstoppableFour(player) {
    const lines = this.getAllLines();
    const bestMoves = [];
    
    for (const line of lines) {
      const threatMoves = this.analyzeLineForThreats(line, player);
      if (threatMoves.length > 0) {
        bestMoves.push(...threatMoves);
      }
    }
    
    if (bestMoves.length === 0) return -1;
    
    // Sort by threat strength and return the best move
    bestMoves.sort((a, b) => b.strength - a.strength);
    return bestMoves[0].position;
  }

  // Analyze a single line for 4-in-a-row threats
  analyzeLineForThreats(line, player) {
    const opponent = player === "X" ? "O" : "X";
    const moves = [];
    
    // Check each position in the line
    for (let i = 0; i < line.length; i++) {
      if (this.board[line[i]] !== null) continue; // Position already occupied
      
      // Simulate placing player's piece here
      this.board[line[i]] = player;
      
      // Check if this creates a 4-in-a-row
      let playerCount = 0;
      let emptyCount = 0;
      let emptyPositions = [];
      
      for (let j = 0; j < line.length; j++) {
        const pos = line[j];
        if (this.board[pos] === player) {
          playerCount++;
        } else if (this.board[pos] === null) {
          emptyCount++;
          emptyPositions.push(pos);
        }
      }
      
      // If we have 4 player pieces, check if it's unstoppable
      if (playerCount === 4 && emptyCount === 1) {
        const isUnstoppable = this.isThreatUnstoppable(line, player, emptyPositions[0]);
        if (isUnstoppable) {
          moves.push({
            position: line[i],
            strength: this.calculateThreatStrength(line, player, emptyPositions[0])
          });
        }
      }
      
      // Restore the board
      this.board[line[i]] = null;
    }
    
    return moves;
  }

  // Check if a 4-in-a-row threat is unstoppable
  isThreatUnstoppable(line, player, emptyPos) {
    const opponent = player === "X" ? "O" : "X";
    
    // Check if opponent can block this threat
    // The threat is unstoppable if:
    // 1. The empty position is at one end of the line, OR
    // 2. There are multiple ways to complete the 5-in-a-row
    
    // Get the line coordinates
    const N = TicTacToeAI.BOARD_SIZE;
    const positions = line.map(pos => [Math.floor(pos / N), pos % N]);
    const emptyCoords = [Math.floor(emptyPos / N), emptyPos % N];
    
    // Check if empty position is at the end of the line
    const isAtEnd = this.isPositionAtLineEnd(positions, emptyCoords);
    
    if (isAtEnd) {
      return true; // Unstoppable - opponent can't block at the end
    }
    
    // Check if there are multiple completion paths
    const completionPaths = this.countCompletionPaths(line, player, emptyPos);
    return completionPaths >= 2; // Unstoppable if multiple ways to complete
  }

  // Check if a position is at the end of a line
  isPositionAtLineEnd(positions, targetPos) {
    // Find the direction of the line
    if (positions.length < 2) return true;
    
    const [row1, col1] = positions[0];
    const [row2, col2] = positions[1];
    const dRow = row2 - row1;
    const dCol = col2 - col1;
    
    // Check if target position is at either end
    const [firstRow, firstCol] = positions[0];
    const [lastRow, lastCol] = positions[positions.length - 1];
    
    return (targetPos[0] === firstRow && targetPos[1] === firstCol) ||
           (targetPos[0] === lastRow && targetPos[1] === lastCol);
  }

  // Count how many ways there are to complete a 5-in-a-row from a 4-in-a-row
  countCompletionPaths(line, player, emptyPos) {
    const N = TicTacToeAI.BOARD_SIZE;
    const [emptyRow, emptyCol] = [Math.floor(emptyPos / N), emptyPos % N];
    
    // Get the direction of the line
    const positions = line.map(pos => [Math.floor(pos / N), pos % N]);
    if (positions.length < 2) return 1;
    
    const [row1, col1] = positions[0];
    const [row2, col2] = positions[1];
    const dRow = row2 - row1;
    const dCol = col2 - col1;
    
    let paths = 0;
    
    // Check if we can extend the line in either direction
    // Forward direction
    const nextRow = emptyRow + dRow;
    const nextCol = emptyCol + dCol;
    if (nextRow >= 0 && nextRow < N && nextCol >= 0 && nextCol < N) {
      const nextPos = nextRow * N + nextCol;
      if (this.board[nextPos] === null) {
        paths++;
      }
    }
    
    // Backward direction
    const prevRow = emptyRow - dRow;
    const prevCol = emptyCol - dCol;
    if (prevRow >= 0 && prevRow < N && prevCol >= 0 && prevCol < N) {
      const prevPos = prevRow * N + prevCol;
      if (this.board[prevPos] === null) {
        paths++;
      }
    }
    
    return paths;
  }

  // Calculate the strength of a threat (higher = more dangerous)
  calculateThreatStrength(line, player, emptyPos) {
    let strength = 1000; // Base strength for 4-in-a-row
    
    // Bonus for being at the end of the line (harder to block)
    const N = TicTacToeAI.BOARD_SIZE;
    const positions = line.map(pos => [Math.floor(pos / N), pos % N]);
    const emptyCoords = [Math.floor(emptyPos / N), emptyPos % N];
    
    if (this.isPositionAtLineEnd(positions, emptyCoords)) {
      strength += 500; // End position bonus
    }
    
    // Bonus for multiple completion paths
    const completionPaths = this.countCompletionPaths(line, player, emptyPos);
    strength += completionPaths * 200;
    
    return strength;
  }

  // Helper: does this move create an unstoppable four-in-a-row (open four or double threat)?
  createsUnstoppableFour(board, symbol) {
    const lines = this.getAllLines();
    let openFours = 0;
    for (const line of lines) {
      let count = 0, empty = 0;
      for (const pos of line) {
        if (board[pos] === symbol) count++;
        else if (board[pos] === null) empty++;
      }
      if (count === 4 && empty === 1) {
        // Check if both ends are open (open four)
        // Or if this is a double threat (two open fours)
        openFours++;
      }
    }
    return openFours >= 2 || openFours === 1; // Double threat or open four
  }

  minimax(depth, maxDepth, isMaximizing, alpha, beta) {
    const winner = this.checkWinner()

    if (winner === this.currentPlayer) return 1000 - depth
    if (winner === (this.currentPlayer === "X" ? "O" : "X")) return -1000 + depth
    if (depth >= maxDepth || this.board.every((cell) => cell !== null)) {
      return this.evaluateBoard()
    }

    if (isMaximizing) {
      let maxEval = Number.NEGATIVE_INFINITY
      for (let i = 0; i < TicTacToeAI.BOARD_SIZE * TicTacToeAI.BOARD_SIZE; i++) {
        if (this.board[i] === null) {
          this.board[i] = this.currentPlayer
          const evalScore = this.minimax(depth + 1, maxDepth, false, alpha, beta)
          this.board[i] = null
          maxEval = Math.max(maxEval, evalScore)
          alpha = Math.max(alpha, evalScore)
          if (beta <= alpha) break
        }
      }
      return maxEval
    } else {
      let minEval = Number.POSITIVE_INFINITY
      const opponent = this.currentPlayer === "X" ? "O" : "X"
      for (let i = 0; i < TicTacToeAI.BOARD_SIZE * TicTacToeAI.BOARD_SIZE; i++) {
        if (this.board[i] === null) {
          this.board[i] = opponent
          const evalScore = this.minimax(depth + 1, maxDepth, true, alpha, beta)
          this.board[i] = null
          minEval = Math.min(minEval, evalScore)
          beta = Math.min(beta, evalScore)
          if (beta <= alpha) break
        }
      }
      return minEval
    }
  }

  evaluateBoard() {
    let score = 0
    const player = this.currentPlayer
    const opponent = player === "X" ? "O" : "X"

    // Check all possible lines (rows, columns, diagonals)
    const lines = this.getAllLines()

    let playerThreats = 0;
    let opponentThreats = 0;

    for (const line of lines) {
      const lineScore = this.evaluateLine(line, player, opponent)
      score += lineScore
      // Count threats for fork detection
      if (lineScore >= 10000) playerThreats++;
      if (lineScore <= -10000) opponentThreats++;
    }

    // Reward forks (multiple simultaneous threats)
    if (playerThreats >= 2) score += 30000 * (playerThreats - 1);
    if (opponentThreats >= 2) score -= 30000 * (opponentThreats - 1);

    return score
  }

  evaluateLine(line, player, opponent) {
    let playerCount = 0
    let opponentCount = 0
    let emptyCount = 0
    let first = this.board[line[0]]
    let last = this.board[line[line.length - 1]]

    for (const pos of line) {
      if (this.board[pos] === player) playerCount++
      else if (this.board[pos] === opponent) opponentCount++
      else emptyCount++
    }

    // If both players have pieces in this line, it's blocked
    if (playerCount > 0 && opponentCount > 0) {
      // Penalize blocked lines less harshly if they still have potential
      if (playerCount + opponentCount >= TicTacToeAI.WIN_CONDITION - 1) {
        return -1; // Slight penalty for almost full blocked line
      }
      return 0;
    }

    // Check for open/closed ends
    let openEnds = 0;
    const N = TicTacToeAI.BOARD_SIZE;
    const W = TicTacToeAI.WIN_CONDITION;
    const getRowCol = idx => [Math.floor(idx / N), idx % N];
    const [row0, col0] = getRowCol(line[0]);
    const [rowE, colE] = getRowCol(line[line.length - 1]);
    const dRow = rowE - row0 === 0 ? 0 : (rowE - row0) / (W - 1);
    const dCol = colE - col0 === 0 ? 0 : (colE - col0) / (W - 1);
    let beforeR = row0 - dRow;
    let beforeC = col0 - dCol;
    if (beforeR >= 0 && beforeR < N && beforeC >= 0 && beforeC < N) {
      const beforeIdx = beforeR * N + beforeC;
      if (this.board[beforeIdx] === null) openEnds++;
    } else {
      openEnds++;
    }
    let afterR = rowE + dRow;
    let afterC = colE + dCol;
    if (afterR >= 0 && afterR < N && afterC >= 0 && afterC < N) {
      const afterIdx = afterR * N + afterC;
      if (this.board[afterIdx] === null) openEnds++;
    } else {
      openEnds++;
    }

    if (playerCount === TicTacToeAI.WIN_CONDITION) return 100000;
    if (opponentCount === TicTacToeAI.WIN_CONDITION) return -100000;
    if (playerCount === TicTacToeAI.WIN_CONDITION - 1 && openEnds === 2) return 15000;
    if (opponentCount === TicTacToeAI.WIN_CONDITION - 1 && openEnds === 2) return -15000;
    if (playerCount === TicTacToeAI.WIN_CONDITION - 1 && openEnds === 1) return 2000;
    if (opponentCount === TicTacToeAI.WIN_CONDITION - 1 && openEnds === 1) return -2000;
    if (playerCount === TicTacToeAI.WIN_CONDITION - 2 && openEnds === 2) return 200;
    if (opponentCount === TicTacToeAI.WIN_CONDITION - 2 && openEnds === 2) return -200;
    if (playerCount === TicTacToeAI.WIN_CONDITION - 2 && openEnds === 1) return 20;
    if (opponentCount === TicTacToeAI.WIN_CONDITION - 2 && openEnds === 1) return -20;
    if (playerCount === TicTacToeAI.WIN_CONDITION - 3 && openEnds === 2) return 10;
    if (opponentCount === TicTacToeAI.WIN_CONDITION - 3 && openEnds === 2) return -10;
    if (playerCount === TicTacToeAI.WIN_CONDITION - 3 && openEnds === 1) return 3;
    if (opponentCount === TicTacToeAI.WIN_CONDITION - 3 && openEnds === 1) return -3;
    return 0;
  }

  getAllLines() {
    const lines = []
    const N = TicTacToeAI.BOARD_SIZE
    const W = TicTacToeAI.WIN_CONDITION
    // Rows
    for (let row = 0; row < N; row++) {
      for (let col = 0; col <= N - W; col++) {
        const line = []
        for (let k = 0; k < W; k++) {
          line.push(row * N + col + k)
        }
        lines.push(line)
      }
    }
    // Columns
    for (let col = 0; col < N; col++) {
      for (let row = 0; row <= N - W; row++) {
        const line = []
        for (let k = 0; k < W; k++) {
          line.push((row + k) * N + col)
        }
        lines.push(line)
      }
    }
    // Diagonals (top-left to bottom-right)
    for (let row = 0; row <= N - W; row++) {
      for (let col = 0; col <= N - W; col++) {
        const line = []
        for (let k = 0; k < W; k++) {
          line.push((row + k) * N + (col + k))
        }
        lines.push(line)
      }
    }
    // Diagonals (top-right to bottom-left)
    for (let row = 0; row <= N - W; row++) {
      for (let col = W - 1; col < N; col++) {
        const line = []
        for (let k = 0; k < W; k++) {
          line.push((row + k) * N + (col - k))
        }
        lines.push(line)
      }
    }
    return lines
  }

  checkWinner() {
    return this.checkWinnerOnBoard(this.board)
  }

  checkWinnerOnBoard(board) {
    const lines = this.getAllLines()

    for (const line of lines) {
      const [a, b, c, d, e] = line
      if (
        board[a] &&
        board[a] === board[b] &&
        board[a] === board[c] &&
        board[a] === board[d] &&
        board[a] === board[e]
      ) {
        return board[a]
      }
    }

    return null
  }

  endGame(winner) {
    this.gameActive = false

    if (winner !== "tie") {
      this.highlightWinningLine(winner)
    }

    setTimeout(() => {
      const modal = document.getElementById("gameOverModal")
      const title = document.getElementById("gameOverTitle")
      const message = document.getElementById("gameOverMessage")

      if (winner === "tie") {
        title.textContent = "It's a Tie!"
        message.textContent = `Great game! No one wins this time. You survived ${this.movesThisGame} moves.`
      } else if ((winner === "X" && this.isPlayerHuman("X")) || (winner === "O" && this.isPlayerHuman("O"))) {
        title.textContent = "You Win!"
        message.textContent = `Congratulations, ${this.playerName}! You beat the AI in ${this.movesThisGame} moves!`
      } else {
        title.textContent = "AI Wins!"
        message.textContent = `The AI got you this time after ${this.movesThisGame} moves. Try again!`
      }

      modal.classList.remove("hidden")
    }, 1500)
  }

  isPlayerHuman(symbol) {
    // Player is always the one who started the game as X or O
    // If isPlayerTurn is true, currentPlayer is human, but at game end, currentPlayer has already switched
    // So, track who started as player at game start
    // For now, assume human is always X if isPlayerTurn was true at game start, else O
    // We'll store this at startNewGame
    return symbol === this.humanSymbol;
  }

  highlightWinningLine(winner) {
    const lines = this.getAllLines()

    for (const line of lines) {
      const [a, b, c, d, e] = line
      if (
        this.board[a] === winner &&
        this.board[b] === winner &&
        this.board[c] === winner &&
        this.board[d] === winner &&
        this.board[e] === winner
      ) {
        line.forEach((index) => {
          const cell = document.querySelector(`[data-index="${index}"]`)
          cell.classList.add("winning")
        })
        break
      }
    }
  }

  updateBoard() {
    for (let i = 0; i < TicTacToeAI.BOARD_SIZE * TicTacToeAI.BOARD_SIZE; i++) {
      const cell = document.querySelector(`[data-index="${i}"]`)
      const value = this.board[i]

      cell.textContent = value || ""
      cell.className = "cell"

      if (value) {
        cell.classList.add(value.toLowerCase())
      }

      if (!this.gameActive || value) {
        cell.classList.add("disabled")
      }
    }
  }

  updateDisplay() {
    const currentPlayerText = document.getElementById("currentPlayerText")
    const gameInfo = document.getElementById("gameInfo")

    if (!this.gameActive) {
      currentPlayerText.textContent = "Game Over"
      gameInfo.textContent = ""
    } else if (this.isPlayerTurn) {
      currentPlayerText.textContent = `Your turn (${this.currentPlayer})`
      gameInfo.textContent = "Click a cell to make your move"
    } else {
      currentPlayerText.textContent = `AI's turn (${this.currentPlayer})`
      gameInfo.textContent = "AI is thinking..."
    }
  }

  hideGameOverModal() {
    document.getElementById("gameOverModal").classList.add("hidden")
  }

  highlightLastMove(index) {
    // Remove 'last-move' from all cells
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('last-move'));
    // Add 'last-move' to the most recent move
    const lastCell = document.querySelector(`[data-index="${index}"]`);
    if (lastCell) lastCell.classList.add('last-move');
  }

  setAIDifficulty(level) {
    if (level === "normal") {
      this.settings.aiSpeed = "fast";
    } else if (level === "hard") {
      this.settings.aiSpeed = "standard";
    } else if (level === "insane") {
      this.settings.aiSpeed = "deep";
      alert("You have chosen... INSANE! Good luck!");
    }
    this.updateAIDifficultyButtons();
  }

  updateAIDifficultyButtons() {
    const normalBtn = document.getElementById("aiNormalBtn");
    const hardBtn = document.getElementById("aiHardBtn");
    const insaneBtn = document.getElementById("aiInsaneBtn");
    normalBtn.classList.remove("active");
    hardBtn.classList.remove("active");
    insaneBtn.classList.remove("active");
    if (this.settings.aiSpeed === "fast") {
      normalBtn.classList.add("active");
    } else if (this.settings.aiSpeed === "standard") {
      hardBtn.classList.add("active");
    } else if (this.settings.aiSpeed === "deep") {
      insaneBtn.classList.add("active");
    }
  }

  // Find open three (free 3-in-a-row with both ends open) for a player
  findOpenThree(player) {
    const lines = this.getAllLines();
    for (const line of lines) {
      let playerCount = 0;
      let emptyIndices = [];
      for (let i = 0; i < line.length; i++) {
        const pos = line[i];
        if (this.board[pos] === player) {
          playerCount++;
        } else if (this.board[pos] === null) {
          emptyIndices.push(pos);
        } else {
          // Blocked by opponent
          playerCount = 0;
          emptyIndices = [];
          break;
        }
      }
      // Open three: 3 player pieces, 2 empty, and both ends are empty
      if (playerCount === 3 && emptyIndices.length === 2) {
        // Check if both ends are empty
        if (this.board[line[0]] === null && this.board[line[line.length - 1]] === null) {
          // Return one of the empty ends (preferably randomize for variety)
          return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }
      }
    }
    return -1;
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new TicTacToeAI()
})
