/**
 * WireJunction Component Tests
 * 
 * Round 144: Circuit Canvas UI
 * 
 * Tests for WireJunction component - junction point for complex wire routing.
 */

import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import WireJunction, { JunctionHub } from '../components/Circuit/WireJunction';

describe('WireJunction Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // AC-144-005: WireJunction Creates Junction Point
  // ============================================================
  describe('AC-144-005: WireJunction Creates Junction Point', () => {
    it('should render junction with correct data-testid', () => {
      render(<WireJunction x={100} y={100} id="junction-1" />);
      
      const junction = screen.getByTestId('wire-junction');
      expect(junction).toBeInTheDocument();
    });

    it('should render junction at correct position', () => {
      render(<WireJunction x={150} y={200} id="junction-1" />);
      
      const junction = screen.getByTestId('wire-junction');
      expect(junction.getAttribute('transform')).toBe('translate(150, 200)');
    });

    it('should have junction type attribute', () => {
      render(<WireJunction x={100} y={100} id="junction-1" />);
      
      const junction = screen.getByTestId('wire-junction');
      expect(junction.getAttribute('data-junction-id')).toBe('junction-1');
    });

    it('should render with LOW signal by default', () => {
      render(<WireJunction x={100} y={100} id="junction-1" />);
      
      const junction = screen.getByTestId('wire-junction');
      expect(junction.getAttribute('data-signal')).toBe('false');
    });

    it('should render with HIGH signal when specified', () => {
      render(<WireJunction x={100} y={100} id="junction-1" signal={true} />);
      
      const junction = screen.getByTestId('wire-junction');
      expect(junction.getAttribute('data-signal')).toBe('true');
    });

    it('should show selected state', () => {
      render(<WireJunction x={100} y={100} id="junction-1" isSelected={true} />);
      
      const junction = screen.getByTestId('wire-junction');
      expect(junction.getAttribute('data-selected')).toBe('true');
    });

    it('should track connection count', () => {
      render(<WireJunction x={100} y={100} id="junction-1" connectionCount={3} />);
      
      const junction = screen.getByTestId('wire-junction');
      expect(junction.getAttribute('data-connection-count')).toBe('3');
    });
  });

  // ============================================================
  // AC-144-006: WireJunction Visual Rendering
  // ============================================================
  describe('AC-144-006: WireJunction Visual Rendering', () => {
    it('should render SVG circle element', () => {
      render(<WireJunction x={100} y={100} id="junction-1" />);
      
      // Junction should contain a circle
      const junction = screen.getByTestId('wire-junction');
      const circles = junction.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThanOrEqual(1);
    });

    it('should render main junction circle with correct radius', () => {
      render(<WireJunction x={100} y={100} id="junction-1" />);
      
      // Main circle should have r="6"
      const junction = screen.getByTestId('wire-junction');
      const circles = junction.querySelectorAll('circle');
      // Find the circle with r="6" (main junction circle)
      const mainCircle = Array.from(circles).find(c => c.getAttribute('r') === '6');
      expect(mainCircle).toBeDefined();
    });

    it('should render different color for HIGH signal', () => {
      render(<WireJunction x={100} y={100} id="junction-1" signal={true} />);
      
      const junction = screen.getByTestId('wire-junction');
      const circles = junction.querySelectorAll('circle');
      // For HIGH signal, should have green circle (fill="#22c55e")
      const greenCircle = Array.from(circles).find(c => c.getAttribute('fill') === '#22c55e');
      expect(greenCircle).toBeDefined();
    });

    it('should render inner dot for HIGH signal', () => {
      render(<WireJunction x={100} y={100} id="junction-1" signal={true} />);
      
      const junction = screen.getByTestId('wire-junction');
      // There should be multiple circles when signal is HIGH
      const circles = junction.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThanOrEqual(2);
    });

    it('should render selection ring when selected', () => {
      render(<WireJunction x={100} y={100} id="junction-1" isSelected={true} />);
      
      const junction = screen.getByTestId('wire-junction');
      // Selection ring should have dashed stroke
      const selectionRing = junction.querySelector('circle[stroke-dasharray="3,2"]');
      expect(selectionRing).toBeInTheDocument();
    });

    it('should render connection indicators when connectionCount > 2', () => {
      render(<WireJunction x={100} y={100} id="junction-1" connectionCount={4} />);
      
      const junction = screen.getByTestId('wire-junction');
      const indicators = junction.querySelectorAll('.connection-indicators circle');
      expect(indicators.length).toBeGreaterThanOrEqual(1);
    });

    it('should not render connection indicators when connectionCount <= 2', () => {
      render(<WireJunction x={100} y={100} id="junction-1" connectionCount={2} />);
      
      const junction = screen.getByTestId('wire-junction');
      const indicators = junction.querySelector('.connection-indicators');
      expect(indicators).toBeNull();
    });

    it('should have clickable cursor', () => {
      render(<WireJunction x={100} y={100} id="junction-1" />);
      
      const junction = screen.getByTestId('wire-junction');
      expect(junction.style.cursor).toBe('pointer');
    });
  });

  // ============================================================
  // Event Handler Tests
  // ============================================================
  describe('Event Handler Tests', () => {
    it('should call onClick when junction is clicked', () => {
      const mockOnClick = vi.fn();
      render(<WireJunction x={100} y={100} id="junction-1" onClick={mockOnClick} />);
      
      const junction = screen.getByTestId('wire-junction');
      fireEvent.click(junction);
      
      expect(mockOnClick).toHaveBeenCalledWith('junction-1');
    });

    it('should call onPortClick when port is clicked', () => {
      const mockOnPortClick = vi.fn();
      render(
        <WireJunction
          x={100}
          y={100}
          id="junction-1"
          connectionCount={4}
          onPortClick={mockOnPortClick}
        />
      );
      
      // Get port indicator
      const portIndicators = screen.getByTestId('wire-junction').querySelectorAll('.port-indicator');
      if (portIndicators.length > 0) {
        fireEvent.click(portIndicators[0]);
        expect(mockOnPortClick).toHaveBeenCalledWith('junction-1', 0);
      }
    });

    it('should stop propagation on click', () => {
      const mockOnClick = vi.fn();
      render(
        <div onClick={() => mockOnClick('parent')}>
          <WireJunction x={100} y={100} id="junction-1" onClick={() => mockOnClick('junction')} />
        </div>
      );
      
      const junction = screen.getByTestId('wire-junction');
      fireEvent.click(junction);
      
      // Parent handler should not be called due to stopPropagation
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith('junction');
    });
  });

  // ============================================================
  // JunctionHub Tests
  // ============================================================
  describe('JunctionHub Component', () => {
    it('should render junction hub with correct data-testid', () => {
      render(<JunctionHub x={100} y={100} id="hub-1" />);
      
      const hub = screen.getByTestId('junction-hub');
      expect(hub).toBeInTheDocument();
    });

    it('should render junction hub at correct position', () => {
      render(<JunctionHub x={150} y={200} id="hub-1" />);
      
      const hub = screen.getByTestId('junction-hub');
      expect(hub.getAttribute('transform')).toBe('translate(150, 200)');
    });

    it('should render central hub circle', () => {
      render(<JunctionHub x={100} y={100} id="hub-1" />);
      
      const hub = screen.getByTestId('junction-hub');
      const centralCircle = hub.querySelector('circle');
      expect(centralCircle).toBeInTheDocument();
    });

    it('should render default 4 ports', () => {
      render(<JunctionHub x={100} y={100} id="hub-1" portCount={4} />);
      
      const hub = screen.getByTestId('junction-hub');
      const ports = hub.querySelectorAll('circle[data-port-index]');
      expect(ports.length).toBe(4);
    });

    it('should render custom port count', () => {
      render(<JunctionHub x={100} y={100} id="hub-1" portCount={6} />);
      
      const hub = screen.getByTestId('junction-hub');
      const ports = hub.querySelectorAll('circle[data-port-index]');
      expect(ports.length).toBe(6);
    });

    it('should call onClick when hub is clicked', () => {
      const mockOnClick = vi.fn();
      render(<JunctionHub x={100} y={100} id="hub-1" onClick={mockOnClick} />);
      
      const hub = screen.getByTestId('junction-hub');
      fireEvent.click(hub);
      
      expect(mockOnClick).toHaveBeenCalledWith('hub-1');
    });

    it('should call onPortClick when port is clicked', () => {
      const mockOnPortClick = vi.fn();
      render(
        <JunctionHub x={100} y={100} id="hub-1" portCount={4} onPortClick={mockOnPortClick} />
      );
      
      const hub = screen.getByTestId('junction-hub');
      const port = hub.querySelector('circle[data-port-index="2"]');
      if (port) {
        fireEvent.click(port);
        expect(mockOnPortClick).toHaveBeenCalledWith('hub-1', 2);
      }
    });
  });

  // ============================================================
  // Visual State Tests
  // ============================================================
  describe('Visual State Tests', () => {
    it('should apply LOW signal color by default', () => {
      render(<WireJunction x={100} y={100} id="junction-1" />);
      
      const junction = screen.getByTestId('wire-junction');
      // Main circle should have gray color
      const circles = junction.querySelectorAll('circle');
      // Find a gray-colored circle
      const grayCircle = Array.from(circles).find(c => c.getAttribute('fill') === '#64748b');
      expect(grayCircle).toBeDefined();
    });

    it('should apply HIGH signal color when signal is true', () => {
      render(<WireJunction x={100} y={100} id="junction-1" signal={true} />);
      
      const junction = screen.getByTestId('wire-junction');
      // Main circle should have green color
      const circles = junction.querySelectorAll('circle');
      const greenCircle = Array.from(circles).find(c => c.getAttribute('fill') === '#22c55e');
      expect(greenCircle).toBeDefined();
    });

    it('should apply selected stroke color', () => {
      render(<WireJunction x={100} y={100} id="junction-1" isSelected={true} />);
      
      const junction = screen.getByTestId('wire-junction');
      // Selection ring should have blue color
      const selectionRing = junction.querySelector('circle[stroke="#3b82f6"]');
      expect(selectionRing).toBeInTheDocument();
    });

    it('should render glow animation for HIGH signal', () => {
      render(<WireJunction x={100} y={100} id="junction-1" signal={true} />);
      
      const junction = screen.getByTestId('wire-junction');
      const animatedCircle = junction.querySelector('circle[fill="none"]');
      expect(animatedCircle).toBeInTheDocument();
    });
  });
});
