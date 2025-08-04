// Atomic Habits Website JavaScript - Czech Translation

// Global variables
let currentUser = null
let currentProjectId = null
const currentDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
let selectedDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

// Add new global variables for month navigation
let currentViewMonth = new Date().getMonth()
let currentViewYear = new Date().getFullYear()

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  // Check for file:// URLs and redirect to 404 if accessing from local file system with specific pattern
  if (
    window.location.protocol === "file:" &&
    window.location.href.includes("/Desktop/Wa%20Atomic%20Habbits/") &&
    !window.location.href.endsWith("404.html")
  ) {
    // Check if the current page exists, if not redirect to 404
    const currentPage = window.location.pathname.split("/").pop()
    const validPages = [
      "index.html",
      "dashboard.html",
      "login.html",
      "register.html",
      "author-audiobook.html",
      "resources.html",
      "404.html",
    ]

    if (!validPages.includes(currentPage) && currentPage !== "") {
      window.location.href = "404.html"
      return
    }
  }

  // Check if user is logged in
  currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Update navigation based on login status
  updateNavigation()

  // Initialize page-specific functionality
  const currentPage = window.location.pathname.split("/").pop()

  switch (currentPage) {
    case "index.html":
    case "":
      initializeHomePage()
      break
    case "login.html":
      initializeLoginPage()
      break
    case "register.html":
      initializeRegisterPage()
      break
    case "dashboard.html":
      initializeDashboard()
      break
    case "resources.html":
      initializeResourcesPage()
      break
  }
}

// Add new function for resources page
function initializeResourcesPage() {
  // Add any specific functionality for resources page if needed
  console.log("Resources page initialized")
}

// Navigation Management
function updateNavigation() {
  const authNav = document.getElementById("auth-nav")
  if (authNav) {
    if (currentUser) {
      authNav.innerHTML = `
                <a class="nav-link" href="dashboard.html">Nástěnka</a>
            `
    } else {
      authNav.innerHTML = `
                <a class="nav-link" href="login.html">Přihlášení</a>
            `
    }
  }
}

// Home Page Initialization
function initializeHomePage() {
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Initialize audio player if it exists
  const audioPlayer = document.getElementById("audiobook-player")
  if (audioPlayer) {
    initializeAudioPlayer()
  }
}

// Audio Player Initialization
function initializeAudioPlayer() {
  const audioPlayer = document.getElementById("audiobook-player")
  const playBtn = document.getElementById("play-btn")
  const pauseBtn = document.getElementById("pause-btn")
  const volumeControl = document.getElementById("volume-control")
  const progressBar = document.getElementById("audio-progress")
  const currentTimeDisplay = document.getElementById("current-time")
  const durationDisplay = document.getElementById("duration")

  if (audioPlayer && playBtn && pauseBtn) {
    // Set up event listeners
    playBtn.addEventListener("click", () => {
      audioPlayer.play()
      playBtn.style.display = "none"
      pauseBtn.style.display = "inline-block"
    })

    pauseBtn.addEventListener("click", () => {
      audioPlayer.pause()
      pauseBtn.style.display = "none"
      playBtn.style.display = "inline-block"
    })

    if (volumeControl) {
      volumeControl.addEventListener("input", () => {
        audioPlayer.volume = volumeControl.value
      })
    }

    // Update progress bar
    audioPlayer.addEventListener("timeupdate", () => {
      if (progressBar) {
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100
        progressBar.style.width = percentage + "%"

        if (currentTimeDisplay) {
          currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime)
        }
      }
    })

    // Set duration when metadata is loaded
    audioPlayer.addEventListener("loadedmetadata", () => {
      if (durationDisplay) {
        durationDisplay.textContent = formatTime(audioPlayer.duration)
      }
    })

    // Allow seeking
    if (progressBar && progressBar.parentElement) {
      progressBar.parentElement.addEventListener("click", (e) => {
        const progressBarContainer = progressBar.parentElement
        const clickPosition =
          (e.clientX - progressBarContainer.getBoundingClientRect().left) / progressBarContainer.offsetWidth
        audioPlayer.currentTime = clickPosition * audioPlayer.duration
      })
    }
  }
}

// Format time for audio player (mm:ss)
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Login Page Initialization
function initializeLoginPage() {
  const loginForm = document.getElementById("loginForm")
  const togglePassword = document.getElementById("togglePassword")

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)

    // Real-time validation
    const inputs = loginForm.querySelectorAll("input")
    inputs.forEach((input) => {
      input.addEventListener("blur", validateField)
      input.addEventListener("input", clearFieldError)
    })
  }

  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      const passwordInput = document.getElementById("password")
      const icon = this.querySelector("i")

      if (passwordInput.type === "password") {
        passwordInput.type = "text"
        icon.classList.replace("fa-eye", "fa-eye-slash")
      } else {
        passwordInput.type = "password"
        icon.classList.replace("fa-eye-slash", "fa-eye")
      }
    })
  }

  // Check if user is already logged in
  if (currentUser) {
    window.location.href = "dashboard.html"
  }
}

