/**
 * Prompt Engineering Templates
 * 
 * Templates for AI name and description generation.
 * Supports multiple styles: arcane, mechanical, poetic, mixed.
 * Each style includes relevant keywords for style verification.
 */

// Style keywords for verification (AC4/AC5)
export const STYLE_KEYWORDS = {
  arcane: ['arcane', 'mystical', 'runic', 'ethereal', 'spectral', 'prismatic', 'resonant', 'dimensional'],
  mechanical: ['gear', 'piston', 'valve', 'chamber', 'engine', 'conduit', 'regulator', 'apparatus'],
  poetic: ['whisper', 'echo', 'shimmer', 'gleam', 'drift', 'veil', 'bloom', 'thrum'],
  mixed: ['arcane', 'mechanical', 'poetic', 'mystical', 'ethereal', 'resonant'],
};

/**
 * System context for AI generation
 */
export function getSystemContext(): string {
  return `You are an expert in designing arcane machinery, magical artifacts, and mystical mechanical constructs.

Your task is to generate creative, evocative names and descriptions for magical machines.

Guidelines:
- Names should feel ancient yet powerful
- Descriptions should blend technical detail with mystical atmosphere
- Always stay within the fantasy/steampunk/arcane aesthetic
- Names should be between 5-40 characters
- Descriptions should be 50-800 characters
- Avoid HTML tags or special formatting
- Use evocative language that suggests power and mystery

Output only the requested text, without any preamble or explanation.`;
}

/**
 * Generate name prompt for a machine
 */
export function generateNamePrompt(params: {
  modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
  connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
  faction?: string;
  preferredTags?: string[];
  preferredRarity?: string;
  style?: 'arcane' | 'mechanical' | 'mixed' | 'poetic';
}): string {
  const { modules, connections, faction, preferredTags, preferredRarity, style = 'mixed' } = params;

  // Build module context
  const moduleTypes = modules.map(m => m.type).filter(Boolean);
  const moduleCount = modules.length;
  const connectionCount = connections.length;

  // Build style-specific instructions
  let styleInstructions = '';
  switch (style) {
    case 'arcane':
      styleInstructions = `
Style: ARCANE/MYSTICAL
- Use words like: Void, Ethereal, Spectral, Runic, Prismatic, Dimensional, Celestial
- Names should feel ancient and mysterious
- Include keywords: ${STYLE_KEYWORDS.arcane.join(', ')}`;
      break;
    case 'mechanical':
      styleInstructions = `
Style: MECHANICAL/ENGINEERING
- Use words like: Engine, Conduit, Chamber, Matrix, Actuator, Regulator
- Names should feel precise and technical
- Include keywords: ${STYLE_KEYWORDS.mechanical.join(', ')}`;
      break;
    case 'poetic':
      styleInstructions = `
Style: POETIC/ROMANTIC
- Use evocative imagery: Whisper, Echo, Gleam, Veil, Bloom, Shimmer
- Names should feel lyrical and beautiful
- Include keywords: ${STYLE_KEYWORDS.poetic.join(', ')}`;
      break;
    case 'mixed':
    default:
      styleInstructions = `
Style: MIXED (Arcane + Mechanical)
- Blend mystical and mechanical elements
- Use diverse vocabulary from both domains
- Include keywords: ${STYLE_KEYWORDS.mixed.join(', ')}`;
  }

  // Build faction context
  let factionContext = '';
  if (faction) {
    factionContext = `\nFaction influence: ${faction}`;
  }

  // Build tag context
  let tagContext = '';
  if (preferredTags && preferredTags.length > 0) {
    tagContext = `\nPreferred elements: ${preferredTags.join(', ')}`;
  }

  // Build rarity context
  let rarityContext = '';
  if (preferredRarity) {
    rarityContext = `\nRarity tier: ${preferredRarity}`;
  }

  // Build the complete prompt
  return `Generate a creative name for a magical machine with the following characteristics:

Configuration:
- Module count: ${moduleCount}
- Connection count: ${connectionCount}
- Module types: ${moduleTypes.length > 0 ? moduleTypes.join(', ') : 'generic'}${factionContext}${tagContext}${rarityContext}${styleInstructions}

Requirements:
- Name must be 5-40 characters
- Use title case (e.g., "Void Resonator Prime")
- Avoid generic names like "Machine" or "Device"
- Make it sound unique and powerful

Generate ONLY the name, nothing else.`;
}

/**
 * Generate description prompt for a machine
 */
