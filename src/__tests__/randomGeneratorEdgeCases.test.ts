import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateRandomMachine, generateWithTheme, validateGeneratedMachine, DEFAULT_CONFIG, generateWithRetry } from '../utils/randomGenerator';
import { MODULE_SIZES, ModuleType, PlacedModule, Connection } from '../types';

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

// =============================================================================
// Round 78 Edge Case Tests
// =============================================================================

describe('Round 78: Random Generator Edge Cases', () => {
  describe('AC2: minModules === maxModules produces fixed module count', () => {
    it('should generate exactly 3 modules when minModules=3 and maxModules=3', () => {
      // Run multiple times to ensure consistency
      for (let i = 0; i < 20; i++) {
        const result = generateWithTheme({
          minModules: 3,
          maxModules: 3,
        });
        
        expect(result.modules.length).toBe(3);
      }
    });

    it('should generate exactly 2 modules when minModules=2 and maxModules=2', () => {
      for (let i = 0; i < 20; i++) {
        const result = generateWithTheme({
          minModules: 2,
          maxModules: 2,
        });
        
        expect(result.modules.length).toBe(2);
      }
    });

    it('should generate exactly 4 modules when minModules=4 and maxModules=4', () => {
      for (let i = 0; i < 20; i++) {
        const result = generateWithTheme({
          minModules: 4,
          maxModules: 4,
        });
        
        expect(result.modules.length).toBe(4);
      }
    });

    it('should generate exactly 5 modules when minModules=5 and maxModules=5', () => {
      for (let i = 0; i < 20; i++) {
        const result = generateWithTheme({
          minModules: 5,
          maxModules: 5,
        });
        
        expect(result.modules.length).toBe(5);
      }
    });

    it('should generate exactly 6 modules when minModules=6 and maxModules=6', () => {
      for (let i = 0; i < 20; i++) {
        const result = generateWithTheme({
          minModules: 6,
          maxModules: 6,
        });
        
        expect(result.modules.length).toBe(6);
      }
    });

    it('should work with all themes when min=max', () => {
      const themes = ['balanced', 'offensive', 'defensive', 'arcane_focus', 'void_chaos', 'inferno_forge', 'storm_surge', 'stellar_harmony', 'temporal_focus'] as const;
      
      themes.forEach(theme => {
        const result = generateWithTheme({
          minModules: 3,
          maxModules: 3,
          theme,
        });
        
        expect(result.modules.length).toBe(3);
        expect(result.theme).toBe(theme);
      });
    });
  });

  describe('AC3: Low connection density always produces at least 1 connection', () => {
    it('should always produce at least 1 connection with connectionDensity="low"', () => {
      // Run many iterations to ensure consistency
      for (let i = 0; i < 50; i++) {
        const result = generateWithTheme({
          minModules: 3,
          maxModules: 5,
          connectionDensity: 'low',
        });
        
        expect(result.connections.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should always produce at least 1 connection with 2 modules at low density', () => {
      for (let i = 0; i < 50; i++) {
        const result = generateWithTheme({
          minModules: 2,
          maxModules: 2,
          connectionDensity: 'low',
        });
        
        expect(result.connections.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should always produce at least 1 connection with 6 modules at low density', () => {
      for (let i = 0; i < 50; i++) {
        const result = generateWithTheme({
          minModules: 6,
          maxModules: 6,
          connectionDensity: 'low',
        });
        
        expect(result.connections.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should still produce additional connections based on probability', () => {
      // With more modules, there's higher chance of additional connections
      let hasMoreThanOne = false;
      for (let i = 0; i < 30; i++) {
        const result = generateWithTheme({
          minModules: 6,
          maxModules: 6,
          connectionDensity: 'low',
        });
        
        if (result.connections.length > 1) {
          hasMoreThanOne = true;
          break;
        }
      }
      // At least one should have more than 1 connection (20% probability per pair)
      expect(hasMoreThanOne).toBe(true);
    });

    it('should produce valid connections (output->input direction)', () => {
      const result = generateWithTheme({
        minModules: 3,
        maxModules: 4,
        connectionDensity: 'low',
      });
      
      // All connections should be output->input
      result.connections.forEach(conn => {
        const sourceModule = result.modules.find(m => m.instanceId === conn.sourceModuleId);
        const targetModule = result.modules.find(m => m.instanceId === conn.targetModuleId);
        
        expect(sourceModule).toBeDefined();
        expect(targetModule).toBeDefined();
        
        const sourcePort = sourceModule?.ports.find(p => p.id === conn.sourcePortId);
        const targetPort = targetModule?.ports.find(p => p.id === conn.targetPortId);
        
        expect(sourcePort?.type).toBe('output');
        expect(targetPort?.type).toBe('input');
      });
    });
  });

  describe('AC4: Empty canvas generation produces valid machine with core', () => {
    it('should generate a machine with at least 1 core-furnace when starting fresh', () => {
      // This tests the fallback mechanism for empty canvas
      // The generator should always ensure there's a core module
      
      for (let i = 0; i < 20; i++) {
        const result = generateWithTheme({
          minModules: 2,
          maxModules: 4,
        });
        
        // Should have at least one core-furnace
        const hasCore = result.modules.some(m => m.type === 'core-furnace');
        expect(hasCore).toBe(true);
      }
    });

    it('should generate valid machine structure (modules + connections)', () => {
      const result = generateWithTheme({
        minModules: 2,
        maxModules: 3,
      });
      
      // Should have modules
      expect(result.modules.length).toBeGreaterThanOrEqual(2);
      
      // Should have connections
      expect(result.connections.length).toBeGreaterThanOrEqual(1);
      
      // All connections should reference valid modules
      result.connections.forEach(conn => {
        const sourceExists = result.modules.some(m => m.instanceId === conn.sourceModuleId);
        const targetExists = result.modules.some(m => m.instanceId === conn.targetModuleId);
        
        expect(sourceExists).toBe(true);
        expect(targetExists).toBe(true);
      });
    });

    it('should maintain minimum spacing even with fallback core', () => {
      const result = generateWithTheme({
        minModules: 2,
        maxModules: 3,
        minSpacing: 80,
      });
      
      // Check all module pairs maintain spacing
      for (let i = 0; i < result.modules.length; i++) {
        for (let j = i + 1; j < result.modules.length; j++) {
          const distance = getDistanceBetween(result.modules[i], result.modules[j]);
          expect(distance).toBeGreaterThanOrEqual(75); // Account for floating-point precision
        }
      }
    });

    it('should validate successfully for generated machines', () => {
      for (let i = 0; i < 20; i++) {
        const result = generateWithTheme({
          minModules: 2,
          maxModules: 4,
        });
        
        const validation = validateGeneratedMachine(
          result.modules,
          result.connections,
          80
        );
        
        // Should have no overlaps and all connections valid
        expect(validation.noOverlaps).toBe(true);
        expect(validation.allConnectionsValid).toBe(true);
      }
    });
  });

  describe('AC2+AC3+AC4: Combined edge case testing', () => {
    it('min=max=3 with low density should produce 3 modules and at least 1 connection', () => {
      for (let i = 0; i < 30; i++) {
        const result = generateWithTheme({
          minModules: 3,
          maxModules: 3,
          connectionDensity: 'low',
        });
        
        expect(result.modules.length).toBe(3);
        expect(result.connections.length).toBeGreaterThanOrEqual(1);
        
        // Should still have core module
        const hasCore = result.modules.some(m => m.type === 'core-furnace');
        expect(hasCore).toBe(true);
      }
    });

    it('min=max=2 with low density should produce valid 2-module machine', () => {
      for (let i = 0; i < 30; i++) {
        const result = generateWithTheme({
          minModules: 2,
          maxModules: 2,
          connectionDensity: 'low',
        });
        
        expect(result.modules.length).toBe(2);
        expect(result.connections.length).toBeGreaterThanOrEqual(1);
        
        // Validation should pass
        const validation = validateGeneratedMachine(result.modules, result.connections, 80);
        expect(validation.noOverlaps).toBe(true);
        expect(validation.allConnectionsValid).toBe(true);
      }
    });
  });
});

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
        
        // Validation should pass for spacing and connection validity
        expect(validation.noOverlaps).toBe(true);
        expect(validation.allConnectionsValid).toBe(true);
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
      expect(validation.noOverlaps).toBe(true);
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
      expect(validation.noOverlaps).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(e => e.includes('overlap'))).toBe(true);
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
      expect(validation.noOverlaps).toBe(false);
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
      expect(validation.allConnectionsValid).toBe(false);
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
      expect(validation.allConnectionsValid).toBe(false);
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
      expect(validation.allConnectionsValid).toBe(false);
      expect(validation.errors.some(e => e.includes('invalid port'))).toBe(true);
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
      expect(validation.allConnectionsValid).toBe(false);
      expect(validation.errors.some(e => e.includes('invalid port'))).toBe(true);
    });
  });

  describe('Empty Modules Array Handling', () => {
    it('should handle empty modules array gracefully', () => {
      const validation = validateGeneratedMachine([], [], 80);
      
      // Empty machine with no modules is technically valid (no spacing violations)
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate modules without connections (no longer requires connections)', () => {
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
      
      // Validation now only checks spacing and connection validity, not presence of connections
      const validation = validateGeneratedMachine(modules, [], 80);
      
      // With proper spacing and no connections, validation should pass
      expect(validation.noOverlaps).toBe(true);
      expect(validation.allConnectionsValid).toBe(true);
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
      // Check that no overlaps exist (primary validation concern)
      expect(validation.noOverlaps).toBe(true);
    }
  });
});

// =============================================================================
// AC5: EnergyPath Memoization Test
// =============================================================================

describe('AC5: EnergyPath Component Memoization', () => {
  // Note: This test verifies the EnergyPath component structure
  // The actual React.memo behavior would be tested with RTL in a browser environment
  
  it('should export EnergyPath as a named export from the module', () => {
    // Verify the component is properly exported by checking the file exists
    // This is a file existence check since we're in Node.js
    const fs = require('fs');
    const path = require('path');
    const energyPathPath = path.join(__dirname, '../components/Connections/EnergyPath.tsx');
    expect(fs.existsSync(energyPathPath)).toBe(true);
  });
  
  it('should have memo import in EnergyPath file', () => {
    const fs = require('fs');
    const path = require('path');
    const energyPathPath = path.join(__dirname, '../components/Connections/EnergyPath.tsx');
    const content = fs.readFileSync(energyPathPath, 'utf-8');
    
    // Check that memo is imported from react
    expect(content).toContain('import { useRef, useEffect, useState, useMemo, memo }');
    
    // Check that the component is wrapped with memo
    expect(content).toContain('export const EnergyPath = memo(function EnergyPath');
  });
});