// Registration Page Initialization
function initializeRegisterPage() {
  const registerForm = document.getElementById("registerForm")
  const togglePassword = document.getElementById("togglePassword")

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegistration)

    // Real-time validation
    const inputs = registerForm.querySelectorAll("input, select, textarea")
    inputs.forEach((input) => {
      input.addEventListener("blur", validateField)
      input.addEventListener("input", clearFieldError)
    })
  }

  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      const passwordInput = document.getElementById("password")
      const icon = this.querySelector("i")

      if (passwordInput.type === "password") {
        passwordInput.type = "text"
        icon.classList.replace("fa-eye", "fa-eye-slash")
      } else {
        passwordInput.type = "password"
        icon.classList.replace("fa-eye-slash", "fa-eye")
      }
    })
  }

  // Check if user is already logged in
  if (currentUser) {
    window.location.href = "dashboard.html"
  }
}

// Dashboard Initialization
function initializeDashboard() {
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Display user name
  const userNameElement = document.getElementById("userName")
  if (userNameElement) {
    userNameElement.textContent = currentUser.firstName
  }

  // Update subscription status
  updateSubscriptionStatus()

  // Load user projects
  loadUserProjects()

  // Initialize modals and forms
  initializeModals()
}

// Authentication Functions
function handleLogin(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const email = formData.get("email")
  const password = formData.get("password")

  // Validate form
  if (!validateLoginForm(email, password)) {
    return
  }

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Find user
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    // Login successful
    currentUser = user
    localStorage.setItem("currentUser", JSON.stringify(user))

    showAlert("Přihlášení úspěšné! Přesměrovávám...", "success")
    setTimeout(() => {
      window.location.href = "dashboard.html"
    }, 1500)
  } else {
    showAlert("Neplatný email nebo heslo", "danger")
  }
}

function handleRegistration(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const userData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    age: formData.get("age"),
    goals: formData.get("goals"),
    newsletter: formData.get("newsletter") === "on",
    terms: formData.get("terms") === "on",
    isPremium: false,
    createdAt: new Date().toISOString(),
  }

  // Validate form
  if (!validateRegistrationForm(userData)) {
    return
  }

  // Check if user already exists
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  if (users.find((u) => u.email === userData.email)) {
    showAlert("Účet s tímto emailem již existuje", "danger")
    return
  }

  // Add user to storage
  users.push(userData)
  localStorage.setItem("users", JSON.stringify(users))

  showAlert("Registrace úspěšná! Přesměrovávám na přihlášení...", "success")
  setTimeout(() => {
    window.location.href = "login.html"
  }, 2000)
}

function logout() {
  localStorage.removeItem("currentUser")
  currentUser = null
  window.location.href = "index.html"
}

// Validation Functions
function validateLoginForm(email, password) {
  let isValid = true

  // Email validation
  if (!email || !isValidEmail(email)) {
    showFieldError("email", "Prosím zadejte platnou emailovou adresu")
    isValid = false
  }

  // Password validation
  if (!password) {
    showFieldError("password", "Heslo je povinné")
    isValid = false
  }

  return isValid
}

function validateRegistrationForm(userData) {
  let isValid = true

  // First name validation
  if (!userData.firstName || userData.firstName.length < 2) {
    showFieldError("firstName", "Jméno musí mít alespoň 2 znaky")
    isValid = false
  }

  // Last name validation
  if (!userData.lastName || userData.lastName.length < 2) {
    showFieldError("lastName", "Příjmení musí mít alespoň 2 znaky")
    isValid = false
  }

  // Email validation
  if (!userData.email || !isValidEmail(userData.email)) {
    showFieldError("email", "Prosím zadejte platnou emailovou adresu")
    isValid = false
  }

  // Password validation
  if (!userData.password || userData.password.length < 8) {
    showFieldError("password", "Heslo musí mít alespoň 8 znaků")
    isValid = false
  }

  // Confirm password validation
  if (userData.password !== userData.confirmPassword) {
    showFieldError("confirmPassword", "Hesla se neshodují")
    isValid = false
  }

  // Age validation
  if (!userData.age) {
    showFieldError("age", "Prosím vyberte váš věkový rozsah")
    isValid = false
  }

  // Terms validation
  if (!userData.terms) {
    showFieldError("terms", "Musíte souhlasit s podmínkami služby")
    isValid = false
  }

  return isValid
}

