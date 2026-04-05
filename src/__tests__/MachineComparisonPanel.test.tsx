/**
 * MachineComparisonPanel Component Tests
 * 
 * Comprehensive tests for the Machine Comparison Panel component.
 * AC-143-006 through AC-143-007 coverage.
 */

import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import React from 'react';
import { MachineComparisonPanel } from '../components/Stats/MachineComparisonPanel';

// Helper to create mock codex entries
const createMockEntry = (id: string, name: string, rarity: string, modules: any[] = [], connections: any[] = []) => ({
  id,
  codexId: `MC-${id}`,
  name,
  rarity,
  modules,
  connections,
  attributes: {
    stats: { stability: 80, powerOutput: 50, energyCost: 10, failureRate: 0.05 },
    tags: ['arcane'],
  },
  createdAt: Date.now(),
});

// Default mock machines
const mockMachineA = createMockEntry('1', 'Arcane Disperser', 'uncommon', [
  { instanceId: 'mod-1', type: 'core-furnace' },
  { instanceId: 'mod-2', type: 'rune-node' },
], [
  { id: 'conn-1', sourceModuleId: 'mod-1', targetModuleId: 'mod-2' },
]);

const mockMachineB = createMockEntry('2', 'Stellar Resonator', 'rare', [
  { instanceId: 'mod-3', type: 'amplifier-crystal' },
  { instanceId: 'mod-4', type: 'output-array' },
], []);

const mockCodexEntries = [mockMachineA, mockMachineB];

// Create mock references that can be updated
const mockRefs = {
  codexEntriesData: mockCodexEntries,
  comparisonState: {
    selectedMachineA: null as any,
    selectedMachineB: null as any,
    savedComparisons: [] as any[],
    selectMachineA: vi.fn(),
    selectMachineB: vi.fn(),
    swapMachines: vi.fn(),
    clearSelection: vi.fn(),
    saveComparison: vi.fn(),
    removeComparison: vi.fn(),
    loadComparison: vi.fn(),
  },
};

vi.mock('../store/useCodexStore', () => ({
  useCodexStore: vi.fn((selector) => {
    if (selector) {
      return selector({ entries: mockRefs.codexEntriesData });
    }
    return { entries: mockRefs.codexEntriesData };
  }),
}));

vi.mock('../store/useComparisonStore', () => ({
  useComparisonStore: vi.fn((selector) => {
    if (selector) {
      return selector(mockRefs.comparisonState);
    }
    return mockRefs.comparisonState;
  }),
  useSavedComparisons: vi.fn(() => mockRefs.comparisonState.savedComparisons),
}));

