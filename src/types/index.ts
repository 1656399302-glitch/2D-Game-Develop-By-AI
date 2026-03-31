// Module Types
export type ModuleType = 
  | 'core-furnace' 
  | 'energy-pipe' 
  | 'gear' 
  | 'rune-node' 
  | 'shield-shell' 
  | 'trigger-switch' 
  | 'output-array' 
  | 'amplifier-crystal' 
  | 'stabilizer-core' 
  | 'void-siphon' 
  | 'phase-modulator' 
  | 'resonance-chamber' 
  | 'fire-crystal' 
  | 'lightning-conductor'
  // Faction Variant Modules (unlocked at Grandmaster rank)
  | 'void-arcane-gear'
  | 'inferno-blazing-core'
  | 'storm-thundering-pipe'
  | 'stellar-harmonic-crystal'
  // Round 64: Advanced Modules
  | 'temporal-distorter'
  | 'arcane-matrix-grid'
  | 'ether-infusion-chamber';

export type ModuleCategory = 'core' | 'pipe' | 'gear' | 'rune' | 'shield' | 'trigger' | 'output' | 'resonance' | 'elemental' | 'advanced';
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
export type AttributeTag = 'fire' | 'lightning' | 'arcane' | 'void' | 'mechanical' | 'protective' | 'amplifying' | 'balancing' | 'explosive' | 'stable' | 'resonance' | 'temporal' | 'dimensional';

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
  tags?: string[]; // Custom user tags
}

// Machine Tags System (Round 65)
export interface MachineTag {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface MachineTagAssignment {
  machineId: string;
  tags: string[];
}

export const MAX_TAGS_PER_MACHINE = 5;
export const MAX_TAG_LENGTH = 20;
export const MAX_TOTAL_TAGS = 100;

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
export type ExportResolution = '1x' | '2x' | '4x';
export type ExportAspectRatio = 'default' | 'square' | 'portrait' | 'landscape';

export interface ExportOptions {
  format: 'svg' | 'png' | 'poster';
  width?: number;
  height?: number;
  scale?: ExportResolution;
  includeBackground?: boolean;
  backgroundColor?: string;
  borderStyle?: 'simple' | 'ornate' | 'minimal';
  includeStats?: boolean;
  includeDescription?: boolean;
  transparentBackground?: boolean;
  aspectRatio?: ExportAspectRatio;
}

// Extended export options for enhanced export modal
export interface EnhancedExportOptions extends ExportOptions {
  resolution?: ExportResolution;
  transparentBackground?: boolean;
  aspectRatio?: ExportAspectRatio;
}

// Duplicate Detection Types (Round 65)
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarity: number; // 0-100 percentage
  existingMachineId: string | null;
  existingMachineName: string | null;
  threshold: number;
}

export interface MachineSignature {
  moduleTypes: string;
  connectionCount: number;
  moduleCount: number;
  moduleTypeHash: string;
  connectionPatternHash: string;
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
  // Faction Variant Modules
  'void-arcane-gear': { width: 90, height: 90 },
  'inferno-blazing-core': { width: 110, height: 110 },
  'storm-thundering-pipe': { width: 130, height: 60 },
  'stellar-harmonic-crystal': { width: 85, height: 85 },
  // Round 64: Advanced Modules
  'temporal-distorter': { width: 90, height: 90 },
  'arcane-matrix-grid': { width: 80, height: 80 },
  'ether-infusion-chamber': { width: 100, height: 100 },
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
  // Faction Variant Modules
  'void-arcane-gear': { 
    input: { x: 50, y: 0 }, 
    output: { x: 50, y: 100 } 
  },
  'inferno-blazing-core': { 
    input: { x: 25, y: 55 }, 
    output: { x: 85, y: 55 } 
  },
  'storm-thundering-pipe': { 
    input: { x: 0, y: 30 }, 
    output: { x: 100, y: 30 } 
  },
  'stellar-harmonic-crystal': { 
    input: { x: 0, y: 42 }, 
    output: [{ x: 85, y: 25 }, { x: 85, y: 60 }] // 1 input, 2 outputs
  },
  // Round 64: Advanced Modules
  'temporal-distorter': { 
    input: { x: 0, y: 45 }, // 1 input at left center
    output: { x: 90, y: 45 } // 1 output at right center
  },
  'arcane-matrix-grid': { 
    input: { x: 0, y: 40 }, // 1 input at left
    output: [{ x: 80, y: 25 }, { x: 80, y: 55 }] // 2 outputs at right (stacked)
  },
  'ether-infusion-chamber': { 
    input: [{ x: 0, y: 35 }, { x: 0, y: 65 }], // 2 inputs at left (stacked)
    output: { x: 100, y: 50 } // 1 output at right center
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
  // Faction Variant Modules
  'void-arcane-gear': '#c4b5fd', // Lighter purple for variant
  'inferno-blazing-core': '#fb923c', // Orange for variant
  'storm-thundering-pipe': '#67e8f9', // Cyan for variant
  'stellar-harmonic-crystal': '#fcd34d', // Gold for variant
  // Round 64: Advanced Modules
  'temporal-distorter': '#00ffcc', // Cyan-teal for temporal
  'arcane-matrix-grid': '#22d3ee', // Cyan for arcane matrix
  'ether-infusion-chamber': '#f5d0fe', // Light pink for ether
};

// Resolution dimensions for export
export const RESOLUTION_DIMS: Record<ExportResolution, { base: number; scaled: number }> = {
  '1x': { base: 400, scaled: 400 },
  '2x': { base: 400, scaled: 800 },
  '4x': { base: 400, scaled: 1600 },
};

// Aspect ratio dimensions for poster export
export const ASPECT_RATIO_DIMS: Record<ExportAspectRatio, { width: number; height: number }> = {
  'default': { width: 600, height: 800 },
  'square': { width: 600, height: 600 },
  'portrait': { width: 600, height: 800 },
  'landscape': { width: 800, height: 600 },
};

// Collection Statistics Types (Round 65)
export interface CollectionStats {
  totalMachines: number;
  rarityDistribution: Record<Rarity, number>;
  factionDistribution: Record<string, number>;
  moduleUsage: Record<ModuleType, number>;
  averageComplexity: number;
  completionPercentage: number;
  totalModules: number;
  totalConnections: number;
}
