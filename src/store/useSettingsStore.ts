/**
 * Settings Store
 * 
 * Zustand store for application settings with localStorage persistence.
 * Currently focused on AI provider configuration.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProviderType } from '../services/ai/AIServiceFactory';

/**
 * AI Provider settings
 */
export interface AIProviderSettings {
  /** Current provider type */
  providerType: ProviderType;
  /** API key for external providers (not validated, stored as-is) */
  apiKey?: string;
  /** Custom base URL for API endpoint */
  baseUrl?: string;
  /** Model identifier (e.g., 'gpt-4', 'claude-3') */
  model?: string;
}

/**
 * Settings store state
 */
interface SettingsState {
  /** AI Provider settings */
  aiProvider: AIProviderSettings;
  
  /** Set the AI provider type */
  setProviderType: (type: ProviderType) => void;
  
  /** Update AI provider configuration */
  updateAIProviderConfig: (config: Partial<AIProviderSettings>) => void;
  
  /** Reset AI provider to default (local) */
  resetAIProvider: () => void;
  
  /** Get the current provider type */
  getProviderType: () => ProviderType;
}

/**
 * Default AI provider settings
 */
const DEFAULT_AI_PROVIDER: AIProviderSettings = {
  providerType: 'local',
};

/**
 * Settings store with localStorage persistence
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      aiProvider: DEFAULT_AI_PROVIDER,
      
      /**
       * Set the AI provider type
       */
      setProviderType: (type: ProviderType) => {
        set((state) => ({
          aiProvider: {
            ...state.aiProvider,
            providerType: type,
          },
        }));
      },
      
      /**
       * Update AI provider configuration
       */
      updateAIProviderConfig: (config: Partial<AIProviderSettings>) => {
        set((state) => ({
          aiProvider: {
            ...state.aiProvider,
            ...config,
          },
        }));
      },
      
      /**
       * Reset AI provider to default (local)
       */
      resetAIProvider: () => {
        set({
          aiProvider: DEFAULT_AI_PROVIDER,
        });
      },
      
      /**
       * Get the current provider type
       */
      getProviderType: () => {
        return get().aiProvider.providerType;
      },
    }),
    {
      name: 'arcane-settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        aiProvider: state.aiProvider,
      }),
      // Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error('[useSettingsStore] Hydration failed:', error);
          }
        };
      },
    }
  )
);

/**
 * Manual hydration trigger for settings store
 */
export const hydrateSettingsStore = () => {
  useSettingsStore.persist.rehydrate();
};

/**
 * Check if settings store has hydrated
 */
export const isSettingsHydrated = (): boolean => {
  return useSettingsStore.persist.hasHydrated();
};

/**
 * Provider display names for UI
 */
export const PROVIDER_DISPLAY_NAMES: Record<ProviderType, string> = {
  local: '本地生成器',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
};

/**
 * Provider descriptions for UI
 */
export const PROVIDER_DESCRIPTIONS: Record<ProviderType, string> = {
  local: '使用本地规则生成器，无需网络连接',
  openai: '使用 OpenAI GPT 模型生成（需要 API Key）',
  anthropic: '使用 Anthropic Claude 模型生成（需要 API Key）',
  gemini: '使用 Google Gemini 模型生成（需要 API Key）',
};

/**
 * Provider icons/emojis for UI
 */
export const PROVIDER_ICONS: Record<ProviderType, string> = {
  local: '🏠',
  openai: '🤖',
  anthropic: '🧠',
  gemini: '✨',
};

export default useSettingsStore;
