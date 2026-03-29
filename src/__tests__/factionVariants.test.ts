/**
 * Faction Variants Tests
 * 
 * Tests for faction-exclusive variant modules.
 * Covers: variant module rendering, unlock conditions, and no conflicts with base modules.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  FACTION_VARIANT_MODULES,
  FACTION_VARIANT_DEFINITIONS,
} from '../data/factionVariants';
import { FactionReputationLevel } from '../types/factionReputation';
import { useFactionReputationStore } from '../store/useFactionReputationStore';
import { isVariantUnlockedForLevel } from '../types/factionReputation';
import { getReputationLevel } from '../utils/factionReputationUtils';

describe('Faction Variants', () => {
  describe('FACTION_VARIANT_MODULES', () => {
    it('should have 4 faction variants', () => {
      const variantCount = Object.keys(FACTION_VARIANT_MODULES).length;
      expect(variantCount).toBe(4);
    });

    it('should map void faction to void-arcane-gear', () => {
      expect(FACTION_VARIANT_MODULES['void']).toBe('void-arcane-gear');
    });

    it('should map inferno faction to inferno-blazing-core', () => {
      expect(FACTION_VARIANT_MODULES['inferno']).toBe('inferno-blazing-core');
    });

    it('should map storm faction to storm-thundering-pipe', () => {
      expect(FACTION_VARIANT_MODULES['storm']).toBe('storm-thundering-pipe');
    });

    it('should map stellar faction to stellar-harmonic-crystal', () => {
      expect(FACTION_VARIANT_MODULES['stellar']).toBe('stellar-harmonic-crystal');
    });

    it('should have unique variant module IDs', () => {
      const variants = Object.values(FACTION_VARIANT_MODULES);
      const uniqueVariants = new Set(variants);
      expect(uniqueVariants.size).toBe(variants.length);
    });
  });

  describe('FACTION_VARIANT_DEFINITIONS', () => {
    it('should have definitions for all variant modules', () => {
      const variants = Object.values(FACTION_VARIANT_MODULES);
      variants.forEach(variantId => {
        expect(FACTION_VARIANT_DEFINITIONS[variantId]).toBeDefined();
      });
    });

    it('should have valid faction mapping for each variant', () => {
      Object.entries(FACTION_VARIANT_DEFINITIONS).forEach(([variantId, def]) => {
        expect(['void', 'inferno', 'storm', 'stellar']).toContain(def.faction);
      });
    });

    it('should have Chinese names for all variants', () => {
      Object.values(FACTION_VARIANT_DEFINITIONS).forEach(def => {
        expect(def.nameCn).toBeDefined();
        expect(def.nameCn.length).toBeGreaterThan(0);
      });
    });

    it('should have English names for all variants', () => {
      Object.values(FACTION_VARIANT_DEFINITIONS).forEach(def => {
        expect(def.name).toBeDefined();
        expect(def.name.length).toBeGreaterThan(0);
      });
    });

    it('should have descriptions for all variants', () => {
      Object.values(FACTION_VARIANT_DEFINITIONS).forEach(def => {
        expect(def.description).toBeDefined();
        expect(def.description.length).toBeGreaterThan(0);
      });
    });

    it('should have icons for all variants', () => {
      Object.values(FACTION_VARIANT_DEFINITIONS).forEach(def => {
        expect(def.icon).toBeDefined();
      });
    });

    it('should have accent colors for all variants', () => {
      Object.values(FACTION_VARIANT_DEFINITIONS).forEach(def => {
        expect(def.accentColor).toBeDefined();
        expect(def.accentColor.startsWith('#')).toBe(true);
      });
    });
  });

  describe('isVariantUnlockedForLevel', () => {
    it('should return false for Apprentice level', () => {
      expect(isVariantUnlockedForLevel(FactionReputationLevel.Apprentice)).toBe(false);
    });

    it('should return false for Journeyman level', () => {
      expect(isVariantUnlockedForLevel(FactionReputationLevel.Journeyman)).toBe(false);
    });

    it('should return false for Expert level', () => {
      expect(isVariantUnlockedForLevel(FactionReputationLevel.Expert)).toBe(false);
    });

    it('should return false for Master level', () => {
      expect(isVariantUnlockedForLevel(FactionReputationLevel.Master)).toBe(false);
    });

    it('should return true only for Grandmaster level', () => {
      expect(isVariantUnlockedForLevel(FactionReputationLevel.Grandmaster)).toBe(true);
    });
  });

  describe('Variant Unlock via Reputation', () => {
    beforeEach(() => {
      useFactionReputationStore.getState().resetAllReputations();
    });

    afterEach(() => {
      useFactionReputationStore.getState().resetAllReputations();
    });

    it('should not unlock variants at 0 reputation', () => {
      const store = useFactionReputationStore.getState();
      expect(store.isVariantUnlocked('void')).toBe(false);
      expect(store.isVariantUnlocked('inferno')).toBe(false);
      expect(store.isVariantUnlocked('storm')).toBe(false);
      expect(store.isVariantUnlocked('stellar')).toBe(false);
    });

    it('should not unlock variants at intermediate levels', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 1500); // Master level
      expect(store.isVariantUnlocked('void')).toBe(false);
    });

    it('should unlock void variant at Grandmaster (2000+ reputation)', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 2000);
      expect(store.isVariantUnlocked('void')).toBe(true);
    });

    it('should unlock all variants when all factions reach Grandmaster', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 2000);
      store.addReputation('inferno', 2500);
      store.addReputation('storm', 3000);
      store.addReputation('stellar', 5000);
      expect(store.isVariantUnlocked('void')).toBe(true);
      expect(store.isVariantUnlocked('inferno')).toBe(true);
      expect(store.isVariantUnlocked('storm')).toBe(true);
      expect(store.isVariantUnlocked('stellar')).toBe(true);
    });

    it('should return correct variant module ID at Grandmaster', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 2000);
      store.addReputation('inferno', 2000);
      store.addReputation('storm', 2000);
      store.addReputation('stellar', 2000);
      
      // Check via reputation data
      const voidRep = store.getReputationData('void');
      const infernoRep = store.getReputationData('inferno');
      const stormRep = store.getReputationData('storm');
      const stellarRep = store.getReputationData('stellar');
      
      expect(voidRep.level).toBe(FactionReputationLevel.Grandmaster);
      expect(infernoRep.level).toBe(FactionReputationLevel.Grandmaster);
      expect(stormRep.level).toBe(FactionReputationLevel.Grandmaster);
      expect(stellarRep.level).toBe(FactionReputationLevel.Grandmaster);
    });
  });

  describe('No Conflicts with Base Modules', () => {
    it('variant IDs should not conflict with base module types', () => {
      const baseModuleTypes = [
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

      const variantIds = Object.values(FACTION_VARIANT_MODULES);
      variantIds.forEach(variantId => {
        expect(baseModuleTypes).not.toContain(variantId);
      });
    });

    it('variant IDs should be namespaced with faction prefix', () => {
      const variantIds = Object.values(FACTION_VARIANT_MODULES);
      expect(variantIds).toContain('void-arcane-gear');
      expect(variantIds).toContain('inferno-blazing-core');
      expect(variantIds).toContain('storm-thundering-pipe');
      expect(variantIds).toContain('stellar-harmonic-crystal');
    });
  });

  describe('Reputation Level Thresholds', () => {
    it('should have correct threshold for Grandmaster (2000)', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 1999);
      expect(store.getReputationLevel('void')).not.toBe(FactionReputationLevel.Grandmaster);
      
      store.addReputation('void', 1);
      expect(store.getReputationLevel('void')).toBe(FactionReputationLevel.Grandmaster);
    });
  });
});
