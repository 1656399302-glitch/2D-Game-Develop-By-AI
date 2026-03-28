import { v4 as uuidv4 } from 'uuid';
import { PlacedModule, ModuleType, Connection, MODULE_SIZES, MODULE_PORT_CONFIGS, Port } from '../types';
import { calculateConnectionPath } from './connectionEngine';

export interface RandomGeneratorConfig {
  minModules: number;
  maxModules: number;
  minSpacing: number;
  canvasWidth: number;
  canvasHeight: number;
  padding: number;
}

export const DEFAULT_CONFIG: RandomGeneratorConfig = {
  minModules: 2,
  maxModules: 6,
  minSpacing: 80, // Minimum 80px between module centers
  canvasWidth: 800,
  canvasHeight: 600,
  padding: 100,
};

// Module types available for random generation
const AVAILABLE_MODULE_TYPES: ModuleType[] = [
  'core-furnace',
  'energy-pipe',
  'gear',
  'rune-node',
  'shield-shell',
  'trigger-switch',
  'output-array',
];

/**
 * Calculate the center point of a module
 */
const getModuleCenter = (module: PlacedModule): { x: number; y: number } => {
  const size = MODULE_SIZES[module.type];
  return {
    x: module.x + size.width / 2,
    y: module.y + size.height / 2,
  };
};

/**
 * Calculate distance between two module centers
 */
const distanceBetween = (a: PlacedModule, b: PlacedModule): number => {
  const centerA = getModuleCenter(a);
  const centerB = getModuleCenter(b);
  return Math.sqrt(
    Math.pow(centerA.x - centerB.x, 2) + Math.pow(centerA.y - centerB.y, 2)
  );
};

/**
 * Get default ports for a module type
 */
const getDefaultPorts = (type: ModuleType): Port[] => {
  const config = MODULE_PORT_CONFIGS[type];
  if (!config) {
    return [
      { id: `${type}-input`, type: 'input', position: { x: 25, y: 40 } },
      { id: `${type}-output`, type: 'output', position: { x: 75, y: 40 } },
    ];
  }
  return [
    { id: `${type}-input`, type: 'input', position: config.input },
    { id: `${type}-output`, type: 'output', position: config.output },
  ];
};

/**
 * Check if a module position is valid (no overlaps, minimum spacing between centers)
 */
const isValidPosition = (
  newModule: PlacedModule,
  existingModules: PlacedModule[],
  minSpacing: number
): boolean => {
  const newCenter = getModuleCenter(newModule);
  
  for (const existing of existingModules) {
    const existingCenter = getModuleCenter(existing);
    const distance = Math.sqrt(
      Math.pow(newCenter.x - existingCenter.x, 2) + Math.pow(newCenter.y - existingCenter.y, 2)
    );
    
    if (distance < minSpacing) {
      return false;
    }
  }
  return true;
};

/**
 * Generate a random position within bounds, ensuring minimum spacing
 * Uses a grid-based approach for more reliable placement
 */
const findValidPosition = (
  moduleType: ModuleType,
  existingModules: PlacedModule[],
  config: RandomGeneratorConfig,
  maxAttempts: number = 500
): { x: number; y: number } | null => {
  const size = MODULE_SIZES[moduleType];
  const usableWidth = config.canvasWidth - size.width - 2 * config.padding;
  const usableHeight = config.canvasHeight - size.height - 2 * config.padding;
  
  // First, try grid-based placement for reliable spacing
  const gridSpacing = config.minSpacing * 1.2; // Slightly more than minimum to ensure spacing
  const cols = Math.floor(usableWidth / gridSpacing);
  const rows = Math.floor(usableHeight / gridSpacing);
  
  // Create list of potential grid positions
  const gridPositions: { x: number; y: number }[] = [];
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const x = config.padding + col * gridSpacing + Math.random() * 20;
      const y = config.padding + row * gridSpacing + Math.random() * 20;
      gridPositions.push({ x, y });
    }
  }
  
  // Shuffle grid positions
  for (let i = gridPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gridPositions[i], gridPositions[j]] = [gridPositions[j], gridPositions[i]];
  }
  
  // Try grid positions first
  for (const pos of gridPositions) {
    const candidateModule: PlacedModule = {
      id: uuidv4(),
      instanceId: uuidv4(),
      type: moduleType,
      x: pos.x,
      y: pos.y,
      rotation: 0,
      scale: 1,
      flipped: false,
      ports: getDefaultPorts(moduleType),
    };
    
    if (isValidPosition(candidateModule, existingModules, config.minSpacing)) {
      return pos;
    }
  }
  
  // Fallback to random attempts
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = config.padding + Math.random() * usableWidth;
    const y = config.padding + Math.random() * usableHeight;
    
    const candidateModule: PlacedModule = {
      id: uuidv4(),
      instanceId: uuidv4(),
      type: moduleType,
      x,
      y,
      rotation: 0,
      scale: 1,
      flipped: false,
      ports: getDefaultPorts(moduleType),
    };
    
    if (isValidPosition(candidateModule, existingModules, config.minSpacing)) {
      return { x, y };
    }
  }
  
  return null;
};

/**
 * Find valid positions for all modules using a greedy approach
 */
