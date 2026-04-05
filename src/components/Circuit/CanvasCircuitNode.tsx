/**
 * Canvas Circuit Node Component
 * 
 * Round 122: Circuit Canvas Integration
 * Round 123: Added port click handlers for wire drawing
 * Round 128: Added Timer, Counter, SR Latch, D Latch, D Flip-Flop shapes
 * Round 131: Added modifier key support for multi-selection (Shift+Click, Cmd/Ctrl+Click)
 * Round 146: Enhanced visual states - animated selection border, signal state visualization
 * 
 * Renders circuit nodes (gates, InputNode, OutputNode) on the canvas
 * with signal state visualization and animated selection indicators.
 */

import React, { useCallback } from 'react';
import {
  PlacedInputNode,
  PlacedOutputNode,
  PlacedGateNode,
  CIRCUIT_NODE_SIZES,
  SIGNAL_COLORS,
  PlacedCircuitNode,
} from '../../types/circuitCanvas';
import { GateType } from '../../types/circuit';

// ============================================================================
// Selection Animation Styles (Injected for GPU-accelerated animations)
// ============================================================================

const selectionAnimationStyle = `
  @keyframes circuit-node-selection-pulse {
    0%, 100% {
      opacity: 0.8;
    }
    50% {
      opacity: 0.4;
    }
  }
  
  @keyframes circuit-node-glow {
    0%, 100% {
      filter: drop-shadow(0 0 6px var(--glow-color, #22c55e));
    }
    50% {
      filter: drop-shadow(0 0 12px var(--glow-color, #22c55e));
    }
  }
  
  .circuit-node-selection-indicator {
    transition: stroke 0.2s ease-out, stroke-width 0.15s ease-out;
    animation: circuit-node-selection-pulse 1.5s ease-in-out infinite;
  }
  
  .circuit-node-powered {
    --glow-color: #22c55e;
  }
  
  .circuit-node-unpowered {
    --glow-color: #64748b;
  }
  
  .circuit-node-selected .circuit-node-selection-indicator {
    stroke: #3b82f6;
    stroke-width: 2;
    stroke-dasharray: none;
  }
  
  .circuit-node-high-signal {
    animation: circuit-node-glow 1.5s ease-in-out infinite;
  }
  
  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .circuit-node-selection-indicator,
    .circuit-node-high-signal {
      animation: none;
    }
  }
`;

// ============================================================================
// Gate SVG Shapes with Signal State Visualization
// ============================================================================

const ANDGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, isPowered }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 5 5 Q 5 5 20 5 L 45 5 Q 60 5 75 15 Q 75 30 75 40 Q 60 45 45 45 L 20 45 Q 5 45 5 40 Q 5 5 5 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    {/* Signal glow effect for powered state */}
    {isPowered && (
      <path d="M 5 5 Q 5 5 20 5 L 45 5 Q 60 5 75 15 Q 75 30 75 40 Q 60 45 45 45 L 20 45 Q 5 45 5 40 Q 5 5 5 5 Z" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
    )}
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const ORGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, isPowered }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    {isPowered && (
      <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
    )}
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const NOTGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, isPowered }) => (
  <svg width={width} height={height} viewBox="0 0 60 40" className="gate-shape">
    <path d="M 5 5 L 45 20 L 5 35 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    {isPowered && (
      <path d="M 5 5 L 45 20 L 5 35 Z" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
    )}
    <circle cx="50" cy="20" r="5" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="20" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="60" cy="20" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const NANDGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, isPowered }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 5 5 Q 5 5 20 5 L 45 5 Q 60 5 75 15 Q 75 30 75 40 Q 60 45 45 45 L 20 45 Q 5 45 5 40 Q 5 5 5 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    {isPowered && (
      <path d="M 5 5 Q 5 5 20 5 L 45 5 Q 60 5 75 15 Q 75 30 75 40 Q 60 45 45 45 L 20 45 Q 5 45 5 40 Q 5 5 5 5 Z" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
    )}
    <circle cx="78" cy="25" r="5" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const NORGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, isPowered }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    {isPowered && (
      <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
    )}
    <circle cx="78" cy="25" r="5" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const XORGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, isPowered }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    {isPowered && (
      <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
    )}
    <path d="M 10 5 Q 18 25 10 45" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const XNORGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, isPowered }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    {isPowered && (
      <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
    )}
    <path d="M 10 5 Q 18 25 10 45" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="78" cy="25" r="5" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

