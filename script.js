// ===== MARIAN'S PORTFOLIO - ENHANCED JAVASCRIPT =====

// Project data with better descriptions, passwords and status
const projectList = [
  {
    path: "./project1/index.html",
    name: "Projekt 1 - WEB Skupiny Čihy",
    description: "Moderní webová aplikace/obchodní web",
    category: "Web Development",
    status: "in-progress",
    password: null,
    progress: 21
  },
  {
    path: "./project2/index.html", 
    name: "Projekt 2 - conect 5 piškvorky",
    description: "cvičení ai a programování ai",
    category: "Gaming",
    status: "done",
    password: null,
    progress: 100
  },
  {
    path: "./project3/index.html",
    name: "Projekt 3 - BJ Full Counter",
    description: "Top secret",
    category: "Tools",
    status: "done",
    password: "tools2024",
    progress: 100
  },
  {
    path: "./project4/index.html",
    name: "Projekt 4 - Texas Hold'em Simulator",
    description: "Simulátor handu v pokeru Texas Hold'em",
    category: "Gaming",
    status: "done",
    password: null,
    progress: 100
  },
  {
    path: "./project5/index.html",
    name: "Projekt 5 - Black Jack Simulator",
    description: "Simulace Black Jacku",
    category: "Gaming",
    status: "done",
    password: "blackjack2024",
    progress: 100
  },
  {
    path: "./project6/index.html",
    name: "Projekt 6 - DropShop E-commerce",
    description: "Dropshipping e-shop s moderním designem",
    category: "Web Development",
    status: "done",
    password: "dropshop2024",
    progress: 100
  },
  {
    path: "./project7/index.html",
    name: "Projekt 7 - Time Coin Tracker",
    description: "Aplikace pro sledování a správu času pomocí coin systému",
    category: "Productivity",
    status: "in-progress",
    password: null,
    progress: 85
  },
  {
    path: "./project8/index.html",
    name: "Projekt 8 - Image Cropper",
    description: "Nástroj pro ořezávání obrázků s interaktivním rozhraním (zrušeno)",
    category: "Tools",
    status: "cancelled",
    password: null,
    progress: 0
  },
  {
    path: "./project9/index.html",
    name: "Projekt 9 - Poker Calculator",
    description: "Kalkulačka pravděpodobností pro Texas Hold'em s Monte Carlo simulací",
    category: "Gaming",
    status: "done",
    password: null,
    progress: 100
  },
  {
    path: "./project10/index.html",
    name: "Projekt 10 - Atomové návyky",
    description: "Webová aplikace o knize Atomové návyky s trackerem návyků a audioknihou",
    category: "Productivity",
    status: "done",
    password: null,
    progress: 100
  },
  {
    path: "./project11/index.html",
    name: "Projekt 11 - Krypto Data Manager",
    description: "Pokročilý nástroj pro správu a aktualizaci dat kryptoměn s možností nahrávání souborů, vytváření nových časových rámců a stahování až 5000 svíček na soubor. Obsahuje návodovou sekci s barevnými legendami a review panel.",
    category: "Tools",
    status: "done",
    password: null,
    progress: 100
  },
  {
    path: "./project13/index.html",
    name: "Projekt 13 - React Aplikace",
    description: "Moderní React aplikace s interaktivními komponentami - počítadlo, todo list, statistiky a přepínání tématu. Demonstruje React hooks, state management a moderní UI design.",
    category: "Web Development",
    status: "done",
    password: null,
    progress: 100
  }
];

// DOM Elements
const themeToggle = document.getElementById("themeToggle");
const projectsGrid = document.getElementById("projectsGrid");
const projectSearch = document.getElementById("projectSearch");
const categoryFilter = document.getElementById("categoryFilter");
const iframe = document.getElementById("preview");
const refreshBtn = document.getElementById("refreshBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const closePreviewBtn = document.getElementById("closePreviewBtn");
const projectPreview = document.getElementById("projectPreview");
const previewProjectName = document.getElementById("previewProjectName");
const iframePlaceholder = document.querySelector(".iframe-placeholder");
const totalProjectsElement = document.getElementById("totalProjects");
const activeThemeElement = document.getElementById("activeTheme");
const profileImage = document.getElementById("profileImage");

// State
let currentTheme = 'dark'; // Force dark mode only
let filteredProjects = [];
let currentProject = null;
let unlockedProjects = JSON.parse(localStorage.getItem('unlockedProjects') || '[]');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  initializePortfolio();
  addEventListeners();
  updateStats();
  setTheme(currentTheme);
});

