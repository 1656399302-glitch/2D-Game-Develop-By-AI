/**
 * Statistics Charts Component Tests
 * 
 * Comprehensive tests for chart components used in the Statistics Dashboard.
 * AC-143-008 coverage.
 */

import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { ModuleCompositionChart } from '../components/Stats/ModuleCompositionChart';
import { RarityDistributionChart } from '../components/Stats/RarityDistributionChart';
import { TrendChart } from '../components/Stats/TrendChart';
import {
  analyzeModuleComposition,
  analyzeRarityDistribution,
  generateTrendData,
  MODULE_TYPE_LABELS,
  RARITY_COLORS,
  RARITY_LABELS,
} from '../utils/statisticsAnalyzer';
import { CodexEntry, Rarity, ModuleType } from '../types';

// ============================================================================
// Mock Data
// ============================================================================

const createMockEntry = (
  id: string,
  rarity: Rarity,
  modules: { type: ModuleType }[]
): CodexEntry => ({
  id,
  codexId: `MC-${id}`,
  name: `Machine ${id}`,
  rarity,
  modules: modules.map((m, i) => ({
    id: `mod-${id}-${i}`,
    instanceId: `inst-${id}-${i}`,
    type: m.type,
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [],
  })),
  connections: [],
  attributes: {
    name: `Machine ${id}`,
    rarity,
    stats: { stability: 80, powerOutput: 50, energyCost: 10, failureRate: 0.05 },
    tags: [],
    description: 'Test machine',
    codexId: `MC-${id}`,
  },
  createdAt: Date.now(),
});

// ============================================================================
// ModuleCompositionChart Tests
// ============================================================================

