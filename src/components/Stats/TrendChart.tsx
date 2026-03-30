/**
 * Trend Chart Component
 * 
 * Displays trend visualization for key metrics over time.
 * AC2: Shows machines created over time, activation trends, stability averages.
 */

import React, { useMemo } from 'react';
import { TrendDataPoint } from '../../utils/statisticsAnalyzer';

interface TrendChartProps {
  data: TrendDataPoint[];
  metric: 'machines' | 'activations' | 'stability';
  title?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  metric,
  title 
}) => {
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    let values: number[];

    switch (metric) {
      case 'machines':
        values = data.map(d => d.machinesCreated);
        break;
      case 'activations':
        values = data.map(d => d.activations);
        break;
      case 'stability':
        values = data.map(d => d.averageStability);
        break;
      default:
        values = data.map(d => d.machinesCreated);
    }

    const max = Math.max(...values, 1);
    const min = metric === 'stability' ? 0 : Math.min(...values, 0);
    const range = max - min || 1;

    return data.map((point, index) => ({
      ...point,
      value: values[index],
      x: 50 + (index / Math.max(data.length - 1, 1)) * 300,
      y: 150 - ((values[index] - min) / range) * 120,
    }));
  }, [data, metric]);

  const yLabels = useMemo(() => {
    if (data.length === 0) {
      return [100, 75, 50, 25, 0];
    }

    let values: number[];

    switch (metric) {
      case 'machines':
        values = data.map(d => d.machinesCreated);
        break;
      case 'activations':
        values = data.map(d => d.activations);
        break;
      case 'stability':
        values = data.map(d => d.averageStability);
        break;
      default:
        values = data.map(d => d.machinesCreated);
    }

    const max = Math.max(...values, 1);
    const min = metric === 'stability' ? 0 : Math.min(...values, 0);
    const range = max - min || 1;
    const labelCount = 5;
    const step = range / (labelCount - 1);
    
    return Array.from({ length: labelCount }, (_, i) => {
      const value = metric === 'stability' 
        ? Math.round(max - i * step) 
        : Math.round(min + (labelCount - 1 - i) * step);
      return Math.max(0, value);
    });
  }, [data, metric]);

  if (data.length === 0) {
    return (
      <div 
        data-testid={`trend-chart-${metric}`}
        className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]"
      >
        <h4 className="text-sm font-medium text-[#9ca3af] mb-4">
          {title || '趋势图表'}
        </h4>
        <div className="text-center py-8">
          <p className="text-[#6b7280]">暂无趋势数据</p>
          <p className="text-xs text-[#4a5568] mt-1">保存机器后查看趋势</p>
        </div>
      </div>
    );
  }

  // Generate path for line chart
  const linePath = chartData.length > 0
    ? chartData.map((point, i) => 
        i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
      ).join(' ')
    : '';

  // Generate area path (for fill under line)
  const areaPath = chartData.length > 0
    ? `${linePath} L ${chartData[chartData.length - 1].x} 150 L ${chartData[0].x} 150 Z`
    : '';

  const getColor = () => {
    switch (metric) {
      case 'machines': return '#22c55e';
      case 'activations': return '#22d3ee';
      case 'stability': return '#fbbf24';
      default: return '#22c55e';
    }
  };

  return (
    <div 
      data-testid={`trend-chart-${metric}`}
      className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]"
    >
      <h4 className="text-sm font-medium text-[#9ca3af] mb-4">
        {title || '趋势图表'}
      </h4>

      {/* SVG Chart */}
      <svg
        viewBox="0 0 400 180"
        className="w-full h-40"
        data-testid={`trend-chart-svg-${metric}`}
      >
        {/* Background grid */}
        <defs>
          <pattern
            id={`grid-${metric}`}
            width="60"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 30"
              fill="none"
              stroke="#1e2a42"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect
          x="40"
          y="10"
          width="320"
          height="140"
          fill={`url(#grid-${metric})`}
        />

        {/* Y-axis */}
        <line
          x1="40"
          y1="10"
          x2="40"
          y2="150"
          stroke="#1e2a42"
          strokeWidth="1"
        />

        {/* X-axis */}
        <line
          x1="40"
          y1="150"
          x2="360"
          y2="150"
          stroke="#1e2a42"
          strokeWidth="1"
        />

        {/* Y-axis labels */}
        {yLabels.map((label, i) => (
          <text
            key={i}
            x="35"
            y={15 + i * 30}
            textAnchor="end"
            className="fill-[#6b7280] text-[10px]"
          >
            {label}
          </text>
        ))}

        {/* X-axis labels (dates) */}
        {chartData.length > 0 && (
          <>
            <text
              x="40"
              y="168"
              textAnchor="start"
              className="fill-[#6b7280] text-[10px]"
            >
              {formatDate(chartData[0].timestamp)}
            </text>
            {chartData.length > 1 && (
              <text
                x="360"
                y="168"
                textAnchor="end"
                className="fill-[#6b7280] text-[10px]"
              >
                {formatDate(chartData[chartData.length - 1].timestamp)}
              </text>
            )}
          </>
        )}

        {/* Area fill */}
        {chartData.length > 0 && (
          <path
            d={areaPath}
            fill={getColor()}
            fillOpacity="0.1"
            className="transition-all duration-500"
          />
        )}

        {/* Line */}
        {chartData.length > 0 && (
          <path
            d={linePath}
            fill="none"
            stroke={getColor()}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500"
          />
        )}

        {/* Data points */}
        {chartData.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={getColor()}
              stroke="#0a0e17"
              strokeWidth="2"
              className="transition-all duration-300"
              data-testid={`trend-point-${metric}-${i}`}
            >
              <title>
                {formatDate(point.timestamp)}: {point.value}
              </title>
            </circle>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getColor() }}
          />
          <span className="text-xs text-[#6b7280]">
            {metric === 'machines' && '累计机器数'}
            {metric === 'activations' && '激活次数'}
            {metric === 'stability' && '平均稳定性'}
          </span>
        </div>
        {chartData.length > 0 && (
          <span className="text-xs text-white font-bold" style={{ color: getColor() }}>
            最新: {chartData[chartData.length - 1].value}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Format date for display
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default TrendChart;
