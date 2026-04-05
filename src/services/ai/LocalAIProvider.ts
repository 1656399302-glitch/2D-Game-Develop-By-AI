/**
 * Local AI Provider
 * 
 * Wraps the existing local rule-based generation utilities.
 * This provider uses the same algorithms as the original generateAttributes
 * function, ensuring backward compatibility.
 */

import { AIProvider } from './AIProvider';
import { AIProviderConfig, AIProviderResult, ConfigValidationResult } from './types';
import { GeneratedAttributes, PlacedModule, Connection, ModuleType } from '../../types';

// Import existing utilities
import { generateAttributes as originalGenerateAttributes } from '../../utils/attributeGenerator';

// Re-export prefix/type/suffix arrays for potential use in generating names
const PREFIXES = [
  'Void', 'Solar', 'Lunar', 'Arcane', 'Ethereal', 'Crimson', 'Azure', 'Obsidian',
  'Stellar', 'Nebula', 'Chrono', 'Phasic', 'Quantum', 'Prismatic', 'Crystalline',
  'Abyssal', 'Celestial', 'Infernal', 'Frost', 'Thunder', 'Storm', 'Shadow', 'Radiant',
  'Temporal', 'Spectral', 'Nebular', 'Cosmic', 'Primal', 'Dimensional'
];

const TYPES = [
  'Amplifier', 'Resonator', 'Converter', 'Disperser', 'Conduit', 'Engine',
  'Chamber', 'Matrix', 'Core', 'Actuator', 'Modulator', 'Capacitor', 'Reactor',
  'Distillator', 'Synchronizer', 'Harmonizer', 'Extractor', 'Infuser', 'Projector',
  'Projector', 'Emissor', 'Resonator', 'Phaser', 'Siphon', 'Conduit', 'Distorter',
  'Transmuter', 'Catalyst', 'Stabilizer', 'Disruptor'
];

const SUFFIXES = [
  'Prime', 'Mk-II', 'Alpha', 'Omega', 'Genesis', 'Apex', 'Zero', 'Infinite',
  'Supreme', 'Master', 'Elite', 'Advanced', 'Hyper', 'Ultra', 'Neo', 'Proto',
  'Ancient', 'Forgotten', 'Eternal', 'Void', 'Stellar', 'Abyssal', 'Temporal',
  'Phased', 'Quantum', 'Resonant', 'Harmonic'
];

const DESCRIPTIONS = [
  'A fascinating contraption that channels raw arcane energy through carefully arranged conduits.',
  'This machine pulses with an otherworldly glow, hinting at the power within.',
  'An intricate assembly of mystical components working in perfect harmony.',
  'The gears turn with celestial precision, driving forces beyond mortal comprehension.',
  'Whispers of ancient knowledge emanate from this remarkable creation.',
  'Energy crackles along its surface, awaiting release through the proper sequence.',
  'A testament to the fusion of mechanical ingenuity and arcane mastery.',
  'The core hums with contained potential, ready to be unleashed.',
  'Arcane resonance patterns weave through this remarkable apparatus.',
  'Power converges at the focal point, prepared for ultimate projection.',
  'Dark energy swirls within, pulling matter toward an unknowable void.',
  'Lightning arcs dance between phase nodes, shifting reality itself.',
  'The machine vibrates with temporal dissonance, out of phase with normal spacetime.',
  'A convergence of opposing forces held in delicate equilibrium.',
  'The construct seems to exist in multiple states simultaneously.',
];

