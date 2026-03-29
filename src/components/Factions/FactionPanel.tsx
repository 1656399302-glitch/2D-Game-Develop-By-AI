/**
 * Faction Panel Component
 * 
 * Displays faction alignment selection and progress display.
 */

import React from 'react';
import { FACTIONS, FactionId, TECH_TREE_REQUIREMENTS } from '../../types/factions';
import { useFactionStore } from '../../store/useFactionStore';
import { useStatsStore } from '../../store/useStatsStore';

interface FactionPanelProps {
  onClose?: () => void;
}

export const FactionPanel: React.FC<FactionPanelProps> = ({ onClose }) => {
  const factionCounts = useFactionStore((state) => state.factionCounts);
  const selectedFaction = useFactionStore((state) => state.selectedFaction);
  const setSelectedFaction = useFactionStore((state) => state.setSelectedFaction);
  const machinesCreated = useStatsStore((state) => state.machinesCreated);
  
  // Calculate total progress across all factions
  const totalProgress = machinesCreated > 0
    ? Math.min(100, (Object.values(factionCounts).reduce((a, b) => a + b, 0) / machinesCreated) * 100)
    : 0;
  
  return (
    <div
      className="
        fixed inset-0 z-[1050] flex items-center justify-center
        bg-black/80 backdrop-blur-sm
        overflow-y-auto
      "
      onClick={onClose}
    >
      <div
        className="
          relative w-full max-w-2xl mx-4 my-8
          bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17]
          rounded-2xl border border-[#7c3aed]/30
          shadow-2xl shadow-purple-900/20
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a78bfa] via-[#7c3aed] to-[#a78bfa]" />
        
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center text-xl">
                ⚔️
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">派系系统</h2>
                <p className="text-sm text-[#9ca3af]">
                  选择你的魔法阵营
                </p>
              </div>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#6b7280] hover:text-white"
                aria-label="关闭"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 5l10 10M15 5l-10 10" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Total progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#9ca3af]">派系参与度</span>
              <span className="text-[#a78bfa]">{Math.round(totalProgress)}%</span>
            </div>
            <div className="h-2 bg-[#0a0e17] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Faction cards */}
        <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {(Object.keys(FACTIONS) as FactionId[]).map((factionId) => (
            <FactionCard
              key={factionId}
              factionId={factionId}
              isSelected={selectedFaction === factionId}
              onSelect={() => setSelectedFaction(factionId)}
              machineCount={factionCounts[factionId]}
            />
          ))}
        </div>
        
        {/* Legend */}
        <div className="px-6 pb-6">
          <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
            <h4 className="text-sm font-medium text-[#9ca3af] mb-2">科技树解锁条件</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="text-[#6b7280]">第一层: {TECH_TREE_REQUIREMENTS[1]} 台机器</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                <span className="text-[#6b7280]">第二层: {TECH_TREE_REQUIREMENTS[2]} 台机器</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <span className="text-[#6b7280]">第三层: {TECH_TREE_REQUIREMENTS[3]} 台机器</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FactionCardProps {
  factionId: FactionId;
  isSelected: boolean;
  onSelect: () => void;
  machineCount: number;
}

const FactionCard: React.FC<FactionCardProps> = ({
  factionId,
  isSelected,
  onSelect,
  machineCount,
}) => {
  const faction = FACTIONS[factionId];
  
  // Tier colors
  const tierColors = ['#22c55e', '#3b82f6', '#f59e0b'];
  
  return (
    <button
      onClick={onSelect}
      className={`
        w-full p-4 rounded-xl transition-all duration-300 text-left
        ${isSelected
          ? 'bg-gradient-to-br from-[#1e2a42]/80 to-[#0a0e17]/80 border-2'
          : 'bg-[#0a0e17]/50 border border-[#1e2a42] hover:border-[#1e2a42]/80'
        }
      `}
      style={{
        borderColor: isSelected ? faction.color : undefined,
        boxShadow: isSelected ? `0 0 30px ${faction.glowColor}` : undefined,
      }}
    >
      <div className="flex items-start gap-4">
        {/* Faction icon */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
          style={{
            backgroundColor: `${faction.color}20`,
            border: `2px solid ${faction.color}`,
            boxShadow: isSelected ? `0 0 20px ${faction.glowColor}` : 'none',
          }}
        >
          {faction.icon}
        </div>
        
        {/* Faction info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-white font-bold">{faction.nameCn}</h3>
              <p className="text-xs text-[#6b7280]">{faction.name}</p>
            </div>
            <div className="text-right">
              <span
                className="text-2xl font-bold"
                style={{ color: faction.color }}
              >
                {machineCount}
              </span>
              <p className="text-xs text-[#6b7280]">机器</p>
            </div>
          </div>
          
          <p className="text-sm text-[#9ca3af] mb-3">
            {faction.description}
          </p>
          
          {/* Tier progress indicators */}
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((tier) => {
              const isUnlocked = machineCount >= TECH_TREE_REQUIREMENTS[tier as keyof typeof TECH_TREE_REQUIREMENTS];
              const tierColor = tierColors[tier - 1];
              
              return (
                <div key={tier} className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: isUnlocked ? tierColor : '#1e2a42',
                      boxShadow: isUnlocked ? `0 0 8px ${tierColor}` : 'none',
                    }}
                  />
                  <span className="text-xs text-[#6b7280]">
                    T{tier}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="flex-shrink-0">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: faction.color }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 7l3 3 5-5" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </button>
  );
};

export default FactionPanel;
