import { useChallengeStore } from '../../store/useChallengeStore';
import { CHALLENGES } from '../../types/challenges';

interface ChallengeButtonProps {
  onClick: () => void;
}

/**
 * Header button to open the Challenge Browser modal
 * Displays current completion count
 */
export function ChallengeButton({ onClick }: ChallengeButtonProps) {
  const completedCount = useChallengeStore((state) => state.getCompletedCount());
  const totalCount = CHALLENGES.length;

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
