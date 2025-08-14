import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    packageType: 'small',
    deliveryType: 'standard',
    description: ''
  });

  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('✅ Zásilka byla úspěšně odeslána! Budeme vás kontaktovat.');
    setFormData({
      senderName: '',
      senderPhone: '',
      senderEmail: '',
      senderAddress: '',
      recipientName: '',
      recipientPhone: '',
      recipientAddress: '',
      packageType: 'small',
      deliveryType: 'standard',
      description: ''
    });
  };

  const trackPackage = () => {
    if (!trackingNumber) {
      setTrackingResult('Zadejte číslo zásilky!');
      return;
    }
    
    setTrackingResult(`
      📦 Zásilka: ${trackingNumber}
      Status: 🚚 V doručování
      Očekávané doručení: Zítra do 18:00
      Poslední aktualizace: Dnes 14:30 - Zásilka opustila distribuční centrum
    `);
  };

  return (
    <div className="App">
      <header className="header">
        <nav className="nav">
          <div className="logo">🚚 Zásilkovna</div>
          <div className="nav-links">
            <a href="#sluzby">Služby</a>
            <a href="#zasilka">Poslat zásilku</a>
            <a href="#sledovani">Sledování</a>
          </div>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <h1>🚚 Rychlé doručení zásilek</h1>
          <p>Doručíme vaši zásilku kamkoliv v ČR do 24 hodin!</p>
        </section>

        <section id="sluzby" className="services">
          <div className="service-card">
            <h3>📦 Standardní doručení</h3>
            <p>Doručení do 2-3 pracovních dnů po celé ČR. Ideální pro běžné zásilky.</p>
          </div>
          <div className="service-card">
            <h3>⚡ Expresní doručení</h3>
            <p>Doručení do 24 hodin v rámci ČR. Perfektní pro urgentní zásilky.</p>
          </div>
          <div className="service-card">
            <h3>🌍 Mezinárodní doručení</h3>
            <p>Doručení do celé Evropy a světa. Spolehlivé a rychlé.</p>
          </div>
        </section>

        <section id="zasilka" className="shipping-form">
          <h2 className="form-title">📝 Poslat zásilku</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="senderName">Jméno odesílatele *</label>
                <input
                  type="text"
                  id="senderName"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="senderPhone">Telefon odesílatele *</label>
                <input
                  type="tel"
                  id="senderPhone"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="senderEmail">Email odesílatele *</label>
                <input
                  type="email"
                  id="senderEmail"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="senderAddress">Adresa odesílatele *</label>
                <input
                  type="text"
                  id="senderAddress"
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientName">Jméno příjemce *</label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientPhone">Telefon příjemce *</label>
                <input
                  type="tel"
                  id="recipientPhone"
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientAddress">Adresa příjemce *</label>
                <input
                  type="text"
                  id="recipientAddress"
                  name="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="packageType">Typ balíčku</label>
                <select
                  id="packageType"
                  name="packageType"
                  value={formData.packageType}
                  onChange={handleInputChange}
                >
                  <option value="small">Malý balíček (do 2kg)</option>
                  <option value="medium">Střední balíček (2-10kg)</option>
                  <option value="large">Velký balíček (10kg+)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="deliveryType">Typ doručení</label>
                <select
                  id="deliveryType"
                  name="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleInputChange}
                >
                  <option value="standard">Standardní (2-3 dny)</option>
                  <option value="express">Expresní (24h)</option>
                  <option value="international">Mezinárodní</option>
                </select>
              </div>
              <div className="form-group full">
                <label htmlFor="description">Popis obsahu</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  placeholder="Popište obsah zásilky..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <button type="submit" className="submit-btn">🚚 Odeslat zásilku</button>
          </form>
        </section>

        <section id="sledovani" className="tracking">
          <h3>🔍 Sledování zásilky</h3>
          <div className="tracking-input">
            <input
              type="text"
              placeholder="Zadejte číslo zásilky..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
            <button className="track-btn" onClick={trackPackage}>
              Sledovat
            </button>
          </div>
          {trackingResult && (
            <div className="tracking-result">
              <pre>{trackingResult}</pre>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2024 Zásilkovna. Všechna práva vyhrazena.</p>
      </footer>
    </div>
  );
}

export default App;
