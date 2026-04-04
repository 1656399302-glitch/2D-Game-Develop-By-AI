import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  PlacedModule,
  Connection,
  ModuleType,
  Port,
  ViewportState,
  MachineState,
  HistoryState,
  PortType,
  MODULE_SIZES,
  MODULE_PORT_CONFIGS,
  GeneratedAttributes,
} from '../types';
import { calculateConnectionPath, updatePathsForModule } from '../utils/connectionEngine';
import { saveCanvasState, loadCanvasState, clearCanvasState, saveCircuitState, loadCircuitState, clearCircuitState } from '../utils/localStorage';
import { PlacedCircuitNode, CircuitWire } from '../types/circuitCanvas';
import { Layer, getLayerColor } from '../types/layers';
import { useCircuitCanvasStore } from './useCircuitCanvasStore';
import { validateConnection } from '../utils/connectionValidator';
import { useSelectionStore } from './useSelectionStore';

interface MachineStore {
  // State
  modules: PlacedModule[];
  connections: Connection[];
  selectedModuleId: string | null;
  selectedConnectionId: string | null;
  isConnecting: boolean;
  connectionStart: { moduleId: string; portId: string } | null;
  connectionPreview: { x: number; y: number } | null;
  viewport: ViewportState;
  machineState: MachineState;
  showActivation: boolean;
  history: HistoryState[];
  historyIndex: number;
  gridEnabled: boolean;
  connectionError: string | null;
  generatedAttributes: GeneratedAttributes | null;
  randomForgeToastVisible: boolean;
  randomForgeToastMessage: string;
  hasLoadedSavedState: boolean;
  
  // Circuit state (synced with useCircuitCanvasStore for persistence - AC-124-009)
  circuitNodes: PlacedCircuitNode[];
  circuitWires: CircuitWire[];
  
  // Activation zoom state for enhanced activation visuals
  activationZoom: {
    isZooming: boolean;
    startViewport: ViewportState | null;
    targetViewport: ViewportState | null;
    startTime: number;
    duration: number;
  };
  
  // Activation module index for BFS order tracking
  activationModuleIndex: number;
  activationStartTime: number | null;
  
  // Clipboard for copy/paste
  clipboardModules: PlacedModule[];
  clipboardConnections: Connection[];
  
  // Modal states
  showExportModal: boolean;
  showCodexModal: boolean;

  // Actions
  addModule: (type: ModuleType, x: number, y: number) => PlacedModule;
  removeModule: (instanceId: string) => void;
  updateModulePosition: (instanceId: string, x: number, y: number) => void;
  updateModuleRotation: (instanceId: string, rotation: number) => void;
  updateModuleScale: (instanceId: string, scale: number) => void;
  updateModuleFlip: (instanceId: string) => void;
  selectModule: (instanceId: string | null) => void;
  selectAllModules: () => void;
  selectConnection: (connectionId: string | null) => void;
  deleteSelected: () => void;
  duplicateModule: (instanceId: string) => void;
  
  // Batch operations
  updateModulesBatch: (updates: Array<{ instanceId: string; x?: number; y?: number }>) => void;
  setModulesOrder: (orderedModuleIds: string[]) => void;
  
  // Copy/Paste
  copySelected: () => void;
  pasteModules: () => void;
  
  // Connection actions
  startConnection: (moduleId: string, portId: string) => void;
  updateConnectionPreview: (x: number, y: number) => void;
  completeConnection: (targetModuleId: string, targetPortId: string) => void;
  cancelConnection: () => void;
  removeConnection: (connectionId: string) => void;
  setConnectionError: (error: string | null) => void;
  
  // Viewport actions
  setViewport: (viewport: Partial<ViewportState>) => void;
  resetViewport: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  
  // Activation zoom actions
  startActivationZoom: () => void;
  updateActivationZoom: (currentTime: number) => ViewportState;
  endActivationZoom: () => void;
  setActivationModuleIndex: (index: number) => void;
  
  // Machine state
  setMachineState: (state: MachineState) => void;
  setShowActivation: (show: boolean) => void;
  activateFailureMode: () => void;
  activateOverloadMode: () => void;
  
  // Grid
  toggleGrid: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Clear
  clearCanvas: () => void;
  
  // Load
  loadMachine: (modules: PlacedModule[], connections: Connection[]) => void;
  
  // Random Forge
  setGeneratedAttributes: (attributes: GeneratedAttributes | null) => void;
  showRandomForgeToast: (message: string) => void;
  hideRandomForgeToast: () => void;
  
  // Modal controls
  setShowExportModal: (show: boolean) => void;
  setShowCodexModal: (show: boolean) => void;
  
  // Persistence
  restoreSavedState: () => void;
  startFresh: () => void;
  markStateAsLoaded: () => void;
  
