// ===== DROPSHIPPING E-SHOP JAVASCRIPT =====

// Sample product data (in real app, this would come from a database)
const products = [
    {
        id: 1,
        name: "🔥 MEGA VAPE PRO 3000",
        category: "vapes",
        price: 2499,
        oldPrice: 3499,
        image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop",
        description: "Ultimate vaping experience s 3000mAh baterií a 8ml tankem. Pro true vapers!",
        rating: 4.9,
        reviews: 156,
        badge: "🔥 HOT",
        sizes: ["One Size"],
        colors: ["Černá", "Stříbrná", "RGB"],
        inStock: true
    },
    {
        id: 2,
        name: "💨 COOL GRINDER PRO",
        category: "grinders",
        price: 899,
        oldPrice: 1299,
        image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop",
        description: "Profesionální 4-dílný grinder s kovovými zuby. Perfect grind každý den!",
        rating: 4.8,
        reviews: 89,
        badge: "💨 TOP",
        sizes: ["Medium", "Large"],
        colors: ["Černá", "Zlatá", "Stříbrná"],
        inStock: true
    },
    {
        id: 3,
        name: "⚡ VAPE BATTERY 5000mAh",
        category: "accessories",
        price: 599,
        oldPrice: 799,
        image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop",
        description: "Super výkonná baterie s rychlým nabíjením. Vydrží celý den!",
        rating: 4.7,
        reviews: 203,
        badge: "⚡ POWER",
        sizes: ["One Size"],
        colors: ["Černá", "Modrá", "Červená"],
        inStock: true
    },
    {
        id: 4,
        name: "🌈 COOL LIQUID PACK",
        category: "liquids",
        price: 399,
        oldPrice: 599,
        image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop",
        description: "5x 10ml cool liquids s různými příchutěmi. Ultimate flavor experience!",
        rating: 4.9,
        reviews: 167,
        badge: "🌈 FLAVOR",
        sizes: ["5x10ml"],
        colors: ["Mix"],
        inStock: true
    },
    {
        id: 5,
        name: "🔥 VAPE COIL SET",
        category: "accessories",
        price: 299,
        oldPrice: 449,
        image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop",
        description: "10x náhradních coilů pro maximální výkon a chuť. Pro profesionály!",
        rating: 4.6,
        reviews: 98,
        badge: "🔥 COILS",
        sizes: ["0.5ohm", "1.0ohm"],
        colors: ["Mix"],
        inStock: true
    },
    {
        id: 6,
        name: "💨 VAPE TANK GLASS",
        category: "accessories",
        price: 199,
        oldPrice: 299,
        image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop",
        description: "Náhradní skleněný tank s cool designem. Unbreakable!",
        rating: 4.5,
        reviews: 76,
        badge: "💨 GLASS",
        sizes: ["5ml", "8ml"],
        colors: ["Průhledná", "Modrá", "Červená"],
        inStock: true
    }
];

// App state
let cart = [];
let wishlist = [];
let currentUser = null;
let filteredProducts = [...products];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortSelect = document.getElementById('sortSelect');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const wishlistBtn = document.getElementById('wishlistBtn');
const wishlistCount = document.getElementById('wishlistCount');
const userBtn = document.getElementById('userBtn');
const newsletterBtn = document.getElementById('newsletterBtn');
const newsletterEmail = document.getElementById('newsletterEmail');

// Modals
const productModal = document.getElementById('productModal');
const cartModal = document.getElementById('cartModal');
const userModal = document.getElementById('userModal');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadFromLocalStorage();
    renderProducts();
    updateCartCount();
    updateWishlistCount();
});

function initializeApp() {
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    sortSelect.addEventListener('change', handleSort);
    
    cartBtn.addEventListener('click', () => openModal(cartModal));
    wishlistBtn.addEventListener('click', () => openModal(wishlistBtn));
    userBtn.addEventListener('click', () => openModal(userModal));
    
    newsletterBtn.addEventListener('click', handleNewsletter);
    
    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            filterByCategory(category);
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeAllModals);
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // User modal switches
    document.getElementById('showRegister').addEventListener('click', showRegisterForm);
    document.getElementById('showLogin').addEventListener('click', showLoginForm);
    
    // Form submissions
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
}

