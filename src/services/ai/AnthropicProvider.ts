/**
 * Anthropic AI Provider Implementation
 * 
 * AI provider implementation using Anthropic's Claude API.
 * Supports proper error handling and automatic fallback.
 */

import { AIProvider } from './AIProvider';
import { AIProviderConfig, AIProviderResult, ConfigValidationResult } from './types';
import { GeneratedAttributes } from '../../types';
import { generateNamePrompt, generateDescriptionPrompt, getSystemContext } from './prompts';

// API Configuration
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MODEL = 'claude-3-5-haiku-20241107';
const MAX_RETRIES = 3;

/**
 * Anthropic API Key validation result
 */
export interface APIKeyValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Check if an error is a timeout-related error
 */
function isTimeoutError(error: Error): boolean {
  return (
    error.name === 'TimeoutError' ||
    error.name === 'AbortError' ||
    error.message.includes('timed out') ||
    error.message.includes('timeout') ||
    error.message.includes('aborted')
  );
}

/**
 * Anthropic Provider Implementation
 */
export class AnthropicProvider implements AIProvider {
  readonly providerType = 'anthropic';
  private config: Required<AIProviderConfig>;
  private apiKey: string;

  constructor(config: Partial<AIProviderConfig> = {}) {
    this.config = {
      type: 'anthropic',
      apiKey: config.apiKey || '',
      baseUrl: config.baseUrl || ANTHROPIC_API_URL,
      model: config.model || DEFAULT_MODEL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      maxRetries: config.maxRetries || MAX_RETRIES,
    };
    this.apiKey = this.config.apiKey;
  }

  /**
   * Validate API key format
   * Anthropic keys must start with 'sk-ant-' and be at least 40 characters
   */
  static validateAPIKey(apiKey: string): APIKeyValidation {
    if (!apiKey || apiKey.trim() === '') {
      return {
        isValid: false,
        error: undefined, // Empty is "not configured", not "invalid"
      };
    }

    // Anthropic API key format: sk-ant-[a-zA-Z0-9_-]{30,}
    const validPattern = /^sk-ant-[a-zA-Z0-9_-]{30,}$/;
    
    if (!validPattern.test(apiKey)) {
      return {
        isValid: false,
        error: "Invalid API key format. Anthropic keys start with 'sk-ant-' and are at least 40 characters.",
      };
    }

    return { isValid: true };
  }

  /**
   * Test connection to Anthropic API
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    const validation = AnthropicProvider.validateAPIKey(this.apiKey);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'user', content: 'Hello' }
          ],
          max_tokens: 5,
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (response.ok) {
        return { success: true };
      }

      if (response.status === 401) {
        return { success: false, error: 'Invalid API key. Check your settings and try again.' };
      }

      if (response.status === 429) {
        return { success: false, error: 'API rate limit reached. Please wait a moment.' };
      }

      return { success: false, error: `API returned status ${response.status}` };
    } catch (error) {
      if (error instanceof Error) {
        if (isTimeoutError(error)) {
          return { success: false, error: 'Request timed out' };
        }
        return { success: false, error: `Connection failed: ${error.message}` };
      }
      return { success: false, error: 'Unknown error occurred' };
    }
  }

  /**
   * Generate a machine name using Claude
   */
  async generateMachineName(params: {
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
    faction?: string;
    preferredTags?: string[];
    preferredRarity?: string;
  }): Promise<AIProviderResult<string>> {
    // Validate API key
    const validation = AnthropicProvider.validateAPIKey(this.apiKey);
    if (!validation.isValid) {
      throw new Error(validation.error || 'API key not configured');
    }

    try {
      const prompt = generateNamePrompt(params);
      const response = await this.makeRequest(prompt, 100);

      // Sanitize response
      const sanitized = this.sanitizeResponse(response);
      
      return {
        data: sanitized,
        isFromAI: true,
        confidence: 0.95,
        provider: 'anthropic',
      };
    } catch (error) {
      // Re-throw with context for fallback handling
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Name generation failed');
    }
  }

  /**
   * Generate a machine description using Claude
   */
  async generateMachineDescription(params: {
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
  }): Promise<AIProviderResult<string>> {
    // Validate API key
    const validation = AnthropicProvider.validateAPIKey(this.apiKey);
    if (!validation.isValid) {
      throw new Error(validation.error || 'API key not configured');
    }

    try {
      const prompt = generateDescriptionPrompt(params);
      const response = await this.makeRequest(prompt, params.maxLength || 300);

      // Sanitize response
      const sanitized = this.sanitizeResponse(response);
      
      return {
        data: sanitized,
        isFromAI: true,
        confidence: 0.90,
        provider: 'anthropic',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Description generation failed');
    }
  }

  /**
   * Generate complete machine attributes
   * Falls back to local provider since full attribute generation requires multiple API calls
   */
  async generateFullAttributes(
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>,
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>
  ): Promise<AIProviderResult<GeneratedAttributes>> {
    // Delegate to local provider for full attribute generation
    const { LocalAIProvider } = await import('./LocalAIProvider');
    const localProvider = new LocalAIProvider();
    return localProvider.generateFullAttributes(modules, connections);
  }

  /**
   * Make a request to Anthropic API
   */
  private async makeRequest(prompt: string, maxTokens: number): Promise<string> {
    const url = this.config.baseUrl;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'user', content: `${getSystemContext()}\n\n${prompt}` }
        ],
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Check your settings and try again.');
      }
      if (response.status === 429) {
        throw new Error('API rate limit reached. Please wait a moment.');
      }
      if (response.status >= 500) {
        throw new Error('Anthropic service error. Using local generation.');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Parse Claude's response format
    if (!data.content || data.content.length === 0) {
      throw new Error('Empty response from API');
    }
    
    const content = data.content[0]?.text;
    if (!content || content.trim() === '') {
      throw new Error('Empty response from API');
    }

    return content.trim();
  }

  /**
   * Sanitize API response
   * Remove HTML tags, control characters, and error messages
   */
  private sanitizeResponse(response: string): string {
    let sanitized = response;

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1f]/g, '');

    // Remove API error messages
    sanitized = sanitized.replace(/error:.*?(?=\s|$)/gi, '');
    sanitized = sanitized.replace(/API error.*?(?=\s|$)/gi, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Validate provider configuration
   */
  validateConfig(): ConfigValidationResult {
    if (!this.apiKey) {
      return {
        isValid: false,
        error: 'API key not configured',
        warnings: ['Local provider will be used as fallback'],
      };
    }

    const validation = AnthropicProvider.validateAPIKey(this.apiKey);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.error,
        warnings: ['Local provider will be used as fallback'],
      };
    }

    return {
      isValid: true,
      warnings: [],
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIProviderConfig {
    return {
      type: 'anthropic',
      apiKey: this.apiKey,
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
    };
  }

  /**
   * Update API key
   */
  setAPIKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.config.apiKey = apiKey;
  }

  /**
   * Update model
   */
  setModel(model: string): void {
    this.config.model = model;
  }

  /**
   * Check if provider is available (has valid API key)
   */
  isAvailable(): boolean {
    const validation = AnthropicProvider.validateAPIKey(this.apiKey);
    return validation.isValid;
  }
}

/**
 * Create Anthropic provider with configuration
 */
export function createAnthropicProvider(config?: Partial<AIProviderConfig>): AnthropicProvider {
  return new AnthropicProvider(config);
}

export default AnthropicProvider;
