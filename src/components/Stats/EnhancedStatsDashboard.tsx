/**
 * Enhanced Statistics Dashboard Component
 * 
 * Displays comprehensive analytics including comparison, trends, and charts.
 * Updated for Round 44 with enhanced statistics features.
 */

import React, { useState, useMemo } from 'react';
import { useStatsStore } from '../../store/useStatsStore';
import { useCodexStore } from '../../store/useCodexStore';
import { CodexEntry } from '../../types';
import { FactionId } from '../../types/factions';
import {
  analyzeModuleComposition,
  analyzeRarityDistribution,
  analyzeFactionPopularity,
  generateTrendData,
  analyzeConnectionPatterns,
  generateStatisticsExport,
} from '../../utils/statisticsAnalyzer';
import { MachineComparisonPanel } from './MachineComparisonPanel';
import { ModuleCompositionChart } from './ModuleCompositionChart';
import { RarityDistributionChart } from './RarityDistributionChart';
import { TrendChart } from './TrendChart';
import { RARITY_COLORS } from '../../utils/statisticsAnalyzer';

interface EnhancedStatsDashboardProps {
  onClose?: () => void;
}

type TabType = 'overview' | 'trends' | 'composition' | 'rarity' | 'comparison';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'overview', label: '概览', icon: '📊' },
  { id: 'trends', label: '趋势', icon: '📈' },
  { id: 'composition', label: '模块', icon: '🧩' },
  { id: 'rarity', label: '稀有度', icon: '💎' },
  { id: 'comparison', label: '对比', icon: '⚖️' },
];

