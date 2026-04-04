/**
 * SR Latch Component Tests
 * 
 * Round 128: Sequential Components
 * 
 * Tests for SR Latch component rendering and behavior.
 */

import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SRLatch } from '../../../components/Circuit/SRLatch';

describe('SR Latch Component', () => {
  describe('Rendering', () => {
    it('renders SR Latch with default props', () => {
      render(<SRLatch />);
      
      const latch = document.body.querySelector('[data-component-type="SR_LATCH"]');
      expect(latch).toBeInTheDocument();
    });

    it('renders SR Latch with Q=HIGH', () => {
      render(<SRLatch q={true} />);
      
      const latch = document.body.querySelector('[data-component-type="SR_LATCH"]');
      expect(latch).toHaveAttribute('data-q', 'true');
    });

    it('renders SR Latch with Q=LOW', () => {
      render(<SRLatch q={false} />);
      
      const latch = document.body.querySelector('[data-component-type="SR_LATCH"]');
      expect(latch).toHaveAttribute('data-q', 'false');
    });

    it('renders SR Latch with invalid state', () => {
      render(<SRLatch invalidState={true} />);
      
      const latch = document.body.querySelector('[data-component-type="SR_LATCH"]');
      expect(latch).toHaveAttribute('data-invalid-state', 'true');
    });

    it('renders without invalid state', () => {
      render(<SRLatch invalidState={false} />);
      
      const latch = document.body.querySelector('[data-component-type="SR_LATCH"]');
      expect(latch).toHaveAttribute('data-invalid-state', 'false');
    });

    it('shows SR LATCH label when not in error state', () => {
      render(<SRLatch invalidState={false} showLabel={true} />);
      
      const label = screen.getByText('SR LATCH');
      expect(label).toBeInTheDocument();
    });

    it('shows SR ERR label when in error state', () => {
      render(<SRLatch invalidState={true} showLabel={true} />);
      
      const label = screen.getByText('SR ERR');
      expect(label).toBeInTheDocument();
    });

    it('hides label when showLabel is false', () => {
      render(<SRLatch showLabel={false} />);
      
      expect(screen.queryByText('SR LATCH')).not.toBeInTheDocument();
      expect(screen.queryByText('SR ERR')).not.toBeInTheDocument();
    });
  });

  describe('Data attributes', () => {
    it('has correct component type', () => {
      render(<SRLatch />);
      
      const latch = document.body.querySelector('[data-component-type="SR_LATCH"]');
      expect(latch).toHaveAttribute('data-component-type', 'SR_LATCH');
    });

    it('updates q attribute', () => {
      render(<SRLatch q={true} />);
      
      const latch = document.body.querySelector('[data-component-type="SR_LATCH"]');
      expect(latch).toHaveAttribute('data-q', 'true');
    });

    it('updates q-bar attribute', () => {
      render(<SRLatch qBar={false} />);
      
      const latch = document.body.querySelector('[data-component-type="SR_LATCH"]');
      expect(latch).toHaveAttribute('data-q-bar', 'false');
    });

    it('updates invalid-state attribute', () => {
      render(<SRLatch invalidState={true} />);
      
      const latch = document.body.querySelector('[data-component-type="SR_LATCH"]');
      expect(latch).toHaveAttribute('data-invalid-state', 'true');
    });
  });

  describe('Position and size', () => {
    it('applies custom position', () => {
      render(<SRLatch position={{ x: 75, y: 150 }} />);
      
      const latch = document.body.querySelector('[data-component-type="SR_LATCH"]');
      expect(latch).toHaveStyle({ transform: 'translate(75px, 150px)' });
    });

    it('applies custom size', () => {
      render(<SRLatch size={{ width: 100, height: 80 }} showLabel={false} />);
      
      const latch = document.body.querySelector('[data-component-type="SR_LATCH"]');
      expect(latch).toHaveStyle({ width: '100px', height: '80px' });
    });
  });

  describe('Signal colors', () => {
    it('shows LOW color when Q is false', () => {
      render(<SRLatch q={false} />);
      
      const label = screen.getByText('SR LATCH');
      expect(label).toHaveClass('text-gray-400');
    });

    it('shows HIGH color when Q is true', () => {
      render(<SRLatch q={true} />);
      
      const label = screen.getByText('SR LATCH');
      expect(label).toHaveClass('text-green-400');
    });

    it('shows ERROR color when invalid state', () => {
      render(<SRLatch invalidState={true} />);
      
      const label = screen.getByText('SR ERR');
      expect(label).toHaveClass('text-red-400');
    });
  });
});
