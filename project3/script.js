let runningCount = 0;
let totalCards = 0;
let cardHistory = [];

// Wong Halves hodnoty podle vstupu (1=eso, 0=10, 2–9 klasicky)
const wongValues = {
    1: -1,
    2: 0.5,
    3: 1,
    4: 1,
    5: 1.5,
    6: 1,
    7: 0.5,
    8: 0,
    9: -0.5,
    0: -1
};

// Initialize floating particles
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Create visual feedback for card addition
function createCardFeedback(card, value) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${value > 0 ? 'linear-gradient(145deg, #38a169, #2f855a)' : 
                     value < 0 ? 'linear-gradient(145deg, #e53e3e, #c53030)' : 
                     'linear-gradient(145deg, #718096, #4a5568)'};
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 2em;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: cardFeedback 1s ease-out forwards;
    `;
    
    const cardText = card === 0 ? '10' : card;
    const valueText = value > 0 ? `+${value}` : value.toString();
    feedback.innerHTML = `${cardText}<br><small>${valueText}</small>`;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 1000);
}

// Add CSS animation for card feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes cardFeedback {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1) translateY(-50px);
        }
    }
`;
document.head.appendChild(style);

function addCardByKey(card) {
    if (!(card in wongValues)) return;

    const value = wongValues[card];
    runningCount += value;
    totalCards++;
    cardHistory.push(card);

    if (cardHistory.length > 10) cardHistory.shift();

    // Create visual feedback
    createCardFeedback(card, value);
    
    updateDisplay();
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function undoCard() {
    if (cardHistory.length === 0) return;

    const lastCard = cardHistory.pop();
    const value = wongValues[lastCard];
    runningCount -= value;
    totalCards--;

    // Create visual feedback for undo
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(145deg, #ed8936, #dd6b20);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 1.5em;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: cardFeedback 0.8s ease-out forwards;
    `;
    feedback.innerHTML = '⏪ Undo';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 800);

    updateDisplay();
    
    // Add haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
    }
}

function resetAll() {
    runningCount = 0;
    totalCards = 0;
    cardHistory = [];

    // Create visual feedback for reset
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(145deg, #e53e3e, #c53030);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 1.8em;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: cardFeedback 1s ease-out forwards;
    `;
    feedback.innerHTML = '🔄 Reset';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 1000);

    updateDisplay();
    
    // Add haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

function updateDisplay() {
    const decks = parseFloat(document.getElementById("deckCount").value);
    const totalDeckCards = decks * 52;
    const remainingDecks = Math.max((totalDeckCards - totalCards) / 52, 0.1);
    const trueCount = runningCount / remainingDecks;
    const remainingCards = Math.max(0, totalDeckCards - totalCards);

    // Update values with visual feedback
    updateStatValue("runningCount", runningCount.toFixed(2), runningCount);
    updateStatValue("trueCount", trueCount.toFixed(2), trueCount);
    updateStatValue("totalCards", totalCards, totalCards);
    updateStatValue("remainingCards", Math.floor(remainingCards), remainingCards);

    // Update card history with animation
    const cardHistoryElement = document.getElementById("cardHistory");
    const formatted = cardHistory.map(c => (c === 0 ? "10" : c)).join(", ");
    cardHistoryElement.innerText = formatted || "žádné";
    
    // Add highlight animation to card history
    cardHistoryElement.classList.add('updated');
    setTimeout(() => {
        cardHistoryElement.classList.remove('updated');
    }, 800);
}

function updateStatValue(elementId, displayValue, numericValue) {
    const element = document.getElementById(elementId);
    const oldValue = parseFloat(element.innerText);
    
    // Remove old classes
    element.classList.remove('positive', 'negative', 'neutral', 'updated');
    
    // Add appropriate color class
    if (numericValue > 0) {
        element.classList.add('positive');
    } else if (numericValue < 0) {
        element.classList.add('negative');
    } else {
        element.classList.add('neutral');
    }
    
    // Update value
    element.innerText = displayValue;
    
    // Add pulse animation if value changed
    if (Math.abs(oldValue - numericValue) > 0.01) {
        element.classList.add('updated');
        setTimeout(() => {
            element.classList.remove('updated');
        }, 600);
    }
}

// Enhanced keyboard event handling
document.addEventListener("keydown", function(event) {
    const key = event.key;

    if (key === "Delete") {
        event.preventDefault();
        resetAll();
    } else if (key === "Backspace") {
        event.preventDefault();
        undoCard();
    } else if (/^[0-9]$/.test(key)) {
        event.preventDefault();
        addCardByKey(parseInt(key));
    }
});

// --- Navigation and Dynamic Content ---

const pages = [
    {
        label: 'Počítání',
        type: 'main',
        html: null // will be set below
    },
    {
        label: 'Basic Strategy',
        type: 'embedded',
        html: `
            <div class="container">
                <h1>Blackjack Basic Strategy</h1>
                <h2>Normal Hands</h2>
                <table border="1" style="width:100%;text-align:center;">
                    <tr><th>Player</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>A</th></tr>
                    <tr><td>8</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>9</td><td>H</td><td>D</td><td>D</td><td>D</td><td>D</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>10</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>H</td><td>H</td></tr>
                    <tr><td>11</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>H</td></tr>
                    <tr><td>12</td><td>H</td><td>H</td><td>S</td><td>S</td><td>S</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>13-16</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>17-21</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td></tr>
                </table>
                <h2>Soft Hands</h2>
                <table border="1" style="width:100%;text-align:center;">
                    <tr><th>Player</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>A</th></tr>
                    <tr><td>A,2-A,3</td><td>H</td><td>H</td><td>H</td><td>D</td><td>D</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>A,4-A,5</td><td>H</td><td>H</td><td>D</td><td>D</td><td>D</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>A,6</td><td>H</td><td>D</td><td>D</td><td>D</td><td>D</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>A,7</td><td>S</td><td>D</td><td>D</td><td>D</td><td>D</td><td>S</td><td>S</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>A,8-A,9</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td></tr>
                </table>
                <h2>Pairs</h2>
                <table border="1" style="width:100%;text-align:center;">
                    <tr><th>Player</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>A</th></tr>
                    <tr><td>2,2</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>3,3</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>4,4</td><td>H</td><td>H</td><td>H</td><td>P</td><td>P</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>5,5</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>D</td><td>H</td><td>H</td></tr>
                    <tr><td>6,6</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>H</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>7,7</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>H</td><td>H</td><td>H</td><td>H</td></tr>
                    <tr><td>8,8</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td></tr>
                    <tr><td>9,9</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>S</td><td>P</td><td>P</td><td>S</td><td>S</td></tr>
                    <tr><td>10,10</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td><td>S</td></tr>
                    <tr><td>A,A</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td><td>P</td></tr>
                </table>
                <p style="margin-top:20px;">Legend: <b>H</b> = Hit, <b>S</b> = Stand, <b>D</b> = Double (if allowed, otherwise Hit), <b>P</b> = Split</p>
            </div>
        `
    },
    {
        label: 'Deviace',
        type: 'embedded',
        html: `
            <div class="container">
                <h1>Illustrious 18 Deviations</h1>
                <table border="1" style="width:100%;text-align:center;">
                    <tr><th>Situation</th><th>Index</th><th>Play</th></tr>
                    <tr><td>Insurance</td><td>+3</td><td>Take Insurance</td></tr>
                    <tr><td>16 vs 10</td><td>0</td><td>Stand</td></tr>
                    <tr><td>15 vs 10</td><td>+4</td><td>Stand</td></tr>
                    <tr><td>10 vs A</td><td>+4</td><td>Double</td></tr>
                    <tr><td>12 vs 3</td><td>+2</td><td>Stand</td></tr>
                    <tr><td>12 vs 2</td><td>+3</td><td>Stand</td></tr>
                    <tr><td>11 vs A</td><td>+1</td><td>Double</td></tr>
                    <tr><td>9 vs 2</td><td>+1</td><td>Double</td></tr>
                    <tr><td>10 vs 10</td><td>+4</td><td>Double</td></tr>
                    <tr><td>9 vs 7</td><td>+3</td><td>Double</td></tr>
                    <tr><td>16 vs 9</td><td>+5</td><td>Stand</td></tr>
                    <tr><td>13 vs 2</td><td>-1</td><td>Hit</td></tr>
                    <tr><td>12 vs 4</td><td>0</td><td>Stand</td></tr>
                    <tr><td>12 vs 5</td><td>-2</td><td>Hit</td></tr>
                    <tr><td>12 vs 6</td><td>-1</td><td>Hit</td></tr>
                    <tr><td>13 vs 3</td><td>-2</td><td>Hit</td></tr>
                    <tr><td>14 vs 10</td><td>+3</td><td>Stand</td></tr>
                    <tr><td>15 vs 9</td><td>+2</td><td>Stand</td></tr>
                </table>
                <p style="margin-top:20px;">These are the most important count-based deviations. For full details, see a complete index chart.</p>
            </div>
        `
    }
];
let currentPage = 0;

function showLoading() {
    document.getElementById('mainContent').innerHTML = '<div style="text-align:center;padding:40px;font-size:2em;">Loading...</div>';
}

function applyTableColors() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const cells = table.querySelectorAll('td');
        cells.forEach(cell => {
            const text = cell.textContent.trim();
            
            // Remove any existing color classes
            cell.className = '';
            
            // Apply colors based on content - More contrasty colors
            if (text === 'H') {
                cell.style.background = '#dc2626';
                cell.style.color = 'white';
                cell.style.fontWeight = 'bold';
            } else if (text === 'S') {
                cell.style.background = '#059669';
                cell.style.color = 'white';
                cell.style.fontWeight = 'bold';
            } else if (text === 'D') {
                cell.style.background = '#d97706';
                cell.style.color = 'white';
                cell.style.fontWeight = 'bold';
            } else if (text === 'P') {
                cell.style.background = '#7c3aed';
                cell.style.color = 'white';
                cell.style.fontWeight = 'bold';
            } else if (text.startsWith('+')) {
                cell.style.background = '#059669';
                cell.style.color = 'white';
                cell.style.fontWeight = 'bold';
            } else if (text.startsWith('-')) {
                cell.style.background = '#dc2626';
                cell.style.color = 'white';
                cell.style.fontWeight = 'bold';
            } else if (text === '0') {
                cell.style.background = '#6b7280';
                cell.style.color = 'white';
                cell.style.fontWeight = 'bold';
            } else if (text === 'Take Insurance' || text === 'Stand' || text === 'Double' || text === 'Hit') {
                // For full text actions
                if (text === 'Hit') {
                    cell.style.background = '#dc2626';
                    cell.style.color = 'white';
                } else if (text === 'Stand') {
                    cell.style.background = '#059669';
                    cell.style.color = 'white';
                } else if (text === 'Double') {
                    cell.style.background = '#d97706';
                    cell.style.color = 'white';
                } else if (text === 'Take Insurance') {
                    cell.style.background = '#7c3aed';
                    cell.style.color = 'white';
                }
                cell.style.fontWeight = 'bold';
            } else {
                // Reset to default for other cells
                cell.style.background = '';
                cell.style.color = '';
                cell.style.fontWeight = '';
            }
        });
    });
}

