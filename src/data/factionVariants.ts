/**
 * Faction Variant Module Definitions
 * 
 * Data file containing faction-exclusive variant module definitions.
 * These modules are unlocked at Grandmaster reputation rank (2000+).
 * 
 * ROUND 80: Extended to 6 factions per contract specification.
 */

import { FactionId } from '../types/factions';

/**
 * Module type definitions for faction variants - extended to 6 factions
 */
export const FACTION_VARIANT_MODULES: Record<FactionId, string> = {
  'void': 'void-arcane-gear',
  'inferno': 'inferno-blazing-core',
  'storm': 'storm-thundering-pipe',
  'stellar': 'stellar-harmonic-crystal',
  'arcane': 'arcane-order-rune',
  'chaos': 'chaos-disorder-core',
};

/**
 * Module definitions for faction variants - extended with 2 new factions
 */
export const FACTION_VARIANT_DEFINITIONS: Record<string, {
  id: string;
  name: string;
  nameCn: string;
  faction: FactionId;
  description: string;
  icon: string;
  accentColor: string;
}> = {
  'void-arcane-gear': {
    id: 'void-arcane-gear',
    name: 'Void Arcane Gear',
    nameCn: '虚空奥术齿轮',
    faction: 'void',
    description: 'A mysterious gear imbued with void energy, rotating with otherworldly grace.',
    icon: '⚙️',
    accentColor: '#c4b5fd',
  },
  'inferno-blazing-core': {
    id: 'inferno-blazing-core',
    name: 'Inferno Blazing Core',
    nameCn: '烈焰核心',
    faction: 'inferno',
    description: 'An enhanced core furnace that burns with supernatural intensity.',
    icon: '🔥',
    accentColor: '#fb923c',
  },
  'storm-thundering-pipe': {
    id: 'storm-thundering-pipe',
    name: 'Storm Thundering Pipe',
    nameCn: '雷霆管道',
    faction: 'storm',
    description: 'An enhanced energy pipe that crackles with electromagnetic power.',
    icon: '⚡',
    accentColor: '#67e8f9',
  },
  'stellar-harmonic-crystal': {
    id: 'stellar-harmonic-crystal',
    name: 'Stellar Harmonic Crystal',
    nameCn: '星辉晶体',
    faction: 'stellar',
    description: 'A crystalline amplifier that harmonizes cosmic energy frequencies.',
    icon: '✨',
    accentColor: '#fcd34d',
  },
  // NEW: Arcane Order variant
  'arcane-order-rune': {
    id: 'arcane-order-rune',
    name: 'Arcane Order Rune',
    nameCn: '奥术秩序符文',
    faction: 'arcane',
    description: 'A mystical rune inscribed with ancient arcane sigils, channeling pure magical order.',
    icon: '🔮',
    accentColor: '#8b5cf6',
  },
  // NEW: Chaos Disorder variant
  'chaos-disorder-core': {
    id: 'chaos-disorder-core',
    name: 'Chaos Disorder Core',
    nameCn: '混沌无序核心',
    faction: 'chaos',
    description: 'An unstable core radiating unpredictable chaotic energies from beyond dimensions.',
    icon: '💀',
    accentColor: '#dc2626',
  },
};

export default FACTION_VARIANT_MODULES;
