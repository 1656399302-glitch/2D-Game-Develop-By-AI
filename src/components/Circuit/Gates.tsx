/**
 * Logic Gate Components
 * 
 * Round 121: Circuit Simulation Engine
 * 
 * SVG components for logic gates: AND, OR, NOT, XOR, NAND, NOR, XNOR
 */

import React from 'react';
import { GateType, GateComponentProps } from '../../types/circuit';

// ============================================================================
// Gate SVG Shape Definitions
// ============================================================================

/**
 * AND gate SVG shape
 */
function ANDGateShape({ width = 80, height = 60, signalColor }: { width?: number; height?: number; signalColor?: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 60">
      {/* AND gate body - distinctive rounded back with flat front */}
      <path
        d="M 5 5 Q 5 5 20 5 L 45 5 Q 60 5 75 15 Q 75 30 75 45 Q 75 55 60 55 L 45 55 Q 20 55 5 55 Q 5 55 5 45 Q 5 5 5 5 Z"
        fill="none"
        stroke={signalColor || '#00d4ff'}
        strokeWidth="2"
      />
      {/* Input ports */}
      <circle cx="0" cy="20" r="4" fill={signalColor || '#00d4ff'} />
      <circle cx="0" cy="40" r="4" fill={signalColor || '#00d4ff'} />
      {/* Output port */}
      <circle cx="80" cy="30" r="4" fill={signalColor || '#00d4ff'} />
    </svg>
  );
}

/**
 * OR gate SVG shape
 */
function ORGateShape({ width = 80, height = 60, signalColor }: { width?: number; height?: number; signalColor?: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 60">
      {/* OR gate body - distinctive curved back */}
      <path
        d="M 15 5 Q 25 30 15 55 Q 35 55 55 55 L 70 55 Q 75 30 70 5 Q 55 5 35 5 Q 15 5 15 5 Z"
        fill="none"
        stroke={signalColor || '#00d4ff'}
        strokeWidth="2"
      />
      {/* Input ports */}
      <circle cx="0" cy="20" r="4" fill={signalColor || '#00d4ff'} />
      <circle cx="0" cy="40" r="4" fill={signalColor || '#00d4ff'} />
      {/* Output port */}
      <circle cx="80" cy="30" r="4" fill={signalColor || '#00d4ff'} />
    </svg>
  );
}

/**
 * NOT gate SVG shape (triangle with inversion bubble)
 */
function NOTGateShape({ width = 60, height = 50, signalColor }: { width?: number; height?: number; signalColor?: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 60 50">
      {/* NOT gate body - triangle */}
      <path
        d="M 5 5 L 45 25 L 5 45 Z"
        fill="none"
        stroke={signalColor || '#00d4ff'}
        strokeWidth="2"
      />
      {/* Inversion bubble */}
      <circle cx="50" cy="25" r="5" fill="none" stroke={signalColor || '#00d4ff'} strokeWidth="2" />
      {/* Input port */}
      <circle cx="0" cy="25" r="4" fill={signalColor || '#00d4ff'} />
      {/* Output port */}
      <circle cx="60" cy="25" r="4" fill={signalColor || '#00d4ff'} />
    </svg>
  );
}

/**
 * NAND gate SVG shape (AND with inversion bubble)
 */
function NANDGateShape({ width = 80, height = 60, signalColor }: { width?: number; height?: number; signalColor?: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 60">
      {/* NAND gate body - rounded back */}
      <path
        d="M 5 5 Q 5 5 20 5 L 45 5 Q 60 5 75 15 Q 75 30 75 45 Q 75 55 60 55 L 45 55 Q 20 55 5 55 Q 5 55 5 45 Q 5 5 5 5 Z"
        fill="none"
        stroke={signalColor || '#00d4ff'}
        strokeWidth="2"
      />
      {/* Inversion bubble */}
      <circle cx="78" cy="30" r="5" fill="none" stroke={signalColor || '#00d4ff'} strokeWidth="2" />
      {/* Input ports */}
      <circle cx="0" cy="20" r="4" fill={signalColor || '#00d4ff'} />
      <circle cx="0" cy="40" r="4" fill={signalColor || '#00d4ff'} />
      {/* Output port */}
      <circle cx="80" cy="30" r="4" fill={signalColor || '#00d4ff'} />
    </svg>
  );
}