// ============================================================================
// Sequential/Memory Component SVG Shapes
// ============================================================================

const TimerGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; done?: boolean; isActive?: boolean; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, done = false, isActive = false, isPowered }) => {
  const doneColor = done ? '#22c55e' : signalColor;
  return (
    <svg width={width} height={height} viewBox="0 0 80 70" className="gate-shape">
      <rect x="5" y="5" width="70" height="60" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke={doneColor} strokeWidth="2" />
      {isPowered && (
        <rect x="5" y="5" width="70" height="60" rx="6" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
      )}
      <circle cx="25" cy="30" r="12" fill="none" stroke={doneColor} strokeWidth="2" />
      <line x1="25" y1="30" x2="25" y2="22" stroke={doneColor} strokeWidth="2" />
      <line x1="25" y1="30" x2="31" y2="30" stroke={doneColor} strokeWidth="2" />
      <text x="60" y="28" textAnchor="middle" fill={doneColor} fontSize="14" fontFamily="monospace" fontWeight="bold">{done ? '✓' : '...'}</text>
      <text x="40" y="55" textAnchor="middle" fill={doneColor} fontSize="8" fontFamily="monospace">TMR</text>
      {isActive && <rect x="5" y="5" width="70" height="60" rx="6" fill="none" stroke={signalColor} strokeWidth="2" opacity="0.5"><animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite" /></rect>}
      {/* Trigger input */}
      <circle cx="0" cy="25" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
      <text x="6" y="28" fill={signalColor} fontSize="6" fontFamily="monospace">T</text>
      {/* Reset input */}
      <circle cx="0" cy="45" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
      <text x="6" y="48" fill={signalColor} fontSize="6" fontFamily="monospace">R</text>
      {/* Output Q */}
      <circle cx="80" cy="25" r="4" fill={doneColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
      <text x="72" y="28" fill={doneColor} fontSize="6" fontFamily="monospace">Q</text>
      {/* Done flag */}
      <circle cx="80" cy="45" r="4" fill={done ? '#22c55e' : signalColor} className="port-output" data-port-index="1" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, true); }} style={{ cursor: 'pointer' }} />
      <text x="72" y="48" fill={doneColor} fontSize="6" fontFamily="monospace">D</text>
    </svg>
  );
};

const CounterGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; count?: number; overflow?: boolean; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, count = 0, overflow = false, isPowered }) => {
  const overflowColor = overflow ? '#f59e0b' : signalColor;
  return (
    <svg width={width} height={height} viewBox="0 0 80 70" className="gate-shape">
      <rect x="5" y="5" width="70" height="60" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke={overflowColor} strokeWidth="2" />
      {isPowered && (
        <rect x="5" y="5" width="70" height="60" rx="6" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
      )}
      <text x="40" y="30" textAnchor="middle" fill={overflowColor} fontSize="16" fontFamily="monospace" fontWeight="bold">{count}</text>
      <text x="40" y="50" textAnchor="middle" fill={signalColor} fontSize="8" fontFamily="monospace">CNT</text>
      {overflow && <text x="68" y="16" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace">!</text>}
      {/* Increment */}
      <circle cx="0" cy="20" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
      <text x="6" y="23" fill={signalColor} fontSize="6" fontFamily="monospace">+</text>
      {/* Decrement */}
      <circle cx="0" cy="40" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
      <text x="6" y="43" fill={signalColor} fontSize="6" fontFamily="monospace">-</text>
      {/* Reset */}
      <circle cx="0" cy="55" r="4" fill={signalColor} className="port-input" data-port-index="2" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(2, false); }} style={{ cursor: 'pointer' }} />
      <text x="6" y="58" fill={signalColor} fontSize="6" fontFamily="monospace">R</text>
      {/* Output Q */}
      <circle cx="80" cy="25" r="4" fill={overflowColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
      <text x="72" y="28" fill={overflowColor} fontSize="6" fontFamily="monospace">Q</text>
      {/* Overflow */}
      <circle cx="80" cy="45" r="4" fill={overflow ? '#f59e0b' : signalColor} className="port-output" data-port-index="1" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, true); }} style={{ cursor: 'pointer' }} />
      <text x="72" y="48" fill={overflowColor} fontSize="6" fontFamily="monospace">OV</text>
    </svg>
  );
};

const SRLatchGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; q?: boolean; invalidState?: boolean; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, q = false, invalidState = false, isPowered }) => {
  const qColor = invalidState ? '#ef4444' : q ? '#22c55e' : signalColor;
  const borderColor = invalidState ? '#ef4444' : signalColor;
  return (
    <svg width={width} height={height} viewBox="0 0 80 70" className="gate-shape">
      <rect x="5" y="5" width="70" height="60" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke={borderColor} strokeWidth="2" />
      {isPowered && (
        <rect x="5" y="5" width="70" height="60" rx="6" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
      )}
      <text x="40" y="22" textAnchor="middle" fill={borderColor} fontSize="14" fontFamily="monospace" fontWeight="bold">SR</text>
      <text x="20" y="45" textAnchor="middle" fill={qColor} fontSize="12" fontFamily="monospace">Q:{q?'1':'0'}</text>
      <text x="60" y="45" textAnchor="middle" fill={qColor} fontSize="12" fontFamily="monospace">Q̅:{!q?'1':'0'}</text>
      {invalidState && <><rect x="5" y="5" width="70" height="60" rx="6" fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.7"><animate attributeName="opacity" values="0.7;0.3;0.7" dur="0.5s" repeatCount="indefinite" /></rect><text x="40" y="60" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="monospace">ERR</text></>}
      {/* Set input */}
      <circle cx="0" cy="20" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
      <text x="6" y="23" fill={signalColor} fontSize="6" fontFamily="monospace">S</text>
      {/* Reset input */}
      <circle cx="0" cy="40" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
      <text x="6" y="43" fill={signalColor} fontSize="6" fontFamily="monospace">R</text>
      {/* Q output */}
      <circle cx="80" cy="25" r="4" fill={qColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
      <text x="72" y="28" fill={qColor} fontSize="6" fontFamily="monospace">Q</text>
      {/* Q-bar output */}
      <circle cx="80" cy="45" r="4" fill={qColor} className="port-output" data-port-index="1" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, true); }} style={{ cursor: 'pointer' }} />
      <text x="72" y="48" fill={qColor} fontSize="6" fontFamily="monospace">Q̅</text>
    </svg>
  );
};

const DLatchGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; q?: boolean; enable?: boolean; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, q = false, enable = false, isPowered }) => {
  const qColor = q ? '#22c55e' : signalColor;
  const enableColor = enable ? '#22c55e' : signalColor;
  return (
    <svg width={width} height={height} viewBox="0 0 80 70" className="gate-shape">
      <rect x="5" y="5" width="70" height="60" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
      {isPowered && (
        <rect x="5" y="5" width="70" height="60" rx="6" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
      )}
      <text x="40" y="22" textAnchor="middle" fill={signalColor} fontSize="14" fontFamily="monospace" fontWeight="bold">D</text>
      <text x="40" y="35" textAnchor="middle" fill={enableColor} fontSize="8" fontFamily="monospace">E:{enable?'1':'0'}</text>
      <text x="20" y="50" textAnchor="middle" fill={qColor} fontSize="12" fontFamily="monospace">Q:{q?'1':'0'}</text>
      <text x="60" y="50" textAnchor="middle" fill={qColor} fontSize="12" fontFamily="monospace">Q̅:{!q?'1':'0'}</text>
      {/* Data input */}
      <circle cx="0" cy="20" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
      <text x="6" y="23" fill={signalColor} fontSize="6" fontFamily="monospace">D</text>
      {/* Enable input */}
      <circle cx="0" cy="40" r="4" fill={enableColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
      <text x="6" y="43" fill={enableColor} fontSize="6" fontFamily="monospace">E</text>
      {/* Q output */}
      <circle cx="80" cy="25" r="4" fill={qColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
      <text x="72" y="28" fill={qColor} fontSize="6" fontFamily="monospace">Q</text>
      {/* Q-bar output */}
      <circle cx="80" cy="45" r="4" fill={qColor} className="port-output" data-port-index="1" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, true); }} style={{ cursor: 'pointer' }} />
      <text x="72" y="48" fill={qColor} fontSize="6" fontFamily="monospace">Q̅</text>
    </svg>
  );
};

const DFlipFlopGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void; q?: boolean; clock?: boolean; isPowered: boolean }> = ({ signalColor, width, height, onPortClick, q = false, clock = false, isPowered }) => {
  const qColor = q ? '#22c55e' : signalColor;
  const clockColor = clock ? '#22c55e' : signalColor;
  return (
    <svg width={width} height={height} viewBox="0 0 80 70" className="gate-shape">
      <rect x="5" y="5" width="70" height="60" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
      {isPowered && (
        <rect x="5" y="5" width="70" height="60" rx="6" fill="none" stroke={signalColor} strokeWidth="4" opacity="0.3" style={{ filter: `drop-shadow(0 0 8px ${signalColor})` }} />
      )}
      <text x="40" y="18" textAnchor="middle" fill={signalColor} fontSize="12" fontFamily="monospace" fontWeight="bold">D-FF</text>
      <polygon points="35,22 43,22 39,28" fill={clockColor} />
      <text x="55" y="27" textAnchor="middle" fill={clockColor} fontSize="7" fontFamily="monospace">CLK</text>
      <text x="20" y="48" textAnchor="middle" fill={qColor} fontSize="12" fontFamily="monospace">Q:{q?'1':'0'}</text>
      <text x="60" y="48" textAnchor="middle" fill={qColor} fontSize="12" fontFamily="monospace">Q̅:{!q?'1':'0'}</text>
      <text x="40" y="60" textAnchor="middle" fill={signalColor} fontSize="6" fontFamily="monospace">↑</text>
      {/* Data input */}
      <circle cx="0" cy="20" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
      <text x="6" y="23" fill={signalColor} fontSize="6" fontFamily="monospace">D</text>
      {/* Clock input */}
      <circle cx="0" cy="40" r="4" fill={clockColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
      <text x="6" y="43" fill={clockColor} fontSize="6" fontFamily="monospace">CLK</text>
      {/* Q output */}
      <circle cx="80" cy="25" r="4" fill={qColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
      <text x="72" y="28" fill={qColor} fontSize="6" fontFamily="monospace">Q</text>
      {/* Q-bar output */}
      <circle cx="80" cy="45" r="4" fill={qColor} className="port-output" data-port-index="1" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, true); }} style={{ cursor: 'pointer' }} />
      <text x="72" y="48" fill={qColor} fontSize="6" fontFamily="monospace">Q̅</text>
    </svg>
  );
};

// ============================================================================
// Node Components with Enhanced Visual States
// ============================================================================

// Inject selection animation styles once
const styleId = 'circuit-node-ux-styles';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = selectionAnimationStyle;
  document.head.appendChild(styleEl);
}

