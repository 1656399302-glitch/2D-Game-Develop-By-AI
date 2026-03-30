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
    
    const prefixes = ['虚空', '星辰', '永恒', '秘银', '奥术', '混沌', '秩序', '深渊', '烈焰', '雷霆', '星辉', '月光'];
    const suffixes = ['增幅器', '共振器', '发生器', '调制器', '转换器', '处理器', '核心', '矩阵', '引擎', '装置', '装置', '仪'];
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
    
    const { style = 'mixed' } = request;
    
    // Generate description based on style
    let description: string;
    let descriptionEn: string;
    let lore: string;
    
    // Base descriptions by style
    const technicalDescriptions = [
      `本装置基于${request.machineName}的设计理念建造，采用精密的能量传导结构。核心模块通过${request.machineContext.connections}条能量管道相互连接，形成稳定的能量循环系统。整体设计遵循标准化接口规范，便于后续维护与升级。`,
      `${request.machineName}采用了模块化设计思想，各个功能单元通过标准接口实现互联互通。装置具备${request.attributes.power}%的功率输出能力，稳定性指标达到${request.attributes.stability}%。能量转换效率优化显著。`,
      `本机结构紧凑，能量利用率高达${Math.round(request.attributes.power * 0.9)}%。${request.machineContext.modules.length}个功能模块协同工作，通过精密的连接系统实现能量与信息的同步传输。故障检测系统完善。`,
    ];
    
    const flavorDescriptions = [
      `这是一台${request.machineName}，散发着神秘的能量光芒。当你靠近时，能感受到一股微弱的震动，仿佛它正在沉睡中呼吸。`,
      `${request.machineName}静静地伫立着，精密的齿轮在黑暗中缓缓转动。它的存在本身就是一首工程与魔法的交响曲。`,
      `当你注视${request.machineName}时，会被其复杂的结构所吸引。每一个模块都有其存在的意义，每一次能量脉动都蕴含着创造者的智慧。`,
    ];
    
    const loreDescriptions = [
      `据古籍记载，${request.machineName}的原型诞生于远古的炼金术士工坊。那个时代的工匠们将他们对元素力量的敬畏与对机械精密的追求，完美地融合在了这台装置之中。`,
      `传说中，这件装置最初由一位隐居的符文大师所创造。他穷尽一生研究能量转化的奥秘，最终将毕生所学凝聚成了这台不朽之作。`,
      `在蒸汽与符文并存的时代，能工巧匠们创造出了无数精妙的机械装置。${request.machineName}便是其中的佼佼者，承载着先辈们的智慧与梦想。`,
    ];
    
    const mixedDescriptions = [
      `${request.machineName}是一台融合了现代工程技术与古老符文魔法的精密装置。它由${request.machineContext.modules.length}个核心模块组成，通过${request.machineContext.connections}条能量管道实现高效连接。`,
      `这台装置展现出惊人的工艺水平。核心组件之间的配合天衣无缝，能量转换效率极高。当你观察它运转时，会发现每一个细节都经过精心设计。`,
      `${request.machineName}不仅仅是一台机器，更是一件艺术品。从精密的齿轮到流淌着能量的管道，无不彰显着设计者的匠心独运。`,
    ];
    
    // Select description based on style
    switch (style) {
      case 'technical':
        description = technicalDescriptions[Math.floor(Math.random() * technicalDescriptions.length)];
        descriptionEn = `This device is constructed based on the design concept of ${request.machineName}, utilizing a precise energy conduction structure.`;
        lore = `Technical documentation traces the origins of such devices to ancient engineering texts.`;
        break;
      case 'flavor':
        description = flavorDescriptions[Math.floor(Math.random() * flavorDescriptions.length)];
        descriptionEn = `A magnificent ${request.machineName} emanates mysterious energy.`;
        lore = `Travelers speak of machines like this in whispered legends.`;
        break;
      case 'lore':
        description = loreDescriptions[Math.floor(Math.random() * loreDescriptions.length)];
        descriptionEn = `According to ancient records, the prototype of ${request.machineName} was created in the ancient alchemist's workshop.`;
        lore = description;
        break;
      case 'mixed':
      default:
        description = mixedDescriptions[Math.floor(Math.random() * mixedDescriptions.length)];
        descriptionEn = `The ${request.machineName} is a sophisticated device combining modern engineering with ancient runic magic.`;
        lore = `Such machines have been crafted by master artisans for generations.`;
    }
    
    // Generate suggested tags based on module composition
    const suggestedTags = this.generateTagsFromModules(request.machineContext);
    
    return {
      description,
      descriptionEn,
      lore,
      tags: suggestedTags,
    };
  }
  
  /**
   * Generate tags based on module composition
   */
  private generateTagsFromModules(context: AIMachineContext): string[] {
    const tags: string[] = [];
    const categorySet = new Set<string>();
    
    // Extract categories from modules
    context.modules.forEach(m => {
      if (m.category && !categorySet.has(m.category)) {
        categorySet.add(m.category);
      }
    });
    
    // Add rarity-based tags
    if (context.rarity) {
      tags.push(context.rarity);
    } else {
      tags.push('common');
    }
    
    // Add category tags
    tags.push(...Array.from(categorySet).slice(0, 3));
    
    // Add complexity tag if many modules
    if (context.modules.length >= 5) {
      tags.push('complex');
    }
    
    // Add stability tag based on connections
    if (context.modules.length > 0 && context.connections >= context.modules.length * 1.5) {
      tags.push('well-connected');
    }
    
    return [...new Set(tags)].slice(0, 5);
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
