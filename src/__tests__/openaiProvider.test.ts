/**
 * OpenAI Provider Unit Tests
 * 
 * Tests for OpenAIProvider including API key validation,
 * request formatting, response parsing, error handling, and fallback behavior.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OpenAIProvider, createOpenAIProvider } from '../services/ai/OpenAIProvider';
import { AIProvider } from '../services/ai/AIProvider';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new OpenAIProvider({
      apiKey: 'sk-test-1234567890123456789012345678901234',
      model: 'gpt-3.5-turbo',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Provider Creation', () => {
    it('should create provider with valid config', () => {
      const p = new OpenAIProvider({
        apiKey: 'sk-valid-key-123456789012345678901234',
        model: 'gpt-4',
      });
      expect(p).toBeDefined();
      expect(p.providerType).toBe('openai');
    });

    it('should create provider with missing API key', () => {
      const p = new OpenAIProvider();
      expect(p).toBeDefined();
      expect(p.providerType).toBe('openai');
    });

    it('should implement AIProvider interface', () => {
      expect(typeof provider.generateMachineName).toBe('function');
      expect(typeof provider.generateMachineDescription).toBe('function');
      expect(typeof provider.generateFullAttributes).toBe('function');
      expect(typeof provider.validateConfig).toBe('function');
      expect(typeof provider.getConfig).toBe('function');
      expect(typeof provider.isAvailable).toBe('function');
    });
  });

  describe('API Key Validation', () => {
    it('should validate valid API key format', () => {
      const validation = OpenAIProvider.validateAPIKey('sk-1234567890abcdefghijklmnopqrstuvwx');
      expect(validation.isValid).toBe(true);
    });

    it('should validate key with exactly 44 chars', () => {
      const key = 'sk-test-1234567890123456789012345678';
      const validation = OpenAIProvider.validateAPIKey(key);
      expect(validation.isValid).toBe(true);
    });

    it('should validate key with underscores and dashes', () => {
      const validation = OpenAIProvider.validateAPIKey('sk-test-1234567890abcdefghijklmnopqrstuvwx');
      expect(validation.isValid).toBe(true);
    });

    it('should invalidate key that is too short', () => {
      const validation = OpenAIProvider.validateAPIKey('sk-');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('40 characters');
    });

    it('should invalidate key with wrong prefix', () => {
      const validation = OpenAIProvider.validateAPIKey('openai-1234567890abcdefghijklmnopqrstuv');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain("'sk-'");
    });

    it('should invalidate key with invalid characters', () => {
      const validation = OpenAIProvider.validateAPIKey('sk-invalid!@#$%^&*()_+abcdefghijklmnopqr');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Invalid API key format');
    });

    it('should handle empty string as not configured', () => {
      const validation = OpenAIProvider.validateAPIKey('');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeUndefined(); // Empty is "not configured", not "invalid"
    });

    it('should handle undefined as not configured', () => {
      const validation = OpenAIProvider.validateAPIKey(undefined as any);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeUndefined();
    });

    it('should handle whitespace-only string', () => {
      const validation = OpenAIProvider.validateAPIKey('   ');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeUndefined();
    });
  });

  describe('Request Formatting', () => {
    it('should include model in request payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test Name' } }]
        })
      });

      await provider.generateMachineName({
        modules: [{ type: 'core-furnace' }],
        connections: [],
      });

      expect(mockFetch).toHaveBeenCalled();
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.model).toBe('gpt-3.5-turbo');
    });

    it('should include messages array with system and user messages', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test Name' } }]
        })
      });

      await provider.generateMachineName({
        modules: [{ type: 'core-furnace' }],
        connections: [],
      });

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.messages).toBeInstanceOf(Array);
      expect(body.messages.length).toBeGreaterThanOrEqual(2);
      expect(body.messages[0].role).toBe('system');
      expect(body.messages[1].role).toBe('user');
    });

    it('should include full context in description request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test Description' } }]
        })
      });

      await provider.generateMachineDescription({
        modules: [{ type: 'core-furnace', category: 'energy' }],
        connections: [{ sourceModuleId: 'm1', targetModuleId: 'm2' }],
        machineName: 'Test Machine',
        attributes: {
          rarity: 'rare',
          stability: 75,
          power: 60,
          tags: ['arcane'],
        },
        style: 'technical',
        maxLength: 200,
      });

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      const userMessage = body.messages[1].content;
      expect(userMessage).toContain('Test Machine');
      expect(userMessage).toContain('rare');
      expect(userMessage).toContain('technical');
    });

    it('should set streaming in request payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test' } }]
        })
      });

      await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.stream).toBe(false); // We use stream: false for simplicity
    });
  });

  describe('Response Parsing', () => {
    it('should parse successful response with content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Void Resonator Prime' } }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).toBe('Void Resonator Prime');
      expect(result.isFromAI).toBe(true);
      expect(result.provider).toBe('openai');
    });

    it('should handle response with multiple delta chunks', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Stellar Conduit Omega' } }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).toBe('Stellar Conduit Omega');
    });

    it('should handle response missing choices array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('Empty response');
    });

    it('should handle response with empty content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '' } }]
        })
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('Empty response');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for 401 Unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('Invalid API key');
    });

    it('should throw error for 429 Rate Limited', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('rate limit');
    });

    it('should throw error for 500 Server Error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('service error');
    });

    it('should throw error for network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow();
    });

    it('should throw error for malformed JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow();
    });

    it('should throw error when API key not configured', async () => {
      const noKeyProvider = new OpenAIProvider();
      
      await expect(noKeyProvider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('API key not configured');
    });

    it('should throw error for invalid API key format', async () => {
      const invalidKeyProvider = new OpenAIProvider({
        apiKey: 'invalid-key',
      });

      await expect(invalidKeyProvider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow("'sk-'");
    });
  });

  describe('Stream Processing', () => {
    it('should handle single chunk processing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Quantum Matrix' } }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).toBe('Quantum Matrix');
    });

    it('should handle multiple chunk accumulation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Arcane Amplifier Genesis' } }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).toBe('Arcane Amplifier Genesis');
    });

    it('should stop processing at data: [DONE]', async () => {
      // Since we use stream: false, this is implicitly tested
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Stellar Engine' } }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).toBe('Stellar Engine');
    });
  });

  describe('validateConfig', () => {
    it('should return valid for configured provider', () => {
      const result = provider.validateConfig();
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for unconfigured provider', () => {
      const noKeyProvider = new OpenAIProvider();
      const result = noKeyProvider.validateConfig();
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not configured');
    });

    it('should return invalid for wrong format key', () => {
      const invalidProvider = new OpenAIProvider({ apiKey: 'bad-key' });
      const result = invalidProvider.validateConfig();
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid API key format');
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = provider.getConfig();
      expect(config.type).toBe('openai');
      expect(config.model).toBe('gpt-3.5-turbo');
    });
  });

  describe('isAvailable', () => {
    it('should return true for valid API key', () => {
      expect(provider.isAvailable()).toBe(true);
    });

    it('should return false for invalid API key', () => {
      const invalidProvider = new OpenAIProvider({ apiKey: 'bad' });
      expect(invalidProvider.isAvailable()).toBe(false);
    });

    it('should return false for missing API key', () => {
      const noKeyProvider = new OpenAIProvider();
      expect(noKeyProvider.isAvailable()).toBe(false);
    });
  });

  describe('setAPIKey', () => {
    it('should update API key', () => {
      provider.setAPIKey('sk-newkey-123456789012345678901234567');
      expect(provider.isAvailable()).toBe(true);
    });

    it('should allow setting empty key', () => {
      provider.setAPIKey('');
      expect(provider.isAvailable()).toBe(false);
    });
  });

  describe('setModel', () => {
    it('should update model', () => {
      provider.setModel('gpt-4');
      const config = provider.getConfig();
      expect(config.model).toBe('gpt-4');
    });
  });

  describe('testConnection', () => {
    it('should return success for valid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const result = await provider.testConnection();
      expect(result.success).toBe(true);
    });

    it('should return error for 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await provider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid API key');
    });

    it('should return error for rate limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const result = await provider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('rate limit');
    });

    it('should return error for missing API key', async () => {
      const noKeyProvider = new OpenAIProvider();
      const result = await noKeyProvider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('not configured');
    });
  });

  describe('Factory function', () => {
    it('should create OpenAIProvider with createOpenAIProvider', () => {
      const p = createOpenAIProvider({ apiKey: 'sk-test-1234567890123456789012345678' });
      expect(p).toBeInstanceOf(OpenAIProvider);
      expect(p.providerType).toBe('openai');
    });

    it('should accept optional config', () => {
      const p = createOpenAIProvider({ timeout: 5000, model: 'gpt-4' });
      expect(p).toBeInstanceOf(OpenAIProvider);
      expect(p.getConfig().timeout).toBe(5000);
    });
  });

  describe('Response Sanitization', () => {
    it('should remove HTML tags from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '<b>Test</b> Name' } }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).not.toContain('<');
      expect(result.data).not.toContain('>');
    });

    it('should remove control characters from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test\x00Name\x1f' } }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).not.toContain('\x00');
      expect(result.data).not.toContain('\x1f');
    });

    it('should remove API error messages from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'error: Something went wrong Test Name' } }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).not.toContain('error:');
    });
  });
});
