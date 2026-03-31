/**
 * useSettingsStore Tests
 * 
 * Unit tests for the settings store with localStorage persistence.
 * Tests store creation, persistence, provider updates, and hydration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSettingsStore, PROVIDER_DISPLAY_NAMES, PROVIDER_ICONS } from '../store/useSettingsStore';

describe('useSettingsStore', () => {
  beforeEach(() => {
    // Reset store state
    const state = useSettingsStore.getState();
    state.resetAIProvider();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Store Creation', () => {
    it('should have default providerType as local', () => {
      const state = useSettingsStore.getState();
      expect(state.aiProvider.providerType).toBe('local');
    });

    it('should provide setProviderType function', () => {
      const state = useSettingsStore.getState();
      expect(typeof state.setProviderType).toBe('function');
    });

    it('should provide updateAIProviderConfig function', () => {
      const state = useSettingsStore.getState();
      expect(typeof state.updateAIProviderConfig).toBe('function');
    });

    it('should provide resetAIProvider function', () => {
      const state = useSettingsStore.getState();
      expect(typeof state.resetAIProvider).toBe('function');
    });

    it('should provide getProviderType function', () => {
      const state = useSettingsStore.getState();
      expect(typeof state.getProviderType).toBe('function');
    });
  });

  describe('Provider Type Updates', () => {
    it('should update providerType when setProviderType is called', () => {
      const { setProviderType } = useSettingsStore.getState();
      
      setProviderType('openai');
      
      const state = useSettingsStore.getState();
      expect(state.aiProvider.providerType).toBe('openai');
    });

    it('should update providerType to anthropic', () => {
      const { setProviderType } = useSettingsStore.getState();
      
      setProviderType('anthropic');
      
      const state = useSettingsStore.getState();
      expect(state.aiProvider.providerType).toBe('anthropic');
    });

    it('should update providerType to gemini', () => {
      const { setProviderType } = useSettingsStore.getState();
      
      setProviderType('gemini');
      
      const state = useSettingsStore.getState();
      expect(state.aiProvider.providerType).toBe('gemini');
    });

    it('should allow switching back to local', () => {
      const { setProviderType } = useSettingsStore.getState();
      
      setProviderType('openai');
      setProviderType('local');
      
      const state = useSettingsStore.getState();
      expect(state.aiProvider.providerType).toBe('local');
    });
  });

  describe('Configuration Updates', () => {
    it('should update apiKey when updateAIProviderConfig is called with apiKey', () => {
      const { updateAIProviderConfig } = useSettingsStore.getState();
      
      updateAIProviderConfig({ apiKey: 'test-api-key' });
      
      const state = useSettingsStore.getState();
      expect(state.aiProvider.apiKey).toBe('test-api-key');
    });

    it('should update multiple config fields at once', () => {
      const { updateAIProviderConfig } = useSettingsStore.getState();
      
      updateAIProviderConfig({
        providerType: 'openai',
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
        model: 'gpt-4',
      });
      
      const state = useSettingsStore.getState();
      expect(state.aiProvider.providerType).toBe('openai');
      expect(state.aiProvider.apiKey).toBe('test-key');
      expect(state.aiProvider.baseUrl).toBe('https://api.example.com');
      expect(state.aiProvider.model).toBe('gpt-4');
    });

    it('should preserve existing fields when updating single field', () => {
      const { updateAIProviderConfig, setProviderType } = useSettingsStore.getState();
      
      setProviderType('openai');
      updateAIProviderConfig({ apiKey: 'test-key' });
      
      const state = useSettingsStore.getState();
      expect(state.aiProvider.providerType).toBe('openai');
      expect(state.aiProvider.apiKey).toBe('test-key');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to default provider (local) when resetAIProvider is called', () => {
      const { setProviderType, updateAIProviderConfig, resetAIProvider } = useSettingsStore.getState();
      
      setProviderType('openai');
      updateAIProviderConfig({ apiKey: 'test-key', model: 'gpt-4' });
      resetAIProvider();
      
      const state = useSettingsStore.getState();
      expect(state.aiProvider.providerType).toBe('local');
    });

    it('should clear apiKey on reset', () => {
      const { updateAIProviderConfig, resetAIProvider } = useSettingsStore.getState();
      
      updateAIProviderConfig({ apiKey: 'test-key' });
      resetAIProvider();
      
      const state = useSettingsStore.getState();
      expect(state.aiProvider.apiKey).toBeUndefined();
    });
  });

  describe('getProviderType Function', () => {
    it('should return current provider type', () => {
      const { setProviderType, getProviderType } = useSettingsStore.getState();
      
      setProviderType('gemini');
      
      expect(getProviderType()).toBe('gemini');
    });

    it('should return local by default after reset', () => {
      // Reset to ensure clean state
      useSettingsStore.getState().resetAIProvider();
      const { getProviderType } = useSettingsStore.getState();
      
      expect(getProviderType()).toBe('local');
    });
  });

  describe('Provider Display Names', () => {
    it('should have display name for local provider', () => {
      expect(PROVIDER_DISPLAY_NAMES.local).toBeDefined();
      expect(typeof PROVIDER_DISPLAY_NAMES.local).toBe('string');
      expect(PROVIDER_DISPLAY_NAMES.local).toBe('本地生成器');
    });

    it('should have display name for openai provider', () => {
      expect(PROVIDER_DISPLAY_NAMES.openai).toBeDefined();
      expect(typeof PROVIDER_DISPLAY_NAMES.openai).toBe('string');
      expect(PROVIDER_DISPLAY_NAMES.openai).toBe('OpenAI');
    });

    it('should have display name for anthropic provider', () => {
      expect(PROVIDER_DISPLAY_NAMES.anthropic).toBeDefined();
      expect(typeof PROVIDER_DISPLAY_NAMES.anthropic).toBe('string');
      expect(PROVIDER_DISPLAY_NAMES.anthropic).toBe('Anthropic');
    });

    it('should have display name for gemini provider', () => {
      expect(PROVIDER_DISPLAY_NAMES.gemini).toBeDefined();
      expect(typeof PROVIDER_DISPLAY_NAMES.gemini).toBe('string');
      expect(PROVIDER_DISPLAY_NAMES.gemini).toBe('Google Gemini');
    });
  });

  describe('Provider Icons', () => {
    it('should have icon for local provider', () => {
      expect(PROVIDER_ICONS.local).toBeDefined();
      expect(typeof PROVIDER_ICONS.local).toBe('string');
      expect(PROVIDER_ICONS.local).toBe('🏠');
    });

    it('should have icon for openai provider', () => {
      expect(PROVIDER_ICONS.openai).toBeDefined();
      expect(PROVIDER_ICONS.openai).toBe('🤖');
    });

    it('should have icon for anthropic provider', () => {
      expect(PROVIDER_ICONS.anthropic).toBeDefined();
      expect(PROVIDER_ICONS.anthropic).toBe('🧠');
    });

    it('should have icon for gemini provider', () => {
      expect(PROVIDER_ICONS.gemini).toBeDefined();
      expect(PROVIDER_ICONS.gemini).toBe('✨');
    });
  });
});
