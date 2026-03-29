import React, { useState, useEffect } from 'react';
import { useRecipeStore } from '../../store/useRecipeStore';
import { RECIPE_DEFINITIONS, Recipe, RARITY_COLORS } from '../../types/recipes';
import RecipeCard from './RecipeCard';
import { ModulePreview } from '../Modules/ModulePreview';

interface RecipeBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'unlocked' | 'locked';
type SortType = 'rarity' | 'name' | 'unlock-order';

export const RecipeBrowser: React.FC<RecipeBrowserProps> = ({ isOpen, onClose }) => {
  const { isUnlocked } = useRecipeStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('unlock-order');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);
  
  // Filter and sort recipes
  const filteredRecipes = RECIPE_DEFINITIONS.filter(recipe => {
    if (filter === 'unlocked') return isUnlocked(recipe.id);
    if (filter === 'locked') return !isUnlocked(recipe.id);
    return true;
  });
  
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === 'rarity') {
      const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // Default: unlock order (by index in RECIPE_DEFINITIONS)
    return RECIPE_DEFINITIONS.indexOf(a) - RECIPE_DEFINITIONS.indexOf(b);
  });
  
  // Stats
  const unlockedCount = RECIPE_DEFINITIONS.filter(r => isUnlocked(r.id)).length;
  const totalCount = RECIPE_DEFINITIONS.length;
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
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
                Discover new modules by completing challenges and milestones
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
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
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-800 flex gap-4 items-center">
          <div className="flex gap-2">
            {(['all', 'unlocked', 'locked'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
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
                : 'No recipes found.'
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isUnlocked={isUnlocked(recipe.id)}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex justify-between items-center text-sm text-gray-500">
          <div className="flex gap-4">
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
            isUnlocked={isUnlocked(selectedRecipe.id)}
            onClose={() => setSelectedRecipe(null)} 
          />
        )}
      </div>
    </div>
  );
};

interface RecipeDetailModalProps {
  recipe: Recipe;
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
        style={{ borderColor: rarityStyle.primary }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-4 flex items-center justify-between"
          style={{ backgroundColor: `${rarityStyle.primary}20` }}
        >
          <div>
            <h3 className="font-bold text-lg" style={{ color: rarityStyle.primary }}>
              {recipe.name}
            </h3>
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ color: rarityStyle.primary }}
            >
              {recipe.rarity}
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
            style={{ backgroundColor: `${rarityStyle.primary}10`, borderColor: `${rarityStyle.primary}30` }}
          >
            <div className="text-xs text-gray-400 mb-1">Unlock Condition</div>
            <div className="text-sm" style={{ color: rarityStyle.primary }}>
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

export default RecipeBrowser;
