/**
 * Counter Stats Tests
 * 
 * ROUND 183: CounterStats tests
 * Tests for CounterStats component calculations and rendering.
 */

import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CounterStats } from '../CounterStats';
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
      history: [5, 4, 3, 2, 1],
    },
    {
      id: 'counter-2',
      label: '计数器2',
      count: 0,
      maxValue: 16,
      overflow: false,
      history: [],
    },
    {
      id: 'counter-3',
      label: '溢出计数器',
      count: 10,
      maxValue: 8,
      overflow: true,
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

describe('CounterStats', () => {
  describe('Rendering', () => {
    it('renders CounterStats with data-testid', () => {
      render(<CounterStats counters={[]} />);
      
      expect(screen.getByTestId('counter-stats')).toBeInTheDocument();
    });

    it('renders total counter stat with data-testid', () => {
      render(<CounterStats counters={[]} />);
      
      expect(screen.getByTestId('counter-stats-total')).toBeInTheDocument();
    });

    it('renders active counter stat with data-testid', () => {
      render(<CounterStats counters={[]} />);
      
      expect(screen.getByTestId('counter-stats-active')).toBeInTheDocument();
    });

    it('renders overflow counter stat with data-testid', () => {
      render(<CounterStats counters={[]} />);
      
      expect(screen.getByTestId('counter-stats-overflow')).toBeInTheDocument();
    });

    it('renders percentage stat with data-testid', () => {
      render(<CounterStats counters={[]} />);
      
      expect(screen.getByTestId('counter-stats-percentage')).toBeInTheDocument();
    });

    it('renders labels in Chinese', () => {
      render(<CounterStats counters={[]} />);
      
      expect(screen.getByText('总计数器')).toBeInTheDocument();
      expect(screen.getByText('激活计数')).toBeInTheDocument();
      expect(screen.getByText('溢出计数')).toBeInTheDocument();
      expect(screen.getByText('激活率')).toBeInTheDocument();
    });

    it('renders progress bar container', () => {
      render(<CounterStats counters={[]} />);
      
      // Progress bar should be present (div with bg-[#0a0e17] class)
      const progressBar = document.body.querySelector('.bg-\\[\\#0a0e17\\]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Total Calculation', () => {
    it('displays 0 for empty counters array', () => {
      render(<CounterStats counters={[]} />);
      
      expect(screen.getByTestId('counter-stats-total')).toHaveTextContent('0');
    });

    it('displays correct total for multiple counters', () => {
      const counters = createMockCounters();
      render(<CounterStats counters={counters} />);
      
      expect(screen.getByTestId('counter-stats-total')).toHaveTextContent('3');
    });

    it('displays correct total for single counter', () => {
      const counters = [{ id: 'c1', label: 'C1', count: 5, maxValue: 8, overflow: false, history: [] }];
      render(<CounterStats counters={counters} />);
      
      expect(screen.getByTestId('counter-stats-total')).toHaveTextContent('1');
    });
  });

  describe('Active Calculation', () => {
    it('displays 0 when no counters are active', () => {
      const counters = [
        { id: 'c1', label: 'C1', count: 0, maxValue: 8, overflow: false, history: [] },
        { id: 'c2', label: 'C2', count: 0, maxValue: 8, overflow: false, history: [] },
      ];
      render(<CounterStats counters={counters} />);
      
      expect(screen.getByTestId('counter-stats-active')).toHaveTextContent('0');
    });

    it('displays correct active count', () => {
      const counters = createMockCounters();
      render(<CounterStats counters={counters} />);
      
      // counter-1 (count=5) and counter-3 (count=10) are active
      expect(screen.getByTestId('counter-stats-active')).toHaveTextContent('2');
    });

    it('counts counter with count > 0 as active', () => {
      const counters = [
        { id: 'c1', label: 'C1', count: 1, maxValue: 8, overflow: false, history: [] },
        { id: 'c2', label: 'C2', count: 0, maxValue: 8, overflow: false, history: [] },
      ];
      render(<CounterStats counters={counters} />);
      
      expect(screen.getByTestId('counter-stats-active')).toHaveTextContent('1');
    });
  });

  describe('Overflow Calculation', () => {
    it('displays 0 when no counters have overflow', () => {
      const counters = [
        { id: 'c1', label: 'C1', count: 5, maxValue: 8, overflow: false, history: [] },
        { id: 'c2', label: 'C2', count: 8, maxValue: 8, overflow: false, history: [] },
      ];
      render(<CounterStats counters={counters} />);
      
      expect(screen.getByTestId('counter-stats-overflow')).toHaveTextContent('0');
    });

    it('displays correct overflow count', () => {
      const counters = createMockCounters();
      render(<CounterStats counters={counters} />);
      
      // Only counter-3 has overflow=true
      expect(screen.getByTestId('counter-stats-overflow')).toHaveTextContent('1');
    });

    it('counts only counters with overflow=true', () => {
      const counters = [
        { id: 'c1', label: 'C1', count: 5, maxValue: 8, overflow: true, history: [] },
        { id: 'c2', label: 'C2', count: 8, maxValue: 8, overflow: true, history: [] },
        { id: 'c3', label: 'C3', count: 3, maxValue: 8, overflow: false, history: [] },
      ];
      render(<CounterStats counters={counters} />);
      
      expect(screen.getByTestId('counter-stats-overflow')).toHaveTextContent('2');
    });
  });

  describe('Percentage Calculation', () => {
    it('displays 0% when there are no counters', () => {
      render(<CounterStats counters={[]} />);
      
      expect(screen.getByTestId('counter-stats-percentage')).toHaveTextContent('0%');
    });

    it('displays 0% when no counters are active', () => {
      const counters = [
        { id: 'c1', label: 'C1', count: 0, maxValue: 8, overflow: false, history: [] },
        { id: 'c2', label: 'C2', count: 0, maxValue: 8, overflow: false, history: [] },
      ];
      render(<CounterStats counters={counters} />);
      
      expect(screen.getByTestId('counter-stats-percentage')).toHaveTextContent('0%');
    });

    it('displays 100% when all counters are active', () => {
      const counters = [
        { id: 'c1', label: 'C1', count: 5, maxValue: 8, overflow: false, history: [] },
        { id: 'c2', label: 'C2', count: 3, maxValue: 8, overflow: false, history: [] },
      ];
      render(<CounterStats counters={counters} />);
      
      expect(screen.getByTestId('counter-stats-percentage')).toHaveTextContent('100%');
    });

    it('displays correct percentage', () => {
      const counters = createMockCounters();
      render(<CounterStats counters={counters} />);
      
      // 2 active out of 3 = 66.67% ≈ 67%
      expect(screen.getByTestId('counter-stats-percentage')).toHaveTextContent('67%');
    });

    it('displays 50% for half active counters', () => {
      const counters = [
        { id: 'c1', label: 'C1', count: 5, maxValue: 8, overflow: false, history: [] },
        { id: 'c2', label: 'C2', count: 0, maxValue: 8, overflow: false, history: [] },
      ];
      render(<CounterStats counters={counters} />);
      
      expect(screen.getByTestId('counter-stats-percentage')).toHaveTextContent('50%');
    });
  });

  describe('Progress Bar', () => {
    it('renders progress bar with correct width', () => {
      const counters = [
        { id: 'c1', label: 'C1', count: 5, maxValue: 8, overflow: false, history: [] },
        { id: 'c2', label: 'C2', count: 3, maxValue: 8, overflow: false, history: [] },
      ];
      const { container } = render(<CounterStats counters={counters} />);
      
      // Find the progress bar (should have width of 100% for 2/2 active)
      const progressFill = container.querySelector('.bg-gradient-to-r');
      expect(progressFill).toBeInTheDocument();
      expect(progressFill).toHaveStyle({ width: '100%' });
    });

    it('renders progress bar with 0 width when no active counters', () => {
      const counters = [
        { id: 'c1', label: 'C1', count: 0, maxValue: 8, overflow: false, history: [] },
      ];
      const { container } = render(<CounterStats counters={counters} />);
      
      const progressFill = container.querySelector('.bg-gradient-to-r');
      expect(progressFill).toBeInTheDocument();
      expect(progressFill).toHaveStyle({ width: '0%' });
    });
  });

  describe('Text Colors', () => {
    it('applies green color to active count', () => {
      const counters = createMockCounters();
      render(<CounterStats counters={counters} />);
      
      const activeStat = screen.getByTestId('counter-stats-active');
      expect(activeStat).toHaveClass('text-[#22c55e]');
    });

    it('applies amber color to overflow count', () => {
      const counters = createMockCounters();
      render(<CounterStats counters={counters} />);
      
      const overflowStat = screen.getByTestId('counter-stats-overflow');
      expect(overflowStat).toHaveClass('text-[#f59e0b]');
    });

    it('applies green color to percentage', () => {
      const counters = createMockCounters();
      render(<CounterStats counters={counters} />);
      
      const percentageStat = screen.getByTestId('counter-stats-percentage');
      expect(percentageStat).toHaveClass('text-[#22c55e]');
    });
  });
});
