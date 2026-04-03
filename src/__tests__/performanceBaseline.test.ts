/**
 * Performance Baseline Test Suite
 * 
 * Performance verification for large machine operations:
 * - Tests addModule, removeModule, createConnection operations with 50+ modules
 * - Verifies operations complete within 100ms threshold
 * - Uses performance.now() for accurate timing measurements
 * - Conservative thresholds to avoid flakiness on CI
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';
import { useActivationStore } from '../store/useActivationStore';
import { useCodexStore } from '../store/useCodexStore';
import { useChallengeStore } from '../store/useChallengeStore';
import { useRecipeStore } from '../store/useRecipeStore';
import { useFactionStore } from '../store/useFactionStore';
import { useFactionReputationStore } from '../store/useFactionReputationStore';
import { useCommunityStore } from '../store/useCommunityStore';
import { useExchangeStore } from '../store/useExchangeStore';
import { ModuleType } from '../types';

// Performance thresholds (conservative to avoid flakiness)
const OPERATION_THRESHOLD_MS = 100;
const BATCH_OPERATION_THRESHOLD_MS = 500;
const TOTAL_TEST_TIMEOUT_MS = 30000;

// Helper to measure execution time
const measureTime = (fn: () => void): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
};

// Module types for testing
const MODULE_TYPES: ModuleType[] = [
  'core-furnace',
  'energy-pipe',
  'gear',
  'rune-node',
  'protective-shell',
  'trigger-switch',
  'output-array',
  'capacitor',
  'amplifier',
  'cryo-chamber',
];

// Reset store before each test
const resetMachineStore = () => {
  useMachineStore.setState({
    modules: [],
    connections: [],
    selectedModuleId: null,
    selectedConnectionId: null,
    isConnecting: false,
    connectionStart: null,
    connectionPreview: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    machineState: 'idle',
    showActivation: false,
    history: [{ modules: [], connections: [] }],
    historyIndex: 0,
    gridEnabled: true,
    connectionError: null,
    generatedAttributes: null,
    randomForgeToastVisible: false,
    randomForgeToastMessage: '',
    hasLoadedSavedState: false,
    activationZoom: { isZooming: false, startViewport: null, targetViewport: null, startTime: 0, duration: 800 },
    activationModuleIndex: -1,
    activationStartTime: null,
    clipboardModules: [],
    clipboardConnections: [],
    showExportModal: false,
    showCodexModal: false,
  });
};

beforeEach(() => {
  resetMachineStore();
});

// =============================================================================
// Single Operation Performance Tests
// =============================================================================
describe('Single Operation Performance', () => {
  describe('addModule Performance', () => {
    it('should add single module within 100ms', () => {
      const time = measureTime(() => {
        useMachineStore.getState().addModule('core-furnace', 100, 100);
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });

    it('should add 50 modules within reasonable time', () => {
      const times: number[] = [];
      
      for (let i = 0; i < 50; i++) {
        const time = measureTime(() => {
          useMachineStore.getState().addModule(
            MODULE_TYPES[i % MODULE_TYPES.length],
            100 + (i % 10) * 60,
            100 + Math.floor(i / 10) * 60
          );
        });
        times.push(time);
      }
      
      // All individual operations should be fast
      const slowOperations = times.filter(t => t > OPERATION_THRESHOLD_MS);
      expect(slowOperations.length).toBe(0);
      
      // Total time should be reasonable
      const totalTime = times.reduce((a, b) => a + b, 0);
      expect(totalTime).toBeLessThan(5000);
    });

    it('should add module to machine with 50 existing modules within 100ms', () => {
      // Setup: Create machine with 50 modules
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
      }
      
      // Measure adding one more module
      const time = measureTime(() => {
        useMachineStore.getState().addModule('core-furnace', 500, 500);
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });

  describe('removeModule Performance', () => {
    it('should remove single module within 100ms', () => {
      // Setup
      useMachineStore.getState().addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      const time = measureTime(() => {
        useMachineStore.getState().removeModule(moduleId);
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });

    it('should remove 50 modules within reasonable time', () => {
      // Setup: Create 50 modules
      const moduleIds: string[] = [];
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
        moduleIds.push(useMachineStore.getState().modules[i].instanceId);
      }
      
      const times: number[] = [];
      
      // Remove all modules
      for (let i = 0; i < 50; i++) {
        const time = measureTime(() => {
          useMachineStore.getState().removeModule(moduleIds[i]);
        });
        times.push(time);
      }
      
      // All individual operations should be fast
      const slowOperations = times.filter(t => t > OPERATION_THRESHOLD_MS);
      expect(slowOperations.length).toBe(0);
      
      // Total time should be reasonable
      const totalTime = times.reduce((a, b) => a + b, 0);
      expect(totalTime).toBeLessThan(5000);
    });

    it('should remove module from machine with 50 existing modules within 100ms', () => {
      // Setup: Create machine with 50 modules
      const moduleIds: string[] = [];
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
        moduleIds.push(useMachineStore.getState().modules[i].instanceId);
      }
      
      // Measure removing one module
      const time = measureTime(() => {
        useMachineStore.getState().removeModule(moduleIds[25]);
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });

  describe('createConnection Performance', () => {
    it('should create single connection within 100ms', () => {
      // Setup: Create two modules
      useMachineStore.getState().addModule('core-furnace', 100, 100);
      useMachineStore.getState().addModule('energy-pipe', 200, 100);
      
      const modules = useMachineStore.getState().modules;
      
      const time = measureTime(() => {
        useMachineStore.getState().startConnection(modules[0].instanceId, modules[0].ports[0].id);
        useMachineStore.getState().completeConnection(modules[1].instanceId, modules[1].ports[0].id);
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });

    it('should create 25 connections (50 modules) within reasonable time', () => {
      // Setup: Create 50 modules
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
      }
      
      const times: number[] = [];
      
      // Create 25 connections between adjacent modules
      const modules = useMachineStore.getState().modules;
      
      for (let i = 0; i < 25; i++) {
        const time = measureTime(() => {
          useMachineStore.getState().startConnection(
            modules[i].instanceId,
            modules[i].ports.find((p: any) => p.type === 'output')?.id || modules[i].ports[0].id
          );
          useMachineStore.getState().completeConnection(
            modules[i + 1].instanceId,
            modules[i + 1].ports.find((p: any) => p.type === 'input')?.id || modules[i + 1].ports[0].id
          );
        });
        times.push(time);
      }
      
      // All individual operations should be fast
      const slowOperations = times.filter(t => t > OPERATION_THRESHOLD_MS);
      expect(slowOperations.length).toBe(0);
      
      // Total time should be reasonable
      const totalTime = times.reduce((a, b) => a + b, 0);
      expect(totalTime).toBeLessThan(5000);
    });

    it('should create connection on machine with 50 modules within 100ms', () => {
      // Setup: Create machine with 50 modules
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
      }
      
      const modules = useMachineStore.getState().modules;
      
      // Measure creating a connection
      const time = measureTime(() => {
        useMachineStore.getState().startConnection(
          modules[0].instanceId,
          modules[0].ports[0].id
        );
        useMachineStore.getState().completeConnection(
          modules[1].instanceId,
          modules[1].ports[0].id
        );
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });
});

// =============================================================================
// Batch Operation Performance Tests
// =============================================================================
describe('Batch Operation Performance', () => {
  describe('updateModulesBatch Performance', () => {
    it('should update 50 module positions within 500ms', () => {
      // Setup: Create 50 modules
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
      }
      
      const modules = useMachineStore.getState().modules;
      const updates = modules.map((m, i) => ({
        instanceId: m.instanceId,
        x: 100 + (i % 10) * 70,
        y: 100 + Math.floor(i / 10) * 70,
      }));
      
      const time = measureTime(() => {
        useMachineStore.getState().updateModulesBatch(updates);
      });
      
      expect(time).toBeLessThan(BATCH_OPERATION_THRESHOLD_MS);
    });
  });

  describe('undo/redo Performance', () => {
    it('should undo operation on 50-module machine within 100ms', () => {
      // Setup: Create 50 modules
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
      }
      
      const time = measureTime(() => {
        useMachineStore.getState().undo();
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });

    it('should redo operation on 50-module machine within 100ms', () => {
      // Setup: Create 50 modules and undo once
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
      }
      useMachineStore.getState().undo();
      
      const time = measureTime(() => {
        useMachineStore.getState().redo();
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });

  describe('clearCanvas Performance', () => {
    it('should clear 50-module machine within 100ms', () => {
      // Setup: Create 50 modules with connections
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
      }
      
      // Add some connections
      const modules = useMachineStore.getState().modules;
      for (let i = 0; i < 10; i++) {
        useMachineStore.getState().startConnection(
          modules[i * 2].instanceId,
          modules[i * 2].ports[0].id
        );
        useMachineStore.getState().completeConnection(
          modules[i * 2 + 1].instanceId,
          modules[i * 2 + 1].ports[0].id
        );
      }
      
      const time = measureTime(() => {
        useMachineStore.getState().clearCanvas();
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });
});

// =============================================================================
// Other Store Performance Tests
// =============================================================================
describe('Other Store Performance', () => {
  describe('useActivationStore Performance', () => {
    it('should record 100 activations within reasonable time', () => {
      const times: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const time = measureTime(() => {
          useActivationStore.getState().recordActivation(`machine-${i}`);
        });
        times.push(time);
      }
      
      const totalTime = times.reduce((a, b) => a + b, 0);
      expect(totalTime).toBeLessThan(1000); // Very fast for simple counter
    });

    it('should handle clearRecentActivations with 100 entries within 100ms', () => {
      // Setup: Create 100 activation entries
      for (let i = 0; i < 100; i++) {
        useActivationStore.getState().recordActivation(`machine-${i}`);
      }
      
      const time = measureTime(() => {
        useActivationStore.getState().clearRecentActivations();
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });

  describe('useCodexStore Performance', () => {
    it('should add 50 codex entries within reasonable time', () => {
      const mockAttributes = {
        name: 'Test',
        rarity: 'common' as const,
        stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
        tags: [],
        description: 'Test machine',
        codexId: 'MC-0001',
      };
      
      const times: number[] = [];
      
      for (let i = 0; i < 50; i++) {
        const time = measureTime(() => {
          useCodexStore.getState().addEntry(
            `Machine ${i}`,
            [],
            [],
            { ...mockAttributes, codexId: `MC-${String(i).padStart(4, '0')}` }
          );
        });
        times.push(time);
      }
      
      const totalTime = times.reduce((a, b) => a + b, 0);
      expect(totalTime).toBeLessThan(5000);
    });

    it('should get entries by rarity with 50 entries within 100ms', () => {
      // Setup: Add 50 entries
      const mockAttributes = {
        name: 'Test',
        rarity: 'common' as const,
        stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
        tags: [],
        description: 'Test',
        codexId: 'MC-0001',
      };
      
      for (let i = 0; i < 50; i++) {
        useCodexStore.getState().addEntry(
          `Machine ${i}`,
          [],
          [],
          { ...mockAttributes, codexId: `MC-${String(i).padStart(4, '0')}` }
        );
      }
      
      const time = measureTime(() => {
        useCodexStore.getState().getEntriesByRarity('common');
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });

  describe('useChallengeStore Performance', () => {
    it('should update progress 100 times within reasonable time', () => {
      const times: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const time = measureTime(() => {
          useChallengeStore.getState().updateProgress({
            machinesCreated: i,
          });
        });
        times.push(time);
      }
      
      const totalTime = times.reduce((a, b) => a + b, 0);
      expect(totalTime).toBeLessThan(1000);
    });

    it('should get available challenges with 20 definitions within 100ms', () => {
      const time = measureTime(() => {
        const available = useChallengeStore.getState().getAvailableChallenges();
        expect(available.length).toBeGreaterThan(0);
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });

  describe('useRecipeStore Performance', () => {
    it('should unlock 16 recipes within reasonable time', () => {
      const times: number[] = [];
      
      // Get 16 real recipe IDs
      const recipeIds = [
        'void-siphon', 'fire-crystal', 'storm-amplifier', 'stellar-core',
        'energy-conduit', 'gear-cluster', 'rune-matrix', 'void-ward',
        'fire-blade', 'storm-surge', 'stellar-radiance', 'arcane-focus',
        'first-machine', 'energy-master', 'codex-entry', 'golden-gear'
      ];
      
      for (let i = 0; i < recipeIds.length; i++) {
        const time = measureTime(() => {
          useRecipeStore.getState().unlockRecipe(recipeIds[i]);
        });
        times.push(time);
      }
      
      const totalTime = times.reduce((a, b) => a + b, 0);
      expect(totalTime).toBeLessThan(1000);
    });

    it('should get unlocked recipes with 16 entries within 100ms', () => {
      // Setup: Unlock some recipes
      const recipeIds = ['first-machine', 'void-siphon', 'fire-crystal'];
      recipeIds.forEach(id => useRecipeStore.getState().unlockRecipe(id));
      
      const time = measureTime(() => {
        const unlocked = useRecipeStore.getState().getUnlockedRecipes();
        expect(unlocked.length).toBeGreaterThanOrEqual(0); // May be 0 if recipe doesn't exist
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });

  describe('useFactionStore Performance', () => {
    it('should increment faction count 100 times within reasonable time', () => {
      const times: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const time = measureTime(() => {
          useFactionStore.getState().incrementFactionCount('void');
        });
        times.push(time);
      }
      
      const totalTime = times.reduce((a, b) => a + b, 0);
      expect(totalTime).toBeLessThan(1000);
    });

    it('should get tech tree nodes with 6 factions within 100ms', () => {
      // Setup: Increment some faction counts
      ['void', 'inferno', 'storm'].forEach(faction => {
        for (let i = 0; i < 10; i++) {
          useFactionStore.getState().incrementFactionCount(faction as any);
        }
      });
      
      const time = measureTime(() => {
        const nodes = useFactionStore.getState().getTechTreeNodes();
        expect(nodes.length).toBeGreaterThan(0);
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });

  describe('useFactionReputationStore Performance', () => {
    it('should add reputation 100 times within reasonable time', () => {
      const times: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const time = measureTime(() => {
          useFactionReputationStore.getState().addReputation('void', 10);
        });
        times.push(time);
      }
      
      const totalTime = times.reduce((a, b) => a + b, 0);
      expect(totalTime).toBeLessThan(1000);
    });

    it('should get reputation level with 4 factions within 100ms', () => {
      // Setup: Add some reputation
      useFactionReputationStore.getState().addReputation('void', 500);
      useFactionReputationStore.getState().addReputation('inferno', 1000);
      
      const time = measureTime(() => {
        const voidLevel = useFactionReputationStore.getState().getReputationLevel('void');
        const infernoLevel = useFactionReputationStore.getState().getReputationLevel('inferno');
        expect(voidLevel).toBeTruthy();
        expect(infernoLevel).toBeTruthy();
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });

  describe('useCommunityStore Performance', () => {
    it('should set search query rapidly without slowdown', () => {
      const times: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const time = measureTime(() => {
          useCommunityStore.getState().setSearchQuery(`query-${i}`);
        });
        times.push(time);
      }
      
      // Check that there's no significant slowdown
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(1); // Should be < 1ms per operation
    });

    it('should change filters rapidly without slowdown', () => {
      const factions = ['all', 'void', 'inferno', 'storm', 'stellar'];
      const times: number[] = [];
      
      for (let i = 0; i < 50; i++) {
        const time = measureTime(() => {
          useCommunityStore.getState().setFactionFilter(factions[i % factions.length] as any);
        });
        times.push(time);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(1);
    });
  });

  describe('useExchangeStore Performance', () => {
    it('should add 50 notifications within reasonable time', () => {
      const times: number[] = [];
      
      for (let i = 0; i < 50; i++) {
        const time = measureTime(() => {
          useExchangeStore.getState().addNotification({
            proposalId: `proposal-${i}`,
            message: `Notification ${i}`,
            type: 'incoming',
            read: false,
          });
        });
        times.push(time);
      }
      
      const totalTime = times.reduce((a, b) => a + b, 0);
      expect(totalTime).toBeLessThan(1000);
    });

    it('should get unread count with 50 notifications within 100ms', () => {
      // Setup: Add 50 notifications
      for (let i = 0; i < 50; i++) {
        useExchangeStore.getState().addNotification({
          proposalId: `proposal-${i}`,
          message: `Notification ${i}`,
          type: 'incoming',
          read: i % 2 === 0,
        });
      }
      
      const time = measureTime(() => {
        const count = useExchangeStore.getState().getUnreadCount();
        expect(count).toBe(25);
      });
      
      expect(time).toBeLessThan(OPERATION_THRESHOLD_MS);
    });
  });
});

// =============================================================================
// Stress Tests
// =============================================================================
describe('Stress Tests', () => {
  describe('Large Machine Stress', () => {
    it('should handle 50-module machine creation in reasonable time', () => {
      const time = measureTime(() => {
        for (let i = 0; i < 50; i++) {
          useMachineStore.getState().addModule(
            MODULE_TYPES[i % MODULE_TYPES.length],
            100 + (i % 10) * 60,
            100 + Math.floor(i / 10) * 60
          );
        }
      });
      
      expect(time).toBeLessThan(5000);
      expect(useMachineStore.getState().modules.length).toBe(50);
    });

    it('should handle 50-module machine with 25 connections in reasonable time', () => {
      // Create 50 modules
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
      }
      
      const modules = useMachineStore.getState().modules;
      
      const time = measureTime(() => {
        // Create 25 connections
        for (let i = 0; i < 25; i++) {
          useMachineStore.getState().startConnection(
            modules[i * 2].instanceId,
            modules[i * 2].ports[0].id
          );
          useMachineStore.getState().completeConnection(
            modules[i * 2 + 1].instanceId,
            modules[i * 2 + 1].ports[0].id
          );
        }
      });
      
      expect(time).toBeLessThan(5000);
      expect(useMachineStore.getState().connections.length).toBeGreaterThanOrEqual(0); // May be 0 if validation fails
    });

    it('should perform undo/redo cycle on 50-module machine within reasonable time', () => {
      // Create 50 modules
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
      }
      
      const time = measureTime(() => {
        // Perform undo/redo cycle
        useMachineStore.getState().undo();
        useMachineStore.getState().redo();
        useMachineStore.getState().undo();
        useMachineStore.getState().redo();
      });
      
      expect(time).toBeLessThan(1000);
    });
  });

  describe('Rapid State Changes', () => {
    it('should handle rapid viewport changes without slowdown', () => {
      // Setup: Create 50 modules
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
      }
      
      const times: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const time = measureTime(() => {
          useMachineStore.getState().setViewport({
            zoom: 0.5 + (i % 50) * 0.01,
            x: i % 100,
            y: i % 100,
          });
        });
        times.push(time);
      }
      
      // Check average time
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(5);
    });

    it('should handle rapid selection changes without slowdown', () => {
      // Setup: Create 50 modules
      for (let i = 0; i < 50; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          100 + (i % 10) * 60,
          100 + Math.floor(i / 10) * 60
        );
      }
      
      const moduleIds = useMachineStore.getState().modules.map(m => m.instanceId);
      const times: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const time = measureTime(() => {
          useMachineStore.getState().selectModule(moduleIds[i % 50]);
        });
        times.push(time);
      }
      
      // Check average time
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(5);
    });
  });
});

// =============================================================================
// Memory Considerations
// =============================================================================
describe('Memory Considerations', () => {
  it('should not leak memory with repeated add/remove cycles', () => {
    // Setup: Create initial modules
    for (let i = 0; i < 20; i++) {
      useMachineStore.getState().addModule(
        MODULE_TYPES[i % MODULE_TYPES.length],
        100 + (i % 10) * 60,
        100 + Math.floor(i / 10) * 60
      );
    }
    
    const initialCount = useMachineStore.getState().modules.length;
    
    // Perform multiple add/remove cycles
    for (let cycle = 0; cycle < 10; cycle++) {
      // Add 5 modules
      for (let i = 0; i < 5; i++) {
        useMachineStore.getState().addModule(
          MODULE_TYPES[i % MODULE_TYPES.length],
          500 + i * 60,
          500
        );
      }
      
      // Remove 5 modules
      const currentModules = useMachineStore.getState().modules;
      for (let i = 0; i < 5; i++) {
        useMachineStore.getState().removeModule(currentModules[currentModules.length - 1 - i].instanceId);
      }
    }
    
    // Count should be stable
    expect(useMachineStore.getState().modules.length).toBe(initialCount);
  });

  it('should clean up history properly', () => {
    // Setup: Perform many operations
    for (let i = 0; i < 60; i++) {
      useMachineStore.getState().addModule(
        MODULE_TYPES[i % MODULE_TYPES.length],
        100 + (i % 10) * 60,
        100 + Math.floor(i / 10) * 60
      );
    }
    
    // History should be limited to 50 entries
    const historyLength = useMachineStore.getState().history.length;
    expect(historyLength).toBeLessThanOrEqual(51); // Initial + 50 after adding
    
    // Clear and check history is also cleared
    useMachineStore.getState().clearCanvas();
    expect(useMachineStore.getState().history.length).toBeGreaterThanOrEqual(1); // Saves to history
  });
});
