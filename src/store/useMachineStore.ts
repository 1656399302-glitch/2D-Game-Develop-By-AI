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
} from '../types';
import { calculateConnectionPath } from '../utils/connectionEngine';

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
  history: HistoryState[];
  historyIndex: number;
  gridEnabled: boolean;

  // Actions
  addModule: (type: ModuleType, x: number, y: number) => void;
  removeModule: (instanceId: string) => void;
  updateModulePosition: (instanceId: string, x: number, y: number) => void;
  updateModuleRotation: (instanceId: string, rotation: number) => void;
  selectModule: (instanceId: string | null) => void;
  selectConnection: (connectionId: string | null) => void;
  deleteSelected: () => void;
  
  // Connection actions
  startConnection: (moduleId: string, portId: string) => void;
  updateConnectionPreview: (x: number, y: number) => void;
  completeConnection: (targetModuleId: string, targetPortId: string) => void;
  cancelConnection: () => void;
  removeConnection: (connectionId: string) => void;
  
  // Viewport actions
  setViewport: (viewport: Partial<ViewportState>) => void;
  resetViewport: () => void;
  
  // Machine state
  setMachineState: (state: MachineState) => void;
  
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
}

const GRID_SIZE = 20;

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
  history: initialHistory,
  historyIndex: 0,
  gridEnabled: true,

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
      ports: getDefaultPorts(type),
    };
    
    // First, set the new state
    set((state) => ({
      modules: [...state.modules, newModule],
      selectedModuleId: newModule.instanceId,
    }));
    
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

    set((state) => ({
      modules: state.modules.map((m) =>
        m.instanceId === instanceId ? { ...m, x: newX, y: newY } : m
      ),
      connections: updatedConnections,
    }));
    // NOTE: Position changes don't save to history (too noisy - happens on every drag)
  },

  updateModuleRotation: (instanceId, rotation) => {
    // First, set the new state
    set((state) => ({
      modules: state.modules.map((m) =>
        m.instanceId === instanceId ? { ...m, rotation: (m.rotation + rotation) % 360 } : m
      ),
    }));
    
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

  startConnection: (moduleId, portId) => {
    set({
      isConnecting: true,
      connectionStart: { moduleId, portId },
      connectionPreview: null,
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

    // Can't connect same type ports
    if (sourcePort.type === targetPort.type) {
      set({ isConnecting: false, connectionStart: null, connectionPreview: null });
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
      set({ isConnecting: false, connectionStart: null, connectionPreview: null });
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
    set((state) => ({
      connections: [...state.connections, newConnection],
      isConnecting: false,
      connectionStart: null,
      connectionPreview: null,
    }));
    
    // THEN save to history (captures the new state)
    get().saveToHistory();
  },

  cancelConnection: () => {
    set({ isConnecting: false, connectionStart: null, connectionPreview: null });
  },

  removeConnection: (connectionId) => {
    // First, set the new state
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== connectionId),
      selectedConnectionId: state.selectedConnectionId === connectionId ? null : state.selectedConnectionId,
    }));
    
    // THEN save to history (captures the new state)
    get().saveToHistory();
  },

  setViewport: (viewport) => {
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
    }));
  },

  resetViewport: () => {
    set({ viewport: { x: 0, y: 0, zoom: 1 } });
  },

  setMachineState: (state) => {
    set({ machineState: state });
  },

  toggleGrid: () => {
    set((state) => ({ gridEnabled: !state.gridEnabled }));
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
    // First, set the new state
    set({
      modules: [],
      connections: [],
      selectedModuleId: null,
      selectedConnectionId: null,
    });
    
    // THEN save to history (captures the new state)
    get().saveToHistory();
  },

  loadMachine: (modules, connections) => {
    set({
      modules,
      connections,
      selectedModuleId: null,
      selectedConnectionId: null,
      history: initialHistory,
      historyIndex: 0,
    });
  },
}));
