/**
 * Anthropic Provider Unit Tests
 * 
 * Tests for AnthropicProvider including API key validation,
 * request formatting, response parsing, error handling, and fallback behavior.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AnthropicProvider, createAnthropicProvider } from '../services/ai/AnthropicProvider';
import { AIProvider } from '../services/ai/AIProvider';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AnthropicProvider', () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new AnthropicProvider({
      apiKey: 'sk-ant-test-1234567890123456789012345678',
      model: 'claude-3-5-haiku-20241107',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Provider Creation', () => {
    it('should create provider with valid config', () => {
      const p = new AnthropicProvider({
        apiKey: 'sk-ant-valid-key-1234567890123456789012345678',
        model: 'claude-3-sonnet-20240229',
      });
      expect(p).toBeDefined();
      expect(p.providerType).toBe('anthropic');
    });

    it('should create provider with missing API key', () => {
      const p = new AnthropicProvider();
      expect(p).toBeDefined();
      expect(p.providerType).toBe('anthropic');
    });

    it('should have correct providerType', () => {
      expect(provider.providerType).toBe('anthropic');
    });

    it('should implement AIProvider interface', () => {
      expect(typeof provider.generateMachineName).toBe('function');
      expect(typeof provider.generateMachineDescription).toBe('function');
      expect(typeof provider.generateFullAttributes).toBe('function');
      expect(typeof provider.validateConfig).toBe('function');
      expect(typeof provider.getConfig).toBe('function');
      expect(typeof provider.isAvailable).toBe('function');
    });

    it('should use default model when not specified', () => {
      const p = new AnthropicProvider({ apiKey: 'sk-ant-test-1234567890123456789012345678' });
      expect(p.getConfig().model).toBe('claude-3-5-haiku-20241107');
    });
  });

  describe('API Key Validation', () => {
    it('should validate valid API key format', () => {
      const validation = AnthropicProvider.validateAPIKey('sk-ant-1234567890abcdefghijklmnopqrstuvwx');
      expect(validation.isValid).toBe(true);
    });

    it('should validate key with exactly 44 chars', () => {
      const key = 'sk-ant-test-1234567890123456789012345678';
      const validation = AnthropicProvider.validateAPIKey(key);
      expect(validation.isValid).toBe(true);
    });

    it('should validate key with underscores and dashes', () => {
      const validation = AnthropicProvider.validateAPIKey('sk-ant-test_key-12345678901234567890123');
      expect(validation.isValid).toBe(true);
    });

    it('should validate key with minimum 40 characters after prefix', () => {
      const key = 'sk-ant-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7';
      const validation = AnthropicProvider.validateAPIKey(key);
      expect(validation.isValid).toBe(true);
    });

    it('should invalidate key that is too short', () => {
      const validation = AnthropicProvider.validateAPIKey('sk-ant-');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('40 characters');
    });

    it('should invalidate key that is just under minimum length', () => {
      const key = 'sk-ant-a1b2c3d4e5f6'; // 22 chars after prefix, needs 30+
      const validation = AnthropicProvider.validateAPIKey(key);
      expect(validation.isValid).toBe(false);
    });

    it('should invalidate key with wrong prefix', () => {
      const validation = AnthropicProvider.validateAPIKey('openai-sk-test-1234567890123456789012');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain("'sk-ant-'");
    });

    it('should invalidate key with different prefix', () => {
      const validation = AnthropicProvider.validateAPIKey('sk-openai-12345678901234567890123456');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain("'sk-ant-'");
    });

    it('should invalidate key with invalid characters', () => {
      const validation = AnthropicProvider.validateAPIKey('sk-ant-invalid!@#$%^&*()_+abcdefghijklmnop');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Invalid API key format');
    });

    it('should handle empty string as not configured', () => {
      const validation = AnthropicProvider.validateAPIKey('');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeUndefined(); // Empty is "not configured", not "invalid"
    });

    it('should handle undefined as not configured', () => {
      const validation = AnthropicProvider.validateAPIKey(undefined as any);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeUndefined();
    });

    it('should handle whitespace-only string', () => {
      const validation = AnthropicProvider.validateAPIKey('   ');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeUndefined();
    });

    it('should handle null as not configured', () => {
      const validation = AnthropicProvider.validateAPIKey(null as any);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeUndefined();
    });
  });

  describe('Request Formatting', () => {
    it('should include model in request payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Test Name' }]
        })
      });

      await provider.generateMachineName({
        modules: [{ type: 'core-furnace' }],
        connections: [],
      });

      expect(mockFetch).toHaveBeenCalled();
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.model).toBe('claude-3-5-haiku-20241107');
    });

    it('should include messages array with user message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Test Name' }]
        })
      });

      await provider.generateMachineName({
        modules: [{ type: 'core-furnace' }],
        connections: [],
      });

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.messages).toBeInstanceOf(Array);
      expect(body.messages.length).toBeGreaterThanOrEqual(1);
      expect(body.messages[0].role).toBe('user');
    });

    it('should include anthropic-version header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Test' }]
        })
      });

      await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      const call = mockFetch.mock.calls[0];
      expect(call[1].headers['anthropic-version']).toBe('2023-06-01');
    });

    it('should include x-api-key header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Test' }]
        })
      });

      await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      const call = mockFetch.mock.calls[0];
      expect(call[1].headers['x-api-key']).toBe('sk-ant-test-1234567890123456789012345678');
    });

    it('should include full context in description request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Test Description' }]
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
      const userMessage = body.messages[0].content;
      expect(userMessage).toContain('Test Machine');
      expect(userMessage).toContain('rare');
      expect(userMessage).toContain('technical');
    });

    it('should respect max_tokens parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Test' }]
        })
      });

      await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.max_tokens).toBe(100); // Default for name generation
    });
  });

  describe('Response Parsing', () => {
    it('should parse successful response with content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Void Resonator Prime' }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).toBe('Void Resonator Prime');
      expect(result.isFromAI).toBe(true);
      expect(result.provider).toBe('anthropic');
    });

    it('should handle response with multiple content blocks', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Stellar Conduit Omega' }, { text: 'Extra text' }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).toBe('Stellar Conduit Omega');
    });

    it('should handle response missing content array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('Empty response');
    });

    it('should handle response with empty content array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: []
        })
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('Empty response');
    });

    it('should handle response with empty text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: '' }]
        })
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('Empty response');
    });

    it('should handle response with whitespace-only text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: '   ' }]
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

    it('should throw error for 502 Bad Gateway', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('service error');
    });

    it('should throw error for 503 Service Unavailable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
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
      const noKeyProvider = new AnthropicProvider();
      
      await expect(noKeyProvider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('API key not configured');
    });

    it('should throw error for invalid API key format', async () => {
      const invalidKeyProvider = new AnthropicProvider({
        apiKey: 'invalid-key',
      });

      await expect(invalidKeyProvider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow("'sk-ant-'");
    });

    it('should handle TypeError for fetch (network unavailable)', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow();
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

    it('should return error for 429 rate limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const result = await provider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('rate limit');
    });

    it('should return error for 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await provider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should return error for missing API key', async () => {
      const noKeyProvider = new AnthropicProvider();
      const result = await noKeyProvider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('not configured');
    });

    it('should return error for invalid API key format', async () => {
      const invalidProvider = new AnthropicProvider({ apiKey: 'bad-key' });
      const result = await invalidProvider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain("'sk-ant-'");
    });

    it('should return error for network timeout', async () => {
      // Create a proper TimeoutError using AbortSignal.timeout behavior
      const timeoutError = new Error('The operation was aborted');
      timeoutError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(timeoutError);

      const result = await provider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out') || expect(result.error).toContain('aborted');
    });

    it('should return error for connection refused', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await provider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection failed');
    });
  });

  describe('validateConfig', () => {
    it('should return valid for configured provider', () => {
      const result = provider.validateConfig();
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for unconfigured provider', () => {
      const noKeyProvider = new AnthropicProvider();
      const result = noKeyProvider.validateConfig();
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not configured');
    });

    it('should return invalid for wrong format key', () => {
      const invalidProvider = new AnthropicProvider({ apiKey: 'bad-key' });
      const result = invalidProvider.validateConfig();
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid API key format');
    });

    it('should include warning for unconfigured provider', () => {
      const noKeyProvider = new AnthropicProvider();
      const result = noKeyProvider.validateConfig();
      expect(result.warnings).toContain('Local provider will be used as fallback');
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = provider.getConfig();
      expect(config.type).toBe('anthropic');
      expect(config.model).toBe('claude-3-5-haiku-20241107');
    });

    it('should include apiKey in config', () => {
      const config = provider.getConfig();
      expect(config.apiKey).toBe('sk-ant-test-1234567890123456789012345678');
    });

    it('should include baseUrl in config', () => {
      const config = provider.getConfig();
      expect(config.baseUrl).toBe('https://api.anthropic.com/v1/messages');
    });

    it('should include timeout in config', () => {
      const config = provider.getConfig();
      expect(config.timeout).toBe(30000);
    });
  });

  describe('isAvailable', () => {
    it('should return true for valid API key', () => {
      expect(provider.isAvailable()).toBe(true);
    });

    it('should return false for invalid API key', () => {
      const invalidProvider = new AnthropicProvider({ apiKey: 'bad' });
      expect(invalidProvider.isAvailable()).toBe(false);
    });

    it('should return false for missing API key', () => {
      const noKeyProvider = new AnthropicProvider();
      expect(noKeyProvider.isAvailable()).toBe(false);
    });

    it('should return false for wrong prefix', () => {
      const wrongPrefixProvider = new AnthropicProvider({ apiKey: 'sk-openai-1234567890123456789012345678' });
      expect(wrongPrefixProvider.isAvailable()).toBe(false);
    });

    it('should return false for short key', () => {
      const shortKeyProvider = new AnthropicProvider({ apiKey: 'sk-ant-x' });
      expect(shortKeyProvider.isAvailable()).toBe(false);
    });
  });

  describe('setAPIKey', () => {
    it('should update API key', () => {
      provider.setAPIKey('sk-ant-newkey-1234567890123456789012345678');
      expect(provider.isAvailable()).toBe(true);
    });

    it('should allow setting empty key', () => {
      provider.setAPIKey('');
      expect(provider.isAvailable()).toBe(false);
    });

    it('should update config with new key', () => {
      provider.setAPIKey('sk-ant-updated-123456789012345678901234567');
      expect(provider.getConfig().apiKey).toBe('sk-ant-updated-123456789012345678901234567');
    });
  });

  describe('setModel', () => {
    it('should update model', () => {
      provider.setModel('claude-3-sonnet-20240229');
      const config = provider.getConfig();
      expect(config.model).toBe('claude-3-sonnet-20240229');
    });

    it('should update config correctly', () => {
      provider.setModel('claude-3-opus-20240229');
      expect(provider.getConfig().model).toBe('claude-3-opus-20240229');
    });
  });

  describe('Response Sanitization', () => {
    it('should remove HTML tags from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: '<b>Test</b> Name' }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).not.toContain('<');
      expect(result.data).not.toContain('>');
    });

    it('should remove nested HTML tags from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: '<div><span>Test</span> Name</div>' }]
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
          content: [{ text: 'Test\x00Name\x1f' }]
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
          content: [{ text: 'error: Something went wrong Test Name' }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).not.toContain('error:');
    });

    it('should trim whitespace from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: '  Test Name  ' }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).toBe('Test Name');
    });

    it('should preserve unicode characters in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Void Resonator Ω' }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).toContain('Void');
      expect(result.data).toContain('Ω');
    });
  });

  describe('generateFullAttributes', () => {
    it('should fall back to local provider', async () => {
      const result = await provider.generateFullAttributes(
        [{ type: 'core-furnace' }],
        []
      );

      expect(result.data).toBeDefined();
      expect(result.data.name).toBeDefined();
      expect(result.data.description).toBeDefined();
      expect(result.isFromAI).toBe(false);
      expect(result.provider).toBe('local');
    });

    it('should return GeneratedAttributes with required fields', async () => {
      const result = await provider.generateFullAttributes(
        [{ type: 'core-furnace' }],
        []
      );

      // GeneratedAttributes has: name, rarity, stats, tags, description, codexId
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('description');
      expect(result.data).toHaveProperty('rarity');
      expect(result.data).toHaveProperty('stats');
      expect(result.data).toHaveProperty('tags');
      expect(result.data).toHaveProperty('codexId');
      
      // stats has: stability, powerOutput, energyCost, failureRate
      expect(result.data.stats).toHaveProperty('stability');
      expect(result.data.stats).toHaveProperty('powerOutput');
      expect(result.data.stats).toHaveProperty('energyCost');
      expect(result.data.stats).toHaveProperty('failureRate');
    });

    it('should return tags as array', async () => {
      const result = await provider.generateFullAttributes(
        [{ type: 'core-furnace' }],
        []
      );

      expect(Array.isArray(result.data.tags)).toBe(true);
    });

    it('should return valid rarity value', async () => {
      const result = await provider.generateFullAttributes(
        [{ type: 'core-furnace' }],
        []
      );

      // Check that rarity is one of the valid values
      const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      expect(validRarities).toContain(result.data.rarity);
    });
  });

  describe('Factory function', () => {
    it('should create AnthropicProvider with createAnthropicProvider', () => {
      const p = createAnthropicProvider({ apiKey: 'sk-ant-test-1234567890123456789012345678' });
      expect(p).toBeInstanceOf(AnthropicProvider);
      expect(p.providerType).toBe('anthropic');
    });

    it('should accept optional config', () => {
      const p = createAnthropicProvider({ timeout: 5000, model: 'claude-3-sonnet-20240229' });
      expect(p).toBeInstanceOf(AnthropicProvider);
      expect(p.getConfig().timeout).toBe(5000);
      expect(p.getConfig().model).toBe('claude-3-sonnet-20240229');
    });

    it('should create provider without config', () => {
      const p = createAnthropicProvider();
      expect(p).toBeInstanceOf(AnthropicProvider);
    });
  });

  describe('Description Generation', () => {
    it('should generate description with style parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'A technical description of the machine.' }]
        })
      });

      const result = await provider.generateMachineDescription({
        modules: [{ type: 'core-furnace' }],
        connections: [],
        machineName: 'Test Machine',
        attributes: {
          rarity: 'rare',
          stability: 75,
          power: 60,
          tags: ['arcane'],
        },
        style: 'technical',
      });

      expect(result.data).toBe('A technical description of the machine.');
      expect(result.isFromAI).toBe(true);
      expect(result.provider).toBe('anthropic');
    });

    it('should respect maxLength parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'A description.' }]
        })
      });

      const result = await provider.generateMachineDescription({
        modules: [{ type: 'core-furnace' }],
        connections: [],
        machineName: 'Test Machine',
        attributes: {
          rarity: 'common',
          stability: 50,
          power: 50,
          tags: [],
        },
        maxLength: 200,
      });

      // Verify max_tokens was passed to API (200 for description)
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.max_tokens).toBe(200);
    });

    it('should throw error when API key invalid during description generation', async () => {
      const invalidProvider = new AnthropicProvider({ apiKey: 'invalid' });

      await expect(invalidProvider.generateMachineDescription({
        modules: [],
        connections: [],
        machineName: 'Test',
        attributes: { rarity: 'common', stability: 50, power: 50, tags: [] },
      })).rejects.toThrow("'sk-ant-'");
    });
  });
});
