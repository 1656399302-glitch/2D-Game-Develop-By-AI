/**
 * SR Latch Component
 * 
 * Round 128: Sequential Components
 * 
 * SVG SR Latch component.
 * Inputs: Set (S), Reset (R)
 * Outputs: Q, Q̅ (complement)
 * Shows error state when both S and R are HIGH.
 */

import React from 'react';
import { SignalState } from '../../types/circuit';

// ============================================================================
// SR Latch SVG Shape
// ============================================================================

interface SRLatchShapeProps {
  signalColor: string;
  width: number;
  height: number;
  q?: SignalState;
  qBar?: SignalState;
  invalidState?: boolean;
  onPortClick?: (portIndex: number, isOutput: boolean) => void;
}

const SRLatchShape: React.FC<SRLatchShapeProps> = ({
  signalColor,
  width,
  height,
  q = false,
  qBar = false,
  invalidState = false,
  onPortClick,
}) => {
  const qColor = invalidState ? '#ef4444' : q ? '#22c55e' : signalColor;
  const qBarColor = invalidState ? '#ef4444' : qBar ? '#22c55e' : signalColor;
  const borderColor = invalidState ? '#ef4444' : signalColor;
  
  return (
    <svg width={width} height={height} viewBox="0 0 80 70" className="gate-shape">
      {/* SR Latch box */}
      <rect
        x="5" y="5"
        width="70" height="60"
        rx="6"
        fill="rgba(15, 23, 42, 0.95)"
        stroke={borderColor}
        strokeWidth="2"
      />
      
      {/* SR symbol */}
      <text
        x="40" y="22"
        textAnchor="middle"
        fill={borderColor}
        fontSize="14"
        fontFamily="monospace"
        fontWeight="bold"
      >
        SR
      </text>
      
      {/* Q indicator */}
      <text
        x="20" y="45"
        textAnchor="middle"
        fill={qColor}
        fontSize="12"
        fontFamily="monospace"
      >
        Q:{q ? '1' : '0'}
      </text>
      
      {/* Q-bar indicator */}
      <text
        x="60" y="45"
        textAnchor="middle"
        fill={qBarColor}
        fontSize="12"
        fontFamily="monospace"
      >
        Q̅:{qBar ? '1' : '0'}
      </text>
      
      {/* Invalid state warning */}
      {invalidState && (
        <g>
          <rect
            x="5" y="5"
            width="70" height="60"
            rx="6"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            opacity="0.7"
          >
            <animate
              attributeName="opacity"
              values="0.7;0.3;0.7"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </rect>
          <text
            x="40" y="60"
            textAnchor="middle"
            fill="#ef4444"
            fontSize="8"
            fontFamily="monospace"
          >
            ERR
          </text>
        </g>
      )}
      
      {/* Set input port (port 0) */}
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
      <text x="6" y="23" fill={signalColor} fontSize="6" fontFamily="monospace">S</text>
      
      {/* Reset input port (port 1) */}
      <circle
        cx="0" cy="40"
        r="4"
        fill={signalColor}
        className="port-input"
        data-port-index="1"
        data-port-type="input"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="6" y="43" fill={signalColor} fontSize="6" fontFamily="monospace">R</text>
      
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
// Main SR Latch Component
// ============================================================================

interface SRLatchProps {
  q?: SignalState;
  qBar?: SignalState;
  invalidState?: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  showLabel?: boolean;
  onPortClick?: (portIndex: number, isOutput: boolean) => void;
}

export const SRLatch: React.FC<SRLatchProps> = ({
  q = false,
  qBar = true,
  invalidState = false,
  position = { x: 0, y: 0 },
  size = { width: 80, height: 70 },
  showLabel = true,
  onPortClick,
}) => {
  const signalColor = invalidState ? '#ef4444' : q ? '#22c55e' : '#64748b';
  
  return (
    <div
      className="relative inline-flex flex-col items-center"
      style={{
        width: size.width,
        height: size.height + (showLabel ? 24 : 0),
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      data-component-type="SR_LATCH"
      data-q={q}
      data-q-bar={qBar}
      data-invalid-state={invalidState}
    >
      <div className="relative" style={{ width: size.width, height: size.height }}>
        <SRLatchShape
          signalColor={signalColor}
          width={size.width}
          height={size.height}
          q={q}
          qBar={qBar}
          invalidState={invalidState}
          onPortClick={onPortClick}
        />
      </div>
      
      {showLabel && (
        <div
          className={`mt-1 text-xs font-mono font-medium ${
            invalidState ? 'text-red-400' : q ? 'text-green-400' : 'text-gray-400'
          }`}
          data-component-label="SR_LATCH"
        >
          {invalidState ? 'SR ERR' : 'SR LATCH'}
        </div>
      )}
    </div>
  );
};

export default SRLatch;
