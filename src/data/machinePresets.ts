/**
 * Machine Presets Data
 * 
 * Pre-built machine configurations for quick start and inspiration.
 * Each preset includes 4+ modules and 3+ connections.
 * 
 * ROUND 81 PHASE 2: New data file per contract D9.
 */

import { v4 as uuidv4 } from 'uuid';
import { PlacedModule, Connection, ModuleType } from '../types';

// Preset machine interface
export interface MachinePreset {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  factionId: 'void' | 'inferno' | 'storm' | 'stellar' | 'arcane' | 'chaos';
  modules: PlacedModule[];
  connections: Connection[];
}

// Helper to create a module instance
function createModule(
  type: ModuleType,
  x: number,
  y: number,
  rotation: number = 0,
  scale: number = 1
): PlacedModule {
  const id = uuidv4();
  return {
    id,
    instanceId: id,
    type,
    x,
    y,
    rotation,
    scale,
    flipped: false,
    ports: getDefaultPorts(type),
  };
}

// Simplified port config for preset modules
const SIMPLE_PORT_CONFIGS: Record<ModuleType, { input: { x: number; y: number }; output: { x: number; y: number } }> = {
  'core-furnace': { input: { x: 25, y: 50 }, output: { x: 75, y: 50 } },
  'energy-pipe': { input: { x: 0, y: 25 }, output: { x: 100, y: 25 } },
  'gear': { input: { x: 50, y: 0 }, output: { x: 50, y: 100 } },
  'rune-node': { input: { x: 0, y: 40 }, output: { x: 100, y: 40 } },
  'shield-shell': { input: { x: 20, y: 50 }, output: { x: 80, y: 50 } },
  'trigger-switch': { input: { x: 50, y: 0 }, output: { x: 50, y: 100 } },
  'output-array': { input: { x: 0, y: 40 }, output: { x: 80, y: 40 } },
  'amplifier-crystal': { input: { x: 0, y: 40 }, output: { x: 80, y: 40 } },
  'stabilizer-core': { input: { x: 0, y: 40 }, output: { x: 80, y: 40 } },
  'void-siphon': { input: { x: 40, y: 0 }, output: { x: 40, y: 80 } },
  'phase-modulator': { input: { x: 0, y: 40 }, output: { x: 80, y: 40 } },
  'resonance-chamber': { input: { x: 0, y: 40 }, output: { x: 80, y: 40 } },
  'fire-crystal': { input: { x: 0, y: 40 }, output: { x: 80, y: 40 } },
  'lightning-conductor': { input: { x: 0, y: 40 }, output: { x: 80, y: 40 } },
  'void-arcane-gear': { input: { x: 50, y: 0 }, output: { x: 50, y: 100 } },
  'inferno-blazing-core': { input: { x: 25, y: 55 }, output: { x: 85, y: 55 } },
  'storm-thundering-pipe': { input: { x: 0, y: 30 }, output: { x: 100, y: 30 } },
  'stellar-harmonic-crystal': { input: { x: 0, y: 42 }, output: { x: 85, y: 42 } },
  'temporal-distorter': { input: { x: 0, y: 45 }, output: { x: 90, y: 45 } },
  'arcane-matrix-grid': { input: { x: 0, y: 40 }, output: { x: 80, y: 40 } },
  'ether-infusion-chamber': { input: { x: 0, y: 50 }, output: { x: 100, y: 50 } },
};

function getDefaultPorts(type: ModuleType) {
  const config = SIMPLE_PORT_CONFIGS[type];
  if (!config) {
    return [
      { id: `${type}-input-0`, type: 'input' as const, position: { x: 25, y: 50 } },
      { id: `${type}-output-0`, type: 'output' as const, position: { x: 75, y: 50 } },
    ];
  }
  return [
    { id: `${type}-input-0`, type: 'input' as const, position: config.input },
    { id: `${type}-output-0`, type: 'output' as const, position: config.output },
  ];
}

// Helper to create a connection
function createConnection(
  sourceModule: PlacedModule,
  targetModule: PlacedModule
): Connection {
  return {
    id: uuidv4(),
    sourceModuleId: sourceModule.instanceId,
    sourcePortId: sourceModule.ports.find((p) => p.type === 'output')?.id || `${sourceModule.type}-output-0`,
    targetModuleId: targetModule.instanceId,
    targetPortId: targetModule.ports.find((p) => p.type === 'input')?.id || `${targetModule.type}-input-0`,
    pathData: `M 0 0 L 100 100`, // Placeholder - will be calculated when loaded
  };
}

