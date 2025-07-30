// Time Coin Tracker - Enhanced Application Logic
class TimeCoinTracker {
  constructor() {
    this.data = this.loadData()
    this.currentDate = new Date().toDateString()
    this.activities = this.data.activities || this.getDefaultActivities()
    this.dailyData = this.data.dailyData || {}
    this.goals = this.data.goals || []
    this.challenges = this.data.challenges || []
    this.streaks = this.data.streaks || {}
    this.categories = this.data.categories || this.getDefaultCategories()
    this.targets = this.data.targets || []
    this.settings = this.data.settings || {
      enableReminders: true,
      reminderTime: "20:00",
    }
    this.personalRecords = this.data.personalRecords || {}

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.checkNewDay()
    this.renderToday()
    this.updateCurrentDate()
    this.loadTodaysData()
    this.showDailyQuote()
    this.setupReminders()
    this.checkPersonalRecords()
  }

  getDefaultActivities() {
    return [
      {
        id: "sleep",
        name: "Sleep",
        icon: "😴",
        color: "#6366f1",
        category: "health",
        minCoins: 8,
        coins: 0,
        required: true,
        recurring: true,
      },
      {
        id: "social-media",
        name: "Social Media",
        icon: "📱",
        color: "#ec4899",
        category: "entertainment",
        coins: 0,
        required: true,
        recurring: true,
      },
      {
        id: "work",
        name: "Work",
        icon: "💼",
        color: "#10b981",
        category: "productivity",
        coins: 0,
        required: true,
        recurring: true,
      },
    ]
  }

