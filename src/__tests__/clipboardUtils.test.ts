import { describe, it, expect, beforeEach } from 'vitest';
import { 
  copyModules, 
  pasteModules, 
  duplicateModules,
  calculateBounds,
  getCenterPoint,
  validateClipboard,
  isClipboardEmpty,
  getClipboardSummary,
  ClipboardData,
  Point
} from '../utils/clipboardUtils';
import { PlacedModule, Connection, ModuleType } from '../types';

// Helper to create mock modules
const createMockModule = (
  instanceId: string,
  type: ModuleType = 'core-furnace',
  x: number = 100,
  y: number = 100
): PlacedModule => ({
  id: `id-${instanceId}`,
  instanceId,
  type,
  x,
  y,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [
    { id: `${instanceId}-input-0`, type: 'input', position: { x: 25, y: 50 } },
    { id: `${instanceId}-output-0`, type: 'output', position: { x: 75, y: 50 } },
  ],
});

// Helper to create mock connections
const createMockConnection = (
  id: string,
  sourceModuleId: string,
  targetModuleId: string
): Connection => ({
  id,
  sourceModuleId,
  sourcePortId: `${sourceModuleId}-output-0`,
  targetModuleId,
  targetPortId: `${targetModuleId}-input-0`,
  pathData: `M ${sourceModuleId} ${targetModuleId}`,
});