const findValidModulePositions = (
  moduleTypes: ModuleType[],
  config: RandomGeneratorConfig
): PlacedModule[] => {
  const modules: PlacedModule[] = [];
  
  // Sort modules by size (larger modules first) for better placement
  const sortedTypes = [...moduleTypes].sort((a, b) => {
    const sizeA = MODULE_SIZES[a].width * MODULE_SIZES[a].height;
    const sizeB = MODULE_SIZES[b].width * MODULE_SIZES[b].height;
    return sizeB - sizeA;
  });
  
  for (const type of sortedTypes) {
    const position = findValidPosition(type, modules, config, 500);
    
    if (position) {
      modules.push({
        id: uuidv4(),
        instanceId: uuidv4(),
        type,
        x: position.x,
        y: position.y,
        rotation: 0,
        scale: 1,
        flipped: false,
        ports: getDefaultPorts(type),
      });
    } else {
      // If we can't place a module, skip it rather than placing it incorrectly
      console.warn(`Could not place module of type ${type}, skipping`);
    }
  }
  
  return modules;
};

/**
 * Create connections between modules
 * Ensures at least one connection if there are 2+ modules
 */
const createConnections = (modules: PlacedModule[]): Connection[] => {
  if (modules.length < 2) return [];
  
  const connections: Connection[] = [];
  
  // Always create at least one connection
  const firstModule = modules[0];
  const secondModule = modules[1];
  
  // Find compatible ports (one input, one output)
  const firstPorts = firstModule.ports;
  const secondPorts = secondModule.ports;
  
  const firstOutput = firstPorts.find((p) => p.type === 'output') || firstPorts[0];
  const secondInput = secondPorts.find((p) => p.type === 'input') || secondPorts[0];
  
  const pathData = calculateConnectionPath(
    modules,
    firstModule.instanceId,
    firstOutput.id,
    secondModule.instanceId,
    secondInput.id
  );
  
  connections.push({
    id: uuidv4(),
    sourceModuleId: firstModule.instanceId,
    sourcePortId: firstOutput.id,
    targetModuleId: secondModule.instanceId,
    targetPortId: secondInput.id,
    pathData,
  });
  
  // Add more connections randomly (30% chance per additional module pair)
  for (let i = 1; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      if (Math.random() < 0.3) {
        const moduleA = modules[i];
        const moduleB = modules[j];
        
        const portA = moduleA.ports.find((p) => p.type === 'output') || moduleA.ports[0];
        const portB = moduleB.ports.find((p) => p.type === 'input') || moduleB.ports[0];
        
        // Check if connection already exists
        const exists = connections.some(
          (c) =>
            (c.sourceModuleId === moduleA.instanceId && c.targetModuleId === moduleB.instanceId) ||
            (c.sourceModuleId === moduleB.instanceId && c.targetModuleId === moduleA.instanceId)
        );
        
        if (!exists) {
          const path = calculateConnectionPath(
            modules,
            moduleA.instanceId,
            portA.id,
            moduleB.instanceId,
            portB.id
          );
          
          connections.push({
            id: uuidv4(),
            sourceModuleId: moduleA.instanceId,
            sourcePortId: portA.id,
            targetModuleId: moduleB.instanceId,
            targetPortId: portB.id,
            pathData: path,
          });
        }
      }
    }
  }
  
  return connections;
};

/**
 * Generate a random machine
 */
export const generateRandomMachine = (
  config: Partial<RandomGeneratorConfig> = {}
): { modules: PlacedModule[]; connections: Connection[] } => {
  const finalConfig: RandomGeneratorConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Determine number of modules - use fewer for better spacing
  const moduleCount = Math.floor(
    Math.random() * (finalConfig.maxModules - finalConfig.minModules + 1)
  ) + finalConfig.minModules;
  
  // Ensure at least 2 modules for valid connections
  const actualCount = Math.max(2, moduleCount);
  
  // Select random module types
  const moduleTypes: ModuleType[] = [];
  for (let i = 0; i < actualCount; i++) {
    moduleTypes.push(AVAILABLE_MODULE_TYPES[Math.floor(Math.random() * AVAILABLE_MODULE_TYPES.length)]);
  }
  
  // Ensure there's at least one core furnace
  if (!moduleTypes.includes('core-furnace') && Math.random() < 0.5) {
    moduleTypes[0] = 'core-furnace';
  }
  
  // Find valid positions for all modules
  const modules = findValidModulePositions(moduleTypes, finalConfig);
  
  // Create connections
  const connections = createConnections(modules);
  
  return { modules, connections };
};

/**
 * Validate that a generated machine meets constraints
 */
export const validateGeneratedMachine = (
  modules: PlacedModule[],
  connections: Connection[],
  minSpacing: number = 80
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check minimum spacing (center-to-center distance)
  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      const dist = distanceBetween(modules[i], modules[j]);
      if (dist < minSpacing) {
        errors.push(`Modules ${i} and ${j} are too close: ${dist.toFixed(1)}px < ${minSpacing}px`);
      }
    }
  }
  
  // Check connection validity for 2+ modules
  if (modules.length >= 2 && connections.length < 1) {
    errors.push(`Machine has ${modules.length} modules but no connections`);
  }
  
  // Validate connections reference valid modules
  for (const conn of connections) {
    const sourceValid = modules.some((m) => m.instanceId === conn.sourceModuleId);
    const targetValid = modules.some((m) => m.instanceId === conn.targetModuleId);
    
    if (!sourceValid || !targetValid) {
      errors.push(`Connection references invalid module`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Generate multiple random machines and validate them
 */
export const generateAndValidateMachines = (
  count: number,
  config: Partial<RandomGeneratorConfig> = {}
): { modules: PlacedModule[]; connections: Connection[]; validation: { valid: boolean; errors: string[] } }[] => {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    const { modules, connections } = generateRandomMachine(config);
    const validation = validateGeneratedMachine(modules, connections, config.minSpacing || DEFAULT_CONFIG.minSpacing);
    results.push({ modules, connections, validation });
  }
  
  return results;
};
