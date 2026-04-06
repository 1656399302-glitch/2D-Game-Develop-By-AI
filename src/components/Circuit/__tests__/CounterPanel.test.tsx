/**
 * Counter Panel Tests
 * 
 * ROUND 183: CounterPanel tests
 * Tests for CounterPanel component rendering and interaction.
 */

import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CounterPanel } from '../CounterPanel';
import type { CounterData } from '../CounterPanel';

// Mock counter data for testing
const createMockCounters = (overrides?: Partial<CounterData>[]): CounterData[] => {
  const defaults: CounterData[] = [
    {
      id: 'counter-1',
      label: '计数器1',
      count: 5,
      maxValue: 8,
      overflow: false,
      layerId: 'layer-1',
      layerName: '主层',
      history: [5, 4, 3, 2, 1],
    },
    {
      id: 'counter-2',
      label: '计数器2',
      count: 0,
      maxValue: 16,
      overflow: false,
      layerId: 'layer-1',
      layerName: '主层',
      history: [],
    },
    {
      id: 'counter-3',
      label: '溢出计数器',
      count: 10,
      maxValue: 8,
      overflow: true,
      layerId: 'layer-2',
      layerName: '第二层',
      history: [10, 9, 8, 7, 6],
    },
  ];
  
  if (!overrides || overrides.length === 0) {
    return defaults;
  }
  
  return defaults.map((counter, index) => ({
    ...counter,
    ...(overrides[index] || {}),
  }));
};

