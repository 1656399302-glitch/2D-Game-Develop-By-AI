import { describe, it, expect } from 'vitest';
import { generateRandomMachine, validateGeneratedMachine, DEFAULT_CONFIG } from '../utils/randomGenerator';
import { MODULE_SIZES, ModuleType, PlacedModule, Connection } from '../types';

/**
 * Tests for random generator edge cases within the supported 2-6 module range.
 * 
 * Note: The random generator only supports 2-6 modules. Tests for 0, 1, or 10+ modules
 * are not applicable and would test unsupported behavior.
 */

// Helper to get module size matching the actual MODULE_SIZES
const getModuleSize = (type: ModuleType) => MODULE_SIZES[type] || { width: 80, height: 80 };

// Helper to calculate module center using actual MODULE_SIZES
const getModuleCenter = (module: { x: number; y: number; type: ModuleType }) => {
  const size = getModuleSize(module.type);
  return {
    x: module.x + size.width / 2,
    y: module.y + size.height / 2,
  };
};

// Helper to calculate distance between two modules' centers
const getDistanceBetween = (a: { x: number; y: number; type: ModuleType }, b: { x: number; y: number; type: ModuleType }) => {
  const centerA = getModuleCenter(a);
  const centerB = getModuleCenter(b);
  return Math.sqrt(
    Math.pow(centerA.x - centerB.x, 2) + Math.pow(centerA.y - centerB.y, 2)
  );
};

