// Global state
let currentUser = null
const packages = []
const recentPackages = [
  { name: "react-utils", author: "dev_user", time: "2h ago", downloads: 42 },
  { name: "api-helpers", author: "coder123", time: "4h ago", downloads: 18 },
  { name: "config-files", author: "sysadmin", time: "6h ago", downloads: 73 },
  { name: "scripts-bundle", author: "automation", time: "8h ago", downloads: 29 },
  { name: "docker-setup", author: "devops_pro", time: "12h ago", downloads: 156 },
  { name: "test-data", author: "qa_engineer", time: "1d ago", downloads: 91 },
]

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadRecentPackages()
  checkAuthStatus()
  setupEventListeners()
})

// Authentication functions
function showLogin() {
  document.getElementById("login-modal").style.display = "block"
}

function showRegister() {
  document.getElementById("register-modal").style.display = "block"
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none"
}

function checkAuthStatus() {
  const user = localStorage.getItem("currentUser")
  if (user) {
    currentUser = JSON.parse(user)
    updateAuthUI()
  }
}

function updateAuthUI() {
  const header = document.querySelector("header .flex .flex")
  if (currentUser) {
    header.innerHTML = `
            <span class="text-green-400 font-mono">$ whoami: ${currentUser.username}</span>
            <button onclick="logout()" class="btn btn-outline">logout</button>
        `
  }
}

function logout() {
  currentUser = null
  localStorage.removeItem("currentUser")
  location.reload()
}

// Event listeners
function setupEventListeners() {
  // Login form
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault()
    const username = document.getElementById("login-username").value
    const password = document.getElementById("login-password").value

    // Simulate authentication
    if (username && password) {
      currentUser = {
        username: username,
        isAdmin: false,
      }
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
      closeModal("login-modal")
      updateAuthUI()
      showSuccess("Login successful!")
    }
  })

  // Register form
  document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault()
    const username = document.getElementById("register-username").value
    const email = document.getElementById("register-email").value
    const password = document.getElementById("register-password").value
    const code = document.getElementById("register-code").value

    if (username && email && password) {
      currentUser = {
        username: username,
        email: email,
        isAdmin: code === "ADD_ME",
      }
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
      closeModal("register-modal")
      updateAuthUI()
      showSuccess(currentUser.isAdmin ? "Admin account created!" : "Account created!")
    }
  })

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none"
    }
  })
}

// Navigation functions
function showUpload() {
  if (!currentUser) {
    showLogin()
    return
  }
  // Will be implemented in next task
  alert("Upload functionality coming in next task!")
}

function showRetrieve() {
  // Will be implemented in next task
  alert("Retrieve functionality coming in next task!")
}

function showPackages() {
  if (!currentUser) {
    showLogin()
    return
  }
  // Will be implemented in next task
  alert("Packages functionality coming in next task!")
}

// Load recent packages
function loadRecentPackages() {
  const container = document.getElementById("recent-packages")
  container.innerHTML = ""

  recentPackages.forEach((pkg, index) => {
    const card = document.createElement("div")
    card.className = "card"
    card.innerHTML = `
            <div class="card-header">
                <div class="card-title">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    ${pkg.name}
                </div>
            </div>
            <div class="space-y-2 text-sm font-mono">
                <div class="text-gray-400">
                    author: <span class="text-blue-400">${pkg.author}</span>
                </div>
                <div class="text-gray-400">
                    uploaded: <span class="text-yellow-400">${pkg.time}</span>
                </div>
                <div class="text-gray-400">
                    downloads: <span class="text-purple-400">${pkg.downloads}</span>
                </div>
            </div>
            <button class="btn btn-primary w-full mt-4" onclick="downloadPackage('${pkg.name}')">
                download
            </button>
        `

    // Add animation delay
    card.style.animationDelay = `${index * 0.1}s`
    container.appendChild(card)
  })
}

function downloadPackage(packageName) {
  showSuccess(`Downloading ${packageName}...`)
}

// Utility functions
function showSuccess(message) {
  const toast = document.createElement("div")
  toast.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded font-mono z-50"
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 3000)
}

function showError(message) {
  const toast = document.createElement("div")
  toast.className = "fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded font-mono z-50"
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 3000)
}
