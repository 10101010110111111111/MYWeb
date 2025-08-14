import React, { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 React Projekt 13</h1>
        <p>Úspěšně nasazeno na GitHub Pages!</p>
        
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Počet kliknutí: {count}
          </button>
          <p>
            Upravte <code>src/App.jsx</code> a uložte pro testování hot reload.
          </p>
        </div>

        <div className="features">
          <h2>✨ Funkce:</h2>
          <ul>
            <li>✅ Čistý React 18</li>
            <li>✅ Vite build systém</li>
            <li>✅ GitHub Pages nasazení</li>
            <li>✅ Moderní ES6+ syntax</li>
            <li>✅ Hot reload v development</li>
          </ul>
        </div>

        <div className="links">
          <a href="https://github.com/10101010110111111111/MYWeb" target="_blank" rel="noopener noreferrer">
            📁 GitHub Repository
          </a>
        </div>
      </header>
    </div>
  )
}

export default App
