/**
 * Wire Junction Component
 * 
 * Round 144: Circuit Canvas UI
 * 
 * Junction point component for complex wire routing.
 * Allows multiple wires to connect at a single point.
 */

import React from 'react';
import { SignalState } from '../../types/circuit';

// ============================================================================
// Types
// ============================================================================

interface WireJunctionProps {
  /** X position on canvas */
  x: number;
  /** Y position on canvas */
  y: number;
  /** Junction ID */
  id?: string;
  /** Signal state (HIGH or LOW) */
  signal?: SignalState;
  /** Number of connected wires */
  connectionCount?: number;
  /** Whether junction is selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: (id: string) => void;
  /** Port click handler for wire drawing */
  onPortClick?: (id: string, portIndex: number) => void;
  /** Zoom level for rendering (unused but available for future) */
  zoom?: number;
  /** Additional CSS class */
  className?: string;
}

// ============================================================================
// Signal Colors
// ============================================================================

const SIGNAL_COLORS = {
  HIGH: '#22c55e', // Green for HIGH
  LOW: '#64748b',  // Gray for LOW
  SELECTED: '#3b82f6', // Blue for selected
  ERROR: '#ef4444', // Red for error
};

// ============================================================================
// Wire Junction Component
// ============================================================================

export const WireJunction: React.FC<WireJunctionProps> = ({
  x,
  y,
  id = 'junction',
  signal = false,
  connectionCount = 0,
  isSelected = false,
  onClick,
  onPortClick,
  zoom: _zoom = 1, // Unused but available for future zoom scaling
  className = '',
}) => {
  // Junction size in pixels
  const junctionRadius = 6;
  const hitAreaRadius = 12;
  
  // Color based on signal state
  const signalColor = signal ? SIGNAL_COLORS.HIGH : SIGNAL_COLORS.LOW;
  const strokeColor = isSelected ? SIGNAL_COLORS.SELECTED : signalColor;
  
  // Handle click
  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.(id);
    },
    [id, onClick]
  );
  
  // Handle port click (for wire drawing)
  const handlePortClick = React.useCallback(
    (e: React.MouseEvent, portIndex: number) => {
      e.stopPropagation();
      onPortClick?.(id, portIndex);
    },
    [id, onPortClick]
  );
  
  return (
    <g
      className={`wire-junction ${className}`}
      data-testid="wire-junction"
      data-junction-id={id}
      data-signal={signal}
      data-selected={isSelected}
      data-connection-count={connectionCount}
      transform={`translate(${x}, ${y})`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Hit area for easier clicking (invisible) */}
      <circle
        cx={0}
        cy={0}
        r={hitAreaRadius}
        fill="transparent"
        stroke="none"
      />
      
      {/* Selection ring (when selected) */}
      {isSelected && (
        <circle
          cx={0}
          cy={0}
          r={junctionRadius + 4}
          fill="none"
          stroke={SIGNAL_COLORS.SELECTED}
          strokeWidth={2}
          strokeDasharray="3,2"
          opacity={0.7}
        />
      )}
      
      {/* Main junction circle */}
      <circle
        cx={0}
        cy={0}
        r={junctionRadius}
        fill={signalColor}
        stroke={strokeColor}
        strokeWidth={2}
      />
      
      {/* Inner dot for HIGH signal */}
      {signal && (
        <circle
          cx={0}
          cy={0}
          r={2}
          fill="#ffffff"
          opacity={0.8}
        />
      )}
      
      {/* Connection indicator dots (shows how many wires connect) */}
      {connectionCount > 2 && (
        <g className="connection-indicators">
          {/* Top port */}
          <circle
            cx={0}
            cy={-(junctionRadius + 4)}
            r={3}
            fill={signalColor}
            className="port-indicator"
            data-port-index={0}
            onClick={(e) => handlePortClick(e, 0)}
            style={{ cursor: 'pointer' }}
          />
          {/* Right port */}
          <circle
            cx={junctionRadius + 4}
            cy={0}
            r={3}
            fill={signalColor}
            className="port-indicator"
            data-port-index={1}
            onClick={(e) => handlePortClick(e, 1)}
            style={{ cursor: 'pointer' }}
          />
          {/* Bottom port */}
          <circle
            cx={0}
            cy={junctionRadius + 4}
            r={3}
            fill={signalColor}
            className="port-indicator"
            data-port-index={2}
            onClick={(e) => handlePortClick(e, 2)}
            style={{ cursor: 'pointer' }}
          />
          {/* Left port */}
          <circle
            cx={-(junctionRadius + 4)}
            cy={0}
            r={3}
            fill={signalColor}
            className="port-indicator"
            data-port-index={3}
            onClick={(e) => handlePortClick(e, 3)}
            style={{ cursor: 'pointer' }}
          />
        </g>
      )}
      
      {/* Glow effect for HIGH signal */}
      {signal && (
        <circle
          cx={0}
          cy={0}
          r={junctionRadius + 2}
          fill="none"
          stroke={signalColor}
          strokeWidth={1}
          opacity={0.5}
        >
          <animate
            attributeName="r"
            values={`${junctionRadius + 2};${junctionRadius + 6};${junctionRadius + 2}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.5;0.2;0.5"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
};

// ============================================================================
// Junction with multiple connection ports
// ============================================================================

interface JunctionHubProps {
  /** X position */
  x: number;
  /** Y position */
  y: number;
  /** Junction ID */
  id?: string;
  /** Number of ports */
  portCount?: number;
  /** Signal state for each port */
  portSignals?: SignalState[];
  /** Selected port index */
  selectedPort?: number | null;
  /** Zoom level (unused but available for future) */
  zoom?: number;
  /** Click handler */
  onClick?: (id: string) => void;
  /** Port click handler */
  onPortClick?: (id: string, portIndex: number) => void;
  /** Additional CSS class */
  className?: string;
}

export const JunctionHub: React.FC<JunctionHubProps> = ({
  x,
  y,
  id = 'junction-hub',
  portCount = 4,
  portSignals = [],
  selectedPort = null,
  zoom: _zoom = 1, // Unused but available for future zoom scaling
  onClick,
  onPortClick,
  className = '',
}) => {
  const hubRadius = 8;
  
  // Calculate port positions in a circle
  const getPortPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    const radius = hubRadius + 8;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };
  
  // Get signal color for a port
  const getPortColor = (index: number) => {
    const signal = portSignals[index] ?? false;
    return signal ? SIGNAL_COLORS.HIGH : SIGNAL_COLORS.LOW;
  };
  
  return (
    <g
      className={`junction-hub ${className}`}
      data-testid="junction-hub"
      data-junction-id={id}
      transform={`translate(${x}, ${y})`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(id);
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Central hub */}
      <circle
        cx={0}
        cy={0}
        r={hubRadius}
        fill="#1e293b"
        stroke="#64748b"
        strokeWidth={2}
      />
      
      {/* Inner indicator */}
      <circle
        cx={0}
        cy={0}
        r={3}
        fill="#64748b"
      />
      
      {/* Connection ports */}
      {Array.from({ length: portCount }).map((_, index) => {
        const pos = getPortPosition(index, portCount);
        const color = getPortColor(index);
        const isSelected = selectedPort === index;
        
        return (
          <g key={index}>
            {/* Port line */}
            <line
              x1={0}
              y1={0}
              x2={pos.x}
              y2={pos.y}
              stroke={color}
              strokeWidth={2}
              opacity={0.5}
            />
            
            {/* Port circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={4}
              fill={color}
              stroke={isSelected ? SIGNAL_COLORS.SELECTED : 'transparent'}
              strokeWidth={2}
              data-port-index={index}
              onClick={(e) => {
                e.stopPropagation();
                onPortClick?.(id, index);
              }}
              style={{ cursor: 'pointer' }}
            />
          </g>
        );
      })}
    </g>
  );
};

// ============================================================================
// Export
// ============================================================================

export default WireJunction;
