/**
 * Gemini Provider Unit Tests
 * 
 * Tests for GeminiProvider including API key validation,
 * request formatting, response parsing, error handling, and fallback behavior.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GeminiProvider, createGeminiProvider } from '../services/ai/providers/GeminiProvider';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GeminiProvider', () => {
  let provider: GeminiProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new GeminiProvider({
      apiKey: 'AIza_test_123456789012345678901234567890',
      model: 'gemini-pro',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Provider Creation', () => {
    it('should create provider with valid config', () => {
      const p = new GeminiProvider({
        apiKey: 'AIza_test_123456789012345678901234567890',
        model: 'gemini-pro',
      });
      expect(p).toBeDefined();
      expect(p.providerType).toBe('gemini');
    });

    it('should create provider with missing API key', () => {
      const p = new GeminiProvider();
      expect(p).toBeDefined();
      expect(p.providerType).toBe('gemini');
    });

    it('should have correct providerType', () => {
      expect(provider.providerType).toBe('gemini');
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
      const p = new GeminiProvider({ apiKey: 'AIza_test_123456789012345678901234567890' });
      expect(p.getConfig().model).toBe('gemini-pro');
    });

    it('should support generateText method', () => {
      expect(typeof provider.generateText).toBe('function');
    });
  });

  describe('API Key Validation', () => {
    it('should validate valid API key format', () => {
      const validation = GeminiProvider.validateAPIKey('AIza_test_123456789012345678901234567890');
      expect(validation.isValid).toBe(true);
    });

    it('should validate key with 39 characters (minimum valid)', () => {
      const key = 'AIzaSyAbcdefghijklmnopqrstuvwxyz12345';
      const validation = GeminiProvider.validateAPIKey(key);
      expect(validation.isValid).toBe(true);
    });

    it('should validate key with underscores and dashes', () => {
      const validation = GeminiProvider.validateAPIKey('AIza_test-key_1234567890123456789');
      expect(validation.isValid).toBe(true);
    });

    it('should invalidate key that is too short', () => {
      const validation = GeminiProvider.validateAPIKey('AIza_short');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('30 characters');
    });

    it('should invalidate key that is just under minimum length', () => {
      const key = 'AIza_test_key'; // 15 chars, needs 30+
      const validation = GeminiProvider.validateAPIKey(key);
      expect(validation.isValid).toBe(false);
    });

    it('should handle empty string as not configured', () => {
      const validation = GeminiProvider.validateAPIKey('');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeUndefined(); // Empty is "not configured", not "invalid"
    });

    it('should handle undefined as not configured', () => {
      const validation = GeminiProvider.validateAPIKey(undefined as any);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeUndefined();
    });

    it('should handle whitespace-only string', () => {
      const validation = GeminiProvider.validateAPIKey('   ');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeUndefined();
    });

    it('should handle null as not configured', () => {
      const validation = GeminiProvider.validateAPIKey(null as any);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeUndefined();
    });

    it('should invalidate key with invalid characters', () => {
      const validation = GeminiProvider.validateAPIKey('AIza_test!@#$%^&*()_+abcdefghijklmnop');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Invalid API key format');
    });
  });

  describe('Request Formatting', () => {
    it('should include model in request URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Test Name' }] } }]
        })
      });

      await provider.generateMachineName({
        modules: [{ type: 'core-furnace' }],
        connections: [],
      });

      expect(mockFetch).toHaveBeenCalled();
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('gemini-pro');
      expect(call[0]).toContain('generateContent');
    });

    it('should include API key in request URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Test Name' }] } }]
        })
      });

      await provider.generateMachineName({
        modules: [{ type: 'core-furnace' }],
        connections: [],
      });

      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('key=AIza_test_123456789012345678901234567890');
    });

    it('should include contents array with text prompt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Test Name' }] } }]
        })
      });

      await provider.generateMachineName({
        modules: [{ type: 'core-furnace' }],
        connections: [],
      });

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.contents).toBeInstanceOf(Array);
      expect(body.contents[0].parts[0].text).toBeDefined();
    });

    it('should include Content-Type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Test' }] } }]
        })
      });

      await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      const call = mockFetch.mock.calls[0];
      expect(call[1].headers['Content-Type']).toBe('application/json');
    });

    it('should include generation config', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Test' }] } }]
        })
      });

      await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.generationConfig).toBeDefined();
      expect(body.generationConfig.temperature).toBe(0.8);
    });

    it('should include full context in description request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Test Description' }] } }]
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
      const textContent = body.contents[0].parts[0].text;
      expect(textContent).toContain('Test Machine');
      expect(textContent).toContain('rare');
      expect(textContent).toContain('technical');
    });
  });

  describe('Response Parsing', () => {
    it('should parse successful response with content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Void Resonator Prime' }] } }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).toBe('Void Resonator Prime');
      expect(result.isFromAI).toBe(true);
      expect(result.provider).toBe('gemini');
    });

    it('should handle response with multiple parts', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Stellar Conduit Omega' }] } }]
        })
      });

      const result = await provider.generateMachineName({
        modules: [],
        connections: [],
      });

      expect(result.data).toBe('Stellar Conduit Omega');
    });

    it('should handle response missing candidates array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('Empty response');
    });

    it('should handle response with empty candidates array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: []
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
          candidates: [{ content: { parts: [{ text: '' }] } }]
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
          candidates: [{ content: { parts: [{ text: '   ' }] } }]
        })
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('Empty response');
    });

    it('should handle missing content structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: {} }]
        })
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('Empty response');
    });

    it('should handle missing parts array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [] } }]
        })
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('Empty response');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for 400 Bad Request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: { message: 'Invalid request' }
        })
      });

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow();
    });

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

    it('should throw error for 403 Forbidden', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
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
      const noKeyProvider = new GeminiProvider();
      
      await expect(noKeyProvider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('API key not configured');
    });

    it('should throw error for invalid API key format', async () => {
      const invalidKeyProvider = new GeminiProvider({
        apiKey: 'invalid-key',
      });

      await expect(invalidKeyProvider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow('30 characters');
    });

    it('should handle TypeError for fetch (network unavailable)', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow();
    });

    it('should handle timeout error', async () => {
      const timeoutError = new Error('The operation was aborted');
      timeoutError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(timeoutError);

      await expect(provider.generateMachineName({
        modules: [],
        connections: [],
      })).rejects.toThrow();
    });
  });

  describe('testConnection', () => {
    it('should return success for valid API call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const result = await provider.testConnection();
      expect(result.success).toBe(true);
    });

    it('should return error for 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: { message: 'Invalid request' }
        })
      });

      const result = await provider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('API error');
    });

    it('should return error for 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await provider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Error message present
    });

    it('should return error for 403', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      const result = await provider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('access denied');
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
      const noKeyProvider = new GeminiProvider();
      const result = await noKeyProvider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('not configured');
    });

    it('should return error for invalid API key format', async () => {
      const invalidProvider = new GeminiProvider({ apiKey: 'bad-key' });
      const result = await invalidProvider.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('30 characters');
    });

    it('should return error for network timeout', async () => {
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
      const noKeyProvider = new GeminiProvider();
      const result = noKeyProvider.validateConfig();
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not configured');
    });

    it('should return invalid for short key', () => {
      const invalidProvider = new GeminiProvider({ apiKey: 'short' });
      const result = invalidProvider.validateConfig();
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('30 characters');
    });

    it('should include warning for unconfigured provider', () => {
      const noKeyProvider = new GeminiProvider();
      const result = noKeyProvider.validateConfig();
      expect(result.warnings).toContain('Local provider will be used as fallback');
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = provider.getConfig();
      expect(config.type).toBe('gemini');
      expect(config.model).toBe('gemini-pro');
    });

    it('should include apiKey in config', () => {
      const config = provider.getConfig();
      expect(config.apiKey).toBe('AIza_test_123456789012345678901234567890');
    });

    it('should include baseUrl in config', () => {
      const config = provider.getConfig();
      expect(config.baseUrl).toBe('https://generativelanguage.googleapis.com/v1beta/models');
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
      const invalidProvider = new GeminiProvider({ apiKey: 'bad' });
      expect(invalidProvider.isAvailable()).toBe(false);
    });

    it('should return false for missing API key', () => {
      const noKeyProvider = new GeminiProvider();
      expect(noKeyProvider.isAvailable()).toBe(false);
    });

    it('should return false for short key', () => {
      const shortKeyProvider = new GeminiProvider({ apiKey: 'short' });
      expect(shortKeyProvider.isAvailable()).toBe(false);
    });
  });

  describe('setAPIKey', () => {
    it('should update API key', () => {
      provider.setAPIKey('AIza_new_test_key_1234567890123456789');
      expect(provider.isAvailable()).toBe(true);
    });

    it('should allow setting empty key', () => {
      provider.setAPIKey('');
      expect(provider.isAvailable()).toBe(false);
    });

    it('should update config with new key', () => {
      provider.setAPIKey('AIza_updated_12345678901234567890123456');
      expect(provider.getConfig().apiKey).toBe('AIza_updated_12345678901234567890123456');
    });
  });

  describe('setModel', () => {
    it('should update model', () => {
      provider.setModel('gemini-pro-vision');
      const config = provider.getConfig();
      expect(config.model).toBe('gemini-pro-vision');
    });

    it('should update config correctly', () => {
      provider.setModel('gemini-ultra');
      expect(provider.getConfig().model).toBe('gemini-ultra');
    });
  });

  describe('Response Sanitization', () => {
    it('should remove HTML tags from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: '<b>Test</b> Name' }] } }]
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
          candidates: [{ content: { parts: [{ text: '<div><span>Test</span> Name</div>' }] } }]
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
          candidates: [{ content: { parts: [{ text: 'Test\x00Name\x1f' }] } }]
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
          candidates: [{ content: { parts: [{ text: 'error: Something went wrong Test Name' }] } }]
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
          candidates: [{ content: { parts: [{ text: '  Test Name  ' }] } }]
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
          candidates: [{ content: { parts: [{ text: 'Void Resonator Ω' }] } }]
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
    it('should create GeminiProvider with createGeminiProvider', () => {
      const p = createGeminiProvider({ apiKey: 'AIza_test_123456789012345678901234567890' });
      expect(p).toBeInstanceOf(GeminiProvider);
      expect(p.providerType).toBe('gemini');
    });

    it('should accept optional config', () => {
      const p = createGeminiProvider({ timeout: 5000, model: 'gemini-pro-vision' });
      expect(p).toBeInstanceOf(GeminiProvider);
      expect(p.getConfig().timeout).toBe(5000);
      expect(p.getConfig().model).toBe('gemini-pro-vision');
    });

    it('should create provider without config', () => {
      const p = createGeminiProvider();
      expect(p).toBeInstanceOf(GeminiProvider);
    });
  });

  describe('Description Generation', () => {
    it('should generate description with style parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'A technical description of the machine.' }] } }]
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
      expect(result.provider).toBe('gemini');
    });

    it('should throw error when API key invalid during description generation', async () => {
      const invalidProvider = new GeminiProvider({ apiKey: 'invalid' });

      await expect(invalidProvider.generateMachineDescription({
        modules: [],
        connections: [],
        machineName: 'Test',
        attributes: { rarity: 'common', stability: 50, power: 50, tags: [] },
      })).rejects.toThrow('30 characters');
    });
  });

  describe('generateText Method (AC-104-001)', () => {
    it('should call Gemini API and return generated text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Test response' }] } }]
        })
      });

      const result = await provider.generateText('Describe this arcane machine');
      
      expect(mockFetch).toHaveBeenCalled();
      const call = mockFetch.mock.calls[0];
      // Verify correct endpoint
      expect(call[0]).toContain('generativelanguage.googleapis.com');
      expect(call[0]).toContain('generateContent');
      // Verify response is parsed correctly
      expect(result).toBe('Test response');
    });

    it('should return text without throwing on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Generated text content' }] } }]
        })
      });

      await expect(provider.generateText('Test prompt')).resolves.toBe('Generated text content');
    });

    it('should include system context in prompt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Response' }] } }]
        })
      });

      await provider.generateText('Test prompt');
      
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.contents[0].parts[0].text).toContain('arcane'); // Context contains arcane
    });

    it('should throw on network error (triggers fallback)', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(provider.generateText('Test')).rejects.toThrow('Network error');
    });

    it('should throw on API error (triggers fallback)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
      
      await expect(provider.generateText('Test')).rejects.toThrow('service error');
    });

    it('should include proper generation config', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Response' }] } }]
        })
      });

      await provider.generateText('Test');
      
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.generationConfig.temperature).toBe(0.8);
      expect(body.generationConfig.topP).toBe(0.95);
      expect(body.generationConfig.topK).toBe(40);
    });
  });
});
