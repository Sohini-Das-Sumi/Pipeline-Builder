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
      // Render nothing or a fallback UI
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
