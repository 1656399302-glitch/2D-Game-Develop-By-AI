/**
 * Connection Path Utilities
 * 
 * Round 111: Energy Connection System + Module Animation Hooks
 * 
 * This module provides SVG path utilities for rendering energy connections:
 * - Calculate smooth bezier paths between connection points
 * - Generate path data for energy flow animation
 * - Handle edge cases (same module, parallel connections)
 */

import { PlacedModule, MODULE_SIZES, Port } from '../types';

// ============================================================================
// Path Calculation Types
// ============================================================================

/**
 * A point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A bezier curve segment
 */
export interface BezierSegment {
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;
}

/**
 * Path calculation options
 */
export interface PathOptions {
  /** Curve tension (0-1, default 0.5) */
  tension?: number;
  /** Minimum distance before using bezier curves (default 50) */
  minDistanceForCurve?: number;
  /** Maximum control point offset (default 100) */
  maxControlOffset?: number;
  /** Path style (default 'smooth') */
  style?: 'straight' | 'smooth' | 'orthogonal';
}

/**
 * Default path options
 */
const DEFAULT_PATH_OPTIONS: Required<PathOptions> = {
  tension: 0.5,
  minDistanceForCurve: 50,
  maxControlOffset: 100,
  style: 'smooth',
};

// ============================================================================
// Core Path Functions
// ============================================================================

/**
 * Calculate a smooth bezier path between two points
 * 
 * @param start - Starting point
 * @param end - Ending point
 * @param options - Path calculation options
 * @returns SVG path data string
 */
export function calculateBezierPath(
  start: Point,
  end: Point,
  options: PathOptions = {}
): string {
  const opts = { ...DEFAULT_PATH_OPTIONS, ...options };
  
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Determine control point offset based on distance
  const controlOffset = Math.min(
    opts.maxControlOffset,
    Math.max(distance * opts.tension, 20)
  );
  
  // Calculate control points based on relative positions
  let cp1x: number, cp1y: number, cp2x: number, cp2y: number;
  
  if (opts.style === 'straight' || distance < opts.minDistanceForCurve) {
    // Straight line for short distances
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }
  
  if (opts.style === 'orthogonal') {
    // Orthogonal path (right angles)
    const midX = start.x + dx / 2;
    return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
  }
  
  // Smooth bezier - curve based on direction
  if (Math.abs(dx) > Math.abs(dy)) {
    // More horizontal - curve horizontally
    cp1x = start.x + controlOffset * Math.sign(dx);
    cp1y = start.y;
    cp2x = end.x - controlOffset * Math.sign(dx);
    cp2y = end.y;
  } else {
    // More vertical - curve vertically
    cp1x = start.x;
    cp1y = start.y + controlOffset * Math.sign(dy);
    cp2x = end.x;
    cp2y = end.y - controlOffset * Math.sign(dy);
  }
  
  return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
}

/**
 * Calculate a quadratic bezier path (simpler curve)
 */
export function calculateQuadraticPath(
  start: Point,
  end: Point,
  controlPoint?: Point
): string {
  const cp = controlPoint || {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2 - Math.abs(end.x - start.x) * 0.3,
  };
  
  return `M ${start.x} ${start.y} Q ${cp.x} ${cp.y}, ${end.x} ${end.y}`;
}

/**
 * Calculate path between two modules at specific ports
 * 
 * @param sourceModule - Source module
 * @param sourcePort - Source port
 * @param targetModule - Target module
 * @param targetPort - Target port
 * @param options - Path calculation options
 * @returns SVG path data string
 */
export function calculateConnectionPathBetweenModules(
  sourceModule: PlacedModule,
  sourcePort: Port,
  targetModule: PlacedModule,
  targetPort: Port,
  options: PathOptions = {}
): string {
  const sourceSize = MODULE_SIZES[sourceModule.type] || { width: 80, height: 80 };
  const targetSize = MODULE_SIZES[targetModule.type] || { width: 80, height: 80 };
  
  const start = getPortWorldPosition(sourceModule, sourcePort, sourceSize.width, sourceSize.height);
  const end = getPortWorldPosition(targetModule, targetPort, targetSize.width, targetSize.height);
  
  return calculateBezierPath(start, end, options);
}

