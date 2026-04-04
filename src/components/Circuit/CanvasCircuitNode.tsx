/**
 * Canvas Circuit Node Component
 * 
 * Round 122: Circuit Canvas Integration
 * Round 123: Added port click handlers for wire drawing
 * 
 * Renders circuit nodes (gates, InputNode, OutputNode) on the canvas
 * with signal state visualization.
 */

import React, { useCallback } from 'react';
import {
  PlacedInputNode,
  PlacedOutputNode,
  PlacedGateNode,
  CanvasCircuitNodeProps,
  CIRCUIT_NODE_SIZES,
  SIGNAL_COLORS,
} from '../../types/circuitCanvas';
import { GateType } from '../../types/circuit';

// ============================================================================
// Gate SVG Shapes
// ============================================================================

const ANDGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ signalColor, width, height, onPortClick }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 5 5 Q 5 5 20 5 L 45 5 Q 60 5 75 15 Q 75 30 75 40 Q 60 45 45 45 L 20 45 Q 5 45 5 40 Q 5 5 5 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const ORGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ signalColor, width, height, onPortClick }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const NOTGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ signalColor, width, height, onPortClick }) => (
  <svg width={width} height={height} viewBox="0 0 60 40" className="gate-shape">
    <path d="M 5 5 L 45 20 L 5 35 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    <circle cx="50" cy="20" r="5" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="20" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="60" cy="20" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const NANDGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ signalColor, width, height, onPortClick }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 5 5 Q 5 5 20 5 L 45 5 Q 60 5 75 15 Q 75 30 75 40 Q 60 45 45 45 L 20 45 Q 5 45 5 40 Q 5 5 5 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    <circle cx="78" cy="25" r="5" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const NORGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ signalColor, width, height, onPortClick }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    <circle cx="78" cy="25" r="5" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const XORGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ signalColor, width, height, onPortClick }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    <path d="M 10 5 Q 18 25 10 45" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

const XNORGateShape: React.FC<{ signalColor: string; width: number; height: number; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ signalColor, width, height, onPortClick }) => (
  <svg width={width} height={height} viewBox="0 0 80 50" className="gate-shape">
    <path d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z" fill="rgba(15, 23, 42, 0.9)" stroke={signalColor} strokeWidth="2" />
    <path d="M 10 5 Q 18 25 10 45" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="78" cy="25" r="5" fill="none" stroke={signalColor} strokeWidth="2" />
    <circle cx="0" cy="18" r="4" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="0" cy="32" r="4" fill={signalColor} className="port-input" data-port-index="1" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(1, false); }} style={{ cursor: 'pointer' }} />
    <circle cx="80" cy="25" r="4" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
  </svg>
);

// ============================================================================
// Node Components
// ============================================================================

const InputNodeCanvas: React.FC<{ node: PlacedInputNode; isSelected: boolean; cycleWarning: boolean; onClick: () => void; onToggle: () => void; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ node, isSelected, cycleWarning, onClick, onToggle, onPortClick }) => {
  const signalColor = node.state ? SIGNAL_COLORS.HIGH : SIGNAL_COLORS.LOW;
  const size = node.size || CIRCUIT_NODE_SIZES.input;
  const borderColor = cycleWarning ? '#ef4444' : isSelected ? SIGNAL_COLORS.SELECTED : signalColor;
  
  return (
    <g className="circuit-node input-node" onClick={onClick} style={{ cursor: 'pointer' }} data-node-type="input" data-node-id={node.id} data-state={node.state ? 'HIGH' : 'LOW'} data-selected={isSelected ? 'true' : 'false'} data-cycle-warning={cycleWarning ? 'true' : 'false'}>
      {(isSelected || cycleWarning) && <rect x="-4" y="-4" width={size.width + 8} height={size.height + 8} rx="6" fill="none" stroke={borderColor} strokeWidth="2" strokeDasharray={cycleWarning ? '4 2' : 'none'} />}
      <rect x="0" y="0" width={size.width} height={size.height} rx="8" fill="rgba(15, 23, 42, 0.95)" stroke={signalColor} strokeWidth="2" />
      <circle cx={size.width / 2} cy={size.height / 2 - 4} r="12" fill={signalColor} style={{ filter: node.state ? `drop-shadow(0 0 8px ${signalColor})` : 'none' }} />
      <rect x={size.width / 2 - 16} y={size.height / 2 + 10} width="32" height="14" rx="4" fill="rgba(100, 116, 139, 0.3)" stroke={signalColor} strokeWidth="1" className="toggle-hint" onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ cursor: 'pointer' }} />
      <text x={size.width / 2} y={size.height + 16} textAnchor="middle" fill={signalColor} fontSize="10" fontFamily="monospace">{node.label || 'IN'}</text>
      <text x={size.width / 2} y={size.height + 28} textAnchor="middle" fill={signalColor} fontSize="8" fontFamily="monospace">{node.state ? 'HIGH' : 'LOW'}</text>
      {/* Output port - InputNode only has output */}
      <circle cx={size.width} cy={size.height / 2} r="5" fill={signalColor} className="port-output" data-port-index="0" data-port-type="output" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, true); }} style={{ cursor: 'pointer' }} />
      {cycleWarning && <g transform={`translate(${size.width - 12}, -12)`}><circle r="10" fill="#ef4444" /><text x="0" y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">!</text></g>}
    </g>
  );
};

