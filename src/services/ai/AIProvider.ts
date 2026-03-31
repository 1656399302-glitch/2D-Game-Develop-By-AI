/**
 * AI Provider Interface
 * 
 * Abstract interface for AI naming and description generation services.
 * Implement this interface to create providers for different AI backends
 * (local rule-based, OpenAI, Anthropic, etc.)
 */

import { AIProviderConfig, AIProviderResult, ConfigValidationResult } from './types';
import { GeneratedAttributes } from '../../types';

/**
 * Abstract AI Provider Interface
 * 
 * Defines the contract for any AI naming/description service.
 * Implementations must provide:
 * - generateMachineName: Generate creative machine names
 * - generateMachineDescription: Generate machine descriptions
 * - validateConfig: Validate provider configuration
 */
export interface AIProvider {
  /**
   * Provider identifier
   */
  readonly providerType: string;

  /**
   * Generate a creative name for a machine
   * @param params Generation parameters including modules and connections
   * @returns Generated name with metadata
   */
  generateMachineName(params: {
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
    faction?: string;
    preferredTags?: string[];
    preferredRarity?: string;
  }): AIProviderResult<string>;

  /**
   * Generate a description for a machine
   * @param params Generation parameters including modules, connections, and machine attributes
   * @returns Generated description with metadata
   */
  generateMachineDescription(params: {
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
    machineName: string;
    attributes: {
      rarity: string;
      stability: number;
      power: number;
      tags: string[];
    };
    style?: 'technical' | 'flavor' | 'lore' | 'mixed';
    maxLength?: number;
  }): AIProviderResult<string>;

  /**
   * Generate complete machine attributes (name, description, stats, tags)
   * @param modules List of modules in the machine
   * @param connections List of connections between modules
   * @returns Complete generated attributes
   */
  generateFullAttributes(
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>,
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>
  ): AIProviderResult<GeneratedAttributes>;

  /**
   * Validate the provider configuration
   * @returns Validation result with any errors or warnings
   */
  validateConfig(): ConfigValidationResult;

  /**
   * Get the current provider configuration
   * @returns Current configuration
   */
  getConfig(): AIProviderConfig;

  /**
   * Check if this provider is available (configured and working)
   * @returns True if the provider can generate results
   */
  isAvailable(): boolean;
}
