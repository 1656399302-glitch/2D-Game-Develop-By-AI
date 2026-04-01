/**
 * Enhanced Random Generator for Arcane Machine Codex Workshop
 * 
 * Features:
 * - Themed presets (Balanced, Offensive, Defensive, Arcane Focus, etc.)
 * - Complexity controls (module count, connection density)
 * - Aesthetic validation (collision check, energy flow, valid connections)
 * - Theme-based module selection with faction variants
 * 
 * Round 78 Edge Case Handling:
 * - Fixed module count when minModules === maxModules
 * - Minimum 1 connection even at low density
 * - Fallback core module for empty canvas generation
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  PlacedModule, 
  ModuleType, 
  Connection, 
  MODULE_SIZES, 
  MODULE_PORT_CONFIGS, 
  Port, 
  PortType 
} from '../types';
import { calculateConnectionPath } from './connectionEngine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type GenerationTheme = 
  | 'balanced' 
  | 'offensive' 
  | 'defensive' 
  | 'arcane_focus'
  | 'void_chaos'
  | 'inferno_forge'
  | 'storm_surge'
  | 'stellar_harmony'
  | 'temporal_focus';

export type ConnectionDensity = 'low' | 'medium' | 'high';

export interface RandomGeneratorConfig {
  minModules: number;
  maxModules: number;
  minSpacing: number;
  canvasWidth: number;
  canvasHeight: number;
  padding: number;
}

export interface EnhancedGeneratorConfig extends RandomGeneratorConfig {
  theme: GenerationTheme;
  connectionDensity: ConnectionDensity;
  useFactionVariants: boolean;
}

export interface GenerationResult {
  modules: PlacedModule[];
  connections: Connection[];
  validation: ValidationResult;
  theme: GenerationTheme;
  complexity: {
    moduleCount: number;
    connectionCount: number;
    connectionDensity: number;
  };
  attempts: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  hasCore: boolean;
  hasOutput: boolean;
  hasValidEnergyFlow: boolean;
  noOverlaps: boolean;
  allConnectionsValid: boolean;
}

export const DEFAULT_CONFIG: RandomGeneratorConfig = {
  minModules: 2,
  maxModules: 6,
  minSpacing: 80,
  canvasWidth: 800,
  canvasHeight: 600,
  padding: 100,
};

export const DEFAULT_ENHANCED_CONFIG: EnhancedGeneratorConfig = {
  ...DEFAULT_CONFIG,
  theme: 'balanced',
  connectionDensity: 'medium',
  useFactionVariants: false,
};

// ============================================================================
// MODULE DEFINITIONS
// ============================================================================

/**
 * Core module types available for random generation
 */
const CORE_MODULE_TYPES: ModuleType[] = [
  'core-furnace',
  'energy-pipe',
  'gear',
  'rune-node',
  'shield-shell',
  'trigger-switch',
  'output-array',
  'amplifier-crystal',
  'stabilizer-core',
  'void-siphon',
  'phase-modulator',
  'resonance-chamber',
  'fire-crystal',
  'lightning-conductor',
];

/**
 * Advanced module types (Round 64)
 */
const ADVANCED_MODULE_TYPES: ModuleType[] = [
  'temporal-distorter',
  'arcane-matrix-grid',
  'ether-infusion-chamber',
];

/**
 * Faction variant module types (requires unlock)
 */
const FACTION_VARIANT_TYPES: ModuleType[] = [
  'void-arcane-gear',
  'inferno-blazing-core',
  'storm-thundering-pipe',
  'stellar-harmonic-crystal',
];

/**
 * Theme to module category mapping
 * Each theme has preferred module types with weights
 */