  getDefaultCategories() {
    return [
      { id: "health", name: "Health", color: "#10b981" },
      { id: "productivity", name: "Productivity", color: "#3b82f6" },
      { id: "entertainment", name: "Entertainment", color: "#ec4899" },
      { id: "learning", name: "Learning", color: "#f59e0b" },
      { id: "social", name: "Social", color: "#8b5cf6" },
      { id: "other", name: "Other", color: "#6b7280" },
    ]
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => this.switchTab(e.target.dataset.tab))
    })



    // Settings
    document.getElementById("settingsBtn").addEventListener("click", () => this.openModal("settingsModal"))

    // Today tab actions
    document.getElementById("addActivityBtn").addEventListener("click", () => this.openModal("addActivityModal"))
    document.getElementById("autoFillBtn").addEventListener("click", () => this.autoFillFromPattern())
    document.getElementById("resetDayBtn").addEventListener("click", () => this.resetDay())
    document.getElementById("finishDayBtn").addEventListener("click", () => this.finishDay())

    // Daily notes
    document.getElementById("dailyNotes").addEventListener("input", (e) => this.saveDailyNotes(e.target.value))

    // Modal controls
    document.querySelectorAll(".close-btn, [data-modal]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.dataset.modal || e.target.closest(".modal").id
        this.closeModal(modal)
      })
    })

    // Forms
    document.getElementById("addActivityForm").addEventListener("submit", (e) => this.addActivity(e))
    document.getElementById("addGoalForm").addEventListener("submit", (e) => this.addGoal(e))
    document.getElementById("addChallengeForm").addEventListener("submit", (e) => this.addChallenge(e))
    document.getElementById("addTargetForm").addEventListener("submit", (e) => this.addTarget(e))
    document.getElementById("addCategoryForm").addEventListener("submit", (e) => this.addCategory(e))

    // Goals, challenges, and planning
    document.getElementById("addGoalBtn").addEventListener("click", () => this.openAddGoalModal())
    document.getElementById("addChallengeBtn").addEventListener("click", () => this.openAddChallengeModal())
    document.getElementById("addTargetBtn").addEventListener("click", () => this.openAddTargetModal())
    document.getElementById("addCategoryBtn").addEventListener("click", () => this.openModal("addCategoryModal"))

    // Statistics
    document.getElementById("chartViewBtn").addEventListener("click", () => this.showChartView())
    document.getElementById("tableViewBtn").addEventListener("click", () => this.showTableView())
    document.getElementById("exportDataBtn").addEventListener("click", () => this.exportData())
    document.getElementById("importDataBtn").addEventListener("click", () => this.importData())
    document.getElementById("statsTimeRange").addEventListener("change", () => this.renderStats())

    // History
    document.getElementById("historyPeriod").addEventListener("change", () => this.renderHistory())
    document.getElementById("seasonalOverviewBtn").addEventListener("click", () => this.showSeasonalOverview())

    // Survey and reflection
    document.getElementById("submitSurveyBtn").addEventListener("click", () => this.submitSurvey())
    document.getElementById("closeReflectionBtn").addEventListener("click", () => this.closeModal("reflectionModal"))

    // Settings
    document.getElementById("clearDataBtn").addEventListener("click", () => this.clearAllData())
    document.getElementById("enableReminders").addEventListener("change", (e) => {
      this.settings.enableReminders = e.target.checked
      this.saveData()
      this.setupReminders()
    })
    document.getElementById("reminderTime").addEventListener("change", (e) => {
      this.settings.reminderTime = e.target.value
      this.saveData()
      this.setupReminders()
    })

    // File import
    document.getElementById("importFileInput").addEventListener("change", (e) => this.handleFileImport(e))

    // Keyboard navigation
    document.addEventListener("keydown", (e) => this.handleKeyboard(e))

    // Click outside modal to close
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeModal(e.target.id)
      }
    })
  }

  // Enhanced Data Management
  loadData() {
    try {
      const data = localStorage.getItem("timeCoinTracker")
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error("Error loading data:", error)
      return {}
    }
  }

  saveData() {
    try {
      const data = {
        activities: this.activities,
        dailyData: this.dailyData,
        goals: this.goals,
        challenges: this.challenges,
        streaks: this.streaks,
        categories: this.categories,
        targets: this.targets,
        settings: this.settings,
        personalRecords: this.personalRecords,
      }
      localStorage.setItem("timeCoinTracker", JSON.stringify(data))
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }



  // Daily Quote System
  showDailyQuote() {
    const quotes = [
      "Time is what we want most, but what we use worst. - William Penn",
      "The key is not to prioritize what's on your schedule, but to schedule your priorities. - Stephen Covey",
      "Time management is life management. - Robin Sharma",
      "You will never find time for anything. You must make it. - Charles Buxton",
      "Time is the most valuable thing we have, because it is the most irrevocable. - Dietrich Bonhoeffer",
      "Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin. - Mother Teresa",
      "The future depends on what you do today. - Mahatma Gandhi",
      "Time flies over us, but leaves its shadow behind. - Nathaniel Hawthorne",
      "Lost time is never found again. - Benjamin Franklin",
      "Time is a created thing. To say 'I don't have time,' is like saying, 'I don't want to.' - Lao Tzu",
    ]

    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
    const quote = quotes[dayOfYear % quotes.length]

    document.getElementById("quoteText").textContent = quote
  }

  // Reminder System
  setupReminders() {
    if (!this.settings.enableReminders) return

    const now = new Date()
    const reminderTime = this.settings.reminderTime.split(":")
    const reminderDate = new Date()
    reminderDate.setHours(Number.parseInt(reminderTime[0]), Number.parseInt(reminderTime[1]), 0, 0)

    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1)
    }

    const timeUntilReminder = reminderDate.getTime() - now.getTime()

    setTimeout(() => {
      this.checkDailyReminder()
      // Set up daily recurring reminder
      setInterval(() => this.checkDailyReminder(), 24 * 60 * 60 * 1000)
    }, timeUntilReminder)
  }

  checkDailyReminder() {
    const today = new Date().toDateString()
    const todayData = this.dailyData[today]

    if (!todayData || this.getRemainingCoins() > 0) {
      this.showNotification("⏰ Don't forget to allocate your time coins for today!", "reminder")
    }
  }

  // Enhanced Date Management
  checkNewDay() {
    const today = new Date().toDateString()
    if (this.currentDate !== today) {
      this.lockPreviousDay()
      this.currentDate = today
      this.resetActivitiesCoins()
      this.checkStreaks()
      this.autoFillRecurringActivities()
    }
  }

  lockPreviousDay() {
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (this.dailyData[yesterday]) {
      this.dailyData[yesterday].locked = true
    }
  }

  updateCurrentDate() {
    const today = new Date()
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    document.getElementById("currentDate").textContent = today.toLocaleDateString("en-US", options)

    // Update day status
    const todayData = this.dailyData[today.toDateString()]
    const statusEl = document.getElementById("dayStatus")
    if (todayData && todayData.locked) {
      statusEl.textContent = "🔒 Day completed and locked"
      statusEl.className = "day-status locked"
    } else {
      statusEl.textContent = "📝 Day in progress"
      statusEl.className = "day-status active"
    }
  }

  // Auto-fill System
  autoFillRecurringActivities() {
    const recentDays = this.getRecentDays(7)
    const patterns = this.analyzeActivityPatterns(recentDays)

    this.activities.forEach((activity) => {
      if (activity.recurring && patterns[activity.id]) {
        activity.coins = Math.round(patterns[activity.id].average)
      }
    })

    this.renderToday()
    this.showNotification("Activities auto-filled based on your patterns!")
  }

  autoFillFromPattern() {
    this.autoFillRecurringActivities()
  }

  analyzeActivityPatterns(days) {
    const patterns = {}

    this.activities.forEach((activity) => {
      const values = days.map((day) => this.dailyData[day]?.activities?.[activity.id] || 0).filter((val) => val > 0)

      if (values.length > 0) {
        patterns[activity.id] = {
          average: values.reduce((a, b) => a + b, 0) / values.length,
          frequency: values.length / days.length,
        }
      }
    })

    return patterns
  }

  getRecentDays(count) {
    const days = []
    for (let i = 1; i <= count; i++) {
      const date = new Date(Date.now() - i * 86400000)
      days.push(date.toDateString())
    }
    return days
  }

  // Enhanced Navigation
  switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabName)
    })

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.toggle("active", content.id === `${tabName}-tab`)
    })

    // Render specific tab content
    switch (tabName) {
      case "history":
        this.renderHistory()
        break
      case "goals":
        this.renderGoals()
        break
      case "challenges":
        this.renderChallenges()
        break
      case "stats":
        this.renderStats()
        break
      case "planning":
        this.renderPlanning()
        break
    }
  }

  // Enhanced Modal Management
  openModal(modalId) {
    document.getElementById(modalId).classList.add("active")
    document.body.style.overflow = "hidden"

    // Focus first input for accessibility
    const firstInput = document.querySelector(`#${modalId} input, #${modalId} select`)
    if (firstInput) firstInput.focus()
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active")
    document.body.style.overflow = ""
  }

  // Enhanced Today Tab Rendering
  renderToday() {
    this.renderActivities()
    this.updateCoinCounter()
    this.checkWarnings()
    this.loadDailyNotes()
    this.showPersonalRecords()
  }

  renderActivities() {
    const container = document.getElementById("activitiesList")
    container.innerHTML = ""

    // Group activities by category
    const categorizedActivities = this.groupActivitiesByCategory()

    Object.keys(categorizedActivities).forEach((categoryId) => {
      const category = this.categories.find((c) => c.id === categoryId)
      const activities = categorizedActivities[categoryId]

      if (activities.length === 0) return

      const categoryDiv = document.createElement("div")
      categoryDiv.className = "activity-category"
      categoryDiv.innerHTML = `
                <h3 class="category-header" style="color: ${category.color}">
                    ${category.name} (${activities.length} activities)
                </h3>
                <div class="category-activities"></div>
            `

      const activitiesContainer = categoryDiv.querySelector(".category-activities")
      activities.forEach((activity) => {
        const activityElement = this.createActivityElement(activity)
        activitiesContainer.appendChild(activityElement)
      })

      container.appendChild(categoryDiv)
    })
  }

  groupActivitiesByCategory() {
    const grouped = {}
    this.categories.forEach((category) => {
      grouped[category.id] = []
    })

    this.activities.forEach((activity) => {
      const categoryId = activity.category || "other"
      if (grouped[categoryId]) {
        grouped[categoryId].push(activity)
      }
    })

    return grouped
  }

  createActivityElement(activity) {
    const div = document.createElement("div")
    div.className = "activity-card"
    div.innerHTML = `
            <div class="activity-header">
                <div class="activity-info">
                    <div class="activity-icon" style="background-color: ${activity.color}">
                        ${activity.icon}
                    </div>
                    <div>
                        <div class="activity-name">
                            ${activity.name}
                            ${activity.recurring ? '<span class="recurring-badge">🔄</span>' : ""}
                        </div>
                        ${activity.minCoins ? `<div class="activity-requirements">Minimum: ${activity.minCoins} coins</div>` : ""}
                        ${activity.maxCoins ? `<div class="activity-requirements">Maximum: ${activity.maxCoins} coins</div>` : ""}
                    </div>
                </div>
                <div class="activity-controls">
                    <div class="coin-input">
                        <button class="coin-btn" onclick="app.adjustCoins('${activity.id}', -1)" ${activity.coins <= 0 ? "disabled" : ""}>-</button>
                        <span class="coin-count">${activity.coins}</span>
                        <button class="coin-btn" onclick="app.adjustCoins('${activity.id}', 1)" ${this.getRemainingCoins() <= 0 ? "disabled" : ""}>+</button>
                    </div>
                    ${!activity.required ? `<button class="secondary-btn" onclick="app.removeActivity('${activity.id}')">Remove</button>` : ""}
                </div>
            </div>
        `
    return div
  }

  adjustCoins(activityId, change) {
    const activity = this.activities.find((a) => a.id === activityId)
    if (!activity) return

    const newValue = activity.coins + change
    const remainingCoins = this.getRemainingCoins()

    // Check constraints
    if (newValue < 0) return
    if (change > 0 && remainingCoins <= 0) return
    if (activity.maxCoins && newValue > activity.maxCoins) return

    activity.coins = newValue
    this.renderToday()
    this.saveData()
  }

  getRemainingCoins() {
    const usedCoins = this.activities.reduce((sum, activity) => sum + activity.coins, 0)
    return 24 - usedCoins
  }

  updateCoinCounter() {
    const remaining = this.getRemainingCoins()
    document.getElementById("remainingCoins").textContent = remaining

    // Enable/disable finish button
    const finishBtn = document.getElementById("finishDayBtn")
    finishBtn.disabled = remaining !== 0

    // Update coin buttons
    this.activities.forEach((activity) => {
      const buttons = document.querySelectorAll(`button[onclick*="${activity.id}"]`)
      buttons.forEach((btn) => {
        if (btn.textContent === "+") {
          btn.disabled = remaining <= 0 || (activity.maxCoins && activity.coins >= activity.maxCoins)
        } else if (btn.textContent === "-") {
          btn.disabled = activity.coins <= 0
        }
      })
    })
  }

  // Daily Notes System
  loadDailyNotes() {
    const today = new Date().toDateString()
    const todayData = this.dailyData[today]
    const notesTextarea = document.getElementById("dailyNotes")

    if (todayData && todayData.notes) {
      notesTextarea.value = todayData.notes
    } else {
      notesTextarea.value = ""
    }
  }

  saveDailyNotes(notes) {
    const today = new Date().toDateString()
    if (!this.dailyData[today]) {
      this.dailyData[today] = {}
    }
    this.dailyData[today].notes = notes
    this.saveData()
  }

  // Personal Records System
  checkPersonalRecords() {
    const today = new Date().toDateString()
    const todayData = this.dailyData[today]

    if (!todayData || !todayData.activities) return

    const records = this.calculatePersonalRecords()
    const newRecords = []

    // Check for new records
    Object.keys(records).forEach((recordType) => {
      const currentRecord = this.personalRecords[recordType]
      const newRecord = records[recordType]

      if (!currentRecord || newRecord.value > currentRecord.value) {
        this.personalRecords[recordType] = {
          value: newRecord.value,
          date: today,
          description: newRecord.description,
        }
        newRecords.push(newRecord.description)
      }
    })

    if (newRecords.length > 0) {
      this.showPersonalRecordNotification(newRecords)
    }

    this.saveData()
  }

  calculatePersonalRecords() {
    const records = {}
    const allDays = Object.keys(this.dailyData)

    // Most productive day (work + learning)
    let maxProductivity = 0
    allDays.forEach((date) => {
      const dayData = this.dailyData[date]
      if (dayData.activities) {
        const productivity = (dayData.activities.work || 0) + (dayData.activities.learning || 0)
        if (productivity > maxProductivity) {
          maxProductivity = productivity
        }
      }
    })

    records.mostProductiveDay = {
      value: maxProductivity,
      description: `Most productive day: ${maxProductivity} coins`,
    }

    // Longest sleep streak
    let currentSleepStreak = 0
    let maxSleepStreak = 0
    allDays.sort().forEach((date) => {
      const dayData = this.dailyData[date]
      const sleepCoins = dayData?.activities?.sleep || 0

      if (sleepCoins >= 8) {
        currentSleepStreak++
        maxSleepStreak = Math.max(maxSleepStreak, currentSleepStreak)
      } else {
        currentSleepStreak = 0
      }
    })

    records.longestSleepStreak = {
      value: maxSleepStreak,
      description: `Longest sleep streak: ${maxSleepStreak} days`,
    }

    return records
  }

  showPersonalRecords() {
    const container = document.getElementById("recordsContainer")
    container.innerHTML = ""

    if (Object.keys(this.personalRecords).length === 0) return

    const recordsDiv = document.createElement("div")
    recordsDiv.className = "personal-records"
    recordsDiv.innerHTML = "<h3>🏆 Personal Records</h3>"

    Object.values(this.personalRecords).forEach((record) => {
      const recordEl = document.createElement("div")
      recordEl.className = "record-item"
      recordEl.innerHTML = `
                <span>${record.description}</span>
                <small>Set on ${new Date(record.date).toLocaleDateString()}</small>
            `
      recordsDiv.appendChild(recordEl)
    })

    container.appendChild(recordsDiv)
  }

  showPersonalRecordNotification(records) {
    records.forEach((record) => {
      this.showNotification(`🏆 New Personal Record: ${record}`, "success")
    })
  }

  // Enhanced Warning System
  checkWarnings() {
    const container = document.getElementById("warningsContainer")
    container.innerHTML = ""

    // Check sleep warning
    const sleepActivity = this.activities.find((a) => a.id === "sleep")
    if (sleepActivity && sleepActivity.coins < sleepActivity.minCoins) {
      const deficit = sleepActivity.minCoins - sleepActivity.coins
      const warningLevel = this.getSleepWarningLevel()

      const warning = document.createElement("div")
      warning.className = `warning ${warningLevel}`
      warning.innerHTML = this.getSleepWarningMessage(deficit, warningLevel)
      container.appendChild(warning)

      // Play warning sound for severe warnings
      if (warningLevel === "critical") {
        this.playWarningSound()
      }
    }

    // Check if all coins are used
    if (this.getRemainingCoins() > 0) {
      const warning = document.createElement("div")
      warning.className = "warning"
      warning.textContent = `You still have ${this.getRemainingCoins()} coins to allocate!`
      container.appendChild(warning)
    }
  }

  getSleepWarningLevel() {
    const sleepDeficitDays = this.getSleepDeficitDays()
    if (sleepDeficitDays >= 7) return "critical"
    if (sleepDeficitDays >= 3) return "severe"
    return "normal"
  }

  getSleepDeficitDays() {
    let count = 0
    const dates = Object.keys(this.dailyData).sort().reverse()

    for (const date of dates.slice(0, 7)) {
      const dayData = this.dailyData[date]
      if (dayData && dayData.activities) {
        const sleepCoins = dayData.activities.sleep || 0
        if (sleepCoins < 8) count++
        else break
      }
    }
    return count
  }

  getSleepWarningMessage(deficit, level) {
    const messages = {
      normal: `⚠️ You need ${deficit} more coins for adequate sleep. Your health depends on it!`,
      severe: `🚨 SLEEP DEFICIT ALERT! You've been under-sleeping for days. This is seriously affecting your health and performance. Add ${deficit} more coins to sleep NOW!`,
      critical: `💀 CRITICAL SLEEP DEPRIVATION! You're in dangerous territory. Your body and mind are suffering. This pattern must stop immediately. Add ${deficit} coins to sleep or face severe consequences!`,
    }
    return messages[level]
  }

  playWarningSound() {
    // Create audio context for warning sound
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log("Audio not supported")
    }
  }

  resetDay() {
    if (confirm("Are you sure you want to reset today's coin allocation?")) {
      this.resetActivitiesCoins()
      this.renderToday()
      this.saveData()
    }
  }

  resetActivitiesCoins() {
    this.activities.forEach((activity) => {
      activity.coins = 0
    })
  }

  finishDay() {
    const today = new Date().toDateString()
    const todayData = this.dailyData[today]

    if (todayData && todayData.locked) {
      this.showNotification("This day is already completed and locked!", "warning")
      return
    }

    this.openSurveyModal()
  }

  // Enhanced Survey System
  openSurveyModal() {
    const modal = document.getElementById("surveyModal")
    const content = document.getElementById("surveyContent")

    content.innerHTML = ""

    // Only survey activities that have coins allocated
    const activeActivities = this.activities.filter((a) => a.coins > 0)

    activeActivities.forEach((activity) => {
      const surveyDiv = document.createElement("div")
      surveyDiv.className = "survey-activity"
      surveyDiv.innerHTML = `
                <h3>
                    <span style="color: ${activity.color}">${activity.icon}</span>
                    ${activity.name} (${activity.coins} coins)
                </h3>
                <div class="mood-selector">
                    <button class="mood-btn" data-activity="${activity.id}" data-mood="1" title="Very Bad">😢</button>
                    <button class="mood-btn" data-activity="${activity.id}" data-mood="2" title="Bad">😐</button>
                    <button class="mood-btn" data-activity="${activity.id}" data-mood="3" title="Neutral">🙂</button>
                    <button class="mood-btn" data-activity="${activity.id}" data-mood="4" title="Good">😊</button>
                    <button class="mood-btn" data-activity="${activity.id}" data-mood="5" title="Excellent">🤩</button>
                </div>
                <div class="rating-slider">
                    <label>Rate your experience (1-10):</label>
                    <input type="range" min="1" max="10" value="5" data-activity="${activity.id}" data-type="rating">
                    <div class="rating-display">5</div>
                </div>
            `
      content.appendChild(surveyDiv)
    })

    // Add event listeners for mood buttons and sliders
    content.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const activityId = e.target.dataset.activity
        content
          .querySelectorAll(`[data-activity="${activityId}"].mood-btn`)
          .forEach((b) => b.classList.remove("selected"))
        e.target.classList.add("selected")
      })
    })

    content.querySelectorAll('input[type="range"]').forEach((slider) => {
      slider.addEventListener("input", (e) => {
        const display = e.target.parentNode.querySelector(".rating-display")
        display.textContent = e.target.value
      })
    })

    this.openModal("surveyModal")
  }

  submitSurvey() {
    const surveyData = {}
    const content = document.getElementById("surveyContent")

    // Collect mood data
    content.querySelectorAll(".mood-btn.selected").forEach((btn) => {
      const activityId = btn.dataset.activity
      surveyData[activityId] = surveyData[activityId] || {}
      surveyData[activityId].mood = Number.parseInt(btn.dataset.mood)
    })

    // Collect rating data
    content.querySelectorAll('input[type="range"]').forEach((slider) => {
      const activityId = slider.dataset.activity
      surveyData[activityId] = surveyData[activityId] || {}
      surveyData[activityId].rating = Number.parseInt(slider.value)
    })

    // Save daily data
    const today = new Date().toDateString()
    this.dailyData[today] = {
      activities: {},
      survey: surveyData,
      notes: document.getElementById("dailyNotes").value,
      date: today,
      locked: true, // Lock the day after completion
    }

    // Save activity coins
    this.activities.forEach((activity) => {
      if (activity.coins > 0) {
        this.dailyData[today].activities[activity.id] = activity.coins
      }
    })

    this.saveData()
    this.updateStreaks()
    this.checkPersonalRecords()
    this.closeModal("surveyModal")
    this.showDailyReflection()

    // Reset for tomorrow
    this.resetActivitiesCoins()
    this.renderToday()
    this.showNotification("Day completed and locked! 🎉", "success")
  }

  showDailyReflection() {
    const modal = document.getElementById("reflectionModal")
    const content = document.getElementById("reflectionContent")
    const today = new Date().toDateString()
    const todayData = this.dailyData[today]

    let reflectionHTML = "<h3>Today's Summary</h3>"

    if (todayData) {
      // Find most time-consuming activity
      const activities = todayData.activities
      const maxActivity = Object.keys(activities).reduce((a, b) => (activities[a] > activities[b] ? a : b))

      // Find best and worst rated activities
      const survey = todayData.survey
      let bestActivity = null,
        worstActivity = null
      let bestRating = 0,
        worstRating = 11

      Object.keys(survey).forEach((activityId) => {
        const rating = survey[activityId].rating
        if (rating > bestRating) {
          bestRating = rating
          bestActivity = activityId
        }
        if (rating < worstRating) {
          worstRating = rating
          worstActivity = activityId
        }
      })

      const getActivityName = (id) => this.activities.find((a) => a.id === id)?.name || id

      reflectionHTML += `
                <div class="reflection-stats">
                    <p><strong>Most time spent:</strong> ${getActivityName(maxActivity)} (${activities[maxActivity]} coins)</p>
                    ${bestActivity ? `<p><strong>Best rated activity:</strong> ${getActivityName(bestActivity)} (${bestRating}/10)</p>` : ""}
                    ${worstActivity ? `<p><strong>Needs improvement:</strong> ${getActivityName(worstActivity)} (${worstRating}/10)</p>` : ""}
                    ${todayData.notes ? `<p><strong>Your notes:</strong> "${todayData.notes}"</p>` : ""}
                </div>
            `
    }

    content.innerHTML = reflectionHTML

    // Add motivational quote
    const quotes = [
      "Time is what we want most, but what we use worst. - William Penn",
      "The key is not to prioritize what's on your schedule, but to schedule your priorities. - Stephen Covey",
      "Time management is life management. - Robin Sharma",
      "You will never find time for anything. You must make it. - Charles Buxton",
      "Time is the most valuable thing we have, because it is the most irrevocable. - Dietrich Bonhoeffer",
    ]

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    document.getElementById("motivationalQuote").textContent = randomQuote

    this.openModal("reflectionModal")
  }

  // Enhanced Activity Management
  openAddGoalModal() {
    const select = document.getElementById("goalActivity")
    select.innerHTML = ""

    this.activities.forEach((activity) => {
      const option = document.createElement("option")
      option.value = activity.id
      option.textContent = activity.name
      select.appendChild(option)
    })

    this.openModal("addGoalModal")
  }

  openAddChallengeModal() {
    const select = document.getElementById("challengeActivity")
    select.innerHTML = ""

    this.activities.forEach((activity) => {
      const option = document.createElement("option")
      option.value = activity.id
      option.textContent = activity.name
      select.appendChild(option)
    })

    this.openModal("addChallengeModal")
  }

  openAddTargetModal() {
    const select = document.getElementById("targetActivity")
    select.innerHTML = ""

    this.activities.forEach((activity) => {
      const option = document.createElement("option")
      option.value = activity.id
      option.textContent = activity.name
      select.appendChild(option)
    })

    this.openModal("addTargetModal")
  }

  addActivity(e) {
    e.preventDefault()

    const activity = {
      id: Date.now().toString(),
      name: document.getElementById("activityName").value,
      icon: document.getElementById("activityIcon").value || "🎯",
      color: document.getElementById("activityColor").value,
      category: document.getElementById("activityCategory").value,
      coins: 0,
      required: false,
      recurring: document.getElementById("activityRecurring").checked,
    }

    const minCoins = document.getElementById("activityMinCoins").value
    const maxCoins = document.getElementById("activityMaxCoins").value

    if (minCoins) activity.minCoins = Number.parseInt(minCoins)
    if (maxCoins) activity.maxCoins = Number.parseInt(maxCoins)

    this.activities.push(activity)
    this.saveData()
    this.renderToday()
    this.closeModal("addActivityModal")

    // Reset form
    e.target.reset()
    this.showNotification(`Activity "${activity.name}" added successfully!`, "success")
  }

  removeActivity(activityId) {
    if (confirm("Are you sure you want to remove this activity?")) {
      this.activities = this.activities.filter((a) => a.id !== activityId)
      this.saveData()
      this.renderToday()
      this.showNotification("Activity removed", "info")
    }
  }

  addGoal(e) {
    e.preventDefault()

    const goal = {
      id: Date.now().toString(),
      activityId: document.getElementById("goalActivity").value,
      type: document.getElementById("goalType").value,
      target: Number.parseInt(document.getElementById("goalTarget").value),
      created: new Date().toDateString(),
    }

    this.goals.push(goal)
    this.saveData()
    this.closeModal("addGoalModal")
    this.renderGoals()

    // Reset form
    e.target.reset()
    this.showNotification("Goal added successfully!", "success")
  }

  addChallenge(e) {
    e.preventDefault()

    const challenge = {
      id: Date.now().toString(),
      name: document.getElementById("challengeName").value,
      activityId: document.getElementById("challengeActivity").value,
      target: Number.parseInt(document.getElementById("challengeTarget").value),
      duration: Number.parseInt(document.getElementById("challengeDuration").value),
      startDate: new Date().toDateString(),
      progress: [],
    }

    this.challenges.push(challenge)
    this.saveData()
    this.closeModal("addChallengeModal")
    this.renderChallenges()

    // Reset form
    e.target.reset()
    this.showNotification(`Challenge "${challenge.name}" created!`, "success")
  }

  addTarget(e) {
    e.preventDefault()

    const target = {
      id: Date.now().toString(),
      activityId: document.getElementById("targetActivity").value,
      coins: Number.parseInt(document.getElementById("targetCoins").value),
      period: document.getElementById("targetPeriod").value,
      created: new Date().toDateString(),
    }

    this.targets.push(target)
    this.saveData()
    this.closeModal("addTargetModal")
    this.renderPlanning()

    // Reset form
    e.target.reset()
    this.showNotification("Planning target set!", "success")
  }

  addCategory(e) {
    e.preventDefault()

    const category = {
      id: Date.now().toString(),
      name: document.getElementById("categoryName").value,
      color: document.getElementById("categoryColor").value,
    }

    this.categories.push(category)
    this.saveData()
    this.closeModal("addCategoryModal")
    this.populateCategorySelects()

    // Reset form
    e.target.reset()
    this.showNotification(`Category "${category.name}" added!`, "success")
  }

  populateCategorySelects() {
    const selects = document.querySelectorAll("#activityCategory")
    selects.forEach((select) => {
      select.innerHTML = ""
      this.categories.forEach((category) => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        select.appendChild(option)
      })
    })
  }

  // Enhanced Streak Management
  updateStreaks() {
    this.goals.forEach((goal) => {
      const progress = this.getGoalProgress(goal)
      const streakKey = `goal_${goal.id}`

      if (progress.achieved) {
        this.streaks[streakKey] = (this.streaks[streakKey] || 0) + 1
        this.showStreakNotification(goal, this.streaks[streakKey])
      } else {
        if (this.streaks[streakKey] > 0) {
          this.showStreakBrokenNotification(goal)
        }
        this.streaks[streakKey] = 0
      }
    })

    this.saveData()
  }

  showStreakNotification(goal, streakCount) {
    const activity = this.activities.find((a) => a.id === goal.activityId)
    const message = `🔥 ${streakCount} day streak for ${activity.name}!`
    this.showNotification(message, "success")
  }

  checkStreaks() {
    // Check if any streaks were broken due to new day
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    this.goals.forEach((goal) => {
      if (goal.type === "daily") {
        const yesterdayData = this.dailyData[yesterday]
        if (!yesterdayData || !this.checkGoalAchieved(goal, yesterday)) {
          const streakKey = `goal_${goal.id}`
          if (this.streaks[streakKey] > 0) {
            this.showStreakBrokenNotification(goal)
          }
        }
      }
    })
  }

  showStreakBrokenNotification(goal) {
    const activity = this.activities.find((a) => a.id === goal.activityId)
    const message = `💔 Your ${activity.name} streak was broken! Start fresh today.`
    this.showNotification(message, "warning")
  }

  // Enhanced Rendering Methods
  renderGoals() {
    const container = document.getElementById("goalsList")
    container.innerHTML = ""

    if (this.goals.length === 0) {
      container.innerHTML = '<p class="text-center">No goals set yet. Create your first goal!</p>'
      return
    }

    this.goals.forEach((goal) => {
      const activity = this.activities.find((a) => a.id === goal.activityId)
      if (!activity) return

      const progress = this.getGoalProgress(goal)
      const div = document.createElement("div")
      div.className = "goal-card"
      div.innerHTML = `
                <div class="goal-header">
                    <h3>${activity.icon} ${activity.name} - ${goal.type} goal</h3>
                    <button class="secondary-btn" onclick="app.removeGoal('${goal.id}')">Remove</button>
                </div>
                <p>Target: ${goal.target} coins per ${goal.type}</p>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, (progress.current / goal.target) * 100)}%"></div>
                    </div>
                    <p>${progress.current}/${goal.target} coins (${progress.achieved ? "Achieved!" : "In Progress"})</p>
                </div>
            `
      container.appendChild(div)
    })

    this.renderStreaks()
    this.renderPredictions()
  }

  renderStreaks() {
    const container = document.getElementById("streaksList")
    container.innerHTML = ""

    const activeStreaks = Object.keys(this.streaks).filter((key) => this.streaks[key] > 0)

    if (activeStreaks.length === 0) {
      container.innerHTML =
        '<p class="text-center">No active streaks. Complete your goals to start building streaks!</p>'
      return
    }

    activeStreaks.forEach((streakKey) => {
      const goalId = streakKey.replace("goal_", "")
      const goal = this.goals.find((g) => g.id === goalId)
      if (!goal) return

      const activity = this.activities.find((a) => a.id === goal.activityId)
      if (!activity) return

      const streakCount = this.streaks[streakKey]
      const div = document.createElement("div")
      div.className = "streak-card"
      div.innerHTML = `
                <div class="streak-info">
                    <h4>${activity.icon} ${activity.name}</h4>
                    <p class="streak-count">${streakCount} day${streakCount !== 1 ? "s" : ""} streak!</p>
                    <p class="streak-goal">${goal.target} coins ${goal.type}</p>
                </div>
                <div class="streak-badge">🔥</div>
            `
      container.appendChild(div)
    })
  }

  renderPredictions() {
    const container = document.getElementById("predictionsList")
    container.innerHTML = ""

    this.goals.forEach((goal) => {
      const activity = this.activities.find((a) => a.id === goal.activityId)
      if (!activity) return

      const prediction = this.calculateGoalPrediction(goal)
      const div = document.createElement("div")
      div.className = "prediction-card"
      div.innerHTML = `
                <div class="prediction-header">
                    <h4>${activity.icon} ${activity.name}</h4>
                    <span class="prediction-percentage ${prediction.onTrack ? "success" : "warning"}">
                        ${prediction.percentage}%
                    </span>
                </div>
                <p>${prediction.message}</p>
                <div class="prediction-bar">
                    <div class="prediction-fill" style="width: ${prediction.percentage}%"></div>
                </div>
            `
      container.appendChild(div)
    })
  }

  calculateGoalPrediction(goal) {
    const progress = this.getGoalProgress(goal)
    const percentage = Math.min(100, (progress.current / goal.target) * 100)

    let message = ""
    let onTrack = true

    if (goal.type === "weekly") {
      const daysInWeek = 7
      const currentDay = new Date().getDay() + 1
      const expectedProgress = (currentDay / daysInWeek) * goal.target

      if (progress.current >= expectedProgress * 0.8) {
        message = `On track! At this pace, you'll achieve ${Math.round((progress.current / currentDay) * daysInWeek)} coins this week.`
      } else {
        onTrack = false
        const needed = Math.ceil((goal.target - progress.current) / (daysInWeek - currentDay + 1))
        message = `Behind schedule. Need ${needed} coins per day to reach your goal.`
      }
    } else if (goal.type === "monthly") {
      const now = new Date()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const currentDay = now.getDate()
      const expectedProgress = (currentDay / daysInMonth) * goal.target

      if (progress.current >= expectedProgress * 0.8) {
        message = `On track! Projected to reach ${Math.round((progress.current / currentDay) * daysInMonth)} coins this month.`
      } else {
        onTrack = false
        const needed = Math.ceil((goal.target - progress.current) / (daysInMonth - currentDay + 1))
        message = `Behind schedule. Need ${needed} coins per day to reach your goal.`
      }
    } else {
      message = progress.achieved ? "Goal achieved today!" : `Need ${goal.target - progress.current} more coins today.`
    }

    return { percentage, message, onTrack }
  }

  renderChallenges() {
    const container = document.getElementById("challengesList")
    container.innerHTML = ""

    if (this.challenges.length === 0) {
      container.innerHTML = '<p class="text-center">No challenges created yet. Create your first challenge!</p>'
      return
    }

    this.challenges.forEach((challenge) => {
      const activity = this.activities.find((a) => a.id === challenge.activityId)
      if (!activity) return

      const progress = this.getChallengeProgress(challenge)
      const div = document.createElement("div")
      div.className = "challenge-card"
      div.innerHTML = `
                <div class="challenge-header">
                    <h3>${challenge.name}</h3>
                    <button class="secondary-btn" onclick="app.removeChallenge('${challenge.id}')">Remove</button>
                </div>
                <p>${activity.icon} ${activity.name} - ${challenge.target} coins per week</p>
                <p>Duration: ${challenge.duration} weeks</p>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                    <p>Week ${progress.currentWeek}/${challenge.duration} - ${progress.weeklyProgress}/${challenge.target} coins this week</p>
                    <p class="${progress.onTrack ? "text-success" : "text-warning"}">
                        ${progress.onTrack ? "✅ On track!" : "⚠️ Behind schedule"}
                    </p>
                </div>
            `
      container.appendChild(div)
    })
  }

  renderPlanning() {
    const container = document.getElementById("targetsList")
    container.innerHTML = ""

    if (this.targets.length === 0) {
      container.innerHTML = '<p class="text-center">No planning targets set. Create your first target!</p>'
      return
    }

    this.targets.forEach((target) => {
      const activity = this.activities.find((a) => a.id === target.activityId)
      if (!activity) return

      const progress = this.getTargetProgress(target)
      const div = document.createElement("div")
      div.className = "target-card"
      div.innerHTML = `
                <div class="target-header">
                    <h3>${activity.icon} ${activity.name}</h3>
                    <button class="secondary-btn" onclick="app.removeTarget('${target.id}')">Remove</button>
                </div>
                <p>Target: ${target.coins} coins this ${target.period}</p>
                <div class="target-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                    <p>${progress.current}/${target.coins} coins (${progress.percentage.toFixed(1)}%)</p>
                    <p class="target-recommendation">${progress.recommendation}</p>
                </div>
            `
      container.appendChild(div)
    })

    this.renderRecommendations()
  }

  renderRecommendations() {
    const container = document.getElementById("recommendationsList")
    container.innerHTML = ""

    const recommendations = this.generateRecommendations()

    if (recommendations.length === 0) {
      container.innerHTML =
        '<p class="text-center">No recommendations available. Set some targets to get personalized advice!</p>'
      return
    }

    recommendations.forEach((rec) => {
      const div = document.createElement("div")
      div.className = `recommendation-card ${rec.priority}`
      div.innerHTML = `
                <div class="recommendation-icon">${rec.icon}</div>
                <div class="recommendation-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.message}</p>
                </div>
            `
      container.appendChild(div)
    })
  }

  generateRecommendations() {
    const recommendations = []

    this.targets.forEach((target) => {
      const activity = this.activities.find((a) => a.id === target.activityId)
      const progress = this.getTargetProgress(target)

      if (progress.percentage < 50) {
        recommendations.push({
          icon: "⚠️",
          title: `${activity.name} Target Behind`,
          message: `You need ${Math.ceil(progress.dailyNeeded)} coins per day to reach your ${target.period}ly target.`,
          priority: "high",
        })
      } else if (progress.percentage > 80) {
        recommendations.push({
          icon: "🎯",
          title: `${activity.name} On Track`,
          message: `Great progress! You're likely to exceed your target at this pace.`,
          priority: "low",
        })
      }
    })

    // Add mood-based recommendations
    const moodInsights = this.analyzeMoodPatterns()
    if (moodInsights.length > 0) {
      recommendations.push(...moodInsights)
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  getTargetProgress(target) {
    let current = 0
    let totalDays = 0
    let remainingDays = 0

    if (target.period === "week") {
      const weekStart = this.getWeekStart(new Date())
      current = this.getWeeklyTotal(target.activityId, weekStart)
      totalDays = 7
      remainingDays = 7 - new Date().getDay()
    } else if (target.period === "month") {
      const monthStart = this.getMonthStart(new Date())
      current = this.getMonthlyTotal(target.activityId, monthStart)
      const now = new Date()
      totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      remainingDays = totalDays - now.getDate() + 1
    }

    const percentage = Math.min(100, (current / target.coins) * 100)
    const dailyNeeded = remainingDays > 0 ? (target.coins - current) / remainingDays : 0

    let recommendation = ""
    if (percentage >= 100) {
      recommendation = "🎉 Target achieved! Consider setting a higher goal."
    } else if (dailyNeeded <= 0) {
      recommendation = "✅ Target already met!"
    } else {
      recommendation = `📅 Allocate ${Math.ceil(dailyNeeded)} coins per day to reach your target.`
    }

    return { current, percentage, dailyNeeded, recommendation }
  }

  renderHistory() {
    const period = document.getElementById("historyPeriod").value
    const canvas = document.getElementById("historyChart")
    const ctx = canvas.getContext("2d")

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = 400

    const data = this.getHistoryData(period)
    this.drawChart(ctx, data, canvas.width, canvas.height)
    this.renderCalendar()
    this.renderTrendsAnalysis()
  }

  renderTrendsAnalysis() {
    const container = document.getElementById("trendsAnalysis")
    const trends = this.analyzeTrends()

    container.innerHTML = "<h3>📈 Trends & Insights</h3>"

    trends.forEach((trend) => {
      const div = document.createElement("div")
      div.className = `trend-item ${trend.type}`
      div.innerHTML = `
                <div class="trend-icon">${trend.icon}</div>
                <div class="trend-content">
                    <h4>${trend.title}</h4>
                    <p>${trend.description}</p>
                </div>
            `
      container.appendChild(div)
    })
  }

  analyzeTrends() {
    const trends = []
    const recentDays = this.getRecentDays(14)
    const olderDays = this.getRecentDays(28).slice(14)

    // Analyze activity trends
    this.activities.forEach((activity) => {
      const recentAvg = this.getAverageForDays(activity.id, recentDays)
      const olderAvg = this.getAverageForDays(activity.id, olderDays)

      if (recentAvg > olderAvg * 1.2) {
        trends.push({
          icon: "📈",
          title: `${activity.name} Increasing`,
          description: `You've been spending ${(((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1)}% more time on ${activity.name} recently.`,
          type: "positive",
        })
      } else if (recentAvg < olderAvg * 0.8) {
        trends.push({
          icon: "📉",
          title: `${activity.name} Decreasing`,
          description: `You've been spending ${(((olderAvg - recentAvg) / olderAvg) * 100).toFixed(1)}% less time on ${activity.name} recently.`,
          type: "negative",
        })
      }
    })

    return trends.slice(0, 5) // Limit to top 5 trends
  }

  getAverageForDays(activityId, days) {
    const values = days.map((day) => this.dailyData[day]?.activities?.[activityId] || 0).filter((val) => val > 0)

    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  renderStats() {
    this.showChartView()
  }

  showChartView() {
    document.getElementById("chartViewBtn").classList.add("active")
    document.getElementById("tableViewBtn").classList.remove("active")
    document.getElementById("statsChart").classList.remove("hidden")
    document.getElementById("statsTable").classList.add("hidden")

    this.renderStatsChart()
    this.renderCategoryChart()
    this.renderMoodAnalysis()
    this.renderDailySummary()
  }

  showTableView() {
    document.getElementById("tableViewBtn").classList.add("active")
    document.getElementById("chartViewBtn").classList.remove("active")
    document.getElementById("statsTable").classList.remove("hidden")
    document.getElementById("statsChart").classList.add("hidden")

    this.renderStatsTable()
    this.renderCategoryChart()
    this.renderMoodAnalysis()
    this.renderDailySummary()
  }

  renderStatsChart() {
    const canvas = document.getElementById("statsChart")
    const ctx = canvas.getContext("2d")

    canvas.width = canvas.offsetWidth
    canvas.height = 400

    const data = this.getStatsData()
    this.drawStatsChart(ctx, data, canvas.width, canvas.height)
  }

  renderCategoryChart() {
    const canvas = document.getElementById("categoryChart")
    const ctx = canvas.getContext("2d")

    canvas.width = canvas.offsetWidth
    canvas.height = 300

    const categoryData = this.getCategoryData()
    this.drawCategoryChart(ctx, categoryData, canvas.width, canvas.height)
  }

  getCategoryData() {
    const categoryTotals = {}
    this.categories.forEach((category) => {
      categoryTotals[category.id] = 0
    })

    Object.values(this.dailyData).forEach((dayData) => {
      if (dayData.activities) {
        Object.keys(dayData.activities).forEach((activityId) => {
          const activity = this.activities.find((a) => a.id === activityId)
          if (activity) {
            const categoryId = activity.category || "other"
            categoryTotals[categoryId] += dayData.activities[activityId]
          }
        })
      }
    })

    return categoryTotals
  }

  drawCategoryChart(ctx, data, width, height) {
    ctx.clearRect(0, 0, width, height)

    const categories = Object.keys(data).filter((key) => data[key] > 0)
    if (categories.length === 0) {
      ctx.fillStyle = "#6b7280"
      ctx.font = "16px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("No data available", width / 2, height / 2)
      return
    }

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 3

    const total = Object.values(data).reduce((sum, val) => sum + val, 0)

    let currentAngle = -Math.PI / 2

    categories.forEach((categoryId) => {
      const category = this.categories.find((c) => c.id === categoryId)
      const value = data[categoryId]
      const percentage = value / total
      const sliceAngle = percentage * 2 * Math.PI

      ctx.fillStyle = category.color
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius + 30)
      const labelY = centerY + Math.sin(labelAngle) * (radius + 30)

      ctx.fillStyle = "#1f2937"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(category.name, labelX, labelY)
      ctx.fillText(`${(percentage * 100).toFixed(1)}%`, labelX, labelY + 15)

      currentAngle += sliceAngle
    })
  }

  renderMoodAnalysis() {
    const container = document.getElementById("moodInsights")
    const insights = this.analyzeMoodPatterns()

    container.innerHTML = ""

    if (insights.length === 0) {
      container.innerHTML = '<p class="text-center">Complete more daily surveys to see mood insights!</p>'
      return
    }

    insights.forEach((insight) => {
      const div = document.createElement("div")
      div.className = `mood-insight ${insight.priority}`
      div.innerHTML = `
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.message}</p>
                </div>
            `
      container.appendChild(div)
    })
  }

  analyzeMoodPatterns() {
    const insights = []
    const moodData = this.getMoodData()

    if (Object.keys(moodData).length === 0) return insights

    // Find activities with consistently high ratings
    Object.keys(moodData).forEach((activityId) => {
      const activity = this.activities.find((a) => a.id === activityId)
      const ratings = moodData[activityId]
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length

      if (avgRating >= 8 && ratings.length >= 3) {
        insights.push({
          icon: "😊",
          title: `${activity.name} Boosts Your Mood`,
          message: `You consistently rate ${activity.name} highly (${avgRating.toFixed(1)}/10). Consider spending more time on this activity!`,
          priority: "high",
        })
      } else if (avgRating <= 4 && ratings.length >= 3) {
        insights.push({
          icon: "😔",
          title: `${activity.name} Affects Your Mood`,
          message: `Your ratings for ${activity.name} are low (${avgRating.toFixed(1)}/10). Consider reducing time or finding ways to improve this experience.`,
          priority: "medium",
        })
      }
    })

    return insights
  }

  getMoodData() {
    const moodData = {}

    Object.values(this.dailyData).forEach((dayData) => {
      if (dayData.survey) {
        Object.keys(dayData.survey).forEach((activityId) => {
          if (!moodData[activityId]) {
            moodData[activityId] = []
          }
          moodData[activityId].push(dayData.survey[activityId].rating)
        })
      }
    })

    return moodData
  }

  renderStatsTable() {
    const container = document.getElementById("statsTable")
    const data = this.getStatsData()

    let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Activity</th>
                        <th>Total Coins</th>
                        <th>Average/Day</th>
                        <th>Average Rating</th>
                        <th>Best Day</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
        `

    Object.keys(data.activities).forEach((activityId) => {
      const activity = this.activities.find((a) => a.id === activityId)
      const category = this.categories.find((c) => c.id === activity?.category)
      const stats = data.activities[activityId]

      tableHTML += `
                <tr>
                    <td>${activity ? activity.icon + " " + activity.name : activityId}</td>
                    <td>${stats.total}</td>
                    <td>${stats.average.toFixed(1)}</td>
                    <td>${stats.avgRating ? stats.avgRating.toFixed(1) : "N/A"}</td>
                    <td>${stats.bestDay ? new Date(stats.bestDay).toLocaleDateString() : "N/A"}</td>
                    <td><span style="color: ${category?.color || "#6b7280"}">${category?.name || "Other"}</span></td>
                </tr>
            `
    })

    tableHTML += "</tbody></table>"
    container.innerHTML = tableHTML
  }

  renderDailySummary() {
    const container = document.getElementById("dailySummary")
    const today = new Date().toDateString()
    const todayData = this.dailyData[today]

    if (!todayData || !todayData.activities) {
      container.innerHTML = "<p>Complete today's activities to see your summary.</p>"
      return
    }

    const activities = todayData.activities
    const survey = todayData.survey || {}

    // Find most time-consuming activity
    const maxActivity = Object.keys(activities).reduce((a, b) => (activities[a] > activities[b] ? a : b))

    // Find best and worst rated activities
    let bestActivity = null,
      worstActivity = null
    let bestRating = 0,
      worstRating = 11

    Object.keys(survey).forEach((activityId) => {
      const rating = survey[activityId].rating
      if (rating > bestRating) {
        bestRating = rating
        bestActivity = activityId
      }
      if (rating < worstRating) {
        worstRating = rating
        worstActivity = activityId
      }
    })

    const getActivityName = (id) => this.activities.find((a) => a.id === id)?.name || id

    container.innerHTML = `
            <div class="summary-stats">
                <p><strong>Most time spent:</strong> ${getActivityName(maxActivity)} (${activities[maxActivity]} coins)</p>
                ${bestActivity ? `<p><strong>Highest rated:</strong> ${getActivityName(bestActivity)} (${bestRating}/10)</p>` : ""}
                ${worstActivity ? `<p><strong>Needs attention:</strong> ${getActivityName(worstActivity)} (${worstRating}/10)</p>` : ""}
                <p><strong>Total activities:</strong> ${Object.keys(activities).length}</p>
                ${todayData.notes ? `<p><strong>Your notes:</strong> "${todayData.notes}"</p>` : ""}
            </div>
        `
  }

  renderCalendar() {
    const container = document.getElementById("calendarView")
    container.innerHTML = ""

    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Create calendar header
    const header = document.createElement("div")
    header.className = "calendar-header"
    header.innerHTML = `
            <h3>${today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
        `
    container.appendChild(header)

    // Create day labels
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const labelsContainer = document.createElement("div")
    labelsContainer.className = "calendar-labels"
    dayLabels.forEach((label) => {
      const dayLabel = document.createElement("div")
      dayLabel.className = "calendar-day-label"
      dayLabel.textContent = label
      labelsContainer.appendChild(dayLabel)
    })
    container.appendChild(labelsContainer)

    // Create calendar grid
    const grid = document.createElement("div")
    grid.className = "calendar-grid"

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div")
      emptyDay.className = "calendar-day empty"
      grid.appendChild(emptyDay)
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day).toDateString()
      const dayElement = document.createElement("div")
      dayElement.className = "calendar-day"
      dayElement.textContent = day

      const dayData = this.dailyData[date]
      if (dayData) {
        dayElement.classList.add("has-data")

        // Add mood indicator
        if (dayData.survey) {
          const avgMood = this.getAverageMood(dayData.survey)
          const moodEmoji = this.getMoodEmoji(avgMood)
          const moodIndicator = document.createElement("div")
          moodIndicator.className = "mood-indicator"
          moodIndicator.textContent = moodEmoji
          dayElement.appendChild(moodIndicator)
        }

        // Add coin summary
        if (dayData.activities) {
          const totalCoins = Object.values(dayData.activities).reduce((a, b) => a + b, 0)
          const coinIndicator = document.createElement("div")
          coinIndicator.className = "coin-indicator"
          coinIndicator.textContent = `${totalCoins}🪙`
          dayElement.appendChild(coinIndicator)
        }

        dayElement.addEventListener("click", () => this.showDayDetails(date))
      }

      if (date === today.toDateString()) {
        dayElement.classList.add("today")
      }

      grid.appendChild(dayElement)
    }

    container.appendChild(grid)
  }

  getAverageMood(survey) {
    const moods = Object.values(survey)
      .map((s) => s.mood)
      .filter((m) => m)
    return moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 3
  }

  getMoodEmoji(avgMood) {
    if (avgMood >= 4.5) return "🤩"
    if (avgMood >= 3.5) return "😊"
    if (avgMood >= 2.5) return "🙂"
    if (avgMood >= 1.5) return "😐"
    return "😢"
  }

  showDayDetails(date) {
    const data = this.dailyData[date]
    if (!data) return

    const modal = document.getElementById("dayDetailsModal")
    const title = document.getElementById("dayDetailsTitle")
    const content = document.getElementById("dayDetailsContent")

    title.textContent = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    let detailsHTML = ""

    // Time allocation
    if (data.activities) {
      detailsHTML += '<h4>⏰ Time Allocation</h4><div class="day-activities">'
      Object.keys(data.activities).forEach((activityId) => {
        const activity = this.activities.find((a) => a.id === activityId)
        const coins = data.activities[activityId]
        detailsHTML += `
                    <div class="day-activity">
                        <span class="activity-icon" style="background-color: ${activity?.color || "#6b7280"}">
                            ${activity?.icon || "❓"}
                        </span>
                        <span class="activity-name">${activity?.name || activityId}</span>
                        <span class="activity-coins">${coins} coins</span>
                    </div>
                `
      })
      detailsHTML += "</div>"
    }

    // Mood and ratings
    if (data.survey) {
      detailsHTML += '<h4>😊 Mood & Ratings</h4><div class="day-survey">'
      Object.keys(data.survey).forEach((activityId) => {
        const activity = this.activities.find((a) => a.id === activityId)
        const survey = data.survey[activityId]
        const moodEmojis = ["", "😢", "😐", "🙂", "😊", "🤩"]
        detailsHTML += `
                    <div class="survey-item">
                        <span class="activity-name">${activity?.name || activityId}</span>
                        <span class="mood">${moodEmojis[survey.mood]} ${survey.rating}/10</span>
                    </div>
                `
      })
      detailsHTML += "</div>"
    }

    // Notes
    if (data.notes) {
      detailsHTML += `
                <h4>📝 Notes</h4>
                <div class="day-notes">${data.notes}</div>
            `
    }

    // Lock status
    if (data.locked) {
      detailsHTML += '<div class="lock-status">🔒 This day is completed and locked</div>'
    }

    content.innerHTML = detailsHTML
    this.openModal("dayDetailsModal")
  }

  showSeasonalOverview() {
    const modal = document.getElementById("seasonalModal")
    const content = document.getElementById("seasonalContent")

    const seasonalData = this.getSeasonalData()

    let overviewHTML = "<h3>🍂 Seasonal Overview - Last 3 Months</h3>"

    // Monthly breakdown
    overviewHTML += '<div class="seasonal-months">'
    seasonalData.months.forEach((month) => {
      overviewHTML += `
                <div class="month-summary">
                    <h4>${month.name}</h4>
                    <p>Total days tracked: ${month.daysTracked}</p>
                    <p>Average coins per day: ${month.avgCoins.toFixed(1)}</p>
                    <p>Most active category: ${month.topCategory}</p>
                </div>
            `
    })
    overviewHTML += "</div>"

    // Trends
    overviewHTML += '<h4>📈 Seasonal Trends</h4><div class="seasonal-trends">'
    seasonalData.trends.forEach((trend) => {
      overviewHTML += `
                <div class="trend-item">
                    <span class="trend-icon">${trend.icon}</span>
                    <span class="trend-text">${trend.text}</span>
                </div>
            `
    })
    overviewHTML += "</div>"

    content.innerHTML = overviewHTML
    this.openModal("seasonalModal")
  }

  getSeasonalData() {
    const now = new Date()
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    const months = []
    const trends = []

    // Analyze last 3 months
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

      const monthData = this.getMonthData(monthDate)
      months.unshift({
        name: monthName,
        daysTracked: monthData.daysTracked,
        avgCoins: monthData.avgCoins,
        topCategory: monthData.topCategory,
      })
    }

    // Generate trends
    if (months.length >= 2) {
      const latest = months[months.length - 1]
      const previous = months[months.length - 2]

      if (latest.avgCoins > previous.avgCoins) {
        trends.push({
          icon: "📈",
          text: `Your daily activity increased by ${(latest.avgCoins - previous.avgCoins).toFixed(1)} coins compared to last month`,
        })
      } else if (latest.avgCoins < previous.avgCoins) {
        trends.push({
          icon: "📉",
          text: `Your daily activity decreased by ${(previous.avgCoins - latest.avgCoins).toFixed(1)} coins compared to last month`,
        })
      }
    }

    return { months, trends }
  }

  getMonthData(monthDate) {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    let daysTracked = 0
    let totalCoins = 0
    const categoryTotals = {}

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day).toDateString()
      const dayData = this.dailyData[date]

      if (dayData && dayData.activities) {
        daysTracked++
        const dayCoins = Object.values(dayData.activities).reduce((a, b) => a + b, 0)
        totalCoins += dayCoins

        // Track category totals
        Object.keys(dayData.activities).forEach((activityId) => {
          const activity = this.activities.find((a) => a.id === activityId)
          const categoryId = activity?.category || "other"
          categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + dayData.activities[activityId]
        })
      }
    }

    const avgCoins = daysTracked > 0 ? totalCoins / daysTracked : 0
    const topCategoryId = Object.keys(categoryTotals).reduce(
      (a, b) => (categoryTotals[a] > categoryTotals[b] ? a : b),
      "other",
    )
    const topCategory = this.categories.find((c) => c.id === topCategoryId)?.name || "Other"

    return { daysTracked, avgCoins, topCategory }
  }

  // Data Processing Methods
  getGoalProgress(goal) {
    const today = new Date().toDateString()
    let current = 0
    let achieved = false

    if (goal.type === "daily") {
      const todayData = this.dailyData[today]
      current = todayData?.activities?.[goal.activityId] || 0
      achieved = current >= goal.target
    } else if (goal.type === "weekly") {
      const weekStart = this.getWeekStart(new Date())
      current = this.getWeeklyTotal(goal.activityId, weekStart)
      achieved = current >= goal.target
    } else if (goal.type === "monthly") {
      const monthStart = this.getMonthStart(new Date())
      current = this.getMonthlyTotal(goal.activityId, monthStart)
      achieved = current >= goal.target
    }

    return { current, achieved }
  }

  getChallengeProgress(challenge) {
    const startDate = new Date(challenge.startDate)
    const today = new Date()
    const weeksPassed = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000))
    const currentWeek = Math.min(weeksPassed + 1, challenge.duration)

    const weekStart = this.getWeekStart(today)
    const weeklyProgress = this.getWeeklyTotal(challenge.activityId, weekStart)

    const totalExpected = challenge.target * currentWeek
    const totalActual = this.getTotalSinceDate(challenge.activityId, startDate)

    return {
      currentWeek,
      weeklyProgress,
      percentage: Math.min(100, (totalActual / (challenge.target * challenge.duration)) * 100),
      onTrack: totalActual >= totalExpected * 0.8, // 80% threshold
    }
  }

  getHistoryData(period) {
    const data = { labels: [], datasets: {} }
    const today = new Date()
    let days = 7

    if (period === "month") days = 30
    else if (period === "season") days = 90
    else if (period === "all") days = Object.keys(this.dailyData).length

    // Get last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toDateString()
      data.labels.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }))

      const dayData = this.dailyData[dateStr]
      if (dayData && dayData.activities) {
        Object.keys(dayData.activities).forEach((activityId) => {
          if (!data.datasets[activityId]) {
            data.datasets[activityId] = []
          }
          data.datasets[activityId].push(dayData.activities[activityId])
        })
      }

      // Fill missing data with 0
      Object.keys(data.datasets).forEach((activityId) => {
        if (data.datasets[activityId].length < data.labels.length) {
          data.datasets[activityId].push(0)
        }
      })
    }

    return data
  }

  getStatsData() {
    const stats = { activities: {} }

    Object.keys(this.dailyData).forEach((date) => {
      const dayData = this.dailyData[date]
      if (!dayData.activities) return

      Object.keys(dayData.activities).forEach((activityId) => {
        if (!stats.activities[activityId]) {
          stats.activities[activityId] = {
            total: 0,
            days: 0,
            ratings: [],
            bestDay: null,
            bestDayCoins: 0,
          }
        }

        const coins = dayData.activities[activityId]
        stats.activities[activityId].total += coins
        stats.activities[activityId].days++

        if (coins > stats.activities[activityId].bestDayCoins) {
          stats.activities[activityId].bestDayCoins = coins
          stats.activities[activityId].bestDay = date
        }

        if (dayData.survey && dayData.survey[activityId]) {
          stats.activities[activityId].ratings.push(dayData.survey[activityId].rating)
        }
      })
    })

    // Calculate averages
    Object.keys(stats.activities).forEach((activityId) => {
      const activity = stats.activities[activityId]
      activity.average = activity.total / activity.days
      if (activity.ratings.length > 0) {
        activity.avgRating = activity.ratings.reduce((a, b) => a + b, 0) / activity.ratings.length
      }
    })

    return stats
  }

  getWeeklyTotal(activityId, weekStart) {
    let total = 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toDateString()
      const dayData = this.dailyData[dateStr]
      if (dayData && dayData.activities && dayData.activities[activityId]) {
        total += dayData.activities[activityId]
      }
    }
    return total
  }

  getMonthlyTotal(activityId, monthStart) {
    let total = 0
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

    for (let date = new Date(monthStart); date <= monthEnd; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toDateString()
      const dayData = this.dailyData[dateStr]
      if (dayData && dayData.activities && dayData.activities[activityId]) {
        total += dayData.activities[activityId]
      }
    }
    return total
  }

  getTotalSinceDate(activityId, startDate) {
    let total = 0
    const today = new Date()

    for (let date = new Date(startDate); date <= today; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toDateString()
      const dayData = this.dailyData[dateStr]
      if (dayData && dayData.activities && dayData.activities[activityId]) {
        total += dayData.activities[activityId]
      }
    }
    return total
  }

  getWeekStart(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  getMonthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  checkGoalAchieved(goal, date) {
    const dayData = this.dailyData[date]
    if (!dayData || !dayData.activities) return false

    const coins = dayData.activities[goal.activityId] || 0
    return coins >= goal.target
  }

  // Chart Drawing Methods
  drawChart(ctx, data, width, height) {
    ctx.clearRect(0, 0, width, height)

    const padding = 60
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    if (data.labels.length === 0) {
      ctx.fillStyle = "#6b7280"
      ctx.font = "16px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("No data available", width / 2, height / 2)
      return
    }

    // Find max value
    let maxValue = 0
    Object.keys(data.datasets).forEach((activityId) => {
      const max = Math.max(...data.datasets[activityId])
      if (max > maxValue) maxValue = max
    })

    if (maxValue === 0) maxValue = 24

    // Draw axes
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw grid lines and labels
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "right"

    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      const value = maxValue - (maxValue / 5) * i

      // Grid line
      ctx.strokeStyle = "#f3f4f6"
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()

      // Label
      ctx.fillText(Math.round(value), padding - 10, y + 4)
    }

    // X-axis labels
    ctx.textAlign = "center"
    data.labels.forEach((label, index) => {
      const x = padding + (chartWidth / (data.labels.length - 1)) * index
      ctx.fillText(label, x, height - padding + 20)
    })

    // Draw lines for each activity
    let colorIndex = 0

    Object.keys(data.datasets).forEach((activityId) => {
      const activity = this.activities.find((a) => a.id === activityId)
      const color = activity ? activity.color : this.getDefaultColor(colorIndex)
      const dataset = data.datasets[activityId]

      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = 2

      ctx.beginPath()
      dataset.forEach((value, index) => {
        const x = padding + (chartWidth / (data.labels.length - 1)) * index
        const y = height - padding - (value / maxValue) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Draw point
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()
        ctx.beginPath()
      })
      ctx.stroke()

      colorIndex++
    })

    // Draw legend
    let legendY = 20
    colorIndex = 0
    Object.keys(data.datasets).forEach((activityId) => {
      const activity = this.activities.find((a) => a.id === activityId)
      const color = activity ? activity.color : this.getDefaultColor(colorIndex)
      const name = activity ? activity.name : activityId

      ctx.fillStyle = color
      ctx.fillRect(width - 150, legendY, 12, 12)

      ctx.fillStyle = "#1f2937"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(name, width - 135, legendY + 9)

      legendY += 20
      colorIndex++
    })
  }

  drawStatsChart(ctx, data, width, height) {
    ctx.clearRect(0, 0, width, height)

    const activities = Object.keys(data.activities)
    if (activities.length === 0) {
      ctx.fillStyle = "#6b7280"
      ctx.font = "16px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("No data available", width / 2, height / 2)
      return
    }

    // Draw pie chart of total time allocation
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 3

    const totalCoins = Object.values(data.activities).reduce((sum, activity) => sum + activity.total, 0)

    let currentAngle = -Math.PI / 2

    activities.forEach((activityId, index) => {
      const activity = this.activities.find((a) => a.id === activityId)
      const stats = data.activities[activityId]
      const percentage = stats.total / totalCoins
      const sliceAngle = percentage * 2 * Math.PI

      const color = activity ? activity.color : this.getDefaultColor(index)

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius + 30)
      const labelY = centerY + Math.sin(labelAngle) * (radius + 30)

      ctx.fillStyle = "#1f2937"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(activity ? activity.name : activityId, labelX, labelY)
      ctx.fillText(`${(percentage * 100).toFixed(1)}%`, labelX, labelY + 15)

      currentAngle += sliceAngle
    })
  }

  getDefaultColor(index) {
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"]
    return colors[index % colors.length]
  }

  // Utility Methods
  removeGoal(goalId) {
    if (confirm("Are you sure you want to remove this goal?")) {
      this.goals = this.goals.filter((g) => g.id !== goalId)
      delete this.streaks[`goal_${goalId}`]
      this.saveData()
      this.renderGoals()
      this.showNotification("Goal removed", "info")
    }
  }

  removeChallenge(challengeId) {
    if (confirm("Are you sure you want to remove this challenge?")) {
      this.challenges = this.challenges.filter((c) => c.id !== challengeId)
      this.saveData()
      this.renderChallenges()
      this.showNotification("Challenge removed", "info")
    }
  }

  removeTarget(targetId) {
    if (confirm("Are you sure you want to remove this target?")) {
      this.targets = this.targets.filter((t) => t.id !== targetId)
      this.saveData()
      this.renderPlanning()
      this.showNotification("Target removed", "info")
    }
  }

  loadTodaysData() {
    const today = new Date().toDateString()
    const todayData = this.dailyData[today]

    if (todayData && todayData.activities && !todayData.locked) {
      // Restore today's coin allocation
      Object.keys(todayData.activities).forEach((activityId) => {
        const activity = this.activities.find((a) => a.id === activityId)
        if (activity) {
          activity.coins = todayData.activities[activityId]
        }
      })
      this.renderToday()
    }
  }

  exportData() {
    const data = {
      activities: this.activities,
      dailyData: this.dailyData,
      goals: this.goals,
      challenges: this.challenges,
      streaks: this.streaks,
      categories: this.categories,
      targets: this.targets,
      settings: this.settings,
      personalRecords: this.personalRecords,
      exportDate: new Date().toISOString(),
      version: "2.0",
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `time-coin-tracker-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
    this.showNotification("Data exported successfully!", "success")
  }

  importData() {
    document.getElementById("importFileInput").click()
  }

  handleFileImport(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)

        if (confirm("This will replace all your current data. Are you sure?")) {
          this.activities = importedData.activities || this.getDefaultActivities()
          this.dailyData = importedData.dailyData || {}
          this.goals = importedData.goals || []
          this.challenges = importedData.challenges || []
          this.streaks = importedData.streaks || {}
          this.categories = importedData.categories || this.getDefaultCategories()
          this.targets = importedData.targets || []
          this.settings = importedData.settings || {
            enableReminders: true,
            reminderTime: "20:00",
          }
          this.personalRecords = importedData.personalRecords || {}

          this.saveData()
          this.renderToday()
          this.populateCategorySelects()

          this.showNotification("Data imported successfully!", "success")
        }
      } catch (error) {
        this.showNotification("Error importing data. Please check the file format.", "error")
        console.error("Import error:", error)
      }
    }
    reader.readAsText(file)

    // Reset file input
    event.target.value = ""
  }

  clearAllData() {
    if (confirm("This will permanently delete all your data. Are you sure?")) {
      if (confirm("This action cannot be undone. Really delete everything?")) {
        localStorage.removeItem("timeCoinTracker")
        this.showNotification("All data cleared. Reloading...", "info")
        setTimeout(() => location.reload(), 1000)
      }
    }
  }

  // Notification System
  showNotification(message, type = "info") {
    const container = document.getElementById("notificationContainer")
    const notification = document.createElement("div")
    notification.className = `notification ${type}`

    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
      reminder: "⏰",
    }

    notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `

    container.appendChild(notification)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 5000)

    // Animate in
    setTimeout(() => notification.classList.add("show"), 10)
  }

  handleKeyboard(event) {
    // Keyboard shortcuts for accessibility
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "1":
          event.preventDefault()
          this.switchTab("today")
          break
        case "2":
          event.preventDefault()
          this.switchTab("history")
          break
        case "3":
          event.preventDefault()
          this.switchTab("goals")
          break
        case "4":
          event.preventDefault()
          this.switchTab("challenges")
          break
        case "5":
          event.preventDefault()
          this.switchTab("stats")
          break
        case "6":
          event.preventDefault()
          this.switchTab("planning")
          break
        case "s":
          event.preventDefault()
          this.openModal("settingsModal")
          break
        case "e":
          event.preventDefault()
          this.exportData()
          break
      }
    }

    // Escape to close modals
    if (event.key === "Escape") {
      const activeModal = document.querySelector(".modal.active")
      if (activeModal) {
        this.closeModal(activeModal.id)
      }
    }
  }

  // Initialize category selects when modal opens
  setupModalEventListeners() {
    const addActivityModal = document.getElementById("addActivityModal")
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          if (addActivityModal.classList.contains("active")) {
            this.populateCategorySelects()
          }
        }
      })
    })
    observer.observe(addActivityModal, { attributes: true })
  }
}

// Initialize the application
let app
document.addEventListener("DOMContentLoaded", () => {
  app = new TimeCoinTracker()
  app.setupModalEventListeners()
})

// Make app globally available for onclick handlers
window.app = app
