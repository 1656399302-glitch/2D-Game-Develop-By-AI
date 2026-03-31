import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateConnectionPath,
  validateConnection,
  getConnectionFlowOrder,
  getPortWorldPosition,
  clearPathCacheForModule,
  clearAllPathCaches,
  updatePathsForModule,
  recalculateAllPaths,
  connectionExists,
  getModuleConnections,
  getConnectionStats,
} from '../utils/connectionEngine';
import { PlacedModule, ModuleType, Port } from '../types';

// Helper to create a test module
function createModule(
  type: ModuleType,
  instanceId: string,
  x: number,
  y: number,
  rotation = 0
): PlacedModule {
  return {
    id: `test-${type}-${instanceId}`,
    instanceId,
    type,
    x,
    y,
    rotation,
    scale: 1,
    ports: [
      { id: `${type}-input`, type: 'input', position: { x: 25, y: 40 } },
      { id: `${type}-output`, type: 'output', position: { x: 75, y: 40 } },
    ],
  };
}

describe('connectionEngine Fix Tests', () => {
  describe('P0: AC2 - Path Updates When Modules Are Moved', () => {
    beforeEach(() => {
      clearAllPathCaches();
    });

    it('should recalculate path when source module is moved', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
      ];

      // Initial path
      const initialPath = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );
      expect(initialPath).toContain('M');

      // Move source module
      modules[0] = { ...modules[0], x: 200, y: 150 };

      // New path should be different
      const newPath = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );

      expect(newPath).not.toBe(initialPath);
    });

    it('should recalculate path when target module is moved', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
      ];

      // Initial path
      const initialPath = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );

      // Move target module
      modules[1] = { ...modules[1], x: 400, y: 250 };

      // New path should be different
      const newPath = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );

      expect(newPath).not.toBe(initialPath);
    });

    it('should NOT leave ghost/stale paths after module move - updatePathsForModule', () => {
      const connections = [
        {
          id: 'conn-1',
          sourceModuleId: 'module-1',
          sourcePortId: 'core-furnace-output',
          targetModuleId: 'module-2',
          targetPortId: 'energy-pipe-input',
          pathData: '',
        },
        {
          id: 'conn-2',
          sourceModuleId: 'module-2',
          sourcePortId: 'energy-pipe-output',
          targetModuleId: 'module-3',
          targetPortId: 'gear-input',
          pathData: '',
        },
      ];

      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
        createModule('gear', 'module-3', 500, 150),
      ];

      // Calculate initial paths
      connections.forEach((conn) => {
        conn.pathData = calculateConnectionPath(
          modules,
          conn.sourceModuleId,
          conn.sourcePortId,
          conn.targetModuleId,
          conn.targetPortId
        );
      });

      const initialPath1 = connections[0].pathData;
      const initialPath2 = connections[1].pathData;

      // Move module-2
      modules[1] = { ...modules[1], x: 350, y: 250 };

      // Update paths for the moved module
      const updatedPaths = updatePathsForModule(modules, connections, 'module-2');

      // Should return updates for both connections (since module-2 is in both)
      expect(updatedPaths.length).toBe(2);

      // Paths should be different
      const updatedPath1 = updatedPaths.find((p) => p.id === 'conn-1');
      const updatedPath2 = updatedPaths.find((p) => p.id === 'conn-2');

      expect(updatedPath1?.pathData).not.toBe(initialPath1);
      expect(updatedPath2?.pathData).not.toBe(initialPath2);
    });

    it('should only update paths for affected connections', () => {
      const connections = [
        {
          id: 'conn-1',
          sourceModuleId: 'module-1',
          sourcePortId: 'core-furnace-output',
          targetModuleId: 'module-2',
          targetPortId: 'energy-pipe-input',
          pathData: '',
        },
        {
          id: 'conn-2',
          sourceModuleId: 'module-3',
          sourcePortId: 'gear-output',
          targetModuleId: 'module-4',
          targetPortId: 'rune-node-input',
          pathData: '',
        },
      ];

      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
        createModule('gear', 'module-3', 100, 300),
        createModule('rune-node', 'module-4', 300, 400),
      ];

      // Move only module-2
      modules[1] = { ...modules[1], x: 400, y: 250 };

      // Update paths for module-2
      const updatedPaths = updatePathsForModule(modules, connections, 'module-2');

      // Should only update conn-1 (which involves module-2)
      expect(updatedPaths.length).toBe(1);
      expect(updatedPaths[0].id).toBe('conn-1');

      // conn-2 should remain unchanged
      const unchangedPath = connections.find((c) => c.id === 'conn-2')?.pathData;
      expect(unchangedPath).toBe('');
    });

    it('should handle module rotation for path recalculation', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100, 0),
        createModule('energy-pipe', 'module-2', 300, 200, 0),
      ];

      const initialPath = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );

      // Rotate source module 90 degrees
      modules[0] = { ...modules[0], rotation: 90 };

      const rotatedPath = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );

      expect(rotatedPath).not.toBe(initialPath);
    });
  });

  describe('Memoization and Cache Management', () => {
    beforeEach(() => {
      clearAllPathCaches();
    });

    it('should use cache for repeated path calculations', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
      ];

      // First call - should calculate and cache
      const path1 = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );

      // Second call - should return cached result
      const path2 = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );

      expect(path1).toBe(path2);
    });

    it('should invalidate cache when module position changes', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
      ];

      // First calculation
      const path1 = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );

      // Change module position - this should invalidate cache
      modules[0] = { ...modules[0], x: 150, y: 120 };

      // Clear specific module cache
      clearPathCacheForModule('module-1');

      // New calculation should return different path
      const path2 = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );

      expect(path2).not.toBe(path1);
    });

    it('should clear all caches on clearAllPathCaches', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
      ];

      // Calculate to populate cache
      calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );

      let stats = getConnectionStats();
      expect(stats.cacheSize).toBeGreaterThan(0);

      // Clear all caches
      clearAllPathCaches();

      stats = getConnectionStats();
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe('recalculateAllPaths', () => {
    beforeEach(() => {
      clearAllPathCaches();
    });

    it('should recalculate all connection paths', () => {
      const connections = [
        {
          id: 'conn-1',
          sourceModuleId: 'module-1',
          sourcePortId: 'core-furnace-output',
          targetModuleId: 'module-2',
          targetPortId: 'energy-pipe-input',
        },
        {
          id: 'conn-2',
          sourceModuleId: 'module-2',
          sourcePortId: 'energy-pipe-output',
          targetModuleId: 'module-3',
          targetPortId: 'gear-input',
        },
      ];

      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
        createModule('gear', 'module-3', 500, 150),
      ];

      const updatedPaths = recalculateAllPaths(modules, connections);

      expect(updatedPaths.length).toBe(2);
      expect(updatedPaths.find((p) => p.id === 'conn-1')?.pathData).toContain('M');
      expect(updatedPaths.find((p) => p.id === 'conn-2')?.pathData).toContain('M');
    });
  });

  describe('getPortWorldPosition', () => {
    it('should calculate correct position without rotation', () => {
      const module: PlacedModule = {
        id: 'test',
        instanceId: 'module-1',
        type: 'core-furnace',
        x: 100,
        y: 100,
        rotation: 0,
        scale: 1,
        ports: [
          { id: 'input', type: 'input', position: { x: 25, y: 40 } },
          { id: 'output', type: 'output', position: { x: 75, y: 40 } },
        ],
      };

      const port: Port = module.ports[1]; // output port
      const size = { width: 100, height: 80 };

      const pos = getPortWorldPosition(module, port, size.width, size.height);

      // With rotation 0:
      // cx = 100/2 = 50, cy = 80/2 = 40
      // px = 75 - 50 = 25, py = 40 - 40 = 0
      // rx = 25 * 1 - 0 * 0 = 25, ry = 25 * 0 + 0 * 1 = 0
      // x = 100 + 50 + 25 = 175, y = 100 + 40 + 0 = 140
      expect(pos.x).toBe(175);
      expect(pos.y).toBe(140);
    });

    it('should calculate correct position with 90 degree rotation', () => {
      const module: PlacedModule = {
        id: 'test',
        instanceId: 'module-1',
        type: 'core-furnace',
        x: 100,
        y: 100,
        rotation: 90,
        scale: 1,
        ports: [
          { id: 'input', type: 'input', position: { x: 25, y: 40 } },
          { id: 'output', type: 'output', position: { x: 75, y: 40 } },
        ],
      };

      const port: Port = module.ports[1]; // output port
      const size = { width: 100, height: 80 };

      const pos = getPortWorldPosition(module, port, size.width, size.height);

      // With 90 degree rotation, output port (75, 40) should move to a different position
      expect(pos.x).not.toBe(225); // Should be different from non-rotated
      expect(pos.y).not.toBe(180);
    });
  });

  describe('validateConnection', () => {
    it('should not allow self-connection', () => {
      const modules = [createModule('core-furnace', 'module-1', 100, 100)];

      const result = validateConnection(
        modules,
        'module-1',
        'core-furnace-input',
        'module-1',
        'core-furnace-output'
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Cannot connect module to itself');
    });

    it('should not allow same port type connection', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('core-furnace', 'module-2', 300, 200),
      ];

      const result = validateConnection(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'core-furnace-output'
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Cannot connect same port types');
    });

    it('should allow valid connection', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
      ];

      const result = validateConnection(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );

      expect(result.valid).toBe(true);
    });
  });

  describe('connectionExists', () => {
    it('should detect existing connections', () => {
      const connections = [
        {
          sourceModuleId: 'module-1',
          sourcePortId: 'output-1',
          targetModuleId: 'module-2',
          targetPortId: 'input-1',
        },
      ];

      expect(
        connectionExists(connections, 'module-1', 'output-1', 'module-2', 'input-1')
      ).toBe(true);

      expect(
        connectionExists(connections, 'module-2', 'input-1', 'module-1', 'output-1')
      ).toBe(true); // Reverse direction should also match

      expect(
        connectionExists(connections, 'module-1', 'output-2', 'module-2', 'input-1')
      ).toBe(false);
    });
  });

  describe('getModuleConnections', () => {
    it('should return all connections for a module', () => {
      const connections = [
        { id: 'conn-1', sourceModuleId: 'module-1', targetModuleId: 'module-2' },
        { id: 'conn-2', sourceModuleId: 'module-2', targetModuleId: 'module-3' },
        { id: 'conn-3', sourceModuleId: 'module-4', targetModuleId: 'module-1' },
      ];

      const module2Connections = getModuleConnections(connections, 'module-2');

      expect(module2Connections.length).toBe(2);
      expect(module2Connections.map((c) => c.id)).toContain('conn-1');
      expect(module2Connections.map((c) => c.id)).toContain('conn-2');
    });
  });

  describe('getConnectionFlowOrder', () => {
    it('should return BFS order starting from core furnace', () => {
      const modules = [
        createModule('energy-pipe', 'pipe-1', 100, 100),
        createModule('core-furnace', 'core-1', 300, 100),
        createModule('gear', 'gear-1', 500, 100),
      ];

      const connections = [
        { sourceModuleId: 'core-1', targetModuleId: 'pipe-1' },
        { sourceModuleId: 'pipe-1', targetModuleId: 'gear-1' },
      ];

      const order = getConnectionFlowOrder(modules, connections);

      expect(order[0]).toBe('core-1');
    });

    it('should include all modules even if disconnected', () => {
      const modules = [
        createModule('core-furnace', 'core-1', 100, 100),
        createModule('energy-pipe', 'pipe-1', 300, 100),
        createModule('gear', 'gear-1', 500, 100),
      ];

      const order = getConnectionFlowOrder(modules, []);

      expect(order.length).toBe(3);
      expect(order).toContain('core-1');
      expect(order).toContain('pipe-1');
      expect(order).toContain('gear-1');
    });
  });
});
