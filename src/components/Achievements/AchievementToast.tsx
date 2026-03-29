/**
 * Achievement Toast Component
 * 
 * Displays toast notifications when achievements are unlocked.
 * Auto-dismisses after 4 seconds.
 */

import React, { useEffect, useState } from 'react';
import { Achievement, FACTIONS, FactionId } from '../../types/factions';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  duration?: number;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
  duration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  useEffect(() => {
    if (achievement) {
      // Trigger entrance animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
      
      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, duration]);
  
  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      onDismiss();
    }, 300); // Animation duration
  };
  
  if (!achievement || !isVisible) {
    return null;
  }
  
  // Get faction colors for badge
  const factionConfig = achievement.faction ? FACTIONS[achievement.faction as FactionId] : null;
  const badgeColor = factionConfig?.color || '#fbbf24';
  const badgeGlow = factionConfig?.glowColor || 'rgba(251, 191, 36, 0.5)';
  
  return (
    <div
      className={`
        fixed top-4 right-4 z-[2000] max-w-sm
        transform transition-all duration-300 ease-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div
        className="
          relative overflow-hidden rounded-xl
          bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17]
          border border-[#fbbf24]/30
          shadow-2xl shadow-yellow-900/30
        "
        style={{
          boxShadow: `0 0 30px ${badgeGlow}`,
        }}
      >
        {/* Decorative top border */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(to right, ${badgeColor}, ${factionConfig?.secondaryColor || '#f59e0b'}, ${badgeColor})`,
          }}
        />
        
        <div className="p-4 flex items-start gap-3">
          {/* Achievement icon with faction glow */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{
              backgroundColor: `${badgeColor}20`,
              border: `2px solid ${badgeColor}`,
              boxShadow: `0 0 15px ${badgeGlow}`,
            }}
          >
            {achievement.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: badgeColor }}
              >
                成就解锁
              </span>
              {factionConfig && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${badgeColor}20`,
                    color: badgeColor,
                  }}
                >
                  {factionConfig.nameCn}
                </span>
              )}
            </div>
            <h3 className="text-white font-bold text-base leading-tight">
              {achievement.nameCn}
            </h3>
            <p className="text-[#9ca3af] text-xs mt-0.5">
              {achievement.name}
            </p>
            <p className="text-[#6b7280] text-xs mt-1">
              {achievement.description}
            </p>
          </div>
          
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors text-[#6b7280] hover:text-white"
            aria-label="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        
        {/* Animated shine effect */}
        <div
          className={`
            absolute inset-0 pointer-events-none
            bg-gradient-to-r from-transparent via-white/5 to-transparent
            -translate-x-full
            ${isVisible && !isLeaving ? 'animate-shine' : ''}
          `}
        />
      </div>
    </div>
  );
};

export default AchievementToast;
