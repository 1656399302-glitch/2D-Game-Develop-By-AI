/**
 * Auto-layout Integration Tests
 * 
 * Tests for AC-119-002: Auto-layout algorithm arranges circuit components without overlaps;
 * minimum 20px spacing between components
 * 
 * Test Methods from Contract:
 * Run unit tests in `tests/autoLayout/` with sample circuits (5, 10, 20 components).
 * Measure overlap detection and spacing.
 */

import { describe, it, expect } from 'vitest';
import { autoArrange, autoArrangeCircular, autoArrangeLine, autoArrangeCascade } from '../../utils/autoLayout';
import { PlacedModule, MODULE_SIZES } from '../../types';

describe('AutoLayout Spacing Tests (AC-119-002)', () => {
  // Helper to create a mock module
  const createModule = (id: string, x = 100, y = 100, type: PlacedModule['type'] = 'core-furnace'): PlacedModule => ({
    id,
    instanceId: id,
    type,
    x,
    y,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [],
  });

  // Helper to check if two modules overlap
  function checkOverlap(m1: PlacedModule, m2: PlacedModule): boolean {
    const size1 = MODULE_SIZES[m1.type] || { width: 80, height: 80 };
    const size2 = MODULE_SIZES[m2.type] || { width: 80, height: 80 };
    
    const m1Right = m1.x + size1.width;
    const m1Bottom = m1.y + size1.height;
    const m2Right = m2.x + size2.width;
    const m2Bottom = m2.y + size2.height;
    
    return !(m1Right <= m2.x || m2Right <= m1.x || m1Bottom <= m2.y || m2Bottom <= m1.y);
  }

  // Helper to calculate minimum spacing between two modules
  function getMinSpacing(m1: PlacedModule, m2: PlacedModule): number {
    const size1 = MODULE_SIZES[m1.type] || { width: 80, height: 80 };
    const size2 = MODULE_SIZES[m2.type] || { width: 80, height: 80 };
    
    const m1CenterX = m1.x + size1.width / 2;
    const m1CenterY = m1.y + size1.height / 2;
    const m2CenterX = m2.x + size2.width / 2;
    const m2CenterY = m2.y + size2.height / 2;
    
    const centerDistX = Math.abs(m1CenterX - m2CenterX);
    const centerDistY = Math.abs(m1CenterY - m2CenterY);
    
    // Distance between edges
    const edgeDistX = centerDistX - (size1.width / 2 + size2.width / 2);
    const edgeDistY = centerDistY - (size1.height / 2 + size2.height / 2);
    
    return Math.sqrt(edgeDistX * edgeDistX + edgeDistY * edgeDistY);
  }

  describe('Grid Layout Spacing', () => {
    it('should have minimum 20px spacing between modules in grid layout (5 modules)', () => {
      const modules = [
        createModule('m1', 0, 0),
        createModule('m2', 50, 50),
        createModule('m3', 100, 0),
        createModule('m4', 0, 100),
        createModule('m5', 100, 100),
      ];
      
      const result = autoArrange(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      // Check all pairs for overlap
      for (let i = 0; i < result.modules.length; i++) {
        for (let j = i + 1; j < result.modules.length; j++) {
          const m1 = result.modules[i];
          const m2 = result.modules[j];
          
          expect(checkOverlap(m1, m2)).toBe(false);
          
          const spacing = getMinSpacing(m1, m2);
          expect(spacing).toBeGreaterThanOrEqual(20);
        }
      }
    });

    it('should have minimum 20px spacing between modules in grid layout (10 modules)', () => {
      const modules = Array.from({ length: 10 }, (_, i) => 
        createModule(`m${i}`, i * 50, Math.floor(i / 2) * 50)
      );
      
      const result = autoArrange(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      for (let i = 0; i < result.modules.length; i++) {
        for (let j = i + 1; j < result.modules.length; j++) {
          const m1 = result.modules[i];
          const m2 = result.modules[j];
          
          expect(checkOverlap(m1, m2)).toBe(false);
          
          const spacing = getMinSpacing(m1, m2);
          expect(spacing).toBeGreaterThanOrEqual(20);
        }
      }
    });

    it('should have minimum 20px spacing between modules in grid layout (20 modules)', () => {
      const modules = Array.from({ length: 20 }, (_, i) => 
        createModule(`m${i}`, i * 50, Math.floor(i / 4) * 50)
      );
      
      const result = autoArrange(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      for (let i = 0; i < result.modules.length; i++) {
        for (let j = i + 1; j < result.modules.length; j++) {
          const m1 = result.modules[i];
          const m2 = result.modules[j];
          
          expect(checkOverlap(m1, m2)).toBe(false);
          
          const spacing = getMinSpacing(m1, m2);
          expect(spacing).toBeGreaterThanOrEqual(20);
        }
      }
    });
  });

  describe('Circular Layout Spacing', () => {
    it('should have minimum 20px spacing between modules in circular layout (5 modules)', () => {
      const modules = [
        createModule('m1'), createModule('m2'), createModule('m3'),
        createModule('m4'), createModule('m5'),
      ];
      
      const result = autoArrangeCircular(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      for (let i = 0; i < result.modules.length; i++) {
        for (let j = i + 1; j < result.modules.length; j++) {
          const m1 = result.modules[i];
          const m2 = result.modules[j];
          
          expect(checkOverlap(m1, m2)).toBe(false);
          
          const spacing = getMinSpacing(m1, m2);
          expect(spacing).toBeGreaterThanOrEqual(20);
        }
      }
    });

    it('should have minimum 20px spacing between modules in circular layout (10 modules)', () => {
      const modules = Array.from({ length: 10 }, (_, i) => createModule(`m${i}`));
      
      const result = autoArrangeCircular(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      for (let i = 0; i < result.modules.length; i++) {
        for (let j = i + 1; j < result.modules.length; j++) {
          const m1 = result.modules[i];
          const m2 = result.modules[j];
          
          expect(checkOverlap(m1, m2)).toBe(false);
          
          const spacing = getMinSpacing(m1, m2);
          expect(spacing).toBeGreaterThanOrEqual(20);
        }
      }
    });
  });

  describe('Line Layout Spacing', () => {
    it('should have minimum 20px spacing between modules in line layout (5 modules)', () => {
      const modules = [
        createModule('m1'), createModule('m2'), createModule('m3'),
        createModule('m4'), createModule('m5'),
      ];
      
      const result = autoArrangeLine(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      for (let i = 0; i < result.modules.length; i++) {
        for (let j = i + 1; j < result.modules.length; j++) {
          const m1 = result.modules[i];
          const m2 = result.modules[j];
          
          expect(checkOverlap(m1, m2)).toBe(false);
          
          const spacing = getMinSpacing(m1, m2);
          expect(spacing).toBeGreaterThanOrEqual(20);
        }
      }
    });

    it('should have minimum 20px spacing between modules in line layout (10 modules)', () => {
      const modules = Array.from({ length: 10 }, (_, i) => createModule(`m${i}`));
      
      const result = autoArrangeLine(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      for (let i = 0; i < result.modules.length; i++) {
        for (let j = i + 1; j < result.modules.length; j++) {
          const m1 = result.modules[i];
          const m2 = result.modules[j];
          
          expect(checkOverlap(m1, m2)).toBe(false);
          
          const spacing = getMinSpacing(m1, m2);
          expect(spacing).toBeGreaterThanOrEqual(20);
        }
      }
    });
  });

  describe('Cascade Layout Spacing', () => {
    it('should have minimum 20px spacing between modules in cascade layout (5 modules)', () => {
      const modules = [
        createModule('m1'), createModule('m2'), createModule('m3'),
        createModule('m4'), createModule('m5'),
      ];
      
      const result = autoArrangeCascade(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      for (let i = 0; i < result.modules.length; i++) {
        for (let j = i + 1; j < result.modules.length; j++) {
          const m1 = result.modules[i];
          const m2 = result.modules[j];
          
          expect(checkOverlap(m1, m2)).toBe(false);
          
          const spacing = getMinSpacing(m1, m2);
          expect(spacing).toBeGreaterThanOrEqual(20);
        }
      }
    });

    it('should have minimum 20px spacing between modules in cascade layout (10 modules)', () => {
      const modules = Array.from({ length: 10 }, (_, i) => createModule(`m${i}`));
      
      const result = autoArrangeCascade(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      for (let i = 0; i < result.modules.length; i++) {
        for (let j = i + 1; j < result.modules.length; j++) {
          const m1 = result.modules[i];
          const m2 = result.modules[j];
          
          expect(checkOverlap(m1, m2)).toBe(false);
          
          const spacing = getMinSpacing(m1, m2);
          expect(spacing).toBeGreaterThanOrEqual(20);
        }
      }
    });
  });

  describe('Mixed Module Sizes', () => {
    it('should maintain 20px spacing with different module sizes in grid layout', () => {
      const modules = [
        createModule('m1', 0, 0, 'core-furnace'),      // 100x100
        createModule('m2', 50, 50, 'energy-pipe'),     // 120x50
        createModule('m3', 100, 0, 'gear'),             // 80x80
        createModule('m4', 0, 100, 'rune-node'),       // 80x80
        createModule('m5', 100, 100, 'shield-shell'),  // 100x60
      ];
      
      const result = autoArrange(modules, [], { containerWidth: 800, containerHeight: 600 });
      
      for (let i = 0; i < result.modules.length; i++) {
        for (let j = i + 1; j < result.modules.length; j++) {
          const m1 = result.modules[i];
          const m2 = result.modules[j];
          
          expect(checkOverlap(m1, m2)).toBe(false);
          
          const spacing = getMinSpacing(m1, m2);
          expect(spacing).toBeGreaterThanOrEqual(20);
        }
      }
    });
  });
});
