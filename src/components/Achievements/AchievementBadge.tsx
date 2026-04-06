/**
 * Achievement Badge Component
 * 
 * Displays a single achievement with its icon, name, description,
 * and locked/unlocked visual state.
 * 
 * ROUND 136: Created as individual badge component for reusability
 * ROUND 181: Enhanced with progress indicator for threshold-based achievements
 */

import React from 'react';
import type { Achievement } from '../../types/achievement';
import { formatUnlockTime } from '../../types/achievement';
import { getCategoryDisplayName, getMilestoneThreshold } from '../../data/achievements';
import { useStatsStore } from '../../store/useStatsStore';

interface AchievementBadgeProps {
  achievement: Achievement;
  showCategory?: boolean;
  showTimestamp?: boolean;
  onClick?: () => void;
}

/**
 * Get badge color based on category
 */
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'circuit-building': '#00d4ff',
    'recipe-discovery': '#ff6b6b',
    'subcircuit': '#4ecdc4',
    'exploration': '#ffe66d',
  };
  return colors[category] || '#fbbf24';
}

/**
 * Check if an achievement is threshold-based (has milestone threshold)
 */
function isThresholdBased(achievementId: string): boolean {
  return getMilestoneThreshold(achievementId) !== null;
}

/**
 * Get the progress for a threshold-based achievement
 * Uses machinesCreated from stats store
 */
function getThresholdProgress(achievementId: string): { current: number; threshold: number } | null {
  const threshold = getMilestoneThreshold(achievementId);
  if (threshold === null) return null;
  
  // Get current machines created from stats store
  const machinesCreated = useStatsStore.getState()?.machinesCreated ?? 0;
  
  return {
    current: Math.min(machinesCreated, threshold),
    threshold,
  };
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  showCategory = false,
  showTimestamp = true,
  onClick,
}) => {
  const { id, isUnlocked, unlockedAt, icon, name, nameCn, description, category } = achievement;
  const categoryInfo = getCategoryDisplayName(category);
  const badgeColor = getCategoryColor(category);
  const formattedTime = formatUnlockTime(unlockedAt);
  
  // ROUND 181: Check if this is a threshold-based achievement
  const thresholdBased = isThresholdBased(id);
  const progress = isUnlocked ? null : (thresholdBased ? getThresholdProgress(id) : null);
  
  return (
    <div
      className={`
        relative rounded-xl p-4 transition-all duration-300 cursor-pointer
        ${isUnlocked
          ? 'bg-gradient-to-br from-[#1e2a42]/80 to-[#0a0e17]/80 border border-[#fbbf24]/20'
          : 'bg-[#0a0e17]/50 border border-[#1e2a42]'
        }
        ${onClick ? 'hover:scale-[1.02] hover:border-[#fbbf24]/30' : ''}
      `}
      style={isUnlocked ? { boxShadow: `0 0 20px ${badgeColor}33` } : {}}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-achievement-id={id}
      data-unlocked={isUnlocked}
      data-testid={`achievement-badge-${id}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
            flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl
            transition-all duration-300
            ${isUnlocked
              ? 'border-2 shadow-lg'
              : 'border border-[#1e2a42]'
            }
            ${!isUnlocked && !thresholdBased ? 'grayscale' : ''}
          `}
          style={{
            backgroundColor: isUnlocked ? `${badgeColor}20` : '#121826',
            borderColor: isUnlocked ? badgeColor : '#1e2a42',
            boxShadow: isUnlocked ? `0 0 10px ${badgeColor}33` : 'none',
          }}
        >
          {icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-medium text-base ${isUnlocked ? 'text-white' : 'text-[#6b7280]'}`}>
              {nameCn}
            </h3>
            {showCategory && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: isUnlocked ? `${badgeColor}20` : '#121826',
                  color: isUnlocked ? badgeColor : '#4a5568',
                }}
              >
                {categoryInfo.nameCn}
              </span>
            )}
          </div>
          
          <p className="text-sm mt-1" style={{ color: isUnlocked ? '#9ca3af' : '#4a5568' }}>
            {description}
          </p>
          
          <p className="text-xs mt-1" style={{ color: isUnlocked ? badgeColor : '#4a5568' }}>
            {name}
          </p>
          
          {/* ROUND 181: Progress indicator for threshold-based locked achievements */}
          {progress && !isUnlocked && (
            <div className="mt-2 flex items-center gap-2" data-testid={`achievement-progress-${id}`}>
              <div className="flex-1 h-1.5 bg-[#1e2a42] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] transition-all duration-300"
                  style={{ width: `${(progress.current / progress.threshold) * 100}%` }}
                />
              </div>
              <span className="text-xs text-[#fbbf24] font-mono">
                {progress.current} / {progress.threshold}
              </span>
            </div>
          )}
          
          {/* Timestamp for unlocked achievements */}
          {isUnlocked && showTimestamp && formattedTime && (
            <p className="text-xs mt-2 text-[#6b7280]">
              解锁时间: {formattedTime}
            </p>
          )}
        </div>
        
        {/* Status indicator */}
        <div className="flex-shrink-0">
          {isUnlocked ? (
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${badgeColor}20` }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={badgeColor} strokeWidth="2">
                <path d="M3 7l3 3 5-5" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-[#1e2a42] flex items-center justify-center text-[#4a5568]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="8" height="8" rx="1" />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Locked overlay for non-threshold locked achievements */}
      {!isUnlocked && !thresholdBased && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17]/80 to-transparent rounded-xl" />
      )}
    </div>
  );
};

export default AchievementBadge;
