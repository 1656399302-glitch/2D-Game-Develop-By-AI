/**
 * Time Trial Challenge Component
 * 
 * Provides timed challenge functionality with:
 * - Timer with MM:SS format, updates every second
 * - Pause/resume functionality
 * - Progress tracking
 * - Completion recording
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  formatTimeDisplay,
} from '../../types/challenge';
import { getTimeTrialById } from '../../data/challengeTimeTrials';
import { useChallengeStore } from '../../store/useChallengeStore';
import { useMachineStore } from '../../store/useMachineStore';

interface TimeTrialChallengeProps {
  challengeId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (time: number, score: number) => void;
}

/**
 * Format milliseconds to MM:SS
 */
function formatTimerDisplay(milliseconds: number): string {
  const absMs = Math.abs(milliseconds);
  const totalSeconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${milliseconds < 0 ? '-' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Get timer color based on remaining time
 */
function getTimerColor(remainingMs: number, limitMs: number): string {
  const percentage = remainingMs / limitMs;
  if (percentage <= 0.1) return '#ef4444'; // Critical (< 10%)
  if (percentage <= 0.25) return '#f59e0b'; // Warning (< 25%)
  return '#00d4ff'; // Normal
}

/**
 * Time Trial Challenge Component
 */
export function TimeTrialChallenge({
  challengeId,
  isOpen,
  onClose,
  onComplete,
}: TimeTrialChallengeProps) {
  const challenge = getTimeTrialById(challengeId);
  
  // Timer state
  const [trialState, setTrialState] = useState({
    activeChallengeId: challengeId,
    isTrialActive: false,
    isPaused: false,
    elapsedTime: 0,
    startTimestamp: null as number | null,
    pausedTimestamp: null as number | null,
    progress: {} as Record<string, number>,
    isCompleted: false,
    completionTime: null as number | null,
  });
  
  // Store selectors
  const generatedAttributes = useMachineStore((state) => state.generatedAttributes);
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  
  // Store actions
  const addLeaderboardEntry = useChallengeStore((state) => state.addLeaderboardEntry);
  
  // Refs for timer
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Calculate progress based on current machine state
  const calculateProgress = useCallback((): Record<string, number> => {
    if (!challenge) return {};
    
    const progress: Record<string, number> = {};
    
    for (const objective of challenge.objectives) {
      switch (objective.type) {
        case 'create_machine':
          progress[objective.id] = modules.length > 0 ? 1 : 0;
          break;
        case 'reach_stability':
          progress[objective.id] = generatedAttributes?.stats.stability ?? 0;
          break;
        case 'use_module_count':
          progress[objective.id] = modules.length;
          break;
        case 'create_connections':
          progress[objective.id] = connections.length;
          break;
        case 'reach_rarity':
          // Rarity: common=1, uncommon=2, rare=3, epic=4, legendary=5
          const rarityMap: Record<string, number> = {
            common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5
          };
          progress[objective.id] = generatedAttributes ? 
            (rarityMap[generatedAttributes.rarity] ?? 0) : 0;
          break;
        case 'reach_output':
          progress[objective.id] = generatedAttributes?.stats.powerOutput ?? 0;
          break;
      }
    }
    
    return progress;
  }, [challenge, modules.length, connections.length, generatedAttributes]);
  
  // Check if all objectives are met
  const checkObjectivesComplete = useCallback((): boolean => {
    if (!challenge) return false;
    
    const progress = calculateProgress();
    
    return challenge.objectives.every((obj) => {
      const currentProgress = progress[obj.id] ?? 0;
      return currentProgress >= obj.target;
    });
  }, [challenge, calculateProgress]);
  
  // Start trial
  const startTrial = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now;
    
    setTrialState((prev) => ({
      ...prev,
      isTrialActive: true,
      isPaused: false,
      elapsedTime: 0,
      startTimestamp: now,
      pausedTimestamp: null,
      progress: calculateProgress(),
      isCompleted: false,
      completionTime: null,
    }));
  }, [calculateProgress]);
  
  // Pause trial
  const pauseTrial = useCallback(() => {
    if (!trialState.isTrialActive || trialState.isPaused) return;
    
    setTrialState((prev) => ({
      ...prev,
      isPaused: true,
      pausedTimestamp: Date.now(),
    }));
  }, [trialState.isTrialActive, trialState.isPaused]);
  
  // Resume trial
  const resumeTrial = useCallback(() => {
    if (!trialState.isTrialActive || !trialState.isPaused) return;
    
    setTrialState((prev) => ({
      ...prev,
      isPaused: false,
      pausedTimestamp: null,
    }));
  }, [trialState.isTrialActive, trialState.isPaused]);
  
  // Reset trial
  const resetTrial = useCallback(() => {
    startTimeRef.current = null;
    setTrialState({
      activeChallengeId: challengeId,
      isTrialActive: false,
      isPaused: false,
      elapsedTime: 0,
      startTimestamp: null,
      pausedTimestamp: null,
      progress: {},
      isCompleted: false,
      completionTime: null,
    });
  }, [challengeId]);
  
  // Complete trial
  const completeTrial = useCallback((time: number) => {
    setTrialState((prev) => ({
      ...prev,
      isTrialActive: false,
      isCompleted: true,
      completionTime: time,
    }));
    
    // Calculate score
    if (challenge) {
      const baseScore = challenge.baseReward;
      const multiplier = challenge.rewardMultiplier;
      const score = Math.round(baseScore * multiplier);
      
      // Add to leaderboard
      try {
        const entry = {
          id: `lb-${challengeId}-${time}-${Date.now()}`,
          challengeId,
          time,
          timeDisplay: formatTimeDisplay(time),
          dateAchieved: Date.now(),
          dateDisplay: new Date().toISOString().split('T')[0],
          codexId: generatedAttributes?.codexId,
          machineName: generatedAttributes?.name,
        };
        
        if (addLeaderboardEntry) {
          addLeaderboardEntry(entry);
        }
      } catch (e) {
        console.warn('Failed to add leaderboard entry:', e);
      }
      
      // Call completion callback
      onComplete?.(time, score);
    }
  }, [challenge, challengeId, generatedAttributes, addLeaderboardEntry, onComplete]);
  
  // Timer effect
  useEffect(() => {
    if (!trialState.isTrialActive || trialState.isPaused) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }
    
    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (trialState.startTimestamp || now);
      
      setTrialState((prev) => ({
        ...prev,
        elapsedTime: elapsed,
        progress: calculateProgress(),
      }));
      
      // Check time limit
      if (challenge) {
        const remainingMs = challenge.timeLimit * 1000 - elapsed;
        if (remainingMs <= 0) {
          completeTrial(elapsed);
        }
      }
    }, 1000);
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [trialState.isTrialActive, trialState.isPaused, trialState.startTimestamp, challenge, calculateProgress, completeTrial]);
  
  // Check objective completion periodically
  useEffect(() => {
    if (!trialState.isTrialActive || trialState.isPaused) return;
    
    const checkInterval = setInterval(() => {
      if (checkObjectivesComplete()) {
        completeTrial(trialState.elapsedTime);
      }
    }, 2000);
    
    return () => clearInterval(checkInterval);
  }, [trialState.isTrialActive, trialState.isPaused, checkObjectivesComplete, completeTrial, trialState.elapsedTime]);
  
  if (!isOpen || !challenge) {
    return null;
  }
  
  const timeLimitMs = challenge.timeLimit * 1000;
  const remainingMs = timeLimitMs - trialState.elapsedTime;
  const timerColor = getTimerColor(remainingMs, timeLimitMs);
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="time-trial-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl bg-[#0a0e17] border border-[#1e2a42] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1e2a42] bg-[#121826]">
          <div className="flex items-center justify-between">
            <h2 id="time-trial-title" className="text-lg font-bold text-[#00d4ff] flex items-center gap-2">
              <span>⏱️</span>
              <span>{challenge.title}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
              aria-label="关闭"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-[#4a5568]">{challenge.description}</p>
        </div>
        
        {/* Timer Display */}
        <div className="px-6 py-6 border-b border-[#1e2a42]">
          <div className="flex items-center justify-center gap-4">
            {/* Timer */}
            <div className="relative">
              <div 
                className="text-5xl font-mono font-bold transition-colors"
                style={{ color: timerColor }}
              >
                {formatTimerDisplay(remainingMs)}
              </div>
              {/* Glow effect */}
              <div 
                className="absolute inset-0 blur-lg opacity-30"
                style={{ backgroundColor: timerColor }}
              />
            </div>
            
            {/* Status indicator */}
            {trialState.isTrialActive && (
              <div className="flex flex-col items-center">
                {trialState.isPaused ? (
                  <span className="text-2xl">⏸️</span>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-[#22c55e] animate-pulse" />
                )}
                <span className="text-xs text-[#4a5568] mt-1">
                  {trialState.isPaused ? '已暂停' : '进行中'}
                </span>
              </div>
            )}
          </div>
          
          {/* Time limit info */}
          <div className="mt-2 text-center text-sm text-[#4a5568]">
            时间限制: {Math.floor(challenge.timeLimit / 60)}:{(challenge.timeLimit % 60).toString().padStart(2, '0')}
          </div>
          
          {/* Control buttons */}
          <div className="mt-4 flex justify-center gap-3">
            {!trialState.isTrialActive && !trialState.isCompleted && (
              <button
                onClick={startTrial}
                className="px-6 py-2 rounded-lg bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30 border border-[#22c55e]/50 transition-colors font-medium"
              >
                开始挑战
              </button>
            )}
            
            {trialState.isTrialActive && !trialState.isPaused && (
              <button
                onClick={pauseTrial}
                className="px-6 py-2 rounded-lg bg-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/30 border border-[#f59e0b]/50 transition-colors font-medium"
              >
                暂停
              </button>
            )}
            
            {trialState.isTrialActive && trialState.isPaused && (
              <button
                onClick={resumeTrial}
                className="px-6 py-2 rounded-lg bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30 border border-[#22c55e]/50 transition-colors font-medium"
              >
                继续
              </button>
            )}
            
            {(trialState.isTrialActive || trialState.isCompleted) && (
              <button
                onClick={resetTrial}
                className="px-6 py-2 rounded-lg bg-[#1e2a42] text-[#9ca3af] hover:bg-[#2d3a4f] hover:text-white transition-colors"
              >
                重置
              </button>
            )}
          </div>
        </div>
        
        {/* Objectives */}
        <div className="px-6 py-4 border-b border-[#1e2a42]">
          <h3 className="text-sm font-medium text-[#9ca3af] mb-3">目标</h3>
          <div className="space-y-2">
            {challenge.objectives.map((objective) => {
              const currentProgress = trialState.progress[objective.id] ?? 0;
              const target = objective.target;
              const percentage = Math.min(100, (currentProgress / target) * 100);
              const isComplete = currentProgress >= target;
              
              return (
                <div key={objective.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={isComplete ? 'text-[#22c55e]' : 'text-white'}>
                      {isComplete && '✅ '}{objective.description}
                    </span>
                    <span className={`font-mono ${isComplete ? 'text-[#22c55e]' : 'text-[#9ca3af]'}`}>
                      {currentProgress}/{target}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1e2a42] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isComplete ? 'bg-[#22c55e]' : 'bg-[#00d4ff]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Completion state */}
        {trialState.isCompleted && (
          <div className="px-6 py-4 bg-[#22c55e]/10 border-t border-[#22c55e]/30">
            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-lg font-bold text-[#22c55e]">挑战完成!</div>
              <div className="text-sm text-[#9ca3af] mt-1">
                用时: {formatTimeDisplay(trialState.completionTime ?? 0)}
              </div>
              <div className="text-sm text-[#f59e0b] mt-1">
                奖励: +{Math.round(challenge.baseReward * challenge.rewardMultiplier)} XP
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="px-6 py-3 bg-[#121826]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-[#1e2a42] text-[#9ca3af] hover:bg-[#2d3a4f] hover:text-white transition-colors"
          >
            {trialState.isCompleted ? '完成' : '退出'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeTrialChallenge;
