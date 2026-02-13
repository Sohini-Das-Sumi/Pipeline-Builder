import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Check if the error is a ResizeObserver loop error
    if (error.message && error.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      // Suppress this specific error by not logging it
      return;
    }
    // Log other errors
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render an error message
      return (
        <div style={{ color: 'red', padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <h2>Application Error</h2>
          <p>An error occurred in the application. Check the browser console for details.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
