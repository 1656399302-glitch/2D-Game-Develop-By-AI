/**
 * AI Integration Type Definitions
 * 
 * This file contains type definitions for future AI naming and description
 * generation capabilities. The AI service will be used to generate:
 * - Creative machine names based on module composition
 * - Flavor text descriptions
 * - Attribute suggestions
 * 
 * These types are designed to be extensible for various AI providers
 * (OpenAI, Anthropic, local models, etc.)
 */

// Request/Response types for AI naming service
export interface AIMachineContext {
  modules: Array<{
    type: string;
    category: string;
    connections: number;
  }>;
  connections: number;
  existingTags?: string[];
  faction?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface AINameRequest {
  context: AIMachineContext;
  style?: 'arcane' | 'mechanical' | 'mixed' | 'poetic';
  language?: 'zh' | 'en' | 'mixed';
  maxLength?: number;
}

export interface AINameResponse {
  name: string;
  nameEn?: string;
  confidence: number; // 0-1
  alternatives?: Array<{
    name: string;
    nameEn?: string;
    confidence: number;
  }>;
}

export interface AIDescriptionRequest {
  machineContext: AIMachineContext;
  machineName: string;
  attributes: {
    rarity: string;
    stability: number;
    power: number;
    tags: string[];
  };
  style?: 'technical' | 'flavor' | 'lore' | 'mixed';
  maxLength?: number;
}

export interface AIDescriptionResponse {
  description: string;
  descriptionEn?: string;
  lore?: string;
  tags?: string[];
}

export interface AIAttributeSuggestion {
  suggestedTags: string[];
  rarityBoost: number; // -0.2 to +0.2
  powerAdjustment: number;
  stabilityAdjustment: number;
}

// AI Provider configuration
export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'local' | 'mock';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
}

// Service interface for AI operations
export interface AIServiceInterface {
  /**
   * Generate a creative name for a machine based on its composition
   */
  generateName(request: AINameRequest): Promise<AINameResponse>;
  
  /**
   * Generate a description for a machine
   */
  generateDescription(request: AIDescriptionRequest): Promise<AIDescriptionResponse>;
  
  /**
   * Suggest attribute adjustments based on machine composition
   */
  suggestAttributes(context: AIMachineContext): Promise<AIAttributeSuggestion>;
  
  /**
   * Check if the AI service is available/configured
   */
  isAvailable(): boolean;
  
  /**
   * Get the current configuration
   */
  getConfig(): AIProviderConfig;
}

// Connection validation feedback types
export interface ConnectionValidationResult {
  isValid: boolean;
  error?: ConnectionErrorType;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
}

export type ConnectionErrorType = 
  | 'same-port-type'
  | 'connection-exists'
  | 'same-module'
  | 'invalid-port'
  | 'port-occupied'
  | 'self-connection';

export const CONNECTION_ERROR_MESSAGES: Record<ConnectionErrorType, { title: string; suggestion: string }> = {
  'same-port-type': {
    title: '连接类型冲突',
    suggestion: '请从输出端口（圆形）连接到输入端口（方形）',
  },
  'connection-exists': {
    title: '连接已存在',
    suggestion: '这两个端口之间已经存在连接',
  },
  'same-module': {
    title: '无法自连接',
    suggestion: '不能将模块连接到自身',
  },
  'invalid-port': {
    title: '无效端口',
    suggestion: '请选择一个有效的连接端口',
  },
  'port-occupied': {
    title: '端口已被占用',
    suggestion: '该端口已经连接，请选择其他端口或断开现有连接',
  },
  'self-connection': {
    title: '禁止自连接',
    suggestion: '模块不能连接到自己的端口',
  },
};

// Mock AI service for development/testing
export class MockAIService implements AIServiceInterface {
  private config: AIProviderConfig;
  
  constructor(config: Partial<AIProviderConfig> = {}) {
    this.config = {
      provider: 'mock',
      ...config,
    };
  }
  
  async generateName(_request: AINameRequest): Promise<AINameResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const prefixes = ['虚空', '星辰', '永恒', '秘银', '奥术', '混沌', '秩序', '深渊'];
    const suffixes = ['增幅器', '共振器', '发生器', '调制器', '转换器', '处理器', '核心', '矩阵'];
    const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    
    return {
      name,
      confidence: 0.85 + Math.random() * 0.1,
      alternatives: [
        { name: `${prefixes[0]}${suffixes[1]}`, confidence: 0.75 },
        { name: `${prefixes[2]}${suffixes[3]}`, confidence: 0.72 },
      ],
    };
  }
  
  async generateDescription(request: AIDescriptionRequest): Promise<AIDescriptionResponse> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      description: `一台神秘的${request.machineName}，由多个魔法组件精密组合而成。它展现出独特的能量特征，蕴含着创造者深厚的技术功底与创意。`,
      descriptionEn: `A mysterious ${request.machineName} meticulously crafted from arcane components. It exhibits unique energy signatures reflecting the creator's technical prowess.`,
    };
  }
  
  async suggestAttributes(context: AIMachineContext): Promise<AIAttributeSuggestion> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const baseTags = context.modules.map(m => m.category);
    const uniqueTags = [...new Set(baseTags)];
    
    return {
      suggestedTags: uniqueTags.slice(0, 3),
      rarityBoost: 0,
      powerAdjustment: 0,
      stabilityAdjustment: 0,
    };
  }
  
  isAvailable(): boolean {
    return true; // Mock is always available
  }
  
  getConfig(): AIProviderConfig {
    return this.config;
  }
}

// Singleton instance
let aiServiceInstance: AIServiceInterface | null = null;

export function getAIService(): AIServiceInterface {
  if (!aiServiceInstance) {
    aiServiceInstance = new MockAIService();
  }
  return aiServiceInstance;
}

export function setAIService(service: AIServiceInterface): void {
  aiServiceInstance = service;
}
