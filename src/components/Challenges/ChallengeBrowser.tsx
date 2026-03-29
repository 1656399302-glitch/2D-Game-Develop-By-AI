import { useState, useMemo } from 'react';
import {
  ChallengeDefinition,
  CHALLENGE_DEFINITIONS,
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
  getChallengeCategoryLabel,
  getChallengeCategoryIcon,
} from '../../data/challenges';
import { useChallengeStore } from '../../store/useChallengeStore';
import { EnhancedChallengeCard } from './EnhancedChallengeCard';
import { ChallengeTimer } from './ChallengeTimer';

interface ChallengeBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterTab = 'all' | 'creation' | 'collection' | 'activation' | 'mastery';
type ViewMode = 'progress' | 'time-trial';

/**
 * Modal browser for viewing and completing challenges
 */
export function ChallengeBrowser({ isOpen, onClose }: ChallengeBrowserProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('progress');
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeDefinition | null>(null);
  const [celebrationChallenge, setCelebrationChallenge] = useState<ChallengeDefinition | null>(null);
  const [timeTrialActive, setTimeTrialActive] = useState(false);

  const { isCompleted, completeChallenge, getCompletedCount } = useChallengeStore();

  const filteredChallenges = useMemo(() => {
    if (activeTab === 'all') {
      return CHALLENGE_DEFINITIONS;
    }
    return CHALLENGE_DEFINITIONS.filter((c) => c.category === activeTab);
  }, [activeTab]);

  // Get progress for a challenge
  const getChallengeProgress = (challengeId: string): number => {
    // For now, return 0 - this would be connected to actual progress tracking
    // In a full implementation, this would pull from a challenge progress store
    return isCompleted(challengeId) ? 1 : 0;
  };

  const handleClaimReward = (challenge: ChallengeDefinition) => {
    completeChallenge(challenge.id);
    setCelebrationChallenge(challenge);
  };

  const handleCloseCelebration = () => {
    setCelebrationChallenge(null);
  };

  const handleClose = () => {
    setSelectedChallenge(null);
    setActiveTab('all');
    setTimeTrialActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-4xl max-h-[85vh] bg-[#121826] border border-[#1e2a42] rounded-xl flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h2 className="text-xl font-bold text-[#00d4ff]">挑战</h2>
                <p className="text-xs text-[#4a5568]">
                  {getCompletedCount()} of {CHALLENGE_DEFINITIONS.length} 已完成
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={() => setViewMode('progress')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewMode === 'progress'
                    ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                进度模式
              </button>
              <button
                onClick={() => setViewMode('time-trial')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewMode === 'time-trial'
                    ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                计时挑战
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex border-b border-[#1e2a42]">
            {(['all', 'creation', 'collection', 'activation', 'mastery'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[#00d4ff] border-b-2 border-[#00d4ff] bg-[#00d4ff]/5'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2a42]/50'
                }`}
              >
                {tab === 'all' ? '全部' : getChallengeCategoryLabel(tab)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Challenge List */}
            <div className="w-1/2 border-r border-[#1e2a42] overflow-y-auto">
              {filteredChallenges.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#4a5568]">
                  <span className="text-4xl mb-2">📭</span>
                  <p className="text-sm">No challenges available</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredChallenges.map((challenge) => (
                    <EnhancedChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      currentProgress={getChallengeProgress(challenge.id)}
                      isCompleted={isCompleted(challenge.id)}
                      isSelected={selectedChallenge?.id === challenge.id}
                      onClick={() => setSelectedChallenge(challenge)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Detail Panel */}
            <div className="w-1/2 overflow-y-auto bg-[#0a0e17]/30">
              {selectedChallenge ? (
                <div className="p-4">
                  {/* Challenge Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getChallengeCategoryIcon(selectedChallenge.category)}</span>
                      <h3 className="text-lg font-semibold text-white">
                        {selectedChallenge.title}
                      </h3>
                      <span
                        className="px-2 py-0.5 text-xs font-medium rounded"
                        style={{
                          backgroundColor: `${getChallengeDifficultyColor(selectedChallenge.difficulty)}20`,
                          color: getChallengeDifficultyColor(selectedChallenge.difficulty),
                        }}
                      >
                        {getChallengeDifficultyLabel(selectedChallenge.difficulty)}
                      </span>
                    </div>
                    <p className="text-sm text-[#9ca3af]">
                      {selectedChallenge.description}
                    </p>
                  </div>

                  {/* Time Trial Mode */}
                  {viewMode === 'time-trial' && (
                    <div className="mb-4 p-4 rounded-lg bg-[#1e2a42]/50 border border-[#f59e0b]/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[#f59e0b]">
                          ⏱️ 计时挑战
                        </span>
                        {!timeTrialActive && (
                          <button
                            onClick={() => setTimeTrialActive(true)}
                            className="px-3 py-1 text-xs rounded bg-[#f59e0b] text-[#0a0e17] font-medium"
                          >
                            开始计时
                          </button>
                        )}
                      </div>
                      {timeTrialActive && (
                        <ChallengeTimer
                          limit={300} // 5 minutes
                          autoStart={true}
                          onExpire={() => setTimeTrialActive(false)}
                          className="justify-center"
                        />
                      )}
                    </div>
                  )}

                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[#4a5568]">进度</span>
                      <span className="text-white">
                        {getChallengeProgress(selectedChallenge.id)} / {selectedChallenge.target}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1e2a42] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-[#06b6d4] transition-all"
                        style={{
                          width: `${Math.min(100, (getChallengeProgress(selectedChallenge.id) / selectedChallenge.target) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Reward Section */}
                  <div className="p-4 rounded-lg bg-[#0a0e17] border border-[#1e2a42] mb-4">
                    <p className="text-xs text-[#4a5568] uppercase tracking-wider mb-2">
                      奖励
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {selectedChallenge.reward.type === 'badge' ? '🎖️' : 
                         selectedChallenge.reward.type === 'recipe' ? '📜' : '⭐'}
                      </span>
                      <div>
                        <p className="text-[#fbbf24] font-medium">
                          {selectedChallenge.reward.displayName}
                        </p>
                        <p className="text-xs text-[#9ca3af]">
                          {selectedChallenge.reward.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {isCompleted(selectedChallenge.id) ? (
                      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b]">
                        <span>✓</span>
                        <span className="font-medium">挑战已完成!</span>
                        <span className="text-lg">🏆</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleClaimReward(selectedChallenge)}
                        className="w-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#0a0e17] font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-all"
                      >
                        🎁 领取奖励
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#4a5568] p-8 text-center">
                  <span className="text-5xl mb-4 opacity-50">👆</span>
                  <p className="text-sm">选择一个挑战查看详情</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#1e2a42] bg-[#0a0e17]/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#4a5568]">
                完成挑战以获得徽章和奖励!
              </p>
              {getCompletedCount() > 0 && (
                <button
                  onClick={() => {
                    if (confirm('重置所有挑战进度? 此操作无法撤销.')) {
                      useChallengeStore.getState().resetProgress();
                      setSelectedChallenge(null);
                    }
                  }}
                  className="text-xs text-[#ef4444] hover:text-[#f87171] transition-colors"
                >
                  重置进度
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Overlay */}
      {celebrationChallenge && (
        <LegacyChallengeCelebration
          challenge={celebrationChallenge}
          onClose={handleCloseCelebration}
        />
      )}
    </>
  );
}

/**
 * Legacy celebration component for ChallengeDefinition type
 */
function LegacyChallengeCelebration({
  challenge,
  onClose,
}: {
  challenge: ChallengeDefinition;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-[#121826] border border-[#f59e0b]/50 rounded-2xl p-8 shadow-2xl">
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#f59e0b] rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#f59e0b] rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#f59e0b] rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#f59e0b] rounded-br-2xl" />

        {/* Badge Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full border-4 border-dashed border-[#f59e0b]/50 animate-spin-slow"
              style={{ animationDuration: '8s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] flex items-center justify-center shadow-lg">
                <span className="text-4xl">🏆</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#f59e0b] text-center mb-2 animate-pulse">
          挑战完成!
        </h2>

        {/* Challenge Name */}
        <p className="text-lg text-white font-semibold text-center mb-6">
          {challenge.title}
        </p>

        {/* Reward Section */}
        <div className="bg-[#0a0e17] rounded-xl p-4 mb-6 border border-[#1e2a42]">
          <p className="text-xs text-[#4a5568] uppercase tracking-wider mb-2 text-center">
            奖励解锁
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">
              {challenge.reward.type === 'badge' ? '🎖️' : 
               challenge.reward.type === 'recipe' ? '📜' : '⭐'}
            </span>
            <div className="text-left">
              <p className="text-[#fbbf24] font-semibold">
                {challenge.reward.displayName}
              </p>
              <p className="text-xs text-[#9ca3af]">
                {challenge.reward.description}
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#0a0e17] font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all transform hover:scale-105"
        >
          继续
        </button>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default ChallengeBrowser;
