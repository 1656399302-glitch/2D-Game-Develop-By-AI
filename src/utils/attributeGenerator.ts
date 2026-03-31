import { v4 as uuidv4 } from 'uuid';
import { PlacedModule, Connection, GeneratedAttributes, Rarity, AttributeTag, MachineStats, ModuleType } from '../types';

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

const TAG_EFFECTS: Record<AttributeTag, { stability: number; power: number; energy: number }> = {
  fire: { stability: -5, power: 15, energy: 10 },
  lightning: { stability: -10, power: 20, energy: 15 },
  arcane: { stability: 5, power: 10, energy: 5 },
  void: { stability: -5, power: 25, energy: 0 },
  mechanical: { stability: 15, power: 5, energy: 5 },
  protective: { stability: 20, power: -5, energy: 10 },
  amplifying: { stability: -5, power: 15, energy: 10 },
  balancing: { stability: 10, power: 5, energy: -5 },
  explosive: { stability: -15, power: 30, energy: 20 },
  stable: { stability: 15, power: 0, energy: 0 },
  resonance: { stability: 0, power: 20, energy: 5 },
  temporal: { stability: -10, power: 15, energy: 15 },
  dimensional: { stability: -15, power: 25, energy: 10 },
};

const MODULE_TAG_MAP: Record<ModuleType, AttributeTag[]> = {
  'core-furnace': ['arcane', 'fire'],
  'energy-pipe': ['mechanical', 'stable'],
  'gear': ['mechanical', 'balancing'],
  'rune-node': ['arcane', 'amplifying'],
  'shield-shell': ['protective', 'stable'],
  'trigger-switch': ['explosive', 'amplifying'],
  'output-array': ['arcane', 'resonance'],
  // Multi-port modules
  'amplifier-crystal': ['arcane', 'amplifying'],
  'stabilizer-core': ['balancing', 'stable'],
  // Round 13 modules
  'void-siphon': ['void', 'amplifying'], // void energy, amplifies output
  'phase-modulator': ['lightning', 'balancing'], // lightning energy, balances phases
  // Round 3 new modules
  'resonance-chamber': ['resonance', 'arcane'], // resonance energy, arcane enhancement
  'fire-crystal': ['fire', 'explosive'], // fire energy, explosive output
  'lightning-conductor': ['lightning', 'amplifying'], // lightning energy, amplifies output
  // Faction Variant Modules (Round 18)
  'void-arcane-gear': ['void', 'mechanical', 'balancing'], // Void mechanical gear with balancing properties
  'inferno-blazing-core': ['fire', 'arcane', 'explosive'], // Inferno core with arcane enhancement
  'storm-thundering-pipe': ['lightning', 'mechanical', 'amplifying'], // Storm pipe with amplification
  'stellar-harmonic-crystal': ['arcane', 'resonance', 'amplifying'], // Stellar crystal with resonance
  // Round 64: Advanced Modules
  'temporal-distorter': ['temporal', 'dimensional', 'amplifying'], // Time manipulation with dimensional properties
  'arcane-matrix-grid': ['arcane', 'amplifying', 'balancing'], // Arcane grid with amplification and balancing
  'ether-infusion-chamber': ['arcane', 'resonance', 'stable'], // Ether infusion with resonance and stability
};

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

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function calculateRarity(moduleCount: number, connectionCount: number): Rarity {
  // Base score from module count and connections
  const baseScore = moduleCount + connectionCount * 0.5;
  
  if (baseScore >= 12) return 'legendary';
  if (baseScore >= 9) return 'epic';
  if (baseScore >= 6) return 'rare';
  if (baseScore >= 3) return 'uncommon';
  return 'common';
}

function calculateStats(modules: PlacedModule[], connections: Connection[]): MachineStats {
  let totalStability = 50;
  let totalPower = 10;
  let totalEnergy = 5;
  
  // Aggregate stats from modules
  modules.forEach((module) => {
    const tags = MODULE_TAG_MAP[module.type] || [];
    tags.forEach((tag) => {
      const effect = TAG_EFFECTS[tag];
      totalStability += effect.stability;
      totalPower += effect.power;
      totalEnergy += effect.energy;
    });
  });
  
  // Connection bonuses
  const connectionBonus = connections.length * 2;
  totalPower += connectionBonus;
  totalStability += Math.floor(connections.length * 0.5);
  
  // Output array bonus for having a complete circuit
  const hasOutputArray = modules.some((m) => m.type === 'output-array');
  if (hasOutputArray && connections.length > 0) {
    totalPower += 10; // Bonus for having output terminus
  }
  
  // Void Siphon bonus
  const hasVoidSiphon = modules.some((m) => m.type === 'void-siphon');
  if (hasVoidSiphon) {
    totalPower += 5; // Void amplification bonus
  }
  
  // Phase Modulator bonus
  const hasPhaseModulator = modules.some((m) => m.type === 'phase-modulator');
  if (hasPhaseModulator) {
    totalStability += 3; // Phase balancing bonus
  }
  
  // Round 64: Advanced Module Bonuses
  const hasTemporalDistorter = modules.some((m) => m.type === 'temporal-distorter');
  const hasArcaneMatrixGrid = modules.some((m) => m.type === 'arcane-matrix-grid');
  const hasEtherInfusionChamber = modules.some((m) => m.type === 'ether-infusion-chamber');
  
  if (hasTemporalDistorter) {
    totalPower += 8; // Temporal manipulation bonus
    totalStability -= 3; // Temporal instability
  }
  
  if (hasArcaneMatrixGrid) {
    totalPower += 5; // Arcane grid amplification
    totalStability += 2; // Grid provides stability
  }
  
  if (hasEtherInfusionChamber) {
    totalStability += 5; // Ether provides stability
    totalEnergy += 5; // Ether requires energy
  }
  
  // Normalize stats
  const stability = Math.max(0, Math.min(100, totalStability));
  const powerOutput = Math.max(1, Math.min(100, totalPower));
  const energyCost = Math.max(1, Math.min(100, totalEnergy));
  
  // Failure rate inversely proportional to stability
  const failureRate = Math.max(0, Math.min(100, 100 - stability));
  
  return {
    stability,
    powerOutput,
    energyCost,
    failureRate,
  };
}

