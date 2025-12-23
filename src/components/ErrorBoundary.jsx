import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    color: 'var(--danger)',
                    background: 'var(--bg-card)',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠ TERMINAL CRASH DETECTED</h1>
                    <p style={{ maxWidth: '600px', marginBottom: '1rem', color: 'var(--text-main)' }}>
                        The system encountered a critical rendering error. This is often due to data feed corruption or module resizing.
                    </p>
                    <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', background: '#000', padding: '1rem', borderRadius: '4px', maxWidth: '800px', overflow: 'auto' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn"
                        style={{ marginTop: '2rem', background: 'var(--primary)', color: 'white' }}
                    >
                        REBOOT SYSTEM
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
