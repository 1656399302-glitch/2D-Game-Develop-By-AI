/**
 * Recipe Stats Component
 * 
 * Displays recipe statistics including:
 * - Total unlocked count / total count
 * - Completion percentage with progress bar
 * - Breakdown by category
 * 
 * ROUND 182: New component created for RecipePanel
 * Mirrors AchievementStats pattern from Round 181
 */

import React, { useMemo } from 'react';
import type { Recipe } from '../../data/recipes';

// Recipe categories inferred from unlock condition type
export type RecipeCategory = 'modules' | 'challenges' | 'achievements' | 'tech';

const CATEGORY_DISPLAY_NAMES: Record<RecipeCategory, string> = {
  modules: '模块',
  challenges: '挑战',
  achievements: '成就',
  tech: '科技',
};

/**
 * Get category for a recipe based on its unlock condition
 */
export function getRecipeCategory(recipe: Recipe): RecipeCategory {
  const { type } = recipe.unlockCondition;
  
  if (recipe.moduleType) {
    return 'modules';
  }
  
  switch (type) {
    case 'challenge_complete':
      return 'challenges';
    case 'tech_level':
      return 'tech';
    case 'tutorial_complete':
    case 'machines_created':
    case 'activation_count':
    case 'challenge_count':
    case 'connection_count':
      return 'achievements';
    default:
      return 'achievements';
  }
}

/**
 * Get all categories that have recipes
 */
export function getAllRecipeCategories(): RecipeCategory[] {
  return ['modules', 'challenges', 'achievements', 'tech'];
}

interface RecipeStatsProps {
  recipes: Recipe[];
  showCategoryBreakdown?: boolean;
}

export const RecipeStats: React.FC<RecipeStatsProps> = ({
  recipes,
  showCategoryBreakdown = true,
}) => {
  // Calculate total unlocked and total count
  const { totalUnlocked, totalCount } = useMemo(() => {
    return {
      totalUnlocked: recipes.filter((r) => {
        // We use isUnlocked from the recipe itself or pass it separately
        // For stats, we count based on the recipe objects passed
        return (r as any).isUnlocked === true;
      }).length,
      totalCount: recipes.length,
    };
  }, [recipes]);

  // Calculate percentage
  const percentage = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((totalUnlocked / totalCount) * 100);
  }, [totalUnlocked, totalCount]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    const categories = getAllRecipeCategories();
    return categories.map((category) => {
      const categoryRecipes = recipes.filter((r) => getRecipeCategory(r) === category);
      const unlockedCount = categoryRecipes.filter((r) => (r as any).isUnlocked === true).length;
      const totalInCategory = categoryRecipes.length;
      
      return {
        category,
        nameCn: CATEGORY_DISPLAY_NAMES[category],
        unlocked: unlockedCount,
        total: totalInCategory,
      };
    }).filter((cat) => cat.total > 0); // Only show categories with recipes
  }, [recipes]);

  return (
    <div 
      className="p-4 bg-gradient-to-br from-[#1a1a2e]/50 to-[#0a0e17]/50 rounded-xl border border-[#1e2a42]"
      data-testid="recipe-stats"
    >
      {/* Total count display */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[#9ca3af]">总进度</span>
        <span 
          className="text-sm font-mono font-medium"
          data-testid="recipe-stats-total"
        >
          {totalUnlocked} / {totalCount} 已解锁
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-[#0a0e17] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage label */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[#6b7280]">完成度</span>
        <span 
          className="text-xs font-mono text-[#a855f7]"
          data-testid="recipe-stats-percentage"
        >
          {percentage}%
        </span>
      </div>

      {/* Category breakdown */}
      {showCategoryBreakdown && categoryBreakdown.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[#1e2a42]">
          <span className="text-xs text-[#6b7280]">分类进度</span>
          {categoryBreakdown.map((cat) => (
            <div 
              key={cat.category} 
              className="flex items-center justify-between"
              data-testid={`recipe-stats-category-${cat.category}`}
            >
              <span className="text-sm text-[#9ca3af]">{cat.nameCn}</span>
              <span className="text-sm font-mono text-[#6b7280]">
                {cat.unlocked}/{cat.total}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeStats;
