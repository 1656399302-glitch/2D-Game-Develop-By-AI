/**
 * Rarity Distribution Chart Component
 * 
 * Displays machine rarity distribution as a visual chart.
 * AC4: Shows accurate counts per rarity tier.
 */

import React from 'react';
import { RarityDistributionData, RARITY_COLORS, RARITY_LABELS } from '../../utils/statisticsAnalyzer';
import { Rarity } from '../../types';

interface RarityDistributionChartProps {
  data: RarityDistributionData[];
}

export const RarityDistributionChart: React.FC<RarityDistributionChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#6b7280]">暂无稀有度数据</p>
        <p className="text-xs text-[#4a5568] mt-1">保存机器到图鉴后查看稀有度分布</p>
      </div>
    );
  }

  const totalMachines = data.reduce((sum, d) => sum + d.count, 0);

  // Rarity order for display
  const rarityOrder: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const sortedData = [...data].sort((a, b) => 
    rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
  );

  return (
    <div data-testid="rarity-distribution-chart" className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#9ca3af]">稀有度分布</h3>
        <span className="text-sm text-[#6b7280]">
          共 {totalMachines} 台机器
        </span>
      </div>

      {/* Bar Chart View */}
      <div className="space-y-3">
        {sortedData.map((item) => (
          <div key={item.rarity} className="flex items-center gap-3">
            {/* Label with Icon */}
            <div className="w-20 flex items-center gap-2">
              <span 
                className="text-lg"
                role="img"
                aria-label={RARITY_LABELS[item.rarity]}
              >
                {getRarityIcon(item.rarity)}
              </span>
              <span 
                className="text-sm font-medium"
                style={{ color: RARITY_COLORS[item.rarity] }}
              >
                {RARITY_LABELS[item.rarity]}
              </span>
            </div>

            {/* Bar */}
            <div className="flex-1 h-8 bg-[#1e2a42] rounded-lg overflow-hidden">
              <div
                data-testid={`rarity-bar-${item.rarity}`}
                className="h-full transition-all duration-500 flex items-center justify-end pr-3"
                style={{
                  width: totalMachines > 0 ? `${(item.count / totalMachines) * 100}%` : '0%',
                  backgroundColor: RARITY_COLORS[item.rarity],
                  minWidth: item.count > 0 ? '4px' : '0',
                  opacity: 0.8,
                }}
              />
            </div>

            {/* Count and Percentage */}
            <div className="w-20 text-right">
              <span 
                data-testid={`rarity-count-${item.rarity}`}
                className="text-lg font-bold"
                style={{ color: RARITY_COLORS[item.rarity] }}
              >
                {item.count}
              </span>
              <span className="text-xs text-[#6b7280] ml-1">
                ({item.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pie Chart View */}
      <div className="mt-6 pt-4 border-t border-[#1e2a42]">
        <h4 className="text-xs font-medium text-[#6b7280] mb-3">分布视图</h4>
        <div className="flex items-center justify-center gap-6">
          {/* SVG Pie Chart */}
          <svg
            data-testid="rarity-pie-chart"
            viewBox="0 0 120 120"
            className="w-36 h-36"
          >
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#1e2a42"
              strokeWidth="10"
            />
            
            {/* Rarity segments */}
            {generateRaritySegments(sortedData, totalMachines).map((segment) => (
              <circle
                key={segment.rarity}
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={RARITY_COLORS[segment.rarity]}
                strokeWidth="10"
                strokeDasharray={`${segment.dashArray} 314`}
                strokeDashoffset={segment.offset}
                transform="rotate(-90 60 60)"
                className="transition-all duration-500"
                data-testid={`rarity-segment-${segment.rarity}`}
              >
                <title>{RARITY_LABELS[segment.rarity]}: {segment.count} ({segment.percentage}%)</title>
              </circle>
            ))}
            
            {/* Center decoration */}
            <circle
              cx="60"
              cy="60"
              r="35"
              fill="#0a0e17"
              stroke="#1e2a42"
              strokeWidth="1"
            />
            <text
              x="60"
              y="58"
              textAnchor="middle"
              className="fill-white text-lg font-bold"
            >
              {totalMachines}
            </text>
            <text
              x="60"
              y="72"
              textAnchor="middle"
              className="fill-[#6b7280] text-xs"
            >
              总计
            </text>
          </svg>

          {/* Legend */}
          <div className="flex flex-col gap-2">
            {sortedData.map((item) => (
              <div 
                key={item.rarity} 
                className="flex items-center gap-2 text-sm"
                data-testid={`rarity-legend-${item.rarity}`}
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: RARITY_COLORS[item.rarity] }}
                />
                <span style={{ color: RARITY_COLORS[item.rarity] }}>
                  {getRarityIcon(item.rarity)}
                </span>
                <span className="text-[#9ca3af] w-16">{RARITY_LABELS[item.rarity]}</span>
                <span 
                  className="font-bold"
                  style={{ color: RARITY_COLORS[item.rarity] }}
                >
                  {item.count}
                </span>
                <span className="text-[#6b7280]">({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      {totalMachines > 0 && (
        <div className="mt-4 p-4 rounded-lg bg-[#0a0e17]/50 border border-[#1e2a42]">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#f59e0b]">
                {sortedData.find(d => d.rarity === 'legendary')?.count || 0}
              </div>
              <div className="text-xs text-[#6b7280]">传说机器</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#a855f7]">
                {sortedData.find(d => d.rarity === 'epic')?.count || 0}
              </div>
              <div className="text-xs text-[#6b7280]">史诗机器</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#3b82f6]">
                {sortedData.find(d => d.rarity === 'rare')?.count || 0}
              </div>
              <div className="text-xs text-[#6b7280]">稀有机器</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Get icon for rarity level
 */
function getRarityIcon(rarity: Rarity): string {
  const icons: Record<Rarity, string> = {
    common: '⬜',
    uncommon: '🟩',
    rare: '🟦',
    epic: '🟪',
    legendary: '🟧',
  };
  return icons[rarity] || '⬜';
}

interface RaritySegment {
  rarity: Rarity;
  count: number;
  percentage: number;
  dashArray: number;
  offset: number;
}

/**
 * Generate segments for the pie chart
 */
function generateRaritySegments(
  data: RarityDistributionData[],
  total: number
): RaritySegment[] {
  if (total === 0) return [];

  const circumference = 2 * Math.PI * 50; // 2 * PI * radius
  let currentOffset = 0;

  return data.map((item) => {
    const dashLength = (item.count / total) * circumference;
    const segment: RaritySegment = {
      rarity: item.rarity,
      count: item.count,
      percentage: item.percentage,
      dashArray: dashLength,
      offset: -currentOffset,
    };
    currentOffset += dashLength;
    return segment;
  });
}

export default RarityDistributionChart;
