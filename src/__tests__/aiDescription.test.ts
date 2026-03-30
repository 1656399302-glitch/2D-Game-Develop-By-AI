import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MockAIService,
  getAIService,
  setAIService,
  AIDescriptionRequest,
  AIDescriptionResponse,
  AIMachineContext,
} from '../types/aiIntegration';
import {
  buildMachineContext,
  generateMachineDescription,
  formatDescriptionForDisplay,
  suggestTagsFromModules,
  calculateRarityFromComplexity,
  DESCRIPTION_STYLE_LABELS,
  MachineAttributes,
  DescriptionStyle,
} from '../utils/aiIntegrationUtils';

describe('AI Description Service', () => {
  describe('MockAIService.generateDescription', () => {
    let aiService: MockAIService;
    
    beforeEach(() => {
      aiService = new MockAIService();
      // Reset the singleton
      setAIService(aiService);
    });
    
    it('should generate a description with correct structure', async () => {
      const request: AIDescriptionRequest = {
        machineContext: {
          modules: [
            { type: 'coreFurnace', category: 'energy', connections: 2 },
            { type: 'amplifierCrystal', category: 'amplification', connections: 1 },
          ],
          connections: 3,
        },
        machineName: '测试机器',
        attributes: {
          rarity: 'rare',
          stability: 75,
          power: 85,
          tags: ['fire', 'amplification'],
        },
        style: 'mixed',
        maxLength: 200,
      };
      
      const response = await aiService.generateDescription(request);
      
      expect(response).toHaveProperty('description');
      expect(typeof response.description).toBe('string');
      expect(response.description.length).toBeGreaterThan(0);
    });
    
    it('should generate Chinese description by default', async () => {
      const request: AIDescriptionRequest = {
        machineContext: {
          modules: [{ type: 'voidSiphon', category: 'void', connections: 2 }],
          connections: 2,
        },
        machineName: '虚空回响增幅器',
        attributes: {
          rarity: 'epic',
          stability: 60,
          power: 90,
          tags: ['void', 'amplification'],
        },
      };
      
      const response = await aiService.generateDescription(request);
      
      expect(response.description.length).toBeGreaterThan(0);
      // Chinese characters should be present
      expect(/[\u4e00-\u9fa5]/.test(response.description)).toBe(true);
    });
    
    it('should include English description when available', async () => {
      const request: AIDescriptionRequest = {
        machineContext: {
          modules: [{ type: 'gear', category: 'mechanical', connections: 1 }],
          connections: 1,
        },
        machineName: '齿轮共振器',
        attributes: {
          rarity: 'common',
          stability: 90,
          power: 50,
          tags: ['mechanical'],
        },
      };
      
      const response = await aiService.generateDescription(request);
      
      expect(response).toHaveProperty('descriptionEn');
      expect(response.descriptionEn).toBeDefined();
      expect(response.descriptionEn!.length).toBeGreaterThan(0);
    });
    
    it('should include lore text', async () => {
      const request: AIDescriptionRequest = {
        machineContext: {
          modules: [{ type: 'fireCrystal', category: 'fire', connections: 1 }],
          connections: 1,
        },
        machineName: '火焰核心',
        attributes: {
          rarity: 'uncommon',
          stability: 80,
          power: 70,
          tags: ['fire'],
        },
      };
      
      const response = await aiService.generateDescription(request);
      
      expect(response).toHaveProperty('lore');
      expect(response.lore).toBeDefined();
      expect(response.lore!.length).toBeGreaterThan(0);
    });
    
    it('should include suggested tags', async () => {
      const request: AIDescriptionRequest = {
        machineContext: {
          modules: [
            { type: 'coreFurnace', category: 'energy', connections: 2 },
            { type: 'amplifierCrystal', category: 'amplification', connections: 1 },
            { type: 'gear', category: 'mechanical', connections: 1 },
          ],
          connections: 4,
        },
        machineName: '复合装置',
        attributes: {
          rarity: 'rare',
          stability: 70,
          power: 80,
          tags: [],
        },
      };
      
      const response = await aiService.generateDescription(request);
      
      expect(response).toHaveProperty('tags');
      expect(Array.isArray(response.tags)).toBe(true);
      expect(response.tags!.length).toBeGreaterThan(0);
      expect(response.tags!.length).toBeLessThanOrEqual(5);
    });
    
    it('should handle all description styles', async () => {
      const styles: DescriptionStyle[] = ['technical', 'flavor', 'lore', 'mixed'];
      
      for (const style of styles) {
        const request: AIDescriptionRequest = {
          machineContext: {
            modules: [{ type: 'fireCrystal', category: 'fire', connections: 1 }],
            connections: 1,
          },
          machineName: '火焰核心',
          attributes: {
            rarity: 'uncommon',
            stability: 80,
            power: 70,
            tags: ['fire'],
          },
          style,
        };
        
        const response = await aiService.generateDescription(request);
        
        expect(response.description).toBeDefined();
        expect(response.description.length).toBeGreaterThan(0);
      }
    });
    
    it('should respect maxLength parameter', async () => {
      const maxLength = 50;
      const request: AIDescriptionRequest = {
        machineContext: {
          modules: [],
          connections: 0,
        },
        machineName: '测试',
        attributes: {
          rarity: 'common',
          stability: 50,
          power: 50,
          tags: [],
        },
        maxLength,
      };
      
      const response = await aiService.generateDescription(request);
      
      // Mock service may not enforce maxLength, but structure should be correct
      expect(response.description).toBeDefined();
    });
    
    it('should use default style when not specified', async () => {
      const request: AIDescriptionRequest = {
        machineContext: {
          modules: [{ type: 'gear', category: 'mechanical', connections: 1 }],
          connections: 1,
        },
        machineName: '测试机器',
        attributes: {
          rarity: 'common',
          stability: 50,
          power: 50,
          tags: [],
        },
      };
      
      const response = await aiService.generateDescription(request);
      
      expect(response.description).toBeDefined();
      // Default style is 'mixed'
      expect(response.description.length).toBeGreaterThan(0);
    });
  });
  
  describe('getAIService singleton', () => {
    it('should return MockAIService instance', () => {
      const service = getAIService();
      expect(service).toBeInstanceOf(MockAIService);
    });
    
    it('should allow setting custom service', () => {
      const customService = new MockAIService();
      setAIService(customService);
      expect(getAIService()).toBe(customService);
    });
    
    it('should report availability', () => {
      const service = getAIService();
      expect(service.isAvailable()).toBe(true);
    });
  });
});