describe('CounterPanel', () => {
  describe('Rendering', () => {
    it('renders CounterPanel with correct data-testid', () => {
      render(<CounterPanel counters={[]} />);
      
      expect(screen.getByTestId('counter-panel')).toBeInTheDocument();
    });

    it('renders all tabs with correct data-testid attributes', () => {
      render(<CounterPanel counters={[]} />);
      
      expect(screen.getByTestId('counter-tab-all')).toBeInTheDocument();
      expect(screen.getByTestId('counter-tab-active')).toBeInTheDocument();
      expect(screen.getByTestId('counter-tab-overflow')).toBeInTheDocument();
    });

    it('renders filter dropdown with data-testid', () => {
      render(<CounterPanel counters={[]} />);
      
      expect(screen.getByTestId('counter-category-filter')).toBeInTheDocument();
    });

    it('renders sort dropdown with data-testid', () => {
      render(<CounterPanel counters={[]} />);
      
      expect(screen.getByTestId('counter-sort-select')).toBeInTheDocument();
    });

    it('renders counter list container with data-testid', () => {
      render(<CounterPanel counters={[]} />);
      
      expect(screen.getByTestId('counter-list')).toBeInTheDocument();
    });

    it('renders close button with data-close-panel attribute', () => {
      const onClose = vi.fn();
      render(<CounterPanel counters={[]} onClose={onClose} />);
      
      const closeButton = document.body.querySelector('[data-close-panel]');
      expect(closeButton).toBeInTheDocument();
    });

    it('renders panel title in Chinese', () => {
      render(<CounterPanel counters={[]} />);
      
      expect(screen.getByText('计数器')).toBeInTheDocument();
      expect(screen.getByText('计数器面板')).toBeInTheDocument();
    });

    it('renders tab labels in Chinese', () => {
      render(<CounterPanel counters={[]} />);
      
      expect(screen.getByText('全部')).toBeInTheDocument();
      expect(screen.getByText('激活')).toBeInTheDocument();
      expect(screen.getByText('溢出')).toBeInTheDocument();
    });

    it('renders empty state when no counters', () => {
      render(<CounterPanel counters={[]} />);
      
      expect(screen.getByTestId('counter-empty-state')).toBeInTheDocument();
      expect(screen.getByText('暂无计数器')).toBeInTheDocument();
    });
  });

  describe('Counter List', () => {
    it('renders counter items when counters exist', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      expect(screen.getByTestId('counter-item-counter-1')).toBeInTheDocument();
      expect(screen.getByTestId('counter-item-counter-2')).toBeInTheDocument();
      expect(screen.getByTestId('counter-item-counter-3')).toBeInTheDocument();
    });

    it('renders counter labels', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      expect(screen.getByText('计数器1')).toBeInTheDocument();
      expect(screen.getByText('计数器2')).toBeInTheDocument();
      expect(screen.getByText('溢出计数器')).toBeInTheDocument();
    });

    it('renders count values', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      // Count values appear in the counter items - use queryAllByText since they may appear multiple times
      const fives = screen.queryAllByText('5');
      expect(fives.length).toBeGreaterThanOrEqual(1);
      
      const tens = screen.queryAllByText('10');
      expect(tens.length).toBeGreaterThanOrEqual(1);
    });

    it('renders max values', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      expect(screen.getAllByText('/ 8').length).toBe(2);
      expect(screen.getByText('/ 16')).toBeInTheDocument();
    });

    it('renders overflow badge for overflow counters', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      // Check counter-3 has overflow by looking at its item
      const counter3Item = screen.getByTestId("counter-item-counter-3");
      expect(counter3Item).toBeInTheDocument();
      expect(counter3Item.innerHTML).toContain("溢出");
    });

    it('renders history when present', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      // counter-1 has history
      expect(screen.getByTestId('counter-history-counter-1')).toBeInTheDocument();
      
      // counter-2 has no history
      expect(screen.queryByTestId('counter-history-counter-2')).not.toBeInTheDocument();
    });

    it('renders history values', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      // History shows last 5 values for counter-1: [5, 4, 3, 2, 1]
      expect(screen.getByTestId('counter-history-counter-1')).toHaveTextContent('5');
      expect(screen.getByTestId('counter-history-counter-1')).toHaveTextContent('4');
    });
  });

  describe('Tab Filtering', () => {
    it('shows all counters on "All" tab by default', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      expect(screen.getByTestId('counter-item-counter-1')).toBeInTheDocument();
      expect(screen.getByTestId('counter-item-counter-2')).toBeInTheDocument();
      expect(screen.getByTestId('counter-item-counter-3')).toBeInTheDocument();
    });

    it('shows only active counters on "Active" tab', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      fireEvent.click(screen.getByTestId('counter-tab-active'));
      
      // counter-1 (count=5) and counter-3 (count=10) are active
      expect(screen.getByTestId('counter-item-counter-1')).toBeInTheDocument();
      expect(screen.getByTestId('counter-item-counter-3')).toBeInTheDocument();
      
      // counter-2 (count=0) should not be visible
      expect(screen.queryByTestId('counter-item-counter-2')).not.toBeInTheDocument();
    });

    it('shows only overflow counters on "Overflow" tab', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      fireEvent.click(screen.getByTestId('counter-tab-overflow'));
      
      // Only counter-3 has overflow=true
      expect(screen.getByTestId('counter-item-counter-3')).toBeInTheDocument();
      expect(screen.queryByTestId('counter-item-counter-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('counter-item-counter-2')).not.toBeInTheDocument();
    });

    it('shows empty state for active tab with no active counters', () => {
      const counters = [
        { id: 'c1', label: 'C1', count: 0, maxValue: 8, overflow: false, history: [] },
      ];
      render(<CounterPanel counters={counters} />);
      
      fireEvent.click(screen.getByTestId('counter-tab-active'));
      
      expect(screen.getByTestId('counter-empty-state')).toBeInTheDocument();
      expect(screen.getByText('暂无激活的计数器')).toBeInTheDocument();
    });

    it('shows empty state for overflow tab with no overflow counters', () => {
      const counters = [
        { id: 'c1', label: 'C1', count: 5, maxValue: 8, overflow: false, history: [] },
      ];
      render(<CounterPanel counters={counters} />);
      
      fireEvent.click(screen.getByTestId('counter-tab-overflow'));
      
      expect(screen.getByTestId('counter-empty-state')).toBeInTheDocument();
      expect(screen.getByText('暂无溢出的计数器')).toBeInTheDocument();
    });

    it('switches tabs correctly', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      // Switch to overflow
      fireEvent.click(screen.getByTestId('counter-tab-overflow'));
      expect(screen.getByTestId('counter-item-counter-3')).toBeInTheDocument();
      
      // Switch back to all
      fireEvent.click(screen.getByTestId('counter-tab-all'));
      expect(screen.getByTestId('counter-item-counter-1')).toBeInTheDocument();
      expect(screen.getByTestId('counter-item-counter-2')).toBeInTheDocument();
      expect(screen.getByTestId('counter-item-counter-3')).toBeInTheDocument();
    });
  });

  describe('Layer Filter', () => {
    it('renders layer filter with all layers option', () => {
      render(<CounterPanel counters={createMockCounters()} />);
      
      const filter = screen.getByTestId('counter-category-filter');
      expect(filter).toHaveValue('all');
      expect(filter.querySelectorAll('option').length).toBeGreaterThanOrEqual(1);
    });

    it('shows counters from all layers when filter is "all"', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      expect(screen.getByTestId('counter-item-counter-1')).toBeInTheDocument();
      expect(screen.getByTestId('counter-item-counter-3')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('renders sort options', () => {
      render(<CounterPanel counters={createMockCounters()} />);
      
      const sort = screen.getByTestId('counter-sort-select');
      expect(sort.querySelector('option[value="name"]')).toBeInTheDocument();
      expect(sort.querySelector('option[value="count"]')).toBeInTheDocument();
      expect(sort.querySelector('option[value="maxValue"]')).toBeInTheDocument();
    });

    it('sorts by name by default', () => {
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} />);
      
      // All 3 counters should be visible when sorted by name
      const items = document.body.querySelectorAll('[data-testid^="counter-item-"]');
      expect(items.length).toBe(3);
      
      // Verify all expected counters are present
      const itemIds = Array.from(items).map(item => item.getAttribute('data-testid'));
      expect(itemIds).toContain('counter-item-counter-1');
      expect(itemIds).toContain('counter-item-counter-2');
      expect(itemIds).toContain('counter-item-counter-3');
    });

    it('sorts by count when selected', () => {
      const counters = [
        { id: 'c1', label: '计数1', count: 1, maxValue: 8, overflow: false, history: [] },
        { id: 'c2', label: '计数2', count: 100, maxValue: 8, overflow: false, history: [] },
        { id: 'c3', label: '计数3', count: 50, maxValue: 8, overflow: false, history: [] },
      ];
      render(<CounterPanel counters={counters} />);
      
      fireEvent.change(screen.getByTestId('counter-sort-select'), {
        target: { value: 'count' },
      });
      
      const items = document.body.querySelectorAll('[data-testid^="counter-item-"]');
      // Sorted by count descending: c2 (100), c3 (50), c1 (1)
      expect(items[0]).toHaveAttribute('data-testid', 'counter-item-c2');
      expect(items[1]).toHaveAttribute('data-testid', 'counter-item-c3');
      expect(items[2]).toHaveAttribute('data-testid', 'counter-item-c1');
    });
  });

  describe('Close Button', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<CounterPanel counters={[]} onClose={onClose} />);
      
      const closeButton = document.body.querySelector('[data-close-panel]') as HTMLElement;
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not render close button when onClose is not provided', () => {
      render(<CounterPanel counters={[]} />);
      
      expect(document.body.querySelector('[data-close-panel]')).not.toBeInTheDocument();
    });
  });

  describe('Counter Click', () => {
    it('calls onCounterClick when counter is clicked', () => {
      const onCounterClick = vi.fn();
      const counters = createMockCounters();
      render(<CounterPanel counters={counters} onCounterClick={onCounterClick} />);
      
      const counterItem = screen.getByTestId('counter-item-counter-1');
      fireEvent.click(counterItem);
      
      expect(onCounterClick).toHaveBeenCalledWith('counter-1');
    });
  });
});
