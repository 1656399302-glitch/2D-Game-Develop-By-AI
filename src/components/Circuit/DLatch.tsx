/**
 * D Latch Component
 * 
 * Round 128: Sequential Components
 * 
 * SVG D Latch component (level-sensitive).
 * Inputs: Data (D), Enable (E)
 * Outputs: Q, Q̅ (complement)
 * E=HIGH → Q=D, E=LOW → hold state
 */

import React from 'react';
import { SignalState } from '../../types/circuit';

// ============================================================================
// D Latch SVG Shape
// ============================================================================

interface DLatchShapeProps {
  signalColor: string;
  width: number;
  height: number;
  q?: SignalState;
  qBar?: SignalState;
  enable?: SignalState;
  onPortClick?: (portIndex: number, isOutput: boolean) => void;
}

const DLatchShape: React.FC<DLatchShapeProps> = ({
  signalColor,
  width,
  height,
  q = false,
  qBar = true,
  enable = false,
  onPortClick,
}) => {
  const qColor = q ? '#22c55e' : signalColor;
  const qBarColor = qBar ? '#22c55e' : signalColor;
  const enableColor = enable ? '#22c55e' : signalColor;
  
  return (
    <svg width={width} height={height} viewBox="0 0 80 70" className="gate-shape">
      {/* D Latch box */}
      <rect
        x="5" y="5"
        width="70" height="60"
        rx="6"
        fill="rgba(15, 23, 42, 0.95)"
        stroke={signalColor}
        strokeWidth="2"
      />
      
      {/* D Latch symbol */}
      <text
        x="40" y="22"
        textAnchor="middle"
        fill={signalColor}
        fontSize="14"
        fontFamily="monospace"
        fontWeight="bold"
      >
        D
      </text>
      
      {/* Enable indicator */}
      <text
        x="40" y="35"
        textAnchor="middle"
        fill={enableColor}
        fontSize="8"
        fontFamily="monospace"
      >
        E:{enable ? '1' : '0'}
      </text>
      
      {/* Q indicator */}
      <text
        x="20" y="50"
        textAnchor="middle"
        fill={qColor}
        fontSize="12"
        fontFamily="monospace"
      >
        Q:{q ? '1' : '0'}
      </text>
      
      {/* Q-bar indicator */}
      <text
        x="60" y="50"
        textAnchor="middle"
        fill={qBarColor}
        fontSize="12"
        fontFamily="monospace"
      >
        Q̅:{qBar ? '1' : '0'}
      </text>
      
      {/* Data input port (port 0) */}
      <circle
        cx="0" cy="20"
        r="4"
        fill={signalColor}
        className="port-input"
        data-port-index="0"
        data-port-type="input"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="6" y="23" fill={signalColor} fontSize="6" fontFamily="monospace">D</text>
      
      {/* Enable input port (port 1) */}
      <circle
        cx="0" cy="40"
        r="4"
        fill={enableColor}
        className="port-input"
        data-port-index="1"
        data-port-type="input"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="6" y="43" fill={enableColor} fontSize="6" fontFamily="monospace">E</text>
      
      {/* Q output port (port 0, output) */}
      <circle
        cx="80" cy="25"
        r="4"
        fill={qColor}
        className="port-output"
        data-port-index="0"
        data-port-type="output"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="72" y="28" fill={qColor} fontSize="6" fontFamily="monospace">Q</text>
      
      {/* Q-bar output port (port 1, output) */}
      <circle
        cx="80" cy="45"
        r="4"
        fill={qBarColor}
        className="port-output"
        data-port-index="1"
        data-port-type="output"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(1, true); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="72" y="48" fill={qBarColor} fontSize="6" fontFamily="monospace">Q̅</text>
    </svg>
  );
};

// ============================================================================
// Main D Latch Component
// ============================================================================

interface DLatchProps {
  q?: SignalState;
  qBar?: SignalState;
  enableSignal?: SignalState;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  showLabel?: boolean;
  onPortClick?: (portIndex: number, isOutput: boolean) => void;
}

export const DLatch: React.FC<DLatchProps> = ({
  q = false,
  qBar = true,
  enableSignal = false,
  position = { x: 0, y: 0 },
  size = { width: 80, height: 70 },
  showLabel = true,
  onPortClick,
}) => {
  const signalColor = q ? '#22c55e' : '#64748b';
  
  return (
    <div
      className="relative inline-flex flex-col items-center"
      style={{
        width: size.width,
        height: size.height + (showLabel ? 24 : 0),
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      data-component-type="D_LATCH"
      data-q={q}
      data-q-bar={qBar}
      data-enable={enableSignal}
    >
      <div className="relative" style={{ width: size.width, height: size.height }}>
        <DLatchShape
          signalColor={signalColor}
          width={size.width}
          height={size.height}
          q={q}
          qBar={qBar}
          enable={enableSignal}
          onPortClick={onPortClick}
        />
      </div>
      
      {showLabel && (
        <div
          className={`mt-1 text-xs font-mono font-medium ${
            q ? 'text-green-400' : 'text-gray-400'
          }`}
          data-component-label="D_LATCH"
        >
          D LATCH
        </div>
      )}
    </div>
  );
};

export default DLatch;
