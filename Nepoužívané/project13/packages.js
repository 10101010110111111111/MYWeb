class PackageManager {
  constructor() {
    this.packages = []
    this.filteredPackages = []
    this.currentFilter = "all"
    this.currentUser = null
    this.selectedPackage = null
    this.init()
  }

  init() {
    this.loadCurrentUser()
    this.loadPackages()
    this.setupEventListeners()
    this.updateStats()
  }

  loadCurrentUser() {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      this.currentUser = JSON.parse(userData)
    }
  }

  loadPackages() {
    this.packages = JSON.parse(localStorage.getItem("packages") || "[]")
    this.filterPackages(this.currentFilter)
  }

  setupEventListeners() {
    // Private access form
    document.getElementById("private-access-form").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handlePrivateAccess()
    })

    // Edit form
    document.getElementById("edit-form").addEventListener("submit", (e) => {
      e.preventDefault()
      this.savePackageEdit()
    })

    // Edit visibility toggle
    const editRadios = document.querySelectorAll('input[name="edit-visibility"]')
    editRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const secretField = document.getElementById("edit-secret-field")
        if (e.target.value === "private") {
          secretField.style.display = "block"
        } else {
          secretField.style.display = "none"
        }
      })
    })

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none"
      }
    })
  }

  filterPackages(filter) {
    this.currentFilter = filter

    // Update filter button states
    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"))
    document.getElementById(`filter-${filter}`).classList.add("active")

    switch (filter) {
      case "all":
        this.filteredPackages = [...this.packages]
        break
      case "my":
        this.filteredPackages = this.packages.filter((pkg) => pkg.author === this.currentUser?.username)
        break
      case "public":
        this.filteredPackages = this.packages.filter((pkg) => pkg.visibility === "public")
        break
      case "private":
        this.filteredPackages = this.packages.filter((pkg) => pkg.visibility === "private")
        break
    }

    this.searchPackages()
  }

  searchPackages() {
    const searchTerm = document.getElementById("search-input").value.toLowerCase()
    let packages = [...this.filteredPackages]

    if (searchTerm) {
      packages = packages.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchTerm) ||
          pkg.author.toLowerCase().includes(searchTerm) ||
          (pkg.description && pkg.description.toLowerCase().includes(searchTerm)),
      )
    }

    this.renderPackages(packages)
  }

  renderPackages(packages) {
    const container = document.getElementById("packages-container")
    const emptyState = document.getElementById("empty-state")

    if (packages.length === 0) {
      container.style.display = "none"
      emptyState.style.display = "block"
      return
    }

    container.style.display = "block"
    emptyState.style.display = "none"
    container.innerHTML = ""

    packages.forEach((pkg, index) => {
      const packageCard = this.createPackageCard(pkg, index)
      container.appendChild(packageCard)
    })
  }

  createPackageCard(pkg, index) {
    const card = document.createElement("div")
    card.className = "card package-card"

    const isOwner = pkg.author === this.currentUser?.username
    const isAdmin = this.currentUser?.isAdmin
    const canEdit = isOwner || isAdmin
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
          ${isAdmin ? '<span class="px-2 py-1 text-xs font-mono rounded bg-red-600 text-white">ADMIN</span>' : ""}
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2 text-sm font-mono">
          <div class="text-gray-400">files: <span class="text-purple-400">${pkg.files.length}</span></div>
          <div class="text-gray-400">size: <span class="text-purple-400">${this.formatFileSize(totalSize)}</span></div>
          <div class="text-gray-400">uploaded: <span class="text-yellow-400">${uploadDate}</span></div>
        </div>
        <div class="space-y-2 text-sm font-mono">
          <div class="text-gray-400">downloads: <span class="text-purple-400">${pkg.downloads}</span></div>
          ${pkg.description ? `<div class="text-gray-400">description: <span class="text-gray-300">${pkg.description}</span></div>` : ""}
        </div>
      </div>

      <div class="flex gap-2">
        <button onclick="packageManager.viewPackage('${pkg.name}')" class="btn btn-primary flex-1">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          View
        </button>
        <button onclick="packageManager.downloadPackage('${pkg.name}')" class="btn btn-outline">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Download
        </button>
        ${
          canEdit
            ? `
          <button onclick="packageManager.editPackage('${pkg.name}')" class="btn btn-outline">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button onclick="packageManager.deletePackage('${pkg.name}')" class="btn btn-outline text-red-400 hover:bg-red-600">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        `
            : ""
        }
      </div>
    `

    // Add animation
    card.style.animationDelay = `${index * 0.1}s`
    card.classList.add("package-slide-in")

    return card
  }

  viewPackage(packageName) {
    const pkg = this.packages.find((p) => p.name === packageName)
    if (!pkg) return

    if (pkg.visibility === "private" && pkg.author !== this.currentUser?.username && !this.currentUser?.isAdmin) {
      this.selectedPackage = pkg
      this.showPrivateAccessModal()
      return
    }

    this.showPackageDetails(pkg)
  }

  showPrivateAccessModal() {
    document.getElementById("private-access-modal").style.display = "block"
    document.getElementById("private-key-input").focus()
  }

  closePrivateModal() {
    document.getElementById("private-access-modal").style.display = "none"
    document.getElementById("private-key-input").value = ""
    this.selectedPackage = null
  }

  handlePrivateAccess() {
    const secretKey = document.getElementById("private-key-input").value.trim()

    if (!this.selectedPackage) return

    if (secretKey === this.selectedPackage.secretKey) {
      this.closePrivateModal()
      this.showPackageDetails(this.selectedPackage)
    } else {
      this.showError("Invalid secret key")
    }
  }

  showPackageDetails(pkg) {
    const modal = document.getElementById("package-modal")
    const modalTitle = document.getElementById("modal-title")
    const modalBody = document.getElementById("modal-body")

    modalTitle.textContent = `Package: ${pkg.name}`

    const totalSize = pkg.files.reduce((sum, file) => sum + file.size, 0)
    const uploadDate = new Date(pkg.uploadTime).toLocaleDateString()

    modalBody.innerHTML = `
      <div class="space-y-6">
        <div class="grid md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <h4 class="font-mono text-green-400">Package Info</h4>
            <div class="space-y-2 text-sm font-mono">
              <div class="text-gray-400">name: <span class="text-green-400">${pkg.name}</span></div>
              <div class="text-gray-400">author: <span class="text-blue-400">${pkg.author}</span></div>
              <div class="text-gray-400">visibility: <span class="text-yellow-400">${pkg.visibility}</span></div>
              <div class="text-gray-400">uploaded: <span class="text-yellow-400">${uploadDate}</span></div>
              <div class="text-gray-400">downloads: <span class="text-purple-400">${pkg.downloads}</span></div>
              <div class="text-gray-400">total size: <span class="text-purple-400">${this.formatFileSize(totalSize)}</span></div>
            </div>
            ${
              pkg.description
                ? `
              <div>
                <h5 class="font-mono text-green-400 mb-2">Description</h5>
                <p class="text-gray-300 font-mono text-sm">${pkg.description}</p>
              </div>
            `
                : ""
            }
          </div>
          
          <div class="space-y-3">
            <h4 class="font-mono text-green-400">Files (${pkg.files.length})</h4>
            <div class="max-h-64 overflow-y-auto space-y-2">
              ${pkg.files
                .map(
                  (file) => `
                <div class="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600">
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span class="font-mono text-sm text-gray-300">${file.name}</span>
                  </div>
                  <span class="font-mono text-xs text-gray-500">${this.formatFileSize(file.size)}</span>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button onclick="packageManager.downloadPackage('${pkg.name}')" class="btn btn-primary">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Download Package
          </button>
          <button onclick="packageManager.closeModal()" class="btn btn-outline">Close</button>
        </div>
      </div>
    `

    modal.style.display = "block"
  }

  closeModal() {
    document.getElementById("package-modal").style.display = "none"
  }

  editPackage(packageName) {
    const pkg = this.packages.find((p) => p.name === packageName)
    if (!pkg) return

    // Check permissions
    if (pkg.author !== this.currentUser?.username && !this.currentUser?.isAdmin) {
      this.showError("You do not have permission to edit this package")
      return
    }

    this.selectedPackage = pkg

    // Populate edit form
    document.getElementById("edit-name").value = pkg.name
    document.getElementById("edit-description").value = pkg.description || ""

    const visibilityRadio = document.querySelector(`input[name="edit-visibility"][value="${pkg.visibility}"]`)
    if (visibilityRadio) {
      visibilityRadio.checked = true
    }

    const secretField = document.getElementById("edit-secret-field")
    if (pkg.visibility === "private") {
      secretField.style.display = "block"
      document.getElementById("edit-secret").value = pkg.secretKey || ""
    } else {
      secretField.style.display = "none"
    }

    document.getElementById("edit-modal").style.display = "block"
  }

  closeEditModal() {
    document.getElementById("edit-modal").style.display = "none"
    this.selectedPackage = null
  }

  savePackageEdit() {
    if (!this.selectedPackage) return

    const newName = document.getElementById("edit-name").value.trim()
    const newDescription = document.getElementById("edit-description").value.trim()
    const newVisibility = document.querySelector('input[name="edit-visibility"]:checked').value
    const newSecret = document.getElementById("edit-secret").value.trim()

    if (!newName) {
      this.showError("Package name is required")
      return
    }

    // Check if name is already taken (excluding current package)
    const existingPkg = this.packages.find((p) => p.name === newName && p.name !== this.selectedPackage.name)
    if (existingPkg) {
      this.showError("Package name already exists")
      return
    }

    if (newVisibility === "private" && !newSecret) {
      this.showError("Secret key is required for private packages")
      return
    }

    // Update package
    const packageIndex = this.packages.findIndex((p) => p.name === this.selectedPackage.name)
    if (packageIndex !== -1) {
      this.packages[packageIndex] = {
        ...this.packages[packageIndex],
        name: newName,
        description: newDescription,
        visibility: newVisibility,
        secretKey: newVisibility === "private" ? newSecret : null,
      }

      localStorage.setItem("packages", JSON.stringify(this.packages))
      this.closeEditModal()
      this.loadPackages()
      this.updateStats()
      this.showSuccess("Package updated successfully")
    }
  }

  async downloadPackage(packageName) {
    const pkg = this.packages.find((p) => p.name === packageName)
    if (!pkg) return

    this.showLoading("Preparing download...")

    try {
      // Simulate download preparation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update download count
      const packageIndex = this.packages.findIndex((p) => p.name === packageName)
      if (packageIndex !== -1) {
        this.packages[packageIndex].downloads++
        localStorage.setItem("packages", JSON.stringify(this.packages))
      }

      this.hideLoading()
      this.showSuccess(`Download started for "${packageName}"`)

      // Refresh display
      this.loadPackages()
      this.updateStats()
    } catch (error) {
      this.hideLoading()
      this.showError("Download failed: " + error.message)
    }
  }

  deletePackage(packageName) {
    const pkg = this.packages.find((p) => p.name === packageName)
    if (!pkg) return

    // Check permissions
    if (pkg.author !== this.currentUser?.username && !this.currentUser?.isAdmin) {
      this.showError("You do not have permission to delete this package")
      return
    }

    if (confirm(`Are you sure you want to delete "${packageName}"? This action cannot be undone.`)) {
      this.packages = this.packages.filter((p) => p.name !== packageName)
      localStorage.setItem("packages", JSON.stringify(this.packages))

      this.loadPackages()
      this.updateStats()
      this.showSuccess(`Package "${packageName}" deleted successfully`)
    }
  }

  updateStats() {
    const totalPackages = this.packages.length
    const myPackages = this.packages.filter((p) => p.author === this.currentUser?.username).length
    const publicPackages = this.packages.filter((p) => p.visibility === "public").length
    const privatePackages = this.packages.filter((p) => p.visibility === "private").length

    document.getElementById("total-packages").textContent = totalPackages
    document.getElementById("my-packages").textContent = myPackages
    document.getElementById("public-packages").textContent = publicPackages
    document.getElementById("private-packages").textContent = privatePackages
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  showLoading(message) {
    const loading = document.createElement("div")
    loading.id = "package-loading"
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
    const loading = document.getElementById("package-loading")
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

// Initialize package manager
const packageManager = new PackageManager()
