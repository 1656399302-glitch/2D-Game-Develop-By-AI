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
import { calculateConnectionPath } from '../utils/connectionEngine';
import { saveCanvasState, loadCanvasState, clearCanvasState } from '../utils/localStorage';

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

  // Actions
  addModule: (type: ModuleType, x: number, y: number) => void;
  removeModule: (instanceId: string) => void;
  updateModulePosition: (instanceId: string, x: number, y: number) => void;
  updateModuleRotation: (instanceId: string, rotation: number) => void;
  updateModuleScale: (instanceId: string, scale: number) => void;
  updateModuleFlip: (instanceId: string) => void;
  selectModule: (instanceId: string | null) => void;
  selectConnection: (connectionId: string | null) => void;
  deleteSelected: () => void;
  duplicateModule: (instanceId: string) => void;
  
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
  
  // Persistence
  restoreSavedState: () => void;
  startFresh: () => void;
  markStateAsLoaded: () => void;
}

const GRID_SIZE = 20;
const AUTO_RETURN_DELAY = 3500; // 3.5 seconds for failure/overload modes
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;
const DUPLICATE_OFFSET = 20;
const AUTO_SAVE_DEBOUNCE = 500; // 500ms debounce for auto-save

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
    saveCanvasState({
      modules,
      connections,
      viewport,
      gridEnabled,
      savedAt: Date.now(),
    });
  }, AUTO_SAVE_DEBOUNCE);
};

const getDefaultPorts = (type: ModuleType): Port[] => {
  const config = MODULE_PORT_CONFIGS[type];
  if (!config) {
    // Fallback for unknown types
    return [
      { id: `${type}-input`, type: 'input' as PortType, position: { x: 25, y: 40 } },
      { id: `${type}-output`, type: 'output' as PortType, position: { x: 75, y: 40 } },
    ];
  }
  return [
    { id: `${type}-input`, type: 'input' as PortType, position: config.input },
    { id: `${type}-output`, type: 'output' as PortType, position: config.output },
  ];
};

const snapToGrid = (value: number, gridSize: number = GRID_SIZE): number => {
  return Math.round(value / gridSize) * gridSize;
};

