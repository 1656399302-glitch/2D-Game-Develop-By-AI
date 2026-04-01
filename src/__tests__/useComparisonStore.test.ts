/**
 * Comparison Store Integration Tests
 * 
 * Tests for the Comparison store which manages machine comparison state.
 * This store is used by the MachineComparisonPanel to track selected machines.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useComparisonStore, hydrateComparisonStore, isComparisonHydrated } from '../store/useComparisonStore';
import { CodexEntry, GeneratedAttributes, Rarity } from '../types';

describe('ComparisonStore', () => {
  // Helper to create mock codex entries
  const createMockEntry = (id: string, name: string, rarity: Rarity): CodexEntry => ({
    id,
    codexId: `MC-${id}`,
    name,
    rarity,
    modules: [],
    connections: [],
    attributes: {
      name,
      rarity,
      stats: { power: 50, stability: 50 },
      tags: [],
      description: `Test description for ${name}`,
    },
    createdAt: Date.now(),
  });

  beforeEach(() => {
    // Reset store state before each test
    useComparisonStore.setState({
      selectedMachineA: null,
      selectedMachineB: null,
      savedComparisons: [],
    });
  });

  describe('selectMachineA', () => {
    it('should set selectedMachineA', () => {
      const entry = createMockEntry('1', 'Machine A', 'legendary');
      useComparisonStore.getState().selectMachineA(entry);

      expect(useComparisonStore.getState().selectedMachineA).toEqual(entry);
    });

    it('should allow null to clear selection', () => {
      const entry = createMockEntry('1', 'Machine A', 'legendary');
      useComparisonStore.getState().selectMachineA(entry);
      expect(useComparisonStore.getState().selectedMachineA).toEqual(entry);

      useComparisonStore.getState().selectMachineA(null);
      expect(useComparisonStore.getState().selectedMachineA).toBeNull();
    });

    it('should not affect selectedMachineB', () => {
      const entryB = createMockEntry('2', 'Machine B', 'rare');
      useComparisonStore.getState().selectMachineB(entryB);

      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      useComparisonStore.getState().selectMachineA(entryA);

      expect(useComparisonStore.getState().selectedMachineA).toEqual(entryA);
      expect(useComparisonStore.getState().selectedMachineB).toEqual(entryB);
    });
  });

  describe('selectMachineB', () => {
    it('should set selectedMachineB', () => {
      const entry = createMockEntry('2', 'Machine B', 'rare');
      useComparisonStore.getState().selectMachineB(entry);

      expect(useComparisonStore.getState().selectedMachineB).toEqual(entry);
    });

    it('should allow null to clear selection', () => {
      const entry = createMockEntry('2', 'Machine B', 'rare');
      useComparisonStore.getState().selectMachineB(entry);
      expect(useComparisonStore.getState().selectedMachineB).toEqual(entry);

      useComparisonStore.getState().selectMachineB(null);
      expect(useComparisonStore.getState().selectedMachineB).toBeNull();
    });

    it('should not affect selectedMachineA', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      useComparisonStore.getState().selectMachineA(entryA);

      const entryB = createMockEntry('2', 'Machine B', 'rare');
      useComparisonStore.getState().selectMachineB(entryB);

      expect(useComparisonStore.getState().selectedMachineA).toEqual(entryA);
      expect(useComparisonStore.getState().selectedMachineB).toEqual(entryB);
    });
  });

  describe('swapMachines', () => {
    it('should swap selectedMachineA and selectedMachineB', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      const entryB = createMockEntry('2', 'Machine B', 'rare');

      useComparisonStore.getState().selectMachineA(entryA);
      useComparisonStore.getState().selectMachineB(entryB);

      useComparisonStore.getState().swapMachines();

      expect(useComparisonStore.getState().selectedMachineA).toEqual(entryB);
      expect(useComparisonStore.getState().selectedMachineB).toEqual(entryA);
    });

    it('should handle swapping when one is null', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');

      useComparisonStore.getState().selectMachineA(entryA);
      useComparisonStore.getState().selectMachineB(null);

      useComparisonStore.getState().swapMachines();

      expect(useComparisonStore.getState().selectedMachineA).toBeNull();
      expect(useComparisonStore.getState().selectedMachineB).toEqual(entryA);
    });

    it('should handle swapping when both are null', () => {
      useComparisonStore.getState().swapMachines();

      expect(useComparisonStore.getState().selectedMachineA).toBeNull();
      expect(useComparisonStore.getState().selectedMachineB).toBeNull();
    });
  });

  describe('clearSelection', () => {
    it('should clear both selections', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      const entryB = createMockEntry('2', 'Machine B', 'rare');

      useComparisonStore.getState().selectMachineA(entryA);
      useComparisonStore.getState().selectMachineB(entryB);

      useComparisonStore.getState().clearSelection();

      expect(useComparisonStore.getState().selectedMachineA).toBeNull();
      expect(useComparisonStore.getState().selectedMachineB).toBeNull();
    });

    // Note: clearSelection only clears selections, not savedComparisons
    // This is by design - saved comparisons persist
    it('should not clear savedComparisons', () => {
      useComparisonStore.setState({
        savedComparisons: [
          {
            id: 'comp-1',
            machineA: createMockEntry('1', 'Machine A', 'legendary'),
            machineB: createMockEntry('2', 'Machine B', 'rare'),
            createdAt: Date.now(),
            name: 'Test Comparison',
          },
        ],
      });

      useComparisonStore.getState().clearSelection();

      // savedComparisons should remain intact
      expect(useComparisonStore.getState().savedComparisons).toHaveLength(1);
    });
  });

  describe('saveComparison', () => {
    it('should save a comparison when both machines are selected', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      const entryB = createMockEntry('2', 'Machine B', 'rare');

      useComparisonStore.getState().selectMachineA(entryA);
      useComparisonStore.getState().selectMachineB(entryB);

      useComparisonStore.getState().saveComparison('Test Comparison');

      const savedComparisons = useComparisonStore.getState().savedComparisons;
      expect(savedComparisons).toHaveLength(1);
      expect(savedComparisons[0].machineA).toEqual(entryA);
      expect(savedComparisons[0].machineB).toEqual(entryB);
      expect(savedComparisons[0].name).toBe('Test Comparison');
      expect(savedComparisons[0].createdAt).toBeDefined();
    });

    it('should not save comparison when only MachineA is selected', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      useComparisonStore.getState().selectMachineA(entryA);

      useComparisonStore.getState().saveComparison('Should Not Save');

      expect(useComparisonStore.getState().savedComparisons).toHaveLength(0);
    });

    it('should not save comparison when only MachineB is selected', () => {
      const entryB = createMockEntry('2', 'Machine B', 'rare');
      useComparisonStore.getState().selectMachineB(entryB);

      useComparisonStore.getState().saveComparison('Should Not Save');

      expect(useComparisonStore.getState().savedComparisons).toHaveLength(0);
    });

    it('should save comparison without name', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      const entryB = createMockEntry('2', 'Machine B', 'rare');

      useComparisonStore.getState().selectMachineA(entryA);
      useComparisonStore.getState().selectMachineB(entryB);

      useComparisonStore.getState().saveComparison();

      const savedComparisons = useComparisonStore.getState().savedComparisons;
      expect(savedComparisons).toHaveLength(1);
      expect(savedComparisons[0].name).toBeUndefined();
    });

    it('should add to existing saved comparisons', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      const entryB = createMockEntry('2', 'Machine B', 'rare');

      useComparisonStore.getState().selectMachineA(entryA);
      useComparisonStore.getState().selectMachineB(entryB);
      useComparisonStore.getState().saveComparison('First');

      const entryC = createMockEntry('3', 'Machine C', 'epic');
      useComparisonStore.getState().selectMachineA(entryC);
      useComparisonStore.getState().selectMachineB(entryA);
      useComparisonStore.getState().saveComparison('Second');

      expect(useComparisonStore.getState().savedComparisons).toHaveLength(2);
    });
  });

  describe('removeComparison', () => {
    it('should remove a saved comparison by ID', () => {
      useComparisonStore.setState({
        savedComparisons: [
          {
            id: 'comp-1',
            machineA: createMockEntry('1', 'Machine A', 'legendary'),
            machineB: createMockEntry('2', 'Machine B', 'rare'),
            createdAt: Date.now(),
          },
          {
            id: 'comp-2',
            machineA: createMockEntry('3', 'Machine C', 'epic'),
            machineB: createMockEntry('4', 'Machine D', 'common'),
            createdAt: Date.now(),
          },
        ],
      });

      useComparisonStore.getState().removeComparison('comp-1');

      const remaining = useComparisonStore.getState().savedComparisons;
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('comp-2');
    });

    it('should handle removing non-existent comparison gracefully', () => {
      useComparisonStore.setState({
        savedComparisons: [
          {
            id: 'comp-1',
            machineA: createMockEntry('1', 'Machine A', 'legendary'),
            machineB: createMockEntry('2', 'Machine B', 'rare'),
            createdAt: Date.now(),
          },
        ],
      });

      expect(() => useComparisonStore.getState().removeComparison('non-existent')).not.toThrow();
      expect(useComparisonStore.getState().savedComparisons).toHaveLength(1);
    });
  });

  describe('loadComparison', () => {
    it('should load a saved comparison', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      const entryB = createMockEntry('2', 'Machine B', 'rare');

      useComparisonStore.setState({
        savedComparisons: [
          {
            id: 'comp-1',
            machineA: entryA,
            machineB: entryB,
            createdAt: Date.now(),
          },
        ],
      });

      useComparisonStore.getState().loadComparison('comp-1');

      expect(useComparisonStore.getState().selectedMachineA).toEqual(entryA);
      expect(useComparisonStore.getState().selectedMachineB).toEqual(entryB);
    });

    it('should do nothing for non-existent comparison', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      useComparisonStore.getState().selectMachineA(entryA);

      useComparisonStore.getState().loadComparison('non-existent');

      expect(useComparisonStore.getState().selectedMachineA).toEqual(entryA);
    });
  });

  describe('hasBothSelected', () => {
    it('should return true when both machines are selected', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      const entryB = createMockEntry('2', 'Machine B', 'rare');

      useComparisonStore.getState().selectMachineA(entryA);
      useComparisonStore.getState().selectMachineB(entryB);

      expect(useComparisonStore.getState().hasBothSelected()).toBe(true);
    });

    it('should return false when only MachineA is selected', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      useComparisonStore.getState().selectMachineA(entryA);

      expect(useComparisonStore.getState().hasBothSelected()).toBe(false);
    });

    it('should return false when only MachineB is selected', () => {
      const entryB = createMockEntry('2', 'Machine B', 'rare');
      useComparisonStore.getState().selectMachineB(entryB);

      expect(useComparisonStore.getState().hasBothSelected()).toBe(false);
    });

    it('should return false when neither is selected', () => {
      expect(useComparisonStore.getState().hasBothSelected()).toBe(false);
    });
  });

  describe('getComparisonName', () => {
    it('should return comparison name when both machines selected', () => {
      const entryA = createMockEntry('1', 'Machine Alpha', 'legendary');
      const entryB = createMockEntry('2', 'Machine Beta', 'rare');

      useComparisonStore.getState().selectMachineA(entryA);
      useComparisonStore.getState().selectMachineB(entryB);

      expect(useComparisonStore.getState().getComparisonName()).toBe('Machine Alpha vs Machine Beta');
    });

    it('should return empty string when only MachineA selected', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      useComparisonStore.getState().selectMachineA(entryA);

      expect(useComparisonStore.getState().getComparisonName()).toBe('');
    });

    it('should return empty string when only MachineB selected', () => {
      const entryB = createMockEntry('2', 'Machine B', 'rare');
      useComparisonStore.getState().selectMachineB(entryB);

      expect(useComparisonStore.getState().getComparisonName()).toBe('');
    });

    it('should return empty string when neither selected', () => {
      expect(useComparisonStore.getState().getComparisonName()).toBe('');
    });
  });

  describe('hydration helpers', () => {
    it('should expose isComparisonHydrated function', () => {
      expect(typeof isComparisonHydrated).toBe('function');
    });

    it('should expose hydrateComparisonStore function', () => {
      expect(typeof hydrateComparisonStore).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle comparison with identical machines', () => {
      const entry = createMockEntry('1', 'Same Machine', 'legendary');

      useComparisonStore.getState().selectMachineA(entry);
      useComparisonStore.getState().selectMachineB(entry);

      expect(useComparisonStore.getState().hasBothSelected()).toBe(true);
      expect(useComparisonStore.getState().getComparisonName()).toBe('Same Machine vs Same Machine');
    });

    it('should generate unique IDs for saved comparisons', () => {
      const entryA = createMockEntry('1', 'Machine A', 'legendary');
      const entryB = createMockEntry('2', 'Machine B', 'rare');

      useComparisonStore.getState().selectMachineA(entryA);
      useComparisonStore.getState().selectMachineB(entryB);

      // Save multiple times quickly
      useComparisonStore.getState().saveComparison('First');
      useComparisonStore.getState().saveComparison('Second');
      useComparisonStore.getState().saveComparison('Third');

      const comparisons = useComparisonStore.getState().savedComparisons;
      const ids = comparisons.map(c => c.id);
      const uniqueIds = new Set(ids);

      // All IDs should be unique
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
