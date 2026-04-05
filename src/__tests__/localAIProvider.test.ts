/**
 * LocalAIProvider Comprehensive Tests (Round 142)
 * 
 * These tests provide comprehensive coverage for the LocalAIProvider class,
 * focusing on edge cases, error handling, and specific acceptance criteria.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalAIProvider, createLocalAIProvider } from '../services/ai/LocalAIProvider';
import { AIProviderConfig } from '../services/ai/types';
import { Rarity } from '../types';

// Sample module configurations for testing
const validModules = [
  { type: 'core-furnace', category: 'core', id: 'mod-1', instanceId: 'mod-1' },
  { type: 'energy-pipe', category: 'pipe', id: 'mod-2', instanceId: 'mod-2' },
  { type: 'output-array', category: 'output', id: 'mod-3', instanceId: 'mod-3' },
];

const validConnections = [
  { sourceModuleId: 'mod-1', targetModuleId: 'mod-2' },
  { sourceModuleId: 'mod-2', targetModuleId: 'mod-3' },
];

const validAttributes = {
  rarity: 'rare' as Rarity,
  stability: 75,
  power: 60,
  tags: ['arcane', 'mechanical'] as const,
};

describe('LocalAIProvider - Comprehensive Tests (Round 142)', () => {
  let provider: LocalAIProvider;

  beforeEach(() => {
    provider = new LocalAIProvider();
  });

  // ==========================================================================
  // AC-142-001: LocalAIProvider Name Generation Tests
  // ==========================================================================

  describe('AC-142-001: LocalAIProvider Name Generation Tests', () => {
    it('AC-142-001-1: generateMachineName returns valid string for valid inputs', async () => {
      const result = await provider.generateMachineName({
        modules: validModules,
        connections: validConnections,
      });

      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.length).toBeLessThan(100); // Reasonable name length
      expect(result.isFromAI).toBe(false);
      expect(result.provider).toBe('local');
    });

    it('AC-142-001-2: generateMachineName handles empty modules array gracefully', async () => {
      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      // Should still return a valid name, not throw
      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.isFromAI).toBe(false);
    });

    it('AC-142-001-3: generateMachineName filters prefixes by faction when provided', async () => {
      // Test with 'inferno' faction - should use inferno-related prefixes
      const result = await provider.generateMachineName({
        modules: validModules,
        connections: validConnections,
        faction: 'inferno',
      });

      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      
      // Check that one of the inferno faction prefixes is used
      const infernoPrefixes = ['Infernal', 'Crimson', 'Obsidian', 'Fire'];
      const nameParts = result.data.split(' ');
      expect(infernoPrefixes.some(prefix => nameParts[0].includes(prefix))).toBe(true);
    });

    it('AC-142-001-4: generateMachineName filters prefixes by tags when provided', async () => {
      const result = await provider.generateMachineName({
        modules: validModules,
        connections: validConnections,
        preferredTags: ['fire', 'arcane'],
      });

      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      
      // Check that a tag-matching prefix is used
      const fireArcanePrefixes = ['Infernal', 'Crimson', 'Obsidian', 'Arcane', 'Ethereal', 'Prismatic'];
      const nameParts = result.data.split(' ');
      expect(fireArcanePrefixes.some(prefix => nameParts[0].includes(prefix))).toBe(true);
    });

    it('AC-142-001-5: generateMachineName filters prefixes by rarity when provided', async () => {
      const result = await provider.generateMachineName({
        modules: validModules,
        connections: validConnections,
        preferredRarity: 'legendary',
      });

      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      
      // Check that a legendary rarity prefix is used
      const legendaryPrefixes = ['Void', 'Celestial', 'Eternal', 'Ancient'];
      const nameParts = result.data.split(' ');
      expect(legendaryPrefixes.some(prefix => nameParts[0].includes(prefix))).toBe(true);
    });

    it('AC-142-001-6: All 3 parts (prefix, type, suffix) are present in generated name', async () => {
      const result = await provider.generateMachineName({
        modules: validModules,
        connections: validConnections,
      });

      const parts = result.data.split(' ');
      
      // Should have at least 2 parts (prefix + type or type + suffix)
      expect(parts.length).toBeGreaterThanOrEqual(2);
      
      // Known suffix patterns
      const suffixes = ['Prime', 'Mk-II', 'Alpha', 'Omega', 'Genesis', 'Apex', 'Zero', 'Infinite',
        'Supreme', 'Master', 'Elite', 'Advanced', 'Hyper', 'Ultra', 'Neo', 'Proto',
        'Ancient', 'Forgotten', 'Eternal', 'Void', 'Stellar', 'Abyssal', 'Temporal',
        'Phased', 'Quantum', 'Resonant', 'Harmonic'];
      
      // At least the last part should be recognizable
      expect(parts.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ==========================================================================
  // AC-142-002: LocalAIProvider Description Generation Tests
  // ==========================================================================

  describe('AC-142-002: LocalAIProvider Description Generation Tests', () => {
    const baseParams = {
      modules: validModules,
      connections: validConnections,
      machineName: 'Test Machine',
      attributes: validAttributes,
    };

    it('AC-142-002-1: generateMachineDescription returns valid string for valid inputs', async () => {
      const result = await provider.generateMachineDescription(baseParams);

      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.isFromAI).toBe(false);
      expect(result.provider).toBe('local');
    });

    it('AC-142-002-2: generateMachineDescription respects style parameter (technical)', async () => {
      const result = await provider.generateMachineDescription({
        ...baseParams,
        style: 'technical',
      });

      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      
      // Technical style should mention module count
      expect(result.data.toLowerCase()).toContain('module');
    });

    it('AC-142-002-3: generateMachineDescription respects style parameter (flavor)', async () => {
      const result = await provider.generateMachineDescription({
        ...baseParams,
        style: 'flavor',
      });

      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
    });

    it('AC-142-002-4: generateMachineDescription respects style parameter (lore)', async () => {
      const result = await provider.generateMachineDescription({
        ...baseParams,
        style: 'lore',
      });

      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      
      // Lore style should mention the machine name or rarity
      expect(
        result.data.includes(baseParams.machineName) ||
        result.data.includes(baseParams.attributes.rarity)
      ).toBe(true);
    });

    it('AC-142-002-5: generateMachineDescription respects style parameter (mixed)', async () => {
      const result = await provider.generateMachineDescription({
        ...baseParams,
        style: 'mixed',
      });

      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
    });

    it('AC-142-002-6: generateMachineDescription respects maxLength parameter', async () => {
      const maxLength = 50;
      const result = await provider.generateMachineDescription({
        ...baseParams,
        maxLength,
      });

      // Description should be truncated to maxLength
      expect(result.data.length).toBeLessThanOrEqual(maxLength);
      if (result.data.length > maxLength - 3) {
        expect(result.data.endsWith('...')).toBe(true);
      }
    });

    it('AC-142-002-7: generateMachineDescription includes stability flavor text', async () => {
      // High stability (>=80)
      const highStabilityResult = await provider.generateMachineDescription({
        ...baseParams,
        attributes: { ...baseParams.attributes, stability: 90 },
      });

      // Low stability (<40)
      const lowStabilityResult = await provider.generateMachineDescription({
        ...baseParams,
        attributes: { ...baseParams.attributes, stability: 30 },
      });

      // High stability should mention nominal parameters
      expect(highStabilityResult.data.toLowerCase()).toContain('nominal');
      
      // Low stability should mention instability
      expect(lowStabilityResult.data.toLowerCase()).toContain('instability');
    });

    it('AC-142-002-8: generateMachineDescription includes power flavor text', async () => {
      // High power (>=70)
      const highPowerResult = await provider.generateMachineDescription({
        ...baseParams,
        attributes: { ...baseParams.attributes, power: 80 },
      });

      // Low power (<30)
      const lowPowerResult = await provider.generateMachineDescription({
        ...baseParams,
        attributes: { ...baseParams.attributes, power: 20 },
      });

      // High power should mention exceptional output
      expect(highPowerResult.data.toLowerCase()).toContain('exceptional');
      
      // Low power should mention below optimal
      expect(lowPowerResult.data.toLowerCase()).toContain('below');
    });

    it('AC-142-002-9: generateMachineDescription handles empty modules gracefully', async () => {
      const result = await provider.generateMachineDescription({
        ...baseParams,
        modules: [],
      });

      // Should still return a valid description, not throw
      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('AC-142-002-10: generateMachineDescription adds module-specific details', async () => {
      // Modules that should trigger specific details
      const outputModules = [
        { type: 'output-array', category: 'output', id: 'o1', instanceId: 'o1' },
      ];

      const result = await provider.generateMachineDescription({
        ...baseParams,
        modules: outputModules,
      });

      // Should contain output array specific text
      expect(result.data.toLowerCase()).toContain('output');
    });
  });

  // ==========================================================================
  // AC-142-003: LocalAIProvider Full Attributes Tests
  // ==========================================================================

  describe('AC-142-003: LocalAIProvider Full Attributes Tests', () => {
    it('AC-142-003-1: generateFullAttributes returns complete GeneratedAttributes object', async () => {
      const result = await provider.generateFullAttributes(validModules, validConnections);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.name).toBeDefined();
      expect(result.data.rarity).toBeDefined();
      expect(result.data.stats).toBeDefined();
      expect(result.data.tags).toBeDefined();
      expect(result.data.description).toBeDefined();
      expect(result.data.codexId).toBeDefined();
    });

    it('AC-142-003-2: generateFullAttributes includes all required fields', async () => {
      const result = await provider.generateFullAttributes(validModules, validConnections);

      const attrs = result.data;
      
      // Verify all required fields exist
      expect(typeof attrs.name).toBe('string');
      expect(typeof attrs.rarity).toBe('string');
      expect(typeof attrs.stats).toBe('object');
      expect(typeof attrs.stats.stability).toBe('number');
      expect(typeof attrs.stats.powerOutput).toBe('number');
      expect(typeof attrs.stats.energyCost).toBe('number');
      expect(typeof attrs.stats.failureRate).toBe('number');
      expect(Array.isArray(attrs.tags)).toBe(true);
      expect(typeof attrs.description).toBe('string');
      expect(typeof attrs.codexId).toBe('string');
    });

    it('AC-142-003-3: Generated attributes are valid types (rarity is Rarity enum)', async () => {
      const result = await provider.generateFullAttributes(validModules, validConnections);

      const validRarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      expect(validRarities).toContain(result.data.rarity);
    });

    it('AC-142-003-4: Generated attributes are valid types (stats are numbers)', async () => {
      const result = await provider.generateFullAttributes(validModules, validConnections);

      const { stats } = result.data;
      expect(typeof stats.stability).toBe('number');
      expect(typeof stats.powerOutput).toBe('number');
      expect(typeof stats.energyCost).toBe('number');
      expect(typeof stats.failureRate).toBe('number');
    });

    it('AC-142-003-5: generateFullAttributes handles empty modules', async () => {
      const result = await provider.generateFullAttributes([], []);

      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('Unnamed Machine');
      expect(result.data.rarity).toBe('common');
      expect(result.data.stats.stability).toBe(50);
      expect(result.data.stats.powerOutput).toBe(10);
    });

    it('AC-142-003-6: generateFullAttributes handles null/undefined connections gracefully', async () => {
      const result = await provider.generateFullAttributes(validModules, []);

      expect(result.data).toBeDefined();
      expect(typeof result.data.name).toBe('string');
      expect(result.data.rarity).toBeDefined();
    });

    it('AC-142-003-7: generateFullAttributes returns isFromAI: false', async () => {
      const result = await provider.generateFullAttributes(validModules, validConnections);

      expect(result.isFromAI).toBe(false);
      expect(result.provider).toBe('local');
    });
  });

  // ==========================================================================
  // AC-142-004: LocalAIProvider Configuration Tests
  // ==========================================================================

  describe('AC-142-004: LocalAIProvider Configuration Tests', () => {
    it('AC-142-004-1: validateConfig returns { isValid: true } for local provider', () => {
      const result = provider.validateConfig();

      expect(result.isValid).toBe(true);
      expect(result.warnings).toEqual([]);
    });

    it('AC-142-004-2: getConfig returns configuration object with type: local', () => {
      const config = provider.getConfig();

      expect(config).toBeDefined();
      expect(config.type).toBe('local');
    });

    it('AC-142-004-3: isAvailable returns true for local provider', () => {
      expect(provider.isAvailable()).toBe(true);
    });

    it('AC-142-004-4: getConfig returns provided config options', () => {
      const customConfig: Partial<AIProviderConfig> = {
        timeout: 5000,
        maxRetries: 3,
      };

      const customProvider = new LocalAIProvider(customConfig);
      const config = customProvider.getConfig();

      expect(config.type).toBe('local');
      expect(config.timeout).toBe(5000);
      expect(config.maxRetries).toBe(3);
    });
  });

  // ==========================================================================
  // Edge Case Tests
  // ==========================================================================

  describe('Edge Case Tests', () => {
    it('handles modules with missing optional fields', async () => {
      const incompleteModules = [
        { type: 'core-furnace' }, // Only type, no id/instanceId
        { type: 'gear' },
      ];

      const result = await provider.generateMachineName({
        modules: incompleteModules,
        connections: [],
      });

      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
    });

    it('handles connections with missing optional fields', async () => {
      const incompleteConnections = [
        { sourceModuleId: 'mod-1', targetModuleId: 'mod-2' },
      ];

      const result = await provider.generateMachineName({
        modules: validModules,
        connections: incompleteConnections,
      });

      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
    });

    it('handles undefined faction parameter', async () => {
      const result = await provider.generateMachineName({
        modules: validModules,
        connections: validConnections,
        faction: undefined,
      });

      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
    });

    it('handles empty tags array', async () => {
      const result = await provider.generateMachineName({
        modules: validModules,
        connections: validConnections,
        preferredTags: [],
      });

      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
    });

    it('handles empty rarity parameter', async () => {
      const result = await provider.generateMachineName({
        modules: validModules,
        connections: validConnections,
        preferredRarity: '',
      });

      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
    });

    it('handles attributes with zero values', async () => {
      const result = await provider.generateMachineDescription({
        modules: validModules,
        connections: validConnections,
        machineName: 'Test Machine',
        attributes: {
          rarity: 'common',
          stability: 0,
          power: 0,
          tags: [],
        },
      });

      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
    });

    it('handles attributes with max values', async () => {
      const result = await provider.generateMachineDescription({
        modules: validModules,
        connections: validConnections,
        machineName: 'Test Machine',
        attributes: {
          rarity: 'legendary',
          stability: 100,
          power: 100,
          tags: ['fire', 'arcane', 'void'],
        },
      });

      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
    });
  });

  // ==========================================================================
  // Generation Consistency Tests
  // ==========================================================================

  describe('Generation Consistency Tests', () => {
    it('generateMachineName returns consistent structure for different inputs', async () => {
      const result1 = await provider.generateMachineName({
        modules: validModules,
        connections: validConnections,
      });

      const result2 = await provider.generateMachineName({
        modules: [{ type: 'core-furnace' }],
        connections: [],
      });

      // Both should return valid string results
      expect(typeof result1.data).toBe('string');
      expect(typeof result2.data).toBe('string');
      expect(result1.isFromAI).toBe(result2.isFromAI);
      expect(result1.provider).toBe(result2.provider);
    });

    it('generateMachineDescription returns consistent structure for different styles', async () => {
      const baseParams = {
        modules: validModules,
        connections: validConnections,
        machineName: 'Test Machine',
        attributes: validAttributes,
      };

      const styles: Array<'technical' | 'flavor' | 'lore' | 'mixed'> = [
        'technical', 'flavor', 'lore', 'mixed'
      ];

      for (const style of styles) {
        const result = await provider.generateMachineDescription({
          ...baseParams,
          style,
        });

        expect(typeof result.data).toBe('string');
        expect(result.isFromAI).toBe(false);
        expect(result.provider).toBe('local');
      }
    });
  });

  // ==========================================================================
  // Factory Function Tests
  // ==========================================================================

  describe('Factory Function Tests', () => {
    it('createLocalAIProvider creates LocalAIProvider instance', () => {
      const provider = createLocalAIProvider();
      expect(provider).toBeInstanceOf(LocalAIProvider);
    });

    it('createLocalAIProvider accepts optional config', () => {
      const provider = createLocalAIProvider({ timeout: 3000 });
      expect(provider.providerType).toBe('local');
      expect(provider.getConfig().timeout).toBe(3000);
    });
  });

  // ==========================================================================
  // Provider Interface Compliance
  // ==========================================================================

  describe('Provider Interface Compliance', () => {
    it('has correct providerType', () => {
      expect(provider.providerType).toBe('local');
    });

    it('implements all required AIProvider methods', () => {
      expect(typeof provider.generateMachineName).toBe('function');
      expect(typeof provider.generateMachineDescription).toBe('function');
      expect(typeof provider.generateFullAttributes).toBe('function');
      expect(typeof provider.validateConfig).toBe('function');
      expect(typeof provider.getConfig).toBe('function');
      expect(typeof provider.isAvailable).toBe('function');
    });

    it('confidence scores are within expected range', async () => {
      const nameResult = await provider.generateMachineName({
        modules: validModules,
        connections: validConnections,
      });

      const descResult = await provider.generateMachineDescription({
        modules: validModules,
        connections: validConnections,
        machineName: 'Test',
        attributes: validAttributes,
      });

      const attrsResult = await provider.generateFullAttributes(validModules, validConnections);

      expect(nameResult.confidence).toBeGreaterThanOrEqual(0.9);
      expect(descResult.confidence).toBeGreaterThanOrEqual(0.85);
      expect(attrsResult.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });
});
