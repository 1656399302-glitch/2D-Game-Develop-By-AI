/**
 * Community Gallery Mock Data
 * 
 * Provides sample community-created machines for the Community Sharing Square.
 * Each entry includes machine config, attributes, author, publish date, likes, and views.
 * This is mock data for the MVP - real persistence would require a backend.
 */

import { PlacedModule, Connection, GeneratedAttributes, Rarity, ModuleType, Port, PortType } from '../types';
import { FactionId } from '../types/factions';

// Helper to create port arrays
const createPorts = (type: ModuleType): Port[] => {
  const configs: Partial<Record<ModuleType, Port[]>> = {
    'core-furnace': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 25, y: 50 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 75, y: 50 } },
    ],
    'energy-pipe': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 0, y: 25 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 100, y: 25 } },
    ],
    'gear': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 50, y: 0 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 50, y: 100 } },
    ],
    'rune-node': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 0, y: 40 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 100, y: 40 } },
    ],
    'shield-shell': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 20, y: 50 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 80, y: 50 } },
    ],
    'trigger-switch': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 50, y: 0 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 50, y: 100 } },
    ],
    'output-array': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 0, y: 40 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 80, y: 40 } },
    ],
    'amplifier-crystal': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 0, y: 40 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 80, y: 20 } },
      { id: `${type}-output-1`, type: 'output' as PortType, position: { x: 80, y: 60 } },
    ],
    'stabilizer-core': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 0, y: 25 } },
      { id: `${type}-input-1`, type: 'input' as PortType, position: { x: 0, y: 55 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 80, y: 40 } },
    ],
    'void-siphon': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 40, y: 0 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 22.5, y: 80 } },
      { id: `${type}-output-1`, type: 'output' as PortType, position: { x: 57.5, y: 80 } },
    ],
    'phase-modulator': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 0, y: 25 } },
      { id: `${type}-input-1`, type: 'input' as PortType, position: { x: 0, y: 50 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 80, y: 25 } },
      { id: `${type}-output-1`, type: 'output' as PortType, position: { x: 80, y: 50 } },
    ],
    'resonance-chamber': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 0, y: 40 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 80, y: 40 } },
    ],
    'fire-crystal': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 0, y: 40 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 80, y: 40 } },
    ],
    'lightning-conductor': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 0, y: 40 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 80, y: 40 } },
    ],
    'void-arcane-gear': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 50, y: 0 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 50, y: 100 } },
    ],
    'inferno-blazing-core': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 25, y: 55 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 85, y: 55 } },
    ],
    'storm-thundering-pipe': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 0, y: 30 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 100, y: 30 } },
    ],
    'stellar-harmonic-crystal': [
      { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 0, y: 42 } },
      { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 85, y: 25 } },
      { id: `${type}-output-1`, type: 'output' as PortType, position: { x: 85, y: 60 } },
    ],
  };
  return configs[type] || [
    { id: `${type}-input-0`, type: 'input' as PortType, position: { x: 25, y: 40 } },
    { id: `${type}-output-0`, type: 'output' as PortType, position: { x: 75, y: 40 } },
  ];
};

// Community Machine Entry interface
export interface CommunityMachine {
  id: string;
  author: string;
  authorName?: string;
  publishedAt: number;
  likes: number;
  views: number;
  modules: PlacedModule[];
  connections: Connection[];
  attributes: GeneratedAttributes;
  dominantFaction: FactionId;
}

// Create a mock module
const createModule = (
  instanceId: string,
  type: ModuleType,
  x: number,
  y: number,
  rotation: number = 0,
  scale: number = 1
): PlacedModule => ({
  id: instanceId,
  instanceId,
  type,
  x,
  y,
  rotation,
  scale,
  flipped: false,
  ports: createPorts(type),
});