function validateField(e) {
  const field = e.target
  const fieldName = field.name || field.id
  const value = field.value.trim()

  clearFieldError(fieldName)

  switch (fieldName) {
    case "email":
      if (!isValidEmail(value)) {
        showFieldError(fieldName, "Prosím zadejte platnou emailovou adresu")
      }
      break
    case "password":
      if (value.length < 8) {
        showFieldError(fieldName, "Heslo musí mít alespoň 8 znaků")
      }
      break
    case "confirmPassword":
      const password = document.getElementById("password").value
      if (value !== password) {
        showFieldError(fieldName, "Hesla se neshodují")
      }
      break
    case "cardNumber":
      if (!validateCardNumber(value)) {
        showFieldError(fieldName, "Prosím zadejte platné číslo karty")
      }
      break
    case "expiryDate":
      if (!validateExpiryDate(value)) {
        showFieldError(fieldName, "Prosím zadejte platné datum expirace (MM/RR)")
      }
      break
    case "cvv":
      if (!validateCVV(value)) {
        showFieldError(fieldName, "Prosím zadejte platný 3 nebo 4místný CVV kód")
      }
      break
  }
}

// Enhanced card validation functions
function validateCardNumber(cardNumber) {
  // Remove spaces and non-digits
  const digitsOnly = cardNumber.replace(/\D/g, "")

  // Check if length is valid (most cards are 13-19 digits)
  if (digitsOnly.length < 13 || digitsOnly.length > 19) {
    return false
  }
  return true;

  // Luhn algorithm for card number validation
  
}

function validateExpiryDate(expiryDate) {
  // Check format MM/YY
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return false
  }

  const [month, year] = expiryDate.split("/")
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100 // Get last 2 digits of year
  const currentMonth = currentDate.getMonth() + 1 // getMonth() is 0-indexed

  // Convert to numbers
  const monthNum = Number.parseInt(month, 10)
  const yearNum = Number.parseInt(year, 10)

  // Check if month is valid
  if (monthNum < 1 || monthNum > 12) {
    return false
  }

  // Check if date is in the past
  if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
    return false
  }

  return true
}

function validateCVV(cvv) {
  // CVV is typically 3 digits, or 4 digits for American Express
  return /^\d{3,4}$/.test(cvv)
}

