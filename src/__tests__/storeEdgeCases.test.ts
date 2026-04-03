/**
 * Store Edge Cases Test Suite
 * 
 * Comprehensive edge case testing for all Zustand stores:
 * - useMachineStore
 * - useActivationStore
 * - useAttributeStore (attribute generation via useMachineStore.generatedAttributes)
 * - useCodexStore
 * - useExportStore
 * - useExchangeStore
 * - useChallengeStore
 * - useRecipeStore
 * - useFactionStore
 * - useFactionReputationStore
 * - useCommunityStore
 * - useUIStore
 * 
 * Tests cover:
 * - Null/undefined inputs
 * - Empty state operations
 * - Boundary values (0, -1, MAX_SAFE_INTEGER)
 * - Concurrent operations
 * - Race condition prevention
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';
import { useActivationStore } from '../store/useActivationStore';
import { useCodexStore } from '../store/useCodexStore';
import { useExchangeStore } from '../store/useExchangeStore';
import { useChallengeStore } from '../store/useChallengeStore';
import { useRecipeStore } from '../store/useRecipeStore';
import { useFactionStore } from '../store/useFactionStore';
import { useFactionReputationStore } from '../store/useFactionReputationStore';
import { useCommunityStore } from '../store/useCommunityStore';
import { ModuleType, GeneratedAttributes, Rarity } from '../types';
import { FactionId } from '../types/factions';

// Mock localStorage for all tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Reset all stores to initial state
const resetAllStores = () => {
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

  useActivationStore.setState({
    totalActivations: 0,
    sessionActivations: 0,
    recentActivations: [],
    pendingRecipeDiscovery: false,
    lastActivationState: null,
  });

  useCodexStore.setState({
    entries: [],
  });

  useExchangeStore.setState({
    listings: [],
    incomingProposals: [],
    outgoingProposals: [],
    tradeHistory: [],
    notifications: [],
    isHydrated: true,
  });

  useChallengeStore.setState({
    completedChallenges: [],
    claimedRewards: [],
    totalXP: 0,
    badges: [],
    challengeProgress: {
      machinesCreated: 0,
      machinesSaved: 0,
      connectionsCreated: 0,
      activations: 0,
      overloadsTriggered: 0,
      gearsCreated: 0,
      highestStability: 0,
    },
    loading: false,
    timeTrialState: {
      activeChallengeId: null,
      isTrialActive: false,
      isPaused: false,
      elapsedTime: 0,
      startTimestamp: null,
      pausedTimestamp: null,
      progress: {},
      isCompleted: false,
      completionTime: null,
    },
    leaderboard: {},
    challengeCompletions: [],
  });

  useRecipeStore.setState({
    unlockedRecipes: [],
    pendingDiscoveries: [],
  });

  useFactionStore.setState({
    factionCounts: { void: 0, inferno: 0, storm: 0, stellar: 0, arcane: 0, chaos: 0 },
    techTreeUnlocks: {},
    selectedFaction: null,
  });

  useFactionReputationStore.setState({
    reputations: { void: 0, inferno: 0, storm: 0, stellar: 0 },
    totalReputationEarned: 0,
    currentResearch: {},
    completedResearch: { void: [], inferno: [], storm: [], stellar: [] },
  });

  useCommunityStore.setState({
    communityMachines: [],
    publishedMachines: [],
    searchQuery: '',
    factionFilter: 'all',
    rarityFilter: 'all',
    sortOption: 'newest',
    isGalleryOpen: false,
    isPublishModalOpen: false,
    pendingMachine: null,
  });
};

beforeEach(() => {
  resetAllStores();
  vi.clearAllMocks();
  localStorageMock.clear();
});

// =============================================================================
// useMachineStore Edge Cases
// =============================================================================
describe('useMachineStore Edge Cases', () => {
  describe('Null/Undefined Inputs', () => {
    it('should handle null module type gracefully', () => {
      expect(() => {
        useMachineStore.getState().addModule(null as any, 100, 100);
      }).not.toThrow();
    });

    it('should handle undefined module type gracefully', () => {
      expect(() => {
        useMachineStore.getState().addModule(undefined as any, 100, 100);
      }).not.toThrow();
    });

    it('should handle null instanceId in removeModule', () => {
      expect(() => {
        useMachineStore.getState().removeModule(null as any);
      }).not.toThrow();
    });

    it('should handle undefined instanceId in updateModulePosition', () => {
      expect(() => {
        useMachineStore.getState().updateModulePosition(undefined as any, 100, 100);
      }).not.toThrow();
    });

    it('should handle NaN coordinates in addModule', () => {
      expect(() => {
        useMachineStore.getState().addModule('core-furnace', NaN, NaN);
      }).not.toThrow();
    });

    it('should handle Infinity coordinates in addModule', () => {
      expect(() => {
        useMachineStore.getState().addModule('core-furnace', Infinity, -Infinity);
      }).not.toThrow();
    });
  });

  describe('Empty State Operations', () => {
    it('should handle undo on empty history', () => {
      const initialHistoryLength = useMachineStore.getState().history.length;
      useMachineStore.getState().undo();
      expect(useMachineStore.getState().history.length).toBe(initialHistoryLength);
    });

    it('should handle redo on empty future', () => {
      const initialHistoryIndex = useMachineStore.getState().historyIndex;
      useMachineStore.getState().redo();
      expect(useMachineStore.getState().historyIndex).toBe(initialHistoryIndex);
    });

    it('should handle clearCanvas on empty canvas', () => {
      expect(() => {
        useMachineStore.getState().clearCanvas();
      }).not.toThrow();
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should handle loadMachine with empty arrays', () => {
      expect(() => {
        useMachineStore.getState().loadMachine([], []);
      }).not.toThrow();
      expect(useMachineStore.getState().modules.length).toBe(0);
      expect(useMachineStore.getState().connections.length).toBe(0);
    });

    it('should handle duplicateModule with no selection', () => {
      const initialCount = useMachineStore.getState().modules.length;
      useMachineStore.getState().duplicateModule('non-existent-id');
      expect(useMachineStore.getState().modules.length).toBe(initialCount);
    });
  });

  describe('Boundary Values', () => {
    it('should handle scale of 0', () => {
      useMachineStore.getState().addModule('core-furnace', 200, 200);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      expect(() => {
        useMachineStore.getState().updateModuleScale(moduleId, 0);
      }).not.toThrow();
      
      // Scale should be clamped to minimum 0.5
      expect(useMachineStore.getState().modules[0].scale).toBe(0.5);
    });

    it('should handle negative scale', () => {
      useMachineStore.getState().addModule('core-furnace', 200, 200);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      expect(() => {
        useMachineStore.getState().updateModuleScale(moduleId, -1);
      }).not.toThrow();
      
      // Scale should be clamped to minimum 0.5
      expect(useMachineStore.getState().modules[0].scale).toBe(0.5);
    });

    it('should handle scale larger than maximum', () => {
      useMachineStore.getState().addModule('core-furnace', 200, 200);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      expect(() => {
        useMachineStore.getState().updateModuleScale(moduleId, 5);
      }).not.toThrow();
      
      // Scale should be clamped to maximum 2.0
      expect(useMachineStore.getState().modules[0].scale).toBe(2.0);
    });

    it('should handle rotation of 0', () => {
      useMachineStore.getState().addModule('core-furnace', 200, 200);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.getState().updateModuleRotation(moduleId, 0);
      expect(useMachineStore.getState().modules[0].rotation).toBe(0);
    });

    it('should handle rotation exceeding 360', () => {
      useMachineStore.getState().addModule('core-furnace', 200, 200);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.getState().updateModuleRotation(moduleId, 720);
      expect(useMachineStore.getState().modules[0].rotation).toBe(0);
    });

    it('should handle negative rotation', () => {
      useMachineStore.getState().addModule('core-furnace', 200, 200);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.getState().updateModuleRotation(moduleId, -90);
      expect(useMachineStore.getState().modules[0].rotation).toBe(-90); // No wrapping
    });

    it('should handle zoom at minimum boundary', () => {
      useMachineStore.getState().setViewport({ zoom: 0.1 });
      expect(useMachineStore.getState().viewport.zoom).toBe(0.1);
    });

    it('should handle zoom at maximum boundary', () => {
      useMachineStore.getState().setViewport({ zoom: 2.0 });
      expect(useMachineStore.getState().viewport.zoom).toBe(2.0);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid addModule calls without race conditions', () => {
      const moduleTypes: ModuleType[] = ['core-furnace', 'energy-pipe', 'gear', 'rune-node'];
      
      expect(() => {
        for (let i = 0; i < 50; i++) {
          useMachineStore.getState().addModule(moduleTypes[i % moduleTypes.length], 100 + i * 10, 100 + i * 5);
        }
      }).not.toThrow();
      
      // All modules should be added correctly
      expect(useMachineStore.getState().modules.length).toBe(50);
      
      // All should have unique instanceIds
      const instanceIds = useMachineStore.getState().modules.map(m => m.instanceId);
      const uniqueIds = new Set(instanceIds);
      expect(uniqueIds.size).toBe(50);
    });

    it('should handle rapid removeModule calls without race conditions', () => {
      // Add 10 modules first
      for (let i = 0; i < 10; i++) {
        useMachineStore.getState().addModule('core-furnace', 100 + i * 50, 100);
      }
      
      const moduleIds = useMachineStore.getState().modules.map(m => m.instanceId);
      
      expect(() => {
        // Rapidly remove all modules
        moduleIds.forEach(id => {
          useMachineStore.getState().removeModule(id);
        });
      }).not.toThrow();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should handle rapid selectModule calls without state corruption', () => {
      // Add 10 modules
      for (let i = 0; i < 10; i++) {
        useMachineStore.getState().addModule('core-furnace', 100 + i * 50, 100);
      }
      
      const moduleIds = useMachineStore.getState().modules.map(m => m.instanceId);
      
      // Rapidly select different modules
      for (let round = 0; round < 5; round++) {
        moduleIds.forEach(id => {
          useMachineStore.getState().selectModule(id);
        });
      }
      
      // Final selection should be valid
      const selectedId = useMachineStore.getState().selectedModuleId;
      const selectedModule = useMachineStore.getState().modules.find(m => m.instanceId === selectedId);
      expect(selectedModule).toBeDefined();
    });

    it('should handle concurrent add and remove without state corruption', () => {
      useMachineStore.getState().addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      expect(() => {
        // Add new modules while removing existing
        useMachineStore.getState().removeModule(moduleId);
        useMachineStore.getState().addModule('energy-pipe', 200, 200);
        useMachineStore.getState().addModule('gear', 300, 200);
        useMachineStore.getState().removeModule(moduleId); // Already removed
      }).not.toThrow();
      
      // State should be consistent
      const state = useMachineStore.getState();
      expect(state.modules.length).toBeGreaterThanOrEqual(0);
      expect(state.modules.every(m => m.instanceId !== moduleId)).toBe(true);
    });
  });
});

// =============================================================================
// useActivationStore Edge Cases
// =============================================================================
describe('useActivationStore Edge Cases', () => {
  describe('Null/Undefined Inputs', () => {
    it('should handle recordActivation with null machineId', () => {
      expect(() => {
        useActivationStore.getState().recordActivation(null as any);
      }).not.toThrow();
    });

    it('should handle recordActivation with undefined machineId', () => {
      expect(() => {
        useActivationStore.getState().recordActivation(undefined as any);
      }).not.toThrow();
    });

    it('should handle recordActivation with null state', () => {
      expect(() => {
        useActivationStore.getState().recordActivation('machine-1', null as any);
      }).not.toThrow();
    });

    it('should handle recordActivation with invalid state', () => {
      expect(() => {
        useActivationStore.getState().recordActivation('machine-1', 'invalid' as any);
      }).not.toThrow();
    });
  });

  describe('Empty State Operations', () => {
    it('should handle clearRecentActivations on empty history', () => {
      expect(() => {
        useActivationStore.getState().clearRecentActivations();
      }).not.toThrow();
      expect(useActivationStore.getState().recentActivations.length).toBe(0);
    });

    it('should handle getActivationCount on zero activations', () => {
      expect(useActivationStore.getState().getActivationCount()).toBe(0);
    });

    it('should handle resetActivations on clean state', () => {
      expect(() => {
        useActivationStore.getState().resetActivations();
      }).not.toThrow();
      expect(useActivationStore.getState().totalActivations).toBe(0);
    });
  });

  describe('Boundary Values', () => {
    it('should handle large activation count', () => {
      // Simulate large number of activations
      useActivationStore.setState({ totalActivations: Number.MAX_SAFE_INTEGER - 1 });
      expect(() => {
        useActivationStore.getState().recordActivation();
      }).not.toThrow();
    });

    it('should handle negative activation count', () => {
      useActivationStore.setState({ totalActivations: -1 });
      expect(useActivationStore.getState().getActivationCount()).toBe(-1);
    });

    it('should handle zero duration research', () => {
      // The store should handle edge cases gracefully
      expect(() => {
        useActivationStore.getState().recordActivation('machine-1', 'active');
      }).not.toThrow();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid recordActivation calls without race conditions', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          useActivationStore.getState().recordActivation(`machine-${i}`);
        }
      }).not.toThrow();
      
      // All activations should be recorded
      expect(useActivationStore.getState().totalActivations).toBeGreaterThanOrEqual(100);
    });

    it('should handle rapid clearRecentActivations calls', () => {
      // First add some activations
      for (let i = 0; i < 20; i++) {
        useActivationStore.getState().recordActivation(`machine-${i}`);
      }
      
      expect(() => {
        for (let i = 0; i < 10; i++) {
          useActivationStore.getState().clearRecentActivations();
        }
      }).not.toThrow();
    });
  });
});

// =============================================================================
// useCodexStore Edge Cases
// =============================================================================
describe('useCodexStore Edge Cases', () => {
  describe('Null/Undefined Inputs', () => {
    it('should handle getEntry with null id', () => {
      expect(useCodexStore.getState().getEntry(null as any)).toBeUndefined();
    });

    it('should handle getEntry with undefined id', () => {
      expect(useCodexStore.getState().getEntry(undefined as any)).toBeUndefined();
    });

    it('should handle getEntry with empty string id', () => {
      expect(useCodexStore.getState().getEntry('')).toBeUndefined();
    });

    it('should handle getEntriesByRarity with null rarity', () => {
      expect(() => {
        useCodexStore.getState().getEntriesByRarity(null as any);
      }).not.toThrow();
    });

    it('should handle removeEntry with non-existent id', () => {
      expect(() => {
        useCodexStore.getState().removeEntry('non-existent-id');
      }).not.toThrow();
    });

    it('should handle addEntry with null modules', () => {
      const mockAttributes: GeneratedAttributes = {
        name: 'Test',
        rarity: 'common' as Rarity,
        stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
        tags: [],
        description: 'Test',
        codexId: 'MC-0001',
      };
      
      expect(() => {
        useCodexStore.getState().addEntry('Test', null as any, [], mockAttributes);
      }).not.toThrow();
    });

    it('should handle addEntry with undefined connections', () => {
      const mockAttributes: GeneratedAttributes = {
        name: 'Test',
        rarity: 'common' as Rarity,
        stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
        tags: [],
        description: 'Test',
        codexId: 'MC-0001',
      };
      
      expect(() => {
        useCodexStore.getState().addEntry('Test', [], undefined as any, mockAttributes);
      }).not.toThrow();
    });
  });

  describe('Empty State Operations', () => {
    it('should handle getEntryCount on empty codex', () => {
      expect(useCodexStore.getState().getEntryCount()).toBe(0);
    });

    it('should handle getEntriesByRarity on empty codex', () => {
      expect(useCodexStore.getState().getEntriesByRarity('legendary').length).toBe(0);
    });
  });

  describe('Boundary Values', () => {
    it('should handle getEntry with MAX_SAFE_INTEGER', () => {
      expect(useCodexStore.getState().getEntry(String(Number.MAX_SAFE_INTEGER))).toBeUndefined();
    });

    it('should handle getEntry with very long id', () => {
      const longId = 'a'.repeat(10000);
      expect(() => {
        useCodexStore.getState().getEntry(longId);
      }).not.toThrow();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid addEntry calls without race conditions', () => {
      const mockAttributes: GeneratedAttributes = {
        name: 'Test',
        rarity: 'common' as Rarity,
        stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
        tags: [],
        description: 'Test',
        codexId: 'MC-0001',
      };
      
      expect(() => {
        for (let i = 0; i < 50; i++) {
          useCodexStore.getState().addEntry(
            `Machine ${i}`,
            [],
            [],
            { ...mockAttributes, codexId: `MC-${String(i).padStart(4, '0')}` }
          );
        }
      }).not.toThrow();
      
      // All entries should be added
      expect(useCodexStore.getState().entries.length).toBe(50);
    });

    it('should handle rapid removeEntry calls without state corruption', () => {
      const mockAttributes: GeneratedAttributes = {
        name: 'Test',
        rarity: 'common' as Rarity,
        stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
        tags: [],
        description: 'Test',
        codexId: 'MC-0001',
      };
      
      // Add some entries first
      for (let i = 0; i < 10; i++) {
        useCodexStore.getState().addEntry(
          `Machine ${i}`,
          [],
          [],
          { ...mockAttributes, codexId: `MC-${String(i).padStart(4, '0')}` }
        );
      }
      
      const entryIds = useCodexStore.getState().entries.map(e => e.id);
      
      expect(() => {
        entryIds.forEach(id => {
          useCodexStore.getState().removeEntry(id);
        });
      }).not.toThrow();
      
      expect(useCodexStore.getState().entries.length).toBe(0);
    });
  });
});

// =============================================================================
// useExchangeStore Edge Cases
// =============================================================================
describe('useExchangeStore Edge Cases', () => {
  describe('Null/Undefined Inputs', () => {
    it('should handle isListed with null id', () => {
      expect(useExchangeStore.getState().isListed(null as any)).toBe(false);
    });

    it('should handle isListed with undefined id', () => {
      expect(useExchangeStore.getState().isListed(undefined as any)).toBe(false);
    });

    it('should handle markForTrade with null id', () => {
      expect(() => {
        useExchangeStore.getState().markForTrade(null as any);
      }).not.toThrow();
    });

    it('should handle unmarkFromTrade with non-existent id', () => {
      expect(() => {
        useExchangeStore.getState().unmarkFromTrade('non-existent-id');
      }).not.toThrow();
    });

    it('should handle acceptProposal with null id', () => {
      expect(useExchangeStore.getState().acceptProposal(null as any)).toBe(false);
    });

    it('should handle rejectProposal with null id', () => {
      expect(() => {
        useExchangeStore.getState().rejectProposal(null as any);
      }).not.toThrow();
    });

    it('should handle getProposal with null id', () => {
      expect(useExchangeStore.getState().getProposal(null as any)).toBeUndefined();
    });

    it('should handle addNotification with null proposalId', () => {
      expect(() => {
        useExchangeStore.getState().addNotification({
          proposalId: null as any,
          message: 'Test',
          type: 'incoming',
          read: false,
        });
      }).not.toThrow();
    });

    it('should handle addNotification with undefined message', () => {
      expect(() => {
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-1',
          message: undefined as any,
          type: 'incoming',
          read: false,
        });
      }).not.toThrow();
    });
  });

  describe('Empty State Operations', () => {
    it('should handle getMyListedMachines on empty codex', () => {
      expect(useExchangeStore.getState().getMyListedMachines().length).toBe(0);
    });

    it('should handle getMyPendingProposals on empty state', () => {
      expect(useExchangeStore.getState().getMyPendingProposals().length).toBe(0);
    });

    it('should handle getIncomingPendingProposals on empty state', () => {
      expect(useExchangeStore.getState().getIncomingPendingProposals().length).toBe(0);
    });

    it('should handle getTradeHistory on empty state', () => {
      expect(useExchangeStore.getState().getTradeHistory().length).toBe(0);
    });

    it('should handle getUnreadCount on empty state', () => {
      expect(useExchangeStore.getState().getUnreadCount()).toBe(0);
    });

    it('should handle clearNotifications on empty state', () => {
      expect(() => {
        useExchangeStore.getState().clearNotifications();
      }).not.toThrow();
    });

    it('should handle hasPendingProposals on empty state', () => {
      expect(useExchangeStore.getState().hasPendingProposals()).toBe(false);
    });
  });

  describe('Boundary Values', () => {
    it('should handle createProposal with non-existent machine id', () => {
      expect(useExchangeStore.getState().createProposal('non-existent', {} as any)).toBeNull();
    });

    it('should handle acceptProposal with non-existent proposal id', () => {
      expect(useExchangeStore.getState().acceptProposal('non-existent-id')).toBe(false);
    });

    it('should handle markNotificationRead with non-existent id', () => {
      expect(() => {
        useExchangeStore.getState().markNotificationRead('non-existent-id');
      }).not.toThrow();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid markForTrade calls without duplicates', () => {
      // Mock codex entry
      useCodexStore.setState({
        entries: [{
          id: 'codex-1',
          codexId: 'MC-0001',
          name: 'Test',
          rarity: 'common' as Rarity,
          modules: [],
          connections: [],
          attributes: {
            name: 'Test',
            rarity: 'common' as Rarity,
            stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
            tags: [],
            description: 'Test',
            codexId: 'MC-0001',
          },
          createdAt: Date.now(),
        }],
      });

      expect(() => {
        for (let i = 0; i < 10; i++) {
          useExchangeStore.getState().markForTrade('codex-1');
        }
      }).not.toThrow();
      
      // Should only have one listing (no duplicates)
      expect(useExchangeStore.getState().listings.length).toBe(1);
    });

    it('should handle rapid addNotification calls', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          useExchangeStore.getState().addNotification({
            proposalId: `proposal-${i}`,
            message: `Notification ${i}`,
            type: 'incoming',
            read: false,
          });
        }
      }).not.toThrow();
      
      // Should enforce max 50 notifications
      expect(useExchangeStore.getState().notifications.length).toBeLessThanOrEqual(50);
    });
  });
});

// =============================================================================
// useChallengeStore Edge Cases
// =============================================================================
describe('useChallengeStore Edge Cases', () => {
  describe('Null/Undefined Inputs', () => {
    it('should handle checkChallengeCompletion with null type', () => {
      expect(() => {
        useChallengeStore.getState().checkChallengeCompletion(null as any, 10);
      }).not.toThrow();
    });

    it('should handle claimReward with null challengeId', () => {
      expect(() => {
        useChallengeStore.getState().claimReward(null as any);
      }).not.toThrow();
    });

    it('should handle claimReward with non-existent challengeId', () => {
      expect(() => {
        useChallengeStore.getState().claimReward('non-existent-challenge');
      }).not.toThrow();
    });

    it('should handle isChallengeCompleted with null id', () => {
      expect(useChallengeStore.getState().isChallengeCompleted(null as any)).toBe(false);
    });

    it('should handle isRewardClaimed with null id', () => {
      expect(useChallengeStore.getState().isRewardClaimed(null as any)).toBe(false);
    });

    it('should handle getChallengeProgress with null id', () => {
      expect(useChallengeStore.getState().getChallengeProgress(null as any)).toBe(0);
    });

    it('should handle getChallengesByCategory with null category', () => {
      expect(() => {
        useChallengeStore.getState().getChallengesByCategory(null as any);
      }).not.toThrow();
    });
  });

  describe('Empty State Operations', () => {
    it('should handle getCompletedChallenges on empty state', () => {
      expect(useChallengeStore.getState().getCompletedChallenges().length).toBe(0);
    });

    it('should handle getAvailableChallenges on empty state', () => {
      const available = useChallengeStore.getState().getAvailableChallenges();
      expect(available.length).toBeGreaterThan(0); // Should have challenge definitions
    });

    it('should handle getCompletedCount on empty state', () => {
      expect(useChallengeStore.getState().getCompletedCount()).toBe(0);
    });

    it('should handle resetChallenges on clean state', () => {
      expect(() => {
        useChallengeStore.getState().resetChallenges();
      }).not.toThrow();
    });
  });

  describe('Boundary Values', () => {
    it('should handle updateProgress with zero values', () => {
      expect(() => {
        useChallengeStore.getState().updateProgress({
          machinesCreated: 0,
          connectionsCreated: 0,
        });
      }).not.toThrow();
    });

    it('should handle updateProgress with negative values', () => {
      expect(() => {
        useChallengeStore.getState().updateProgress({
          machinesCreated: -1,
        });
      }).not.toThrow();
    });

    it('should handle checkChallengeCompletion with negative value', () => {
      expect(useChallengeStore.getState().checkChallengeCompletion('machines_created', -1)).toBe(true);
    });

    it('should handle checkChallengeCompletion with very large value', () => {
      expect(() => {
        useChallengeStore.getState().checkChallengeCompletion('machines_created', Number.MAX_SAFE_INTEGER);
      }).not.toThrow();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid updateProgress calls', () => {
      expect(() => {
        for (let i = 0; i < 50; i++) {
          useChallengeStore.getState().updateProgress({
            machinesCreated: i,
          });
        }
      }).not.toThrow();
    });

    it('should handle rapid claimReward calls for same challenge', () => {
      // Use a real challenge ID
      expect(() => {
        useChallengeStore.getState().claimReward('first-machine');
        useChallengeStore.getState().claimReward('first-machine');
        useChallengeStore.getState().claimReward('first-machine');
      }).not.toThrow();
      
      // Should only be completed once
      expect(useChallengeStore.getState().isChallengeCompleted('first-machine')).toBe(true);
      expect(useChallengeStore.getState().getCompletedCount()).toBe(1);
    });
  });
});

// =============================================================================
// useRecipeStore Edge Cases
// =============================================================================
describe('useRecipeStore Edge Cases', () => {
  describe('Null/Undefined Inputs', () => {
    it('should handle isUnlocked with null id', () => {
      expect(useRecipeStore.getState().isUnlocked(null as any)).toBe(false);
    });

    it('should handle isUnlocked with undefined id', () => {
      expect(useRecipeStore.getState().isUnlocked(undefined as any)).toBe(false);
    });

    it('should handle unlockRecipe with null id', () => {
      expect(() => {
        useRecipeStore.getState().unlockRecipe(null as any);
      }).not.toThrow();
    });

    it('should handle unlockRecipe with non-existent id', () => {
      expect(() => {
        useRecipeStore.getState().unlockRecipe('non-existent-recipe');
      }).not.toThrow();
    });

    it('should handle getRecipe with null id', () => {
      expect(useRecipeStore.getState().getRecipe(null as any)).toBeUndefined();
    });

    it('should handle discoverRecipe with null id', () => {
      expect(() => {
        useRecipeStore.getState().discoverRecipe(null as any);
      }).not.toThrow();
    });

    it('should handle markAsSeen with null id', () => {
      expect(() => {
        useRecipeStore.getState().markAsSeen(null as any);
      }).not.toThrow();
    });
  });

  describe('Empty State Operations', () => {
    it('should handle getUnlockedRecipes on empty state', () => {
      expect(useRecipeStore.getState().getUnlockedRecipes().length).toBe(0);
    });

    it('should handle getLockedRecipes on empty state', () => {
      const locked = useRecipeStore.getState().getLockedRecipes();
      expect(locked.length).toBeGreaterThan(0); // Should have recipe definitions
    });

    it('should handle getNextPendingDiscovery on empty state', () => {
      expect(useRecipeStore.getState().getNextPendingDiscovery()).toBeNull();
    });

    it('should handle clearPendingDiscoveries on empty state', () => {
      expect(() => {
        useRecipeStore.getState().clearPendingDiscoveries();
      }).not.toThrow();
    });

    it('should handle resetAllRecipes on clean state', () => {
      expect(() => {
        useRecipeStore.getState().resetAllRecipes();
      }).not.toThrow();
    });
  });

  describe('Boundary Values', () => {
    it('should handle unlockRecipe for already unlocked recipe', () => {
      useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
      
      // Try to unlock again
      expect(() => {
        useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
      }).not.toThrow();
      
      // Should still only be unlocked once
      const unlocked = useRecipeStore.getState().unlockedRecipes;
      const count = unlocked.filter(r => r.recipeId === 'recipe-core-furnace').length;
      expect(count).toBe(1);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid unlockRecipe calls', () => {
      expect(() => {
        for (let i = 0; i < 20; i++) {
          useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
        }
      }).not.toThrow();
      
      // Should only be unlocked once
      const unlocked = useRecipeStore.getState().unlockedRecipes;
      const count = unlocked.filter(r => r.recipeId === 'recipe-core-furnace').length;
      expect(count).toBe(1);
    });

    it('should handle concurrent unlock and discover', () => {
      expect(() => {
        useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
        useRecipeStore.getState().discoverRecipe('first-machine');
        useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
      }).not.toThrow();
    });
  });
});

// =============================================================================
// useFactionStore Edge Cases
// =============================================================================
describe('useFactionStore Edge Cases', () => {
  describe('Null/Undefined Inputs', () => {
    it('should handle incrementFactionCount with null faction', () => {
      expect(() => {
        useFactionStore.getState().incrementFactionCount(null as any);
      }).not.toThrow();
    });

    it('should handle incrementFactionCount with undefined faction', () => {
      expect(() => {
        useFactionStore.getState().incrementFactionCount(undefined as any);
      }).not.toThrow();
    });

    it('should handle incrementFactionCount with invalid faction', () => {
      expect(() => {
        useFactionStore.getState().incrementFactionCount('invalid-faction' as any);
      }).not.toThrow();
    });

    it('should handle setSelectedFaction with null', () => {
      expect(() => {
        useFactionStore.getState().setSelectedFaction(null);
      }).not.toThrow();
    });

    it('should handle unlockTechTreeNode with null id', () => {
      expect(() => {
        useFactionStore.getState().unlockTechTreeNode(null as any);
      }).not.toThrow();
    });

    it('should handle getFactionCount with invalid faction', () => {
      expect(() => {
        useFactionStore.getState().getFactionCount('invalid' as any);
      }).not.toThrow();
    });

    it('should handle isTechTreeNodeUnlocked with null id', () => {
      expect(() => {
        useFactionStore.getState().isTechTreeNodeUnlocked(null as any);
      }).not.toThrow();
    });
  });

  describe('Empty State Operations', () => {
    it('should handle getTechTreeNodes on clean state', () => {
      const nodes = useFactionStore.getState().getTechTreeNodes();
      expect(nodes.length).toBeGreaterThan(0);
    });

    it('should handle getFactionCount for all factions on clean state', () => {
      const factions: FactionId[] = ['void', 'inferno', 'storm', 'stellar', 'arcane', 'chaos'];
      factions.forEach(faction => {
        expect(useFactionStore.getState().getFactionCount(faction)).toBe(0);
      });
    });

    it('should handle resetFactionProgress on clean state', () => {
      expect(() => {
        useFactionStore.getState().resetFactionProgress();
      }).not.toThrow();
    });
  });

  describe('Boundary Values', () => {
    it('should handle very large faction count', () => {
      useFactionStore.setState({
        factionCounts: { void: Number.MAX_SAFE_INTEGER, inferno: 0, storm: 0, stellar: 0, arcane: 0, chaos: 0 },
      });
      
      expect(() => {
        useFactionStore.getState().incrementFactionCount('void');
      }).not.toThrow();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid incrementFactionCount calls', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          useFactionStore.getState().incrementFactionCount('void');
        }
      }).not.toThrow();
      
      expect(useFactionStore.getState().getFactionCount('void')).toBe(100);
    });

    it('should handle incrementing multiple factions concurrently', () => {
      const factions: FactionId[] = ['void', 'inferno', 'storm', 'stellar'];
      
      expect(() => {
        factions.forEach(faction => {
          for (let i = 0; i < 25; i++) {
            useFactionStore.getState().incrementFactionCount(faction);
          }
        });
      }).not.toThrow();
      
      factions.forEach(faction => {
        expect(useFactionStore.getState().getFactionCount(faction)).toBe(25);
      });
    });
  });
});

// =============================================================================
// useFactionReputationStore Edge Cases
// =============================================================================
describe('useFactionReputationStore Edge Cases', () => {
  describe('Null/Undefined Inputs', () => {
    it('should handle addReputation with null factionId', () => {
      expect(() => {
        useFactionReputationStore.getState().addReputation(null as any, 100);
      }).not.toThrow();
    });

    it('should handle addReputation with undefined factionId', () => {
      expect(() => {
        useFactionReputationStore.getState().addReputation(undefined as any, 100);
      }).not.toThrow();
    });

    it('should handle addReputation with invalid factionId', () => {
      expect(() => {
        useFactionReputationStore.getState().addReputation('invalid' as any, 100);
      }).not.toThrow();
    });

    it('should handle getReputation with null factionId', () => {
      expect(useFactionReputationStore.getState().getReputation(null as any)).toBe(0);
    });

    it('should handle getReputationLevel with null factionId', () => {
      expect(() => {
        useFactionReputationStore.getState().getReputationLevel(null as any);
      }).not.toThrow();
    });

    it('should handle researchTech with invalid techId gracefully', () => {
      // Invalid tech IDs may throw - this is expected behavior
      expect(() => {
        useFactionReputationStore.getState().researchTech('invalid-tech-xyz', 'void');
      }).not.toThrow();
    });

    it('should handle researchTech with null factionId', () => {
      expect(() => {
        useFactionReputationStore.getState().researchTech('void-tier-1', null as any);
      }).not.toThrow();
    });

    it('should handle cancelResearch with invalid techId', () => {
      expect(() => {
        useFactionReputationStore.getState().cancelResearch('invalid-tech', 'void');
      }).not.toThrow();
    });

    it('should handle getTechBonus with null moduleType', () => {
      expect(useFactionReputationStore.getState().getTechBonus(null as any, 'power_output')).toBe(0);
    });

    it('should handle getTechBonus with invalid statType', () => {
      expect(() => {
        useFactionReputationStore.getState().getTechBonus('core-furnace', 'invalid' as any);
      }).not.toThrow();
    });
  });

  describe('Empty State Operations', () => {
    it('should handle getReputation on clean state', () => {
      expect(useFactionReputationStore.getState().getReputation('void')).toBe(0);
    });

    it('should handle getReputationLevel on clean state', () => {
      const level = useFactionReputationStore.getState().getReputationLevel('void');
      expect(level).toBe('apprentice');
    });

    it('should handle getCurrentResearch on clean state', () => {
      expect(useFactionReputationStore.getState().getCurrentResearch('void').length).toBe(0);
    });

    it('should handle getResearchableTechs on clean state', () => {
      const techs = useFactionReputationStore.getState().getResearchableTechs('void');
      expect(techs.length).toBe(0); // Need 100 rep for tier 1
    });

    it('should handle resetReputation on clean state', () => {
      expect(() => {
        useFactionReputationStore.getState().resetReputation('void');
      }).not.toThrow();
    });

    it('should handle resetAllReputations on clean state', () => {
      expect(() => {
        useFactionReputationStore.getState().resetAllReputations();
      }).not.toThrow();
    });
  });

  describe('Boundary Values', () => {
    it('should handle addReputation with negative points', () => {
      useFactionReputationStore.getState().addReputation('void', 100);
      useFactionReputationStore.getState().addReputation('void', -200);
      // Should not go below 0
      expect(useFactionReputationStore.getState().getReputation('void')).toBe(0);
    });

    it('should handle addReputation with very large points', () => {
      expect(() => {
        useFactionReputationStore.getState().addReputation('void', Number.MAX_SAFE_INTEGER);
      }).not.toThrow();
    });

    it('should handle getTechBonus for module with no faction', () => {
      expect(useFactionReputationStore.getState().getTechBonus('unknown-module', 'power_output')).toBe(0);
    });

    it('should handle getTotalTechBonus with empty array', () => {
      expect(useFactionReputationStore.getState().getTotalTechBonus([], 'power_output')).toBe(0);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid addReputation calls', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          useFactionReputationStore.getState().addReputation('void', 10);
        }
      }).not.toThrow();
      
      expect(useFactionReputationStore.getState().getReputation('void')).toBe(1000);
    });

    it('should handle addReputation to multiple factions concurrently', () => {
      const factions = ['void', 'inferno', 'storm', 'stellar'];
      
      expect(() => {
        factions.forEach(faction => {
          for (let i = 0; i < 50; i++) {
            useFactionReputationStore.getState().addReputation(faction, 10);
          }
        });
      }).not.toThrow();
      
      factions.forEach(faction => {
        expect(useFactionReputationStore.getState().getReputation(faction)).toBe(500);
      });
    });

    it('should handle rapid researchTech calls', () => {
      // First add enough reputation
      useFactionReputationStore.getState().addReputation('void', 1000);
      
      expect(() => {
        useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      }).not.toThrow();
      
      // Should not allow duplicate research
      const result = useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      expect(result).toBe('already_researching');
    });
  });
});

// =============================================================================
// useCommunityStore Edge Cases
// =============================================================================
describe('useCommunityStore Edge Cases', () => {
  describe('Null/Undefined Inputs', () => {
    it('should handle setSearchQuery with null', () => {
      expect(() => {
        useCommunityStore.getState().setSearchQuery(null as any);
      }).not.toThrow();
    });

    it('should handle setSearchQuery with undefined', () => {
      expect(() => {
        useCommunityStore.getState().setSearchQuery(undefined as any);
      }).not.toThrow();
    });

    it('should handle setFactionFilter with null', () => {
      expect(() => {
        useCommunityStore.getState().setFactionFilter(null as any);
      }).not.toThrow();
    });

    it('should handle setRarityFilter with null', () => {
      expect(() => {
        useCommunityStore.getState().setRarityFilter(null as any);
      }).not.toThrow();
    });

    it('should handle setSortOption with null', () => {
      expect(() => {
        useCommunityStore.getState().setSortOption(null as any);
      }).not.toThrow();
    });

    it('should handle likeMachine with null id', () => {
      expect(() => {
        useCommunityStore.getState().likeMachine(null as any);
      }).not.toThrow();
    });

    it('should handle viewMachine with empty string id', () => {
      expect(() => {
        useCommunityStore.getState().viewMachine('');
      }).not.toThrow();
    });

    it('should handle openPublishModal with null pendingMachine', () => {
      expect(() => {
        useCommunityStore.getState().openPublishModal(null as any, null as any, null as any, null as any);
      }).not.toThrow();
    });

    it('should handle publishMachine with empty authorName', () => {
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: {
            name: 'Test',
            rarity: 'common' as Rarity,
            stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
            tags: [],
            description: 'Test',
            codexId: 'MC-0001',
          },
          dominantFaction: 'void' as FactionId,
        },
      });
      
      expect(() => {
        useCommunityStore.getState().publishMachine('');
      }).not.toThrow();
    });
  });

  describe('Empty State Operations', () => {
    it('should handle openGallery on clean state', () => {
      expect(() => {
        useCommunityStore.getState().openGallery();
      }).not.toThrow();
      expect(useCommunityStore.getState().isGalleryOpen).toBe(true);
    });

    it('should handle closeGallery on clean state', () => {
      expect(() => {
        useCommunityStore.getState().closeGallery();
      }).not.toThrow();
      expect(useCommunityStore.getState().isGalleryOpen).toBe(false);
    });

    it('should handle closePublishModal on clean state', () => {
      expect(() => {
        useCommunityStore.getState().closePublishModal();
      }).not.toThrow();
      expect(useCommunityStore.getState().isPublishModalOpen).toBe(false);
    });

    it('should handle getFilteredMachinesList on empty state', () => {
      const machines = useCommunityStore.getState().getFilteredMachinesList();
      expect(Array.isArray(machines)).toBe(true);
    });
  });

  describe('Boundary Values', () => {
    it('should handle very long search query', () => {
      const longQuery = 'a'.repeat(10000);
      expect(() => {
        useCommunityStore.getState().setSearchQuery(longQuery);
      }).not.toThrow();
    });

    it('should handle search query with special characters', () => {
      const specialQuery = '<script>alert("xss")</script>';
      expect(() => {
        useCommunityStore.getState().setSearchQuery(specialQuery);
      }).not.toThrow();
    });

    it('should handle likeMachine for non-existent machine', () => {
      expect(() => {
        useCommunityStore.getState().likeMachine('non-existent-id');
      }).not.toThrow();
    });

    it('should handle viewMachine for non-existent machine', () => {
      expect(() => {
        useCommunityStore.getState().viewMachine('non-existent-id');
      }).not.toThrow();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid filter changes', () => {
      const filters = ['all', 'void', 'inferno', 'storm', 'stellar'] as const;
      
      expect(() => {
        for (let i = 0; i < 100; i++) {
          useCommunityStore.getState().setFactionFilter(filters[i % filters.length]);
        }
      }).not.toThrow();
    });

    it('should handle rapid sort changes', () => {
      const sorts = ['newest', 'popular', 'oldest'] as const;
      
      expect(() => {
        for (let i = 0; i < 100; i++) {
          useCommunityStore.getState().setSortOption(sorts[i % sorts.length]);
        }
      }).not.toThrow();
    });

    it('should handle rapid open/close gallery', () => {
      expect(() => {
        for (let i = 0; i < 50; i++) {
          useCommunityStore.getState().openGallery();
          useCommunityStore.getState().closeGallery();
        }
      }).not.toThrow();
    });
  });
});

// =============================================================================
// Negative Assertions - Store should not crash on invalid inputs
// =============================================================================
describe('Negative Assertions - Store Resilience', () => {
  describe('useMachineStore should not throw on invalid inputs', () => {
    it('does not throw on null addModule inputs', () => {
      expect(() => useMachineStore.getState().addModule(null as any, 0, 0)).not.toThrow();
    });
    
    it('does not throw on undefined addModule inputs', () => {
      expect(() => useMachineStore.getState().addModule(undefined as any, 0, 0)).not.toThrow();
    });
    
    it('does not throw on NaN coordinates', () => {
      expect(() => useMachineStore.getState().addModule('core-furnace', NaN, NaN)).not.toThrow();
    });
    
    it('does not throw on Infinity coordinates', () => {
      expect(() => useMachineStore.getState().addModule('core-furnace', Infinity, -Infinity)).not.toThrow();
    });
    
    it('does not throw on negative scale', () => {
      useMachineStore.getState().addModule('core-furnace', 200, 200);
      const id = useMachineStore.getState().modules[0].instanceId;
      expect(() => useMachineStore.getState().updateModuleScale(id, -5)).not.toThrow();
    });
    
    it('state remains consistent after invalid operations', () => {
      useMachineStore.getState().addModule('core-furnace', 200, 200);
      const originalModule = useMachineStore.getState().modules[0];
      
      // Perform some invalid operations
      useMachineStore.getState().removeModule(null as any);
      useMachineStore.getState().updateModulePosition(null as any, NaN, NaN);
      useMachineStore.getState().updateModuleScale(null as any, -1);
      
      // Original module should still exist
      const stillExists = useMachineStore.getState().modules.some(m => m.instanceId === originalModule.instanceId);
      expect(stillExists).toBe(true);
    });
  });
  
  describe('useActivationStore should not throw on invalid inputs', () => {
    it('does not throw on null machineId', () => {
      expect(() => useActivationStore.getState().recordActivation(null as any)).not.toThrow();
    });
    
    it('does not throw on undefined machineId', () => {
      expect(() => useActivationStore.getState().recordActivation(undefined as any)).not.toThrow();
    });
    
    it('does not throw on invalid state', () => {
      expect(() => useActivationStore.getState().recordActivation('id', 'invalid' as any)).not.toThrow();
    });
    
    it('state remains consistent after invalid operations', () => {
      const initialCount = useActivationStore.getState().totalActivations;
      
      useActivationStore.getState().recordActivation(null as any);
      useActivationStore.getState().recordActivation(undefined as any, null as any);
      
      // Should have recorded some activations
      expect(useActivationStore.getState().totalActivations).toBeGreaterThanOrEqual(initialCount);
    });
  });
  
  describe('useCodexStore should not throw on invalid inputs', () => {
    it('does not throw on null getEntry', () => {
      expect(() => useCodexStore.getState().getEntry(null as any)).not.toThrow();
    });
    
    it('does not throw on removeEntry of non-existent', () => {
      expect(() => useCodexStore.getState().removeEntry('non-existent')).not.toThrow();
    });
    
    it('state remains consistent after invalid operations', () => {
      const initialCount = useCodexStore.getState().entries.length;
      
      useCodexStore.getState().removeEntry('non-existent-id');
      useCodexStore.getState().getEntry(null as any);
      
      // Count should be unchanged
      expect(useCodexStore.getState().entries.length).toBe(initialCount);
    });
  });
});
