import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  CHALLENGE_DEFINITIONS,
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
  ChallengeCategory,
  ChallengeDifficulty,
} from '../../data/challenges';
import { useChallengeStore } from '../../store/useChallengeStore';
import { EnhancedChallengeCard } from './EnhancedChallengeCard';
import { TimeTrialChallenge } from '../Challenges/TimeTrialChallenge';
import { ChallengeLeaderboard } from '../Challenges/ChallengeLeaderboard';
import { TIME_TRIAL_CHALLENGES } from '../../data/challengeTimeTrials';
import {
  getTimeTrialDifficultyColor,
  getTimeTrialDifficultyLabel,
  TimeTrialDifficulty,
} from '../../types/challenge';

/**
 * Tab types for the panel
 */
type PanelTab = 'challenges' | 'time-trials';

/**
 * Challenge category filter tabs
 */
type CategoryTab = 'all' | ChallengeCategory;

/**
 * Difficulty filter
 */
type DifficultyFilter = 'all' | ChallengeDifficulty;

/**
 * Time Trial difficulty filter
 */
type TimeTrialDifficultyFilter = 'all' | TimeTrialDifficulty;

/**
 * Challenge Panel Component
 * Displays available challenges, progress, and rewards
 * 
 * Uses getState() pattern for actions, with local state for reactive values.
 * 
 * Uses EnhancedChallengeCard for proper accessibility with role="progressbar"
 */
