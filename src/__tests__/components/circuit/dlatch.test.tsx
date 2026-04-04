/**
 * D Latch Component Tests
 * 
 * Round 128: Sequential Components
 * 
 * Tests for D Latch component rendering and behavior.
 */

import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DLatch } from '../../../components/Circuit/DLatch';

describe('D Latch Component', () => {
  describe('Rendering', () => {
    it('renders D Latch with default props', () => {
      render(<DLatch />);
      
      const latch = document.body.querySelector('[data-component-type="D_LATCH"]');
      expect(latch).toBeInTheDocument();
    });

    it('renders D Latch with Q=HIGH', () => {
      render(<DLatch q={true} />);
      
      const latch = document.body.querySelector('[data-component-type="D_LATCH"]');
      expect(latch).toHaveAttribute('data-q', 'true');
    });

    it('renders D Latch with Q=LOW', () => {
      render(<DLatch q={false} />);
      
      const latch = document.body.querySelector('[data-component-type="D_LATCH"]');
      expect(latch).toHaveAttribute('data-q', 'false');
    });

    it('renders D Latch with enable signal', () => {
      render(<DLatch enableSignal={true} />);
      
      const latch = document.body.querySelector('[data-component-type="D_LATCH"]');
      expect(latch).toHaveAttribute('data-enable', 'true');
    });

    it('renders D Latch without enable signal', () => {
      render(<DLatch enableSignal={false} />);
      
      const latch = document.body.querySelector('[data-component-type="D_LATCH"]');
      expect(latch).toHaveAttribute('data-enable', 'false');
    });

    it('shows D LATCH label', () => {
      render(<DLatch showLabel={true} />);
      
      const label = screen.getByText('D LATCH');
      expect(label).toBeInTheDocument();
    });

    it('hides label when showLabel is false', () => {
      render(<DLatch showLabel={false} />);
      
      expect(screen.queryByText('D LATCH')).not.toBeInTheDocument();
    });
  });

  describe('Data attributes', () => {
    it('has correct component type', () => {
      render(<DLatch />);
      
      const latch = document.body.querySelector('[data-component-type="D_LATCH"]');
      expect(latch).toHaveAttribute('data-component-type', 'D_LATCH');
    });

    it('updates q attribute', () => {
      render(<DLatch q={true} />);
      
      const latch = document.body.querySelector('[data-component-type="D_LATCH"]');
      expect(latch).toHaveAttribute('data-q', 'true');
    });

    it('updates q-bar attribute', () => {
      render(<DLatch qBar={false} />);
      
      const latch = document.body.querySelector('[data-component-type="D_LATCH"]');
      expect(latch).toHaveAttribute('data-q-bar', 'false');
    });

    it('updates enable attribute', () => {
      render(<DLatch enableSignal={true} />);
      
      const latch = document.body.querySelector('[data-component-type="D_LATCH"]');
      expect(latch).toHaveAttribute('data-enable', 'true');
    });
  });

  describe('Position and size', () => {
    it('applies custom position', () => {
      render(<DLatch position={{ x: 60, y: 120 }} />);
      
      const latch = document.body.querySelector('[data-component-type="D_LATCH"]');
      expect(latch).toHaveStyle({ transform: 'translate(60px, 120px)' });
    });

    it('applies custom size', () => {
      render(<DLatch size={{ width: 100, height: 80 }} showLabel={false} />);
      
      const latch = document.body.querySelector('[data-component-type="D_LATCH"]');
      expect(latch).toHaveStyle({ width: '100px', height: '80px' });
    });
  });

  describe('Signal colors', () => {
    it('shows LOW color when Q is false', () => {
      render(<DLatch q={false} />);
      
      const label = screen.getByText('D LATCH');
      expect(label).toHaveClass('text-gray-400');
    });

    it('shows HIGH color when Q is true', () => {
      render(<DLatch q={true} />);
      
      const label = screen.getByText('D LATCH');
      expect(label).toHaveClass('text-green-400');
    });
  });
});
