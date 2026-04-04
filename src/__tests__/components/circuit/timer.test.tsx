/**
 * Timer Component Tests
 * 
 * Round 128: Sequential Components
 * 
 * Tests for Timer component rendering and behavior.
 */

import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Timer } from '../../../components/Circuit/Timer';

describe('Timer Component', () => {
  describe('Rendering', () => {
    it('renders Timer with default props', () => {
      render(<Timer />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toBeInTheDocument();
    });

    it('renders Timer with custom delay', () => {
      render(<Timer delay={10} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toBeInTheDocument();
      expect(timer).toHaveAttribute('data-delay', '10');
    });

    it('renders Timer with tick count display', () => {
      render(<Timer tickCount={3} delay={5} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveAttribute('data-tick-count', '3');
    });

    it('renders Timer with done state', () => {
      render(<Timer done={true} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveAttribute('data-done', 'true');
    });

    it('renders Timer with isActive state', () => {
      render(<Timer done={false} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toBeInTheDocument();
    });

    it('renders with output signal HIGH', () => {
      render(<Timer outputSignal={true} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveAttribute('data-output-signal', 'true');
    });

    it('renders with output signal LOW', () => {
      render(<Timer outputSignal={false} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveAttribute('data-output-signal', 'false');
    });

    it('shows TIMER label', () => {
      render(<Timer showLabel={true} />);
      
      const label = screen.getByText('TIMER');
      expect(label).toBeInTheDocument();
    });

    it('hides TIMER label when showLabel is false', () => {
      render(<Timer showLabel={false} />);
      
      expect(screen.queryByText('TIMER')).not.toBeInTheDocument();
    });
  });

  describe('Data attributes', () => {
    it('has correct component type', () => {
      render(<Timer />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveAttribute('data-component-type', 'TIMER');
    });

    it('updates delay attribute', () => {
      render(<Timer delay={8} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveAttribute('data-delay', '8');
    });

    it('updates tick-count attribute', () => {
      render(<Timer tickCount={2} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveAttribute('data-tick-count', '2');
    });

    it('updates done attribute', () => {
      render(<Timer done={true} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveAttribute('data-done', 'true');
    });

    it('updates done=false correctly', () => {
      render(<Timer done={false} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveAttribute('data-done', 'false');
    });
  });

  describe('Position and size', () => {
    it('applies custom position', () => {
      render(<Timer position={{ x: 100, y: 200 }} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveStyle({ transform: 'translate(100px, 200px)' });
    });

    it('applies custom size', () => {
      render(<Timer size={{ width: 100, height: 80 }} showLabel={false} />);
      
      const timer = document.body.querySelector('[data-component-type="TIMER"]');
      expect(timer).toHaveStyle({ width: '100px', height: '80px' });
    });
  });

  describe('Signal colors', () => {
    it('shows LOW color when output is false', () => {
      render(<Timer outputSignal={false} />);
      
      const label = screen.getByText('TIMER');
      expect(label).toHaveClass('text-gray-400');
    });

    it('shows HIGH color when done is true', () => {
      render(<Timer done={true} />);
      
      const label = screen.getByText('TIMER');
      expect(label).toHaveClass('text-green-400');
    });
  });
});
