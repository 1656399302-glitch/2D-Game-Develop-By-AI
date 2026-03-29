/**
 * Stats Dashboard Component
 * 
 * Displays user statistics including machines created, activations, playtime, etc.
 */

import React from 'react';
import { FACTIONS, FactionId } from '../../types/factions';
import { useStatsStore } from '../../store/useStatsStore';
import { useFactionStore } from '../../store/useFactionStore';
import { ACHIEVEMENTS } from '../../types/factions';

interface StatsDashboardProps {
  onClose?: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ onClose }) => {
  const stats = useStatsStore((state) => ({
    machinesCreated: state.machinesCreated,
    activations: state.activations,
    errors: state.errors,
    playtimeMinutes: state.playtimeMinutes,
    codexEntries: state.codexEntries,
    factionCounts: state.factionCounts,
  }));
  
  const earnedAchievements = useStatsStore((state) => state.earnedAchievements);
  const factionCounts = useFactionStore((state) => state.factionCounts);
  
  // Calculate favorite faction
  const favoriteFaction = Object.entries(stats.factionCounts)
    .sort(([, a], [, b]) => b - a)[0];
  const favoriteFactionConfig = favoriteFaction && favoriteFaction[1] > 0
    ? FACTIONS[favoriteFaction[0] as FactionId]
    : null;
  
  // Calculate success rate
  const successRate = stats.activations > 0
    ? Math.round(((stats.activations - stats.errors) / stats.activations) * 100)
    : 100;
  
  // Format playtime
  const formatPlaytime = (minutes: number) => {
    if (minutes < 60) return `${minutes} 分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} 小时 ${mins} 分钟`;
  };
  
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
          rounded-2xl border border-[#22c55e]/30
          shadow-2xl shadow-green-900/20
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#22c55e] via-[#22d3ee] to-[#22c55e]" />
        
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#22c55e]/20 flex items-center justify-center text-xl">
                📊
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">统计面板</h2>
                <p className="text-sm text-[#9ca3af]">
                  你的锻造数据概览
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
        
        {/* Stats grid */}
        <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Primary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="已创建机器"
              value={stats.machinesCreated}
              icon="⚙️"
              color="#22c55e"
            />
            <StatCard
              label="激活次数"
              value={stats.activations}
              icon="⚡"
              color="#22d3ee"
            />
            <StatCard
              label="图鉴收藏"
              value={stats.codexEntries}
              icon="📖"
              color="#fbbf24"
            />
            <StatCard
              label="成就解锁"
              value={earnedAchievements.length}
              total={ACHIEVEMENTS.length}
              icon="🏆"
              color="#a855f7"
            />
          </div>
          
          {/* Secondary stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Playtime */}
            <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#9ca3af]">游戏时长</span>
                <span className="text-lg">⏱️</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatPlaytime(stats.playtimeMinutes)}
              </p>
            </div>
            
            {/* Success rate */}
            <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#9ca3af]">成功率</span>
                <span className="text-lg">🎯</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold" style={{ color: successRate >= 90 ? '#22c55e' : successRate >= 70 ? '#fbbf24' : '#ef4444' }}>
                  {successRate}%
                </p>
                {stats.errors > 0 && (
                  <span className="text-xs text-[#6b7280]">
                    ({stats.errors} 错误)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Favorite faction */}
          {favoriteFactionConfig && (
            <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: `${favoriteFactionConfig.color}20`,
                    border: `2px solid ${favoriteFactionConfig.color}`,
                  }}
                >
                  {favoriteFactionConfig.icon}
                </div>
                <div>
                  <p className="text-sm text-[#9ca3af]">最喜欢的派系</p>
                  <p className="text-lg font-bold" style={{ color: favoriteFactionConfig.color }}>
                    {favoriteFactionConfig.nameCn}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Faction breakdown */}
          <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
            <h4 className="text-sm font-medium text-[#9ca3af] mb-3">派系机器分布</h4>
            <div className="space-y-3">
              {(Object.keys(FACTIONS) as FactionId[]).map((factionId) => {
                const faction = FACTIONS[factionId];
                const count = factionCounts[factionId];
                const percentage = stats.machinesCreated > 0
                  ? Math.round((count / stats.machinesCreated) * 100)
                  : 0;
                
                return (
                  <div key={factionId} className="flex items-center gap-3">
                    <span className="text-lg w-6">{faction.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{faction.nameCn}</span>
                        <span className="text-xs" style={{ color: faction.color }}>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-[#1e2a42] rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: faction.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  total?: number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, total, icon, color }) => {
  return (
    <div
      className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42] transition-all duration-300 hover:border-[#1e2a42]/80"
      style={{
        boxShadow: `0 0 20px ${color}10`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#9ca3af]">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold" style={{ color }}>
          {value}
        </span>
        {total !== undefined && (
          <span className="text-sm text-[#6b7280]">
            / {total}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsDashboard;
