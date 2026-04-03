/**
 * Output Node Component
 * 
 * Round 121: Circuit Simulation Engine
 * 
 * LED output indicator for displaying circuit signal states.
 */

import React from 'react';
import { SignalState, OutputNodeComponentProps } from '../../types/circuit';

// ============================================================================
// Styles
// ============================================================================

const containerStyle: React.CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  userSelect: 'none',
};

const ledContainerStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};

const ledStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  transition: 'all 0.15s ease',
};

const outerRingStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '2px solid',
  position: 'absolute',
  transition: 'all 0.15s ease',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontFamily: 'monospace',
  fontWeight: 500,
  textAlign: 'center',
  maxWidth: '60px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const inputPortStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  position: 'absolute',
  left: '-6px',
  top: '50%',
  transform: 'translateY(-50%)',
};

// ============================================================================
// Theme colors for LED states
// ============================================================================

const theme = {
  high: {
    led: '#22c55e',
    ledGlow: 'rgba(34, 197, 94, 0.6)',
    ring: '#16a34a',
    background: 'rgba(34, 197, 94, 0.15)',
    label: '#22c55e',
  },
  low: {
    led: '#334155',
    ledGlow: 'transparent',
    ring: '#475569',
    background: 'rgba(100, 116, 139, 0.1)',
    label: '#64748b',
  },
};

// ============================================================================
// Component
// ============================================================================

/**
 * OutputNode Component
 * LED indicator that displays signal state (HIGH=green, LOW=off)
 */
export const OutputNode: React.FC<OutputNodeComponentProps> = ({
  id,
  position = { x: 0, y: 0 },
  inputSignal = false,
  label = 'OUT',
}) => {
  // Get theme based on signal state
  const currentTheme = inputSignal ? theme.high : theme.low;
  
  return (
    <div
      className="inline-flex flex-col items-center gap-1"
      style={{
        ...containerStyle,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      data-testid="output-node"
      data-output-id={id}
      data-signal={inputSignal ? 'HIGH' : 'LOW'}
    >
      {/* Input port indicator */}
      <div
        style={{
          ...inputPortStyle,
          backgroundColor: currentTheme.led,
          boxShadow: inputSignal ? `0 0 6px ${currentTheme.ledGlow}` : 'none',
        }}
        data-input-port
      />
      
      {/* LED container with outer ring */}
      <div
        style={{
          ...ledContainerStyle,
          background: currentTheme.background,
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            ...outerRingStyle,
            borderColor: currentTheme.ring,
          }}
          data-ring
        />
        
        {/* LED bulb */}
        <div
          style={{
            ...ledStyle,
            backgroundColor: currentTheme.led,
            boxShadow: inputSignal
              ? `0 0 12px ${currentTheme.ledGlow}, 0 0 24px ${currentTheme.ledGlow}, inset 0 0 8px rgba(255,255,255,0.3)`
              : 'inset 0 2px 4px rgba(0,0,0,0.3)',
          }}
          data-led
        />
      </div>
      
      {/* Label */}
      <span
        style={{
          ...labelStyle,
          color: currentTheme.label,
        }}
        data-label
      >
        {label}
      </span>
      
      {/* Signal indicator text */}
      <span
        className="text-[8px] font-mono"
        style={{ color: currentTheme.label }}
        data-state-indicator
      >
        {inputSignal ? 'HIGH' : 'LOW'}
      </span>
    </div>
  );
};

// ============================================================================
// LED Display Component (standalone)
// ============================================================================

/**
 * Props for LED Display
 */
interface LEDDisplayProps {
  signal: SignalState;
  size?: 'small' | 'medium' | 'large';
  showGlow?: boolean;
}

/**
 * Standalone LED display component
 */
export const LEDDisplay: React.FC<LEDDisplayProps> = ({
  signal,
  size = 'medium',
  showGlow = true,
}) => {
  const sizes = {
    small: { led: 16, ring: 20, container: 24 },
    medium: { led: 24, ring: 32, container: 40 },
    large: { led: 40, ring: 52, container: 64 },
  };
  
  const currentSize = sizes[size];
  const currentTheme = signal ? theme.high : theme.low;
  
  return (
    <div
      className="inline-flex items-center justify-center rounded-full"
      style={{
        width: currentSize.container,
        height: currentSize.container,
        background: currentTheme.background,
      }}
      data-testid="led-display"
      data-signal={signal ? 'HIGH' : 'LOW'}
    >
      <div
        className="rounded-full"
        style={{
          width: currentSize.led,
          height: currentSize.led,
          backgroundColor: currentTheme.led,
          boxShadow: signal && showGlow
            ? `0 0 8px ${currentTheme.ledGlow}, 0 0 16px ${currentTheme.ledGlow}`
            : 'none',
        }}
        data-led
      />
    </div>
  );
};

// ============================================================================
// Array of LEDs (for binary display)
// ============================================================================

/**
 * Props for LED Array
 */
interface LEDArrayProps {
  signals: SignalState[];
  labels?: string[];
}

/**
 * Array of LEDs for multi-bit display
 */
export const LEDArray: React.FC<LEDArrayProps> = ({
  signals,
  labels = [],
}) => {
  return (
    <div
      className="inline-flex gap-2 items-center p-3 rounded-lg bg-gray-900/50 border border-gray-700"
      data-testid="led-array"
    >
      {signals.map((signal, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          <LEDDisplay signal={signal} size="small" />
          {labels[index] && (
            <span className="text-[8px] font-mono text-gray-400">
              {labels[index]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Demo Component
// ============================================================================

/**
 * Demo OutputNode with controllable signal
 */
export const DemoOutputNode: React.FC<{
  id: string;
  label?: string;
}> = ({ id, label = 'OUT' }) => {
  // This would be controlled externally in real usage
  // For demo, showing both states side by side
  
  return (
    <div className="inline-flex gap-4">
      <div className="flex flex-col items-center">
        <OutputNode
          id={`${id}-low`}
          inputSignal={false}
          label={`${label} (Low)`}
        />
      </div>
      <div className="flex flex-col items-center">
        <OutputNode
          id={`${id}-high`}
          inputSignal={true}
          label={`${label} (High)`}
        />
      </div>
    </div>
  );
};

export default OutputNode;
