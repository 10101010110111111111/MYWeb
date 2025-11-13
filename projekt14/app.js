// Quiz state
let currentQuestionIndex = 0
let userAnswers = {}
let wrongQuestions = new Set()
let showingWrongOnly = false
let currentQuestions = []
let currentModule = "all" // Track current module

// Module ranges - these will be determined dynamically
let moduleRanges = {}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadState()
  determineModuleRanges()
  currentQuestions = [...quizData]
  setupEventListeners()
  showQuestion()
  updateStats()
})

// Event listeners
function setupEventListeners() {
  // Module selection buttons
  document.getElementById("moduleQ1Btn").addEventListener("click", () => selectModule("Q1"))
  document.getElementById("moduleQ2Btn").addEventListener("click", () => selectModule("Q2"))
  document.getElementById("moduleQ3Btn").addEventListener("click", () => selectModule("Q3"))
  document.getElementById("moduleQ4Btn").addEventListener("click", () => selectModule("Q4"))
  document.getElementById("moduleQ5Btn").addEventListener("click", () => selectModule("Q5"))
  document.getElementById("moduleQ6Btn").addEventListener("click", () => selectModule("Q6"))
  document.getElementById("moduleQ7Btn").addEventListener("click", () => selectModule("Q7"))
  document.getElementById("moduleQ8Btn").addEventListener("click", () => selectModule("Q8"))
  document.getElementById("moduleQ9Btn").addEventListener("click", () => selectModule("Q9"))
  document.getElementById("allModulesBtn").addEventListener("click", () => selectModule("all"))
  
  // Existing buttons
  document.getElementById("allQuestionsBtn").addEventListener("click", showAllQuestions)
  document.getElementById("wrongQuestionsBtn").addEventListener("click", showWrongQuestions)
  document.getElementById("resetBtn").addEventListener("click", resetQuiz)
  document.getElementById("nextBtn").addEventListener("click", nextQuestion)
  document.getElementById("prevBtn").addEventListener("click", prevQuestion)
  document.getElementById("restartBtn").addEventListener("click", restartQuiz)
}

// Determine module ranges dynamically by parsing comments in the data file
function determineModuleRanges() {
  // In a real implementation, we would parse the data.js file to find the comments
  // For now, we'll hardcode the ranges based on the known structure
  // These ranges were determined by examining the data.js file
  moduleRanges = {
    Q1: { start: 0, end: 22 },
    Q2: { start: 23, end: 54 },
    Q3: { start: 55, end: 83 },
    Q4: { start: 84, end: 112 },
    Q5: { start: 113, end: 139 },
    Q6: { start: 140, end: 184 },
    Q7: { start: 185, end: 207 },
    Q8: { start: 208, end: 252 },
    Q9: { start: 253, end: 292 }
  }
}

// Select module
function selectModule(module) {
  currentModule = module
  
  // Update active button
  document.querySelectorAll(".module-btn").forEach(btn => {
    btn.classList.remove("active")
  })
  
  if (module === "all") {
    document.getElementById("allModulesBtn").classList.add("active")
    currentQuestions = [...quizData]
  } else {
    document.getElementById(`module${module}Btn`).classList.add("active")
    const range = moduleRanges[module]
    if (range) {
      currentQuestions = quizData.slice(range.start, range.end + 1)
    } else {
      currentQuestions = [...quizData]
    }
  }
  
  // Reset to first question
  currentQuestionIndex = 0
  showingWrongOnly = false
  
  // Update UI
  document.getElementById("allQuestionsBtn").classList.add("active")
  document.getElementById("wrongQuestionsBtn").classList.remove("active")
  document.getElementById("quizContainer").classList.remove("hidden")
  document.getElementById("completionScreen").classList.add("hidden")
  
  showQuestion()
}