// ============================================================================
// Port Position Calculation
// ============================================================================

/**
 * Get the world position of a port on a module
 * 
 * @param module - The module containing the port
 * @param port - The port definition
 * @param moduleWidth - Module width in pixels
 * @param moduleHeight - Module height in pixels
 * @returns World coordinates of the port
 */
export function getPortWorldPosition(
  module: PlacedModule,
  port: Port,
  moduleWidth: number,
  moduleHeight: number
): Point {
  // Convert relative position (0-100) to absolute position within module
  const absoluteX = (port.position.x / 100) * moduleWidth;
  const absoluteY = (port.position.y / 100) * moduleHeight;
  
  // Calculate center of module
  const cx = module.x + moduleWidth / 2;
  const cy = module.y + moduleHeight / 2;
  
  // Apply rotation
  if (module.rotation !== 0) {
    const angle = (module.rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    // Position relative to center
    const px = absoluteX - moduleWidth / 2;
    const py = absoluteY - moduleHeight / 2;
    
    // Rotate around center
    const rx = px * cos - py * sin;
    const ry = px * sin + py * cos;
    
    return {
      x: cx + rx,
      y: cy + ry,
    };
  }
  
  return {
    x: module.x + absoluteX,
    y: module.y + absoluteY,
  };
}

/**
 * Calculate the angle of a port's connection direction
 */
export function getPortConnectionAngle(
  module: PlacedModule,
  port: Port,
  moduleWidth: number,
  moduleHeight: number
): number {
  const worldPos = getPortWorldPosition(module, port, moduleWidth, moduleHeight);
  const rotationAngle = (module.rotation * Math.PI) / 180;
  
  // Basic angle calculation (simplified)
  const angle = Math.atan2(worldPos.y - module.y, worldPos.x - module.x);
  
  return angle + rotationAngle;
}

// ============================================================================
// Energy Flow Animation
// ============================================================================

/**
 * Generate stroke-dasharray and stroke-dashoffset for energy flow animation
 * 
 * @param pathLength - Total length of the path
 * @param flowSpeed - Flow speed multiplier (default 1)
 * @returns Object with dasharray and dashoffset values
 */
export function getEnergyFlowAnimation(
  pathLength: number,
  flowSpeed: number = 1
): {
  dasharray: string;
  dashoffset: number;
  animationDuration: number;
} {
  // Create dashed line pattern
  const dashLength = pathLength / 10; // 10 segments
  const gapLength = dashLength * 0.5;
  
  return {
    dasharray: `${dashLength} ${gapLength}`,
    dashoffset: 0,
    animationDuration: 2000 / flowSpeed,
  };
}

/**
 * Calculate animated dashoffset for flowing energy effect
 */
export function calculateFlowDashoffset(
  pathLength: number,
  progress: number // 0-1
): number {
  const segmentLength = pathLength / 10;
  const gapLength = segmentLength * 0.5;
  const totalSegment = segmentLength + gapLength;
  
  return -(progress * totalSegment * 10);
}

// ============================================================================
// Edge Case Handling
// ============================================================================

/**
 * Check if a path is valid (non-empty and well-formed)
 */
export function isValidPath(pathData: string): boolean {
  if (!pathData || typeof pathData !== 'string') return false;
  if (pathData.trim().length === 0) return false;
  
  // Check for at least one move command
  const hasMove = /M\s*-?[\d.]+\s+-?[\d.]+/i.test(pathData);
  return hasMove;
}

/**
 * Handle path for same-module connection (loop back)
 */
export function calculateLoopbackPath(
  module: PlacedModule,
  port: Port,
  moduleWidth: number,
  moduleHeight: number
): string {
  const portPos = getPortWorldPosition(module, port, moduleWidth, moduleHeight);
  
  // Create a small loop at the port
  const loopRadius = 15;
  const angle = getPortConnectionAngle(module, port, moduleWidth, moduleHeight);
  
  const cp1x = portPos.x + Math.cos(angle + Math.PI / 4) * loopRadius;
  const cp1y = portPos.y + Math.sin(angle + Math.PI / 4) * loopRadius;
  const cp2x = portPos.x + Math.cos(angle - Math.PI / 4) * loopRadius;
  const cp2y = portPos.y + Math.sin(angle - Math.PI / 4) * loopRadius;
  
  return `M ${portPos.x} ${portPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${portPos.x} ${portPos.y}`;
}

/**
 * Handle parallel connections between same modules
 * Offset paths to prevent overlap
 */
export function calculateParallelPath(
  basePath: string,
  index: number,
  totalParallel: number
): string {
  if (totalParallel <= 1) return basePath;
  
  // Simple offset for parallel paths
  const offset = (index - (totalParallel - 1) / 2) * 10;
  
  // Offset control points perpendicular to the path direction
  // This is a simplified version - real implementation would analyze the path
  return basePath.replace(
    /C\s*([\d.-]+)\s+([\d.-]+),\s*([\d.-]+)\s+([\d.-]+),\s*([\d.-]+)\s+([\d.-]+)/g,
    (_match: string, cp1x: string, cp1y: string, cp2x: string, cp2y: string, endx: string, endy: string) => {
      return `C ${parseFloat(cp1x)} ${parseFloat(cp1y) + offset}, ${parseFloat(cp2x)} ${parseFloat(cp2y) + offset}, ${parseFloat(endx)} ${parseFloat(endy) + offset}`;
    }
  );
}

// ============================================================================
// Path Length Calculation
// ============================================================================

/**
 * Estimate path length (approximation for bezier curves)
 */
export function estimatePathLength(pathData: string): number {
  // Simple approach: count coordinate pairs and estimate based on bounding box
  const coords: number[] = [];
  const regex = /-?[\d.]+/g;
  let match;
  
  while ((match = regex.exec(pathData)) !== null) {
    coords.push(parseFloat(match[0]));
  }
  
  if (coords.length < 4) return 0;
  
  // Find bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < coords.length; i += 2) {
    const x = coords[i];
    const y = coords[i + 1];
    if (!isNaN(x) && !isNaN(y)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  
  // Use bounding box diagonal as estimate (not perfect but reasonable)
  const width = maxX - minX;
  const height = maxY - minY;
  return Math.sqrt(width * width + height * height);
}

/**
 * Get path bounds (bounding box)
 */
export function getPathBounds(pathData: string): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  const coords: number[] = [];
  const regex = /-?[\d.]+/g;
  let match;
  
  while ((match = regex.exec(pathData)) !== null) {
    coords.push(parseFloat(match[0]));
  }
  
  if (coords.length < 4) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < coords.length; i += 2) {
    const x = coords[i];
    const y = coords[i + 1];
    if (!isNaN(x) && !isNaN(y)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  
  return { minX, minY, maxX, maxY };
}

// ============================================================================
// Path Simplification
// ============================================================================

/**
 * Simplify a path by reducing points while maintaining shape
 */
export function simplifyPath(pathData: string, _tolerance: number = 1): string {
  // For now, return original path
  // Full implementation would use Ramer-Douglas-Peucker algorithm
  return pathData;
}

/**
 * Smooth a path by averaging nearby control points
 */
export function smoothPath(pathData: string, _iterations: number = 1): string {
  // For now, return original path
  // Full implementation would use Catmull-Rom spline conversion
  return pathData;
}

// ============================================================================
// Export for use in components
// ============================================================================

export default {
  calculateBezierPath,
  calculateQuadraticPath,
  calculateConnectionPathBetweenModules,
  getPortWorldPosition,
  getPortConnectionAngle,
  getEnergyFlowAnimation,
  calculateFlowDashoffset,
  isValidPath,
  calculateLoopbackPath,
  calculateParallelPath,
  estimatePathLength,
  getPathBounds,
  simplifyPath,
  smoothPath,
};