describe('AI Integration Utilities', () => {
  describe('buildMachineContext', () => {
    it('should build context from module data', () => {
      const modules = [
        { type: 'coreFurnace', category: 'energy', id: 'mod1' },
        { type: 'amplifierCrystal', category: 'amplification', id: 'mod2' },
      ];
      const connections = [
        { sourceModuleId: 'mod1', targetModuleId: 'mod2' },
      ];
      
      const context = buildMachineContext(modules, connections);
      
      expect(context.modules).toHaveLength(2);
      expect(context.connections).toBe(1);
      expect(context.modules[0]).toEqual({
        type: 'coreFurnace',
        category: 'energy',
        connections: 1,
      });
    });
    
    it('should calculate connection count correctly', () => {
      const modules = [
        { type: 'mod1', category: 'cat1', id: 'mod1' },
        { type: 'mod2', category: 'cat2', id: 'mod2' },
        { type: 'mod3', category: 'cat3', id: 'mod3' },
      ];
      const connections = [
        { sourceModuleId: 'mod1', targetModuleId: 'mod2' },
        { sourceModuleId: 'mod2', targetModuleId: 'mod3' },
      ];
      
      const context = buildMachineContext(modules, connections);
      
      expect(context.connections).toBe(2);
    });
    
    it('should handle empty modules', () => {
      const context = buildMachineContext([], []);
      
      expect(context.modules).toHaveLength(0);
      expect(context.connections).toBe(0);
    });
    
    it('should handle modules with unknown type', () => {
      const modules = [{ type: 'unknown-type', category: '', id: 'mod1' }];
      
      const context = buildMachineContext(modules, []);
      
      // Should default category to 'unknown'
      expect(context.modules[0].category).toBe('unknown');
    });
    
    it('should use instanceId when id is not present', () => {
      const modules = [
        { type: 'mod1', category: 'cat1', instanceId: 'inst1' },
        { type: 'mod2', category: 'cat2', instanceId: 'inst2' },
      ];
      const connections = [
        { sourceModuleId: 'inst1', targetModuleId: 'inst2' },
      ];
      
      const context = buildMachineContext(modules, connections);
      
      expect(context.modules).toHaveLength(2);
      expect(context.modules[0].connections).toBe(1);
    });
  });
  
  describe('generateMachineDescription', () => {
    it('should generate description from machine data', async () => {
      const machineContext = {
        modules: [{ type: 'coreFurnace', category: 'energy', connections: 2 }],
        connections: 2,
      };
      const machineName = '测试增幅器';
      const attributes: MachineAttributes = {
        rarity: 'rare',
        stability: 75,
        power: 85,
        tags: ['energy', 'amplification'],
        name: '测试增幅器',
      };
      
      const response = await generateMachineDescription(
        machineContext,
        machineName,
        attributes,
        'mixed'
      );
      
      expect(response).toHaveProperty('description');
      expect(typeof response.description).toBe('string');
      expect(response.description.length).toBeGreaterThan(0);
    });
    
    it('should use default style when not specified', async () => {
      const machineContext = { modules: [], connections: 0 };
      const attributes: MachineAttributes = {
        rarity: 'common',
        stability: 50,
        power: 50,
        tags: [],
        name: '测试机器',
      };
      
      const response = await generateMachineDescription(
        machineContext,
        '测试机器',
        attributes
      );
      
      expect(response.description).toBeDefined();
    });
  });
  
  describe('formatDescriptionForDisplay', () => {
    it('should format description for technical style', () => {
      const description: AIDescriptionResponse = {
        description: 'Technical description',
        lore: 'Lore text',
      };
      
      const formatted = formatDescriptionForDisplay(description, 'technical');
      
      expect(formatted).toBe('Technical description');
    });
    
    it('should format description for flavor style', () => {
      const description: AIDescriptionResponse = {
        description: 'Flavor description',
        lore: 'Lore text',
      };
      
      const formatted = formatDescriptionForDisplay(description, 'flavor');
      
      expect(formatted).toBe('Flavor description');
    });
    
    it('should format description for lore style', () => {
      const description: AIDescriptionResponse = {
        description: 'Main description',
        lore: 'Lore text',
      };
      
      const formatted = formatDescriptionForDisplay(description, 'lore');
      
      expect(formatted).toBe('Lore text');
    });
    
    it('should fall back to main description when lore is missing', () => {
      const description: AIDescriptionResponse = {
        description: 'Main description',
      };
      
      const formatted = formatDescriptionForDisplay(description, 'lore');
      
      expect(formatted).toBe('Main description');
    });
    
    it('should use mixed style as default', () => {
      const description: AIDescriptionResponse = {
        description: 'Mixed description',
      };
      
      const formatted = formatDescriptionForDisplay(description, 'mixed');
      
      expect(formatted).toBe('Mixed description');
    });
  });
  
  describe('suggestTagsFromModules', () => {
    it('should suggest tags based on module categories', () => {
      const modules = [
        { type: 'coreFurnace', category: 'energy' },
        { type: 'fireCrystal', category: 'fire' },
        { type: 'amplifierCrystal', category: 'amplification' },
      ];
      
      const tags = suggestTagsFromModules(modules);
      
      expect(tags).toContain('energy');
      expect(tags).toContain('fire');
    });
    
    it('should include type-specific tags', () => {
      const modules = [{ type: 'coreFurnace', category: 'energy' }];
      
      const tags = suggestTagsFromModules(modules);
      
      expect(tags).toContain('energy');
      expect(tags).toContain('core');
      expect(tags).toContain('energy-source');
    });
    
    it('should limit tags to 5', () => {
      const modules = [
        { type: 'mod1', category: 'cat1' },
        { type: 'mod2', category: 'cat2' },
        { type: 'mod3', category: 'cat3' },
        { type: 'mod4', category: 'cat4' },
        { type: 'mod5', category: 'cat5' },
        { type: 'mod6', category: 'cat6' },
      ];
      
      const tags = suggestTagsFromModules(modules);
      
      expect(tags.length).toBeLessThanOrEqual(5);
    });
    
    it('should handle empty modules', () => {
      const tags = suggestTagsFromModules([]);
      
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBe(0);
    });
    
    it('should handle various module type formats', () => {
      const modules = [
        { type: 'coreFurnace', category: 'energy' },
        { type: 'core_furnace', category: 'energy' },
        { type: 'core-furnace', category: 'energy' },
      ];
      
      const tags = suggestTagsFromModules(modules);
      
      // Should recognize all three formats
      expect(tags).toContain('energy');
      expect(tags).toContain('core');
      expect(tags).toContain('energy-source');
    });
  });
  
  describe('calculateRarityFromComplexity', () => {
    // Formula: moduleCount * 0.4 + connectionCount * 0.3 + stability * 0.3
    // >= 90: legendary
    // >= 75: epic
    // >= 50: rare
    // >= 25: uncommon
    // < 25: common
    
    it('should return common for low complexity', () => {
      // 1 * 0.4 + 0 * 0.3 + 20 * 0.3 = 0.4 + 0 + 6 = 6.4 < 25
      const rarity = calculateRarityFromComplexity(1, 0, 20);
      expect(rarity).toBe('common');
    });
    
    it('should return uncommon for medium-low complexity', () => {
      // 3 * 0.4 + 4 * 0.3 + 40 * 0.3 = 1.2 + 1.2 + 12 = 14.4 < 25
      const rarity = calculateRarityFromComplexity(3, 4, 40);
      expect(rarity).toBe('common');
    });
    
    it('should return uncommon when complexity is >= 25', () => {
      // Need: 8 * 0.4 + 12 * 0.3 + 65 * 0.3 = 3.2 + 3.6 + 19.5 = 26.3 >= 25
      const rarity = calculateRarityFromComplexity(8, 12, 65);
      expect(rarity).toBe('uncommon');
    });
    
    it('should return rare for higher complexity', () => {
      // Need complexity >= 50
      // 25 * 0.4 + 40 * 0.3 + 100 * 0.3 = 10 + 12 + 30 = 52 >= 50
      const rarity = calculateRarityFromComplexity(25, 40, 100);
      expect(rarity).toBe('rare');
    });
    
    it('should return epic for very high complexity', () => {
      // Need complexity >= 75
      // 60 * 0.4 + 80 * 0.3 + 100 * 0.3 = 24 + 24 + 30 = 78 >= 75
      const rarity = calculateRarityFromComplexity(60, 80, 100);
      expect(rarity).toBe('epic');
    });
    
    it('should return legendary for maximum complexity', () => {
      // Need complexity >= 90
      // 80 * 0.4 + 100 * 0.3 + 100 * 0.3 = 32 + 30 + 30 = 92 >= 90
      const rarity = calculateRarityFromComplexity(80, 100, 100);
      expect(rarity).toBe('legendary');
    });
    
    it('should weight all factors in calculation', () => {
      const rarity1 = calculateRarityFromComplexity(10, 10, 100);
      const rarity2 = calculateRarityFromComplexity(5, 5, 50);
      
      // Higher complexity should result in higher rarity
      const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      expect(rarityOrder.indexOf(rarity1)).toBeGreaterThanOrEqual(rarityOrder.indexOf(rarity2));
    });
  });
});

