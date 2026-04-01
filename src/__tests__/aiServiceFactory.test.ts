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

    it('should create LocalAIProvider as fallback for "anthropic" without config (AC3)', () => {
      const provider = createProvider('anthropic', {});
      expect(provider).toBeInstanceOf(LocalAIProvider);
      expect(provider.providerType).toBe('local');
    });

    it('should create LocalAIProvider as fallback for "gemini" without config (AC3)', () => {
      const provider = createProvider('gemini', {});
      expect(provider).toBeInstanceOf(LocalAIProvider);
      expect(provider.providerType).toBe('local');
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

    it('should validate anthropic with apiKey', () => {
      const result = validateProviderConfig('anthropic', { apiKey: 'test-key' });
      expect(result.isValid).toBe(true);
    });

    it('should invalidate gemini without apiKey', () => {
      const result = validateProviderConfig('gemini', {});
      expect(result.isValid).toBe(false);
    });

    it('should validate gemini with apiKey', () => {
      const result = validateProviderConfig('gemini', { apiKey: 'test-key' });
      expect(result.isValid).toBe(true);
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

    it('should return anthropic config with default model', () => {
      const config = getDefaultProviderConfig('anthropic');
      expect(config.type).toBe('anthropic');
      expect(config.model).toBe('claude-3-sonnet-20240229');
    });

    it('should return gemini config with default model', () => {
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

    it('should create local fallback from invalid openai config', () => {
      const config = {
        type: 'openai' as const,
        // Missing apiKey
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

    it('should return false for anthropic', () => {
      expect(isProviderImplemented('anthropic')).toBe(false);
    });

    it('should return false for gemini', () => {
      expect(isProviderImplemented('gemini')).toBe(false);
    });
  });

  describe('getImplementedProviders', () => {
    it('should return array with local and openai', () => {
      const providers = getImplementedProviders();
      expect(providers).toContain('local');
      expect(providers).toContain('openai');
      expect(providers).toHaveLength(2);
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

      // Switch to anthropic (falls back to local - not implemented)
      provider = createProvider('anthropic', { apiKey: 'test' });
      expect(provider.providerType).toBe('local');
    });

    it('should create correct provider types on multiple creates', () => {
      const providers = [
        createProvider('local'),
        createProvider('openai', { apiKey: 'sk-valid-api-key-for-testing-1234567890' }),
        createProvider('local'),
        createProvider('anthropic'),
      ];

      // First and third should be LocalAIProvider
      expect(providers[0]).toBeInstanceOf(LocalAIProvider);
      expect(providers[2]).toBeInstanceOf(LocalAIProvider);
      
      // Second should be OpenAIProvider
      expect(providers[1]).toBeInstanceOf(OpenAIProvider);
      
      // Fourth should fallback to LocalAIProvider (anthropic not implemented)
      expect(providers[3]).toBeInstanceOf(LocalAIProvider);
    });
  });
});
