import React, { useState, useEffect, useCallback } from 'react';
import { useRecipeStore } from '../../store/useRecipeStore';
import { RECIPE_DEFINITIONS, Recipe, RARITY_COLORS } from '../../types/recipes';
import RecipeCard from './RecipeCard';
import { ModulePreview } from '../Modules/ModulePreview';


// Extended recipe type including faction variants
interface FactionVariantRecipe extends Recipe {
  isFactionVariant?: boolean;
  factionColor?: string;
  nameCn?: string;
}

// Create faction variant recipes
const FACTION_VARIANT_RECIPES: FactionVariantRecipe[] = [
  {
    id: 'recipe-void-arcane-gear',
    name: 'Void Arcane Gear',
    nameCn: '虚空奥术齿轮',
    description: 'A mysterious gear imbued with void energy, rotating with otherworldly grace. Unlocked at Grandmaster faction rank.',
    moduleType: 'void-arcane-gear',
    rarity: 'epic',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'faction-grandmaster',
      description: 'Reach Grandmaster rank in the Void faction',
    },
    hint: 'Achieve Grandmaster rank (2000+ reputation) with the Void faction to unlock',
    isFactionVariant: true,
    factionColor: '#c4b5fd',
  },
  {
    id: 'recipe-inferno-blazing-core',
    name: 'Inferno Blazing Core',
    nameCn: '烈焰核心',
    description: 'An enhanced core furnace that burns with supernatural intensity. Unlocked at Grandmaster faction rank.',
    moduleType: 'inferno-blazing-core',
    rarity: 'epic',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'faction-grandmaster',
      description: 'Reach Grandmaster rank in the Inferno faction',
    },
    hint: 'Achieve Grandmaster rank (2000+ reputation) with the Inferno faction to unlock',
    isFactionVariant: true,
    factionColor: '#fb923c',
  },
  {
    id: 'recipe-storm-thundering-pipe',
    name: 'Storm Thundering Pipe',
    nameCn: '雷霆管道',
    description: 'An enhanced energy pipe that crackles with electromagnetic power. Unlocked at Grandmaster faction rank.',
    moduleType: 'storm-thundering-pipe',
    rarity: 'epic',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'faction-grandmaster',
      description: 'Reach Grandmaster rank in the Storm faction',
    },
    hint: 'Achieve Grandmaster rank (2000+ reputation) with the Storm faction to unlock',
    isFactionVariant: true,
    factionColor: '#67e8f9',
  },
  {
    id: 'recipe-stellar-harmonic-crystal',
    name: 'Stellar Harmonic Crystal',
    nameCn: '星辉晶体',
    description: 'A crystalline amplifier that harmonizes cosmic energy frequencies. Unlocked at Grandmaster faction rank.',
    moduleType: 'stellar-harmonic-crystal',
    rarity: 'legendary',
    unlockCondition: {
      type: 'challenge_complete',
      value: 'faction-grandmaster',
      description: 'Reach Grandmaster rank in the Stellar faction',
    },
    hint: 'Achieve Grandmaster rank (2000+ reputation) with the Stellar faction to unlock',
    isFactionVariant: true,
    factionColor: '#fcd34d',
  },
];

// Combine all recipes (14 base + 4 faction variants = 18 total)
const ALL_RECIPES: FactionVariantRecipe[] = [
  ...RECIPE_DEFINITIONS,
  ...FACTION_VARIANT_RECIPES,
];

// Module-level state for cross-component recipe browser control
let internalRecipeBrowserOpen = false;
const recipeBrowserListeners: Set<(open: boolean) => void> = new Set();

export function setRecipeBrowserOpenState(open: boolean) {
  internalRecipeBrowserOpen = open;
  recipeBrowserListeners.forEach(listener => listener(open));
}

interface RecipeBrowserProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type FilterType = 'all' | 'unlocked' | 'locked' | 'faction';
type SortType = 'rarity' | 'name' | 'unlock-order';

