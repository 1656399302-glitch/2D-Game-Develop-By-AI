/**
 * Circuit Wire Component
 * 
 * Round 122: Circuit Canvas Integration
 * Round 146: Enhanced wire rendering with extended hit area (≥8px tolerance)
 * 
 * Wire component with signal state visualization.
 * Wire color reflects signal state (green=HIGH, gray=LOW).
 */

import React, { useMemo } from 'react';
import { CircuitWire as CircuitWireType, CircuitWireProps, SIGNAL_COLORS } from '../../types/circuitCanvas';

// ============================================================================
// Wire Animation Styles
// ============================================================================

const wireAnimationStyle = `
  @keyframes wire-signal-flow {
    0% {
      stroke-dashoffset: 20;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }
  
  @keyframes wire-pulse {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.3;
    }
  }
  
  .circuit-wire.signal-high .wire-path {
    animation: wire-signal-flow 0.5s linear infinite;
  }
  
  .circuit-wire-highlight {
    animation: wire-pulse 1s ease-in-out infinite;
  }
  
  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .circuit-wire.signal-high .wire-path,
    .circuit-wire-highlight {
      animation: none;
    }
  }
`;

// Inject styles once
const wireStyleId = 'circuit-wire-ux-styles';
if (typeof document !== 'undefined' && !document.getElementById(wireStyleId)) {
  const styleEl = document.createElement('style');
  styleEl.id = wireStyleId;
  styleEl.textContent = wireAnimationStyle;
  document.head.appendChild(styleEl);
}

// ============================================================================
// Wire Path Utilities
// ============================================================================

/**
 * Calculate SVG path for a wire between two points
 * Uses bezier curves for smooth connections
 */
export function calculateWirePath(
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number }
): string {
  const dx = endPoint.x - startPoint.x;
  
  // Control point offset - adjust based on distance
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);
  
  // Use cubic bezier for smooth curve
  const cp1x = startPoint.x + controlOffset;
  const cp1y = startPoint.y;
  const cp2x = endPoint.x - controlOffset;
  const cp2y = endPoint.y;
  
  return `M ${startPoint.x} ${startPoint.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPoint.x} ${endPoint.y}`;
}

/**
 * Calculate straight wire path (for short distances)
 */
export function calculateStraightWirePath(
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number }
): string {
  return `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;
}

// ============================================================================
// Wire Glow Effect Component
// ============================================================================

const WireGlow: React.FC<{ color: string; path: string }> = ({ color, path }) => (
  <path
    d={path}
    fill="none"
    stroke={color}
    strokeWidth="6"
    strokeLinecap="round"
    opacity="0.4"
    style={{
      filter: `drop-shadow(0 0 4px ${color})`,
    }}
  />
);

// ============================================================================
// Wire Component with Extended Hit Area
// ============================================================================

/**
 * Circuit Wire Component
 * Renders a wire between two circuit nodes with signal state visualization
 * 
 * Round 146: Enhanced with extended hit area (≥8px tolerance) for easier wire selection
 */
export const CircuitWire: React.FC<CircuitWireProps> = ({
  wire,
  startPoint,
  endPoint,
  isSelected = false,
  onClick,
}) => {
  // Calculate path
  const path = useMemo(() => {
    // Use straight path for short distances, curved for longer
    const distance = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
    );
    
    if (distance < 50) {
      return calculateStraightWirePath(startPoint, endPoint);
    }
    return calculateWirePath(startPoint, endPoint);
  }, [startPoint, endPoint]);
  
  // Signal color based on wire state
  const signalColor = wire.signal ? SIGNAL_COLORS.HIGH : SIGNAL_COLORS.LOW;
  
  // Border/selection color
  const selectionColor = isSelected ? SIGNAL_COLORS.SELECTED : signalColor;
  
  // Glow effect for HIGH signals
  const showGlow = wire.signal;
  
  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(wire.id);
  };
  
  // Extended hit area for easier wire selection (Round 146)
  // Minimum 8px tolerance on each side of the visible wire
  const hitAreaStrokeWidth = 8; // Ensures 8px tolerance on each side
  
  return (
    <g
      className={`circuit-wire ${wire.signal ? 'signal-high' : 'signal-low'}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      data-wire-id={wire.id}
      data-signal={wire.signal ? 'HIGH' : 'LOW'}
      data-selected={isSelected ? 'true' : 'false'}
      data-hit-area={hitAreaStrokeWidth}
    >
      {/* Invisible hit area for extended click target (Round 146: ≥8px tolerance) */}
      {/* This path is invisible but captures clicks within 8px of the wire */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={hitAreaStrokeWidth * 2} // 16px total hit area (8px on each side)
        strokeLinecap="round"
        className="wire-hit-area"
        style={{ pointerEvents: 'stroke' }}
      />
      
      {/* Glow effect for HIGH signals */}
      {showGlow && <WireGlow color={signalColor} path={path} />}
      
      {/* Selection highlight */}
      {isSelected && (
        <path
          d={path}
          fill="none"
          stroke={selectionColor}
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.3"
          className="circuit-wire-highlight"
        />
      )}
      
      {/* Main wire with signal flow animation for powered wires */}
      <path
        d={path}
        fill="none"
        stroke={selectionColor}
        strokeWidth={isSelected ? 3 : 2}
        strokeLinecap="round"
        className={`wire-path ${wire.signal ? 'wire-powered' : 'wire-unpowered'}`}
        strokeDasharray={wire.signal ? "10 5" : "none"}
      />
      
      {/* Arrow indicator showing direction */}
      <circle
        cx={endPoint.x}
        cy={endPoint.y}
        r="3"
        fill={selectionColor}
        className="wire-endpoint"
      />
      
      {/* Signal state indicator in the middle */}
      {Math.abs(endPoint.x - startPoint.x) > 40 && (
        <g transform={`translate(${(startPoint.x + endPoint.x) / 2}, ${(startPoint.y + endPoint.y) / 2 - 8})`}>
          <rect
            x="-12"
            y="-8"
            width="24"
            height="16"
            rx="4"
            fill="rgba(15, 23, 42, 0.9)"
            stroke={selectionColor}
            strokeWidth="1"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill={selectionColor}
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {wire.signal ? 'HIGH' : 'LOW'}
          </text>
        </g>
      )}
    </g>
  );
};

