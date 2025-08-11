// ===== GLOBAL VARIABLES =====
let cart = []
let cartCount = 0
let currentSlideIndex = 0
let slideInterval

// ===== DOM CONTENT LOADED =====
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation()
  // Wait a bit longer for images to load
  setTimeout(() => {
    initializeCarousel()
  }, 100)
  initializeFilters()
  initializeShop()
  initializeGallery()
  initializeForms()
  updateCartDisplay()
})

// ===== HERO CAROUSEL =====
function initializeCarousel() {
  const slides = document.querySelectorAll('.carousel-slide')
  const dots = document.querySelectorAll('.dot')
  
  if (slides.length === 0) return
  
  // Set background images with fallback
  slides.forEach((slide, index) => {
    const bgImage = slide.getAttribute('data-bg')
    if (bgImage) {
      // Create a test image to check if it loads
      const testImg = new Image()
      testImg.onload = () => {
        slide.style.backgroundImage = `url('${bgImage}')`
      }
      testImg.onerror = () => {
        // Fallback to next available image
        const fallbackImages = [
          'images/HeroSection/36402.jpeg',
          'images/HeroSection/36421.jpeg',
          'images/HeroSection/kapela.jpg'
        ]
        const fallbackIndex = index % fallbackImages.length
        slide.style.backgroundImage = `url('${fallbackImages[fallbackIndex]}')`
        console.warn(`Failed to load image: ${bgImage}, using fallback: ${fallbackImages[fallbackIndex]}`)
      }
      testImg.src = bgImage
    }
  })
  
  // Start automatic slideshow
  startSlideshow()
  
  // Pause on hover
  const carousel = document.querySelector('.hero-carousel')
  if (carousel) {
    carousel.addEventListener('mouseenter', stopSlideshow)
    carousel.addEventListener('mouseleave', startSlideshow)
  }
}

function startSlideshow() {
  stopSlideshow() // Clear any existing interval
  slideInterval = setInterval(() => {
    changeSlide(1)
  }, 3000) // Change slide every 3 seconds
}

function stopSlideshow() {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
}

function changeSlide(direction) {
  const slides = document.querySelectorAll('.carousel-slide')
  const dots = document.querySelectorAll('.dot')
  
  if (slides.length === 0) return
  
  // Remove active class from current slide and dot
  slides[currentSlideIndex].classList.remove('active')
  dots[currentSlideIndex].classList.remove('active')
  
  // Calculate new slide index
  currentSlideIndex += direction
  
  if (currentSlideIndex >= slides.length) {
    currentSlideIndex = 0
  } else if (currentSlideIndex < 0) {
    currentSlideIndex = slides.length - 1
  }
  
  // Add active class to new slide and dot
  slides[currentSlideIndex].classList.add('active')
  dots[currentSlideIndex].classList.add('active')
}

function currentSlide(n) {
  const slides = document.querySelectorAll('.carousel-slide')
  const dots = document.querySelectorAll('.dot')
  
  if (slides.length === 0) return
  
  // Remove active class from current slide and dot
  slides[currentSlideIndex].classList.remove('active')
  dots[currentSlideIndex].classList.remove('active')
  
  // Set new slide index
  currentSlideIndex = n - 1
  
  // Add active class to new slide and dot
  slides[currentSlideIndex].classList.add('active')
  dots[currentSlideIndex].classList.add('active')
  
  // Restart slideshow
  startSlideshow()
}

// ===== NAVIGATION FUNCTIONS =====
function initializeNavigation() {
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      }
    })
  }
}

// ===== CONCERT FILTERS =====
function initializeFilters() {
  // Concert filters
  const filterButtons = document.querySelectorAll(".filter-btn")
  const concertCards = document.querySelectorAll(".concert-card")

  if (filterButtons.length > 0) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"))
        // Add active class to clicked button
        this.classList.add("active")

        const filter = this.getAttribute("data-filter")
        filterConcerts(filter)
      })
    })
  }

  function filterConcerts(typeFilter) {
    concertCards.forEach((card) => {
      const cardType = card.classList.contains("upcoming") ? "upcoming" : "past"

      let showCard = true

      // Filter by type only
      if (typeFilter !== "all" && cardType !== typeFilter) {
        showCard = false
      }

      card.style.display = showCard ? "grid" : "none"
    })
  }

  // Product category filters
  const categoryButtons = document.querySelectorAll(".category-btn")
  const productCards = document.querySelectorAll(".product-card")

  if (categoryButtons.length > 0) {
    categoryButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        categoryButtons.forEach((btn) => btn.classList.remove("active"))
        // Add active class to clicked button
        this.classList.add("active")

        const category = this.getAttribute("data-category")
        filterProducts(category)
      })
    })
  }

  function filterProducts(category) {
    productCards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category")

      if (category === "all" || cardCategory === category) {
        card.style.display = "block"
        // Add fade in animation
        card.style.animation = "fadeIn 0.5s ease-out"
      } else {
        card.style.display = "none"
      }
    })
  }
}

// ===== SHOP FUNCTIONS =====
function initializeShop() {
  const addToCartButtons = document.querySelectorAll(".add-to-cart")

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productName = this.getAttribute("data-product")
      const productPrice = Number.parseFloat(this.getAttribute("data-price"))

      addToCart(productName, productPrice)

      // Visual feedback
      this.textContent = "Added!"
      this.style.backgroundColor = "#28a745"

      setTimeout(() => {
        this.textContent = "Add to Cart"
        this.style.backgroundColor = ""
      }, 1500)
    })
  })
}

