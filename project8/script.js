// Image Cropper Application - Simplified and Working Version
class ImageCropper {
  constructor() {
    this.image = null;
    this.originalImage = null;
    this.canvas = document.getElementById('imageCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.previewCanvas = document.getElementById('previewCanvas');
    this.previewCtx = this.previewCanvas.getContext('2d');
    
    // Simple crop area state
    this.cropArea = {
      x: 100,
      y: 100,
      width: 200,
      height: 200
    };
    
    // Image state
    this.imageState = {
      width: 0,
      height: 0,
      scale: 1,
      rotation: 0
    };
    
    // Movement state
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    
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
    
    // Simple mouse events for crop area movement
    this.setupCropAreaMovement();
    
    // Keyboard controls
    this.setupKeyboardControls();
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
  
  setupCropAreaMovement() {
    const cropOverlay = document.getElementById('cropOverlay');
    
    // Prevent context menu
    cropOverlay.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Mouse events
    cropOverlay.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.startDrag(e);
      }
    });
    
    cropOverlay.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.drag(e);
      }
    });
    
    document.addEventListener('mouseup', () => {
      this.stopDrag();
    });
    
    // Touch events
    cropOverlay.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDrag(e.touches[0]);
    });
    
    cropOverlay.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        e.preventDefault();
        this.drag(e.touches[0]);
      }
    });
    
    cropOverlay.addEventListener('touchend', () => {
      this.stopDrag();
    });
    
    // Click to move crop area
    cropOverlay.addEventListener('click', (e) => {
      if (!this.isDragging) {
        this.moveCropAreaToClick(e);
      }
    });
  }
  
  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.image) return;
      
      const speed = e.shiftKey ? 20 : 5;
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.moveCropArea(0, -speed);
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.moveCropArea(0, speed);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.moveCropArea(-speed, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.moveCropArea(speed, 0);
          break;
        case ' ':
          e.preventDefault();
          this.centerCropArea();
          break;
      }
    });
  }
  
  startDrag(e) {
    this.isDragging = true;
    const rect = this.canvas.getBoundingClientRect();
    this.dragStart = {
      x: e.clientX - rect.left - this.cropArea.x,
      y: e.clientY - rect.top - this.cropArea.y
    };
  }
  
  drag(e) {
    if (!this.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const newX = e.clientX - rect.left - this.dragStart.x;
    const newY = e.clientY - rect.top - this.dragStart.y;
    
    this.cropArea.x = Math.max(-this.cropArea.width + 10, Math.min(newX, this.canvas.width - 10));
    this.cropArea.y = Math.max(-this.cropArea.height + 10, Math.min(newY, this.canvas.height - 10));
    
    this.updateCropAreaDisplay();
    this.updateCropInputs();
  }
  
  stopDrag() {
    this.isDragging = false;
  }
  
  moveCropAreaToClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    this.cropArea.x = clickX - this.cropArea.width / 2;
    this.cropArea.y = clickY - this.cropArea.height / 2;
    
    // Apply constraints
    this.cropArea.x = Math.max(-this.cropArea.width + 10, Math.min(this.cropArea.x, this.canvas.width - 10));
    this.cropArea.y = Math.max(-this.cropArea.height + 10, Math.min(this.cropArea.y, this.canvas.height - 10));
    
    this.updateCropAreaDisplay();
    this.updateCropInputs();
  }
  
  moveCropArea(deltaX, deltaY) {
    this.cropArea.x += deltaX;
    this.cropArea.y += deltaY;
    
    // Apply constraints
    this.cropArea.x = Math.max(-this.cropArea.width + 10, Math.min(this.cropArea.x, this.canvas.width - 10));
    this.cropArea.y = Math.max(-this.cropArea.height + 10, Math.min(this.cropArea.y, this.canvas.height - 10));
    
    this.updateCropAreaDisplay();
    this.updateCropInputs();
  }
  
  centerCropArea() {
    this.cropArea.x = (this.canvas.width - this.cropArea.width) / 2;
    this.cropArea.y = (this.canvas.height - this.cropArea.height) / 2;
    
    this.updateCropAreaDisplay();
    this.updateCropInputs();
  }
  
  handleFileSelect(file) {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      this.showError('Prosím vyberte obrázek.');
      return;
    }
    
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
      rotation: 0
    };
  }
  
  setupCanvas() {
    const container = document.getElementById('imageContainer');
    const containerRect = container.getBoundingClientRect();
    
    // Calculate scale to fit image in container
    const maxWidth = Math.min(containerRect.width - 40, this.imageState.width * 2);
    const maxHeight = Math.min(containerRect.height - 40, this.imageState.height * 2);
    
    const scaleX = maxWidth / this.imageState.width;
    const scaleY = maxHeight / this.imageState.height;
    this.imageState.scale = Math.min(scaleX, scaleY, 2);
    
    // Set canvas size
    this.canvas.width = this.imageState.width * this.imageState.scale;
    this.canvas.height = this.imageState.height * this.imageState.scale;
    
    // Set container height
    const containerHeight = Math.max(this.canvas.height + 40, 400);
    container.style.height = containerHeight + 'px';
    
    this.renderImage();
  }
  
  initializeCropArea() {
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
    
    this.ctx.save();
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
  
  exportImage() {
    if (!this.image) return;
    
    this.showLoading();
    
    // Calculate crop coordinates
    const scale = this.imageState.scale;
    const actualCropX = this.cropArea.x / scale;
    const actualCropY = this.cropArea.y / scale;
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
    
    // Calculate crop coordinates
    const scale = this.imageState.scale;
    const actualCropX = this.cropArea.x / scale;
    const actualCropY = this.cropArea.y / scale;
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
    this.updateQualityControl(document.getElementById('exportFormat').value);
  }
}

// Global functions
function closeErrorModal() {
  document.getElementById('errorModal').style.display = 'none';
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new ImageCropper();
}); 