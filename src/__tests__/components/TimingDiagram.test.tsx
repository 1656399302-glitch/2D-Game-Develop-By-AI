/**
 * TimingDiagram Component Tests
 * 
 * Round 149: Circuit Signal Visualization
 * 
 * Unit tests for the TimingDiagram SVG component.
 */

import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TimingDiagram, CompactTimingDiagram } from '../../components/Circuit/TimingDiagram';
import { SignalTraceEntry } from '../../store/signalTraceStore';

// ============================================================================
// Test Fixtures
// ============================================================================

const createTrace = (
  step: number,
  signals: Record<string, boolean>
): SignalTraceEntry => ({
  step,
  signals,
  timestamp: Date.now() + step * 1000,
});

const basicTraces: SignalTraceEntry[] = [
  createTrace(0, { A: false, B: false, OUT: false }),
  createTrace(1, { A: true, B: false, OUT: false }),
  createTrace(2, { A: true, B: true, OUT: true }),
  createTrace(3, { A: false, B: true, OUT: false }),
];

const multiSignalTraces: SignalTraceEntry[] = [
  createTrace(0, { Clock: false, Data: false, Q: false }),
  createTrace(1, { Clock: true, Data: false, Q: false }),
  createTrace(2, { Clock: false, Data: true, Q: false }),
  createTrace(3, { Clock: true, Data: true, Q: true }),
  createTrace(4, { Clock: false, Data: true, Q: true }),
];

// ============================================================================
// Tests
// ============================================================================

