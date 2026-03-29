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

/**
 * Get the size of a module
 */
function getModuleSize(type: PlacedModule['type']): { width: number; height: number } {
  return MODULE_SIZES[type] || { width: 80, height: 80 };
}

/**
 * Auto-arrange modules in a grid layout
 * Preserves relative connections by calculating center positions
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
  const columnWidth = maxModuleWidth + cfg.moduleGapX;
  const rowHeight = maxModuleHeight + cfg.moduleGapY;
  const columnsCount = Math.max(1, Math.min(cfg.maxColumns, Math.floor(availableWidth / columnWidth)));
  const rowsCount = Math.ceil(modules.length / columnsCount);
  
  // Calculate if the grid fits
  const gridWidth = columnsCount * columnWidth - cfg.moduleGapX;
  const gridHeight = rowsCount * rowHeight - cfg.moduleGapY;
  
  // Scale down if needed to fit in container
  let scale = 1;
  if (gridWidth > availableWidth) {
    scale = Math.min(1, availableWidth / gridWidth);
  }
  if (gridHeight > availableHeight) {
    scale = Math.min(scale, availableHeight / gridHeight);
  }
  
  // Calculate final layout parameters
  const finalColumnWidth = (maxModuleWidth + cfg.moduleGapX) * scale;
  const finalRowHeight = (maxModuleHeight + cfg.moduleGapY) * scale;
  
  // Calculate starting position to center the grid
  const totalGridWidth = columnsCount * finalColumnWidth - cfg.moduleGapX * scale;
  const totalGridHeight = rowsCount * finalRowHeight - cfg.moduleGapY * scale;
  const startX = (cfg.containerWidth - totalGridWidth) / 2;
  const startY = (cfg.containerHeight - totalGridHeight) / 2;
  
  // Calculate new module positions
  const newModules = modules.map((module, index) => {
    const col = index % columnsCount;
    const row = Math.floor(index / columnsCount);
    
    const size = getModuleSize(module.type);
    const scaledWidth = size.width * scale;
    const scaledHeight = size.height * scale;
    
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
  
  // Calculate radius based on number of modules
  const padding = cfg.padding;
  const minRadius = 100;
  const maxRadius = Math.min(centerX, centerY) - padding;
  const radius = Math.max(minRadius, Math.min(maxRadius, modules.length * 30));
  
  // Calculate angle step
  const angleStep = (2 * Math.PI) / modules.length;
  const startAngle = -Math.PI / 2; // Start from top
  
  // Position modules in a circle
  const newModules = modules.map((module, index) => {
    const angle = startAngle + index * angleStep;
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
  
  // Calculate total width needed
  let totalWidth = 0;
  modules.forEach((module) => {
    const size = getModuleSize(module.type);
    totalWidth += size.width + cfg.moduleGapX;
  });
  totalWidth -= cfg.moduleGapX; // Remove last gap
  
  // Calculate starting X to center
  const startX = (cfg.containerWidth - totalWidth) / 2;
  const centerY = cfg.containerHeight / 2;
  
  // Position modules in a line
  let currentX = startX;
  const newModules = modules.map((module) => {
    const size = getModuleSize(module.type);
    const y = centerY - size.height / 2;
    const x = currentX;
    currentX += size.width + cfg.moduleGapX;
    
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
  
  // Calculate offsets
  const offsetX = 30;
  const offsetY = 30;
  
  // Calculate starting position
  const startX = cfg.padding;
  const startY = cfg.padding;
  
  // Position modules in a cascade
  const newModules = modules.map((module, index) => {
    const x = startX + index * offsetX;
    const y = startY + index * offsetY;
    
    // Clamp to container bounds
    const size = getModuleSize(module.type);
    const clampedX = Math.min(x, cfg.containerWidth - size.width - cfg.padding);
    const clampedY = Math.min(y, cfg.containerHeight - size.height - cfg.padding);
    
    return {
      ...module,
      x: Math.round(clampedX),
      y: Math.round(clampedY),
    };
  });
  
  return {
    modules: newModules,
    connections,
  };
}