const THEME_MODULE_PREFERENCES: Record<GenerationTheme, {
  preferred: ModuleType[];
  weights: Partial<Record<ModuleType, number>>;
  minThemePercentage: number;
}> = {
  balanced: {
    preferred: [...CORE_MODULE_TYPES, ...ADVANCED_MODULE_TYPES],
    weights: {
      ...CORE_MODULE_TYPES.reduce((acc, type) => {
        acc[type] = 1.0;
        return acc;
      }, {} as Partial<Record<ModuleType, number>>),
      ...ADVANCED_MODULE_TYPES.reduce((acc, type) => {
        acc[type] = 0.8; // Advanced modules slightly less common in balanced
        return acc;
      }, {} as Partial<Record<ModuleType, number>>),
    },
    minThemePercentage: 0,
  },
  offensive: {
    preferred: ['amplifier-crystal', 'fire-crystal', 'lightning-conductor', 'phase-modulator', 'core-furnace', 'arcane-matrix-grid'],
    weights: {
      'amplifier-crystal': 3.0,
      'fire-crystal': 2.5,
      'lightning-conductor': 2.5,
      'phase-modulator': 2.0,
      'core-furnace': 1.5,
      'arcane-matrix-grid': 2.0,
      'energy-pipe': 1.0,
      'gear': 1.0,
      'rune-node': 1.0,
      'trigger-switch': 1.0,
      'output-array': 0.5,
      'shield-shell': 0.3,
      'stabilizer-core': 0.5,
      'void-siphon': 0.5,
      'resonance-chamber': 0.8,
      'temporal-distorter': 1.5,
      'ether-infusion-chamber': 1.0,
    },
    minThemePercentage: 0.6,
  },
  defensive: {
    preferred: ['shield-shell', 'stabilizer-core', 'void-siphon', 'resonance-chamber', 'core-furnace', 'ether-infusion-chamber'],
    weights: {
      'shield-shell': 3.0,
      'stabilizer-core': 2.5,
      'void-siphon': 2.0,
      'resonance-chamber': 2.0,
      'core-furnace': 1.5,
      'ether-infusion-chamber': 2.5,
      'energy-pipe': 1.0,
      'gear': 1.0,
      'rune-node': 1.0,
      'trigger-switch': 1.0,
      'output-array': 0.5,
      'amplifier-crystal': 0.3,
      'fire-crystal': 0.3,
      'lightning-conductor': 0.3,
      'phase-modulator': 0.5,
      'temporal-distorter': 0.5,
      'arcane-matrix-grid': 0.8,
    },
    minThemePercentage: 0.6,
  },
  arcane_focus: {
    preferred: ['rune-node', 'phase-modulator', 'void-siphon', 'amplifier-crystal', 'resonance-chamber', 'arcane-matrix-grid'],
    weights: {
      'rune-node': 3.0,
      'phase-modulator': 2.5,
      'void-siphon': 2.0,
      'amplifier-crystal': 2.0,
      'resonance-chamber': 2.0,
      'arcane-matrix-grid': 3.0,
      'core-furnace': 1.5,
      'energy-pipe': 1.0,
      'gear': 0.8,
      'shield-shell': 0.8,
      'trigger-switch': 1.0,
      'output-array': 0.5,
      'stabilizer-core': 0.8,
      'fire-crystal': 0.5,
      'lightning-conductor': 0.5,
      'temporal-distorter': 1.5,
      'ether-infusion-chamber': 1.0,
    },
    minThemePercentage: 0.6,
  },
  void_chaos: {
    preferred: ['void-siphon', 'void-arcane-gear', 'phase-modulator', 'rune-node', 'temporal-distorter'],
    weights: {
      'void-siphon': 3.0,
      'void-arcane-gear': 3.0,
      'phase-modulator': 2.0,
      'rune-node': 1.5,
      'temporal-distorter': 2.5,
      'amplifier-crystal': 1.0,
      'core-furnace': 1.0,
      'energy-pipe': 0.8,
      'gear': 0.5,
      'shield-shell': 0.8,
      'trigger-switch': 0.8,
      'output-array': 0.5,
      'stabilizer-core': 1.0,
      'resonance-chamber': 1.0,
      'fire-crystal': 0.3,
      'lightning-conductor': 0.3,
      'arcane-matrix-grid': 1.0,
      'ether-infusion-chamber': 0.8,
    },
    minThemePercentage: 0.5,
  },
  inferno_forge: {
    preferred: ['fire-crystal', 'inferno-blazing-core', 'amplifier-crystal', 'core-furnace', 'ether-infusion-chamber'],
    weights: {
      'fire-crystal': 3.0,
      'inferno-blazing-core': 3.0,
      'amplifier-crystal': 2.0,
      'core-furnace': 2.0,
      'ether-infusion-chamber': 2.5,
      'energy-pipe': 1.0,
      'gear': 1.0,
      'rune-node': 0.8,
      'shield-shell': 0.5,
      'trigger-switch': 1.0,
      'output-array': 0.8,
      'stabilizer-core': 0.5,
      'void-siphon': 0.3,
      'phase-modulator': 0.8,
      'resonance-chamber': 0.8,
      'lightning-conductor': 0.3,
      'temporal-distorter': 0.5,
      'arcane-matrix-grid': 0.8,
    },
    minThemePercentage: 0.5,
  },
  storm_surge: {
    preferred: ['lightning-conductor', 'storm-thundering-pipe', 'amplifier-crystal', 'phase-modulator', 'arcane-matrix-grid'],
    weights: {
      'lightning-conductor': 3.0,
      'storm-thundering-pipe': 3.0,
      'amplifier-crystal': 2.5,
      'phase-modulator': 2.0,
      'arcane-matrix-grid': 2.5,
      'core-furnace': 1.5,
      'energy-pipe': 1.0,
      'gear': 1.0,
      'rune-node': 1.0,
      'shield-shell': 0.5,
      'trigger-switch': 1.0,
      'output-array': 0.8,
      'stabilizer-core': 0.5,
      'void-siphon': 0.5,
      'resonance-chamber': 0.8,
      'fire-crystal': 0.3,
      'temporal-distorter': 1.0,
      'ether-infusion-chamber': 0.8,
    },
    minThemePercentage: 0.5,
  },
  stellar_harmony: {
    preferred: ['stellar-harmonic-crystal', 'rune-node', 'resonance-chamber', 'stabilizer-core', 'ether-infusion-chamber'],
    weights: {
      'stellar-harmonic-crystal': 3.0,
      'rune-node': 2.5,
      'resonance-chamber': 2.5,
      'stabilizer-core': 2.0,
      'ether-infusion-chamber': 3.0,
      'core-furnace': 1.5,
      'energy-pipe': 1.0,
      'gear': 1.0,
      'amplifier-crystal': 1.5,
      'shield-shell': 0.8,
      'trigger-switch': 1.0,
      'output-array': 0.8,
      'void-siphon': 0.5,
      'phase-modulator': 1.0,
      'fire-crystal': 0.3,
      'lightning-conductor': 0.3,
      'temporal-distorter': 0.8,
      'arcane-matrix-grid': 1.5,
    },
    minThemePercentage: 0.5,
  },
  temporal_focus: {
    preferred: ['temporal-distorter', 'arcane-matrix-grid', 'phase-modulator', 'ether-infusion-chamber', 'void-siphon'],
    weights: {
      'temporal-distorter': 4.0,
      'arcane-matrix-grid': 3.0,
      'phase-modulator': 2.0,
      'ether-infusion-chamber': 2.5,
      'void-siphon': 2.0,
      'core-furnace': 1.5,
      'rune-node': 1.5,
      'resonance-chamber': 1.5,
      'amplifier-crystal': 1.0,
      'energy-pipe': 1.0,
      'gear': 0.8,
      'shield-shell': 0.5,
      'trigger-switch': 1.0,
      'output-array': 0.5,
      'stabilizer-core': 0.8,
      'fire-crystal': 0.3,
      'lightning-conductor': 0.3,
    },
    minThemePercentage: 0.5,
  },
};

