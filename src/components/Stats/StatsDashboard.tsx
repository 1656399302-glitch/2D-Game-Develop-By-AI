/**
 * Machine Statistics Dashboard Component
 * 
 * Displays real-time analytics and metrics for the current machine on canvas.
 * Features tabs: Overview, Energy Flow, Complexity, Recommendations
 */

import React, { useEffect } from 'react';
import { useMachineStatsStore } from '../../store/useMachineStatsStore';
import { useMachineStore } from '../../store/useMachineStore';
import {
  useModuleCount,
  useConnectionCount,
  useMachineFaction,
  useMachineStability,
  useMachinePower,
  useMachineHealth,
  useComplexityScore,
  useComplexityFactors,
  useEnergyFlowStats,
} from '../../store/useMachineStatsStore';

interface StatsDashboardProps {
  onClose?: () => void;
}

type TabType = 'overview' | 'energy' | 'complexity' | 'recommendations';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'overview', label: '概览', icon: '📊' },
  { id: 'energy', label: '能量流', icon: '⚡' },
  { id: 'complexity', label: '复杂度', icon: '🔧' },
  { id: 'recommendations', label: '建议', icon: '💡' },
];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ onClose }) => {
  const isPanelOpen = useMachineStatsStore((state) => state.isPanelOpen);
  const activeTab = useMachineStatsStore((state) => state.activeTab);
  const setActiveTab = useMachineStatsStore((state) => state.setActiveTab);
  const refreshStatistics = useMachineStatsStore((state) => state.refreshStatistics);

  // Subscribe to machine store changes to refresh stats
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);

  // Refresh statistics when modules or connections change
  useEffect(() => {
    refreshStatistics();
  }, [modules.length, connections.length, refreshStatistics]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isPanelOpen) return null;

  return (
    <div
      data-testid="stats-panel"
      className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl mx-4 my-8 bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#22c55e]/30 shadow-2xl shadow-green-900/20 overflow-hidden"
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
                <h2 className="text-xl font-bold text-white">机器统计面板</h2>
                <p className="text-sm text-[#9ca3af]">
                  实时分析当前机器属性
                </p>
              </div>
            </div>

            {onClose && (
              <button
                data-testid="stats-close-button"
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

        {/* Tabs */}
        <div className="px-6">
          <div className="flex gap-2 border-b border-[#1e2a42]" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                data-testid={`stats-tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-[#22c55e] border-[#22c55e]'
                    : 'text-[#6b7280] border-transparent hover:text-white'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 pb-6 pt-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'energy' && <EnergyFlowTab />}
          {activeTab === 'complexity' && <ComplexityTab />}
          {activeTab === 'recommendations' && <RecommendationsTab />}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Overview Tab
// ============================================================================

const OverviewTab: React.FC = () => {
  const moduleCount = useModuleCount();
  const connectionCount = useConnectionCount();
  const faction = useMachineFaction();
  const stability = useMachineStability();
  const power = useMachinePower();
  const health = useMachineHealth();

  return (
    <div className="space-y-4">
      {/* Primary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          label="模块数量"
          value={moduleCount}
          unit="个"
          dataTestId="stat-module-count"
          color="#22c55e"
        />
        <MetricCard
          label="连接数量"
          value={connectionCount}
          unit="条"
          dataTestId="stat-connection-count"
          color="#22d3ee"
        />
        <MetricCard
          label="核心派系"
          value={faction}
          dataTestId="stat-faction"
          color="#a855f7"
          isText
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#9ca3af]">稳定性</span>
            <span className="text-lg" aria-hidden="true">🛡️</span>
          </div>
          <div className="flex items-end gap-2">
            <span
              data-testid="stat-stability"
              className="text-3xl font-bold"
              style={{ color: stability >= 70 ? '#22c55e' : stability >= 40 ? '#fbbf24' : '#ef4444' }}
            >
              {stability}
            </span>
            <span className="text-sm text-[#6b7280] mb-1">/ 100</span>
          </div>
          <div className="mt-2 h-2 bg-[#1e2a42] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${stability}%`,
                backgroundColor: stability >= 70 ? '#22c55e' : stability >= 40 ? '#fbbf24' : '#ef4444',
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#9ca3af]">功率输出</span>
            <span className="text-lg" aria-hidden="true">⚡</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              data-testid="stat-power"
              className="text-3xl font-bold text-[#22d3ee]"
            >
              {power}
            </span>
            <span className="text-sm text-[#6b7280]">单位</span>
          </div>
        </div>
      </div>

      {/* Machine health */}
      <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#9ca3af]">机器状态</span>
          <span className="text-lg" aria-hidden="true">❤️</span>
        </div>
        <div className="flex items-end gap-2">
          <span
            data-testid="stat-health"
            className="text-3xl font-bold"
            style={{ color: health >= 70 ? '#22c55e' : health >= 40 ? '#fbbf24' : '#ef4444' }}
          >
            {health}%
          </span>
          <span className="text-sm text-[#6b7280] mb-1">健康度</span>
        </div>
        <div className="mt-2 h-2 bg-[#1e2a42] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${health}%`,
              backgroundColor: health >= 70 ? '#22c55e' : health >= 40 ? '#fbbf24' : '#ef4444',
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Energy Flow Tab
// ============================================================================

const EnergyFlowTab: React.FC = () => {
  const energyFlows = useEnergyFlowStats();

  if (energyFlows.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚡</div>
        <p className="text-[#9ca3af]">暂无能量连接</p>
        <p className="text-sm text-[#6b7280] mt-1">连接模块以查看能量流动分析</p>
      </div>
    );
  }

  // Calculate summary stats
  const totalThroughput = energyFlows.reduce((sum, f) => sum + f.throughput, 0);
  const avgThroughput = Math.round(totalThroughput / energyFlows.length);
  const highLoadCount = energyFlows.filter(f => f.loadStatus === 'high' || f.loadStatus === 'overloaded').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42] text-center">
          <div className="text-2xl font-bold text-[#22d3ee]">{energyFlows.length}</div>
          <div className="text-xs text-[#9ca3af]">连接数</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42] text-center">
          <div className="text-2xl font-bold text-[#fbbf24]">{avgThroughput}%</div>
          <div className="text-xs text-[#9ca3af]">平均吞吐量</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42] text-center">
          <div className={`text-2xl font-bold ${highLoadCount > 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
            {highLoadCount}
          </div>
          <div className="text-xs text-[#9ca3af]">高负载连接</div>
        </div>
      </div>

      {/* Connection list */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-[#9ca3af]">能量流动详情</h4>
        {energyFlows.map((flow, index) => (
          <div
            key={flow.connectionId}
            data-testid={`energy-flow-stat-${index}`}
            className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">连接 #{index + 1}</span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  flow.loadStatus === 'low'
                    ? 'bg-[#6b7280]/20 text-[#9ca3af]'
                    : flow.loadStatus === 'normal'
                    ? 'bg-[#22c55e]/20 text-[#22c55e]'
                    : flow.loadStatus === 'high'
                    ? 'bg-[#fbbf24]/20 text-[#fbbf24]'
                    : 'bg-[#ef4444]/20 text-[#ef4444]'
                }`}
              >
                {flow.loadStatus === 'low' ? '低' : flow.loadStatus === 'normal' ? '正常' : flow.loadStatus === 'high' ? '高' : '过载'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7280]">吞吐量:</span>
              <div className="flex-1 h-2 bg-[#1e2a42] rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${flow.throughput}%`,
                    backgroundColor: flow.throughput < 40 ? '#6b7280' : flow.throughput < 70 ? '#22c55e' : flow.throughput < 90 ? '#fbbf24' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-xs font-medium" style={{
                color: flow.throughput < 40 ? '#6b7280' : flow.throughput < 70 ? '#22c55e' : flow.throughput < 90 ? '#fbbf24' : '#ef4444'
              }}>
                {flow.throughput}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Complexity Tab