const OutputNodeCanvas: React.FC<{ node: PlacedOutputNode; isSelected: boolean; cycleWarning: boolean; onClick: () => void; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ node, isSelected, cycleWarning, onClick, onPortClick }) => {
  const signalColor = node.inputSignal ? SIGNAL_COLORS.HIGH : SIGNAL_COLORS.LOW;
  const size = node.size || CIRCUIT_NODE_SIZES.output;
  const borderColor = cycleWarning ? '#ef4444' : isSelected ? SIGNAL_COLORS.SELECTED : signalColor;
  
  return (
    <g className="circuit-node output-node" onClick={onClick} style={{ cursor: 'pointer' }} data-node-type="output" data-node-id={node.id} data-signal={node.inputSignal ? 'HIGH' : 'LOW'} data-selected={isSelected ? 'true' : 'false'} data-cycle-warning={cycleWarning ? 'true' : 'false'}>
      {(isSelected || cycleWarning) && <rect x="-4" y="-4" width={size.width + 8} height={size.height + 8} rx="6" fill="none" stroke={borderColor} strokeWidth="2" strokeDasharray={cycleWarning ? '4 2' : 'none'} />}
      <rect x="0" y="0" width={size.width} height={size.height} rx="8" fill="rgba(15, 23, 42, 0.95)" stroke={signalColor} strokeWidth="2" />
      <circle cx={size.width / 2} cy={size.height / 2} r="18" fill="none" stroke={signalColor} strokeWidth="2" opacity="0.5" />
      <circle cx={size.width / 2} cy={size.height / 2} r="12" fill={signalColor} style={{ filter: node.inputSignal ? `drop-shadow(0 0 12px ${signalColor}) drop-shadow(0 0 24px ${signalColor})` : 'none' }} />
      <text x={size.width / 2} y={size.height + 16} textAnchor="middle" fill={signalColor} fontSize="10" fontFamily="monospace">{node.label || 'OUT'}</text>
      <text x={size.width / 2} y={size.height + 28} textAnchor="middle" fill={signalColor} fontSize="8" fontFamily="monospace">{node.inputSignal ? 'HIGH' : 'LOW'}</text>
      {/* Input port - OutputNode only has input */}
      <circle cx="0" cy={size.height / 2} r="5" fill={signalColor} className="port-input" data-port-index="0" data-port-type="input" onClick={(e) => { e.stopPropagation(); onPortClick?.(0, false); }} style={{ cursor: 'pointer' }} />
      {cycleWarning && <g transform="translate(12, -12)"><circle r="10" fill="#ef4444" /><text x="0" y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">!</text></g>}
    </g>
  );
};

const GateNodeCanvas: React.FC<{ node: PlacedGateNode; isSelected: boolean; cycleWarning: boolean; onClick: () => void; onPortClick?: (portIndex: number, isOutput: boolean) => void }> = ({ node, isSelected, cycleWarning, onClick, onPortClick }) => {
  const signalColor = node.output ? SIGNAL_COLORS.HIGH : SIGNAL_COLORS.LOW;
  const size = node.size || CIRCUIT_NODE_SIZES[node.gateType!] || { width: 80, height: 50 };
  const borderColor = cycleWarning ? '#ef4444' : isSelected ? SIGNAL_COLORS.SELECTED : signalColor;
  
  const handlePortClick = useCallback((portIndex: number, isOutput: boolean) => {
    onPortClick?.(portIndex, isOutput);
  }, [onPortClick]);
  
  const renderGateShape = () => {
    const shapeProps = { signalColor, width: size.width, height: size.height, onPortClick: handlePortClick };
    switch (node.gateType) {
      case 'AND': return <ANDGateShape {...shapeProps} />;
      case 'OR': return <ORGateShape {...shapeProps} />;
      case 'NOT': return <NOTGateShape {...shapeProps} />;
      case 'NAND': return <NANDGateShape {...shapeProps} />;
      case 'NOR': return <NORGateShape {...shapeProps} />;
      case 'XOR': return <XORGateShape {...shapeProps} />;
      case 'XNOR': return <XNORGateShape {...shapeProps} />;
      default: return null;
    }
  };
  
  return (
    <g className="circuit-node gate-node" onClick={onClick} style={{ cursor: 'pointer' }} data-node-type="gate" data-node-id={node.id} data-gate-type={node.gateType} data-output={node.output ? 'HIGH' : 'LOW'} data-selected={isSelected ? 'true' : 'false'} data-cycle-warning={cycleWarning ? 'true' : 'false'}>
      {(isSelected || cycleWarning) && <rect x="-6" y="-6" width={size.width + 12} height={size.height + 20} rx="4" fill="none" stroke={borderColor} strokeWidth="2" strokeDasharray={cycleWarning ? '4 2' : 'none'} />}
      {renderGateShape()}
      <text x={size.width / 2} y={size.height + 16} textAnchor="middle" fill={signalColor} fontSize="12" fontFamily="monospace" fontWeight="bold">{node.gateType}</text>
      {cycleWarning && <g transform={`translate(${size.width / 2}, -12)`}><circle r="10" fill="#ef4444" /><text x="0" y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">!</text></g>}
    </g>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const CanvasCircuitNode: React.FC<CanvasCircuitNodeProps> = ({ node, isSelected = false, cycleWarning = false, onClick, onDragStart, onInputToggle, onPortClick }) => {
  const handleClick = useCallback(() => { onClick?.(node.id); }, [onClick, node.id]);
  
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
