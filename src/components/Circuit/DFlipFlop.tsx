/**
 * D Flip-Flop Component
 * 
 * Round 128: Sequential Components
 * 
 * SVG D Flip-Flop component (edge-triggered).
 * Inputs: Data (D), Clock (CLK)
 * Outputs: Q, Q̅ (complement)
 * Rising clock edge → Q=D, otherwise hold state
 */

import React from 'react';
import { SignalState } from '../../types/circuit';

// ============================================================================
// D Flip-Flop SVG Shape
// ============================================================================

interface DFlipFlopShapeProps {
  signalColor: string;
  width: number;
  height: number;
  q?: SignalState;
  qBar?: SignalState;
  clock?: SignalState;
  onPortClick?: (portIndex: number, isOutput: boolean) => void;
}

const DFlipFlopShape: React.FC<DFlipFlopShapeProps> = ({
  signalColor,
  width,
  height,
  q = false,
  qBar = true,
  clock = false,
  onPortClick,
}) => {
  const qColor = q ? '#22c55e' : signalColor;
  const qBarColor = qBar ? '#22c55e' : signalColor;
  const clockColor = clock ? '#22c55e' : signalColor;
  
  return (
    <svg width={width} height={height} viewBox="0 0 80 70" className="gate-shape">
      {/* D Flip-Flop box */}
      <rect
        x="5" y="5"
        width="70" height="60"
        rx="6"
        fill="rgba(15, 23, 42, 0.95)"
        stroke={signalColor}
        strokeWidth="2"
      />
      
      {/* D Flip-Flop symbol */}
      <text
        x="40" y="18"
        textAnchor="middle"
        fill={signalColor}
        fontSize="12"
        fontFamily="monospace"
        fontWeight="bold"
      >
        D-FF
      </text>
      
      {/* Clock indicator with triangle */}
      <polygon
        points="35,22 43,22 39,28"
        fill={clockColor}
      />
      <text
        x="55" y="27"
        textAnchor="middle"
        fill={clockColor}
        fontSize="7"
        fontFamily="monospace"
      >
        CLK
      </text>
      
      {/* Q indicator */}
      <text
        x="20" y="48"
        textAnchor="middle"
        fill={qColor}
        fontSize="12"
        fontFamily="monospace"
      >
        Q:{q ? '1' : '0'}
      </text>
      
      {/* Q-bar indicator */}
      <text
        x="60" y="48"
        textAnchor="middle"
        fill={qBarColor}
        fontSize="12"
        fontFamily="monospace"
      >
        Q̅:{qBar ? '1' : '0'}
      </text>
      
      {/* Edge trigger indicator */}
      <text
        x="40" y="60"
        textAnchor="middle"
        fill={signalColor}
        fontSize="6"
        fontFamily="monospace"
      >
        ↑
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
      
      {/* Clock input port (port 1) */}
      <circle
        cx="0" cy="40"
        r="4"
        fill={clockColor}
        className="port-input"
        data-port-index="1"
        data-port-type="input"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="6" y="43" fill={clockColor} fontSize="6" fontFamily="monospace">CLK</text>
      
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
// Main D Flip-Flop Component
// ============================================================================

interface DFlipFlopProps {
  q?: SignalState;
  qBar?: SignalState;
  clockSignal?: SignalState;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  showLabel?: boolean;
  onPortClick?: (portIndex: number, isOutput: boolean) => void;
}

export const DFlipFlop: React.FC<DFlipFlopProps> = ({
  q = false,
  qBar = true,
  clockSignal = false,
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
      data-component-type="D_FLIP_FLOP"
      data-q={q}
      data-q-bar={qBar}
      data-clock={clockSignal}
    >
      <div className="relative" style={{ width: size.width, height: size.height }}>
        <DFlipFlopShape
          signalColor={signalColor}
          width={size.width}
          height={size.height}
          q={q}
          qBar={qBar}
          clock={clockSignal}
          onPortClick={onPortClick}
        />
      </div>
      
      {showLabel && (
        <div
          className={`mt-1 text-xs font-mono font-medium ${
            q ? 'text-green-400' : 'text-gray-400'
          }`}
          data-component-label="D_FLIP_FLOP"
        >
          D-FF
        </div>
      )}
    </div>
  );
};

export default DFlipFlop;