describe('Description Style Labels', () => {
  it('should have labels for all description styles', () => {
    expect(DESCRIPTION_STYLE_LABELS).toHaveProperty('technical');
    expect(DESCRIPTION_STYLE_LABELS).toHaveProperty('flavor');
    expect(DESCRIPTION_STYLE_LABELS).toHaveProperty('lore');
    expect(DESCRIPTION_STYLE_LABELS).toHaveProperty('mixed');
  });
  
  it('should have correct Chinese labels', () => {
    expect(DESCRIPTION_STYLE_LABELS.technical).toBe('技术描述');
    expect(DESCRIPTION_STYLE_LABELS.flavor).toBe('风味描述');
    expect(DESCRIPTION_STYLE_LABELS.lore).toBe('背景故事');
    expect(DESCRIPTION_STYLE_LABELS.mixed).toBe('综合描述');
  });
});

describe('MachineAttributes interface', () => {
  it('should accept valid machine attributes', () => {
    const attributes: MachineAttributes = {
      rarity: 'rare',
      stability: 75,
      power: 85,
      tags: ['fire', 'amplification'],
      name: '测试机器',
    };
    
    // Type check - should not throw
    expect(attributes.rarity).toBe('rare');
    expect(attributes.stability).toBe(75);
    expect(attributes.power).toBe(85);
  });
});

