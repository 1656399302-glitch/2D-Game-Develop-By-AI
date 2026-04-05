/**
 * Circuit Palette Component
 * 
 * Round 144: Circuit Canvas UI
 * 
 * Component selection panel for adding circuit elements to the canvas.
 * Displays all available circuit components: logic gates, sequential gates,
 * input nodes, and output nodes.
 */

import React from 'react';
import { GateType } from '../../types/circuit';
import { useCircuitCanvasStore } from '../../store/useCircuitCanvasStore';

// ============================================================================
// Types
// ============================================================================

interface CircuitPaletteProps {
  /** Callback when a component is added to canvas */
  onAdd?: (type: string, position: { x: number; y: number }) => void;
  /** Whether palette is disabled */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
}

// ============================================================================
// Component Categories
// ============================================================================

const LOGIC_GATES: GateType[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];
const SEQUENTIAL_GATES: GateType[] = ['TIMER', 'COUNTER', 'SR_LATCH', 'D_LATCH', 'D_FLIP_FLOP'];

const CATEGORY_LABELS: Record<string, string> = {
  LOGIC: 'Logic Gates',
  SEQUENTIAL: 'Sequential',
  INPUT_OUTPUT: 'I/O',
};

// ============================================================================
// Gate Icons (SVG representations)
// ============================================================================

const GateIcon: React.FC<{ gateType: GateType; size?: number }> = ({ gateType, size = 24 }) => {
  const iconClass = 'text-cyan-400';
  
  switch (gateType) {
    case 'AND':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <path
            fill="currentColor"
            d="M4 2v20h2v-8h8c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4H4zm6 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
          />
        </svg>
      );
    case 'OR':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <path
            fill="currentColor"
            d="M4 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l6-4-6-4H4z"
          />
        </svg>
      );
    case 'NOT':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <path
            fill="currentColor"
            d="M4 2v20l14-10L4 2z"
          />
          <circle cx="18" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'NAND':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <path
            fill="currentColor"
            d="M4 2v20h2v-8h6c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4H4zm6 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
          />
          <circle cx="19" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'NOR':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <path
            fill="currentColor"
            d="M4 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6l-4-2v6H4V4h8l4 2V8l-4-2H4z"
          />
          <circle cx="19" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'XOR':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <path
            fill="currentColor"
            d="M4 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l6-4-6-4H4z"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            d="M4 2v20"
          />
        </svg>
      );
    case 'XNOR':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <path
            fill="currentColor"
            d="M4 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l6-4-6-4H4z"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            d="M4 2v20"
          />
          <circle cx="19" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'TIMER':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 9v4l2.5 2.5" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M10 3h4" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'COUNTER':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="12" y="15" textAnchor="middle" fontSize="10" fill="currentColor" fontFamily="monospace">0</text>
        </svg>
      );
    case 'SR_LATCH':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="12" y="15" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="monospace">SR</text>
        </svg>
      );
    case 'D_LATCH':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="12" y="15" textAnchor="middle" fontSize="10" fill="currentColor" fontFamily="monospace">D</text>
        </svg>
      );
    case 'D_FLIP_FLOP':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="12" y="15" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="monospace">D-FF</text>
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={iconClass}>
          <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
  }
};

const InputIcon: React.FC<{ size?: number; active?: boolean }> = ({ size = 24, active }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="8" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : '#00d4ff'} strokeWidth="2" />
    {active && <circle cx="12" cy="12" r="4" fill="#22c55e" />}
  </svg>
);

const OutputIcon: React.FC<{ size?: number; active?: boolean }> = ({ size = 24, active }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="8" fill="none" stroke={active ? '#22c55e' : '#64748b'} strokeWidth="2" />
    <circle cx="12" cy="12" r="4" fill={active ? '#22c55e' : '#64748b'} />
  </svg>
);

// ============================================================================
// Circuit Palette Component
// ============================================================================

