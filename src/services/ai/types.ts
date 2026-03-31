/**
 * AI Service Types
 * 
 * Type definitions for the AI naming and description service architecture.
 * These types support both local rule-based generation and future AI provider integrations.
 */

import { PlacedModule, Connection, GeneratedAttributes, AttributeTag } from '../../types';

/**
 * Name generation parameters
 */
export interface NameGenerationParams {
  /** Modules in the machine */
  modules: PlacedModule[];
  /** Connections between modules */
  connections: Connection[];
  /** Optional preferred faction for name style */
  faction?: string;
  /** Optional preferred tags for name style */
  preferredTags?: AttributeTag[];
  /** Optional preferred rarity for name style */
  preferredRarity?: string;
}

/**
 * Description generation parameters
 */
export interface DescriptionGenerationParams {
  /** Modules in the machine */
  modules: PlacedModule[];
  /** Connections between modules */
  connections: Connection[];
  /** Machine name to include in description */
  machineName: string;
  /** Machine attributes for context */
  attributes: {
    rarity: string;
    stability: number;
    power: number;
    tags: AttributeTag[];
  };
  /** Description style preference */
  style?: 'technical' | 'flavor' | 'lore' | 'mixed';
  /** Maximum description length */
  maxLength?: number;
}

/**
 * Result wrapper for AI service responses
 */
export interface AIProviderResult<T> {
  /** The generated content */
  data: T;
  /** Whether this came from an AI provider (true) or local generation (false) */
  isFromAI: boolean;
  /** Confidence score (0-1) - only meaningful for AI providers */
  confidence: number;
  /** Provider identifier */
  provider: string;
}

/**
 * AI Provider configuration
 */
export interface AIProviderConfig {
  /** Provider type identifier */
  type: 'local' | 'openai' | 'anthropic' | 'gemini';
  /** API key for external providers (not used for 'local') */
  apiKey?: string;
  /** Base URL for API endpoint (optional, for custom endpoints) */
  baseUrl?: string;
  /** Model identifier (e.g., 'gpt-4', 'claude-3') */
  model?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retry attempts for failed requests */
  maxRetries?: number;
}

/**
 * Full generation result combining name and description
 */
export interface FullGenerationResult {
  /** Generated attributes including name, description, and stats */
  attributes: GeneratedAttributes;
  /** Whether this came from an AI provider */
  isFromAI: boolean;
  /** Provider identifier */
  provider: string;
}

/**
 * Validation result for provider configuration
 */
export interface ConfigValidationResult {
  /** Whether the configuration is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Warnings if configuration is suboptimal */
  warnings?: string[];
}