/**
 * Get all available module types based on configuration
 */
function getAvailableModuleTypes(
  theme: GenerationTheme,
  useFactionVariants: boolean
): ModuleType[] {
  const themePrefs = THEME_MODULE_PREFERENCES[theme];
  let types = [...themePrefs.preferred];
  
  // Add faction variants if allowed and theme matches
  if (useFactionVariants) {
    switch (theme) {
      case 'void_chaos':
        types.push('void-arcane-gear');
        break;
      case 'inferno_forge':
        types.push('inferno-blazing-core');
        break;
      case 'storm_surge':
        types.push('storm-thundering-pipe');
        break;
      case 'stellar_harmony':
        types.push('stellar-harmonic-crystal');
        break;
      default:
        // For balanced/offensive/defensive/arcane, can still use variants but less prioritized
        types = [...types, ...FACTION_VARIANT_TYPES];
    }
  }
  
  // Remove duplicates
  return [...new Set(types)];
}

/**
 * Get weighted random module type based on theme
 */
function getWeightedRandomModuleType(
  availableTypes: ModuleType[],
  weights: Partial<Record<ModuleType, number>>
): ModuleType {
  const totalWeight = availableTypes.reduce((sum, type) => sum + (weights[type] || 1.0), 0);
  let random = Math.random() * totalWeight;
  
  for (const type of availableTypes) {
    random -= weights[type] || 1.0;
    if (random <= 0) {
      return type;
    }
  }
  
  // Fallback to random selection
  return availableTypes[Math.floor(Math.random() * availableTypes.length)];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 25, y: 40 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 75, y: 40 } },
    ];
  }
  
  const ports: Port[] = [];
  const inputConfig = config.input;
  const outputConfig = config.output;
  
  if (Array.isArray(inputConfig)) {
    inputConfig.forEach((pos, idx) => {
      ports.push({ id: `${type}-input-${idx}`, type: 'input' as PortType, position: pos });
    });
  } else {
    ports.push({ id: `${type}-input-0`, type: 'input' as PortType, position: inputConfig });
  }
  
  if (Array.isArray(outputConfig)) {
    outputConfig.forEach((pos, idx) => {
      ports.push({ id: `${type}-output-${idx}`, type: 'output' as PortType, position: pos });
    });
  } else {
    ports.push({ id: `${type}-output-0`, type: 'output' as PortType, position: outputConfig });
  }
  
  return ports;
};

