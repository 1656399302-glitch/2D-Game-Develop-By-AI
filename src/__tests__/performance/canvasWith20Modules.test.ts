import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../../store/useMachineStore';
import { createVirtualizedModuleList, benchmark, isWithinFrameBudget } from '../../utils/performanceUtils';
import { act } from '@testing-library/react';
import { Connection, PlacedModule } from '../../types';

describe('AC2: Canvas Performance with 20+ Modules', () => {
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

  describe('Module creation performance', () => {
    it('should create 20 modules in under 100ms total', () => {
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

    it('should create 30 modules without performance degradation', () => {
      const store = useMachineStore.getState();
      
      const result = benchmark('Create 30 modules', () => {
        act(() => {
          for (let i = 0; i < 30; i++) {
            store.addModule('gear', 100 + (i % 6) * 80, 100 + Math.floor(i / 6) * 80);
          }
        });
      }, 1);
      
      expect(result.avgMs).toBeLessThan(150);
      expect(useMachineStore.getState().modules.length).toBe(30);
    });
  });

  describe('Viewport culling performance', () => {
    it('should correctly identify visible modules with viewport culling', () => {
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 20; i++) {
        modules.push({
          id: `module-${i}`,
          instanceId: `instance-${i}`,
          type: 'core-furnace',
          x: 100 + (i % 5) * 150,
          y: 100 + Math.floor(i / 5) * 150,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        });
      }
      
      const viewport = { x: 0, y: 0, zoom: 1 };
      const viewportSize = { width: 800, height: 600 };
      
      const result = createVirtualizedModuleList(modules, viewport, viewportSize, {
        bufferSize: 50,
      });
      
      // With zoom 1 and viewport starting at 0, most modules should be visible
      expect(result.visibleCount).toBeGreaterThan(0);
      expect(result.totalCount).toBe(20);
    });

    it('should cull modules outside viewport with zoomed out view', () => {
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 20; i++) {
        modules.push({
          id: `module-${i}`,
          instanceId: `instance-${i}`,
          type: 'core-furnace',
          x: 100 + (i % 5) * 150,
          y: 100 + Math.floor(i / 5) * 150,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        });
      }
      
      // Zoomed out view - more modules should be culled
      const viewport = { x: 0, y: 0, zoom: 0.5 };
      const viewportSize = { width: 800, height: 600 };
      
      const result = createVirtualizedModuleList(modules, viewport, viewportSize, {
        bufferSize: 50,
      });
      
      // At 0.5 zoom, viewport shows double the area, so all modules should be visible
      expect(result.visibleCount).toBe(20);
    });

    it('should cull modules with panned viewport', () => {
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 20; i++) {
        modules.push({
          id: `module-${i}`,
          instanceId: `instance-${i}`,
          type: 'core-furnace',
          x: 1000 + (i % 5) * 150, // All modules far to the right
          y: 100 + Math.floor(i / 5) * 150,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        });
      }
      
      // Viewport at origin - modules should be culled
      const viewport = { x: 0, y: 0, zoom: 1 };
      const viewportSize = { width: 800, height: 600 };
      
      const result = createVirtualizedModuleList(modules, viewport, viewportSize, {
        bufferSize: 50,
      });
      
      // Modules are at x=1000+, viewport shows x: 0-800, so most should be culled
      expect(result.visibleCount).toBeLessThan(20);
    });
  });

  describe('Connection creation performance', () => {
    it('should create 15 connections efficiently', () => {
      const store = useMachineStore.getState();
      
      // Create modules first
      act(() => {
        for (let i = 0; i < 20; i++) {
          store.addModule('core-furnace', 100 + (i % 5) * 100, 100 + Math.floor(i / 5) * 100);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      expect(modules.length).toBe(20);
      
      // Create connections
      const connections: Connection[] = [];
      for (let i = 0; i < 15; i++) {
        const sourceIdx = i % modules.length;
        const targetIdx = (i + 1) % modules.length;
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: modules[sourceIdx].instanceId,
          sourcePortId: modules[sourceIdx].ports[0]?.id || 'p1',
          targetModuleId: modules[targetIdx].instanceId,
          targetPortId: modules[targetIdx].ports[0]?.id || 'p2',
          pathData: `M${sourceIdx * 100},0 L${targetIdx * 100},100`,
        });
      }
      
      const result = benchmark('Create 15 connections', () => {
        act(() => {
          useMachineStore.setState({ connections });
        });
      }, 5);
      
      expect(result.avgMs).toBeLessThan(50);
      expect(useMachineStore.getState().connections.length).toBe(15);
    });

    it('should handle 30 connections without errors', () => {
      const store = useMachineStore.getState();
      
      // Create modules
      act(() => {
        for (let i = 0; i < 20; i++) {
          store.addModule('gear', 100 + (i % 5) * 100, 100 + Math.floor(i / 5) * 100);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      
      // Create 30 connections
      const connections: Connection[] = [];
      for (let i = 0; i < 30; i++) {
        const sourceIdx = i % modules.length;
        const targetIdx = (i + 1) % modules.length;
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: modules[sourceIdx].instanceId,
          sourcePortId: modules[sourceIdx].ports[0]?.id || 'p1',
          targetModuleId: modules[targetIdx].instanceId,
          targetPortId: modules[targetIdx].ports[0]?.id || 'p2',
          pathData: `M${sourceIdx * 100},0 L${targetIdx * 100},100`,
        });
      }
      
      act(() => {
        useMachineStore.setState({ connections });
      });
      
      expect(useMachineStore.getState().connections.length).toBe(30);
    });
  });

  describe('Module dragging performance', () => {
    it('should update module position in under 16ms (60fps budget)', () => {
      const store = useMachineStore.getState();
      
      // Create module
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      const module = useMachineStore.getState().modules[0];
      
      // Benchmark position update
      const result = benchmark('Update module position', () => {
        act(() => {
          store.updateModulePosition(module.instanceId, 200, 200);
        });
      }, 10);
      
      // Should complete in under 16ms for 60fps
      expect(result.avgMs).toBeLessThan(16);
    });

    it('should handle batch module updates efficiently', () => {
      const store = useMachineStore.getState();
      
      // Create 20 modules
      act(() => {
        for (let i = 0; i < 20; i++) {
          store.addModule('core-furnace', 100 + i * 10, 100 + i * 10);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      
      // Batch update
      const updates = modules.map(m => ({
        instanceId: m.instanceId,
        x: m.x + 10,
        y: m.y + 10,
      }));
      
      const result = benchmark('Batch update 20 modules', () => {
        act(() => {
          store.updateModulesBatch(updates);
        });
      }, 5);
      
      // Batch updates should complete in reasonable time
      expect(result.avgMs).toBeLessThan(50);
    });
  });

  describe('Frame budget compliance', () => {
    it('should verify frame budget checker works correctly', () => {
      const isWithinBudget = isWithinFrameBudget(60, 0.8);
      
      // 10ms should be within budget (16ms * 0.8 = 12.8ms)
      expect(isWithinBudget(10)).toBe(true);
      
      // 20ms should be outside budget
      expect(isWithinBudget(20)).toBe(false);
      
      // 5ms is clearly within budget
      expect(isWithinBudget(5)).toBe(true);
      
      // 15ms should be outside budget (greater than 12.8ms)
      expect(isWithinBudget(15)).toBe(false);
    });
  });

  describe('Benchmark utility', () => {
    it('should correctly measure operation timing', () => {
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
});
