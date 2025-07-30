// Image Cropper Application
class ImageCropper {
  constructor() {
    this.image = null;
    this.originalImage = null;
    this.canvas = document.getElementById('imageCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.previewCanvas = document.getElementById('previewCanvas');
    this.previewCtx = this.previewCanvas.getContext('2d');
    
    // Crop area state
    this.cropArea = {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    };
    
    // Image state
    this.imageState = {
      width: 0,
      height: 0,
      scale: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0
    };
    
    // Interaction state
    this.isDragging = false;
    this.isResizing = false;
    this.dragStart = { x: 0, y: 0 };
    this.resizeHandle = null;
    
    // Settings
    this.settings = {
      lockAspectRatio: true,
      aspectRatio: 1,
      minCropSize: 10
    };
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupDragAndDrop();
    this.updateUI();
  }
  
  setupEventListeners() {
    // File input
    document.getElementById('fileInput').addEventListener('change', (e) => {
      this.handleFileSelect(e.target.files[0]);
    });
    
    // Control buttons
    document.getElementById('resetBtn').addEventListener('click', () => this.resetImage());
    document.getElementById('rotateBtn').addEventListener('click', () => this.rotateImage());
    document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
    document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
    
    // Dimension inputs
    document.getElementById('cropWidth').addEventListener('input', (e) => {
      this.updateCropDimensions('width', parseInt(e.target.value) || 0);
    });
    
    document.getElementById('cropHeight').addEventListener('input', (e) => {
      this.updateCropDimensions('height', parseInt(e.target.value) || 0);
    });
    
    // Aspect ratio controls
    document.getElementById('lockAspectRatio').addEventListener('change', (e) => {
      this.settings.lockAspectRatio = e.target.checked;
      if (this.settings.lockAspectRatio) {
        this.updateCropDimensions('width', this.cropArea.width);
      }
    });
    
    // Ratio presets
    document.querySelectorAll('.ratio-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setAspectRatio(e.target.dataset.ratio);
      });
    });
    
    // Export controls
    document.getElementById('exportFormat').addEventListener('change', (e) => {
      this.updateQualityControl(e.target.value);
    });
    
    document.getElementById('exportQuality').addEventListener('input', (e) => {
      document.getElementById('qualityValue').textContent = e.target.value + '%';
    });
    
    document.getElementById('exportBtn').addEventListener('click', () => this.exportImage());
    
    // Preview controls
    document.getElementById('backToEditBtn').addEventListener('click', () => this.showEditor());
    document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
    
    // Crop area interactions
    this.setupCropAreaEvents();
  }
  
  setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileSelect(files[0]);
      }
    });
  }
  
  setupCropAreaEvents() {
    const cropArea = document.getElementById('cropArea');
    const cropOverlay = document.getElementById('cropOverlay');
    
    // Mouse events for crop area
    cropArea.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.handleCropAreaMouseDown(e);
    });
    
    cropOverlay.addEventListener('mousemove', (e) => {
      e.preventDefault();
      this.handleCropAreaMouseMove(e);
    });
    
    document.addEventListener('mouseup', () => {
      this.handleCropAreaMouseUp();
    });
    
    // Touch events for mobile
    cropArea.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleCropAreaTouchStart(e);
    });
    
    cropOverlay.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.handleCropAreaTouchMove(e);
    });
    
    document.addEventListener('touchend', () => {
      this.handleCropAreaTouchEnd();
    });
  }
  
  handleFileSelect(file) {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showError('Prosím vyberte obrázek.');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showError('Soubor je příliš velký. Maximální velikost je 10 MB.');
      return;
    }
    
    this.showLoading();
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.loadImage(e.target.result);
    };
    reader.onerror = () => {
      this.hideLoading();
      this.showError('Chyba při načítání souboru.');
    };
    reader.readAsDataURL(file);
  }
  
  loadImage(src) {
    this.originalImage = new Image();
    this.originalImage.onload = () => {
      this.image = this.originalImage;
      this.resetImageState();
      this.setupCanvas();
      this.initializeCropArea();
      this.hideLoading();
      this.showEditor();
      this.updateImageInfo();
    };
    this.originalImage.onerror = () => {
      this.hideLoading();
      this.showError('Chyba při načítání obrázku.');
    };
    this.originalImage.src = src;
  }
  
  resetImageState() {
    this.imageState = {
      width: this.originalImage.width,
      height: this.originalImage.height,
      scale: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0
    };
  }
  
  setupCanvas() {
    const container = document.getElementById('imageContainer');
    const containerRect = container.getBoundingClientRect();
    
    // Calculate scale to fit image in container (allow up to 2x original size)
    const maxWidth = Math.min(containerRect.width - 40, this.imageState.width * 2);
    const maxHeight = Math.min(containerRect.height - 40, this.imageState.height * 2);
    
    const scaleX = maxWidth / this.imageState.width;
    const scaleY = maxHeight / this.imageState.height;
    this.imageState.scale = Math.min(scaleX, scaleY, 2);
    
    // Set canvas size to actual image size (scaled)
    this.canvas.width = this.imageState.width * this.imageState.scale;
    this.canvas.height = this.imageState.height * this.imageState.scale;
    
    // Set container height to accommodate canvas
    const containerHeight = Math.max(this.canvas.height + 40, 400);
    container.style.height = containerHeight + 'px';
    
    // Center image in container
    this.imageState.offsetX = (containerRect.width - this.canvas.width) / 2;
    this.imageState.offsetY = (containerRect.height - this.canvas.height) / 2;
    
    this.renderImage();
  }
  
  initializeCropArea() {
    // Set initial crop area to center of image
    const cropSize = Math.min(this.canvas.width, this.canvas.height) * 0.3;
    
    this.cropArea = {
      x: (this.canvas.width - cropSize) / 2,
      y: (this.canvas.height - cropSize) / 2,
      width: cropSize,
      height: cropSize
    };
    
    this.updateCropAreaDisplay();
    this.updateCropInputs();
  }
  
  renderImage() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Save context
    this.ctx.save();
    
    // Apply transformations
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate(this.imageState.rotation * Math.PI / 180);
    this.ctx.scale(this.imageState.scale, this.imageState.scale);
    this.ctx.drawImage(
      this.image,
      -this.imageState.width / 2,
      -this.imageState.height / 2,
      this.imageState.width,
      this.imageState.height
    );
    
    // Restore context
    this.ctx.restore();
  }
  
  updateCropAreaDisplay() {
    const cropArea = document.getElementById('cropArea');
    cropArea.style.left = this.cropArea.x + 'px';
    cropArea.style.top = this.cropArea.y + 'px';
    cropArea.style.width = this.cropArea.width + 'px';
    cropArea.style.height = this.cropArea.height + 'px';
  }
  
  updateCropInputs() {
    document.getElementById('cropWidth').value = Math.round(this.cropArea.width);
    document.getElementById('cropHeight').value = Math.round(this.cropArea.height);
    this.updateCropInfo();
  }
  
  updateCropDimensions(dimension, value) {
    if (dimension === 'width') {
      const newWidth = Math.max(this.settings.minCropSize, Math.min(value, this.canvas.width));
      this.cropArea.width = newWidth;
      if (this.settings.lockAspectRatio) {
        this.cropArea.height = this.cropArea.width / this.settings.aspectRatio;
      }
    } else if (dimension === 'height') {
      const newHeight = Math.max(this.settings.minCropSize, Math.min(value, this.canvas.height));
      this.cropArea.height = newHeight;
      if (this.settings.lockAspectRatio) {
        this.cropArea.width = this.cropArea.height * this.settings.aspectRatio;
      }
    }
    
    this.updateCropAreaDisplay();
    this.updateCropInputs();
  }
  
  setAspectRatio(ratio) {
    const [width, height] = ratio.split(':').map(Number);
    this.settings.aspectRatio = width / height;
    
    // Update active button
    document.querySelectorAll('.ratio-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update crop area
    if (this.settings.lockAspectRatio) {
      this.updateCropDimensions('width', this.cropArea.width);
    }
  }
  
  handleCropAreaMouseDown(e) {
    this.isDragging = true;
    
    const canvasRect = this.canvas.getBoundingClientRect();
    const cropAreaRect = document.getElementById('cropArea').getBoundingClientRect();
    
    this.dragStart = {
      x: e.clientX - cropAreaRect.left,
      y: e.clientY - cropAreaRect.top
    };
    
    // Check if clicking on resize handle
    const handle = e.target.closest('.crop-handle');
    if (handle) {
      this.isDragging = false;
      this.isResizing = true;
      this.resizeHandle = handle.className.split(' ')[1];
    }
  }
  
  handleCropAreaMouseMove(e) {
    if (!this.isDragging && !this.isResizing) return;
    
    if (this.isDragging && !this.isResizing) {
      // Move crop area
      const newX = e.clientX - this.dragStart.x;
      const newY = e.clientY - this.dragStart.y;
      
      // Constrain to canvas bounds
      this.cropArea.x = Math.max(0, Math.min(newX, this.canvas.width - this.cropArea.width));
      this.cropArea.y = Math.max(0, Math.min(newY, this.canvas.height - this.cropArea.height));
    } else if (this.isResizing) {
      // Resize crop area
      this.handleResize(e);
    }
    
    this.updateCropAreaDisplay();
    this.updateCropInputs();
  }
  
  handleResize(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    switch (this.resizeHandle) {
      case 'top-left':
        this.resizeFromTopLeft(mouseX, mouseY);
        break;
      case 'top-right':
        this.resizeFromTopRight(mouseX, mouseY);
        break;
      case 'bottom-left':
        this.resizeFromBottomLeft(mouseX, mouseY);
        break;
      case 'bottom-right':
        this.resizeFromBottomRight(mouseX, mouseY);
        break;
      case 'top':
        this.resizeFromTop(mouseY);
        break;
      case 'right':
        this.resizeFromRight(mouseX);
        break;
      case 'bottom':
        this.resizeFromBottom(mouseY);
        break;
      case 'left':
        this.resizeFromLeft(mouseX);
        break;
    }
  }
  
  resizeFromTopLeft(mouseX, mouseY) {
    const newWidth = this.cropArea.x + this.cropArea.width - mouseX;
    const newHeight = this.cropArea.y + this.cropArea.height - mouseY;
    
    if (newWidth >= this.settings.minCropSize && newHeight >= this.settings.minCropSize) {
      if (this.settings.lockAspectRatio) {
        const ratio = this.settings.aspectRatio;
        if (newWidth / newHeight > ratio) {
          this.cropArea.width = newHeight * ratio;
          this.cropArea.x = mouseX + newWidth - this.cropArea.width;
          this.cropArea.height = newHeight;
          this.cropArea.y = mouseY;
        } else {
          this.cropArea.height = newWidth / ratio;
          this.cropArea.y = mouseY + newHeight - this.cropArea.height;
          this.cropArea.width = newWidth;
          this.cropArea.x = mouseX;
        }
      } else {
        this.cropArea.width = newWidth;
        this.cropArea.x = mouseX;
        this.cropArea.height = newHeight;
        this.cropArea.y = mouseY;
      }
    }
  }
  
  resizeFromTopRight(mouseX, mouseY) {
    const newWidth = mouseX - this.cropArea.x;
    const newHeight = this.cropArea.y + this.cropArea.height - mouseY;
    
    if (newWidth >= this.settings.minCropSize && newHeight >= this.settings.minCropSize) {
      if (this.settings.lockAspectRatio) {
        const ratio = this.settings.aspectRatio;
        if (newWidth / newHeight > ratio) {
          this.cropArea.width = newHeight * ratio;
          this.cropArea.height = newHeight;
          this.cropArea.y = mouseY;
        } else {
          this.cropArea.height = newWidth / ratio;
          this.cropArea.y = mouseY + newHeight - this.cropArea.height;
          this.cropArea.width = newWidth;
        }
      } else {
        this.cropArea.width = newWidth;
        this.cropArea.height = newHeight;
        this.cropArea.y = mouseY;
      }
    }
  }
  
  resizeFromBottomLeft(mouseX, mouseY) {
    const newWidth = this.cropArea.x + this.cropArea.width - mouseX;
    const newHeight = mouseY - this.cropArea.y;
    
    if (newWidth >= this.settings.minCropSize && newHeight >= this.settings.minCropSize) {
      if (this.settings.lockAspectRatio) {
        const ratio = this.settings.aspectRatio;
        if (newWidth / newHeight > ratio) {
          this.cropArea.width = newHeight * ratio;
          this.cropArea.x = mouseX + newWidth - this.cropArea.width;
          this.cropArea.height = newHeight;
        } else {
          this.cropArea.height = newWidth / ratio;
          this.cropArea.width = newWidth;
          this.cropArea.x = mouseX;
        }
      } else {
        this.cropArea.width = newWidth;
        this.cropArea.x = mouseX;
        this.cropArea.height = newHeight;
      }
    }
  }
  
  resizeFromBottomRight(mouseX, mouseY) {
    const newWidth = mouseX - this.cropArea.x;
    const newHeight = mouseY - this.cropArea.y;
    
    if (newWidth >= this.settings.minCropSize && newHeight >= this.settings.minCropSize) {
      if (this.settings.lockAspectRatio) {
        const ratio = this.settings.aspectRatio;
        if (newWidth / newHeight > ratio) {
          this.cropArea.width = newHeight * ratio;
          this.cropArea.height = newHeight;
        } else {
          this.cropArea.height = newWidth / ratio;
          this.cropArea.width = newWidth;
        }
      } else {
        this.cropArea.width = newWidth;
        this.cropArea.height = newHeight;
      }
    }
  }
  
  resizeFromTop(mouseY) {
    const newHeight = this.cropArea.y + this.cropArea.height - mouseY;
    if (newHeight >= this.settings.minCropSize) {
      if (this.settings.lockAspectRatio) {
        const newWidth = newHeight * this.settings.aspectRatio;
        if (newWidth <= this.canvas.width) {
          this.cropArea.width = newWidth;
          this.cropArea.height = newHeight;
          this.cropArea.y = mouseY;
        }
      } else {
        this.cropArea.height = newHeight;
        this.cropArea.y = mouseY;
      }
    }
  }
  
  resizeFromRight(mouseX) {
    const newWidth = mouseX - this.cropArea.x;
    if (newWidth >= this.settings.minCropSize) {
      if (this.settings.lockAspectRatio) {
        const newHeight = newWidth / this.settings.aspectRatio;
        if (newHeight <= this.canvas.height) {
          this.cropArea.width = newWidth;
          this.cropArea.height = newHeight;
        }
      } else {
        this.cropArea.width = newWidth;
      }
    }
  }
  
  resizeFromBottom(mouseY) {
    const newHeight = mouseY - this.cropArea.y;
    if (newHeight >= this.settings.minCropSize) {
      if (this.settings.lockAspectRatio) {
        const newWidth = newHeight * this.settings.aspectRatio;
        if (newWidth <= this.canvas.width) {
          this.cropArea.width = newWidth;
          this.cropArea.height = newHeight;
        }
      } else {
        this.cropArea.height = newHeight;
      }
    }
  }
  
  resizeFromLeft(mouseX) {
    const newWidth = this.cropArea.x + this.cropArea.width - mouseX;
    if (newWidth >= this.settings.minCropSize) {
      if (this.settings.lockAspectRatio) {
        const newHeight = newWidth / this.settings.aspectRatio;
        if (newHeight <= this.canvas.height) {
          this.cropArea.width = newWidth;
          this.cropArea.height = newHeight;
          this.cropArea.x = mouseX;
        }
      } else {
        this.cropArea.width = newWidth;
        this.cropArea.x = mouseX;
      }
    }
  }
  
  handleCropAreaMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null;
  }
  
  // Touch event handlers
  handleCropAreaTouchStart(e) {
    const touch = e.touches[0];
    this.isDragging = true;
    
    const canvasRect = this.canvas.getBoundingClientRect();
    const cropAreaRect = document.getElementById('cropArea').getBoundingClientRect();
    
    this.dragStart = {
      x: touch.clientX - cropAreaRect.left,
      y: touch.clientY - cropAreaRect.top
    };
    
    const handle = e.target.closest('.crop-handle');
    if (handle) {
      this.isDragging = false;
      this.isResizing = true;
      this.resizeHandle = handle.className.split(' ')[1];
    }
  }
  
  handleCropAreaTouchMove(e) {
    if (!this.isDragging && !this.isResizing) return;
    
    const touch = e.touches[0];
    if (this.isDragging && !this.isResizing) {
      const newX = touch.clientX - this.dragStart.x;
      const newY = touch.clientY - this.dragStart.y;
      
      // Constrain to canvas bounds
      this.cropArea.x = Math.max(0, Math.min(newX, this.canvas.width - this.cropArea.width));
      this.cropArea.y = Math.max(0, Math.min(newY, this.canvas.height - this.cropArea.height));
    } else if (this.isResizing) {
      this.handleResize({ clientX: touch.clientX, clientY: touch.clientY });
    }
    
    this.updateCropAreaDisplay();
    this.updateCropInputs();
  }
  
  handleCropAreaTouchEnd() {
    this.handleCropAreaMouseUp();
  }
  
  // Control functions
  resetImage() {
    if (this.originalImage) {
      this.resetImageState();
      this.setupCanvas();
      this.initializeCropArea();
    }
  }
  
  rotateImage() {
    this.imageState.rotation = (this.imageState.rotation + 90) % 360;
    this.renderImage();
  }
  
  zoomIn() {
    this.imageState.scale = Math.min(this.imageState.scale * 1.2, 3);
    this.canvas.width = this.imageState.width * this.imageState.scale;
    this.canvas.height = this.imageState.height * this.imageState.scale;
    this.renderImage();
  }
  
  zoomOut() {
    this.imageState.scale = Math.max(this.imageState.scale / 1.2, 0.1);
    this.canvas.width = this.imageState.width * this.imageState.scale;
    this.canvas.height = this.imageState.height * this.imageState.scale;
    this.renderImage();
  }
  
  // Export functions
  exportImage() {
    if (!this.image) return;
    
    this.showLoading();
    
    // Calculate actual crop coordinates in original image space
    const scale = this.imageState.scale;
    const actualCropX = (this.cropArea.x - this.imageState.offsetX) / scale;
    const actualCropY = (this.cropArea.y - this.imageState.offsetY) / scale;
    const actualCropWidth = this.cropArea.width / scale;
    const actualCropHeight = this.cropArea.height / scale;
    
    // Create temporary canvas for cropping
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = actualCropWidth;
    tempCanvas.height = actualCropHeight;
    
    // Apply rotation if needed
    if (this.imageState.rotation !== 0) {
      tempCtx.save();
      tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
      tempCtx.rotate(this.imageState.rotation * Math.PI / 180);
      tempCtx.drawImage(
        this.originalImage,
        -actualCropWidth / 2,
        -actualCropHeight / 2,
        actualCropWidth,
        actualCropHeight
      );
      tempCtx.restore();
    } else {
      tempCtx.drawImage(
        this.originalImage,
        actualCropX,
        actualCropY,
        actualCropWidth,
        actualCropHeight,
        0,
        0,
        actualCropWidth,
        actualCropHeight
      );
    }
    
    // Update preview
    this.previewCanvas.width = Math.min(400, actualCropWidth);
    this.previewCanvas.height = Math.min(400, actualCropHeight);
    
    const previewScale = Math.min(
      this.previewCanvas.width / actualCropWidth,
      this.previewCanvas.height / actualCropHeight
    );
    
    this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
    this.previewCtx.drawImage(
      tempCanvas,
      0,
      0,
      actualCropWidth,
      actualCropHeight,
      0,
      0,
      actualCropWidth * previewScale,
      actualCropHeight * previewScale
    );
    
    this.hideLoading();
    this.showPreview();
  }
  
  downloadImage() {
    if (!this.image) return;
    
    const format = document.getElementById('exportFormat').value;
    const quality = document.getElementById('exportQuality').value / 100;
    
    // Calculate actual crop coordinates
    const scale = this.imageState.scale;
    const actualCropX = (this.cropArea.x - this.imageState.offsetX) / scale;
    const actualCropY = (this.cropArea.y - this.imageState.offsetY) / scale;
    const actualCropWidth = this.cropArea.width / scale;
    const actualCropHeight = this.cropArea.height / scale;
    
    // Create temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = actualCropWidth;
    tempCanvas.height = actualCropHeight;
    
    // Apply rotation if needed
    if (this.imageState.rotation !== 0) {
      tempCtx.save();
      tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
      tempCtx.rotate(this.imageState.rotation * Math.PI / 180);
      tempCtx.drawImage(
        this.originalImage,
        -actualCropWidth / 2,
        -actualCropHeight / 2,
        actualCropWidth,
        actualCropHeight
      );
      tempCtx.restore();
    } else {
      tempCtx.drawImage(
        this.originalImage,
        actualCropX,
        actualCropY,
        actualCropWidth,
        actualCropHeight,
        0,
        0,
        actualCropWidth,
        actualCropHeight
      );
    }
    
    // Convert to blob and download
    tempCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cropped-image.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, `image/${format}`, quality);
  }
  
  // UI functions
  showEditor() {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('editorSection').style.display = 'block';
    document.getElementById('previewSection').style.display = 'none';
  }
  
  showPreview() {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('editorSection').style.display = 'none';
    document.getElementById('previewSection').style.display = 'block';
  }
  
  updateImageInfo() {
    if (this.originalImage) {
      document.getElementById('originalSize').textContent = 
        `${this.originalImage.width} × ${this.originalImage.height}`;
      document.getElementById('currentSize').textContent = 
        `${Math.round(this.canvas.width)} × ${Math.round(this.canvas.height)}`;
    }
  }
  
  updateCropInfo() {
    document.getElementById('cropSize').textContent = 
      `${Math.round(this.cropArea.width)} × ${Math.round(this.cropArea.height)}`;
  }
  
  updateQualityControl(format) {
    const qualityGroup = document.getElementById('qualityGroup');
    if (format === 'jpeg' || format === 'webp') {
      qualityGroup.style.display = 'block';
    } else {
      qualityGroup.style.display = 'none';
    }
  }
  
  showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
  }
  
  hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
  }
  
  showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').style.display = 'flex';
  }
  
  updateUI() {
    // Update quality control visibility
    this.updateQualityControl(document.getElementById('exportFormat').value);
  }
}

// Global functions for HTML onclick handlers
function closeErrorModal() {
  document.getElementById('errorModal').style.display = 'none';
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ImageCropper();
}); 