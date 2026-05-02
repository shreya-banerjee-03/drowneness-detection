import React from 'react';
import ReactDOM from 'react-dom/client';
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import Bootstrap JS if needed
import 'bootstrap/dist/js/bootstrap.bundle.min';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Suppress color-adjust warning
const originalWarn = console.warn;
const colorAdjustRegex = /color-adjust/;
console.warn = function filterWarnings(msg, ...args) {
  if (typeof msg === 'string' && colorAdjustRegex.test(msg)) {
    return;
  }
  originalWarn.apply(console, [msg, ...args]);
};
