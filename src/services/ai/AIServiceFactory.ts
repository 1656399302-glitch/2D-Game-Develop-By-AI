/**
 * AI Service Factory
 * 
 * Factory for creating AI provider instances.
 * Handles configuration validation and fallback logic.
 */

import { AIProvider } from './AIProvider';
import { LocalAIProvider } from './LocalAIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { AIProviderConfig, ConfigValidationResult } from './types';

/**
 * Provider type identifier
 */
export type ProviderType = 'local' | 'openai' | 'anthropic' | 'gemini';

/**
 * Factory error class for provider creation failures
 */
export class AIProviderFactoryError extends Error {
  constructor(
    message: string,
    public readonly providerType: ProviderType,
    public readonly config?: Partial<AIProviderConfig>
  ) {
    super(message);
    this.name = 'AIProviderFactoryError';
  }
}

/**
 * Create an AI provider based on configuration
 * 
 * @param type - Provider type ('local', 'openai', 'anthropic', 'gemini')
 * @param config - Optional provider configuration
 * @returns AI provider instance
 * @throws AIProviderFactoryError if provider type is unsupported or configuration is invalid
 */
export function createProvider(
  type: ProviderType,
  config?: Partial<AIProviderConfig>
): AIProvider {
  switch (type) {
    case 'local':
      return new LocalAIProvider(config);

    case 'openai':
      // Create OpenAI provider with config
      // If API key is invalid or missing, it will still create the provider
      // but isAvailable() will return false
      return new OpenAIProvider(config);

    case 'anthropic':
      // Create Anthropic provider with config
      // If API key is invalid or missing, it will still create the provider
      // but isAvailable() will return false
      return new AnthropicProvider(config);

    case 'gemini':
      // Create Gemini provider with config
      // If API key is invalid or missing, it will still create the provider
      // but isAvailable() will return false
      return new GeminiProvider(config);

    default:
      throw new AIProviderFactoryError(
        `Unknown provider type: ${type}`,
        type as ProviderType,
        config
      );
  }
}

/**
 * Validate provider configuration
 * 
 * @param type - Provider type to validate
 * @param config - Configuration to validate
 * @returns Validation result
 */
export function validateProviderConfig(
  type: ProviderType,
  config?: Partial<AIProviderConfig>
): ConfigValidationResult {
  switch (type) {
    case 'local':
      // Local provider has no required configuration
      return {
        isValid: true,
        warnings: [],
      };

    case 'openai':
      // OpenAI requires API key
      if (!config?.apiKey) {
        return {
          isValid: false,
          error: `Provider '${type}' requires an API key.`,
          warnings: ['Local provider will be used as fallback'],
        };
      }

      // Validate API key format
      const openaiValidation = OpenAIProvider.validateAPIKey(config.apiKey);
      if (!openaiValidation.isValid) {
        return {
          isValid: false,
          error: openaiValidation.error,
          warnings: ['Local provider will be used as fallback'],
        };
      }

      // Check for warnings about incomplete configuration
      const warnings: string[] = [];
      if (!config.model) {
        warnings.push(`Provider '${type}' is using default model (gpt-3.5-turbo). Consider specifying a model.`);
      }

      return {
        isValid: true,
        warnings,
      };

    case 'anthropic':
      // Anthropic requires API key
      if (!config?.apiKey) {
        return {
          isValid: false,
          error: `Provider '${type}' requires an API key.`,
          warnings: ['Local provider will be used as fallback'],
        };
      }

      // Validate API key format
      const anthropicValidation = AnthropicProvider.validateAPIKey(config.apiKey);
      if (!anthropicValidation.isValid) {
        return {
          isValid: false,
          error: anthropicValidation.error,
          warnings: ['Local provider will be used as fallback'],
        };
      }

      // Check for warnings about incomplete configuration
      const anthropicWarnings: string[] = [];
      if (!config.model) {
        anthropicWarnings.push(`Provider '${type}' is using default model (claude-3-5-haiku-20241107). Consider specifying a model.`);
      }

      return {
        isValid: true,
        warnings: anthropicWarnings,
      };

    case 'gemini':
      // Gemini requires API key
      if (!config?.apiKey) {
        return {
          isValid: false,
          error: `Provider '${type}' requires an API key.`,
          warnings: ['Local provider will be used as fallback'],
        };
      }

      // Validate API key format
      const geminiValidation = GeminiProvider.validateAPIKey(config.apiKey);
      if (!geminiValidation.isValid) {
        return {
          isValid: false,
          error: geminiValidation.error,
          warnings: ['Local provider will be used as fallback'],
        };
      }

      // Check for warnings about incomplete configuration
      const geminiWarnings: string[] = [];
      if (!config.model) {
        geminiWarnings.push(`Provider '${type}' is using default model (gemini-pro). Consider specifying a model.`);
      }

      return {
        isValid: true,
        warnings: geminiWarnings,
      };

    default:
      return {
        isValid: false,
        error: `Unknown provider type: ${type}`,
      };
  }
}

