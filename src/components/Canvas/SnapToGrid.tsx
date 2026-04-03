/**
 * SnapToGrid - Grid snapping utility and component
 * 
 * Provides configurable grid snapping with:
 * - 20px grid size (configurable)
 * - Toggle snap on/off
 * - Visual grid display option
 * - Smart snap with threshold
 * 
 * @example
 * const snappedPosition = snapToGrid({ x: 33, y: 47 }, 20);
 * // Returns { x: 40, y: 60 }
 */

import React, { useCallback, useMemo } from 'react';

// Grid configuration
export const DEFAULT_GRID_SIZE = 20;
export const DEFAULT_SNAP_THRESHOLD = 8; // px - snap within this distance

export interface SnapToGridOptions {
  /** Grid size in pixels */
  gridSize?: number;
  /** Enable/disable snapping */
  enabled?: boolean;
  /** Snap threshold in pixels */
  threshold?: number;
}

export interface Position {
  x: number;
  y: number;
}

/**
 * Snap a single value to the nearest grid line
 */
export function snapValue(value: number, gridSize: number): number {
  const result = Math.round(value / gridSize) * gridSize; return result === 0 ? 0 : result;
}

/**
 * Snap a position to the grid
 * 
 * @param position - The position to snap
 * @param gridSize - Grid size in pixels (default: 20)
 * @returns Snapped position
 * 
 * @example
 * snapToGrid({ x: 33, y: 47 }, 20)
 * // Returns { x: 40, y: 60 }
 */
export function snapToGrid(position: Position, gridSize: number = DEFAULT_GRID_SIZE): Position {
  return {
    x: snapValue(position.x, gridSize),
    y: snapValue(position.y, gridSize),
  };
}

/**
 * Smart snap with threshold - only snaps if within threshold distance
 * 
 * @param position - The position to potentially snap
 * @param gridSize - Grid size in pixels
 * @param threshold - Snap threshold in pixels
 * @returns Snapped position if within threshold, original otherwise
 */
export function smartSnapToGrid(
  position: Position,
  gridSize: number = DEFAULT_GRID_SIZE,
  threshold: number = DEFAULT_SNAP_THRESHOLD
): Position {
  const snapped = snapToGrid(position, gridSize);
  const distanceX = Math.abs(position.x - snapped.x);
  const distanceY = Math.abs(position.y - snapped.y);

  return {
    x: distanceX <= threshold ? snapped.x : position.x,
    y: distanceY <= threshold ? snapped.y : position.y,
  };
}

/**
 * Snap module center position to grid
 * Takes into account module dimensions
 */
export function snapModuleToGrid(
  position: Position,
  moduleWidth: number,
  moduleHeight: number,
  gridSize: number = DEFAULT_GRID_SIZE
): Position {
  // Calculate center of module
  const centerX = position.x + moduleWidth / 2;
  const centerY = position.y + moduleHeight / 2;

  // Snap center to grid
  const snappedCenterX = snapValue(centerX, gridSize);
  const snappedCenterY = snapValue(centerY, gridSize);

  // Return top-left position (accounting for half width/height)
  return {
    x: snappedCenterX - moduleWidth / 2,
    y: snappedCenterY - moduleHeight / 2,
  };
}

/**
 * Calculate grid line positions for a given viewport
 */
export function calculateGridLines(
  viewport: { x: number; y: number; zoom: number },
  viewportSize: { width: number; height: number },
  gridSize: number = DEFAULT_GRID_SIZE
): { vertical: number[]; horizontal: number[] } {
  const startX = Math.floor(-viewport.x / viewport.zoom / gridSize) * gridSize;
  const endX = Math.ceil((viewportSize.width - viewport.x) / viewport.zoom / gridSize) * gridSize;
  const startY = Math.floor(-viewport.y / viewport.zoom / gridSize) * gridSize;
  const endY = Math.ceil((viewportSize.height - viewport.y) / viewport.zoom / gridSize) * gridSize;

  const vertical: number[] = [];
  const horizontal: number[] = [];

  for (let x = startX; x <= endX; x += gridSize) {
    vertical.push(x);
  }

  for (let y = startY; y <= endY; y += gridSize) {
    horizontal.push(y);
  }

  return { vertical, horizontal };
}

/**
 * Generate SVG grid pattern
 */
export function generateGridPattern(
  gridSize: number = DEFAULT_GRID_SIZE
): React.SVGProps<SVGPatternElement> {
  return {
    id: `grid-${gridSize}`,
    width: gridSize,
    height: gridSize,
    patternUnits: 'userSpaceOnUse',
  };
}

/**
 * SnapToGrid hook for components
 */
