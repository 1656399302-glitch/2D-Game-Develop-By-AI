import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** If true, shows a simplified error message without technical details */
  simplified?: boolean;
}

/**
 * Global Error Boundary Component
 * 
 * Catches React rendering errors and displays a graceful fallback UI
 * instead of crashing the entire application.
 * 
 * Wraps critical sections of the app to prevent full-page crashes.
 * 
 * WCAG 2.1 AA Compliance:
 * - Error messages are announced to screen readers
 * - Fallback UI is keyboard accessible
 * - Error state is clearly communicated visually
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service if needed
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, simplified = false } = this.props;

    if (hasError) {
      // If a custom fallback is provided, render it
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-[#121826] rounded-lg border border-[#7f1d1d]"
        >
          {/* Error Icon */}
          <div className="mb-4">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="24"
                cy="24"
                r="22"
                stroke="#ef4444"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M24 14v12"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="24" cy="32" r="2.5" fill="#ef4444" />
            </svg>
          </div>

          {/* Error Title */}
          <h2 className="text-lg font-bold text-[#fecaca] mb-2">
            组件渲染错误
          </h2>

          {/* Error Message */}
          <p className="text-sm text-[#fca5a5] text-center max-w-md mb-4">
            {simplified
              ? '加载内容时出现了一些问题，请尝试刷新页面。'
              : error?.message || '发生了一个未知的渲染错误'}
          </p>

          {/* Technical Details (only in non-simplified mode) */}
          {!simplified && errorInfo && (
            <details className="w-full max-w-md mb-4">
              <summary className="text-xs text-[#9ca3af] cursor-pointer hover:text-white">
                查看技术详情
              </summary>
              <div className="mt-2 p-3 bg-[#0a0e17] rounded border border-[#1e2a42] text-xs text-[#4a5568] overflow-auto max-h-32">
                <p className="font-mono">{error?.toString()}</p>
                <p className="font-mono mt-2">{errorInfo.componentStack}</p>
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-lg font-medium bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-colors"
              aria-label="重试"
            >
              重试
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg font-medium bg-[#1e2a42] text-[#9ca3af] hover:text-white border border-[#2d3a4f] transition-colors"
              aria-label="刷新页面"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook to trigger error boundary reset from within components
 */
export function useErrorHandler() {
  const handleError = (error: Error) => {
    // Re-throw to let ErrorBoundary catch it
    throw error;
  };

  return handleError;
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Default global error handler for non-React errors
 */
export function setupGlobalErrorHandler() {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    // Could send to error reporting service
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Could send to error reporting service
  });
}

export default ErrorBoundary;
