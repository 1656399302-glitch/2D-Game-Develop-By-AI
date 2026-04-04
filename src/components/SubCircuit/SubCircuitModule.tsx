/**
 * Sub-Circuit Module Component
 * 
 * Round 129: Sub-circuit Module System
 * 
 * Renders a sub-circuit module on the canvas with a circuit-board SVG icon.
 */

import React, { useMemo, useCallback } from 'react';
import { SIGNAL_COLORS } from '../../types/circuitCanvas';

// ============================================================================
// Props Interface
// ============================================================================

export interface SubCircuitModuleProps {
  /** Unique instance ID */
  id: string;
  /** Sub-circuit module name */
  name: string;
  /** Number of modules in the sub-circuit */
  moduleCount: number;
  /** Position on canvas */
  position: { x: number; y: number };
  /** Whether the module is selected */
  isSelected?: boolean;
  /** Signal state (for output indication) */
  signal?: boolean;
  /** Click handler */
  onClick?: (id: string) => void;
  /** Drag start handler */
  onDragStart?: (id: string, event: React.MouseEvent) => void;
}

// ============================================================================
// Constants
// ============================================================================

const MODULE_WIDTH = 80;
const MODULE_HEIGHT = 80;

/**
 * Circuit-board SVG icon for sub-circuit modules
 */
const CircuitBoardIcon: React.FC<{ color: string; isSelected: boolean }> = ({ color, isSelected }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" className="sub-circuit-icon">
    {/* Outer board */}
    <rect x="2" y="2" width="36" height="36" rx="4" 
      fill="rgba(15, 23, 42, 0.9)" 
      stroke={color} 
      strokeWidth={isSelected ? 2.5 : 1.5} 
    />
    
    {/* Circuit traces - horizontal */}
    <line x1="6" y1="10" x2="34" y2="10" stroke={color} strokeWidth="1.5" opacity="0.8" />
    <line x1="6" y1="20" x2="20" y2="20" stroke={color} strokeWidth="1.5" opacity="0.8" />
    <line x1="20" y1="20" x2="20" y2="30" stroke={color} strokeWidth="1.5" opacity="0.8" />
    <line x1="6" y1="30" x2="34" y2="30" stroke={color} strokeWidth="1.5" opacity="0.8" />
    
    {/* Circuit traces - vertical */}
    <line x1="10" y1="6" x2="10" y2="34" stroke={color} strokeWidth="1.5" opacity="0.8" />
    <line x1="20" y1="6" x2="20" y2="16" stroke={color} strokeWidth="1.5" opacity="0.8" />
    <line x1="30" y1="6" x2="30" y2="34" stroke={color} strokeWidth="1.5" opacity="0.8" />
    
    {/* Connection points / nodes */}
    <circle cx="6" cy="10" r="2" fill={color} />
    <circle cx="34" cy="10" r="2" fill={color} />
    <circle cx="6" cy="20" r="2" fill={color} />
    <circle cx="6" cy="30" r="2" fill={color} />
    <circle cx="34" cy="30" r="2" fill={color} />
    <circle cx="10" cy="6" r="2" fill={color} />
    <circle cx="10" cy="34" r="2" fill={color} />
    <circle cx="30" cy="6" r="2" fill={color} />
    <circle cx="30" cy="34" r="2" fill={color} />
    
    {/* Center chip */}
    <rect x="13" y="13" width="14" height="14" rx="2" 
      fill="rgba(15, 23, 42, 0.95)" 
      stroke={color} 
      strokeWidth="1.5" 
    />
    <text x="20" y="22" textAnchor="middle" fill={color} fontSize="7" fontFamily="monospace" fontWeight="bold">IC</text>
  </svg>
);

// ============================================================================
// Component
// ============================================================================

/**
 * Sub-Circuit Module Component for canvas rendering
 */
