import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  autoArrange, 
  autoArrangeCircular, 
  autoArrangeLine, 
  autoArrangeCascade 
} from '../utils/autoLayout';
import { PlacedModule, Connection } from '../types';

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

describe('Toolbar Auto-Layout Integration', () => {
  describe('Layout functions for UI integration', () => {
    it('autoArrange should provide layout data for toolbar integration', () => {
      const modules = [
        createModule('m1', 500, 500),
        createModule('m2', 600, 400),
        createModule('m3', 300, 100),
      ];
      
      const result = autoArrange(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      // Verify all modules are included
      expect(result.modules).toHaveLength(3);
      
      // Verify all modules are within bounds
      result.modules.forEach(m => {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.y).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThan(800);
        expect(m.y).toBeLessThan(600);
      });
      
      // Verify positions are different (layout applied)
      const positions = result.modules.map(m => `${m.x},${m.y}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(3); // All positions unique
    });

    it('autoArrangeCircular should create circular layout for visual appeal', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
        createModule('m4'),
      ];
      
      const result = autoArrangeCircular(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      expect(result.modules).toHaveLength(4);
      
      // All modules should be positioned around the center
      result.modules.forEach(m => {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.y).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThan(800);
        expect(m.y).toBeLessThan(600);
      });
    });

    it('autoArrangeLine should create horizontal line for sequential layouts', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      
      const result = autoArrangeLine(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      expect(result.modules).toHaveLength(3);
      
      // All modules should have same Y (centered vertically)
      const yValues = result.modules.map(m => m.y);
      expect(new Set(yValues).size).toBe(1); // Same Y value
      
      // Modules should be arranged left to right
      const sortedByX = [...result.modules].sort((a, b) => a.x - b.x);
      expect(sortedByX[0].instanceId).toBe('m1');
      expect(sortedByX[1].instanceId).toBe('m2');
      expect(sortedByX[2].instanceId).toBe('m3');
    });

    it('autoArrangeCascade should create staggered layout for visual interest', () => {
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
      
      // Verify cascading pattern
      expect(m2.x).toBeGreaterThan(m1.x);
      expect(m2.y).toBeGreaterThan(m1.y);
      expect(m3.x).toBeGreaterThan(m2.x);
      expect(m3.y).toBeGreaterThan(m2.y);
    });

    it('all layout functions should handle empty modules array', () => {
      expect(autoArrange([], [])).toEqual({ modules: [], connections: [] });
      expect(autoArrangeCircular([], [])).toEqual({ modules: [], connections: [] });
      expect(autoArrangeLine([], [])).toEqual({ modules: [], connections: [] });
      expect(autoArrangeCascade([], [])).toEqual({ modules: [], connections: [] });
    });

    it('all layout functions should preserve module instance IDs', () => {
      const modules = [
        createModule('unique-id-1'),
        createModule('unique-id-2'),
      ];
      
      const layouts = [
        autoArrange(modules, []),
        autoArrangeCircular(modules, []),
        autoArrangeLine(modules, []),
        autoArrangeCascade(modules, []),
      ];
      
      layouts.forEach(result => {
        const instanceIds = result.modules.map(m => m.instanceId);
        expect(instanceIds).toContain('unique-id-1');
        expect(instanceIds).toContain('unique-id-2');
      });
    });

    it('all layout functions should preserve module properties', () => {
      const modules = [
        { ...createModule('m1', 100, 100), rotation: 45, scale: 1.5 },
        { ...createModule('m2', 200, 200), rotation: 90, scale: 0.8 },
      ];
      
      const layouts = [
        autoArrange(modules, []),
        autoArrangeCircular(modules, []),
        autoArrangeLine(modules, []),
        autoArrangeCascade(modules, []),
      ];
      
      layouts.forEach(result => {
        const m1 = result.modules.find(m => m.instanceId === 'm1')!;
        const m2 = result.modules.find(m => m.instanceId === 'm2')!;
        
        expect(m1.rotation).toBe(45);
        expect(m1.scale).toBe(1.5);
        expect(m2.rotation).toBe(90);
        expect(m2.scale).toBe(0.8);
      });
    });

    it('all layout functions should handle single module centering', () => {
      const modules = [createModule('m1')];
      
      const gridResult = autoArrange(modules, [], { containerWidth: 800, containerHeight: 600 });
      const circleResult = autoArrangeCircular(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      // Single module should be centered
      expect(gridResult.modules[0].x).toBeGreaterThan(0);
      expect(circleResult.modules[0].x).toBeGreaterThan(0);
    });

    it('layout functions should work with various container sizes', () => {
      const modules = [createModule('m1'), createModule('m2')];
      
      const configs = [
        { containerWidth: 400, containerHeight: 300 },
        { containerWidth: 1200, containerHeight: 900 },
        { containerWidth: 1920, containerHeight: 1080 },
      ];
      
      configs.forEach(config => {
        const result = autoArrange(modules, [], config);
        result.modules.forEach(m => {
          expect(m.x).toBeGreaterThanOrEqual(0);
          expect(m.y).toBeGreaterThanOrEqual(0);
          expect(m.x).toBeLessThan(config.containerWidth);
          expect(m.y).toBeLessThan(config.containerHeight);
        });
      });
    });

    it('connections should be preserved in all layout functions', () => {
      const modules = [createModule('m1'), createModule('m2')];
      const connections: Connection[] = [{
        id: 'conn-1',
        sourceModuleId: 'm1',
        sourcePortId: 'port-1',
        targetModuleId: 'm2',
        targetPortId: 'port-2',
        pathData: 'M0,0 L100,100',
      }];
      
      const layouts = [
        autoArrange(modules, connections),
        autoArrangeCircular(modules, connections),
        autoArrangeLine(modules, connections),
        autoArrangeCascade(modules, connections),
      ];
      
      layouts.forEach(result => {
        expect(result.connections).toEqual(connections);
      });
    });
  });
});
