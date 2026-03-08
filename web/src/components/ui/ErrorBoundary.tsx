import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
          <div 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'rgba(239, 68, 68, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <AlertTriangle size={40} color="var(--error)" />
          </div>
          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>The Forge has cracked...</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              A stream interference has occurred. Our engineers are investigating the leak.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ gap: '0.75rem' }}
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={18} />
            Re-ignite Forge
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
