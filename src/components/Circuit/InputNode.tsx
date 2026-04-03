/**
 * Input Node Component
 * 
 * Round 121: Circuit Simulation Engine
 * 
 * Toggle input component with HIGH/LOW states for circuit testing.
 */

import React, { useState, useCallback } from 'react';
import { SignalState, InputNodeComponentProps } from '../../types/circuit';

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

const buttonStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '8px',
  border: '2px solid',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
  position: 'relative',
};

const ledStyle: React.CSSProperties = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
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

const portStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  position: 'absolute',
  right: '-6px',
  top: '50%',
  transform: 'translateY(-50%)',
};

// ============================================================================
// Theme colors
// ============================================================================

const theme = {
  high: {
    border: '#22c55e',
    background: 'rgba(34, 197, 94, 0.2)',
    led: '#22c55e',
    ledGlow: 'rgba(34, 197, 94, 0.6)',
    label: '#22c55e',
  },
  low: {
    border: '#64748b',
    background: 'rgba(100, 116, 139, 0.1)',
    led: '#334155',
    ledGlow: 'transparent',
    label: '#64748b',
  },
};

// ============================================================================
// Component
// ============================================================================

/**
 * InputNode Component
 * Toggle input for circuit testing with HIGH/LOW states
 */
export const InputNode: React.FC<InputNodeComponentProps> = ({
  id,
  position = { x: 0, y: 0 },
  initialState = false,
  label = 'IN',
  onToggle,
}) => {
  // Internal state
  const [state, setState] = useState<SignalState>(initialState);
  
  // Get theme based on current state
  const currentTheme = state ? theme.high : theme.low;
  
  // Handle click/toggle
  const handleClick = useCallback(() => {
    const newState = !state;
    setState(newState);
    onToggle?.(newState);
  }, [state, onToggle]);
  
  // Handle keyboard interaction
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);
  
  return (
    <div
      className="inline-flex flex-col items-center gap-1"
      style={{
        ...containerStyle,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      data-testid="input-node"
      data-input-id={id}
      data-state={state ? 'HIGH' : 'LOW'}
    >
      {/* Toggle button with LED */}
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="relative focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        style={{
          ...buttonStyle,
          borderColor: currentTheme.border,
          background: currentTheme.background,
        }}
        aria-label={`Input ${label}: ${state ? 'HIGH' : 'LOW'}, click to toggle`}
        aria-pressed={state}
        data-toggle-button
      >
        {/* LED indicator */}
        <div
          style={{
            ...ledStyle,
            backgroundColor: currentTheme.led,
            boxShadow: state ? `0 0 12px ${currentTheme.ledGlow}, 0 0 24px ${currentTheme.ledGlow}` : 'none',
          }}
          data-led
        />
        
        {/* Output port indicator */}
        <div
          style={{
            ...portStyle,
            backgroundColor: currentTheme.led,
            boxShadow: state ? `0 0 6px ${currentTheme.ledGlow}` : 'none',
          }}
          data-output-port
        />
      </button>
      
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
      
      {/* State indicator text */}
      <span
        className="text-[8px] font-mono"
        style={{ color: currentTheme.label }}
        data-state-indicator
      >
        {state ? 'HIGH' : 'LOW'}
      </span>
    </div>
  );
};

// ============================================================================
// Export with default state management
// ============================================================================

/**
 * InputNode with integrated state management
 */
export const InputNodeWithState: React.FC<Omit<InputNodeComponentProps, 'initialState' | 'onToggle'>> = (props) => {
  const [state, setState] = useState<SignalState>(false);
  
  return (
    <InputNode
      {...props}
      initialState={state}
      onToggle={setState}
    />
  );
};

// ============================================================================
// Demo Component
// ============================================================================

/**
 * Demo InputNode with preset states
 */
export const DemoInputNode: React.FC<{
  id: string;
  initialState?: SignalState;
  label?: string;
}> = ({ initialState = false, label = 'IN' }) => {
  const [state, setState] = useState<SignalState>(initialState);
  const currentTheme = state ? theme.high : theme.low;
  
  return (
    <div
      className="inline-flex flex-col items-center gap-1 p-3 rounded-lg bg-gray-900/50 border border-gray-700"
      data-testid="demo-input-node"
    >
      <button
        onClick={() => setState(!state)}
        className="w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all"
        style={{
          borderColor: currentTheme.border,
          background: currentTheme.background,
        }}
        data-demo-button
      >
        <div
          className="w-8 h-8 rounded-full transition-all"
          style={{
            backgroundColor: currentTheme.led,
            boxShadow: state ? `0 0 16px ${currentTheme.ledGlow}, 0 0 32px ${currentTheme.ledGlow}` : 'none',
          }}
        />
      </button>
      
      <span className="text-xs font-mono" style={{ color: currentTheme.label }}>
        {label}
      </span>
      
      <span className="text-[10px] font-mono" style={{ color: currentTheme.label }}>
        {state ? 'HIGH' : 'LOW'}
      </span>
      
      {/* Hidden state for testing */}
      <span className="sr-only" data-state={state ? 'true' : 'false'} />
    </div>
  );
};

export default InputNode;
