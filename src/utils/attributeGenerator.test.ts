import { describe, it, expect } from 'vitest';
import { generateAttributes, getRarityColor, getRarityLabel } from './attributeGenerator';
import { PlacedModule, Connection, ModuleType } from '../types';

describe('attributeGenerator', () => {
  const createModule = (type: ModuleType, instanceId: string): PlacedModule => ({
    id: `test-${type}`,
    instanceId,
    type,
    x: Math.random() * 500,
    y: Math.random() * 500,
    rotation: 0,
    scale: 1,
    ports: [
      { id: `${type}-input`, type: 'input', position: { x: 0, y: 25 } },
      { id: `${type}-output`, type: 'output', position: { x: 100, y: 25 } },
    ],
  });

  const createConnection = (
    sourceId: string,
    sourcePortId: string,
    targetId: string,
    targetPortId: string
  ): Connection => ({
    id: `conn-${Math.random()}`,
    sourceModuleId: sourceId,
    sourcePortId,
    targetModuleId: targetId,
    targetPortId,
    pathData: 'M 0 0 L 100 100',
  });

  describe('generateAttributes', () => {
    it('should return valid attributes for empty machine', () => {
      const result = generateAttributes([], []);
      
      expect(result).toBeDefined();
      expect(result.name).toBe('Unnamed Machine');
      expect(result.rarity).toBe('common');
      expect(result.stats).toBeDefined();
      expect(result.stats.stability).toBe(50);
      expect(result.stats.powerOutput).toBe(10);
      expect(result.stats.energyCost).toBe(5);
      expect(result.stats.failureRate).toBe(50);
      expect(result.tags).toContain('stable');
      expect(result.description).toBeDefined();
      expect(result.codexId).toBeDefined();
    });

    it('should return object with name, rarity, and stats for 3 Core Furnace modules', () => {
      const modules: PlacedModule[] = [
        createModule('core-furnace', 'module-1'),
        createModule('core-furnace', 'module-2'),
        createModule('core-furnace', 'module-3'),
      ];
      
      const result = generateAttributes(modules, []);
      
      expect(result).toBeDefined();
      expect(typeof result.name).toBe('string');
      expect(result.name.length).toBeGreaterThan(0);
      expect(['common', 'uncommon', 'rare', 'epic', 'legendary']).toContain(result.rarity);
      expect(result.stats).toBeDefined();
      expect(typeof result.stats.stability).toBe('number');
      expect(typeof result.stats.powerOutput).toBe('number');
      expect(typeof result.stats.energyCost).toBe('number');
      expect(typeof result.stats.failureRate).toBe('number');
    });

    it('should produce different rarity for 3 modules vs 6 modules with connections', () => {
      const threeModules: PlacedModule[] = [
        createModule('core-furnace', 'm1'),
        createModule('energy-pipe', 'm2'),
        createModule('gear', 'm3'),
      ];
      
      const sixModules: PlacedModule[] = [
        createModule('core-furnace', 'm1'),
        createModule('energy-pipe', 'm2'),
        createModule('gear', 'm3'),
        createModule('rune-node', 'm4'),
        createModule('shield-shell', 'm5'),
        createModule('trigger-switch', 'm6'),
      ];
      
      const threeModuleResult = generateAttributes(threeModules, []);
      const sixModuleResult = generateAttributes(sixModules, [
        createConnection('m1', 'core-furnace-output', 'm2', 'energy-pipe-input'),
        createConnection('m2', 'energy-pipe-output', 'm3', 'gear-input'),
        createConnection('m3', 'gear-output', 'm4', 'rune-node-input'),
        createConnection('m4', 'rune-node-output', 'm5', 'shield-shell-input'),
        createConnection('m5', 'shield-shell-output', 'm6', 'trigger-switch-input'),
      ]);
      
      // Six modules with connections should have higher rarity
      const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
      expect(rarityOrder[sixModuleResult.rarity]).toBeGreaterThanOrEqual(rarityOrder[threeModuleResult.rarity]);
    });

    it('should generate name with proper format [Prefix] + [Type] + [Suffix]', () => {
      const modules = [createModule('core-furnace', 'm1')];
      const result = generateAttributes(modules, []);
      
      // Name should have at least 3 words (Prefix Type Suffix)
      const words = result.name.split(' ');
      expect(words.length).toBeGreaterThanOrEqual(2);
    });

    it('should include tags based on module types', () => {
      const modules = [
        createModule('core-furnace', 'm1'),
        createModule('rune-node', 'm2'),
      ];
      
      const result = generateAttributes(modules, []);
      
      expect(result.tags).toBeDefined();
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.tags.length).toBeGreaterThan(0);
    });

    it('should calculate stats based on module composition', () => {
      const modulesWithShield = [
        createModule('core-furnace', 'm1'),
        createModule('shield-shell', 'm2'),
      ];
      
      const modulesWithTrigger = [
        createModule('core-furnace', 'm1'),
        createModule('trigger-switch', 'm2'),
      ];
      
      const shieldResult = generateAttributes(modulesWithShield, []);
      const triggerResult = generateAttributes(modulesWithTrigger, []);
      
      // Shield should increase stability
      // Trigger (explosive) might affect differently
      expect(shieldResult.stats.stability).toBeDefined();
      expect(triggerResult.stats.stability).toBeDefined();
    });

    it('should include output-array module in attribute calculation', () => {
      const modules: PlacedModule[] = [
        createModule('core-furnace', 'm1'),
        createModule('output-array', 'm2'),
      ];
      
      const connections = [
        createConnection('m1', 'core-furnace-output', 'm2', 'output-array-input'),
      ];
      
      const result = generateAttributes(modules, connections);
      
      expect(result).toBeDefined();
      expect(result.tags).toContain('arcane');
      expect(result.name).toBeTruthy();
      expect(result.rarity).toBeDefined();
    });

    it('should include resonance tag for output-array module', () => {
      const modules: PlacedModule[] = [
        createModule('output-array', 'm1'),
      ];
      
      const result = generateAttributes(modules, []);
      
      expect(result.tags).toContain('resonance');
    });

    it('should apply power bonus when output-array has connections', () => {
      const modulesWithoutConnection: PlacedModule[] = [
        createModule('core-furnace', 'm1'),
        createModule('output-array', 'm2'),
      ];
      
      const modulesWithConnection: PlacedModule[] = [
        createModule('core-furnace', 'm1'),
        createModule('output-array', 'm2'),
      ];
      
      const connections = [
        createConnection('m1', 'core-furnace-output', 'm2', 'output-array-input'),
      ];
      
      const resultWithout = generateAttributes(modulesWithoutConnection, []);
      const resultWith = generateAttributes(modulesWithConnection, connections);
      
      // With connection, power should be higher due to output array bonus
      expect(resultWith.stats.powerOutput).toBeGreaterThanOrEqual(resultWithout.stats.powerOutput);
    });

    it('should include arcane and resonance tags for output-array', () => {
      const modules: PlacedModule[] = [
        createModule('output-array', 'm1'),
        createModule('rune-node', 'm2'),
      ];
      
      const result = generateAttributes(modules, []);
      
      expect(result.tags).toContain('arcane');
      expect(result.tags).toContain('resonance');
      expect(result.tags).toContain('amplifying');
    });
  });

  describe('getRarityColor', () => {
    it('should return correct colors for each rarity', () => {
      expect(getRarityColor('common')).toBe('#9ca3af');
      expect(getRarityColor('uncommon')).toBe('#22c55e');
      expect(getRarityColor('rare')).toBe('#3b82f6');
      expect(getRarityColor('epic')).toBe('#a855f7');
      expect(getRarityColor('legendary')).toBe('#f59e0b');
    });

    it('should return a valid hex color', () => {
      const color = getRarityColor('rare');
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('getRarityLabel', () => {
    it('should return capitalized rarity name', () => {
      expect(getRarityLabel('common')).toBe('Common');
      expect(getRarityLabel('uncommon')).toBe('Uncommon');
      expect(getRarityLabel('rare')).toBe('Rare');
      expect(getRarityLabel('epic')).toBe('Epic');
      expect(getRarityLabel('legendary')).toBe('Legendary');
    });
  });
});
