import { PlacedModule } from '../types';
import { MODULE_SIZES } from '../types';

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 600;

/**
 * Get the bounding box for a set of modules
 */
export function calculateAlignmentBounds(modules: PlacedModule[]): Bounds {
  if (modules.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  modules.forEach((module) => {
    const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
    const moduleMinX = module.x;
    const moduleMaxX = module.x + size.width;
    const moduleMinY = module.y;
    const moduleMaxY = module.y + size.height;

    minX = Math.min(minX, moduleMinX);
    maxX = Math.max(maxX, moduleMaxX);
    minY = Math.min(minY, moduleMinY);
    maxY = Math.max(maxY, moduleMaxY);
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

/**
 * Get the size of a module
 */
function getModuleSize(type: PlacedModule['type']): { width: number; height: number } {
  return MODULE_SIZES[type] || { width: 80, height: 80 };
}

/**
 * Clamp a position to stay within canvas bounds
 */
function clampPosition(
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  canvasWidth = DEFAULT_CANVAS_WIDTH, 
  canvasHeight = DEFAULT_CANVAS_HEIGHT
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(canvasWidth - width, x)),
    y: Math.max(0, Math.min(canvasHeight - height, y)),
  };
}

/**
 * Align modules to the left (all X coordinates = leftmost module's X)
 */
export function alignLeft(
  modules: PlacedModule[], 
  canvasWidth = DEFAULT_CANVAS_WIDTH, 
  canvasHeight = DEFAULT_CANVAS_HEIGHT
): PlacedModule[] {
  const bounds = calculateAlignmentBounds(modules);
  return modules.map((module) => {
    const size = getModuleSize(module.type);
    const clamped = clampPosition(bounds.minX, module.y, size.width, size.height, canvasWidth, canvasHeight);
    return { ...module, x: clamped.x };
  });
}

/**
 * Align modules to the center (all X coordinates at the median X of selection)
 */
export function alignCenter(
  modules: PlacedModule[], 
  canvasWidth = DEFAULT_CANVAS_WIDTH, 
  canvasHeight = DEFAULT_CANVAS_HEIGHT
): PlacedModule[] {
  const bounds = calculateAlignmentBounds(modules);
  const sortedByX = [...modules].sort((a, b) => a.x - b.x);
  const medianModule = sortedByX[Math.floor(sortedByX.length / 2)];
  const targetX = medianModule.x;

  return modules.map((module) => {
    const size = getModuleSize(module.type);
    const offset = module.x - bounds.centerX;
    const newX = targetX + offset;
    const clamped = clampPosition(newX, module.y, size.width, size.height, canvasWidth, canvasHeight);
    return { ...module, x: clamped.x };
  });
}

/**
 * Align modules to the right (all X coordinates = rightmost module's X minus its width)
 */
export function alignRight(
  modules: PlacedModule[], 
  canvasWidth = DEFAULT_CANVAS_WIDTH, 
  canvasHeight = DEFAULT_CANVAS_HEIGHT
): PlacedModule[] {
  const bounds = calculateAlignmentBounds(modules);
  const targetX = bounds.maxX;

  return modules.map((module) => {
    const size = getModuleSize(module.type);
    const newX = targetX - size.width;
    const clamped = clampPosition(newX, module.y, size.width, size.height, canvasWidth, canvasHeight);
    return { ...module, x: clamped.x };
  });
}

/**
 * Align modules to the top (all Y coordinates = topmost module's Y)
 */
export function alignTop(
  modules: PlacedModule[], 
  canvasWidth = DEFAULT_CANVAS_WIDTH, 
  canvasHeight = DEFAULT_CANVAS_HEIGHT
): PlacedModule[] {
  const bounds = calculateAlignmentBounds(modules);
  return modules.map((module) => {
    const size = getModuleSize(module.type);
    const clamped = clampPosition(module.x, bounds.minY, size.width, size.height, canvasWidth, canvasHeight);
    return { ...module, y: clamped.y };
  });
}

/**
 * Align modules to the middle (all Y coordinates at the median Y of selection)
 */
export function alignMiddle(
  modules: PlacedModule[], 
  canvasWidth = DEFAULT_CANVAS_WIDTH, 
  canvasHeight = DEFAULT_CANVAS_HEIGHT
): PlacedModule[] {
  const bounds = calculateAlignmentBounds(modules);
  const sortedByY = [...modules].sort((a, b) => a.y - b.y);
  const medianModule = sortedByY[Math.floor(sortedByY.length / 2)];
  const targetY = medianModule.y;

  return modules.map((module) => {
    const size = getModuleSize(module.type);
    const offset = module.y - bounds.centerY;
    const newY = targetY + offset;
    const clamped = clampPosition(module.x, newY, size.width, size.height, canvasWidth, canvasHeight);
    return { ...module, y: clamped.y };
  });
}

/**
 * Align modules to the bottom (all Y coordinates = bottommost module's Y minus its height)
 */
export function alignBottom(
  modules: PlacedModule[], 
  canvasWidth = DEFAULT_CANVAS_WIDTH, 
  canvasHeight = DEFAULT_CANVAS_HEIGHT
): PlacedModule[] {
  const bounds = calculateAlignmentBounds(modules);
  const targetY = bounds.maxY;

  return modules.map((module) => {
    const size = getModuleSize(module.type);
    const newY = targetY - size.height;
    const clamped = clampPosition(module.x, newY, size.width, size.height, canvasWidth, canvasHeight);
    return { ...module, y: clamped.y };
  });
}

/**
 * Apply alignment to modules
 */
export function alignModules(
  modules: PlacedModule[],
  alignment: AlignmentType,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT
): PlacedModule[] {
  switch (alignment) {
    case 'left':
      return alignLeft(modules, canvasWidth, canvasHeight);
    case 'center':
      return alignCenter(modules, canvasWidth, canvasHeight);
    case 'right':
      return alignRight(modules, canvasWidth, canvasHeight);
    case 'top':
      return alignTop(modules, canvasWidth, canvasHeight);
    case 'middle':
      return alignMiddle(modules, canvasWidth, canvasHeight);
    case 'bottom':
      return alignBottom(modules, canvasWidth, canvasHeight);
    default:
      return modules;
  }
}
