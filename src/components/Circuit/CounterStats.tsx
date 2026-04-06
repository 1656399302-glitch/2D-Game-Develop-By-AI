/**
 * Counter Stats Component
 * 
 * Displays counter statistics including:
 * - Total counters count
 * - Active counters count (count > 0)
 * - Overflow counters count
 * - Completion percentage with progress bar
 * 
 * ROUND 183: New component created for CounterPanel
 * Mirrors RecipeStats pattern from Round 182
 */

import React, { useMemo } from 'react';
import type { CounterData } from './CounterPanel';

// ============================================================================
// Component
// ============================================================================

interface CounterStatsProps {
  counters: CounterData[];
}

export const CounterStats: React.FC<CounterStatsProps> = ({
  counters,
}) => {
  // Calculate statistics
  const { totalCount, activeCount, overflowCount } = useMemo(() => {
    return {
      totalCount: counters.length,
      activeCount: counters.filter((c) => c.count > 0).length,
      overflowCount: counters.filter((c) => c.overflow).length,
    };
  }, [counters]);

  // Calculate completion percentage (based on non-zero counts)
  const percentage = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((activeCount / totalCount) * 100);
  }, [activeCount, totalCount]);

  return (
    <div 
      className="p-4 bg-gradient-to-br from-[#1a1a2e]/50 to-[#0a0e17]/50 rounded-xl border border-[#1e2a42]"
      data-testid="counter-stats"
    >
      {/* Total count display */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[#9ca3af]">总计数器</span>
        <span 
          className="text-sm font-mono font-medium"
          data-testid="counter-stats-total"
        >
          {totalCount}
        </span>
      </div>

      {/* Active count */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#9ca3af]">激活计数</span>
        <span 
          className="text-sm font-mono font-medium text-[#22c55e]"
          data-testid="counter-stats-active"
        >
          {activeCount}
        </span>
      </div>

      {/* Overflow count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[#9ca3af]">溢出计数</span>
        <span 
          className="text-sm font-mono font-medium text-[#f59e0b]"
          data-testid="counter-stats-overflow"
        >
          {overflowCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-[#0a0e17] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage label */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#6b7280]">激活率</span>
        <span 
          className="text-xs font-mono text-[#22c55e]"
          data-testid="counter-stats-percentage"
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default CounterStats;