const InputNodeCanvas: React.FC<{ node: PlacedInputNode; isSelected: boolean; cycleWarning: boolean; onClick: (e: React.MouseEvent) => void; onToggle: () => void; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ node, isSelected, cycleWarning, onClick, onToggle, onPortClick }) => {
  const signalColor = node.state ? SIGNAL_COLORS.HIGH : SIGNAL_COLORS.LOW;
  const isPowered = node.state === true;
  const size = node.size || CIRCUIT_NODE_SIZES.input;
  const borderColor = cycleWarning ? '#ef4444' : isSelected ? SIGNAL_COLORS.SELECTED : signalColor;
  
  return (
    <g 
      className={`circuit-node input-node ${isSelected ? 'circuit-node-selected' : ''} ${isPowered ? 'circuit-node-powered circuit-node-high-signal' : 'circuit-node-unpowered'}`} 
      onClick={onClick} 
      style={{ cursor: 'pointer' }} 
      data-node-type="input" 
      data-node-id={node.id} 
      data-state={node.state ? 'HIGH' : 'LOW'} 
      data-selected={isSelected ? 'true' : 'false'} 
      data-cycle-warning={cycleWarning ? 'true' : 'false'}
      data-is-powered={isPowered ? 'true' : 'false'}
    >
      {/* Animated selection indicator with CSS transition */}
      {(isSelected || cycleWarning) && (
        <rect 
          x="-4" 
          y="-4" 
          width={size.width + 8} 
          height={size.height + 8} 
          rx="6" 
          fill="none" 
          stroke={borderColor} 
          strokeWidth="2" 
          strokeDasharray={cycleWarning ? '4 2' : 'none'} 
          className="circuit-node-selection-indicator"
        />
      )}
      <rect x="0" y="0" width={size.width} height={size.height} rx="8" fill="rgba(15, 23, 42, 0.95)" stroke={signalColor} strokeWidth="2" />
      {/* Glow effect for powered state */}
      <circle 
        cx={size.width / 2} 
        cy={size.height / 2 - 4} 
        r="12" 
        fill={signalColor} 
        style={{ filter: node.state ? `drop-shadow(0 0 8px ${signalColor})` : 'none' }} 
        className={isPowered ? 'circuit-glow-element' : ''}
      />
      <rect x={size.width / 2 - 16} y={size.height / 2 + 10} width="32" height="14" rx="4" fill="rgba(100, 116, 139, 0.3)" stroke={signalColor} strokeWidth="1" className="toggle-hint" onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ cursor: 'pointer' }} />
      <text x={size.width / 2} y={size.height + 16} textAnchor="middle" fill={signalColor} fontSize="10" fontFamily="monospace">{node.label || 'IN'}</text>
      <text x={size.width / 2} y={size.height + 28} textAnchor="middle" fill={signalColor} fontSize="8" fontFamily="monospace">{node.state ? 'HIGH' : 'LOW'}</text>
      {/* Output port - InputNode only has output */}
      <circle cx={size.width} cy={size.height / 2} r="5" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
      {cycleWarning && <g transform={`translate(${size.width - 12}, -12)`}><circle r="10" fill="#ef4444" /><text x="0" y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">!</text></g>}
    </g>
  );
};