/**
 * Check if a module position is valid (no overlaps)
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
 * Find a valid position for a module
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
  
  // Try grid-based placement first
  const gridSpacing = config.minSpacing * 1.2;
  const cols = Math.floor(usableWidth / gridSpacing);
  const rows = Math.floor(usableHeight / gridSpacing);
  
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
 * Find valid positions for all modules
 */
const findValidModulePositions = (
  moduleTypes: ModuleType[],
  config: RandomGeneratorConfig
): PlacedModule[] => {
  const modules: PlacedModule[] = [];
  
  // Sort modules by size (larger modules first)
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
      console.warn(`Could not place module of type ${type}, skipping`);
    }
  }
  
  return modules;
};

/**
 * Get connection probability based on density setting
 */
const getConnectionProbability = (density: ConnectionDensity): number => {
  switch (density) {
    case 'low': return 0.2;
    case 'medium': return 0.4;
    case 'high': return 0.6;
  }
};

/**
 * Create connections between modules with guaranteed minimum connections
 * Round 78 Edge Cases:
 * - Always creates at least 1 connection (even at low density)
 * - Ensures valid output->input connections
 */
const createConnections = (
  modules: PlacedModule[],
  density: ConnectionDensity
): Connection[] => {
  if (modules.length < 2) return [];
  
  const connections: Connection[] = [];
  
  // ROUND 78 FIX: Always create at least one connection
  // Find modules that can connect (has output and input ports)
  const modulesWithOutput = modules.filter(m => m.ports.some(p => p.type === 'output'));
  const modulesWithInput = modules.filter(m => m.ports.some(p => p.type === 'input'));
  
  if (modulesWithOutput.length === 0 || modulesWithInput.length === 0) {
    return connections;
  }
  
  // Find a valid source (with output) and target (with input)
  let sourceModule = modulesWithOutput[0];
  let targetModule = modulesWithInput.find(m => m.instanceId !== sourceModule.instanceId) || modulesWithInput[0];
  
  // If we need to swap (target has no input, source has no output)
  if (!targetModule.ports.some(p => p.type === 'input')) {
    // Find a module that has both input and output
    const modulesWithBoth = modules.filter(m => 
      m.ports.some(p => p.type === 'input') && m.ports.some(p => p.type === 'output')
    );
    if (modulesWithBoth.length >= 2) {
      sourceModule = modulesWithBoth[0];
      targetModule = modulesWithBoth[1];
    }
  }
  
  const sourcePort = sourceModule.ports.find(p => p.type === 'output') || sourceModule.ports[0];
  const targetPort = targetModule.ports.find(p => p.type === 'input') || targetModule.ports[0];
  
  const pathData = calculateConnectionPath(
    modules,
    sourceModule.instanceId,
    sourcePort.id,
    targetModule.instanceId,
    targetPort.id
  );
  
  connections.push({
    id: uuidv4(),
    sourceModuleId: sourceModule.instanceId,
    sourcePortId: sourcePort.id,
    targetModuleId: targetModule.instanceId,
    targetPortId: targetPort.id,
    pathData,
  });
  
  // ROUND 78 FIX: Always guarantee at least 1 connection above
  // Now add more connections based on density setting
  const probability = getConnectionProbability(density);
  
  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      // Skip if already connected (handles core connection above)
      const alreadyConnected = connections.some(
        c => (c.sourceModuleId === modules[i].instanceId && c.targetModuleId === modules[j].instanceId) ||
             (c.sourceModuleId === modules[j].instanceId && c.targetModuleId === modules[i].instanceId)
      );
      
      if (alreadyConnected) continue;
      
      if (Math.random() < probability) {
        const moduleA = modules[i];
        const moduleB = modules[j];
        
        // Determine direction based on module types
        let sourceM = moduleA;
        let targetM = moduleB;
        
        // Prefer output -> input direction
        const aHasOutput = moduleA.ports.some(p => p.type === 'output');
        const bHasOutput = moduleB.ports.some(p => p.type === 'output');
        
        if (bHasOutput && !aHasOutput) {
          sourceM = moduleB;
          targetM = moduleA;
        }
        
        const sourcePortRef = sourceM.ports.find(p => p.type === 'output') || sourceM.ports[0];
        const targetPortRef = targetM.ports.find(p => p.type === 'input') || targetM.ports[0];
        
        const path = calculateConnectionPath(
          modules,
          sourceM.instanceId,
          sourcePortRef.id,
          targetM.instanceId,
          targetPortRef.id
        );
        
        connections.push({
          id: uuidv4(),
          sourceModuleId: sourceM.instanceId,
          sourcePortId: sourcePortRef.id,
          targetModuleId: targetM.instanceId,
          targetPortId: targetPortRef.id,
          pathData: path,
        });
      }
    }
  }
  
  return connections;
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate a generated machine
 */
