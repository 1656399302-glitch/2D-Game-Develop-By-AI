import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useMachineStore } from '../store/useMachineStore';
import { ModuleType, PlacedModule } from '../types';

/**
 * Activation Pan/Zoom Performance Tests
 * 
 * Tests performance during activation with many modules:
 * - AC4.1: 20-module canvas activation produces zero console errors
 * - AC4.2: Execution time < 2000ms
 * - AC4.3: Canvas remains responsive during pan/zoom
 */

// Helper to create mock modules
const createModule = (
  type: ModuleType,
  x: number,
  y: number,
  instanceId: string
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
    { id: `${instanceId}-in`, type: 'input' as const, position: { x: 25, y: 50 } },
    { id: `${instanceId}-out`, type: 'output' as const, position: { x: 75, y: 50 } },
  ],
});

// Module types for realistic test
const MODULE_TYPES: ModuleType[] = [
  'core-furnace',
  'energy-pipe',
  'gear',
  'rune-node',
  'shield-shell',
  'trigger-switch',
  'output-array',
  'amplifier-crystal',
  'stabilizer-core',
  'void-siphon',
  'phase-modulator',
  'resonance-chamber',
  'fire-crystal',
  'lightning-conductor',
];

describe('Activation Pan/Zoom Performance Tests', () => {
  beforeEach(() => {
    // Reset store to initial state
    const store = useMachineStore.getState();
    store.clearCanvas();
    store.setMachineState('idle');
    store.setViewport({ x: 0, y: 0, zoom: 1 });
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC4.1: 20-module canvas activation produces zero console errors', () => {
    test('adding 20 modules does not produce console errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const store = useMachineStore.getState();
      
      // Add 20 modules
      for (let i = 0; i < 20; i++) {
        const x = 100 + (i % 5) * 150;
        const y = 100 + Math.floor(i / 5) * 150;
        const moduleType = MODULE_TYPES[i % MODULE_TYPES.length];
        
        act(() => {
          store.addModule(moduleType, x, y);
        });
      }
      
      const { modules } = useMachineStore.getState();
      expect(modules.length).toBe(20);
      
      // No console errors during module addition
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('activation with 20 modules does not produce console errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const store = useMachineStore.getState();
      
      // Add 20 modules
      for (let i = 0; i < 20; i++) {
        const x = 100 + (i % 5) * 150;
        const y = 100 + Math.floor(i / 5) * 150;
        const moduleType = MODULE_TYPES[i % MODULE_TYPES.length];
        
        act(() => {
          store.addModule(moduleType, x, y);
        });
      }
      
      // Start activation
      act(() => {
        store.setShowActivation(true);
        store.setMachineState('charging');
      });
      
      // Complete activation cycle
      act(() => {
        store.setMachineState('active');
      });
      
      act(() => {
        store.setMachineState('shutdown');
      });
      
      act(() => {
        store.setMachineState('idle');
        store.setShowActivation(false);
      });
      
      // No console errors during activation
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('zoom operations do not produce console errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const store = useMachineStore.getState();
      
      // Add some modules
      for (let i = 0; i < 5; i++) {
        act(() => {
          store.addModule('core-furnace', 100 + i * 150, 100);
        });
      }
      
      // Perform zoom operations
      act(() => {
        store.zoomIn();
      });
      act(() => {
        store.zoomIn();
      });
      act(() => {
        store.zoomOut();
      });
      act(() => {
        store.zoomToFit();
      });
      
      // No console errors during zoom
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('pan operations do not produce console errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const store = useMachineStore.getState();
      
      // Add some modules
      for (let i = 0; i < 5; i++) {
        act(() => {
          store.addModule('core-furnace', 100 + i * 150, 100);
        });
      }
      
      // Perform viewport operations
      act(() => {
        store.setViewport({ x: 100, y: 50 });
      });
      act(() => {
        store.setViewport({ x: -100, y: -50 });
      });
      act(() => {
        store.setViewport({ x: 0, y: 0 });
      });
      
      // No console errors during pan
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('combined pan/zoom during activation does not produce errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const store = useMachineStore.getState();
      
      // Add 20 modules
      for (let i = 0; i < 20; i++) {
        const x = 100 + (i % 5) * 150;
        const y = 100 + Math.floor(i / 5) * 150;
        const moduleType = MODULE_TYPES[i % MODULE_TYPES.length];
        
        act(() => {
          store.addModule(moduleType, x, y);
        });
      }
      
      // Start activation
      act(() => {
        store.setShowActivation(true);
        store.setMachineState('charging');
      });
      
      // Perform pan/zoom during activation
      act(() => {
        store.zoomIn();
        store.setViewport({ x: 50, y: 50 });
      });
      
      act(() => {
        store.zoomOut();
        store.setViewport({ x: -50, y: -50 });
      });
      
      act(() => {
        store.setMachineState('active');
      });
      
      act(() => {
        store.setViewport({ x: 0, y: 0 });
      });
      
      act(() => {
        store.setMachineState('shutdown');
      });
      
      act(() => {
        store.setMachineState('idle');
        store.setShowActivation(false);
      });
      
      // No console errors during combined operations
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('AC4.2: Execution time < 2000ms', () => {
    test('20 module addition completes quickly', () => {
      const startTime = performance.now();
      
      const store = useMachineStore.getState();
      
      // Add 20 modules
      for (let i = 0; i < 20; i++) {
        const x = 100 + (i % 5) * 150;
        const y = 100 + Math.floor(i / 5) * 150;
        const moduleType = MODULE_TYPES[i % MODULE_TYPES.length];
        
        act(() => {
          store.addModule(moduleType, x, y);
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000);
    });

    test('activation cycle completes quickly with 20 modules', () => {
      vi.useFakeTimers();
      
      const store = useMachineStore.getState();
      
      // Add 20 modules
      for (let i = 0; i < 20; i++) {
        const x = 100 + (i % 5) * 150;
        const y = 100 + Math.floor(i / 5) * 150;
        const moduleType = MODULE_TYPES[i % MODULE_TYPES.length];
        
        act(() => {
          store.addModule(moduleType, x, y);
        });
      }
      
      const startTime = performance.now();
      
      // Complete activation cycle
      act(() => {
        store.setShowActivation(true);
        store.setMachineState('charging');
      });
      
      act(() => {
        vi.advanceTimersByTime(800);
        store.setMachineState('active');
      });
      
      act(() => {
        vi.advanceTimersByTime(1200);
        store.setMachineState('shutdown');
      });
      
      act(() => {
        vi.advanceTimersByTime(500);
        store.setMachineState('idle');
        store.setShowActivation(false);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000);
      
      vi.useRealTimers();
    });

    test('zoom operations complete quickly', () => {
      const store = useMachineStore.getState();
      
      // Add 20 modules
      for (let i = 0; i < 20; i++) {
        const x = 100 + (i % 5) * 150;
        const y = 100 + Math.floor(i / 5) * 150;
        const moduleType = MODULE_TYPES[i % MODULE_TYPES.length];
        
        act(() => {
          store.addModule(moduleType, x, y);
        });
      }
      
      const startTime = performance.now();
      
      // Perform zoom operations
      for (let i = 0; i < 10; i++) {
        act(() => {
          store.zoomIn();
        });
      }
      
      for (let i = 0; i < 10; i++) {
        act(() => {
          store.zoomOut();
        });
      }
      
      act(() => {
        store.zoomToFit();
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('AC4.3: Canvas remains responsive during pan/zoom', () => {
    test('canvas can still add modules during activation', () => {
      const store = useMachineStore.getState();
      
      // Add initial modules
      for (let i = 0; i < 10; i++) {
        act(() => {
          store.addModule('core-furnace', 100 + i * 100, 100);
        });
      }
      
      // Start activation
      act(() => {
        store.setMachineState('charging');
      });
      
      // Still able to add modules
      act(() => {
        store.addModule('gear', 500, 300);
      });
      
      const { modules } = useMachineStore.getState();
      expect(modules.length).toBe(11);
    });

    test('canvas can still perform viewport operations during activation', () => {
      const store = useMachineStore.getState();
      
      // Add modules
      for (let i = 0; i < 5; i++) {
        act(() => {
          store.addModule('core-furnace', 100 + i * 100, 100);
        });
      }
      
      // Start activation
      act(() => {
        store.setMachineState('charging');
      });
      
      // Perform viewport operations
      act(() => {
        store.zoomIn();
        store.setViewport({ x: 50, y: 50 });
      });
      
      const { viewport, machineState } = useMachineStore.getState();
      expect(viewport.zoom).toBeGreaterThan(1);
      expect(machineState).toBe('charging');
    });

    test('zoom-to-fit works during activation with many modules', () => {
      const store = useMachineStore.getState();
      
      // Add 20 modules in various positions
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 1000;
        const y = Math.random() * 600;
        const moduleType = MODULE_TYPES[i % MODULE_TYPES.length];
        
        act(() => {
          store.addModule(moduleType, x, y);
        });
      }
      
      // Start activation
      act(() => {
        store.setMachineState('charging');
      });
      
      // Zoom to fit should work
      act(() => {
        store.zoomToFit();
      });
      
      const { viewport } = useMachineStore.getState();
      expect(viewport.zoom).toBeGreaterThan(0);
      expect(viewport.zoom).toBeLessThanOrEqual(2);
    });

    test('activation zoom state can be started and ended', () => {
      const store = useMachineStore.getState();
      
      // Add modules
      for (let i = 0; i < 5; i++) {
        act(() => {
          store.addModule('core-furnace', 100 + i * 100, 100);
        });
      }
      
      // Start activation zoom
      act(() => {
        store.startActivationZoom();
      });
      
      const { activationZoom } = useMachineStore.getState();
      expect(activationZoom.isZooming).toBe(true);
      expect(activationZoom.startViewport).not.toBeNull();
      
      // End activation zoom
      act(() => {
        store.endActivationZoom();
      });
      
      const { activationZoom: endedZoom } = useMachineStore.getState();
      expect(endedZoom.isZooming).toBe(false);
    });
  });

  describe('Performance with many modules', () => {
    test('adding 20 modules maintains module count integrity', () => {
      const store = useMachineStore.getState();
      
      const moduleIds: string[] = [];
      
      for (let i = 0; i < 20; i++) {
        const moduleType = MODULE_TYPES[i % MODULE_TYPES.length];
        
        act(() => {
          store.addModule(moduleType, 100 + i * 50, 100);
        });
        
        const { modules } = useMachineStore.getState();
        moduleIds.push(modules[modules.length - 1].instanceId);
      }
      
      const { modules } = useMachineStore.getState();
      expect(modules.length).toBe(20);
      
      // All modules have unique instanceIds
      const uniqueIds = new Set(modules.map(m => m.instanceId));
      expect(uniqueIds.size).toBe(20);
    });

    test('removing modules during activation works correctly', () => {
      const store = useMachineStore.getState();
      
      // Add 20 modules
      for (let i = 0; i < 20; i++) {
        act(() => {
          store.addModule('core-furnace', 100 + i * 50, 100);
        });
      }
      
      const { modules } = useMachineStore.getState();
      const moduleToRemove = modules[5].instanceId;
      
      // Start activation
      act(() => {
        store.setMachineState('charging');
      });
      
      // Remove a module
      act(() => {
        store.removeModule(moduleToRemove);
      });
      
      const { modules: updatedModules } = useMachineStore.getState();
      expect(updatedModules.length).toBe(19);
      expect(updatedModules.find(m => m.instanceId === moduleToRemove)).toBeUndefined();
    });

    test('repeated activation cycles maintain performance', () => {
      vi.useFakeTimers();
      
      const store = useMachineStore.getState();
      
      // Add 20 modules
      for (let i = 0; i < 20; i++) {
        act(() => {
          store.addModule('core-furnace', 100 + (i % 5) * 100, 100 + Math.floor(i / 5) * 100);
        });
      }
      
      const startTime = performance.now();
      
      // Complete 3 activation cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        act(() => {
          store.setMachineState('charging');
        });
        
        act(() => {
          vi.advanceTimersByTime(800);
          store.setMachineState('active');
        });
        
        act(() => {
          vi.advanceTimersByTime(1200);
          store.setMachineState('shutdown');
        });
        
        act(() => {
          vi.advanceTimersByTime(500);
          store.setMachineState('idle');
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 3 cycles should complete within reasonable time
      expect(duration).toBeLessThan(2000);
      
      // Module count should remain stable
      expect(useMachineStore.getState().modules.length).toBe(20);
      
      vi.useRealTimers();
    });
  });
});
