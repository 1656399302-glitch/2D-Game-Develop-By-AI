/**
 * OutputNode Component Tests
 * 
 * Round 121: Circuit Simulation Engine
 * 
 * Tests for OutputNode LED state display.
 */

import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { OutputNode, LEDDisplay, LEDArray, DemoOutputNode } from '../OutputNode';

// ============================================================================
// Initial State Tests
// ============================================================================

describe('OutputNode Initial State', () => {
  afterEach(() => cleanup());

  it('renders with default LOW signal', () => {
    render(<OutputNode id="test-output" />);
    
    const outputNode = screen.getByTestId('output-node');
    expect(outputNode).toBeInTheDocument();
    expect(outputNode).toHaveAttribute('data-signal', 'LOW');
  });

  it('renders with HIGH signal when specified', () => {
    render(<OutputNode id="test-output" inputSignal={true} />);
    
    const outputNode = screen.getByTestId('output-node');
    expect(outputNode).toHaveAttribute('data-signal', 'HIGH');
  });

  it('renders with custom label', () => {
    render(<OutputNode id="test-output" label="OUT" />);
    
    expect(screen.getByText('OUT')).toBeInTheDocument();
  });

  it('displays LOW indicator by default', () => {
    render(<OutputNode id="test-output" />);
    
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('displays HIGH indicator when signal is true', () => {
    render(<OutputNode id="test-output" inputSignal={true} />);
    
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });
});

// ============================================================================
// LED Visual State Tests
// ============================================================================

describe('OutputNode LED Visual States', () => {
  afterEach(() => cleanup());

  it('LED appears off/gray when signal is LOW', () => {
    render(<OutputNode id="test-output" inputSignal={false} />);
    
    const led = screen.getByTestId('output-node').querySelector('[data-led]');
    expect(led).toBeInTheDocument();
  });

  it('LED appears green/lit when signal is HIGH', () => {
    render(<OutputNode id="test-output" inputSignal={true} />);
    
    const led = screen.getByTestId('output-node').querySelector('[data-led]');
    expect(led).toBeInTheDocument();
  });

  it('LED updates when signal changes from LOW to HIGH', () => {
    const { rerender } = render(<OutputNode id="test-output" inputSignal={false} />);
    
    expect(screen.getByTestId('output-node')).toHaveAttribute('data-signal', 'LOW');
    
    rerender(<OutputNode id="test-output" inputSignal={true} />);
    
    expect(screen.getByTestId('output-node')).toHaveAttribute('data-signal', 'HIGH');
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('LED updates when signal changes from HIGH to LOW', () => {
    const { rerender } = render(<OutputNode id="test-output" inputSignal={true} />);
    
    expect(screen.getByTestId('output-node')).toHaveAttribute('data-signal', 'HIGH');
    
    rerender(<OutputNode id="test-output" inputSignal={false} />);
    
    expect(screen.getByTestId('output-node')).toHaveAttribute('data-signal', 'LOW');
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('has input port indicator', () => {
    render(<OutputNode id="test-output" />);
    
    const inputPort = screen.getByTestId('output-node').querySelector('[data-input-port]');
    expect(inputPort).toBeInTheDocument();
  });

  it('has outer ring indicator', () => {
    render(<OutputNode id="test-output" />);
    
    const ring = screen.getByTestId('output-node').querySelector('[data-ring]');
    expect(ring).toBeInTheDocument();
  });
});

// ============================================================================
// Signal Update Tests
// ============================================================================

describe('OutputNode Signal Updates', () => {
  afterEach(() => cleanup());

  it('reflects LOW signal correctly', () => {
    render(<OutputNode id="test-output" inputSignal={false} />);
    
    const outputNode = screen.getByTestId('output-node');
    expect(outputNode).toHaveAttribute('data-signal', 'LOW');
  });

  it('reflects HIGH signal correctly', () => {
    render(<OutputNode id="test-output" inputSignal={true} />);
    
    const outputNode = screen.getByTestId('output-node');
    expect(outputNode).toHaveAttribute('data-signal', 'HIGH');
  });

  it('state indicator shows correct text for LOW', () => {
    render(<OutputNode id="test-output" inputSignal={false} />);
    
    const stateIndicator = screen.getByTestId('output-node').querySelector('[data-state-indicator]');
    expect(stateIndicator).toHaveTextContent('LOW');
  });

  it('state indicator shows correct text for HIGH', () => {
    render(<OutputNode id="test-output" inputSignal={true} />);
    
    const stateIndicator = screen.getByTestId('output-node').querySelector('[data-state-indicator]');
    expect(stateIndicator).toHaveTextContent('HIGH');
  });
});

// ============================================================================
// Negative Assertion Tests
// ============================================================================

describe('OutputNode Negative Assertions', () => {
  afterEach(() => cleanup());

  it('LED does not remain in previous state after signal changes to LOW', () => {
    const { rerender } = render(<OutputNode id="test-output" inputSignal={true} />);
    
    // Change to LOW
    rerender(<OutputNode id="test-output" inputSignal={false} />);
    
    // Should show LOW
    expect(screen.getByTestId('output-node')).toHaveAttribute('data-signal', 'LOW');
    expect(screen.queryByText('HIGH')).not.toBeInTheDocument();
  });

  it('LED does not remain in previous state after signal changes to HIGH', () => {
    const { rerender } = render(<OutputNode id="test-output" inputSignal={false} />);
    
    // Change to HIGH
    rerender(<OutputNode id="test-output" inputSignal={true} />);
    
    // Should show HIGH
    expect(screen.getByTestId('output-node')).toHaveAttribute('data-signal', 'HIGH');
  });

  it('signal updates immediately without delay', () => {
    const { rerender } = render(<OutputNode id="test-output" inputSignal={false} />);
    
    expect(screen.getByTestId('output-node')).toHaveAttribute('data-signal', 'LOW');
    
    rerender(<OutputNode id="test-output" inputSignal={true} />);
    
    // Should update immediately
    expect(screen.getByTestId('output-node')).toHaveAttribute('data-signal', 'HIGH');
  });
});

// ============================================================================
// LED Display Tests
// ============================================================================

describe('LEDDisplay Component', () => {
  afterEach(() => cleanup());

  it('renders with LOW signal', () => {
    render(<LEDDisplay signal={false} />);
    
    const ledDisplay = screen.getByTestId('led-display');
    expect(ledDisplay).toBeInTheDocument();
    expect(ledDisplay).toHaveAttribute('data-signal', 'LOW');
  });

  it('renders with HIGH signal', () => {
    render(<LEDDisplay signal={true} />);
    
    const ledDisplay = screen.getByTestId('led-display');
    expect(ledDisplay).toBeInTheDocument();
    expect(ledDisplay).toHaveAttribute('data-signal', 'HIGH');
  });

  it('renders with small size', () => {
    render(<LEDDisplay signal={true} size="small" />);
    expect(screen.getByTestId('led-display')).toBeInTheDocument();
  });

  it('renders with medium size', () => {
    render(<LEDDisplay signal={true} size="medium" />);
    expect(screen.getByTestId('led-display')).toBeInTheDocument();
  });

  it('renders with large size', () => {
    render(<LEDDisplay signal={true} size="large" />);
    expect(screen.getByTestId('led-display')).toBeInTheDocument();
  });

  it('respects showGlow prop', () => {
    render(<LEDDisplay signal={true} showGlow={true} />);
    expect(screen.getByTestId('led-display')).toBeInTheDocument();
  });
});

// ============================================================================
// LED Array Tests
// ============================================================================

describe('LEDArray Component', () => {
  afterEach(() => cleanup());

  it('renders multiple LEDs', () => {
    render(<LEDArray signals={[true, false, true]} />);
    
    const ledArray = screen.getByTestId('led-array');
    expect(ledArray).toBeInTheDocument();
  });

  it('renders with labels', () => {
    render(<LEDArray signals={[true, false]} labels={['A', 'B']} />);
    
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders empty array', () => {
    render(<LEDArray signals={[]} />);
    
    const ledArray = screen.getByTestId('led-array');
    expect(ledArray).toBeInTheDocument();
  });
});

// ============================================================================
// Demo OutputNode Tests
// ============================================================================

describe('DemoOutputNode', () => {
  afterEach(() => cleanup());

  it('renders demo with both states', () => {
    render(<DemoOutputNode id="demo-output" label="OUT" />);
    
    // Should show two outputs (low and high states side by side)
    const outputNodes = screen.getAllByTestId('output-node');
    expect(outputNodes.length).toBe(2);
  });

  it('renders with custom label', () => {
    render(<DemoOutputNode id="demo-output" label="LED1" />);
    
    expect(screen.getByText('LED1 (Low)')).toBeInTheDocument();
    expect(screen.getByText('LED1 (High)')).toBeInTheDocument();
  });
});

// ============================================================================
// Position Tests
// ============================================================================

describe('OutputNode Position', () => {
  afterEach(() => cleanup());

  it('accepts custom position', () => {
    render(<OutputNode id="test-output" position={{ x: 100, y: 200 }} />);
    
    const outputNode = screen.getByTestId('output-node');
    expect(outputNode).toHaveStyle({ transform: 'translate(100px, 200px)' });
  });

  it('defaults to origin', () => {
    render(<OutputNode id="test-output" />);
    
    const outputNode = screen.getByTestId('output-node');
    expect(outputNode).toHaveStyle({ transform: 'translate(0px, 0px)' });
  });
});

// ============================================================================
// Output Node Data Attribute Tests
// ============================================================================

describe('OutputNode Data Attributes', () => {
  afterEach(() => cleanup());

  it('has correct data-output-id', () => {
    render(<OutputNode id="my-output" />);
    
    const outputNode = screen.getByTestId('output-node');
    expect(outputNode).toHaveAttribute('data-output-id', 'my-output');
  });

  it('has correct data-signal based on inputSignal prop', () => {
    render(<OutputNode id="test" inputSignal={true} />);
    expect(screen.getByTestId('output-node')).toHaveAttribute('data-signal', 'HIGH');
    
    cleanup();
    
    render(<OutputNode id="test" inputSignal={false} />);
    expect(screen.getByTestId('output-node')).toHaveAttribute('data-signal', 'LOW');
  });
});