function clearFieldError(fieldName) {
  const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`)
  if (field) {
    field.classList.remove("is-invalid")
    const feedback = field.parentNode.querySelector(".invalid-feedback")
    if (feedback) {
      feedback.textContent = ""
    }
  }
}

function showFieldError(fieldName, message) {
  const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`)
  if (field) {
    field.classList.add("is-invalid")
    const feedback = field.parentNode.querySelector(".invalid-feedback")
    if (feedback) {
      feedback.textContent = message
    }
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Project Management Functions
function loadUserProjects() {
  const projects = getUserProjects()
  const container = document.getElementById("projectsContainer")
  const noProjectsMessage = document.getElementById("noProjectsMessage")

  if (projects.length === 0) {
    container.innerHTML = ""
    noProjectsMessage.style.display = "block"
    return
  }

  noProjectsMessage.style.display = "none"
  container.innerHTML = projects.map((project) => createProjectCard(project)).join("")

  // Add event listeners to calendar days
  projects.forEach((project) => {
    const calendar = document.getElementById(`calendar-${project.id}`)
    if (calendar) {
      const dayCells = calendar.querySelectorAll(".calendar-day:not(.empty):not(.future)")
      dayCells.forEach((cell) => {
        cell.addEventListener("click", () => {
          const date = cell.getAttribute("data-date")
          if (date) {
            selectedDate = date
            showProjectComments(project.id, date)
          }
        })
      })
    }
  })
}

function getUserProjects() {
  const allProjects = JSON.parse(localStorage.getItem("projects") || "[]")
  return allProjects.filter((project) => project.userId === currentUser.email)
}

function createProjectCard(project) {
  const progress = calculateProgress(project)
  const categoryClass = project.category || "other"
  const isDoneToday = isDateCompleted(project, currentDate)

  return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card project-card ${categoryClass} h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title">${project.title}</h5>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="editProject('${project.id}')">
                                    <i class="fas fa-edit me-2"></i>Upravit
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="shareProject('${project.id}')">
                                    <i class="fas fa-share-alt me-2"></i>Sdílet
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="exportProjectData('${project.id}')">
                                    <i class="fas fa-download me-2"></i>Exportovat data
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deleteProject('${project.id}')">
                                    <i class="fas fa-trash me-2"></i>Smazat
                                </a></li>
                            </ul>
                        </div>
                    </div>
                    <p class="card-text text-muted">${project.description}</p>
                    
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="small text-muted">Pokrok</span>
                            <span class="small fw-bold">${progress.percentage}%</span>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar" role="progressbar" 
                                 style="width: ${progress.percentage}%" 
                                 aria-valuenow="${progress.percentage}" 
                                 aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <small class="text-muted">${progress.completed}/${progress.total} dnů dokončeno</small>
                    </div>
                    
                    <div class="habit-calendar" id="calendar-${project.id}">
                        ${generateCalendar(project)}
                    </div>
                    
                    <div id="project-comments-${project.id}" class="mb-3" style="display: none;">
                        <h6 class="text-muted mb-2">Komentáře pro <span class="comment-date"></span></h6>
                        <div class="comment-content p-2 rounded bg-light"></div>
                    </div>
                    
                    <div class="d-flex gap-2">
                        <button class="btn ${isDoneToday ? "btn-outline-success" : "btn-success"} btn-sm flex-fill" 
                                onclick="toggleDayComplete('${project.id}')">
                            <i class="fas ${isDoneToday ? "fa-undo" : "fa-check"} me-1"></i>
                            ${isDoneToday ? "Označit jako nesplněné" : "Označit jako splněné"}
                        </button>
                        <button class="btn btn-outline-primary btn-sm" 
                                onclick="showCommentModal('${project.id}')">
                            <i class="fas fa-comment me-1"></i>Komentář
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
}

// Update calculateProgress to use frequency
function calculateProgress(project) {
  const today = new Date()
  const startOfMonth = new Date(currentViewYear, currentViewMonth, 1)
  const endOfMonth = new Date(currentViewYear, currentViewMonth + 1, 0)
  const daysInMonth = endOfMonth.getDate()

  let targetDays = 0

  // Calculate target days based on frequency
  switch (project.frequency) {
    case "daily":
      targetDays = daysInMonth
      break
    case "weekdays":
      // Count weekdays in month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentViewYear, currentViewMonth, day)
        const dayOfWeek = date.getDay()
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          // Monday to Friday
          targetDays++
        }
      }
      break
    case "weekends":
      // Count weekends in month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentViewYear, currentViewMonth, day)
        const dayOfWeek = date.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Saturday and Sunday
          targetDays++
        }
      }
      break
    case "custom":
      targetDays = Math.min(project.customDays, daysInMonth)
      break
    default:
      targetDays = daysInMonth
  }

  // Count completed days in current view month
  let completed = 0
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentViewYear, currentViewMonth, day)
    const dateString = date.toISOString().split("T")[0]
    if (isDateCompleted(project, dateString)) {
      completed++
    }
  }

  const percentage = targetDays > 0 ? Math.round((completed / targetDays) * 100) : 0

  return {
    completed,
    total: targetDays,
    percentage,
  }
}

// COMPLETELY NEW CALENDAR GENERATION USING TABLE STRUCTURE
function generateCalendar(project) {
  const today = new Date()
  const startOfMonth = new Date(currentViewYear, currentViewMonth, 1)
  const endOfMonth = new Date(currentViewYear, currentViewMonth + 1, 0)

  let calendar = ""

  // Add month navigation header
  calendar += `
    <div class="calendar-header">
      <button class="calendar-nav-btn" onclick="changeMonth(-1)">
        <i class="fas fa-chevron-left"></i>
      </button>
      <h6>${getMonthName(currentViewMonth)} ${currentViewYear}</h6>
      <button class="calendar-nav-btn" onclick="changeMonth(1)">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `

  // Start calendar grid
  calendar += '<div class="calendar-grid">'

  // Add day headers row
  calendar += '<div class="calendar-week">'
  const dayHeaders = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]
  dayHeaders.forEach((day) => {
    calendar += `<div class="calendar-day-header">${day}</div>`
  })
  calendar += "</div>"

  // Calculate first day of month (Monday = 0)
  const startDay = startOfMonth.getDay()
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1

  let currentWeek = '<div class="calendar-week">'
  let dayCount = 0

  // Add empty cells for days before month starts
  for (let i = 0; i < adjustedStartDay; i++) {
    currentWeek += '<div class="calendar-day empty"></div>'
    dayCount++
  }

  // Add days of the month
  for (let day = 1; day <= endOfMonth.getDate(); day++) {
    const date = new Date(currentViewYear, currentViewMonth, day)
    const dateString = date.toISOString().split("T")[0]
    const isToday = dateString === currentDate
    const isCompleted = isDateCompleted(project, dateString)
    const isFuture = date > today
    const isValidDay = isValidFrequencyDay(project, date)

    let classes = "calendar-day"
    if (isToday) classes += " today"
    if (isCompleted) classes += " completed"
    if (isFuture) classes += " future"
    if (!isValidDay) classes += " invalid-day"

    currentWeek += `<div class="${classes}" data-date="${dateString}">${day}</div>`
    dayCount++

    // Start new week if we've reached 7 days
    if (dayCount % 7 === 0) {
      currentWeek += "</div>"
      calendar += currentWeek
      currentWeek = '<div class="calendar-week">'
    }
  }

  // Fill remaining cells in the last week
  while (dayCount % 7 !== 0) {
    currentWeek += '<div class="calendar-day empty"></div>'
    dayCount++
  }

  // Close last week
  currentWeek += "</div>"
  calendar += currentWeek

  // Close calendar grid
  calendar += "</div>"

  return calendar
}

