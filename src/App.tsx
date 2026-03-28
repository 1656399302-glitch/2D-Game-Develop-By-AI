import { useState, useCallback, useEffect } from 'react';
import { Canvas } from './components/Editor/Canvas';
import { ModulePanel } from './components/Editor/ModulePanel';
import { PropertiesPanel } from './components/Editor/PropertiesPanel';
import { Toolbar } from './components/Editor/Toolbar';
import { CodexView } from './components/Codex/CodexView';
import { ExportModal } from './components/Export/ExportModal';
import { ActivationOverlay } from './components/Preview/ActivationOverlay';
import { ConnectionErrorToast } from './components/Connections/ConnectionErrorToast';
import { RandomForgeToast } from './components/UI/RandomForgeToast';
import { LoadPromptModal } from './components/UI/LoadPromptModal';
import { useMachineStore } from './store/useMachineStore';
import { useCodexStore } from './store/useCodexStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { generateAttributes } from './utils/attributeGenerator';
import { hasSavedState } from './utils/localStorage';

type ViewMode = 'editor' | 'codex';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [showExport, setShowExport] = useState(false);
  const [showLoadPrompt, setShowLoadPrompt] = useState(false);
  
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const showActivation = useMachineStore((state) => state.showActivation);
  const loadMachine = useMachineStore((state) => state.loadMachine);
  const setMachineState = useMachineStore((state) => state.setMachineState);
  const setShowActivation = useMachineStore((state) => state.setShowActivation);
  const hasLoadedSavedState = useMachineStore((state) => state.hasLoadedSavedState);
  const markStateAsLoaded = useMachineStore((state) => state.markStateAsLoaded);
  
  const addEntry = useCodexStore((state) => state.addEntry);
  
  // Check for saved state on mount
  useEffect(() => {
    if (hasSavedState()) {
      setShowLoadPrompt(true);
    } else {
      markStateAsLoaded();
    }
  }, [markStateAsLoaded]);
  
  // Use keyboard shortcuts hook
  useKeyboardShortcuts({ enabled: viewMode === 'editor' });
  
  const handleSaveToCodex = useCallback(() => {
    if (modules.length === 0) {
      alert('Please add at least one module before saving to Codex.');
      return;
    }
    
    const attributes = generateAttributes(modules, connections);
    const entry = addEntry(attributes.name, modules, connections, attributes);
    alert(`Machine "${entry.name}" has been saved to the Codex! (${entry.codexId})`);
  }, [modules, connections, addEntry]);
  
  const handleActivate = useCallback(() => {
    if (modules.length === 0) {
      alert('Please add at least one module before activating.');
      return;
    }
    setShowActivation(true);
    setMachineState('charging');
  }, [modules, setMachineState, setShowActivation]);
  
  const handleActivationComplete = useCallback(() => {
    setShowActivation(false);
    setMachineState('idle');
  }, [setMachineState, setShowActivation]);
  
  return (
    <div className="w-screen h-screen flex flex-col bg-[#0a0e17] overflow-hidden">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-[#1e2a42] bg-[#0a0e17]">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-[#00d4ff] tracking-wide">
            ⚙ ARCANE MACHINE CODEX ⚙
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'editor'
                  ? 'bg-[#7c3aed] text-white'
                  : 'bg-[#121826] text-[#9ca3af] hover:text-white'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('codex')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'codex'
                  ? 'bg-[#7c3aed] text-white'
                  : 'bg-[#121826] text-[#9ca3af] hover:text-white'
              }`}
            >
              Codex
            </button>
          </div>
        </div>
        
        {viewMode === 'editor' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleActivate}
              disabled={modules.length === 0}
              className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-[#00d4ff] to-[#00ffcc] text-[#0a0e17] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ▶ Activate Machine
            </button>
            <button
              onClick={handleSaveToCodex}
              disabled={modules.length === 0}
              className="arcane-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📖 Save to Codex
            </button>
            <button
              onClick={() => setShowExport(true)}
              disabled={modules.length === 0}
              className="arcane-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📤 Export
            </button>
          </div>
        )}
      </header>
      
      {/* Editor Toolbar - Contains test mode buttons, zoom controls, and undo/redo */}
      {viewMode === 'editor' && <Toolbar />}
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'editor' ? (
          <>
            <ModulePanel />
            <div className="flex-1 flex">
              <Canvas />
              <PropertiesPanel />
            </div>
          </>
        ) : (
          <CodexView
            onLoadToEditor={(modules, connections) => {
              loadMachine(modules, connections);
              setViewMode('editor');
            }}
          />
        )}
      </div>
      
      {/* Footer */}
      <footer className="h-8 flex items-center justify-between px-4 border-t border-[#1e2a42] bg-[#0a0e17] text-xs text-[#4a5568]">
        <span>Modules: {modules.length} | Connections: {connections.length}</span>
        <span>Press R to rotate | F to flip | Del to remove | Ctrl+Z/Y for undo/redo</span>
        <span>Grid: {useMachineStore.getState().gridEnabled ? 'ON' : 'OFF'}</span>
      </footer>
      
      {/* Modals */}
      {showExport && (
        <ExportModal onClose={() => setShowExport(false)} />
      )}
      
      {showActivation && (
        <ActivationOverlay onComplete={handleActivationComplete} />
      )}
      
      {/* Load Prompt Modal */}
      {showLoadPrompt && hasLoadedSavedState && (
        <LoadPromptModal />
      )}
      
      {/* Toast Notifications */}
      <ConnectionErrorToast />
      <RandomForgeToast />
    </div>
  );
}

export default App;

// Module Types
export type ModuleType = 'core-furnace' | 'energy-pipe' | 'gear' | 'rune-node' | 'shield-shell' | 'trigger-switch' | 'output-array';
export type ModuleCategory = 'core' | 'pipe' | 'gear' | 'rune' | 'shield' | 'trigger' | 'output';
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
};

// Default port configurations
export const MODULE_PORT_CONFIGS: Record<ModuleType, { input: { x: number; y: number }; output: { x: number; y: number } }> = {
  'core-furnace': { input: { x: 25, y: 50 }, output: { x: 75, y: 50 } },
  'energy-pipe': { input: { x: 0, y: 25 }, output: { x: 100, y: 25 } },
  'gear': { input: { x: 50, y: 0 }, output: { x: 50, y: 100 } },
  'rune-node': { input: { x: 0, y: 40 }, output: { x: 100, y: 40 } },
  'shield-shell': { input: { x: 20, y: 50 }, output: { x: 80, y: 50 } },
  'trigger-switch': { input: { x: 50, y: 0 }, output: { x: 50, y: 100 } },
  'output-array': { input: { x: 0, y: 40 }, output: { x: 80, y: 40 } },
};
