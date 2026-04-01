/**
 * Codex Store Integration Tests
 * 
 * Tests for the Codex store which manages machine codex entries.
 * This store is critical for saving, retrieving, and managing machine codex entries.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCodexStore, hydrateCodexStore, isCodexHydrated } from '../store/useCodexStore';
import { PlacedModule, Connection, GeneratedAttributes, Rarity } from '../types';

describe('CodexStore', () => {
  beforeEach(() => {
    // Reset store by clearing persisted storage and state
    useCodexStore.persist.clearStorage();
    // Set entries to empty array using the store's own setState
    useCodexStore.setState({ entries: [] });
  });

  describe('store initialization', () => {
    it('should have addEntry method', () => {
      const store = useCodexStore.getState();
      expect(typeof store.addEntry).toBe('function');
    });

    it('should have removeEntry method', () => {
      const store = useCodexStore.getState();
      expect(typeof store.removeEntry).toBe('function');
    });

    it('should have getEntry method', () => {
      const store = useCodexStore.getState();
      expect(typeof store.getEntry).toBe('function');
    });

    it('should have getEntriesByRarity method', () => {
      const store = useCodexStore.getState();
      expect(typeof store.getEntriesByRarity).toBe('function');
    });

    it('should have getEntryCount method', () => {
      const store = useCodexStore.getState();
      expect(typeof store.getEntryCount).toBe('function');
    });
  });

  describe('addEntry', () => {
    it('should add a new codex entry with generated ID and codexId', () => {
      const modules: PlacedModule[] = [];
      const connections: Connection[] = [];
      const attributes: GeneratedAttributes = {
        name: 'Test Machine',
        rarity: 'legendary',
        stats: { power: 100, stability: 80 },
        tags: [],
        description: 'A test machine',
      };

      const entry = useCodexStore.getState().addEntry('Test Machine', modules, connections, attributes);

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.codexId).toBe('MC-0001');
      expect(entry.name).toBe('Test Machine');
      expect(entry.rarity).toBe('legendary');
      expect(entry.modules).toEqual([]);
      expect(entry.connections).toEqual([]);
      expect(entry.attributes).toEqual(attributes);
      expect(entry.createdAt).toBeDefined();
    });

    it('should increment codexId for each new entry', () => {
      const attributes = { name: '', rarity: 'common' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      const entry1 = useCodexStore.getState().addEntry('Machine 1', [], [], attributes);
      const entry2 = useCodexStore.getState().addEntry('Machine 2', [], [], attributes);
      const entry3 = useCodexStore.getState().addEntry('Machine 3', [], [], attributes);

      expect(entry1.codexId).toBe('MC-0001');
      expect(entry2.codexId).toBe('MC-0002');
      expect(entry3.codexId).toBe('MC-0003');
    });

    it('should store modules and connections in the entry', () => {
      const modules: PlacedModule[] = [
        { instanceId: 'mod-1', type: 'core', x: 100, y: 100, rotation: 0, scale: 1, factionVariant: null },
        { instanceId: 'mod-2', type: 'gear', x: 200, y: 100, rotation: 0, scale: 1, factionVariant: null },
      ];
      const connections: Connection[] = [
        { id: 'conn-1', sourceId: 'mod-1', targetId: 'mod-2' },
      ];

      const entry = useCodexStore.getState().addEntry('Connected Machine', modules, connections, {
        name: 'Connected Machine',
        rarity: 'rare',
        stats: { power: 50, stability: 50 },
        tags: [],
        description: '',
      });

      expect(entry.modules).toHaveLength(2);
      expect(entry.connections).toHaveLength(1);
      expect(entry.modules[0].instanceId).toBe('mod-1');
      expect(entry.connections[0].id).toBe('conn-1');
    });

    it('should update entries state after adding', () => {
      const attributes = { name: 'New Entry', rarity: 'common' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      const entry = useCodexStore.getState().addEntry('New Entry', [], [], attributes);

      const state = useCodexStore.getState();
      expect(state.entries).toHaveLength(1);
      expect(state.entries[0]).toEqual(entry);
    });
  });

  describe('removeEntry', () => {
    it('should remove entry by ID', () => {
      const attributes = { name: 'To Remove', rarity: 'common' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      const entry = useCodexStore.getState().addEntry('To Remove', [], [], attributes);

      expect(useCodexStore.getState().entries).toHaveLength(1);

      useCodexStore.getState().removeEntry(entry.id);

      expect(useCodexStore.getState().entries).toHaveLength(0);
    });

    it('should not affect other entries when removing one', () => {
      const attributes = { name: '', rarity: 'common' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      const entry1 = useCodexStore.getState().addEntry('Entry 1', [], [], { ...attributes, name: 'Entry 1' });
      const entry2 = useCodexStore.getState().addEntry('Entry 2', [], [], { ...attributes, name: 'Entry 2', rarity: 'rare' as Rarity });
      useCodexStore.getState().addEntry('Entry 3', [], [], { ...attributes, name: 'Entry 3', rarity: 'legendary' as Rarity });

      useCodexStore.getState().removeEntry(entry2.id);

      const entries = useCodexStore.getState().entries;
      expect(entries).toHaveLength(2);
      expect(entries.map(e => e.name)).toEqual(['Entry 1', 'Entry 3']);
    });

    it('should handle removing non-existent entry gracefully', () => {
      const attributes = { name: 'Entry 1', rarity: 'common' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      useCodexStore.getState().addEntry('Entry 1', [], [], attributes);
      
      expect(() => useCodexStore.getState().removeEntry('non-existent-id')).not.toThrow();
      expect(useCodexStore.getState().entries).toHaveLength(1);
    });
  });

  describe('getEntry', () => {
    it('should return entry by ID', () => {
      const attributes = { name: 'Find Me', rarity: 'epic' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      const entry = useCodexStore.getState().addEntry('Find Me', [], [], attributes);

      const found = useCodexStore.getState().getEntry(entry.id);
      expect(found).toEqual(entry);
    });

    it('should return undefined for non-existent ID', () => {
      const found = useCodexStore.getState().getEntry('non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('getEntriesByRarity', () => {
    it('should return only common rarity entries', () => {
      const commonAttrs = { name: '', rarity: 'common' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      const rareAttrs = { name: '', rarity: 'rare' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      
      useCodexStore.getState().addEntry('C1', [], [], { ...commonAttrs, name: 'C1' });
      useCodexStore.getState().addEntry('R1', [], [], { ...rareAttrs, name: 'R1' });
      useCodexStore.getState().addEntry('C2', [], [], { ...commonAttrs, name: 'C2' });

      const commonEntries = useCodexStore.getState().getEntriesByRarity('common');
      expect(commonEntries).toHaveLength(2);
      expect(commonEntries.every(e => e.rarity === 'common')).toBe(true);
    });

    it('should return empty array for rarity with no entries', () => {
      const mythicalEntries = useCodexStore.getState().getEntriesByRarity('mythical' as Rarity);
      expect(mythicalEntries).toHaveLength(0);
    });
  });

  describe('getEntryCount', () => {
    it('should return 0 for empty store', () => {
      expect(useCodexStore.getState().getEntryCount()).toBe(0);
    });

    it('should return correct count after adding entries', () => {
      const attributes = { name: '', rarity: 'common' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      useCodexStore.getState().addEntry('Entry 1', [], [], { ...attributes, name: 'Entry 1' });
      expect(useCodexStore.getState().getEntryCount()).toBe(1);

      useCodexStore.getState().addEntry('Entry 2', [], [], { ...attributes, name: 'Entry 2' });
      expect(useCodexStore.getState().getEntryCount()).toBe(2);
    });

    it('should return correct count after removing entries', () => {
      const attributes = { name: '', rarity: 'common' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      const entry1 = useCodexStore.getState().addEntry('Entry 1', [], [], { ...attributes, name: 'Entry 1' });
      useCodexStore.getState().addEntry('Entry 2', [], [], { ...attributes, name: 'Entry 2' });

      expect(useCodexStore.getState().getEntryCount()).toBe(2);

      useCodexStore.getState().removeEntry(entry1.id);
      expect(useCodexStore.getState().getEntryCount()).toBe(1);
    });
  });

  describe('hydration helpers', () => {
    it('should expose isCodexHydrated function', () => {
      expect(typeof isCodexHydrated).toBe('function');
    });

    it('should expose hydrateCodexStore function', () => {
      expect(typeof hydrateCodexStore).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle empty name gracefully', () => {
      const attributes = { name: '', rarity: 'common' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      const entry = useCodexStore.getState().addEntry('', [], [], attributes);
      expect(entry.name).toBe('');
      expect(useCodexStore.getState().entries).toHaveLength(1);
    });

    it('should handle special characters in name', () => {
      const attributes = { name: 'Machine <script>alert("xss")</script>', rarity: 'common' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: '' };
      const entry = useCodexStore.getState().addEntry('Machine <script>alert("xss")</script>', [], [], attributes);
      expect(entry.name).toBe('Machine <script>alert("xss")</script>');
    });

    it('should handle very long description', () => {
      const longDescription = 'A'.repeat(10000);
      const attributes = { name: 'Long Desc', rarity: 'common' as Rarity, stats: { power: 10, stability: 10 }, tags: [], description: longDescription };
      const entry = useCodexStore.getState().addEntry('Long Desc', [], [], attributes);
      expect(entry.attributes.description).toBe(longDescription);
    });

    it('should handle entries with many modules', () => {
      const modules: PlacedModule[] = Array.from({ length: 100 }, (_, i) => ({
        instanceId: `mod-${i}`,
        type: 'core' as const,
        x: i * 10,
        y: i * 10,
        rotation: 0,
        scale: 1,
        factionVariant: null,
      }));

      const attributes = { name: 'Many Modules', rarity: 'legendary' as Rarity, stats: { power: 1000, stability: 100 }, tags: [], description: '' };
      const entry = useCodexStore.getState().addEntry('Many Modules', modules, [], attributes);

      expect(entry.modules).toHaveLength(100);
    });
  });
});
