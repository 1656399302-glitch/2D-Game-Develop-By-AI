/**
 * Challenge Leaderboard Component
 * 
 * Displays top 10 best times per challenge with:
 * - Rank, time, date achieved
 * - Personal best highlighting
 * - Persistence across sessions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LeaderboardEntry,
  formatTimeDisplay,
  formatDateDisplay,
} from '../../types/challenge';
import { TIME_TRIAL_CHALLENGES } from '../../data/challengeTimeTrials';

interface ChallengeLeaderboardProps {
  challengeId?: string; // Optional - if provided, show leaderboard for specific challenge
  isOpen: boolean;
  onClose: () => void;
  maxEntries?: number;
}

const STORAGE_KEY = 'arcane-codex-time-trial-leaderboard';

/**
 * Leaderboard storage helper functions
 */
const loadLeaderboard = (): Record<string, LeaderboardEntry[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load leaderboard:', e);
  }
  return {};
};

const saveLeaderboard = (data: Record<string, LeaderboardEntry[]>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save leaderboard:', e);
  }
};

/**
 * Leaderboard entry row component
 */
function LeaderboardEntryRow({
  entry,
  rank,
  isPersonalBest,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isPersonalBest: boolean;
}) {
  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${isPersonalBest
          ? 'bg-[#f59e0b]/10 border border-[#f59e0b]/30'
          : 'bg-[#1a2235] border border-[#2d3a4f]'
        }
      `}
    >
      {/* Rank */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
        ${rank === 1 ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
          rank === 2 ? 'bg-[#9ca3af]/20 text-[#9ca3af]' :
          rank === 3 ? 'bg-[#cd7f32]/20 text-[#cd7f32]' :
          'bg-[#1e2a42] text-[#9ca3af]'
        }
      `}>
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
      </div>
      
      {/* Time */}
      <div className="flex-1">
        <div className={`
          font-mono font-bold
          ${isPersonalBest ? 'text-[#f59e0b]' : 'text-white'}
        `}>
          {formatTimeDisplay(entry.time)}
        </div>
        {entry.machineName && (
          <div className="text-xs text-[#4a5568] truncate max-w-[150px]">
            {entry.machineName}
          </div>
        )}
      </div>
      
      {/* Date */}
      <div className="text-right">
        <div className="text-xs text-[#4a5568]">
          {formatDateDisplay(entry.dateAchieved)}
        </div>
        {isPersonalBest && (
          <div className="text-xs text-[#f59e0b]">个人最佳</div>
        )}
      </div>
    </div>
  );
}

/**
 * Empty leaderboard placeholder
 */
function EmptyLeaderboard({ challengeTitle }: { challengeTitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-4">🏆</div>
      <div className="text-lg font-medium text-[#9ca3af]">
        {challengeTitle ? '暂无记录' : '暂无排行榜数据'}
      </div>
      <div className="text-sm text-[#4a5568] mt-1">
        完成时间挑战即可上榜
      </div>
    </div>
  );
}

/**
 * Challenge Leaderboard Component
 */
