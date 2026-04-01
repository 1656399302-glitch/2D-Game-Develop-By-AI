/**
 * Faction System Tests
 * 
 * Tests for faction tech tree, node unlocking, and faction-related functionality.
 * 
 * Updated: Round 80 faction names - Void Abyss, Molten Star Forge, Thunder Phase, etc.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  FACTIONS, 
  FactionId, 
  TechTreeNode, 
  TECH_TREE_REQUIREMENTS,
  generateTechTreeNodes,
  MODULE_TO_FACTION,
  NEUTRAL_MODULES
} from '../types/factions';
import { useFactionStore } from '../store/useFactionStore';

describe('Faction Definitions', () => {
  // Updated: 6 factions in Round 80
  it('should have exactly 6 factions', () => {
    expect(Object.keys(FACTIONS)).toHaveLength(6);
  });

  // Updated: Faction names changed in Round 80
  it('should have void faction', () => {
    const voidFaction = FACTIONS.void;
    expect(voidFaction.id).toBe('void');
    expect(voidFaction.name).toBe('Void Abyss');
    expect(voidFaction.nameCn).toBe('虚空深渊');
    expect(voidFaction.color).toBe('#7B2FBE');
  });

  it('should have inferno faction', () => {
    const infernoFaction = FACTIONS.inferno;
    expect(infernoFaction.id).toBe('inferno');
    expect(infernoFaction.name).toBe('Molten Star Forge');
    expect(infernoFaction.nameCn).toBe('熔星锻造');
    expect(infernoFaction.color).toBe('#E85D04');
  });

  it('should have storm faction', () => {
    const stormFaction = FACTIONS.storm;
    expect(stormFaction.id).toBe('storm');
    expect(stormFaction.name).toBe('Thunder Phase');
    expect(stormFaction.nameCn).toBe('雷霆相位');
    expect(stormFaction.color).toBe('#48CAE4');
  });

  it('should have stellar faction', () => {
    const stellarFaction = FACTIONS.stellar;
    expect(stellarFaction.id).toBe('stellar');
    expect(stellarFaction.name).toBe('Stellar');
    expect(stellarFaction.nameCn).toBe('星辉派系');
    expect(stellarFaction.color).toBe('#fbbf24');
  });

  // NEW: Test new factions in Round 80
  it('should have arcane faction', () => {
    const arcaneFaction = FACTIONS.arcane;
    expect(arcaneFaction.id).toBe('arcane');
    expect(arcaneFaction.name).toBe('Arcane Order');
    expect(arcaneFaction.nameCn).toBeDefined();
    expect(arcaneFaction.color).toBe('#3A0CA3');
  });

  it('should have chaos faction', () => {
    const chaosFaction = FACTIONS.chaos;
    expect(chaosFaction.id).toBe('chaos');
    expect(chaosFaction.name).toBe('Chaos Disorder');
    expect(chaosFaction.nameCn).toBeDefined();
    expect(chaosFaction.color).toBe('#9D0208');
  });

  it('each faction should have required properties', () => {
    (Object.keys(FACTIONS) as FactionId[]).forEach(factionId => {
      const faction = FACTIONS[factionId];
      expect(faction.id).toBe(factionId);
      expect(faction.name).toBeDefined();
      expect(faction.nameCn).toBeDefined();
      expect(faction.description).toBeDefined();
      expect(faction.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(faction.secondaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(faction.glowColor).toBeDefined();
      expect(faction.icon).toBeDefined();
      expect(Array.isArray(faction.moduleTypes)).toBe(true);
    });
  });

  it('each faction should have at least 2 module types', () => {
    (Object.keys(FACTIONS) as FactionId[]).forEach(factionId => {
      const faction = FACTIONS[factionId];
      expect(faction.moduleTypes.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('Tech Tree Requirements', () => {
  it('should have requirements for 3 tiers', () => {
    expect(TECH_TREE_REQUIREMENTS[1]).toBeDefined();
    expect(TECH_TREE_REQUIREMENTS[2]).toBeDefined();
    expect(TECH_TREE_REQUIREMENTS[3]).toBeDefined();
  });

  it('tier requirements should increase', () => {
    expect(TECH_TREE_REQUIREMENTS[1]).toBeLessThan(TECH_TREE_REQUIREMENTS[2]);
    expect(TECH_TREE_REQUIREMENTS[2]).toBeLessThan(TECH_TREE_REQUIREMENTS[3]);
  });

  it('tier 1 requires 3 machines', () => {
    expect(TECH_TREE_REQUIREMENTS[1]).toBe(3);
  });

  it('tier 2 requires 7 machines', () => {
    expect(TECH_TREE_REQUIREMENTS[2]).toBe(7);
  });

  it('tier 3 requires 15 machines', () => {
    expect(TECH_TREE_REQUIREMENTS[3]).toBe(15);
  });
});

describe('Tech Tree Node Generation', () => {
  // Updated: 6 factions in Round 80
  const emptyCounts: Record<FactionId, number> = {
    void: 0,
    inferno: 0,
    storm: 0,
    stellar: 0,
    arcane: 0,
    chaos: 0,
  };

  // Updated: 18 nodes (6 factions x 3 tiers)
  it('should generate 18 nodes (6 factions x 3 tiers)', () => {
    const nodes = generateTechTreeNodes(emptyCounts);
    expect(nodes).toHaveLength(18);
  });

  it('should have 3 tiers per faction', () => {
    (Object.keys(FACTIONS) as FactionId[]).forEach(factionId => {
      const nodes = generateTechTreeNodes(emptyCounts);
      const factionNodes = nodes.filter(n => n.faction === factionId);
      expect(factionNodes).toHaveLength(3);
    });
  });

  it('should have correct tier values', () => {
    const nodes = generateTechTreeNodes(emptyCounts);
    const tierValues = nodes.map(n => n.tier);
    expect(tierValues).toContain(1);
    expect(tierValues).toContain(2);
    expect(tierValues).toContain(3);
  });

  it('should unlock nodes based on faction counts', () => {
    const counts: Record<FactionId, number> = {
      void: 5,
      inferno: 0,
      storm: 0,
      stellar: 0,
      arcane: 0,
      chaos: 0,
    };
    
    const nodes = generateTechTreeNodes(counts);
    
    // Void should have tier 1 unlocked (5 >= 3)
    const voidTier1 = nodes.find(n => n.faction === 'void' && n.tier === 1);
    expect(voidTier1?.isUnlocked).toBe(true);
    
    // Void tier 2 should not be unlocked (5 < 7)
    const voidTier2 = nodes.find(n => n.faction === 'void' && n.tier === 2);
    expect(voidTier2?.isUnlocked).toBe(false);
    
    // Other factions should not have tier 1 unlocked
    const infernoTier1 = nodes.find(n => n.faction === 'inferno' && n.tier === 1);
    expect(infernoTier1?.isUnlocked).toBe(false);
  });

  it('should unlock tier 2 when count >= 7', () => {
    const counts: Record<FactionId, number> = {
      void: 10,
      inferno: 0,
      storm: 0,
      stellar: 0,
      arcane: 0,
      chaos: 0,
    };
    
    const nodes = generateTechTreeNodes(counts);
    
    const voidTier1 = nodes.find(n => n.faction === 'void' && n.tier === 1);
    const voidTier2 = nodes.find(n => n.faction === 'void' && n.tier === 2);
    const voidTier3 = nodes.find(n => n.faction === 'void' && n.tier === 3);
    
    expect(voidTier1?.isUnlocked).toBe(true);
    expect(voidTier2?.isUnlocked).toBe(true);
    expect(voidTier3?.isUnlocked).toBe(false); // 10 < 15
  });

  it('should unlock tier 3 when count >= 15', () => {
    const counts: Record<FactionId, number> = {
      void: 20,
      inferno: 0,
      storm: 0,
      stellar: 0,
      arcane: 0,
      chaos: 0,
    };
    
    const nodes = generateTechTreeNodes(counts);
    
    const voidTier3 = nodes.find(n => n.faction === 'void' && n.tier === 3);
    expect(voidTier3?.isUnlocked).toBe(true);
  });

  it('should have correct unlock requirements', () => {
    const nodes = generateTechTreeNodes(emptyCounts);
    
    const tier1Nodes = nodes.filter(n => n.tier === 1);
    const tier2Nodes = nodes.filter(n => n.tier === 2);
    const tier3Nodes = nodes.filter(n => n.tier === 3);
    
    tier1Nodes.forEach(node => {
      expect(node.unlockRequirement).toBe(TECH_TREE_REQUIREMENTS[1]);
    });
    
    tier2Nodes.forEach(node => {
      expect(node.unlockRequirement).toBe(TECH_TREE_REQUIREMENTS[2]);
    });
    
    tier3Nodes.forEach(node => {
      expect(node.unlockRequirement).toBe(TECH_TREE_REQUIREMENTS[3]);
    });
  });

  it('each node should have unique ID', () => {
    const nodes = generateTechTreeNodes(emptyCounts);
    const ids = nodes.map(n => n.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('each node should have position data', () => {
    const nodes = generateTechTreeNodes(emptyCounts);
    nodes.forEach(node => {
      expect(node.position).toBeDefined();
      expect(typeof node.position.row).toBe('number');
      expect(typeof node.position.col).toBe('number');
    });
  });
});

describe('Module to Faction Mapping', () => {
  it('void-siphon should map to void faction', () => {
    expect(MODULE_TO_FACTION['void-siphon']).toBe('void');
  });

  it('phase-modulator should map to void faction', () => {
    expect(MODULE_TO_FACTION['phase-modulator']).toBe('void');
  });

  it('fire-crystal should map to inferno faction', () => {
    expect(MODULE_TO_FACTION['fire-crystal']).toBe('inferno');
  });

  it('core-furnace should map to inferno faction', () => {
    expect(MODULE_TO_FACTION['core-furnace']).toBe('inferno');
  });

  it('lightning-conductor should map to storm faction', () => {
    expect(MODULE_TO_FACTION['lightning-conductor']).toBe('storm');
  });

  it('energy-pipe should map to storm faction', () => {
    expect(MODULE_TO_FACTION['energy-pipe']).toBe('storm');
  });

  it('amplifier-crystal should map to stellar faction', () => {
    expect(MODULE_TO_FACTION['amplifier-crystal']).toBe('stellar');
  });

  it('resonance-chamber should map to stellar faction', () => {
    expect(MODULE_TO_FACTION['resonance-chamber']).toBe('stellar');
  });

  // NEW: Test arcane and chaos module mappings
  it('arcane-matrix-grid should map to arcane faction', () => {
    expect(MODULE_TO_FACTION['arcane-matrix-grid']).toBe('arcane');
  });

  it('temporal-distorter should map to chaos faction', () => {
    expect(MODULE_TO_FACTION['temporal-distorter']).toBe('chaos');
  });
});

describe('Neutral Modules', () => {
  it('should have neutral modules list', () => {
    expect(NEUTRAL_MODULES).toBeDefined();
    expect(Array.isArray(NEUTRAL_MODULES)).toBe(true);
  });

  // Updated: rune-node is no longer neutral (it's arcane faction in Round 80)
  it('should include common modules in neutral list', () => {
    expect(NEUTRAL_MODULES).toContain('gear');
    expect(NEUTRAL_MODULES).toContain('shield-shell');
    expect(NEUTRAL_MODULES).toContain('trigger-switch');
    expect(NEUTRAL_MODULES).toContain('output-array');
    expect(NEUTRAL_MODULES).toContain('stabilizer-core');
  });
});

describe('Faction Store', () => {
  beforeEach(() => {
    // Reset store - Updated: 6 factions in Round 80
    useFactionStore.setState({
      factionCounts: {
        void: 0,
        inferno: 0,
        storm: 0,
        stellar: 0,
        arcane: 0,
        chaos: 0,
      },
    });
  });

  it('should have initial zero counts for all 6 factions', () => {
    const { factionCounts } = useFactionStore.getState();
    expect(factionCounts.void).toBe(0);
    expect(factionCounts.inferno).toBe(0);
    expect(factionCounts.storm).toBe(0);
    expect(factionCounts.stellar).toBe(0);
    expect(factionCounts.arcane).toBe(0);
    expect(factionCounts.chaos).toBe(0);
  });

  it('should have getTechTreeNodes function', () => {
    const { getTechTreeNodes } = useFactionStore.getState();
    expect(typeof getTechTreeNodes).toBe('function');
  });

  // Updated: 18 nodes (6 factions x 3 tiers)
  it('getTechTreeNodes should return 18 nodes', () => {
    const { getTechTreeNodes } = useFactionStore.getState();
    const nodes = getTechTreeNodes();
    expect(nodes).toHaveLength(18);
  });

  it('should update faction count', () => {
    const store = useFactionStore.getState();
    
    useFactionStore.setState({
      factionCounts: {
        ...store.factionCounts,
        void: 5,
      },
    });
    
    const { factionCounts } = useFactionStore.getState();
    expect(factionCounts.void).toBe(5);
  });

  it('should calculate correct unlock status based on counts', () => {
    useFactionStore.setState({
      factionCounts: {
        void: 8,
        inferno: 2,
        storm: 4,
        stellar: 10,
        arcane: 0,
        chaos: 0,
      },
    });
    
    const { getTechTreeNodes } = useFactionStore.getState();
    const nodes = getTechTreeNodes();
    
    // Void: 8 >= 3 (tier 1), 8 >= 7 (tier 2), 8 < 15 (tier 3)
    const voidNodes = nodes.filter(n => n.faction === 'void');
    expect(voidNodes.find(n => n.tier === 1)?.isUnlocked).toBe(true);
    expect(voidNodes.find(n => n.tier === 2)?.isUnlocked).toBe(true);
    expect(voidNodes.find(n => n.tier === 3)?.isUnlocked).toBe(false);
    
    // Stellar: 10 >= 3 (tier 1), 10 >= 7 (tier 2), 10 < 15 (tier 3)
    const stellarNodes = nodes.filter(n => n.faction === 'stellar');
    expect(stellarNodes.find(n => n.tier === 1)?.isUnlocked).toBe(true);
    expect(stellarNodes.find(n => n.tier === 2)?.isUnlocked).toBe(true);
    expect(stellarNodes.find(n => n.tier === 3)?.isUnlocked).toBe(false);
  });
});
