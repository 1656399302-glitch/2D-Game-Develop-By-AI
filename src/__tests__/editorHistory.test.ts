/**
 * Editor History Tests
 * 
 * Tests for useEditorHistory hook covering:
 * - AC-110-001: Undo reverses last action
 * - AC-110-002: Redo restores undone action
 * - AC-110-003: History supports minimum 50 steps
 * - AC-110-008: Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
 * - AC-110-013: Undo does NOT corrupt state
 * - AC-110-015: History clears on machine reload
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';
import { useEditorHistory, cloneHistoryState, compareHistoryStates } from '../hooks/useEditorHistory';
import { renderHook, act } from '@testing-library/react';

// Helper to reset store to initial state
const resetStore = () => {
  useMachineStore.setState({
    modules: [],
    connections: [],
    selectedModuleId: null,
    selectedConnectionId: null,
    isConnecting: false,
    connectionStart: null,
    connectionPreview: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    machineState: 'idle',
    history: [{ modules: [], connections: [] }],
    historyIndex: 0,
    gridEnabled: false,
    clipboardModules: [],
    clipboardConnections: [],
    generatedAttributes: null,
    randomForgeToastVisible: false,
    randomForgeToastMessage: '',
    hasLoadedSavedState: false,
    activationZoom: {
      isZooming: false,
      startViewport: null,
      targetViewport: null,
      startTime: 0,
      duration: 800,
    },
    activationModuleIndex: -1,
    activationStartTime: null,
    showExportModal: false,
    showCodexModal: false,
    connectionError: null,
  });
};

beforeEach(() => {
  resetStore();
});

afterEach(() => {
  resetStore();
});

describe('useEditorHistory', () => {
  describe('AC-110-001: Undo reverses last action', () => {
    it('should undo add module action', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Undo
      act(() => {
        result.current.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should undo delete module action', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Add a module first
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Delete the module
      act(() => {
        store.selectModule(moduleId);
        store.deleteSelected();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Undo delete
      act(() => {
        result.current.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      expect(useMachineStore.getState().modules[0].instanceId).toBe(moduleId);
    });

    it('should undo connection action', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Add two modules
      act(() => {
        store.addModule('core-furnace', 200, 200);
        store.addModule('energy-pipe', 400, 200);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      
      const module1 = useMachineStore.getState().modules[0];
      const module2 = useMachineStore.getState().modules[1];
      
      // Get port IDs
      const sourcePortId = module1.ports.find(p => p.type === 'output')?.id || `${module1.type}-output-0`;
      const targetPortId = module2.ports.find(p => p.type === 'input')?.id || `${module2.type}-input-0`;
      
      // Create connection
      act(() => {
        store.startConnection(module1.instanceId, sourcePortId);
        store.completeConnection(module2.instanceId, targetPortId);
      });
      
      expect(useMachineStore.getState().connections.length).toBe(1);
      
      // Undo connection
      act(() => {
        result.current.undo();
      });
      
      expect(useMachineStore.getState().connections.length).toBe(0);
    });
  });

  describe('AC-110-002: Redo restores undone action', () => {
    it('should redo after undo', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Undo
      act(() => {
        result.current.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Redo
      act(() => {
        result.current.redo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
    });

    it('should handle multiple undo/redo cycles', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Add three modules
      act(() => {
        store.addModule('core-furnace', 200, 200);
        store.addModule('energy-pipe', 300, 200);
        store.addModule('gear', 400, 200);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(3);
      
      // Undo all
      act(() => {
        result.current.undo();
        result.current.undo();
        result.current.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Redo all
      act(() => {
        result.current.redo();
        result.current.redo();
        result.current.redo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(3);
    });

    it('should clear redo stack when new action taken after undo', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Add module A
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      expect(useMachineStore.getState().modules[0].type).toBe('core-furnace');
      
      // Undo
      act(() => {
        result.current.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Add module B
      act(() => {
        store.addModule('energy-pipe', 300, 200);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      expect(useMachineStore.getState().modules[0].type).toBe('energy-pipe');
      
      // Redo should NOT restore module A (redo stack was cleared)
      act(() => {
        result.current.redo();
      });
      
      // Still only module B
      expect(useMachineStore.getState().modules.length).toBe(1);
      expect(useMachineStore.getState().modules[0].type).toBe('energy-pipe');
    });
  });

  describe('AC-110-003: History supports minimum 50 steps', () => {
    it('should support undo/redo with 50 modules', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Add 50 modules (50 actions)
      for (let i = 0; i < 50; i++) {
        act(() => {
          store.addModule('core-furnace', 200 + i * 10, 200);
        });
      }
      
      // Verify all 50 modules added
      expect(useMachineStore.getState().modules.length).toBe(50);
      
      // Check that we have undo available
      expect(result.current.canUndo()).toBe(true);
      expect(result.current.getUndoCount()).toBeGreaterThanOrEqual(50);
      
      // Undo all 50 steps
      for (let i = 0; i < 50; i++) {
        act(() => {
          result.current.undo();
        });
      }
      
      // Should be back to empty state
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should correctly track undo/redo counts', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Initially no undo/redo available
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(false);
      expect(result.current.getUndoCount()).toBe(0);
      expect(result.current.getRedoCount()).toBe(0);
      
      // Add 5 modules
      for (let i = 0; i < 5; i++) {
        act(() => {
          store.addModule('core-furnace', 200 + i * 10, 200);
        });
      }
      
      // 5 undos available, 0 redos
      expect(result.current.canUndo()).toBe(true);
      expect(result.current.canRedo()).toBe(false);
      expect(result.current.getUndoCount()).toBe(5);
      expect(result.current.getRedoCount()).toBe(0);
      
      // Undo 3 times
      act(() => {
        result.current.undo();
        result.current.undo();
        result.current.undo();
      });
      
      // 2 undos available, 3 redos
      expect(result.current.canUndo()).toBe(true);
      expect(result.current.canRedo()).toBe(true);
      expect(result.current.getUndoCount()).toBe(2);
      expect(result.current.getRedoCount()).toBe(3);
    });
  });

  describe('AC-110-008: Keyboard shortcuts (via store methods)', () => {
    it('should provide undo functionality', () => {
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Undo
      act(() => {
        store.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should provide redo functionality', () => {
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      // Undo
      act(() => {
        store.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Redo
      act(() => {
        store.redo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
    });

    it('should support undo/redo cycles', () => {
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      // Undo
      act(() => {
        store.undo();
      });
      
      // Redo
      act(() => {
        store.redo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
    });
  });

  describe('AC-110-013: Undo does NOT corrupt state', () => {
    it('should restore exact state after undo', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Create state with multiple modules and connections
      act(() => {
        store.addModule('core-furnace', 200, 200);
        store.addModule('energy-pipe', 400, 200);
        store.addModule('gear', 300, 300);
      });
      
      const module1 = useMachineStore.getState().modules[0];
      const module2 = useMachineStore.getState().modules[1];
      
      // Get port IDs
      const sourcePortId = module1.ports.find(p => p.type === 'output')?.id || `${module1.type}-output-0`;
      const targetPortId = module2.ports.find(p => p.type === 'input')?.id || `${module2.type}-input-0`;
      
      // Create connection
      act(() => {
        store.startConnection(module1.instanceId, sourcePortId);
        store.completeConnection(module2.instanceId, targetPortId);
      });
      
      // Store state before add
      const beforeModuleCount = useMachineStore.getState().modules.length;
      const beforeConnectionCount = useMachineStore.getState().connections.length;
      
      // Add another module
      act(() => {
        store.addModule('rune-node', 500, 200);
      });
      
      // Undo
      act(() => {
        result.current.undo();
      });
      
      // State should be restored
      expect(useMachineStore.getState().modules.length).toBe(beforeModuleCount);
      expect(useMachineStore.getState().connections.length).toBe(beforeConnectionCount);
    });

    it('should maintain history integrity after multiple operations', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Perform multiple operations
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      act(() => {
        store.addModule('energy-pipe', 300, 200);
      });
      
      const module2Id = useMachineStore.getState().modules[1].instanceId;
      
      // Undo second add
      act(() => {
        result.current.undo();
      });
      
      // Should have only first module
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Redo should restore correctly
      act(() => {
        result.current.redo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      expect(useMachineStore.getState().modules[1].instanceId).toBe(module2Id);
    });
  });

  describe('AC-110-015: History clears on machine reload', () => {
    it('should clear history when loading new machine', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Add some modules
      act(() => {
        store.addModule('core-furnace', 200, 200);
        store.addModule('energy-pipe', 300, 200);
      });
      
      // Verify history has entries
      expect(result.current.getHistory().length).toBeGreaterThan(1);
      
      // Load new machine (empty)
      act(() => {
        store.loadMachine([], []);
      });
      
      // History should be reset to initial state
      expect(result.current.getHistory().length).toBe(1);
      expect(result.current.getHistoryIndex()).toBe(0);
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(false);
    });

    it('should clear history when starting fresh', () => {
      const { result } = renderHook(() => useEditorHistory());
      const store = useMachineStore.getState();
      
      // Add some modules
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      // Verify history has entries
      expect(result.current.getHistory().length).toBeGreaterThan(1);
      
      // Start fresh
      act(() => {
        store.startFresh();
      });
      
      // History should be reset
      expect(result.current.getHistory().length).toBe(1);
      expect(result.current.getHistoryIndex()).toBe(0);
      expect(useMachineStore.getState().modules.length).toBe(0);
    });
  });

  describe('Helper functions', () => {
    describe('cloneHistoryState', () => {
      it('should create deep copy of state', () => {
        const original: ReturnType<typeof cloneHistoryState> = {
          modules: [
            {
              id: 'module-1',
              instanceId: 'inst-1',
              type: 'core-furnace',
              x: 100,
              y: 200,
              rotation: 0,
              scale: 1,
              flipped: false,
              ports: [
                { id: 'port-1', type: 'input', position: { x: 25, y: 50 } },
              ],
            },
          ],
          connections: [
            {
              id: 'conn-1',
              sourceModuleId: 'inst-1',
              sourcePortId: 'port-1',
              targetModuleId: 'inst-2',
              targetPortId: 'port-2',
              pathData: 'M0,0 L100,100',
            },
          ],
        };

        const cloned = cloneHistoryState(original);

        // Modify cloned state
        cloned.modules[0].x = 999;
        cloned.modules[0].ports[0].position.x = 888;
        cloned.connections[0].id = 'changed';

        // Original should be unchanged
        expect(original.modules[0].x).toBe(100);
        expect(original.modules[0].ports[0].position.x).toBe(25);
        expect(original.connections[0].id).toBe('conn-1');
      });
    });

    describe('compareHistoryStates', () => {
      it('should return true for identical states', () => {
        const state: ReturnType<typeof cloneHistoryState> = {
          modules: [
            {
              id: 'module-1',
              instanceId: 'inst-1',
              type: 'core-furnace',
              x: 100,
              y: 200,
              rotation: 0,
              scale: 1,
              flipped: false,
              ports: [
                { id: 'port-1', type: 'input', position: { x: 25, y: 50 } },
              ],
            },
          ],
          connections: [],
        };

        expect(compareHistoryStates(state, state)).toBe(true);
      });

      it('should return false for different states', () => {
        const state1: ReturnType<typeof cloneHistoryState> = {
          modules: [
            {
              id: 'module-1',
              instanceId: 'inst-1',
              type: 'core-furnace',
              x: 100,
              y: 200,
              rotation: 0,
              scale: 1,
              flipped: false,
              ports: [
                { id: 'port-1', type: 'input', position: { x: 25, y: 50 } },
              ],
            },
          ],
          connections: [],
        };

        const state2: ReturnType<typeof cloneHistoryState> = {
          modules: [
            {
              id: 'module-1',
              instanceId: 'inst-1',
              type: 'core-furnace',
              x: 150, // Different position
              y: 200,
              rotation: 0,
              scale: 1,
              flipped: false,
              ports: [
                { id: 'port-1', type: 'input', position: { x: 25, y: 50 } },
              ],
            },
          ],
          connections: [],
        };

        expect(compareHistoryStates(state1, state2)).toBe(false);
      });
    });
  });
});