function addToCart(name, price) {
  // Check if item already exists in cart
  const existingItem = cart.find((item) => item.name === name)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      name: name,
      price: price,
      quantity: 1,
    })
  }

  cartCount++
  updateCartDisplay()
  showCartSummary()
}

function updateCartDisplay() {
  const cartCountElement = document.getElementById("cartCount")
  if (cartCountElement) {
    cartCountElement.textContent = cartCount
  }

  updateCartSummary()
}

function updateCartSummary() {
  const cartItems = document.getElementById("cartItems")
  const cartTotal = document.getElementById("cartTotal")

  if (cartItems && cartTotal) {
    cartItems.innerHTML = ""
    let total = 0

    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity
      total += itemTotal

      const cartItem = document.createElement("div")
      cartItem.className = "cart-item"
      cartItem.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>$${itemTotal.toFixed(2)}</span>
            `
      cartItems.appendChild(cartItem)
    })

    cartTotal.textContent = total.toFixed(2)
  }
}

function showCartSummary() {
  const cartSummary = document.getElementById("cartSummary")
  if (cartSummary && cart.length > 0) {
    cartSummary.style.display = "block"
    cartSummary.scrollIntoView({ behavior: "smooth" })
  }
}

function clearCart() {
  cart = []
  cartCount = 0
  updateCartDisplay()

  const cartSummary = document.getElementById("cartSummary")
  if (cartSummary) {
    cartSummary.style.display = "none"
  }
}

// ===== GALLERY FUNCTIONS =====
function initializeGallery() {
  const modal = document.getElementById("imageModal")
  const modalImg = document.getElementById("modalImage")

  if (modal && modalImg) {
    // Close modal when clicking the X
    document.querySelector(".modal-close").addEventListener("click", closeModal)

    // Close modal when clicking outside the image
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal()
      }
    })

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal()
      }
    })
  }
}

function openModal(element) {
  const modal = document.getElementById("imageModal")
  const modalImg = document.getElementById("modalImage")
  const img = element.querySelector("img")

  if (modal && modalImg && img) {
    modal.style.display = "block"
    modalImg.src = img.src
    modalImg.alt = img.alt

    // Prevent body scrolling
    document.body.style.overflow = "hidden"
  }
}

function closeModal() {
  const modal = document.getElementById("imageModal")
  if (modal) {
    modal.style.display = "none"
    // Restore body scrolling
    document.body.style.overflow = "auto"
  }
}

// ===== FORM FUNCTIONS =====
function initializeForms() {
  // Contact forms
  const contactForms = document.querySelectorAll(".contact-form")
  contactForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault()

      // Get form data
      const email = this.querySelector('input[type="email"]').value
      const message = this.querySelector("textarea").value

      if (email && message) {
        // Simulate form submission
        alert("Thank you for your message! We'll get back to you soon.")
        this.reset()
      } else {
        alert("Please fill in all fields.")
      }
    })
  })

  // Newsletter form
  const newsletterForm = document.querySelector(".newsletter-form")
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const email = this.querySelector(".newsletter-input").value

      if (email) {
        // Simulate newsletter subscription
        alert("Thank you for subscribing to our newsletter!")
        this.reset()
      } else {
        alert("Please enter your email address.")
      }
    })
  }
}

// ===== SMOOTH SCROLLING =====
function smoothScroll(target) {
  const element = document.querySelector(target)
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
}

// ===== LAZY LOADING FOR IMAGES =====
function initializeLazyLoading() {
  const images = document.querySelectorAll("img[data-src]")

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.remove("lazy")
        imageObserver.unobserve(img)
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))
}

// ===== SCROLL ANIMATIONS =====
function initializeScrollAnimations() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll")

  const animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated")
        }
      })
    },
    {
      threshold: 0.1,
    },
  )

  animatedElements.forEach((el) => animationObserver.observe(el))
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounced resize handler
const handleResize = debounce(() => {
  // Handle responsive adjustments
  updateLayout()
}, 250)

function updateLayout() {
  // Update any layout-dependent calculations
  const videos = document.querySelectorAll(".video-container iframe")
  videos.forEach((video) => {
    // Ensure proper aspect ratio on resize
    const container = video.parentElement
    if (container) {
      const width = container.offsetWidth
      const height = (width * 9) / 16 // 16:9 aspect ratio
      video.style.height = height + "px"
    }
  })
}

window.addEventListener("resize", handleResize)

// ===== ACCESSIBILITY ENHANCEMENTS =====
function initializeAccessibility() {
  // Add keyboard navigation for custom elements
  const customButtons = document.querySelectorAll(".filter-btn, .category-btn")

  customButtons.forEach((button) => {
    button.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        this.click()
      }
    })
  })

  // Add ARIA labels for screen readers
  const cartCount = document.getElementById("cartCount")
  if (cartCount) {
    cartCount.setAttribute("aria-label", `${cartCount.textContent} items in shopping cart`)
  }
}

// Initialize accessibility features
document.addEventListener("DOMContentLoaded", initializeAccessibility)

// ===== ERROR HANDLING =====
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error)
  // In production, you might want to send this to an error tracking service
})

// ===== PROGRESSIVE ENHANCEMENT =====
// Check for modern browser features
if ("IntersectionObserver" in window) {
  initializeLazyLoading()
  initializeScrollAnimations()
}

// Service Worker registration (for future PWA features)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // navigator.serviceWorker.register('/sw.js')
    //     .then(registration => console.log('SW registered'))
    //     .catch(error => console.log('SW registration failed'));
  })
}
