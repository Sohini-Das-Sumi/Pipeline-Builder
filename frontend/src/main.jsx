// Debug: Log startup
console.log('[DEBUG] main.jsx starting...');

// Set dark theme immediately before React renders to prevent white flash
document.documentElement.setAttribute('data-theme', 'dark');
document.body.style.backgroundColor = '#000000';

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { StoreProvider } from './StoreContext.jsx'
import './index.css'
import './styles.css'

console.log('[DEBUG] Imports done, creating root...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>,
)

console.log('[DEBUG] Render called');
