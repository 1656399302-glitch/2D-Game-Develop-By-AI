// Recipe System Types
import { ModuleType, Rarity } from './index';

// Recipe unlock condition types
export type UnlockConditionType = 
  | 'challenge_complete'
  | 'challenge_count'
  | 'machines_created'
  | 'tutorial_complete'
  | 'activation_count'
  | 'connection_count';

export interface UnlockCondition {
  type: UnlockConditionType;
  value: string | number; // Challenge ID, count threshold, etc.
  description: string;
}

// Recipe definition - represents a discoverable module/feature
export interface Recipe {
  id: string;
  name: string;
  description: string;
  moduleType?: ModuleType; // Associated module type if applicable
  rarity: Rarity;
  unlockCondition: UnlockCondition;
  hint: string; // Shown when locked
  iconSvg?: string; // Custom icon for the recipe card
  prerequisites?: string[]; // Other recipe IDs that must be unlocked first
}

// Recipe unlock state
export interface RecipeUnlockState {
  recipeId: string;
  unlockedAt?: number; // Timestamp when unlocked
  discovered: boolean; // Has the player seen this recipe?
}

// Recipe store state
export interface RecipeStoreState {
  unlockedRecipes: RecipeUnlockState[];
  pendingDiscoveries: string[]; // Recipe IDs pending discovery toast
}

// Predefined recipes for all module types
export const RECIPE_DEFINITIONS: Recipe[] = [
  // Starting recipes (unlocked by default or tutorial)
  {
    id: 'recipe-core-furnace',
    name: 'Core Furnace',
    description: 'The heart of any magical machine. Generates and amplifies arcane energy.',
    moduleType: 'core-furnace',
    rarity: 'common',
    unlockCondition: {
      type: 'tutorial_complete',
      value: 'first-machine',
      description: 'Complete the first tutorial',
    },
    hint: 'Available from the start',
  },
  {
    id: 'recipe-energy-pipe',
    name: 'Energy Pipe',
    description: 'Channels arcane energy between components with minimal loss.',
    moduleType: 'energy-pipe',
    rarity: 'common',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'challenge-001',
      description: 'Complete Challenge: First Activation',
    },
    hint: 'Complete your first challenge to unlock',
  },
  {
    id: 'recipe-gear',
    name: 'Arcane Gear',
    description: 'Mechanical component that transmits energy through rotational force.',
    moduleType: 'gear',
    rarity: 'common',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'challenge-002',
      description: 'Complete Challenge: Stable Circuit',
    },
    hint: 'Build a stable machine to unlock',
  },
  {
    id: 'recipe-rune-node',
    name: 'Rune Node',
    description: 'Inscribes arcane patterns that modulate energy flow.',
    moduleType: 'rune-node',
    rarity: 'uncommon',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'challenge-003',
      description: 'Complete Challenge: Rune Mastery',
    },
    hint: 'Master rune placement to unlock',
  },
  {
    id: 'recipe-shield-shell',
    name: 'Shield Shell',
    description: 'Protective casing that stabilizes internal components.',
    moduleType: 'shield-shell',
    rarity: 'uncommon',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'challenge-004',
      description: 'Complete Challenge: Defensive Design',
    },
    hint: 'Build a shielded machine to unlock',
  },
  {
    id: 'recipe-trigger-switch',
    name: 'Trigger Switch',
    description: 'Manual activation mechanism for controlled energy release.',
    moduleType: 'trigger-switch',
    rarity: 'common',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'challenge-005',
      description: 'Complete Challenge: Controlled Ignition',
    },
    hint: 'Learn controlled activation to unlock',
  },
  {
    id: 'recipe-output-array',
    name: 'Output Array',
    description: 'Dispenses processed energy to external systems.',
    moduleType: 'output-array',
    rarity: 'uncommon',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'challenge-006',
      description: 'Complete Challenge: Full Cycle',
    },
    hint: 'Complete a full energy cycle to unlock',
  },
  {
    id: 'recipe-amplifier-crystal',
    name: 'Amplifier Crystal',
    description: 'Multiplies energy output through crystalline resonance.',
    moduleType: 'amplifier-crystal',
    rarity: 'rare',
    unlockCondition: {
      type: 'machines_created',
      value: 5,
      description: 'Create 5 unique machines',
    },
    hint: 'Forge 5 machines to discover this crystal',
  },
  {
    id: 'recipe-stabilizer-core',
    name: 'Stabilizer Core',
    description: 'Dampens energy fluctuations for consistent output.',
    moduleType: 'stabilizer-core',
    rarity: 'rare',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'challenge-007',
      description: 'Complete Challenge: Perfect Balance',
    },
    hint: 'Achieve perfect stability to unlock',
  },
  {
    id: 'recipe-void-siphon',
    name: 'Void Siphon',
    description: 'Extracts energy from the void between dimensions.',
    moduleType: 'void-siphon',
    rarity: 'epic',
    unlockCondition: {
      type: 'activation_count',
      value: 50,
      description: 'Activate machines 50 times',
    },
    hint: 'Activate machines frequently to tap into the void',
  },
  {
    id: 'recipe-phase-modulator',
    name: 'Phase Modulator',
    description: 'Shifts energy between dimensional phases for advanced processing.',
    moduleType: 'phase-modulator',
    rarity: 'legendary',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'challenge-008',
      description: 'Complete Challenge: Legendary Architect',
    },
    hint: 'Prove your mastery to unlock this ancient technology',
  },
];

// Helper function to check if a recipe is unlocked
export const isRecipeUnlocked = (
  recipeId: string,
  unlockedRecipes: RecipeUnlockState[]
): boolean => {
  return unlockedRecipes.some(
    (state) => state.recipeId === recipeId && state.discovered
  );
};

// Helper function to get recipe by module type
export const getRecipeByModuleType = (
  moduleType: ModuleType,
  recipes: Recipe[] = RECIPE_DEFINITIONS
): Recipe | undefined => {
  return recipes.find((recipe) => recipe.moduleType === moduleType);
};

// Rarity colors for recipe cards
export const RARITY_COLORS: Record<Rarity, { primary: string; glow: string }> = {
  common: { primary: '#9CA3AF', glow: 'rgba(156, 163, 175, 0.5)' },
  uncommon: { primary: '#10B981', glow: 'rgba(16, 185, 129, 0.5)' },
  rare: { primary: '#3B82F6', glow: 'rgba(59, 130, 246, 0.5)' },
  epic: { primary: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.5)' },
  legendary: { primary: '#F59E0B', glow: 'rgba(245, 158, 11, 0.5)' },
};
