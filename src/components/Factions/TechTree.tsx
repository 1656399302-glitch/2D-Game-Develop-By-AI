/**
 * Tech Tree Component
 * 
 * Displays a 12-node tech tree visualization (4 factions × 3 tiers).
 * Nodes show locked/unlocked state based on faction machine counts.
 */

import React, { useMemo } from 'react';
import { FACTIONS, FactionId, TechTreeNode, TECH_TREE_REQUIREMENTS } from '../../types/factions';
import { useFactionStore } from '../../store/useFactionStore';

interface TechTreeProps {
  onClose?: () => void;
}

export const TechTree: React.FC<TechTreeProps> = ({ onClose }) => {
  const factionCounts = useFactionStore((state) => state.factionCounts);

  // FIX: Use useMemo to call getState() method (not subscription)
  const nodes = useMemo(() => 
    useFactionStore.getState().getTechTreeNodes(),
    // Re-compute when factionCounts changes
    [factionCounts]
  );

  // Group nodes by faction
  const factionNodes: Record<FactionId, TechTreeNode[]> = {
    void: [],
    inferno: [],
    storm: [],
    stellar: [],
  };

  nodes.forEach((node) => {
    factionNodes[node.faction].push(node);
  });

  // Sort each faction's nodes by tier
  (Object.keys(factionNodes) as FactionId[]).forEach((faction) => {
    factionNodes[faction].sort((a, b) => a.tier - b.tier);
  });

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
          relative w-full max-w-4xl mx-4 my-8
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center text-xl">
                🌳
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">科技树</h2>
                <p className="text-sm text-[#9ca3af]">
                  派系科技解锁进度
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
        </div>

        {/* Tech tree grid - 4 columns (factions) x 3 rows (tiers) */}
        <div className="px-6 pb-6">
          {/* Column headers */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {(Object.keys(FACTIONS) as FactionId[]).map((factionId) => {
              const faction = FACTIONS[factionId];
              return (
                <div
                  key={factionId}
                  className="flex items-center justify-center gap-2 py-2 rounded-lg"
                  style={{ backgroundColor: `${faction.color}15` }}
                >
                  <span className="text-lg">{faction.icon}</span>
                  <span className="text-sm font-medium" style={{ color: faction.color }}>
                    {faction.nameCn}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tier rows */}
          {[1, 2, 3].map((tier) => (
            <div key={tier} className="grid grid-cols-4 gap-4 mb-4">
              {(Object.keys(FACTIONS) as FactionId[]).map((factionId) => {
                const node = factionNodes[factionId].find((n) => n.tier === tier);
                if (!node) return <div key={`${factionId}-${tier}`} />;
                return (
                  <TechTreeNodeCard
                    key={node.id}
                    node={node}
                    tierColor={['#22c55e', '#3b82f6', '#f59e0b'][tier - 1]}
                  />
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="mt-6 p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
            <h4 className="text-sm font-medium text-[#9ca3af] mb-3">图例</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded tech-tree-node--locked bg-[#1e2a42]" />
                <span className="text-xs text-[#6b7280]">未解锁</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded tech-tree-node--unlocked bg-[#22c55e]" />
                <span className="text-xs text-[#6b7280]">已解锁</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-[#f59e0b] bg-[#f59e0b]/20" />
                <span className="text-xs text-[#6b7280]">当前进度</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1e2a42]">
              <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                <span>T1 解锁: {TECH_TREE_REQUIREMENTS[1]} 台</span>
                <span>T2 解锁: {TECH_TREE_REQUIREMENTS[2]} 台</span>
                <span>T3 解锁: {TECH_TREE_REQUIREMENTS[3]} 台</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TechTreeNodeCardProps {
  node: TechTreeNode;
  tierColor: string;
}

const TechTreeNodeCard: React.FC<TechTreeNodeCardProps> = ({ node, tierColor }) => {
  const faction = FACTIONS[node.faction];
  const factionCounts = useFactionStore((state) => state.factionCounts);

  // FIX: Use useMemo for derived calculation
  const progress = useMemo(() => {
    const count = factionCounts[node.faction] || 0;
    return Math.min(100, (count / node.unlockRequirement) * 100);
  }, [factionCounts, node.faction, node.unlockRequirement]);

  return (
    <div
      className={`
        relative p-3 rounded-xl transition-all duration-300
        ${node.isUnlocked ? 'tech-tree-node--unlocked' : 'tech-tree-node--locked'}
      `}
      style={{
        backgroundColor: node.isUnlocked
          ? `${tierColor}15`
          : '#0a0e17',
        border: `1px solid ${node.isUnlocked ? tierColor : '#1e2a42'}`,
        boxShadow: node.isUnlocked
          ? `0 0 15px ${tierColor}40`
          : 'none',
      }}
    >
      {/* Node header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded"
          style={{
            backgroundColor: `${tierColor}20`,
            color: tierColor,
          }}
        >
          T{node.tier}
        </span>
        {node.isUnlocked && (
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: tierColor }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
              <path d="M2 5l2 2 4-4" />
            </svg>
          </div>
        )}
      </div>

      {/* Node name */}
      <h4
        className={`text-sm font-medium mb-1 ${node.isUnlocked ? 'text-white' : 'text-[#6b7280]'}`}
      >
        {node.name}
      </h4>

      {/* Node description */}
      <p className="text-xs text-[#6b7280] mb-2">
        {node.description}
      </p>

      {/* Progress bar */}
      {!node.isUnlocked && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#6b7280]">
              {factionCounts[node.faction] || 0} / {node.unlockRequirement}
            </span>
            <span style={{ color: faction.color }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-[#1e2a42] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: faction.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Unlocked indicator */}
      {node.isUnlocked && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${faction.glowColor}10 0%, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
};

export default TechTree;
