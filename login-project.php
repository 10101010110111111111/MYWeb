<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Přihlášení do projektu</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .login-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 400px;
            width: 100%;
            text-align: center;
        }

        .lock-icon {
            font-size: 48px;
            color: #667eea;
            margin-bottom: 20px;
        }

        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
        }

        .project-name {
            color: #667eea;
            font-weight: 600;
            margin-bottom: 30px;
            font-size: 18px;
        }

        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }

        input[type="password"] {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: white;
        }

        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            transform: scale(1.02);
        }

        .login-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
        }

        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .back-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .back-link:hover {
            color: #5a6fd8;
        }

        .error-message {
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #fcc;
            display: none;
        }

        .success-message {
            background: #efe;
            color: #3c3;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #cfc;
            display: none;
        }

        .loading {
            opacity: 0.7;
            pointer-events: none;
        }

        .loading .login-btn {
            background: #999;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="lock-icon">🔒</div>
        <h1>Přihlášení do projektu</h1>
        <div class="project-name" id="projectName">Projekt</div>
        
        <div class="error-message" id="errorMessage"></div>
        <div class="success-message" id="successMessage"></div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="password">Heslo:</label>
                <input type="password" id="password" name="password" required placeholder="Zadejte heslo">
            </div>
            
            <button type="submit" class="login-btn">
                <span class="btn-text">Přihlásit se</span>
            </button>
        </form>
        
        <a href="/" class="back-link">← Zpět na hlavní stránku</a>
    </div>

    <script>
        // Získat parametry z URL
        const urlParams = new URLSearchParams(window.location.search);
        const project = urlParams.get('project');
        const redirect = urlParams.get('redirect') || '/';
        
        // Zobrazit název projektu
        const projectNames = {
            'project3': 'Projekt 3 - BJ Full Counter',
            'project5': 'Projekt 5 - Black Jack Simulator',
            'project6': 'Projekt 6 - DropShop E-commerce',
            'project11': 'Projekt 11 - Krypto Data Manager',
            'project13': 'Projekt 13 - Secret Project'
        };
        
        document.getElementById('projectName').textContent = projectNames[project] || project;
        
        // Zpracování přihlášení
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const form = this;
            const btnText = form.querySelector('.btn-text');
            
            // Skrýt předchozí zprávy
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('successMessage').style.display = 'none';
            
            // Přidat loading stav
            form.classList.add('loading');
            btnText.textContent = 'Přihlašuji...';
            
            try {
                const response = await fetch('/project-auth.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/xaml+xml',
                    },
                    body: JSON.stringify({
                        project: project,
                        password: password
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Úspěšné přihlášení
                    document.getElementById('successMessage').textContent = 'Přihlášení úspěšné! Přesměrovávám...';
                    document.getElementById('successMessage').style.display = 'block';
                    
                    // Přesměrovat po 1 sekundě
                    setTimeout(() => {
                        window.location.href = redirect;
                    }, 1000);
                } else {
                    // Chyba přihlášení
                    document.getElementById('errorMessage').textContent = result.message || 'Nesprávné heslo';
                    document.getElementById('errorMessage').style.display = 'block';
                    document.getElementById('password').value = '';
                    document.getElementById('password').focus();
                }
            } catch (error) {
                document.getElementById('errorMessage').textContent = 'Chyba připojení. Zkuste to znovu.';
                document.getElementById('errorMessage').style.display = 'block';
            } finally {
                // Odstranit loading stav
                form.classList.remove('loading');
                btnText.textContent = 'Přihlásit se';
            }
        });
        
        // Automatické zaměření na heslo
        document.getElementById('password').focus();
    </script>
</body>
</html>
