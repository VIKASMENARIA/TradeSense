import { useState, useEffect, useRef } from 'react';
import { analyzeOptionChain, stockData } from '../data/stocks';

export default function FnoAnalysis() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Autocomplete Logic
    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (val.length > 0) {
            // Suggest Stocks OR Indices
            const indices = [{ symbol: 'NIFTY', name: 'Nifty 50' }, { symbol: 'BANKNIFTY', name: 'Bank Nifty' }, { symbol: 'FINNIFTY', name: 'Fin Nifty' }];
            const allAssets = [...indices, ...stockData];

            const filtered = allAssets
                .filter(s => s.symbol.includes(val.toUpperCase()))
                .slice(0, 6); // Max 6 suggestions

            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectAsset = (symbol) => {
        setQuery(symbol);
        setShowSuggestions(false);
        runAnalysis(symbol);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query) return;
        runAnalysis(query);
    };

    const runAnalysis = (symbol) => {
        setLoading(true);
        setResult(null);
        setTimeout(() => {
            const data = analyzeOptionChain(symbol);
            setResult(data);
            setLoading(false);
        }, 1200);
    };

    return (
        <section className="glass-card" style={{
            padding: '2rem',
            marginTop: '2rem',
            border: '1px solid var(--warning)',
            background: 'linear-gradient(180deg, rgba(255, 204, 0, 0.05) 0%, rgba(0,0,0,0) 100%)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '800', letterSpacing: '-1px', color: 'var(--warning)' }}>
                        F&O SNIPER
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>DERIVATIVES ENGINE</p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,204,0,0.1)', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'right', color: 'var(--warning)' }}>
                    <div>STRATEGY: <span style={{ fontWeight: 'bold' }}>DIRECTIONAL</span></div>
                    <div>FILTER: <span style={{ fontWeight: 'bold' }}>HIGH PROBABILITY</span></div>
                </div>
            </div>

            {/* SEARCH BAR CONTAINER */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto 3rem auto' }} ref={wrapperRef}>
                <form onSubmit={handleSearch} style={{ display: 'flex' }}>
                    <input
                        type="text"
                        placeholder="ENTER SYMBOL (e.g. NIFTY)"
                        value={query}
                        onChange={handleInputChange}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '4px 0 0 4px',
                            border: '1px solid var(--warning)',
                            background: 'var(--bg-card)',
                            color: 'var(--warning)',
                            fontFamily: 'monospace',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            outline: 'none'
                        }}
                    />
                    <button type="submit" className="btn" style={{
                        borderRadius: '0 4px 4px 0',
                        padding: '0 2rem',
                        background: 'var(--warning)',
                        color: 'black',
                        border: 'none',
                        boxShadow: 'none',
                        fontWeight: '900'
                    }} disabled={loading}>
                        {loading ? '...' : 'SCAN'}
                    </button>
                </form>

                {/* SUGGESTIONS DROPDOWN */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-list" style={{ border: '1px solid var(--warning)' }}>
                        {suggestions.map(s => (
                            <div
                                key={s.symbol}
                                onClick={() => selectAsset(s.symbol)}
                                className="suggestion-item"
                                style={{ borderBottom: '1px solid rgba(255, 204, 0, 0.2)' }}
                            >
                                <span style={{ fontWeight: 'bold', color: 'var(--warning)' }}>{s.symbol}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {result && (
                <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                    {!result.tradeFound ? (
                        <div style={{ padding: '2rem', border: '1px dashed var(--text-muted)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                            <h3 style={{ marginBottom: '1rem' }}>⚠ NO TRADE FOUND</h3>
                            <p>{result.message}</p>
                        </div>
                    ) : (
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '2px solid var(--warning)',
                            borderRadius: '12px',
                            padding: '2rem',
                            maxWidth: '800px',
                            margin: '0 auto',
                            boxShadow: '0 0 30px rgba(255, 204, 0, 0.15)'
                        }}>
                            <h3 style={{ color: 'var(--warning)', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                ★ CONFIRMED SETUP ★
                            </h3>

                            <div className="fno-result-grid">
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>INSTRUMENT</div>
                                    <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 'bold', color: 'var(--text-main)', wordBreak: 'break-word' }}>{result.recommendation.instrument}</div>
                                    <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: '900', color: 'var(--success)', marginTop: '0.5rem' }}>
                                        {result.recommendation.action} @ {result.recommendation.entry}
                                    </div>
                                </div>
                                <div className="fno-result-actions" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>TARGET</span>
                                        <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>{result.recommendation.target}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>STOP LOSS</span>
                                        <span style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>{result.recommendation.stopLoss}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>IV</span>
                                        <span style={{ color: 'var(--text-main)' }}>{result.greeks.iv}%</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'left', borderLeft: '4px solid var(--warning)' }}>
                                <p style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>
                                    <strong style={{ color: 'var(--warning)' }}>LOGIC:</strong> {result.recommendation.logic}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
