import { useState, useMemo } from 'react';
import {
  Challenge,
  CHALLENGES,
  getDifficultyColor,
  getDifficultyLabel,
} from '../../types/challenges';
import { useChallengeStore } from '../../store/useChallengeStore';
import { ChallengeValidationPanel } from './ChallengeValidationPanel';
import { ChallengeCelebration } from './ChallengeCelebration';

interface ChallengeBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterTab = 'all' | 'available' | 'completed';

/**
 * Modal browser for viewing and completing challenges
 */
export function ChallengeBrowser({ isOpen, onClose }: ChallengeBrowserProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [celebrationChallenge, setCelebrationChallenge] = useState<Challenge | null>(null);

  const { isCompleted, completeChallenge, getCompletedCount } = useChallengeStore();

  const filteredChallenges = useMemo(() => {
    switch (activeTab) {
      case 'available':
        return CHALLENGES.filter((c) => !isCompleted(c.id));
      case 'completed':
        return CHALLENGES.filter((c) => isCompleted(c.id));
      default:
        return CHALLENGES;
    }
  }, [activeTab, isCompleted]);

  const handleClaimReward = (challenge: Challenge) => {
    completeChallenge(challenge.id);
    setCelebrationChallenge(challenge);
  };

  const handleCloseCelebration = () => {
    setCelebrationChallenge(null);
  };

  const handleClose = () => {
    setSelectedChallenge(null);
    setActiveTab('all');
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
                <h2 className="text-xl font-bold text-[#00d4ff]">Challenges</h2>
                <p className="text-xs text-[#4a5568]">
                  {getCompletedCount()} of {CHALLENGES.length} completed
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-[#1e2a42]">
            {(['all', 'available', 'completed'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[#00d4ff] border-b-2 border-[#00d4ff] bg-[#00d4ff]/5'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2a42]/50'
                }`}
              >
                {tab === 'all' ? 'All Challenges' : tab === 'available' ? 'Available' : 'Completed'}
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-[#1e2a42]">
                  {tab === 'all'
                    ? CHALLENGES.length
                    : tab === 'available'
                    ? CHALLENGES.length - getCompletedCount()
                    : getCompletedCount()}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Challenge List */}
            <div className="w-1/2 border-r border-[#1e2a42] overflow-y-auto">
              {filteredChallenges.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#4a5568]">
                  <span className="text-4xl mb-2">
                    {activeTab === 'completed' ? '🔒' : '📭'}
                  </span>
                  <p className="text-sm">
                    {activeTab === 'completed'
                      ? 'No completed challenges yet'
                      : 'No challenges available'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      isCompleted={isCompleted(challenge.id)}
                      isSelected={selectedChallenge?.id === challenge.id}
                      onClick={() => setSelectedChallenge(challenge)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Validation Panel */}
            <div className="w-1/2 overflow-y-auto bg-[#0a0e17]/30">
              {selectedChallenge ? (
                <ChallengeValidationPanel
                  challenge={selectedChallenge}
                  onClaimReward={handleClaimReward}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#4a5568] p-8 text-center">
                  <span className="text-5xl mb-4 opacity-50">👆</span>
                  <p className="text-sm">Select a challenge to view details</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#1e2a42] bg-[#0a0e17]/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#4a5568]">
                Complete challenges to earn badges and titles!
              </p>
              {getCompletedCount() > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Reset all challenge progress? This cannot be undone.')) {
                      useChallengeStore.getState().resetProgress();
                      setSelectedChallenge(null);
                    }
                  }}
                  className="text-xs text-[#ef4444] hover:text-[#f87171] transition-colors"
                >
                  Reset Progress
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Overlay */}
      {celebrationChallenge && (
        <ChallengeCelebration
          challenge={celebrationChallenge}
          onClose={handleCloseCelebration}
        />
      )}
    </>
  );
}

interface ChallengeCardProps {
  challenge: Challenge;
  isCompleted: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function ChallengeCard({ challenge, isCompleted, isSelected, onClick }: ChallengeCardProps) {
  const difficultyColor = getDifficultyColor(challenge.difficulty);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected
          ? 'border-[#00d4ff] bg-[#00d4ff]/10'
          : isCompleted
          ? 'border-[#f59e0b]/50 bg-[#f59e0b]/5 hover:border-[#f59e0b]'
          : 'border-[#1e2a42] bg-[#121826] hover:border-[#00d4ff]/50 hover:bg-[#1e2a42]/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isCompleted && <span className="text-[#f59e0b]">✓</span>}
            <h3
              className={`font-semibold truncate ${
                isCompleted ? 'text-[#f59e0b]' : 'text-white'
              }`}
            >
              {challenge.title}
            </h3>
          </div>
          <p className="text-xs text-[#9ca3af] line-clamp-2">
            {challenge.description}
          </p>
        </div>
        <span
          className="px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap"
          style={{
            backgroundColor: `${difficultyColor}20`,
            color: difficultyColor,
          }}
        >
          {getDifficultyLabel(challenge.difficulty)}
        </span>
      </div>

      {/* Requirement Preview */}
      <div className="mt-3 flex flex-wrap gap-1">
        {challenge.requirements.minModules && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2a42] text-[#9ca3af]">
            {challenge.requirements.minModules}+ modules
          </span>
        )}
        {challenge.requirements.minConnections && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2a42] text-[#9ca3af]">
            {challenge.requirements.minConnections}+ connections
          </span>
        )}
        {challenge.requirements.requiredTags && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2a42] text-[#9ca3af]">
            {challenge.requirements.requiredTags[0]}
          </span>
        )}
        {challenge.requirements.requiredRarity && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2a42] text-[#9ca3af]">
            {challenge.requirements.requiredRarity}+
          </span>
        )}
        {challenge.requirements.specificModuleTypes && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2a42] text-[#9ca3af]">
            {challenge.requirements.specificModuleTypes.length} specific
          </span>
        )}
      </div>
    </button>
  );
}

export default ChallengeBrowser;
