import { useState, useEffect } from 'react';
import Header from './components/Header';
import MarketDashboard from './components/MarketDashboard';
import AnalysisTool from './components/AnalysisTool';
import FnoAnalysis from './components/FnoAnalysis';
import EsteeDashboard from './components/EsteeDashboard';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [activeTab, setActiveTab] = useState('algo');
  const [currentTheme, setCurrentTheme] = useState('futuristic');

  useEffect(() => {
    document.body.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const themes = [
    { id: 'futuristic', label: 'CYBER' },
    { id: 'sunset', label: 'RETRO' }, // New
    { id: 'matrix', label: 'MATRIX' }, // New
    { id: 'ocean', label: 'OCEAN' }, // New
    { id: 'classic', label: 'TERM' },
    { id: 'dark', label: 'DARK' },
    { id: 'light', label: 'LITE' }
  ];

  return (
    <ErrorBoundary>
      <main className="container" style={{ paddingBottom: '3rem' }}>

        {/* NEW HEADER LAYOUT - Replaces absolute positioning to fix overlap */}
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

            <div className="theme-switcher-wrapper">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setCurrentTheme(t.id)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    background: currentTheme === t.id ? 'var(--primary)' : 'var(--glass-bg)',
                    color: currentTheme === t.id ? (currentTheme === 'light' ? 'white' : 'black') : 'var(--text-muted)',
                    border: `1px solid ${currentTheme === t.id ? 'var(--primary)' : 'var(--glass-border)'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    flexGrow: 1, // Make buttons grow to fill row on mobile
                    maxWidth: '80px', // But limit width on desktop
                    textAlign: 'center'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Header Component (Navigation) if separate, but merging simple nav here for now */}
        {/* Note: User has a separate <Header /> component imported but it was just title/nav. 
            I have effectively replaced its functionality with the new layout above for better integration.
            I will remove the old <Header /> call to prevent duplicate titles. */}

        {/* Responsive Tab Navigation */}
        <div className="tab-container">
          <button
            className="btn"
            style={{
              background: activeTab === 'algo' ? 'var(--primary)' : 'transparent',
              opacity: activeTab === 'algo' ? 1 : 0.6,
              fontSize: '0.8rem',
              color: activeTab === 'algo' ? (currentTheme === 'light' ? 'white' : 'black') : 'var(--text-main)',
              borderColor: activeTab === 'algo' ? 'var(--primary)' : 'transparent',
              flex: '1'
            }}
            onClick={() => setActiveTab('algo')}
          >
            ALGO DASH
          </button>

          <button
            className="btn"
            style={{
              background: activeTab === 'equity' ? 'var(--primary)' : 'transparent',
              opacity: activeTab === 'equity' ? 1 : 0.6,
              fontSize: '0.8rem',
              color: activeTab === 'equity' ? (currentTheme === 'light' ? 'white' : 'black') : 'var(--text-main)',
              borderColor: activeTab === 'equity' ? 'var(--primary)' : 'transparent',
              flex: '1'
            }}
            onClick={() => setActiveTab('equity')}
          >
            EQUITY
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
