import { useState, useMemo } from 'react';
import {
  CHALLENGE_DEFINITIONS,
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
  ChallengeCategory,
  ChallengeDifficulty,
} from '../../data/challenges';
import { useChallengeStore } from '../../store/useChallengeStore';
import { EnhancedChallengeCard } from './EnhancedChallengeCard';

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
 * 
 * Uses EnhancedChallengeCard for proper accessibility with role="progressbar"
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

export default ChallengePanel;
