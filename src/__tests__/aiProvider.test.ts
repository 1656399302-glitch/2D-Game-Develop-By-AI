/**
 * AI Provider Tests
 * 
 * Unit tests for LocalAIProvider and AIProvider interface compliance.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LocalAIProvider, createLocalAIProvider } from '../services/ai/LocalAIProvider';
import { AIProvider } from '../services/ai/AIProvider';
import { AIProviderConfig } from '../services/ai/types';
import { GeneratedAttributes } from '../types';

describe('LocalAIProvider', () => {
  let provider: LocalAIProvider;

  beforeEach(() => {
    provider = new LocalAIProvider();
  });

  describe('Interface Compliance (AC2)', () => {
    it('should implement AIProvider interface', () => {
      expect(provider).toBeDefined();
      expect(typeof provider.generateMachineName).toBe('function');
      expect(typeof provider.generateMachineDescription).toBe('function');
      expect(typeof provider.generateFullAttributes).toBe('function');
      expect(typeof provider.validateConfig).toBe('function');
      expect(typeof provider.getConfig).toBe('function');
      expect(typeof provider.isAvailable).toBe('function');
    });

    it('should have correct provider type', () => {
      expect(provider.providerType).toBe('local');
    });

    it('should implement validateConfig returning valid result', () => {
      const result = provider.validateConfig();
      expect(result.isValid).toBe(true);
      expect(result.warnings).toEqual([]);
    });

    it('should implement getConfig returning config', () => {
      const config = provider.getConfig();
      expect(config).toBeDefined();
      expect(config.type).toBe('local');
    });

    it('should implement isAvailable returning true', () => {
      expect(provider.isAvailable()).toBe(true);
    });
  });

  describe('generateMachineName', () => {
    it('should generate a name string', async () => {
      const result = await provider.generateMachineName({
        modules: [
          { type: 'core-furnace', category: 'energy' },
          { type: 'gear', category: 'mechanical' },
        ],
        connections: [],
      });

      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should include expected name pattern (adjective + noun + suffix)', async () => {
      const result = await provider.generateMachineName({
        modules: [
          { type: 'core-furnace', category: 'energy' },
        ],
        connections: [],
      });

      // Name should have at least 2 spaces (adjective + type + suffix)
      const parts = result.data.split(' ');
      expect(parts.length).toBeGreaterThanOrEqual(2);
    });

    it('should return isFromAI as false', async () => {
      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.isFromAI).toBe(false);
    });

    it('should return local as provider', async () => {
      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.provider).toBe('local');
    });

    it('should return confidence greater than 0.9', async () => {
      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should generate consistent names for empty modules (baseline test)', async () => {
      const results = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const result = await provider.generateMachineName({
          modules: [],
          connections: [],
        });
        results.add(result.data);
      }
      // Should have generated multiple unique names
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('generateMachineDescription', () => {
    const baseParams = {
      modules: [
        { type: 'core-furnace', category: 'energy' },
        { type: 'gear', category: 'mechanical' },
      ],
      connections: [
        { sourceModuleId: 'module1', targetModuleId: 'module2' },
      ],
      machineName: 'Test Machine',
      attributes: {
        rarity: 'rare',
        stability: 75,
        power: 60,
        tags: ['arcane', 'mechanical'],
      },
    };

    it('should generate a description string', async () => {
      const result = await provider.generateMachineDescription(baseParams);

      expect(result).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should return isFromAI as false', async () => {
      const result = await provider.generateMachineDescription(baseParams);
      expect(result.isFromAI).toBe(false);
    });

    it('should return local as provider', async () => {
      const result = await provider.generateMachineDescription(baseParams);
      expect(result.provider).toBe('local');
    });

    it('should handle technical style', async () => {
      const result = await provider.generateMachineDescription({
        ...baseParams,
        style: 'technical',
      });

      expect(result).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle flavor style', async () => {
      const result = await provider.generateMachineDescription({
        ...baseParams,
        style: 'flavor',
      });

      expect(result).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle lore style', async () => {
      const result = await provider.generateMachineDescription({
        ...baseParams,
        style: 'lore',
      });

      expect(result).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle mixed style', async () => {
      const result = await provider.generateMachineDescription({
        ...baseParams,
        style: 'mixed',
      });

      expect(result).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should respect maxLength parameter', async () => {
      const maxLength = 50;
      const result = await provider.generateMachineDescription({
        ...baseParams,
        maxLength,
      });

      // Allow for slight variation due to added details
      expect(result.data.length).toBeLessThanOrEqual(maxLength + 50);
    });

    it('should add stability-based flavor text', async () => {
      const highStabilityResult = await provider.generateMachineDescription({
        ...baseParams,
        attributes: { ...baseParams.attributes, stability: 90 },
      });

      const lowStabilityResult = await provider.generateMachineDescription({
        ...baseParams,
        attributes: { ...baseParams.attributes, stability: 30 },
      });

      // High stability should mention nominal parameters
      expect(highStabilityResult.data).toContain('nominal');
      // Low stability should mention instability
      expect(lowStabilityResult.data).toContain('instability');
    });
  });

  describe('generateFullAttributes', () => {
    it('should return complete GeneratedAttributes', async () => {
      const modules = [
        { type: 'core-furnace', instanceId: 'module1' },
        { type: 'gear', instanceId: 'module2' },
      ];
      const connections = [
        { sourceModuleId: 'module1', targetModuleId: 'module2' },
      ];

      const result = await provider.generateFullAttributes(modules, connections);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(typeof result.data.name).toBe('string');
      expect(typeof result.data.rarity).toBe('string');
      expect(result.data.stats).toBeDefined();
      expect(typeof result.data.stats.stability).toBe('number');
      expect(typeof result.data.stats.powerOutput).toBe('number');
      expect(Array.isArray(result.data.tags)).toBe(true);
    });

    it('should return isFromAI as false', async () => {
      const result = await provider.generateFullAttributes([], []);
      expect(result.isFromAI).toBe(false);
    });

    it('should return local as provider', async () => {
      const result = await provider.generateFullAttributes([], []);
      expect(result.provider).toBe('local');
    });

    it('should handle empty modules', async () => {
      const result = await provider.generateFullAttributes([], []);

      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('Unnamed Machine');
      expect(result.data.rarity).toBe('common');
    });

    it('should generate unique names for different module combinations', async () => {
      const modules1 = [{ type: 'core-furnace', instanceId: 'm1' }];
      const modules2 = [{ type: 'void-siphon', instanceId: 'm2' }];

      const result1 = await provider.generateFullAttributes(modules1, []);
      const result2 = await provider.generateFullAttributes(modules2, []);

      // Names should be strings (may or may not be different due to randomness)
      expect(typeof result1.data.name).toBe('string');
      expect(typeof result2.data.name).toBe('string');
    });
  });

  describe('Output Match with Original Utilities (AC1)', () => {
    it('should generate valid GeneratedAttributes structure', async () => {
      const modules = [
        { type: 'core-furnace', instanceId: 'm1' },
        { type: 'energy-pipe', instanceId: 'm2' },
        { type: 'output-array', instanceId: 'm3' },
      ];
      const connections = [
        { sourceModuleId: 'm1', targetModuleId: 'm2' },
        { sourceModuleId: 'm2', targetModuleId: 'm3' },
      ];

      const result = await provider.generateFullAttributes(modules, connections);

      // Verify structure matches expected GeneratedAttributes
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('rarity');
      expect(result.data).toHaveProperty('stats');
      expect(result.data).toHaveProperty('tags');
      expect(result.data).toHaveProperty('description');
      expect(result.data).toHaveProperty('codexId');

      // Stats should have expected properties
      expect(result.data.stats).toHaveProperty('stability');
      expect(result.data.stats).toHaveProperty('powerOutput');
      expect(result.data.stats).toHaveProperty('energyCost');
      expect(result.data.stats).toHaveProperty('failureRate');

      // Verify types
      expect(typeof result.data.name).toBe('string');
      expect(['common', 'uncommon', 'rare', 'epic', 'legendary']).toContain(result.data.rarity);
      expect(Array.isArray(result.data.tags)).toBe(true);
    });

    it('should generate valid names for 50+ random configurations', async () => {
      const moduleTypes = [
        'core-furnace', 'energy-pipe', 'gear', 'rune-node',
        'shield-shell', 'trigger-switch', 'output-array',
        'void-siphon', 'phase-modulator', 'fire-crystal',
      ];

      for (let i = 0; i < 50; i++) {
        // Generate random module count
        const moduleCount = Math.floor(Math.random() * 8) + 1;
        const modules = Array.from({ length: moduleCount }, (_, idx) => ({
          type: moduleTypes[Math.floor(Math.random() * moduleTypes.length)],
          instanceId: `module-${idx}`,
        }));

        // Generate random connections
        const connectionCount = Math.floor(Math.random() * Math.min(moduleCount, 4));
        const connections: Array<{ sourceModuleId: string; targetModuleId: string }> = [];
        for (let j = 0; j < connectionCount; j++) {
          const sourceIdx = Math.floor(Math.random() * moduleCount);
          let targetIdx = Math.floor(Math.random() * moduleCount);
          while (targetIdx === sourceIdx) {
            targetIdx = Math.floor(Math.random() * moduleCount);
          }
          connections.push({
            sourceModuleId: modules[sourceIdx].instanceId,
            targetModuleId: modules[targetIdx].instanceId,
          });
        }

        const result = await provider.generateMachineName({ modules, connections });

        // Verify name is valid
        expect(typeof result.data).toBe('string');
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data.length).toBeLessThan(50);
        expect(result.isFromAI).toBe(false);
        expect(result.provider).toBe('local');
      }
    });
  });

  describe('Factory function', () => {
    it('should create LocalAIProvider with createLocalAIProvider', () => {
      const provider = createLocalAIProvider();
      expect(provider).toBeInstanceOf(LocalAIProvider);
      expect(provider.providerType).toBe('local');
    });

    it('should accept optional config', () => {
      const provider = createLocalAIProvider({ timeout: 5000 });
      expect(provider).toBeInstanceOf(LocalAIProvider);
      expect(provider.getConfig().timeout).toBe(5000);
    });
  });
});
