import { useState, useEffect } from 'react';
import { getAlgoStatus, getExecutionQueue, stockData, calculateArbitrage } from '../data/stocks';

export default function EsteeDashboard() {
    const [algos, setAlgos] = useState(getAlgoStatus());
    const [executions, setExecutions] = useState(getExecutionQueue());
    const [arbOpp, setArbOpp] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setExecutions(prev => prev.map(o => ({
                ...o,
                progress: Math.min(100, o.progress + Math.floor(Math.random() * 5)),
                filled: Math.min(o.totalQty, o.filled + Math.floor(o.totalQty * 0.05))
            })));

            const potentialArbs = stockData.slice(0, 5).map(s => {
                const futPrice = s.price * (1 + (Math.random() * 0.02));
                const calc = calculateArbitrage(s.price, futPrice, 25);
                return { ...s, futPrice: futPrice.toFixed(2), ...calc };
            });
            setArbOpp(potentialArbs);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard-grid">

            {/* Left Sidebar: Strategy Monitor - UPDATED UI */}
            <div className="glass-card dashboard-sidebar">
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', letterSpacing: '1px' }}>
                    Active Strategies (ALPHA)
                </h3>

                {/* Improved Vertical List with Spacing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
                    {algos.map((algo, i) => (
                        <div
                            key={i}
                            className={`strategy-card ${algo.status === 'RUNNING' ? 'running' : 'idle'}`}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-main)' }}>{algo.name}</span>
                                <span style={{
                                    fontSize: '0.65rem',
                                    background: algo.status === 'RUNNING' ? 'rgba(0,255,157,0.15)' : 'rgba(255,255,255,0.1)',
                                    color: algo.status === 'RUNNING' ? 'var(--success)' : 'var(--text-muted)',
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    fontWeight: 'bold'
                                }}>
                                    {algo.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>PnL</div>
                                    <div style={{ color: algo.dailyPnL.includes('+') ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{algo.dailyPnL}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>LATENCY</div>
                                    <div style={{ fontFamily: 'monospace' }}>{algo.latency}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>TOTAL AUM</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', lineHeight: 1.2 }}>₹ 452.8 Cr</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.2rem' }}>▲ +1.2% Day Change</div>
                </div>
            </div>

            {/* Main Content: Grid Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Top Panel: EMS */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>EMS Execution Feed</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>● LIVE</span>
                    </div>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.8rem 0.5rem', fontWeight: 'normal' }}>OID</th>
                                    <th style={{ fontWeight: 'normal' }}>ALGO</th>
                                    <th style={{ fontWeight: 'normal' }}>SYMBOL</th>
                                    <th style={{ fontWeight: 'normal' }}>SIDE</th>
                                    <th style={{ fontWeight: 'normal' }}>PROGRESS</th>
                                    <th style={{ fontWeight: 'normal' }}>AVG PX</th>
                                    <th style={{ fontWeight: 'normal' }}>FILL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {executions.map(ex => (
                                    <tr key={ex.id} className="row-hover" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.8rem 0.5rem', color: 'var(--accent)', fontFamily: 'monospace' }}>{ex.id}</td>
                                        <td><span style={{ background: 'var(--glass-border)', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem' }}>{ex.algo}</span></td>
                                        <td style={{ fontWeight: 'bold' }}>{ex.symbol}</td>
                                        <td><span style={{ color: ex.side === 'BUY' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{ex.side}</span></td>
                                        <td>
                                            <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{ width: `${ex.progress}%`, height: '100%', background: ex.side === 'BUY' ? 'var(--success)' : 'var(--danger)' }}></div>
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'monospace' }}>{ex.avgPrice.toFixed(2)}</td>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                            <span style={{ color: 'var(--text-main)' }}>{ex.filled.toLocaleString()}</span> / {ex.totalQty.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Panel: Arbitrage */}
                <div className="glass-card">
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                        I-Alpha Opportunities
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        {arbOpp.map((arb, i) => (
                            <div key={i} style={{
                                background: arb.arbitrageOpportunity ? 'rgba(0, 255, 157, 0.05)' : 'rgba(255,255,255,0.02)',
                                border: arb.arbitrageOpportunity ? '1px solid var(--success)' : '1px solid transparent',
                                padding: '1rem',
                                borderRadius: '6px',
                                textAlign: 'center',
                                transition: 'all 0.2s'
                            }} className={arb.arbitrageOpportunity ? 'glass-card' : ''}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{arb.symbol}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', gap: '0.5rem' }}>
                                    <span>S:{arb.price}</span>
                                    <span>F:{arb.futPrice}</span>
                                </div>
                                <div style={{ margin: '0.5rem 0', fontSize: '1.2rem', fontWeight: 'bold', color: arb.arbitrageOpportunity ? 'var(--success)' : 'var(--text-muted)' }}>
                                    {arb.basis}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Basis Spread</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
