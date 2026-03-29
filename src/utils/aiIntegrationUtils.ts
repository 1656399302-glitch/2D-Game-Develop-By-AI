import {
  getAIService,
  AIMachineContext,
  AIDescriptionRequest,
  AIDescriptionResponse,
  AIAttributeSuggestion,
  AINameRequest,
  AINameResponse,
} from '../types/aiIntegration';

/**
 * Description style options
 */
export type DescriptionStyle = 'technical' | 'flavor' | 'lore' | 'mixed';

/**
 * Description style display labels
 */
export const DESCRIPTION_STYLE_LABELS: Record<DescriptionStyle, string> = {
  technical: '技术描述',
  flavor: '风味描述',
  lore: '背景故事',
  mixed: '综合描述',
};

/**
 * Machine attributes for AI description generation
 */
export interface MachineAttributes {
  rarity: string;
  stability: number;
  power: number;
  tags: string[];
  name: string;
}

/**
 * Generate machine context from module data
 */
export function buildMachineContext(
  modules: Array<{ type: string; category: string; id: string }>,
  connections: Array<{ sourceModuleId: string; targetModuleId: string }>
): AIMachineContext {
  const moduleSummary = modules.map((m) => ({
    type: m.type,
    category: m.category || 'unknown',
    connections: connections.filter(
      (c) => c.sourceModuleId === m.id || c.targetModuleId === m.id
    ).length,
  }));
  
  return {
    modules: moduleSummary,
    connections: connections.length,
    existingTags: [],
  };
}

/**
 * Generate a description for a machine using AI
 */
export async function generateMachineDescription(
  machineContext: AIMachineContext,
  machineName: string,
  attributes: MachineAttributes,
  style: DescriptionStyle = 'mixed',
  maxLength: number = 200
): Promise<AIDescriptionResponse> {
  const aiService = getAIService();
  
  const request: AIDescriptionRequest = {
    machineContext,
    machineName,
    attributes: {
      rarity: attributes.rarity,
      stability: attributes.stability,
      power: attributes.power,
      tags: attributes.tags,
    },
    style,
    maxLength,
  };
  
  return aiService.generateDescription(request);
}

/**
 * Generate multiple name suggestions using AI
 */
export async function generateMultipleNames(
  machineContext: AIMachineContext,
  style: 'arcane' | 'mechanical' | 'mixed' | 'poetic' = 'mixed',
  count: number = 3
): Promise<AINameResponse[]> {
  const aiService = getAIService();
  const results: AINameResponse[] = [];
  
  // Generate primary name
  const primaryRequest: AINameRequest = {
    context: machineContext,
    style,
    language: 'mixed',
    maxLength: 20,
  };
  
  const primaryResponse = await aiService.generateName(primaryRequest);
  results.push(primaryResponse);
  
  // Generate alternative names if available
  if (primaryResponse.alternatives && primaryResponse.alternatives.length > 0) {
    for (let i = 0; i < Math.min(count - 1, primaryResponse.alternatives.length); i++) {
      const alt = primaryResponse.alternatives[i];
      results.push({
        name: alt.name,
        nameEn: alt.nameEn,
        confidence: alt.confidence,
      });
    }
  }
  
  return results.slice(0, count);
}

/**
 * Get attribute suggestions from AI based on machine composition
 */
export async function getAttributeSuggestions(
  machineContext: AIMachineContext
): Promise<AIAttributeSuggestion> {
  const aiService = getAIService();
  return aiService.suggestAttributes(machineContext);
}

/**
 * Check if AI service is available
 */
export function isAIServiceAvailable(): boolean {
  try {
    const aiService = getAIService();
    return aiService.isAvailable();
  } catch {
    return false;
  }
}

/**
 * Generate a formatted description for display
 */
export function formatDescriptionForDisplay(
  description: AIDescriptionResponse,
  style: DescriptionStyle
): string {
  switch (style) {
    case 'technical':
      return description.description;
    case 'flavor':
      return description.description;
    case 'lore':
      return description.lore || description.description;
    case 'mixed':
    default:
      return description.description;
  }
}

/**
 * Create a machine description card content
 */
export interface MachineDescriptionCard {
  title: string;
  description: string;
  lore?: string;
  tags: string[];
  attributes: {
    stability: number;
    power: number;
    rarity: string;
  };
}

