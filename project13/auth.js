// Enhanced authentication system
class AuthSystem {
  constructor() {
    this.currentUser = null
    this.sessionTimeout = 30 * 60 * 1000 // 30 minutes
    this.init()
  }

  init() {
    this.checkAuthStatus()
    this.setupSessionTimeout()
    this.loadUserData()
  }

  checkAuthStatus() {
    const userData = localStorage.getItem("currentUser")
    const sessionData = localStorage.getItem("sessionData")

    if (userData && sessionData) {
      const session = JSON.parse(sessionData)
      const now = Date.now()

      if (now - session.loginTime < this.sessionTimeout) {
        this.currentUser = JSON.parse(userData)
        this.updateSessionTime()
        return true
      } else {
        this.logout()
        return false
      }
    }

    // Redirect to home if not authenticated and on protected page
    if (this.isProtectedPage()) {
      window.location.href = "index.html"
    }

    return false
  }

  isProtectedPage() {
    const protectedPages = ["dashboard.html", "upload.html", "packages.html", "admin.html"]
    const currentPage = window.location.pathname.split("/").pop()
    return protectedPages.includes(currentPage)
  }

  login(username, password, rememberMe = false) {
    return new Promise((resolve, reject) => {
      // Simulate API call with animation
      this.showLoading("Authenticating...")

      setTimeout(() => {
        // Simple validation (in real app, this would be server-side)
        if (username.length >= 3 && password.length >= 6) {
          this.currentUser = {
            username: username,
            email: `${username}@example.com`,
            isAdmin: false,
            loginTime: Date.now(),
          }

          this.saveUserSession(rememberMe)
          this.hideLoading()
          this.showSuccess(`Welcome back, ${username}!`)

          // Add login animation
          this.playLoginAnimation()

          setTimeout(() => {
            window.location.href = "dashboard.html"
          }, 1500)

          resolve(this.currentUser)
        } else {
          this.hideLoading()
          this.showError("Invalid credentials. Username must be 3+ chars, password 6+ chars.")
          reject("Invalid credentials")
        }
      }, 1500)
    })
  }

  register(userData) {
    return new Promise((resolve, reject) => {
      this.showLoading("Creating account...")

      setTimeout(() => {
        if (this.validateRegistration(userData)) {
          this.currentUser = {
            username: userData.username,
            email: userData.email,
            isAdmin: userData.code === "ADD_ME",
            loginTime: Date.now(),
          }

          this.saveUserSession(false)
          this.hideLoading()

          const message = this.currentUser.isAdmin
            ? `Admin account created for ${userData.username}!`
            : `Account created for ${userData.username}!`

          this.showSuccess(message)
          this.playRegistrationAnimation()

          setTimeout(() => {
            window.location.href = "dashboard.html"
          }, 2000)

          resolve(this.currentUser)
        } else {
          this.hideLoading()
          this.showError("Registration failed. Please check all fields.")
          reject("Registration failed")
        }
      }, 1500)
    })
  }

  validateRegistration(userData) {
    return userData.username.length >= 3 && userData.email.includes("@") && userData.password.length >= 6
  }

  logout() {
    this.currentUser = null
    localStorage.removeItem("currentUser")
    localStorage.removeItem("sessionData")

    this.showSuccess("Logged out successfully")

    setTimeout(() => {
      window.location.href = "index.html"
    }, 1000)
  }

  saveUserSession(rememberMe) {
    localStorage.setItem("currentUser", JSON.stringify(this.currentUser))

    const sessionData = {
      loginTime: Date.now(),
      rememberMe: rememberMe,
    }
    localStorage.setItem("sessionData", JSON.stringify(sessionData))
  }

  updateSessionTime() {
    const sessionData = JSON.parse(localStorage.getItem("sessionData"))
    sessionData.loginTime = Date.now()
    localStorage.setItem("sessionData", JSON.stringify(sessionData))
  }

  setupSessionTimeout() {
    setInterval(() => {
      if (this.currentUser) {
        const sessionData = JSON.parse(localStorage.getItem("sessionData"))
        const now = Date.now()

        if (now - sessionData.loginTime > this.sessionTimeout) {
          this.showError("Session expired. Please login again.")
          this.logout()
        }
      }
    }, 60000) // Check every minute
  }

  loadUserData() {
    if (this.currentUser && document.getElementById("user-info")) {
      const userInfo = document.getElementById("user-info")
      userInfo.textContent = `$ whoami: ${this.currentUser.username}`

      if (this.currentUser.isAdmin) {
        userInfo.textContent += " [ADMIN]"
        userInfo.classList.add("text-yellow-400")

        const adminCard = document.getElementById("admin-card")
        if (adminCard) {
          adminCard.style.display = "block"
        }
      }
    }
  }

  // Animation functions
  playLoginAnimation() {
    const body = document.body
    body.style.animation = "loginSuccess 1s ease"

    setTimeout(() => {
      body.style.animation = ""
    }, 1000)
  }

  playRegistrationAnimation() {
    const body = document.body
    body.style.animation = "registerSuccess 1.5s ease"

    setTimeout(() => {
      body.style.animation = ""
    }, 1500)
  }

  // UI Helper functions
  showLoading(message) {
    const loading = document.createElement("div")
    loading.id = "auth-loading"
    loading.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    loading.innerHTML = `
            <div class="bg-gray-800 p-6 rounded border border-gray-600 text-center">
                <div class="loading mb-4"></div>
                <p class="text-green-400 font-mono">${message}</p>
            </div>
        `
    document.body.appendChild(loading)
  }

  hideLoading() {
    const loading = document.getElementById("auth-loading")
    if (loading) {
      loading.remove()
    }
  }

  showSuccess(message) {
    this.showToast(message, "success")
  }

  showError(message) {
    this.showToast(message, "error")
  }

  showToast(message, type) {
    const toast = document.createElement("div")
    const bgColor = type === "success" ? "bg-green-600" : "bg-red-600"
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded font-mono z-50 toast-slide-in`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add("toast-slide-out")
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }
}

// Global auth instance
const auth = new AuthSystem()

// Global functions for HTML onclick handlers
function logout() {
  auth.logout()
}

function navigateTo(page) {
  window.location.href = page
}

// Enhanced form handling for index.html
if (document.getElementById("login-form")) {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const username = document.getElementById("login-username").value
    const password = document.getElementById("login-password").value
    const rememberMe = document.getElementById("remember-me")?.checked || false

    try {
      await auth.login(username, password, rememberMe)
    } catch (error) {
      console.error("Login failed:", error)
    }
  })
}

if (document.getElementById("register-form")) {
  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const userData = {
      username: document.getElementById("register-username").value,
      email: document.getElementById("register-email").value,
      password: document.getElementById("register-password").value,
      code: document.getElementById("register-code").value,
    }

    try {
      await auth.register(userData)
    } catch (error) {
      console.error("Registration failed:", error)
    }
  })
}

// Password visibility toggle
function togglePassword(inputId, buttonId) {
  const input = document.getElementById(inputId)
  const button = document.getElementById(buttonId)

  if (input.type === "password") {
    input.type = "text"
    button.textContent = "hide"
  } else {
    input.type = "password"
    button.textContent = "show"
  }
}