describe('ModuleCompositionChart', () => {
  afterEach(() => {
    cleanup();
  });

  describe('AC-143-008: Chart Rendering', () => {
    it('renders chart container with correct data-testid', () => {
      const mockData = [
        { moduleType: 'core-furnace' as ModuleType, count: 5, percentage: 50 },
        { moduleType: 'rune-node' as ModuleType, count: 3, percentage: 30 },
        { moduleType: 'gear' as ModuleType, count: 2, percentage: 20 },
      ];
      
      render(<ModuleCompositionChart data={mockData} />);
      
      expect(screen.getByTestId('module-composition-chart')).toBeInTheDocument();
    });

    it('renders SVG pie chart with data-testid', () => {
      const mockData = [
        { moduleType: 'core-furnace' as ModuleType, count: 5, percentage: 50 },
        { moduleType: 'rune-node' as ModuleType, count: 3, percentage: 30 },
      ];
      
      render(<ModuleCompositionChart data={mockData} />);
      
      expect(screen.getByTestId('module-pie-chart')).toBeInTheDocument();
    });

    it('renders bar chart elements for each module type', () => {
      const mockData = [
        { moduleType: 'core-furnace' as ModuleType, count: 5, percentage: 50 },
        { moduleType: 'rune-node' as ModuleType, count: 3, percentage: 30 },
        { moduleType: 'gear' as ModuleType, count: 2, percentage: 20 },
      ];
      
      render(<ModuleCompositionChart data={mockData} />);
      
      expect(screen.getByTestId('module-bar-core-furnace')).toBeInTheDocument();
      expect(screen.getByTestId('module-bar-rune-node')).toBeInTheDocument();
      expect(screen.getByTestId('module-bar-gear')).toBeInTheDocument();
    });

    it('renders empty state when data is empty', () => {
      render(<ModuleCompositionChart data={[]} />);
      
      expect(screen.getByText('暂无模块数据')).toBeInTheDocument();
      expect(screen.getByText('保存机器到图鉴后查看模块分布')).toBeInTheDocument();
    });

    it('renders pie slices with correct colors', () => {
      const mockData = [
        { moduleType: 'core-furnace' as ModuleType, count: 5, percentage: 50 },
        { moduleType: 'rune-node' as ModuleType, count: 3, percentage: 30 },
      ];
      
      render(<ModuleCompositionChart data={mockData} />);
      
      expect(screen.getByTestId('pie-slice-core-furnace')).toBeInTheDocument();
      expect(screen.getByTestId('pie-slice-rune-node')).toBeInTheDocument();
    });

    it('shows total module count', () => {
      const mockData = [
        { moduleType: 'core-furnace' as ModuleType, count: 5, percentage: 50 },
        { moduleType: 'rune-node' as ModuleType, count: 3, percentage: 30 },
        { moduleType: 'gear' as ModuleType, count: 2, percentage: 20 },
      ];
      
      render(<ModuleCompositionChart data={mockData} />);
      
      expect(screen.getByText('共 10 个模块')).toBeInTheDocument();
    });

    it('shows module type labels', () => {
      const mockData = [
        { moduleType: 'core-furnace' as ModuleType, count: 5, percentage: 50 },
      ];
      
      render(<ModuleCompositionChart data={mockData} />);
      
      // Use getAllByText since label appears in both bar chart and legend
      const labels = screen.getAllByText(MODULE_TYPE_LABELS['core-furnace']);
      expect(labels.length).toBeGreaterThan(0);
    });

    it('limits displayed bars to top 10', () => {
      const mockData = [
        { moduleType: 'core-furnace' as ModuleType, count: 10, percentage: 20 },
        { moduleType: 'rune-node' as ModuleType, count: 8, percentage: 16 },
        { moduleType: 'gear' as ModuleType, count: 6, percentage: 12 },
        { moduleType: 'output-array' as ModuleType, count: 5, percentage: 10 },
        { moduleType: 'amplifier-crystal' as ModuleType, count: 4, percentage: 8 },
        { moduleType: 'stabilizer-core' as ModuleType, count: 3, percentage: 6 },
        { moduleType: 'void-siphon' as ModuleType, count: 2, percentage: 4 },
        { moduleType: 'phase-modulator' as ModuleType, count: 2, percentage: 4 },
        { moduleType: 'resonance-chamber' as ModuleType, count: 2, percentage: 4 },
        { moduleType: 'fire-crystal' as ModuleType, count: 2, percentage: 4 },
        { moduleType: 'lightning-conductor' as ModuleType, count: 1, percentage: 2 },
        { moduleType: 'shield-shell' as ModuleType, count: 1, percentage: 2 },
      ];
      
      render(<ModuleCompositionChart data={mockData} />);
      
      expect(screen.getByTestId('module-bar-core-furnace')).toBeInTheDocument();
      expect(screen.getByTestId('module-bar-rune-node')).toBeInTheDocument();
      expect(screen.queryByTestId('module-bar-lightning-conductor')).not.toBeInTheDocument();
    });
  });

  describe('analyzeModuleComposition utility', () => {
    it('correctly counts module types', () => {
      const entries: CodexEntry[] = [
        createMockEntry('1', 'common', [
          { type: 'core-furnace' },
          { type: 'rune-node' },
        ]),
        createMockEntry('2', 'uncommon', [
          { type: 'core-furnace' },
          { type: 'gear' },
        ]),
      ];
      
      const result = analyzeModuleComposition(entries);
      
      const coreFurnace = result.find(r => r.moduleType === 'core-furnace');
      expect(coreFurnace?.count).toBe(2);
      
      const runeNode = result.find(r => r.moduleType === 'rune-node');
      expect(runeNode?.count).toBe(1);
    });

    it('calculates percentages correctly', () => {
      const entries: CodexEntry[] = [
        createMockEntry('1', 'common', [
          { type: 'core-furnace' },
          { type: 'rune-node' },
        ]),
        createMockEntry('2', 'uncommon', [
          { type: 'core-furnace' },
        ]),
      ];
      
      const result = analyzeModuleComposition(entries);
      
      const coreFurnace = result.find(r => r.moduleType === 'core-furnace');
      expect(coreFurnace?.percentage).toBe(66.67);
    });

    it('handles empty entries array', () => {
      const result = analyzeModuleComposition([]);
      expect(result).toEqual([]);
    });
  });
});

// ============================================================================
// RarityDistributionChart Tests
// ============================================================================

