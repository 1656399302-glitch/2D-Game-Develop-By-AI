/**
 * AI Service Factory Tests
 * 
 * Unit tests for AIServiceFactory and provider switching logic.
 */

import { describe, it, expect } from 'vitest';
import {
  createProvider,
  validateProviderConfig,
  getDefaultProviderConfig,
  createProviderFromConfig,
  isProviderImplemented,
  getImplementedProviders,
  getAvailableProviders,
  AIProviderFactoryError,
} from '../services/ai/AIServiceFactory';
import { LocalAIProvider } from '../services/ai/LocalAIProvider';
import { OpenAIProvider } from '../services/ai/OpenAIProvider';
import { AnthropicProvider } from '../services/ai/AnthropicProvider';
import { GeminiProvider } from '../services/ai/providers/GeminiProvider';
import { AIProvider } from '../services/ai/AIProvider';

describe('AIServiceFactory', () => {
  describe('createProvider', () => {
    it('should create LocalAIProvider for type "local" (AC3)', () => {
      const provider = createProvider('local');
      expect(provider).toBeInstanceOf(LocalAIProvider);
      expect(provider.providerType).toBe('local');
    });

    it('should create OpenAIProvider for "openai" with valid config (AC3)', () => {
      const provider = createProvider('openai', {
        apiKey: 'sk-valid-api-key-for-testing-1234567890',
        model: 'gpt-3.5-turbo',
      });
      expect(provider).toBeInstanceOf(OpenAIProvider);
      expect(provider.providerType).toBe('openai');
    });

    it('should create OpenAIProvider for "openai" without config (creates provider but not available) (AC3)', () => {
      const provider = createProvider('openai', {});
      expect(provider).toBeInstanceOf(OpenAIProvider);
      expect(provider.providerType).toBe('openai');
      expect(provider.isAvailable()).toBe(false); // No API key = not available
    });

    it('should create AnthropicProvider for "anthropic" (AC-ANTHROPIC-007)', () => {
      const provider = createProvider('anthropic', {
        apiKey: 'sk-ant-test-1234567890123456789012345678',
      });
      expect(provider).toBeInstanceOf(AnthropicProvider);
      expect(provider.providerType).toBe('anthropic');
    });

    it('should create AnthropicProvider for "anthropic" without config (creates provider but not available)', () => {
      const provider = createProvider('anthropic', {});
      expect(provider).toBeInstanceOf(AnthropicProvider);
      expect(provider.providerType).toBe('anthropic');
      expect(provider.isAvailable()).toBe(false); // No API key = not available
    });

    it('should create GeminiProvider for "gemini" (AC-104-001)', () => {
      const provider = createProvider('gemini', {
        apiKey: 'AIza_test_123456789012345678901234567890',
      });
      expect(provider).toBeInstanceOf(GeminiProvider);
      expect(provider.providerType).toBe('gemini');
    });

    it('should create GeminiProvider for "gemini" without config (creates provider but not available)', () => {
      const provider = createProvider('gemini', {});
      expect(provider).toBeInstanceOf(GeminiProvider);
      expect(provider.providerType).toBe('gemini');
      expect(provider.isAvailable()).toBe(false); // No API key = not available
    });

    it('should handle unknown provider types gracefully', () => {
      expect(() => {
        createProvider('unknown' as any);
      }).toThrow(AIProviderFactoryError);
    });

    it('should pass config to provider', () => {
      const provider = createProvider('local', { timeout: 5000 });
      expect(provider.getConfig().timeout).toBe(5000);
    });
  });

  describe('validateProviderConfig', () => {
    it('should validate local provider as always valid', () => {
      const result = validateProviderConfig('local');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should invalidate openai without apiKey', () => {
      const result = validateProviderConfig('openai', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('API key');
    });

    it('should validate openai with properly formatted apiKey', () => {
      const result = validateProviderConfig('openai', { apiKey: 'sk-valid-api-key-for-testing-1234567890' });
      expect(result.isValid).toBe(true);
    });

    it('should warn about missing model for openai', () => {
      const result = validateProviderConfig('openai', { apiKey: 'sk-valid-api-key-for-testing-1234567890' });
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(expect.stringContaining('model'));
    });

    it('should validate anthropic with properly formatted apiKey (AC-ANTHROPIC-002)', () => {
      const result = validateProviderConfig('anthropic', { apiKey: 'sk-ant-test-1234567890123456789012345678' });
      expect(result.isValid).toBe(true);
    });

    it('should invalidate anthropic without apiKey', () => {
      const result = validateProviderConfig('anthropic', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('API key');
    });

    it('should invalidate anthropic with invalid key format', () => {
      const result = validateProviderConfig('anthropic', { apiKey: 'invalid-key' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("'sk-ant-'");
    });

    it('should warn about missing model for anthropic', () => {
      const result = validateProviderConfig('anthropic', { apiKey: 'sk-ant-test-1234567890123456789012345678' });
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(expect.stringContaining('model'));
    });

    it('should invalidate gemini without apiKey', () => {
      const result = validateProviderConfig('gemini', {});
      expect(result.isValid).toBe(false);
    });

    it('should validate gemini with apiKey (AC-104-001)', () => {
      const result = validateProviderConfig('gemini', { apiKey: 'AIza_test_123456789012345678901234567890' });
      expect(result.isValid).toBe(true);
    });

    it('should invalidate gemini with short key', () => {
      const result = validateProviderConfig('gemini', { apiKey: 'short' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('30 characters');
    });

    it('should invalidate unknown provider types', () => {
      const result = validateProviderConfig('unknown' as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unknown provider type');
    });
  });

  describe('getDefaultProviderConfig', () => {
    it('should return local config', () => {
      const config = getDefaultProviderConfig('local');
      expect(config.type).toBe('local');
      expect(config.timeout).toBe(30000);
    });

    it('should return openai config with default model', () => {
      const config = getDefaultProviderConfig('openai');
      expect(config.type).toBe('openai');
      expect(config.model).toBe('gpt-3.5-turbo');
    });

    it('should return anthropic config with default model (AC-ANTHROPIC-007)', () => {
      const config = getDefaultProviderConfig('anthropic');
      expect(config.type).toBe('anthropic');
      expect(config.model).toBe('claude-3-5-haiku-20241107');
    });

    it('should return gemini config with default model (AC-104-001)', () => {
      const config = getDefaultProviderConfig('gemini');
      expect(config.type).toBe('gemini');
      expect(config.model).toBe('gemini-pro');
    });
  });

  describe('createProviderFromConfig', () => {
    it('should create provider from valid local config', () => {
      const config = {
        type: 'local' as const,
      };
      const provider = createProviderFromConfig(config);
      expect(provider).toBeInstanceOf(LocalAIProvider);
    });

    it('should create OpenAIProvider from valid openai config', () => {
      const config = {
        type: 'openai' as const,
        apiKey: 'sk-valid-api-key-for-testing-1234567890',
      };
      const provider = createProviderFromConfig(config);
      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('should create AnthropicProvider from valid anthropic config (AC-ANTHROPIC-007)', () => {
      const config = {
        type: 'anthropic' as const,
        apiKey: 'sk-ant-test-1234567890123456789012345678',
      };
      const provider = createProviderFromConfig(config);
      expect(provider).toBeInstanceOf(AnthropicProvider);
    });

    it('should create GeminiProvider from valid gemini config (AC-104-001)', () => {
      const config = {
        type: 'gemini' as const,
        apiKey: 'AIza_test_123456789012345678901234567890',
      };
      const provider = createProviderFromConfig(config);
      expect(provider).toBeInstanceOf(GeminiProvider);
    });

    it('should create local fallback from invalid openai config', () => {
      const config = {
        type: 'openai' as const,
        // Missing apiKey
      };
      const provider = createProviderFromConfig(config);
      expect(provider).toBeInstanceOf(LocalAIProvider);
    });

    it('should create LocalAIProvider fallback from invalid anthropic config (no API key)', () => {
      // Without API key, the config is invalid, so it falls back to LocalAIProvider
      const config = {
        type: 'anthropic' as const,
      };
      const provider = createProviderFromConfig(config);
      expect(provider).toBeInstanceOf(LocalAIProvider);
    });

    it('should create LocalAIProvider fallback from invalid gemini config (no API key)', () => {
      const config = {
        type: 'gemini' as const,
      };
      const provider = createProviderFromConfig(config);
      expect(provider).toBeInstanceOf(LocalAIProvider);
    });

    it('should create local fallback from unknown config type', () => {
      const config = {
        type: 'unknown' as any,
      };
      const provider = createProviderFromConfig(config);
      expect(provider).toBeInstanceOf(LocalAIProvider);
    });

    it('should handle partial config with defaults', () => {
      const config = {
        type: 'openai' as const,
        apiKey: 'sk-valid-api-key-for-testing-1234567890',
      };
      const provider = createProviderFromConfig(config);
      expect(provider).toBeInstanceOf(OpenAIProvider);
    });
  });

  describe('isProviderImplemented', () => {
    it('should return true for local', () => {
      expect(isProviderImplemented('local')).toBe(true);
    });

    it('should return true for openai', () => {
      expect(isProviderImplemented('openai')).toBe(true);
    });

    it('should return true for anthropic (AC-ANTHROPIC-008)', () => {
      expect(isProviderImplemented('anthropic')).toBe(true);
    });

    it('should return true for gemini (AC-104-001)', () => {
      expect(isProviderImplemented('gemini')).toBe(true);
    });
  });

  describe('getImplementedProviders', () => {
    it('should return array with local, openai, anthropic, and gemini', () => {
      const providers = getImplementedProviders();
      expect(providers).toContain('local');
      expect(providers).toContain('openai');
      expect(providers).toContain('anthropic');
      expect(providers).toContain('gemini');
      expect(providers).toHaveLength(4);
    });
  });

  describe('getAvailableProviders', () => {
    it('should return all provider types including future implementations', () => {
      const providers = getAvailableProviders();
      expect(providers).toContain('local');
      expect(providers).toContain('openai');
      expect(providers).toContain('anthropic');
      expect(providers).toContain('gemini');
    });
  });

  describe('AIProviderFactoryError', () => {
    it('should create error with message and type', () => {
      const error = new AIProviderFactoryError('Test error', 'openai');
      expect(error.message).toBe('Test error');
      expect(error.providerType).toBe('openai');
      expect(error.name).toBe('AIProviderFactoryError');
    });

    it('should include config in error', () => {
      const config = { type: 'openai' as const, apiKey: 'test' };
      const error = new AIProviderFactoryError('Test error', 'openai', config);
      expect(error.config).toEqual(config);
    });
  });

  describe('Provider Switching (AC3)', () => {
    it('should switch between provider types', () => {
      // Create local provider
      let provider = createProvider('local');
      expect(provider.providerType).toBe('local');

      // Switch to openai
      provider = createProvider('openai', { apiKey: 'sk-valid-api-key-for-testing-1234567890' });
      expect(provider.providerType).toBe('openai');

      // Switch to anthropic
      provider = createProvider('anthropic', { apiKey: 'sk-ant-test-1234567890123456789012345678' });
      expect(provider.providerType).toBe('anthropic');

      // Switch to gemini (now implemented)
      provider = createProvider('gemini', { apiKey: 'AIza_test_123456789012345678901234567890' });
      expect(provider.providerType).toBe('gemini');
    });

    it('should create correct provider types on multiple creates', () => {
      const providers = [
        createProvider('local'),
        createProvider('openai', { apiKey: 'sk-valid-api-key-for-testing-1234567890' }),
        createProvider('anthropic', { apiKey: 'sk-ant-test-1234567890123456789012345678' }),
        createProvider('gemini', { apiKey: 'AIza_test_123456789012345678901234567890' }),
      ];

      // First should be LocalAIProvider
      expect(providers[0]).toBeInstanceOf(LocalAIProvider);
      
      // Second should be OpenAIProvider
      expect(providers[1]).toBeInstanceOf(OpenAIProvider);
      
      // Third should be AnthropicProvider
      expect(providers[2]).toBeInstanceOf(AnthropicProvider);
      
      // Fourth should be GeminiProvider (now implemented)
      expect(providers[3]).toBeInstanceOf(GeminiProvider);
    });
  });
});