function generateTags(modules: PlacedModule[]): AttributeTag[] {
  const tagCounts = new Map<AttributeTag, number>();
  
  modules.forEach((module) => {
    const moduleTags = MODULE_TAG_MAP[module.type] || [];
    moduleTags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  
  // Sort by count and take top 3
  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
  
  // Ensure at least one tag
  if (sortedTags.length === 0) {
    sortedTags.push('stable');
  }
  
  return sortedTags;
}

function generateName(): string {
  const prefix = randomChoice(PREFIXES);
  const type = randomChoice(TYPES);
  const suffix = randomChoice(SUFFIXES);
  
  return `${prefix} ${type} ${suffix}`;
}

function generateDescription(stats: MachineStats, modules: PlacedModule[]): string {
  let desc = randomChoice(DESCRIPTIONS);
  
  // Add stats flavor
  if (stats.failureRate > 50) {
    desc += ' Warning: System instability detected.';
  } else if (stats.stability > 80) {
    desc += ' Operating within nominal parameters.';
  }
  
  // Check for specific modules
  const hasOutputArray = modules.some((m) => m.type === 'output-array');
  const hasVoidSiphon = modules.some((m) => m.type === 'void-siphon');
  const hasPhaseModulator = modules.some((m) => m.type === 'phase-modulator');
  const hasFireCrystal = modules.some((m) => m.type === 'fire-crystal');
  const hasResonanceChamber = modules.some((m) => m.type === 'resonance-chamber');
  const hasLightningConductor = modules.some((m) => m.type === 'lightning-conductor');
  const hasVoidArcaneGear = modules.some((m) => m.type === 'void-arcane-gear');
  const hasInfernoBlazingCore = modules.some((m) => m.type === 'inferno-blazing-core');
  const hasStormThunderingPipe = modules.some((m) => m.type === 'storm-thundering-pipe');
  const hasStellarHarmonicCrystal = modules.some((m) => m.type === 'stellar-harmonic-crystal');
  
  // Round 64: Advanced modules
  const hasTemporalDistorter = modules.some((m) => m.type === 'temporal-distorter');
  const hasArcaneMatrixGrid = modules.some((m) => m.type === 'arcane-matrix-grid');
  const hasEtherInfusionChamber = modules.some((m) => m.type === 'ether-infusion-chamber');
  
  if (hasOutputArray) {
    desc += ' Output array projects focused arcane beams.';
  }
  if (hasVoidSiphon) {
    desc += ' The void siphon draws energy from an unknown dimension.';
  }
  if (hasPhaseModulator) {
    desc += ' Phase modulator channels lightning with precision control.';
  }
  if (hasFireCrystal) {
    desc += ' Fire crystals blaze with volatile thermal energy.';
  }
  if (hasResonanceChamber) {
    desc += ' The resonance chamber amplifies harmonic frequencies.';
  }
  if (hasLightningConductor) {
    desc += ' Lightning conductors channel raw electrical fury.';
  }
  if (hasVoidArcaneGear) {
    desc += ' The void arcane gear rotates with otherworldly grace.';
  }
  if (hasInfernoBlazingCore) {
    desc += ' The inferno blazing core burns with supernatural intensity.';
  }
  if (hasStormThunderingPipe) {
    desc += ' The storm thundering pipe crackles with electromagnetic power.';
  }
  if (hasStellarHarmonicCrystal) {
    desc += ' The stellar harmonic crystal harmonizes cosmic frequencies.';
  }
  
  // Round 64: Advanced module descriptions
  if (hasTemporalDistorter) {
    desc += ' The temporal distorter warps time itself, creating paradoxes in the energy flow.';
  }
  if (hasArcaneMatrixGrid) {
    desc += ' The arcane matrix grid organizes arcane energy into geometric patterns of power.';
  }
  if (hasEtherInfusionChamber) {
    desc += ' The ether infusion chamber distills pure dimensional essence into usable energy.';
  }
  
  return desc;
}

export function generateAttributes(
  modules: PlacedModule[],
  connections: Connection[]
): GeneratedAttributes {
  if (modules.length === 0) {
    return {
      name: 'Unnamed Machine',
      rarity: 'common',
      stats: { stability: 50, powerOutput: 10, energyCost: 5, failureRate: 50 },
      tags: ['stable'],
      description: 'An empty blueprint awaiting form.',
      codexId: 'MC-0000',
    };
  }
  
  const moduleCount = modules.length;
  const connectionCount = connections.length;
  const tags = generateTags(modules);
  const stats = calculateStats(modules, connections);
  const rarity = calculateRarity(moduleCount, connectionCount);
  const name = generateName();
  const description = generateDescription(stats, modules);
  
  return {
    name,
    rarity,
    stats,
    tags,
    description,
    codexId: uuidv4().substring(0, 8).toUpperCase(),
  };
}

export function getRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  };
  return colors[rarity];
}

export function getRarityLabel(rarity: Rarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}