// All 5 machine presets
export const MACHINE_PRESETS: MachinePreset[] = [
  // Preset 1: Void Reverence
  {
    id: 'void-reverence',
    name: 'Void Reverence',
    nameCn: '虚空回响',
    description: 'A mystical void-powered machine that channels dark energy through arcane gears.',
    factionId: 'void',
    modules: [
      createModule('void-siphon', 100, 100),
      createModule('void-arcane-gear', 250, 150),
      createModule('phase-modulator', 400, 100),
      createModule('core-furnace', 550, 150),
      createModule('rune-node', 250, 300),
      createModule('output-array', 550, 300),
    ],
    connections: [],
  },
  // Preset 2: Molten Forge
  {
    id: 'molten-forge',
    name: 'Molten Star Forge',
    nameCn: '熔星锻造',
    description: 'A blazing infernal forge that supercharges energy with volcanic fury.',
    factionId: 'inferno',
    modules: [
      createModule('inferno-blazing-core', 150, 150),
      createModule('fire-crystal', 300, 100),
      createModule('fire-crystal', 300, 250),
      createModule('core-furnace', 450, 150),
      createModule('amplifier-crystal', 600, 150),
      createModule('output-array', 750, 150),
      createModule('gear', 300, 400),
    ],
    connections: [],
  },
  // Preset 3: Thunder Resonance
  {
    id: 'thunder-resonance',
    name: 'Thunder Phase Resonance',
    nameCn: '雷霆共振',
    description: 'A lightning-infused phase modulator that channels electromagnetic fury.',
    factionId: 'storm',
    modules: [
      createModule('lightning-conductor', 100, 150),
      createModule('phase-modulator', 250, 150),
      createModule('phase-modulator', 400, 150),
      createModule('storm-thundering-pipe', 550, 150),
      createModule('lightning-conductor', 700, 100),
      createModule('lightning-conductor', 700, 250),
      createModule('output-array', 850, 150),
      createModule('stabilizer-core', 400, 350),
    ],
    connections: [],
  },
  // Preset 4: Arcane Matrix
  {
    id: 'arcane-matrix',
    name: 'Arcane Order Matrix',
    nameCn: '奥术矩阵',
    description: 'A sophisticated arcane matrix that organizes and amplifies mystical energies.',
    factionId: 'arcane',
    modules: [
      createModule('core-furnace', 150, 200),
      createModule('rune-node', 300, 150),
      createModule('rune-node', 300, 300),
      createModule('phase-modulator', 450, 200),
      createModule('arcane-matrix-grid', 600, 200),
      createModule('output-array', 750, 200),
      createModule('gear', 450, 380),
      createModule('amplifier-crystal', 600, 380),
    ],
    connections: [],
  },
  // Preset 5: Stellar Harmony
  {
    id: 'stellar-harmony',
    name: 'Stellar Harmony Engine',
    nameCn: '星辉和谐',
    description: 'A cosmic machine that harmonizes stellar energies for maximum resonance.',
    factionId: 'stellar',
    modules: [
      createModule('stellar-harmonic-crystal', 150, 150),
      createModule('stellar-harmonic-crystal', 150, 300),
      createModule('resonance-chamber', 300, 200),
      createModule('amplifier-crystal', 450, 150),
      createModule('amplifier-crystal', 450, 300),
      createModule('stabilizer-core', 600, 200),
      createModule('output-array', 750, 200),
      createModule('core-furnace', 450, 400),
    ],
    connections: [],
  },
];

// Populate connections for each preset
MACHINE_PRESETS.forEach((preset) => {
  const modules = preset.modules;
  const connections: Connection[] = [];
  
  // Create sequential connections between modules
  for (let i = 0; i < modules.length - 1; i++) {
    connections.push(createConnection(modules[i], modules[i + 1]));
  }
  
  // Add some cross-connections for more complexity
  if (modules.length >= 4) {
    // Connect first to third (skip one)
    if (modules[2]) {
      connections.push(createConnection(modules[0], modules[2]));
    }
    // Connect second to last
    if (modules.length >= 3) {
      connections.push(createConnection(modules[1], modules[modules.length - 1]));
    }
  }
  
  preset.connections = connections;
});

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): MachinePreset | undefined {
  return MACHINE_PRESETS.find((preset) => preset.id === id);
}

/**
 * Get all presets for a specific faction
 */
export function getPresetsByFaction(factionId: string): MachinePreset[] {
  return MACHINE_PRESETS.filter((preset) => preset.factionId === factionId);
}

/**
 * Validate that a preset meets minimum requirements
 */
export function validatePreset(preset: MachinePreset): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (preset.modules.length < 4) {
    errors.push(`Preset ${preset.id} has fewer than 4 modules (${preset.modules.length})`);
  }
  
  if (preset.connections.length < 3) {
    errors.push(`Preset ${preset.id} has fewer than 3 connections (${preset.connections.length})`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate all presets
const validationResults = MACHINE_PRESETS.map((preset) => ({
  preset: preset.id,
  ...validatePreset(preset),
}));

// Log any validation errors
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  const failedValidations = validationResults.filter((r) => !r.valid);
  if (failedValidations.length > 0) {
    console.warn('Machine Preset Validation Warnings:', failedValidations);
  }
}

export default MACHINE_PRESETS;
