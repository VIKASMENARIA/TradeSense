export default function Header() {
    return (
        <header style={{
            padding: '1.5rem 0',
            borderBottom: '1px solid var(--glass-border)',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    <span className="text-gradient">TradeSense</span> AI
                </h1>
                <nav>
                    <button className="btn" style={{ background: 'transparent', border: '1px solid var(--primary)' }}>Pro Dashboard</button>
                </nav>
            </div>
        </header>
    );
}