// Add helper functions
function changeMonth(direction) {
  currentViewMonth += direction
  if (currentViewMonth > 11) {
    currentViewMonth = 0
    currentViewYear++
  } else if (currentViewMonth < 0) {
    currentViewMonth = 11
    currentViewYear--
  }
  loadUserProjects()
}

function getMonthName(monthIndex) {
  const months = [
    "Leden",
    "Únor",
    "Březen",
    "Duben",
    "Květen",
    "Červen",
    "Červenec",
    "Srpen",
    "Září",
    "Říjen",
    "Listopad",
    "Prosinec",
  ]
  return months[monthIndex]
}

function isValidFrequencyDay(project, date) {
  const dayOfWeek = date.getDay()

  switch (project.frequency) {
    case "daily":
      return true
    case "weekdays":
      return dayOfWeek >= 1 && dayOfWeek <= 5
    case "weekends":
      return dayOfWeek === 0 || dayOfWeek === 6
    case "custom":
      return true // For custom, all days are valid but progress is calculated differently
    default:
      return true
  }
}

function isDateCompleted(project, date) {
  const completedDates = project.completedDates || []
  return completedDates.includes(date)
}

function toggleDayComplete(projectId) {
  const projects = JSON.parse(localStorage.getItem("projects") || "[]")
  const projectIndex = projects.findIndex((p) => p.id === projectId)

  if (projectIndex === -1) return

  const project = projects[projectIndex]
  if (!project.completedDates) {
    project.completedDates = []
  }

  const dateIndex = project.completedDates.indexOf(currentDate)

  if (dateIndex === -1) {
    // Mark as done
    project.completedDates.push(currentDate)
    showAlert("Skvělá práce! Den označen jako dokončený!", "success")
  } else {
    // Mark as not done
    project.completedDates.splice(dateIndex, 1)
    showAlert("Den označen jako nedokončený", "info")
  }

  projects[projectIndex] = project
  localStorage.setItem("projects", JSON.stringify(projects))
  loadUserProjects()
}

function showProjectComments(projectId, date) {
  const projects = JSON.parse(localStorage.getItem("projects") || "[]")
  const project = projects.find((p) => p.id === projectId)

  if (!project) return

  const commentsContainer = document.getElementById(`project-comments-${projectId}`)
  const dateDisplay = commentsContainer.querySelector(".comment-date")
  const contentDisplay = commentsContainer.querySelector(".comment-content")

  // Format date for display
  const displayDate = new Date(date)
  const formattedDate = displayDate.toLocaleDateString("cs-CZ", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  dateDisplay.textContent = formattedDate

  // Find comment for this date
  const comment = (project.comments || []).find((c) => c.date === date)

  if (comment) {
    let moodIcon = ""
    let moodText = ""
    switch (comment.mood) {
      case "excellent":
        moodIcon = '<i class="fas fa-laugh mood-excellent"></i>'
        moodText = "Výborně"
        break
      case "good":
        moodIcon = '<i class="fas fa-smile mood-good"></i>'
        moodText = "Dobře"
        break
      case "okay":
        moodIcon = '<i class="fas fa-meh mood-okay"></i>'
        moodText = "Ujde to"
        break
      case "challenging":
        moodIcon = '<i class="fas fa-frown mood-challenging"></i>'
        moodText = "Náročné"
        break
      case "difficult":
        moodIcon = '<i class="fas fa-sad-tear mood-difficult"></i>'
        moodText = "Obtížné"
        break
    }

    contentDisplay.innerHTML = `
            <div class="d-flex align-items-center mb-2">
                <div class="me-2">${moodIcon}</div>
                <div class="text-capitalize">${moodText}</div>
            </div>
            <p class="mb-0">${comment.comment}</p>
        `
  } else {
    contentDisplay.innerHTML = '<p class="text-muted mb-0">Žádné komentáře pro tento den.</p>'
  }

  commentsContainer.style.display = "block"
}

function deleteProject(projectId) {
  if (confirm("Opravdu chcete smazat tento projekt? Tuto akci nelze vrátit zpět.")) {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]")
    const filteredProjects = projects.filter((p) => p.id !== projectId)
    localStorage.setItem("projects", JSON.stringify(filteredProjects))

    showAlert("Projekt byl úspěšně smazán", "info")
    loadUserProjects()
  }
}

