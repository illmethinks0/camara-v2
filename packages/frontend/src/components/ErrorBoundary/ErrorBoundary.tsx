/**
 * Error Boundary component for handling React errors gracefully
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <div className="container" style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-xl)',
            backgroundColor: 'var(--color-surface-light-gray)',
            borderRadius: 'var(--radius-lg)',
            margin: 'var(--spacing-lg)'
          }}>
            <h2 style={{ color: 'var(--color-primary-red)', marginBottom: 'var(--spacing-md)' }}>
              Algo salió mal
            </h2>
            <p style={{ 
              color: 'var(--color-text-secondary)', 
              marginBottom: 'var(--spacing-lg)',
              fontSize: 'var(--font-size-body)'
            }}>
              Ha ocurrido un error inesperado. Por favor, recargue la página o contacte con soporte.
            </p>
            {this.state.error && (
              <details style={{ 
                marginBottom: 'var(--spacing-lg)',
                textAlign: 'left',
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Detalles del error (para desarrolladores)
                </summary>
                <pre style={{ 
                  fontSize: '12px', 
                  overflow: 'auto',
                  marginTop: '10px'
                }}>
                  {this.state.error.name}: {this.state.error.message}
                  {this.state.error.stack && '\n\nStack trace:\n' + this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'var(--color-primary-red)',
                color: 'white',
                border: 'none',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-body)',
                cursor: 'pointer',
                transition: 'background-color var(--duration-fast)'
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;