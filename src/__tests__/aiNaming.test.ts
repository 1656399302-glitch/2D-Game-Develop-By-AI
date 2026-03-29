import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MockAIService,
  getAIService,
  setAIService,
  AINameRequest,
  AINameResponse,
  AIMachineContext,
} from '../types/aiIntegration';

// Mock delay helper
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('AI Naming Service', () => {
  describe('MockAIService', () => {
    let aiService: MockAIService;
    
    beforeEach(() => {
      aiService = new MockAIService();
    });
    
    it('should generate a name with correct structure', async () => {
      const request: AINameRequest = {
        context: {
          modules: [
            { type: 'coreFurnace', category: 'energy', connections: 2 },
            { type: 'amplifierCrystal', category: 'amplification', connections: 1 },
          ],
          connections: 3,
        },
        style: 'mixed',
        language: 'mixed',
        maxLength: 20,
      };
      
      const response = await aiService.generateName(request);
      
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('confidence');
      expect(typeof response.name).toBe('string');
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });
    
    it('should generate name within maxLength', async () => {
      const maxLength = 15;
      const request: AINameRequest = {
        context: {
          modules: [{ type: 'coreFurnace', category: 'energy', connections: 1 }],
          connections: 1,
        },
        style: 'arcane',
        language: 'zh',
        maxLength,
      };
      
      const response = await aiService.generateName(request);
      
      expect(response.name.length).toBeLessThanOrEqual(maxLength);
    });
    
    it('should include alternatives when available', async () => {
      const request: AINameRequest = {
        context: {
          modules: [{ type: 'voidSiphon', category: 'void', connections: 2 }],
          connections: 2,
        },
        style: 'mechanical',
      };
      
      const response = await aiService.generateName(request);
      
      expect(response).toHaveProperty('alternatives');
      if (response.alternatives) {
        expect(Array.isArray(response.alternatives)).toBe(true);
        expect(response.alternatives.length).toBeGreaterThanOrEqual(0);
      }
    });
    
    it('should be available immediately (mock service)', () => {
      expect(aiService.isAvailable()).toBe(true);
    });
    
    it('should return correct provider config', () => {
      const config = aiService.getConfig();
      
      expect(config).toHaveProperty('provider');
      expect(config.provider).toBe('mock');
    });
  });
  
  describe('getAIService singleton', () => {
    it('should return the same instance', () => {
      const service1 = getAIService();
      const service2 = getAIService();
      
      expect(service1).toBe(service2);
    });
    
    it('should return a mock service by default', () => {
      const service = getAIService();
      
      expect(service).toBeInstanceOf(MockAIService);
    });
    
    it('should allow setting a custom service', () => {
      const customService = new MockAIService({ provider: 'openai' });
      setAIService(customService);
      
      const service = getAIService();
      
      expect(service.getConfig().provider).toBe('openai');
    });
  });
  
  describe('AI Name Request validation', () => {
    it('should accept valid name request', async () => {
      const request: AINameRequest = {
        context: {
          modules: [],
          connections: 0,
        },
        style: 'arcane',
        language: 'zh',
        maxLength: 20,
      };
      
      const response = await getAIService().generateName(request);
      
      expect(response).toBeDefined();
      expect(typeof response.name).toBe('string');
    });
    
    it('should handle empty modules gracefully', async () => {
      const request: AINameRequest = {
        context: {
          modules: [],
          connections: 0,
        },
        style: 'mixed',
      };
      
      const response = await getAIService().generateName(request);
      
      expect(response).toHaveProperty('name');
      expect(response.name.length).toBeGreaterThan(0);
    });
    
    it('should handle all style options', async () => {
      const styles: Array<'arcane' | 'mechanical' | 'mixed' | 'poetic'> = [
        'arcane', 'mechanical', 'mixed', 'poetic'
      ];
      
      for (const style of styles) {
        const request: AINameRequest = {
          context: {
            modules: [{ type: 'gear', category: 'mechanical', connections: 1 }],
            connections: 1,
          },
          style,
        };
        
        const response = await getAIService().generateName(request);
        
        expect(response.name).toBeDefined();
      }
    });
  });
  
  describe('AI Name Response structure', () => {
    it('should always have a name field', async () => {
      const request: AINameRequest = {
        context: { modules: [], connections: 0 },
      };
      
      const response = await getAIService().generateName(request);
      
      expect('name' in response).toBe(true);
      expect(response.name.length).toBeGreaterThan(0);
    });
    
    it('should always have a confidence score', async () => {
      const request: AINameRequest = {
        context: { modules: [], connections: 0 },
      };
      
      const response = await getAIService().generateName(request);
      
      expect('confidence' in response).toBe(true);
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });
  });
  
  describe('AIMachineContext', () => {
    it('should accept valid machine context', async () => {
      const context: AIMachineContext = {
        modules: [
          { type: 'coreFurnace', category: 'energy', connections: 2 },
          { type: 'voidSiphon', category: 'void', connections: 1 },
          { type: 'gear', category: 'mechanical', connections: 3 },
        ],
        connections: 6,
        existingTags: ['fire', 'void', 'mechanical'],
        faction: 'void',
        rarity: 'rare',
      };
      
      const request: AINameRequest = { context };
      const response = await getAIService().generateName(request);
      
      expect(response.name).toBeDefined();
    });
    
    it('should handle context with faction information', async () => {
      const context: AIMachineContext = {
        modules: [{ type: 'fireCrystal', category: 'fire', connections: 1 }],
        connections: 1,
        faction: 'inferno',
      };
      
      const request: AINameRequest = { context };
      const response = await getAIService().generateName(request);
      
      expect(response.name).toBeDefined();
    });
    
    it('should handle context with rarity', async () => {
      const context: AIMachineContext = {
        modules: [{ type: 'coreFurnace', category: 'energy', connections: 5 }],
        connections: 10,
        rarity: 'legendary',
      };
      
      const request: AINameRequest = { context };
      const response = await getAIService().generateName(request);
      
      expect(response.name).toBeDefined();
    });
  });
});

describe('AI Assistant Panel Integration', () => {
  describe('Name Style Labels', () => {
    it('should have labels for all name styles', async () => {
      const { NAME_STYLE_LABELS } = await import('../components/AI/AIAssistantPanel');
      
      expect(NAME_STYLE_LABELS.arcane).toBeDefined();
      expect(NAME_STYLE_LABELS.mechanical).toBeDefined();
      expect(NAME_STYLE_LABELS.mixed).toBeDefined();
      expect(NAME_STYLE_LABELS.poetic).toBeDefined();
    });
    
    it('should have correct Chinese labels', async () => {
      const { NAME_STYLE_LABELS } = await import('../components/AI/AIAssistantPanel');
      
      expect(NAME_STYLE_LABELS.arcane).toBe('神秘符文');
      expect(NAME_STYLE_LABELS.mechanical).toBe('机械工程');
      expect(NAME_STYLE_LABELS.mixed).toBe('混合风格');
      expect(NAME_STYLE_LABELS.poetic).toBe('诗意浪漫');
    });
  });
  
  describe('Component rendering', () => {
    it('should render AIAssistantPanel without errors', async () => {
      const { AIAssistantPanel } = await import('../components/AI/AIAssistantPanel');
      
      expect(AIAssistantPanel).toBeDefined();
    });
  });
});
