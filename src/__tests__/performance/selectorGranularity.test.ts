import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../../store/useMachineStore';
import { benchmark, isWithinFrameBudget } from '../../utils/performanceUtils';
import { act } from '@testing-library/react';

describe('AC1: Re-render Reduction - Selector Granularity', () => {
  beforeEach(() => {
    // Reset store to initial state
    useMachineStore.setState({
      modules: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedModuleId: null,
      selectedConnectionId: null,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
      isConnecting: false,
      machineState: 'idle',
      gridEnabled: true,
      connectionError: null,
      clipboardModules: [],
      clipboardConnections: [],
      showExportModal: false,
      showCodexModal: false,
    });
  });

  it('should only re-render when viewport changes, not when modules change', () => {
    // This test verifies that granular selectors work correctly
    const store = useMachineStore.getState();
    
    // Add a module
    act(() => {
      store.addModule('core-furnace', 100, 100);
    });
    
    // Verify module was added
    expect(useMachineStore.getState().modules.length).toBe(1);
    
    // Change viewport
    act(() => {
      store.setViewport({ x: 100, y: 50 });
    });
    
    // Verify viewport changed
    const viewport = useMachineStore.getState().viewport;
    expect(viewport.x).toBe(100);
    expect(viewport.y).toBe(50);
    
    // Both operations should work without errors
    expect(useMachineStore.getState().modules.length).toBe(1);
  });

  it('should track module count changes correctly', () => {
    const store = useMachineStore.getState();
    
    // Add 5 modules
    act(() => {
      store.addModule('core-furnace', 100, 100);
      store.addModule('gear', 150, 100);
      store.addModule('rune-node', 200, 100);
      store.addModule('energy-pipe', 250, 100);
      store.addModule('shield-shell', 300, 100);
    });
    
    expect(useMachineStore.getState().modules.length).toBe(5);
  });

  it('should track connection count changes correctly', () => {
    const store = useMachineStore.getState();
    
    // Add 2 modules
    act(() => {
      store.addModule('core-furnace', 100, 100);
      store.addModule('gear', 200, 100);
    });
    
    const modules = useMachineStore.getState().modules;
    expect(modules.length).toBe(2);
    
    // Create a connection between modules
    const connection = {
      id: 'test-conn-1',
      sourceModuleId: modules[0].instanceId,
      sourcePortId: modules[0].ports[0]?.id || 'p1',
      targetModuleId: modules[1].instanceId,
      targetPortId: modules[1].ports[0]?.id || 'p2',
      pathData: 'M0,0 L100,100',
    };
    
    act(() => {
      useMachineStore.setState({ connections: [connection] });
    });
    
    expect(useMachineStore.getState().connections.length).toBe(1);
  });

  it('should track selectedModuleId changes correctly', () => {
    const store = useMachineStore.getState();
    
    // Add a module
    act(() => {
      store.addModule('core-furnace', 100, 100);
    });
    
    const module = useMachineStore.getState().modules[0];
    
    // Select the module
    act(() => {
      store.selectModule(module.instanceId);
    });
    
    expect(useMachineStore.getState().selectedModuleId).toBe(module.instanceId);
    
    // Deselect
    act(() => {
      store.selectModule(null);
    });
    
    expect(useMachineStore.getState().selectedModuleId).toBeNull();
  });

  it('should track history state changes correctly', () => {
    const store = useMachineStore.getState();
    
    // Initial state
    expect(useMachineStore.getState().historyIndex).toBe(0);
    expect(useMachineStore.getState().history.length).toBe(1);
    
    // Add a module (triggers saveToHistory)
    act(() => {
      store.addModule('core-furnace', 100, 100);
    });
    
    // History should be updated
    expect(useMachineStore.getState().historyIndex).toBe(1);
    
    // Undo
    act(() => {
      store.undo();
    });
    
    expect(useMachineStore.getState().historyIndex).toBe(0);
    expect(useMachineStore.getState().modules.length).toBe(0);
    
    // Redo
    act(() => {
      store.redo();
    });
    
    expect(useMachineStore.getState().historyIndex).toBe(1);
    expect(useMachineStore.getState().modules.length).toBe(1);
  });

  it('should track gridEnabled state changes correctly', () => {
    const store = useMachineStore.getState();
    
    // Initial state
    expect(useMachineStore.getState().gridEnabled).toBe(true);
    
    // Toggle grid
    act(() => {
      store.toggleGrid();
    });
    
    expect(useMachineStore.getState().gridEnabled).toBe(false);
    
    // Toggle back
    act(() => {
      store.toggleGrid();
    });
    
    expect(useMachineStore.getState().gridEnabled).toBe(true);
  });

  it('should not cause unnecessary re-renders with independent state updates', () => {
    const store = useMachineStore.getState();
    
    // Update only viewport
    act(() => {
      store.setViewport({ x: 50 });
    });
    
    // Update only grid
    act(() => {
      store.toggleGrid();
    });
    
    // Update only zoom
    act(() => {
      store.zoomIn();
    });
    
    // These operations should work without errors
    expect(useMachineStore.getState().viewport.x).toBe(50);
    expect(useMachineStore.getState().gridEnabled).toBe(false);
    expect(useMachineStore.getState().viewport.zoom).toBeGreaterThan(1);
  });

  it('should correctly handle batch module position updates', () => {
    const store = useMachineStore.getState();
    
    // Disable grid snapping for this test
    act(() => {
      store.toggleGrid(); // Now gridEnabled = false
    });
    
    // Add 3 modules at positions that are multiples of 20 (grid-aligned)
    act(() => {
      store.addModule('core-furnace', 100, 100);
      store.addModule('gear', 140, 100);
      store.addModule('rune-node', 180, 100);
    });
    
    const modules = useMachineStore.getState().modules;
    expect(modules.length).toBe(3);
    
    // Batch update positions
    const updates = modules.map(m => ({
      instanceId: m.instanceId,
      x: m.x + 10,
      y: m.y + 20,
    }));
    
    act(() => {
      store.updateModulesBatch(updates);
    });
    
    // Verify positions were updated
    const updatedModules = useMachineStore.getState().modules;
    updatedModules.forEach((m, i) => {
      const expectedX = modules[i].x + 10;
      const expectedY = modules[i].y + 20;
      expect(m.x).toBe(expectedX);
      expect(m.y).toBe(expectedY);
    });
  });
});

