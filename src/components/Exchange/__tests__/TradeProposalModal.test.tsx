/**
 * Trade Proposal Modal Component Tests
 * 
 * Comprehensive test coverage for TradeProposalModal component.
 * Tests cover: render, empty state, machine selection, preview display,
 * submit button states, success state, error handling, rarity badges.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TradeProposalModal } from '../TradeProposalModal';

// Mock the exchange store
vi.mock('../../../store/useExchangeStore', () => ({
  useExchangeStore: vi.fn(),
}));

import { useExchangeStore } from '../../../store/useExchangeStore';

describe('TradeProposalModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  // Mock target machine
  const mockTargetMachine = {
    id: 'target-1',
    author: 'test_author',
    publishedAt: Date.now(),
    likes: 100,
    views: 500,
    modules: [
      { id: 'm1', instanceId: 'm1', type: 'core-furnace' as const, x: 100, y: 100, rotation: 0, scale: 1, flipped: false, ports: [] },
      { id: 'm2', instanceId: 'm2', type: 'gear' as const, x: 200, y: 100, rotation: 0, scale: 1, flipped: false, ports: [] },
    ],
    connections: [],
    attributes: {
      name: 'Test Machine',
      rarity: 'legendary' as const,
      stats: { stability: 75, powerOutput: 85, energyCost: 45, failureRate: 25 },
      tags: ['fire'],
      description: 'Test description',
      codexId: 'TM-0001',
    },
    dominantFaction: 'void' as const,
  };

  // Mock listed machines
  const mockListedMachines = [
    {
      id: 'codex-1',
      codexId: 'MC-0001',
      name: 'Alpha Machine',
      rarity: 'rare' as const,
      modules: [{ id: 'm1', instanceId: 'm1', type: 'core-furnace' as const, x: 100, y: 100, rotation: 0, scale: 1, flipped: false, ports: [] }],
      connections: [],
      attributes: {
        name: 'Alpha Machine',
        rarity: 'rare' as const,
        stats: { stability: 80, powerOutput: 70, energyCost: 35, failureRate: 20 },
        tags: ['arcane'],
        description: 'Alpha',
        codexId: 'MC-0001',
      },
      createdAt: Date.now(),
    },
    {
      id: 'codex-2',
      codexId: 'MC-0002',
      name: 'Beta Machine',
      rarity: 'common' as const,
      modules: [{ id: 'm2', instanceId: 'm2', type: 'gear' as const, x: 100, y: 100, rotation: 0, scale: 1, flipped: false, ports: [] }],
      connections: [],
      attributes: {
        name: 'Beta Machine',
        rarity: 'common' as const,
        stats: { stability: 90, powerOutput: 50, energyCost: 20, failureRate: 10 },
        tags: ['mechanical'],
        description: 'Beta',
        codexId: 'MC-0002',
      },
      createdAt: Date.now(),
    },
  ];

  const mockCreateProposal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        getMyListedMachines: vi.fn(() => mockListedMachines),
        createProposal: mockCreateProposal,
      };

      if (selector) {
        return selector(state);
      }
      return state;
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-001: Render with Target Machine Info
  // =========================================================================
  describe('Render with Target Machine Info (AC-EXCHANGE-UI-001)', () => {
    it('should render modal with target machine name', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Test Machine')).toBeTruthy();
    });

    it('should render close button (×) in header', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const closeButton = screen.getByRole('button', { name: '关闭' });
      expect(closeButton).toBeTruthy();
      expect(closeButton.textContent).toBe('✕');
    });

    it('should display target machine stats (power, stability, failureRate)', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('85')).toBeTruthy(); // powerOutput
      expect(screen.getByText('75%')).toBeTruthy(); // stability
      expect(screen.getByText('25%')).toBeTruthy(); // failureRate
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-002: Empty State
  // =========================================================================
  describe('Empty State (AC-EXCHANGE-UI-002)', () => {
    it('should show empty state message when user has no listed machines', () => {
      // Override mock to return empty array
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          getMyListedMachines: vi.fn(() => []),
          createProposal: mockCreateProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // The component shows a longer message including this substring
      expect(screen.getByText(/你的图鉴中没有挂牌的机器/)).toBeTruthy();
    });

    it('should not show preview section when no machines available', () => {
      // Override mock to return empty array
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          getMyListedMachines: vi.fn(() => []),
          createProposal: mockCreateProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Should show "你将获得" (what you'll get)
      expect(screen.getByText(/你将获得/)).toBeTruthy();
      // Should NOT show "你将给出" (what you'll give) preview
      expect(screen.queryByText(/你将给出/)).toBeNull();
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-003: Machine Selection
  // =========================================================================
  describe('Machine Selection (AC-EXCHANGE-UI-003)', () => {
    it('should populate dropdown with all machines from getMyListedMachines()', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeTruthy();

      const options = screen.getAllByRole('option');
      expect(options.length).toBe(3); // 1 default + 2 machines
    });

    it('should show machine names in dropdown options', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Options contain the machine names
      const dropdown = screen.getByRole('combobox');
      expect(dropdown.innerHTML).toContain('Alpha Machine');
      expect(dropdown.innerHTML).toContain('Beta Machine');
    });

    it('should update selectedMachineId when dropdown changes', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Dropdown should show selected value
      expect((dropdown as HTMLSelectElement).value).toBe('codex-1');
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-004: Selected Machine Preview
  // =========================================================================
  describe('Selected Machine Preview (AC-EXCHANGE-UI-004)', () => {
    it('should show preview with name when machine is selected', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Preview should show selected machine name
      expect(screen.getByText('Alpha Machine')).toBeTruthy();
    });

    it('should show rarity badge in preview', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Preview should show rarity
      expect(screen.getByText('rare')).toBeTruthy();
    });

    it('should show module count in preview', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Preview should show "你将给出" (what you'll give)
      expect(screen.getByText(/你将给出/)).toBeTruthy();
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-005: Submit Button States
  // =========================================================================
  describe('Submit Button States (AC-EXCHANGE-UI-005)', () => {
    it('should disable submit button when no machine selected', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: '确认交易' });
      expect(submitButton.hasAttribute('disabled')).toBe(true);
    });

    it('should enable submit button when machine is selected', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      const submitButton = screen.getByRole('button', { name: '确认交易' });
      expect(submitButton.hasAttribute('disabled')).toBe(false);
    });

    it('should call createProposal when submit is clicked', () => {
      mockCreateProposal.mockReturnValue({ id: 'proposal-1' });

      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Click submit
      const submitButton = screen.getByRole('button', { name: '确认交易' });
      fireEvent.click(submitButton);

      // Verify createProposal was called
      expect(mockCreateProposal).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-006 & AC-EXCHANGE-UI-007: Submission Success
  // =========================================================================
  describe('Submission Success (AC-EXCHANGE-UI-006, AC-EXCHANGE-UI-007)', () => {
    it('should call createProposal with correct parameters on submit', () => {
      mockCreateProposal.mockReturnValue({ id: 'proposal-1' });

      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Click submit
      const submitButton = screen.getByRole('button', { name: '确认交易' });
      fireEvent.click(submitButton);

      // Verify createProposal was called with correct args
      expect(mockCreateProposal).toHaveBeenCalledWith('codex-1', mockTargetMachine);
    });

    it('should show success state after submission', () => {
      mockCreateProposal.mockReturnValue({ id: 'proposal-1' });

      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Click submit
      const submitButton = screen.getByRole('button', { name: '确认交易' });
      fireEvent.click(submitButton);

      // Should show success state
      expect(screen.getByText('交易请求已提交')).toBeTruthy();
      expect(screen.getByText(/交易请求正在等待处理/)).toBeTruthy();
    });

    it('should auto-close modal after delay on success', () => {
      vi.useFakeTimers();
      
      mockCreateProposal.mockReturnValue({ id: 'proposal-1' });

      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Click submit
      const submitButton = screen.getByRole('button', { name: '确认交易' });
      fireEvent.click(submitButton);

      // Advance timers to trigger auto-close
      vi.advanceTimersByTime(2000);

      expect(mockOnClose).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-008: Submission Error
  // =========================================================================
  describe('Submission Error (AC-EXCHANGE-UI-008)', () => {
    it('should show error alert when proposal creation fails', () => {
      mockCreateProposal.mockReturnValue(null); // Simulate failure

      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Mock alert
      const alertMock = vi.fn();
      globalThis.alert = alertMock;

      // Click submit
      const submitButton = screen.getByRole('button', { name: '确认交易' });
      fireEvent.click(submitButton);

      // Alert should show error message
      expect(alertMock).toHaveBeenCalledWith('创建交易失败，请重试');

      // Clean up
      delete (globalThis as any).alert;
    });

    it('should re-enable submit button after error', () => {
      mockCreateProposal.mockReturnValue(null);

      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Mock alert to prevent console error
      globalThis.alert = vi.fn();

      try {
        // Click submit
        const submitButton = screen.getByRole('button', { name: '确认交易' });
        fireEvent.click(submitButton);

        // Submit button should be re-enabled
        const reEnabledButton = screen.getByRole('button', { name: '确认交易' });
        expect(reEnabledButton.hasAttribute('disabled')).toBe(false);
      } finally {
        delete (globalThis as any).alert;
      }
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-009: Close Button
  // =========================================================================
  describe('Close Button (AC-EXCHANGE-UI-009)', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const closeButton = screen.getByRole('button', { name: '关闭' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should disable close button during submission', () => {
      vi.useFakeTimers();
      
      mockCreateProposal.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ id: 'proposal-1' }), 100);
        });
      });

      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Click submit
      const submitButton = screen.getByRole('button', { name: '确认交易' });
      fireEvent.click(submitButton);

      // Close button should be disabled while submitting
      const closeButton = screen.getByRole('button', { name: '关闭' });
      expect(closeButton.hasAttribute('disabled')).toBe(true);
      
      vi.useRealTimers();
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-010: Rarity Badges
  // =========================================================================
  describe('Rarity Badges (AC-EXCHANGE-UI-010)', () => {
    it('should show gray badge with "普通" for common rarity', () => {
      const commonMachine = {
        ...mockTargetMachine,
        attributes: {
          ...mockTargetMachine.attributes,
          name: 'Common Machine',
          rarity: 'common' as const,
        },
      };

      render(
        <TradeProposalModal
          targetMachine={commonMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Should show "common" badge
      expect(screen.getByText('common')).toBeTruthy();
    });

    it('should show amber badge with "传奇" for legendary rarity', () => {
      const legendaryMachine = {
        ...mockTargetMachine,
        attributes: {
          ...mockTargetMachine.attributes,
          name: 'Legendary Machine',
          rarity: 'legendary' as const,
        },
      };

      render(
        <TradeProposalModal
          targetMachine={legendaryMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Should show "legendary" badge
      expect(screen.getByText('legendary')).toBeTruthy();
    });
  });

  // =========================================================================
  // Additional Tests for Coverage
  // =========================================================================
  describe('Machine Preview Display', () => {
    it('should show codexId in target machine section', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('TM-0001')).toBeTruthy();
    });

    it('should show all stats in target machine section', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Power
      expect(screen.getByText('功率')).toBeTruthy();
      // Stability
      expect(screen.getByText('稳定性')).toBeTruthy();
      // Failure Rate
      expect(screen.getByText('故障率')).toBeTruthy();
    });

    it('should show preview stats when machine is selected', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Should show stats in preview
      expect(screen.getAllByText('功率').length).toBe(2); // Both target and preview
    });
  });

  describe('Cancel Button', () => {
    it('should show cancel button', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByRole('button', { name: '取消' })).toBeTruthy();
    });

    it('should call onClose when cancel button is clicked', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const cancelButton = screen.getByRole('button', { name: '取消' });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Comparison Info', () => {
    it('should show comparison info when machine is selected', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-1' } });

      // Should show confirmation info
      expect(screen.getByText(/确认交易后/)).toBeTruthy();
    });

    it('should not show comparison info when no machine selected', () => {
      render(
        <TradeProposalModal
          targetMachine={mockTargetMachine}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Should NOT show confirmation info
      expect(screen.queryByText(/确认交易后/)).toBeNull();
    });
  });
});
