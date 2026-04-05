/**
 * Achievement List Component
 * 
 * Displays all achievements with earned/locked status organized by category.
 * Refactored in Round 136 to use new category taxonomy: circuit-building,
 * recipe-discovery, subcircuit, exploration.
 * 
 * ROUND 136: Extended to use AchievementBadge component and new categories.
 * No parallel AchievementPanel.tsx created.
 */

import React, { useMemo } from 'react';
import { useAchievementStore } from '../../store/useAchievementStore';
import { getAllCategories, getCategoryDisplayName } from '../../data/achievements';
import type { AchievementCategory } from '../../types/achievement';
import { AchievementBadge } from './AchievementBadge';

interface AchievementListProps {
  onClose?: () => void;
}

export const AchievementList: React.FC<AchievementListProps> = ({ onClose }) => {
  const achievements = useAchievementStore((state) => state.achievements);
  
  const unlockedCount = useMemo(() => {
    return achievements.filter((a) => a.isUnlocked).length;
  }, [achievements]);
  
  const totalCount = achievements.length;
  
  // Group achievements by category
  const groupedAchievements = useMemo(() => {
    const categories = getAllCategories();
    const grouped: Record<AchievementCategory, typeof achievements> = {} as any;
    
    categories.forEach((category) => {
      grouped[category] = achievements.filter((a) => a.category === category);
    });
    
    return grouped;
  }, [achievements]);
  
  return (
    <div
      className="
        fixed inset-0 z-[1050] flex items-center justify-center
        bg-black/80 backdrop-blur-sm
        overflow-y-auto
      "
      onClick={onClose}
    >
      <div
        className="
          relative w-full max-w-2xl mx-4 my-8
          bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17]
          rounded-2xl border border-[#fbbf24]/30
          shadow-2xl shadow-yellow-900/20
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fbbf24]" />
        
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#fbbf24]/20 flex items-center justify-center text-xl">
                🏆
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">成就</h2>
                <p className="text-sm text-[#9ca3af]">
                  {unlockedCount} / {totalCount} 已解锁
                </p>
              </div>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#6b7280] hover:text-white"
                aria-label="关闭"
                data-close-achievements
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 5l10 10M15 5l-10 10" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-[#0a0e17] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Achievement categories */}
        <div className="px-6 pb-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {getAllCategories().map((category) => {
            const categoryAchievements = groupedAchievements[category];
            const categoryInfo = getCategoryDisplayName(category);
            
            if (categoryAchievements.length === 0) {
              return null;
            }
            
            const categoryUnlocked = categoryAchievements.filter((a) => a.isUnlocked).length;
            
            return (
              <div key={category} className="space-y-3">
                {/* Category header */}
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-[#9ca3af]">
                    {categoryInfo.nameCn}
                  </h3>
                  <span className="text-xs text-[#4a5568]">
                    ({categoryUnlocked}/{categoryAchievements.length})
                  </span>
                </div>
                
                {/* Achievement items */}
                <div className="space-y-2">
                  {categoryAchievements.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      showCategory={false}
                      showTimestamp={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementList;