describe('clipboardUtils', () => {
  describe('calculateBounds', () => {
    it('should calculate bounds for single module', () => {
      const modules = [createMockModule('m1', 'core-furnace', 100, 100)];
      const bounds = calculateBounds(modules);
      
      expect(bounds).not.toBeNull();
      expect(bounds!.minX).toBe(100);
      expect(bounds!.minY).toBe(100);
      expect(bounds!.maxX).toBe(200); // 100 + 100 (core-furnace width)
      expect(bounds!.maxY).toBe(200); // 100 + 100 (core-furnace height)
    });

    it('should calculate bounds for multiple modules', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      const bounds = calculateBounds(modules);
      
      expect(bounds).not.toBeNull();
      expect(bounds!.minX).toBe(100);
      expect(bounds!.minY).toBe(100);
      expect(bounds!.maxX).toBe(280); // max(200, 200 + 80)
      expect(bounds!.maxY).toBe(280); // max(200, 200 + 80)
    });

    it('should return null for empty array', () => {
      const bounds = calculateBounds([]);
      expect(bounds).toBeNull();
    });
  });

  describe('getCenterPoint', () => {
    it('should calculate center point of modules', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      const center = getCenterPoint(modules);
      
      expect(center).not.toBeNull();
      expect(center!.x).toBe(190); // (100 + 280) / 2
      expect(center!.y).toBe(190); // (100 + 280) / 2
    });

    it('should return null for empty array', () => {
      const center = getCenterPoint([]);
      expect(center).toBeNull();
    });
  });

  describe('copyModules', () => {
    it('should copy single module', () => {
      const modules = [createMockModule('m1', 'core-furnace', 100, 100)];
      const connections: Connection[] = [];
      
      const clipboard = copyModules(['m1'], modules, connections);
      
      expect(clipboard.modules.length).toBe(1);
      expect(clipboard.modules[0].instanceId).toBe('m1');
      expect(clipboard.connections.length).toBe(0);
    });

    it('should copy multiple modules', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      const connections: Connection[] = [];
      
      const clipboard = copyModules(['m1', 'm2'], modules, connections);
      
      expect(clipboard.modules.length).toBe(2);
    });

    it('should copy all modules when empty selection', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      const connections: Connection[] = [];
      
      const clipboard = copyModules([], modules, connections);
      
      expect(clipboard.modules.length).toBe(2);
    });

    it('should copy connections between selected modules', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      const connections = [createMockConnection('c1', 'm1', 'm2')];
      
      const clipboard = copyModules(['m1', 'm2'], modules, connections);
      
      expect(clipboard.connections.length).toBe(1);
      expect(clipboard.connections[0].sourceModuleId).toBe('m1');
      expect(clipboard.connections[0].targetModuleId).toBe('m2');
    });
  });

  describe('pasteModules', () => {
    it('should paste modules at new position with offset', () => {
      const clipboard: ClipboardData = {
        modules: [createMockModule('m1', 'core-furnace', 100, 100)],
        connections: [],
        copiedAt: Date.now(),
      };
      const allModules: PlacedModule[] = [];
      const position: Point = { x: 300, y: 300 };
      
      const result = pasteModules(clipboard, position, allModules);
      
      expect(result.modules.length).toBe(1);
      expect(result.modules[0].instanceId).not.toBe('m1'); // Should have new ID
      expect(result.modules[0].x).toBeGreaterThan(100); // Should be offset
      expect(result.modules[0].y).toBeGreaterThan(100);
    });

    it('should return empty arrays for empty clipboard', () => {
      const clipboard: ClipboardData = {
        modules: [],
        connections: [],
        copiedAt: Date.now(),
      };
      const allModules: PlacedModule[] = [];
      const position: Point = { x: 300, y: 300 };
      
      const result = pasteModules(clipboard, position, allModules);
      
      expect(result.modules.length).toBe(0);
      expect(result.connections.length).toBe(0);
    });

    it('should create new connections with updated module references', () => {
      const clipboard: ClipboardData = {
        modules: [
          createMockModule('m1', 'core-furnace', 100, 100),
          createMockModule('m2', 'gear', 200, 200),
        ],
        connections: [createMockConnection('c1', 'm1', 'm2')],
        copiedAt: Date.now(),
      };
      const allModules: PlacedModule[] = [];
      const position: Point = { x: 300, y: 300 };
      
      const result = pasteModules(clipboard, position, allModules);
      
      expect(result.modules.length).toBe(2);
      expect(result.connections.length).toBe(1);
      expect(result.connections[0].sourceModuleId).not.toBe('m1'); // Should reference new module
      expect(result.connections[0].targetModuleId).not.toBe('m2'); // Should reference new module
    });

    it('should create unique IDs for each paste', () => {
      const clipboard: ClipboardData = {
        modules: [createMockModule('m1', 'core-furnace', 100, 100)],
        connections: [],
        copiedAt: Date.now(),
      };
      const allModules: PlacedModule[] = [];
      const position: Point = { x: 300, y: 300 };
      
      // First paste
      const result1 = pasteModules(clipboard, position, allModules);
      expect(result1.modules.length).toBe(1);
      const firstInstanceId = result1.modules[0].instanceId;
      
      // Add to allModules for second paste
      const updatedAllModules = [...allModules, ...result1.modules];
      
      // Second paste - should create different IDs
      const result2 = pasteModules(clipboard, position, updatedAllModules);
      expect(result2.modules.length).toBe(1);
      expect(result2.modules[0].instanceId).not.toBe(firstInstanceId); // Should be different
    });
  });

  describe('duplicateModules', () => {
    it('should duplicate single module with offset', () => {
      const modules = [createMockModule('m1', 'core-furnace', 100, 100)];
      const connections: Connection[] = [];
      
      const result = duplicateModules(['m1'], modules, connections);
      
      expect(result.modules.length).toBe(1);
      expect(result.modules[0].instanceId).not.toBe('m1');
      expect(result.modules[0].x).toBe(120); // 100 + 20 offset
      expect(result.modules[0].y).toBe(120); // 100 + 20 offset
    });

    it('should duplicate multiple modules', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 150, 150),
      ];
      const connections: Connection[] = [];
      
      const result = duplicateModules(['m1', 'm2'], modules, connections);
      
      expect(result.modules.length).toBe(2);
      // Both modules should be offset by 20
      // m1: 100 -> 120, m2: 150 -> 170
      // The relative difference should be preserved
      const module1 = result.modules.find(m => m.x === 120);
      const module2 = result.modules.find(m => m.x === 170);
      expect(module1).toBeDefined();
      expect(module2).toBeDefined();
    });

    it('should return empty for empty selection', () => {
      const modules = [createMockModule('m1', 'core-furnace', 100, 100)];
      const connections: Connection[] = [];
      
      const result = duplicateModules([], modules, connections);
      
      expect(result.modules.length).toBe(0);
      expect(result.connections.length).toBe(0);
    });

    it('should duplicate connections between selected modules', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      const connections = [createMockConnection('c1', 'm1', 'm2')];
      
      const result = duplicateModules(['m1', 'm2'], modules, connections);
      
      expect(result.connections.length).toBe(1);
      expect(result.connections[0].sourceModuleId).not.toBe('m1');
      expect(result.connections[0].targetModuleId).not.toBe('m2');
    });
  });

  describe('validateClipboard', () => {
    it('should return true for valid clipboard', () => {
      const clipboard: ClipboardData = {
        modules: [createMockModule('m1', 'core-furnace', 100, 100)],
        connections: [],
        copiedAt: Date.now(),
      };
      
      expect(validateClipboard(clipboard)).toBe(true);
    });

    it('should return false for null clipboard', () => {
      expect(validateClipboard(null as any)).toBe(false);
    });

    it('should return false for clipboard with invalid modules', () => {
      const clipboard = {
        modules: [{ instanceId: 'm1' }], // Missing required properties
        connections: [],
        copiedAt: Date.now(),
      };
      
      expect(validateClipboard(clipboard as any)).toBe(false);
    });
  });

  describe('isClipboardEmpty', () => {
    it('should return true for empty clipboard', () => {
      const clipboard: ClipboardData = {
        modules: [],
        connections: [],
        copiedAt: Date.now(),
      };
      
      expect(isClipboardEmpty(clipboard)).toBe(true);
    });

    it('should return true for null clipboard', () => {
      expect(isClipboardEmpty(null)).toBe(true);
    });

    it('should return false for clipboard with modules', () => {
      const clipboard: ClipboardData = {
        modules: [createMockModule('m1', 'core-furnace', 100, 100)],
        connections: [],
        copiedAt: Date.now(),
      };
      
      expect(isClipboardEmpty(clipboard)).toBe(false);
    });
  });

  describe('getClipboardSummary', () => {
    it('should return empty string for empty clipboard', () => {
      const clipboard: ClipboardData = {
        modules: [],
        connections: [],
        copiedAt: Date.now(),
      };
      
      const summary = getClipboardSummary(clipboard);
      expect(summary).toBe('空');
    });

    it('should return summary with module and connection count', () => {
      const clipboard: ClipboardData = {
        modules: [createMockModule('m1', 'core-furnace', 100, 100)],
        connections: [createMockConnection('c1', 'm1', 'm2')],
        copiedAt: Date.now() - 5000, // 5 seconds ago
      };
      
      const summary = getClipboardSummary(clipboard);
      expect(summary).toContain('1 模块');
      expect(summary).toContain('1 连接');
      expect(summary).toContain('5s');
    });
  });
});