// Random helper functions (matching original implementation)
function randomChoice<T>(arr: T[]): T {
  if (!arr || arr.length === 0) {
    return '' as T;
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Local AI Provider Implementation
 * 
 * Provides local rule-based name and description generation.
 * This is the default provider that wraps existing utilities.
 */
export class LocalAIProvider implements AIProvider {
  readonly providerType = 'local';
  private config: AIProviderConfig;

  constructor(config: Partial<AIProviderConfig> = {}) {
    this.config = {
      type: 'local',
      ...config,
    };
  }

  /**
   * Generate a machine name using local rules
   */
  async generateMachineName(params: {
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
    faction?: string;
    preferredTags?: string[];
    preferredRarity?: string;
  }): Promise<AIProviderResult<string>> {
    try {
      const name = this.generateLocalName(params);
      return {
        data: name,
        isFromAI: false,
        confidence: 0.95, // Local generation is deterministic-ish
        provider: 'local',
      };
    } catch (error) {
      // Fallback to a default name on any error
      console.error('[LocalAIProvider] Error generating name, using default:', error);
      return {
        data: 'Arcane Device Prime',
        isFromAI: false,
        confidence: 0.5,
        provider: 'local',
      };
    }
  }

  /**
   * Internal name generation logic
   */
  private generateLocalName(params: {
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
    faction?: string;
    preferredTags?: string[];
    preferredRarity?: string;
  }): string {
    // Filter prefixes based on faction/preferences if provided
    let availablePrefixes = [...PREFIXES];
    
    if (params.faction) {
      const factionPrefixes = this.getFactionPrefixes(params.faction);
      if (factionPrefixes.length > 0) {
        availablePrefixes = factionPrefixes;
      }
    }

    // Filter based on preferred tags
    if (params.preferredTags && params.preferredTags.length > 0) {
      const tagPrefixes = this.getTagPrefixes(params.preferredTags);
      if (tagPrefixes.length > 0) {
        availablePrefixes = tagPrefixes;
      }
    }

    // Filter based on rarity
    if (params.preferredRarity) {
      const rarityPrefixes = this.getRarityPrefixes(params.preferredRarity);
      if (rarityPrefixes.length > 0) {
        availablePrefixes = rarityPrefixes;
      }
    }

    // Ensure we have at least one prefix
    if (availablePrefixes.length === 0) {
      availablePrefixes = [...PREFIXES];
    }

    const prefix = randomChoice(availablePrefixes);
    const type = randomChoice(TYPES);
    const suffix = randomChoice(SUFFIXES);

    return `${prefix} ${type} ${suffix}`;
  }

  /**
   * Get prefixes filtered by faction
   */
  private getFactionPrefixes(faction: string): string[] {
    if (!faction) return [];
    
    const factionPrefixMap: Record<string, string[]> = {
      inferno: ['Infernal', 'Crimson', 'Obsidian', 'Fire'],
      storm: ['Thunder', 'Lightning', 'Storm', 'Azure'],
      stellar: ['Stellar', 'Cosmic', 'Nebular', 'Celestial'],
      void: ['Void', 'Abyssal', 'Shadow', 'Dimensional'],
      arcane: ['Arcane', 'Ethereal', 'Prismatic', 'Radiant'],
      balancing: ['Chrono', 'Phasic', 'Quantum', 'Temporal'],
    };

    const normalizedFaction = faction.toLowerCase();
    for (const [key, prefixes] of Object.entries(factionPrefixMap)) {
      if (normalizedFaction.includes(key)) {
        return prefixes;
      }
    }
    return [];
  }

  /**
   * Get prefixes filtered by tags
   */
  private getTagPrefixes(tags: string[]): string[] {
    if (!tags || !Array.isArray(tags)) return [];
    
    const tagPrefixMap: Record<string, string[]> = {
      fire: ['Infernal', 'Crimson', 'Obsidian'],
      lightning: ['Thunder', 'Lightning', 'Storm'],
      arcane: ['Arcane', 'Ethereal', 'Prismatic'],
      void: ['Void', 'Abyssal', 'Shadow'],
      mechanical: ['Chrono', 'Quantum', 'Stellar'],
      protective: ['Celestial', 'Radiant', 'Eternal'],
      amplifying: ['Prismatic', 'Quantum', 'Nebular'],
      balancing: ['Chrono', 'Phasic', 'Temporal'],
      explosive: ['Infernal', 'Obsidian', 'Storm'],
      stable: ['Celestial', 'Eternal', 'Stable'],
      resonance: ['Harmonic', 'Resonant', 'Spectral'],
    };

    const matchingPrefixes: string[] = [];
    for (const tag of tags) {
      if (typeof tag !== 'string') continue;
      const prefixes = tagPrefixMap[tag.toLowerCase()];
      if (prefixes) {
        matchingPrefixes.push(...prefixes);
      }
    }
    return [...new Set(matchingPrefixes)];
  }

  /**
   * Get prefixes filtered by rarity
   */
  private getRarityPrefixes(rarity: string): string[] {
    if (!rarity) return [];
    
    const rarityPrefixMap: Record<string, string[]> = {
      legendary: ['Void', 'Celestial', 'Eternal', 'Ancient'],
      epic: ['Stellar', 'Cosmic', 'Dimensional', 'Forgotten'],
      rare: ['Arcane', 'Nebular', 'Quantum', 'Prismatic'],
      uncommon: ['Ethereal', 'Phasic', 'Temporal'],
      common: ['Azure', 'Crimson', 'Frost'],
    };

    return rarityPrefixMap[rarity.toLowerCase()] || [];
  }

  /**
   * Generate a machine description using local rules
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
    try {
      const description = this.generateLocalDescription(params);
      return {
        data: description,
        isFromAI: false,
        confidence: 0.90,
        provider: 'local',
      };
    } catch (error) {
      // Fallback to a default description on any error
      console.error('[LocalAIProvider] Error generating description, using default:', error);
      return {
        data: 'An arcane device of mysterious origin.',
        isFromAI: false,
        confidence: 0.5,
        provider: 'local',
      };
    }
  }

  /**
   * Internal description generation logic
   */
  private generateLocalDescription(params: {
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
  }): string {
    const { style = 'mixed' } = params;
    
    // Handle undefined/null attributes with defaults
    const stability = typeof params.attributes?.stability === 'number' ? params.attributes.stability : 50;
    const power = typeof params.attributes?.power === 'number' ? params.attributes.power : 50;
    
    // Handle empty modules array
    const modules = Array.isArray(params.modules) ? params.modules : [];
    const connections = Array.isArray(params.connections) ? params.connections : [];

    // Select description based on style
    let description: string;

    switch (style) {
      case 'technical':
        description = this.generateTechnicalDescription({
          machineName: params.machineName,
          moduleCount: modules.length,
          connectionCount: connections.length,
          attributes: {
            rarity: params.attributes?.rarity || 'common',
            stability,
            power,
          },
        });
        break;
      case 'flavor':
        description = this.generateFlavorDescription();
        break;
      case 'lore':
        description = this.generateLoreDescription({
          machineName: params.machineName,
          rarity: params.attributes?.rarity || 'common',
        });
        break;
      case 'mixed':
      default:
        description = this.generateMixedDescription({
          moduleCount: modules.length,
          connectionCount: connections.length,
          attributes: {
            rarity: params.attributes?.rarity || 'common',
            stability,
            power,
          },
        });
    }

    // Add stats flavor
    if (stability > 80) {
      description += ' Operating within nominal parameters.';
    } else if (stability < 40) {
      description += ' Warning: System instability detected.';
    }

    // Add power flavor
    if (power > 70) {
      description += ' Exceptional power output registered.';
    } else if (power < 30) {
      description += ' Power output below optimal levels.';
    }

    // Add module-specific details
    description += this.generateModuleDetails(modules);

    // Truncate if maxLength specified
    if (params.maxLength && description.length > params.maxLength) {
      description = description.substring(0, params.maxLength - 3) + '...';
    }

    return description;
  }

  /**
   * Generate a technical-style description
   */
  private generateTechnicalDescription(params: {
    machineName: string;
    moduleCount: number;
    connectionCount: number;
    attributes: { rarity: string; stability: number; power: number };
  }): string {
    return `This ${params.machineName} is constructed with ${params.moduleCount} functional modules ` +
      `interconnected via ${params.connectionCount} energy conduits. ` +
      `System stability registers at ${params.attributes.stability}% with a power output of ${params.attributes.power}%. ` +
      `Classification: ${params.attributes.rarity} tier apparatus.`;
  }

  /**
   * Generate a flavor-style description
   */
  private generateFlavorDescription(): string {
    return randomChoice(DESCRIPTIONS);
  }

  /**
   * Generate a lore-style description
   */
  private generateLoreDescription(params: {
    machineName: string;
    rarity: string;
  }): string {
    const loreTemplates = [
      `Legends speak of the ${params.machineName}, a ${params.rarity} device said to have been forged ` +
        `in the ancient workshops where magic and machinery were first united.`,

      `The ${params.machineName} bears the hallmarks of master craftsmanship from an age ` +
        `when such devices were common in the great arcane academies.`,

      `Scholars believe the ${params.machineName} was once part of a larger apparatus, ` +
        `its secrets lost to time but its power undiminished.`,
    ];

    return randomChoice(loreTemplates);
  }

  /**
   * Generate a mixed-style description
   */
  private generateMixedDescription(params: {
    moduleCount: number;
    connectionCount: number;
    attributes: { rarity: string; stability: number; power: number };
  }): string {
    const flavor = randomChoice(DESCRIPTIONS);
    const technical = ` This apparatus integrates ${params.moduleCount} modules through ${params.connectionCount} connections, ` +
      `producing ${params.attributes.power}% power output with ${params.attributes.stability}% stability.`;

    return flavor + technical;
  }

  /**
   * Generate module-specific detail text
   */
  private generateModuleDetails(modules: Array<{ type: string; category?: string }>): string {
    if (!modules || !Array.isArray(modules)) return '';
    
    const details: string[] = [];

    const hasModule = (type: string) => modules.some(m => m && m.type && m.type.includes(type));

    if (hasModule('output-array')) {
      details.push(' Output array projects focused arcane beams.');
    }
    if (hasModule('void-siphon')) {
      details.push(' The void siphon draws energy from an unknown dimension.');
    }
    if (hasModule('phase-modulator')) {
      details.push(' Phase modulator channels energy with precision control.');
    }
    if (hasModule('fire-crystal')) {
      details.push(' Fire crystals blaze with volatile thermal energy.');
    }
    if (hasModule('resonance-chamber')) {
      details.push(' The resonance chamber amplifies harmonic frequencies.');
    }
    if (hasModule('lightning-conductor')) {
      details.push(' Lightning conductors channel raw electrical fury.');
    }

    return details.join('');
  }

  /**
   * Generate complete machine attributes using existing utilities
   */
  async generateFullAttributes(
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>,
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>
  ): Promise<AIProviderResult<GeneratedAttributes>> {
    try {
      // Convert to PlacedModule format expected by original function
      const safeModules = Array.isArray(modules) ? modules : [];
      const safeConnections = Array.isArray(connections) ? connections : [];
      
      const convertedModules: PlacedModule[] = safeModules.map((m, idx) => ({
        id: m?.id || `generated-${idx}`,
        instanceId: m?.instanceId || m?.id || `generated-${idx}`,
        type: (m?.type || 'core-furnace') as ModuleType,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        flipped: false,
        ports: [],
      }));

      const convertedConnections: Connection[] = safeConnections.map((c, idx) => ({
        id: `conn-${idx}`,
        sourceModuleId: c?.sourceModuleId || '',
        sourcePortId: '',
        targetModuleId: c?.targetModuleId || '',
        targetPortId: '',
        pathData: '',
      }));

      // Use the original generateAttributes function (wrapped in Promise for async interface)
      const attributes = originalGenerateAttributes(convertedModules, convertedConnections);

      return {
        data: attributes,
        isFromAI: false,
        confidence: 0.95,
        provider: 'local',
      };
    } catch (error) {
      // Fallback to default attributes on any error
      console.error('[LocalAIProvider] Error generating full attributes, using defaults:', error);
      return {
        data: {
          name: 'Arcane Device Prime',
          rarity: 'common',
          stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
          tags: ['stable'],
          description: 'An arcane device of mysterious origin.',
          codexId: 'ERR-0000',
        },
        isFromAI: false,
        confidence: 0.5,
        provider: 'local',
      };
    }
  }

  /**
   * Validate provider configuration
   * Local provider always has valid configuration
   */
  validateConfig(): ConfigValidationResult {
    return {
      isValid: true,
      warnings: [],
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIProviderConfig {
    return { ...this.config };
  }

  /**
   * Check if provider is available
   * Local provider is always available
   */
  isAvailable(): boolean {
    return true;
  }
}

// Export factory function for convenience
export function createLocalAIProvider(config?: Partial<AIProviderConfig>): LocalAIProvider {
  return new LocalAIProvider(config);
}

export default LocalAIProvider;