// Initialize portfolio
function initializePortfolio() {
  // Set theme
  setTheme(currentTheme);
  
  // Set initial project count
  if (totalProjectsElement) {
    totalProjectsElement.textContent = projectList.length;
  }
  
  // Check which projects actually exist
  checkExistingProjects();
  
  // Set default profile image if not exists
  if (profileImage) {
    profileImage.onerror = function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMDA2NmNjIi8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjUgMTMwQzI1IDExMCA0NSA5MCA3NSA5MEMxMDUgOTAgMTI1IDExMCAxMjUgMTMwIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
    };
  }
}

// Check which projects actually exist
function checkExistingProjects() {
  // For now, just use all projects from projectList
  // In the future, you can add actual file checking here
  const existingProjects = projectList;
  finishProjectCheck(existingProjects);
}

// Finish project check and render
function finishProjectCheck(existingProjects) {
  filteredProjects = existingProjects;
  
  // Update total projects count
  totalProjectsElement.textContent = existingProjects.length;
  
  // Render projects grid
  renderProjectsGrid();
  
  // Update category filter options
  updateCategoryFilter();
}

// Update category filter based on existing projects
function updateCategoryFilter() {
  const categories = [...new Set(filteredProjects.map(p => p.category))];
  
  // Clear existing options except the first one
  while (categoryFilter.children.length > 1) {
    categoryFilter.removeChild(categoryFilter.lastChild);
  }
  
  // Add new category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Add event listeners
function addEventListeners() {
  // Search and filter
  projectSearch.addEventListener("input", handleSearch);
  categoryFilter.addEventListener("change", handleFilter);
  
  // Preview controls
  refreshBtn.addEventListener("click", handleRefresh);
  fullscreenBtn.addEventListener("click", handleFullscreen);
  closePreviewBtn.addEventListener("click", closePreview);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // Add hover effects for stats
  addStatsHoverEffects();
}

// Theme management
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  
  // Update theme indicator
  if (activeThemeElement) {
    activeThemeElement.textContent = 'Dark';
  }
}

// Render projects grid
function renderProjectsGrid() {
  projectsGrid.innerHTML = '';
  
  if (filteredProjects.length === 0) {
    projectsGrid.innerHTML = `
      <div class="no-projects">
        <i class="fas fa-folder-open"></i>
        <h3>Žádné projekty nenalezeny</h3>
        <p>Přidejte své projekty do složek projekt1/, projekt2/, atd.</p>
      </div>
    `;
    return;
  }
  
  filteredProjects.forEach((project, index) => {
    const projectCard = createProjectCard(project, index);
    projectsGrid.appendChild(projectCard);
  });
  
  // Add fade-in animation
  const cards = projectsGrid.querySelectorAll('.project-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('fade-in');
  });
}