function editProject(projectId) {
  const projects = JSON.parse(localStorage.getItem("projects") || "[]")
  const project = projects.find((p) => p.id === projectId)

  if (!project) return

  // Populate edit form
  document.getElementById("editProjectId").value = project.id
  document.getElementById("editProjectTitle").value = project.title
  document.getElementById("editProjectDescription").value = project.description
  document.getElementById("editProjectCategory").value = project.category

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("editProjectModal"))
  modal.show()
}

function shareProject(projectId) {
  // This would typically integrate with social media or sharing APIs
  // For now, we'll just show a mock sharing dialog
  alert(
    "Zde by byla implementována funkce sdílení. Umožnila by uživatelům sdílet svůj pokrok na sociálních sítích nebo přes email.",
  )
}

function exportProjectData(projectId) {
  const projects = JSON.parse(localStorage.getItem("projects") || "[]")
  const project = projects.find((p) => p.id === projectId)

  if (!project) return

  // Create a downloadable JSON file
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2))
  const downloadAnchorNode = document.createElement("a")
  downloadAnchorNode.setAttribute("href", dataStr)
  downloadAnchorNode.setAttribute("download", `${project.title.replace(/\s+/g, "-").toLowerCase()}-data.json`)
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}

// Modal Functions
function initializeModals() {
  const createProjectForm = document.getElementById("createProjectForm")
  const commentForm = document.getElementById("commentForm")
  const editProjectForm = document.getElementById("editProjectForm")

  if (createProjectForm) {
    createProjectForm.addEventListener("submit", handleCreateProject)

    // Add frequency change listener
    const frequencySelect = document.getElementById("projectFrequency")
    if (frequencySelect) {
      frequencySelect.addEventListener("change", function () {
        const customDaysContainer = document.getElementById("customDaysContainer")
        if (this.value === "custom") {
          customDaysContainer.style.display = "block"
        } else {
          customDaysContainer.style.display = "none"
        }
      })
    }
  }

  if (commentForm) {
    commentForm.addEventListener("submit", handleAddComment)
  }

  if (editProjectForm) {
    editProjectForm.addEventListener("submit", handleEditProject)
  }
}

function showCreateProjectModal() {
  const userProjects = getUserProjects()
  const maxProjects = currentUser.isPremium ? Number.POSITIVE_INFINITY : 3

  if (userProjects.length >= maxProjects) {
    showUpgradeModal()
    return
  }

  const modal = new bootstrap.Modal(document.getElementById("createProjectModal"))
  modal.show()
}

// Update handleCreateProject to include frequency
function handleCreateProject(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const projectData = {
    id: generateId(),
    userId: currentUser.email,
    title: formData.get("projectTitle"),
    description: formData.get("projectDescription"),
    category: formData.get("projectCategory"),
    frequency: formData.get("projectFrequency"),
    customDays: formData.get("customDays") ? Number.parseInt(formData.get("customDays")) : null,
    createdAt: new Date().toISOString(),
    completedDates: [],
    comments: [],
  }

  // Validate project
  if (!validateProjectForm(projectData)) {
    return
  }

  // Save project
  const projects = JSON.parse(localStorage.getItem("projects") || "[]")
  projects.push(projectData)
  localStorage.setItem("projects", JSON.stringify(projects))

  // Close modal and refresh projects
  const modal = bootstrap.Modal.getInstance(document.getElementById("createProjectModal"))
  modal.hide()

  showAlert("Projekt byl úspěšně vytvořen!", "success")
  loadUserProjects()

  // Reset form
  e.target.reset()
  document.getElementById("customDaysContainer").style.display = "none"
}

function handleEditProject(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const projectId = formData.get("projectId")

  // Get projects
  const projects = JSON.parse(localStorage.getItem("projects") || "[]")
  const projectIndex = projects.findIndex((p) => p.id === projectId)

  if (projectIndex === -1) return

  // Update project data
  projects[projectIndex].title = formData.get("projectTitle")
  projects[projectIndex].description = formData.get("projectDescription")
  projects[projectIndex].category = formData.get("projectCategory")

  // Save updated projects
  localStorage.setItem("projects", JSON.stringify(projects))

  // Close modal and refresh projects
  const modal = bootstrap.Modal.getInstance(document.getElementById("editProjectModal"))
  modal.hide()

  showAlert("Project updated successfully!", "success")
  loadUserProjects()
}

