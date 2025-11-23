import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console or error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        >
          <div
            className="max-w-md w-full p-8 rounded-lg shadow-lg text-center"
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "var(--color-danger)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--text-heading)" }}
              >
                Something went wrong
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                We're sorry, but something unexpected happened. Please try
                refreshing the page.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details
                className="mb-6 text-left p-4 rounded"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                <summary
                  className="cursor-pointer font-semibold mb-2"
                  style={{ color: "var(--text-heading)" }}
                >
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--text-inverse)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--color-primary-hover)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "var(--color-primary)";
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-lg font-medium transition-colors border"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
