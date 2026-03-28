// Module Types
export type ModuleType = 'core-furnace' | 'energy-pipe' | 'gear' | 'rune-node' | 'shield-shell' | 'trigger-switch';
export type ModuleCategory = 'core' | 'pipe' | 'gear' | 'rune' | 'shield' | 'trigger';
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
export type AttributeTag = 'fire' | 'lightning' | 'arcane' | 'void' | 'mechanical' | 'protective' | 'amplifying' | 'balancing' | 'explosive' | 'stable';

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
}

// Event Types
export interface DragEvent {
  moduleType: ModuleType;
  x: number;
  y: number;
}
