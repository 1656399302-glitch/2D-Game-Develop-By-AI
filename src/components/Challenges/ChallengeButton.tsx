import { useMemo } from 'react';
import { useChallengeStore } from '../../store/useChallengeStore';
import { CHALLENGE_DEFINITIONS } from '../../data/challenges';

interface ChallengeButtonProps {
  onClick: () => void;
}

/**
 * Header button to open the Challenge Browser modal
 * Displays current completion count
 */
export function ChallengeButton({ onClick }: ChallengeButtonProps) {
  // FIX: Use getState() with useMemo instead of selector-with-method-call
  // This prevents the selector function from changing on every store update
  const completedCount = useMemo(() => 
    useChallengeStore.getState().getCompletedCount(), 
  []);

  const totalCount = CHALLENGE_DEFINITIONS.length;

  return (
    <button
      onClick={onClick}
      className="arcane-button-secondary flex items-center gap-2 relative"
      title="View Challenges"
    >
      <span className="text-base">🏆</span>
      <span className="hidden sm:inline">Challenges</span>
      <span className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded bg-[#f59e0b]/20 text-[#f59e0b]">
        {completedCount}/{totalCount}
      </span>
    </button>
  );
}

export default ChallengeButton;