export const CircuitPalette: React.FC<CircuitPaletteProps> = ({
  onAdd,
  disabled = false,
  className = '',
}) => {
  const addCircuitNode = useCircuitCanvasStore((state) => state.addCircuitNode);
  
  const handleAddComponent = React.useCallback(
    (type: 'input' | 'output' | 'gate', gateType?: GateType) => {
      if (disabled) return;
      
      // Default position - center of a typical canvas
      const position = { x: 200, y: 200 };
      
      // Add node to store (ignore return value)
      addCircuitNode(type, position.x, position.y, gateType);
      
      // Callback
      onAdd?.(gateType || type, position);
    },
    [addCircuitNode, disabled, onAdd]
  );
  
  const handleGateClick = React.useCallback(
    (gateType: GateType) => {
      handleAddComponent('gate', gateType);
    },
    [handleAddComponent]
  );
  
  return (
    <div
      className={`circuit-palette bg-slate-900 border border-slate-700 rounded-lg p-4 ${className}`}
      data-testid="circuit-palette"
      role="toolbar"
      aria-label="Circuit component palette"
    >
      {/* Logic Gates Section */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" data-category="LOGIC">
          {CATEGORY_LABELS.LOGIC}
        </h3>
        <div className="flex flex-wrap gap-2">
          {LOGIC_GATES.map((gateType) => (
            <button
              key={gateType}
              onClick={() => handleGateClick(gateType)}
              disabled={disabled}
              className={`palette-item flex flex-col items-center p-2 rounded border transition-all ${
                disabled
                  ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800'
                  : 'border-slate-600 bg-slate-800 hover:border-cyan-400 hover:bg-slate-700'
              }`}
              data-palette-item={gateType}
              aria-label={`Add ${gateType} gate`}
              title={gateType}
            >
              <GateIcon gateType={gateType} size={24} />
              <span className="text-xs mt-1 text-slate-300">{gateType}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Sequential Gates Section */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" data-category="SEQUENTIAL">
          {CATEGORY_LABELS.SEQUENTIAL}
        </h3>
        <div className="flex flex-wrap gap-2">
          {SEQUENTIAL_GATES.map((gateType) => (
            <button
              key={gateType}
              onClick={() => handleGateClick(gateType)}
              disabled={disabled}
              className={`palette-item flex flex-col items-center p-2 rounded border transition-all ${
                disabled
                  ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800'
                  : 'border-slate-600 bg-slate-800 hover:border-cyan-400 hover:bg-slate-700'
              }`}
              data-palette-item={gateType}
              aria-label={`Add ${gateType} component`}
              title={gateType}
            >
              <GateIcon gateType={gateType} size={24} />
              <span className="text-xs mt-1 text-slate-300">
                {gateType.replace('_', ' ')}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Input/Output Section */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" data-category="INPUT_OUTPUT">
          {CATEGORY_LABELS.INPUT_OUTPUT}
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAddComponent('input')}
            disabled={disabled}
            className={`palette-item flex flex-col items-center p-2 rounded border transition-all ${
              disabled
                ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800'
                : 'border-slate-600 bg-slate-800 hover:border-cyan-400 hover:bg-slate-700'
            }`}
            data-palette-item="INPUT"
            aria-label="Add input node"
            title="Input"
          >
            <InputIcon size={24} />
            <span className="text-xs mt-1 text-slate-300">IN</span>
          </button>
          
          <button
            onClick={() => handleAddComponent('output')}
            disabled={disabled}
            className={`palette-item flex flex-col items-center p-2 rounded border transition-all ${
              disabled
                ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800'
                : 'border-slate-600 bg-slate-800 hover:border-cyan-400 hover:bg-slate-700'
            }`}
            data-palette-item="OUTPUT"
            aria-label="Add output node"
            title="Output"
          >
            <OutputIcon size={24} />
            <span className="text-xs mt-1 text-slate-300">OUT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default CircuitPalette;
