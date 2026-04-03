import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../../store/useMachineStore';
import { benchmark } from '../../utils/performanceUtils';
import { act } from '@testing-library/react';
import { Connection } from '../../types';

describe('AC4: Undo/Redo Performance', () => {
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

  describe('Undo Performance', () => {
    it('should complete single undo in under 100ms', () => {
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      const result = benchmark('Single undo', () => {
        act(() => {
          store.undo();
        });
      }, 10);
      
      expect(result.avgMs).toBeLessThan(100);
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should complete 10 undo operations in reasonable time', () => {
      const store = useMachineStore.getState();
      
      // Add 10 modules
      act(() => {
        for (let i = 0; i < 10; i++) {
          store.addModule('core-furnace', 100 + i * 10, 100 + i * 10);
        }
      });
      
      expect(useMachineStore.getState().modules.length).toBe(10);
      
      // Benchmark 10 undo operations
      const result = benchmark('10 undo operations', () => {
        for (let i = 0; i < 10; i++) {
          act(() => {
            store.undo();
          });
        }
      }, 1);
      
      expect(result.avgMs).toBeLessThan(500); // 10 * 100ms = 1000ms max
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should complete 20 undo operations in under 2 seconds', () => {
      const store = useMachineStore.getState();
      
      // Add 20 modules
      act(() => {
        for (let i = 0; i < 20; i++) {
          store.addModule('gear', 100 + (i % 5) * 80, 100 + Math.floor(i / 5) * 80);
        }
      });
      
      expect(useMachineStore.getState().modules.length).toBe(20);
      
      // Benchmark 20 undo operations
      const result = benchmark('20 undo operations', () => {
        for (let i = 0; i < 20; i++) {
          act(() => {
            store.undo();
          });
        }
      }, 1);
      
      // 20 operations should complete in under 2 seconds (2000ms)
      expect(result.avgMs).toBeLessThan(2000);
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should handle undo with complex machine state', () => {
      const store = useMachineStore.getState();
      
      // Create complex machine with modules and connections
      act(() => {
        for (let i = 0; i < 10; i++) {
          store.addModule('core-furnace', 100 + (i % 4) * 100, 100 + Math.floor(i / 4) * 100);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      
      // Add some connections
      const connections: Connection[] = [];
      for (let i = 0; i < 5; i++) {
        const sourceIdx = i;
        const targetIdx = (i + 1) % modules.length;
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: modules[sourceIdx].instanceId,
          sourcePortId: modules[sourceIdx].ports[0]?.id || 'p1',
          targetModuleId: modules[targetIdx].instanceId,
          targetPortId: modules[targetIdx].ports[0]?.id || 'p2',
          pathData: `M0,0 L100,100`,
        });
      }
      
      act(() => {
        useMachineStore.setState({ connections });
      });
      
      expect(useMachineStore.getState().connections.length).toBe(5);
      
      // Undo should handle both modules and connections
      const result = benchmark('Undo complex machine', () => {
        act(() => {
          store.undo();
        });
      }, 10);
      
      expect(result.avgMs).toBeLessThan(100);
    });
  });

  describe('Redo Performance', () => {
    it('should complete single redo in under 100ms', () => {
      const store = useMachineStore.getState();
      
      // Add and undo
      act(() => {
        store.addModule('core-furnace', 100, 100);
        store.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      const result = benchmark('Single redo', () => {
        act(() => {
          store.redo();
        });
      }, 10);
      
      expect(result.avgMs).toBeLessThan(100);
      expect(useMachineStore.getState().modules.length).toBe(1);
    });

    it('should complete 20 redo operations in under 2 seconds', () => {
      const store = useMachineStore.getState();
      
      // Add 20 modules and undo all
      act(() => {
        for (let i = 0; i < 20; i++) {
          store.addModule('gear', 100 + (i % 5) * 80, 100 + Math.floor(i / 5) * 80);
        }
      });
      
      // Undo all
      act(() => {
        for (let i = 0; i < 20; i++) {
          store.undo();
        }
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Benchmark 20 redo operations
      const result = benchmark('20 redo operations', () => {
        for (let i = 0; i < 20; i++) {
          act(() => {
            store.redo();
          });
        }
      }, 1);
      
      // 20 operations should complete in under 2 seconds (2000ms)
      expect(result.avgMs).toBeLessThan(2000);
      expect(useMachineStore.getState().modules.length).toBe(20);
    });
  });

  describe('Undo/Redo Edge Cases', () => {
    it('should handle undo when history is empty', () => {
      const store = useMachineStore.getState();
      
      // History index is at 0, cannot undo further
      expect(useMachineStore.getState().historyIndex).toBe(0);
      
      // Should not crash
      expect(() => {
        act(() => {
          store.undo();
        });
      }).not.toThrow();
      
      // History should still be valid
      expect(useMachineStore.getState().historyIndex).toBe(0);
    });

    it('should handle redo when at latest state', () => {
      const store = useMachineStore.getState();
      
      // Add a module - history index at 1
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      expect(useMachineStore.getState().historyIndex).toBe(1);
      expect(useMachineStore.getState().history.length).toBe(2);
      
      // At latest state, cannot redo further
      expect(() => {
        act(() => {
          store.redo();
        });
      }).not.toThrow();
      
      // History should still be valid
      expect(useMachineStore.getState().historyIndex).toBe(1);
    });

    it('should correctly alternate undo/redo', () => {
      const store = useMachineStore.getState();
      
      // Add module A
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      // Add module B
      act(() => {
        store.addModule('gear', 200, 100);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      
      // Undo B
      act(() => {
        store.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Redo B
      act(() => {
        store.redo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      
      // Undo B again
      act(() => {
        store.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Undo A
      act(() => {
        store.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Redo A
      act(() => {
        store.redo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Redo B
      act(() => {
        store.redo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(2);
    });
  });

  describe('History Management', () => {
    it('should limit history to 51 entries', () => {
      const store = useMachineStore.getState();
      
      // Add more than 50 modules
      act(() => {
        for (let i = 0; i < 60; i++) {
          store.addModule('core-furnace', 100 + i, 100 + i);
        }
      });
      
      // History should be limited to 51 entries (initial + 50 undoable actions)
      const history = useMachineStore.getState().history;
      expect(history.length).toBeLessThanOrEqual(51);
    });

    it('should saveToHistory after each meaningful action', () => {
      const store = useMachineStore.getState();
      
      // Initial state
      expect(useMachineStore.getState().history.length).toBe(1);
      
      // Add module - triggers saveToHistory
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      expect(useMachineStore.getState().history.length).toBe(2);
      
      // Batch update does NOT trigger saveToHistory (only position update)
      const modules = useMachineStore.getState().modules;
      act(() => {
        store.updateModulesBatch([{ instanceId: modules[0].instanceId, x: 200, y: 200 }]);
      });
      
      // History should still be 2 (batch doesn't save)
      expect(useMachineStore.getState().history.length).toBe(2);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet 100ms target for undo with 10+ modules', () => {
      const store = useMachineStore.getState();
      
      // Create machine with 10 modules
      act(() => {
        for (let i = 0; i < 10; i++) {
          store.addModule('core-furnace', 100 + i * 10, 100 + i * 10);
        }
      });
      
      // Measure undo performance
      const times: number[] = [];
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        act(() => {
          store.undo();
        });
        const end = performance.now();
        times.push(end - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      expect(avgTime).toBeLessThan(100);
      expect(maxTime).toBeLessThan(200); // No single operation should be too slow
    });

    it('should meet 100ms target for redo with 10+ modules', () => {
      const store = useMachineStore.getState();
      
      // Create and undo machine
      act(() => {
        for (let i = 0; i < 10; i++) {
          store.addModule('core-furnace', 100 + i * 10, 100 + i * 10);
        }
      });
      
      act(() => {
        for (let i = 0; i < 10; i++) {
          store.undo();
        }
      });
      
      // Measure redo performance
      const times: number[] = [];
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        act(() => {
          store.redo();
        });
        const end = performance.now();
        times.push(end - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      expect(avgTime).toBeLessThan(100);
      expect(maxTime).toBeLessThan(200);
    });
  });
});
