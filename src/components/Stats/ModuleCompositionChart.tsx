/**
 * Module Composition Chart Component
 * 
 * Displays module usage distribution as a visual chart.
 * AC3: Shows count of each module type used across all machines.
 */

import React from 'react';
import { ModuleCompositionData, MODULE_TYPE_LABELS } from '../../utils/statisticsAnalyzer';
import { ModuleType } from '../../types';

interface ModuleCompositionChartProps {
  data: ModuleCompositionData[];
}

// Module type colors
const MODULE_COLORS: Record<ModuleType, string> = {
  'core-furnace': '#00d4ff',
  'energy-pipe': '#7c3aed',
  'gear': '#f59e0b',
  'rune-node': '#a855f7',
  'shield-shell': '#22c55e',
  'trigger-switch': '#ef4444',
  'output-array': '#fbbf24',
  'amplifier-crystal': '#9333ea',
  'stabilizer-core': '#22c55e',
  'void-siphon': '#a78bfa',
  'phase-modulator': '#22d3ee',
  'resonance-chamber': '#06b6d4',
  'fire-crystal': '#f97316',
  'lightning-conductor': '#eab308',
  'void-arcane-gear': '#c4b5fd',
  'inferno-blazing-core': '#fb923c',
  'storm-thundering-pipe': '#67e8f9',
  'stellar-harmonic-crystal': '#fcd34d',
};

function getModuleColor(moduleType: ModuleType): string {
  return MODULE_COLORS[moduleType] || '#6b7280';
}

export const ModuleCompositionChart: React.FC<ModuleCompositionChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#6b7280]">暂无模块数据</p>
        <p className="text-xs text-[#4a5568] mt-1">保存机器到图鉴后查看模块分布</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const totalModules = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div data-testid="module-composition-chart" className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#9ca3af]">模块组成</h3>
        <span className="text-sm text-[#6b7280]">
          共 {totalModules} 个模块
        </span>
      </div>

      {/* Bar Chart */}
      <div className="space-y-3">
        {data.slice(0, 10).map((item) => (
          <div key={item.moduleType} className="flex items-center gap-3">
            {/* Label */}
            <div className="w-24 text-xs text-[#9ca3af] truncate" title={MODULE_TYPE_LABELS[item.moduleType]}>
              {MODULE_TYPE_LABELS[item.moduleType] || item.moduleType}
            </div>

            {/* Bar */}
            <div className="flex-1 h-6 bg-[#1e2a42] rounded-full overflow-hidden">
              <div
                data-testid={`module-bar-${item.moduleType}`}
                className="h-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: getModuleColor(item.moduleType),
                  minWidth: item.count > 0 ? '2px' : '0',
                }}
              />
            </div>

            {/* Count */}
            <div className="w-16 text-right">
              <span className="text-sm font-bold text-white">
                {item.count}
              </span>
              <span className="text-xs text-[#6b7280] ml-1">
                ({item.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pie Chart Alternative View */}
      <div className="mt-6 pt-4 border-t border-[#1e2a42]">
        <h4 className="text-xs font-medium text-[#6b7280] mb-3">分布视图</h4>
        <div className="flex items-center justify-center gap-4">
          {/* Simple SVG Pie Chart */}
          <svg
            data-testid="module-pie-chart"
            viewBox="0 0 100 100"
            className="w-32 h-32"
          >
            {generatePieSlices(data).map((slice) => (
              <path
                key={slice.moduleType}
                d={slice.path}
                fill={getModuleColor(slice.moduleType)}
                className="transition-all duration-300"
                data-testid={`pie-slice-${slice.moduleType}`}
              >
                <title>{MODULE_TYPE_LABELS[slice.moduleType]}: {slice.count} ({slice.percentage}%)</title>
              </path>
            ))}
          </svg>

          {/* Legend */}
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {data.slice(0, 6).map((item) => (
              <div key={item.moduleType} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getModuleColor(item.moduleType) }}
                />
                <span className="text-[#9ca3af] truncate max-w-[100px]" title={MODULE_TYPE_LABELS[item.moduleType]}>
                  {MODULE_TYPE_LABELS[item.moduleType] || item.moduleType}
                </span>
                <span className="text-[#6b7280]">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generate SVG paths for pie chart slices
 */
function generatePieSlices(data: ModuleCompositionData[]): Array<{
  moduleType: ModuleType;
  count: number;
  percentage: number;
  path: string;
}> {
  if (data.length === 0) return [];

  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) return [];

  const slices: Array<{
    moduleType: ModuleType;
    count: number;
    percentage: number;
    path: string;
  }> = [];

  let currentAngle = 0;
  const centerX = 50;
  const centerY = 50;
  const radius = 40;

  data.forEach((item) => {
    const angle = (item.count / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    if (angle > 0) {
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const path = angle >= 360
        ? `M ${centerX} ${centerY} m -${radius} 0 a ${radius} ${radius} 0 1 1 ${radius * 2} 0 a ${radius} ${radius} 0 1 1 -${radius * 2} 0`
        : `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      slices.push({
        moduleType: item.moduleType,
        count: item.count,
        percentage: item.percentage,
        path,
      });
    }

    currentAngle += angle;
  });

  return slices;
}

export default ModuleCompositionChart;
