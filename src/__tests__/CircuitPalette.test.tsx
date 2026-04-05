/**
 * CircuitPalette Component Tests
 * 
 * Round 144: Circuit Canvas UI
 * 
 * Tests for CircuitPalette component - component selection panel
 * for adding circuit elements to the canvas.
 */

import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import CircuitPalette from '../components/Circuit/CircuitPalette';

describe('CircuitPalette Component', () => {
  beforeEach(() => {
    // Clear any mocks
  });

  // ============================================================
  // AC-144-001: CircuitPalette Renders All Component Types
  // ============================================================
  describe('AC-144-001: CircuitPalette Renders All Component Types', () => {
    it('should render palette container with correct data-testid', () => {
      render(<CircuitPalette />);
      
      const palette = screen.getByTestId('circuit-palette');
      expect(palette).toBeInTheDocument();
    });

    it('should display 7 logic gate buttons', () => {
      render(<CircuitPalette />);
      
      const logicGates = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];
      
      logicGates.forEach(gateType => {
        const button = document.querySelector(`[data-palette-item="${gateType}"]`);
        expect(button).toBeInTheDocument();
      });
    });

    it('should display 5 sequential gate buttons', () => {
      render(<CircuitPalette />);
      
      const sequentialGates = ['TIMER', 'COUNTER', 'SR_LATCH', 'D_LATCH', 'D_FLIP_FLOP'];
      
      sequentialGates.forEach(gateType => {
        const button = document.querySelector(`[data-palette-item="${gateType}"]`);
        expect(button).toBeInTheDocument();
      });
    });

    it('should display INPUT and OUTPUT buttons', () => {
      render(<CircuitPalette />);
      
      const inputButton = document.querySelector('[data-palette-item="INPUT"]');
      const outputButton = document.querySelector('[data-palette-item="OUTPUT"]');
      
      expect(inputButton).toBeInTheDocument();
      expect(outputButton).toBeInTheDocument();
    });

    it('should have total of 14 component buttons', () => {
      render(<CircuitPalette />);
      
      const buttons = document.querySelectorAll('[data-palette-item]');
      expect(buttons).toHaveLength(14);
    });

    it('should display category labels', () => {
      render(<CircuitPalette />);
      
      expect(screen.getByText('Logic Gates')).toBeInTheDocument();
      expect(screen.getByText('Sequential')).toBeInTheDocument();
      expect(screen.getByText('I/O')).toBeInTheDocument();
    });
  });

  // ============================================================
  // Additional Tests
  // ============================================================
  describe('Additional Tests', () => {
    it('should have correct aria-labels for accessibility', () => {
      render(<CircuitPalette />);
      
      expect(screen.getByLabelText('Add AND gate')).toBeInTheDocument();
      expect(screen.getByLabelText('Add input node')).toBeInTheDocument();
      expect(screen.getByLabelText('Add output node')).toBeInTheDocument();
    });

    it('should render with proper toolbar role', () => {
      render(<CircuitPalette />);
      
      const palette = screen.getByRole('toolbar');
      expect(palette).toBeInTheDocument();
    });

    it('should display gate labels correctly', () => {
      render(<CircuitPalette />);
      
      expect(screen.getByText('AND')).toBeInTheDocument();
      expect(screen.getByText('OR')).toBeInTheDocument();
      expect(screen.getByText('NOT')).toBeInTheDocument();
      expect(screen.getByText('IN')).toBeInTheDocument();
      expect(screen.getByText('OUT')).toBeInTheDocument();
    });

    it('should display sequential gate labels with underscores replaced', () => {
      render(<CircuitPalette />);
      
      // SR_LATCH -> "SR LATCH" (one underscore replaced)
      expect(screen.getByText('SR LATCH')).toBeInTheDocument();
      // D_LATCH -> "D LATCH" (one underscore replaced)
      expect(screen.getByText('D LATCH')).toBeInTheDocument();
      // D_FLIP_FLOP -> "D FLIP_FLOP" (only first underscore replaced)
      expect(screen.getByText('D FLIP_FLOP')).toBeInTheDocument();
    });

    it('should have border class on buttons', () => {
      render(<CircuitPalette />);
      
      const andButton = document.querySelector('[data-palette-item="AND"]');
      expect(andButton?.className).toContain('border');
    });

    it('should apply custom className', () => {
      render(<CircuitPalette className="custom-class" />);
      
      const palette = screen.getByTestId('circuit-palette');
      expect(palette).toHaveClass('custom-class');
    });
  });
});