export function ChallengePanel() {
  const [activeTab, setActiveTab] = useState<PanelTab>('challenges');
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyFilter>('all');
  
  // Time trial state
  const [timeTrialDifficultyFilter, setTimeTrialDifficultyFilter] = useState<TimeTrialDifficultyFilter>('all');
  const [activeTimeTrialId, setActiveTimeTrialId] = useState<string | null>(null);
  const [showTimeTrialModal, setShowTimeTrialModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Use local state for reactive values from store
  const [totalXP, setTotalXP] = useState(0);
  const [badges, setBadges] = useState<Array<{id: string; displayName: string; description: string}>>([]);

  // Sync with store on mount and periodically
  useEffect(() => {
    const syncState = () => {
      const state = useChallengeStore.getState();
      setTotalXP(state.totalXP);
      setBadges(state.badges);
    };
    
    syncState();
    
    // Poll periodically for updates
    const intervalId = setInterval(syncState, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Use callbacks with getState() pattern for actions
  const getChallengeProgress = useCallback((challengeId: string) => {
    return useChallengeStore.getState().getChallengeProgress(challengeId);
  }, []);

  const isChallengeCompleted = useCallback((challengeId: string) => {
    return useChallengeStore.getState().isChallengeCompleted(challengeId);
  }, []);

  const isRewardClaimed = useCallback((challengeId: string) => {
    return useChallengeStore.getState().isRewardClaimed(challengeId);
  }, []);

  const claimReward = useCallback((challengeId: string) => {
    useChallengeStore.getState().claimReward(challengeId);
  }, []);

  const getCompletedChallenges = useCallback(() => {
    return useChallengeStore.getState().getCompletedChallenges();
  }, []);

  // Filter challenges based on active filters
  const filteredChallenges = useMemo(() => {
    return CHALLENGE_DEFINITIONS.filter((challenge) => {
      const categoryMatch = activeCategory === 'all' || challenge.category === activeCategory;
      const difficultyMatch = activeDifficulty === 'all' || challenge.difficulty === activeDifficulty;
      return categoryMatch && difficultyMatch;
    });
  }, [activeCategory, activeDifficulty]);

  // Filter time trials based on difficulty
  const filteredTimeTrials = useMemo(() => {
    return TIME_TRIAL_CHALLENGES.filter((challenge) => {
      const difficultyMatch = timeTrialDifficultyFilter === 'all' || challenge.difficulty === timeTrialDifficultyFilter;
      return difficultyMatch;
    });
  }, [timeTrialDifficultyFilter]);

  const completedCount = getCompletedChallenges().length;
  const totalChallenges = CHALLENGE_DEFINITIONS.length;

  // Category tabs
  const categories: { id: CategoryTab; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'creation', label: '创造' },
    { id: 'collection', label: '收集' },
    { id: 'activation', label: '激活' },
    { id: 'mastery', label: '精通' },
  ];

  // Time trial difficulty options
  const timeTrialDifficulties: { id: TimeTrialDifficultyFilter; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'easy', label: '简单' },
    { id: 'normal', label: '普通' },
    { id: 'hard', label: '困难' },
    { id: 'extreme', label: '极限' },
  ];

  // Start time trial
  const handleStartTimeTrial = useCallback((challengeId: string) => {
    setActiveTimeTrialId(challengeId);
    setShowTimeTrialModal(true);
  }, []);

  // Open leaderboard
  const handleOpenLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#0a0e17]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1e2a42] bg-[#121826]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-[#00d4ff] flex items-center gap-2">
            <span>🏆</span>
            <span>挑战</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded bg-[#f59e0b]/20 text-[#f59e0b]">
              {totalXP} XP
            </span>
            <span className="px-2 py-1 text-xs rounded bg-[#22c55e]/20 text-[#22c55e]">
              {completedCount}/{totalChallenges}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[#1e2a42] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00d4ff] to-[#22c55e] transition-all duration-300"
            style={{ width: `${(completedCount / totalChallenges) * 100}%` }}
          />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-[#1e2a42]">
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'challenges'
              ? 'text-[#00d4ff] border-b-2 border-[#00d4ff] bg-[#00d4ff]/5'
              : 'text-[#9ca3af] hover:text-white'
          }`}
        >
          常规挑战
        </button>
        <button
          onClick={() => setActiveTab('time-trials')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'time-trials'
              ? 'text-[#f59e0b] border-b-2 border-[#f59e0b] bg-[#f59e0b]/5'
              : 'text-[#9ca3af] hover:text-white'
          }`}
        >
          ⏱️ 时间挑战
        </button>
      </div>

      {/* Challenges Tab Content */}
      {activeTab === 'challenges' && (
        <>
          {/* Category Filter Tabs */}
          <div className="flex gap-1 px-4 py-2 border-b border-[#1e2a42] overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/50'
                    : 'bg-[#1e2a42]/50 text-[#9ca3af] hover:text-white hover:bg-[#1e2a42]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-2 px-4 py-2 border-b border-[#1e2a42]">
            <span className="text-xs text-[#9ca3af] self-center">难度:</span>
            {(['all', 'beginner', 'intermediate', 'advanced'] as DifficultyFilter[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setActiveDifficulty(diff)}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  activeDifficulty === diff
                    ? 'text-white'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
                style={{
                  backgroundColor: activeDifficulty === diff
                    ? getChallengeDifficultyColor(diff as ChallengeDifficulty)
                    : 'transparent',
                }}
              >
                {diff === 'all' ? '全部' : getChallengeDifficultyLabel(diff as ChallengeDifficulty)}
              </button>
            ))}
          </div>

          {/* Challenge List - Uses EnhancedChallengeCard for accessibility */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredChallenges.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#4a5568]">
                <span className="text-4xl mb-2">📭</span>
                <p className="text-sm">没有符合条件的挑战</p>
              </div>
            ) : (
              <ul className="space-y-3" role="list">
                {filteredChallenges.map((challenge) => (
                  <EnhancedChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    progress={getChallengeProgress(challenge.id)}
                    isCompleted={isChallengeCompleted(challenge.id)}
                    isClaimed={isRewardClaimed(challenge.id)}
                    onClaim={() => claimReward(challenge.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Time Trials Tab Content */}
      {activeTab === 'time-trials' && (
        <>
          {/* Difficulty Filter */}
          <div className="flex gap-2 px-4 py-2 border-b border-[#1e2a42] overflow-x-auto">
            {timeTrialDifficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setTimeTrialDifficultyFilter(diff.id)}
                className={`px-2 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                  timeTrialDifficultyFilter === diff.id
                    ? 'text-white'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
                style={{
                  backgroundColor: timeTrialDifficultyFilter === diff.id && diff.id !== 'all'
                    ? getTimeTrialDifficultyColor(diff.id as TimeTrialDifficulty)
                    : 'transparent',
                }}
              >
                {diff.label}
              </button>
            ))}
            
            {/* Leaderboard Button */}
            <button
              onClick={handleOpenLeaderboard}
              className="ml-auto px-3 py-1 text-xs rounded bg-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/30 border border-[#f59e0b]/50 transition-colors"
            >
              🏆 排行榜
            </button>
          </div>

          {/* Time Trial List */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredTimeTrials.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#4a5568]">
                <span className="text-4xl mb-2">⏱️</span>
                <p className="text-sm">没有符合条件的时间挑战</p>
              </div>
            ) : (
              <ul className="space-y-3" role="list">
                {filteredTimeTrials.map((challenge) => (
                  <TimeTrialCard
                    key={challenge.id}
                    challenge={challenge}
                    onStart={() => handleStartTimeTrial(challenge.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Badges Footer */}
      {badges.length > 0 && (
        <div className="px-4 py-3 border-t border-[#1e2a42] bg-[#121826]">
          <h3 className="text-xs font-medium text-[#9ca3af] mb-2">已获得的徽章</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="px-2 py-1 text-xs rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30"
                title={badge.description}
              >
                {badge.displayName}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Trial Modal */}
      {showTimeTrialModal && activeTimeTrialId && (
        <TimeTrialChallenge
          challengeId={activeTimeTrialId}
          isOpen={showTimeTrialModal}
          onClose={() => {
            setShowTimeTrialModal(false);
            setActiveTimeTrialId(null);
          }}
          onComplete={(time, score) => {
            console.log(`Time trial completed: ${time}ms, score: ${score}`);
          }}
        />
      )}

      {/* Leaderboard Modal */}
      <ChallengeLeaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
}

/**
 * Time Trial Card Component
 */
function TimeTrialCard({
  challenge,
  onStart,
}: {
  challenge: {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    difficulty: TimeTrialDifficulty;
    baseReward: number;
    rewardMultiplier: number;
  };
  onStart: () => void;
}) {
  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'easy': return '#22c55e';
      case 'normal': return '#3b82f6';
      case 'hard': return '#f59e0b';
      case 'extreme': return '#ef4444';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <li className="bg-[#1a2235] rounded-lg border border-[#2d3a4f] overflow-hidden hover:border-[#4a5568] transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-white">{challenge.title}</h3>
          <div 
            className="px-2 py-0.5 text-xs rounded font-medium"
            style={{ 
              backgroundColor: `${getDifficultyColor()}20`,
              color: getDifficultyColor(),
            }}
          >
            {getTimeTrialDifficultyLabel(challenge.difficulty)}
          </div>
        </div>
        
        <p className="text-sm text-[#9ca3af] mb-3">{challenge.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-[#4a5568] mb-3">
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{formatTime(challenge.timeLimit)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🎁</span>
            <span>+{Math.round(challenge.baseReward * challenge.rewardMultiplier)} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <span>×</span>
            <span>{challenge.rewardMultiplier.toFixed(1)}</span>
          </div>
        </div>
        
        <button
          onClick={onStart}
          className="w-full px-4 py-2 rounded-lg bg-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/30 border border-[#f59e0b]/50 transition-colors font-medium text-sm"
        >
          开始挑战
        </button>
      </div>
    </li>
  );
}

export default ChallengePanel;