// Create project card
function createProjectCard(project, index) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.projectIndex = index;
  
  const isUnlocked = !project.password || unlockedProjects.includes(project.path);
  const statusInfo = getStatusInfo(project.status);
  
  card.innerHTML = `
    <div class="project-header">
      <div>
        <h3 class="project-title">${project.name}</h3>
        <div class="project-meta">
          <span class="project-category">${project.category}</span>
          <span class="project-status ${project.status}">
            <i class="${statusInfo.icon}"></i>
            ${statusInfo.text}
          </span>
        </div>
      </div>
      ${project.password ? `
        <div class="project-lock">
          <i class="fas ${isUnlocked ? 'fa-unlock' : 'fa-lock'}"></i>
        </div>
      ` : ''}
    </div>
    <p class="project-description">${project.description}</p>
    
    <div class="project-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${project.progress}%"></div>
      </div>
      <span class="progress-text">${project.progress}% hotovo</span>
    </div>
    
    <div class="project-actions">
      ${isUnlocked ? `
        <button class="project-btn" onclick="previewProject(${index})">
          <i class="fas fa-eye"></i>
          Náhled
        </button>
        <button class="project-btn primary" onclick="openProject(${index})">
          <i class="fas fa-external-link-alt"></i>
          Otevřít
        </button>
      ` : `
        <button class="project-btn locked" onclick="showPasswordModal(${index})">
          <i class="fas fa-lock"></i>
          Zadej heslo
        </button>
      `}
    </div>
  `;
  
  return card;
}

 // Get status information
 function getStatusInfo(status) {
   const statusMap = {
     'done': {
       text: 'Dokončeno',
       icon: 'fas fa-check-circle',
       color: '#00ff00'
     },
     'in-progress': {
       text: 'Stále ve vývoji',
       icon: 'fas fa-clock',
       color: '#ffd700'
     },
     'cancelled': {
       text: 'Zrušeno',
       icon: 'fas fa-times-circle',
       color: '#ff0000'
     },
     'not-finished': {
       text: 'Nedokončeno',
       icon: 'fas fa-exclamation-triangle',
       color: '#ff6b35'
     }
   };
   
   return statusMap[status] || statusMap['not-finished'];
 }

// Show password modal
function showPasswordModal(index) {
  const project = filteredProjects[index];
  if (!project || !project.password) return;
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'password-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3><i class="fas fa-lock"></i> Chráněný projekt</h3>
        <button class="modal-close" onclick="closePasswordModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p><strong>${project.name}</strong> je chráněn heslem.</p>
        <div class="password-input-group">
          <input type="password" id="passwordInput" placeholder="Zadej heslo..." class="password-input">
          <button onclick="checkPassword(${index})" class="password-submit">
            <i class="fas fa-key"></i>
            Otevřít
          </button>
        </div>
        <div class="password-hint">
          <i class="fas fa-lightbulb"></i>
          Tip: Heslo je obvykle název projektu nebo rok
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus input
  setTimeout(() => {
    const input = modal.querySelector('#passwordInput');
    input.focus();
    
    // Enter key to submit
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        checkPassword(index);
      }
    });
  }, 100);
  
  // Add modal styles
  if (!document.getElementById('modalStyles')) {
    const style = document.createElement('style');
    style.id = 'modalStyles';
    style.textContent = `
      .password-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      }
      
      .modal-content {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        animation: slideIn 0.3s ease;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
      }
      
      .modal-header h3 {
        color: var(--primary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .modal-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: var(--transition-normal);
      }
      
      .modal-close:hover {
        background: var(--bg-primary);
        color: var(--primary);
      }
      
      .modal-body p {
        color: var(--text-secondary);
        margin-bottom: 1.5rem;
      }
      
      .password-input-group {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      
      .password-input {
        flex: 1;
        padding: 1rem;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-family: 'Rajdhani', sans-serif;
        transition: var(--transition-normal);
      }
      
      .password-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: var(--shadow-glow);
      }
      
      .password-submit {
        padding: 1rem 1.5rem;
        background: var(--gradient-primary);
        border: none;
        border-radius: 8px;
        color: var(--light);
        cursor: pointer;
        transition: var(--transition-normal);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .password-submit:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      
      .password-hint {
        color: var(--text-secondary);
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        opacity: 0.8;
      }
      
      .password-error {
        color: var(--secondary);
        font-size: 0.9rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: shake 0.5s ease;
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      .no-projects {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
      }
      
      .no-projects i {
        font-size: 4rem;
        color: var(--primary);
        margin-bottom: 1rem;
        opacity: 0.5;
      }
      
      .no-projects h3 {
        color: var(--text-primary);
        margin-bottom: 1rem;
      }
    `;
    document.head.appendChild(style);
  }
}

// Close password modal
function closePasswordModal() {
  const modal = document.querySelector('.password-modal');
  if (modal) {
    modal.remove();
  }
}

