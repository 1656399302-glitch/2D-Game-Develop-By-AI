/**
 * D Flip-Flop Component Tests
 * 
 * Round 128: Sequential Components
 * 
 * Tests for D Flip-Flop component rendering and behavior.
 */

import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DFlipFlop } from '../../../components/Circuit/DFlipFlop';

describe('D Flip-Flop Component', () => {
  describe('Rendering', () => {
    it('renders D Flip-Flop with default props', () => {
      render(<DFlipFlop />);
      
      const ff = document.body.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(ff).toBeInTheDocument();
    });

    it('renders D Flip-Flop with Q=HIGH', () => {
      render(<DFlipFlop q={true} />);
      
      const ff = document.body.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(ff).toHaveAttribute('data-q', 'true');
    });

    it('renders D Flip-Flop with Q=LOW', () => {
      render(<DFlipFlop q={false} />);
      
      const ff = document.body.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(ff).toHaveAttribute('data-q', 'false');
    });

    it('renders D Flip-Flop with clock signal', () => {
      render(<DFlipFlop clockSignal={true} />);
      
      const ff = document.body.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(ff).toHaveAttribute('data-clock', 'true');
    });

    it('renders D Flip-Flop without clock signal', () => {
      render(<DFlipFlop clockSignal={false} />);
      
      const ff = document.body.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(ff).toHaveAttribute('data-clock', 'false');
    });

    it('shows D-FF label', () => {
      render(<DFlipFlop showLabel={true} />);
      
      const label = document.body.querySelector('[data-component-label="D_FLIP_FLOP"]');
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toBe('D-FF');
    });

    it('hides label when showLabel is false', () => {
      render(<DFlipFlop showLabel={false} />);
      
      expect(document.body.querySelector('[data-component-label="D_FLIP_FLOP"]')).not.toBeInTheDocument();
    });
  });

  describe('Data attributes', () => {
    it('has correct component type', () => {
      render(<DFlipFlop />);
      
      const ff = document.body.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(ff).toHaveAttribute('data-component-type', 'D_FLIP_FLOP');
    });

    it('updates q attribute', () => {
      render(<DFlipFlop q={true} />);
      
      const ff = document.body.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(ff).toHaveAttribute('data-q', 'true');
    });

    it('updates q-bar attribute', () => {
      render(<DFlipFlop qBar={false} />);
      
      const ff = document.body.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(ff).toHaveAttribute('data-q-bar', 'false');
    });

    it('updates clock attribute', () => {
      render(<DFlipFlop clockSignal={true} />);
      
      const ff = document.body.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(ff).toHaveAttribute('data-clock', 'true');
    });
  });

  describe('Position and size', () => {
    it('applies custom position', () => {
      render(<DFlipFlop position={{ x: 80, y: 140 }} />);
      
      const ff = document.body.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(ff).toHaveStyle({ transform: 'translate(80px, 140px)' });
    });

    it('applies custom size', () => {
      render(<DFlipFlop size={{ width: 100, height: 80 }} showLabel={false} />);
      
      const ff = document.body.querySelector('[data-component-type="D_FLIP_FLOP"]');
      expect(ff).toHaveStyle({ width: '100px', height: '80px' });
    });
  });

  describe('Signal colors', () => {
    it('shows LOW color when Q is false', () => {
      render(<DFlipFlop q={false} />);
      
      const label = document.body.querySelector('[data-component-label="D_FLIP_FLOP"]');
      expect(label).toHaveClass('text-gray-400');
    });

    it('shows HIGH color when Q is true', () => {
      render(<DFlipFlop q={true} />);
      
      const label = document.body.querySelector('[data-component-label="D_FLIP_FLOP"]');
      expect(label).toHaveClass('text-green-400');
    });
  });
});
