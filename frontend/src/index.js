import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Suppress benign ResizeObserver warning triggered by Monaco Editor
const RESIZE_OBSERVER_ERR = 'ResizeObserver loop completed with undelivered notifications.';
window.addEventListener('error', (e) => {
  if (e.message === RESIZE_OBSERVER_ERR) e.stopImmediatePropagation();
});
window.onerror = (message) => {
  if (message === RESIZE_OBSERVER_ERR) return true;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