  // Circuit state persistence (AC-124-009)
  saveCircuitToStore: () => void;
  loadCircuitFromStore: () => void;
  clearCircuitState: () => void;

  // Layer system (Round 127)
  layers: Layer[];
  activeLayerId: string;

  // Layer actions
  addLayer: (name?: string) => string;
  removeLayer: (id: string) => boolean;
  renameLayer: (id: string, name: string) => void;
  setActiveLayer: (id: string) => void;
  moveComponentsToLayer: (componentIds: string[], targetLayerId: string) => void;
  getActiveLayerComponents: () => PlacedModule[];
  getActiveLayerWires: () => Connection[];
};


const GRID_SIZE = 20;
const AUTO_RETURN_DELAY = 3500; // 3.5 seconds for failure/overload modes
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;
const DUPLICATE_OFFSET = 20;
const AUTO_SAVE_DEBOUNCE = 500; // 500ms debounce for auto-save
const CLIPBOARD_OFFSET = 20; // Offset for pasted modules
const ACTIVATION_ZOOM_DURATION = 800; // Duration for zoom animation in ms
const CONNECTION_ERROR_AUTO_CLEAR = 2500; // 2.5 seconds for error auto-clear

// Round 127: Default layer ID for initial state
const DEFAULT_LAYER_ID = uuidv4();

// Debounce helper
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

const debouncedAutoSave = (
  modules: PlacedModule[],
  connections: Connection[],
  viewport: ViewportState,
  gridEnabled: boolean
) => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  autoSaveTimeout = setTimeout(() => {
    // Save machine state
    saveCanvasState({
      modules,
      connections,
      viewport,
      gridEnabled,
      savedAt: Date.now(),
    });
    // Save circuit state separately for cross-machine persistence (AC-124-009)
    const circuitState = useCircuitCanvasStore.getState();
    saveCircuitState({
      nodes: circuitState.nodes,
      wires: circuitState.wires,
      savedAt: Date.now(),
    });
  }, AUTO_SAVE_DEBOUNCE);
};

/**
 * Calculate viewport to zoom to fit all modules with padding
 */
const calculateZoomToFitViewport = (
  modules: PlacedModule[],
  viewportSize: { width: number; height: number }
): ViewportState => {
  if (modules.length === 0) {
    return { x: 0, y: 0, zoom: 1 };
  }
  
  const PADDING = 100; // Extra padding around machine content
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  modules.forEach((module) => {
    const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
    minX = Math.min(minX, module.x);
    minY = Math.min(minY, module.y);
    maxX = Math.max(maxX, module.x + size.width);
    maxY = Math.max(maxY, module.y + size.height);
  });

  const contentWidth = maxX - minX + PADDING * 2;
  const contentHeight = maxY - minY + PADDING * 2;

  // Calculate zoom to fit with a nice viewing area
  const zoomX = viewportSize.width / contentWidth;
  const zoomY = viewportSize.height / contentHeight;
  const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zoomX, zoomY)));

  // Calculate offset to center content
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const newX = viewportSize.width / 2 - centerX * newZoom;
  const newY = viewportSize.height / 2 - centerY * newZoom;

  return { x: newX, y: newY, zoom: newZoom };
};

/**
 * Interpolate between two viewport states
 */
const interpolateViewport = (
  start: ViewportState,
  end: ViewportState,
  progress: number
): ViewportState => {
  // Use ease-out for smooth deceleration
  const easedProgress = 1 - Math.pow(1 - progress, 3);
  
  return {
    x: start.x + (end.x - start.x) * easedProgress,
    y: start.y + (end.y - start.y) * easedProgress,
    zoom: start.zoom + (end.zoom - start.zoom) * easedProgress,
  };
};

/**
 * Get default ports for a module type
 * Supports both single-port (backward compatible) and multi-port configurations
 */
const getDefaultPorts = (type: ModuleType): Port[] => {
  const config = MODULE_PORT_CONFIGS[type];
  if (!config) {
    // Fallback for unknown types - default single port
    return [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 25, y: 40 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 75, y: 40 } },
    ];
  }
  
  const ports: Port[] = [];
  
  // Handle input ports - can be single or array
  const inputConfig = config.input;
  if (Array.isArray(inputConfig)) {
    inputConfig.forEach((pos, idx) => {
      ports.push({ id: `${type}-input-${idx}`, type: 'input' as PortType, position: pos });
    });
  } else {
    ports.push({ id: `${type}-input-0`, type: 'input' as PortType, position: inputConfig });
  }
  
  // Handle output ports - can be single or array
  const outputConfig = config.output;
  if (Array.isArray(outputConfig)) {
    outputConfig.forEach((pos, idx) => {
      ports.push({ id: `${type}-output-${idx}`, type: 'output' as PortType, position: pos });
    });
  } else {
    ports.push({ id: `${type}-output-0`, type: 'output' as PortType, position: outputConfig });
  }
  
  return ports;
};