/**
 * NOR gate SVG shape (OR with inversion bubble)
 */
function NORGateShape({ width = 80, height = 60, signalColor }: { width?: number; height?: number; signalColor?: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 60">
      {/* NOR gate body - curved back */}
      <path
        d="M 15 5 Q 25 30 15 55 Q 35 55 55 55 L 70 55 Q 75 30 70 5 Q 55 5 35 5 Q 15 5 15 5 Z"
        fill="none"
        stroke={signalColor || '#00d4ff'}
        strokeWidth="2"
      />
      {/* Inversion bubble */}
      <circle cx="78" cy="30" r="5" fill="none" stroke={signalColor || '#00d4ff'} strokeWidth="2" />
      {/* Input ports */}
      <circle cx="0" cy="20" r="4" fill={signalColor || '#00d4ff'} />
      <circle cx="0" cy="40" r="4" fill={signalColor || '#00d4ff'} />
      {/* Output port */}
      <circle cx="80" cy="30" r="4" fill={signalColor || '#00d4ff'} />
    </svg>
  );
}

/**
 * XOR gate SVG shape (OR with extra curved back line)
 */
function XORGateShape({ width = 80, height = 60, signalColor }: { width?: number; height?: number; signalColor?: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 60">
      {/* XOR gate body - curved back */}
      <path
        d="M 15 5 Q 25 30 15 55 Q 35 55 55 55 L 70 55 Q 75 30 70 5 Q 55 5 35 5 Q 15 5 15 5 Z"
        fill="none"
        stroke={signalColor || '#00d4ff'}
        strokeWidth="2"
      />
      {/* Extra curved line for XOR */}
      <path
        d="M 10 5 Q 18 30 10 55"
        fill="none"
        stroke={signalColor || '#00d4ff'}
        strokeWidth="2"
      />
      {/* Input ports */}
      <circle cx="0" cy="20" r="4" fill={signalColor || '#00d4ff'} />
      <circle cx="0" cy="40" r="4" fill={signalColor || '#00d4ff'} />
      {/* Output port */}
      <circle cx="80" cy="30" r="4" fill={signalColor || '#00d4ff'} />
    </svg>
  );
}

/**
 * XNOR gate SVG shape (XOR with inversion bubble)
 */
function XNORGateShape({ width = 80, height = 60, signalColor }: { width?: number; height?: number; signalColor?: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 60">
      {/* XNOR gate body - curved back */}
      <path
        d="M 15 5 Q 25 30 15 55 Q 35 55 55 55 L 70 55 Q 75 30 70 5 Q 55 5 35 5 Q 15 5 15 5 Z"
        fill="none"
        stroke={signalColor || '#00d4ff'}
        strokeWidth="2"
      />
      {/* Extra curved line for XNOR */}
      <path
        d="M 10 5 Q 18 30 10 55"
        fill="none"
        stroke={signalColor || '#00d4ff'}
        strokeWidth="2"
      />
      {/* Inversion bubble */}
      <circle cx="78" cy="30" r="5" fill="none" stroke={signalColor || '#00d4ff'} strokeWidth="2" />
      {/* Input ports */}
      <circle cx="0" cy="20" r="4" fill={signalColor || '#00d4ff'} />
      <circle cx="0" cy="40" r="4" fill={signalColor || '#00d4ff'} />
      {/* Output port */}
      <circle cx="80" cy="30" r="4" fill={signalColor || '#00d4ff'} />
    </svg>
  );
}

// ============================================================================
// Gate Shape Map
// ============================================================================

const gateShapes: Record<GateType, React.FC<{ width?: number; height?: number; signalColor?: string }>> = {
  AND: ANDGateShape,
  OR: ORGateShape,
  NOT: NOTGateShape,
  NAND: NANDGateShape,
  NOR: NORGateShape,
  XOR: XORGateShape,
  XNOR: XNORGateShape,
};