// Show question
function showQuestion() {
  if (currentQuestionIndex >= currentQuestions.length) {
    showCompletionScreen()
    return
  }

  const question = currentQuestions[currentQuestionIndex]
  // For module-specific questions, we need to calculate the actual index in the original quizData array
  const actualIndex = quizData.indexOf(question)

  document.getElementById("questionText").textContent = `${currentQuestionIndex + 1}. ${question.question}`

  const answersContainer = document.getElementById("answersContainer")
  answersContainer.innerHTML = ""

  const isMultipleChoice = question.correct.length > 1
  const userAnswer = userAnswers[actualIndex]
  const hasAnswered = userAnswer !== undefined

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button")
    button.className = "answer-option"
    button.textContent = answer

    if (hasAnswered) {
      button.classList.add("disabled")

      if (Array.isArray(userAnswer)) {
        if (userAnswer.includes(index) && !question.correct.includes(index)) {
          button.classList.add("incorrect")
        }
      } else {
        if (userAnswer === index && !question.correct.includes(index)) {
          button.classList.add("incorrect")
        }
      }

      if (question.correct.includes(index)) {
        button.classList.add("correct")
      }
    } else {
      if (isMultipleChoice) {
        // Only allow selection if not yet submitted
        if (!hasAnswered) {
          button.addEventListener("click", () => toggleMultipleAnswer(index, actualIndex))
          if (userAnswer && Array.isArray(userAnswer) && userAnswer.includes(index)) {
            button.classList.add("selected")
          }
        }
      } else {
        // Single choice questions
        if (!hasAnswered) {
          button.addEventListener("click", () => selectAnswer(index, actualIndex))
        }
      }
    }

    answersContainer.appendChild(button)
  })

  // Add submit button for multiple choice if not answered
  if (isMultipleChoice && !hasAnswered) {
    const submitBtn = document.createElement("button")
    submitBtn.id = "submitBtn"
    submitBtn.className = "nav-btn"
    submitBtn.textContent = "Odeslat odpověď"
    submitBtn.style.marginTop = "15px"
    submitBtn.addEventListener("click", () => submitMultipleAnswer(actualIndex))
    answersContainer.appendChild(submitBtn)
  }

  // Show feedback if already answered
  const feedbackEl = document.getElementById("feedback")
  if (hasAnswered) {
    const isCorrect = checkAnswer(userAnswer, question.correct)
    feedbackEl.className = `feedback ${isCorrect ? "correct" : "incorrect"}`
    feedbackEl.textContent = isCorrect ? "✓ Správně!" : "✗ Špatně! Správná odpověď je zvýrazněna zeleně."
  } else {
    feedbackEl.className = "feedback hidden"
  }

  updateNavigationButtons()
  updateStats()
}

// Toggle multiple answer selection
function toggleMultipleAnswer(answerIndex, questionIndex) {
  if (!userAnswers[questionIndex]) {
    userAnswers[questionIndex] = []
  }

  const answers = userAnswers[questionIndex]
  const idx = answers.indexOf(answerIndex)

  if (idx > -1) {
    answers.splice(idx, 1)
  } else {
    answers.push(answerIndex)
  }

  showQuestion()
}

// Submit multiple answer
function submitMultipleAnswer(questionIndex) {
  const userAnswer = userAnswers[questionIndex]
  if (!userAnswer || userAnswer.length === 0) {
    alert("Vyberte alespoň jednu odpověď.")
    return
  }

  const question = quizData[questionIndex]
  const isCorrect = checkAnswer(userAnswer, question.correct)

  if (!isCorrect) {
    wrongQuestions.add(questionIndex)
  }

  saveState()
  showQuestion()
}

// Select single answer
function selectAnswer(answerIndex, questionIndex) {
  userAnswers[questionIndex] = answerIndex

  const question = quizData[questionIndex]
  const isCorrect = question.correct.includes(answerIndex)

  if (!isCorrect) {
    wrongQuestions.add(questionIndex)
  }

  saveState()
  showQuestion()
}

// Check if answer is correct
function checkAnswer(userAnswer, correctAnswers) {
  if (Array.isArray(userAnswer)) {
    if (userAnswer.length !== correctAnswers.length) return false
    return userAnswer.every((a) => correctAnswers.includes(a))
  }
  return correctAnswers.includes(userAnswer)
}

// Navigation
function nextQuestion() {
  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex++
    showQuestion()
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--
    showQuestion()
  }
}

function updateNavigationButtons() {
  document.getElementById("prevBtn").disabled = currentQuestionIndex === 0
  document.getElementById("nextBtn").disabled = currentQuestionIndex >= currentQuestions.length - 1
}

// Show all questions
function showAllQuestions() {
  showingWrongOnly = false
  // If we're in a specific module, show all questions within that module
  if (currentModule === "all") {
    currentQuestions = [...quizData]
  } else {
    const range = moduleRanges[currentModule]
    if (range) {
      currentQuestions = quizData.slice(range.start, range.end + 1)
    } else {
      currentQuestions = [...quizData]
    }
  }
  currentQuestionIndex = 0

  document.getElementById("allQuestionsBtn").classList.add("active")
  document.getElementById("wrongQuestionsBtn").classList.remove("active")
  document.getElementById("quizContainer").classList.remove("hidden")
  document.getElementById("completionScreen").classList.add("hidden")

  showQuestion()
}