// ============================================================================

const ComplexityTab: React.FC = () => {
  const complexityScore = useComplexityScore();
  const factors = useComplexityFactors();

  return (
    <div className="space-y-4">
      {/* Complexity score */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0e17] to-[#1a1a2e] border border-[#22c55e]/30">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium text-white">复杂度评分</span>
          <span className="text-2xl">🔧</span>
        </div>
        <div className="flex items-end gap-3">
          <span
            data-testid="complexity-score"
            className="text-5xl font-bold text-[#22c55e]"
          >
            {complexityScore}
          </span>
          <span className="text-lg text-[#6b7280] mb-2">/ 100</span>
        </div>
        <div className="mt-4 h-3 bg-[#1e2a42] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 bg-gradient-to-r from-[#22c55e] to-[#22d3ee]"
            style={{ width: `${complexityScore}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-[#9ca3af]">
          {complexityScore < 30 ? '简单机器 - 适合初学者' :
           complexityScore < 60 ? '中等复杂度 - 功能完善' :
           complexityScore < 80 ? '高复杂度 - 经验丰富' :
           '极高复杂度 - 专家级设计'}
        </p>
      </div>

      {/* Complexity factors */}
      {factors && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#9ca3af]">复杂度因素</h4>
          <div className="grid grid-cols-2 gap-3">
            <FactorCard label="模块数量" value={factors.moduleCount} icon="📦" />
            <FactorCard label="连接数量" value={factors.connectionCount} icon="🔗" />
            <FactorCard 
              label="模块多样性" 
              value={`${Math.round(factors.moduleTypeDiversity)}%`} 
              icon="🎨"
              dataTestId="complexity-factor"
            />
            <FactorCard 
              label="派系多样性" 
              value={`${Math.round(factors.factionDiversity)}%`} 
              icon="⚔️"
              dataTestId="complexity-factor"
            />
            <FactorCard 
              label="最大深度" 
              value={factors.maxDepth} 
              icon="📏"
              dataTestId="complexity-factor"
            />
            <FactorCard 
              label="平均连接" 
              value={factors.avgConnectionsPerModule.toFixed(1)} 
              icon="🔄"
            />
          </div>

          {/* Structure indicators */}
          <div className="flex gap-3 flex-wrap">
            {factors.hasCore && (
              <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-sm">
                ✓ 核心模块
              </span>
            )}
            {factors.hasOutput && (
              <span className="px-3 py-1 rounded-full bg-[#22d3ee]/20 text-[#22d3ee] text-sm">
                ✓ 输出模块
              </span>
            )}
            {factors.hasMultiPortModules && (
              <span className="px-3 py-1 rounded-full bg-[#a855f7]/20 text-[#a855f7] text-sm">
                ✓ 多端口模块
              </span>
            )}
            {factors.hasCycles && (
              <span className="px-3 py-1 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] text-sm">
                ⚠ 存在循环
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Recommendations Tab (P2 - Basic implementation)
// ============================================================================

const RecommendationsTab: React.FC = () => {
  const factors = useComplexityFactors();
  const health = useMachineHealth();
  const complexityScore = useComplexityScore();

  const recommendations: { icon: string; text: string; priority: 'high' | 'medium' | 'low' }[] = [];

  if (!factors || factors.moduleCount === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔧</div>
        <p className="text-[#9ca3af]">暂无建议</p>
        <p className="text-sm text-[#6b7280] mt-1">添加模块后查看优化建议</p>
      </div>
    );
  }

  // Generate recommendations based on analysis
  if (!factors.hasCore) {
    recommendations.push({
      icon: '⚠️',
      text: '建议添加核心炉心以提升机器稳定性',
      priority: 'high',
    });
  }

  if (!factors.hasOutput) {
    recommendations.push({
      icon: '⚠️',
      text: '缺少输出法阵模块，无法完整输出能量',
      priority: 'high',
    });
  }

  if (factors.hasCycles) {
    recommendations.push({
      icon: '⚡',
      text: '检测到能量循环，可能导致过载风险',
      priority: 'medium',
    });
  }

  if (factors.maxDepth < 2 && factors.connectionCount > 0) {
    recommendations.push({
      icon: '🔗',
      text: '能量链路较短，考虑增加模块深度',
      priority: 'low',
    });
  }

  if (health < 50) {
    recommendations.push({
      icon: '❤️',
      text: '机器健康度较低，建议优化连接结构',
      priority: 'high',
    });
  }

  if (complexityScore > 80) {
    recommendations.push({
      icon: '🧠',
      text: '复杂度较高，请注意故障排查难度',
      priority: 'medium',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      icon: '✅',
      text: '机器结构良好，无需特别建议',
      priority: 'low',
    });
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-[#9ca3af]">优化建议</h4>
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border ${
              rec.priority === 'high'
                ? 'bg-[#ef4444]/10 border-[#ef4444]/30'
                : rec.priority === 'medium'
                ? 'bg-[#fbbf24]/10 border-[#fbbf24]/30'
                : 'bg-[#22c55e]/10 border-[#22c55e]/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">{rec.icon}</span>
              <p className={`text-sm ${
                rec.priority === 'high'
                  ? 'text-[#fca5a5]'
                  : rec.priority === 'medium'
                  ? 'text-[#fde68a]'
                  : 'text-[#86efac]'
              }`}>
                {rec.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Helper Components
// ============================================================================

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  dataTestId?: string;
  color: string;
  isText?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  dataTestId,
  color,
  isText = false,
}) => {
  return (
    <div
      className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42] transition-all duration-300 hover:border-[#1e2a42]/80"
      style={{
        boxShadow: `0 0 20px ${color}10`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#9ca3af]">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        {isText ? (
          <span
            data-testid={dataTestId}
            className="text-2xl font-bold"
            style={{ color }}
          >
            {value}
          </span>
        ) : (
          <>
            <span
              data-testid={dataTestId}
              className="text-3xl font-bold"
              style={{ color }}
            >
              {value}
            </span>
            {unit && (
              <span className="text-sm text-[#6b7280]">
                {unit}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface FactorCardProps {
  label: string;
  value: string | number;
  icon: string;
  dataTestId?: string;
}

const FactorCard: React.FC<FactorCardProps> = ({ label, value, icon, dataTestId }) => {
  return (
    <div
      data-testid={dataTestId}
      className="p-3 rounded-lg bg-[#0a0e17]/50 border border-[#1e2a42]"
    >
      <div className="flex items-center gap-2 mb-1">
        <span aria-hidden="true">{icon}</span>
        <span className="text-xs text-[#6b7280]">{label}</span>
      </div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
};

export default StatsDashboard;