export const validateGeneratedMachine = (
  modules: PlacedModule[],
  connections: Connection[],
  minSpacing: number = 80
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for overlaps
  let hasOverlaps = false;
  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      const dist = distanceBetween(modules[i], modules[j]);
      if (dist < minSpacing) {
        errors.push(`Modules ${modules[i].type} and ${modules[j].type} overlap (${dist.toFixed(1)}px < ${minSpacing}px)`);
        hasOverlaps = true;
      }
    }
  }
  
  // Check for core module
  const hasCore = modules.some(m => m.type === 'core-furnace');
  if (!hasCore) {
    warnings.push('No core furnace module present');
  }
  
  // Check for output module
  const hasOutput = modules.some(m => m.type === 'output-array');
  if (!hasOutput) {
    warnings.push('No output array module present');
  }
  
  // Check connection validity
  let allConnectionsValid = true;
  for (const conn of connections) {
    const sourceModule = modules.find(m => m.instanceId === conn.sourceModuleId);
    const targetModule = modules.find(m => m.instanceId === conn.targetModuleId);
    
    if (!sourceModule || !targetModule) {
      errors.push('Connection references invalid module');
      allConnectionsValid = false;
      continue;
    }
    
    const sourcePort = sourceModule.ports.find(p => p.id === conn.sourcePortId);
    const targetPort = targetModule.ports.find(p => p.id === conn.targetPortId);
    
    if (!sourcePort || !targetPort) {
      errors.push(`Connection has invalid port reference`);
      allConnectionsValid = false;
      continue;
    }
    
    if (sourcePort.type === targetPort.type) {
      errors.push(`Connection has same port types (${sourcePort.type})`);
      allConnectionsValid = false;
    }
  }
  
  // Check energy flow (output array should have incoming connection)
  const hasValidEnergyFlow = !hasOutput || connections.some(
    c => modules.find(m => m.instanceId === c.targetModuleId)?.type === 'output-array'
  );
  
  if (hasOutput && !hasValidEnergyFlow) {
    errors.push('Output array has no incoming energy connection');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    hasCore,
    hasOutput,
    hasValidEnergyFlow,
    noOverlaps: !hasOverlaps,
    allConnectionsValid,
  };
};

