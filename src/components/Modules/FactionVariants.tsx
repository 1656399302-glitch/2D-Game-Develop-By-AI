/**
 * Faction Variant Modules Component
 * 
 * Displays and manages faction-exclusive variant modules that are unlocked
 * at Grandmaster reputation rank (2000+ reputation).
 */

import { useFactionReputationStore } from '../../store/useFactionReputationStore';
import { FactionId, FACTION_VARIANT_MODULES } from '../../types/factions';
import { FACTION_VARIANT_DEFINITIONS } from '../../data/factionVariants';
import { getReputationLevel, isVariantUnlockedForLevel } from '../../types/factionReputation';

// Re-export for backward compatibility
export { FACTION_VARIANT_MODULES, FACTION_VARIANT_DEFINITIONS } from '../../data/factionVariants';

interface FactionVariantsProps {
  /** Optional callback when a variant is selected */
  onVariantClick?: (moduleId: string) => void;
  /** Whether to show locked variants (grayed out) */
  showLocked?: boolean;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Faction Variants Component
 * 
 * Displays all 4 faction variant modules, highlighting those that are unlocked
 * at Grandmaster rank (2000+ reputation).
 */
export function FactionVariants({
  onVariantClick,
  showLocked = false,
  className = '',
}: FactionVariantsProps) {
  const factionIds: FactionId[] = ['void', 'inferno', 'storm', 'stellar'];
  
  const getUnlockedVariants = () => {
    const state = useFactionReputationStore.getState();
    const unlocked: string[] = [];
    
    for (const factionId of factionIds) {
      const rep = state.reputations[factionId] || 0;
      const level = getReputationLevel(rep);
      if (isVariantUnlockedForLevel(level)) {
        const variant = FACTION_VARIANT_MODULES[factionId];
        if (variant) unlocked.push(variant);
      }
    }
    
    return unlocked;
  };

  const unlockedVariants = getUnlockedVariants();
  const allVariants = Object.values(FACTION_VARIANT_MODULES);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>🏆</span>
          <span>派系专属模块</span>
        </h3>
        <span className="text-xs text-[#4a5568]">
          {unlockedVariants.length}/{allVariants.length} 已解锁
        </span>
      </div>

      {/* Variant Cards */}
      <div className="grid grid-cols-2 gap-3">
        {allVariants.map((variantId) => {
          const isUnlocked = unlockedVariants.includes(variantId);
          const variant = FACTION_VARIANT_DEFINITIONS[variantId];
          
          if (!variant) return null;
          
          if (!isUnlocked && !showLocked) return null;

          return (
            <VariantModuleCard
              key={variantId}
              variant={variant}
              isUnlocked={isUnlocked}
              onClick={() => isUnlocked && onVariantClick?.(variantId)}
            />
          );
        })}
      </div>

      {/* Locked Hint */}
      {unlockedVariants.length < allVariants.length && (
        <div className="text-center py-2">
          <span className="text-xs text-[#4a5568]">
            达到宗师声望 (2000+) 解锁更多派系专属模块
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Single Variant Module Card
 */
function VariantModuleCard({
  variant,
  isUnlocked,
  onClick,
}: {
  variant: typeof FACTION_VARIANT_DEFINITIONS[string];
  isUnlocked: boolean;
  onClick?: () => void;
}) {
  const FACTION_ICONS: Record<FactionId, string> = {
    void: '🌑',
    inferno: '🔥',
    storm: '⚡',
    stellar: '✨',
  };

  return (
    <button
      onClick={onClick}
      disabled={!isUnlocked}
      className={`relative p-3 rounded-lg border transition-all ${
        isUnlocked
          ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg'
          : 'opacity-50 cursor-not-allowed grayscale'
      }`}
      style={{
        backgroundColor: isUnlocked ? `${variant.accentColor}15` : '#1e2a42',
        borderColor: isUnlocked ? `${variant.accentColor}40` : '#2d3a56',
      }}
    >
      {/* Lock Icon for Unlocked */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
          <span className="text-2xl">🔒</span>
        </div>
      )}

      {/* Grandmaster Badge */}
      {isUnlocked && (
        <div 
          className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold rounded"
          style={{
            backgroundColor: '#f59e0b',
            color: '#0a0e17',
          }}
        >
          GM
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col items-center gap-2">
        {/* Module Icon */}
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${variant.accentColor}30` }}
        >
          {variant.icon}
        </div>

        {/* Module Name */}
        <div className="text-center">
          <p 
            className="text-xs font-medium"
            style={{ color: isUnlocked ? 'white' : '#9ca3af' }}
          >
            {variant.nameCn}
          </p>
          <p className="text-[10px] text-[#4a5568]">
            {variant.name}
          </p>
        </div>

        {/* Faction Indicator */}
        <div className="flex items-center gap-1">
          <span>{FACTION_ICONS[variant.faction]}</span>
          <span className="text-[10px] text-[#4a5568] capitalize">
            {variant.faction}
          </span>
        </div>
      </div>
    </button>
  );
}

/**
 * Check if a specific variant is unlocked
 */
export function useIsVariantUnlocked(variantModuleId: string): boolean {
  const reputations = useFactionReputationStore((state) => state.reputations);
  
  for (const [factionId, variant] of Object.entries(FACTION_VARIANT_MODULES)) {
    if (variant === variantModuleId) {
      const rep = reputations[factionId] || 0;
      const level = getReputationLevel(rep);
      return isVariantUnlockedForLevel(level);
    }
  }
  
  return false;
}

/**
 * Get all unlocked variant module IDs
 */
export function useUnlockedVariants(): string[] {
  const reputations = useFactionReputationStore((state) => state.reputations);
  const factionIds: FactionId[] = ['void', 'inferno', 'storm', 'stellar'];
  const unlocked: string[] = [];
  
  for (const factionId of factionIds) {
    const rep = reputations[factionId] || 0;
    const level = getReputationLevel(rep);
    if (isVariantUnlockedForLevel(level)) {
      const variant = FACTION_VARIANT_MODULES[factionId];
      if (variant) unlocked.push(variant);
    }
  }
  
  return unlocked;
}

export default FactionVariants;
