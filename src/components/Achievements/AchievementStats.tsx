/**
 * Achievement Stats Component
 * 
 * Displays achievement statistics including:
 * - Total unlocked count / total count
 * - Completion percentage with progress bar
 * - Breakdown by category
 * 
 * ROUND 181: New component created for AchievementPanel
 */

import React, { useMemo } from 'react';
import { getAllCategories, getCategoryDisplayName } from '../../data/achievements';
import type { Achievement } from '../../types/achievement';

interface AchievementStatsProps {
  achievements: Achievement[];
  showCategoryBreakdown?: boolean;
}

export const AchievementStats: React.FC<AchievementStatsProps> = ({
  achievements,
  showCategoryBreakdown = true,
}) => {
  // Calculate total unlocked and total count
  const { totalUnlocked, totalCount } = useMemo(() => {
    return {
      totalUnlocked: achievements.filter((a) => a.isUnlocked).length,
      totalCount: achievements.length,
    };
  }, [achievements]);

  // Calculate percentage
  const percentage = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((totalUnlocked / totalCount) * 100);
  }, [totalUnlocked, totalCount]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    const categories = getAllCategories();
    return categories.map((category) => {
      const categoryAchievements = achievements.filter((a) => a.category === category);
      const unlockedCount = categoryAchievements.filter((a) => a.isUnlocked).length;
      const totalInCategory = categoryAchievements.length;
      
      return {
        category,
        info: getCategoryDisplayName(category),
        unlocked: unlockedCount,
        total: totalInCategory,
      };
    }).filter((cat) => cat.total > 0); // Only show categories with achievements
  }, [achievements]);

  return (
    <div 
      className="p-4 bg-gradient-to-br from-[#1a1a2e]/50 to-[#0a0e17]/50 rounded-xl border border-[#1e2a42]"
      data-testid="achievement-stats"
    >
      {/* Total count display */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[#9ca3af]">总进度</span>
        <span 
          className="text-sm font-mono font-medium"
          data-testid="achievement-stats-total"
        >
          {totalUnlocked} / {totalCount} 已解锁
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-[#0a0e17] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage label */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[#6b7280]">完成度</span>
        <span 
          className="text-xs font-mono text-[#fbbf24]"
          data-testid="achievement-stats-percentage"
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
              data-testid={`achievement-stats-category-${cat.category}`}
            >
              <span className="text-sm text-[#9ca3af]">{cat.info.nameCn}</span>
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

export default AchievementStats;
