import React from 'react';
import ReactDOM from 'react-dom/client';
import './index_new.css';
import './styles.css';
import App from './App';

// Patch ResizeObserver to prevent loop errors - this is a known harmless issue with React Flow
const resizeObserverErr = () => {
  const resizeObserverErrHandler = (error) => {
    if (error.message && error.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      error.stopImmediatePropagation();
    }
  };

  window.addEventListener('error', resizeObserverErrHandler);
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      event.preventDefault();
    }
  });

  // Override console.error to suppress the message
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Debounce ResizeObserver to prevent loops
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const originalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class ResizeObserver extends originalResizeObserver {
    constructor(callback) {
      const debouncedCallback = debounce(callback, 16); // ~60fps
      super(debouncedCallback);
    }
  };
};

resizeObserverErr();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
