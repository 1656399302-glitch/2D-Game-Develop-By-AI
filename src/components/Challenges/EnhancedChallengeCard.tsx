/**
 * Enhanced Challenge Card Component
 * 
 * Modern card UI with difficulty badges, progress bars, and reward previews.
 * Used in the Challenge Browser for displaying progress-based challenges.
 */

import { useMemo } from 'react';
import { 
  ChallengeDefinition, 
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
  getChallengeCategoryIcon,
} from '../../data/challenges';

interface EnhancedChallengeCardProps {
  challenge: ChallengeDefinition;
  currentProgress: number;
  isCompleted: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Calculate progress percentage
 */
function getProgressPercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, (current / target) * 100);
}

/**
 * Enhanced Challenge Card Component
 */
export function EnhancedChallengeCard({
  challenge,
  currentProgress,
  isCompleted,
  isSelected = false,
  onClick,
}: EnhancedChallengeCardProps) {
  const progressPercentage = useMemo(
    () => getProgressPercentage(currentProgress, challenge.target),
    [currentProgress, challenge.target]
  );
  
  const difficultyColor = getChallengeDifficultyColor(challenge.difficulty);
  const categoryIcon = getChallengeCategoryIcon(challenge.category);

  const getRewardIcon = () => {
    switch (challenge.reward.type) {
      case 'badge':
        return '🎖️';
      case 'recipe':
        return '📜';
      case 'xp':
        return '⭐';
      default:
        return '🎁';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
        isSelected
          ? 'border-[#00d4ff] bg-[#00d4ff]/10 shadow-lg shadow-[#00d4ff]/20'
          : isCompleted
          ? 'border-[#f59e0b]/50 bg-[#f59e0b]/5 hover:border-[#f59e0b]'
          : 'border-[#1e2a42] bg-[#121826] hover:border-[#00d4ff]/50 hover:bg-[#1e2a42]/50'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {isCompleted && (
            <span className="text-[#f59e0b] text-lg">✓</span>
          )}
          <span className="text-lg">{categoryIcon}</span>
          <h3
            className={`font-semibold truncate ${
              isCompleted ? 'text-[#f59e0b]' : 'text-white'
            }`}
          >
            {challenge.title}
          </h3>
        </div>
        
        {/* Difficulty Badge */}
        <span
          className="px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap"
          style={{
            backgroundColor: `${difficultyColor}20`,
            color: difficultyColor,
          }}
        >
          {getChallengeDifficultyLabel(challenge.difficulty)}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-[#9ca3af] line-clamp-2 mb-3">
        {challenge.description}
      </p>

      {/* Progress Section */}
      <div className="space-y-2">
        {/* Progress Bar with role="progressbar" for accessibility */}
        <div className="relative">
          <div
            className="h-2 rounded-full overflow-hidden bg-[#1e2a42]"
            role="progressbar"
            aria-valuenow={Math.round(progressPercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${challenge.title} progress: ${currentProgress}/${challenge.target}`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isCompleted 
                  ? 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]' 
                  : 'bg-gradient-to-r from-[#00d4ff] to-[#06b6d4]'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Progress Glow Effect */}
          {!isCompleted && progressPercentage > 0 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#00d4ff] blur-sm animate-pulse"
              style={{ 
                left: `calc(${progressPercentage}% - 8px)`,
                opacity: Math.min(0.8, progressPercentage / 100),
              }}
            />
          )}
        </div>

        {/* Progress Text */}
        <div className="flex items-center justify-between text-xs">
          <span className={`${isCompleted ? 'text-[#f59e0b]' : 'text-[#9ca3af]'}`}>
            {isCompleted ? '✓ Completed' : `${currentProgress} / ${challenge.target}`}
          </span>
          
          {/* Reward Preview */}
          <div className="flex items-center gap-1.5">
            <span className="opacity-60">{getRewardIcon()}</span>
            <span className="text-[#fbbf24] font-medium truncate max-w-[100px]">
              {challenge.reward.displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Completed Overlay Effect */}
      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/5 to-transparent" />
        </div>
      )}
    </button>
  );
}

/**
 * Compact version for lists with limited space
 */
export function CompactChallengeCard({
  challenge,
  currentProgress,
  isCompleted,
  isSelected = false,
  onClick,
}: EnhancedChallengeCardProps) {
  const difficultyColor = getChallengeDifficultyColor(challenge.difficulty);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${
        isSelected
          ? 'bg-[#00d4ff]/10 border border-[#00d4ff]'
          : isCompleted
          ? 'bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10'
          : 'hover:bg-[#1e2a42]/50'
      }`}
    >
      {isCompleted ? (
        <span className="text-[#f59e0b]">✓</span>
      ) : (
        <div
          className="w-5 h-5 rounded border flex items-center justify-center"
          style={{ borderColor: difficultyColor }}
        >
          <span className="text-[8px]" style={{ color: difficultyColor }}>
            {challenge.target}
          </span>
        </div>
      )}
      
      <span className={`flex-1 text-left text-sm truncate ${isCompleted ? 'text-[#f59e0b]' : 'text-white'}`}>
        {challenge.title}
      </span>
      
      <span className="text-xs text-[#4a5568]">
        {currentProgress}/{challenge.target}
      </span>
    </button>
  );
}

export default EnhancedChallengeCard;