export const RecipeBrowser: React.FC<RecipeBrowserProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  // Use prop or internal state
  const [internalIsOpen, setInternalIsOpen] = useState(propIsOpen ?? false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('unlock-order');
  const [selectedRecipe, setSelectedRecipe] = useState<FactionVariantRecipe | null>(null);

  // Sync with module-level state
  useEffect(() => {
    // Check if prop is explicitly provided
    if (propIsOpen !== undefined) {
      setInternalIsOpen(propIsOpen);
      return;
    }
    
    // Use module-level state
    setInternalIsOpen(internalRecipeBrowserOpen);
    
    // Add listener for module-level state changes
    const listener = (open: boolean) => {
      if (propIsOpen === undefined) {
        setInternalIsOpen(open);
      }
    };
    recipeBrowserListeners.add(listener);
    
    // Also poll to catch external state changes
    const interval = setInterval(() => {
      if (propIsOpen === undefined) {
        setInternalIsOpen(internalRecipeBrowserOpen);
      }
    }, 100);
    
    return () => {
      recipeBrowserListeners.delete(listener);
      clearInterval(interval);
    };
  }, [propIsOpen, internalRecipeBrowserOpen]);

  // Use either prop or internal state
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  
  const handleClose = useCallback(() => {
    setRecipeBrowserOpenState(false);
    setInternalIsOpen(false);
    propOnClose?.();
  }, [propOnClose]);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);
  
  // Get unlock status using store
  const getUnlockedRecipes = useCallback((): Set<string> => {
    const state = useRecipeStore.getState();
    const unlocked = new Set<string>();
    
    // Check each recipe's unlock status
    for (const recipe of ALL_RECIPES) {
      if (state.isUnlocked(recipe.id)) {
        unlocked.add(recipe.id);
      }
    }
    
    return unlocked;
  }, []);

  // Filter and sort recipes
  const getFilteredRecipes = useCallback(() => {
    const unlocked = getUnlockedRecipes();
    
    return ALL_RECIPES.filter(recipe => {
      if (filter === 'unlocked') return unlocked.has(recipe.id);
      if (filter === 'locked') return !unlocked.has(recipe.id);
      if (filter === 'faction') return recipe.isFactionVariant === true;
      return true;
    });
  }, [filter, getUnlockedRecipes]);

  const getSortedRecipes = useCallback(() => {
    const filtered = getFilteredRecipes();
    
    return [...filtered].sort((a, b) => {
      if (sortBy === 'rarity') {
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // Default: unlock order (by index in ALL_RECIPES)
      return ALL_RECIPES.indexOf(a) - ALL_RECIPES.indexOf(b);
    });
  }, [getFilteredRecipes, sortBy]);

  const unlockedRecipes = getUnlockedRecipes();
  const sortedRecipes = getSortedRecipes();
  
  // Stats
  const totalCount = ALL_RECIPES.length;
  const unlockedCount = unlockedRecipes.size;
  const factionVariantCount = FACTION_VARIANT_RECIPES.length;
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] m-4 bg-gray-900/95 rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                Recipe Codex
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Discover all {totalCount} module recipes by completing challenges and achieving faction mastery
              </p>
            </div>
            
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="关闭"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Discovery Progress</span>
              <span className="text-purple-400">{unlockedCount} / {totalCount}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-amber-500 transition-all duration-500"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
            {/* Faction variants progress */}
            <div className="flex justify-between text-xs mt-1 text-gray-500">
              <span>Base Modules: {unlockedCount - [...unlockedRecipes].filter(id => FACTION_VARIANT_RECIPES.some(r => r.id === id)).length} / {RECIPE_DEFINITIONS.length}</span>
              <span>Faction Variants: {[...unlockedRecipes].filter(id => FACTION_VARIANT_RECIPES.some(r => r.id === id)).length} / {factionVariantCount} (GM rank required)</span>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-800 flex gap-4 items-center flex-wrap">
          <div className="flex gap-2">
            {(['all', 'unlocked', 'locked', 'faction'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f === 'all' ? 'All' : f === 'unlocked' ? 'Unlocked' : f === 'locked' ? 'Locked' : 'Faction Variants'}
              </button>
            ))}
          </div>
          
          <div className="flex-1" />
          
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortType)}
            className="bg-gray-800 text-gray-300 rounded-lg px-3 py-1 text-sm border border-gray-700"
          >
            <option value="unlock-order">Unlock Order</option>
            <option value="rarity">Rarity</option>
            <option value="name">Name</option>
          </select>
        </div>
        
        {/* Recipe grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedRecipes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {filter === 'unlocked' 
                ? 'No unlocked recipes yet. Complete challenges to discover new modules!'
                : filter === 'locked'
                ? 'All recipes unlocked! Congratulations!'
                : filter === 'faction'
                ? 'No faction variants visible. Achieve Grandmaster rank to unlock faction variants.'
                : 'No recipes found.'
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isUnlocked={unlockedRecipes.has(recipe.id)}
                  onClick={() => setSelectedRecipe(recipe)}
                  isFactionVariant={(recipe as FactionVariantRecipe).isFactionVariant}
                  factionColor={(recipe as FactionVariantRecipe).factionColor}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex justify-between items-center text-sm text-gray-500 flex-wrap gap-2">
          <div className="flex gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-500" />
              Common
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Uncommon
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Rare
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Epic
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Legendary
            </span>
          </div>
          
          <div>
            Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">ESC</kbd> to close
          </div>
        </div>
        
        {/* Selected recipe detail */}
        {selectedRecipe && (
          <RecipeDetailModal 
            recipe={selectedRecipe} 
            isUnlocked={unlockedRecipes.has(selectedRecipe.id)}
            onClose={() => setSelectedRecipe(null)} 
          />
        )}
      </div>
    </div>
  );
};

