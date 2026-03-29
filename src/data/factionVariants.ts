/**
 * Faction Variant Module Definitions
 * 
 * Data file containing faction-exclusive variant module definitions.
 * These modules are unlocked at Grandmaster reputation rank (2000+).
 */

import { FactionId } from '../types/factions';

/**
 * Module type definitions for faction variants
 */
export const FACTION_VARIANT_MODULES: Record<FactionId, string> = {
  'void': 'void-arcane-gear',
  'inferno': 'inferno-blazing-core',
  'storm': 'storm-thundering-pipe',
  'stellar': 'stellar-harmonic-crystal',
};

/**
 * Module definitions for faction variants
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
};

export default FACTION_VARIANT_MODULES;
