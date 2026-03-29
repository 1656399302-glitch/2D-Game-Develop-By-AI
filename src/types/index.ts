// Module Types
export type ModuleType = 'core-furnace' | 'energy-pipe' | 'gear' | 'rune-node' | 'shield-shell' | 'trigger-switch' | 'output-array' | 'amplifier-crystal' | 'stabilizer-core' | 'void-siphon' | 'phase-modulator' | 'resonance-chamber' | 'fire-crystal' | 'lightning-conductor';
export type ModuleCategory = 'core' | 'pipe' | 'gear' | 'rune' | 'shield' | 'trigger' | 'output' | 'resonance' | 'elemental';
export type PortType = 'input' | 'output';

export interface Port {
  id: string;
  type: PortType;
  position: { x: number; y: number };
  relativePosition?: { x: number; y: number };
}

export interface ModuleDefinition {
  id: ModuleType;
  name: string;
  category: ModuleCategory;
  description: string;
  baseAttributes: ModuleAttributes;
  defaultWidth: number;
  defaultHeight: number;
  portConfig: {
    inputs: { x: number; y: number }[];
    outputs: { x: number; y: number }[];
  };
}

export interface ModuleAttributes {
  energy: number;
  stability: number;
  power: number;
}

export interface PlacedModule {
  id: string;
  instanceId: string;
  type: ModuleType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  flipped: boolean;
  ports: Port[];
}

export interface Connection {
  id: string;
  sourceModuleId: string;
  sourcePortId: string;
  targetModuleId: string;
  targetPortId: string;
  pathData: string;
}

// Attribute Generation
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type AttributeTag = 'fire' | 'lightning' | 'arcane' | 'void' | 'mechanical' | 'protective' | 'amplifying' | 'balancing' | 'explosive' | 'stable' | 'resonance';

export interface MachineStats {
  stability: number;
  powerOutput: number;
  energyCost: number;
  failureRate: number;
}

export interface GeneratedAttributes {
  name: string;
  rarity: Rarity;
  stats: MachineStats;
  tags: AttributeTag[];
  description: string;
  codexId: string;
}

// Animation States
export type MachineState = 'idle' | 'charging' | 'active' | 'overload' | 'failure' | 'shutdown';

export interface AnimationConfig {
  idle: {
    duration: number;
    repeat: number;
  };
  active: {
    duration: number;
    stagger: number;
  };
}

// Codex System
export interface CodexEntry {
  id: string;
  codexId: string;
  name: string;
  rarity: Rarity;
  modules: PlacedModule[];
  connections: Connection[];
  attributes: GeneratedAttributes;
  createdAt: number;
  thumbnail?: string;
}

// Editor State
export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export interface EditorState {
  modules: PlacedModule[];
  connections: Connection[];
  selectedModuleId: string | null;
  selectedConnectionId: string | null;
  isConnecting: boolean;
  connectionStart: { moduleId: string; portId: string } | null;
  viewport: ViewportState;
  machineState: MachineState;
  history: HistoryState[];
  historyIndex: number;
  gridEnabled: boolean;
}

export interface HistoryState {
  modules: PlacedModule[];
  connections: Connection[];
}

// Export Types
export interface ExportOptions {
  format: 'svg' | 'png' | 'poster';
  width?: number;
  height?: number;
  scale?: number;
  includeBackground?: boolean;
  backgroundColor?: string;
  borderStyle?: 'simple' | 'ornate' | 'minimal';
  includeStats?: boolean;
  includeDescription?: boolean;
}

// Event Types
export interface DragEvent {
  moduleType: ModuleType;
  x: number;
  y: number;
}

