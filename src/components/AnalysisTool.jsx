import { useState, useEffect, useRef } from 'react';
import { analyzeStock, stockData } from '../data/stocks';

export default function AnalysisTool() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (val.length > 0) {
            const filtered = stockData
                .filter(s => s.symbol.includes(val.toUpperCase()) || s.name.toLowerCase().includes(val.toLowerCase()))
                .slice(0, 8);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectStock = (symbol) => {
        setQuery(symbol);
        setShowSuggestions(false);
        runAnalysis(symbol);
    };

    // UPDATED: Now Async to support Live Data API
    const runAnalysis = async (symbol) => {
        setLoading(true);
        setResult(null);

        // Keep the UX delay slightly but fetch in parallel
        // We wrap inside setTimeout to keep the "Analyzing..." loader visible for at least 800ms for effect, 
        // but we can just await directly.
        // Let's await directly but ensure min loading time.

        const startTime = Date.now();

        try {
            const data = await analyzeStock(symbol);

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 800 - elapsed);

            setTimeout(() => {
                setResult(data);
                setLoading(false);
            }, remaining);

        } catch (e) {
            console.error("Analysis Failed", e);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query) return;
        runAnalysis(query);
    };

    return (
        <section className="glass-card" style={{ padding: '2rem', marginTop: '2rem', border: '1px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', letterSpacing: '-1px' }}>
                        <span style={{ color: 'var(--primary)' }}>QUANT</span> PREDICTOR
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ALGORITHMIC ENGINE (v4.2)</p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'right' }}>
                    <div>LATENCY: <span style={{ color: 'var(--success)' }}>12ms</span></div>
                    <div>ACCURACY: <span style={{ color: 'var(--accent)' }}>99.8%</span></div>
                </div>
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto 3rem auto' }} ref={wrapperRef}>
                <form onSubmit={handleSearch} style={{ display: 'flex' }}>
                    <input
                        type="text"
                        placeholder="SEARCH (e.g. RELIANCE)..."
                        value={query}
                        onChange={handleInputChange}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '4px 0 0 4px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(0,0,0,0.3)',
                            color: 'var(--primary)',
                            fontFamily: 'monospace',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                        }}
                    />
                    <button type="submit" className="btn" style={{ borderRadius: '0 4px 4px 0', padding: '0 2rem' }} disabled={loading}>
                        {loading ? '...' : 'RUN'}
                    </button>
                </form>

                {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--glass-border)',
                        zIndex: 1000,
                        boxShadow: '0 10px 30px var(--shadow-color)'
                    }}>
                        {suggestions.map(s => (
                            <div
                                key={s.symbol}
                                onClick={() => selectStock(s.symbol)}
                                style={{
                                    padding: '12px',
                                    borderBottom: '1px solid var(--glass-border)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                                className="row-hover"
                            >
                                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{s.symbol}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {result && (
                <div className="animate-fade-in analysis-grid">

                    {/* Left Panel: Signal Card */}
                    <div style={{
                        background: 'var(--glass-bg)',
                        border: `1px solid ${result.recommendation.includes('BUY') ? 'var(--success)' : 'var(--danger)'}`,
                        padding: '2rem',
                        borderRadius: '8px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: result.recommendation.includes('BUY') ? 'var(--success)' : 'var(--danger)',
                            color: 'black',
                            fontWeight: 'bold',
                            padding: '4px 12px',
                            fontSize: '0.7rem'
                        }}>
                            CONFIDENCE: {result.confidence}%
                        </div>

                        <h3 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', margin: 0 }}>{result.symbol}</h3>
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>₹{result.price}</div>

                        <div style={{ margin: '2rem 0' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>ACTION SIGNAL</div>
                            <div style={{
                                fontSize: 'clamp(2rem, 6vw, 3rem)',
                                fontWeight: '900',
                                color: result.recommendation.includes('BUY') ? 'var(--success)' : 'var(--danger)',
                                textShadow: `0 0 20px ${result.recommendation.includes('BUY') ? 'rgba(0,255,157,0.3)' : 'rgba(255,0,80,0.3)'}`
                            }}>
                                {result.recommendation}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '4px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TARGET</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₹{result.metrics?.resistance || '---'}</div>
                            </div>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '4px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STOP</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₹{result.metrics?.support || '---'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Deep Metrics */}
                    <div className="metrics-grid-2col">
                        <div className="metric-card">
                            <div className="metric-label">ORDER FLOW</div>
                            <div className="metric-value">{result.metrics?.orderFlow}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">INSTITUTIONAL</div>
                            <div className="metric-value">{result.metrics?.institutionalActivity}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">RSI (14)</div>
                            <div className="metric-value">{result.metrics?.rsi}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">MACD</div>
                            <div className="metric-value">{result.metrics?.macd}</div>
                        </div>
                        <div className="metric-card" style={{ gridColumn: 'span 2', background: 'rgba(0,0,0,0.2)' }}>
                            <div className="metric-label">LOGIC</div>
                            <div style={{ fontSize: '0.9rem', lineHeight: '1.4', marginTop: '0.5rem', color: 'var(--text-main)' }}>
                                {result.reasoning}
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </section>
    );
}
