import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report to monitoring service in production
    if (import.meta.env.PROD) {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // This would typically send to an error monitoring service
    console.error('Reporting error to monitoring service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-thor-bg-primary">
          <div className="max-w-md w-full mx-4">
            <div className="bg-thor-bg-secondary rounded-lg p-6 shadow-lg border border-thor-elements-borderColor">
              <div className="flex items-center mb-4">
                <div className="i-ph:warning-circle-bold text-thor-elements-icon-error text-2xl mr-3"></div>
                <h2 className="text-lg font-semibold text-thor-elements-textPrimary">
                  Something went wrong
                </h2>
              </div>

              <p className="text-thor-elements-textSecondary mb-6">
                An unexpected error occurred. This has been logged and we're working to fix it.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-thor-elements-button-primary text-thor-elements-button-primary-text px-4 py-2 rounded-md hover:bg-thor-elements-button-primary-hover transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-thor-elements-button-secondary text-thor-elements-button-secondary-text px-4 py-2 rounded-md hover:bg-thor-elements-button-secondary-hover transition-colors"
                >
                  Reload Page
                </button>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 p-3 bg-thor-bg-tertiary rounded text-xs text-thor-elements-textSecondary">
                  <summary className="cursor-pointer font-medium">Error Details (Dev Only)</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}