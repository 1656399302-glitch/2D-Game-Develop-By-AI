import { describe, it, expect } from 'vitest';
import {
  autoArrange,
  autoArrangeCircular,
  autoArrangeLine,
  autoArrangeCascade,
} from '../utils/autoLayout';
import { PlacedModule, Connection } from '../types';

describe('autoLayout', () => {
  // Helper to create a mock module
  const createModule = (id: string, x = 100, y = 100): PlacedModule => ({
    id,
    instanceId: id,
    type: 'core-furnace',
    x,
    y,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [],
  });

  // Helper to create mock connections
  const createConnections = (sourceId: string, targetId: string): Connection[] => [{
    id: 'conn-1',
    sourceModuleId: sourceId,
    sourcePortId: 'port-1',
    targetModuleId: targetId,
    targetPortId: 'port-2',
    pathData: '',
  }];

  describe('autoArrange (grid layout)', () => {
    it('should return empty arrays for empty input', () => {
      const result = autoArrange([], [], { containerWidth: 800, containerHeight: 600 });

      expect(result.modules).toEqual([]);
      expect(result.connections).toEqual([]);
    });

    it('should center a single module', () => {
      const modules = [createModule('m1')];
      const result = autoArrange(modules, [], { containerWidth: 800, containerHeight: 600 });

      expect(result.modules).toHaveLength(1);
      // Module should be centered
      expect(result.modules[0].x).toBeGreaterThan(0);
      expect(result.modules[0].y).toBeGreaterThan(0);
    });

    it('should arrange multiple modules in a grid', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
        createModule('m4'),
      ];
      const result = autoArrange(modules, [], { containerWidth: 800, containerHeight: 600 });

      expect(result.modules).toHaveLength(4);

      // Modules should be arranged in a grid pattern
      const m1 = result.modules.find(m => m.instanceId === 'm1')!;
      const m2 = result.modules.find(m => m.instanceId === 'm2')!;
      const m3 = result.modules.find(m => m.instanceId === 'm3')!;
      const m4 = result.modules.find(m => m.instanceId === 'm4')!;

      // Check that modules are positioned reasonably
      expect(m1.x).toBeGreaterThanOrEqual(0);
      expect(m2.x).toBeGreaterThanOrEqual(0);
      expect(m3.x).toBeGreaterThanOrEqual(0);
      expect(m4.x).toBeGreaterThanOrEqual(0);
    });

    it('should keep modules within canvas bounds', () => {
      const modules = [
        createModule('m1', 700, 500),
        createModule('m2', 750, 550),
      ];
      const result = autoArrange(modules, [], { containerWidth: 800, containerHeight: 600 });

      result.modules.forEach(m => {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.y).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThan(800);
        expect(m.y).toBeLessThan(600);
      });
    });

    it('should preserve connections array', () => {
      const modules = [createModule('m1'), createModule('m2')];
      const connections = createConnections('m1', 'm2');
      const result = autoArrange(modules, connections, { containerWidth: 800, containerHeight: 600 });

      expect(result.connections).toBe(connections);
    });

    it('should use default configuration when not provided', () => {
      const modules = [createModule('m1'), createModule('m2')];
      const result = autoArrange(modules, []);

      // Should use default containerWidth of 800
      expect(result.modules.every(m => m.x >= 0 && m.x < 800)).toBe(true);
    });

    it('should handle 6+ modules with multiple rows', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
        createModule('m4'),
        createModule('m5'),
        createModule('m6'),
      ];
      const result = autoArrange(modules, [], { containerWidth: 800, containerHeight: 600, maxColumns: 3 });

      expect(result.modules).toHaveLength(6);

      // All modules should be within canvas bounds
      result.modules.forEach(m => {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.y).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThan(800);
        expect(m.y).toBeLessThan(600);
      });
    });
  });

  describe('autoArrangeCircular', () => {
    it('should return empty arrays for empty input', () => {
      const result = autoArrangeCircular([], []);

      expect(result.modules).toEqual([]);
    });

    it('should center a single module', () => {
      const modules = [createModule('m1')];
      const result = autoArrangeCircular(modules, [], { containerWidth: 800, containerHeight: 600 });

      expect(result.modules).toHaveLength(1);
      // Module should be centered around canvas center
      // Core furnace is 100x100, so center would be 800/2 - 50 = 350 to 450
      expect(result.modules[0].x).toBeGreaterThanOrEqual(300);
      expect(result.modules[0].x).toBeLessThan(500);
    });

    it('should arrange modules in a circle pattern', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
        createModule('m4'),
      ];
      const result = autoArrangeCircular(modules, [], { containerWidth: 800, containerHeight: 600 });

      expect(result.modules).toHaveLength(4);

      // In a circle, modules should have different positions
      const positions = result.modules.map(m => ({ x: m.x, y: m.y }));
      
      // All positions should be different
      const uniquePositions = new Set(positions.map(p => `${p.x},${p.y}`));
      expect(uniquePositions.size).toBe(4);
    });

    it('should keep modules within canvas bounds', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      const result = autoArrangeCircular(modules, [], { containerWidth: 800, containerHeight: 600 });

      result.modules.forEach(m => {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.y).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThan(800);
        expect(m.y).toBeLessThan(600);
      });
    });
  });

  describe('autoArrangeLine (horizontal)', () => {
    it('should return empty arrays for empty input', () => {
      const result = autoArrangeLine([], []);

      expect(result.modules).toEqual([]);
    });

    it('should arrange modules in a horizontal line', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      const result = autoArrangeLine(modules, [], { containerWidth: 800, containerHeight: 600 });

      expect(result.modules).toHaveLength(3);

      // All modules should have the same Y (centered vertically)
      const yValues = result.modules.map(m => m.y);
      expect(new Set(yValues).size).toBe(1);

      // m1 should have smaller X than m2, m2 smaller than m3
      const m1 = result.modules.find(m => m.instanceId === 'm1')!;
      const m2 = result.modules.find(m => m.instanceId === 'm2')!;
      const m3 = result.modules.find(m => m.instanceId === 'm3')!;

      expect(m1.x).toBeLessThan(m2.x);
      expect(m2.x).toBeLessThan(m3.x);
    });

    it('should center the line horizontally', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
      ];
      const result = autoArrangeLine(modules, [], { containerWidth: 800, containerHeight: 600 });

      // Calculate total width and compare to container center
      const positions = result.modules.map(m => m.x);
      const firstX = Math.min(...positions);
      const lastX = Math.max(...positions);

      // First module should not be at x=0 (not at left edge)
      expect(firstX).toBeGreaterThan(0);
      // Last module should not be at x=800 (not at right edge)
      expect(lastX).toBeLessThan(800);
    });
  });

  describe('autoArrangeCascade', () => {
    it('should return empty arrays for empty input', () => {
      const result = autoArrangeCascade([], []);

      expect(result.modules).toEqual([]);
    });

    it('should arrange modules in a staggered cascade pattern', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      const result = autoArrangeCascade(modules, [], { containerWidth: 800, containerHeight: 600 });

      expect(result.modules).toHaveLength(3);

      // Each module should be offset diagonally
      const m1 = result.modules.find(m => m.instanceId === 'm1')!;
      const m2 = result.modules.find(m => m.instanceId === 'm2')!;
      const m3 = result.modules.find(m => m.instanceId === 'm3')!;

      // m2 should be below and to the right of m1
      expect(m2.x).toBeGreaterThan(m1.x);
      expect(m2.y).toBeGreaterThan(m1.y);

      // m3 should be below and to the right of m2
      expect(m3.x).toBeGreaterThan(m2.x);
      expect(m3.y).toBeGreaterThan(m2.y);
    });

    it('should keep modules within canvas bounds', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
        createModule('m4'),
        createModule('m5'),
      ];
      const result = autoArrangeCascade(modules, [], { containerWidth: 800, containerHeight: 600 });

      result.modules.forEach(m => {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.y).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThan(800);
        expect(m.y).toBeLessThan(600);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle modules with different sizes', () => {
      const modules = [
        { ...createModule('m1'), type: 'core-furnace' }, // 100x100
        { ...createModule('m2'), type: 'energy-pipe' }, // 120x50
        { ...createModule('m3'), type: 'gear' }, // 80x80
      ];
      const result = autoArrange(modules, [], { containerWidth: 800, containerHeight: 600 });

      expect(result.modules).toHaveLength(3);

      // All modules should be positioned within bounds
      result.modules.forEach(m => {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.y).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThan(800);
        expect(m.y).toBeLessThan(600);
      });
    });

    it('should preserve module properties during rearrangement', () => {
      const modules = [
        { ...createModule('m1', 500, 500), rotation: 45, scale: 1.5 },
        { ...createModule('m2', 600, 100), rotation: 90, scale: 0.8 },
      ];
      const result = autoArrange(modules, []);

      result.modules.forEach(m => {
        const original = modules.find(om => om.instanceId === m.instanceId);
        expect(m.rotation).toBe(original?.rotation);
        expect(m.scale).toBe(original?.scale);
        expect(m.type).toBe(original?.type);
      });
    });

    it('should handle very small container', () => {
      const modules = [createModule('m1'), createModule('m2')];
      const result = autoArrange(modules, [], { containerWidth: 200, containerHeight: 200 });

      result.modules.forEach(m => {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.y).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThan(200);
        expect(m.y).toBeLessThan(200);
      });
    });

    it('should handle very large container', () => {
      const modules = [createModule('m1')];
      const result = autoArrange(modules, [], { containerWidth: 2000, containerHeight: 2000 });

      expect(result.modules).toHaveLength(1);
      // Module should still be reasonably positioned
      expect(result.modules[0].x).toBeLessThan(2000);
      expect(result.modules[0].y).toBeLessThan(2000);
    });
  });
});