/**
 * Check if generated machine meets theme requirements
 */
export const validateThemeCompliance = (
  modules: PlacedModule[],
  theme: GenerationTheme
): { compliant: boolean; themePercentage: number; details: string } => {
  const themePrefs = THEME_MODULE_PREFERENCES[theme];
  const minPercentage = themePrefs.minThemePercentage;
  
  if (modules.length === 0 || minPercentage === 0) {
    return { compliant: true, themePercentage: 1.0, details: 'No theme requirements' };
  }
  
  const themePreferred = new Set(themePrefs.preferred);
  const themeModuleCount = modules.filter(m => themePreferred.has(m.type)).length;
  const themePercentage = themeModuleCount / modules.length;
  
  const compliant = themePercentage >= minPercentage;
  
  return {
    compliant,
    themePercentage,
    details: `${themeModuleCount}/${modules.length} modules match theme (${(themePercentage * 100).toFixed(0)}% / ${(minPercentage * 100).toFixed(0)}% required)`,
  };
};

// ============================================================================
// MAIN GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a themed random machine with complexity controls
 * 
 * Round 78 Edge Case Handling:
 * - When minModules === maxModules: generates exactly that number of modules
 * - connectionDensity='low': still guarantees at least 1 connection via createConnections
 * - Empty canvas: creates fallback machine with core module
 */
export const generateWithTheme = (
  config: Partial<EnhancedGeneratorConfig> = {}
): GenerationResult => {
  const finalConfig: EnhancedGeneratorConfig = { ...DEFAULT_ENHANCED_CONFIG, ...config };
  const themePrefs = THEME_MODULE_PREFERENCES[finalConfig.theme];
  
  // ROUND 78 FIX: Handle minModules === maxModules case (fixed module count)
  let moduleCount: number;
  if (finalConfig.minModules === finalConfig.maxModules) {
    // Fixed module count when min equals max
    moduleCount = finalConfig.minModules;
  } else {
    // Random module count within range
    moduleCount = Math.floor(
      Math.random() * (finalConfig.maxModules - finalConfig.minModules + 1)
    ) + finalConfig.minModules;
  }
  
  // ROUND 78 FIX: Minimum of 2 modules (1 module can't form connections)
  const actualCount = Math.max(2, moduleCount);
  
  // Get available module types for theme
  const availableTypes = getAvailableModuleTypes(finalConfig.theme, finalConfig.useFactionVariants);
  
  // ROUND 78 FIX: ALWAYS ensure there's at least one core furnace (100% guarantee)
  // First slot is always core-furnace for valid machine structure
  const moduleTypes: ModuleType[] = ['core-furnace'];
  
  // Fill remaining slots with theme-weighted random modules
  for (let i = 1; i < actualCount; i++) {
    const type = getWeightedRandomModuleType(availableTypes, themePrefs.weights);
    moduleTypes.push(type);
  }
  
  // Find valid positions for all modules
  const modules = findValidModulePositions(moduleTypes, finalConfig);
  
  // ROUND 78 FIX: Handle empty canvas case - create fallback core module
  if (modules.length === 0) {
    // Create a minimal machine with core furnace
    const corePosition = findValidPosition('core-furnace', [], finalConfig, 100);
    if (corePosition) {
      modules.push({
        id: uuidv4(),
        instanceId: uuidv4(),
        type: 'core-furnace',
        x: corePosition.x,
        y: corePosition.y,
        rotation: 0,
        scale: 1,
        flipped: false,
        ports: getDefaultPorts('core-furnace'),
      });
      
      // Try to add one more module for connection
      const pipePosition = findValidPosition('energy-pipe', modules, finalConfig, 100);
      if (pipePosition) {
        modules.push({
          id: uuidv4(),
          instanceId: uuidv4(),
          type: 'energy-pipe',
          x: pipePosition.x,
          y: pipePosition.y,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: getDefaultPorts('energy-pipe'),
        });
      }
    }
  }
  
  // Create connections based on density setting
  // ROUND 78 FIX: createConnections now guarantees at least 1 connection
  const connections = createConnections(modules, finalConfig.connectionDensity);
  
  // Validate the generated machine
  const validation = validateGeneratedMachine(
    modules, 
    connections, 
    finalConfig.minSpacing
  );
  
  // Check theme compliance
  const themeCompliance = validateThemeCompliance(modules, finalConfig.theme);
  
  return {
    modules,
    connections,
    validation: {
      ...validation,
      errors: [...validation.errors, ...(themeCompliance.compliant ? [] : [`Theme compliance failed: ${themeCompliance.details}`])],
      valid: validation.valid && themeCompliance.compliant,
    },
    theme: finalConfig.theme,
    complexity: {
      moduleCount: modules.length,
      connectionCount: connections.length,
      connectionDensity: connections.length / Math.max(1, modules.length),
    },
    attempts: 1,
  };
};

