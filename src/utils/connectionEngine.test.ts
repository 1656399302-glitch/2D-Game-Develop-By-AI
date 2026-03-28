import { describe, it, expect } from 'vitest';
import { calculateConnectionPath, validateConnection, getConnectionFlowOrder } from './connectionEngine';
import { PlacedModule, ModuleType } from '../types';

describe('connectionEngine', () => {
  const createModule = (
    type: ModuleType,
    instanceId: string,
    x: number,
    y: number
  ): PlacedModule => ({
    id: `test-${type}`,
    instanceId,
    type,
    x,
    y,
    rotation: 0,
    scale: 1,
    ports: [
      { id: `${type}-input`, type: 'input', position: { x: 0, y: 25 } },
      { id: `${type}-output`, type: 'output', position: { x: 100, y: 25 } },
    ],
  });

  describe('calculateConnectionPath', () => {
    it('should return a valid SVG path string starting with M', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
      ];
      
      const path = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );
      
      expect(path).toBeDefined();
      expect(typeof path).toBe('string');
      expect(path.startsWith('M')).toBe(true);
    });

    it('should contain L or C commands for path segments', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
      ];
      
      const path = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );
      
      // Path should contain curve commands (C) or line commands (L)
      expect(path).toMatch(/[LCC]/);
    });

    it('should return empty string if module not found', () => {
      const modules: PlacedModule[] = [];
      
      const path = calculateConnectionPath(
        modules,
        'non-existent',
        'port-1',
        'non-existent-2',
        'port-2'
      );
      
      expect(path).toBe('');
    });

    it('should return empty string if port not found', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 200),
      ];
      
      const path = calculateConnectionPath(
        modules,
        'module-1',
        'non-existent-port',
        'module-2',
        'energy-pipe-input'
      );
      
      expect(path).toBe('');
    });

    it('should work with different module types', () => {
      const modules = [
        createModule('gear', 'gear-1', 100, 100),
        createModule('rune-node', 'rune-1', 400, 150),
      ];
      
      const path = calculateConnectionPath(
        modules,
        'gear-1',
        'gear-output',
        'rune-1',
        'rune-node-input'
      );
      
      expect(path).toBeDefined();
      expect(path.length).toBeGreaterThan(0);
      expect(path.startsWith('M')).toBe(true);
    });

    it('should create curved path for horizontal distance', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 400, 100),
      ];
      
      const path = calculateConnectionPath(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );
      
      // Should have curve command C for bezier curve
      expect(path).toContain('C');
    });
  });

  describe('validateConnection', () => {
    it('should not allow connecting module to itself', () => {
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

    it('should not allow connecting same port types', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('core-furnace', 'module-2', 300, 100),
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

    it('should allow valid output to input connection', () => {
      const modules = [
        createModule('core-furnace', 'module-1', 100, 100),
        createModule('energy-pipe', 'module-2', 300, 100),
      ];
      
      const result = validateConnection(
        modules,
        'module-1',
        'core-furnace-output',
        'module-2',
        'energy-pipe-input'
      );
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for non-existent source module', () => {
      const modules: PlacedModule[] = [];
      
      const result = validateConnection(
        modules,
        'non-existent',
        'port-1',
        'module-2',
        'port-2'
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Module not found');
    });

    it('should return error for non-existent target module', () => {
      const modules = [createModule('core-furnace', 'module-1', 100, 100)];
      
      const result = validateConnection(
        modules,
        'module-1',
        'core-furnace-output',
        'non-existent',
        'port-2'
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Module not found');
    });
  });

  describe('getConnectionFlowOrder', () => {
    it('should return empty array for empty modules', () => {
      const order = getConnectionFlowOrder([], []);
      expect(order).toEqual([]);
    });

    it('should return modules in BFS order starting from core furnace', () => {
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
      
      expect(order).toBeDefined();
      expect(order.length).toBe(3);
      // Core furnace should be first
      expect(order[0]).toBe('core-1');
    });

    it('should include all modules even if not connected', () => {
      const modules = [
        createModule('core-furnace', 'core-1', 100, 100),
        createModule('energy-pipe', 'pipe-1', 300, 100),
        createModule('gear', 'gear-1', 500, 100),
      ];
      
      const connections: { sourceModuleId: string; targetModuleId: string }[] = [];
      
      const order = getConnectionFlowOrder(modules, connections);
      
      expect(order.length).toBe(3);
      expect(order).toContain('core-1');
      expect(order).toContain('pipe-1');
      expect(order).toContain('gear-1');
    });

    it('should follow connection graph order', () => {
      const modules = [
        createModule('core-furnace', 'core', 100, 100),
        createModule('energy-pipe', 'pipe1', 200, 100),
        createModule('energy-pipe', 'pipe2', 300, 100),
        createModule('gear', 'gear', 400, 100),
      ];
      
      const connections = [
        { sourceModuleId: 'core', targetModuleId: 'pipe1' },
        { sourceModuleId: 'pipe1', targetModuleId: 'pipe2' },
        { sourceModuleId: 'pipe2', targetModuleId: 'gear' },
      ];
      
      const order = getConnectionFlowOrder(modules, connections);
      
      // Core should be first
      expect(order[0]).toBe('core');
      // Gear should come after pipe2 in the chain
      const coreIdx = order.indexOf('core');
      const pipe1Idx = order.indexOf('pipe1');
      const pipe2Idx = order.indexOf('pipe2');
      const gearIdx = order.indexOf('gear');
      
      expect(coreIdx).toBeLessThan(pipe1Idx);
      expect(pipe1Idx).toBeLessThan(pipe2Idx);
      expect(pipe2Idx).toBeLessThan(gearIdx);
    });
  });
});
