import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// E2E Testing: Expose circuit canvas store on window for Playwright tests (AC-124-004)
import { useCircuitCanvasStore } from './store/useCircuitCanvasStore';
// E2E Testing: Expose machine store on window for Playwright tests (Round 127)
import { useMachineStore } from './store/useMachineStore';

declare global {
  interface Window {
    __circuitCanvasStore?: typeof useCircuitCanvasStore;
    __machineStore?: typeof useMachineStore;
  }
}
if (typeof window !== 'undefined') {
  window.__circuitCanvasStore = useCircuitCanvasStore;
  window.__machineStore = useMachineStore;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
