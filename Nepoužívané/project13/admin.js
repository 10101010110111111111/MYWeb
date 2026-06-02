class AdminDashboard {
  constructor() {
    this.packages = []
    this.users = []
    this.currentUser = null
    this.currentTab = "overview"
    this.init()
  }

  init() {
    this.checkAdminAccess()
    this.loadData()
    this.updateStats()
    this.loadRecentPackages()
    this.loadUsers()
  }

  checkAdminAccess() {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      window.location.href = "index.html"
      return
    }

    this.currentUser = JSON.parse(userData)
    if (!this.currentUser.isAdmin) {
      alert("Access denied. Admin privileges required.")
      window.location.href = "dashboard.html"
      return
    }

    // Update user info display
    const userInfo = document.getElementById("user-info")
    if (userInfo) {
      userInfo.textContent = `$ whoami: ${this.currentUser.username} [ADMIN]`
    }
  }

  loadData() {
    this.packages = JSON.parse(localStorage.getItem("packages") || "[]")
    this.users = this.extractUsersFromPackages()
  }

  extractUsersFromPackages() {
    const userMap = new Map()

    // Add current admin user
    userMap.set(this.currentUser.username, {
      username: this.currentUser.username,
      email: this.currentUser.email || `${this.currentUser.username}@example.com`,
      isAdmin: true,
      packageCount: this.packages.filter((p) => p.author === this.currentUser.username).length,
    })

    // Extract users from packages
    this.packages.forEach((pkg) => {
      if (!userMap.has(pkg.author)) {
        userMap.set(pkg.author, {
          username: pkg.author,
          email: `${pkg.author}@example.com`,
          isAdmin: false,
          packageCount: 1,
        })
      } else {
        const user = userMap.get(pkg.author)
        user.packageCount++
      }
    })

    return Array.from(userMap.values())
  }

  switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.style.display = "none"
    })

    // Remove active class from all tab buttons
    document.querySelectorAll(".admin-tab").forEach((btn) => {
      btn.classList.remove("active")
    })

    // Show selected tab
    document.getElementById(`${tabName}-tab`).style.display = "block"
    document.getElementById(`tab-${tabName}`).classList.add("active")

    this.currentTab = tabName

    // Load tab-specific content
    switch (tabName) {
      case "packages":
        this.loadAllPackages()
        break
      case "users":
        this.loadUsersTable()
        break
      case "system":
        this.updateSystemLogs()
        break
    }
  }

  updateStats() {
    const totalPackages = this.packages.length
    const totalUsers = this.users.length
    const totalDownloads = this.packages.reduce((sum, pkg) => sum + pkg.downloads, 0)
    const storageUsed = this.packages.reduce((sum, pkg) => {
      return sum + pkg.files.reduce((fileSum, file) => fileSum + file.size, 0)
    }, 0)

    document.getElementById("total-packages-stat").textContent = totalPackages
    document.getElementById("total-users-stat").textContent = totalUsers
    document.getElementById("total-downloads-stat").textContent = totalDownloads
    document.getElementById("storage-used-stat").textContent = this.formatFileSize(storageUsed)
  }

  loadRecentPackages() {
    const recentPackages = [...this.packages]
      .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime))
      .slice(0, 5)

    const container = document.getElementById("recent-packages-list")
    container.innerHTML = ""

    if (recentPackages.length === 0) {
      container.innerHTML = '<div class="text-gray-400 font-mono text-sm">No packages found</div>'
      return
    }

    recentPackages.forEach((pkg) => {
      const item = document.createElement("div")
      item.className = "flex justify-between items-center p-2 bg-gray-800 rounded border border-gray-600"
      item.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <span class="font-mono text-sm text-green-400">${pkg.name}</span>
          <span class="px-1 py-0.5 text-xs font-mono rounded ${pkg.visibility === "public" ? "bg-green-600 text-black" : "bg-yellow-600 text-black"}">
            ${pkg.visibility}
          </span>
        </div>
        <div class="text-xs font-mono text-gray-400">
          ${pkg.author} • ${new Date(pkg.uploadTime).toLocaleDateString()}
        </div>
      `
      container.appendChild(item)
    })
  }

  loadAllPackages() {
    this.searchAllPackages()
  }

  searchAllPackages() {
    const searchTerm = document.getElementById("admin-search-input").value.toLowerCase()
    let packages = [...this.packages]

    if (searchTerm) {
      packages = packages.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchTerm) ||
          pkg.author.toLowerCase().includes(searchTerm) ||
          (pkg.description && pkg.description.toLowerCase().includes(searchTerm)),
      )
    }

    this.renderAllPackages(packages)
  }

  renderAllPackages(packages) {
    const container = document.getElementById("admin-packages-container")
    container.innerHTML = ""

    if (packages.length === 0) {
      container.innerHTML = '<div class="text-center text-gray-400 font-mono">No packages found</div>'
      return
    }

    packages.forEach((pkg, index) => {
      const card = this.createAdminPackageCard(pkg, index)
      container.appendChild(card)
    })
  }

  createAdminPackageCard(pkg, index) {
    const card = document.createElement("div")
    card.className = "card admin-package-card"

    const totalSize = pkg.files.reduce((sum, file) => sum + file.size, 0)
    const uploadDate = new Date(pkg.uploadTime).toLocaleDateString()

    card.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center gap-3">
          <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <div>
            <h3 class="text-lg font-mono text-green-400">${pkg.name}</h3>
            <p class="text-sm font-mono text-gray-400">by ${pkg.author}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-1 text-xs font-mono rounded ${pkg.visibility === "public" ? "bg-green-600 text-black" : "bg-yellow-600 text-black"}">
            ${pkg.visibility}
          </span>
          <span class="px-2 py-1 text-xs font-mono rounded bg-red-600 text-white">ADMIN</span>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-4 mb-4">
        <div class="space-y-2 text-sm font-mono">
          <div class="text-gray-400">files: <span class="text-purple-400">${pkg.files.length}</span></div>
          <div class="text-gray-400">size: <span class="text-purple-400">${this.formatFileSize(totalSize)}</span></div>
        </div>
        <div class="space-y-2 text-sm font-mono">
          <div class="text-gray-400">uploaded: <span class="text-yellow-400">${uploadDate}</span></div>
          <div class="text-gray-400">downloads: <span class="text-purple-400">${pkg.downloads}</span></div>
        </div>
        <div class="space-y-2 text-sm font-mono">
          ${pkg.description ? `<div class="text-gray-400">description: <span class="text-gray-300">${pkg.description.substring(0, 50)}${pkg.description.length > 50 ? "..." : ""}</span></div>` : ""}
          ${pkg.visibility === "private" ? '<div class="text-yellow-400">🔒 Private Package</div>' : ""}
        </div>
      </div>

      <div class="flex gap-2">
        <button onclick="adminDashboard.viewPackageDetails('${pkg.name}')" class="btn btn-primary">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          View
        </button>
        <button onclick="adminDashboard.editPackage('${pkg.name}')" class="btn btn-outline">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Edit
        </button>
        <button onclick="adminDashboard.deletePackage('${pkg.name}')" class="btn btn-outline text-red-400">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Delete
        </button>
      </div>
    `

    // Add animation
    card.style.animationDelay = `${index * 0.1}s`
    card.classList.add("admin-slide-in")

    return card
  }

  loadUsersTable() {
    const tbody = document.getElementById("users-table-body")
    tbody.innerHTML = ""

    this.users.forEach((user) => {
      const row = document.createElement("tr")
      row.className = "border-b border-gray-700 hover:bg-gray-800"
      row.innerHTML = `
        <td class="py-3 px-4 font-mono text-sm">${user.username}</td>
        <td class="py-3 px-4 font-mono text-sm text-gray-400">${user.email}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-1 text-xs font-mono rounded ${user.isAdmin ? "bg-red-600 text-white" : "bg-blue-600 text-white"}">
            ${user.isAdmin ? "Admin" : "User"}
          </span>
        </td>
        <td class="py-3 px-4 font-mono text-sm text-purple-400">${user.packageCount}</td>
        <td class="py-3 px-4">
          <div class="flex gap-2">
            ${
              !user.isAdmin
                ? `
              <button onclick="adminDashboard.promoteUser('${user.username}')" class="btn btn-outline btn-sm">
                Promote
              </button>
              <button onclick="adminDashboard.deleteUser('${user.username}')" class="btn btn-outline btn-sm text-red-400">
                Delete
              </button>
            `
                : '<span class="text-gray-500 font-mono text-sm">Protected</span>'
            }
          </div>
        </td>
      `
      tbody.appendChild(row)
    })
  }

  // Admin Actions
  viewPackageDetails(packageName) {
    const pkg = this.packages.find((p) => p.name === packageName)
    if (pkg) {
      // Reuse the package modal from packages.js if available
      if (window.packageManager) {
        window.packageManager.showPackageDetails(pkg)
      } else {
        alert(`Package: ${pkg.name}\nAuthor: ${pkg.author}\nFiles: ${pkg.files.length}\nDownloads: ${pkg.downloads}`)
      }
    }
  }

  editPackage(packageName) {
    // Redirect to packages page for editing
    window.location.href = `packages.html?edit=${packageName}`
  }

  deletePackage(packageName) {
    if (confirm(`Are you sure you want to delete "${packageName}"? This action cannot be undone.`)) {
      this.packages = this.packages.filter((p) => p.name !== packageName)
      localStorage.setItem("packages", JSON.stringify(this.packages))

      this.loadData()
      this.updateStats()
      this.loadRecentPackages()
      if (this.currentTab === "packages") {
        this.loadAllPackages()
      }

      this.showSuccess(`Package "${packageName}" deleted successfully`)
      this.addSystemLog(`[ADMIN] Package "${packageName}" deleted by ${this.currentUser.username}`)
    }
  }

  promoteUser(username) {
    if (confirm(`Promote "${username}" to admin? This will give them full system access.`)) {
      // In a real system, this would update the user in the database
      const userIndex = this.users.findIndex((u) => u.username === username)
      if (userIndex !== -1) {
        this.users[userIndex].isAdmin = true
        this.loadUsersTable()
        this.showSuccess(`User "${username}" promoted to admin`)
        this.addSystemLog(`[ADMIN] User "${username}" promoted to admin by ${this.currentUser.username}`)
      }
    }
  }

  deleteUser(username) {
    if (confirm(`Delete user "${username}" and all their packages? This action cannot be undone.`)) {
      // Remove user's packages
      this.packages = this.packages.filter((p) => p.author !== username)
      localStorage.setItem("packages", JSON.stringify(this.packages))

      // Remove user
      this.users = this.users.filter((u) => u.username !== username)

      this.loadData()
      this.updateStats()
      this.loadRecentPackages()
      this.loadUsersTable()

      this.showSuccess(`User "${username}" and their packages deleted`)
      this.addSystemLog(`[ADMIN] User "${username}" deleted by ${this.currentUser.username}`)
    }
  }

  addUser() {
    const username = prompt("Enter username:")
    const email = prompt("Enter email:")

    if (username && email) {
      if (this.users.find((u) => u.username === username)) {
        this.showError("Username already exists")
        return
      }

      this.users.push({
        username: username,
        email: email,
        isAdmin: false,
        packageCount: 0,
      })

      this.loadUsersTable()
      this.updateStats()
      this.showSuccess(`User "${username}" added successfully`)
      this.addSystemLog(`[ADMIN] User "${username}" added by ${this.currentUser.username}`)
    }
  }

  // System Tools
  exportPackages() {
    const data = {
      packages: this.packages,
      users: this.users,
      exportDate: new Date().toISOString(),
      exportedBy: this.currentUser.username,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sender-export-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    this.showSuccess("Data exported successfully")
    this.addSystemLog(`[ADMIN] Data exported by ${this.currentUser.username}`)
  }

  clearAllPackages() {
    if (confirm("Delete ALL packages? This action cannot be undone!")) {
      if (confirm("Are you absolutely sure? This will delete everything!")) {
        localStorage.removeItem("packages")
        this.packages = []
        this.loadData()
        this.updateStats()
        this.loadRecentPackages()
        if (this.currentTab === "packages") {
          this.loadAllPackages()
        }

        this.showSuccess("All packages cleared")
        this.addSystemLog(`[ADMIN] All packages cleared by ${this.currentUser.username}`)
      }
    }
  }

  async cleanupStorage() {
    this.showLoading("Cleaning up storage...")

    // Simulate cleanup process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    this.hideLoading()
    this.showSuccess("Storage cleanup completed")
    this.addSystemLog(`[ADMIN] Storage cleanup performed by ${this.currentUser.username}`)
  }

  async optimizeDatabase() {
    this.showLoading("Optimizing database...")

    // Simulate optimization
    await new Promise((resolve) => setTimeout(resolve, 3000))

    this.hideLoading()
    this.showSuccess("Database optimization completed")
    this.addSystemLog(`[ADMIN] Database optimized by ${this.currentUser.username}`)
  }

  generateReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      generatedBy: this.currentUser.username,
      statistics: {
        totalPackages: this.packages.length,
        totalUsers: this.users.length,
        totalDownloads: this.packages.reduce((sum, pkg) => sum + pkg.downloads, 0),
        storageUsed: this.packages.reduce((sum, pkg) => {
          return sum + pkg.files.reduce((fileSum, file) => fileSum + file.size, 0)
        }, 0),
        publicPackages: this.packages.filter((p) => p.visibility === "public").length,
        privatePackages: this.packages.filter((p) => p.visibility === "private").length,
      },
      topPackages: [...this.packages]
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 10)
        .map((p) => ({ name: p.name, author: p.author, downloads: p.downloads })),
      topUsers: [...this.users]
        .sort((a, b) => b.packageCount - a.packageCount)
        .slice(0, 10)
        .map((u) => ({ username: u.username, packages: u.packageCount })),
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sender-report-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    this.showSuccess("Report generated successfully")
    this.addSystemLog(`[ADMIN] Report generated by ${this.currentUser.username}`)
  }

  updateSystemLogs() {
    // System logs would be loaded from server in real implementation
    const logs = document.getElementById("system-logs")
    const newLog = document.createElement("div")
    newLog.className = "text-green-400"
    newLog.textContent = `[INFO] ${new Date().toLocaleTimeString()} - Admin dashboard accessed by ${this.currentUser.username}`
    logs.appendChild(newLog)

    // Keep only last 20 logs
    while (logs.children.length > 20) {
      logs.removeChild(logs.firstChild)
    }

    // Scroll to bottom
    logs.scrollTop = logs.scrollHeight
  }

  addSystemLog(message) {
    const logs = document.getElementById("system-logs")
    if (logs) {
      const newLog = document.createElement("div")
      newLog.className = "text-yellow-400"
      newLog.textContent = `${new Date().toLocaleTimeString()} - ${message}`
      logs.appendChild(newLog)

      // Keep only last 20 logs
      while (logs.children.length > 20) {
        logs.removeChild(logs.firstChild)
      }

      // Scroll to bottom
      logs.scrollTop = logs.scrollHeight
    }
  }

  // Utility functions
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  showLoading(message) {
    const loading = document.createElement("div")
    loading.id = "admin-loading"
    loading.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    loading.innerHTML = `
      <div class="bg-gray-800 p-6 rounded border border-gray-600 text-center">
        <div class="loading mb-4"></div>
        <p class="text-red-400 font-mono">${message}</p>
      </div>
    `
    document.body.appendChild(loading)
  }

  hideLoading() {
    const loading = document.getElementById("admin-loading")
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

// Initialize admin dashboard
const adminDashboard = new AdminDashboard()
