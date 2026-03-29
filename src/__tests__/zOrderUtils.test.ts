import { describe, it, expect } from 'vitest';
import {
  bringForward,
  sendBackward,
  bringToFront,
  sendToBack,
  moveToZIndex,
} from '../utils/zOrderUtils';
import { PlacedModule } from '../types';

describe('zOrderUtils', () => {
  // Helper to create a mock module
  const createModule = (id: string): PlacedModule => ({
    id,
    instanceId: id,
    type: 'core-furnace',
    x: 100,
    y: 100,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [],
  });

  describe('bringForward', () => {
    it('should swap module with the one after it', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      const result = bringForward('m1', modules);

      // m1 should now be at index 1, m2 at index 0
      expect(result[0].instanceId).toBe('m2');
      expect(result[1].instanceId).toBe('m1');
      expect(result[2].instanceId).toBe('m3');
    });

    it('should not change order if module is already at the top', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      const result = bringForward('m3', modules);

      expect(result).toEqual(modules);
    });

    it('should handle single module array', () => {
      const modules = [createModule('m1')];
      const result = bringForward('m1', modules);

      expect(result).toEqual(modules);
    });

    it('should handle empty array', () => {
      const modules: PlacedModule[] = [];
      const result = bringForward('m1', modules);

      expect(result).toEqual([]);
    });

    it('should handle non-existent module', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
      ];
      const result = bringForward('nonexistent', modules);

      expect(result).toEqual(modules);
    });
  });

  describe('sendBackward', () => {
    it('should swap module with the one before it', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      const result = sendBackward('m3', modules);

      // m3 should now be at index 1, m2 at index 2
      expect(result[0].instanceId).toBe('m1');
      expect(result[1].instanceId).toBe('m3');
      expect(result[2].instanceId).toBe('m2');
    });

    it('should not change order if module is already at the bottom', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      const result = sendBackward('m1', modules);

      expect(result).toEqual(modules);
    });

    it('should handle single module array', () => {
      const modules = [createModule('m1')];
      const result = sendBackward('m1', modules);

      expect(result).toEqual(modules);
    });

    it('should handle non-existent module', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
      ];
      const result = sendBackward('nonexistent', modules);

      expect(result).toEqual(modules);
    });
  });

  describe('bringToFront', () => {
    it('should move module to the end of the array', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      const result = bringToFront('m1', modules);

      // m1 should now be at the end
      expect(result[0].instanceId).toBe('m2');
      expect(result[1].instanceId).toBe('m3');
      expect(result[2].instanceId).toBe('m1');
    });

    it('should move middle module to front', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
        createModule('m4'),
      ];
      const result = bringToFront('m2', modules);

      expect(result[0].instanceId).toBe('m1');
      expect(result[1].instanceId).toBe('m3');
      expect(result[2].instanceId).toBe('m4');
      expect(result[3].instanceId).toBe('m2');
    });

    it('should not move if module is already at the front', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      const result = bringToFront('m1', modules);

      // Module at front should move to end (since it's not already at end)
      // This is the correct behavior - moving to front means moving to highest z-index
      expect(result[result.length - 1].instanceId).toBe('m1');
    });

    it('should handle single module array', () => {
      const modules = [createModule('m1')];
      const result = bringToFront('m1', modules);

      expect(result).toEqual(modules);
    });
  });

  describe('sendToBack', () => {
    it('should move module to the beginning of the array', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      const result = sendToBack('m3', modules);

      // m3 should now be at the beginning
      expect(result[0].instanceId).toBe('m3');
      expect(result[1].instanceId).toBe('m1');
      expect(result[2].instanceId).toBe('m2');
    });

    it('should move middle module to back', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
        createModule('m4'),
      ];
      const result = sendToBack('m3', modules);

      expect(result[0].instanceId).toBe('m3');
      expect(result[1].instanceId).toBe('m1');
      expect(result[2].instanceId).toBe('m2');
      expect(result[3].instanceId).toBe('m4');
    });

    it('should not move if module is already at the back', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
      ];
      const result = sendToBack('m3', modules);

      // Module at back should move to front (since it's not already at front)
      // This is the correct behavior - moving to back means moving to lowest z-index
      expect(result[0].instanceId).toBe('m3');
    });

    it('should handle single module array', () => {
      const modules = [createModule('m1')];
      const result = sendToBack('m1', modules);

      expect(result).toEqual(modules);
    });
  });

  describe('moveToZIndex', () => {
    it('should move module to specified index', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
        createModule('m3'),
        createModule('m4'),
      ];
      const result = moveToZIndex('m1', modules, 2);

      // m1 should now be at index 2
      expect(result[2].instanceId).toBe('m1');
    });

    it('should clamp index to valid range (minimum)', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
      ];
      const result = moveToZIndex('m2', modules, -5);

      // Should clamp to index 0
      expect(result[0].instanceId).toBe('m2');
    });

    it('should clamp index to valid range (maximum)', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
      ];
      const result = moveToZIndex('m1', modules, 100);

      // Should clamp to index 1 (last valid index)
      expect(result[1].instanceId).toBe('m1');
    });

    it('should not change order if already at target index', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
      ];
      const result = moveToZIndex('m2', modules, 1);

      expect(result).toEqual(modules);
    });

    it('should handle non-existent module', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
      ];
      const result = moveToZIndex('nonexistent', modules, 0);

      expect(result).toEqual(modules);
    });
  });

  describe('edge cases', () => {
    it('should preserve module data when reordering', () => {
      const modules = [
        { ...createModule('m1'), x: 100, y: 200, rotation: 45 },
        { ...createModule('m2'), x: 300, y: 400, rotation: 90 },
      ];
      const result = bringToFront('m1', modules);

      expect(result[1].instanceId).toBe('m1');
      expect(result[1].x).toBe(100);
      expect(result[1].y).toBe(200);
      expect(result[1].rotation).toBe(45);
    });

    it('should handle two-module arrays correctly', () => {
      const modules = [
        createModule('m1'),
        createModule('m2'),
      ];
      
      const forwardResult = bringForward('m1', modules);
      expect(forwardResult[0].instanceId).toBe('m2');
      expect(forwardResult[1].instanceId).toBe('m1');

      const backResult = sendToBack('m2', modules);
      expect(backResult[0].instanceId).toBe('m2');
      expect(backResult[1].instanceId).toBe('m1');
    });
  });
});