// Check password
function checkPassword(index) {
  const project = filteredProjects[index];
  const input = document.getElementById('passwordInput');
  const password = input.value;
  
  if (password === project.password) {
    // Unlock project
    if (!unlockedProjects.includes(project.path)) {
      unlockedProjects.push(project.path);
      localStorage.setItem('unlockedProjects', JSON.stringify(unlockedProjects));
    }
    
    // Show success animation
    showNotification('Projekt odemčen! 🎉', 'success');
    
    // Close modal and refresh grid
    closePasswordModal();
    renderProjectsGrid();
    
    // Auto-open project
    setTimeout(() => {
      openProject(index);
    }, 500);
    
  } else {
    // Show error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'password-error';
    errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Nesprávné heslo!';
    
    const existingError = document.querySelector('.password-error');
    if (existingError) {
      existingError.remove();
    }
    
    document.querySelector('.modal-body').appendChild(errorDiv);
    
    // Clear input and shake
    input.value = '';
    input.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
      input.style.animation = '';
      input.focus();
    }, 500);
  }
}

// Handle search
function handleSearch() {
  const searchTerm = projectSearch.value.toLowerCase();
  filterProjects(searchTerm, categoryFilter.value);
}

// Handle filter
function handleFilter() {
  const category = categoryFilter.value;
  filterProjects(projectSearch.value.toLowerCase(), category);
}

// Filter projects
function filterProjects(searchTerm, category) {
  // Use the original projectList but filter by existing projects first
  const existingProjects = projectList.filter(project => {
    // For now, show all projects from our list
    return true;
  });
  
  filteredProjects = existingProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm) ||
                         project.description.toLowerCase().includes(searchTerm);
    const matchesCategory = !category || category === "" || project.category === category;
    
    return matchesSearch && matchesCategory;
  });
  
  renderProjectsGrid();
  updateProjectCount();
}

// Update project count
function updateProjectCount() {
  const count = filteredProjects.length;
  totalProjectsElement.textContent = count;
  
  // Add animation to count
  totalProjectsElement.style.transform = 'scale(1.2)';
  setTimeout(() => {
    totalProjectsElement.style.transform = 'scale(1)';
  }, 200);
}

// Preview project
function previewProject(index) {
  const project = filteredProjects[index];
  if (!project) return;
  
  currentProject = project;
  previewProjectName.textContent = project.name;
  
  // Show preview section
  projectPreview.style.display = 'block';
  projectPreview.classList.add('slide-in');
  
  // Load project in iframe
  showLoadingState();
  loadProjectWithTimeout(project.path);
  
  // Scroll to preview
  projectPreview.scrollIntoView({ behavior: 'smooth' });
}

// Open project in new tab
function openProject(index) {
  const project = filteredProjects[index];
  if (!project) return;
  
  // Check if project is locked
  if (project.password && !unlockedProjects.includes(project.path)) {
    showPasswordModal(index);
    return;
  }
  
  // Add click animation
  const button = event.target.closest('.project-btn');
  if (button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  }
  
  window.open(project.path, "_blank");
}

// Close preview
function closePreview() {
  projectPreview.classList.add('slide-out');
  
  setTimeout(() => {
    projectPreview.style.display = 'none';
    projectPreview.classList.remove('slide-out');
    iframe.src = '';
    currentProject = null;
  }, 300);
}

// Handle refresh
function handleRefresh() {
  if (!currentProject) {
    showNotification('Žádný projekt není otevřen', 'warning');
    return;
  }
  
  // Add refresh animation
  refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  loadProjectWithTimeout(currentProject.path);
  
  setTimeout(() => {
    refreshBtn.innerHTML = '<i class="fas fa-redo"></i>';
  }, 1000);
}

// Handle fullscreen
function handleFullscreen() {
  if (!document.fullscreenElement) {
    projectPreview.requestFullscreen().catch(err => {
      console.log('Fullscreen error:', err);
    });
    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
  } else {
    document.exitFullscreen();
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
  }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + Enter to open project
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (currentProject) {
      window.open(currentProject.path, "_blank");
    }
  }
  
  // Ctrl/Cmd + R to refresh
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    handleRefresh();
  }
  
  // F11 for fullscreen
  if (e.key === 'F11') {
    e.preventDefault();
    handleFullscreen();
  }
  
  // Escape to close preview or modal
  if (e.key === 'Escape') {
    if (projectPreview.style.display !== 'none') {
      closePreview();
    }
    closePasswordModal();
  }
}

