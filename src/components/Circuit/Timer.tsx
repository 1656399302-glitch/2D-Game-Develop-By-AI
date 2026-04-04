/**
 * Timer Component
 * 
 * Round 128: Sequential Components
 * 
 * SVG timer component with configurable delay.
 * Shows countdown display and pulse animation when active.
 */

import React from 'react';
import { SignalState } from '../../types/circuit';

// ============================================================================
// Timer SVG Shape
// ============================================================================

interface TimerShapeProps {
  signalColor: string;
  width: number;
  height: number;
  tickCount?: number;
  totalTicks?: number;
  isActive?: boolean;
  done?: boolean;
  onPortClick?: (portIndex: number, isOutput: boolean) => void;
}

const TimerShape: React.FC<TimerShapeProps> = ({
  signalColor,
  width,
  height,
  tickCount = 0,
  totalTicks = 5,
  isActive = false,
  done = false,
  onPortClick,
}) => {
  const doneColor = done ? '#22c55e' : signalColor;
  
  return (
    <svg width={width} height={height} viewBox="0 0 80 70" className="gate-shape">
      {/* Timer box */}
      <rect
        x="5" y="5"
        width="70" height="60"
        rx="6"
        fill="rgba(15, 23, 42, 0.95)"
        stroke={doneColor}
        strokeWidth="2"
      />
      
      {/* Timer icon (clock circle) */}
      <circle cx="25" cy="30" r="12" fill="none" stroke={doneColor} strokeWidth="2" />
      <line x1="25" y1="30" x2="25" y2="22" stroke={doneColor} strokeWidth="2" />
      <line x1="25" y1="30" x2="31" y2="30" stroke={doneColor} strokeWidth="2" />
      
      {/* Countdown display */}
      <text
        x="60" y="28"
        textAnchor="middle"
        fill={doneColor}
        fontSize="14"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {done ? '✓' : `${Math.max(0, (totalTicks || 5) - tickCount)}`}
      </text>
      
      {/* Label */}
      <text
        x="40" y="55"
        textAnchor="middle"
        fill={doneColor}
        fontSize="8"
        fontFamily="monospace"
      >
        T:{totalTicks || 5}
      </text>
      
      {/* Pulse animation when active */}
      {isActive && (
        <rect
          x="5" y="5"
          width="70" height="60"
          rx="6"
          fill="none"
          stroke={signalColor}
          strokeWidth="2"
          opacity="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.5;0;0.5"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>
      )}
      
      {/* Trigger input port (port 0) */}
      <circle
        cx="0" cy="25"
        r="4"
        fill={signalColor}
        className="port-input"
        data-port-index="0"
        data-port-type="input"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="6" y="28" fill={signalColor} fontSize="6" fontFamily="monospace">T</text>
      
      {/* Reset input port (port 1) */}
      <circle
        cx="0" cy="45"
        r="4"
        fill={signalColor}
        className="port-input"
        data-port-index="1"
        data-port-type="input"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="6" y="48" fill={signalColor} fontSize="6" fontFamily="monospace">R</text>
      
      {/* Output port (port 0, output) */}
      <circle
        cx="80" cy="25"
        r="4"
        fill={doneColor}
        className="port-output"
        data-port-index="0"
        data-port-type="output"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="72" y="28" fill={doneColor} fontSize="6" fontFamily="monospace">Q</text>
      
      {/* Done flag output port (port 1, output) */}
      <circle
        cx="80" cy="45"
        r="4"
        fill={done ? '#22c55e' : signalColor}
        className="port-output"
        data-port-index="1"
        data-port-type="output"
        onClick={(e) => { e.stopPropagation(); onPortClick?.(1, true); }}
        style={{ cursor: 'pointer' }}
      />
      <text x="72" y="48" fill={doneColor} fontSize="6" fontFamily="monospace">D</text>
    </svg>
  );
};

// ============================================================================
// Main Timer Component
// ============================================================================

interface TimerProps {
  delay?: number;
  tickCount?: number;
  isActive?: boolean;
  done?: boolean;
  outputSignal?: SignalState;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  showLabel?: boolean;
  onPortClick?: (portIndex: number, isOutput: boolean) => void;
}

export const Timer: React.FC<TimerProps> = ({
  delay = 5,
  tickCount = 0,
  isActive = false,
  done = false,
  outputSignal = false,
  position = { x: 0, y: 0 },
  size = { width: 80, height: 70 },
  showLabel = true,
  onPortClick,
}) => {
  const signalColor = outputSignal || done ? '#22c55e' : '#64748b';
  
  return (
    <div
      className="relative inline-flex flex-col items-center"
      style={{
        width: size.width,
        height: size.height + (showLabel ? 24 : 0),
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      data-component-type="TIMER"
      data-output-signal={outputSignal}
      data-done={done}
      data-tick-count={tickCount}
      data-delay={delay}
    >
      <div className="relative" style={{ width: size.width, height: size.height }}>
        <TimerShape
          signalColor={signalColor}
          width={size.width}
          height={size.height}
          tickCount={tickCount}
          totalTicks={delay}
          isActive={isActive}
          done={done}
          onPortClick={onPortClick}
        />
      </div>
      
      {showLabel && (
        <div
          className={`mt-1 text-xs font-mono font-medium ${
            done ? 'text-green-400' : 'text-gray-400'
          }`}
          data-component-label="TIMER"
        >
          TIMER
        </div>
      )}
    </div>
  );
};

export default Timer;
