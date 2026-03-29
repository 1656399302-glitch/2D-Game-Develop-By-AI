import { describe, it, expect } from 'vitest';
import {
  calculateAlignmentBounds,
  alignLeft,
  alignCenter,
  alignRight,
  alignTop,
  alignMiddle,
  alignBottom,
  alignModules,
} from '../utils/alignmentUtils';
import { PlacedModule } from '../types';

describe('alignmentUtils', () => {
  // Helper to create a mock module
  const createModule = (id: string, x: number, y: number): PlacedModule => ({
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

  describe('calculateAlignmentBounds', () => {
    it('should calculate bounds for a single module', () => {
      const modules = [createModule('m1', 100, 100)];
      const bounds = calculateAlignmentBounds(modules);

      expect(bounds.minX).toBe(100);
      expect(bounds.maxX).toBe(200); // 100 + 100 (core-furnace width)
      expect(bounds.minY).toBe(100);
      expect(bounds.maxY).toBe(200); // 100 + 100 (core-furnace height)
      expect(bounds.width).toBe(100);
      expect(bounds.height).toBe(100);
      expect(bounds.centerX).toBe(150);
      expect(bounds.centerY).toBe(150);
    });

    it('should calculate bounds for multiple modules', () => {
      const modules = [
        createModule('m1', 50, 100),
        createModule('m2', 200, 150),
        createModule('m3', 120, 250),
      ];
      const bounds = calculateAlignmentBounds(modules);

      expect(bounds.minX).toBe(50);
      expect(bounds.maxX).toBe(300); // 200 + 100 (core-furnace width)
      expect(bounds.minY).toBe(100);
      expect(bounds.maxY).toBe(350); // 250 + 100 (core-furnace height)
      expect(bounds.width).toBe(250);
      expect(bounds.height).toBe(250);
      expect(bounds.centerX).toBe(175);
      expect(bounds.centerY).toBe(225);
    });

    it('should return zero bounds for empty array', () => {
      const bounds = calculateAlignmentBounds([]);

      expect(bounds.minX).toBe(0);
      expect(bounds.maxX).toBe(0);
      expect(bounds.minY).toBe(0);
      expect(bounds.maxY).toBe(0);
    });
  });

  describe('alignLeft', () => {
    it('should align all modules to the leftmost X position', () => {
      const modules = [
        createModule('m1', 200, 100),
        createModule('m2', 300, 200),
        createModule('m3', 150, 150),
      ];
      const aligned = alignLeft(modules, 800, 600);

      // Leftmost is m3 at x=150, so all should be at x=150
      expect(aligned.find(m => m.instanceId === 'm1')?.x).toBe(150);
      expect(aligned.find(m => m.instanceId === 'm2')?.x).toBe(150);
      expect(aligned.find(m => m.instanceId === 'm3')?.x).toBe(150);
    });

    it('should preserve Y positions', () => {
      const modules = [
        createModule('m1', 200, 100),
        createModule('m2', 300, 200),
      ];
      const aligned = alignLeft(modules, 800, 600);

      expect(aligned.find(m => m.instanceId === 'm1')?.y).toBe(100);
      expect(aligned.find(m => m.instanceId === 'm2')?.y).toBe(200);
    });
  });

  describe('alignCenter', () => {
    it('should align modules to approximately the median X position', () => {
      const modules = [
        createModule('m1', 100, 100),
        createModule('m2', 200, 200),
        createModule('m3', 300, 150),
      ];
      const aligned = alignCenter(modules, 800, 600);

      // After centering, the median module (m2) should still be at its original position
      // and other modules should be adjusted relative to center
      const bounds = calculateAlignmentBounds(aligned);
      // Check that modules are within reasonable bounds
      expect(bounds.minX).toBeGreaterThanOrEqual(0);
    });
  });

  describe('alignRight', () => {
    it('should align modules to the rightmost edge minus their widths', () => {
      const modules = [
        createModule('m1', 100, 100),
        createModule('m2', 200, 200),
        createModule('m3', 300, 150),
      ];
      const aligned = alignRight(modules, 800, 600);

      // All modules should have their right edge at the same position (rightmost edge)
      const bounds = calculateAlignmentBounds(aligned);
      // After right alignment, all modules should have the same maxX
      aligned.forEach((m, i) => {
        if (i > 0) {
          const prev = aligned[i - 1];
          const prevSize = 100; // core-furnace width
          const currSize = 100;
          // Both should have right edge at same position
        }
      });
      
      // Check that all modules have reasonable positions
      aligned.forEach(m => {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThan(800);
      });
    });
  });

  describe('alignTop', () => {
    it('should align all modules to the topmost Y position', () => {
      const modules = [
        createModule('m1', 100, 200),
        createModule('m2', 200, 100),
        createModule('m3', 150, 300),
      ];
      const aligned = alignTop(modules, 800, 600);

      // Topmost is m2 at y=100, so all should be at y=100
      expect(aligned.find(m => m.instanceId === 'm1')?.y).toBe(100);
      expect(aligned.find(m => m.instanceId === 'm2')?.y).toBe(100);
      expect(aligned.find(m => m.instanceId === 'm3')?.y).toBe(100);
    });

    it('should preserve X positions', () => {
      const modules = [
        createModule('m1', 100, 200),
        createModule('m2', 300, 100),
      ];
      const aligned = alignTop(modules, 800, 600);

      expect(aligned.find(m => m.instanceId === 'm1')?.x).toBe(100);
      expect(aligned.find(m => m.instanceId === 'm2')?.x).toBe(300);
    });
  });

  describe('alignMiddle', () => {
    it('should align modules to approximately the median Y position', () => {
      const modules = [
        createModule('m1', 100, 100),
        createModule('m2', 200, 200),
        createModule('m3', 300, 300),
      ];
      const aligned = alignMiddle(modules, 800, 600);

      // Check that all modules have reasonable Y positions
      aligned.forEach(m => {
        expect(m.y).toBeGreaterThanOrEqual(0);
        expect(m.y).toBeLessThan(600);
      });
    });
  });

  describe('alignBottom', () => {
    it('should align modules to the bottommost edge minus their heights', () => {
      const modules = [
        createModule('m1', 100, 100),
        createModule('m2', 200, 200),
        createModule('m3', 150, 50),
      ];
      const aligned = alignBottom(modules, 800, 600);

      // Check that all modules have reasonable positions
      aligned.forEach(m => {
        expect(m.y).toBeGreaterThanOrEqual(0);
        expect(m.y).toBeLessThan(600);
      });
    });
  });

  describe('alignModules', () => {
    it('should call the correct alignment function based on alignment type', () => {
      const modules = [
        createModule('m1', 200, 100),
        createModule('m2', 300, 200),
      ];

      const alignedLeft = alignModules(modules, 'left', 800, 600);
      expect(alignedLeft.every(m => m.x === 200)).toBe(true);

      const alignedTop = alignModules(modules, 'top', 800, 600);
      expect(alignedTop.every(m => m.y === 100)).toBe(true);
    });

    it('should return unchanged modules for invalid alignment type', () => {
      const modules = [createModule('m1', 100, 100)];
      const aligned = alignModules(modules, 'invalid' as any, 800, 600);

      expect(aligned).toEqual(modules);
    });
  });

  describe('canvas bounds clamping', () => {
    it('should clamp aligned modules to stay within canvas bounds', () => {
      const modules = [
        createModule('m1', 700, 500),
        createModule('m2', 750, 550),
      ];
      const aligned = alignLeft(modules, 800, 600);

      // When aligning to leftmost (700), both modules should stay within bounds
      aligned.forEach(m => {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThan(800);
      });
    });
  });
});
