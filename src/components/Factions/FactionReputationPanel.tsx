/**
 * Faction Reputation Panel Component
 * 
 * Displays per-faction reputation bars, level icons, and progress to next level.
 * Integrates with the faction reputation store.
 */

import { useFactionReputationStore } from '../../store/useFactionReputationStore';
import { 
  FactionId, 
  FACTIONS,
  REPUTATION_LEVEL_INFO,
} from '../../types/factions';
import { FactionReputationLevel } from '../../types/factionReputation';
import { 
  getReputationLevel, 
  getProgressToNextLevel,
  getLevelDisplayNameZh,
} from '../../utils/factionReputationUtils';

interface FactionReputationPanelProps {
  /** Optional className for custom styling */
  className?: string;
  /** Whether to show detailed stats */
  showDetails?: boolean;
  /** Callback when a faction is clicked */
  onFactionClick?: (factionId: FactionId) => void;
}

/**
 * Single Faction Reputation Bar Component
 */
function FactionReputationBar({
  factionId,
  onClick,
  showDetails = false,
}: {
  factionId: FactionId;
  onClick?: () => void;
  showDetails?: boolean;
}) {
  const reputation = useFactionReputationStore((state) => state.reputations[factionId] || 0);
  const faction = FACTIONS[factionId];
  const level = getReputationLevel(reputation);
  const progress = getProgressToNextLevel(reputation);
  const levelInfo = REPUTATION_LEVEL_INFO[level];

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border transition-all ${
        onClick 
          ? 'cursor-pointer hover:bg-[#1e2a42]/30' 
          : ''
      }`}
      style={{ borderColor: `${faction.color}40` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Faction Icon */}
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${faction.color}20` }}
          >
            {faction.icon}
          </div>
          
          {/* Faction Name & Level */}
          <div className="text-left">
            <h4 className="font-semibold text-white">
              {faction.nameCn}
            </h4>
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-medium"
                style={{ color: levelInfo.color }}
              >
                {levelInfo.icon} {getLevelDisplayNameZh(level)}
              </span>
            </div>
          </div>
        </div>

        {/* Points Display */}
        <div className="text-right">
          <span className="text-lg font-bold text-white">
            {reputation}
          </span>
          <span className="text-xs text-[#4a5568] ml-1">pts</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* Background */}
        <div className="h-2 rounded-full bg-[#1e2a42] overflow-hidden">
          {/* Progress Fill */}
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progress.percentage}%`,
              backgroundColor: levelInfo.color,
            }}
          />
        </div>

        {/* Glow Effect at Progress Edge */}
        {progress.percentage > 0 && progress.percentage < 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full blur-sm"
            style={{
              left: `calc(${progress.percentage}% - 6px)`,
              backgroundColor: levelInfo.color,
              boxShadow: `0 0 10px ${levelInfo.color}`,
            }}
          />
        )}
      </div>

      {/* Progress Details */}
      {showDetails && (
        <div className="flex items-center justify-between mt-2 text-xs text-[#4a5568]">
          <span>
            {progress.pointsInCurrentLevel} / {progress.pointsRemaining > 0 
              ? (progress.pointsInCurrentLevel + progress.pointsRemaining)
              : 'MAX'} pts
          </span>
          {progress.pointsRemaining > 0 ? (
            <span>
              {progress.pointsRemaining} more to {getNextLevelName(level)}
            </span>
          ) : (
            <span className="text-[#f59e0b]">Max Rank Achieved!</span>
          )}
        </div>
      )}
    </button>
  );
}

/**
 * Get the next level name for display
 */
function getNextLevelName(currentLevel: FactionReputationLevel): string {
  const nextLevels: Partial<Record<FactionReputationLevel, string>> = {
    [FactionReputationLevel.Apprentice]: '行商',
    [FactionReputationLevel.Journeyman]: '专家',
    [FactionReputationLevel.Expert]: '大师',
    [FactionReputationLevel.Master]: '宗师',
  };
  return nextLevels[currentLevel] || 'MAX';
}

/**
 * Faction Reputation Panel Component
 * 
 * Displays reputation bars for all 4 factions with level indicators and progress.
 */
export function FactionReputationPanel({
  className = '',
  showDetails = true,
  onFactionClick,
}: FactionReputationPanelProps) {
  const totalReputation = useFactionReputationStore((state) => 
    Object.values(state.reputations).reduce((sum, rep) => sum + rep, 0)
  );
  const factionIds: FactionId[] = ['void', 'inferno', 'storm', 'stellar'];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>⚡</span>
          <span>派系声望</span>
        </h3>
        <div className="text-sm">
          <span className="text-[#4a5568]">Total:</span>
          <span className="text-[#f59e0b] font-bold ml-1">{totalReputation}</span>
          <span className="text-[#4a5568] ml-1">pts</span>
        </div>
      </div>

      {/* Faction Reputation Bars */}
      <div className="grid grid-cols-1 gap-3">
        {factionIds.map((factionId) => (
          <FactionReputationBar
            key={factionId}
            factionId={factionId}
            showDetails={showDetails}
            onClick={onFactionClick ? () => onFactionClick(factionId) : undefined}
          />
        ))}
      </div>

      {/* Grandmaster Section */}
      <GrandmasterUnlocks />
    </div>
  );
}

/**
 * Component showing what's unlocked at Grandmaster rank
 */
function GrandmasterUnlocks() {
  const factionIds: FactionId[] = ['void', 'inferno', 'storm', 'stellar'];
  const variantModules: Record<FactionId, string> = {
    void: '🌑 虚空奥术齿轮',
    inferno: '🔥 烈焰核心',
    storm: '⚡ 雷霆管道',
    stellar: '✨ 星辉晶体',
  };

  const unlockedCount = factionIds.filter((fid) => {
    const rep = useFactionReputationStore.getState().reputations[fid] || 0;
    return getReputationLevel(rep) === FactionReputationLevel.Grandmaster;
  }).length;

  return (
    <div 
      className="p-4 rounded-lg border"
      style={{ 
        backgroundColor: '#0a0e17',
        borderColor: '#f59e0b40',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏆</span>
        <h4 className="text-sm font-semibold text-[#f59e0b]">
          宗师解锁进度
        </h4>
        <span className="text-xs text-[#4a5568]">
          ({unlockedCount}/4)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {factionIds.map((fid) => {
          const rep = useFactionReputationStore.getState().reputations[fid] || 0;
          const level = getReputationLevel(rep);
          const isGrandmaster = level === FactionReputationLevel.Grandmaster;

          return (
            <div
              key={fid}
              className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                isGrandmaster 
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b]' 
                  : 'bg-[#1e2a42]/50 text-[#4a5568]'
              }`}
            >
              <span>{isGrandmaster ? '✓' : '○'}</span>
              <span>{variantModules[fid]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact reputation display for inline use
 */
export function CompactReputationDisplay({ factionId }: { factionId: FactionId }) {
  const reputation = useFactionReputationStore((state) => state.reputations[factionId] || 0);
  const faction = FACTIONS[factionId];
  const level = getReputationLevel(reputation);
  const levelInfo = REPUTATION_LEVEL_INFO[level];

  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-[#1e2a42]">
      <span>{faction.icon}</span>
      <span className="text-sm font-medium" style={{ color: levelInfo.color }}>
        {reputation}
      </span>
    </div>
  );
}

export default FactionReputationPanel;