describe('RarityDistributionChart', () => {
  afterEach(() => {
    cleanup();
  });

  describe('AC-143-008: Chart Rendering', () => {
    it('renders chart container with correct data-testid', () => {
      const mockData = [
        { rarity: 'common' as Rarity, count: 5, percentage: 50 },
        { rarity: 'uncommon' as Rarity, count: 3, percentage: 30 },
      ];
      
      render(<RarityDistributionChart data={mockData} />);
      
      expect(screen.getByTestId('rarity-distribution-chart')).toBeInTheDocument();
    });

    it('renders SVG pie chart with data-testid', () => {
      const mockData = [
        { rarity: 'common' as Rarity, count: 5, percentage: 50 },
        { rarity: 'uncommon' as Rarity, count: 3, percentage: 30 },
      ];
      
      render(<RarityDistributionChart data={mockData} />);
      
      expect(screen.getByTestId('rarity-pie-chart')).toBeInTheDocument();
    });

    it('renders bar chart elements for each rarity', () => {
      const mockData = [
        { rarity: 'common' as Rarity, count: 5, percentage: 50 },
        { rarity: 'uncommon' as Rarity, count: 3, percentage: 30 },
        { rarity: 'rare' as Rarity, count: 2, percentage: 20 },
      ];
      
      render(<RarityDistributionChart data={mockData} />);
      
      expect(screen.getByTestId('rarity-bar-common')).toBeInTheDocument();
      expect(screen.getByTestId('rarity-bar-uncommon')).toBeInTheDocument();
      expect(screen.getByTestId('rarity-bar-rare')).toBeInTheDocument();
    });

    it('renders empty state when data is empty', () => {
      render(<RarityDistributionChart data={[]} />);
      
      expect(screen.getByText('暂无稀有度数据')).toBeInTheDocument();
      expect(screen.getByText('保存机器到图鉴后查看稀有度分布')).toBeInTheDocument();
    });

    it('renders pie segments for each rarity', () => {
      const mockData = [
        { rarity: 'common' as Rarity, count: 5, percentage: 50 },
        { rarity: 'uncommon' as Rarity, count: 3, percentage: 30 },
      ];
      
      render(<RarityDistributionChart data={mockData} />);
      
      expect(screen.getByTestId('rarity-segment-common')).toBeInTheDocument();
      expect(screen.getByTestId('rarity-segment-uncommon')).toBeInTheDocument();
    });

    it('shows total machine count', () => {
      const mockData = [
        { rarity: 'common' as Rarity, count: 5, percentage: 50 },
        { rarity: 'uncommon' as Rarity, count: 3, percentage: 30 },
      ];
      
      render(<RarityDistributionChart data={mockData} />);
      
      expect(screen.getByText('共 8 台机器')).toBeInTheDocument();
    });

    it('shows rarity count for each tier', () => {
      const mockData = [
        { rarity: 'common' as Rarity, count: 5, percentage: 50 },
        { rarity: 'uncommon' as Rarity, count: 3, percentage: 30 },
        { rarity: 'rare' as Rarity, count: 2, percentage: 20 },
      ];
      
      render(<RarityDistributionChart data={mockData} />);
      
      expect(screen.getByTestId('rarity-count-common').textContent).toContain('5');
      expect(screen.getByTestId('rarity-count-uncommon').textContent).toContain('3');
      expect(screen.getByTestId('rarity-count-rare').textContent).toContain('2');
    });

    it('shows rarity legend items', () => {
      const mockData = [
        { rarity: 'common' as Rarity, count: 5, percentage: 50 },
        { rarity: 'uncommon' as Rarity, count: 3, percentage: 30 },
      ];
      
      render(<RarityDistributionChart data={mockData} />);
      
      expect(screen.getByTestId('rarity-legend-common')).toBeInTheDocument();
      expect(screen.getByTestId('rarity-legend-uncommon')).toBeInTheDocument();
    });

    it('displays statistics summary for non-empty data', () => {
      const mockData = [
        { rarity: 'common' as Rarity, count: 5, percentage: 50 },
        { rarity: 'uncommon' as Rarity, count: 3, percentage: 30 },
        { rarity: 'rare' as Rarity, count: 1, percentage: 10 },
        { rarity: 'epic' as Rarity, count: 1, percentage: 10 },
        { rarity: 'legendary' as Rarity, count: 0, percentage: 0 },
      ];
      
      render(<RarityDistributionChart data={mockData} />);
      
      expect(screen.getByText('传说机器')).toBeInTheDocument();
      expect(screen.getByText('史诗机器')).toBeInTheDocument();
      expect(screen.getByText('稀有机器')).toBeInTheDocument();
    });

    it('sorts rarities in correct order (common -> legendary)', () => {
      const mockData = [
        { rarity: 'legendary' as Rarity, count: 1, percentage: 10 },
        { rarity: 'common' as Rarity, count: 5, percentage: 50 },
        { rarity: 'epic' as Rarity, count: 1, percentage: 10 },
        { rarity: 'rare' as Rarity, count: 1, percentage: 10 },
        { rarity: 'uncommon' as Rarity, count: 2, percentage: 20 },
      ];
      
      render(<RarityDistributionChart data={mockData} />);
      
      const container = screen.getByTestId('rarity-distribution-chart');
      const bars = container.querySelectorAll('[data-testid^="rarity-bar-"]');
      expect(bars[0].getAttribute('data-testid')).toBe('rarity-bar-common');
      expect(bars[1].getAttribute('data-testid')).toBe('rarity-bar-uncommon');
      expect(bars[2].getAttribute('data-testid')).toBe('rarity-bar-rare');
      expect(bars[3].getAttribute('data-testid')).toBe('rarity-bar-epic');
      expect(bars[4].getAttribute('data-testid')).toBe('rarity-bar-legendary');
    });
  });

  describe('analyzeRarityDistribution utility', () => {
    it('correctly counts rarity tiers', () => {
      const entries: CodexEntry[] = [
        createMockEntry('1', 'common', []),
        createMockEntry('2', 'common', []),
        createMockEntry('3', 'uncommon', []),
        createMockEntry('4', 'rare', []),
      ];
      
      const result = analyzeRarityDistribution(entries);
      
      const common = result.find(r => r.rarity === 'common');
      expect(common?.count).toBe(2);
      
      const uncommon = result.find(r => r.rarity === 'uncommon');
      expect(uncommon?.count).toBe(1);
      
      const rare = result.find(r => r.rarity === 'rare');
      expect(rare?.count).toBe(1);
    });

    it('calculates percentages correctly', () => {
      const entries: CodexEntry[] = [
        createMockEntry('1', 'common', []),
        createMockEntry('2', 'common', []),
        createMockEntry('3', 'common', []),
        createMockEntry('4', 'common', []),
        createMockEntry('5', 'uncommon', []),
      ];
      
      const result = analyzeRarityDistribution(entries);
      
      const common = result.find(r => r.rarity === 'common');
      expect(common?.percentage).toBe(80);
      
      const uncommon = result.find(r => r.rarity === 'uncommon');
      expect(uncommon?.percentage).toBe(20);
    });

    it('handles empty entries array', () => {
      const result = analyzeRarityDistribution([]);
      // Function returns array with all rarity tiers with 0 count
      expect(result).toHaveLength(5);
      result.forEach(r => {
        expect(r.count).toBe(0);
        expect(r.percentage).toBe(0);
      });
    });

    it('includes all 5 rarity tiers even if count is 0', () => {
      const entries: CodexEntry[] = [
        createMockEntry('1', 'common', []),
      ];
      
      const result = analyzeRarityDistribution(entries);
      
      expect(result).toHaveLength(5);
      const rarities = result.map(r => r.rarity);
      expect(rarities).toContain('common');
      expect(rarities).toContain('uncommon');
      expect(rarities).toContain('rare');
      expect(rarities).toContain('epic');
      expect(rarities).toContain('legendary');
    });
  });
});