export function generateDescriptionPrompt(params: {
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
  const { machineName, attributes, style = 'mixed', maxLength = 300 } = params;

  const { rarity, stability, power, tags } = attributes;

  // Build style-specific instructions
  let styleInstructions = '';
  switch (style) {
    case 'technical':
      styleInstructions = `
Style: TECHNICAL
- Focus on specs and measurements
- Include power output and efficiency data
- Use precise, engineering terminology
- Mention stability percentages and performance metrics
- Include keywords: efficiency, output, regulation, capacity, throughput`;
      break;
    case 'flavor':
      styleInstructions = `
Style: FLAVOR/NARRATIVE
- Focus on atmosphere and sensory details
- Describe the machine's presence and effects
- Use evocative, story-driven language
- Mention energy sensations and visual effects
- Include keywords: hums, pulses, glows, crackles, resonates`;
      break;
    case 'lore':
      styleInstructions = `
Style: LORE/HISTORY
- Focus on the machine's backstory and origins
- Mention ancient craftspeople or forgotten workshops
- Include mythical elements and legends
- Reference ancient knowledge or lost technologies
- Include keywords: ancient, forgotten, legends, myths, crafted, forged`;
      break;
    case 'mixed':
    default:
      styleInstructions = `
Style: MIXED
- Blend technical specs with atmospheric narrative
- Include both factual details and evocative descriptions
- Mention both physical construction and mystical properties
- Combine engineering precision with arcane mystery
- Include keywords: constructed, channels, harnesses, pulses, resonates`;
  }

  // Build attributes context
  const attributesContext = `
Machine Attributes:
- Name: ${machineName}
- Rarity: ${rarity}
- Stability: ${stability}%
- Power Output: ${power}%
- Elemental Tags: ${tags.length > 0 ? tags.join(', ') : 'none'}`;

  // Build the complete prompt
  return `Generate a creative description for the magical machine "${machineName}".

${attributesContext}${styleInstructions}

Requirements:
- Description must be ${Math.floor(maxLength * 0.8)}-${maxLength} characters
- Include both technical specs and atmospheric narrative
- Mention the machine's core function and distinctive features
- Reference at least one technical specification
- Add at least one flavor element (visual, auditory, or mystical)
- Avoid HTML tags or special formatting

Generate ONLY the description, nothing else.`;
}

/**
 * Get faction-specific name prefixes
 */
export function getFactionPrefixes(faction: string): string[] {
  const factionMap: Record<string, string[]> = {
    inferno: ['Infernal', 'Crimson', 'Obsidian', 'Blazing', 'Scorching', 'Molten'],
    storm: ['Thunder', 'Lightning', 'Tempest', 'Cyclone', 'Galvanic', 'Tempestuous'],
    stellar: ['Stellar', 'Cosmic', 'Nebular', 'Astral', 'Celestial', 'Solar'],
    void: ['Void', 'Abyssal', 'Shadow', 'Dimensional', 'Eclipsed', 'Null'],
    arcane: ['Arcane', 'Ethereal', 'Prismatic', 'Radiant', 'Mystic', 'Runic'],
    balancing: ['Chrono', 'Phasic', 'Quantum', 'Temporal', 'Equilibrium', 'Harmonic'],
  };

  const normalizedFaction = faction.toLowerCase();
  for (const [key, prefixes] of Object.entries(factionMap)) {
    if (normalizedFaction.includes(key)) {
      return prefixes;
    }
  }
  return [];
}

/**
 * Get rarity-specific name prefixes
 */
export function getRarityPrefixes(rarity: string): string[] {
  const rarityMap: Record<string, string[]> = {
    legendary: ['Void', 'Celestial', 'Eternal', 'Ancient', 'Primordial', 'Transcendent'],
    epic: ['Stellar', 'Cosmic', 'Dimensional', 'Forgotten', 'Mythic', 'Celestial'],
    rare: ['Arcane', 'Nebular', 'Quantum', 'Prismatic', 'Mystic', 'Radiant'],
    uncommon: ['Ethereal', 'Phasic', 'Temporal', 'Resonant', 'Harmonic'],
    common: ['Azure', 'Crimson', 'Frost', 'Amber', 'Jade', 'Slate'],
  };

  return rarityMap[rarity.toLowerCase()] || [];
}

/**
 * Get tag-specific name elements
 */
export function getTagElements(tags: string[]): { prefixes: string[]; suffixes: string[] } {
  const tagMap: Record<string, { prefixes: string[]; suffixes: string[] }> = {
    fire: {
      prefixes: ['Infernal', 'Crimson', 'Blazing', 'Molten'],
      suffixes: ['Inferno', 'Blaze', 'Ember', 'Pyre'],
    },
    lightning: {
      prefixes: ['Thunder', 'Lightning', 'Galvanic'],
      suffixes: ['Storm', 'Surge', 'Bolt', 'Arc'],
    },
    arcane: {
      prefixes: ['Arcane', 'Mystic', 'Ethereal'],
      suffixes: ['Prism', 'Nexus', 'Conduit'],
    },
    void: {
      prefixes: ['Void', 'Abyssal', 'Null'],
      suffixes: ['Vortex', 'Rift', 'Maw'],
    },
    mechanical: {
      prefixes: ['Chrono', 'Quantum', 'Steam'],
      suffixes: ['Engine', 'Matrix', 'Apparatus'],
    },
    protective: {
      prefixes: ['Celestial', 'Radiant', 'Aegis'],
      suffixes: ['Bulwark', 'Shield', 'Barrier'],
    },
    amplifying: {
      prefixes: ['Prismatic', 'Quantum', 'Resonant'],
      suffixes: ['Amplifier', 'Resonator', 'Catalyst'],
    },
    balancing: {
      prefixes: ['Chrono', 'Phasic', 'Equilibrium'],
      suffixes: ['Stabilizer', 'Regulator', 'Harmonizer'],
    },
    explosive: {
      prefixes: ['Infernal', 'Volatile', 'Unstable'],
      suffixes: ['Detonator', 'Exploder', 'Disruptor'],
    },
    stable: {
      prefixes: ['Steady', 'Anchored', 'Grounded'],
      suffixes: ['Stabilizer', 'Anchor', 'Core'],
    },
    resonance: {
      prefixes: ['Harmonic', 'Resonant', 'Vibrant'],
      suffixes: ['Resonator', 'Chamber', 'Field'],
    },
  };

  const result = { prefixes: [] as string[], suffixes: [] as string[] };
  
  for (const tag of tags) {
    const elements = tagMap[tag.toLowerCase()];
    if (elements) {
      result.prefixes.push(...elements.prefixes);
      result.suffixes.push(...elements.suffixes);
    }
  }

  return result;
}

export default {
  getSystemContext,
  generateNamePrompt,
  generateDescriptionPrompt,
  STYLE_KEYWORDS,
  getFactionPrefixes,
  getRarityPrefixes,
  getTagElements,
};
