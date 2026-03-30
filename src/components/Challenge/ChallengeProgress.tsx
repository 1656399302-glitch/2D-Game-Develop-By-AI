import { useMemo, useState, useEffect } from 'react';
import {
  CHALLENGE_DEFINITIONS,
  getChallengeCategoryLabel,
  ChallengeCategory,
} from '../../data/challenges';
import { useChallengeStore, ChallengeProgress as ChallengeProgressType } from '../../store/useChallengeStore';

/**
 * Challenge Progress Component
 * Shows overall challenge progress with XP, badges, and category breakdown
 * 
 * Uses getState() pattern with local state for reactive values.
 */
export function ChallengeProgress() {
  // Use local state for reactive values from store
  const [totalXP, setTotalXP] = useState(0);
  const [badges, setBadges] = useState<Array<{id: string; displayName: string; description: string}>>([]);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgressType>({
    machinesCreated: 0,
    machinesSaved: 0,
    connectionsCreated: 0,
    activations: 0,
    overloadsTriggered: 0,
    gearsCreated: 0,
    highestStability: 0,
  });

  // Sync with store on mount and periodically
  useEffect(() => {
    const syncState = () => {
      const state = useChallengeStore.getState();
      setTotalXP(state.totalXP);
      setBadges(state.badges);
      setChallengeProgress(state.challengeProgress);
    };
    
    syncState();
    
    // Poll periodically for updates
    const intervalId = setInterval(syncState, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Use getState() for one-time reads in useMemo
  const completedChallenges = useMemo(() => {
    return useChallengeStore.getState().getCompletedChallenges();
  }, []);

  const totalChallenges = CHALLENGE_DEFINITIONS.length;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const categories: ChallengeCategory[] = ['creation', 'collection', 'activation', 'mastery'];
    
    return categories.map((category) => {
      const categoryChallenges = CHALLENGE_DEFINITIONS.filter(c => c.category === category);
      const completedCount = categoryChallenges.filter(c => 
        completedChallenges.some(cc => cc.id === c.id)
      ).length;
      
      return {
        category,
        label: getChallengeCategoryLabel(category),
        completed: completedCount,
        total: categoryChallenges.length,
        percent: Math.round((completedCount / categoryChallenges.length) * 100),
      };
    });
  }, [completedChallenges]);

  // XP level calculation (every 1000 XP = 1 level)
  const xpLevel = Math.floor(totalXP / 1000);
  const xpToNextLevel = 1000 - (totalXP % 1000);

  return (
    <div className="p-4 space-y-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">挑战进度</h3>
          <p className="text-xs text-[#9ca3af]">
            已完成 {completedChallenges.length} / {totalChallenges} 个挑战
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#f59e0b]">{totalXP} XP</div>
          <div className="text-xs text-[#9ca3af]">等级 {xpLevel}</div>
        </div>
      </div>

      {/* XP Progress to Next Level */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#9ca3af]">升级进度</span>
          <span className="text-xs text-[#9ca3af]">
            {xpToNextLevel} XP 到下一级
          </span>
        </div>
        <div className="w-full h-2 bg-[#1e2a42] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] transition-all duration-300"
            style={{ width: `${(totalXP % 1000) / 10}%` }}
          />
        </div>
      </div>

      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#9ca3af]">总体进度</span>
          <span className="text-xs text-[#9ca3af]">
            {Math.round((completedChallenges.length / totalChallenges) * 100)}%
          </span>
        </div>
        <div className="w-full h-3 bg-[#1e2a42] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00d4ff] to-[#22c55e] transition-all duration-300"
            style={{ width: `${(completedChallenges.length / totalChallenges) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h4 className="text-xs font-medium text-[#9ca3af] mb-2">分类进度</h4>
        <div className="space-y-2">
          {categoryBreakdown.map(({ category, label, completed, total, percent }) => (
            <div key={category} className="flex items-center gap-3">
              <span className="w-12 text-xs text-[#9ca3af]">{label}</span>
              <div className="flex-1 h-2 bg-[#1e2a42] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00d4ff] transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-10 text-xs text-right text-[#9ca3af]">
                {completed}/{total}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Showcase */}
      {badges.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-[#9ca3af] mb-2">已获得徽章</h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30"
                title={badge.description}
              >
                <span className="text-sm">🏅</span>
                <span className="text-xs font-medium text-[#f59e0b]">
                  {badge.displayName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Stats */}
      <div className="pt-2 border-t border-[#1e2a42]">
        <h4 className="text-xs font-medium text-[#9ca3af] mb-2">当前数据</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between px-2 py-1 bg-[#1e2a42]/50 rounded">
            <span className="text-[#9ca3af]">已创建设备</span>
            <span className="text-white">{challengeProgress.machinesCreated}</span>
          </div>
          <div className="flex justify-between px-2 py-1 bg-[#1e2a42]/50 rounded">
            <span className="text-[#9ca3af]">已保存设备</span>
            <span className="text-white">{challengeProgress.machinesSaved}</span>
          </div>
          <div className="flex justify-between px-2 py-1 bg-[#1e2a42]/50 rounded">
            <span className="text-[#9ca3af]">能量连接</span>
            <span className="text-white">{challengeProgress.connectionsCreated}</span>
          </div>
          <div className="flex justify-between px-2 py-1 bg-[#1e2a42]/50 rounded">
            <span className="text-[#9ca3af]">激活次数</span>
            <span className="text-white">{challengeProgress.activations}</span>
          </div>
          <div className="flex justify-between px-2 py-1 bg-[#1e2a42]/50 rounded">
            <span className="text-[#9ca3af]">齿轮数量</span>
            <span className="text-white">{challengeProgress.gearsCreated}</span>
          </div>
          <div className="flex justify-between px-2 py-1 bg-[#1e2a42]/50 rounded">
            <span className="text-[#9ca3af]">最高稳定性</span>
            <span className="text-white">{challengeProgress.highestStability}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengeProgress;
