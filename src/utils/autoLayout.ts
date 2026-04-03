import { PlacedModule, MODULE_SIZES } from '../types';
import { Connection } from '../types';

interface LayoutConfig {
  containerWidth: number;
  containerHeight: number;
  padding: number;
  moduleGapX: number;
  moduleGapY: number;
  maxColumns: number;
}

const DEFAULT_CONFIG: LayoutConfig = {
  containerWidth: 800,
  containerHeight: 600,
  padding: 50,
  moduleGapX: 30,
  moduleGapY: 30,
  maxColumns: 4,
};

// Minimum spacing between modules (AC-119-002 requirement)
const MIN_SPACING = 20;

// Layout type for auto-arrangement
export type LayoutType = 'grid' | 'line' | 'circle' | 'cascade';

/**
 * Get the size of a module
 */
function getModuleSize(type: PlacedModule['type']): { width: number; height: number } {
  return MODULE_SIZES[type] || { width: 80, height: 80 };
}

/**
 * Auto-arrange modules in a grid layout
 * Preserves relative connections by calculating center positions
 * Ensures minimum 20px spacing between components (AC-119-002)
 */
export function autoArrange(
  modules: PlacedModule[],
  connections: Connection[],
  config: Partial<LayoutConfig> = {}
): { modules: PlacedModule[]; connections: Connection[] } {
  if (modules.length === 0) {
    return { modules: [], connections: [] };
  }

  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  // Ensure minimum gap is at least MIN_SPACING
  const effectiveGapX = Math.max(cfg.moduleGapX, MIN_SPACING);
  const effectiveGapY = Math.max(cfg.moduleGapY, MIN_SPACING);
  
  // Calculate available space
  const availableWidth = cfg.containerWidth - cfg.padding * 2;
  const availableHeight = cfg.containerHeight - cfg.padding * 2;
  
  // Calculate max module dimensions
  let maxModuleWidth = 0;
  let maxModuleHeight = 0;
  modules.forEach((module) => {
    const size = getModuleSize(module.type);
    maxModuleWidth = Math.max(maxModuleWidth, size.width);
    maxModuleHeight = Math.max(maxModuleHeight, size.height);
  });
  
  // Calculate grid dimensions
  const columnWidth = maxModuleWidth + effectiveGapX;
  const rowHeight = maxModuleHeight + effectiveGapY;
  const columnsCount = Math.max(1, Math.min(cfg.maxColumns, Math.floor(availableWidth / columnWidth)));
  const rowsCount = Math.ceil(modules.length / columnsCount);
  
  // Calculate if the grid fits
  const gridWidth = columnsCount * columnWidth - effectiveGapX;
  const gridHeight = rowsCount * rowHeight - effectiveGapY;
  
  // Scale down if needed to fit in container
  let scale = 1;
  if (gridWidth > availableWidth) {
    scale = Math.min(1, availableWidth / gridWidth);
  }
  if (gridHeight > availableHeight) {
    scale = Math.min(scale, availableHeight / gridHeight);
  }
  
  // Ensure scaled gap is at least MIN_SPACING
  const scaledGapX = effectiveGapX * scale;
  const scaledGapY = effectiveGapY * scale;
  const finalGapX = Math.max(scaledGapX, MIN_SPACING);
  const finalGapY = Math.max(scaledGapY, MIN_SPACING);
  
  // Calculate final layout parameters
  const finalColumnWidth = (maxModuleWidth + finalGapX);
  const finalRowHeight = (maxModuleHeight + finalGapY);
  
  // Calculate starting position to center the grid
  const totalGridWidth = columnsCount * finalColumnWidth - finalGapX;
  const totalGridHeight = rowsCount * finalRowHeight - finalGapY;
  const startX = (cfg.containerWidth - totalGridWidth) / 2;
  const startY = (cfg.containerHeight - totalGridHeight) / 2;
  
  // Calculate new module positions
  const newModules = modules.map((module, index) => {
    const col = index % columnsCount;
    const row = Math.floor(index / columnsCount);
    
    const size = getModuleSize(module.type);
    // Scale the module itself, but ensure spacing is maintained
    const scaleToFit = scale;
    const scaledWidth = size.width * scaleToFit;
    const scaledHeight = size.height * scaleToFit;
    
    // Position at the edge of the circle (minus half the module size)
    const x = startX + col * finalColumnWidth + (finalColumnWidth - scaledWidth) / 2;
    const y = startY + row * finalRowHeight + (finalRowHeight - scaledHeight) / 2;
    
    return {
      ...module,
      x: Math.round(x),
      y: Math.round(y),
    };
  });
  
  return {
    modules: newModules,
    connections,
  };
}

