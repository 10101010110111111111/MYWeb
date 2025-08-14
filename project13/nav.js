(function(){
  // Create and insert the global navigation
  function createGlobalNav() {
    const nav = document.createElement('nav');
    nav.className = 'global-nav border-b border-gray-700 bg-gray-800';
    nav.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <!-- Mobile menu button -->
          <div class="flex md:hidden w-full justify-between items-center">
            <div class="flex items-center gap-2">
              <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span class="text-xl font-mono text-green-400">sender</span>
            </div>
            <button id="mobile-menu-btn" class="text-gray-400 hover:text-white md:hidden">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
          
          <!-- Desktop logo -->
          <div class="hidden md:flex items-center gap-2">
            <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <span class="text-xl font-mono text-green-400">sender</span>
          </div>

          <!-- Navigation links -->
          <div id="nav-links" class="hidden md:flex items-center gap-6 w-full md:w-auto">
            <a href="index.html" class="nav-link text-gray-300 hover:text-green-400 font-mono transition-colors">home</a>
            <a href="upload.html" class="nav-link text-gray-300 hover:text-green-400 font-mono transition-colors">upload</a>
            <a href="retrieve.html" class="nav-link text-gray-300 hover:text-green-400 font-mono transition-colors">retrieve</a>
            <a href="packages.html" class="nav-link text-gray-300 hover:text-green-400 font-mono transition-colors">packages</a>
            <a href="dashboard.html" class="nav-link text-gray-300 hover:text-green-400 font-mono transition-colors">dashboard</a>
            <a href="admin.html" class="nav-link text-gray-300 hover:text-green-400 font-mono transition-colors admin-link" style="display: none;">admin</a>
          </div>

          <!-- User actions -->
          <div class="flex items-center gap-3 w-full md:w-auto justify-end">
            <div id="auth-buttons" class="flex gap-3">
              <button onclick="showLogin()" class="btn btn-outline">login</button>
              <button onclick="showRegister()" class="btn btn-primary">register</button>
            </div>
            <div id="user-actions" class="hidden flex items-center gap-4">
              <span class="text-green-400 font-mono text-sm" id="user-info">$ whoami: loading...</span>
              <button onclick="logout()" class="btn btn-outline">logout</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert after header
    const header = document.querySelector('header');
    if (header) {
      header.parentNode.insertBefore(nav, header.nextSibling);
    }

    // Add mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('hidden');
        navLinks.classList.toggle('flex');
        navLinks.classList.toggle('flex-col');
        navLinks.classList.toggle('w-full');
        navLinks.classList.toggle('gap-4');
        navLinks.classList.toggle('pt-4');
        navLinks.classList.toggle('border-t');
        navLinks.classList.toggle('border-gray-700');
      });
    }

    // Set active link
    setActiveLink();
  }

  // Set active navigation link
  function setActiveLink() {
    const links = document.querySelectorAll('.nav-link');
    const path = location.pathname.split('/').pop() || 'index.html';
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href === path) {
        link.classList.add('active');
        link.classList.remove('text-gray-300');
        link.classList.add('text-green-400');
      }
    });
  }

  // Check if user is authenticated and show appropriate UI
  function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userActions = document.getElementById('user-actions');
    const adminLink = document.querySelector('.admin-link');
    
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
      if (authButtons) authButtons.classList.add('hidden');
      if (userActions) userActions.classList.remove('hidden');
      
      // Show admin link if user is admin
      if (typeof isAdmin === 'function' && isAdmin() && adminLink) {
        adminLink.style.display = 'block';
      }
    } else {
      if (authButtons) authButtons.classList.remove('hidden');
      if (userActions) userActions.classList.add('hidden');
    }
  }

  // Initialize navigation when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      createGlobalNav();
      updateAuthUI();
    });
  } else {
    createGlobalNav();
    updateAuthUI();
  }

  // Update auth UI when authentication state changes
  if (typeof window !== 'undefined') {
    window.addEventListener('authStateChanged', updateAuthUI);
  }
})();
