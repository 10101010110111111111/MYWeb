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
    this.moveHistory = []; // Track all moves for opening book
    this._cachedLines = null; // Cache for getAllLines()
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
    this.moveHistory = [];
    this.updateBoard()
    this.updateDisplay()
    this.humanSymbol = playerStarts ? "X" : "O";
    this.aiSymbol = playerStarts ? "O" : "X";

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
      setTimeout(() => this.makeAIMove(), 150)
    }
  }

  makeMove(index, player) {
    this.board[index] = player
    this.moveHistory.push({ index, player });
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

    // Small delay just for UI responsiveness — no artificial slowdown
    await new Promise((resolve) => setTimeout(resolve, 100))

    const bestMove = this.getBestMove()

    document.getElementById("aiThinking").classList.add("hidden")

    if (bestMove !== -1) {
      this.makeMove(bestMove, this.currentPlayer)
    }

    this.isPlayerTurn = true
  }

  // ============================================================
  //  HELPER: Convert (row, col) <-> index
  // ============================================================
  idx(row, col) { return row * TicTacToeAI.BOARD_SIZE + col; }
  row(index) { return Math.floor(index / TicTacToeAI.BOARD_SIZE); }
  col(index) { return index % TicTacToeAI.BOARD_SIZE; }

  // ============================================================
  //  OPENING BOOK — hardcoded strategy for moves 1-6
  // ============================================================
  getOpeningBookMove() {
    const N = TicTacToeAI.BOARD_SIZE;
    const board = this.board;
    const aiSym = this.currentPlayer;
    const oppSym = aiSym === "X" ? "O" : "X";
    const totalPieces = board.filter(c => c !== null).length;

    // Count AI's own pieces on the board
    const aiPieces = board.filter(c => c === aiSym).length;

    // --- AI plays FIRST (AI is X) ---
    if (aiSym === "X" || (aiSym === "O" && this.humanSymbol === "O")) {
      // Actually let's just count total pieces to decide what opening phase we're in
    }

    // =============================================
    // MOVE 1 (0 pieces on board): Play near center with slight randomization
    // =============================================
    if (totalPieces === 0) {
      const centerR = Math.floor(N / 2);
      const centerC = Math.floor(N / 2);
      // Pick one of 4 center-ish positions for variety
      const options = [
        this.idx(centerR, centerC),
        this.idx(centerR - 1, centerC),
        this.idx(centerR, centerC - 1),
        this.idx(centerR - 1, centerC - 1),
      ];
      return options[Math.floor(Math.random() * options.length)];
    }

    // =============================================
    // MOVE 2 (1 piece on board): Respond to opponent's first move
    // AI plays adjacent diagonally to gain maximum line coverage
    // =============================================
    if (totalPieces === 1) {
      const oppIdx = board.findIndex(c => c !== null);
      const oR = this.row(oppIdx);
      const oC = this.col(oppIdx);

      // Play diagonally adjacent — this maximizes shared lines
      // Try all 4 diagonal neighbors, pick one that's valid
      const diags = [
        [oR - 1, oC - 1], [oR - 1, oC + 1],
        [oR + 1, oC - 1], [oR + 1, oC + 1],
      ].filter(([r, c]) => r >= 2 && r < N - 2 && c >= 2 && c < N - 2);

      if (diags.length > 0) {
        const [dr, dc] = diags[Math.floor(Math.random() * diags.length)];
        return this.idx(dr, dc);
      }
      // Fallback: center
      return this.idx(Math.floor(N / 2), Math.floor(N / 2));
    }

    // =============================================
    // MOVE 3 (2 pieces on board): Build a shape
    // =============================================
    if (totalPieces === 2) {
      // Find our piece and opponent's piece
      const myPieces = [];
      const oppPieces = [];
      for (let i = 0; i < board.length; i++) {
        if (board[i] === aiSym) myPieces.push(i);
        if (board[i] === oppSym) oppPieces.push(i);
      }

      if (myPieces.length === 1 && oppPieces.length === 1) {
        const myR = this.row(myPieces[0]);
        const myC = this.col(myPieces[0]);
        const oppR = this.row(oppPieces[0]);
        const oppC = this.col(oppPieces[0]);

        // Strategy: extend our piece in the direction AWAY from opponent
        const dR = myR - oppR;
        const dC = myC - oppC;

        // Try to extend in same direction (away from opponent) diagonally for maximum coverage
        const candidates = [];
        // Extend along various directions
        const directions = [
          [1, 0], [-1, 0], [0, 1], [0, -1],
          [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];

        for (const [dr, dc] of directions) {
          const nr = myR + dr;
          const nc = myC + dc;
          if (nr >= 1 && nr < N - 1 && nc >= 1 && nc < N - 1 && board[this.idx(nr, nc)] === null) {
            // Prefer directions away from opponent
            const awayScore = dr * dR + dc * dC; // positive = moving away
            candidates.push({ idx: this.idx(nr, nc), score: awayScore + Math.random() * 0.5 });
          }
        }

        if (candidates.length > 0) {
          candidates.sort((a, b) => b.score - a.score);
          return candidates[0].idx;
        }
      }

      // If we have 0 pieces (responding to 2 opponent pieces), play between/near them
      if (myPieces.length === 0 && oppPieces.length === 2) {
        const r1 = this.row(oppPieces[0]), c1 = this.col(oppPieces[0]);
        const r2 = this.row(oppPieces[1]), c2 = this.col(oppPieces[1]);
        const midR = Math.round((r1 + r2) / 2);
        const midC = Math.round((c1 + c2) / 2);

        // Try to play at/near midpoint
        for (let dr = 0; dr <= 1; dr++) {
          for (let dc = 0; dc <= 1; dc++) {
            for (const sr of [1, -1]) {
              for (const sc of [1, -1]) {
                const nr = midR + dr * sr;
                const nc = midC + dc * sc;
                if (nr >= 1 && nr < N - 1 && nc >= 1 && nc < N - 1 && board[this.idx(nr, nc)] === null) {
                  return this.idx(nr, nc);
                }
              }
            }
          }
        }
      }

      return -1; // Fall through to engine
    }

    // =============================================
    // MOVES 4-6 (3-5 pieces): Build formations / block threats
    // =============================================
    if (totalPieces >= 3 && totalPieces <= 5) {
      const myPieces = [];
      const oppPieces = [];
      for (let i = 0; i < board.length; i++) {
        if (board[i] === aiSym) myPieces.push(i);
        if (board[i] === oppSym) oppPieces.push(i);
      }

      // Priority 1: Block any immediate threats first
      const immediateWin = this.findImmediateWin(aiSym);
      if (immediateWin !== -1) return immediateWin;
      const oppWin = this.findImmediateWin(oppSym);
      if (oppWin !== -1) return oppWin;

      // Priority 2: If opponent has 2+ in a line, block the extension
      const oppThreat = this.findOpenThree(oppSym);
      if (oppThreat !== -1) return oppThreat;

      // Priority 3: Extend our own line formation
      // Find the best direction to extend our pieces
      if (myPieces.length >= 2) {
        // Try to find a pair of our pieces that are adjacent/nearby and extend them
        let bestExtension = -1;
        let bestScore = -Infinity;

        for (let i = 0; i < myPieces.length; i++) {
          for (let j = i + 1; j < myPieces.length; j++) {
            const r1 = this.row(myPieces[i]), c1 = this.col(myPieces[i]);
            const r2 = this.row(myPieces[j]), c2 = this.col(myPieces[j]);
            const dr = r2 - r1, dc = c2 - c1;
            const dist = Math.max(Math.abs(dr), Math.abs(dc));

            if (dist <= 3) {
              // These pieces are close enough to potentially form a line
              const ndR = dist === 0 ? 0 : Math.sign(dr);
              const ndC = dist === 0 ? 0 : Math.sign(dc);

              // Try extending before first piece
              const extR1 = r1 - ndR;
              const extC1 = c1 - ndC;
              if (extR1 >= 0 && extR1 < N && extC1 >= 0 && extC1 < N) {
                const extIdx = this.idx(extR1, extC1);
                if (board[extIdx] === null) {
                  const score = this.quickEvalMove(extIdx, aiSym);
                  if (score > bestScore) {
                    bestScore = score;
                    bestExtension = extIdx;
                  }
                }
              }

              // Try extending after second piece
              const extR2 = r2 + ndR;
              const extC2 = c2 + ndC;
              if (extR2 >= 0 && extR2 < N && extC2 >= 0 && extC2 < N) {
                const extIdx = this.idx(extR2, extC2);
                if (board[extIdx] === null) {
                  const score = this.quickEvalMove(extIdx, aiSym);
                  if (score > bestScore) {
                    bestScore = score;
                    bestExtension = extIdx;
                  }
                }
              }
            }
          }
        }

        if (bestExtension !== -1) return bestExtension;
      }

      // Priority 4: If we only have 1 piece, make a diagonal connection like move 3
      if (myPieces.length === 1) {
        const myR = this.row(myPieces[0]);
        const myC = this.col(myPieces[0]);
        const directions = [
          [1, 1], [1, -1], [-1, 1], [-1, -1],
          [1, 0], [-1, 0], [0, 1], [0, -1]
        ];
        let bestIdx = -1;
        let bestScore = -Infinity;
        for (const [dr, dc] of directions) {
          const nr = myR + dr;
          const nc = myC + dc;
          if (nr >= 1 && nr < N - 1 && nc >= 1 && nc < N - 1 && board[this.idx(nr, nc)] === null) {
            const score = this.quickEvalMove(this.idx(nr, nc), aiSym);
            if (score > bestScore) {
              bestScore = score;
              bestIdx = this.idx(nr, nc);
            }
          }
        }
        if (bestIdx !== -1) return bestIdx;
      }
    }

    return -1; // No opening book move — fall through to main engine
  }

  // Quick evaluation of placing a piece — used by opening book
  quickEvalMove(idx, symbol) {
    const board = this.board;
    const opponent = symbol === "X" ? "O" : "X";
    board[idx] = symbol;
    let score = 0;
    const lines = this.getAllLines();
    const r = this.row(idx);
    const c = this.col(idx);

    // Only evaluate lines that pass through this cell
    for (const line of lines) {
      if (!line.includes(idx)) continue;
      let myCount = 0, oppCount = 0, emptyCount = 0;
      for (const pos of line) {
        if (board[pos] === symbol) myCount++;
        else if (board[pos] === opponent) oppCount++;
        else emptyCount++;
      }
      if (oppCount === 0) {
        score += myCount * myCount * 10;
      }
      if (myCount === 0 && oppCount >= 2) {
        score += oppCount * 5; // Blocking value
      }
    }

    // Bonus for being near center
    const centerR = Math.floor(TicTacToeAI.BOARD_SIZE / 2);
    const centerC = Math.floor(TicTacToeAI.BOARD_SIZE / 2);
    const distFromCenter = Math.abs(r - centerR) + Math.abs(c - centerC);
    score -= distFromCenter;

    board[idx] = null;
    return score;
  }

  // ============================================================
  //  MAIN AI ENTRY POINT
  // ============================================================
  getBestMove() {
    const N = TicTacToeAI.BOARD_SIZE;
    const board = this.board;
    const player = this.currentPlayer;
    const opponent = player === "X" ? "O" : "X";
    const totalPieces = board.filter(c => c !== null).length;

    // --- PHASE 1: Opening Book (first 6 pieces on board) ---
    if (totalPieces <= 5) {
      const bookMove = this.getOpeningBookMove();
      if (bookMove !== -1) return bookMove;
    }

    // --- PHASE 2: Tactical priorities (always checked) ---

    // 1. Check for immediate win (5 in a row)
    const immediateWin = this.findImmediateWin(player);
    if (immediateWin !== -1) return immediateWin;

    // 2. Check for opponent's immediate win and block it
    const opponentWin = this.findImmediateWin(opponent);
    if (opponentWin !== -1) return opponentWin;

    // 3. Check for double-threat fork: a move that creates 2+ open-four threats
    const doubleThreat = this.findDoubleThreat(player);
    if (doubleThreat !== -1) return doubleThreat;

    // 4. Block opponent's double-threat fork
    const oppDoubleThreat = this.findDoubleThreat(opponent);
    if (oppDoubleThreat !== -1) return oppDoubleThreat;

    // 5. Create an open four (4 in a row with both ends open — guaranteed win next move)
    const openFour = this.findOpenFourMove(player);
    if (openFour !== -1) return openFour;

    // 6. Block opponent's open four
    const oppOpenFour = this.findOpenFourMove(opponent);
    if (oppOpenFour !== -1) return oppOpenFour;

    // 7. Create an open three (3 in a row with both ends open)
    const openThree = this.findOpenThree(player);
    if (openThree !== -1) return openThree;

    // 8. Block opponent's open three
    const opponentOpenThree = this.findOpenThree(opponent);
    if (opponentOpenThree !== -1) return opponentOpenThree;

    // --- PHASE 3: Heuristic search with minimax ---
    return this.heuristicSearch(player, opponent);
  }

  // ============================================================
  //  DOUBLE-THREAT FORK DETECTION
  //  Find a move that creates 2+ lines where we have 3-in-a-row with open ends
  // ============================================================
  findDoubleThreat(player) {
    const candidates = this.getCandidateMoves(2);
    if (candidates.length === 0) return -1;

    const board = this.board;
    const opponent = player === "X" ? "O" : "X";
    let bestMove = -1;
    let bestThreatCount = 0;

    for (const idx of candidates) {
      board[idx] = player;
      let threatCount = 0;

      // Count how many "open 3" or "4-in-a-row" threats this creates
      // Check all directions through this cell
      const r = this.row(idx);
      const c = this.col(idx);
      const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

      for (const [dr, dc] of directions) {
        const lineInfo = this.countLineThrough(r, c, dr, dc, player);
        // Open four: 4 consecutive with both ends open
        if (lineInfo.count >= 4 && lineInfo.openEnds === 2) {
          threatCount += 3; // Very strong threat
        } else if (lineInfo.count >= 4 && lineInfo.openEnds === 1) {
          threatCount += 2; // Strong threat (must block)
        } else if (lineInfo.count >= 3 && lineInfo.openEnds === 2) {
          threatCount += 1; // Open three
        }
      }

      board[idx] = null;

      if (threatCount >= 2 && threatCount > bestThreatCount) {
        bestThreatCount = threatCount;
        bestMove = idx;
      }
    }

    return bestMove;
  }

  // Count consecutive pieces of `player` through (r,c) in direction (dr,dc) and opposite
  countLineThrough(r, c, dr, dc, player) {
    const N = TicTacToeAI.BOARD_SIZE;
    const board = this.board;
    let count = 1; // Count the piece at (r,c)
    let openEnds = 0;

    // Count forward
    let fr = r + dr, fc = c + dc;
    while (fr >= 0 && fr < N && fc >= 0 && fc < N && board[this.idx(fr, fc)] === player) {
      count++;
      fr += dr;
      fc += dc;
    }
    // Check if end is open
    if (fr >= 0 && fr < N && fc >= 0 && fc < N && board[this.idx(fr, fc)] === null) {
      openEnds++;
    }

    // Count backward
    let br = r - dr, bc = c - dc;
    while (br >= 0 && br < N && bc >= 0 && bc < N && board[this.idx(br, bc)] === player) {
      count++;
      br -= dr;
      bc -= dc;
    }
    // Check if end is open
    if (br >= 0 && br < N && bc >= 0 && bc < N && board[this.idx(br, bc)] === null) {
      openEnds++;
    }

    return { count, openEnds };
  }

  // ============================================================
  //  FIND A MOVE THAT CREATES AN OPEN FOUR (4 + both ends open)
  // ============================================================
  findOpenFourMove(player) {
    const candidates = this.getCandidateMoves(2);
    const board = this.board;

    for (const idx of candidates) {
      board[idx] = player;
      const r = this.row(idx);
      const c = this.col(idx);
      const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

      for (const [dr, dc] of directions) {
        const lineInfo = this.countLineThrough(r, c, dr, dc, player);
        if (lineInfo.count >= 4 && lineInfo.openEnds === 2) {
          board[idx] = null;
          return idx;
        }
      }
      board[idx] = null;
    }

    return -1;
  }

  // ============================================================
  //  HEURISTIC SEARCH — minimax over candidate moves
  // ============================================================
  heuristicSearch(player, opponent) {
    const board = this.board;
    const depths = { fast: 2, standard: 3, deep: 4 };
    const maxDepth = depths[this.settings.aiSpeed] || 2;
    const branchLimits = { fast: 8, standard: 10, deep: 12 };
    const branchLimit = branchLimits[this.settings.aiSpeed] || 8;

    // Get candidate moves (within distance 2 of existing pieces)
    let candidateMoves = this.getCandidateMoves(2);

    if (candidateMoves.length === 0) {
      // Fallback: play near center
      const center = Math.floor(TicTacToeAI.BOARD_SIZE / 2);
      return this.idx(center, center);
    }

    // Score and sort candidates for better alpha-beta pruning
    const lines = this.getAllLines();
    candidateMoves = candidateMoves.map(idx => {
      let score = 0;

      // Quick heuristic: check what this move does
      board[idx] = player;
      const myScore = this.evaluateBoardFast(player, opponent);
      board[idx] = opponent;
      const oppScore = this.evaluateBoardFast(opponent, player);
      board[idx] = null;

      score = myScore + oppScore * 0.8;

      // Bonus for centrality
      const r = this.row(idx), c = this.col(idx);
      const centerR = Math.floor(TicTacToeAI.BOARD_SIZE / 2);
      const centerC = Math.floor(TicTacToeAI.BOARD_SIZE / 2);
      score -= (Math.abs(r - centerR) + Math.abs(c - centerC)) * 0.5;

      return { idx, score };
    }).sort((a, b) => b.score - a.score)
      .slice(0, branchLimit)
      .map(obj => obj.idx);

    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove = candidateMoves[0]; // Always have a fallback

    for (const i of candidateMoves) {
      board[i] = player;
      const score = this.minimaxCandidates(0, maxDepth, false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, player, opponent);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }

    return bestMove;
  }

  // ============================================================
  //  MINIMAX — only searches candidate moves, not all 400 cells
  // ============================================================
  minimaxCandidates(depth, maxDepth, isMaximizing, alpha, beta, player, opponent) {
    const board = this.board;

    // Terminal checks
    const winner = this.checkWinnerFast();
    if (winner === player) return 100000 - depth * 100;
    if (winner === opponent) return -100000 + depth * 100;
    if (depth >= maxDepth) {
      return this.evaluateBoardFast(player, opponent);
    }

    // Get candidate moves for this position
    const candidates = this.getCandidateMoves(1);
    if (candidates.length === 0) return 0; // Draw

    // Limit branching at deeper levels
    const branchLimit = Math.max(4, 10 - depth * 2);
    const sortedCandidates = this.quickSortCandidates(candidates, isMaximizing ? player : opponent)
      .slice(0, branchLimit);

    if (isMaximizing) {
      let maxEval = Number.NEGATIVE_INFINITY;
      for (const i of sortedCandidates) {
        board[i] = player;
        const evalScore = this.minimaxCandidates(depth + 1, maxDepth, false, alpha, beta, player, opponent);
        board[i] = null;
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Number.POSITIVE_INFINITY;
      for (const i of sortedCandidates) {
        board[i] = opponent;
        const evalScore = this.minimaxCandidates(depth + 1, maxDepth, true, alpha, beta, player, opponent);
        board[i] = null;
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  // Quick sort candidates by heuristic score (for move ordering in minimax)
  quickSortCandidates(candidates, forPlayer) {
    const board = this.board;
    const opponent = forPlayer === "X" ? "O" : "X";

    return candidates.map(idx => {
      let score = 0;
      const r = this.row(idx);
      const c = this.col(idx);
      const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

      // Check all directions through this cell
      for (const [dr, dc] of directions) {
        // Count our pieces and opponent pieces along this direction
        let myCount = 0, oppCount = 0, emptyCount = 0;
        for (let k = -4; k <= 4; k++) {
          const nr = r + k * dr;
          const nc = c + k * dc;
          if (nr >= 0 && nr < TicTacToeAI.BOARD_SIZE && nc >= 0 && nc < TicTacToeAI.BOARD_SIZE) {
            const v = board[this.idx(nr, nc)];
            if (v === forPlayer) myCount++;
            else if (v === opponent) oppCount++;
            else emptyCount++;
          }
        }
        score += myCount * 3 + oppCount * 2;
      }

      // Centrality bonus
      const centerR = Math.floor(TicTacToeAI.BOARD_SIZE / 2);
      const centerC = Math.floor(TicTacToeAI.BOARD_SIZE / 2);
      score -= (Math.abs(r - centerR) + Math.abs(c - centerC)) * 0.3;

      return { idx, score };
    }).sort((a, b) => b.score - a.score).map(obj => obj.idx);
  }

  // ============================================================
  //  CANDIDATE MOVE GENERATION — cells within `radius` of existing pieces
  // ============================================================
  getCandidateMoves(radius) {
    const N = TicTacToeAI.BOARD_SIZE;
    const board = this.board;
    const candidateSet = new Set();

    for (let i = 0; i < board.length; i++) {
      if (board[i] !== null) {
        const r = this.row(i);
        const c = this.col(i);
        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
              const idx = this.idx(nr, nc);
              if (board[idx] === null) candidateSet.add(idx);
            }
          }
        }
      }
    }

    return Array.from(candidateSet);
  }

  // ============================================================
  //  FAST BOARD EVALUATION — directional scan, no getAllLines()
  // ============================================================
  evaluateBoardFast(player, opponent) {
    const N = TicTacToeAI.BOARD_SIZE;
    const W = TicTacToeAI.WIN_CONDITION;
    const board = this.board;
    let score = 0;

    // Scan all windows of length W in all 4 directions
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal \
      [1, -1],  // diagonal /
    ];

    for (const [dr, dc] of directions) {
      const startRowMax = dr === 0 ? N - 1 : N - W;
      const startColMin = dc === -1 ? W - 1 : 0;
      const startColMax = dc === 1 ? N - W : (dc === 0 ? N - 1 : N - 1);

      for (let startR = 0; startR <= startRowMax; startR++) {
        for (let startC = startColMin; startC <= startColMax; startC++) {
          let pCount = 0, oCount = 0;

          for (let k = 0; k < W; k++) {
            const r = startR + k * dr;
            const c = startC + k * dc;
            if (r < 0 || r >= N || c < 0 || c >= N) { pCount = -1; break; }
            const v = board[r * N + c];
            if (v === player) pCount++;
            else if (v === opponent) oCount++;
          }

          if (pCount < 0) continue; // Invalid window

          if (pCount > 0 && oCount > 0) continue; // Blocked line

          // Check open ends
          let openEnds = 0;
          const beforeR = startR - dr;
          const beforeC = startC - dc;
          if (beforeR >= 0 && beforeR < N && beforeC >= 0 && beforeC < N) {
            if (board[beforeR * N + beforeC] === null) openEnds++;
          }
          const afterR = startR + W * dr;
          const afterC = startC + W * dc;
          if (afterR >= 0 && afterR < N && afterC >= 0 && afterC < N) {
            if (board[afterR * N + afterC] === null) openEnds++;
          }

          // Scoring
          if (pCount === 5) score += 100000;
          else if (oCount === 5) score -= 100000;
          else if (pCount === 4 && openEnds === 2) score += 15000;
          else if (oCount === 4 && openEnds === 2) score -= 15000;
          else if (pCount === 4 && openEnds === 1) score += 2000;
          else if (oCount === 4 && openEnds === 1) score -= 2000;
          else if (pCount === 3 && openEnds === 2) score += 500;
          else if (oCount === 3 && openEnds === 2) score -= 500;
          else if (pCount === 3 && openEnds === 1) score += 50;
          else if (oCount === 3 && openEnds === 1) score -= 50;
          else if (pCount === 2 && openEnds === 2) score += 20;
          else if (oCount === 2 && openEnds === 2) score -= 20;
          else if (pCount === 2 && openEnds === 1) score += 5;
          else if (oCount === 2 && openEnds === 1) score -= 5;
          else if (pCount === 1 && openEnds === 2) score += 2;
          else if (oCount === 1 && openEnds === 2) score -= 2;
        }
      }
    }

    return score;
  }

  // ============================================================
  //  FAST WINNER CHECK — directional scan
  // ============================================================
  checkWinnerFast() {
    const N = TicTacToeAI.BOARD_SIZE;
    const W = TicTacToeAI.WIN_CONDITION;
    const board = this.board;

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const v = board[r * N + c];
        if (v === null) continue;

        // Check 4 directions: right, down, down-right, down-left
        const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for (const [dr, dc] of dirs) {
          const endR = r + (W - 1) * dr;
          const endC = c + (W - 1) * dc;
          if (endR < 0 || endR >= N || endC < 0 || endC >= N) continue;

          let match = true;
          for (let k = 1; k < W; k++) {
            if (board[(r + k * dr) * N + (c + k * dc)] !== v) {
              match = false;
              break;
            }
          }
          if (match) return v;
        }
      }
    }
    return null;
  }

  // Find immediate win (5 in a row) for a player — optimized directional scan
  findImmediateWin(player) {
    const N = TicTacToeAI.BOARD_SIZE;
    const W = TicTacToeAI.WIN_CONDITION;
    const board = this.board;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        for (const [dr, dc] of directions) {
          const endR = r + (W - 1) * dr;
          const endC = c + (W - 1) * dc;
          if (endR < 0 || endR >= N || endC < 0 || endC >= N) continue;

          let pCount = 0;
          let emptyPos = -1;
          let valid = true;

          for (let k = 0; k < W; k++) {
            const pos = (r + k * dr) * N + (c + k * dc);
            if (board[pos] === player) {
              pCount++;
            } else if (board[pos] === null) {
              if (emptyPos !== -1) { valid = false; break; } // More than one empty
              emptyPos = pos;
            } else {
              valid = false; break; // Opponent piece
            }
          }

          if (valid && pCount === W - 1 && emptyPos !== -1) {
            return emptyPos;
          }
        }
      }
    }
    return -1;
  }

  // Find open three (3-in-a-row with both ends open) — optimized
  findOpenThree(player) {
    const N = TicTacToeAI.BOARD_SIZE;
    const W = TicTacToeAI.WIN_CONDITION;
    const board = this.board;
    const opponent = player === "X" ? "O" : "X";
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    const results = [];

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        for (const [dr, dc] of directions) {
          const endR = r + (W - 1) * dr;
          const endC = c + (W - 1) * dc;
          if (endR < 0 || endR >= N || endC < 0 || endC >= N) continue;

          let pCount = 0, emptyPositions = [];
          let blocked = false;

          for (let k = 0; k < W; k++) {
            const pos = (r + k * dr) * N + (c + k * dc);
            if (board[pos] === player) pCount++;
            else if (board[pos] === null) emptyPositions.push(pos);
            else { blocked = true; break; }
          }

          if (blocked) continue;

          if (pCount === 3 && emptyPositions.length === 2) {
            // Check both ends are open
            const beforeR = r - dr, beforeC = c - dc;
            const afterR = endR + dr, afterC = endC + dc;
            let beforeOpen = false, afterOpen = false;

            if (beforeR >= 0 && beforeR < N && beforeC >= 0 && beforeC < N) {
              beforeOpen = board[beforeR * N + beforeC] === null;
            }
            if (afterR >= 0 && afterR < N && afterC >= 0 && afterC < N) {
              afterOpen = board[afterR * N + afterC] === null;
            }

            if (beforeOpen || afterOpen) {
              results.push(emptyPositions[Math.floor(Math.random() * emptyPositions.length)]);
            }
          }
        }
      }
    }

    if (results.length > 0) {
      return results[Math.floor(Math.random() * results.length)];
    }
    return -1;
  }

  // ============================================================
  //  CACHED getAllLines() — only generated once
  // ============================================================
  getAllLines() {
    if (this._cachedLines) return this._cachedLines;

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

    this._cachedLines = lines;
    return lines
  }

  checkWinner() {
    return this.checkWinnerFast();
  }

  checkWinnerOnBoard(board) {
    const N = TicTacToeAI.BOARD_SIZE;
    const W = TicTacToeAI.WIN_CONDITION;

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const v = board[r * N + c];
        if (v === null) continue;
        const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for (const [dr, dc] of dirs) {
          const endR = r + (W - 1) * dr;
          const endC = c + (W - 1) * dc;
          if (endR < 0 || endR >= N || endC < 0 || endC >= N) continue;
          let match = true;
          for (let k = 1; k < W; k++) {
            if (board[(r + k * dr) * N + (c + k * dc)] !== v) { match = false; break; }
          }
          if (match) return v;
        }
      }
    }
    return null;
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
    return symbol === this.humanSymbol;
  }

  highlightWinningLine(winner) {
    const N = TicTacToeAI.BOARD_SIZE;
    const W = TicTacToeAI.WIN_CONDITION;
    const board = this.board;

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (board[r * N + c] !== winner) continue;
        const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for (const [dr, dc] of dirs) {
          const endR = r + (W - 1) * dr;
          const endC = c + (W - 1) * dc;
          if (endR < 0 || endR >= N || endC < 0 || endC >= N) continue;
          let match = true;
          for (let k = 1; k < W; k++) {
            if (board[(r + k * dr) * N + (c + k * dc)] !== winner) { match = false; break; }
          }
          if (match) {
            for (let k = 0; k < W; k++) {
              const idx = (r + k * dr) * N + (c + k * dc);
              const cell = document.querySelector(`[data-index="${idx}"]`);
              if (cell) cell.classList.add("winning");
            }
            return;
          }
        }
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
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new TicTacToeAI()
})
