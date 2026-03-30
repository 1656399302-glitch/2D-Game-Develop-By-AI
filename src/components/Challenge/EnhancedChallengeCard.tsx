/**
 * Enhanced Challenge Card Component
 * 
 * An accessible challenge card with proper ARIA attributes for progress bars.
 * This component is used in ChallengePanel to ensure accessibility compliance.
 */

import {
  ChallengeDefinition,
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
  getChallengeCategoryLabel,
} from '../../data/challenges';

interface EnhancedChallengeCardProps {
  challenge: ChallengeDefinition;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  onClaim: () => void;
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

/**
 * Enhanced Challenge Card with accessibility support
 * 
 * Features:
 * - Progress bar with role="progressbar" for screen readers
 * - Proper ARIA attributes (aria-valuenow, aria-valuemin, aria-valuemax, aria-label)
 * - Visual completion states
 */
export function EnhancedChallengeCard({
  challenge,
  progress,
  isCompleted,
  isClaimed,
  onClaim,
}: EnhancedChallengeCardProps) {
  const difficultyColor = getChallengeDifficultyColor(challenge.difficulty);
  const progressPercent = Math.min((progress / challenge.target) * 100, 100);
  const currentProgress = Math.min(progress, challenge.target);

  // Create accessible label for the progress bar
  const progressAriaLabel = `${challenge.title} progress: ${currentProgress} of ${challenge.target} completed`;

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

        {/* Progress Bar with proper ARIA attributes */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#9ca3af]">进度</span>
            <span className="text-xs text-[#9ca3af]">
              {currentProgress} / {challenge.target}
            </span>
          </div>
          
          {/* Accessible Progress Bar */}
          <div
            className="h-2 rounded-full overflow-hidden bg-[#1e2a42]"
            role="progressbar"
            aria-valuenow={Math.round(progressPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={progressAriaLabel}
          >
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

export default EnhancedChallengeCard;
