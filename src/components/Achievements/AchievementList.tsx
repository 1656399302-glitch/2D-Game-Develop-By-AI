/**
 * Achievement List Component
 * 
 * Displays all achievements with earned/locked status.
 * Shows 15 achievements including milestone achievements with progress indicators.
 */

import React from 'react';
import { ACHIEVEMENTS, FACTIONS, getMilestoneThreshold } from '../../data/achievements';
import { useStatsStore } from '../../store/useStatsStore';
import type { FactionId } from '../../types/factions';

interface AchievementListProps {
  onClose?: () => void;
}

export const AchievementList: React.FC<AchievementListProps> = ({ onClose }) => {
  const earnedAchievements = useStatsStore((state) => state.earnedAchievements);
  const machinesCreated = useStatsStore((state) => state.machinesCreated);
  const earnedSet = new Set(earnedAchievements);
  
  const earnedCount = ACHIEVEMENTS.filter((a) => earnedSet.has(a.id)).length;
  const totalCount = ACHIEVEMENTS.length;
  
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
          relative w-full max-w-md mx-4 my-8
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
                  {earnedCount} / {totalCount} 已解锁
                </p>
              </div>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#6b7280] hover:text-white"
                aria-label="关闭"
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
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Achievement list */}
        <div className="px-6 pb-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {ACHIEVEMENTS.map((achievement) => (
            <AchievementItem
              key={achievement.id}
              achievement={achievement}
              earned={earnedSet.has(achievement.id)}
              machinesCreated={machinesCreated}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface AchievementItemProps {
  achievement: typeof ACHIEVEMENTS[number];
  earned: boolean;
  machinesCreated?: number;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, earned, machinesCreated = 0 }) => {
  const factionConfig = achievement.faction ? FACTIONS[achievement.faction as FactionId] : null;
  const badgeColor = factionConfig?.color || '#fbbf24';
  
  // Check if this is a milestone achievement
  const milestoneThreshold = getMilestoneThreshold(achievement.id);
  const isMilestone = milestoneThreshold !== null;
  
  // Calculate progress for milestone achievements
  const progressText = isMilestone 
    ? `${Math.min(machinesCreated, milestoneThreshold)}/${milestoneThreshold}`
    : null;
  
  return (
    <div
      className={`
        relative rounded-xl p-4 transition-all duration-300
        ${earned
          ? 'bg-gradient-to-br from-[#1e2a42]/80 to-[#0a0e17]/80 border border-[#fbbf24]/20'
          : 'bg-[#0a0e17]/50 border border-[#1e2a42] opacity-60'
        }
      `}
      style={earned ? { boxShadow: `0 0 20px ${factionConfig?.glowColor || 'rgba(251, 191, 36, 0.2)'}` } : {}}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl
            transition-all duration-300
            ${earned
              ? 'border-2 shadow-lg'
              : 'border border-[#1e2a42] grayscale'
            }
          `}
          style={{
            backgroundColor: earned ? `${badgeColor}20` : '#121826',
            borderColor: earned ? badgeColor : '#1e2a42',
            boxShadow: earned ? `0 0 10px ${factionConfig?.glowColor || 'rgba(251, 191, 36, 0.3)'}` : 'none',
          }}
        >
          {achievement.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${earned ? 'text-white' : 'text-[#6b7280]'}`}>
              {achievement.nameCn}
            </h3>
            {factionConfig && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: earned ? `${badgeColor}20` : '#121826',
                  color: earned ? badgeColor : '#4a5568',
                }}
              >
                {factionConfig.nameCn}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: earned ? '#9ca3af' : '#4a5568' }}>
            {achievement.description}
          </p>
          <p className="text-xs mt-1" style={{ color: earned ? badgeColor : '#4a5568' }}>
            {achievement.name}
          </p>
          
          {/* Milestone progress indicator */}
          {isMilestone && progressText && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#0a0e17] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] transition-all duration-300"
                  style={{ 
                    width: `${Math.min((machinesCreated / milestoneThreshold) * 100, 100)}%` 
                  }}
                />
              </div>
              <span className="text-xs text-[#9ca3af]">{progressText}</span>
            </div>
          )}
        </div>
        
        {/* Status */}
        <div className="flex-shrink-0">
          {earned ? (
            <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#22c55e" strokeWidth="2">
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
      
      {/* Locked overlay */}
      {!earned && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17]/80 to-transparent rounded-xl" />
      )}
    </div>
  );
};

export default AchievementList;
