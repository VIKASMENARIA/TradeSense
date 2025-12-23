import { useState, useEffect } from 'react';
import Header from './components/Header';
import MarketDashboard from './components/MarketDashboard';
import AnalysisTool from './components/AnalysisTool';
import FnoAnalysis from './components/FnoAnalysis';
import EsteeDashboard from './components/EsteeDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { setApiConfig, getApiConfig } from './data/stocks';

function App() {
  const [activeTab, setActiveTab] = useState('algo');
  const [currentTheme, setCurrentTheme] = useState('futuristic');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    document.body.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Load existing config if any (though currently mem-only)
  useEffect(() => {
    const config = getApiConfig();
    if (config.apiKey) setApiKey(config.apiKey);
  }, []);

  const handleSaveConfig = () => {
    if (apiKey) {
      setApiConfig(apiKey);
      alert("Feed Validated: Switched to Live Mode");
      setIsConfigOpen(false);
    } else {
      setApiConfig(""); // Disable
      alert("Feed Disconnected: Reverted to Simulation");
      setIsConfigOpen(false);
    }
  };

  const themes = [
    { id: 'futuristic', label: 'CYBER' },
    { id: 'midnight', label: 'MIDNIGHT' },
    { id: 'sunset', label: 'RETRO' },
    { id: 'matrix', label: 'MATRIX' },
    { id: 'ocean', label: 'OCEAN' },
    { id: 'classic', label: 'TERM' },
    { id: 'dark', label: 'DARK' },
    { id: 'light', label: 'LITE' }
  ];

  return (
    <ErrorBoundary>
      <main className="container" style={{ paddingBottom: '3rem' }}>

        {/* API CONFIG MODAL */}
        {isConfigOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <div className="glass-card" style={{ width: '400px', padding: '2rem', background: 'var(--bg-card)' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚡ CONNECT DATA FEED</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Enter your <strong>Alpha Vantage</strong> API Key to enable real-time market data.
                <br /><br />
                <a href="https://www.alphavantage.co/support/#api-key" target="_blank" style={{ color: 'var(--primary)' }}>Get Free Key &rarr;</a>
              </p>

              <input
                type="text"
                placeholder="Ex: DEMO_KEY_123"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ marginBottom: '1rem', fontFamily: 'monospace' }}
              />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn" style={{ flex: 1 }} onClick={handleSaveConfig}>CONNECT</button>
                <button
                  className="btn"
                  style={{ flex: 1, background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                  onClick={() => setIsConfigOpen(false)}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER LAYOUT */}
        <div className="app-header">
          <div className="header-top-row">
            <div className="header-branding">
              <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', lineHeight: '1', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                TradeSense <span className="text-gradient">PRO</span>
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                &gt; NODE: <span style={{ color: 'var(--success)' }}>HK-XO9</span> &gt; LATENCY: <span style={{ color: 'var(--success)' }}>450μs</span>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', flex: 1 }}>

              {/* Connection Button */}
              <button
                onClick={() => setIsConfigOpen(true)}
                style={{
                  background: getApiConfig().isLive ? 'rgba(0,255,157,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${getApiConfig().isLive ? 'var(--success)' : 'var(--glass-border)'}`,
                  color: getApiConfig().isLive ? 'var(--success)' : 'var(--text-muted)',
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: getApiConfig().isLive ? 'var(--success)' : '#666'
                }}></span>
                {getApiConfig().isLive ? 'FEED: LIVE' : 'FEED: CONNECT'}
              </button>

              {/* Theme Switcher */}
              <div className="theme-switcher-wrapper">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setCurrentTheme(t.id)}
                    style={{
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      background: currentTheme === t.id ? 'var(--primary)' : 'var(--glass-bg)',
                      color: currentTheme === t.id ? (['light', 'matrix'].includes(currentTheme) ? 'black' : 'white') : 'var(--text-muted)',
                      border: `1px solid ${currentTheme === t.id ? 'var(--primary)' : 'var(--glass-border)'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      flexGrow: 1,
                      maxWidth: '60px',
                      textAlign: 'center'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Tab Navigation */}
        <div className="tab-container">
          <button
            className="btn"
            style={{
              background: activeTab === 'algo' ? 'var(--primary)' : 'transparent',
              opacity: activeTab === 'algo' ? 1 : 0.6,
              fontSize: '0.8rem',
              color: activeTab === 'algo' ? (['light'].includes(currentTheme) ? 'white' : 'white') : 'var(--text-main)',
              borderColor: activeTab === 'algo' ? 'var(--primary)' : 'transparent',
              flex: '1'
            }}
            onClick={() => setActiveTab('algo')}
          >
            HFT DASHBOARD
          </button>

          <button
            className="btn"
            style={{
              background: activeTab === 'equity' ? 'var(--primary)' : 'transparent',
              opacity: activeTab === 'equity' ? 1 : 0.6,
              fontSize: '0.8rem',
              color: activeTab === 'equity' ? 'white' : 'var(--text-main)',
              borderColor: activeTab === 'equity' ? 'var(--primary)' : 'transparent',
              flex: '1'
            }}
            onClick={() => setActiveTab('equity')}
          >
            EQUITY DESK
          </button>

          <button
            className="btn"
            style={{
              background: activeTab === 'fno' ? 'var(--warning)' : 'transparent',
              color: activeTab === 'fno' ? 'black' : 'var(--text-main)',
              borderColor: 'var(--warning)',
              opacity: activeTab === 'fno' ? 1 : 0.6,
              fontSize: '0.8rem',
              flex: '1'
            }}
            onClick={() => setActiveTab('fno')}
          >
            F&O SNIPER
          </button>
        </div>

        {/* Render Views */}
        {activeTab === 'algo' && <EsteeDashboard />}

        {activeTab === 'equity' && (
          <>
            <AnalysisTool />
            <MarketDashboard />
          </>
        )}

        {activeTab === 'fno' && <FnoAnalysis />}

      </main>
    </ErrorBoundary>
  );
}

export default App;