const getModuleSize = (type: ModuleType): { width: number; height: number } => {
  return MODULE_SIZES[type] || { width: 80, height: 80 };
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

  addModule: (type, x, y) => {
    const { gridEnabled } = get();
    const { width, height } = getModuleSize(type);
    
    const newModule: PlacedModule = {
      id: uuidv4(),
      instanceId: uuidv4(),
      type,
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

    // Update connection paths for this module
    const updatedConnections = get().connections.map((conn) => {
      if (conn.sourceModuleId === instanceId || conn.targetModuleId === instanceId) {
        const newPath = calculateConnectionPath(
          modules,
          conn.sourceModuleId,
          conn.sourcePortId,
          conn.targetModuleId,
          conn.targetPortId
        );
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
        modules: get().modules.map((m) =>
          m.instanceId === instanceId ? { ...m, x: newX, y: newY } : m
        ),
        connections: updatedConnections,
      };
    });
    // NOTE: Position changes don't save to history (too noisy - happens on every drag)
  },

  updateModuleRotation: (instanceId, rotation) => {
    // First, set the new state
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
    
    // THEN save to history (captures the new state)
    get().saveToHistory();
  },

  updateModuleScale: (instanceId, scale) => {
    // Clamp scale between 0.5 and 2.0
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
    // First, set the new state
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
    
    // THEN save to history (captures the new state)
    get().saveToHistory();
  },

  selectModule: (instanceId) => {
    set({ selectedModuleId: instanceId, selectedConnectionId: null });
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

    // First, set the new state
    set((state) => {
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return {
        modules: [...state.modules, newModule],
        selectedModuleId: newModule.instanceId,
        generatedAttributes: null, // Clear generated attributes when manually adding
      };
    });
    
    // THEN save to history (captures the new state)
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

  completeConnection: (targetModuleId, targetPortId) => {
    const { connectionStart, modules, connections } = get();
    if (!connectionStart) return;

    // Validate connection
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

    // Can't connect same type ports - show error
    if (sourcePort.type === targetPort.type) {
      set({ 
        isConnecting: false, 
        connectionStart: null, 
        connectionPreview: null,
        connectionError: '连接类型冲突 - 不能连接相同类型的端口',
      });
      // Clear error after 2 seconds
      setTimeout(() => {
        set({ connectionError: null });
      }, 2000);
      return;
    }

    // Check if connection already exists
    const exists = connections.some(
      (c) =>
        (c.sourceModuleId === connectionStart.moduleId && c.sourcePortId === connectionStart.portId &&
         c.targetModuleId === targetModuleId && c.targetPortId === targetPortId) ||
        (c.sourceModuleId === targetModuleId && c.sourcePortId === targetPortId &&
         c.targetModuleId === connectionStart.moduleId && c.targetPortId === connectionStart.portId)
    );

    if (exists) {
      set({ 
        isConnecting: false, 
        connectionStart: null, 
        connectionPreview: null,
        connectionError: '连接已存在',
      });
      setTimeout(() => {
        set({ connectionError: null });
      }, 2000);
      return;
    }

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

    // First, set the new state
    set((_state) => {
      // Trigger auto-save after state update
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
    
    // THEN save to history (captures the new state)
    get().saveToHistory();
  },

  cancelConnection: () => {
    set({ isConnecting: false, connectionStart: null, connectionPreview: null, connectionError: null });
  },

  removeConnection: (connectionId) => {
    // First, set the new state
    set((state) => {
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return {
        connections: state.connections.filter((c) => c.id !== connectionId),
        selectedConnectionId: state.selectedConnectionId === connectionId ? null : state.selectedConnectionId,
      };
    });
    
    // THEN save to history (captures the new state)
    get().saveToHistory();
  },

  setConnectionError: (error) => {
    set({ connectionError: error });
  },

  setViewport: (viewport) => {
    set((state) => {
      // Trigger auto-save after state update
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
      // Trigger auto-save after state update
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
      // Trigger auto-save after state update
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
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport: currentViewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, currentViewport, gridEnabled);
      }, 0);
      
      return { viewport: { ...viewport, zoom: newZoom }, gridEnabled: state.gridEnabled };
    });
  },

  zoomToFit: () => {
    const { modules } = get();
    if (modules.length === 0) {
      set((state) => {
        // Trigger auto-save after state update
        setTimeout(() => {
          const { modules, connections, viewport, gridEnabled } = get();
          debouncedAutoSave(modules, connections, viewport, gridEnabled);
        }, 0);
        
        return { viewport: { x: 0, y: 0, zoom: 1 }, gridEnabled: state.gridEnabled };
      });
      return;
    }

    // Calculate bounding box of all modules
    const PADDING = 50;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    modules.forEach((module) => {
      const size = getModuleSize(module.type);
      minX = Math.min(minX, module.x);
      minY = Math.min(minY, module.y);
      maxX = Math.max(maxX, module.x + size.width);
      maxY = Math.max(maxY, module.y + size.height);
    });

    const contentWidth = maxX - minX + PADDING * 2;
    const contentHeight = maxY - minY + PADDING * 2;

    // Get viewport size (assuming 800x600 as default canvas size)
    const viewportWidth = 800;
    const viewportHeight = 600;

    // Calculate zoom to fit
    const zoomX = viewportWidth / contentWidth;
    const zoomY = viewportHeight / contentHeight;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zoomX, zoomY)));

    // Calculate offset to center content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newX = viewportWidth / 2 - centerX * newZoom;
    const newY = viewportHeight / 2 - centerY * newZoom;

    set((state) => {
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport: currentViewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, currentViewport, gridEnabled);
      }, 0);
      
      return { viewport: { x: newX, y: newY, zoom: newZoom }, gridEnabled: state.gridEnabled };
    });
  },

  setMachineState: (state) => {
    set({ machineState: state });
  },

  setShowActivation: (show) => {
    set({ showActivation: show });
  },

  activateFailureMode: () => {
    set({ machineState: 'failure', showActivation: true });
    // Auto-return to idle after 3.5 seconds
    setTimeout(() => {
      set({ machineState: 'idle', showActivation: false });
    }, AUTO_RETURN_DELAY);
  },

  activateOverloadMode: () => {
    set({ machineState: 'overload', showActivation: true });
    // Auto-return to idle after 3.5 seconds
    setTimeout(() => {
      set({ machineState: 'idle', showActivation: false });
    }, AUTO_RETURN_DELAY);
  },

  toggleGrid: () => {
    set((state) => {
      // Trigger auto-save after state update
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
      
      return { gridEnabled: !state.gridEnabled };
    });
  },

  undo: () => {
    const { historyIndex, history } = get();
    // Undo is possible if there's a previous state to restore
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        modules: prevState.modules,
        connections: prevState.connections,
        historyIndex: historyIndex - 1,
      });
      
      // Trigger auto-save after undo
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    // Redo is possible if there's a future state
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        modules: nextState.modules,
        connections: nextState.connections,
        historyIndex: historyIndex + 1,
      });
      
      // Trigger auto-save after redo
      setTimeout(() => {
        const { modules, connections, viewport, gridEnabled } = get();
        debouncedAutoSave(modules, connections, viewport, gridEnabled);
      }, 0);
    }
  },

  saveToHistory: () => {
    const { modules, connections, history, historyIndex } = get();
    // When taking a new action, truncate any redo history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ modules: [...modules], connections: [...connections] });
    // Keep only last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  clearCanvas: () => {
    // Set cleared state (preserving history for undo)
    set({
      modules: [],
      connections: [],
      selectedModuleId: null,
      selectedConnectionId: null,
      generatedAttributes: null,
    });
    
    // Save cleared state to history (enables undo to restore previous state)
    get().saveToHistory();
    
    // Clear persisted state
    clearCanvasState();
  },

  loadMachine: (modules, connections) => {
    set({
      modules,
      connections,
      selectedModuleId: null,
      selectedConnectionId: null,
      history: initialHistory,
      historyIndex: 0,
      generatedAttributes: null, // Don't carry over attributes from previous machine
    });
    
    // Trigger auto-save after load
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
    // Auto-hide after 2.5 seconds
    setTimeout(() => {
      set({ randomForgeToastVisible: false });
    }, 2500);
  },

  hideRandomForgeToast: () => {
    set({ randomForgeToastVisible: false });
  },
  
  // Persistence methods
  restoreSavedState: () => {
    const savedState = loadCanvasState();
    if (savedState) {
      set({
        modules: savedState.modules,
        connections: savedState.connections,
        viewport: savedState.viewport || { x: 0, y: 0, zoom: 1 },
        gridEnabled: savedState.gridEnabled ?? true,
        selectedModuleId: null,
        selectedConnectionId: null,
        history: initialHistory,
        historyIndex: 0,
        hasLoadedSavedState: true,
      });
    } else {
      set({ hasLoadedSavedState: true });
    }
  },
  
  startFresh: () => {
    clearCanvasState();
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
      hasLoadedSavedState: true,
    });
  },
  
  markStateAsLoaded: () => {
    set({ hasLoadedSavedState: true });
  },
}));
