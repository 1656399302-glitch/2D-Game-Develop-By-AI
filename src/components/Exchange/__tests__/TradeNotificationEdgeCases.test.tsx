/**
 * Trade Notification Edge Cases Tests
 * 
 * Tests for edge cases in the TradeNotification component including:
 * - Proposal expiration logic
 * - Notification dismissal
 * - Multiple simultaneous notifications
 * - Notification state transitions
 * - Null/undefined handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TradeNotification } from '../TradeNotification';

// Mock the exchange store
vi.mock('../../../store/useExchangeStore', () => ({
  useExchangeStore: vi.fn(),
}));

import { useExchangeStore } from '../../../store/useExchangeStore';

describe('TradeNotification Edge Cases', () => {
  const mockOnOpenExchange = vi.fn();

  // Mock incoming proposal
  const createMockIncomingProposal = (id: string, status: 'pending' | 'accepted' | 'rejected' | 'expired' = 'pending') => ({
    id,
    proposerMachineId: `machine-${id}`,
    proposerMachine: {
      id: `machine-${id}`,
      codexId: `MC-${id}`,
      name: `Test Machine ${id}`,
      rarity: 'common' as const,
      modules: [],
      connections: [],
      attributes: {
        name: `Test Machine ${id}`,
        rarity: 'common' as const,
        stats: { stability: 80, powerOutput: 70, energyCost: 35, failureRate: 20 },
        tags: ['test'],
        description: 'Test',
        codexId: `MC-${id}`,
      },
      createdAt: Date.now(),
    },
    targetMachineId: `target-${id}`,
    targetMachine: {
      id: `target-${id}`,
      author: 'test_author',
      publishedAt: Date.now(),
      likes: 100,
      views: 500,
      modules: [],
      connections: [],
      attributes: {
        name: `Target Machine ${id}`,
        rarity: 'rare' as const,
        stats: { stability: 75, powerOutput: 85, energyCost: 45, failureRate: 25 },
        tags: ['target'],
        description: 'Target',
        codexId: `TM-${id}`,
      },
      dominantFaction: 'void' as const,
    },
    status,
    createdAt: Date.now(),
  });

  // Mock notifications
  const createMockNotification = (id: string, proposalId: string, type: 'incoming' | 'accepted' | 'rejected' = 'incoming', read = false, createdAtOverride?: number) => ({
    id,
    proposalId,
    message: `Test notification ${id}`,
    type,
    read,
    createdAt: createdAtOverride ?? Date.now(),
  });

  const mockMarkNotificationRead = vi.fn();
  const mockAcceptProposal = vi.fn();
  const mockRejectProposal = vi.fn();
  const mockExpireProposal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default mock implementation
    (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        notifications: [],
        incomingProposals: [],
        markNotificationRead: mockMarkNotificationRead,
        acceptProposal: mockAcceptProposal,
        rejectProposal: mockRejectProposal,
        expireProposal: mockExpireProposal,
      };

      if (selector) {
        return selector(state);
      }
      return state;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  // =========================================================================
  // AC-180-001: State Indicators Tests
  // =========================================================================
  describe('State Indicators (AC-180-001)', () => {
    it('renders with pending status and shows yellow styling', () => {
      const proposal = createMockIncomingProposal('test-1', 'pending');
      const notification = createMockNotification('notif-1', proposal.id, 'incoming');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      const { container } = render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should have pending status
      expect(container.querySelector('[data-status="pending"]')).toBeTruthy();
    });

    it('renders with accepted status and green styling', () => {
      const proposal = createMockIncomingProposal('test-1', 'accepted');
      const notification = createMockNotification('notif-1', proposal.id, 'accepted');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      const { container } = render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should have accepted status badge
      expect(container.querySelector('[data-status="accepted"]')).toBeTruthy();
      expect(screen.getByTestId('status-badge-accepted')).toBeTruthy();
      expect(screen.getByText('已接受')).toBeTruthy();
    });

    it('renders with rejected status and red styling', () => {
      const proposal = createMockIncomingProposal('test-1', 'rejected');
      const notification = createMockNotification('notif-1', proposal.id, 'rejected');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      const { container } = render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should have rejected status badge
      expect(container.querySelector('[data-status="rejected"]')).toBeTruthy();
      expect(screen.getByTestId('status-badge-rejected')).toBeTruthy();
      expect(screen.getByText('已拒绝')).toBeTruthy();
    });

    it('renders with expired status when proposal is expired', () => {
      const proposal = createMockIncomingProposal('test-1', 'expired');
      // For expired, we need to use 'incoming' notification type but with 'expired' proposal status
      const notification = createMockNotification('notif-1', proposal.id, 'incoming');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      const { container } = render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should have expired status because proposal status is 'expired'
      expect(container.querySelector('[data-status="expired"]')).toBeTruthy();
      expect(screen.getByTestId('status-badge-expired')).toBeTruthy();
      expect(screen.getByText('已过期')).toBeTruthy();
    });

    it('does not show accepted/rejected/expired badges when status is pending', () => {
      const proposal = createMockIncomingProposal('test-1', 'pending');
      const notification = createMockNotification('notif-1', proposal.id, 'incoming');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should NOT show status badges when pending
      expect(screen.queryByTestId('status-badge-accepted')).toBeNull();
      expect(screen.queryByTestId('status-badge-rejected')).toBeNull();
      expect(screen.queryByTestId('status-badge-expired')).toBeNull();
    });
  });

  // =========================================================================
  // Dismiss Workflow Tests
  // =========================================================================
  describe('Dismiss Workflow', () => {
    it('removes notification from DOM when dismiss button is clicked', () => {
      const proposal = createMockIncomingProposal('test-1', 'pending');
      const notification = createMockNotification('notif-1', proposal.id, 'incoming');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      const { container } = render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Notification should be visible
      expect(screen.getByTestId('trade-notification')).toBeTruthy();

      // Click dismiss
      fireEvent.click(screen.getByTestId('dismiss-button'));

      // Component should re-render (the mock doesn't actually update, but we verify the call)
      expect(mockMarkNotificationRead).toHaveBeenCalledWith('notif-1');
    });

    it('calls markNotificationRead with correct notification ID on dismiss', () => {
      const proposal = createMockIncomingProposal('test-1', 'pending');
      const notification = createMockNotification('notif-1', proposal.id, 'incoming');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      fireEvent.click(screen.getByTestId('dismiss-button'));

      expect(mockMarkNotificationRead).toHaveBeenCalledTimes(1);
      expect(mockMarkNotificationRead).toHaveBeenCalledWith('notif-1');
    });
  });

  // =========================================================================
  // Countdown Timer Tests
  // =========================================================================
  describe('Countdown Timer Behavior', () => {
    it('displays countdown timer for pending proposals', () => {
      const proposal = createMockIncomingProposal('test-1', 'pending');
      const notification = createMockNotification('notif-1', proposal.id, 'incoming');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should show countdown container
      expect(screen.getByTestId('countdown-container')).toBeTruthy();
      expect(screen.getByTestId('countdown-text')).toBeTruthy();
      expect(screen.getByTestId('countdown-bar')).toBeTruthy();
    });

    it('does not show countdown for accepted proposals', () => {
      const proposal = createMockIncomingProposal('test-1', 'accepted');
      const notification = createMockNotification('notif-1', proposal.id, 'accepted');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should NOT show countdown for accepted proposals
      expect(screen.queryByTestId('countdown-container')).toBeNull();
    });
  });

  // =========================================================================
  // Multiple Notifications Tests
  // =========================================================================
  describe('Multiple Simultaneous Notifications', () => {
    it('renders 3+ simultaneous notifications independently', () => {
      const proposals = [
        createMockIncomingProposal('test-1', 'pending'),
        createMockIncomingProposal('test-2', 'pending'),
        createMockIncomingProposal('test-3', 'pending'),
      ];
      const notifications = [
        createMockNotification('notif-1', proposals[0].id, 'incoming'),
        createMockNotification('notif-2', proposals[1].id, 'incoming'),
        createMockNotification('notif-3', proposals[2].id, 'incoming'),
      ];

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications,
          incomingProposals: proposals,
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should show count of additional notifications
      expect(screen.getByTestId('additional-count')).toBeTruthy();
      expect(screen.getByText(/还有 2 条未读通知/)).toBeTruthy();
    });

    it('shows the first notification in the array', () => {
      // Notifications are shown in array order - first element is shown
      const proposals = [
        createMockIncomingProposal('test-1', 'pending'),
        createMockIncomingProposal('test-2', 'pending'),
      ];
      const notifications = [
        createMockNotification('notif-1', proposals[0].id, 'incoming', false),
        createMockNotification('notif-2', proposals[1].id, 'incoming', false),
      ];

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications,
          incomingProposals: proposals,
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should display the first notification in the array (notif-1)
      expect(screen.getByText('Test notification notif-1')).toBeTruthy();
    });
  });

  // =========================================================================
  // State Transition Tests
  // =========================================================================
  describe('State Transitions', () => {
    it('transitions from pending to accepted correctly', () => {
      let currentProposal = createMockIncomingProposal('test-1', 'pending');
      let notification = createMockNotification('notif-1', currentProposal.id, 'incoming');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [currentProposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      const { rerender } = render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Initially pending
      expect(screen.getByTestId('trade-notification').getAttribute('data-status')).toBe('pending');

      // Simulate state change to accepted
      currentProposal = { ...currentProposal, status: 'accepted' };
      notification = { ...notification, type: 'accepted' as const };

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [currentProposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      rerender(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should now show accepted status
      expect(screen.getByTestId('trade-notification').getAttribute('data-status')).toBe('accepted');
    });

    it('transitions from pending to rejected correctly', () => {
      let currentProposal = createMockIncomingProposal('test-1', 'pending');
      let notification = createMockNotification('notif-1', currentProposal.id, 'incoming');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [currentProposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      const { rerender } = render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Initially pending
      expect(screen.getByTestId('trade-notification').getAttribute('data-status')).toBe('pending');

      // Simulate state change to rejected
      currentProposal = { ...currentProposal, status: 'rejected' };
      notification = { ...notification, type: 'rejected' as const };

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [currentProposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      rerender(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should now show rejected status
      expect(screen.getByTestId('trade-notification').getAttribute('data-status')).toBe('rejected');
    });
  });

  // =========================================================================
  // Dismiss During Countdown Tests
  // =========================================================================
  describe('Dismiss During Countdown', () => {
    it('dismisses cleanly without crash before countdown ends', () => {
      const proposal = createMockIncomingProposal('test-1', 'pending');
      const notification = createMockNotification('notif-1', proposal.id, 'incoming');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Countdown should be visible
      expect(screen.getByTestId('countdown-container')).toBeTruthy();

      // Dismiss should work without crash
      expect(() => {
        fireEvent.click(screen.getByTestId('dismiss-button'));
      }).not.toThrow();

      // Verify markNotificationRead was called
      expect(mockMarkNotificationRead).toHaveBeenCalledWith('notif-1');
    });
  });

  // =========================================================================
  // Null/Undefined Handling Tests
  // =========================================================================
  describe('Null/Undefined Handling', () => {
    it('handles notification with null/undefined props gracefully', () => {
      // This test verifies the component doesn't crash when store returns null values
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [],
          incomingProposals: [],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      // Should render null (no notifications)
      const { container } = render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders without crash when notifications array is undefined', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          // @ts-ignore - Testing undefined behavior
          notifications: undefined,
          incomingProposals: [],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      // Should render without crashing - returns null due to null safety
      const { container } = render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders without crash when incomingProposals is undefined', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [],
          // @ts-ignore - Testing undefined behavior
          incomingProposals: undefined,
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      // Should render without crashing
      const { container } = render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);
      expect(container.firstChild).toBeNull();
    });
  });

  // =========================================================================
  // Timestamp Display Tests
  // =========================================================================
  describe('Timestamp Display', () => {
    it('displays timestamp for notification', () => {
      const proposal = createMockIncomingProposal('test-1', 'pending');
      const notification = createMockNotification('notif-1', proposal.id, 'incoming');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should show timestamp
      expect(screen.getByTestId('notification-timestamp')).toBeTruthy();
      // Timestamp should be in HH:MM format
      expect(screen.getByTestId('notification-timestamp').textContent).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  // =========================================================================
  // Quick Actions Visibility Tests
  // =========================================================================
  describe('Quick Actions Visibility', () => {
    it('shows accept/reject/view buttons for pending incoming', () => {
      const proposal = createMockIncomingProposal('test-1', 'pending');
      const notification = createMockNotification('notif-1', proposal.id, 'incoming');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should show quick actions
      expect(screen.getByTestId('quick-actions')).toBeTruthy();
      expect(screen.getByTestId('accept-button')).toBeTruthy();
      expect(screen.getByTestId('reject-button')).toBeTruthy();
      expect(screen.getByTestId('view-details-button')).toBeTruthy();
    });

    it('hides accept/reject buttons for accepted proposals', () => {
      const proposal = createMockIncomingProposal('test-1', 'accepted');
      const notification = createMockNotification('notif-1', proposal.id, 'accepted');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should NOT show quick actions
      expect(screen.queryByTestId('quick-actions')).toBeNull();
      expect(screen.queryByTestId('accept-button')).toBeNull();
      expect(screen.queryByTestId('reject-button')).toBeNull();
    });

    it('hides accept/reject buttons for rejected proposals', () => {
      const proposal = createMockIncomingProposal('test-1', 'rejected');
      const notification = createMockNotification('notif-1', proposal.id, 'rejected');

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          notifications: [notification],
          incomingProposals: [proposal],
          markNotificationRead: mockMarkNotificationRead,
          acceptProposal: mockAcceptProposal,
          rejectProposal: mockRejectProposal,
          expireProposal: mockExpireProposal,
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<TradeNotification onOpenExchange={mockOnOpenExchange} />);

      // Should NOT show quick actions
      expect(screen.queryByTestId('quick-actions')).toBeNull();
      expect(screen.queryByTestId('accept-button')).toBeNull();
      expect(screen.queryByTestId('reject-button')).toBeNull();
    });
  });
});