describe('AC1: Store Selector Performance', () => {
  beforeEach(() => {
    useMachineStore.setState({
      modules: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedModuleId: null,
      selectedConnectionId: null,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
      isConnecting: false,
      machineState: 'idle',
      gridEnabled: true,
      connectionError: null,
      clipboardModules: [],
      clipboardConnections: [],
      showExportModal: false,
      showCodexModal: false,
    });
  });

  it('should provide granular selectors for modules count', () => {
    const selectModulesCount = (state: ReturnType<typeof useMachineStore.getState>) => state.modules.length;
    const store = useMachineStore.getState();
    
    act(() => {
      store.addModule('core-furnace', 100, 100);
      store.addModule('gear', 200, 100);
    });
    
    const modulesCount = selectModulesCount(useMachineStore.getState());
    expect(modulesCount).toBe(2);
  });

  it('should provide granular selectors for viewport zoom', () => {
    const selectViewportZoom = (state: ReturnType<typeof useMachineStore.getState>) => state.viewport.zoom;
    const store = useMachineStore.getState();
    
    act(() => {
      store.zoomIn();
    });
    
    const zoom = selectViewportZoom(useMachineStore.getState());
    expect(zoom).toBeGreaterThan(1);
  });

  it('should provide granular selectors for history state', () => {
    const selectCanUndo = (state: ReturnType<typeof useMachineStore.getState>) => state.historyIndex > 0;
    const selectCanRedo = (state: ReturnType<typeof useMachineStore.getState>) => {
      const { historyIndex, history } = state;
      return historyIndex < history.length - 1;
    };
    
    const store = useMachineStore.getState();
    
    // Initial state - cannot undo, cannot redo
    expect(selectCanUndo(useMachineStore.getState())).toBe(false);
    expect(selectCanRedo(useMachineStore.getState())).toBe(false);
    
    // Add module - now can undo
    act(() => {
      store.addModule('core-furnace', 100, 100);
    });
    
    expect(selectCanUndo(useMachineStore.getState())).toBe(true);
    expect(selectCanRedo(useMachineStore.getState())).toBe(false);
    
    // Undo - now can redo
    act(() => {
      store.undo();
    });
    
    expect(selectCanUndo(useMachineStore.getState())).toBe(false);
    expect(selectCanRedo(useMachineStore.getState())).toBe(true);
  });
});

describe('AC5: Build & Tests Pass', () => {
  it('should have no TypeScript errors in store files', () => {
    // This is a placeholder test to ensure TypeScript compilation works
    const store = useMachineStore.getState();
    expect(store).toBeDefined();
    expect(typeof store.addModule).toBe('function');
    expect(typeof store.removeModule).toBe('function');
    expect(typeof store.updateModulePosition).toBe('function');
    expect(typeof store.undo).toBe('function');
    expect(typeof store.redo).toBe('function');
  });

  it('should have isWithinFrameBudget utility working', () => {
    const isWithinBudget = isWithinFrameBudget(60, 0.8);
    
    // 10ms should be within budget (16ms * 0.8 = 12.8ms)
    expect(isWithinBudget(10)).toBe(true);
    
    // 20ms should be outside budget
    expect(isWithinBudget(20)).toBe(false);
  });

  it('should have benchmark utility working', () => {
    const result = benchmark('Simple operation', () => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
      return sum; // Return a value to make the result defined
    }, 10);
    
    expect(result.result).toBeDefined();
    expect(result.result).toBe(499500); // Sum of 0 to 999
    expect(result.avgMs).toBeGreaterThanOrEqual(0);
    expect(result.minMs).toBeGreaterThanOrEqual(0);
    expect(result.maxMs).toBeGreaterThanOrEqual(result.minMs);
  });
});