// Module size definitions
export const MODULE_SIZES: Record<ModuleType, { width: number; height: number }> = {
  'core-furnace': { width: 100, height: 100 },
  'energy-pipe': { width: 120, height: 50 },
  'gear': { width: 80, height: 80 },
  'rune-node': { width: 80, height: 80 },
  'shield-shell': { width: 100, height: 60 },
  'trigger-switch': { width: 60, height: 100 },
  'output-array': { width: 80, height: 80 },
  'amplifier-crystal': { width: 80, height: 80 },
  'stabilizer-core': { width: 80, height: 80 },
  'void-siphon': { width: 80, height: 80 },
  'phase-modulator': { width: 80, height: 80 },
  'resonance-chamber': { width: 80, height: 80 },
  'fire-crystal': { width: 80, height: 80 },
  'lightning-conductor': { width: 80, height: 80 },
};

// Port position configuration - supports single position or array for multi-port modules
type SinglePortConfig = { x: number; y: number };
type MultiPortConfig = { x: number; y: number }[];
type PortConfig = SinglePortConfig | MultiPortConfig;

export const MODULE_PORT_CONFIGS: Record<ModuleType, { input: PortConfig; output: PortConfig }> = {
  'core-furnace': { 
    input: { x: 25, y: 50 }, 
    output: { x: 75, y: 50 } 
  },
  'energy-pipe': { 
    input: { x: 0, y: 25 }, 
    output: { x: 100, y: 25 } 
  },
  'gear': { 
    input: { x: 50, y: 0 }, 
    output: { x: 50, y: 100 } 
  },
  'rune-node': { 
    input: { x: 0, y: 40 }, 
    output: { x: 100, y: 40 } 
  },
  'shield-shell': { 
    input: { x: 20, y: 50 }, 
    output: { x: 80, y: 50 } 
  },
  'trigger-switch': { 
    input: { x: 50, y: 0 }, 
    output: { x: 50, y: 100 } 
  },
  'output-array': { 
    input: { x: 0, y: 40 }, 
    output: { x: 80, y: 40 } 
  },
  // Multi-port modules
  'amplifier-crystal': { 
    input: { x: 0, y: 40 }, 
    output: [{ x: 80, y: 20 }, { x: 80, y: 60 }] // 1 input, 2 outputs (40px apart)
  },
  'stabilizer-core': { 
    input: [{ x: 0, y: 25 }, { x: 0, y: 55 }], // 2 inputs (30px apart)
    output: { x: 80, y: 40 } 
  },
  // Round 13 modules
  'void-siphon': { 
    input: { x: 40, y: 0 }, // 1 input at top center
    output: [{ x: 22.5, y: 80 }, { x: 57.5, y: 80 }] // 2 outputs at bottom (35px apart)
  },
  'phase-modulator': { 
    input: [{ x: 0, y: 25 }, { x: 0, y: 50 }], // 2 inputs left (25px apart)
    output: [{ x: 80, y: 25 }, { x: 80, y: 50 }] // 2 outputs right (25px apart)
  },
  // Round 3 new modules
  'resonance-chamber': { 
    input: { x: 0, y: 40 }, // 1 input at left
    output: { x: 80, y: 40 } // 1 output at right
  },
  'fire-crystal': { 
    input: { x: 0, y: 40 }, // 1 input at left
    output: { x: 80, y: 40 } // 1 output at right
  },
  'lightning-conductor': { 
    input: { x: 0, y: 40 }, // 1 input at left
    output: { x: 80, y: 40 } // 1 output at right
  },
};

// Module accent colors
export const MODULE_ACCENT_COLORS: Record<ModuleType, string> = {
  'core-furnace': '#00d4ff',
  'energy-pipe': '#7c3aed',
  'gear': '#f59e0b',
  'rune-node': '#a855f7',
  'shield-shell': '#22c55e',
  'trigger-switch': '#ef4444',
  'output-array': '#fbbf24',
  'amplifier-crystal': '#9333ea',
  'stabilizer-core': '#22c55e',
  'void-siphon': '#a78bfa',
  'phase-modulator': '#22d3ee',
  'resonance-chamber': '#06b6d4',
  'fire-crystal': '#f97316',
  'lightning-conductor': '#eab308',
};
