/**
 * BEZPEČNOSTNÍ MIDDLEWARE PRO CHRÁNĚNÉ PROJEKTY
 * Tento skript poskytuje dodatečnou ochranu na klientské straně
 */

class SecurityMiddleware {
    constructor() {
        this.protectedProjects = {
            'project3': 'tools2024',
            'project5': 'blackjack2024',
            'project6': 'dropshop2024',
            'project11': 'krypto2024',
            'project13': 'secret2024'
        };
        
        this.init();
    }
    
    init() {
        // Kontrola, zda je uživatel na chráněné stránce
        this.checkCurrentPage();
        
        // Přidat event listener pro změnu URL
        this.addUrlChangeListener();
        
        // Kontrola při načtení stránky
        this.checkAccess();
    }
    
    checkCurrentPage() {
        const currentPath = window.location.pathname;
        const projectMatch = currentPath.match(/\/project(\d+)/);
        
        if (projectMatch) {
            const projectNumber = parseInt(projectMatch[1]);
            const projectKey = `project${projectNumber}`;
            
            if (this.protectedProjects[projectKey]) {
                console.log(`🔒 Chráněný projekt detekován: ${projectKey}`);
                this.requireAuthentication(projectKey);
            }
        }
    }
    
    addUrlChangeListener() {
        // Sledovat změny v historii prohlížeče
        let currentUrl = window.location.href;
        
        const checkUrl = () => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                setTimeout(() => this.checkCurrentPage(), 100);
            }
        };
        
        // Kontrola každých 500ms
        setInterval(checkUrl, 500);
        
        // Sledovat popstate události
        window.addEventListener('popstate', () => {
            setTimeout(() => this.checkCurrentPage(), 100);
        });
    }
    
    requireAuthentication(projectKey) {
        // Kontrola, zda je uživatel již přihlášen
        if (this.isAuthenticated(projectKey)) {
            console.log(`✅ Uživatel je přihlášen do ${projectKey}`);
            return;
        }
        
        // Uživatel není přihlášen - přesměrovat na přihlašovací stránku
        console.log(`🚫 Přístup zamítnut pro ${projectKey} - přesměrovávám na přihlášení`);
        this.redirectToLogin(projectKey);
    }
    
    isAuthenticated(projectKey) {
        // Kontrola session storage
        if (sessionStorage.getItem(`${projectKey}_auth`) === 'true') {
            return true;
        }
        
        // Kontrola localStorage
        if (localStorage.getItem(`${projectKey}_auth`) === 'true') {
            return true;
        }
        
        // Kontrola cookies
        const cookieName = `${projectKey}_auth`;
        if (document.cookie.split(';').some(item => item.trim().startsWith(cookieName + '='))) {
            return true;
        }
        
        return false;
    }
    
    redirectToLogin(projectKey) {
        const currentUrl = window.location.href;
        const loginUrl = `/login-project.php?project=${projectKey}&redirect=${encodeURIComponent(currentUrl)}`;
        
        // Přesměrovat na přihlašovací stránku
        window.location.href = loginUrl;
    }
    
    checkAccess() {
        // Kontrola při načtení stránky
        const currentPath = window.location.pathname;
        
        // Pokud je uživatel na přihlašovací stránce, neprovádět kontrolu
        if (currentPath.includes('login-project.php')) {
            return;
        }
        
        // Kontrola chráněných projektů
        Object.keys(this.protectedProjects).forEach(projectKey => {
            if (currentPath.includes(projectKey)) {
                if (!this.isAuthenticated(projectKey)) {
                    console.log(`🚫 Neoprávněný přístup k ${projectKey}`);
                    this.redirectToLogin(projectKey);
                }
            }
        });
    }
    
    // Metoda pro odhlášení
    logout(projectKey) {
        sessionStorage.removeItem(`${projectKey}_auth`);
        localStorage.removeItem(`${projectKey}_auth`);
        
        // Odstranit cookie
        document.cookie = `${projectKey}_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        
        console.log(`👋 Uživatel odhlášen z ${projectKey}`);
        
        // Přesměrovat na hlavní stránku
        window.location.href = '/';
    }
    
    // Metoda pro přihlášení
    async login(projectKey, password) {
        try {
            const response = await fetch('/project-auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project: projectKey,
                    password: password
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Uložit autentifikaci
                sessionStorage.setItem(`${projectKey}_auth`, 'true');
                localStorage.setItem(`${projectKey}_auth`, 'true');
                
                console.log(`✅ Úspěšné přihlášení do ${projectKey}`);
                return true;
            } else {
                console.log(`❌ Neúspěšné přihlášení do ${projectKey}: ${result.message}`);
                return false;
            }
        } catch (error) {
            console.error(`🚫 Chyba při přihlašování do ${projectKey}:`, error);
            return false;
        }
    }
}

// Inicializace middleware při načtení stránky
document.addEventListener('DOMContentLoaded', () => {
    window.securityMiddleware = new SecurityMiddleware();
});

// Export pro použití v jiných skriptech
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityMiddleware;
}
