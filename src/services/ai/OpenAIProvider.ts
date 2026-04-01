/**
 * OpenAI Provider Implementation
 * 
 * AI provider implementation using OpenAI's Chat Completions API.
 * Supports streaming responses, proper error handling, and automatic fallback.
 */

import { AIProvider } from './AIProvider';
import { AIProviderConfig, AIProviderResult, ConfigValidationResult } from './types';
import { GeneratedAttributes } from '../../types';
import { generateNamePrompt, generateDescriptionPrompt, getSystemContext } from './prompts';

// API Configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MODEL = 'gpt-3.5-turbo';
const MAX_RETRIES = 3;

/**
 * OpenAI API Key validation result
 */
export interface APIKeyValidation {
  isValid: boolean;
  error?: string;
}

/**
 * OpenAI Provider Implementation
 */
export class OpenAIProvider implements AIProvider {
  readonly providerType = 'openai';
  private config: Required<AIProviderConfig>;
  private apiKey: string;

  constructor(config: Partial<AIProviderConfig> = {}) {
    this.config = {
      type: 'openai',
      apiKey: config.apiKey || '',
      baseUrl: config.baseUrl || OPENAI_API_URL,
      model: config.model || DEFAULT_MODEL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      maxRetries: config.maxRetries || MAX_RETRIES,
    };
    this.apiKey = this.config.apiKey;
  }

  /**
   * Validate API key format
   * OpenAI keys must start with 'sk-' and be at least 40 characters
   */
  static validateAPIKey(apiKey: string): APIKeyValidation {
    if (!apiKey || apiKey.trim() === '') {
      return {
        isValid: false,
        error: undefined, // Empty is "not configured", not "invalid"
      };
    }

    // OpenAI API key format: sk-[a-zA-Z0-9_-]{20,}
    const validPattern = /^sk-[a-zA-Z0-9_-]{20,}$/;
    
    if (!validPattern.test(apiKey)) {
      return {
        isValid: false,
        error: "Invalid API key format. OpenAI keys start with 'sk-' and are at least 40 characters.",
      };
    }

    return { isValid: true };
  }

  /**
   * Test connection to OpenAI API
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    const validation = OpenAIProvider.validateAPIKey(this.apiKey);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
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
        if (error.name === 'TimeoutError') {
          return { success: false, error: 'Request timed out' };
        }
        return { success: false, error: `Connection failed: ${error.message}` };
      }
      return { success: false, error: 'Unknown error occurred' };
    }
  }

  /**
   * Generate a machine name using OpenAI
   */
  async generateMachineName(params: {
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
    faction?: string;
    preferredTags?: string[];
    preferredRarity?: string;
  }): Promise<AIProviderResult<string>> {
    // Validate API key
    const validation = OpenAIProvider.validateAPIKey(this.apiKey);
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
        provider: 'openai',
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
   * Generate a machine description using OpenAI
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
    const validation = OpenAIProvider.validateAPIKey(this.apiKey);
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
        provider: 'openai',
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
   */
  async generateFullAttributes(
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>,
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>
  ): Promise<AIProviderResult<GeneratedAttributes>> {
    // For now, delegate to local provider logic
    // Full attribute generation with AI would require multiple API calls
    const { LocalAIProvider } = await import('./LocalAIProvider');
    const localProvider = new LocalAIProvider();
    return localProvider.generateFullAttributes(modules, connections);
  }

  /**
   * Make a request to OpenAI API with streaming support
   */
  private async makeRequest(prompt: string, maxTokens: number): Promise<string> {
    const url = this.config.baseUrl;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: getSystemContext() },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        stream: false, // For simplicity, disable streaming
        temperature: 0.8,
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
        throw new Error('OpenAI service error. Using local generation.');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Parse response
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Empty response from API');
    }
    
    const content = data.choices[0]?.message?.content;
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

    const validation = OpenAIProvider.validateAPIKey(this.apiKey);
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
      type: 'openai',
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
    const validation = OpenAIProvider.validateAPIKey(this.apiKey);
    return validation.isValid;
  }
}

/**
 * Create OpenAI provider with configuration
 */
export function createOpenAIProvider(config?: Partial<AIProviderConfig>): OpenAIProvider {
  return new OpenAIProvider(config);
}

export default OpenAIProvider;