const snapToGrid = (value: number, gridSize: number = GRID_SIZE): number => {
  return Math.round(value / gridSize) * gridSize;
};

// Initialize with empty state in history
const initialHistory: HistoryState[] = [{ modules: [], connections: [] }];

export const useMachineStore = create<MachineStore>((set, get) => ({
  modules: [],
  connections: [],
  selectedModuleId: null,
  selectedConnectionId: null,
  isConnecting: false,
  connectionStart: null,
  connectionPreview: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  machineState: 'idle',
  showActivation: false,
  history: initialHistory,
  historyIndex: 0,
  gridEnabled: true,
  connectionError: null,
  generatedAttributes: null,
  randomForgeToastVisible: false,
  randomForgeToastMessage: '',
  hasLoadedSavedState: false,
  
  // Circuit state - AC-124-009
  circuitNodes: [],
  circuitWires: [],
  
  // Activation zoom state
  activationZoom: {
    isZooming: false,
    startViewport: null,
    targetViewport: null,
    startTime: 0,
    duration: ACTIVATION_ZOOM_DURATION,
  },
  
  // Activation module index
  activationModuleIndex: -1,
  activationStartTime: null,
  
  // Clipboard
  clipboardModules: [],
  clipboardConnections: [],
  
  // Modal states
  showExportModal: false,
  showCodexModal: false,
  
  // Layer system state (Round 127) - initialized with default layer
  layers: [{ id: DEFAULT_LAYER_ID, name: 'Layer 1', visible: true, color: getLayerColor(0), order: 0 }],
  activeLayerId: DEFAULT_LAYER_ID,


  addModule: (type, x, y) => {
    const { gridEnabled, activeLayerId } = get();
    const { width, height } = MODULE_SIZES[type] || { width: 80, height: 80 };
    
    // Round 127: Assign new module to the active layer
    const newModule: PlacedModule = {
      id: uuidv4(),
      instanceId: uuidv4(),
      type,
      layerId: activeLayerId,
      x: gridEnabled ? snapToGrid(x - width / 2) : x - width / 2,
      y: gridEnabled ? snapToGrid(y - height / 2) : y - height / 2,
      rotation: 0,
      scale: 1,
      flipped: false,
      ports: getDefaultPorts(type),
    };
    
    // First, set the new state
    set((state) => {
      const newState = {
        modules: [...state.modules, newModule],
        selectedModuleId: newModule.instanceId,
        generatedAttributes: null, // Clear generated attributes when manually adding
      };
      
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return newState;
    });
    
    // THEN save to history (captures the new state)
    get().saveToHistory();
    // Return the created module for E2E test access
    return newModule;
  },

  removeModule: (instanceId) => {
    // First, set the new state
    set((state) => {
      const newModules = state.modules.filter((m) => m.instanceId !== instanceId);
      const moduleIds = new Set(newModules.map((m) => m.instanceId));
      const newConnections = state.connections.filter(
        (c) => moduleIds.has(c.sourceModuleId) && moduleIds.has(c.targetModuleId)
      );
      
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return {
        modules: newModules,
        connections: newConnections,
        selectedModuleId: state.selectedModuleId === instanceId ? null : state.selectedModuleId,
      };
    });
    
    // THEN save to history (captures the new state)
    get().saveToHistory();
  },

  updateModulePosition: (instanceId, x, y) => {
    const { gridEnabled, modules } = get();
    const module = modules.find((m) => m.instanceId === instanceId);
    if (!module) return;

    const newX = gridEnabled ? snapToGrid(x) : x;
    const newY = gridEnabled ? snapToGrid(y) : y;

    // P0: AC2 Fix - Create updated modules array first, then recalculate paths
    const updatedModules = modules.map((m) =>
      m.instanceId === instanceId ? { ...m, x: newX, y: newY } : m
    );

    // Update connection paths using the updated modules array
    const updatedPathResults = updatePathsForModule(
      updatedModules,
      get().connections,
      instanceId
    );

    // Create a map for quick path lookup
    const pathMap = new Map(updatedPathResults.map(p => [p.id, p.pathData]));

    // Update connections with new paths
    const updatedConnections = get().connections.map((conn) => {
      const newPath = pathMap.get(conn.id);
      if (newPath !== undefined) {
        return { ...conn, pathData: newPath };
      }
      return conn;
    });

    set((_state) => {
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return {
        modules: updatedModules,
        connections: updatedConnections,
      };
    });
  },

  updateModuleRotation: (instanceId, rotation) => {
    set((_state) => {
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return {
        modules: get().modules.map((m) =>
          m.instanceId === instanceId ? { ...m, rotation: (m.rotation + rotation) % 360 } : m
        ),
      };
    });
    
    get().saveToHistory();
  },

  updateModuleScale: (instanceId, scale) => {
    const clampedScale = Math.max(0.5, Math.min(2.0, scale));
    set((_state) => {
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return {
        modules: get().modules.map((m) =>
          m.instanceId === instanceId ? { ...m, scale: clampedScale } : m
        ),
      };
    });
  },

  updateModuleFlip: (instanceId) => {
    set((_state) => {
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return {
        modules: get().modules.map((m) =>
          m.instanceId === instanceId ? { ...m, flipped: !m.flipped } : m
        ),
      };
    });
    
    get().saveToHistory();
  },

  selectModule: (instanceId) => {
    set({ selectedModuleId: instanceId, selectedConnectionId: null });
  },

  selectAllModules: () => {
    const { modules } = get();
    if (modules.length === 0) return;
    set({ selectedModuleId: modules[0].instanceId });
  },

  selectConnection: (connectionId) => {
    set({ selectedConnectionId: connectionId, selectedModuleId: null });
  },

  deleteSelected: () => {
    const { selectedModuleId, selectedConnectionId, removeModule, removeConnection } = get();
    if (selectedModuleId) {
      removeModule(selectedModuleId);
    } else if (selectedConnectionId) {
      removeConnection(selectedConnectionId);
    }
  },

  duplicateModule: (instanceId) => {
    const { modules } = get();
    const moduleToDuplicate = modules.find((m) => m.instanceId === instanceId);
    if (!moduleToDuplicate) return;

    const newModule: PlacedModule = {
      ...moduleToDuplicate,
      id: uuidv4(),
      instanceId: uuidv4(),
      x: moduleToDuplicate.x + DUPLICATE_OFFSET,
      y: moduleToDuplicate.y + DUPLICATE_OFFSET,
      ports: moduleToDuplicate.ports.map((p) => ({
        ...p,
        id: `${moduleToDuplicate.type}-${p.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    };

    set((state) => {
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return {
        modules: [...state.modules, newModule],
        selectedModuleId: newModule.instanceId,
        generatedAttributes: null,
      };
    });
    
    get().saveToHistory();
  },

  updateModulesBatch: (updates) => {
    const { gridEnabled, modules, connections } = get();
    const updateMap = new Map(updates.map(u => [u.instanceId, u]));

    // P0: AC2 Fix - Create updated modules array first, then recalculate paths
    const newModules = modules.map((m) => {
      const update = updateMap.get(m.instanceId);
      if (update) {
        return {
          ...m,
          x: update.x !== undefined ? (gridEnabled ? snapToGrid(update.x) : update.x) : m.x,
          y: update.y !== undefined ? (gridEnabled ? snapToGrid(update.y) : update.y) : m.y,
        };
      }
      return m;
    });

    // Collect affected module IDs
    const affectedModuleIds = new Set(updates.map(u => u.instanceId));

    // Update paths for all affected modules
    const updatedPathResults: Array<{ id: string; pathData: string }> = [];
    affectedModuleIds.forEach((moduleId) => {
      const paths = updatePathsForModule(newModules, connections, moduleId);
      paths.forEach((p) => {
        // Merge results (avoid duplicates)
        if (!updatedPathResults.some((existing) => existing.id === p.id)) {
          updatedPathResults.push(p);
        }
      });
    });

    // Create a map for quick path lookup
    const pathMap = new Map(updatedPathResults.map(p => [p.id, p.pathData]));

    // Update connections with new paths
    const updatedConnections = connections.map((conn) => {
      const newPath = pathMap.get(conn.id);
      if (newPath !== undefined) {
        return { ...conn, pathData: newPath };
      }
      return conn;
    });

    set((_state) => {
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);

      return {
        modules: newModules,
        connections: updatedConnections,
      };
    });
  },

  setModulesOrder: (orderedModuleIds) => {
    const { modules } = get();
    const moduleMap = new Map(modules.map(m => [m.instanceId, m]));
    const orderedModules = orderedModuleIds
      .map(id => moduleMap.get(id))
      .filter((m): m is PlacedModule => m !== undefined);

    const remainingModules = modules.filter(m => !orderedModuleIds.includes(m.instanceId));
    const finalModules = [...orderedModules, ...remainingModules];

    set((_state) => {
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);

      return {
        modules: finalModules,
      };
    });

    get().saveToHistory();
  },

  copySelected: () => {
    const { modules, connections, selectedModuleId } = get();
    const { selectedModuleIds } = useSelectionStore.getState();
    
    // Check multi-selection first (selectedModuleIds takes priority)
    if (selectedModuleIds && selectedModuleIds.length > 0) {
      const copiedModules = modules.filter(m => selectedModuleIds.includes(m.instanceId));
      const copiedConnections = connections.filter(c => 
        selectedModuleIds.includes(c.sourceModuleId) || selectedModuleIds.includes(c.targetModuleId)
      );
      set({
        clipboardModules: copiedModules.map(m => ({ ...m, ports: [...m.ports.map(p => ({ ...p }))] })),
        clipboardConnections: copiedConnections.map(c => ({ ...c })),
      });
      return;
    }
    
    // Single selection fallback
    if (!selectedModuleId) {
      set({
        clipboardModules: modules.map(m => ({ ...m })),
        clipboardConnections: connections.map(c => ({ ...c })),
      });
      return;
    }
    
    const selectedModule = modules.find(m => m.instanceId === selectedModuleId);
    if (!selectedModule) return;
    
    const copiedModules = [selectedModule];
    const copiedConnections = connections.filter(c => 
      c.sourceModuleId === selectedModuleId || c.targetModuleId === selectedModuleId
    );
    
    set({
      clipboardModules: copiedModules.map(m => ({ ...m, ports: [...m.ports.map(p => ({ ...p }))] })),
      clipboardConnections: copiedConnections.map(c => ({ ...c })),
    });
  },

  pasteModules: () => {
    const { clipboardModules, clipboardConnections, modules } = get();
    
    if (clipboardModules.length === 0) return;
    
    const idMapping = new Map<string, string>();
    clipboardModules.forEach(m => {
      idMapping.set(m.instanceId, uuidv4());
    });
    
    const newModules: PlacedModule[] = clipboardModules.map(m => ({
      ...m,
      id: uuidv4(),
      instanceId: idMapping.get(m.instanceId)!,
      x: m.x + CLIPBOARD_OFFSET,
      y: m.y + CLIPBOARD_OFFSET,
      rotation: 0,
      scale: 1,
      flipped: false,
      ports: m.ports.map(p => ({
        ...p,
        id: `${m.type}-${p.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    }));
    
    const newConnections: Connection[] = clipboardConnections.map(c => ({
      ...c,
      id: uuidv4(),
      sourceModuleId: idMapping.get(c.sourceModuleId) || c.sourceModuleId,
      targetModuleId: idMapping.get(c.targetModuleId) || c.targetModuleId,
    }));
    
    const allModules = [...modules, ...newModules];
    const updatedConnections = newConnections.map(conn => {
      const newPath = calculateConnectionPath(
        allModules,
        conn.sourceModuleId,
        conn.sourcePortId,
        conn.targetModuleId,
        conn.targetPortId
      );
      return { ...conn, pathData: newPath };
    });
    
    set((state) => {
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return {
        modules: [...state.modules, ...newModules],
        connections: [...state.connections, ...updatedConnections],
        selectedModuleId: newModules[0]?.instanceId || null,
        generatedAttributes: null,
      };
    });
    
    get().saveToHistory();
  },

  startConnection: (moduleId, portId) => {
    set({
      isConnecting: true,
      connectionStart: { moduleId, portId },
      connectionPreview: null,
      connectionError: null,
    });
  },

  updateConnectionPreview: (x, y) => {
    set({ connectionPreview: { x, y } });
  },

  /**
   * Complete a connection between modules
   * Uses validateConnection for validation with specific error messages per contract:
   * - AC-CONN-VALID-001: "输入端口无法连接到输入端口"
   * - AC-CONN-VALID-002: "输出端口无法连接到输出端口"
   * - AC-CONN-VALID-003: "模块无法连接到自身"
   */
  completeConnection: (targetModuleId, targetPortId) => {
    const { connectionStart, modules, connections } = get();
    if (!connectionStart) return;

    const sourceModule = modules.find((m) => m.instanceId === connectionStart.moduleId);
    const targetModule = modules.find((m) => m.instanceId === targetModuleId);

    if (!sourceModule || !targetModule) {
      set({ isConnecting: false, connectionStart: null, connectionPreview: null });
      return;
    }

    const sourcePort = sourceModule.ports.find((p) => p.id === connectionStart.portId);
    const targetPort = targetModule.ports.find((p) => p.id === targetPortId);

    if (!sourcePort || !targetPort) {
      set({ isConnecting: false, connectionStart: null, connectionPreview: null });
      return;
    }

    // Use the validateConnection utility for validation
    const validationResult = validateConnection(
      connectionStart.moduleId,
      sourcePort,
      targetModuleId,
      targetPort,
      connections,
      modules
    );

    if (!validationResult.valid && validationResult.error) {
      // Set the specific error message from validation
      set({
        isConnecting: false,
        connectionStart: null,
        connectionPreview: null,
        connectionError: validationResult.error.message,
      });
      setTimeout(() => {
        set({ connectionError: null });
      }, CONNECTION_ERROR_AUTO_CLEAR);
      return;
    }

    // Connection is valid - create the connection
    const pathData = calculateConnectionPath(
      modules,
      connectionStart.moduleId,
      connectionStart.portId,
      targetModuleId,
      targetPortId
    );

    const newConnection: Connection = {
      id: uuidv4(),
      sourceModuleId: connectionStart.moduleId,
      sourcePortId: connectionStart.portId,
      targetModuleId,
      targetPortId,
      pathData,
    };

    set((_state) => {
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return {
        connections: [...get().connections, newConnection],
        isConnecting: false,
        connectionStart: null,
        connectionPreview: null,
      };
    });
    
    get().saveToHistory();
  },

  cancelConnection: () => {
    set({ isConnecting: false, connectionStart: null, connectionPreview: null, connectionError: null });
  },

  removeConnection: (connectionId) => {
    set((state) => {
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return {
        connections: state.connections.filter((c) => c.id !== connectionId),
        selectedConnectionId: state.selectedConnectionId === connectionId ? null : state.selectedConnectionId,
      };
    });
    
    get().saveToHistory();
  },

  setConnectionError: (error) => {
    set({ connectionError: error });
  },

  setViewport: (viewport) => {
    set((state) => {
      setTimeout(() => {
        const { modules, connections, viewport: currentViewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, currentViewport, gridEnabled);
      }, 0);
      
      return {
        viewport: { ...state.viewport, ...viewport },
      };
    });
  },

  resetViewport: () => {
    set((state) => {
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return { viewport: { x: 0, y: 0, zoom: 1 }, gridEnabled: state.gridEnabled };
    });
  },

  zoomIn: () => {
    const { viewport } = get();
    const newZoom = Math.min(MAX_ZOOM, viewport.zoom + ZOOM_STEP);
    set((state) => {
      setTimeout(() => {
        const { modules, connections, viewport: currentViewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, currentViewport, gridEnabled);
      }, 0);
      
      return { viewport: { ...viewport, zoom: newZoom }, gridEnabled: state.gridEnabled };
    });
  },

  zoomOut: () => {
    const { viewport } = get();
    const newZoom = Math.max(MIN_ZOOM, viewport.zoom - ZOOM_STEP);
    set((state) => {
      setTimeout(() => {
        const { modules, connections, viewport: currentViewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, currentViewport, gridEnabled);
      }, 0);
      
      return { viewport: { ...viewport, zoom: newZoom }, gridEnabled: state.gridEnabled };
    });
  },

  zoomToFit: () => {
    const { modules } = get();
    const viewportSize = { width: 800, height: 600 };
    
    if (modules.length === 0) {
      set((state) => {
        setTimeout(() => {
          const { modules, connections, viewport, gridEnabled } = get();
          debouncedAutoSave(modules, connections, viewport, gridEnabled);
        }, 0);
        
        return { viewport: { x: 0, y: 0, zoom: 1 }, gridEnabled: state.gridEnabled };
      });
      return;
    }

    const newViewport = calculateZoomToFitViewport(modules, viewportSize);

    set((state) => {
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return { viewport: newViewport, gridEnabled: state.gridEnabled };
    });
  },

  // Activation zoom actions
  startActivationZoom: () => {
    const { viewport, modules } = get();
    const viewportSize = { width: 800, height: 600 };
    const targetViewport = calculateZoomToFitViewport(modules, viewportSize);
    
    set({
      activationZoom: {
        isZooming: true,
        startViewport: { ...viewport },
        targetViewport,
        startTime: performance.now(),
        duration: ACTIVATION_ZOOM_DURATION,
      },
      activationStartTime: performance.now(),
      activationModuleIndex: -1,
    });
  },

  updateActivationZoom: (currentTime) => {
    const { activationZoom, setViewport } = get();
    
    if (!activationZoom.isZooming || !activationZoom.startViewport || !activationZoom.targetViewport) {
      return get().viewport;
    }
    
    const elapsed = currentTime - activationZoom.startTime;
    const progress = Math.min(1, elapsed / activationZoom.duration);
    
    const newViewport = interpolateViewport(
      activationZoom.startViewport,
      activationZoom.targetViewport,
      progress
    );
    
    // Update the viewport
    setViewport(newViewport);
    
    // Check if zoom is complete
    if (progress >= 1) {
      set({
        activationZoom: {
          ...activationZoom,
          isZooming: false,
        },
      });
    }
    
    return newViewport;
  },

  endActivationZoom: () => {
    const { activationZoom, setViewport } = get();
    
    // If we were zooming, snap to final position
    if (activationZoom.targetViewport) {
      setViewport(activationZoom.targetViewport);
    }
    
    set({
      activationZoom: {
        isZooming: false,
        startViewport: null,
        targetViewport: null,
        startTime: 0,
        duration: ACTIVATION_ZOOM_DURATION,
      },
    });
  },

  setActivationModuleIndex: (index) => {
    set({ activationModuleIndex: index });
  },

  setMachineState: (state) => {
    set({ machineState: state });
  },

  setShowActivation: (show) => {
    set({ showActivation: show });
  },

  activateFailureMode: () => {
    set({ machineState: 'failure', showActivation: true });
    setTimeout(() => {
      set({ machineState: 'idle', showActivation: false });
    }, AUTO_RETURN_DELAY);
  },

  activateOverloadMode: () => {
    set({ machineState: 'overload', showActivation: true });
    setTimeout(() => {
      set({ machineState: 'idle', showActivation: false });
    }, AUTO_RETURN_DELAY);
  },

  toggleGrid: () => {
    set((state) => {
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return { gridEnabled: !state.gridEnabled };
    });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        modules: prevState.modules,
        connections: prevState.connections,
        historyIndex: historyIndex - 1,
      });
      
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        modules: nextState.modules,
        connections: nextState.connections,
        historyIndex: historyIndex + 1,
      });
      
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
    }
  },

  saveToHistory: () => {
    const { modules, connections, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ modules: [...modules], connections: [...connections] });
    if (newHistory.length > 51) {
      newHistory.shift();
    }
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  clearCanvas: () => {
    set({
      modules: [],
      connections: [],
      selectedModuleId: null,
      selectedConnectionId: null,
      generatedAttributes: null,
    });
    
    get().saveToHistory();
    clearCanvasState();
    // Clear circuit state in circuit canvas store (AC-124-009)
    useCircuitCanvasStore.getState().clearCircuitCanvas();
    clearCircuitState();
    // Update tracked circuit state in machine store
    set({ circuitNodes: [], circuitWires: [] });
  },

  loadMachine: (modules, connections) => {
    // Round 127: Migrate modules to default layer if they lack layerId
    const { activeLayerId } = get();
    const migratedModules = modules.map(m => {
      if (!m.layerId) {
        return { ...m, layerId: activeLayerId };
      }
      return m;
    });
    set({
      modules: migratedModules,
      connections,
      selectedModuleId: null,
      selectedConnectionId: null,
      history: initialHistory,
      historyIndex: 0,
      generatedAttributes: null,
      circuitNodes: [],
      circuitWires: [],
    });
    
    setTimeout(() => {
      const { modules, connections, viewport, gridEnabled } = get();
      debouncedAutoSave(modules, connections, viewport, gridEnabled);
    }, 0);
  },

  setGeneratedAttributes: (attributes) => {
    set({ generatedAttributes: attributes });
  },

  showRandomForgeToast: (message) => {
    set({ randomForgeToastVisible: true, randomForgeToastMessage: message });
    setTimeout(() => {
      set({ randomForgeToastVisible: false });
    }, 2500);
  },

  hideRandomForgeToast: () => {
    set({ randomForgeToastVisible: false });
  },

  setShowExportModal: (show) => {
    set({ showExportModal: show });
  },

  setShowCodexModal: (show) => {
    set({ showCodexModal: show });
  },
  
  restoreSavedState: () => {
    const savedState = loadCanvasState();
    const { activeLayerId } = get();
    if (savedState) {
      // Round 127: Migrate modules to default layer if they lack layerId
      const migratedModules = (savedState.modules || []).map((m: PlacedModule) => {
        if (!m.layerId) {
          return { ...m, layerId: activeLayerId };
        }
        return m;
      });
      set({
        modules: migratedModules,
        connections: savedState.connections,
        viewport: savedState.viewport || { x: 0, y: 0, zoom: 1 },
        gridEnabled: savedState.gridEnabled ?? true,
        selectedModuleId: null,
        selectedConnectionId: null,
        history: initialHistory,
        historyIndex: 0,
        // Track circuit state in machine store (AC-124-009)
        circuitNodes: [],
        circuitWires: [],
        hasLoadedSavedState: true,
      });
      // Restore circuit state from separate storage
      const circuitState = loadCircuitState();
      if (circuitState) {
        useCircuitCanvasStore.setState({
          nodes: circuitState.nodes,
          wires: circuitState.wires,
        });
      }
    } else {
      set({ hasLoadedSavedState: true });
    }
  },
  
  startFresh: () => {
    clearCanvasState();
    clearCircuitState();
    set({
      modules: [],
      connections: [],
      selectedModuleId: null,
      selectedConnectionId: null,
      viewport: { x: 0, y: 0, zoom: 1 },
      gridEnabled: true,
      history: initialHistory,
      historyIndex: 0,
      generatedAttributes: null,
      circuitNodes: [],
      circuitWires: [],
      hasLoadedSavedState: true,
    });
    // Also clear circuit canvas store
    useCircuitCanvasStore.getState().clearCircuitCanvas();
  },
  
  markStateAsLoaded: () => {
    set({ hasLoadedSavedState: true });
  },
  
  // Circuit state persistence methods (AC-124-009)
  saveCircuitToStore: () => {
    const circuitState = useCircuitCanvasStore.getState();
    set({
      circuitNodes: circuitState.nodes,
      circuitWires: circuitState.wires,
    });
  },
  
  loadCircuitFromStore: () => {
    const { circuitNodes, circuitWires } = get();
    useCircuitCanvasStore.setState({
      nodes: circuitNodes,
      wires: circuitWires,
    });
  },
  
  clearCircuitState: () => {
    useCircuitCanvasStore.getState().clearCircuitCanvas();
    clearCircuitState();
    set({ circuitNodes: [], circuitWires: [] });
  },
  
  // ============================================================
  // LAYER MANAGEMENT (Round 127)
  // ============================================================
  
  addLayer: (name?: string) => {
    const { layers } = get();
    const layerNumber = layers.length + 1;
    const newLayer: Layer = {
      id: uuidv4(),
      name: name || `Layer ${layerNumber}`,
      visible: true,
      color: getLayerColor(layers.length),
      order: layers.length,
    };
    
    set((state) => ({
      layers: [...state.layers, newLayer],
    }));
    
    return newLayer.id;
  },
  
  removeLayer: (id: string) => {
    const { layers, activeLayerId, modules, connections } = get();
    
    // Cannot remove the last layer
    if (layers.length <= 1) {
      return false;
    }
    
    // Find the layer to remove
    const layerIndex = layers.findIndex(l => l.id === id);
    if (layerIndex === -1) {
      return false;
    }
    
    // Remove the layer
    const newLayers = layers.filter(l => l.id !== id);
    
    // If removing the active layer, switch to the first remaining layer
    let newActiveId = activeLayerId;
    if (activeLayerId === id) {
      newActiveId = newLayers[0].id;
    }
    
    // Remove modules assigned to the deleted layer
    const remainingModuleIds = new Set(
      modules.filter(m => m.layerId !== id).map(m => m.instanceId)
    );
    const newModules = modules.filter(m => remainingModuleIds.has(m.instanceId));
    // Also remove connections where either module is now gone
    const newConnections = connections.filter(
      c => remainingModuleIds.has(c.sourceModuleId) && remainingModuleIds.has(c.targetModuleId)
    );
    
    set({
      layers: newLayers,
      activeLayerId: newActiveId,
      modules: newModules,
      connections: newConnections,
    });
    
    return true;
  },
  
  renameLayer: (id: string, name: string) => {
    set((state) => ({
      layers: state.layers.map(l =>
        l.id === id ? { ...l, name } : l
      ),
    }));
  },
  
  setActiveLayer: (id: string) => {
    const { layers } = get();
    if (layers.some(l => l.id === id)) {
      set({ activeLayerId: id });
    }
  },
  
  moveComponentsToLayer: (componentIds: string[], targetLayerId: string) => {
    const { layers } = get();
    if (!layers.some(l => l.id === targetLayerId)) {
      return; // Invalid target layer
    }
    
    set((state) => ({
      modules: state.modules.map(m =>
        componentIds.includes(m.instanceId)
          ? { ...m, layerId: targetLayerId }
          : m
      ),
    }));
  },
  
  getActiveLayerComponents: () => {
    const { modules, activeLayerId, layers } = get();
    const activeLayer = layers.find(l => l.id === activeLayerId);
    // If the active layer is hidden, return empty
    if (!activeLayer?.visible) return [];
    return modules.filter(m => m.layerId === activeLayerId);
  },
  
  getActiveLayerWires: () => {
    const { modules, activeLayerId, layers, connections } = get();
    const activeLayer = layers.find(l => l.id === activeLayerId);
    // If the active layer is hidden, return empty
    if (!activeLayer?.visible) return [];
    const activeModuleIds = new Set(
      modules
        .filter(m => m.layerId === activeLayerId)
        .map(m => m.instanceId)
    );
    return connections.filter(
      c => activeModuleIds.has(c.sourceModuleId) && activeModuleIds.has(c.targetModuleId)
    );
  },
}));
