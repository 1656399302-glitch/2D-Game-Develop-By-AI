/**
 * Module Data Store - Consolidated module definitions and schemas
 * 
 * This store provides a unified source of truth for all module-related data,
 * ensuring consistent schemas across the application.
 * 
 * AC-119-001: Module data store exports all component types with unified schema;
 * no duplicate or conflicting definitions remain.
 */

import { create } from 'zustand';
import { 
  ModuleType, 
  MODULE_SIZES, 
  MODULE_PORT_CONFIGS, 
  MODULE_ACCENT_COLORS,
  ModuleCategory,
  PortType,
  Port
} from '../types';

// Re-export all module-related types for convenience
export type { ModuleType, ModuleCategory, PortType, Port };

// Extended module definition with additional metadata
export interface ExtendedModuleDefinition {
  id: ModuleType;
  name: string;
  category: ModuleCategory;
  description: string;
  baseAttributes: {
    energy: number;
    stability: number;
    power: number;
  };
  defaultWidth: number;
  defaultHeight: number;
  portConfig: {
    inputs: { x: number; y: number }[];
    outputs: { x: number; y: number }[];
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  energyConsumption: number;
  energyProduction: number;
}

// All available module types as a const array for iteration
export const ALL_MODULE_TYPES: ModuleType[] = [
  // Core modules
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
  // Faction variant modules
  'void-arcane-gear',
  'inferno-blazing-core',
  'storm-thundering-pipe',
  'stellar-harmonic-crystal',
  // Advanced modules
  'temporal-distorter',
  'arcane-matrix-grid',
  'ether-infusion-chamber',
] as const;

// Module category mapping
export const MODULE_CATEGORIES: Record<ModuleType, ModuleCategory> = {
  'core-furnace': 'core',
  'energy-pipe': 'pipe',
  'gear': 'gear',
  'rune-node': 'rune',
  'shield-shell': 'shield',
  'trigger-switch': 'trigger',
  'output-array': 'output',
  'amplifier-crystal': 'resonance',
  'stabilizer-core': 'resonance',
  'void-siphon': 'resonance',
  'phase-modulator': 'resonance',
  'resonance-chamber': 'resonance',
  'fire-crystal': 'elemental',
  'lightning-conductor': 'elemental',
  'void-arcane-gear': 'gear',
  'inferno-blazing-core': 'core',
  'storm-thundering-pipe': 'pipe',
  'stellar-harmonic-crystal': 'resonance',
  'temporal-distorter': 'advanced',
  'arcane-matrix-grid': 'advanced',
  'ether-infusion-chamber': 'advanced',
};

// Module difficulty mapping
export const MODULE_DIFFICULTY: Record<ModuleType, 'beginner' | 'intermediate' | 'advanced' | 'master'> = {
  'core-furnace': 'beginner',
  'energy-pipe': 'beginner',
  'gear': 'beginner',
  'rune-node': 'beginner',
  'shield-shell': 'beginner',
  'trigger-switch': 'intermediate',
  'output-array': 'beginner',
  'amplifier-crystal': 'intermediate',
  'stabilizer-core': 'intermediate',
  'void-siphon': 'advanced',
  'phase-modulator': 'advanced',
  'resonance-chamber': 'intermediate',
  'fire-crystal': 'intermediate',
  'lightning-conductor': 'intermediate',
  'void-arcane-gear': 'advanced',
  'inferno-blazing-core': 'advanced',
  'storm-thundering-pipe': 'advanced',
  'stellar-harmonic-crystal': 'advanced',
  'temporal-distorter': 'master',
  'arcane-matrix-grid': 'master',
  'ether-infusion-chamber': 'master',
};

// Module energy values
export const MODULE_ENERGY_CONFIG: Record<ModuleType, { consumption: number; production: number }> = {
  'core-furnace': { consumption: 0, production: 100 },
  'energy-pipe': { consumption: 5, production: 0 },
  'gear': { consumption: 10, production: 0 },
  'rune-node': { consumption: 15, production: 20 },
  'shield-shell': { consumption: 20, production: 0 },
  'trigger-switch': { consumption: 5, production: 0 },
  'output-array': { consumption: 10, production: 0 },
  'amplifier-crystal': { consumption: 30, production: 60 },
  'stabilizer-core': { consumption: 25, production: 40 },
  'void-siphon': { consumption: 50, production: 80 },
  'phase-modulator': { consumption: 40, production: 70 },
  'resonance-chamber': { consumption: 35, production: 50 },
  'fire-crystal': { consumption: 20, production: 35 },
  'lightning-conductor': { consumption: 25, production: 45 },
  'void-arcane-gear': { consumption: 15, production: 25 },
  'inferno-blazing-core': { consumption: 0, production: 150 },
  'storm-thundering-pipe': { consumption: 8, production: 5 },
  'stellar-harmonic-crystal': { consumption: 45, production: 90 },
  'temporal-distorter': { consumption: 60, production: 100 },
  'arcane-matrix-grid': { consumption: 55, production: 110 },
  'ether-infusion-chamber': { consumption: 70, production: 130 },
};

// Port config helper to normalize port configurations
type PortConfigInput = { x: number; y: number } | { x: number; y: number }[];

function normalizePortConfig(config: { input: PortConfigInput; output: PortConfigInput }): {
  inputs: { x: number; y: number }[];
  outputs: { x: number; y: number }[];
} {
  return {
    inputs: Array.isArray(config.input) ? config.input : [config.input],
    outputs: Array.isArray(config.output) ? config.output : [config.output],
  };
}

/**
 * Format module type name for display
 */
function formatModuleName(type: ModuleType): string {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get description for a module type
 */
function getModuleDescription(type: ModuleType): string {
  const descriptions: Record<ModuleType, string> = {
    'core-furnace': 'The heart of any machine. Generates energy to power connected modules.',
    'energy-pipe': 'Transports energy between modules. Basic building block for circuits.',
    'gear': 'Mechanical component that transfers rotational energy.',
    'rune-node': 'Arcane component that amplifies magical energy flow.',
    'shield-shell': 'Protective casing that stabilizes energy within.',
    'trigger-switch': 'Manual switch to control energy flow on demand.',
    'output-array': 'Final output stage that collects and emits processed energy.',
    'amplifier-crystal': 'Amplifies incoming energy signals with multiplicative effect.',
    'stabilizer-core': 'Stabilizes energy fluctuations for consistent output.',
    'void-siphon': 'Extracts energy from the void dimension.',
    'phase-modulator': 'Modulates energy phases for complex circuit control.',
    'resonance-chamber': 'Resonates with ambient energy to boost output.',
    'fire-crystal': 'Channel elemental fire energy through your machine.',
    'lightning-conductor': 'Harnesses lightning energy with high efficiency.',
    'void-arcane-gear': 'Void-touched gear with enhanced mechanical properties.',
    'inferno-blazing-core': 'Blazing core with massive energy output.',
    'storm-thundering-pipe': 'Storm-infused pipe that amplifies energy transfer.',
    'stellar-harmonic-crystal': 'Crystal attuned to stellar frequencies.',
    'temporal-distorter': 'Distorts time to enhance energy processing.',
    'arcane-matrix-grid': 'Grid of arcane matrices for complex calculations.',
    'ether-infusion-chamber': 'Infuses modules with pure ether energy.',
  };
  return descriptions[type] || 'A specialized module component.';
}

// Generate MODULE_DATA for all module types
function generateModuleData(): Record<ModuleType, ExtendedModuleDefinition> {
  const data: Partial<Record<ModuleType, ExtendedModuleDefinition>> = {};
  
  ALL_MODULE_TYPES.forEach((type) => {
    const size = MODULE_SIZES[type];
    const portConfig = MODULE_PORT_CONFIGS[type];
    
    data[type] = {
      id: type,
      name: formatModuleName(type),
      category: MODULE_CATEGORIES[type],
      description: getModuleDescription(type),
      baseAttributes: {
        energy: MODULE_ENERGY_CONFIG[type].production,
        stability: 70 + Math.floor(Math.random() * 20),
        power: MODULE_ENERGY_CONFIG[type].production,
      },
      defaultWidth: size?.width || 80,
      defaultHeight: size?.height || 80,
      portConfig: portConfig ? normalizePortConfig(portConfig) : {
        inputs: [{ x: 0, y: 40 }],
        outputs: [{ x: 100, y: 40 }],
      },
      difficulty: MODULE_DIFFICULTY[type],
      energyConsumption: MODULE_ENERGY_CONFIG[type].consumption,
      energyProduction: MODULE_ENERGY_CONFIG[type].production,
    };
  });
  
  return data as Record<ModuleType, ExtendedModuleDefinition>;
}

// Unified module data - single source of truth
export const MODULE_DATA: Record<ModuleType, ExtendedModuleDefinition> = generateModuleData();

// Module Data Store interface
interface ModuleDataState {
  // Module lookup functions
  getModuleDefinition: (type: ModuleType) => ExtendedModuleDefinition | undefined;
  getModuleSize: (type: ModuleType) => { width: number; height: number };
  getModulePorts: (type: ModuleType) => { input: PortType; output: PortType }[];
  getModuleAccentColor: (type: ModuleType) => string;
  getModuleCategory: (type: ModuleType) => ModuleCategory;
  getModuleDifficulty: (type: ModuleType) => 'beginner' | 'intermediate' | 'advanced' | 'master';
  getModuleEnergy: (type: ModuleType) => { consumption: number; production: number };
  
  // Bulk operations
  getAllModulesByCategory: (category: ModuleCategory) => ModuleType[];
  getAllModulesByDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master') => ModuleType[];
  
  // Validation
  isValidModuleType: (type: string) => type is ModuleType;
}

// Create the module data store
export const useModuleDataStore = create<ModuleDataState>(() => ({
  /**
   * Get the full module definition for a given type
   */
  getModuleDefinition: (type: ModuleType) => {
    return MODULE_DATA[type];
  },

  /**
   * Get the size configuration for a module type
   * Uses MODULE_SIZES as single source of truth
   */
  getModuleSize: (type: ModuleType) => {
    return MODULE_SIZES[type] || { width: 80, height: 80 };
  },

  /**
   * Get port configuration for a module type
   * Uses MODULE_PORT_CONFIGS as single source of truth
   */
  getModulePorts: (type: ModuleType) => {
    const config = MODULE_PORT_CONFIGS[type];
    if (!config) {
      return [{ input: 'input', output: 'output' }];
    }
    
    const ports: { input: PortType; output: PortType }[] = [];
    
    // Handle input ports
    const inputs = Array.isArray(config.input) ? config.input : [config.input];
    // Handle output ports
    const outputs = Array.isArray(config.output) ? config.output : [config.output];
    
    // Create port pairs
    const maxPorts = Math.max(inputs.length, outputs.length);
    for (let i = 0; i < maxPorts; i++) {
      ports.push({
        input: 'input',
        output: 'output',
      });
    }
    
    return ports;
  },

  /**
   * Get accent color for a module type
   * Uses MODULE_ACCENT_COLORS as single source of truth
   */
  getModuleAccentColor: (type: ModuleType) => {
    return MODULE_ACCENT_COLORS[type] || '#00d4ff';
  },

  /**
   * Get category for a module type
   */
  getModuleCategory: (type: ModuleType) => {
    return MODULE_CATEGORIES[type] || 'core';
  },

  /**
   * Get difficulty level for a module type
   */
  getModuleDifficulty: (type: ModuleType) => {
    return MODULE_DIFFICULTY[type] || 'beginner';
  },

  /**
   * Get energy configuration for a module type
   */
  getModuleEnergy: (type: ModuleType) => {
    return MODULE_ENERGY_CONFIG[type] || { consumption: 0, production: 0 };
  },

  /**
   * Get all modules in a specific category
   */
  getAllModulesByCategory: (category: ModuleCategory) => {
    return ALL_MODULE_TYPES.filter(type => MODULE_CATEGORIES[type] === category);
  },

  /**
   * Get all modules of a specific difficulty
   */
  getAllModulesByDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master') => {
    return ALL_MODULE_TYPES.filter(type => MODULE_DIFFICULTY[type] === difficulty);
  },

  /**
   * Type guard to validate module type
   */
  isValidModuleType: (type: string): type is ModuleType => {
    return ALL_MODULE_TYPES.includes(type as ModuleType);
  },
}));

// Export convenience functions that use the store
export const getModuleDefinition = (type: ModuleType) => MODULE_DATA[type];
export const getModuleSize = (type: ModuleType) => MODULE_SIZES[type] || { width: 80, height: 80 };
export const getModuleAccentColor = (type: ModuleType) => MODULE_ACCENT_COLORS[type] || '#00d4ff';
export const getModuleCategory = (type: ModuleType) => MODULE_CATEGORIES[type] || 'core';
