/**
 * AI Types Re-export
 * 
 * Central re-export point for AI service types.
 * Provides a clean public API for consuming components.
 */

// Re-export from services/ai/types
export {
  type NameGenerationParams,
  type DescriptionGenerationParams,
  type AIProviderResult,
  type AIProviderConfig,
  type FullGenerationResult,
  type ConfigValidationResult,
} from '../services/ai/types';

// Re-export from services/ai/AIProvider
export {
  type AIProvider,
} from '../services/ai/AIProvider';

// Re-export from services/ai/AIServiceFactory
export {
  type ProviderType,
  AIProviderFactoryError,
  createProvider,
  validateProviderConfig,
  getDefaultProviderConfig,
  createProviderFromConfig,
  isProviderImplemented,
  getImplementedProviders,
  getAvailableProviders,
} from '../services/ai/AIServiceFactory';

// Re-export hook
export {
  type UseAINamingOptions,
  type UseAINamingReturn,
  useAINaming,
} from '../hooks/useAINaming';
