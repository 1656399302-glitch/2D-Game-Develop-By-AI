/**
 * Collection Stats Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useMachineTagsStore } from '../store/useMachineTagsStore';
import { useCodexStore } from '../store/useCodexStore';
import { useFavoritesStore } from '../store/useFavoritesStore';

// Mock the stats calculation
const calculateMockStats = (entries: any[]) => {
  const totalMachines = entries.length;
  const totalModules = entries.reduce((sum, e) => sum + e.modules.length, 0);
  const averageComplexity = totalMachines > 0 ? totalModules / totalMachines : 0;
  
  const rarityDistribution = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
  entries.forEach(e => {
    if (rarityDistribution.hasOwnProperty(e.rarity)) {
      rarityDistribution[e.rarity]++;
    }
  });
  
  return { totalMachines, totalModules, averageComplexity, rarityDistribution };
};

describe('Collection Statistics', () => {
  describe('emptyCollection', () => {
    it('should show all counts at 0', () => {
      const stats = calculateMockStats([]);
      
      expect(stats.totalMachines).toBe(0);
      expect(stats.totalModules).toBe(0);
      expect(stats.averageComplexity).toBe(0);
      expect(stats.rarityDistribution.common).toBe(0);
    });
  });

  describe('3 machines with rarities', () => {
    it('should calculate correct rarity distribution', () => {
      const entries = [
        { id: '1', modules: [], rarity: 'common' },
        { id: '2', modules: [], rarity: 'common' },
        { id: '3', modules: [], rarity: 'rare' },
      ];
      
      const stats = calculateMockStats(entries);
      
      expect(stats.rarityDistribution.common).toBe(2);
      expect(stats.rarityDistribution.rare).toBe(1);
      expect(stats.rarityDistribution.uncommon).toBe(0);
      expect(stats.rarityDistribution.epic).toBe(0);
      expect(stats.rarityDistribution.legendary).toBe(0);
    });
  });

  describe('5 modules total', () => {
    it('should calculate correct module count', () => {
      const entries = [
        { id: '1', modules: [{ id: 'm1' }, { id: 'm2' }], rarity: 'common' },
        { id: '2', modules: [{ id: 'm3' }, { id: 'm4' }, { id: 'm5' }], rarity: 'rare' },
      ];
      
      const stats = calculateMockStats(entries);
      
      expect(stats.totalModules).toBe(5);
    });
  });

  describe('3 machines, 15 total modules', () => {
    it('should calculate correct average complexity', () => {
      const entries = [
        { id: '1', modules: Array(5).fill({}), rarity: 'common' },
        { id: '2', modules: Array(5).fill({}), rarity: 'rare' },
        { id: '3', modules: Array(5).fill({}), rarity: 'epic' },
      ];
      
      const stats = calculateMockStats(entries);
      
      expect(stats.totalMachines).toBe(3);
      expect(stats.totalModules).toBe(15);
      expect(stats.averageComplexity).toBe(5);
    });
  });

  describe('2 machines with factions', () => {
    it('should calculate correct faction breakdown', () => {
      const entries = [
        { 
          id: '1', 
          modules: [], 
          rarity: 'common',
          attributes: { tags: ['arcane'] }
        },
        { 
          id: '2', 
          modules: [], 
          rarity: 'rare',
          attributes: { tags: ['arcane'] }
        },
        { 
          id: '3', 
          modules: [], 
          rarity: 'epic',
          attributes: { tags: ['temporal'] }
        },
      ];
      
      // Count factions from tags
      const factionDistribution: Record<string, number> = {};
      entries.forEach(entry => {
        const factionTags = entry.attributes.tags.filter((tag: string) =>
          ['arcane', 'void', 'inferno', 'storm', 'stellar', 'temporal', 'dimensional'].includes(tag)
        );
        if (factionTags.length > 0) {
          factionDistribution[factionTags[0]] = (factionDistribution[factionTags[0]] || 0) + 1;
        }
      });
      
      expect(factionDistribution.arcane).toBe(2);
      expect(factionDistribution.temporal).toBe(1);
    });
  });
});

describe('Collection Stats Integration', () => {
  beforeEach(() => {
    // Reset stores
    useCodexStore.setState({ entries: [] });
    useMachineTagsStore.setState({ machineTags: {}, allTags: new Set() });
    useFavoritesStore.setState({ favoriteIds: [] });
  });

  it('should track codex entry count', () => {
    const { addEntry } = useCodexStore.getState();
    
    addEntry('Machine 1', [], [], {
      name: 'Test Machine',
      rarity: 'common',
      stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
      tags: [],
      description: '',
      codexId: 'MC-0001',
    });
    
    const stats = calculateMockStats(useCodexStore.getState().entries);
    expect(stats.totalMachines).toBe(1);
  });

  it('should track favorites count', () => {
    const { addFavorite } = useFavoritesStore.getState();
    
    addFavorite('machine-1');
    addFavorite('machine-2');
    
    expect(useFavoritesStore.getState().getFavoritesCount()).toBe(2);
  });

  it('should track custom tags', () => {
    const { addTag } = useMachineTagsStore.getState();
    
    addTag('machine-1', 'fire-type');
    addTag('machine-1', 'explosive');
    addTag('machine-2', 'fire-type');
    
    expect(useMachineTagsStore.getState().getAllTags().length).toBe(2);
    expect(useMachineTagsStore.getState().getMachinesByTag('fire-type').length).toBe(2);
  });
});