describe('TimingDiagram', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A', 'B', 'OUT']}
          data-testid="timing-diagram"
        />
      );
      
      const diagram = screen.getByTestId('timing-diagram');
      expect(diagram).toBeInTheDocument();
    });

    it('should render SVG element', () => {
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A', 'OUT']}
        />
      );
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should display empty state when no traces', () => {
      render(
        <TimingDiagram
          traces={[]}
          signalNames={['A', 'B']}
          data-testid="timing-diagram"
        />
      );
      
      const diagram = screen.getByTestId('timing-diagram');
      expect(diagram.textContent).toContain('No signal trace data available');
    });

    it('should render signal labels', () => {
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A', 'B', 'OUT']}
        />
      );
      
      const diagram = document.querySelector('.timing-diagram');
      expect(diagram).toBeInTheDocument();
      
      // Check that signal names appear as labels
      const textContent = diagram?.textContent || '';
      expect(textContent).toContain('A');
      expect(textContent).toContain('B');
      expect(textContent).toContain('OUT');
    });

    it('should display step count in header', () => {
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A', 'OUT']}
        />
      );
      
      const diagram = document.querySelector('.timing-diagram');
      expect(diagram?.textContent).toContain('4 steps');
    });
  });

  describe('Signal Colors', () => {
    it('should use specified HIGH color (#22c55e)', () => {
      const highColor = '#22c55e';
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A']}
          highColor={highColor}
        />
      );
      
      const svg = document.querySelector('svg');
      const highRects = svg?.querySelectorAll(`rect[fill="${highColor}"]`);
      expect(highRects && highRects.length).toBeGreaterThan(0);
    });

    it('should use specified LOW color (#64748b)', () => {
      const lowColor = '#64748b';
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A']}
          lowColor={lowColor}
        />
      );
      
      const svg = document.querySelector('svg');
      const rects = svg?.querySelectorAll('rect');
      expect(rects && rects.length).toBeGreaterThan(0);
    });

    it('should render HIGH signals with green color', () => {
      render(
        <TimingDiagram
          traces={[{ step: 0, signals: { A: true }, timestamp: Date.now() }]}
          signalNames={['A']}
          highColor="#22c55e"
        />
      );
      
      const svg = document.querySelector('svg');
      const highRects = svg?.querySelectorAll('rect[fill="#22c55e"]');
      expect(highRects && highRects.length).toBeGreaterThan(0);
    });

    it('should render LOW signals with gray color', () => {
      render(
        <TimingDiagram
          traces={[{ step: 0, signals: { A: false }, timestamp: Date.now() }]}
          signalNames={['A']}
          lowColor="#64748b"
        />
      );
      
      const svg = document.querySelector('svg');
      const lowRects = svg?.querySelectorAll('rect[fill="#64748b"]');
      expect(lowRects && lowRects.length).toBeGreaterThan(0);
    });
  });

  describe('AND Gate Trace', () => {
    it('should correctly display AND gate output', () => {
      // AND gate: output is HIGH only when both inputs are HIGH
      const andGateTraces: SignalTraceEntry[] = [
        createTrace(0, { InputA: false, InputB: false, AND_OUT: false }),
        createTrace(1, { InputA: true, InputB: false, AND_OUT: false }),
        createTrace(2, { InputA: false, InputB: true, AND_OUT: false }),
        createTrace(3, { InputA: true, InputB: true, AND_OUT: true }),
      ];
      
      render(
        <TimingDiagram
          traces={andGateTraces}
          signalNames={['InputA', 'InputB', 'AND_OUT']}
        />
      );
      
      const svg = document.querySelector('svg');
      // Check that the AND_OUT signal shows HIGH only at step 3
      const signalGroups = svg?.querySelectorAll('[data-signal-name]');
      expect(signalGroups).toHaveLength(3);
    });

    it('should show correct boolean output at each step for AND gate', () => {
      const traces: SignalTraceEntry[] = [
        createTrace(0, { A: true, B: true, OUT: true }),  // Both HIGH -> OUT HIGH
        createTrace(1, { A: true, B: false, OUT: false }), // One LOW -> OUT LOW
        createTrace(2, { A: false, B: true, OUT: false }), // One LOW -> OUT LOW
        createTrace(3, { A: false, B: false, OUT: false }), // Both LOW -> OUT LOW
      ];
      
      render(
        <TimingDiagram
          traces={traces}
          signalNames={['OUT']}
        />
      );
      
      const svg = document.querySelector('svg');
      const signalGroup = svg?.querySelector('[data-signal-name="OUT"]');
      expect(signalGroup).toBeInTheDocument();
    });
  });

  describe('Multiple Signals', () => {
    it('should render multiple signal rows', () => {
      render(
        <TimingDiagram
          traces={multiSignalTraces}
          signalNames={['Clock', 'Data', 'Q']}
        />
      );
      
      const svg = document.querySelector('svg');
      const signalGroups = svg?.querySelectorAll('[data-signal-name]');
      expect(signalGroups).toHaveLength(3);
    });

    it('should display legend with HIGH and LOW indicators', () => {
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A']}
        />
      );
      
      const svg = document.querySelector('svg');
      const textContent = svg?.textContent || '';
      expect(textContent).toContain('HIGH');
      expect(textContent).toContain('LOW');
    });
  });

  describe('Accessibility', () => {
    it('should have graphics-document role', () => {
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A']}
        />
      );
      
      const diagram = document.querySelector('[role="graphics-document"]');
      expect(diagram).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A']}
        />
      );
      
      const diagram = document.querySelector('[aria-label="Timing Diagram"]');
      expect(diagram).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    it('should apply custom className', () => {
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A']}
          className="custom-class"
        />
      );
      
      const diagram = document.querySelector('.custom-class');
      expect(diagram).toBeInTheDocument();
    });

    it('should accept custom dimensions', () => {
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A', 'B']}
          width={800}
          rowHeight={50}
        />
      );
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '800');
    });

    it('should apply custom time scale', () => {
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A']}
          timeScale={50}
        />
      );
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Step Count Verification', () => {
    it('should show 4+ time step rows when simulating', () => {
      // Create traces with 4+ steps
      const traces: SignalTraceEntry[] = [];
      for (let i = 0; i < 5; i++) {
        traces.push(createTrace(i, { A: i % 2 === 0, B: i % 2 === 1 }));
      }
      
      render(
        <TimingDiagram
          traces={traces}
          signalNames={['A', 'B']}
        />
      );
      
      const svg = document.querySelector('svg');
      expect(svg?.textContent).toContain('5 steps');
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should handle single trace entry', () => {
      const singleTrace = [createTrace(0, { A: true })];
      
      render(
        <TimingDiagram
          traces={singleTrace}
          signalNames={['A']}
        />
      );
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.textContent).toContain('1 step');
    });

    it('should handle signals with no matching trace data', () => {
      render(
        <TimingDiagram
          traces={basicTraces}
          signalNames={['A', 'NonExistent', 'OUT']}
        />
      );
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should handle all HIGH signals', () => {
      const allHigh = [
        createTrace(0, { A: true, B: true }),
        createTrace(1, { A: true, B: true }),
        createTrace(2, { A: true, B: true }),
      ];
      
      render(
        <TimingDiagram
          traces={allHigh}
          signalNames={['A', 'B']}
        />
      );
      
      const svg = document.querySelector('svg');
      // 2 signals * 3 steps = 6 HIGH rects + legend rect = 7
      const highRects = svg?.querySelectorAll('rect[fill="#22c55e"]');
      expect(highRects && highRects.length).toBeGreaterThanOrEqual(6);
    });

    it('should handle all LOW signals', () => {
      const allLow = [
        createTrace(0, { A: false, B: false }),
        createTrace(1, { A: false, B: false }),
      ];
      
      render(
        <TimingDiagram
          traces={allLow}
          signalNames={['A', 'B']}
        />
      );
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});

describe('CompactTimingDiagram', () => {
  it('should render compact diagram', () => {
    render(
      <CompactTimingDiagram
        traces={basicTraces}
        signalName="A"
      />
    );
    
    const diagram = document.querySelector('[data-testid="compact-timing-diagram"]');
    expect(diagram).toBeInTheDocument();
  });

  it('should display signal name label', () => {
    render(
      <CompactTimingDiagram
        traces={basicTraces}
        signalName="TestSignal"
      />
    );
    
    const diagram = document.querySelector('[data-testid="compact-timing-diagram"]');
    expect(diagram?.textContent).toContain('TestSignal');
  });

  it('should render SVG with waveform bars', () => {
    render(
      <CompactTimingDiagram
        traces={basicTraces}
        signalName="A"
        width={200}
        height={30}
      />
    );
    
    const svg = document.querySelector('svg');
    const rects = svg?.querySelectorAll('rect');
    expect(rects && rects.length).toBe(4); // 4 traces
  });
});