// Add frequency validation in validateProjectForm function
function validateProjectForm(projectData) {
  let isValid = true

  if (!projectData.title || projectData.title.length < 3) {
    showFieldError("projectTitle", "Název projektu musí mít alespoň 3 znaky")
    isValid = false
  }

  if (!projectData.description || projectData.description.length < 10) {
    showFieldError("projectDescription", "Popis musí mít alespoň 10 znaků")
    isValid = false
  }

  if (!projectData.category) {
    showFieldError("projectCategory", "Prosím vyberte kategorii")
    isValid = false
  }

  if (!projectData.frequency) {
    showFieldError("projectFrequency", "Prosím vyberte frekvenci")
    isValid = false
  }

  if (
    projectData.frequency === "custom" &&
    (!projectData.customDays || projectData.customDays < 1 || projectData.customDays > 31)
  ) {
    showFieldError("customDays", "Počet dnů musí být mezi 1 a 31")
    isValid = false
  }

  return isValid
}

function showCommentModal(projectId) {
  currentProjectId = projectId

  // Check if there's an existing comment for today
  const projects = JSON.parse(localStorage.getItem("projects") || "[]")
  const project = projects.find((p) => p.id === projectId)

  if (project) {
    const existingComment = (project.comments || []).find((c) => c.date === currentDate)

    if (existingComment) {
      // Pre-fill form with existing comment
      document.getElementById("dailyComment").value = existingComment.comment
      document.getElementById("mood").value = existingComment.mood
    } else {
      // Reset form
      document.getElementById("commentForm").reset()
    }
  }

  const modal = new bootstrap.Modal(document.getElementById("commentModal"))
  modal.show()
}

function handleAddComment(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const commentData = {
    id: generateId(),
    date: currentDate,
    comment: formData.get("dailyComment"),
    mood: formData.get("mood"),
    timestamp: new Date().toISOString(),
  }

  // Validate comment
  if (!commentData.comment.trim()) {
    showFieldError("dailyComment", "Please enter a comment")
    return
  }

  if (!commentData.mood) {
    showFieldError("mood", "Please select your mood")
    return
  }

  // Save comment to project
  const projects = JSON.parse(localStorage.getItem("projects") || "[]")
  const projectIndex = projects.findIndex((p) => p.id === currentProjectId)

  if (projectIndex !== -1) {
    if (!projects[projectIndex].comments) {
      projects[projectIndex].comments = []
    }

    // Remove existing comment for today if any
    projects[projectIndex].comments = projects[projectIndex].comments.filter((c) => c.date !== currentDate)

    // Add new comment
    projects[projectIndex].comments.push(commentData)
    localStorage.setItem("projects", JSON.stringify(projects))

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("commentModal"))
    modal.hide()

    showAlert("Comment saved successfully!", "success")

    // Reset form
    e.target.reset()

    // Show the comment if we're viewing today
    if (selectedDate === currentDate) {
      showProjectComments(currentProjectId, currentDate)
    }
  }
}

// Subscription Management
function updateSubscriptionStatus() {
  const subscriptionCard = document.getElementById("subscriptionCard")
  const subscriptionStatus = document.getElementById("subscriptionStatus")
  const subscriptionText = document.getElementById("subscriptionText")
  const upgradeBtn = document.getElementById("upgradeBtn")
  const createProjectBtn = document.getElementById("createProjectBtn")

  if (currentUser.isPremium) {
    subscriptionCard.className = "card border-warning subscription-premium"
    subscriptionStatus.innerHTML = '<i class="fas fa-crown me-2"></i>Premiový Uživatel'
    subscriptionText.textContent = "Můžete vytvářet projekty do nekonečna bez limitací !!!"
    upgradeBtn.style.display = "none"
  } else {
    const userProjects = getUserProjects()
    const remainingProjects = Math.max(0, 3 - userProjects.length)
    subscriptionText.textContent = `You can create ${remainingProjects} more projects. Upgrade for unlimited projects!`

    if (remainingProjects === 0) {
      createProjectBtn.innerHTML = '<i class="fas fa-crown me-1"></i>Upgrade to Create More'
      createProjectBtn.className = "btn btn-warning"
    }
  }
}

function showUpgradeModal() {
  const modal = new bootstrap.Modal(document.getElementById("upgradeModal"))
  
  // Reset button state when modal opens
  const paymentBtn = document.querySelector('[onclick="processPayment()"]')
  if (paymentBtn) {
    paymentBtn.disabled = false
    paymentBtn.innerHTML = '<i class="fas fa-credit-card me-1"></i>Odebírat nyní'
  }
  
  // Clear any existing form errors
  clearFieldError("cardNumber")
  clearFieldError("expiryDate")
  clearFieldError("cvv")
  clearFieldError("cardName")
  
  modal.show()
}