export async function createMachineDescriptionCard(
  machineContext: AIMachineContext,
  machineName: string,
  attributes: MachineAttributes,
  style: DescriptionStyle = 'mixed'
): Promise<MachineDescriptionCard> {
  const descriptionResponse = await generateMachineDescription(
    machineContext,
    machineName,
    attributes,
    style
  );
  
  return {
    title: machineName,
    description: descriptionResponse.description,
    lore: descriptionResponse.lore,
    tags: descriptionResponse.tags || attributes.tags,
    attributes: {
      stability: attributes.stability,
      power: attributes.power,
      rarity: attributes.rarity,
    },
  };
}

/**
 * Utility to generate a shareable text summary of a machine
 */
export function generateMachineSummary(
  name: string,
  moduleCount: number,
  connectionCount: number,
  tags: string[]
): string {
  const tagList = tags.slice(0, 3).join(', ');
  return `【${name}】${moduleCount}模块 | ${connectionCount}连接 | ${tagList}`;
}

/**
 * Suggest tags based on module composition
 */
export function suggestTagsFromModules(
  modules: Array<{ type: string; category: string }>
): string[] {
  const tagSet = new Set<string>();
  
  modules.forEach((m) => {
    // Add category as tag
    if (m.category) {
      tagSet.add(m.category);
    }
    
    // Add type-specific tags
    const typeTags = getTagsForModuleType(m.type);
    typeTags.forEach((t) => tagSet.add(t));
  });
  
  return Array.from(tagSet).slice(0, 5);
}

/**
 * Get default tags for module types
 */
function getTagsForModuleType(type: string): string[] {
  const typeTagMap: Record<string, string[]> = {
    coreFurnace: ['energy-source', 'core'],
    voidSiphon: ['void', 'absorption'],
    stabilizerCore: ['stability', 'balanced'],
    phaseModulator: ['phase', 'modulation'],
    fireCrystal: ['fire', 'elemental'],
    lightningConductor: ['lightning', 'elemental'],
    amplifierCrystal: ['amplification', 'boost'],
    resonanceChamber: ['resonance', 'harmonic'],
    shieldShell: ['defense', 'protection'],
    triggerSwitch: ['trigger', 'control'],
    outputArray: ['output', 'result'],
    gear: ['mechanical', 'kinetic'],
    energyPipe: ['transfer', 'connection'],
    runeNode: ['arcane', 'rune'],
  };
  
  return typeTagMap[type] || ['generic'];
}

/**
 * Calculate rarity from machine complexity and connections
 */
export function calculateRarityFromComplexity(
  moduleCount: number,
  connectionCount: number,
  stability: number
): string {
  const complexity = moduleCount * 0.4 + connectionCount * 0.3 + stability * 0.3;
  
  if (complexity >= 90) return 'legendary';
  if (complexity >= 75) return 'epic';
  if (complexity >= 50) return 'rare';
  if (complexity >= 25) return 'uncommon';
  return 'common';
}

/**
 * Generate a brief machine profile for sharing
 */
export function generateMachineProfile(
  name: string,
  attributes: MachineAttributes,
  moduleCount: number,
  connectionCount: number
): string {
  const rarityEmoji = {
    common: '⚪',
    uncommon: '🟢',
    rare: '🔵',
    epic: '🟣',
    legendary: '🟡',
  };
  
  const emoji = rarityEmoji[attributes.rarity as keyof typeof rarityEmoji] || '⚪';
  
  return `${emoji} ${name}\n` +
    `📊 稳定性: ${attributes.stability}%\n` +
    `⚡ 功率: ${attributes.power}%\n` +
    `📦 ${moduleCount} 模块 | 🔗 ${connectionCount} 连接\n` +
    `🏷️ ${attributes.tags.slice(0, 3).join(', ')}`;
}

export default {
  buildMachineContext,
  generateMachineDescription,
  generateMultipleNames,
  getAttributeSuggestions,
  isAIServiceAvailable,
  formatDescriptionForDisplay,
  createMachineDescriptionCard,
  generateMachineSummary,
  suggestTagsFromModules,
  calculateRarityFromComplexity,
  generateMachineProfile,
};
