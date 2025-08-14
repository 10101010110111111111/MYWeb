class UploadSystem {
  constructor() {
    this.selectedFiles = []
    this.maxFileSize = 100 * 1024 * 1024 // 100MB
    this.maxFiles = 50
    this.maxPackageSize = 500 * 1024 * 1024 // 500MB
    this.auth = { currentUser: { username: "defaultUser" } } // Mock auth object for demonstration
    this.init()
  }

  init() {
    this.setupDropZone()
    this.setupFileInput()
    this.setupForm()
    this.setupVisibilityToggle()
  }

  setupDropZone() {
    const dropZone = document.getElementById("drop-zone")
    const fileInput = document.getElementById("file-input")

    // Drag and drop events
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault()
      dropZone.classList.add("drag-over")
    })

    dropZone.addEventListener("dragleave", (e) => {
      e.preventDefault()
      dropZone.classList.remove("drag-over")
    })

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault()
      dropZone.classList.remove("drag-over")
      const files = Array.from(e.dataTransfer.files)
      this.handleFiles(files)
    })

    // Click to select files
    dropZone.addEventListener("click", () => {
      fileInput.click()
    })
  }

  setupFileInput() {
    const fileInput = document.getElementById("file-input")
    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files)
      this.handleFiles(files)
    })
  }

  setupForm() {
    const form = document.getElementById("upload-form")
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      this.uploadPackage()
    })
  }

  setupVisibilityToggle() {
    const radioButtons = document.querySelectorAll('input[name="visibility"]')
    const secretKeyField = document.getElementById("secret-key-field")

    radioButtons.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "private") {
          secretKeyField.style.display = "block"
          document.getElementById("secret-key").required = true
        } else {
          secretKeyField.style.display = "none"
          document.getElementById("secret-key").required = false
        }
      })
    })
  }

  handleFiles(files) {
    // Validate files
    const validFiles = []
    let totalSize = 0

    for (const file of files) {
      if (file.size > this.maxFileSize) {
        this.showError(`File "${file.name}" is too large (max ${this.formatFileSize(this.maxFileSize)})`)
        continue
      }

      totalSize += file.size
      if (totalSize > this.maxPackageSize) {
        this.showError(`Package size would exceed limit (max ${this.formatFileSize(this.maxPackageSize)})`)
        break
      }

      validFiles.push(file)
    }

    if (this.selectedFiles.length + validFiles.length > this.maxFiles) {
      this.showError(`Too many files (max ${this.maxFiles} files per package)`)
      return
    }

    // Add valid files
    this.selectedFiles.push(...validFiles)
    this.updateFileList()
    this.updateUploadButton()

    // Show success animation
    this.animateFileAdd(validFiles.length)
  }

  updateFileList() {
    const fileList = document.getElementById("file-list")
    const selectedFiles = document.getElementById("selected-files")

    if (this.selectedFiles.length === 0) {
      fileList.style.display = "none"
      return
    }

    fileList.style.display = "block"
    selectedFiles.innerHTML = ""

    this.selectedFiles.forEach((file, index) => {
      const fileItem = document.createElement("div")
      fileItem.className = "flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600"
      fileItem.innerHTML = `
                <div class="flex items-center gap-2">
                    <svg class="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span class="font-mono text-sm text-gray-300">${file.name}</span>
                    <span class="font-mono text-xs text-gray-500">(${this.formatFileSize(file.size)})</span>
                </div>
                <button onclick="uploadSystem.removeFile(${index})" class="text-red-400 hover:text-red-300">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `
      selectedFiles.appendChild(fileItem)
    })
  }

  removeFile(index) {
    this.selectedFiles.splice(index, 1)
    this.updateFileList()
    this.updateUploadButton()
  }

  updateUploadButton() {
    const uploadBtn = document.getElementById("upload-btn")
    const packageName = document.getElementById("package-name").value.trim()

    uploadBtn.disabled = this.selectedFiles.length === 0 || !packageName
  }

  async uploadPackage() {
    const packageName = document.getElementById("package-name").value.trim()
    const visibility = document.querySelector('input[name="visibility"]:checked').value
    const secretKey = document.getElementById("secret-key").value.trim()
    const description = document.getElementById("description").value.trim()

    if (visibility === "private" && !secretKey) {
      this.showError("Secret key is required for private packages")
      return
    }

    // Show upload progress
    this.showUploadProgress()

    try {
      // Simulate upload process
      await this.simulateUpload(packageName, visibility, secretKey, description)
      this.showUploadSuccess(packageName)
    } catch (error) {
      this.showError("Upload failed: " + error.message)
      this.hideUploadProgress()
    }
  }

  async simulateUpload(packageName, visibility, secretKey, description) {
    const progressFill = document.getElementById("progress-fill")
    const progressText = document.getElementById("progress-text")
    const uploadStatus = document.getElementById("upload-status")

    // Simulate file processing
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      progressFill.style.width = `${i}%`
      progressText.textContent = `${i}%`

      if (i === 25) {
        uploadStatus.innerHTML = '<div class="text-blue-400 font-mono text-sm">Processing files...</div>'
      } else if (i === 50) {
        uploadStatus.innerHTML = '<div class="text-yellow-400 font-mono text-sm">Creating package...</div>'
      } else if (i === 75) {
        uploadStatus.innerHTML = '<div class="text-purple-400 font-mono text-sm">Uploading to server...</div>'
      }
    }

    // Save package data
    const packageData = {
      name: packageName,
      visibility: visibility,
      secretKey: visibility === "private" ? secretKey : null,
      description: description,
      files: this.selectedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      author: this.auth.currentUser.username,
      uploadTime: new Date().toISOString(),
      downloads: 0,
    }

    // Store in localStorage (in real app, this would be sent to server)
    const packages = JSON.parse(localStorage.getItem("packages") || "[]")
    packages.push(packageData)
    localStorage.setItem("packages", JSON.stringify(packages))
  }

  showUploadProgress() {
    document.getElementById("upload-progress").style.display = "block"
    document.getElementById("upload-btn").disabled = true
  }

  hideUploadProgress() {
    document.getElementById("upload-progress").style.display = "none"
    document.getElementById("upload-btn").disabled = false
  }

  showUploadSuccess(packageName) {
    const uploadStatus = document.getElementById("upload-status")
    uploadStatus.innerHTML = `
            <div class="text-green-400 font-mono text-sm mb-2">✓ Package "${packageName}" uploaded successfully!</div>
            <div class="flex gap-2">
                <button onclick="uploadSystem.resetForm()" class="btn btn-outline btn-sm">Upload Another</button>
                <button onclick="window.location.href='packages.html'" class="btn btn-primary btn-sm">View Packages</button>
            </div>
        `

    // Success animation
    document.body.style.animation = "uploadSuccess 1s ease"
    setTimeout(() => {
      document.body.style.animation = ""
    }, 1000)
  }

  resetForm() {
    this.selectedFiles = []
    document.getElementById("upload-form").reset()
    document.getElementById("file-input").value = ""
    this.updateFileList()
    this.updateUploadButton()
    this.hideUploadProgress()

    const uploadStatus = document.getElementById("upload-status")
    uploadStatus.innerHTML = '<div class="text-gray-400 font-mono text-sm">Ready to upload files...</div>'
  }

  animateFileAdd(count) {
    const dropZone = document.getElementById("drop-zone")
    dropZone.style.animation = "fileAdded 0.5s ease"
    setTimeout(() => {
      dropZone.style.animation = ""
    }, 500)

    this.showSuccess(`Added ${count} file${count > 1 ? "s" : ""}`)
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

// Initialize upload system
const uploadSystem = new UploadSystem()

// Update upload button when package name changes
document.getElementById("package-name").addEventListener("input", () => {
  uploadSystem.updateUploadButton()
})
