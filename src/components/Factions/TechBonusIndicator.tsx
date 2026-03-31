/**
 * Tech Bonus Indicator Component
 * 
 * Small SVG badge showing active tech bonuses in the machine editor toolbar.
 * Displays bonus breakdown by faction and stat type.
 * Animated pulse when bonuses are newly applied.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useFactionReputationStore, BonusStatType, TECH_BONUS_DESCRIPTIONS, TECH_BONUS_PER_TIER } from '../../store/useFactionReputationStore';
import { FACTIONS, FactionId, MODULE_TO_FACTION } from '../../types/factions';
import { useMachineStore } from '../../store/useMachineStore';

interface BonusInfo {
  faction: FactionId;
  tier: number;
  bonuses: Record<BonusStatType, number>;
}

interface TechBonusIndicatorProps {
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Tech Bonus Indicator Component
 * Shows active tech bonuses based on current machine's faction modules
 */
export const TechBonusIndicator: React.FC<TechBonusIndicatorProps> = ({ className = '' }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  
  // Get machine modules from store
  const modules = useMachineStore((state) => state.modules);
  
  // Get completed research from faction reputation store
  const completedResearch = useFactionReputationStore((state) => state.completedResearch);
  const getUnlockedTechTiers = useFactionReputationStore((state) => state.getUnlockedTechTiers);
  
  // Calculate bonuses for each faction represented in the machine
  const bonusInfo = useMemo((): BonusInfo[] => {
    // Get unique factions from machine modules
    const factionSet = new Set<FactionId>();
    const factionModuleCounts: Record<string, number> = {};
    
    for (const module of modules) {
      const faction = MODULE_TO_FACTION[module.type];
      if (faction) {
        factionSet.add(faction);
        factionModuleCounts[faction] = (factionModuleCounts[faction] || 0) + 1;
      }
    }
    
    if (factionSet.size === 0) {
      return []; // No faction modules on machine
    }
    
    // Calculate bonuses for each faction
    const infos: BonusInfo[] = [];
    for (const faction of factionSet) {
      const tier = getUnlockedTechTiers(faction);
      if (tier > 0) {
        infos.push({
          faction,
          tier,
          bonuses: TECH_BONUS_PER_TIER[tier] || {
            power_output: 0,
            stability: 0,
            energy_efficiency: 0,
            glow_intensity: 0,
            animation_speed: 0,
          },
        });
      }
    }
    
    return infos;
  }, [modules, completedResearch, getUnlockedTechTiers]);
  
  // Calculate total bonuses across all factions
  const totalBonuses = useMemo((): Record<BonusStatType, number> => {
    const totals: Record<BonusStatType, number> = {
      power_output: 0,
      stability: 0,
      energy_efficiency: 0,
      glow_intensity: 0,
      animation_speed: 0,
    };
    
    for (const info of bonusInfo) {
      for (const [stat, value] of Object.entries(info.bonuses)) {
        totals[stat as BonusStatType] += value;
      }
    }
    
    return totals;
  }, [bonusInfo]);
  
  // Check if there are any active bonuses
  const hasActiveBonuses = bonusInfo.length > 0;
  
  // Handle tooltip visibility
  const handleMouseEnter = useCallback(() => {
    if (!tooltipDismissed) {
      setIsTooltipVisible(true);
    }
  }, [tooltipDismissed]);
  
  const handleMouseLeave = useCallback(() => {
    setIsTooltipVisible(false);
    setTooltipDismissed(false);
  }, []);
  
  // Track when bonuses change to trigger animation
  React.useEffect(() => {
    if (bonusInfo.length > 0) {
      setAnimationKey(prev => prev + 1);
    }
  }, [bonusInfo.length, bonusInfo.map(b => `${b.faction}-t${b.tier}`).join(',')]);
  
  // Get color for a faction
  const getFactionColor = (faction: FactionId): string => {
    return FACTIONS[faction]?.color || '#7c3aed';
  };
  
  // Format percentage
  const formatPercent = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };
  
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main indicator badge */}
      <button
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-lg
          border transition-all duration-200
          ${hasActiveBonuses 
            ? 'bg-[#7c3aed]/20 border-[#7c3aed]/50 hover:bg-[#7c3aed]/30' 
            : 'bg-[#1e2a42]/50 border-[#1e2a42] hover:bg-[#1e2a42]/70'
          }
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={hasActiveBonuses ? '科技加成' : '无科技加成'}
        aria-label={hasActiveBonuses ? '显示科技加成' : '无科技加成'}
      >
        {/* Icon */}
        <span className="text-sm">
          {hasActiveBonuses ? '🔬' : '📭'}
        </span>
        
        {/* Bonus summary */}
        <span className={`
          text-xs font-medium
          ${hasActiveBonuses ? 'text-[#a78bfa]' : 'text-[#6b7280]'}
        `}>
          {hasActiveBonuses ? (
            <>
              {bonusInfo.map(info => `${FACTIONS[info.faction]?.icon || ''}T${info.tier}`).join(' ')}
            </>
          ) : (
            '无加成'
          )}
        </span>
        
        {/* Pulse animation when bonuses are newly applied */}
        {hasActiveBonuses && (
          <span 
            key={animationKey}
            className="absolute inset-0 rounded-lg animate-tech-bonus-pulse pointer-events-none"
          />
        )}
      </button>
      
      {/* Tooltip */}
      {isTooltipVisible && (
        <div 
          className="
            absolute top-full left-1/2 -translate-x-1/2 mt-2
            w-72 p-3 rounded-xl
            bg-[#1a1a2e] border border-[#7c3aed]/30
            shadow-xl shadow-purple-900/20
            z-50
            animate-tooltip-appear
          "
          onMouseEnter={() => setIsTooltipVisible(true)}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1e2a42]">
            <h4 className="text-sm font-bold text-white">科技加成</h4>
            {hasActiveBonuses ? (
              <span className="text-xs text-[#a78bfa]">
                {bonusInfo.length} 派系激活
              </span>
            ) : (
              <span className="text-xs text-[#6b7280]">无激活科技</span>
            )}
          </div>
          
          {hasActiveBonuses ? (
            <>
              {/* Per-faction breakdown */}
              <div className="space-y-3 mb-3">
                {bonusInfo.map(info => (
                  <div key={info.faction} className="flex items-start gap-2">
                    {/* Faction icon and tier */}
                    <div 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: `${getFactionColor(info.faction)}20` }}
                    >
                      <span className="text-sm">{FACTIONS[info.faction]?.icon}</span>
                      <span 
                        className="text-xs font-bold"
                        style={{ color: getFactionColor(info.faction) }}
                      >
                        T{info.tier}
                      </span>
                    </div>
                    
                    {/* Bonus stats */}
                    <div className="flex-1 grid grid-cols-2 gap-1">
                      {Object.entries(info.bonuses).map(([stat, value]) => (
                        <div key={stat} className="flex items-center gap-1">
                          <span className="text-[10px] text-[#6b7280]">
                            {TECH_BONUS_DESCRIPTIONS[stat as BonusStatType]?.name || stat}:
                          </span>
                          <span className="text-[10px] font-bold text-[#22c55e]">
                            +{formatPercent(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="pt-2 border-t border-[#1e2a42]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af]">总计加成</span>
                  <span className="text-xs font-bold text-[#22c55e]">
                    +{formatPercent(totalBonuses.power_output)} 功率
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-[#6b7280]">
                完成派系科技研究来激活加成
              </p>
              <p className="text-[10px] text-[#4b5563] mt-1">
                T1: +5% | T2: +10% | T3: +15%
              </p>
            </div>
          )}
          
          {/* Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <div className="w-4 h-4 bg-[#1a1a2e] border-l border-t border-[#7c3aed]/30 transform rotate-45" />
          </div>
        </div>
      )}
      
      {/* CSS animations */}
      <style>{`
        @keyframes tech-bonus-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(124, 58, 237, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0);
          }
        }
        
        @keyframes tooltip-appear {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        .animate-tech-bonus-pulse {
          animation: tech-bonus-pulse 0.8s ease-out;
        }
        
        .animate-tooltip-appear {
          animation: tooltip-appear 0.15s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TechBonusIndicator;