function processPayment() {
  const form = document.getElementById("paymentForm")
  const formData = new FormData(form)
  const paymentBtn = document.querySelector('[onclick="processPayment()"]')

  // Clear any existing errors first
  clearFieldError("cardNumber")
  clearFieldError("expiryDate")
  clearFieldError("cvv")
  clearFieldError("cardName")

  // Get form values
  const cardNumber = formData.get("cardNumber").replace(/\s/g, "")
  const expiryDate = formData.get("expiryDate")
  const cvv = formData.get("cvv")
  const cardName = formData.get("cardName")

  let isValid = true

  // Validate card number
  if (!cardNumber || !validateCardNumber(cardNumber)) {
    showFieldError("cardNumber", "Prosím zadejte platné číslo karty")
    isValid = false
  }

  // Validate expiry date
  if (!expiryDate || !validateExpiryDate(expiryDate)) {
    showFieldError("expiryDate", "Prosím zadejte platné datum expirace (MM/RR)")
    isValid = false
  }

  // Validate CVV
  if (!cvv || !validateCVV(cvv)) {
    showFieldError("cvv", "Prosím zadejte platný 3 nebo 4místný CVV kód")
    isValid = false
  }

  // Validate cardholder name
  if (!cardName || cardName.trim().length < 2) {
    showFieldError("cardName", "Prosím zadejte jméno držitele karty")
    isValid = false
  }

  // If validation fails, keep button enabled and show error
  if (!isValid) {
    showAlert("Prosím opravte chyby ve formuláři", "danger")
    // Make sure button stays enabled
    if (paymentBtn) {
      paymentBtn.disabled = false
      paymentBtn.innerHTML = '<i class="fas fa-credit-card me-1"></i>Odebírat nyní'
    }
    return
  }

  // Only disable button if validation passes
  if (paymentBtn) {
    paymentBtn.disabled = true
    paymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Zpracovávám...'
  }

  // Simulate payment processing
  showAlert("Zpracovávám platbu...", "info")

  setTimeout(() => {
    try {
      // Update user to premium
      currentUser.isPremium = true
      localStorage.setItem("currentUser", JSON.stringify(currentUser))

      // Update users array
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u) => u.email === currentUser.email)
      if (userIndex !== -1) {
        users[userIndex].isPremium = true
        localStorage.setItem("users", JSON.stringify(users))
      }

      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("upgradeModal"))
      modal.hide()

      showAlert("Platba úspěšná! Vítejte v Premium!", "success")
      updateSubscriptionStatus()

      // Reset form
      form.reset()
    } catch (error) {
      showAlert("Chyba při zpracování platby. Zkuste to znovu.", "danger")
    } finally {
      // Always re-enable button
      if (paymentBtn) {
        paymentBtn.disabled = false
        paymentBtn.innerHTML = '<i class="fas fa-credit-card me-1"></i>Odebírat nyní'
      }
    }
  }, 2000)
}

// Utility Functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function showAlert(message, type = "info") {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll(".alert-custom")
  existingAlerts.forEach((alert) => alert.remove())

  // Create new alert
  const alert = document.createElement("div")
  alert.className = `alert alert-${type} alert-dismissible fade show alert-custom`
  alert.style.position = "fixed"
  alert.style.top = "20px"
  alert.style.right = "20px"
  alert.style.zIndex = "9999"
  alert.style.minWidth = "300px"

  alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `

  document.body.appendChild(alert)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove()
    }
  }, 5000)
}

// Format card number input
document.addEventListener("input", (e) => {
  if (e.target.id === "cardNumber") {
    let value = e.target.value.replace(/\s/g, "").replace(/\D/g, "")
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ")
    e.target.value = value
  }

  if (e.target.id === "expiryDate") {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4)
    }
    e.target.value = value
  }

  if (e.target.id === "cvv") {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 4)
  }
})

// Initialize sample data for demo
function initializeSampleData() {
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  if (users.length === 0) {
    const sampleUser = {
      firstName: "Ukázkový",
      lastName: "Uživatel",
      email: "demo@example.com",
      password: "Heslo123",
      age: "26–35",
      goals: "Vytvořit lepší návyky",
      newsletter: true,
      terms: true,
      isPremium: false,
      createdAt: new Date().toISOString(),
    }

    users.push(sampleUser)
    localStorage.setItem("users", JSON.stringify(users))
  }
}

// Call initialize sample data on first load
if (localStorage.getItem("users") === null) {
  initializeSampleData()
}
