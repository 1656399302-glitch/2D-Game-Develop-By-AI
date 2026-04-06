/**
 * Achievement Panel Component
 * 
 * A dedicated panel component (sidebar-style, not modal) for viewing
 * achievements with filtering, sorting, and statistics display.
 * 
 * ROUND 181: New component created for enhanced achievement viewing experience
 * - Tab-based navigation (All, Unlocked, Locked)
 * - Category filter dropdown
 * - Sort dropdown (Recent, Name, Category)
 * - Statistics section at top
 * - Achievement list below statistics
 */

import React, { useState, useMemo, useCallback } from 'react';
import type { Achievement, AchievementCategory } from '../../types/achievement';
import { getAllCategories, getCategoryDisplayName } from '../../data/achievements';
import { AchievementBadge } from './AchievementBadge';
import { AchievementStats } from './AchievementStats';

type TabType = 'all' | 'unlocked' | 'locked';
type SortType = 'recent' | 'name' | 'category';

interface AchievementPanelProps {
  achievements: Achievement[];
  onClose?: () => void;
}

/**
 * Compare two strings for sorting (supports Chinese characters)
 * Uses character code comparison for reliable sorting across environments
 * Returns negative if a < b, positive if a > b, 0 if equal
 */
function compareStrings(a: string, b: string): number {
  // Get minimum length to compare
  const len = Math.min(a.length, b.length);
  
  for (let i = 0; i < len; i++) {
    const codeA = a.charCodeAt(i);
    const codeB = b.charCodeAt(i);
    if (codeA !== codeB) {
      return codeA - codeB;
    }
  }
  
  // If all compared characters are equal, shorter string comes first
  return a.length - b.length;
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({
  achievements,
  onClose,
}) => {
  // Tab state: 'all', 'unlocked', 'locked'
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  // Category filter state (null = all categories)
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | null>(null);
  
  // Sort state
  const [sortBy, setSortBy] = useState<SortType>('recent');

  // Filter achievements based on tab and category
  const filteredAchievements = useMemo(() => {
    let filtered = [...achievements];
    
    // Apply tab filter
    if (activeTab === 'unlocked') {
      filtered = filtered.filter((a) => a.isUnlocked);
    } else if (activeTab === 'locked') {
      filtered = filtered.filter((a) => !a.isUnlocked);
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((a) => a.category === categoryFilter);
    }
    
    return filtered;
  }, [achievements, activeTab, categoryFilter]);

  // Sort achievements based on sort type
  const sortedAchievements = useMemo(() => {
    const sorted = [...filteredAchievements];
    
    switch (sortBy) {
      case 'recent':
        // Unlocked achievements first, sorted by unlockedAt descending
        // Locked achievements with no unlockedAt go to the end
        sorted.sort((a, b) => {
          if (a.isUnlocked && !b.isUnlocked) return -1;
          if (!a.isUnlocked && b.isUnlocked) return 1;
          if (a.isUnlocked && b.isUnlocked) {
            // Both unlocked - sort by timestamp descending (newest first)
            const aTime = a.unlockedAt ?? 0;
            const bTime = b.unlockedAt ?? 0;
            return bTime - aTime;
          }
          return 0;
        });
        break;
        
      case 'name':
        // Sort alphabetically by nameCn using character code comparison
        sorted.sort((a, b) => compareStrings(a.nameCn, b.nameCn));
        break;
        
      case 'category':
        // Group by category, then sort alphabetically within category
        sorted.sort((a, b) => {
          const catResult = compareStrings(a.category, b.category);
          if (catResult !== 0) return catResult;
          return compareStrings(a.nameCn, b.nameCn);
        });
        break;
    }
    
    return sorted;
  }, [filteredAchievements, sortBy]);

  // Tab click handler
  const handleTabClick = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Category filter change handler
  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      setCategoryFilter(null);
    } else {
      setCategoryFilter(value as AchievementCategory);
    }
  }, []);

  // Sort change handler
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortType);
  }, []);

  // All categories for filter dropdown
  const categories = getAllCategories();

  return (
    <div
      className="
        fixed inset-y-0 right-0 z-[1050]
        w-full max-w-md
        bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17]
        border-l border-[#fbbf24]/30
        shadow-2xl shadow-yellow-900/20
        flex flex-col
      "
      data-testid="achievement-panel"
    >
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#fbbf24]/20 flex items-center justify-center text-xl">
              🏆
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">成就</h2>
              <p className="text-sm text-[#9ca3af]">
                成就面板
              </p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#6b7280] hover:text-white"
              aria-label="关闭"
              data-close-panel
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5l10 10M15 5l-10 10" />
              </svg>
            </button>
          )}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => handleTabClick('all')}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'all'
                ? 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/40'
                : 'bg-[#0a0e17] text-[#6b7280] border border-[#1e2a42] hover:bg-[#1e2a42]'
              }
            `}
            data-testid="achievement-tab-all"
          >
            全部
          </button>
          <button
            onClick={() => handleTabClick('unlocked')}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'unlocked'
                ? 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/40'
                : 'bg-[#0a0e17] text-[#6b7280] border border-[#1e2a42] hover:bg-[#1e2a42]'
              }
            `}
            data-testid="achievement-tab-unlocked"
          >
            已解锁
          </button>
          <button
            onClick={() => handleTabClick('locked')}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'locked'
                ? 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/40'
                : 'bg-[#0a0e17] text-[#6b7280] border border-[#1e2a42] hover:bg-[#1e2a42]'
              }
            `}
            data-testid="achievement-tab-locked"
          >
            未解锁
          </button>
        </div>

        {/* Filters row */}
        <div className="flex gap-2 mb-4">
          {/* Category filter */}
          <select
            value={categoryFilter ?? 'all'}
            onChange={handleCategoryChange}
            className="
              flex-1 px-3 py-2 rounded-lg text-sm
              bg-[#0a0e17] text-[#9ca3af]
              border border-[#1e2a42]
              focus:outline-none focus:border-[#fbbf24]/40
              cursor-pointer
            "
            data-testid="achievement-category-filter"
          >
            <option value="all">全部分类</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryDisplayName(cat).nameCn}
              </option>
            ))}
          </select>

          {/* Sort select */}
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="
              flex-1 px-3 py-2 rounded-lg text-sm
              bg-[#0a0e17] text-[#9ca3af]
              border border-[#1e2a42]
              focus:outline-none focus:border-[#fbbf24]/40
              cursor-pointer
            "
            data-testid="achievement-sort-select"
          >
            <option value="recent">最近解锁</option>
            <option value="name">按名称</option>
            <option value="category">按分类</option>
          </select>
        </div>
      </div>

      {/* Statistics section - uses filtered achievements to show subset stats */}
      <div className="px-4 pb-4">
        <AchievementStats achievements={filteredAchievements} showCategoryBreakdown={true} />
      </div>

      {/* Achievement list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {sortedAchievements.length > 0 ? (
          <div className="space-y-3">
            {sortedAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                showCategory={sortBy === 'recent'}
                showTimestamp={true}
              />
            ))}
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center py-12 text-center"
            data-testid="achievement-empty-state"
          >
            <div className="w-16 h-16 rounded-full bg-[#1e2a42] flex items-center justify-center mb-4">
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#4a5568" 
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <p className="text-[#6b7280] text-sm">
              {activeTab === 'unlocked' 
                ? '暂无已解锁的成就' 
                : activeTab === 'locked'
                ? '暂无未解锁的成就'
                : '暂无成就'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementPanel;
