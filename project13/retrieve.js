class RetrieveSystem {
  constructor() {
    this.init()
  }

  init() {
    this.setupForm()
    this.loadPublicPackages()
  }

  setupForm() {
    const form = document.getElementById("retrieve-form")
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      this.findPackage()
    })
  }

  async findPackage() {
    const packageName = document.getElementById("package-name").value.trim()
    const secretKey = document.getElementById("secret-key").value.trim()

    if (!packageName) {
      this.showError("Please enter a package name")
      return
    }

    // Show loading
    this.showLoading("Searching for package...")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const packages = JSON.parse(localStorage.getItem("packages") || "[]")
      const pkg = packages.find((p) => p.name.toLowerCase() === packageName.toLowerCase())

      this.hideLoading()

      if (!pkg) {
        this.showError("Package not found")
        return
      }

      if (pkg.visibility === "private") {
        if (!secretKey) {
          this.showSecretKeyField()
          this.showError("This is a private package. Please enter the secret key.")
          return
        }

        if (secretKey !== pkg.secretKey) {
          this.showError("Invalid secret key")
          return
        }
      }

      this.showPackageInfo(pkg)
    } catch (error) {
      this.hideLoading()
      this.showError("Failed to retrieve package: " + error.message)
    }
  }

  showSecretKeyField() {
    document.getElementById("secret-key-field").style.display = "block"
  }

  showPackageInfo(pkg) {
    const packageInfo = document.getElementById("package-info")
    const packageDetails = document.getElementById("package-details")

    const totalSize = pkg.files.reduce((sum, file) => sum + file.size, 0)
    const uploadDate = new Date(pkg.uploadTime).toLocaleDateString()

    packageDetails.innerHTML = `
            <div class="text-gray-400">name: <span class="text-green-400">${pkg.name}</span></div>
            <div class="text-gray-400">author: <span class="text-blue-400">${pkg.author}</span></div>
            <div class="text-gray-400">visibility: <span class="text-yellow-400">${pkg.visibility}</span></div>
            <div class="text-gray-400">files: <span class="text-purple-400">${pkg.files.length}</span></div>
            <div class="text-gray-400">size: <span class="text-purple-400">${this.formatFileSize(totalSize)}</span></div>
            <div class="text-gray-400">uploaded: <span class="text-yellow-400">${uploadDate}</span></div>
            <div class="text-gray-400">downloads: <span class="text-purple-400">${pkg.downloads}</span></div>
            ${pkg.description ? `<div class="text-gray-400">description: <span class="text-gray-300">${pkg.description}</span></div>` : ""}
        `

    packageInfo.style.display = "block"

    // Setup download button
    const downloadBtn = document.getElementById("download-btn")
    downloadBtn.onclick = () => this.downloadPackage(pkg)
  }

  async downloadPackage(pkg) {
    this.showLoading("Preparing download...")

    try {
      // Simulate download preparation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update download count
      const packages = JSON.parse(localStorage.getItem("packages") || "[]")
      const packageIndex = packages.findIndex((p) => p.name === pkg.name)
      if (packageIndex !== -1) {
        packages[packageIndex].downloads++
        localStorage.setItem("packages", JSON.stringify(packages))
      }

      this.hideLoading()
      this.showSuccess(`Download started for "${pkg.name}"`)

      // In a real app, this would trigger actual file download
      console.log("Downloading package:", pkg)
    } catch (error) {
      this.hideLoading()
      this.showError("Download failed: " + error.message)
    }
  }

  loadPublicPackages() {
    const publicPackagesContainer = document.getElementById("public-packages")
    const packages = JSON.parse(localStorage.getItem("packages") || "[]")
    const publicPackages = packages.filter((pkg) => pkg.visibility === "public").slice(0, 10)

    if (publicPackages.length === 0) {
      publicPackagesContainer.innerHTML =
        '<div class="text-gray-400 font-mono text-sm">No public packages available</div>'
      return
    }

    publicPackagesContainer.innerHTML = ""

    publicPackages.forEach((pkg) => {
      const packageItem = document.createElement("div")
      packageItem.className =
        "p-3 bg-gray-800 rounded border border-gray-600 hover:border-green-400 transition-colors cursor-pointer"
      packageItem.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-green-400">${pkg.name}</span>
                    <span class="font-mono text-xs text-gray-500">${pkg.files.length} files</span>
                </div>
                <div class="text-sm font-mono text-gray-400 mb-2">by ${pkg.author}</div>
                ${pkg.description ? `<div class="text-xs font-mono text-gray-500 mb-2">${pkg.description}</div>` : ""}
                <div class="flex justify-between items-center">
                    <span class="text-xs font-mono text-purple-400">${pkg.downloads} downloads</span>
                    <button class="btn btn-primary btn-sm" onclick="retrieveSystem.quickDownload('${pkg.name}')">
                        Download
                    </button>
                </div>
            `
      publicPackagesContainer.appendChild(packageItem)
    })
  }

  quickDownload(packageName) {
    document.getElementById("package-name").value = packageName
    this.findPackage()
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
    loading.id = "retrieve-loading"
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
    const loading = document.getElementById("retrieve-loading")
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

// Initialize retrieve system
const retrieveSystem = new RetrieveSystem()
