/**
 * Counter Component
 * 
 * Round 128: Sequential Components
 * 
 * SVG counter component with configurable max value.
 * Shows current count and handles increment/decrement with overflow.
 */

import React from 'react';
import { SignalState } from '../../types/circuit';

// ============================================================================
// Counter SVG Shape
// ============================================================================

interface CounterShapeProps {
  signalColor: string;
  width: number;
  height: number;
  count?: number;
  maxValue?: number;
  overflow?: boolean;
  onPortClick?: (portIndex: number, isOutput: boolean) => void;
}

const CounterShape: React.FC<CounterShapeProps> = ({
  signalColor,
  width,
  height,
  count = 0,
  maxValue = 8,
  overflow = false,
  onPortClick,
}) => {
  const overflowColor = overflow ? '#f59e0b' : signalColor;
  
  return (
    <svg width={width} height={height} viewBox="0 0 80 70" className="gate-shape">
      {/* Counter box */}
      <rect
        x="5" y="5"
        width="70" height="60"
        rx="6"
        fill="rgba(15, 23, 42, 0.95)"
        stroke={overflowColor}
        strokeWidth="2"
      />
      
      {/* Counter display */}
      <text
        x="40" y="30"
        textAnchor="middle"
        fill={overflowColor}
        fontSize="16"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {count}
      </text>
      
      {/* Max label */}
      <text
        x="40" y="50"
        textAnchor="middle"
        fill={signalColor}
        fontSize="8"
        fontFamily="monospace"
      >
        /{maxValue}
      </text>
      
      {/* Overflow indicator */}
      {overflow && (
        <text
          x="68" y="16"
          textAnchor="middle"
          fill="#f59e0b"
          fontSize="8"
          fontFamily="monospace"
        >
          !
        </text>
      )}
      
      {/* Increment input port (port 0) */}
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
      <text x="6" y="23" fill={signalColor} fontSize="6" fontFamily="monospace">+</text>
      
      {/* Decrement input port (port 1) */}
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
      <text x="6" y="43" fill={signalColor} fontSize="6" fontFamily="monospace">-</text>
      
      {/* Reset input port (port 2) */}
      <circle
        cx="0" cy="55"
        r="4"
        fill={signalColor}
        className="port-input"
        data-port-index="2"
        data-port-type="input"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(2, false); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="6" y="58" fill={signalColor} fontSize="6" fontFamily="monospace">R</text>
      
      {/* Output port (port 0, output) */}
      <circle
        cx="80" cy="25"
        r="4"
        fill={overflowColor}
        className="port-output"
        data-port-index="0"
        data-port-type="output"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="72" y="28" fill={overflowColor} fontSize="6" fontFamily="monospace">Q</text>
      
      {/* Overflow flag output port (port 1, output) */}
      <circle
        cx="80" cy="45"
        r="4"
        fill={overflow ? '#f59e0b' : signalColor}
        className="port-output"
        data-port-index="1"
        data-port-type="output"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(1, true); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="72" y="48" fill={overflowColor} fontSize="6" fontFamily="monospace">OV</text>
    </svg>
  );
};

// ============================================================================
// Main Counter Component
// ============================================================================

interface CounterProps {
  maxValue?: number;
  count?: number;
  overflow?: boolean;
  outputSignal?: SignalState;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  showLabel?: boolean;
  onPortClick?: (portIndex: number, isOutput: boolean) => void;
}

export const Counter: React.FC<CounterProps> = ({
  maxValue = 8,
  count = 0,
  overflow = false,
  outputSignal = false,
  position = { x: 0, y: 0 },
  size = { width: 80, height: 70 },
  showLabel = true,
  onPortClick,
}) => {
  const signalColor = outputSignal || count > 0 ? '#22c55e' : '#64748b';
  
  return (
    <div
      className="relative inline-flex flex-col items-center"
      style={{
        width: size.width,
        height: size.height + (showLabel ? 24 : 0),
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      data-component-type="COUNTER"
      data-output-signal={outputSignal}
      data-count={count}
      data-max-value={maxValue}
      data-overflow={overflow}
    >
      <div className="relative" style={{ width: size.width, height: size.height }}>
        <CounterShape
          signalColor={signalColor}
          width={size.width}
          height={size.height}
          count={count}
          maxValue={maxValue}
          overflow={overflow}
          onPortClick={onPortClick}
        />
      </div>
      
      {showLabel && (
        <div
          className={`mt-1 text-xs font-mono font-medium ${
            count > 0 ? 'text-green-400' : 'text-gray-400'
          }`}
          data-component-label="COUNTER"
        >
          COUNTER
        </div>
      )}
    </div>
  );
};

export default Counter;