// Show wrong questions only
function showWrongQuestions() {
  // Filter wrong questions based on current module
  let filteredWrongQuestions = new Set()
  
  if (currentModule === "all") {
    filteredWrongQuestions = wrongQuestions
  } else {
    // For module-specific view, only show wrong questions from this module
    const range = moduleRanges[currentModule]
    if (range) {
      for (let i = range.start; i <= range.end; i++) {
        if (wrongQuestions.has(i)) {
          filteredWrongQuestions.add(i)
        }
      }
    }
  }
  
  if (filteredWrongQuestions.size === 0) {
    alert("Nemáte žádné špatně zodpovězené otázky!")
    return
  }

  showingWrongOnly = true
  if (currentModule === "all") {
    currentQuestions = [...filteredWrongQuestions].map((idx) => quizData[idx])
  } else {
    // For module-specific view, we need to map the indices correctly
    const range = moduleRanges[currentModule]
    const moduleWrongQuestions = [...filteredWrongQuestions]
      .filter(idx => idx >= range.start && idx <= range.end)
      .map(idx => quizData[idx])
    currentQuestions = moduleWrongQuestions
  }
  currentQuestionIndex = 0

  document.getElementById("wrongQuestionsBtn").classList.add("active")
  document.getElementById("allQuestionsBtn").classList.remove("active")
  document.getElementById("quizContainer").classList.remove("hidden")
  document.getElementById("completionScreen").classList.add("hidden")

  showQuestion()
}

// Reset quiz
function resetQuiz() {
  if (confirm("Opravdu chcete resetovat celý kvíz? Všechny odpovědi budou smazány.")) {
    userAnswers = {}
    wrongQuestions = new Set()
    currentQuestionIndex = 0
    showingWrongOnly = false
    // Reset to current module or all questions
    if (currentModule === "all") {
      currentQuestions = [...quizData]
    } else {
      const range = moduleRanges[currentModule]
      if (range) {
        currentQuestions = quizData.slice(range.start, range.end + 1)
      } else {
        currentQuestions = [...quizData]
      }
    }

    localStorage.removeItem("quizAnswers")
    localStorage.removeItem("quizWrongQuestions")

    document.getElementById("allQuestionsBtn").classList.add("active")
    document.getElementById("wrongQuestionsBtn").classList.remove("active")
    document.getElementById("quizContainer").classList.remove("hidden")
    document.getElementById("completionScreen").classList.add("hidden")

    showQuestion()
  }
}

// Restart quiz
function restartQuiz() {
  currentQuestionIndex = 0
  document.getElementById("quizContainer").classList.remove("hidden")
  document.getElementById("completionScreen").classList.add("hidden")
  showQuestion()
}

// Update stats
function updateStats() {
  const totalQuestions = currentQuestions.length
  const answeredCount = currentQuestions.filter((q, idx) => {
    const actualIdx = quizData.indexOf(q)
    return userAnswers[actualIdx] !== undefined
  }).length

  document.getElementById("questionCounter").textContent = `Otázka ${currentQuestionIndex + 1} z ${totalQuestions}`
  document.getElementById("score").textContent = `Zodpovězeno: ${answeredCount}/${totalQuestions}`
  
  // Update wrong count based on current module
  let wrongCount = 0
  if (currentModule === "all") {
    wrongCount = wrongQuestions.size
  } else {
    const range = moduleRanges[currentModule]
    if (range) {
      for (let i = range.start; i <= range.end; i++) {
        if (wrongQuestions.has(i)) {
          wrongCount++
        }
      }
    }
  }
  document.getElementById("wrongCount").textContent = wrongCount
}

// Completion screen
function showCompletionScreen() {
  const totalQuestions = currentQuestions.length
  const correctCount = currentQuestions.filter((q, idx) => {
    const actualIdx = quizData.indexOf(q)
    const userAnswer = userAnswers[actualIdx]
    return userAnswer !== undefined && checkAnswer(userAnswer, q.correct)
  }).length

  const percentage = Math.round((correctCount / totalQuestions) * 100)

  document.getElementById("quizContainer").classList.add("hidden")
  document.getElementById("completionScreen").classList.remove("hidden")
  document.getElementById("finalScore").textContent =
    `Získal jste ${correctCount} bodů z ${totalQuestions} (${percentage}%)`
}

// Save state to localStorage
function saveState() {
  localStorage.setItem("quizAnswers", JSON.stringify(userAnswers))
  localStorage.setItem("quizWrongQuestions", JSON.stringify([...wrongQuestions]))
}

// Load state from localStorage
function loadState() {
  const savedAnswers = localStorage.getItem("quizAnswers")
  const savedWrong = localStorage.getItem("quizWrongQuestions")

  if (savedAnswers) {
    userAnswers = JSON.parse(savedAnswers)
  }

  if (savedWrong) {
    wrongQuestions = new Set(JSON.parse(savedWrong))
  }
}
