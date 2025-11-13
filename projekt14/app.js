// Quiz state
let currentQuestionIndex = 0
let userAnswers = {}
let wrongQuestions = new Set()
let showingWrongOnly = false
let currentQuestions = []

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadState()
  currentQuestions = [...quizData]
  setupEventListeners()
  showQuestion()
  updateStats()
})

// Event listeners
function setupEventListeners() {
  document.getElementById("allQuestionsBtn").addEventListener("click", showAllQuestions)
  document.getElementById("wrongQuestionsBtn").addEventListener("click", showWrongQuestions)
  document.getElementById("resetBtn").addEventListener("click", resetQuiz)
  document.getElementById("nextBtn").addEventListener("click", nextQuestion)
  document.getElementById("prevBtn").addEventListener("click", prevQuestion)
  document.getElementById("restartBtn").addEventListener("click", restartQuiz)
}

// Show question
function showQuestion() {
  if (currentQuestionIndex >= currentQuestions.length) {
    showCompletionScreen()
    return
  }

  const question = currentQuestions[currentQuestionIndex]
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
    submitBtn.textContent = "Submit Answer"
    submitBtn.style.marginTop = "15px"
    submitBtn.addEventListener("click", () => submitMultipleAnswer(actualIndex))
    answersContainer.appendChild(submitBtn)
  }

  // Show feedback if already answered
  const feedbackEl = document.getElementById("feedback")
  if (hasAnswered) {
    const isCorrect = checkAnswer(userAnswer, question.correct)
    feedbackEl.className = `feedback ${isCorrect ? "correct" : "incorrect"}`
    feedbackEl.textContent = isCorrect ? "✓ Correct!" : "✗ Incorrect! The correct answer is highlighted in green."
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
    alert("Please select at least one answer.")
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
  currentQuestions = [...quizData]
  currentQuestionIndex = 0

  document.getElementById("allQuestionsBtn").classList.add("active")
  document.getElementById("wrongQuestionsBtn").classList.remove("active")
  document.getElementById("quizContainer").classList.remove("hidden")
  document.getElementById("completionScreen").classList.add("hidden")

  showQuestion()
}

// Show wrong questions only
function showWrongQuestions() {
  if (wrongQuestions.size === 0) {
    alert("You have no incorrectly answered questions!")
    return
  }

  showingWrongOnly = true
  currentQuestions = [...wrongQuestions].map((idx) => quizData[idx])
  currentQuestionIndex = 0

  document.getElementById("wrongQuestionsBtn").classList.add("active")
  document.getElementById("allQuestionsBtn").classList.remove("active")
  document.getElementById("quizContainer").classList.remove("hidden")
  document.getElementById("completionScreen").classList.add("hidden")

  showQuestion()
}

// Reset quiz
function resetQuiz() {
  if (confirm("Are you sure you want to reset the entire quiz? All answers will be deleted.")) {
    userAnswers = {}
    wrongQuestions = new Set()
    currentQuestionIndex = 0
    showingWrongOnly = false
    currentQuestions = [...quizData]

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
  document.getElementById("wrongCount").textContent = wrongQuestions.size
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
    `You scored ${correctCount} out of ${totalQuestions} points (${percentage}%)`
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
