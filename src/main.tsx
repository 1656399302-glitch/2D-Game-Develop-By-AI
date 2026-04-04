import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// E2E Testing: Expose circuit canvas store on window for Playwright tests (AC-124-004)
// This allows tests to create wires directly via the store API
import { useCircuitCanvasStore } from './store/useCircuitCanvasStore';
declare global {
  interface Window {
    __circuitCanvasStore?: typeof useCircuitCanvasStore;
  }
}
if (typeof window !== 'undefined') {
  window.__circuitCanvasStore = useCircuitCanvasStore;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
