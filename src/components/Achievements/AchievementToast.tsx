/**
 * Achievement Toast Component
 * 
 * Displays toast notifications when achievements are unlocked.
 * Supports a queue system for multiple simultaneous achievement unlocks.
 * Auto-dismisses after 3 seconds per toast.
 * 
 * ROUND 136: Changed duration default from 4000 to 3000 (3-second auto-dismiss).
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { Achievement } from '../../types/achievement';
import { getCategoryDisplayName } from '../../data/achievements';

// Default duration for auto-dismiss (3 seconds)
const DEFAULT_DURATION = 3000;

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
  duration?: number;
  position?: number;
  maxVisible?: number;
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

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
  duration = DEFAULT_DURATION,
  position = 0,
  maxVisible = 3,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const offset = Math.min(position, maxVisible - 1);
  // Guard against null achievement - default to 'exploration' category
  const category = achievement?.category || 'exploration';
  const categoryInfo = getCategoryDisplayName(category);
  const badgeColor = getCategoryColor(category);
  
  useEffect(() => {
    if (achievement) {
      const entranceDelay = offset * 100;
      const entranceTimer = setTimeout(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }, entranceDelay);
      
      // Auto-dismiss after duration (3 seconds by default)
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
    }, 300);
  }, [onDismiss]);
  
  if (!achievement || !isVisible) {
    return null;
  }
  
  const stackOffset = offset * 90;
  
  return (
    <div
      className={`
        fixed right-4 z-[1100] max-w-sm
        transform transition-all duration-300 ease-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      style={{
        top: `calc(16px + ${stackOffset}px)`,
        boxShadow: `0 0 30px ${badgeColor}66`,
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
            background: `linear-gradient(to right, ${badgeColor}, ${badgeColor}aa, ${badgeColor})`,
          }}
        />
        
        <div className="p-4 flex items-start gap-3">
          {/* Achievement icon with glow */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2"
            style={{
              backgroundColor: `${badgeColor}20`,
              borderColor: badgeColor,
              boxShadow: `0 0 15px ${badgeColor}66`,
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
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${badgeColor}20`,
                  color: badgeColor,
                }}
              >
                {categoryInfo.nameCn}
              </span>
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
            data-dismiss-toast
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
 * Toast Queue Item interface
 */
interface ToastQueueItem {
  achievement: Achievement;
  timestamp: number;
  id: string;
}

interface AchievementToastQueueOptions {
  maxVisible?: number;
  staggerDelay?: number;
}

interface AchievementToastQueueState {
  visibleAchievements: ToastQueueItem[];
  addToQueue: (achievements: Achievement[]) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  isProcessing: boolean;
  remainingCount: number;
  totalInQueue: number;
}

/**
 * Context for sharing toast queue state across components.
 */
const AchievementToastContext = createContext<AchievementToastQueueState | null>(null);

/**
 * Hook to manage achievement toast queue
 */
export function useAchievementToastQueue(options: AchievementToastQueueOptions = {}) {
  const { maxVisible = 3, staggerDelay = DEFAULT_DURATION } = options;
  
  const [queue, setQueue] = useState<ToastQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const processingRef = useRef(false);
  const processTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const visibleAchievements = queue.slice(currentIndex, currentIndex + maxVisible);
  
  const processQueue = useCallback(() => {
    if (queue.length === 0) {
      processingRef.current = false;
      return;
    }
    
    if (currentIndex >= queue.length) {
      setQueue([]);
      setCurrentIndex(0);
      processingRef.current = false;
      return;
    }
    
    processingRef.current = true;
    processTimerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      processQueue();
    }, staggerDelay);
  }, [queue.length, currentIndex, staggerDelay]);
  
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
  
  const addToQueue = useCallback((achievements: Achievement[]) => {
    const newItems: ToastQueueItem[] = achievements.map((achievement, index) => ({
      achievement,
      timestamp: Date.now() + index * 100,
      id: `${achievement.id}-${Date.now()}-${index}`,
    }));
    
    setQueue((prev) => {
      const existingIds = new Set(prev.map((item) => item.achievement.id));
      const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.achievement.id));
      return [...prev, ...uniqueNewItems];
    });
  }, []);
  
  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);
  
  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
    if (processTimerRef.current) {
      clearTimeout(processTimerRef.current);
    }
    processingRef.current = false;
  }, []);
  
  const isProcessing = processingRef.current;
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
 * Provider component that wraps the app and provides shared toast queue state.
 */
export const AchievementToastProvider: React.FC<{
  options?: AchievementToastQueueOptions;
  children: React.ReactNode;
}> = ({ options = {}, children }) => {
  const queueState = useAchievementToastQueue(options);
  
  const contextValue = useMemo(
    () => queueState,
    [
      queueState.visibleAchievements,
      queueState.isProcessing,
      queueState.remainingCount,
      queueState.totalInQueue,
    ]
  );
  
  return (
    <AchievementToastContext.Provider value={contextValue}>
      {children}
    </AchievementToastContext.Provider>
  );
};

/**
 * Hook to access the shared achievement toast queue context.
 */
export function useAchievementToastQueueContext(): AchievementToastQueueState {
  const context = useContext(AchievementToastContext);
  
  if (context === null) {
    throw new Error(
      'useAchievementToastQueueContext must be used within an AchievementToastProvider. ' +
      'Wrap your app with <AchievementToastProvider> in App.tsx.'
    );
  }
  
  return context;
}

/**
 * Achievement Toast Container Component
 * 
 * Renders multiple achievement toasts based on the queue state.
 */
export const AchievementToastContainer: React.FC<{
  options?: AchievementToastQueueOptions;
}> = ({ options = {} }) => {
  const { visibleAchievements, removeFromQueue } = useAchievementToastQueueContext();
  
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

// Re-export Achievement type
export type { Achievement } from '../../types/achievement';

export default AchievementToast;