/**
 * Auto-arrange with circular layout (for special cases)
 * Ensures minimum 20px spacing between components (AC-119-002)
 */
export function autoArrangeCircular(
  modules: PlacedModule[],
  connections: Connection[],
  config: Partial<LayoutConfig> = {}
): { modules: PlacedModule[]; connections: Connection[] } {
  if (modules.length === 0) {
    return { modules: [], connections: [] };
  }
  
  if (modules.length === 1) {
    // Center single module
    const size = getModuleSize(modules[0].type);
    return {
      modules: [{
        ...modules[0],
        x: Math.round((config.containerWidth || 800) / 2 - size.width / 2),
        y: Math.round((config.containerHeight || 600) / 2 - size.height / 2),
      }],
      connections,
    };
  }

  const cfg = { ...DEFAULT_CONFIG, ...config };
  const centerX = cfg.containerWidth / 2;
  const centerY = cfg.containerHeight / 2;
  
  // Find max module size for spacing calculation
  let maxModuleSize = 0;
  modules.forEach((module) => {
    const size = getModuleSize(module.type);
    maxModuleSize = Math.max(maxModuleSize, Math.max(size.width, size.height));
  });
  
  // Calculate minimum radius needed for minimum spacing between adjacent modules
  // Arc length between adjacent modules should be at least (maxModuleSize + MIN_SPACING)
  const arcLengthPerModule = (maxModuleSize + MIN_SPACING);
  const minRadiusForSpacing = arcLengthPerModule * modules.length / (2 * Math.PI);
  
  // Calculate available radius
  const padding = cfg.padding;
  const availableRadius = Math.min(centerX - padding, centerY - padding);
  
  // Use the larger of the required radius for spacing or a reasonable minimum
  const radius = Math.max(minRadiusForSpacing, availableRadius * 0.8);
  
  // Calculate angle step
  const angleStep = (2 * Math.PI) / modules.length;
  const startAngle = -Math.PI / 2; // Start from top
  
  // Position modules in a circle
  const newModules = modules.map((module, moduleIndex) => {
    const angle = startAngle + moduleIndex * angleStep;
    const size = getModuleSize(module.type);
    
    // Position at the edge of the circle (minus half the module size)
    const x = centerX + Math.cos(angle) * radius - size.width / 2;
    const y = centerY + Math.sin(angle) * radius - size.height / 2;
    
    return {
      ...module,
      x: Math.round(x),
      y: Math.round(y),
    };
  });
  
  return {
    modules: newModules,
    connections,
  };
}

/**
 * Auto-arrange with line layout (horizontal)
 * Ensures minimum 20px spacing between components (AC-119-002)
 * Uses multi-row arrangement if single row doesn't fit
 */