/**
 * Get default provider configuration
 * 
 * @param type - Provider type
 * @returns Default configuration for the provider type
 */
export function getDefaultProviderConfig(type: ProviderType): AIProviderConfig {
  const baseConfig: Partial<AIProviderConfig> = {
    type,
    timeout: 30000,
    maxRetries: 3,
  };

  switch (type) {
    case 'local':
      return {
        ...baseConfig,
        type: 'local',
      } as AIProviderConfig;

    case 'openai':
      return {
        ...baseConfig,
        type: 'openai',
        model: 'gpt-3.5-turbo',
      } as AIProviderConfig;

    case 'anthropic':
      return {
        ...baseConfig,
        type: 'anthropic',
        model: 'claude-3-5-haiku-20241107',
      } as AIProviderConfig;

    case 'gemini':
      return {
        ...baseConfig,
        type: 'gemini',
        model: 'gemini-pro',
      } as AIProviderConfig;

    default:
      return {
        type: 'local',
      } as AIProviderConfig;
  }
}

/**
 * Create provider from full configuration object
 * 
 * @param config - Complete provider configuration
 * @returns AI provider instance
 */
export function createProviderFromConfig(config: AIProviderConfig): AIProvider {
  // Validate configuration first
  const validation = validateProviderConfig(config.type, config);
  
  if (!validation.isValid) {
    console.warn(
      `[AIServiceFactory] Invalid configuration for provider '${config.type}':`,
      validation.error
    );
    // Return local provider as fallback
    return new LocalAIProvider();
  }

  // Log any warnings
  if (validation.warnings && validation.warnings.length > 0) {
    validation.warnings.forEach(warning => {
      console.warn(`[AIServiceFactory] ${warning}`);
    });
  }

  // Create provider
  try {
    return createProvider(config.type, config);
  } catch (error) {
    if (error instanceof AIProviderFactoryError) {
      console.error(`[AIServiceFactory] Failed to create provider:`, error.message);
      // Return local provider as fallback
      return new LocalAIProvider();
    }
    throw error;
  }
}

/**
 * Check if a provider type is implemented
 * 
 * @param type - Provider type to check
 * @returns True if provider is fully implemented
 */
export function isProviderImplemented(type: ProviderType): boolean {
  return type === 'local' || type === 'openai' || type === 'anthropic' || type === 'gemini';
}

/**
 * Get list of implemented provider types
 * 
 * @returns Array of implemented provider type identifiers
 */
export function getImplementedProviders(): ProviderType[] {
  return ['local', 'openai', 'anthropic', 'gemini'];
}

/**
 * Get list of available provider types (including future implementations)
 * 
 * @returns Array of all available provider type identifiers
 */
export function getAvailableProviders(): ProviderType[] {
  return ['local', 'openai', 'anthropic', 'gemini'];
}

export default {
  createProvider,
  validateProviderConfig,
  getDefaultProviderConfig,
  createProviderFromConfig,
  isProviderImplemented,
  getImplementedProviders,
  getAvailableProviders,
};