// Mock Community Machines - 8 diverse examples
export const MOCK_COMMUNITY_MACHINES: CommunityMachine[] = [
  {
    id: 'mock-void-resonator',
    author: 'arcane_wizard_42',
    authorName: 'Arcane Wizard',
    publishedAt: Date.now() - 86400000 * 2, // 2 days ago
    likes: 156,
    views: 2341,
    dominantFaction: 'void',
    modules: [
      createModule('inst-vr-1', 'core-furnace', 200, 200),
      createModule('inst-vr-2', 'void-siphon', 350, 200),
      createModule('inst-vr-3', 'phase-modulator', 500, 200),
      createModule('inst-vr-4', 'output-array', 650, 200),
    ],
    connections: [
      {
        id: 'conn-vr-1',
        sourceModuleId: 'inst-vr-1',
        sourcePortId: 'core-furnace-output-0',
        targetModuleId: 'inst-vr-2',
        targetPortId: 'void-siphon-input-0',
        pathData: 'M 275 200 Q 312 200 350 200',
      },
      {
        id: 'conn-vr-2',
        sourceModuleId: 'inst-vr-2',
        sourcePortId: 'void-siphon-output-0',
        targetModuleId: 'inst-vr-3',
        targetPortId: 'phase-modulator-input-0',
        pathData: 'M 372 280 Q 436 280 500 225',
      },
      {
        id: 'conn-vr-3',
        sourceModuleId: 'inst-vr-3',
        sourcePortId: 'phase-modulator-output-0',
        targetModuleId: 'inst-vr-4',
        targetPortId: 'output-array-input-0',
        pathData: 'M 580 225 Q 615 200 650 200',
      },
    ],
    attributes: {
      name: 'Void Resonator Mk-III',
      rarity: 'epic',
      stats: { stability: 72, powerOutput: 85, energyCost: 45, failureRate: 28 },
      tags: ['void', 'amplifying', 'resonance'],
      description: 'A void-powered resonance device that channels energy from the space between dimensions. Features advanced phase modulation for precise energy control.',
      codexId: 'VR-3421',
    },
  },
  {
    id: 'mock-inferno-blaze',
    author: 'pyro_master_99',
    authorName: 'Pyro Master',
    publishedAt: Date.now() - 86400000 * 5, // 5 days ago
    likes: 203,
    views: 3567,
    dominantFaction: 'inferno',
    modules: [
      createModule('inst-ib-1', 'core-furnace', 150, 250),
      createModule('inst-ib-2', 'fire-crystal', 300, 250),
      createModule('inst-ib-3', 'fire-crystal', 450, 250),
      createModule('inst-ib-4', 'amplifier-crystal', 600, 250),
      createModule('inst-ib-5', 'output-array', 750, 250),
    ],
    connections: [
      {
        id: 'conn-ib-1',
        sourceModuleId: 'inst-ib-1',
        sourcePortId: 'core-furnace-output-0',
        targetModuleId: 'inst-ib-2',
        targetPortId: 'fire-crystal-input-0',
        pathData: 'M 225 250 L 300 250',
      },
      {
        id: 'conn-ib-2',
        sourceModuleId: 'inst-ib-2',
        sourcePortId: 'fire-crystal-output-0',
        targetModuleId: 'inst-ib-3',
        targetPortId: 'fire-crystal-input-0',
        pathData: 'M 380 250 L 450 250',
      },
      {
        id: 'conn-ib-3',
        sourceModuleId: 'inst-ib-3',
        sourcePortId: 'fire-crystal-output-0',
        targetModuleId: 'inst-ib-4',
        targetPortId: 'amplifier-crystal-input-0',
        pathData: 'M 530 250 L 600 250',
      },
      {
        id: 'conn-ib-4',
        sourceModuleId: 'inst-ib-4',
        sourcePortId: 'amplifier-crystal-output-0',
        targetModuleId: 'inst-ib-5',
        targetPortId: 'output-array-input-0',
        pathData: 'M 680 230 L 750 250',
      },
    ],
    attributes: {
      name: 'Inferno Blaze Amplifier',
      rarity: 'legendary',
      stats: { stability: 55, powerOutput: 98, energyCost: 72, failureRate: 45 },
      tags: ['fire', 'explosive', 'amplifying'],
      description: 'A devastating thermal amplification system that chains fire crystals for maximum destructive output. Warning: extreme instability detected.',
      codexId: 'IB-9087',
    },
  },
  {
    id: 'mock-storm-conduit',
    author: 'lightning_knight',
    authorName: 'Lightning Knight',
    publishedAt: Date.now() - 86400000 * 1, // 1 day ago
    likes: 89,
    views: 892,
    dominantFaction: 'storm',
    modules: [
      createModule('inst-sc-1', 'energy-pipe', 150, 200),
      createModule('inst-sc-2', 'lightning-conductor', 300, 200),
      createModule('inst-sc-3', 'stabilizer-core', 450, 200),
      createModule('inst-sc-4', 'lightning-conductor', 600, 200),
    ],
    connections: [
      {
        id: 'conn-sc-1',
        sourceModuleId: 'inst-sc-1',
        sourcePortId: 'energy-pipe-output-0',
        targetModuleId: 'inst-sc-2',
        targetPortId: 'lightning-conductor-input-0',
        pathData: 'M 250 200 L 300 200',
      },
      {
        id: 'conn-sc-2',
        sourceModuleId: 'inst-sc-2',
        sourcePortId: 'lightning-conductor-output-0',
        targetModuleId: 'inst-sc-3',
        targetPortId: 'stabilizer-core-input-0',
        pathData: 'M 380 200 L 450 200',
      },
      {
        id: 'conn-sc-3',
        sourceModuleId: 'inst-sc-3',
        sourcePortId: 'stabilizer-core-output-0',
        targetModuleId: 'inst-sc-4',
        targetPortId: 'lightning-conductor-input-0',
        pathData: 'M 530 200 L 600 200',
      },
    ],
    attributes: {
      name: 'Storm Conduit Prime',
      rarity: 'rare',
      stats: { stability: 78, powerOutput: 68, energyCost: 35, failureRate: 22 },
      tags: ['lightning', 'amplifying', 'balancing'],
      description: 'A balanced lightning conduction system with integrated stabilization. Provides steady power output with minimal energy waste.',
      codexId: 'SC-1156',
    },
  },
  {
    id: 'mock-stellar-harmony',
    author: 'cosmic_craftsman',
    authorName: 'Cosmic Craftsman',
    publishedAt: Date.now() - 86400000 * 7, // 7 days ago
    likes: 312,
    views: 4892,
    dominantFaction: 'stellar',
    modules: [
      createModule('inst-sh-1', 'core-furnace', 400, 150),
      createModule('inst-sh-2', 'amplifier-crystal', 250, 250),
      createModule('inst-sh-3', 'resonance-chamber', 400, 350),
      createModule('inst-sh-4', 'amplifier-crystal', 550, 250),
      createModule('inst-sh-5', 'gear', 400, 250),
    ],
    connections: [
      {
        id: 'conn-sh-1',
        sourceModuleId: 'inst-sh-1',
        sourcePortId: 'core-furnace-output-0',
        targetModuleId: 'inst-sh-5',
        targetPortId: 'gear-input-0',
        pathData: 'M 450 200 L 450 250',
      },
      {
        id: 'conn-sh-2',
        sourceModuleId: 'inst-sh-5',
        sourcePortId: 'gear-output-0',
        targetModuleId: 'inst-sh-2',
        targetPortId: 'amplifier-crystal-input-0',
        pathData: 'M 400 350 L 250 290',
      },
      {
        id: 'conn-sh-3',
        sourceModuleId: 'inst-sh-5',
        sourcePortId: 'gear-output-0',
        targetModuleId: 'inst-sh-4',
        targetPortId: 'amplifier-crystal-input-0',
        pathData: 'M 400 350 L 550 290',
      },
      {
        id: 'conn-sh-4',
        sourceModuleId: 'inst-sh-2',
        sourcePortId: 'amplifier-crystal-output-0',
        targetModuleId: 'inst-sh-3',
        targetPortId: 'resonance-chamber-input-0',
        pathData: 'M 330 270 L 400 390',
      },
      {
        id: 'conn-sh-5',
        sourceModuleId: 'inst-sh-4',
        sourcePortId: 'amplifier-crystal-output-0',
        targetModuleId: 'inst-sh-3',
        targetPortId: 'resonance-chamber-input-0',
        pathData: 'M 470 270 L 400 390',
      },
    ],
    attributes: {
      name: 'Stellar Harmony Engine',
      rarity: 'legendary',
      stats: { stability: 92, powerOutput: 75, energyCost: 28, failureRate: 8 },
      tags: ['arcane', 'resonance', 'stable'],
      description: 'A perfectly harmonized stellar energy system. The cosmic resonance creates an exceptionally stable and efficient power output.',
      codexId: 'SH-7721',
    },
  },
  {
    id: 'mock-mech-balancer',
    author: 'gear_guru',
    authorName: 'Gear Guru',
    publishedAt: Date.now() - 86400000 * 3, // 3 days ago
    likes: 67,
    views: 445,
    dominantFaction: 'stellar',
    modules: [
      createModule('inst-mb-1', 'gear', 200, 200),
      createModule('inst-mb-2', 'gear', 350, 200),
      createModule('inst-mb-3', 'gear', 500, 200),
      createModule('inst-mb-4', 'stabilizer-core', 350, 350),
    ],
    connections: [
      {
        id: 'conn-mb-1',
        sourceModuleId: 'inst-mb-1',
        sourcePortId: 'gear-output-0',
        targetModuleId: 'inst-mb-2',
        targetPortId: 'gear-input-0',
        pathData: 'M 200 300 L 350 200',
      },
      {
        id: 'conn-mb-2',
        sourceModuleId: 'inst-mb-2',
        sourcePortId: 'gear-output-0',
        targetModuleId: 'inst-mb-3',
        targetPortId: 'gear-input-0',
        pathData: 'M 430 200 L 500 200',
      },
      {
        id: 'conn-mb-3',
        sourceModuleId: 'inst-mb-2',
        sourcePortId: 'gear-input-0',
        targetModuleId: 'inst-mb-4',
        targetPortId: 'stabilizer-core-input-0',
        pathData: 'M 350 280 L 350 350',
      },
    ],
    attributes: {
      name: 'Mechanical Balancer Alpha',
      rarity: 'common',
      stats: { stability: 88, powerOutput: 35, energyCost: 15, failureRate: 12 },
      tags: ['mechanical', 'balancing', 'stable'],
      description: 'A simple but effective mechanical balancing system using interlocking gears. Reliable and easy to maintain.',
      codexId: 'MB-0234',
    },
  },
  {
    id: 'mock-void-amplifier',
    author: 'shadow_forger',
    authorName: 'Shadow Forger',
    publishedAt: Date.now() - 86400000 * 4, // 4 days ago
    likes: 178,
    views: 1823,
    dominantFaction: 'void',
    modules: [
      createModule('inst-va-1', 'void-siphon', 200, 250),
      createModule('inst-va-2', 'amplifier-crystal', 350, 250),
      createModule('inst-va-3', 'void-siphon', 500, 250),
      createModule('inst-va-4', 'phase-modulator', 350, 400),
      createModule('inst-va-5', 'output-array', 650, 250),
    ],
    connections: [
      {
        id: 'conn-va-1',
        sourceModuleId: 'inst-va-1',
        sourcePortId: 'void-siphon-output-0',
        targetModuleId: 'inst-va-2',
        targetPortId: 'amplifier-crystal-input-0',
        pathData: 'M 222 330 L 350 290',
      },
      {
        id: 'conn-va-2',
        sourceModuleId: 'inst-va-2',
        sourcePortId: 'amplifier-crystal-output-0',
        targetModuleId: 'inst-va-3',
        targetPortId: 'void-siphon-input-0',
        pathData: 'M 430 230 L 500 250',
      },
      {
        id: 'conn-va-3',
        sourceModuleId: 'inst-va-2',
        sourcePortId: 'amplifier-crystal-output-1',
        targetModuleId: 'inst-va-4',
        targetPortId: 'phase-modulator-input-0',
        pathData: 'M 430 270 L 350 425',
      },
      {
        id: 'conn-va-4',
        sourceModuleId: 'inst-va-4',
        sourcePortId: 'phase-modulator-output-0',
        targetModuleId: 'inst-va-5',
        targetPortId: 'output-array-input-0',
        pathData: 'M 430 425 L 650 290',
      },
    ],
    attributes: {
      name: 'Void Phase Amplifier',
      rarity: 'epic',
      stats: { stability: 65, powerOutput: 92, energyCost: 52, failureRate: 35 },
      tags: ['void', 'amplifying', 'resonance'],
      description: 'A void-amplified phase modulation system that draws power from the space between dimensions. High output with moderate instability.',
      codexId: 'VP-4455',
    },
  },
  {
    id: 'mock-shield-fortress',
    author: 'guardian_artisan',
    authorName: 'Guardian Artisan',
    publishedAt: Date.now() - 86400000 * 6, // 6 days ago
    likes: 145,
    views: 1567,
    dominantFaction: 'stellar',
    modules: [
      createModule('inst-sf-1', 'shield-shell', 400, 150),
      createModule('inst-sf-2', 'core-furnace', 400, 300),
      createModule('inst-sf-3', 'stabilizer-core', 250, 300),
      createModule('inst-sf-4', 'stabilizer-core', 550, 300),
      createModule('inst-sf-5', 'output-array', 400, 450),
    ],
    connections: [
      {
        id: 'conn-sf-1',
        sourceModuleId: 'inst-sf-1',
        sourcePortId: 'shield-shell-output-0',
        targetModuleId: 'inst-sf-2',
        targetPortId: 'core-furnace-input-0',
        pathData: 'M 420 210 L 400 300',
      },
      {
        id: 'conn-sf-2',
        sourceModuleId: 'inst-sf-2',
        sourcePortId: 'core-furnace-output-0',
        targetModuleId: 'inst-sf-3',
        targetPortId: 'stabilizer-core-input-0',
        pathData: 'M 330 300 L 250 325',
      },
      {
        id: 'conn-sf-3',
        sourceModuleId: 'inst-sf-2',
        sourcePortId: 'core-furnace-output-0',
        targetModuleId: 'inst-sf-4',
        targetPortId: 'stabilizer-core-input-0',
        pathData: 'M 470 300 L 550 325',
      },
      {
        id: 'conn-sf-4',
        sourceModuleId: 'inst-sf-3',
        sourcePortId: 'stabilizer-core-output-0',
        targetModuleId: 'inst-sf-5',
        targetPortId: 'output-array-input-0',
        pathData: 'M 330 300 L 400 450',
      },
      {
        id: 'conn-sf-5',
        sourceModuleId: 'inst-sf-4',
        sourcePortId: 'stabilizer-core-output-0',
        targetModuleId: 'inst-sf-5',
        targetPortId: 'output-array-input-0',
        pathData: 'M 470 300 L 400 450',
      },
    ],
    attributes: {
      name: 'Stellar Fortress Core',
      rarity: 'rare',
      stats: { stability: 95, powerOutput: 55, energyCost: 42, failureRate: 5 },
      tags: ['protective', 'stable', 'balancing'],
      description: 'An exceptionally stable protective system with dual stabilization. The shield shell provides additional protection against energy fluctuations.',
      codexId: 'SF-3389',
    },
  },
  {
    id: 'mock-rune-conduit',
    author: 'rune_scholar',
    authorName: 'Rune Scholar',
    publishedAt: Date.now() - 86400000 * 0.5, // 12 hours ago
    likes: 42,
    views: 287,
    dominantFaction: 'void',
    modules: [
      createModule('inst-rc-1', 'rune-node', 200, 250),
      createModule('inst-rc-2', 'rune-node', 350, 250),
      createModule('inst-rc-3', 'rune-node', 500, 250),
      createModule('inst-rc-4', 'trigger-switch', 350, 400),
    ],
    connections: [
      {
        id: 'conn-rc-1',
        sourceModuleId: 'inst-rc-1',
        sourcePortId: 'rune-node-output-0',
        targetModuleId: 'inst-rc-2',
        targetPortId: 'rune-node-input-0',
        pathData: 'M 300 250 L 350 250',
      },
      {
        id: 'conn-rc-2',
        sourceModuleId: 'inst-rc-2',
        sourcePortId: 'rune-node-output-0',
        targetModuleId: 'inst-rc-3',
        targetPortId: 'rune-node-input-0',
        pathData: 'M 450 250 L 500 250',
      },
      {
        id: 'conn-rc-3',
        sourceModuleId: 'inst-rc-2',
        sourcePortId: 'rune-node-input-0',
        targetModuleId: 'inst-rc-4',
        targetPortId: 'trigger-switch-input-0',
        pathData: 'M 350 290 L 350 400',
      },
    ],
    attributes: {
      name: 'Runic Power Conduit',
      rarity: 'uncommon',
      stats: { stability: 75, powerOutput: 58, energyCost: 32, failureRate: 25 },
      tags: ['arcane', 'amplifying', 'explosive'],
      description: 'A rune-chained power conduit with integrated trigger mechanism. Simple design with decent power output.',
      codexId: 'RP-0892',
    },
  },
];

