import React from 'react';

// Catches render errors anywhere below the boundary so a single broken
// component doesn't blank the whole app. The "tap to retry" simply force
// re-mounts the subtree by bumping a key.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, key: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info?.componentStack);
  }

  retry = () => {
    this.setState((s) => ({ error: null, key: s.key + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
          textAlign: 'center', color: '#475569',
        }}>
          <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>⚠️</div>
          <div style={{fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', marginBottom: '0.4rem'}}>
            Something went wrong
          </div>
          <p style={{fontSize: '0.85rem', maxWidth: '440px', lineHeight: 1.5}}>
            We couldn't render this view. The error has been logged. Tap the button below to try again — your data is safe.
          </p>
          <button
            onClick={this.retry}
            style={{
              marginTop: '0.85rem', padding: '0.65rem 1.1rem', borderRadius: 10,
              border: 'none', background: '#6366f1', color: '#fff',
              fontWeight: 800, cursor: 'pointer',
            }}
          >
            Tap to retry
          </button>
        </div>
      );
    }
    return <React.Fragment key={this.state.key}>{this.props.children}</React.Fragment>;
  }
}
