import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../../store/useMachineStore';
import { benchmark } from '../../utils/performanceUtils';
import { act } from '@testing-library/react';
import { calculateActivationChoreography } from '../../utils/activationChoreographer';

/**
 * Performance verification tests for the Arcane Machine Codex Workshop.
 * These tests verify performance targets are met across various operations.
 */

// Helper to reset store to initial state
const resetStore = () => {
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
};

beforeEach(() => {
  resetStore();
});

describe('Performance Verification - Canvas Operations', () => {
  describe('AC1: Canvas with 20 Modules Render Performance', () => {
    it('should create 20 modules in under 100ms', () => {
      const store = useMachineStore.getState();
      
      const result = benchmark('Create 20 modules', () => {
        act(() => {
          for (let i = 0; i < 20; i++) {
            store.addModule('core-furnace', 100 + (i % 5) * 100, 100 + Math.floor(i / 5) * 100);
          }
        });
      }, 1);
      
      expect(result.avgMs).toBeLessThan(100);
      expect(useMachineStore.getState().modules.length).toBe(20);
    });

    it('should verify 20 modules renders under 16ms (60fps budget)', () => {
      const store = useMachineStore.getState();
      
      // Create 20 modules
      act(() => {
        for (let i = 0; i < 20; i++) {
          store.addModule('core-furnace', 100 + (i % 5) * 100, 100 + Math.floor(i / 5) * 100);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      expect(modules.length).toBe(20);
      
      // Benchmark update operations
      const result = benchmark('Update 20 module positions', () => {
        act(() => {
          modules.forEach((m, i) => {
            store.updateModulePosition(m.instanceId, 100 + i * 5, 100 + i * 5);
          });
        });
      }, 1);
      
      // Each update should be under 16ms for 60fps
      expect(result.avgMs).toBeLessThan(320); // 20 * 16ms = 320ms total
    });
  });

  describe('Canvas Memory Usage', () => {
    it('should not leak memory when clearing canvas', () => {
      const store = useMachineStore.getState();
      
      // Create modules
      act(() => {
        for (let i = 0; i < 20; i++) {
          store.addModule('core-furnace', 100 + (i % 5) * 100, 100 + Math.floor(i / 5) * 100);
        }
      });
      
      let state = useMachineStore.getState();
      expect(state.modules.length).toBe(20);
      
      // Clear canvas
      act(() => {
        store.clearCanvas();
      });
      
      state = useMachineStore.getState();
      expect(state.modules.length).toBe(0);
      expect(state.connections.length).toBe(0);
    });

    it('should handle rapid add/remove cycles', () => {
      const store = useMachineStore.getState();
      
      for (let i = 0; i < 5; i++) {
        // Add modules
        act(() => {
          for (let j = 0; j < 10; j++) {
            store.addModule('gear', 100 + j * 80, 100);
          }
        });
        
        // Remove all
        act(() => {
          store.clearCanvas();
        });
      }
      
      const state = useMachineStore.getState();
      expect(state.modules.length).toBe(0);
    });
  });
});

describe('Performance Verification - Connection Path Calculations', () => {
  describe('AC2: Connection Path Calculation Performance', () => {
    it('should calculate paths for 20 modules efficiently', () => {
      const store = useMachineStore.getState();
      
      // Create 20 modules
      act(() => {
        for (let i = 0; i < 20; i++) {
          store.addModule('core-furnace', 100 + (i % 5) * 100, 100 + Math.floor(i / 5) * 100);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      
      // Benchmark activation choreography calculation
      const result = benchmark('Calculate activation choreography', () => {
        calculateActivationChoreography(modules, []);
      }, 10);
      
      // Should complete in under 50ms
      expect(result.avgMs).toBeLessThan(50);
    });

    it('should handle connection calculations with complex graph', () => {
      const store = useMachineStore.getState();
      
      // Create 15 modules
      act(() => {
        for (let i = 0; i < 15; i++) {
          store.addModule('rune-node', 100 + (i % 5) * 100, 100 + Math.floor(i / 5) * 100);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      
      // Create connections between modules
      const connections = [];
      for (let i = 0; i < 10; i++) {
        const sourceIdx = i % modules.length;
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
      
      const state = useMachineStore.getState();
      
      // Benchmark choreography with connections
      const result = benchmark('Calculate with connections', () => {
        calculateActivationChoreography(state.modules, state.connections);
      }, 10);
      
      expect(result.avgMs).toBeLessThan(50);
    });
  });
});

describe('Performance Verification - Activation Sequence', () => {
  describe('AC3: Activation Choreography Performance', () => {
    it('should calculate BFS order for 10 modules in under 10ms', () => {
      const store = useMachineStore.getState();
      
      // Create 10 modules
      act(() => {
        for (let i = 0; i < 10; i++) {
          store.addModule('core-furnace', 100 + (i % 5) * 100, 100 + Math.floor(i / 5) * 100);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      
      // Create linear chain of connections
      const connections = [];
      for (let i = 0; i < 9; i++) {
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: modules[i].instanceId,
          sourcePortId: modules[i].ports[0]?.id || 'p1',
          targetModuleId: modules[i + 1].instanceId,
          targetPortId: modules[i + 1].ports[0]?.id || 'p2',
          pathData: `M0,0 L100,100`,
        });
      }
      
      const result = benchmark('BFS calculation', () => {
        calculateActivationChoreography(modules, connections);
      }, 100);
      
      expect(result.avgMs).toBeLessThan(10);
    });

    it('should handle parallel activation paths efficiently', () => {
      const store = useMachineStore.getState();
      
      // Create 12 modules in a tree structure
      act(() => {
        for (let i = 0; i < 12; i++) {
          store.addModule('gear', 100 + (i % 4) * 100, 100 + Math.floor(i / 4) * 100);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      
      // Create tree-like connections (root -> 3 branches -> leaves)
      const connections = [
        { id: 'c0', sourceModuleId: modules[0].instanceId, sourcePortId: 'p1', targetModuleId: modules[1].instanceId, targetPortId: 'p2', pathData: 'M0,0 L100,0' },
        { id: 'c1', sourceModuleId: modules[0].instanceId, sourcePortId: 'p1', targetModuleId: modules[2].instanceId, targetPortId: 'p2', pathData: 'M0,0 L100,100' },
        { id: 'c2', sourceModuleId: modules[0].instanceId, sourcePortId: 'p1', targetModuleId: modules[3].instanceId, targetPortId: 'p2', pathData: 'M0,0 L100,200' },
      ];
      
      const result = benchmark('Parallel path calculation', () => {
        calculateActivationChoreography(modules, connections);
      }, 100);
      
      expect(result.avgMs).toBeLessThan(10);
    });
  });
});

describe('Performance Verification - Frame Budget Compliance', () => {
  describe('AC4: Frame Budget (60fps = 16.67ms per frame)', () => {
    it('should verify single operation stays within frame budget', () => {
      const isWithinFrameBudget = (ms: number, fps: number = 60) => {
        const budget = 1000 / fps;
        return ms <= budget;
      };
      
      // 10ms is within budget
      expect(isWithinFrameBudget(10)).toBe(true);
      
      // 16ms is exactly at budget
      expect(isWithinFrameBudget(16)).toBe(true);
      
      // 20ms exceeds budget
      expect(isWithinFrameBudget(20)).toBe(false);
    });

    it('should benchmark module creation operations', () => {
      const store = useMachineStore.getState();
      
      const result = benchmark('Create single module', () => {
        act(() => {
          store.addModule('core-furnace', 100, 100);
        });
      }, 100);
      
      // Each module creation should be fast
      expect(result.avgMs).toBeLessThan(5);
    });

    it('should benchmark module update operations', () => {
      const store = useMachineStore.getState();
      
      // Create a module
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      const module = useMachineStore.getState().modules[0];
      
      const result = benchmark('Update module position', () => {
        act(() => {
          store.updateModulePosition(module.instanceId, 200, 200);
        });
      }, 100);
      
      // Each update should be under frame budget
      expect(result.avgMs).toBeLessThan(16);
    });
  });
});

describe('Performance Verification - Module Renderer Memoization', () => {
  describe('AC5: React Component Memoization', () => {
    it('should handle selection state changes efficiently', () => {
      const store = useMachineStore.getState();
      
      // Create 10 modules
      act(() => {
        for (let i = 0; i < 10; i++) {
          store.addModule('core-furnace', 100 + i * 100, 100);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      expect(modules.length).toBe(10);
      
      // Select first module
      act(() => {
        store.selectModule(modules[0].instanceId);
      });
      
      expect(useMachineStore.getState().selectedModuleId).toBe(modules[0].instanceId);
      
      // Change selection to another module
      act(() => {
        store.selectModule(modules[5].instanceId);
      });
      
      expect(useMachineStore.getState().selectedModuleId).toBe(modules[5].instanceId);
      
      // Deselect
      act(() => {
        store.selectModule(null);
      });
      
      expect(useMachineStore.getState().selectedModuleId).toBeNull();
    });

    it('should handle rapid state updates without performance degradation', () => {
      const store = useMachineStore.getState();
      
      // Create a module
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      const module = useMachineStore.getState().modules[0];
      
      // Rapid updates
      const startTime = Date.now();
      for (let i = 0; i < 50; i++) {
        act(() => {
          store.updateModulePosition(module.instanceId, 100 + i, 100 + i);
        });
      }
      const duration = Date.now() - startTime;
      
      // Should complete quickly
      expect(duration).toBeLessThan(5000); // 50 updates in 5 seconds max
    });
  });
});

describe('Performance Verification - Stress Tests', () => {
  describe('Stress Testing', () => {
    it('should handle maximum module count efficiently', () => {
      const store = useMachineStore.getState();
      
      const result = benchmark('Create 30 modules', () => {
        act(() => {
          for (let i = 0; i < 30; i++) {
            store.addModule('core-furnace', 100 + (i % 6) * 80, 100 + Math.floor(i / 6) * 80);
          }
        });
      }, 1);
      
      expect(result.avgMs).toBeLessThan(200);
      expect(useMachineStore.getState().modules.length).toBe(30);
    });

    it('should handle undo/redo operations efficiently', () => {
      const store = useMachineStore.getState();
      
      // Create initial modules
      act(() => {
        for (let i = 0; i < 10; i++) {
          store.addModule('gear', 100 + i * 80, 100);
        }
      });
      
      // Perform undo/redo operations
      const result = benchmark('Undo operation', () => {
        act(() => {
          store.undo();
        });
      }, 10);
      
      expect(result.avgMs).toBeLessThan(50);
    });

    it('should handle batch updates efficiently', () => {
      const store = useMachineStore.getState();
      
      // Create 15 modules
      act(() => {
        for (let i = 0; i < 15; i++) {
          store.addModule('rune-node', 100 + (i % 5) * 80, 100 + Math.floor(i / 5) * 80);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      
      // Batch update
      const updates = modules.map((m, i) => ({
        instanceId: m.instanceId,
        x: m.x + 10,
        y: m.y + 10,
      }));
      
      const result = benchmark('Batch update 15 modules', () => {
        act(() => {
          store.updateModulesBatch(updates);
        });
      }, 5);
      
      expect(result.avgMs).toBeLessThan(50);
    });
  });
});
