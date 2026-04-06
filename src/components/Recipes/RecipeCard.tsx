/**
 * Recipe Card Component
 * 
 * Displays a single recipe with its icon, name, description,
 * locked/unlocked visual state, and progress indicator for
 * threshold-based locked recipes.
 * 
 * ROUND 182: Enhanced with progress indicator for threshold-based locked recipes
 * Mirrors AchievementBadge pattern from Round 181
 */

import React from 'react';
import { Recipe, UnlockConditionType } from '../../data/recipes';
import { useStatsStore } from '../../store/useStatsStore';

interface RecipeCardProps {
  recipe: Recipe;
  isUnlocked: boolean;
  onClick?: () => void;
  showHint?: boolean;
  /** Whether this is a faction variant recipe */
  isFactionVariant?: boolean;
  /** Faction-specific color */
  factionColor?: string;
}

/**
 * Get rarity color based on recipe rarity
 */
function getRarityColor(rarity: string): { primary: string; glow: string } {
  const colors: Record<string, { primary: string; glow: string }> = {
    common: { primary: '#9CA3AF', glow: 'rgba(156, 163, 175, 0.5)' },
    uncommon: { primary: '#10B981', glow: 'rgba(16, 185, 129, 0.5)' },
    rare: { primary: '#3B82F6', glow: 'rgba(59, 130, 246, 0.5)' },
    epic: { primary: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.5)' },
    legendary: { primary: '#F59E0B', glow: 'rgba(245, 158, 11, 0.5)' },
  };
  return colors[rarity] || colors.common;
}

/**
 * Check if a recipe is threshold-based (has progress tracking)
 * Threshold-based recipes: machines_created, activation_count, challenge_count
 */
function isThresholdBased(recipe: Recipe): boolean {
  const thresholdTypes: UnlockConditionType[] = ['machines_created', 'activation_count', 'challenge_count'];
  return thresholdTypes.includes(recipe.unlockCondition.type);
}

/**
 * Get the progress for a threshold-based recipe
 */
function getThresholdProgress(recipe: Recipe): { current: number; threshold: number } | null {
  if (!isThresholdBased(recipe)) return null;
  if (typeof recipe.unlockCondition.value !== 'number') return null;
  
  const threshold = recipe.unlockCondition.value;
  const statsState = useStatsStore.getState();
  
  let current = 0;
  switch (recipe.unlockCondition.type) {
    case 'machines_created':
      current = statsState.machinesCreated ?? 0;
      break;
    case 'activation_count':
      current = statsState.activations ?? 0;
      break;
    case 'challenge_count':
      // challenge_count requires tracking completed challenges
      // For now, use a placeholder or calculate from achievements
      current = 0;
      break;
    default:
      return null;
  }
  
  return {
    current: Math.min(current, threshold),
    threshold,
  };
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isUnlocked,
  onClick,
  showHint = true,
  isFactionVariant = false,
  factionColor,
}) => {
  const rarityStyle = getRarityColor(recipe.rarity);
  const displayColor = isFactionVariant && factionColor ? factionColor : rarityStyle.primary;
  
  // ROUND 182: Check if this is a threshold-based recipe
  const thresholdBased = isThresholdBased(recipe);
  const progress = isUnlocked ? null : (thresholdBased ? getThresholdProgress(recipe) : null);
  
  return (
    <div
      className={`
        relative rounded-lg overflow-hidden cursor-pointer
        transition-all duration-300 ease-out
        ${isUnlocked 
          ? 'bg-gray-900/80 border-2 hover:scale-105 hover:shadow-lg' 
          : 'bg-gray-800/50 border border-gray-700 opacity-60 hover:opacity-80'
        }
      `}
      style={{
        borderColor: isUnlocked ? displayColor : undefined,
        boxShadow: isUnlocked ? `0 0 20px ${isFactionVariant ? factionColor : rarityStyle.glow}` : undefined,
      }}
      onClick={onClick}
      data-recipe-id={recipe.id}
      data-unlocked={isUnlocked}
      data-testid={`recipe-card-${recipe.id}`}
    >
      {/* Rarity badge */}
      <div
        className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"
        style={{
          backgroundColor: `${displayColor}20`,
          color: displayColor,
          border: `1px solid ${displayColor}40`,
        }}
      >
        {recipe.rarity}
        {isFactionVariant && (
          <span className="text-[10px]" title="Faction Variant - Requires Grandmaster rank">★</span>
        )}
      </div>
      
      {/* Recipe icon or lock */}
      <div className="h-32 flex items-center justify-center bg-gray-900/50">
        {isUnlocked ? (
          <div className="w-16 h-16 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-12 h-12"
              fill="none"
              stroke={displayColor}
              strokeWidth="1.5"
            >
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
        ) : (
          <div className="w-16 h-16 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-12 h-12"
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
      
      {/* Recipe info */}
      <div className="p-3">
        <h4 
          className="font-bold text-sm mb-1 truncate flex items-center gap-1"
          style={{ color: isUnlocked ? displayColor : '#9CA3AF' }}
        >
          {recipe.name}
          {isFactionVariant && (
            <span 
              className="text-[10px] px-1 py-0.5 rounded font-normal"
              style={{ backgroundColor: `${factionColor}30`, color: factionColor }}
              title="Faction Variant"
            >
              GM
            </span>
          )}
        </h4>
        
        {isUnlocked ? (
          <p className="text-xs text-gray-400 line-clamp-2">
            {recipe.description}
          </p>
        ) : showHint ? (
          <p className="text-xs text-gray-500 italic">
            {recipe.hint}
          </p>
        ) : (
          <p className="text-xs text-gray-600">
            Complete conditions to unlock
          </p>
        )}
        
        {/* ROUND 182: Progress indicator for threshold-based locked recipes */}
        {progress && !isUnlocked && (
          <div className="mt-2 flex items-center gap-2" data-testid={`recipe-progress-${recipe.id}`}>
            <div className="flex-1 h-1.5 bg-[#1e2a42] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] transition-all duration-300"
                style={{ width: `${(progress.current / progress.threshold) * 100}%` }}
              />
            </div>
            <span className="text-xs text-[#a855f7] font-mono">
              {progress.current} / {progress.threshold}
            </span>
          </div>
        )}
        
        {/* Unlock condition */}
        {isUnlocked && (
          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <span className="text-xs text-gray-500">
              {recipe.unlockCondition.description}
            </span>
          </div>
        )}
        
        {/* Faction variant indicator for locked items */}
        {isFactionVariant && !isUnlocked && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <span>🏆</span>
            <span>Requires Grandmaster rank</span>
          </div>
        )}
      </div>
      
      {/* Glow effect on hover for unlocked */}
      {isUnlocked && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${isFactionVariant ? factionColor : rarityStyle.glow}, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
};

export default RecipeCard;