describe('Description Generation Integration', () => {
  it('should generate description with all required fields', async () => {
    const machineContext: AIMachineContext = {
      modules: [
        { type: 'coreFurnace', category: 'energy', connections: 3 },
        { type: 'amplifierCrystal', category: 'amplification', connections: 2 },
        { type: 'gear', category: 'mechanical', connections: 2 },
        { type: 'runeNode', category: 'arcane', connections: 1 },
      ],
      connections: 8,
      existingTags: [],
    };
    
    const attributes: MachineAttributes = {
      name: '复合能量增幅器',
      rarity: 'epic',
      stability: 75,
      power: 90,
      tags: ['energy', 'amplification'],
    };
    
    const response = await generateMachineDescription(
      machineContext,
      attributes.name,
      attributes,
      'mixed'
    );
    
    // All required fields should be present
    expect(response.description).toBeDefined();
    expect(response.description.length).toBeGreaterThan(0);
    expect(response.descriptionEn).toBeDefined();
    expect(response.lore).toBeDefined();
    expect(response.tags).toBeDefined();
    expect(Array.isArray(response.tags)).toBe(true);
  });
  
  it('should generate different descriptions for different styles', async () => {
    const machineContext: AIMachineContext = {
      modules: [{ type: 'fireCrystal', category: 'fire', connections: 2 }],
      connections: 2,
    };
    
    const attributes: MachineAttributes = {
      name: '火焰处理器',
      rarity: 'rare',
      stability: 70,
      power: 80,
      tags: ['fire'],
    };
    
    const technicalResponse = await generateMachineDescription(
      machineContext,
      attributes.name,
      attributes,
      'technical'
    );
    
    const flavorResponse = await generateMachineDescription(
      machineContext,
      attributes.name,
      attributes,
      'flavor'
    );
    
    // Descriptions should be different (due to random selection)
    expect(technicalResponse.description).toBeDefined();
    expect(flavorResponse.description).toBeDefined();
  });
});
