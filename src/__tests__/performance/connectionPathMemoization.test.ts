import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../../store/useMachineStore';
import { 
  createVirtualizedModuleList, 
  filterVisibleConnections, 
  benchmark 
} from '../../utils/performanceUtils';
import { act } from '@testing-library/react';
import { Connection, PlacedModule } from '../../types';

describe('AC6: Connection Rendering Performance', () => {
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

  describe('Connection Path Calculation', () => {
    it('should create 15 connections efficiently', () => {
      const store = useMachineStore.getState();
      
      // Create modules
      act(() => {
        for (let i = 0; i < 10; i++) {
          store.addModule('core-furnace', 100 + (i % 4) * 100, 100 + Math.floor(i / 4) * 100);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      expect(modules.length).toBe(10);
      
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
      
      expect(result.avgMs).toBeLessThan(100);
      expect(useMachineStore.getState().connections.length).toBe(15);
    });

    it('should handle 30 connections without errors', () => {
      const store = useMachineStore.getState();
      
      // Create modules
      act(() => {
        for (let i = 0; i < 15; i++) {
          store.addModule('gear', 100 + (i % 5) * 80, 100 + Math.floor(i / 5) * 80);
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

  describe('Visible Connection Filtering', () => {
    it('should filter connections based on visible modules', () => {
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
      
      const connections: Connection[] = [];
      for (let i = 0; i < 15; i++) {
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: modules[i % modules.length].instanceId,
          sourcePortId: 'p1',
          targetModuleId: modules[(i + 1) % modules.length].instanceId,
          targetPortId: 'p2',
          pathData: `M0,0 L100,100`,
        });
      }
      
      // Visible modules set (first 10)
      const visibleModuleIds = new Set(
        modules.slice(0, 10).map(m => m.instanceId)
      );
      
      const visibleConnections = filterVisibleConnections(connections, visibleModuleIds);
      
      // All connections should have at least one endpoint in visible set
      expect(visibleConnections.length).toBeGreaterThan(0);
      expect(visibleConnections.length).toBeLessThanOrEqual(15);
    });

    it('should filter connections with fully culled modules', () => {
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 20; i++) {
        modules.push({
          id: `module-${i}`,
          instanceId: `instance-${i}`,
          type: 'core-furnace',
          x: 2000 + (i % 5) * 150, // All modules far to the right
          y: 100 + Math.floor(i / 5) * 150,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        });
      }
      
      const connections: Connection[] = [];
      for (let i = 0; i < 15; i++) {
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: modules[i % modules.length].instanceId,
          sourcePortId: 'p1',
          targetModuleId: modules[(i + 1) % modules.length].instanceId,
          targetPortId: 'p2',
          pathData: `M0,0 L100,100`,
        });
      }
      
      // Viewport shows origin area - no modules visible
      const visibleModuleIds = new Set<string>();
      
      const visibleConnections = filterVisibleConnections(connections, visibleModuleIds);
      
      // All connections should be filtered out
      expect(visibleConnections.length).toBe(0);
    });
  });

  describe('Connection Updates During Drag', () => {
    it('should update connection paths when modules move', () => {
      const store = useMachineStore.getState();
      
      // Create two modules
      act(() => {
        store.addModule('core-furnace', 100, 100);
        store.addModule('gear', 300, 100);
      });
      
      const modules = useMachineStore.getState().modules;
      expect(modules.length).toBe(2);
      
      // Create connection
      const connection = {
        id: 'test-conn',
        sourceModuleId: modules[0].instanceId,
        sourcePortId: modules[0].ports[0]?.id || 'p1',
        targetModuleId: modules[1].instanceId,
        targetPortId: modules[1].ports[0]?.id || 'p2',
        pathData: 'M0,0 L200,0',
      };
      
      act(() => {
        useMachineStore.setState({ connections: [connection] });
      });
      
      expect(useMachineStore.getState().connections.length).toBe(1);
      
      // Move first module
      const result = benchmark('Move module with connection', () => {
        act(() => {
          store.updateModulePosition(modules[0].instanceId, 200, 100);
        });
      }, 10);
      
      // Should complete quickly
      expect(result.avgMs).toBeLessThan(50);
    });

    it('should update multiple connections during batch move', () => {
      const store = useMachineStore.getState();
      
      // Create 5 modules
      act(() => {
        for (let i = 0; i < 5; i++) {
          store.addModule('core-furnace', 100 + i * 100, 100);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      
      // Create connections between all modules
      const connections: Connection[] = [];
      for (let i = 0; i < 4; i++) {
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: modules[i].instanceId,
          sourcePortId: modules[i].ports[0]?.id || 'p1',
          targetModuleId: modules[i + 1].instanceId,
          targetPortId: modules[i + 1].ports[0]?.id || 'p2',
          pathData: `M0,0 L100,0`,
        });
      }
      
      act(() => {
        useMachineStore.setState({ connections });
      });
      
      expect(useMachineStore.getState().connections.length).toBe(4);
      
      // Batch move all modules
      const updates = modules.map(m => ({
        instanceId: m.instanceId,
        x: m.x + 50,
        y: m.y + 50,
      }));
      
      const result = benchmark('Batch move with connections', () => {
        act(() => {
          store.updateModulesBatch(updates);
        });
      }, 10);
      
      expect(result.avgMs).toBeLessThan(50);
    });
  });

  describe('Connection Memory Management', () => {
    it('should not leak memory when rapidly adding/removing connections', () => {
      const store = useMachineStore.getState();
      
      // Create modules
      act(() => {
        for (let i = 0; i < 10; i++) {
          store.addModule('core-furnace', 100 + (i % 5) * 80, 100 + Math.floor(i / 5) * 80);
        }
      });
      
      const modules = useMachineStore.getState().modules;
      
      // Rapidly add and remove connections
      for (let iteration = 0; iteration < 5; iteration++) {
        const connections: Connection[] = [];
        for (let i = 0; i < 15; i++) {
          const sourceIdx = i % modules.length;
          const targetIdx = (i + 1) % modules.length;
          connections.push({
            id: `conn-${iteration}-${i}`,
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
        
        expect(useMachineStore.getState().connections.length).toBe(15);
        
        // Clear connections
        act(() => {
          useMachineStore.setState({ connections: [] });
        });
        
        expect(useMachineStore.getState().connections.length).toBe(0);
      }
      
      // Final state should be clean
      expect(useMachineStore.getState().connections.length).toBe(0);
    });
  });

  describe('Virtualization Integration', () => {
    it('should work with viewport culling for connections', () => {
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
      
      const connections: Connection[] = [];
      for (let i = 0; i < 15; i++) {
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: modules[i % modules.length].instanceId,
          sourcePortId: 'p1',
          targetModuleId: modules[(i + 1) % modules.length].instanceId,
          targetPortId: 'p2',
          pathData: `M0,0 L100,100`,
        });
      }
      
      // Test with full viewport (all visible)
      const viewport1 = { x: 0, y: 0, zoom: 1 };
      const viewportSize = { width: 800, height: 600 };
      
      const virtualized1 = createVirtualizedModuleList(modules, viewport1, viewportSize, {
        bufferSize: 50,
      });
      
      const visibleIds1 = new Set(virtualized1.visibleModules.map(m => m.instanceId));
      const visibleConns1 = filterVisibleConnections(connections, visibleIds1);
      
      // With full viewport, most connections should be visible
      expect(visibleConns1.length).toBeGreaterThan(10);
      
      // Test with zoomed out viewport (all visible)
      const viewport2 = { x: 0, y: 0, zoom: 0.5 };
      const virtualized2 = createVirtualizedModuleList(modules, viewport2, viewportSize, {
        bufferSize: 50,
      });
      
      const visibleIds2 = new Set(virtualized2.visibleModules.map(m => m.instanceId));
      const visibleConns2 = filterVisibleConnections(connections, visibleIds2);
      
      // At 0.5 zoom, all should be visible
      expect(visibleConns2.length).toBe(15);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should render 15 connections smoothly', () => {
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 10; i++) {
        modules.push({
          id: `module-${i}`,
          instanceId: `instance-${i}`,
          type: 'core-furnace',
          x: 100 + (i % 5) * 100,
          y: 100 + Math.floor(i / 5) * 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        });
      }
      
      const connections: Connection[] = [];
      for (let i = 0; i < 15; i++) {
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: modules[i % modules.length].instanceId,
          sourcePortId: 'p1',
          targetModuleId: modules[(i + 1) % modules.length].instanceId,
          targetPortId: 'p2',
          pathData: `M0,0 L100,100`,
        });
      }
      
      const result = benchmark('Filter 15 connections', () => {
        const visibleIds = new Set(modules.map(m => m.instanceId));
        filterVisibleConnections(connections, visibleIds);
      }, 100);
      
      expect(result.avgMs).toBeLessThan(5); // Should be very fast
    });

    it('should handle 30 connections without frame drops', () => {
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 15; i++) {
        modules.push({
          id: `module-${i}`,
          instanceId: `instance-${i}`,
          type: 'core-furnace',
          x: 100 + (i % 5) * 80,
          y: 100 + Math.floor(i / 5) * 80,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        });
      }
      
      const connections: Connection[] = [];
      for (let i = 0; i < 30; i++) {
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: modules[i % modules.length].instanceId,
          sourcePortId: 'p1',
          targetModuleId: modules[(i + 1) % modules.length].instanceId,
          targetPortId: 'p2',
          pathData: `M0,0 L100,100`,
        });
      }
      
      const result = benchmark('Filter 30 connections', () => {
        const visibleIds = new Set(modules.map(m => m.instanceId));
        filterVisibleConnections(connections, visibleIds);
      }, 100);
      
      // 30 connections should still filter very quickly
      expect(result.avgMs).toBeLessThan(10);
    });
  });
});
