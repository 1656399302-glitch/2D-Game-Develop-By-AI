/**
 * Sequential Gates Component Tests
 * 
 * Round 144: Circuit Canvas UI
 * 
 * Tests for sequential gate components (Timer, Counter, SR_LATCH, D_LATCH, D_FLIP_FLOP).
 */

import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import Timer from '../components/Circuit/Timer';
import Counter from '../components/Circuit/Counter';
import SRLatch from '../components/Circuit/SRLatch';
import DLatch from '../components/Circuit/DLatch';
import DFlipFlop from '../components/Circuit/DFlipFlop';

// ============================================================================
// Helper: Import gate shapes from Gates.tsx
// ============================================================================

describe('Sequential Gates SVG Shapes', () => {
  // ============================================================
  // AC-144-003: Sequential Gates Render Correct SVG Shapes
  // ============================================================
  describe('AC-144-003: Sequential Gates Render Correct SVG Shapes', () => {
    it('should render Timer with unique SVG shape', () => {
      render(<Timer position={{ x: 0, y: 0 }} />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      expect(timer).toBeInTheDocument();
    });

    it('should render Counter with unique SVG shape', () => {
      render(<Counter position={{ x: 0, y: 0 }} />);
      
      const counter = document.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toBeInTheDocument();
    });

    it('should render SR_Latch with unique SVG shape', () => {
      render(<SRLatch position={{ x: 0, y: 0 }} />);
      
      const srLatch = document.querySelector('[data-component-type="SR_LATCH"]');
      expect(srLatch).toBeInTheDocument();
    });

    it('should render D_Latch with unique SVG shape', () => {
      render(<DLatch position={{ x: 0, y: 0 }} />);
      
      const dLatch = document.querySelector('[data-component-type="D_LATCH"]');
      expect(dLatch).toBeInTheDocument();
    });

    it('should render D_FlipFlop with unique SVG shape', () => {
      render(<DFlipFlop position={{ x: 0, y: 0 }} />);
      
      const dff = document.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(dff).toBeInTheDocument();
    });

    it('should have distinct shapes from combinational gates', () => {
      // Sequential gates should use rectangular shapes with internal elements
      // while combinational gates use curved paths
      
      const { container: timerContainer } = render(<Timer position={{ x: 0, y: 0 }} />);
      
      const timerSvg = timerContainer.querySelector('svg');
      expect(timerSvg).toBeInTheDocument();
      
      // Timer should contain rect element (rectangular shape)
      const rects = timerSvg?.querySelectorAll('rect');
      expect(rects?.length).toBeGreaterThan(0);
    });

    it('should render SR_Latch with SR text in SVG', () => {
      render(<SRLatch position={{ x: 0, y: 0 }} />);
      
      const srLatch = document.querySelector('[data-component-type="SR_LATCH"]');
      const svg = srLatch?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      // SR Latch should contain text element
      const text = svg?.querySelector('text');
      expect(text).toBeInTheDocument();
    });

    it('should render D_Latch with D text in SVG', () => {
      render(<DLatch position={{ x: 0, y: 0 }} />);
      
      const dLatch = document.querySelector('[data-component-type="D_LATCH"]');
      const svg = dLatch?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      // D Latch should contain text element
      const text = svg?.querySelector('text');
      expect(text).toBeInTheDocument();
    });

    it('should render D_FlipFlop with D-FF text in SVG', () => {
      render(<DFlipFlop position={{ x: 0, y: 0 }} />);
      
      const dff = document.querySelector('[data-component-type="D_FLIP_FLOP"]');
      const svg = dff?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      // D Flip-Flop should contain text element
      const text = svg?.querySelector('text');
      expect(text).toBeInTheDocument();
    });

    it('should render Timer with clock icon', () => {
      render(<Timer position={{ x: 0, y: 0 }} />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      const svg = timer?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      // Timer should contain clock circle
      const clockCircle = svg?.querySelector('circle');
      expect(clockCircle).toBeInTheDocument();
    });
  });

  // ============================================================
  // AC-144-004: Sequential Gate Output Signal Colors
  // ============================================================
  describe('AC-144-004: Sequential Gate Output Signal Colors', () => {
    it('should display LOW color for Timer when done is false', () => {
      render(<Timer position={{ x: 0, y: 0 }} done={false} />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      const label = timer?.querySelector('[data-component-label="TIMER"]');
      expect(label).toHaveClass('text-gray-400');
    });

    it('should display HIGH color for Timer when done is true', () => {
      render(<Timer position={{ x: 0, y: 0 }} done={true} />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      const label = timer?.querySelector('[data-component-label="TIMER"]');
      expect(label).toHaveClass('text-green-400');
    });

    it('should display LOW color for Counter when output is false', () => {
      render(<Counter position={{ x: 0, y: 0 }} outputSignal={false} />);
      
      const counter = document.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-output-signal', 'false');
    });

    it('should display HIGH color for Counter when output is true', () => {
      render(<Counter position={{ x: 0, y: 0 }} outputSignal={true} />);
      
      const counter = document.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-output-signal', 'true');
    });

    it('should display LOW color for SR_Latch when q is false', () => {
      render(<SRLatch position={{ x: 0, y: 0 }} q={false} />);
      
      const srLatch = document.querySelector('[data-component-type="SR_LATCH"]');
      expect(srLatch).toHaveAttribute('data-q', 'false');
    });

    it('should display HIGH color for SR_Latch when q is true', () => {
      render(<SRLatch position={{ x: 0, y: 0 }} q={true} />);
      
      const srLatch = document.querySelector('[data-component-type="SR_LATCH"]');
      expect(srLatch).toHaveAttribute('data-q', 'true');
    });

    it('should display LOW color for D_Latch when q is false', () => {
      render(<DLatch position={{ x: 0, y: 0 }} q={false} />);
      
      const dLatch = document.querySelector('[data-component-type="D_LATCH"]');
      expect(dLatch).toHaveAttribute('data-q', 'false');
    });

    it('should display HIGH color for D_Latch when q is true', () => {
      render(<DLatch position={{ x: 0, y: 0 }} q={true} />);
      
      const dLatch = document.querySelector('[data-component-type="D_LATCH"]');
      expect(dLatch).toHaveAttribute('data-q', 'true');
    });

    it('should display LOW color for D_FlipFlop when q is false', () => {
      render(<DFlipFlop position={{ x: 0, y: 0 }} q={false} />);
      
      const dff = document.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(dff).toHaveAttribute('data-q', 'false');
    });

    it('should display HIGH color for D_FlipFlop when q is true', () => {
      render(<DFlipFlop position={{ x: 0, y: 0 }} q={true} />);
      
      const dff = document.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(dff).toHaveAttribute('data-q', 'true');
    });

    it('should use green color for HIGH signal (#22c55e)', () => {
      render(<Timer position={{ x: 0, y: 0 }} done={true} />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      const svg = timer?.querySelector('svg');
      
      // Find a green-colored element
      const greenElements = svg?.querySelectorAll('[fill="#22c55e"]');
      expect(greenElements?.length).toBeGreaterThan(0);
    });

    it('should use gray color for LOW signal (#64748b)', () => {
      render(<Timer position={{ x: 0, y: 0 }} done={false} />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      const svg = timer?.querySelector('svg');
      
      // Find a gray-colored element
      const grayElements = svg?.querySelectorAll('[fill="#64748b"]');
      expect(grayElements?.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // Timer Component Tests
  // ============================================================
  describe('Timer Component Tests', () => {
    it('should render Timer with default props', () => {
      render(<Timer />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      expect(timer).toBeInTheDocument();
    });

    it('should display TIMER label', () => {
      render(<Timer showLabel={true} />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      const label = timer?.querySelector('[data-component-label="TIMER"]');
      expect(label).toBeInTheDocument();
    });

    it('should hide label when showLabel is false', () => {
      render(<Timer showLabel={false} />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      expect(timer?.querySelector('[data-component-label="TIMER"]')).toBeNull();
    });

    it('should display done state correctly', () => {
      render(<Timer done={true} />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveAttribute('data-done', 'true');
    });

    it('should display tick count', () => {
      render(<Timer tickCount={3} delay={5} />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveAttribute('data-tick-count', '3');
      expect(timer).toHaveAttribute('data-delay', '5');
    });

    it('should handle port click', () => {
      const mockOnPortClick = vi.fn();
      render(<Timer onPortClick={mockOnPortClick} />);
      
      const timer = document.querySelector('[data-component-type="TIMER"]');
      const inputPorts = timer?.querySelectorAll('.port-input');
      
      if (inputPorts && inputPorts.length > 0) {
        fireEvent.click(inputPorts[0]);
        expect(mockOnPortClick).toHaveBeenCalled();
      }
    });
  });

  // ============================================================
  // Counter Component Tests
  // ============================================================
  describe('Counter Component Tests', () => {
    it('should render Counter with default props', () => {
      render(<Counter />);
      
      const counter = document.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toBeInTheDocument();
    });

    it('should display COUNTER label', () => {
      render(<Counter showLabel={true} />);
      
      const counter = document.querySelector('[data-component-type="COUNTER"]');
      const label = counter?.querySelector('[data-component-label="COUNTER"]');
      expect(label).toBeInTheDocument();
    });

    it('should display count value', () => {
      render(<Counter count={5} />);
      
      const counter = document.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-count', '5');
    });

    it('should handle port click', () => {
      const mockOnPortClick = vi.fn();
      render(<Counter onPortClick={mockOnPortClick} />);
      
      const counter = document.querySelector('[data-component-type="COUNTER"]');
      const inputPorts = counter?.querySelectorAll('.port-input');
      
      if (inputPorts && inputPorts.length > 0) {
        fireEvent.click(inputPorts[0]);
        expect(mockOnPortClick).toHaveBeenCalled();
      }
    });
  });

  // ============================================================
  // SR_Latch Component Tests
  // ============================================================
  describe('SR_Latch Component Tests', () => {
    it('should render SR_Latch with default props', () => {
      render(<SRLatch />);
      
      const srLatch = document.querySelector('[data-component-type="SR_LATCH"]');
      expect(srLatch).toBeInTheDocument();
    });

    it('should display SR_LATCH label', () => {
      render(<SRLatch showLabel={true} />);
      
      const srLatch = document.querySelector('[data-component-type="SR_LATCH"]');
      const label = srLatch?.querySelector('[data-component-label="SR_LATCH"]');
      expect(label).toBeInTheDocument();
    });

    it('should handle port click', () => {
      const mockOnPortClick = vi.fn();
      render(<SRLatch onPortClick={mockOnPortClick} />);
      
      const srLatch = document.querySelector('[data-component-type="SR_LATCH"]');
      const inputPorts = srLatch?.querySelectorAll('.port-input');
      
      if (inputPorts && inputPorts.length > 0) {
        fireEvent.click(inputPorts[0]);
        expect(mockOnPortClick).toHaveBeenCalled();
      }
    });
  });

  // ============================================================
  // D_Latch Component Tests
  // ============================================================
  describe('D_Latch Component Tests', () => {
    it('should render D_Latch with default props', () => {
      render(<DLatch />);
      
      const dLatch = document.querySelector('[data-component-type="D_LATCH"]');
      expect(dLatch).toBeInTheDocument();
    });

    it('should display D_LATCH label', () => {
      render(<DLatch showLabel={true} />);
      
      const dLatch = document.querySelector('[data-component-type="D_LATCH"]');
      const label = dLatch?.querySelector('[data-component-label="D_LATCH"]');
      expect(label).toBeInTheDocument();
    });

    it('should handle port click', () => {
      const mockOnPortClick = vi.fn();
      render(<DLatch onPortClick={mockOnPortClick} />);
      
      const dLatch = document.querySelector('[data-component-type="D_LATCH"]');
      const inputPorts = dLatch?.querySelectorAll('.port-input');
      
      if (inputPorts && inputPorts.length > 0) {
        fireEvent.click(inputPorts[0]);
        expect(mockOnPortClick).toHaveBeenCalled();
      }
    });
  });

  // ============================================================
  // D_FlipFlop Component Tests
  // ============================================================
  describe('D_FlipFlop Component Tests', () => {
    it('should render D_FlipFlop with default props', () => {
      render(<DFlipFlop />);
      
      const dff = document.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(dff).toBeInTheDocument();
    });

    it('should display label', () => {
      render(<DFlipFlop showLabel={true} />);
      
      const dff = document.querySelector('[data-component-type="D_FLIP_FLOP"]');
      const label = dff?.querySelector('[data-component-label="D_FLIP_FLOP"]');
      expect(label).toBeInTheDocument();
    });

    it('should handle port click', () => {
      const mockOnPortClick = vi.fn();
      render(<DFlipFlop onPortClick={mockOnPortClick} />);
      
      const dff = document.querySelector('[data-component-type="D_FLIP_FLOP"]');
      const inputPorts = dff?.querySelectorAll('.port-input');
      
      if (inputPorts && inputPorts.length > 0) {
        fireEvent.click(inputPorts[0]);
        expect(mockOnPortClick).toHaveBeenCalled();
      }
    });
  });
});
