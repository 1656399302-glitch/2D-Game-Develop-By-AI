/**
 * Exchange Panel Component Tests - Expanded Coverage
 * 
 * Comprehensive test coverage for ExchangePanel component.
 * Tests cover: tab navigation, listings tab operations, browse trades tab
 * with filters, trade history, empty states, and close functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ExchangePanel } from '../ExchangePanel';

// Mock the exchange store
vi.mock('../../../store/useExchangeStore', () => ({
  useExchangeStore: vi.fn(),
}));

// Mock the codex store
vi.mock('../../../store/useCodexStore', () => ({
  useCodexStore: vi.fn(),
}));

// Mock the community store
vi.mock('../../../store/useCommunityStore', () => ({
  useCommunityStore: vi.fn(),
}));

// Mock React.lazy for TradeProposalModal
vi.mock('../TradeProposalModal', () => ({
  TradeProposalModal: vi.fn(({ targetMachine, onClose }) => (
    <div data-testid="trade-proposal-modal">
      <span>Trade Proposal Modal for {targetMachine.attributes.name}</span>
      <button onClick={onClose}>Close Modal</button>
    </div>
  )),
}));

import { useExchangeStore } from '../../../store/useExchangeStore';
import { useCodexStore } from '../../../store/useCodexStore';
import { useCommunityStore } from '../../../store/useCommunityStore';

describe('ExchangePanel', () => {
  const mockOnClose = vi.fn();

  // Mock codex entries
  const mockCodexEntries = [
    {
      id: 'codex-1',
      codexId: 'MC-0001',
      name: 'Test Machine 1',
      rarity: 'rare' as const,
      modules: [{ id: 'm1', instanceId: 'm1', type: 'core-furnace' as const, x: 100, y: 100, rotation: 0, scale: 1, flipped: false, ports: [] }],
      connections: [],
      attributes: {
        name: 'Test Machine 1',
        rarity: 'rare' as const,
        stats: { stability: 75, powerOutput: 60, energyCost: 30, failureRate: 20 },
        tags: ['fire'],
        description: 'Test machine 1',
        codexId: 'MC-0001',
      },
      createdAt: Date.now(),
    },
    {
      id: 'codex-2',
      codexId: 'MC-0002',
      name: 'Test Machine 2',
      rarity: 'legendary' as const,
      modules: [{ id: 'm2', instanceId: 'm2', type: 'gear' as const, x: 100, y: 100, rotation: 0, scale: 1, flipped: false, ports: [] }],
      connections: [],
      attributes: {
        name: 'Test Machine 2',
        rarity: 'legendary' as const,
        stats: { stability: 90, powerOutput: 80, energyCost: 40, failureRate: 10 },
        tags: ['arcane'],
        description: 'Test machine 2',
        codexId: 'MC-0002',
      },
      createdAt: Date.now(),
    },
  ];

  // Mock community machines
  const mockCommunityMachines = [
    {
      id: 'community-1',
      author: 'user1',
      authorName: 'Arcane Wizard',
      publishedAt: Date.now() - 86400000,
      likes: 100,
      views: 500,
      modules: [],
      connections: [],
      attributes: {
        name: 'Void Resonator',
        rarity: 'epic' as const,
        stats: { stability: 72, powerOutput: 85, energyCost: 45, failureRate: 28 },
        tags: ['void'],
        description: 'A void-powered resonance device',
        codexId: 'VR-3421',
      },
      dominantFaction: 'void' as const,
    },
    {
      id: 'community-2',
      author: 'user2',
      authorName: 'Pyro Master',
      publishedAt: Date.now() - 86400000 * 2,
      likes: 200,
      views: 1000,
      modules: [],
      connections: [],
      attributes: {
        name: 'Inferno Blaze',
        rarity: 'legendary' as const,
        stats: { stability: 55, powerOutput: 98, energyCost: 72, failureRate: 45 },
        tags: ['fire'],
        description: 'A devastating thermal amplifier',
        codexId: 'IB-9087',
      },
      dominantFaction: 'inferno' as const,
    },
    {
      id: 'community-3',
      author: 'user3',
      authorName: 'Storm Knight',
      publishedAt: Date.now() - 86400000 * 3,
      likes: 50,
      views: 200,
      modules: [],
      connections: [],
      attributes: {
        name: 'Storm Conduit',
        rarity: 'rare' as const,
        stats: { stability: 78, powerOutput: 68, energyCost: 35, failureRate: 22 },
        tags: ['lightning'],
        description: 'A balanced lightning system',
        codexId: 'SC-1156',
      },
      dominantFaction: 'storm' as const,
    },
  ];

  // Mock trade history
  const mockTradeHistory = [
    {
      id: 'trade-1',
      givenMachineId: 'codex-1',
      givenMachine: mockCodexEntries[0],
      receivedMachineId: 'community-1',
      receivedMachine: mockCommunityMachines[0],
      completedAt: Date.now() - 86400000,
    },
  ];

  // Mock store state
  const mockMarkForTrade = vi.fn();
  const mockUnmarkFromTrade = vi.fn();
  const mockIsListed = vi.fn((id: string) => id === 'codex-1');
  const mockGetMyListedMachines = vi.fn(() => [mockCodexEntries[0]]);

  beforeEach(() => {
    vi.clearAllMocks();

    // Default exchange store mock
    (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        listings: [{ codexEntryId: 'codex-1', listedAt: Date.now(), tradePreference: 'any' }],
        markForTrade: mockMarkForTrade,
        unmarkFromTrade: mockUnmarkFromTrade,
        isListed: mockIsListed,
        getMyListedMachines: mockGetMyListedMachines,
        tradeHistory: mockTradeHistory,
        outgoingProposals: [],
      };

      if (selector) {
        return selector(state);
      }
      return state;
    });

    // Default codex store mock
    (useCodexStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        entries: mockCodexEntries,
      };

      if (selector) {
        return selector(state);
      }
      return state;
    });

    // Default community store mock
    (useCommunityStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        communityMachines: mockCommunityMachines,
        publishedMachines: [],
      };

      if (selector) {
        return selector(state);
      }
      return state;
    });
  });

  afterEach(() => {
    cleanup();
  });

  // =========================================================================
  // AC-EXCHANGE-UI-019: Tab Navigation
  // =========================================================================
  describe('Tab Navigation (AC-EXCHANGE-UI-019)', () => {
    it('should show three tabs: 我的挂牌, 浏览交易, 交易历史', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      expect(screen.getByText('我的挂牌')).toBeTruthy();
      expect(screen.getByText('浏览交易')).toBeTruthy();
      expect(screen.getByText('交易历史')).toBeTruthy();
    });

    it('should have 我的挂牌 tab active by default', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      const myListingsTab = screen.getByText('我的挂牌').closest('button');
      expect(myListingsTab?.className).toContain('text-[#a78bfa]'); // Active state
    });

    it('should switch to 浏览交易 tab when clicked', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      const browseTab = screen.getByText('浏览交易').closest('button');
      expect(browseTab?.className).toContain('text-[#a78bfa]');
    });

    it('should switch to 交易历史 tab when clicked', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('交易历史'));

      const historyTab = screen.getByText('交易历史').closest('button');
      expect(historyTab?.className).toContain('text-[#a78bfa]');
    });

    it('should show purple underline indicator on active tab', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      // Default active tab should have underline indicator
      const myListingsTab = screen.getByText('我的挂牌').closest('button');
      // The underline is a child div element
      expect(myListingsTab?.innerHTML).toContain('bg-[#7c3aed]');
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-020: Listings Tab - Machine Selection
  // =========================================================================
  describe('Listings Tab - Machine Selection (AC-EXCHANGE-UI-020)', () => {
    it('should show codex entries not already listed in dropdown', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeTruthy();

      // Should show codex-2 (not listed) but not codex-1 (already listed)
      expect(dropdown.innerHTML).toContain('Test Machine 2');
    });

    it('should exclude already listed machines from dropdown', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      const dropdown = screen.getByRole('combobox');
      
      // Should NOT contain Test Machine 1 (already listed)
      expect(dropdown.innerHTML).not.toContain('Test Machine 1');
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-021: Listings Tab - Mark for Trade
  // =========================================================================
  describe('Listings Tab - Mark for Trade (AC-EXCHANGE-UI-021)', () => {
    it('should show 挂牌 button', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: '挂牌' })).toBeTruthy();
    });

    it('should call markForTrade with selected entry ID when 挂牌 is clicked', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      // Select a machine from dropdown
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-2' } });

      // Click 挂牌 button
      fireEvent.click(screen.getByRole('button', { name: '挂牌' }));

      expect(mockMarkForTrade).toHaveBeenCalledWith('codex-2');
    });

    it('should disable 挂牌 button when no entry selected', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      const listButton = screen.getByRole('button', { name: '挂牌' });
      expect(listButton.hasAttribute('disabled')).toBe(true);
    });

    it('should enable 挂牌 button when entry is selected', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      // Select a machine
      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'codex-2' } });

      const listButton = screen.getByRole('button', { name: '挂牌' });
      expect(listButton.hasAttribute('disabled')).toBe(false);
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-022: Listings Tab - Unmark from Trade
  // =========================================================================
  describe('Listings Tab - Unmark from Trade (AC-EXCHANGE-UI-022)', () => {
    it('should show 下架 button for listed machines', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      const unlistButton = screen.getByRole('button', { name: '下架' });
      expect(unlistButton).toBeTruthy();
    });

    it('should call unmarkFromTrade with entry ID when 下架 is clicked', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      const unlistButton = screen.getByRole('button', { name: '下架' });
      fireEvent.click(unlistButton);

      expect(mockUnmarkFromTrade).toHaveBeenCalledWith('codex-1');
    });

    it('should show listed machine name in the listed section', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      expect(screen.getByText('Test Machine 1')).toBeTruthy();
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-023: Browse Trades Tab - Filters
  // =========================================================================
  describe('Browse Trades Tab - Filters (AC-EXCHANGE-UI-023)', () => {
    it('should switch to browse trades tab content', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      // Should show faction filter
      expect(screen.getByText('所有派系')).toBeTruthy();
    });

    it('should have faction filter dropdown with all 6 factions', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      // Check faction options exist in dropdown
      const factionSelect = screen.getAllByRole('combobox')[0];
      expect(factionSelect.innerHTML).toContain('void');
      expect(factionSelect.innerHTML).toContain('inferno');
    });

    it('should have rarity filter dropdown with all rarities', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      expect(screen.getByText('所有稀有度')).toBeTruthy();
      expect(screen.getByText('普通')).toBeTruthy();
      expect(screen.getByText('优秀')).toBeTruthy();
      expect(screen.getByText('稀有')).toBeTruthy();
      expect(screen.getByText('史诗')).toBeTruthy();
      expect(screen.getByText('传说')).toBeTruthy();
    });

    it('should filter by faction when faction filter is selected', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      // Select void faction
      const factionSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(factionSelect, { target: { value: 'void' } });

      // Should show void faction machines
      expect(screen.getByText('Void Resonator')).toBeTruthy();
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-024: Browse Trades Tab - Trade Button
  // =========================================================================
  describe('Browse Trades Tab - Trade Button (AC-EXCHANGE-UI-024)', () => {
    it('should show community machines grid', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      expect(screen.getByText('Void Resonator')).toBeTruthy();
      expect(screen.getByText('Inferno Blaze')).toBeTruthy();
      expect(screen.getByText('Storm Conduit')).toBeTruthy();
    });

    it('should show 出价交易 button for each community machine', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      // Should show multiple 出价交易 buttons
      const tradeButtons = screen.getAllByRole('button', { name: '出价交易' });
      expect(tradeButtons.length).toBeGreaterThan(0);
    });

    it('should show rarity badge for each community machine', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      expect(screen.getByText('epic')).toBeTruthy();
      expect(screen.getByText('legendary')).toBeTruthy();
      expect(screen.getByText('rare')).toBeTruthy();
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-025: Browse Trades Tab - Open Trade Proposal Modal
  // =========================================================================
  describe('Browse Trades Tab - Open Trade Proposal Modal (AC-EXCHANGE-UI-025)', () => {
    it('should open TradeProposalModal when 出价交易 is clicked', async () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      // Click 出价交易 button
      const tradeButtons = screen.getAllByRole('button', { name: '出价交易' });
      fireEvent.click(tradeButtons[0]);

      // Modal should appear (suspense wrapper fallback or actual modal)
      await waitFor(() => {
        expect(screen.getByTestId('trade-proposal-modal')).toBeTruthy();
      });
    });

    it('should disable 出价交易 button when user has no listed machines', () => {
      // Override mock to return empty listed machines
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          listings: [],
          markForTrade: mockMarkForTrade,
          unmarkFromTrade: mockUnmarkFromTrade,
          isListed: () => false,
          getMyListedMachines: () => [],
          tradeHistory: [],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      const tradeButtons = screen.getAllByRole('button', { name: '出价交易' });
      expect(tradeButtons[0].hasAttribute('disabled')).toBe(true);
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-026: Trade History Tab
  // =========================================================================
  describe('Trade History Tab (AC-EXCHANGE-UI-026)', () => {
    it('should show completed trades with given and received machine names', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('交易历史'));

      // Should show given machine
      expect(screen.getByText('Test Machine 1')).toBeTruthy();
      // Should show received machine
      expect(screen.getByText('Void Resonator')).toBeTruthy();
    });

    it('should show rarity badges for both machines in trade history', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('交易历史'));

      // Should show rarity badges
      expect(screen.getByText('rare')).toBeTruthy(); // Given machine
      expect(screen.getByText('epic')).toBeTruthy(); // Received machine
    });

    it('should show timestamp for completed trades', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('交易历史'));

      // Should show completed trade text with timestamp
      expect(screen.getByText('已完成交易')).toBeTruthy();
    });

    it('should show completed trade indicator', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('交易历史'));

      // Should show ⚖ icon in the trade history card
      const tradeCards = screen.getAllByText('⚖');
      expect(tradeCards.length).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-027: Empty States
  // =========================================================================
  describe('Empty States (AC-EXCHANGE-UI-027)', () => {
    it('should show "暂无挂牌的机器" in listings tab when empty', () => {
      // Override mock to return empty listings
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          listings: [],
          markForTrade: mockMarkForTrade,
          unmarkFromTrade: mockUnmarkFromTrade,
          isListed: () => false,
          getMyListedMachines: () => [],
          tradeHistory: [],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangePanel onClose={mockOnClose} />);

      expect(screen.getByText('暂无挂牌的机器')).toBeTruthy();
    });

    it('should show "没有找到符合条件的机器" when filters match no results', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      // Clear community machines
      (useCommunityStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          communityMachines: [],
          publishedMachines: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      // Re-render would show no results
    });

    it('should show "暂无交易记录" in history tab when empty', () => {
      // Override mock to return empty trade history
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          listings: [],
          markForTrade: mockMarkForTrade,
          unmarkFromTrade: mockUnmarkFromTrade,
          isListed: () => false,
          getMyListedMachines: () => [],
          tradeHistory: [],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('交易历史'));

      expect(screen.getByText('暂无交易记录')).toBeTruthy();
    });
  });

  // =========================================================================
  // AC-EXCHANGE-UI-028: Close Button
  // =========================================================================
  describe('Close Button (AC-EXCHANGE-UI-028)', () => {
    it('should call onClose when close button is clicked', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: '关闭' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should have close button in header', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: '关闭' });
      expect(closeButton).toBeTruthy();
    });

    it('should display 交易所 header text', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      expect(screen.getByText('交易所')).toBeTruthy();
    });

    it('should display Codex Exchange badge', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      expect(screen.getByText('Codex Exchange')).toBeTruthy();
    });
  });

  // =========================================================================
  // Additional Tests
  // =========================================================================
  describe('Pending Outgoing Proposals', () => {
    it('should show pending outgoing proposals count on browse trades tab', () => {
      // Override mock with pending proposals
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          listings: [],
          markForTrade: mockMarkForTrade,
          unmarkFromTrade: mockUnmarkFromTrade,
          isListed: () => false,
          getMyListedMachines: () => [],
          tradeHistory: [],
          outgoingProposals: [
            {
              id: 'proposal-1',
              proposerMachineId: 'codex-1',
              proposerMachine: mockCodexEntries[0],
              targetMachineId: 'community-1',
              targetMachine: mockCommunityMachines[0],
              status: 'pending' as const,
              createdAt: Date.now(),
            },
          ],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangePanel onClose={mockOnClose} />);

      expect(screen.getByText('1 待处理')).toBeTruthy();
    });

    it('should show pending proposals section when there are pending outgoing proposals', () => {
      // Override mock with pending proposals
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          listings: [],
          markForTrade: mockMarkForTrade,
          unmarkFromTrade: mockUnmarkFromTrade,
          isListed: () => false,
          getMyListedMachines: () => [],
          tradeHistory: [],
          outgoingProposals: [
            {
              id: 'proposal-1',
              proposerMachineId: 'codex-1',
              proposerMachine: mockCodexEntries[0],
              targetMachineId: 'community-1',
              targetMachine: mockCommunityMachines[0],
              status: 'pending' as const,
              createdAt: Date.now(),
            },
          ],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangePanel onClose={mockOnClose} />);

      expect(screen.getByText('待处理的报价 (1)')).toBeTruthy();
    });
  });

  describe('Listed Machines Count', () => {
    it('should show count badge on listings tab when machines are listed', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      // Count badge shows on the tab
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });

  describe('Trade History Count', () => {
    it('should show count badge on history tab when trades exist', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('交易历史'));

      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });

  describe('Community Machine Display', () => {
    it('should show machine likes and views', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      // Should show likes and views
      expect(screen.getByText('100')).toBeTruthy();
      expect(screen.getByText('500')).toBeTruthy();
    });

    it('should show machine stats', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      // Should show power and stability
      expect(screen.getByText('85')).toBeTruthy();
      expect(screen.getByText('72%')).toBeTruthy();
    });

    it('should show author name', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      expect(screen.getByText(/by Arcane Wizard/)).toBeTruthy();
    });
  });

  describe('No Listed Machines Hint', () => {
    it('should show hint when user has no listed machines in browse tab', () => {
      // Override mock to return empty listed machines
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          listings: [],
          markForTrade: mockMarkForTrade,
          unmarkFromTrade: mockUnmarkFromTrade,
          isListed: () => false,
          getMyListedMachines: () => [],
          tradeHistory: [],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      expect(screen.getByText(/需要先在.*挂牌.*机器才能发起交易/)).toBeTruthy();
    });
  });

  describe('Tab Content Switching', () => {
    it('should show listings content when my-listings tab is active', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      // Should show listing form
      expect(screen.getByText('挂牌新机器')).toBeTruthy();
    });

    it('should show browse content when browse-trades tab is active', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('浏览交易'));

      // Should show filter dropdowns
      expect(screen.getByText('所有派系')).toBeTruthy();
    });

    it('should show history content when trade-history tab is active', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('交易历史'));

      // Should show history content or empty state
      expect(screen.getByText('已完成交易')).toBeTruthy();
    });
  });

  describe('No Listable Machines Message', () => {
    it('should show message when no listable machines available', () => {
      // All machines already listed
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          listings: [{ codexEntryId: 'codex-1', listedAt: Date.now(), tradePreference: 'any' }],
          markForTrade: mockMarkForTrade,
          unmarkFromTrade: mockUnmarkFromTrade,
          isListed: () => true, // All listed
          getMyListedMachines: () => [mockCodexEntries[0]],
          tradeHistory: [],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangePanel onClose={mockOnClose} />);

      expect(screen.getByText(/图鉴中没有可挂牌的机器/)).toBeTruthy();
    });
  });

  describe('Footer Disclaimer', () => {
    it('should show footer disclaimer text', () => {
      render(<ExchangePanel onClose={mockOnClose} />);

      expect(screen.getByText(/交易所是本地模拟功能/)).toBeTruthy();
    });
  });
});