const OutputNodeCanvas: React.FC<{ node: PlacedOutputNode; isSelected: boolean; cycleWarning: boolean; onClick: (e: React.MouseEvent) => void; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ node, isSelected, cycleWarning, onClick, onPortClick }) => {
  const signalColor = node.inputSignal ? SIGNAL_COLORS.HIGH : SIGNAL_COLORS.LOW;
  const isPowered = node.inputSignal === true;
  const size = node.size || CIRCUIT_NODE_SIZES.output;
  const borderColor = cycleWarning ? '#ef4444' : isSelected ? SIGNAL_COLORS.SELECTED : signalColor;
  
  return (
    <g 
      className={`circuit-node output-node ${isSelected ? 'circuit-node-selected' : ''} ${isPowered ? 'circuit-node-powered circuit-node-high-signal' : 'circuit-node-unpowered'}`} 
      onClick={onClick} 
      style={{ cursor: 'pointer' }} 
      data-node-type="output" 
      data-node-id={node.id} 
      data-signal={node.inputSignal ? 'HIGH' : 'LOW'} 
      data-selected={isSelected ? 'true' : 'false'} 
      data-cycle-warning={cycleWarning ? 'true' : 'false'}
      data-is-powered={isPowered ? 'true' : 'false'}
    >
      {/* Animated selection indicator with CSS transition */}
      {(isSelected || cycleWarning) && (
        <rect 
          x="-4" 
          y="-4" 
          width={size.width + 8} 
          height={size.height + 8} 
          rx="6" 
          fill="none" 
          stroke={borderColor} 
          strokeWidth="2" 
          strokeDasharray={cycleWarning ? '4 2' : 'none'} 
          className="circuit-node-selection-indicator"
        />
      )}
      <rect x="0" y="0" width={size.width} height={size.height} rx="8" fill="rgba(15, 23, 42, 0.95)" stroke={signalColor} strokeWidth="2" />
      <circle cx={size.width / 2} cy={size.height / 2} r="18" fill="none" stroke={signalColor} strokeWidth="2" opacity="0.5" />
      <circle cx={size.width / 2} cy={size.height / 2} r="12" fill={signalColor} style={{ filter: node.inputSignal ? `drop-shadow(0 0 12px ${signalColor}) drop-shadow(0 0 24px ${signalColor})` : 'none' }} className={isPowered ? 'circuit-glow-element' : ''} />
      <text x={size.width / 2} y={size.height + 16} textAnchor="middle" fill={signalColor} fontSize="10" fontFamily="monospace">{node.label || 'OUT'}</text>
      <text x={size.width / 2} y={size.height + 28} textAnchor="middle" fill={signalColor} fontSize="8" fontFamily="monospace">{node.inputSignal ? 'HIGH' : 'LOW'}</text>
      {/* Input port - OutputNode only has input */}
      <circle cx="0" cy={size.height / 2} r="5" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
      {cycleWarning && <g transform="translate(12, -12)"><circle r="10" fill="#ef4444" /><text x="0" y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">!</text></g>}
    </g>
  );
};

const GateNodeCanvas: React.FC<{ node: PlacedGateNode; isSelected: boolean; cycleWarning: boolean; onClick: (e: React.MouseEvent) => void; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ node, isSelected, cycleWarning, onClick, onPortClick }) => {
  const signalColor = node.output ? SIGNAL_COLORS.HIGH : SIGNAL_COLORS.LOW;
  const isPowered = node.output === true;
  const size = node.size || CIRCUIT_NODE_SIZES[node.gateType!] || { width: 80, height: 50 };
  const borderColor = cycleWarning ? '#ef4444' : isSelected ? SIGNAL_COLORS.SELECTED : signalColor;
  
  const handlePortClick = useCallback((portIndex: number, isOutput: boolean) => {
    onPortClick?.(portIndex, isOutput);
  }, [onPortClick]);
  
  const renderGateShape = () => {
    const shapeProps = { signalColor, width: size.width, height: size.height, onPortClick: handlePortClick, isPowered };
    switch (node.gateType) {
      case 'AND': return <ANDGateShape {...shapeProps} />;
      case 'OR': return <ORGateShape {...shapeProps} />;
      case 'NOT': return <NOTGateShape {...shapeProps} />;
      case 'NAND': return <NANDGateShape {...shapeProps} />;
      case 'NOR': return <NORGateShape {...shapeProps} />;
      case 'XOR': return <XORGateShape {...shapeProps} />;
      case 'XNOR': return <XNORGateShape {...shapeProps} />;
      case 'TIMER': return <TimerGateShape {...shapeProps} done={node.output} isActive={false} />;
      case 'COUNTER': {
        const params = node.parameters as { maxValue?: number; count?: number; overflow?: boolean } | undefined;
        return <CounterGateShape {...shapeProps} count={params?.count ?? 0} overflow={params?.overflow ?? false} />;
      }
      case 'SR_LATCH': {
        const params = node.parameters as { q?: boolean; invalidState?: boolean } | undefined;
        return <SRLatchGateShape {...shapeProps} q={params?.q ?? false} invalidState={params?.invalidState ?? false} />;
      }
      case 'D_LATCH': {
        const params = node.parameters as { q?: boolean; enable?: boolean } | undefined;
        return <DLatchGateShape {...shapeProps} q={params?.q ?? false} enable={params?.enable ?? false} />;
      }
      case 'D_FLIP_FLOP': {
        const params = node.parameters as { q?: boolean; clock?: boolean } | undefined;
        return <DFlipFlopGateShape {...shapeProps} q={params?.q ?? false} clock={params?.clock ?? false} />;
      }
      default: return null;
    }
  };
  
  return (
    <g 
      className={`circuit-node gate-node ${isSelected ? 'circuit-node-selected' : ''} ${isPowered ? 'circuit-node-powered circuit-node-high-signal' : 'circuit-node-unpowered'}`} 
      onClick={onClick} 
      style={{ cursor: 'pointer' }} 
      data-node-type="gate" 
      data-node-id={node.id} 
      data-gate-type={node.gateType} 
      data-output={node.output ? 'HIGH' : 'LOW'} 
      data-selected={isSelected ? 'true' : 'false'} 
      data-cycle-warning={cycleWarning ? 'true' : 'false'}
      data-is-powered={isPowered ? 'true' : 'false'}
    >
      {/* Animated selection indicator with CSS transition */}
      {(isSelected || cycleWarning) && (
        <rect 
          x="-6" 
          y="-6" 
          width={size.width + 12} 
          height={size.height + 20} 
          rx="4" 
          fill="none" 
          stroke={borderColor} 
          strokeWidth="2" 
          strokeDasharray={cycleWarning ? '4 2' : 'none'} 
          className="circuit-node-selection-indicator"
        />
      )}
      {renderGateShape()}
      <text x={size.width / 2} y={size.height + 16} textAnchor="middle" fill={signalColor} fontSize="12" fontFamily="monospace" fontWeight="bold">{node.gateType}</text>
      {cycleWarning && <g transform={`translate(${size.width / 2}, -12)`}><circle r="10" fill="#ef4444" /><text x="0" y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">!</text></g>}
    </g>
  );
};

// ============================================================================
// Main Component
// ============================================================================

// Round 131: Updated props to include React.MouseEvent for modifier key support
export interface CanvasCircuitNodeProps {
  /** Node data */
  node: PlacedCircuitNode;
  /** Whether node is selected */
  isSelected?: boolean;
  /** Viewport zoom level */
  zoom?: number;
  /** Whether node is affected by cycle detection */
  cycleWarning?: boolean;
  /** Click handler - now receives mouse event for modifier key detection */
  onClick?: (nodeId: string, event?: React.MouseEvent) => void;
  /** Drag start handler */
  onDragStart?: (nodeId: string, event: React.MouseEvent) => void;
  /** Port click handler for wire drawing */
  onPortClick?: (nodeId: string, portIndex: number, isOutput: boolean) => void;
  /** Input toggle handler (for input nodes) */
  onInputToggle?: (nodeId: string) => void;
}

export const CanvasCircuitNode: React.FC<CanvasCircuitNodeProps> = ({ node, isSelected = false, cycleWarning = false, onClick, onDragStart, onInputToggle, onPortClick }) => {
  // Round 131: Pass mouse event to onClick for modifier key detection
  const handleClick = useCallback((e: React.MouseEvent) => { onClick?.(node.id, e); }, [onClick, node.id]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start drag for port clicks or toggle clicks
    if ((e.target as Element).closest('.port-input, .port-output, .toggle-hint')) return;
    if (e.button === 0) { e.stopPropagation(); onDragStart?.(node.id, e); }
  }, [onDragStart, node.id]);
  
  const handleToggle = useCallback(() => { onInputToggle?.(node.id); }, [onInputToggle, node.id]);
  
  const handlePortClick = useCallback((portIndex: number, isOutput: boolean) => {
    onPortClick?.(node.id, portIndex, isOutput);
  }, [onPortClick, node.id]);
  
  const renderNode = () => {
    switch (node.type) {
      case 'input': return <InputNodeCanvas node={node as PlacedInputNode} isSelected={isSelected} cycleWarning={cycleWarning} onClick={handleClick} onToggle={handleToggle} onPortClick={handlePortClick} />;
      case 'output': return <OutputNodeCanvas node={node as PlacedOutputNode} isSelected={isSelected} cycleWarning={cycleWarning} onClick={handleClick} onPortClick={handlePortClick} />;
      case 'gate': return <GateNodeCanvas node={node as PlacedGateNode} isSelected={isSelected} cycleWarning={cycleWarning} onClick={handleClick} onPortClick={handlePortClick} />;
      default: return null;
    }
  };
  
  return (
    <g transform={`translate(${node.position.x}, ${node.position.y})`} onMouseDown={handleMouseDown} onClick={handleClick} className={`canvas-circuit-node ${node.type}-node`}>
      {renderNode()}
    </g>
  );
};

export interface GateSelectorItem {
  type: 'gate' | 'input' | 'output';
  gateType?: GateType;
  label: string;
  icon: string;
}

export const CIRCUIT_COMPONENT_SELECTOR: GateSelectorItem[] = [
  { type: 'input', label: '输入', icon: '🔌' },
  { type: 'output', label: '输出', icon: '💡' },
  { type: 'gate', gateType: 'AND', label: 'AND', icon: '∧' },
  { type: 'gate', gateType: 'OR', label: 'OR', icon: '∨' },
  { type: 'gate', gateType: 'NOT', label: 'NOT', icon: '¬' },
  { type: 'gate', gateType: 'NAND', label: 'NAND', icon: '⊼' },
  { type: 'gate', gateType: 'NOR', label: 'NOR', icon: '⊽' },
  { type: 'gate', gateType: 'XOR', label: 'XOR', icon: '⊕' },
  { type: 'gate', gateType: 'XNOR', label: 'XNOR', icon: '⊙' },
];

export default CanvasCircuitNode;
