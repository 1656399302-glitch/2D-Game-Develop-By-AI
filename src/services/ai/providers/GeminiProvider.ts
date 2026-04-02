/**
 * Gemini AI Provider Implementation
 * 
 * AI provider implementation using Google's Gemini API.
 * Supports proper error handling and automatic fallback to LocalAIProvider.
 */

import { AIProvider } from '../AIProvider';
import { AIProviderConfig, AIProviderResult, ConfigValidationResult } from '../types';
import { GeneratedAttributes } from '../../../types';
import { generateNamePrompt, generateDescriptionPrompt, getSystemContext } from '../prompts';

// API Configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MODEL = 'gemini-pro';
const MAX_RETRIES = 3;

/**
 * Gemini API Key validation result
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
 * Gemini Provider Implementation
 */
export class GeminiProvider implements AIProvider {
  readonly providerType = 'gemini';
  private config: Required<AIProviderConfig>;
  private apiKey: string;

  constructor(config: Partial<AIProviderConfig> = {}) {
    this.config = {
      type: 'gemini',
      apiKey: config.apiKey || '',
      baseUrl: config.baseUrl || GEMINI_API_URL,
      model: config.model || DEFAULT_MODEL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      maxRetries: config.maxRetries || MAX_RETRIES,
    };
    this.apiKey = this.config.apiKey;
  }

  /**
   * Validate API key format
   * Gemini API keys are typically 40+ characters alphanumeric strings
   */
  static validateAPIKey(apiKey: string): APIKeyValidation {
    if (!apiKey || apiKey.trim() === '') {
      return {
        isValid: false,
        error: undefined, // Empty is "not configured", not "invalid"
      };
    }

    // Gemini API key format: typically starts with AIza and is 40+ characters
    // We use a more lenient validation since Google doesn't publish exact format
    if (apiKey.length < 30) {
      return {
        isValid: false,
        error: 'API key is too short. Gemini API keys are typically at least 30 characters.',
      };
    }

    // Check for basic alphanumeric with some special characters allowed
    const validPattern = /^[A-Za-z0-9_-]{30,}$/;
    
    if (!validPattern.test(apiKey)) {
      return {
        isValid: false,
        error: "Invalid API key format. API keys should be alphanumeric with at least 30 characters.",
      };
    }

    return { isValid: true };
  }

  /**
   * Test connection to Gemini API
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    const validation = GeminiProvider.validateAPIKey(this.apiKey);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      const endpoint = `${this.config.baseUrl}/${this.config.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: 'Hello' }] }
          ],
          generationConfig: {
            maxOutputTokens: 5,
          },
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (response.ok) {
        return { success: true };
      }

      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || '';
        if (errorMessage.includes('API key')) {
          return { success: false, error: 'Invalid API key. Check your settings and try again.' };
        }
        return { success: false, error: `API error: ${errorMessage || response.statusText}` };
      }

      if (response.status === 403) {
        return { success: false, error: 'API access denied. Check your API key permissions.' };
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
   * Generate text using Gemini API
   * This is the core method for generating content
   */
  async generateText(prompt: string): Promise<string> {
    const endpoint = `${this.config.baseUrl}/${this.config.model}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: `${getSystemContext()}\n\n${prompt}` }] }
        ],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
        },
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || '';
        if (errorMessage.includes('API key')) {
          throw new Error('Invalid API key. Check your settings and try again.');
        }
        throw new Error(`API error: ${errorMessage || response.statusText}`);
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key. Check your settings and try again.');
      }
      if (response.status === 429) {
        throw new Error('API rate limit reached. Please wait a moment.');
      }
      if (response.status >= 500) {
        throw new Error('Gemini service error. Using local generation.');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Parse Gemini's response format
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Empty response from API');
    }
    
    const content = data.candidates[0]?.content?.parts?.[0]?.text;
    if (!content || content.trim() === '') {
      throw new Error('Empty response from API');
    }

    return content.trim();
  }

  /**
   * Generate a machine name using Gemini
   */
  async generateMachineName(params: {
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
    faction?: string;
    preferredTags?: string[];
    preferredRarity?: string;
  }): Promise<AIProviderResult<string>> {
    // Validate API key
    const validation = GeminiProvider.validateAPIKey(this.apiKey);
    if (!validation.isValid) {
      throw new Error(validation.error || 'API key not configured');
    }

    try {
      const prompt = generateNamePrompt(params);
      const response = await this.generateText(prompt);

      // Sanitize response
      const sanitized = this.sanitizeResponse(response);
      
      return {
        data: sanitized,
        isFromAI: true,
        confidence: 0.95,
        provider: 'gemini',
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
   * Generate a machine description using Gemini
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
    const validation = GeminiProvider.validateAPIKey(this.apiKey);
    if (!validation.isValid) {
      throw new Error(validation.error || 'API key not configured');
    }

    try {
      const prompt = generateDescriptionPrompt(params);
      const response = await this.generateText(prompt);

      // Sanitize response
      const sanitized = this.sanitizeResponse(response);
      
      return {
        data: sanitized,
        isFromAI: true,
        confidence: 0.90,
        provider: 'gemini',
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
    const { LocalAIProvider } = await import('../LocalAIProvider');
    const localProvider = new LocalAIProvider();
    return localProvider.generateFullAttributes(modules, connections);
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

    const validation = GeminiProvider.validateAPIKey(this.apiKey);
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
      type: 'gemini',
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
    const validation = GeminiProvider.validateAPIKey(this.apiKey);
    return validation.isValid;
  }
}

/**
 * Create Gemini provider with configuration
 */
export function createGeminiProvider(config?: Partial<AIProviderConfig>): GeminiProvider {
  return new GeminiProvider(config);
}

export default GeminiProvider;