// Show loading state
function showLoadingState() {
  if (iframePlaceholder) {
    iframePlaceholder.innerHTML = `
      <div class="loading"></div>
      <p>Načítám projekt...</p>
    `;
    iframePlaceholder.style.display = 'flex';
  }
}

// Add success animation
function addSuccessAnimation() {
  const successIcon = document.createElement('div');
  successIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
  successIcon.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    color: #00ff00;
    z-index: 1000;
    animation: successPop 0.5s ease-out;
  `;
  
  document.body.appendChild(successIcon);
  
  setTimeout(() => {
    document.body.removeChild(successIcon);
  }, 500);
}

// Add stats hover effects
function addStatsHoverEffects() {
  const statCards = document.querySelectorAll('.stat-card');
  
  statCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px) scale(1.05)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });
}

// Update statistics
function updateStats() {
  // Animate stats on load
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach((stat, index) => {
    const finalValue = stat.textContent;
    const isNumber = !isNaN(finalValue);
    
    if (isNumber) {
      animateNumber(stat, 0, parseInt(finalValue), 1000 + (index * 200));
    }
  });
}

// Animate number
function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const current = Math.floor(start + (end - start) * progress);
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 2rem;
    background: ${type === 'warning' ? '#ff6b35' : type === 'success' ? '#00ff00' : '#0066cc'};
    color: white;
    border-radius: 8px;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes successPop {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Iframe load event
iframe.addEventListener('load', function() {
  if (iframePlaceholder) {
    iframePlaceholder.style.display = 'none';
  }
});

// Error handling for iframe
iframe.addEventListener('error', function() {
  if (iframePlaceholder) {
    iframePlaceholder.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <p>Chyba při načítání projektu</p>
      <small>Zkontrolujte, zda projekt existuje a má správný index.html soubor</small>
    `;
    iframePlaceholder.style.display = 'flex';
  }
});

// Add timeout for iframe loading
function loadProjectWithTimeout(projectPath) {
  const timeout = 10000; // 10 seconds
  
  const timeoutId = setTimeout(() => {
    if (iframePlaceholder) {
      iframePlaceholder.innerHTML = `
        <i class="fas fa-clock"></i>
        <p>Projekt se načítá příliš dlouho</p>
        <small>Zkuste to znovu nebo zkontrolujte připojení</small>
      `;
      iframePlaceholder.style.display = 'flex';
    }
  }, timeout);
  
  iframe.onload = function() {
    clearTimeout(timeoutId);
    if (iframePlaceholder) {
      iframePlaceholder.style.display = 'none';
    }
  };
  
  iframe.onerror = function() {
    clearTimeout(timeoutId);
    // Create fallback content
    const fallbackContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Projekt není dostupný</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #1a1a1a; 
            color: white; 
          }
          .container { max-width: 600px; margin: 0 auto; }
          .icon { font-size: 4rem; color: #0066cc; margin-bottom: 20px; }
          h1 { color: #0066cc; }
          .btn { 
            display: inline-block; 
            padding: 10px 20px; 
            background: #0066cc; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🚧</div>
          <h1>Projekt není dostupný</h1>
          <p>Tento projekt momentálně není dostupný nebo se načítá.</p>
          <p>Zkuste to později nebo kontaktujte autora.</p>
          <a href="javascript:history.back()" class="btn">Zpět na portfolio</a>
        </div>
      </body>
      </html>
    `;
    
    // Set fallback content
    iframe.srcdoc = fallbackContent;
    
    if (iframePlaceholder) {
      iframePlaceholder.style.display = 'none';
    }
  };
  
  iframe.src = projectPath;
}

// Make functions globally available
window.previewProject = previewProject;
window.openProject = openProject;
window.showPasswordModal = showPasswordModal;
window.closePasswordModal = closePasswordModal;
window.checkPassword = checkPassword;

console.log('🚀 Marian\'s Portfolio loaded successfully!');
console.log('💡 Keyboard shortcuts: Ctrl+Enter (open), Ctrl+R (refresh), F11 (fullscreen), Esc (close)');
console.log('🌙 Theme: Dark mode only');
console.log('🔐 Unlocked projects: ' + unlockedProjects.length);

// Skills section - no longer need project stats
function updateProjectStats() {
  // Function removed - replaced with skills section
}

// Demo functions removed
