/**
 * EnhancedStatsDashboard Component Tests
 * 
 * Comprehensive tests for the Enhanced Statistics Dashboard component.
 * AC-143-001 through AC-143-005 coverage.
 */

import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import React from 'react';

// Mock stores BEFORE importing component
const mockStatsData = {
  machinesCreated: 42,
  activations: 156,
  errors: 3,
  playtimeMinutes: 185,
  factionCounts: { void: 10, inferno: 15, storm: 8, stellar: 9 },
  machinesExported: 5,
  complexMachinesCreated: 12,
  earnedAchievements: [],
};

const mockCodexEntries: any[] = [];

vi.mock('../store/useStatsStore', () => ({
  useStatsStore: vi.fn(() => mockStatsData),
}));

vi.mock('../store/useCodexStore', () => ({
  useCodexStore: vi.fn((selector?: any) => {
    if (selector) {
      return selector({ entries: mockCodexEntries });
    }
    return { entries: mockCodexEntries };
  }),
}));

// Import component after mocks
import { EnhancedStatsDashboard } from '../components/Stats/EnhancedStatsDashboard';

describe('EnhancedStatsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:http://test-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================================================
  // AC-143-001: EnhancedStatsDashboard Renders All 5 Tabs
  // ============================================================================
  describe('AC-143-001: Tab Rendering', () => {
    it('renders 5 tabs with correct labels', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);
      
      expect(screen.getByText('概览')).toBeInTheDocument();
      expect(screen.getByText('趋势')).toBeInTheDocument();
      expect(screen.getByText('模块')).toBeInTheDocument();
      expect(screen.getByText('稀有度')).toBeInTheDocument();
      expect(screen.getByText('对比')).toBeInTheDocument();
    });

    it('tabs have correct data-testid attributes', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      expect(screen.getByTestId('stats-tab-overview')).toBeInTheDocument();
      expect(screen.getByTestId('stats-tab-trends')).toBeInTheDocument();
      expect(screen.getByTestId('stats-tab-composition')).toBeInTheDocument();
      expect(screen.getByTestId('stats-tab-rarity')).toBeInTheDocument();
      expect(screen.getByTestId('stats-tab-comparison')).toBeInTheDocument();
    });

    it('overview tab is selected by default', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      const overviewTab = screen.getByTestId('stats-tab-overview');
      expect(overviewTab.getAttribute('aria-selected')).toBe('true');
    });
  });

  // ============================================================================
  // AC-143-002: EnhancedStatsDashboard Tab Switching
  // ============================================================================
  describe('AC-143-002: Tab Switching', () => {
    it('switches to trends tab and shows TrendsTab content', async () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('stats-tab-trends'));
      });
      
      expect(screen.getByTestId('stats-tab-trends').getAttribute('aria-selected')).toBe('true');
    });

    it('switches to composition tab and shows CompositionTab content', async () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('stats-tab-composition'));
      });
      
      expect(screen.getByTestId('stats-tab-composition').getAttribute('aria-selected')).toBe('true');
    });

    it('switches to rarity tab and shows RarityTab content', async () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('stats-tab-rarity'));
      });
      
      expect(screen.getByTestId('stats-tab-rarity').getAttribute('aria-selected')).toBe('true');
    });

    it('switches to comparison tab and shows ComparisonTab content', async () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('stats-tab-comparison'));
      });
      
      expect(screen.getByTestId('stats-tab-comparison').getAttribute('aria-selected')).toBe('true');
    });
  });

  // ============================================================================
  // AC-143-003: Overview Tab Shows Statistics
  // ============================================================================
  describe('AC-143-003: Overview Tab Statistics', () => {
    it('displays stat-machines-created card with correct value', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      const machinesCard = screen.getByTestId('stat-machines-created');
      expect(machinesCard).toBeInTheDocument();
      expect(machinesCard.textContent).toContain('42');
    });

    it('displays stat-activations card with correct value', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      const activationsCard = screen.getByTestId('stat-activations');
      expect(activationsCard).toBeInTheDocument();
      expect(activationsCard.textContent).toContain('156');
    });

    it('displays stat-codex-entries card with correct value', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      const codexCard = screen.getByTestId('stat-codex-entries');
      expect(codexCard).toBeInTheDocument();
      expect(codexCard.textContent).toContain('0');
    });

    it('displays stat-errors card with correct value', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      const errorsCard = screen.getByTestId('stat-errors');
      expect(errorsCard).toBeInTheDocument();
      expect(errorsCard.textContent).toContain('3');
    });

    it('displays 4 primary StatCards in overview tab', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      expect(screen.getByTestId('stat-machines-created')).toBeInTheDocument();
      expect(screen.getByTestId('stat-activations')).toBeInTheDocument();
      expect(screen.getByTestId('stat-codex-entries')).toBeInTheDocument();
      expect(screen.getByTestId('stat-errors')).toBeInTheDocument();
    });

    it('displays faction distribution section', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      expect(screen.getByTestId('stat-faction-void')).toBeInTheDocument();
      expect(screen.getByTestId('stat-faction-inferno')).toBeInTheDocument();
      expect(screen.getByTestId('stat-faction-storm')).toBeInTheDocument();
      expect(screen.getByTestId('stat-faction-stellar')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // AC-143-004: Export Button Generates JSON
  // ============================================================================
  describe('AC-143-004: Export Functionality', () => {
    it('export button exists with correct data-testid', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      expect(screen.getByTestId('export-stats-button')).toBeInTheDocument();
    });

    it('clicking export button creates blob with JSON content', async () => {
      const createObjectURLMock = vi.fn(() => 'blob:http://test-url');
      global.URL.createObjectURL = createObjectURLMock;
      
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      const exportButton = screen.getByTestId('export-stats-button');
      
      await act(async () => {
        fireEvent.click(exportButton);
      });
      
      expect(createObjectURLMock).toHaveBeenCalled();
    });

    it('export button has correct label text', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      const exportButton = screen.getByTestId('export-stats-button');
      expect(exportButton.textContent).toContain('导出JSON');
    });
  });

  // ============================================================================
  // AC-143-005: Close Button Dismisses Panel
  // ============================================================================
  describe('AC-143-005: Close Button', () => {
    it('close button exists with correct data-testid', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      expect(screen.getByTestId('enhanced-stats-close-button')).toBeInTheDocument();
    });

    it('clicking close button calls onClose exactly once', async () => {
      const onClose = vi.fn();
      render(<EnhancedStatsDashboard onClose={onClose} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('enhanced-stats-close-button'));
      });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('escape key triggers onClose', async () => {
      const onClose = vi.fn();
      render(<EnhancedStatsDashboard onClose={onClose} />);
      
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Additional Dashboard Tests
  // ============================================================================
  describe('Dashboard Container', () => {
    it('dashboard container has correct data-testid', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      expect(screen.getByTestId('enhanced-stats-dashboard')).toBeInTheDocument();
    });

    it('renders with header and title', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      expect(screen.getByText('增强统计面板')).toBeInTheDocument();
      expect(screen.getByText('全面的机器数据分析与比较')).toBeInTheDocument();
    });
  });

  describe('Comparison Tab Behavior', () => {
    it('shows disabled comparison button when codex has < 2 machines', () => {
      render(<EnhancedStatsDashboard onClose={vi.fn()} />);
      
      fireEvent.click(screen.getByTestId('stats-tab-comparison'));
      
      const comparisonButton = screen.getByTestId('open-comparison-button');
      // Button should have disabled attribute and cursor-not-allowed class
      expect(comparisonButton).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onClose gracefully', () => {
      expect(() => {
        render(<EnhancedStatsDashboard />);
      }).not.toThrow();
    });
  });
});
