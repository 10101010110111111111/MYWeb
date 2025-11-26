// Quiz state
let currentQuestionIndex = 0
let userAnswers = {}
let currentQuestions = []
let currentModule = "all" // Track current module
let wrongAnswers = new Map() // Track wrong answers using Map to store user's answers and original question state
let showingWrongOnly = false // Track if we're showing only wrong answers
let lastAllQuestionsIndex = 0 // Track last position in all questions
let lastWrongQuestionsIndex = 0 // Track last position in wrong questions
let starredQuestions = new Set() // Track starred questions
let testMode = false // Track if we're in test mode

// Add shuffled data storage
let shuffledQuizData = []
let originalQuizData = []

// Module ranges - these will be determined dynamically
let moduleRanges = {}

// Add reference to shuffling functions
let shuffleEnabled = true // Set to false to disable shuffling for testing

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadState()
  determineModuleRanges()
  
  // Store original data and create shuffled version
  originalQuizData = [...quizData]
  if (shuffleEnabled) {
    shuffledQuizData = createShuffledQuizData()
    currentQuestions = [...shuffledQuizData]
  } else {
    currentQuestions = [...quizData]
  }
  
  setupEventListeners()
  setupKeyboardShortcuts()
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
  document.getElementById("moduleStarredBtn").addEventListener("click", () => selectModule("starred"))
  document.getElementById("moduleTestBtn").addEventListener("click", () => selectModule("test"))
  document.getElementById("allModulesBtn").addEventListener("click", () => selectModule("all"))
  
  // Existing buttons
  document.getElementById("allQuestionsBtn").addEventListener("click", showAllQuestions)
  document.getElementById("wrongQuestionsBtn").addEventListener("click", showWrongQuestions)
  document.getElementById("resetBtn").addEventListener("click", resetQuiz)
  document.getElementById("nextBtn").addEventListener("click", nextQuestion)
  document.getElementById("prevBtn").addEventListener("click", prevQuestion)
  document.getElementById("starBtn").addEventListener("click", toggleStarQuestion)
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

// Add function to create shuffled quiz data
function createShuffledQuizData() {
  try {
    // First shuffle answers within each question
    let answerShuffledData = typeof shuffleAllAnswers !== 'undefined' ? 
      shuffleAllAnswers([...originalQuizData]) : [...originalQuizData]
    
    // Then shuffle questions within each module
    let fullyShuffledData = typeof shuffleQuestionsByModule !== 'undefined' ? 
      shuffleQuestionsByModule(answerShuffledData, moduleRanges) : answerShuffledData
    
    return fullyShuffledData
  } catch (error) {
    console.error('Error during shuffling:', error)
    return [...originalQuizData]
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
    currentQuestions = shuffleEnabled ? [...shuffledQuizData] : [...quizData]
  } else if (module === "starred") {
    document.getElementById("moduleStarredBtn").classList.add("active")
    // Show starred questions
    currentQuestions = Array.from(starredQuestions).map(index => quizData[index])
    testMode = false
  } else if (module === "test") {
    document.getElementById("moduleTestBtn").classList.add("active")
    // Create test with 50 random questions
    currentQuestions = createTestQuestions()
    testMode = true
  } else {
    document.getElementById(`module${module}Btn`).classList.add("active")
    const range = moduleRanges[module]
    if (range) {
      if (shuffleEnabled) {
        currentQuestions = shuffledQuizData.slice(range.start, range.end + 1)
      } else {
        currentQuestions = quizData.slice(range.start, range.end + 1)
      }
    } else {
      currentQuestions = shuffleEnabled ? [...shuffledQuizData] : [...quizData]
    }
  }
  
  // Reset to first question
  currentQuestionIndex = 0
  showingWrongOnly = false
  lastAllQuestionsIndex = 0
  lastWrongQuestionsIndex = 0
  
  // Update UI
  document.getElementById("allQuestionsBtn").classList.add("active")
  document.getElementById("wrongQuestionsBtn").classList.remove("active")
  document.getElementById("quizContainer").classList.remove("hidden")
  document.getElementById("completionScreen").classList.add("hidden")
  
  showQuestion()
}

// Create test with 50 random questions
function createTestQuestions() {
  // Get all questions
  const allQuestions = shuffleEnabled ? [...shuffledQuizData] : [...quizData]
  
  // Shuffle and take first 50
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(50, shuffled.length))
}