describe('MachineComparisonPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks to default state
    mockRefs.codexEntriesData = [...mockCodexEntries];
    mockRefs.comparisonState = {
      selectedMachineA: null,
      selectedMachineB: null,
      savedComparisons: [],
      selectMachineA: vi.fn(),
      selectMachineB: vi.fn(),
      swapMachines: vi.fn(),
      clearSelection: vi.fn(),
      saveComparison: vi.fn(),
      removeComparison: vi.fn(),
      loadComparison: vi.fn(),
    };
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // ============================================================================
  // AC-143-006: MachineComparisonPanel Opens
  // ============================================================================
  describe('AC-143-006: Comparison Panel Mount', () => {
    it('panel renders with data-testid="machine-comparison-panel"', () => {
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      expect(screen.getByTestId('machine-comparison-panel')).toBeInTheDocument();
    });

    it('panel has correct header title', () => {
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      expect(screen.getByText('机器对比')).toBeInTheDocument();
      expect(screen.getByText('选择两台机器进行对比分析')).toBeInTheDocument();
    });

    it('panel renders with proper structure', () => {
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      expect(screen.getByTestId('select-machine-a-button')).toBeInTheDocument();
      expect(screen.getByTestId('select-machine-b-button')).toBeInTheDocument();
    });

    it('swap button exists but is disabled when no machines selected', () => {
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      const swapButton = screen.getByTestId('swap-machines-button');
      expect(swapButton).toBeInTheDocument();
      expect(swapButton).toBeDisabled();
    });
  });

  // ============================================================================
  // AC-143-007: MachineComparisonPanel Shows Selected Machines
  // ============================================================================
  describe('AC-143-007: Comparison Content Display', () => {
    it('displays machine names when selected', () => {
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      expect(screen.getByTestId('machine-a-name').textContent).toBe('Arcane Disperser');
      expect(screen.getByTestId('machine-b-name').textContent).toBe('Stellar Resonator');
    });

    it('displays module count for selected machines', () => {
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      // Machine A has 2 modules and 1 connection
      // Machine B has 2 modules and 0 connections
      expect(screen.getByText(/模块 · 1 连接/)).toBeInTheDocument();
      expect(screen.getByText(/2 模块 · 0 连接/)).toBeInTheDocument();
    });

    it('shows comparison results when both machines selected', () => {
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      expect(screen.getByTestId('comparison-results')).toBeInTheDocument();
    });

    it('displays stat differences when both machines selected', () => {
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      expect(screen.getByTestId('score-diff')).toBeInTheDocument();
      expect(screen.getByTestId('stability-diff')).toBeInTheDocument();
      expect(screen.getByTestId('power-diff')).toBeInTheDocument();
      expect(screen.getByTestId('energy-cost-diff')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // AC-143-009: Comparison Button State
  // ============================================================================
  describe('AC-143-009: Comparison Button State', () => {
    it('shows disabled state when no machines selected', () => {
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      expect(screen.getByTestId('select-machine-a-button').textContent).toContain('选择机器 A');
      expect(screen.getByTestId('select-machine-b-button').textContent).toContain('选择机器 B');
    });

    it('enables swap button when both machines selected', () => {
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      const swapButton = screen.getByTestId('swap-machines-button');
      expect(swapButton).not.toBeDisabled();
    });

    it('shows save button when both machines selected', () => {
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      expect(screen.getByTestId('save-comparison-button')).toBeInTheDocument();
    });

    it('shows clear selection button when machines selected', () => {
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      expect(screen.getByTestId('clear-selection-button')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Machine Selection Modal Tests
  // ============================================================================
  describe('Machine Selection Modal', () => {
    it('opens machine selector modal header when selecting machine A', async () => {
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-machine-a-button'));
      });
      
      // Modal header includes "选择机器 A"
      expect(screen.getByRole('heading', { name: /选择机器 A/i })).toBeInTheDocument();
    });

    it('opens machine selector modal header when selecting machine B', async () => {
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-machine-b-button'));
      });
      
      expect(screen.getByRole('heading', { name: /选择机器 B/i })).toBeInTheDocument();
    });

    it('shows machine options in selector', async () => {
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-machine-a-button'));
      });
      
      expect(screen.getByTestId('select-machine-option-1')).toBeInTheDocument();
      expect(screen.getByTestId('select-machine-option-2')).toBeInTheDocument();
    });

    it('disables machine B option when selecting machine A (since B is already selected)', async () => {
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-machine-a-button'));
      });
      
      const optionB = screen.getByTestId('select-machine-option-2');
      expect(optionB).toBeDisabled();
    });

    it('closes modal when selecting a machine', async () => {
      const selectMachineA = vi.fn();
      mockRefs.comparisonState.selectMachineA = selectMachineA;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-machine-a-button'));
      });
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-machine-option-1'));
      });
      
      expect(selectMachineA).toHaveBeenCalledWith(mockMachineA);
    });
  });

  // ============================================================================
  // Save Comparison Dialog Tests
  // ============================================================================
  describe('Save Comparison Dialog', () => {
    it('opens save dialog when clicking save button', async () => {
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('save-comparison-button'));
      });
      
      expect(screen.getByTestId('comparison-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-save-button')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-save-button')).toBeInTheDocument();
    });

    it('calls saveComparison when confirming save', async () => {
      const saveComparison = vi.fn();
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      mockRefs.comparisonState.saveComparison = saveComparison;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('save-comparison-button'));
      });
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-save-button'));
      });
      
      expect(saveComparison).toHaveBeenCalled();
    });

    it('closes dialog when cancelling save', async () => {
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('save-comparison-button'));
      });
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('cancel-save-button'));
      });
      
      expect(screen.queryByTestId('comparison-name-input')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Close Button Tests
  // ============================================================================
  describe('Close Button', () => {
    it('close button exists with correct data-testid', () => {
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      expect(screen.getByTestId('comparison-close-button')).toBeInTheDocument();
    });

    it('clicking close button calls onClose', async () => {
      const onClose = vi.fn();
      
      render(<MachineComparisonPanel onClose={onClose} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('comparison-close-button'));
      });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Swap Machines Tests
  // ============================================================================
  describe('Swap Machines', () => {
    it('swap button is disabled when only one machine selected', () => {
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      expect(screen.getByTestId('swap-machines-button')).toBeDisabled();
    });

    it('clicking swap button calls swapMachines', async () => {
      const swapMachines = vi.fn();
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      mockRefs.comparisonState.swapMachines = swapMachines;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('swap-machines-button'));
      });
      
      expect(swapMachines).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Clear Selection Tests
  // ============================================================================
  describe('Clear Selection', () => {
    it('clicking clear button calls clearSelection', async () => {
      const clearSelection = vi.fn();
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      mockRefs.comparisonState.selectedMachineB = mockMachineB;
      mockRefs.comparisonState.clearSelection = clearSelection;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('clear-selection-button'));
      });
      
      expect(clearSelection).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================
  describe('Edge Cases', () => {
    it('handles empty codex gracefully', async () => {
      mockRefs.codexEntriesData = [];
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-machine-a-button'));
      });
      
      expect(screen.getByText(/图鉴中暂无机器/)).toBeInTheDocument();
    });

    it('handles undefined onClose gracefully', () => {
      expect(() => {
        render(<MachineComparisonPanel />);
      }).not.toThrow();
    });

    it('handles same machine cannot be selected for both slots', async () => {
      mockRefs.comparisonState.selectedMachineA = mockMachineA;
      
      render(<MachineComparisonPanel onClose={vi.fn()} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('select-machine-b-button'));
      });
      
      const optionA = screen.getByTestId('select-machine-option-1');
      expect(optionA).toBeDisabled();
    });
  });
});