// ============================================================================
// Gate Component
// ============================================================================

/**
 * Logic Gate Component
 * Renders SVG shape for the specified gate type with label
 */
export const Gate: React.FC<GateComponentProps> = ({
  gateType,
  position = { x: 0, y: 0 },
  size = { width: 80, height: 60 },
  showLabel = true,
  inputSignals = [],
  outputSignal = false,
}) => {
  const GateShape = gateShapes[gateType];
  
  // Signal color based on output state
  const signalColor = outputSignal ? '#22c55e' : '#64748b';
  
  return (
    <div
      className="relative inline-flex flex-col items-center"
      style={{
        width: size.width,
        height: size.height + (showLabel ? 24 : 0),
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      data-gate-type={gateType}
      data-output-signal={outputSignal}
    >
      <div className="relative" style={{ width: size.width, height: size.height }}>
        <GateShape width={size.width} height={size.height} signalColor={signalColor} />
        
        {/* Input signal indicators */}
        {inputSignals.map((signal, index) => (
          <div
            key={`input-${index}`}
            className={`absolute w-2 h-2 rounded-full transition-colors ${
              signal ? 'bg-green-500' : 'bg-gray-600'
            }`}
            style={{
              left: -6,
              top: index === 0 ? 'calc(33.33% - 4px)' : 'calc(66.67% - 4px)',
            }}
            data-input-port={index}
            data-signal={signal}
          />
        ))}
      </div>
      
      {showLabel && (
        <div
          className={`mt-1 text-xs font-mono font-medium ${
            outputSignal ? 'text-green-400' : 'text-gray-400'
          }`}
          data-gate-label={gateType}
        >
          {gateType}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Gate Selector Component
// ============================================================================

/**
 * Props for GateSelector
 */
interface GateSelectorProps {
  onSelectGate: (gateType: GateType) => void;
  selectedGate?: GateType;
  className?: string;
}

/**
 * Gate Selector Component
 * Displays all available gate types for selection
 */
export const GateSelector: React.FC<GateSelectorProps> = ({
  onSelectGate,
  selectedGate,
  className = '',
}) => {
  const gateTypes: GateType[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];
  
  return (
    <div className={`flex flex-wrap gap-2 p-2 ${className}`} data-testid="gate-selector">
      {gateTypes.map((gateType) => (
        <button
          key={gateType}
          onClick={() => onSelectGate(gateType)}
          className={`p-2 rounded border transition-colors ${
            selectedGate === gateType
              ? 'border-cyan-400 bg-cyan-400/20'
              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
          }`}
          data-gate-button={gateType}
          aria-pressed={selectedGate === gateType}
        >
          <Gate gateType={gateType} size={{ width: 40, height: 30 }} />
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// Individual Gate Components (for direct import)
// ============================================================================

export const ANDGate: React.FC<Omit<GateComponentProps, 'gateType'>> = (props) => (
  <Gate gateType="AND" {...props} />
);

export const ORGate: React.FC<Omit<GateComponentProps, 'gateType'>> = (props) => (
  <Gate gateType="OR" {...props} />
);

export const NOTGate: React.FC<Omit<GateComponentProps, 'gateType'>> = (props) => (
  <Gate gateType="NOT" {...props} />
);

export const NANDGate: React.FC<Omit<GateComponentProps, 'gateType'>> = (props) => (
  <Gate gateType="NAND" {...props} />
);

export const NORGate: React.FC<Omit<GateComponentProps, 'gateType'>> = (props) => (
  <Gate gateType="NOR" {...props} />
);

export const XORGate: React.FC<Omit<GateComponentProps, 'gateType'>> = (props) => (
  <Gate gateType="XOR" {...props} />
);

export const XNORGate: React.FC<Omit<GateComponentProps, 'gateType'>> = (props) => (
  <Gate gateType="XNOR" {...props} />
);

// Default export is the Gate component
export default Gate;
