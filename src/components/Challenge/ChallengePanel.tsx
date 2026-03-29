import { useState, useMemo } from 'react';
import {
  CHALLENGE_DEFINITIONS,
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
  getChallengeCategoryLabel,
  ChallengeDefinition,
  ChallengeCategory,
  ChallengeDifficulty,
} from '../../data/challenges';
import { useChallengeStore } from '../../store/useChallengeStore';

/**
 * Challenge category filter tabs
 */
type CategoryTab = 'all' | ChallengeCategory;

/**
 * Difficulty filter
 */
type DifficultyFilter = 'all' | ChallengeDifficulty;

/**
 * Challenge Panel Component
 * Displays available challenges, progress, and rewards
 */
export function ChallengePanel() {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyFilter>('all');

  const {
    totalXP,
    badges,
    getChallengeProgress,
    isChallengeCompleted,
    isRewardClaimed,
    claimReward,
    getCompletedChallenges,
  } = useChallengeStore();

  // Filter challenges based on active filters
  const filteredChallenges = useMemo(() => {
    return CHALLENGE_DEFINITIONS.filter((challenge) => {
      const categoryMatch = activeCategory === 'all' || challenge.category === activeCategory;
      const difficultyMatch = activeDifficulty === 'all' || challenge.difficulty === activeDifficulty;
      return categoryMatch && difficultyMatch;
    });
  }, [activeCategory, activeDifficulty]);

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

      {/* Challenge List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredChallenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#4a5568]">
            <span className="text-4xl mb-2">📭</span>
            <p className="text-sm">没有符合条件的挑战</p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
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
    </div>
  );
}

interface ChallengeCardProps {
  challenge: ChallengeDefinition;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  onClaim: () => void;
}

/**
 * Individual challenge card component
 */
function ChallengeCard({ challenge, progress, isCompleted, isClaimed, onClaim }: ChallengeCardProps) {
  const difficultyColor = getChallengeDifficultyColor(challenge.difficulty);
  const progressPercent = Math.min((progress / challenge.target) * 100, 100);

  return (
    <li>
      <div
        className={`p-4 rounded-lg border transition-all ${
          isCompleted
            ? 'border-[#f59e0b]/50 bg-[#f59e0b]/5'
            : 'border-[#1e2a42] bg-[#121826] hover:border-[#00d4ff]/30'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isCompleted && (
                <span className="text-[#f59e0b] text-sm">✓</span>
              )}
              <h4
                className={`font-semibold ${
                  isCompleted ? 'text-[#f59e0b]' : 'text-white'
                }`}
              >
                {challenge.title}
              </h4>
            </div>
            <p className="text-xs text-[#9ca3af]">
              {challenge.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className="px-2 py-0.5 text-xs font-medium rounded"
              style={{
                backgroundColor: `${difficultyColor}20`,
                color: difficultyColor,
              }}
            >
              {getChallengeDifficultyLabel(challenge.difficulty)}
            </span>
            <span className="text-[10px] text-[#9ca3af] px-1.5 py-0.5 rounded bg-[#1e2a42]">
              {getChallengeCategoryLabel(challenge.category)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#9ca3af]">进度</span>
            <span className="text-xs text-[#9ca3af]">
              {Math.min(progress, challenge.target)} / {challenge.target}
            </span>
          </div>
          <div className="w-full h-2 bg-[#1e2a42] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-[#f59e0b]'
                  : 'bg-gradient-to-r from-[#00d4ff] to-[#22c55e]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Reward Preview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9ca3af]">奖励:</span>
            <RewardBadge reward={challenge.reward} />
          </div>

          {/* Claim Button */}
          {isCompleted && !isClaimed && (
            <button
              onClick={onClaim}
              className="px-3 py-1.5 text-xs font-medium rounded bg-[#22c55e] text-white hover:bg-[#16a34a] transition-colors"
            >
              领取奖励
            </button>
          )}
          {isClaimed && (
            <span className="px-3 py-1.5 text-xs font-medium rounded bg-[#1e2a42] text-[#9ca3af]">
              已领取
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * Reward badge display component
 */
function RewardBadge({ reward }: { reward: ChallengeDefinition['reward'] }) {
  switch (reward.type) {
    case 'xp':
      return (
        <span className="px-2 py-0.5 text-xs rounded bg-[#f59e0b]/20 text-[#f59e0b]">
          {reward.displayName}
        </span>
      );
    case 'recipe':
      return (
        <span className="px-2 py-0.5 text-xs rounded bg-[#3b82f6]/20 text-[#3b82f6]">
          {reward.displayName}
        </span>
      );
    case 'badge':
      return (
        <span className="px-2 py-0.5 text-xs rounded bg-[#a855f7]/20 text-[#a855f7]">
          {reward.displayName}
        </span>
      );
    default:
      return null;
  }
}

export default ChallengePanel;