export const SubCircuitModule: React.FC<SubCircuitModuleProps> = ({
  id,
  name,
  moduleCount,
  position,
  isSelected = false,
  signal = false,
  onClick,
  onDragStart,
}) => {
  const signalColor = signal ? SIGNAL_COLORS.HIGH : SIGNAL_COLORS.LOW;
  const borderColor = isSelected ? SIGNAL_COLORS.SELECTED : signalColor;
  
  // Truncate name if too long
  const displayName = useMemo(() => {
    if (name.length > 10) {
      return `${name.substring(0, 8)}…`;
    }
    return name;
  }, [name]);
  
  // Handle click
  const handleClick = useCallback(() => {
    onClick?.(id);
  }, [onClick, id]);
  
  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      e.stopPropagation();
      onDragStart?.(id, e);
    }
  }, [onDragStart, id]);
  
  return (
    <g 
      className="sub-circuit-module"
      transform={`translate(${position.x}, ${position.y})`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      data-sub-circuit-id={id}
      data-sub-circuit-name={name}
      data-module-count={moduleCount}
      data-selected={isSelected ? 'true' : 'false'}
      style={{ cursor: 'pointer' }}
    >
      {/* Selection/hover indicator */}
      {(isSelected) && (
        <rect 
          x="-4" 
          y="-4" 
          width={MODULE_WIDTH + 8} 
          height={MODULE_HEIGHT + 24} 
          rx="6" 
          fill="none" 
          stroke={borderColor} 
          strokeWidth="2"
        />
      )}
      
      {/* Main module body */}
      <rect 
        x="0" 
        y="0" 
        width={MODULE_WIDTH} 
        height={MODULE_HEIGHT} 
        rx="8" 
        fill="rgba(15, 23, 42, 0.95)" 
        stroke={signalColor} 
        strokeWidth="2" 
      />
      
      {/* Circuit-board icon */}
      <g transform={`translate(${(MODULE_WIDTH - 40) / 2}, 8)`}>
        <CircuitBoardIcon color={signalColor} isSelected={isSelected} />
      </g>
      
      {/* Module count badge */}
      <g transform={`translate(${MODULE_WIDTH - 24}, ${MODULE_HEIGHT - 4})`}>
        <rect 
          x="-12" 
          y="-10" 
          width="24" 
          height="16" 
          rx="8" 
          fill={signalColor} 
          opacity="0.2" 
        />
        <text 
          x="0" 
          y="2" 
          textAnchor="middle" 
          fill={signalColor} 
          fontSize="9" 
          fontFamily="monospace" 
          fontWeight="bold"
        >
          {moduleCount}
        </text>
      </g>
      
      {/* Name label */}
      <text 
        x={MODULE_WIDTH / 2} 
        y={MODULE_HEIGHT + 14} 
        textAnchor="middle" 
        fill={signalColor} 
        fontSize="11" 
        fontFamily="monospace" 
        fontWeight="bold"
      >
        {displayName}
      </text>
      
      {/* Port indicators */}
      {/* Left port (input) */}
      <circle 
        cx="0" 
        cy={MODULE_HEIGHT / 2 - 10} 
        r="4" 
        fill={signalColor} 
        className="port-input"
        data-port-index="0"
        data-port-type="input"
      />
      
      {/* Right port (output) */}
      <circle 
        cx={MODULE_WIDTH} 
        cy={MODULE_HEIGHT / 2 - 10} 
        r="4" 
        fill={signalColor} 
        className="port-output"
        data-port-index="0"
        data-port-type="output"
      />
      
      {/* Bottom left port */}
      <circle 
        cx="0" 
        cy={MODULE_HEIGHT / 2 + 10} 
        r="4" 
        fill={signalColor} 
        className="port-input"
        data-port-index="1"
        data-port-type="input"
      />
      
      {/* Bottom right port */}
      <circle 
        cx={MODULE_WIDTH} 
        cy={MODULE_HEIGHT / 2 + 10} 
        r="4" 
        fill={signalColor} 
        className="port-output"
        data-port-index="1"
        data-port-type="output"
      />
      
      {/* Sub-circuit indicator badge */}
      <g transform="translate(6, 6)">
        <rect 
          x="-1" 
          y="-1" 
          width="16" 
          height="10" 
          rx="2" 
          fill="rgba(15, 23, 42, 0.9)" 
          stroke={signalColor} 
          strokeWidth="1"
        />
        <text 
          x="7" 
          y="6" 
          textAnchor="middle" 
          fill={signalColor} 
          fontSize="6" 
          fontFamily="monospace"
        >
          SUB
        </text>
      </g>
    </g>
  );
};

// ============================================================================
// Palette Item Component
// ============================================================================

export interface SubCircuitPaletteItemProps {
  /** Sub-circuit module data */
  id: string;
  name: string;
  moduleCount: number;
  /** Click handler for adding to canvas */
  onClick: () => void;
}

/**
 * Sub-circuit palette item for the module panel
 */
export const SubCircuitPaletteItem: React.FC<SubCircuitPaletteItemProps> = ({
  id,
  name,
  moduleCount,
  onClick,
}) => {
  const iconColor = '#8b5cf6'; // Purple for custom sub-circuits
  
  return (
    <button
      onClick={onClick}
      className={`
        sub-circuit-palette-item 
        p-2 rounded-lg border transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
        text-left
      `}
      style={{
        borderColor: `${iconColor}40`,
        backgroundColor: `${iconColor}10`,
      }}
      data-sub-circuit-id={id}
      data-sub-circuit-name={name}
      aria-label={`添加子电路 ${name}（包含${moduleCount}个模块）`}
    >
      {/* Icon */}
      <div className="flex justify-center mb-1" aria-hidden="true">
        <CircuitBoardIcon color={iconColor} isSelected={false} />
      </div>
      
      {/* Name */}
      <div className="text-center">
        <span
          className="text-xs font-medium"
          style={{ color: iconColor }}
        >
          {name}
        </span>
      </div>
      
      {/* Module count */}
      <p className="text-[9px] text-[#6b7280] mt-1 text-center">
        {moduleCount} 模块
      </p>
    </button>
  );
};

export default SubCircuitModule;