// ============================================================================
// Wire Preview Component (for wire drawing)
// ============================================================================

export interface WirePreviewProps {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  isValid?: boolean;
}

/**
 * Wire Preview Component
 * Shows preview of wire being drawn
 */
export const WirePreview: React.FC<WirePreviewProps> = ({
  startPoint,
  endPoint,
  isValid = true,
}) => {
  const path = useMemo(() => {
    const distance = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
    );
    
    if (distance < 50) {
      return calculateStraightWirePath(startPoint, endPoint);
    }
    return calculateWirePath(startPoint, endPoint);
  }, [startPoint, endPoint]);
  
  const previewColor = isValid ? '#3b82f6' : '#ef4444';
  
  return (
    <g className="wire-preview" data-valid={isValid}>
      {/* Dashed preview line */}
      <path
        d={path}
        fill="none"
        stroke={previewColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 4"
        opacity="0.7"
      />
      
      {/* Start point indicator */}
      <circle
        cx={startPoint.x}
        cy={startPoint.y}
        r="6"
        fill={previewColor}
        opacity="0.5"
      />
      
      {/* End point indicator */}
      <circle
        cx={endPoint.x}
        cy={endPoint.y}
        r="4"
        fill={isValid ? previewColor : '#ef4444'}
        stroke="white"
        strokeWidth="1"
      />
    </g>
  );
};

// ============================================================================
// Wire Bundle Component (for multiple wires)
// ============================================================================

export interface WireBundleProps {
  wires: CircuitWireType[];
  getNodePosition: (nodeId: string, isSource: boolean) => { x: number; y: number } | null;
  selectedWireId?: string | null;
  onWireClick?: (wireId: string) => void;
}

/**
 * Wire Bundle Component
 * Renders multiple wires with proper positioning
 */
export const WireBundle: React.FC<WireBundleProps> = ({
  wires,
  getNodePosition,
  selectedWireId,
  onWireClick,
}) => {
  return (
    <g className="wire-bundle">
      {wires.map((wire) => {
        const sourcePos = getNodePosition(wire.sourceNodeId, true);
        const targetPos = getNodePosition(wire.targetNodeId, false);
        
        if (!sourcePos || !targetPos) return null;
        
        return (
          <CircuitWire
            key={wire.id}
            wire={wire}
            startPoint={sourcePos}
            endPoint={targetPos}
            isSelected={wire.id === selectedWireId}
            onClick={onWireClick}
          />
        );
      })}
    </g>
  );
};

// ============================================================================
// Export
// ============================================================================

export default CircuitWire;
