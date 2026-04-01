import { describe, it, expect } from 'vitest';
import { calculateFaction, getFactionCounts, getFactionConfig, isModuleInFaction } from '../utils/factionCalculator';
import { PlacedModule } from '../store/useMachineStore';

describe('factionCalculator', () => {
  describe('calculateFaction', () => {
    it('returns void for void-siphon module', () => {
      const modules: PlacedModule[] = [
        {
          id: 'test-1',
          instanceId: 'inst-1',
          type: 'void-siphon',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      expect(calculateFaction(modules)).toBe('void');
    });
    
    it('returns void for phase-modulator module', () => {
      const modules: PlacedModule[] = [
        {
          id: 'test-1',
          instanceId: 'inst-1',
          type: 'phase-modulator',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      expect(calculateFaction(modules)).toBe('void');
    });
    
    it('returns inferno for fire-crystal module', () => {
      const modules: PlacedModule[] = [
        {
          id: 'test-1',
          instanceId: 'inst-1',
          type: 'fire-crystal',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      expect(calculateFaction(modules)).toBe('inferno');
    });
    
    it('returns inferno for core-furnace module', () => {
      const modules: PlacedModule[] = [
        {
          id: 'test-1',
          instanceId: 'inst-1',
          type: 'core-furnace',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      expect(calculateFaction(modules)).toBe('inferno');
    });
    
    it('returns storm for lightning-conductor module', () => {
      const modules: PlacedModule[] = [
        {
          id: 'test-1',
          instanceId: 'inst-1',
          type: 'lightning-conductor',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      expect(calculateFaction(modules)).toBe('storm');
    });
    
    it('returns storm for energy-pipe module', () => {
      const modules: PlacedModule[] = [
        {
          id: 'test-1',
          instanceId: 'inst-1',
          type: 'energy-pipe',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      expect(calculateFaction(modules)).toBe('storm');
    });
    
    it('returns stellar for amplifier-crystal module', () => {
      const modules: PlacedModule[] = [
        {
          id: 'test-1',
          instanceId: 'inst-1',
          type: 'amplifier-crystal',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      expect(calculateFaction(modules)).toBe('stellar');
    });
    
    it('returns stellar for resonance-chamber module', () => {
      const modules: PlacedModule[] = [
        {
          id: 'test-1',
          instanceId: 'inst-1',
          type: 'resonance-chamber',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      expect(calculateFaction(modules)).toBe('stellar');
    });
    
    it('returns null for neutral modules only', () => {
      const modules: PlacedModule[] = [
        {
          id: 'test-1',
          instanceId: 'inst-1',
          type: 'gear',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
        {
          id: 'test-2',
          instanceId: 'inst-2',
          type: 'shield-shell',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [],
        },
      ];
      
      expect(calculateFaction(modules)).toBeNull();
    });
    
    it('returns the faction with most modules', () => {
      const modules: PlacedModule[] = [
        { id: '1', instanceId: 'i1', type: 'void-siphon', x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] },
        { id: '2', instanceId: 'i2', type: 'void-siphon', x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] },
        { id: '3', instanceId: 'i3', type: 'fire-crystal', x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] },
      ];
      
      expect(calculateFaction(modules)).toBe('void');
    });
    
    it('returns first faction alphabetically when tied', () => {
      const modules: PlacedModule[] = [
        { id: '1', instanceId: 'i1', type: 'void-siphon', x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] },
        { id: '2', instanceId: 'i2', type: 'fire-crystal', x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] },
      ];
      
      // void comes before inferno alphabetically
      expect(calculateFaction(modules)).toBe('void');
    });
    
    it('returns null for empty array', () => {
      expect(calculateFaction([])).toBeNull();
    });
  });
  
  describe('getFactionCounts', () => {
    // Updated: 6 factions in Round 80
    it('counts modules per faction', () => {
      const modules: PlacedModule[] = [
        { id: '1', instanceId: 'i1', type: 'void-siphon', x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] },
        { id: '2', instanceId: 'i2', type: 'fire-crystal', x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] },
        { id: '3', instanceId: 'i3', type: 'void-siphon', x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] },
        { id: '4', instanceId: 'i4', type: 'gear', x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] },
      ];
      
      const counts = getFactionCounts(modules);
      
      expect(counts.void).toBe(2);
      expect(counts.inferno).toBe(1);
      expect(counts.storm).toBe(0);
      expect(counts.stellar).toBe(0);
      expect(counts.arcane).toBe(0);
      expect(counts.chaos).toBe(0);
    });
    
    // Updated: 6 factions in Round 80
    it('returns zeros for empty array', () => {
      const counts = getFactionCounts([]);
      
      expect(counts.void).toBe(0);
      expect(counts.inferno).toBe(0);
      expect(counts.storm).toBe(0);
      expect(counts.stellar).toBe(0);
      expect(counts.arcane).toBe(0);
      expect(counts.chaos).toBe(0);
    });
  });
  
  describe('getFactionConfig', () => {
    // Updated: Faction names changed in Round 80
    it('returns config for valid faction', () => {
      const config = getFactionConfig('void');
      
      expect(config).not.toBeNull();
      expect(config?.id).toBe('void');
      expect(config?.name).toBe('Void Abyss'); // Updated in Round 80
      expect(config?.nameCn).toBe('虚空深渊');
    });
    
    it('returns null for invalid faction', () => {
      const config = getFactionConfig('invalid' as any);
      
      expect(config).toBeNull();
    });
  });
  
  describe('isModuleInFaction', () => {
    it('returns true for void-siphon in void faction', () => {
      expect(isModuleInFaction('void-siphon', 'void')).toBe(true);
    });
    
    it('returns true for fire-crystal in inferno faction', () => {
      expect(isModuleInFaction('fire-crystal', 'inferno')).toBe(true);
    });
    
    it('returns true for lightning-conductor in storm faction', () => {
      expect(isModuleInFaction('lightning-conductor', 'storm')).toBe(true);
    });
    
    it('returns true for amplifier-crystal in stellar faction', () => {
      expect(isModuleInFaction('amplifier-crystal', 'stellar')).toBe(true);
    });
    
    // Updated: 6 factions in Round 80
    it('returns false for neutral module', () => {
      expect(isModuleInFaction('gear', 'void')).toBe(false);
      expect(isModuleInFaction('gear', 'inferno')).toBe(false);
      expect(isModuleInFaction('gear', 'storm')).toBe(false);
      expect(isModuleInFaction('gear', 'stellar')).toBe(false);
      expect(isModuleInFaction('gear', 'arcane')).toBe(false);
      expect(isModuleInFaction('gear', 'chaos')).toBe(false);
    });

    // NEW: Test arcane and chaos modules
    it('returns true for arcane-matrix-grid in arcane faction', () => {
      expect(isModuleInFaction('arcane-matrix-grid', 'arcane')).toBe(true);
    });
    
    it('returns true for temporal-distorter in chaos faction', () => {
      expect(isModuleInFaction('temporal-distorter', 'chaos')).toBe(true);
    });
  });
});
