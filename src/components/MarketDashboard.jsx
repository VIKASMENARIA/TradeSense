import { useState, useEffect } from 'react';
import { fetchMarketDepth, subscribeToApiStatus } from '../data/stocks';

export default function MarketDashboard() {
    const [marketData, setMarketData] = useState({ topGainers: [], topLosers: [] });
    const [loading, setLoading] = useState(false);

    // Function to load data (simulated or live)
    const refreshData = async () => {
        setLoading(true);
        const data = await fetchMarketDepth();
        setMarketData(data);
        setLoading(false);
    };

    useEffect(() => {
        // Initial Load
        refreshData();

        // Subscribe to API config changes (e.g. user enters key) to trigger re-fetch
        const unsubscribe = subscribeToApiStatus(() => {
            refreshData();
        });

        // Auto-refresh every 60s (Live) or on mount
        const interval = setInterval(refreshData, 60000); // 1 min refresh for API limits

        return () => {
            unsubscribe();
            clearInterval(interval);
        }
    }, []);

    const RowItem = ({ stock, type }) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
            padding: '0.6rem 0.5rem',
            borderBottom: '1px solid var(--glass-border)',
            fontSize: '0.8rem',
            alignItems: 'center',
            gap: '0.5rem'
        }} className="row-hover">
            <div style={{ fontWeight: '600', color: type === 'gain' ? 'var(--success)' : 'var(--danger)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.symbol}</div>
            <div style={{ fontFamily: 'monospace' }}>{stock.price}</div>
            <div style={{ color: type === 'gain' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                {stock.changePercentage > 0 ? '+' : ''}{stock.changePercentage}%
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{parseInt(stock.volume).toLocaleString()}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{stock.oi}</div>
        </div>
    );

    return (
        <section className="animate-fade-in" style={{ margin: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', letterSpacing: '1px' }}>
                    MARKET DEPTH <span style={{ fontSize: '0.8rem', color: 'var(--accent)', verticalAlign: 'middle', marginLeft: '0.5rem' }}>
                        {loading ? '↻ UPDATING...' : '● LIVE'}
                    </span>
                </h2>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <span>VOL: <span style={{ color: 'var(--text-main)' }}>High</span></span>
                    <span>VIX: <span style={{ color: 'var(--danger)' }}>14.2</span></span>
                </div>
            </div>

            <div className="market-grid">
                {/* Upper Circuit Column */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{
                        background: 'rgba(0, 255, 157, 0.1)',
                        padding: '1rem',
                        borderBottom: '1px solid var(--glass-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ color: 'var(--success)', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase' }}>
                            ▲ Top Gainers
                        </h3>
                        <span style={{ fontSize: '0.7rem', background: 'var(--success)', color: 'black', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>BULLISH</span>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
                        padding: '0.8rem 0.5rem',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontWeight: 'bold',
                        background: 'rgba(0,0,0,0.2)',
                        gap: '0.5rem'
                    }}>
                        <div>SYM</div>
                        <div>LTP</div>
                        <div>%</div>
                        <div>VOL</div>
                        <div>OI</div>
                    </div>

                    <div style={{ maxHeight: '600px', overflowY: 'auto', minHeight: '200px' }} className="custom-scrollbar">
                        {loading && marketData.topGainers.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Feed...</div>
                        ) : (
                            marketData.topGainers.map(s => <RowItem key={s.symbol} stock={s} type="gain" />)
                        )}
                    </div>
                </div>

                {/* Lower Circuit Column */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{
                        background: 'rgba(255, 0, 85, 0.1)',
                        padding: '1rem',
                        borderBottom: '1px solid var(--glass-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ color: 'var(--danger)', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase' }}>
                            ▼ Top Losers
                        </h3>
                        <span style={{ fontSize: '0.7rem', background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>BEARISH</span>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
                        padding: '0.8rem 0.5rem',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontWeight: 'bold',
                        background: 'rgba(0,0,0,0.2)',
                        gap: '0.5rem'
                    }}>
                        <div>SYM</div>
                        <div>LTP</div>
                        <div>%</div>
                        <div>VOL</div>
                        <div>OI</div>
                    </div>
                    <div style={{ maxHeight: '600px', overflowY: 'auto', minHeight: '200px' }} className="custom-scrollbar">
                        {loading && marketData.topLosers.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Feed...</div>
                        ) : (
                            marketData.topLosers.map(s => <RowItem key={s.symbol} stock={s} type="loss" />)
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