export function ChallengeLeaderboard({
  challengeId,
  isOpen,
  onClose,
  maxEntries = 10,
}: ChallengeLeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardEntry[]>>({});
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(challengeId || null);
  
  // Load leaderboard on mount
  useEffect(() => {
    const data = loadLeaderboard();
    setLeaderboardData(data);
  }, []);
  
  // Save leaderboard when it changes
  useEffect(() => {
    saveLeaderboard(leaderboardData);
  }, [leaderboardData]);
  
  // Set selected challenge
  useEffect(() => {
    if (challengeId) {
      setSelectedChallengeId(challengeId);
    }
  }, [challengeId]);
  
  // Get entries for selected challenge
  const currentEntries = useMemo(() => {
    if (!selectedChallengeId) return [];
    const entries = leaderboardData[selectedChallengeId] || [];
    return entries
      .sort((a, b) => a.time - b.time) // Sort by time ascending (fastest first)
      .slice(0, maxEntries);
  }, [leaderboardData, selectedChallengeId, maxEntries]);
  
  // Get current challenge info
  const currentChallenge = selectedChallengeId 
    ? TIME_TRIAL_CHALLENGES.find(c => c.id === selectedChallengeId) 
    : null;
  
  // Check if entry is personal best
  const personalBestId = currentEntries.length > 0 ? currentEntries[0].id : null;
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md max-h-[90vh] rounded-xl bg-[#0a0e17] border border-[#1e2a42] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1e2a42] bg-[#121826]">
          <div className="flex items-center justify-between">
            <h2 id="leaderboard-title" className="text-lg font-bold text-[#f59e0b] flex items-center gap-2">
              <span>🏆</span>
              <span>排行榜</span>
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
        </div>
        
        {/* Challenge Selector */}
        {!challengeId && (
          <div className="px-4 py-3 border-b border-[#1e2a42]">
            <select
              value={selectedChallengeId || ''}
              onChange={(e) => setSelectedChallengeId(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg bg-[#1a2235] border border-[#2d3a4f] text-white text-sm focus:outline-none focus:border-[#00d4ff]"
              aria-label="选择挑战"
            >
              <option value="">全部挑战</option>
              {TIME_TRIAL_CHALLENGES.map((challenge) => (
                <option key={challenge.id} value={challenge.id}>
                  {challenge.title}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Challenge Info */}
        {currentChallenge && (
          <div className="px-4 py-3 border-b border-[#1e2a42] bg-[#121826]">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{currentChallenge.title}</div>
                <div className="text-xs text-[#4a5568]">
                  时间限制: {Math.floor(currentChallenge.timeLimit / 60)}:{(currentChallenge.timeLimit % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div className={`
                px-2 py-1 rounded text-xs font-medium
                ${currentChallenge.difficulty === 'easy' ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                  currentChallenge.difficulty === 'normal' ? 'bg-[#3b82f6]/20 text-[#3b82f6]' :
                  currentChallenge.difficulty === 'hard' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                  'bg-[#ef4444]/20 text-[#ef4444]'
                }
              `}>
                {currentChallenge.difficulty.toUpperCase()}
              </div>
            </div>
          </div>
        )}
        
        {/* Leaderboard Entries */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentEntries.length === 0 ? (
            <EmptyLeaderboard challengeTitle={currentChallenge?.title} />
          ) : (
            <div className="space-y-2">
              {currentEntries.map((entry, index) => (
                <LeaderboardEntryRow
                  key={entry.id}
                  entry={entry}
                  rank={index + 1}
                  isPersonalBest={entry.id === personalBestId && currentEntries.length > 0}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#1e2a42] bg-[#121826]">
          <div className="flex items-center justify-between text-xs text-[#4a5568]">
            <span>显示前 {maxEntries} 名成绩</span>
            {currentEntries.length > 0 && (
              <span>最佳成绩: {formatTimeDisplay(currentEntries[0].time)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing leaderboard entries
 */
export function useLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardEntry[]>>({});
  
  // Load on mount
  useEffect(() => {
    const data = loadLeaderboard();
    setLeaderboardData(data);
  }, []);
  
  // Add entry
  const addEntry = useCallback((entry: LeaderboardEntry) => {
    setLeaderboardData((prev) => {
      const existing = prev[entry.challengeId] || [];
      
      // Add new entry
      const newEntries = [...existing, entry];
      
      // Sort by time (ascending)
      newEntries.sort((a, b) => a.time - b.time);
      
      // Keep only top 10
      const trimmedEntries = newEntries.slice(0, 10);
      
      return {
        ...prev,
        [entry.challengeId]: trimmedEntries,
      };
    });
  }, []);
  
  // Get entries for challenge
  const getEntries = useCallback((challengeId: string): LeaderboardEntry[] => {
    return leaderboardData[challengeId] || [];
  }, [leaderboardData]);
  
  // Get personal best for challenge
  const getPersonalBest = useCallback((challengeId: string): LeaderboardEntry | null => {
    const entries = leaderboardData[challengeId] || [];
    return entries.length > 0 ? entries[0] : null;
  }, [leaderboardData]);
  
  // Clear entries for challenge
  const clearChallenge = useCallback((challengeId: string) => {
    setLeaderboardData((prev) => ({
      ...prev,
      [challengeId]: [],
    }));
  }, []);
  
  // Clear all entries
  const clearAll = useCallback(() => {
    setLeaderboardData({});
  }, []);
  
  return {
    leaderboardData,
    addEntry,
    getEntries,
    getPersonalBest,
    clearChallenge,
    clearAll,
  };
}

export default ChallengeLeaderboard;