export const EnhancedStatsDashboard: React.FC<EnhancedStatsDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showComparisonPanel, setShowComparisonPanel] = useState(false);

  // Get data from stores
  const statsStore = useStatsStore();
  const codexStore = useCodexStore();
  const codexEntries = codexStore.entries;

  // Compute analytics data
  const moduleComposition = useMemo(
    () => analyzeModuleComposition(codexEntries),
    [codexEntries]
  );

  const rarityDistribution = useMemo(
    () => analyzeRarityDistribution(codexEntries),
    [codexEntries]
  );

  const factionPopularity = useMemo(
    () => analyzeFactionPopularity(codexEntries),
    [codexEntries]
  );

  const trendData = useMemo(
    () => generateTrendData(codexEntries, statsStore.activations),
    [codexEntries, statsStore.activations]
  );

  const connectionPatterns = useMemo(
    () => analyzeConnectionPatterns(codexEntries),
    [codexEntries]
  );

  // Handle export
  const handleExport = () => {
    const exportData = generateStatisticsExport(codexEntries, {
      machinesCreated: statsStore.machinesCreated,
      activations: statsStore.activations,
      factionCounts: statsStore.factionCounts,
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arcane-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div
        data-testid="enhanced-stats-dashboard"
        className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl mx-4 my-8 bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#22c55e]/30 shadow-2xl shadow-green-900/20 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#22c55e] via-[#22d3ee] to-[#a855f7]" />

          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#22c55e]/20 flex items-center justify-center text-xl">
                  📊
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">增强统计面板</h2>
                  <p className="text-sm text-[#9ca3af]">
                    全面的机器数据分析与比较
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Export Button (AC5) */}
                <button
                  data-testid="export-stats-button"
                  onClick={handleExport}
                  className="px-3 py-2 rounded-lg bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30 transition-colors text-sm flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 2v9M4 7l4 4 4-4M2 13h12" />
                  </svg>
                  导出JSON
                </button>

                {onClose && (
                  <button
                    data-testid="enhanced-stats-close-button"
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
            {activeTab === 'overview' && (
              <OverviewTab
                machinesCreated={statsStore.machinesCreated}
                activations={statsStore.activations}
                errors={statsStore.errors}
                playtimeMinutes={statsStore.playtimeMinutes}
                factionCounts={statsStore.factionCounts}
                codexEntries={codexEntries}
                connectionPatterns={connectionPatterns}
                factionPopularity={factionPopularity}
              />
            )}
            {activeTab === 'trends' && (
              <TrendsTab trendData={trendData} />
            )}
            {activeTab === 'composition' && (
              <CompositionTab data={moduleComposition} />
            )}
            {activeTab === 'rarity' && (
              <RarityTab data={rarityDistribution} />
            )}
            {activeTab === 'comparison' && (
              <ComparisonTab onOpenComparison={() => setShowComparisonPanel(true)} />
            )}
          </div>
        </div>
      </div>

      {/* Machine Comparison Panel */}
      {showComparisonPanel && (
        <MachineComparisonPanel onClose={() => setShowComparisonPanel(false)} />
      )}
    </>
  );
};

// ============================================================================
// Overview Tab
// ============================================================================

interface OverviewTabProps {
  machinesCreated: number;
  activations: number;
  errors: number;
  playtimeMinutes: number;
  factionCounts: Record<FactionId, number>;
  codexEntries: CodexEntry[];
  connectionPatterns: ReturnType<typeof analyzeConnectionPatterns>;
  factionPopularity: ReturnType<typeof analyzeFactionPopularity>;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  machinesCreated,
  activations,
  errors,
  playtimeMinutes,
  factionCounts,
  codexEntries,
  connectionPatterns,
  factionPopularity,
}) => {
  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="创建机器"
          value={machinesCreated}
          icon="🔧"
          color="#22c55e"
          dataTestId="stat-machines-created"
        />
        <StatCard
          label="激活次数"
          value={activations}
          icon="⚡"
          color="#22d3ee"
          dataTestId="stat-activations"
        />
        <StatCard
          label="图鉴收藏"
          value={codexEntries.length}
          icon="📖"
          color="#a855f7"
          dataTestId="stat-codex-entries"
        />
        <StatCard
          label="错误次数"
          value={errors}
          icon="❌"
          color="#ef4444"
          dataTestId="stat-errors"
        />
      </div>

      {/* Faction Distribution */}
      <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
        <h3 className="text-sm font-medium text-[#9ca3af] mb-4">派系分布</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['void', 'inferno', 'storm', 'stellar'] as const).map((faction) => {
            const data = factionPopularity.find(f => f.faction === faction);
            const count = data?.count || factionCounts[faction] || 0;
            const colors = {
              void: '#a78bfa',
              inferno: '#f97316',
              storm: '#22d3ee',
              stellar: '#fbbf24',
            };
            return (
              <div key={faction} className="text-center">
                <div 
                  className="text-2xl font-bold"
                  style={{ color: colors[faction] }}
                  data-testid={`stat-faction-${faction}`}
                >
                  {count}
                </div>
                <div className="text-xs text-[#6b7280]">
                  {faction.charAt(0).toUpperCase() + faction.slice(1)}派系
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection Patterns (P1) */}
      <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
        <h3 className="text-sm font-medium text-[#9ca3af] mb-4">连接模式分析</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div 
              className="text-2xl font-bold text-[#22d3ee]"
              data-testid="stat-avg-connections"
            >
              {connectionPatterns.avgConnectionsPerMachine.toFixed(1)}
            </div>
            <div className="text-xs text-[#6b7280]">平均连接数</div>
          </div>
          <div className="text-center">
            <div 
              className="text-2xl font-bold text-[#22c55e]"
              data-testid="stat-avg-modules"
            >
              {connectionPatterns.avgModulesPerMachine.toFixed(1)}
            </div>
            <div className="text-xs text-[#6b7280]">平均模块数</div>
          </div>
          <div className="text-center">
            <div 
              className="text-2xl font-bold text-[#fbbf24]"
              data-testid="stat-connection-density"
            >
              {connectionPatterns.connectionDensity.toFixed(1)}%
            </div>
            <div className="text-xs text-[#6b7280]">连接密度</div>
          </div>
        </div>
      </div>

      {/* Playtime */}
      <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
        <h3 className="text-sm font-medium text-[#9ca3af] mb-2">游玩时间</h3>
        <div className="flex items-baseline gap-2">
          <span 
            className="text-3xl font-bold text-white"
            data-testid="stat-playtime"
          >
            {Math.floor(playtimeMinutes / 60)}h {playtimeMinutes % 60}m
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Trends Tab (AC2)
// ============================================================================

interface TrendsTabProps {
  trendData: ReturnType<typeof generateTrendData>;
}

const TrendsTab: React.FC<TrendsTabProps> = ({ trendData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TrendChart
          data={trendData}
          metric="machines"
          title="机器创建趋势"
        />
        <TrendChart
          data={trendData}
          metric="activations"
          title="激活次数趋势"
        />
        <TrendChart
          data={trendData}
          metric="stability"
          title="稳定性趋势"
        />
      </div>

      {trendData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[#6b7280]">暂无趋势数据</p>
          <p className="text-xs text-[#4a5568] mt-1">保存机器到图鉴后查看趋势分析</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Composition Tab (AC3)
// ============================================================================

interface CompositionTabProps {
  data: ReturnType<typeof analyzeModuleComposition>;
}

const CompositionTab: React.FC<CompositionTabProps> = ({ data }) => {
  return (
    <div>
      <ModuleCompositionChart data={data} />
    </div>
  );
};

// ============================================================================
// Rarity Tab (AC4)
// ============================================================================

interface RarityTabProps {
  data: ReturnType<typeof analyzeRarityDistribution>;
}

const RarityTab: React.FC<RarityTabProps> = ({ data }) => {
  return (
    <div>
      <RarityDistributionChart data={data} />
    </div>
  );
};

// ============================================================================
// Comparison Tab (AC1)
// ============================================================================

interface ComparisonTabProps {
  onOpenComparison: () => void;
}

const ComparisonTab: React.FC<ComparisonTabProps> = ({ onOpenComparison }) => {
  const codexEntries = useCodexStore((state) => state.entries);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#9ca3af]">机器对比分析</h3>
        <button
          data-testid="open-comparison-button"
          onClick={onOpenComparison}
          disabled={codexEntries.length < 2}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            codexEntries.length >= 2
              ? 'bg-[#a855f7] text-white hover:bg-[#a855f7]/80'
              : 'bg-[#1e2a42] text-[#6b7280] cursor-not-allowed'
          }`}
        >
          打开对比面板
        </button>
      </div>

      {codexEntries.length < 2 && (
        <div className="text-center py-8">
          <p className="text-[#6b7280]">图鉴中至少需要2台机器才能进行对比</p>
          <p className="text-xs text-[#4a5568] mt-1">
            当前: {codexEntries.length} / 2 台机器
          </p>
        </div>
      )}

      {codexEntries.length >= 2 && (
        <div className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
          <p className="text-sm text-[#9ca3af]">
            点击上方按钮打开机器对比面板，选择两台机器进行详细的属性比较。
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-[#1e2a42]">
              <div className="text-xs text-[#6b7280]">可对比机器数</div>
              <div className="text-2xl font-bold text-white">{codexEntries.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#1e2a42]">
              <div className="text-xs text-[#6b7280]">最高稀有度</div>
              <div 
                className="text-2xl font-bold"
                style={{ 
                  color: RARITY_COLORS[
                    Math.min(...codexEntries.map(e => ['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(e.rarity))) === 0 ? 'common' :
                    Math.min(...codexEntries.map(e => ['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(e.rarity))) === 1 ? 'uncommon' :
                    Math.min(...codexEntries.map(e => ['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(e.rarity))) === 2 ? 'rare' :
                    Math.min(...codexEntries.map(e => ['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(e.rarity))) === 3 ? 'epic' : 'legendary'
                  ]
                }}
              >
                {RARITY_COLORS[codexEntries[0]?.rarity || 'common'] && 
                  ['common', 'uncommon', 'rare', 'epic', 'legendary'][
                    Math.max(...codexEntries.map(e => ['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(e.rarity)))
                  ]}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Helper Components
// ============================================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  dataTestId?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, dataTestId }) => {
  return (
    <div
      data-testid={dataTestId}
      className="p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42] transition-all duration-300 hover:border-[#1e2a42]/80"
      style={{
        boxShadow: `0 0 20px ${color}10`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#9ca3af]">{label}</span>
        <span className="text-lg" role="img" aria-hidden="true">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
  );
};

export default EnhancedStatsDashboard;