function renderProducts() {
    productsGrid.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-actions">
                <button class="action-btn" onclick="addToWishlist(${product.id})" title="Přidat do oblíbených">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="action-btn" onclick="quickView(${product.id})" title="Rychlý náhled">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <div class="product-category">${getCategoryName(product.category)}</div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">
                <span class="current-price">${product.price} Kč</span>
                ${product.oldPrice ? `<span class="old-price">${product.oldPrice} Kč</span>` : ''}
            </div>
            <div class="product-rating">
                <span class="stars">${stars}</span>
                <span class="rating-text">${product.rating} (${product.reviews})</span>
            </div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                Přidat do košíku
            </button>
        </div>
    `;
    
    return card;
}

function getCategoryName(category) {
    const categories = {
        'vapes': '🔥 Vapes',
        'accessories': '⚡ Accessories',
        'liquids': '🌈 Liquids',
        'grinders': '💨 Grinders'
    };
    return categories[category] || category;
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            getCategoryName(product.category).toLowerCase().includes(searchTerm)
        );
    }
    
    renderProducts();
}

function handleSort() {
    const sortBy = sortSelect.value;
    
    switch (sortBy) {
        case 'newest':
            filteredProducts.sort((a, b) => b.id - a.id);
            break;
        case 'popular':
            filteredProducts.sort((a, b) => b.reviews - a.reviews);
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
    }
    
    renderProducts();
}

function filterByCategory(category) {
    if (category === 'all') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => product.category === category);
    }
    
    renderProducts();
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.nav-link[href="#products"]').classList.add('active');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            selectedSize: product.sizes[0],
            selectedColor: product.colors[0]
        });
    }
    
    updateCartCount();
    saveToLocalStorage();
    showNotification('Produkt přidán do košíku!', 'success');
}

function addToWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = wishlist.find(item => item.id === productId);
    
    if (existingItem) {
        wishlist = wishlist.filter(item => item.id !== productId);
        showNotification('Produkt odebrán z oblíbených', 'info');
    } else {
        wishlist.push(product);
        showNotification('Produkt přidán do oblíbených!', 'success');
    }
    
    updateWishlistCount();
    saveToLocalStorage();
}

function quickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const productDetail = document.getElementById('productDetail');
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    
    productDetail.innerHTML = `
        <div class="product-gallery">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info-detail">
            <h2>${product.name}</h2>
            <div class="product-price-detail">
                ${product.price} Kč
                ${product.oldPrice ? `<span class="old-price">${product.oldPrice} Kč</span>` : ''}
            </div>
            <div class="product-rating">
                <span class="stars">${stars}</span>
                <span class="rating-text">${product.rating} (${product.reviews} recenzí)</span>
            </div>
            <p class="product-description">${product.description}</p>
            
            <div class="product-options">
                ${product.sizes.length > 1 ? `
                    <div class="option-group">
                        <label>Velikost:</label>
                        <div class="option-buttons">
                            ${product.sizes.map(size => `<button class="option-btn" data-size="${size}">${size}</button>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${product.colors.length > 1 ? `
                    <div class="option-group">
                        <label>Barva:</label>
                        <div class="option-buttons">
                            ${product.colors.map(color => `<button class="option-btn" data-color="${color}">${color}</button>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="quantity-selector">
                <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                <input type="number" class="quantity-input" value="1" min="1" max="99" id="productQuantity">
                <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
            </div>
            
            <button class="add-to-cart" onclick="addToCartFromModal(${product.id})">
                Přidat do košíku
            </button>
        </div>
    `;
    
    // Set default selections
    if (product.sizes.length > 1) {
        productDetail.querySelector('[data-size]').classList.add('active');
    }
    if (product.colors.length > 1) {
        productDetail.querySelector('[data-color]').classList.add('active');
    }
    
    // Add event listeners for option buttons
    productDetail.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            productDetail.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    openModal(productModal);
}

function changeQuantity(delta) {
    const input = document.getElementById('productQuantity');
    const newValue = Math.max(1, Math.min(99, parseInt(input.value) + delta));
    input.value = newValue;
}

function addToCartFromModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const selectedSize = document.querySelector('.option-btn[data-size].active')?.dataset.size || product.sizes[0];
    const selectedColor = document.querySelector('.option-btn[data-color].active')?.dataset.color || product.colors[0];
    
    const existingItem = cart.find(item => 
        item.id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
    );
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity,
            selectedSize: selectedSize,
            selectedColor: selectedColor
        });
    }
    
    updateCartCount();
    saveToLocalStorage();
    closeAllModals();
    showNotification('Produkt přidán do košíku!', 'success');
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function updateWishlistCount() {
    wishlistCount.textContent = wishlist.length;
}

function openModal(modal) {
    if (modal === cartModal) {
        renderCart();
    }
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Košík je prázdný</p>';
        cartTotal.textContent = '0 Kč';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price} Kč</div>
                ${item.selectedSize ? `<small>Velikost: ${item.selectedSize}</small>` : ''}
                ${item.selectedColor ? `<small>Barva: ${item.selectedColor}</small>` : ''}
            </div>
            <div class="cart-item-actions">
                <button onclick="updateCartQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.id}, 1)">+</button>
                <button onclick="removeFromCart(${item.id})" style="color: red;">×</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${total} Kč`;
}

function updateCartQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += delta;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartCount();
        renderCart();
        saveToLocalStorage();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCart();
    saveToLocalStorage();
    showNotification('Produkt odebrán z košíku', 'info');
}

function handleNewsletter() {
    const email = newsletterEmail.value.trim();
    
    if (!email || !isValidEmail(email)) {
        showNotification('Zadejte platný e-mail', 'error');
        return;
    }
    
    showNotification('Úspěšně přihlášeno k newsletteru!', 'success');
    newsletterEmail.value = '';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Vyplňte všechna pole', 'error');
        return;
    }
    
    // Simulate login (in real app, this would be an API call)
    currentUser = { email, name: email.split('@')[0] };
    saveToLocalStorage();
    closeAllModals();
    showNotification('Úspěšně přihlášeno!', 'success');
}

function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
        showNotification('Vyplňte všechna pole', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Zadejte platný e-mail', 'error');
        return;
    }
    
    // Simulate registration (in real app, this would be an API call)
    currentUser = { email, name };
    saveToLocalStorage();
    closeAllModals();
    showNotification('Úspěšně registrováno!', 'success');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function saveToLocalStorage() {
    localStorage.setItem('dropshop_cart', JSON.stringify(cart));
    localStorage.setItem('dropshop_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('dropshop_user', JSON.stringify(currentUser));
}

function loadFromLocalStorage() {
    try {
        const savedCart = localStorage.getItem('dropshop_cart');
        const savedWishlist = localStorage.getItem('dropshop_wishlist');
        const savedUser = localStorage.getItem('dropshop_user');
        
        if (savedCart) cart = JSON.parse(savedCart);
        if (savedWishlist) wishlist = JSON.parse(savedWishlist);
        if (savedUser) currentUser = JSON.parse(savedUser);
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
}); 