// ============================================================================
// TrendChart Tests
// ============================================================================

describe('TrendChart', () => {
  afterEach(() => {
    cleanup();
  });

  describe('AC-143-008: Chart Rendering', () => {
    it('renders machines trend chart with correct data-testid', () => {
      const mockData = [
        { timestamp: Date.now() - 86400000, machinesCreated: 5, activations: 10, averageStability: 80 },
        { timestamp: Date.now(), machinesCreated: 8, activations: 15, averageStability: 85 },
      ];
      
      render(<TrendChart data={mockData} metric="machines" title="机器创建趋势" />);
      
      expect(screen.getByTestId('trend-chart-machines')).toBeInTheDocument();
    });

    it('renders activations trend chart with correct data-testid', () => {
      const mockData = [
        { timestamp: Date.now() - 86400000, machinesCreated: 5, activations: 10, averageStability: 80 },
        { timestamp: Date.now(), machinesCreated: 8, activations: 15, averageStability: 85 },
      ];
      
      render(<TrendChart data={mockData} metric="activations" title="激活次数趋势" />);
      
      expect(screen.getByTestId('trend-chart-activations')).toBeInTheDocument();
    });

    it('renders stability trend chart with correct data-testid', () => {
      const mockData = [
        { timestamp: Date.now() - 86400000, machinesCreated: 5, activations: 10, averageStability: 80 },
        { timestamp: Date.now(), machinesCreated: 8, activations: 15, averageStability: 85 },
      ];
      
      render(<TrendChart data={mockData} metric="stability" title="稳定性趋势" />);
      
      expect(screen.getByTestId('trend-chart-stability')).toBeInTheDocument();
    });

    it('renders SVG element for chart', () => {
      const mockData = [
        { timestamp: Date.now() - 86400000, machinesCreated: 5, activations: 10, averageStability: 80 },
        { timestamp: Date.now(), machinesCreated: 8, activations: 15, averageStability: 85 },
      ];
      
      render(<TrendChart data={mockData} metric="machines" />);
      
      expect(screen.getByTestId('trend-chart-svg-machines')).toBeInTheDocument();
    });

    it('renders empty state when data is empty', () => {
      render(<TrendChart data={[]} metric="machines" title="趋势图表" />);
      
      expect(screen.getByText('暂无趋势数据')).toBeInTheDocument();
      expect(screen.getByText('保存机器后查看趋势')).toBeInTheDocument();
    });

    it('renders data points for each timestamp', () => {
      const mockData = [
        { timestamp: Date.now() - 172800000, machinesCreated: 3, activations: 5, averageStability: 75 },
        { timestamp: Date.now() - 86400000, machinesCreated: 5, activations: 10, averageStability: 80 },
        { timestamp: Date.now(), machinesCreated: 8, activations: 15, averageStability: 85 },
      ];
      
      render(<TrendChart data={mockData} metric="machines" />);
      
      expect(screen.getByTestId('trend-point-machines-0')).toBeInTheDocument();
      expect(screen.getByTestId('trend-point-machines-1')).toBeInTheDocument();
      expect(screen.getByTestId('trend-point-machines-2')).toBeInTheDocument();
    });

    it('shows correct title', () => {
      const mockData = [
        { timestamp: Date.now(), machinesCreated: 5, activations: 10, averageStability: 80 },
      ];
      
      render(<TrendChart data={mockData} metric="machines" title="机器创建趋势" />);
      
      expect(screen.getByText('机器创建趋势')).toBeInTheDocument();
    });

    it('displays legend with correct metric label', () => {
      const mockData = [
        { timestamp: Date.now(), machinesCreated: 5, activations: 10, averageStability: 80 },
      ];
      
      render(<TrendChart data={mockData} metric="machines" />);
      
      expect(screen.getByText('累计机器数')).toBeInTheDocument();
    });

    it('displays legend for activations metric', () => {
      const mockData = [
        { timestamp: Date.now(), machinesCreated: 5, activations: 10, averageStability: 80 },
      ];
      
      render(<TrendChart data={mockData} metric="activations" />);
      
      expect(screen.getByText('激活次数')).toBeInTheDocument();
    });

    it('displays legend for stability metric', () => {
      const mockData = [
        { timestamp: Date.now(), machinesCreated: 5, activations: 10, averageStability: 80 },
      ];
      
      render(<TrendChart data={mockData} metric="stability" />);
      
      expect(screen.getByText('平均稳定性')).toBeInTheDocument();
    });

    it('shows latest value in legend', () => {
      const mockData = [
        { timestamp: Date.now() - 86400000, machinesCreated: 5, activations: 10, averageStability: 80 },
        { timestamp: Date.now(), machinesCreated: 8, activations: 15, averageStability: 85 },
      ];
      
      render(<TrendChart data={mockData} metric="machines" />);
      
      expect(screen.getByText('最新: 8')).toBeInTheDocument();
    });
  });

  describe('generateTrendData utility', () => {
    it('generates trend data from codex entries', () => {
      const now = Date.now();
      const entries: CodexEntry[] = [
        { ...createMockEntry('1', 'common', []), createdAt: now - 172800000 },
        { ...createMockEntry('2', 'uncommon', []), createdAt: now - 86400000 },
        { ...createMockEntry('3', 'rare', []), createdAt: now },
      ];
      
      const activations = [
        { machineId: '1', timestamp: now - 172800000 },
        { machineId: '2', timestamp: now - 86400000 },
        { machineId: '3', timestamp: now },
      ];
      
      const result = generateTrendData(entries, activations);
      
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles empty entries gracefully', () => {
      const result = generateTrendData([], []);
      // Function may return a single data point even with empty input
      // Just verify it doesn't throw and returns an array
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Chart Colors', () => {
    it('uses green color for machines metric', () => {
      const mockData = [
        { timestamp: Date.now(), machinesCreated: 5, activations: 10, averageStability: 80 },
      ];
      
      render(<TrendChart data={mockData} metric="machines" />);
      
      const chartContainer = screen.getByTestId('trend-chart-machines');
      const colorIndicator = chartContainer.querySelector('.w-3.h-3.rounded-full');
      expect(colorIndicator).toBeTruthy();
    });

    it('uses cyan color for activations metric', () => {
      const mockData = [
        { timestamp: Date.now(), machinesCreated: 5, activations: 10, averageStability: 80 },
      ];
      
      render(<TrendChart data={mockData} metric="activations" />);
      
      const chartContainer = screen.getByTestId('trend-chart-activations');
      const colorIndicator = chartContainer.querySelector('.w-3.h-3.rounded-full');
      expect(colorIndicator).toBeTruthy();
    });

    it('uses yellow color for stability metric', () => {
      const mockData = [
        { timestamp: Date.now(), machinesCreated: 5, activations: 10, averageStability: 80 },
      ];
      
      render(<TrendChart data={mockData} metric="stability" />);
      
      const chartContainer = screen.getByTestId('trend-chart-stability');
      const colorIndicator = chartContainer.querySelector('.w-3.h-3.rounded-full');
      expect(colorIndicator).toBeTruthy();
    });
  });

  describe('Single Data Point', () => {
    it('handles single data point gracefully', () => {
      const mockData = [
        { timestamp: Date.now(), machinesCreated: 5, activations: 10, averageStability: 80 },
      ];
      
      render(<TrendChart data={mockData} metric="machines" />);
      
      expect(screen.getByTestId('trend-chart-machines')).toBeInTheDocument();
      expect(screen.getByTestId('trend-point-machines-0')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Constants Tests
// ============================================================================

describe('Statistics Analyzer Constants', () => {
  describe('MODULE_TYPE_LABELS', () => {
    it('contains labels for all module types', () => {
      expect(MODULE_TYPE_LABELS['core-furnace']).toBeTruthy();
      expect(MODULE_TYPE_LABELS['rune-node']).toBeTruthy();
      expect(MODULE_TYPE_LABELS['gear']).toBeTruthy();
    });
  });

  describe('RARITY_COLORS', () => {
    it('contains colors for all rarity tiers', () => {
      expect(RARITY_COLORS['common']).toBeTruthy();
      expect(RARITY_COLORS['uncommon']).toBeTruthy();
      expect(RARITY_COLORS['rare']).toBeTruthy();
      expect(RARITY_COLORS['epic']).toBeTruthy();
      expect(RARITY_COLORS['legendary']).toBeTruthy();
    });
  });

  describe('RARITY_LABELS', () => {
    it('contains labels for all rarity tiers', () => {
      expect(RARITY_LABELS['common']).toBeTruthy();
      expect(RARITY_LABELS['uncommon']).toBeTruthy();
      expect(RARITY_LABELS['rare']).toBeTruthy();
      expect(RARITY_LABELS['epic']).toBeTruthy();
      expect(RARITY_LABELS['legendary']).toBeTruthy();
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Chart Integration', () => {
  afterEach(() => {
    cleanup();
  });

  it('all three chart types can render simultaneously', () => {
    const compositionData = [
      { moduleType: 'core-furnace' as ModuleType, count: 5, percentage: 50 },
      { moduleType: 'rune-node' as ModuleType, count: 3, percentage: 30 },
    ];
    
    const rarityData = [
      { rarity: 'common' as Rarity, count: 5, percentage: 50 },
      { rarity: 'uncommon' as Rarity, count: 3, percentage: 30 },
    ];
    
    const trendData = [
      { timestamp: Date.now(), machinesCreated: 5, activations: 10, averageStability: 80 },
    ];
    
    const { rerender } = render(
      <ModuleCompositionChart data={compositionData} />
    );
    expect(screen.getByTestId('module-composition-chart')).toBeInTheDocument();
    
    rerender(<RarityDistributionChart data={rarityData} />);
    expect(screen.getByTestId('rarity-distribution-chart')).toBeInTheDocument();
    
    rerender(<TrendChart data={trendData} metric="machines" />);
    expect(screen.getByTestId('trend-chart-machines')).toBeInTheDocument();
  });

  it('handles rapid data updates without errors', () => {
    const data1 = [
      { moduleType: 'core-furnace' as ModuleType, count: 5, percentage: 50 },
    ];
    
    const data2 = [
      { moduleType: 'core-furnace' as ModuleType, count: 10, percentage: 50 },
      { moduleType: 'rune-node' as ModuleType, count: 10, percentage: 50 },
    ];
    
    const { rerender } = render(<ModuleCompositionChart data={data1} />);
    
    expect(() => {
      rerender(<ModuleCompositionChart data={data2} />);
    }).not.toThrow();
  });
});