interface RecipeDetailModalProps {
  recipe: FactionVariantRecipe;
  isUnlocked: boolean;
  onClose: () => void;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, isUnlocked, onClose }) => {
  const rarityStyle = RARITY_COLORS[recipe.rarity];
  
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div 
        className="relative bg-gray-900 rounded-xl border-2 overflow-hidden max-w-md w-full"
        style={{ borderColor: recipe.isFactionVariant ? recipe.factionColor : rarityStyle.primary }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-4 flex items-center justify-between"
          style={{ backgroundColor: `${recipe.isFactionVariant ? recipe.factionColor : rarityStyle.primary}20` }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg" style={{ color: recipe.isFactionVariant ? recipe.factionColor : rarityStyle.primary }}>
                {recipe.name}
              </h3>
              {recipe.isFactionVariant && (
                <span 
                  className="px-2 py-0.5 text-xs font-bold rounded"
                  style={{ backgroundColor: recipe.factionColor, color: '#0a0e17' }}
                >
                  GM
                </span>
              )}
            </div>
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ color: recipe.isFactionVariant ? recipe.factionColor : rarityStyle.primary }}
            >
              {recipe.rarity}
              {recipe.isFactionVariant && ' • Faction Variant'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Module preview */}
          <div className="h-40 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
            {isUnlocked && recipe.moduleType ? (
              <div className="scale-100">
                <ModulePreview type={recipe.moduleType} isActive={true} />
              </div>
            ) : (
              <div className="w-16 h-16 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Description */}
          <p className="text-gray-300 mb-4">
            {isUnlocked ? recipe.description : '???'}
          </p>
          
          {/* Unlock condition */}
          <div 
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: `${recipe.isFactionVariant ? recipe.factionColor : rarityStyle.primary}10`, 
              borderColor: `${recipe.isFactionVariant ? recipe.factionColor : rarityStyle.primary}30`,
              borderWidth: 1,
            }}
          >
            <div className="text-xs text-gray-400 mb-1">Unlock Condition</div>
            <div className="text-sm" style={{ color: recipe.isFactionVariant ? recipe.factionColor : rarityStyle.primary }}>
              {recipe.unlockCondition.description}
            </div>
          </div>
          
          {!isUnlocked && (
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>{recipe.hint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export for recipe count access
export const getRecipeCount = () => ALL_RECIPES.length;
export const getFactionVariantCount = () => FACTION_VARIANT_RECIPES.length;

export default RecipeBrowser;