function loadPage(index) {
    currentPage = (index + pages.length) % pages.length;
    const page = pages[currentPage];
    document.getElementById('pageLabel').textContent = page.label;
    if (page.type === 'main') {
        document.getElementById('mainContent').innerHTML = pages[0].html;
        if (document.getElementById("deckCount")) {
            document.getElementById("deckCount").addEventListener("change", function() {
                updateDisplay();
                const feedback = document.createElement('div');
                feedback.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(145deg, #3182ce, #2c5282);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-size: 1em;
                    font-weight: bold;
                    z-index: 1000;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                `;
                feedback.innerHTML = `Deck count: ${this.value}`;
                document.body.appendChild(feedback);
                setTimeout(() => {
                    if (document.body.contains(feedback)) {
                        document.body.removeChild(feedback);
                    }
                }, 2000);
            });
        }
        updateDisplay();
    } else if (page.type === 'embedded') {
        document.getElementById('mainContent').innerHTML = page.html;
        // Apply colors immediately
        applyTableColors();
    }
}

function safeNavInit() {
    // Attach navigation listeners if not already attached
    const left = document.getElementById('navLeft');
    const right = document.getElementById('navRight');
    if (left && !left._navAttached) {
        left.addEventListener('click', () => loadPage(currentPage - 1));
        left._navAttached = true;
    }
    if (right && !right._navAttached) {
        right.addEventListener('click', () => loadPage(currentPage + 1));
        right._navAttached = true;
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        loadPage(currentPage - 1);
    } else if (event.key === 'ArrowRight') {
        loadPage(currentPage + 1);
    }
});

// Save the original counter UI as a template string
pages[0].html = `
    <div class="container">
        <h1>🎰 Wong Halves – Počítání Karet</h1>
        <div class="deck-input">
            <label>Počet balíčků:
                <input type="number" id="deckCount" value="8" min="1">
            </label>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Running Count</h3>
                <div class="stat-value" id="runningCount">0</div>
            </div>
            <div class="stat-card">
                <h3>True Count</h3>
                <div class="stat-value" id="trueCount">0</div>
            </div>
            <div class="stat-card">
                <h3>Celkem karet</h3>
                <div class="stat-value" id="totalCards">0</div>
            </div>
            <div class="stat-card">
                <h3>Zbývající karty</h3>
                <div class="stat-value" id="remainingCards">416</div>
            </div>
        </div>
        <div class="controls">
            <button class="undo-btn" onclick="undoCard()">⏪ Undo</button>
            <button class="reset-btn" onclick="resetAll()">🔄 Reset</button>
        </div>
        <div class="card-history">
            <h3>📋 Posledních 10 karet:</h3>
            <div class="card-list" id="cardHistory">žádné</div>
        </div>
        <div class="instructions">
            <h3>🎯 Jak používat:</h3>
            <p>Stiskněte klávesy <span class="key-hint">1-9</span> a <span class="key-hint">0</span> pro přidání karet. <span class="key-hint">Delete</span> pro reset. <span class="key-hint">Backspace</span> pro undo.</p>
        </div>
        <img src="units.jpg" alt="Wong Halves Units">
    </div>
`;

// On load, show the main page and attach navigation
window.addEventListener('DOMContentLoaded', function() {
    initParticles();
    safeNavInit();
    loadPage(0);
});

// CSS animations removed for instant page switching
