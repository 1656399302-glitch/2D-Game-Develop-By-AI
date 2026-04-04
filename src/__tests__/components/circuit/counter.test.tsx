/**
 * Counter Component Tests
 * 
 * Round 128: Sequential Components
 * 
 * Tests for Counter component rendering and behavior.
 */

import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Counter } from '../../../components/Circuit/Counter';

describe('Counter Component', () => {
  describe('Rendering', () => {
    it('renders Counter with default props', () => {
      render(<Counter />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toBeInTheDocument();
    });

    it('renders Counter with custom maxValue', () => {
      render(<Counter maxValue={16} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toBeInTheDocument();
      expect(counter).toHaveAttribute('data-max-value', '16');
    });

    it('renders Counter with count display', () => {
      render(<Counter count={5} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-count', '5');
    });

    it('renders Counter with overflow state', () => {
      render(<Counter overflow={true} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-overflow', 'true');
    });

    it('renders Counter without overflow', () => {
      render(<Counter overflow={false} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-overflow', 'false');
    });

    it('renders with output signal HIGH', () => {
      render(<Counter outputSignal={true} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-output-signal', 'true');
    });

    it('renders with output signal LOW', () => {
      render(<Counter outputSignal={false} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-output-signal', 'false');
    });

    it('shows COUNTER label', () => {
      render(<Counter showLabel={true} />);
      
      const label = screen.getByText('COUNTER');
      expect(label).toBeInTheDocument();
    });

    it('hides COUNTER label when showLabel is false', () => {
      render(<Counter showLabel={false} />);
      
      expect(screen.queryByText('COUNTER')).not.toBeInTheDocument();
    });
  });

  describe('Data attributes', () => {
    it('has correct component type', () => {
      render(<Counter />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-component-type', 'COUNTER');
    });

    it('updates max-value attribute', () => {
      render(<Counter maxValue={12} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-max-value', '12');
    });

    it('updates count attribute', () => {
      render(<Counter count={7} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-count', '7');
    });

    it('updates overflow attribute', () => {
      render(<Counter overflow={true} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-overflow', 'true');
    });

    it('updates overflow=false correctly', () => {
      render(<Counter overflow={false} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveAttribute('data-overflow', 'false');
    });
  });

  describe('Position and size', () => {
    it('applies custom position', () => {
      render(<Counter position={{ x: 50, y: 100 }} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveStyle({ transform: 'translate(50px, 100px)' });
    });

    it('applies custom size', () => {
      render(<Counter size={{ width: 100, height: 80 }} showLabel={false} />);
      
      const counter = document.body.querySelector('[data-component-type="COUNTER"]');
      expect(counter).toHaveStyle({ width: '100px', height: '80px' });
    });
  });

  describe('Signal colors', () => {
    it('shows LOW color when count is 0', () => {
      render(<Counter count={0} />);
      
      const label = screen.getByText('COUNTER');
      expect(label).toHaveClass('text-gray-400');
    });

    it('shows HIGH color when count > 0', () => {
      render(<Counter count={1} />);
      
      const label = screen.getByText('COUNTER');
      expect(label).toHaveClass('text-green-400');
    });
  });
});
