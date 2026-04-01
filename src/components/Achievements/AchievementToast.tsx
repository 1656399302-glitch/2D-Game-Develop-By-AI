/**
 * Achievement Toast Component
 * 
 * Displays toast notifications when achievements are unlocked.
 * Supports a queue system for multiple simultaneous achievement unlocks.
 * Auto-dismisses after 4 seconds per toast.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { FACTIONS, ACHIEVEMENTS } from '../../data/achievements';
import type { FactionId } from '../../types/factions';

interface AchievementToastProps {
  achievement: typeof ACHIEVEMENTS[number];
  onDismiss: () => void;
  duration?: number;
  position?: number; // Position in queue (0 = first)
  maxVisible?: number; // Maximum visible toasts
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
  duration = 4000,
  position = 0,
  maxVisible = 3,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  // Calculate offset based on position
  const offset = Math.min(position, maxVisible - 1);
  
  useEffect(() => {
    if (achievement) {
      // Trigger entrance animation with slight delay based on position
      const entranceDelay = offset * 100;
      const entranceTimer = setTimeout(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }, entranceDelay);
      
      // Auto-dismiss after duration
      const dismissTimer = setTimeout(() => {
        handleDismiss();
      }, duration + entranceDelay);
      
      return () => {
        clearTimeout(entranceTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, [achievement, duration, offset]);
  
  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      onDismiss();
    }, 300); // Animation duration
  }, [onDismiss]);
  
  if (!achievement || !isVisible) {
    return null;
  }
  
  // Get faction colors for badge
  const factionConfig = achievement.faction ? FACTIONS[achievement.faction as FactionId] : null;
  const badgeColor = factionConfig?.color || '#fbbf24';
  const badgeGlow = factionConfig?.glowColor || 'rgba(251, 191, 36, 0.5)';
  
  // Calculate vertical offset for stacked toasts
  const stackOffset = offset * 90; // 90px per toast
  
  return (
    <div
      className={`
        fixed right-4 z-[1100] max-w-sm
        transform transition-all duration-300 ease-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      style={{
        top: `calc(16px + ${stackOffset}px)`,
        boxShadow: `0 0 30px ${badgeGlow}`,
      }}
      role="alert"
      aria-live="polite"
      data-testid="achievement-toast"
      data-achievement-id={achievement.id}
      data-position={position}
    >
      <div
        className="
          relative overflow-hidden rounded-xl
          bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17]
          border
          shadow-2xl
        "
        style={{
          borderColor: `${badgeColor}30`,
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

/**
 * Achievement Toast Queue Manager
 * 
 * Manages a queue of achievements to display, handling multiple
 * simultaneous unlocks with staggered animation timing.
 */

interface ToastQueueItem {
  achievement: typeof ACHIEVEMENTS[number];
  timestamp: number;
  id: string; // Unique ID for this queue item
}

interface AchievementToastQueueOptions {
  maxVisible?: number;
  staggerDelay?: number;
}

/**
 * Hook to manage achievement toast queue
 * This is a proper React hook that uses useState and useEffect internally
 */
export function useAchievementToastQueue(options: AchievementToastQueueOptions = {}) {
  const { maxVisible = 3, staggerDelay = 3000 } = options;
  
  const [queue, setQueue] = useState<ToastQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const processingRef = React.useRef(false);
  const processTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Get currently visible achievements
  const visibleAchievements = queue.slice(currentIndex, currentIndex + maxVisible);
  
  // Process the queue
  const processQueue = useCallback(() => {
    if (queue.length === 0) {
      processingRef.current = false;
      return;
    }
    
    if (currentIndex >= queue.length) {
      // Queue is complete, clear it
      setQueue([]);
      setCurrentIndex(0);
      processingRef.current = false;
      return;
    }
    
    // Move to next toast after stagger delay
    processingRef.current = true;
    processTimerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      processQueue();
    }, staggerDelay);
  }, [queue.length, currentIndex, staggerDelay]);
  
  // Start processing when queue has items
  useEffect(() => {
    if (queue.length > 0 && !processingRef.current) {
      processQueue();
    }
    
    return () => {
      if (processTimerRef.current) {
        clearTimeout(processTimerRef.current);
      }
    };
  }, [queue.length, processQueue]);
  
  // Add achievements to queue
  const addToQueue = useCallback((achievements: typeof ACHIEVEMENTS) => {
    const newItems: ToastQueueItem[] = achievements.map((achievement, index) => ({
      achievement,
      timestamp: Date.now() + index * 100, // Slight timestamp offset
      id: `${achievement.id}-${Date.now()}-${index}`,
    }));
    
    setQueue((prev) => {
      // Filter out duplicates
      const existingIds = new Set(prev.map((item) => item.achievement.id));
      const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.achievement.id));
      return [...prev, ...uniqueNewItems];
    });
  }, []);
  
  // Remove from queue (when toast is dismissed)
  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);
  
  // Clear entire queue
  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
    if (processTimerRef.current) {
      clearTimeout(processTimerRef.current);
    }
    processingRef.current = false;
  }, []);
  
  // Check if queue is processing
  const isProcessing = processingRef.current;
  
  // Get remaining count
  const remainingCount = Math.max(0, queue.length - currentIndex);
  
  return {
    visibleAchievements,
    addToQueue,
    removeFromQueue,
    clearQueue,
    isProcessing,
    remainingCount,
    totalInQueue: queue.length,
  };
}

/**
 * Achievement Toast Container Component
 * 
 * Renders multiple achievement toasts based on the queue state.
 * This component wraps the useAchievementToastQueue hook.
 */
export const AchievementToastContainer: React.FC<{
  options?: AchievementToastQueueOptions;
}> = ({ options = {} }) => {
  const { visibleAchievements, removeFromQueue } = useAchievementToastQueue(options);
  
  if (visibleAchievements.length === 0) {
    return null;
  }
  
  return (
    <>
      {visibleAchievements.map((item, index) => (
        <AchievementToast
          key={item.id}
          achievement={item.achievement}
          onDismiss={() => removeFromQueue(item.id)}
          position={index}
          maxVisible={options.maxVisible}
        />
      ))}
    </>
  );
};

export default AchievementToast;