// Show question
function showQuestion() {
  if (currentQuestionIndex >= currentQuestions.length) {
    showCompletionScreen()
    return
  }

  const question = currentQuestions[currentQuestionIndex]
  // For module-specific questions, we need to calculate the actual index in the original quizData array
  const actualIndex = getOriginalQuestionIndex(question)

  // Check if we're showing wrong answers
  let userAnswer = actualIndex !== -1 ? userAnswers[actualIndex] : undefined
  let wrongAnswerData = null
  
  // Create a copy of the question to avoid modifying the original
  let displayQuestion = {...question, answers: [...question.answers]}
  
  if (showingWrongOnly && window.wrongAnswersData) {
    wrongAnswerData = window.wrongAnswersData[currentQuestionIndex]
    if (wrongAnswerData) {
      userAnswer = wrongAnswerData.userAnswer
      // Use the preserved answer order when showing wrong answers
      if (wrongAnswerData.originalAnswers) {
        displayQuestion.answers = [...wrongAnswerData.originalAnswers]
      }
      // Also update the correct answers to match the preserved order
      if (wrongAnswerData.correct) {
        displayQuestion.correct = [...wrongAnswerData.correct]
      }
    }
  }

  const hasAnswered = userAnswer !== undefined

  document.getElementById("questionText").textContent = `${currentQuestionIndex + 1}. ${displayQuestion.question}`

  const answersContainer = document.getElementById("answersContainer")
  answersContainer.innerHTML = ""

  const isMultipleChoice = displayQuestion.correct.length > 1

  displayQuestion.answers.forEach((answer, index) => {
    const button = document.createElement("button")
    button.className = "answer-option"
    button.textContent = answer

    if (hasAnswered) {
      button.classList.add("disabled")

      if (Array.isArray(userAnswer)) {
        if (userAnswer.includes(index) && !displayQuestion.correct.includes(index)) {
          button.classList.add("incorrect")
        }
      } else {
        if (userAnswer === index && !displayQuestion.correct.includes(index)) {
          button.classList.add("incorrect")
        }
      }

      if (displayQuestion.correct.includes(index)) {
        button.classList.add("correct")
      }
    } else {
      if (isMultipleChoice) {
        // Only allow selection if not yet submitted
        button.addEventListener("click", (event) => toggleMultipleAnswer(index, actualIndex, event))
        if (userAnswer && Array.isArray(userAnswer) && userAnswer.includes(index)) {
          button.classList.add("selected")
        }
      } else {
        // Single choice questions
        button.addEventListener("click", (event) => selectAnswer(index, actualIndex, event))
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
    const isCorrect = checkAnswer(userAnswer, displayQuestion.correct)
    feedbackEl.className = `feedback ${isCorrect ? "correct" : "incorrect"}`
    
    if (showingWrongOnly) {
      // Show detailed feedback for wrong answers
      let feedbackText = "✗ Špatně! Správná odpověď je zvýrazněna zeleně."
      
      // Add user's answer information
      if (Array.isArray(userAnswer)) {
        const userAnswerText = userAnswer.map(idx => displayQuestion.answers[idx]).join(", ")
        const correctAnswerText = displayQuestion.correct.map(idx => displayQuestion.answers[idx]).join(", ")
        feedbackText += ` Vaše odpověď: ${userAnswerText}. Správná odpověď: ${correctAnswerText}.`
      } else {
        const userAnswerText = displayQuestion.answers[userAnswer]
        const correctAnswerText = displayQuestion.correct.map(idx => displayQuestion.answers[idx]).join(", ")
        feedbackText += ` Vaše odpověď: ${userAnswerText}. Správná odpověď: ${correctAnswerText}.`
      }
      
      feedbackEl.textContent = feedbackText
    } else {
      feedbackEl.textContent = isCorrect ? "✓ Správně!" : "✗ Špatně! Správná odpověď je zvýrazněna zeleně."
      
      // Track wrong answers (only when not in wrong answers mode)
      if (!isCorrect) {
        // Preserve the original answer order when tracking wrong answers
        wrongAnswers.set(actualIndex, {
          userAnswer: userAnswer,
          originalAnswers: [...question.answers], // Preserve the current answer order
          correct: [...question.correct] // Preserve the correct answer indices
        })
        saveWrongAnswersState()
      } else if (wrongAnswers.has(actualIndex)) {
        // Remove from wrong answers if user corrected their mistake
        wrongAnswers.delete(actualIndex)
        saveWrongAnswersState()
      }
    }
  } else {
    feedbackEl.className = "feedback hidden"
  }

  // Update star button state
  const starBtn = document.getElementById("starBtn")
  if (starredQuestions.has(actualIndex)) {
    starBtn.classList.add("starred")
    starBtn.textContent = "★"
  } else {
    starBtn.classList.remove("starred")
    starBtn.textContent = "★"
  }

  updateNavigationButtons()
  updateStats()
}

// Add a function to find the actual index of a question in the original quizData
function getOriginalQuestionIndex(question) {
  // First try direct indexOf
  let index = quizData.indexOf(question);
  if (index !== -1) {
    return index;
  }
  
  // If not found (due to shuffling), find by matching question text
  for (let i = 0; i < quizData.length; i++) {
    if (quizData[i].question === question.question) {
      return i;
    }
  }
  
  return -1;
}

// Toggle multiple answer selection
function toggleMultipleAnswer(answerIndex, questionIndex, event) {
  // Make sure we have a valid question index
  if (questionIndex === -1) return;
  
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

  // Update the UI to reflect the selection
  const button = event.target;
  button.classList.toggle('selected');
}

// Submit multiple answer
function submitMultipleAnswer(questionIndex) {
  // Make sure we have a valid question index
  if (questionIndex === -1) return;
  
  const userAnswer = userAnswers[questionIndex]
  if (!userAnswer || userAnswer.length === 0) {
    alert("Vyberte alespoň jednu odpověď.")
    return
  }

  const question = quizData[questionIndex]
  const isCorrect = checkAnswer(userAnswer, question.correct)

  saveState()
  showQuestion()
}

// Select single answer
function selectAnswer(answerIndex, questionIndex, event) {
  // Make sure we have a valid question index
  if (questionIndex === -1) return;
  
  userAnswers[questionIndex] = answerIndex

  const question = quizData[questionIndex]
  const isCorrect = question.correct.includes(answerIndex)

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

// Toggle star for current question
function toggleStarQuestion() {
  const question = currentQuestions[currentQuestionIndex]
  const actualIndex = getOriginalQuestionIndex(question)
  
  if (starredQuestions.has(actualIndex)) {
    starredQuestions.delete(actualIndex)
  } else {
    starredQuestions.add(actualIndex)
  }
  
  saveStarredQuestionsState()
  showQuestion()
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
  // Save current position if we're switching from wrong questions
  if (showingWrongOnly) {
    lastWrongQuestionsIndex = currentQuestionIndex
  }
  
  // If we're in a specific module, show all questions within that module
  if (currentModule === "all") {
    currentQuestions = shuffleEnabled ? [...shuffledQuizData] : [...quizData]
  } else if (currentModule === "starred") {
    currentQuestions = Array.from(starredQuestions).map(index => quizData[index])
  } else if (currentModule === "test") {
    // Keep test questions
  } else {
    const range = moduleRanges[currentModule]
    if (range) {
      if (shuffleEnabled) {
        currentQuestions = shuffledQuizData.slice(range.start, range.end + 1)
      } else {
        currentQuestions = quizData.slice(range.start, range.end + 1)
      }
    } else {
      currentQuestions = shuffleEnabled ? [...shuffledQuizData] : [...quizData]
    }
  }
  
  // Restore last position
  currentQuestionIndex = lastAllQuestionsIndex
  if (currentQuestionIndex >= currentQuestions.length) {
    currentQuestionIndex = currentQuestions.length > 0 ? currentQuestions.length - 1 : 0
  }
  
  showingWrongOnly = false

  document.getElementById("allQuestionsBtn").classList.add("active")
  document.getElementById("wrongQuestionsBtn").classList.remove("active")
  document.getElementById("quizContainer").classList.remove("hidden")
  document.getElementById("completionScreen").classList.add("hidden")

  showQuestion()
}

// Show wrong questions
function showWrongQuestions() {
  // Save current position if we're switching from all questions
  if (!showingWrongOnly) {
    lastAllQuestionsIndex = currentQuestionIndex
  }
  
  // Filter wrong answers for current module
  let moduleWrongAnswers = []
  const wrongAnswersArray = Array.from(wrongAnswers.entries())
  
  if (currentModule === "all") {
    moduleWrongAnswers = wrongAnswersArray.map(([index, data]) => ({
      question: quizData[index],
      originalIndex: index,
      userAnswer: data.userAnswer,
      originalAnswers: data.originalAnswers,
      correct: data.correct
    }))
  } else if (currentModule === "starred") {
    // Filter wrong answers to only include starred questions
    moduleWrongAnswers = wrongAnswersArray
      .filter(([index, data]) => starredQuestions.has(index))
      .map(([index, data]) => ({
        question: quizData[index],
        originalIndex: index,
        userAnswer: data.userAnswer,
        originalAnswers: data.originalAnswers,
        correct: data.correct
      }))
  } else if (currentModule === "test") {
    // No wrong answers in test mode
    moduleWrongAnswers = []
  } else {
    const range = moduleRanges[currentModule]
    if (range) {
      moduleWrongAnswers = wrongAnswersArray
        .filter(([index, data]) => index >= range.start && index <= range.end)
        .map(([index, data]) => ({
          question: quizData[index],
          originalIndex: index,
          userAnswer: data.userAnswer,
          originalAnswers: data.originalAnswers,
          correct: data.correct
        }))
    }
  }
  
  if (moduleWrongAnswers.length === 0) {
    alert("Nemáte žádné špatné odpovědi v tomto modulu.")
    return
  }
  
  // Store the wrong answers data for display
  window.wrongAnswersData = moduleWrongAnswers
  
  currentQuestions = moduleWrongAnswers.map(item => item.question)
  
  // Restore last position
  currentQuestionIndex = lastWrongQuestionsIndex
  if (currentQuestionIndex >= currentQuestions.length) {
    currentQuestionIndex = currentQuestions.length > 0 ? currentQuestions.length - 1 : 0
  }
  
  showingWrongOnly = true

  document.getElementById("allQuestionsBtn").classList.remove("active")
  document.getElementById("wrongQuestionsBtn").classList.add("active")
  document.getElementById("quizContainer").classList.remove("hidden")
  document.getElementById("completionScreen").classList.add("hidden")

  showQuestion()
}

// Reset quiz - also reshuffle questions
function resetQuiz() {
  if (confirm("Opravdu chcete resetovat celý kvíz? Všechny odpovědi budou smazány, ale otázky s hvězdičkou zůstanou zachovány.")) {
    userAnswers = {}
    wrongAnswers = new Map()
    // Keep starred questions - don't reset them
    // starredQuestions = new Set()  // Commented out this line
    currentQuestionIndex = 0
    
    // Reshuffle data if enabled
    if (shuffleEnabled) {
      shuffledQuizData = createShuffledQuizData()
    }
    
    // Reset to current module or all questions
    if (currentModule === "all") {
      currentQuestions = shuffleEnabled ? [...shuffledQuizData] : [...quizData]
    } else if (currentModule === "starred") {
      currentQuestions = Array.from(starredQuestions).map(index => quizData[index])
    } else if (currentModule === "test") {
      currentQuestions = createTestQuestions()
    } else {
      const range = moduleRanges[currentModule]
      if (range) {
        if (shuffleEnabled) {
          currentQuestions = shuffledQuizData.slice(range.start, range.end + 1)
        } else {
          currentQuestions = quizData.slice(range.start, range.end + 1)
        }
      } else {
        currentQuestions = shuffleEnabled ? [...shuffledQuizData] : [...quizData]
      }
    }

    localStorage.removeItem("quizAnswers")
    localStorage.removeItem("quizWrongQuestions")
    // Don't remove starred questions from localStorage
    // localStorage.removeItem("quizStarredQuestions")  // Commented out this line

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
  // Clear user answers when restarting but keep wrong answers and starred questions
  userAnswers = {}
  showingWrongOnly = false
  testMode = false
  
  // Reset to current module or all questions
  if (currentModule === "all") {
    currentQuestions = shuffleEnabled ? [...shuffledQuizData] : [...quizData]
  } else if (currentModule === "starred") {
    currentQuestions = Array.from(starredQuestions).map(index => quizData[index])
  } else if (currentModule === "test") {
    currentQuestions = createTestQuestions()
    testMode = true
  } else {
    const range = moduleRanges[currentModule]
    if (range) {
      if (shuffleEnabled) {
        currentQuestions = shuffledQuizData.slice(range.start, range.end + 1)
      } else {
        currentQuestions = quizData.slice(range.start, range.end + 1)
      }
    } else {
      currentQuestions = shuffleEnabled ? [...shuffledQuizData] : [...quizData]
    }
  }
  
  document.getElementById("allQuestionsBtn").classList.add("active")
  document.getElementById("wrongQuestionsBtn").classList.remove("active")
  document.getElementById("quizContainer").classList.remove("hidden")
  document.getElementById("completionScreen").classList.add("hidden")
  showQuestion()
}

// Update answer selection UI without re-rendering the whole question
function updateAnswerSelection(questionIndex) {
  // Make sure we have a valid question index
  if (questionIndex === -1) return;
  
  const answersContainer = document.getElementById("answersContainer")
  const answerButtons = answersContainer.querySelectorAll('.answer-option')
  const userAnswer = userAnswers[questionIndex]
  
  // Update the visual state of answer buttons
  answerButtons.forEach((button, index) => {
    button.classList.remove('selected')
    if (userAnswer && Array.isArray(userAnswer) && userAnswer.includes(index)) {
      button.classList.add('selected')
    }
  })
}

// Update stats
function updateStats() {
  const totalQuestions = currentQuestions.length
  const answeredCount = currentQuestions.filter((q, idx) => {
    const actualIdx = getOriginalQuestionIndex(q)
    return actualIdx !== -1 && userAnswers[actualIdx] !== undefined
  }).length

  document.getElementById("questionCounter").textContent = `Otázka ${currentQuestionIndex + 1} z ${totalQuestions}`
  document.getElementById("score").textContent = `Zodpovězeno: ${answeredCount}/${totalQuestions}`
}

// Completion screen
function showCompletionScreen() {
  const totalQuestions = currentQuestions.length
  const correctCount = currentQuestions.filter((q, idx) => {
    const actualIdx = getOriginalQuestionIndex(q)
    const userAnswer = actualIdx !== -1 ? userAnswers[actualIdx] : undefined
    return userAnswer !== undefined && checkAnswer(userAnswer, q.correct)
  }).length

  const percentage = Math.round((correctCount / totalQuestions) * 100)

  document.getElementById("quizContainer").classList.add("hidden")
  document.getElementById("completionScreen").classList.remove("hidden")
  
  if (testMode) {
    document.getElementById("finalScore").textContent =
      `Test dokončen! Správně: ${correctCount}/${totalQuestions} (${percentage}%)`
  } else {
    document.getElementById("finalScore").textContent =
      `Získal jste ${correctCount} bodů z ${totalQuestions} (${percentage}%)`
  }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    // Prevent default behavior for arrow keys to avoid page scrolling
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'a' || event.key === 'd' || event.key === ',') {
      event.preventDefault()
    }
    
    // Previous question - A key or Left arrow
    if (event.key === 'a' || event.key === 'ArrowLeft') {
      prevQuestion()
    }
    
    // Next question - D key or Right arrow
    if (event.key === 'd' || event.key === 'ArrowRight') {
      nextQuestion()
    }
    
    // Star/unstar question - Comma key or S key
    if (event.key === ',' || event.key === 's' || event.key === 'S') {
      toggleStarQuestion()
    }
  })
}

// Save state to localStorage
function saveState() {
  localStorage.setItem("quizAnswers", JSON.stringify(userAnswers))
  saveWrongAnswersState()
  saveStarredQuestionsState()
}

// Save wrong answers state to localStorage
function saveWrongAnswersState() {
  const wrongAnswersArray = Array.from(wrongAnswers.entries()).map(([index, data]) => [
    index,
    {
      userAnswer: data.userAnswer,
      originalAnswers: data.originalAnswers,
      correct: data.correct
    }
  ])
  localStorage.setItem("quizWrongQuestions", JSON.stringify(wrongAnswersArray))
}

// Save starred questions state to localStorage
function saveStarredQuestionsState() {
  localStorage.setItem("quizStarredQuestions", JSON.stringify(Array.from(starredQuestions)))
}

// Load state from localStorage
function loadState() {
  const savedAnswers = localStorage.getItem("quizAnswers")
  const savedWrongAnswers = localStorage.getItem("quizWrongQuestions")
  const savedStarredQuestions = localStorage.getItem("quizStarredQuestions")

  if (savedAnswers) {
    userAnswers = JSON.parse(savedAnswers)
  }
  
  if (savedWrongAnswers) {
    const wrongAnswersArray = JSON.parse(savedWrongAnswers)
    // Reconstruct the Map with proper objects
    wrongAnswers = new Map(wrongAnswersArray.map(([index, data]) => [index, data]))
  }
  
  if (savedStarredQuestions) {
    starredQuestions = new Set(JSON.parse(savedStarredQuestions))
  }
}