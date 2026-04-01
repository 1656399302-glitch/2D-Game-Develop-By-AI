/**
 * Tutorial Tip Component
 * 
 * Displays floating tips when user places first module of a new faction type.
 * Auto-dismisses after 5 seconds or on user action.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FactionId, FACTIONS } from '../../types/factions';

interface TutorialTipProps {
  factionId: FactionId;
  onDismiss: () => void;
  autoDismissDelay?: number;
}

export const TutorialTip: React.FC<TutorialTipProps> = ({
  factionId,
  onDismiss,
  autoDismissDelay = 5000, // 5 seconds as per AC2
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const faction = FACTIONS[factionId];
  
  // Get faction-specific tip message
  const getFactionTip = useCallback((id: FactionId): string => {
    const tips: Record<FactionId, string> = {
      void: '虚空派系擅长吸收和转化能量，构建能量吸收回路可提升稳定性',
      inferno: '熔岩派系释放强大热能，注意能量过载风险',
      storm: '风暴派系传输高速能量，连接多个模块效果更佳',
      stellar: '星辉派系和谐共振，适合构建能量放大系统',
    };
    return tips[id] || '尝试连接更多模块来激活派系特殊效果';
  }, []);
  
  // Handle dismiss with animation
  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      onDismiss();
    }, 300);
  }, [onDismiss]);
  
  // Auto-dismiss after delay
  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
    
    // Set auto-dismiss timer
    dismissTimerRef.current = setTimeout(() => {
      handleDismiss();
    }, autoDismissDelay);
    
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [autoDismissDelay, handleDismiss]);
  
  // Listen for user actions to dismiss early
  useEffect(() => {
    const handleUserAction = () => {
      // Dismiss on any user interaction
      handleDismiss();
    };
    
    // Listen for common user actions
    window.addEventListener('mousedown', handleUserAction, { once: true });
    window.addEventListener('keydown', handleUserAction, { once: true });
    window.addEventListener('touchstart', handleUserAction, { once: true });
    
    return () => {
      window.removeEventListener('mousedown', handleUserAction);
      window.removeEventListener('keydown', handleUserAction);
      window.removeEventListener('touchstart', handleUserAction);
    };
  }, [handleDismiss]);
  
  if (!faction || !isVisible) {
    return null;
  }
  
  return (
    <div
      className={`
        fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[900]
        max-w-md w-full mx-4
        transition-all duration-300 ease-out
        ${isLeaving ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
      `}
      role="alert"
      aria-live="polite"
      data-testid="faction-tip"
    >
      <div
        className="
          relative overflow-hidden rounded-xl
          bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17]
          border
          shadow-2xl
        "
        style={{
          borderColor: `${faction.color}50`,
          boxShadow: `0 0 30px ${faction.glowColor}`,
        }}
      >
        {/* Faction-colored top border */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(to right, ${faction.color}, ${faction.secondaryColor}, ${faction.color})`,
          }}
        />
        
        <div className="p-4 flex items-start gap-3">
          {/* Faction icon */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{
              backgroundColor: `${faction.color}20`,
              border: `2px solid ${faction.color}`,
              boxShadow: `0 0 15px ${faction.glowColor}`,
            }}
          >
            {faction.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: faction.color }}
              >
                派系提示
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${faction.color}20`,
                  color: faction.color,
                }}
              >
                {faction.nameCn}
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              {getFactionTip(factionId)}
            </p>
          </div>
          
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors text-[#6b7280] hover:text-white"
            aria-label="关闭提示"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        
        {/* Auto-dismiss progress bar */}
        <div className="h-0.5 bg-[#1e2a42]">
          <div
            className="h-full transition-all ease-linear"
            style={{
              backgroundColor: faction.color,
              width: '100%',
              animation: `shrink-bar ${autoDismissDelay}ms linear forwards`,
            }}
          />
        </div>
        
        {/* CSS animation for progress bar */}
        <style>{`
          @keyframes shrink-bar {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

// Hook to manage faction tip visibility and tracking
export function useFactionTip() {
  const [visibleFaction, setVisibleFaction] = useState<FactionId | null>(null);
  const dismissedFactionsRef = useRef<Set<FactionId>>(new Set());
  
  const showTip = useCallback((factionId: FactionId) => {
    // Don't show if already dismissed
    if (dismissedFactionsRef.current.has(factionId)) {
      return false;
    }
    
    setVisibleFaction(factionId);
    return true;
  }, []);
  
  const dismissTip = useCallback(() => {
    if (visibleFaction) {
      dismissedFactionsRef.current.add(visibleFaction);
    }
    setVisibleFaction(null);
  }, [visibleFaction]);
  
  const resetDismissed = useCallback(() => {
    dismissedFactionsRef.current.clear();
  }, []);
  
  return {
    visibleFaction,
    showTip,
    dismissTip,
    resetDismissed,
  };
}

export default TutorialTip;