// Filter/sort types
export type SortOption = 'newest' | 'most-liked' | 'most-viewed';
export type FactionFilter = 'all' | FactionId;
export type RarityFilter = 'all' | Rarity;

// Get filtered and sorted machines
export function getFilteredMachines(
  machines: CommunityMachine[],
  searchQuery: string,
  factionFilter: FactionFilter,
  rarityFilter: RarityFilter,
  sortOption: SortOption
): CommunityMachine[] {
  let filtered = [...machines];

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.attributes.name.toLowerCase().includes(query) ||
        m.attributes.description.toLowerCase().includes(query) ||
        m.author.toLowerCase().includes(query) ||
        m.attributes.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  // Apply faction filter
  if (factionFilter !== 'all') {
    filtered = filtered.filter((m) => m.dominantFaction === factionFilter);
  }

  // Apply rarity filter
  if (rarityFilter !== 'all') {
    filtered = filtered.filter((m) => m.attributes.rarity === rarityFilter);
  }

  // Apply sorting
  switch (sortOption) {
    case 'newest':
      filtered.sort((a, b) => b.publishedAt - a.publishedAt);
      break;
    case 'most-liked':
      filtered.sort((a, b) => b.likes - a.likes);
      break;
    case 'most-viewed':
      filtered.sort((a, b) => b.views - a.views);
      break;
  }

  return filtered;
}