export function autoArrangeLine(
  modules: PlacedModule[],
  connections: Connection[],
  config: Partial<LayoutConfig> = {}
): { modules: PlacedModule[]; connections: Connection[] } {
  if (modules.length === 0) {
    return { modules: [], connections: [] };
  }
  
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  // Ensure minimum gap is at least MIN_SPACING
  const effectiveGapX = Math.max(cfg.moduleGapX, MIN_SPACING);
  
  // Calculate available space
  const availableWidth = cfg.containerWidth - cfg.padding * 2;
  
  // Calculate max module dimensions
  let maxModuleWidth = 0;
  let maxModuleHeight = 0;
  modules.forEach((module) => {
    const size = getModuleSize(module.type);
    maxModuleWidth = Math.max(maxModuleWidth, size.width);
    maxModuleHeight = Math.max(maxModuleHeight, size.height);
  });
  
  // Calculate how many modules can fit in one row
  const moduleWithGap = maxModuleWidth + effectiveGapX;
  const modulesPerRow = Math.max(1, Math.floor(availableWidth / moduleWithGap));
  
  // If all modules don't fit in one row, use grid layout
  if (modules.length > modulesPerRow) {
    return autoArrange(modules, connections, config);
  }
  
  // Calculate total width needed for all modules
  const totalModuleWidth = modules.reduce((sum, module) => {
    const size = getModuleSize(module.type);
    return sum + size.width;
  }, 0);
  
  // Total width including gaps
  const totalWidthWithGaps = totalModuleWidth + effectiveGapX * (modules.length - 1);
  
  // Scale down if needed to fit
  let scale = 1;
  if (totalWidthWithGaps > availableWidth) {
    // Calculate minimum scale that would still allow MIN_SPACING
    const minScale = (availableWidth - effectiveGapX * (modules.length - 1)) / totalModuleWidth;
    const maxAllowedScale = availableWidth / totalWidthWithGaps;
    scale = Math.min(1, Math.max(maxAllowedScale, minScale));
  }
  
  // Final gap after scaling (ensure minimum spacing)
  const finalGapX = Math.max(effectiveGapX * scale, MIN_SPACING);
  
  // Recalculate total width with final scale and gap
  const scaledModuleWidths = modules.map(module => getModuleSize(module.type).width * scale);
  const scaledTotalWidth = scaledModuleWidths.reduce((a, b) => a + b, 0) + finalGapX * (modules.length - 1);
  
  // Calculate starting X to center
  const startX = (cfg.containerWidth - scaledTotalWidth) / 2;
  const centerY = (cfg.containerHeight - maxModuleHeight * scale) / 2;
  
  // Position modules in a line
  let currentX = startX;
  const newModules = modules.map((module) => {
    const size = getModuleSize(module.type);
    const scaledWidth = size.width * scale;
    const scaledHeight = size.height * scale;
    const y = centerY - (scaledHeight - maxModuleHeight * scale) / 2;
    const x = currentX;
    currentX += scaledWidth + finalGapX;
    
    return {
      ...module,
      x: Math.round(x),
      y: Math.round(y),
    };
  });
  
  return {
    modules: newModules,
    connections,
  };
}

/**
 * Auto-arrange with cascade layout (staggered)
 * Ensures minimum 20px spacing between components (AC-119-002)
 * Falls back to grid layout if cascade doesn't fit
 */
export function autoArrangeCascade(
  modules: PlacedModule[],
  connections: Connection[],
  config: Partial<LayoutConfig> = {}
): { modules: PlacedModule[]; connections: Connection[] } {
  if (modules.length === 0) {
    return { modules: [], connections: [] };
  }
  
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  // Find max module size for proper offset calculation
  let maxModuleWidth = 0;
  let maxModuleHeight = 0;
  modules.forEach((module) => {
    const size = getModuleSize(module.type);
    maxModuleWidth = Math.max(maxModuleWidth, size.width);
    maxModuleHeight = Math.max(maxModuleHeight, size.height);
  });
  
  // Calculate required offset to prevent overlap with minimum spacing
  const requiredOffsetY = maxModuleHeight + MIN_SPACING;
  const requiredOffsetX = maxModuleWidth + MIN_SPACING;
  
  // Calculate available space
  const availableWidth = cfg.containerWidth - cfg.padding * 2;
  const availableHeight = cfg.containerHeight - cfg.padding * 2;
  
  // Calculate total required space
  const totalRequiredWidth = modules.length * requiredOffsetX;
  const totalRequiredHeight = modules.length * requiredOffsetY;
  
  // Check if cascade fits within container
  const cascadeFits = totalRequiredWidth <= availableWidth && totalRequiredHeight <= availableHeight;
  
  if (!cascadeFits) {
    // Fall back to grid layout which handles scaling
    return autoArrange(modules, connections, config);
  }
  
  // Calculate starting position
  const startX = cfg.padding;
  const startY = cfg.padding;
  
  // Position modules in a cascade
  const newModules = modules.map((module, moduleIndex) => {
    const x = startX + moduleIndex * requiredOffsetX;
    const y = startY + moduleIndex * requiredOffsetY;
    
    return {
      ...module,
      x: Math.round(x),
      y: Math.round(y),
    };
  });
  
  return {
    modules: newModules,
    connections,
  };
}
