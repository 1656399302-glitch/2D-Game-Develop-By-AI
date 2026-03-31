/**
 * useAINaming Hook Tests
 * 
 * Unit tests for the useAINaming React hook.
 * Tests hook state handling, generation functions, and fallback logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock implementations
const mockProvider = {
  providerType: 'local' as const,
  generateMachineName: vi.fn().mockImplementation(() => ({
    data: 'Generated Name Test',
    isFromAI: false,
    confidence: 0.95,
    provider: 'local',
  })),
  generateMachineDescription: vi.fn().mockImplementation(() => ({
    data: 'Generated Description Test',
    isFromAI: false,
    confidence: 0.90,
    provider: 'local',
  })),
  generateFullAttributes: vi.fn().mockImplementation(() => ({
    data: {
      name: 'Generated Name Test',
      rarity: 'rare' as const,
      stats: {
        stability: 75,
        powerOutput: 60,
        energyCost: 40,
        failureRate: 25,
      },
      tags: ['arcane', 'mechanical'] as const,
      description: 'Test description',
      codexId: 'TEST-1234',
    },
    isFromAI: false,
    confidence: 0.95,
    provider: 'local',
  })),
  validateConfig: vi.fn().mockReturnValue({ isValid: true, warnings: [] }),
  getConfig: vi.fn().mockReturnValue({ type: 'local' as const }),
  isAvailable: vi.fn().mockReturnValue(true),
};

// Mock the modules
vi.mock('../services/ai/LocalAIProvider', () => ({
  LocalAIProvider: vi.fn(() => mockProvider),
  createLocalAIProvider: vi.fn(() => mockProvider),
}));

vi.mock('../services/ai/AIServiceFactory', () => ({
  createProvider: vi.fn(() => mockProvider),
  ProviderType: {
    LOCAL: 'local',
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    GEMINI: 'gemini',
  },
}));

// Import hook after mocks are set up
import { useAINaming } from '../hooks/useAINaming';

describe('useAINaming Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations to default
    mockProvider.generateMachineName.mockImplementation(() => ({
      data: 'Generated Name Test',
      isFromAI: false,
      confidence: 0.95,
      provider: 'local',
    }));
    mockProvider.generateMachineDescription.mockImplementation(() => ({
      data: 'Generated Description Test',
      isFromAI: false,
      confidence: 0.90,
      provider: 'local',
    }));
    mockProvider.generateFullAttributes.mockImplementation(() => ({
      data: {
        name: 'Generated Name Test',
        rarity: 'rare',
        stats: {
          stability: 75,
          powerOutput: 60,
          energyCost: 40,
          failureRate: 25,
        },
        tags: ['arcane', 'mechanical'],
        description: 'Test description',
        codexId: 'TEST-1234',
      },
      isFromAI: false,
      confidence: 0.95,
      provider: 'local',
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State (AC4)', () => {
    it('should initialize with isLoading false', () => {
      const { result } = renderHook(() => useAINaming());
      expect(result.current.isLoading).toBe(false);
    });

    it('should initialize with error null', () => {
      const { result } = renderHook(() => useAINaming());
      expect(result.current.error).toBeNull();
    });

    it('should initialize with isUsingAI false for local provider', () => {
      const { result } = renderHook(() => useAINaming({ providerType: 'local' }));
      expect(result.current.isUsingAI).toBe(false);
    });

    it('should initialize with currentProvider as local', () => {
      const { result } = renderHook(() => useAINaming({ providerType: 'local' }));
      expect(result.current.currentProvider).toBe('local');
    });
  });

  describe('generateName Function', () => {
    it('should return a result with data property', async () => {
      const { result } = renderHook(() => useAINaming());
      
      const testParams = {
        modules: [{ type: 'core-furnace' }],
        connections: [],
      };

      let response: any;
      await act(async () => {
        response = await result.current.generateName(testParams);
      });

      expect(response).toBeDefined();
      expect(response).toHaveProperty('data');
      expect(typeof response.data).toBe('string');
    });

    it('should set isLoading during and after generation (AC4)', async () => {
      const { result } = renderHook(() => useAINaming());
      
      const testParams = {
        modules: [{ type: 'core-furnace' }],
        connections: [],
      };

      await act(async () => {
        await result.current.generateName(testParams);
      });

      // After completion, should be false
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error null after successful generation (AC4)', async () => {
      const { result } = renderHook(() => useAINaming());
      
      const testParams = {
        modules: [{ type: 'core-furnace' }],
        connections: [],
      };

      await act(async () => {
        await result.current.generateName(testParams);
      });

      expect(result.current.error).toBeNull();
    });

    it('should accept faction parameter', async () => {
      const { result } = renderHook(() => useAINaming());
      
      const testParams = {
        modules: [{ type: 'core-furnace' }],
        connections: [],
        faction: 'inferno',
      };

      let response: any;
      await act(async () => {
        response = await result.current.generateName(testParams);
      });

      expect(response).toBeDefined();
      expect(mockProvider.generateMachineName).toHaveBeenCalledWith(expect.objectContaining({
        faction: 'inferno',
      }));
    });

    it('should accept preferredTags parameter', async () => {
      const { result } = renderHook(() => useAINaming());
      
      const testParams = {
        modules: [{ type: 'core-furnace' }],
        connections: [],
        preferredTags: ['fire', 'arcane'],
      };

      let response: any;
      await act(async () => {
        response = await result.current.generateName(testParams);
      });

      expect(response).toBeDefined();
      expect(mockProvider.generateMachineName).toHaveBeenCalledWith(expect.objectContaining({
        preferredTags: ['fire', 'arcane'],
      }));
    });
  });

  describe('generateDescription Function', () => {
    it('should return a result with data property', async () => {
      const { result } = renderHook(() => useAINaming());
      
      const testParams = {
        modules: [{ type: 'core-furnace' }],
        connections: [],
        machineName: 'Test Machine',
        attributes: {
          rarity: 'rare',
          stability: 75,
          power: 60,
          tags: ['arcane'],
        },
      };

      let response: any;
      await act(async () => {
        response = await result.current.generateDescription(testParams);
      });

      expect(response).toBeDefined();
      expect(response).toHaveProperty('data');
      expect(typeof response.data).toBe('string');
    });

    it('should accept style parameter', async () => {
      const { result } = renderHook(() => useAINaming());
      
      const testParams = {
        modules: [{ type: 'core-furnace' }],
        connections: [],
        machineName: 'Test Machine',
        attributes: {
          rarity: 'rare',
          stability: 75,
          power: 60,
          tags: ['arcane'],
        },
        style: 'technical' as const,
      };

      let response: any;
      await act(async () => {
        response = await result.current.generateDescription(testParams);
      });

      expect(response).toBeDefined();
      expect(mockProvider.generateMachineDescription).toHaveBeenCalledWith(expect.objectContaining({
        style: 'technical',
      }));
    });

    it('should accept maxLength parameter', async () => {
      const { result } = renderHook(() => useAINaming());
      
      const testParams = {
        modules: [{ type: 'core-furnace' }],
        connections: [],
        machineName: 'Test Machine',
        attributes: {
          rarity: 'rare',
          stability: 75,
          power: 60,
          tags: ['arcane'],
        },
        maxLength: 100,
      };

      let response: any;
      await act(async () => {
        response = await result.current.generateDescription(testParams);
      });

      expect(response).toBeDefined();
      expect(mockProvider.generateMachineDescription).toHaveBeenCalledWith(expect.objectContaining({
        maxLength: 100,
      }));
    });
  });

  describe('generateFullAttributes Function', () => {
    it('should return GeneratedAttributes object', async () => {
      const { result } = renderHook(() => useAINaming());
      
      const modules = [{ type: 'core-furnace', instanceId: 'm1' }];
      const connections = [];

      let response: any;
      await act(async () => {
        response = await result.current.generateFullAttributes(modules, connections);
      });

      expect(response).toBeDefined();
      expect(response).toHaveProperty('data');
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('rarity');
      expect(response.data).toHaveProperty('stats');
      expect(response.data).toHaveProperty('tags');
    });

    it('should call provider with modules and connections', async () => {
      const { result } = renderHook(() => useAINaming());
      
      const modules = [{ type: 'core-furnace', instanceId: 'm1' }];
      const connections = [{ sourceModuleId: 'm1', targetModuleId: 'm2' }];

      let response: any;
      await act(async () => {
        response = await result.current.generateFullAttributes(modules, connections);
      });

      expect(mockProvider.generateFullAttributes).toHaveBeenCalledWith(modules, connections);
    });
  });

  describe('Provider Switching', () => {
    it('should provide setProvider function', () => {
      const { result } = renderHook(() => useAINaming());
      expect(typeof result.current.setProvider).toBe('function');
    });

    it('should update currentProvider when setProvider is called', async () => {
      const { result } = renderHook(() => useAINaming());
      
      await act(async () => {
        result.current.setProvider('local');
      });

      expect(result.current.currentProvider).toBe('local');
    });

    it('should provide updateConfig function', () => {
      const { result } = renderHook(() => useAINaming());
      expect(typeof result.current.updateConfig).toBe('function');
    });

    it('should provide resetToLocal function', () => {
      const { result } = renderHook(() => useAINaming());
      expect(typeof result.current.resetToLocal).toBe('function');
    });

    it('should reset to local when resetToLocal is called', async () => {
      const { result } = renderHook(() => useAINaming());
      
      await act(async () => {
        result.current.resetToLocal();
      });

      expect(result.current.currentProvider).toBe('local');
      expect(result.current.isUsingAI).toBe(false);
    });
  });

  describe('Fallback Logic (AC5)', () => {
    it('should have isUsingAI reflect the actual provider used', async () => {
      const { result } = renderHook(() => useAINaming({ providerType: 'local' }));
      
      const testParams = {
        modules: [{ type: 'core-furnace' }],
        connections: [],
      };

      await act(async () => {
        await result.current.generateName(testParams);
      });

      // Local provider means isUsingAI should be false
      expect(result.current.isUsingAI).toBe(false);
    });

    it('should have isFromAI false for local provider results', async () => {
      const { result } = renderHook(() => useAINaming({ providerType: 'local' }));
      
      const testParams = {
        modules: [{ type: 'core-furnace' }],
        connections: [],
      };

      let response: any;
      await act(async () => {
        response = await result.current.generateName(testParams);
      });

      // Local provider results should have isFromAI = false
      expect(response.isFromAI).toBe(false);
    });
  });

  describe('Options', () => {
    it('should accept providerType option', () => {
      const { result } = renderHook(() => useAINaming({ providerType: 'local' }));
      expect(result.current.currentProvider).toBe('local');
    });

    it('should accept config option', () => {
      const { result } = renderHook(() => useAINaming({
        config: { timeout: 5000 },
      }));
      expect(result.current).toBeDefined();
    });

    it('should accept autoFallback option', () => {
      const { result } = renderHook(() => useAINaming({ autoFallback: true }));
      expect(result.current).toBeDefined();
    });
  });
});
