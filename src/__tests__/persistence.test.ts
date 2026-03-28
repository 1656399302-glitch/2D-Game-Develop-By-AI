import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  saveCanvasState, 
  loadCanvasState, 
  clearCanvasState, 
  hasSavedState,
  CanvasStateData 
} from '../utils/localStorage';
import { useMachineStore } from '../store/useMachineStore';
import { PlacedModule, Connection } from '../types';

// Setup fake timers for debounce testing
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('localStorage utilities', () => {
  const testState: CanvasStateData = {
    modules: [
      {
        id: 'test-module-1',
        instanceId: 'test-instance-1',
        type: 'core-furnace',
        x: 100,
        y: 200,
        rotation: 45,
        scale: 1,
        flipped: false,
        ports: [
          { id: 'port-1', type: 'input', position: { x: 25, y: 50 } },
          { id: 'port-2', type: 'output', position: { x: 75, y: 50 } },
        ],
      },
    ],
    connections: [
      {
        id: 'test-connection-1',
        sourceModuleId: 'test-instance-1',
        sourcePortId: 'port-2',
        targetModuleId: 'test-instance-2',
        targetPortId: 'port-1',
        pathData: 'M 100,200 Q 200,300 300,400',
      },
    ],
    viewport: { x: 0, y: 0, zoom: 1 },
    gridEnabled: true,
    savedAt: Date.now(),
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('saveCanvasState', () => {
    it('should save canvas state to localStorage', () => {
      const result = saveCanvasState(testState);
      expect(result).toBe(true);
      expect(localStorage.getItem('arcane-canvas-state')).toBeTruthy();
    });

    it('should serialize state to JSON', () => {
      saveCanvasState(testState);
      const stored = localStorage.getItem('arcane-canvas-state');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.modules).toHaveLength(1);
      expect(parsed.connections).toHaveLength(1);
      expect(parsed.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it('should overwrite previous state', () => {
      saveCanvasState(testState);
      const newState = { ...testState, modules: [] };
      saveCanvasState(newState);
      
      const loaded = loadCanvasState();
      expect(loaded?.modules).toHaveLength(0);
    });

    it('should handle empty modules array', () => {
      const emptyState = { ...testState, modules: [] };
      const result = saveCanvasState(emptyState);
      expect(result).toBe(true);
      
      const loaded = loadCanvasState();
      expect(loaded?.modules).toHaveLength(0);
    });
  });

  describe('loadCanvasState', () => {
    it('should return null when no state is saved', () => {
      const result = loadCanvasState();
      expect(result).toBeNull();
    });

    it('should return saved state when it exists', () => {
      saveCanvasState(testState);
      const result = loadCanvasState();
      
      expect(result).not.toBeNull();
      expect(result?.modules).toHaveLength(1);
      expect(result?.connections).toHaveLength(1);
    });

    it('should restore module properties correctly', () => {
      saveCanvasState(testState);
      const result = loadCanvasState();
      
      const module = result?.modules[0];
      expect(module?.id).toBe('test-module-1');
      expect(module?.instanceId).toBe('test-instance-1');
      expect(module?.type).toBe('core-furnace');
      expect(module?.x).toBe(100);
      expect(module?.y).toBe(200);
      expect(module?.rotation).toBe(45);
    });

    it('should restore connection properties correctly', () => {
      saveCanvasState(testState);
      const result = loadCanvasState();
      
      const connection = result?.connections[0];
      expect(connection?.id).toBe('test-connection-1');
      expect(connection?.sourceModuleId).toBe('test-instance-1');
      expect(connection?.pathData).toBe('M 100,200 Q 200,300 300,400');
    });

    it('should restore viewport state', () => {
      const stateWithViewport = { 
        ...testState, 
        viewport: { x: 50, y: 100, zoom: 0.5 } 
      };
      saveCanvasState(stateWithViewport);
      const result = loadCanvasState();
      
      expect(result?.viewport).toEqual({ x: 50, y: 100, zoom: 0.5 });
    });
  });

  describe('clearCanvasState', () => {
    it('should remove state from localStorage', () => {
      saveCanvasState(testState);
      expect(localStorage.getItem('arcane-canvas-state')).toBeTruthy();
      
      const result = clearCanvasState();
      expect(result).toBe(true);
      expect(localStorage.getItem('arcane-canvas-state')).toBeNull();
    });

    it('should return true even when no state exists', () => {
      const result = clearCanvasState();
      expect(result).toBe(true);
    });
  });

  describe('hasSavedState', () => {
    it('should return false when no state is saved', () => {
      expect(hasSavedState()).toBe(false);
    });

    it('should return true when state exists', () => {
      saveCanvasState(testState);
      expect(hasSavedState()).toBe(true);
    });

    it('should return false after clearing state', () => {
      saveCanvasState(testState);
      clearCanvasState();
      expect(hasSavedState()).toBe(false);
    });
  });
});

describe('useMachineStore persistence integration', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store state
    useMachineStore.setState({
      modules: [],
      connections: [],
      selectedModuleId: null,
      selectedConnectionId: null,
      viewport: { x: 0, y: 0, zoom: 1 },
      gridEnabled: true,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
      generatedAttributes: null,
      hasLoadedSavedState: false,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    useMachineStore.setState({
      modules: [],
      connections: [],
      selectedModuleId: null,
      selectedConnectionId: null,
      viewport: { x: 0, y: 0, zoom: 1 },
      gridEnabled: true,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
      generatedAttributes: null,
      hasLoadedSavedState: false,
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('restoreSavedState', () => {
    it('should restore state from localStorage', () => {
      const testModules: PlacedModule[] = [
        {
          id: 'test',
          instanceId: 'test-instance',
          type: 'gear',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      saveCanvasState({
        modules: testModules,
        connections: [],
        viewport: { x: 10, y: 20, zoom: 0.8 },
        gridEnabled: false,
        savedAt: Date.now(),
      });
      
      useMachineStore.getState().restoreSavedState();
      
      const state = useMachineStore.getState();
      expect(state.modules).toHaveLength(1);
      expect(state.modules[0].x).toBe(100);
      expect(state.modules[0].y).toBe(100);
      expect(state.viewport).toEqual({ x: 10, y: 20, zoom: 0.8 });
      expect(state.gridEnabled).toBe(false);
    });

    it('should set hasLoadedSavedState to true', () => {
      saveCanvasState({
        modules: [],
        connections: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        gridEnabled: true,
        savedAt: Date.now(),
      });
      
      useMachineStore.getState().restoreSavedState();
      
      expect(useMachineStore.getState().hasLoadedSavedState).toBe(true);
    });

    it('should handle empty saved state', () => {
      useMachineStore.getState().restoreSavedState();
      
      const state = useMachineStore.getState();
      expect(state.modules).toHaveLength(0);
      expect(state.connections).toHaveLength(0);
      expect(state.hasLoadedSavedState).toBe(true);
    });
  });

  describe('startFresh', () => {
    it('should clear localStorage', () => {
      const testModules: PlacedModule[] = [
        {
          id: 'test',
          instanceId: 'test-instance',
          type: 'gear',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      saveCanvasState({
        modules: testModules,
        connections: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        gridEnabled: true,
        savedAt: Date.now(),
      });
      
      expect(hasSavedState()).toBe(true);
      
      useMachineStore.getState().startFresh();
      
      expect(hasSavedState()).toBe(false);
    });

    it('should reset state to defaults', () => {
      useMachineStore.setState({
        modules: [{ id: 'test' } as PlacedModule],
        connections: [{ id: 'conn' } as Connection],
        viewport: { x: 100, y: 100, zoom: 2 },
        gridEnabled: false,
      });
      
      useMachineStore.getState().startFresh();
      
      const state = useMachineStore.getState();
      expect(state.modules).toHaveLength(0);
      expect(state.connections).toHaveLength(0);
      expect(state.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
      expect(state.gridEnabled).toBe(true);
      expect(state.hasLoadedSavedState).toBe(true);
    });
  });

  describe('auto-save on state changes', () => {
    it('should trigger auto-save when adding a module', () => {
      vi.advanceTimersByTime(0);
      
      useMachineStore.getState().addModule('core-furnace', 200, 300);
      vi.advanceTimersByTime(600);
      
      expect(hasSavedState()).toBe(true);
      
      const saved = loadCanvasState();
      expect(saved?.modules).toHaveLength(1);
      expect(saved?.modules[0].type).toBe('core-furnace');
    });

    it('should trigger auto-save when removing a module', () => {
      vi.advanceTimersByTime(0);
      
      useMachineStore.getState().addModule('gear', 100, 100);
      vi.advanceTimersByTime(600);
      
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.getState().removeModule(moduleId);
      vi.advanceTimersByTime(600);
      
      const saved = loadCanvasState();
      expect(saved?.modules).toHaveLength(0);
    });

    it('should save current viewport when zoom changes', () => {
      vi.advanceTimersByTime(0);
      
      useMachineStore.getState().zoomIn();
      vi.advanceTimersByTime(600);
      
      const saved = loadCanvasState();
      expect(saved?.viewport.zoom).toBeGreaterThan(1);
    });

    it('should save grid state when toggled', () => {
      vi.advanceTimersByTime(0);
      
      useMachineStore.getState().toggleGrid();
      vi.advanceTimersByTime(600);
      
      const saved = loadCanvasState();
      expect(saved?.gridEnabled).toBe(false);
    });
  });
});
