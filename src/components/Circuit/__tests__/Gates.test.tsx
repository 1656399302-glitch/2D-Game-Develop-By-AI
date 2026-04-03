/**
 * Gates Component Tests
 * 
 * Round 121: Circuit Simulation Engine
 * 
 * Tests for logic gate components rendering and labels.
 */

import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Gate, GateSelector, ANDGate, ORGate, NOTGate, NANDGate, NORGate, XORGate, XNORGate } from '../Gates';
import { GateType } from '../../types/circuit';

// ============================================================================
// Gate Component Tests
// ============================================================================

describe('Gate Component', () => {
  describe('AND Gate', () => {
    it('renders AND gate with correct label', () => {
      render(<Gate gateType="AND" />);
      
      const label = screen.getByText('AND');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('data-gate-label', 'AND');
    });

    it('renders AND gate with LOW output state', () => {
      render(<Gate gateType="AND" outputSignal={false} />);
      
      const gateContainer = document.body.querySelector('[data-gate-type="AND"]');
      expect(gateContainer).toHaveAttribute('data-output-signal', 'false');
    });

    it('renders AND gate with HIGH output state', () => {
      render(<Gate gateType="AND" outputSignal={true} />);
      
      const gateContainer = document.body.querySelector('[data-gate-type="AND"]');
      expect(gateContainer).toHaveAttribute('data-output-signal', 'true');
    });
  });

  describe('OR Gate', () => {
    it('renders OR gate with correct label', () => {
      render(<Gate gateType="OR" />);
      
      const label = screen.getByText('OR');
      expect(label).toBeInTheDocument();
    });
  });

  describe('NOT Gate', () => {
    it('renders NOT gate with correct label', () => {
      render(<Gate gateType="NOT" />);
      
      const label = screen.getByText('NOT');
      expect(label).toBeInTheDocument();
    });
  });

  describe('XOR Gate', () => {
    it('renders XOR gate with correct label', () => {
      render(<Gate gateType="XOR" />);
      
      const label = screen.getByText('XOR');
      expect(label).toBeInTheDocument();
    });
  });

  describe('NAND Gate', () => {
    it('renders NAND gate with correct label', () => {
      render(<Gate gateType="NAND" />);
      
      const label = screen.getByText('NAND');
      expect(label).toBeInTheDocument();
    });
  });

  describe('NOR Gate', () => {
    it('renders NOR gate with correct label', () => {
      render(<Gate gateType="NOR" />);
      
      const label = screen.getByText('NOR');
      expect(label).toBeInTheDocument();
    });
  });

  describe('XNOR Gate', () => {
    it('renders XNOR gate with correct label', () => {
      render(<Gate gateType="XNOR" />);
      
      const label = screen.getByText('XNOR');
      expect(label).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Individual Gate Component Tests
// ============================================================================

describe('Individual Gate Components', () => {
  it('ANDGate renders with AND label', () => {
    render(<ANDGate />);
    expect(screen.getByText('AND')).toBeInTheDocument();
  });

  it('ORGate renders with OR label', () => {
    render(<ORGate />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('NOTGate renders with NOT label', () => {
    render(<NOTGate />);
    expect(screen.getByText('NOT')).toBeInTheDocument();
  });

  it('NANDGate renders with NAND label', () => {
    render(<NANDGate />);
    expect(screen.getByText('NAND')).toBeInTheDocument();
  });

  it('NORGate renders with NOR label', () => {
    render(<NORGate />);
    expect(screen.getByText('NOR')).toBeInTheDocument();
  });

  it('XORGate renders with XOR label', () => {
    render(<XORGate />);
    expect(screen.getByText('XOR')).toBeInTheDocument();
  });

  it('XNORGate renders with XNOR label', () => {
    render(<XNORGate />);
    expect(screen.getByText('XNOR')).toBeInTheDocument();
  });
});

// ============================================================================
// Gate SVG Shape Tests
// ============================================================================

describe('Gate SVG Shapes', () => {
  it('AND gate has SVG shape', () => {
    const { container } = render(<Gate gateType="AND" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('OR gate has SVG shape', () => {
    const { container } = render(<Gate gateType="OR" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('NOT gate has SVG shape', () => {
    const { container } = render(<Gate gateType="NOT" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('XOR gate has SVG shape', () => {
    const { container } = render(<Gate gateType="XOR" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('NAND gate has SVG shape', () => {
    const { container } = render(<Gate gateType="NAND" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('NOR gate has SVG shape', () => {
    const { container } = render(<Gate gateType="NOR" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('XNOR gate has SVG shape', () => {
    const { container } = render(<Gate gateType="XNOR" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});

// ============================================================================
// Gate Selector Tests
// ============================================================================

describe('GateSelector Component', () => {
  it('renders all 7 gate type buttons', () => {
    const mockOnSelect = () => {};
    render(<GateSelector onSelectGate={mockOnSelect} />);
    
    // Get all buttons within gate selector
    const buttons = document.body.querySelectorAll('[data-gate-button]');
    expect(buttons.length).toBe(7);
  });

  it('calls onSelectGate when AND button is clicked', () => {
    const mockOnSelect = vi.fn();
    render(<GateSelector onSelectGate={mockOnSelect} />);
    
    const andButton = document.body.querySelector('[data-gate-button="AND"]');
    andButton?.click();
    
    expect(mockOnSelect).toHaveBeenCalledWith('AND');
  });

  it('calls onSelectGate when OR button is clicked', () => {
    const mockOnSelect = vi.fn();
    render(<GateSelector onSelectGate={mockOnSelect} />);
    
    const orButton = document.body.querySelector('[data-gate-button="OR"]');
    orButton?.click();
    
    expect(mockOnSelect).toHaveBeenCalledWith('OR');
  });

  it('highlights selected gate', () => {
    const mockOnSelect = () => {};
    render(<GateSelector onSelectGate={mockOnSelect} selectedGate="OR" />);
    
    const orButton = document.body.querySelector('[data-gate-button="OR"]');
    expect(orButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows correct gate count', () => {
    const mockOnSelect = () => {};
    render(<GateSelector onSelectGate={mockOnSelect} />);
    
    const buttons = document.body.querySelectorAll('[data-gate-button]');
    expect(buttons.length).toBe(7);
  });
});

// ============================================================================
// Gate Props Tests
// ============================================================================

describe('Gate Props', () => {
  it('accepts custom position', () => {
    render(<Gate gateType="AND" position={{ x: 100, y: 200 }} />);
    
    const gate = document.body.querySelector('[data-gate-type="AND"]');
    expect(gate).toHaveStyle({ transform: 'translate(100px, 200px)' });
  });

  it('accepts custom size', () => {
    render(<Gate gateType="AND" size={{ width: 100, height: 80 }} showLabel={false} />);
    
    // When showLabel is false, height is just the gate height
    const gate = document.body.querySelector('[data-gate-type="AND"]');
    expect(gate).toHaveStyle({ width: '100px', height: '80px' });
  });

  it('hides label when showLabel is false', () => {
    render(<Gate gateType="AND" showLabel={false} />);
    
    expect(screen.queryByText('AND')).not.toBeInTheDocument();
  });

  it('shows label when showLabel is true (default)', () => {
    render(<Gate gateType="AND" showLabel={true} />);
    
    expect(screen.getByText('AND')).toBeInTheDocument();
  });

  it('displays input signal indicators', () => {
    render(<Gate gateType="AND" inputSignals={[true, false]} />);
    
    // Check for elements with data-input-port attribute
    const indicators = document.body.querySelectorAll('[data-input-port]');
    expect(indicators.length).toBe(2);
  });

  it('shows LOW output color for false signal', () => {
    render(<Gate gateType="AND" outputSignal={false} />);
    
    const label = screen.getByText('AND');
    expect(label).toHaveClass('text-gray-400');
  });

  it('shows HIGH output color for true signal', () => {
    render(<Gate gateType="AND" outputSignal={true} />);
    
    const label = screen.getByText('AND');
    expect(label).toHaveClass('text-green-400');
  });
});

// ============================================================================
// All 7 Gate Types Render Test
// ============================================================================

describe('All 7 Gate Types Render Correctly', () => {
  const gateTypes: GateType[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];

  gateTypes.forEach((gateType) => {
    it(`renders ${gateType} gate`, () => {
      render(<Gate gateType={gateType} />);
      
      // Check label exists
      const label = screen.getByText(gateType);
      expect(label).toBeInTheDocument();
      
      // Check SVG exists
      const svg = document.body.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