/**
 * Generate a random machine (legacy compatibility)
 */
export const generateRandomMachine = (
  config: Partial<RandomGeneratorConfig> = {}
): { modules: PlacedModule[]; connections: Connection[] } => {
  const result = generateWithTheme({
    ...config,
    theme: 'balanced',
    connectionDensity: 'medium',
    useFactionVariants: false,
  });
  return { modules: result.modules, connections: result.connections };
};

/**
 * Generate with retry (for validation failures)
 */
export const generateWithRetry = (
  config: Partial<EnhancedGeneratorConfig> = {},
  maxAttempts: number = 3
): GenerationResult => {
  let lastResult: GenerationResult | null = null;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = generateWithTheme(config);
    lastResult = { ...result, attempts: attempt + 1 };
    
    if (result.validation.valid) {
      return result;
    }
  }
  
  // Return last result even if invalid (fallback)
  if (lastResult) {
    return lastResult;
  }
  
  // Ultimate fallback: generate simplest valid machine
  return generateWithTheme({
    ...config,
    minModules: 2,
    maxModules: 2,
  });
};

/**
 * Generate multiple random machines and validate them
 */
export const generateAndValidateMachines = (
  count: number,
  config: Partial<EnhancedGeneratorConfig> = {}
): GenerationResult[] => {
  const results: GenerationResult[] = [];
  
  for (let i = 0; i < count; i++) {
    results.push(generateWithRetry(config));
  }
  
  return results;
};

// ============================================================================
// THEME UTILITIES
// ============================================================================

/**
 * Get theme display info
 */
export const THEME_DISPLAY_INFO: Record<GenerationTheme, {
  name: string;
  description: string;
  icon: string;
  color: string;
}> = {
  balanced: {
    name: '平衡',
    description: '均衡使用所有模块类型，适合初学者',
    icon: '⚖️',
    color: '#9ca3af',
  },
  offensive: {
    name: '进攻',
    description: '优先使用增幅器、火焰和雷电模块',
    icon: '⚔️',
    color: '#ef4444',
  },
  defensive: {
    name: '防御',
    description: '优先使用护盾、稳定器和虚空模块',
    icon: '🛡️',
    color: '#22c55e',
  },
  arcane_focus: {
    name: '奥术专注',
    description: '优先使用符文节点、相位调制器和虚空模块',
    icon: '🔮',
    color: '#a855f7',
  },
  void_chaos: {
    name: '虚空混沌',
    description: '使用虚空派系变体模块，探索虚空之力',
    icon: '🌀',
    color: '#a78bfa',
  },
  inferno_forge: {
    name: '熔岩熔炉',
    description: '使用熔岩派系变体模块，掌握火焰科技',
    icon: '🔥',
    color: '#f97316',
  },
  storm_surge: {
    name: '雷霆涌动',
    description: '使用雷霆派系变体模块，驾驭闪电之力',
    icon: '⚡',
    color: '#eab308',
  },
  stellar_harmony: {
    name: '星辉和谐',
    description: '使用星辉派系变体模块，感受星辰力量',
    icon: '✨',
    color: '#fcd34d',
  },
  temporal_focus: {
    name: '时空专注',
    description: '使用时空扭曲器、奥术矩阵网格和以太灌注室',
    icon: '⏱️',
    color: '#22d3ee',
  },
};

/**
 * Get all available themes
 */
export const getAllThemes = (): GenerationTheme[] => {
  return Object.keys(THEME_DISPLAY_INFO) as GenerationTheme[];
};

export default generateWithTheme;