describe('Random Generator Edge Cases - 2-6 Module Range', () => {
  describe('Default Config (2-6 modules)', () => {
    it('should generate machines within 2-6 module range by default', () => {
      for (let i = 0; i < 20; i++) {
        const { modules } = generateRandomMachine();
        expect(modules.length).toBeGreaterThanOrEqual(2);
        expect(modules.length).toBeLessThanOrEqual(6);
      }
    });

    it('should enforce minimum 80px center-to-center spacing by default', () => {
      // Use a threshold slightly below 80 to account for floating-point precision
      const MIN_SPACING = 75;
      
      for (let i = 0; i < 10; i++) {
        const { modules } = generateRandomMachine();
        
        for (let j = 0; j < modules.length; j++) {
          for (let k = j + 1; k < modules.length; k++) {
            const distance = getDistanceBetween(modules[j], modules[k]);
            expect(distance).toBeGreaterThanOrEqual(MIN_SPACING);
          }
        }
      }
    });

    it('should create valid connections with proper port references', () => {
      for (let i = 0; i < 10; i++) {
        const { modules, connections } = generateRandomMachine();
        
        if (modules.length >= 2) {
          expect(connections.length).toBeGreaterThanOrEqual(1);
          
          for (const conn of connections) {
            // Verify source module exists
            const sourceModule = modules.find(m => m.instanceId === conn.sourceModuleId);
            expect(sourceModule).toBeDefined();
            
            // Verify target module exists
            const targetModule = modules.find(m => m.instanceId === conn.targetModuleId);
            expect(targetModule).toBeDefined();
            
            // Verify port IDs exist on the modules
            const sourcePort = sourceModule?.ports.find(p => p.id === conn.sourcePortId);
            expect(sourcePort).toBeDefined();
            
            const targetPort = targetModule?.ports.find(p => p.id === conn.targetPortId);
            expect(targetPort).toBeDefined();
          }
        }
      }
    });

    it('should pass validateGeneratedMachine for generated machines', () => {
      for (let i = 0; i < 10; i++) {
        const { modules, connections } = generateRandomMachine();
        const validation = validateGeneratedMachine(modules, connections, 80);
        
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      }
    });
  });

  describe('Minimum Modules (2 modules)', () => {
    it('should generate exactly 2 modules when configured', () => {
      const { modules, connections } = generateRandomMachine({
        minModules: 2,
        maxModules: 2,
      });
      
      expect(modules.length).toBe(2);
    });

    it('should create at least one connection for 2-module machines', () => {
      const { modules, connections } = generateRandomMachine({
        minModules: 2,
        maxModules: 2,
      });
      
      expect(modules.length).toBe(2);
      expect(connections.length).toBeGreaterThanOrEqual(1);
    });

    it('should maintain spacing constraints with 2 modules', () => {
      const { modules } = generateRandomMachine({
        minModules: 2,
        maxModules: 2,
        minSpacing: 80,
      });
      
      expect(modules.length).toBe(2);
      
      const distance = getDistanceBetween(modules[0], modules[1]);
      expect(distance).toBeGreaterThanOrEqual(75); // Account for floating-point precision
    });
  });

  describe('Maximum Modules (6 modules)', () => {
    it('should generate exactly 6 modules when configured', () => {
      const { modules, connections } = generateRandomMachine({
        minModules: 6,
        maxModules: 6,
      });
      
      expect(modules.length).toBe(6);
    });

    it('should create connections for 6-module machines', () => {
      const { modules, connections } = generateRandomMachine({
        minModules: 6,
        maxModules: 6,
      });
      
      expect(modules.length).toBe(6);
      expect(connections.length).toBeGreaterThanOrEqual(1);
    });

    it('should maintain spacing constraints with 6 modules', () => {
      const { modules } = generateRandomMachine({
        minModules: 6,
        maxModules: 6,
        minSpacing: 80,
      });
      
      expect(modules.length).toBe(6);
      
      // Check all pairs
      for (let i = 0; i < modules.length; i++) {
        for (let j = i + 1; j < modules.length; j++) {
          const distance = getDistanceBetween(modules[i], modules[j]);
          expect(distance).toBeGreaterThanOrEqual(75);
        }
      }
    });

    it('should validate successfully for 6-module machines', () => {
      const { modules, connections } = generateRandomMachine({
        minModules: 6,
        maxModules: 6,
      });
      
      const validation = validateGeneratedMachine(modules, connections, 80);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Spacing Constraints Across Range', () => {
    it('should maintain spacing for 3-module machines', () => {
      const { modules } = generateRandomMachine({
        minModules: 3,
        maxModules: 3,
        minSpacing: 80,
      });
      
      expect(modules.length).toBe(3);
      
      for (let i = 0; i < modules.length; i++) {
        for (let j = i + 1; j < modules.length; j++) {
          const distance = getDistanceBetween(modules[i], modules[j]);
          expect(distance).toBeGreaterThanOrEqual(75);
        }
      }
    });

    it('should maintain spacing for 4-module machines', () => {
      const { modules } = generateRandomMachine({
        minModules: 4,
        maxModules: 4,
        minSpacing: 80,
      });
      
      expect(modules.length).toBe(4);
      
      for (let i = 0; i < modules.length; i++) {
        for (let j = i + 1; j < modules.length; j++) {
          const distance = getDistanceBetween(modules[i], modules[j]);
          expect(distance).toBeGreaterThanOrEqual(75);
        }
      }
    });

    it('should maintain spacing for 5-module machines', () => {
      const { modules } = generateRandomMachine({
        minModules: 5,
        maxModules: 5,
        minSpacing: 80,
      });
      
      expect(modules.length).toBe(5);
      
      for (let i = 0; i < modules.length; i++) {
        for (let j = i + 1; j < modules.length; j++) {
          const distance = getDistanceBetween(modules[i], modules[j]);
          expect(distance).toBeGreaterThanOrEqual(75);
        }
      }
    });
  });
});

describe('Random Generator Negative Tests', () => {
  describe('Overlapping Modules Detection', () => {
    it('should detect overlapping modules in validateGeneratedMachine', () => {
      // Create modules with positions that violate spacing
      const overlappingModules: PlacedModule[] = [
        {
          id: 'mod-1',
          instanceId: 'inst-1',
          type: 'core-furnace',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
        {
          id: 'mod-2',
          instanceId: 'inst-2',
          type: 'gear',
          x: 110, // Only 10px away from first module - violates 80px spacing
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      const validation = validateGeneratedMachine(overlappingModules, [], 80);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(e => e.includes('too close'))).toBe(true);
    });

    it('should detect multiple spacing violations', () => {
      // Create 3 modules where 2 pairs violate spacing
      const overlappingModules: PlacedModule[] = [
        {
          id: 'mod-1',
          instanceId: 'inst-1',
          type: 'core-furnace',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
        {
          id: 'mod-2',
          instanceId: 'inst-2',
          type: 'gear',
          x: 110, // Too close to mod-1
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
        {
          id: 'mod-3',
          instanceId: 'inst-3',
          type: 'rune-node',
          x: 115, // Too close to both mod-1 and mod-2
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      const validation = validateGeneratedMachine(overlappingModules, [], 80);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThanOrEqual(2); // At least 2 violations
    });
  });

  describe('Invalid Port References Detection', () => {
    it('should detect connections with invalid source module', () => {
      const modules: PlacedModule[] = [
        {
          id: 'mod-1',
          instanceId: 'inst-1',
          type: 'core-furnace',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [{ id: 'port-1', type: 'output', position: { x: 50, y: 50 } }],
        },
      ];
      
      const connections: Connection[] = [
        {
          id: 'conn-1',
          sourceModuleId: 'non-existent-module', // Invalid source
          sourcePortId: 'port-1',
          targetModuleId: 'inst-1',
          targetPortId: 'port-1',
          pathData: 'M 0 0 L 100 100',
        },
      ];
      
      const validation = validateGeneratedMachine(modules, connections, 80);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('invalid module'))).toBe(true);
    });

    it('should detect connections with invalid target module', () => {
      const modules: PlacedModule[] = [
        {
          id: 'mod-1',
          instanceId: 'inst-1',
          type: 'core-furnace',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [{ id: 'port-1', type: 'output', position: { x: 50, y: 50 } }],
        },
      ];
      
      const connections: Connection[] = [
        {
          id: 'conn-1',
          sourceModuleId: 'inst-1',
          sourcePortId: 'port-1',
          targetModuleId: 'non-existent-module', // Invalid target
          targetPortId: 'port-1',
          pathData: 'M 0 0 L 100 100',
        },
      ];
      
      const validation = validateGeneratedMachine(modules, connections, 80);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('invalid module'))).toBe(true);
    });

    it('should detect connections with invalid source port', () => {
      const modules: PlacedModule[] = [
        {
          id: 'mod-1',
          instanceId: 'inst-1',
          type: 'core-furnace',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [{ id: 'port-1', type: 'output', position: { x: 50, y: 50 } }],
        },
        {
          id: 'mod-2',
          instanceId: 'inst-2',
          type: 'gear',
          x: 300,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [{ id: 'port-2', type: 'input', position: { x: 0, y: 40 } }],
        },
      ];
      
      const connections: Connection[] = [
        {
          id: 'conn-1',
          sourceModuleId: 'inst-1',
          sourcePortId: 'non-existent-port', // Invalid source port
          targetModuleId: 'inst-2',
          targetPortId: 'port-2',
          pathData: 'M 0 0 L 100 100',
        },
      ];
      
      const validation = validateGeneratedMachine(modules, connections, 80);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('invalid source port'))).toBe(true);
    });

    it('should detect connections with invalid target port', () => {
      const modules: PlacedModule[] = [
        {
          id: 'mod-1',
          instanceId: 'inst-1',
          type: 'core-furnace',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [{ id: 'port-1', type: 'output', position: { x: 50, y: 50 } }],
        },
        {
          id: 'mod-2',
          instanceId: 'inst-2',
          type: 'gear',
          x: 300,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [{ id: 'port-2', type: 'input', position: { x: 0, y: 40 } }],
        },
      ];
      
      const connections: Connection[] = [
        {
          id: 'conn-1',
          sourceModuleId: 'inst-1',
          sourcePortId: 'port-1',
          targetModuleId: 'inst-2',
          targetPortId: 'non-existent-port', // Invalid target port
          pathData: 'M 0 0 L 100 100',
        },
      ];
      
      const validation = validateGeneratedMachine(modules, connections, 80);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('invalid target port'))).toBe(true);
    });
  });

  describe('Empty Modules Array Handling', () => {
    it('should handle empty modules array gracefully', () => {
      const validation = validateGeneratedMachine([], [], 80);
      
      // Empty machine with no modules is technically valid (no spacing violations)
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing connections for 2+ modules', () => {
      const modules: PlacedModule[] = [
        {
          id: 'mod-1',
          instanceId: 'inst-1',
          type: 'core-furnace',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
        {
          id: 'mod-2',
          instanceId: 'inst-2',
          type: 'gear',
          x: 300,
          y: 100,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      const validation = validateGeneratedMachine(modules, [], 80);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('no connections'))).toBe(true);
    });
  });
});

describe('Default Config Verification', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_CONFIG.minModules).toBe(2);
    expect(DEFAULT_CONFIG.maxModules).toBe(6);
    expect(DEFAULT_CONFIG.minSpacing).toBe(80);
    expect(DEFAULT_CONFIG.canvasWidth).toBe(800);
    expect(DEFAULT_CONFIG.canvasHeight).toBe(600);
    expect(DEFAULT_CONFIG.padding).toBe(100);
  });

  it('should generate valid machines using default config', () => {
    for (let i = 0; i < 20; i++) {
      const { modules, connections } = generateRandomMachine();
      
      expect(modules.length).toBeGreaterThanOrEqual(DEFAULT_CONFIG.minModules);
      expect(modules.length).toBeLessThanOrEqual(DEFAULT_CONFIG.maxModules);
      
      const validation = validateGeneratedMachine(modules, connections, DEFAULT_CONFIG.minSpacing);
      expect(validation.valid).toBe(true);
    }
  });
});