export function useSnapToGrid(options: SnapToGridOptions = {}) {
  const { gridSize = DEFAULT_GRID_SIZE, enabled = true } = options;

  /**
   * Snap a position to grid
   */
  const snap = useCallback((position: Position): Position => {
    if (!enabled) return position;
    return snapToGrid(position, gridSize);
  }, [enabled, gridSize]);

  /**
   * Smart snap with threshold
   */
  const smartSnap = useCallback((position: Position, threshold?: number): Position => {
    if (!enabled) return position;
    return smartSnapToGrid(position, gridSize, threshold);
  }, [enabled, gridSize]);

  /**
   * Snap module position
   */
  const snapModule = useCallback((position: Position, width: number, height: number): Position => {
    if (!enabled) return position;
    return snapModuleToGrid(position, width, height, gridSize);
  }, [enabled, gridSize]);

  /**
   * Check if a value is aligned to grid
   */
  const isAligned = useCallback((value: number): boolean => {
    return value % gridSize === 0;
  }, [gridSize]);

  /**
   * Check if a position is aligned to grid
   */
  const isPositionAligned = useCallback((position: Position): boolean => {
    return isAligned(position.x) && isAligned(position.y);
  }, [isAligned]);

  return useMemo(() => ({
    snap,
    smartSnap,
    snapModule,
    isAligned,
    isPositionAligned,
    gridSize,
    enabled,
  }), [snap, smartSnap, snapModule, isAligned, isPositionAligned, gridSize, enabled]);
}

/**
 * GridDisplay - Visual grid component
 */
export interface GridDisplayProps {
  /** Viewport offset */
  viewport: { x: number; y: number; zoom: number };
  /** Viewport size */
  viewportSize: { width: number; height: number };
  /** Grid size */
  gridSize?: number;
  /** Show small grid lines */
  showSmallGrid?: boolean;
  /** Small grid size (typically gridSize / 5) */
  smallGridSize?: number;
  /** Small grid opacity */
  smallGridOpacity?: number;
  /** Large grid opacity */
  largeGridOpacity?: number;
  /** Grid color */
  gridColor?: string;
  /** Small grid color */
  smallGridColor?: string;
  /** CSS class name */
  className?: string;
}

export function GridDisplay({
  viewport,
  viewportSize,
  gridSize = DEFAULT_GRID_SIZE,
  showSmallGrid = true,
  smallGridSize,
  smallGridOpacity = 0.3,
  largeGridOpacity = 0.5,
  gridColor = '#1e2a42',
  smallGridColor,
  className,
}: GridDisplayProps) {
  const actualSmallGridSize = smallGridSize || gridSize / 5;
  const actualSmallGridColor = smallGridColor || gridColor;
  
  const smallGridPatternId = `small-grid-${gridSize}`;
  const largeGridPatternId = `large-grid-${gridSize}`;
  
  // Calculate transform for infinite grid effect
  const transform = `translate(${viewport.x % (gridSize * 5)}, ${viewport.y % (gridSize * 5)})`;

  return (
    <g className={className} data-testid="grid-display">
      <defs>
        {/* Small grid pattern */}
        {showSmallGrid && (
          <pattern
            id={smallGridPatternId}
            width={actualSmallGridSize}
            height={actualSmallGridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${actualSmallGridSize} 0 L 0 0 0 ${actualSmallGridSize}`}
              fill="none"
              stroke={actualSmallGridColor}
              strokeWidth="0.5"
              opacity={smallGridOpacity}
            />
          </pattern>
        )}
        
        {/* Large grid pattern */}
        <pattern
          id={largeGridPatternId}
          width={gridSize * 5}
          height={gridSize * 5}
          patternUnits="userSpaceOnUse"
        >
          {showSmallGrid && (
            <rect
              width={gridSize * 5}
              height={gridSize * 5}
              fill={`url(#${smallGridPatternId})`}
            />
          )}
          <path
            d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`}
            fill="none"
            stroke={gridColor}
            strokeWidth="1"
            opacity={largeGridOpacity}
          />
        </pattern>
      </defs>
      
      {/* Background grid */}
      <rect
        x={0}
        y={0}
        width={viewportSize.width}
        height={viewportSize.height}
        fill={`url(#${largeGridPatternId})`}
        transform={transform}
      />
    </g>
  );
}

/**
 * GridSnapOverlay - Visual indicator showing snap position
 */
export interface GridSnapOverlayProps {
  /** Position to show snap indicator */
  position: Position | null;
  /** Grid size */
  gridSize?: number;
  /** Color of the snap indicator */
  color?: string;
}

export function GridSnapOverlay({
  position,
  gridSize = DEFAULT_GRID_SIZE,
  color = '#00d4ff',
}: GridSnapOverlayProps) {
  if (!position) return null;

  const snapped = snapToGrid(position, gridSize);

  return (
    <g data-testid="grid-snap-overlay">
      {/* Horizontal snap line */}
      <line
        x1={0}
        y1={snapped.y}
        x2={9999}
        y2={snapped.y}
        stroke={color}
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity={0.5}
      />
      {/* Vertical snap line */}
      <line
        x1={snapped.x}
        y1={0}
        x2={snapped.x}
        y2={9999}
        stroke={color}
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity={0.5}
      />
      {/* Snap point indicator */}
      <circle
        cx={snapped.x}
        cy={snapped.y}
        r="4"
        fill={color}
        opacity={0.8}
      />
    </g>
  );
}

export default GridDisplay;
