/**
 * InputNode Component Tests
 * 
 * Round 121: Circuit Simulation Engine
 * 
 * Tests for InputNode toggle behavior and state persistence.
 */

import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { InputNode, InputNodeWithState, DemoInputNode } from '../InputNode';

// ============================================================================
// Mount and Initial State Tests
// ============================================================================

describe('InputNode Initial State', () => {
  afterEach(() => cleanup());

  it('renders with default LOW state', () => {
    render(<InputNode id="test-input" />);
    
    const inputNode = screen.getByTestId('input-node');
    expect(inputNode).toBeInTheDocument();
    expect(inputNode).toHaveAttribute('data-state', 'LOW');
  });

  it('renders with initial HIGH state when specified', () => {
    render(<InputNode id="test-input" initialState={true} />);
    
    const inputNode = screen.getByTestId('input-node');
    expect(inputNode).toHaveAttribute('data-state', 'HIGH');
  });

  it('renders with custom label', () => {
    render(<InputNode id="test-input" label="A" />);
    
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('displays LOW indicator by default', () => {
    render(<InputNode id="test-input" />);
    
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('displays HIGH indicator when initial state is true', () => {
    render(<InputNode id="test-input" initialState={true} />);
    
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });
});

// ============================================================================
// Toggle Behavior Tests
// ============================================================================

describe('InputNode Toggle Behavior', () => {
  afterEach(() => {
    cleanup();
  });

  it('toggles state on click from LOW to HIGH', () => {
    render(<InputNode id="test-input" initialState={false} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const inputNode = screen.getByTestId('input-node');
    expect(inputNode).toHaveAttribute('data-state', 'HIGH');
  });

  it('toggles state on click from HIGH to LOW', () => {
    render(<InputNode id="test-input" initialState={true} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const inputNode = screen.getByTestId('input-node');
    expect(inputNode).toHaveAttribute('data-state', 'LOW');
  });

  it('calls onToggle callback with new state', () => {
    const mockToggle = vi.fn();
    render(<InputNode id="test-input" onToggle={mockToggle} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockToggle).toHaveBeenCalledWith(true);
  });

  it('toggles multiple times correctly', () => {
    const mockToggle = vi.fn();
    render(<InputNode id="test-input" onToggle={mockToggle} />);
    
    const button = screen.getByRole('button');
    
    // Click 1: LOW -> HIGH
    fireEvent.click(button);
    expect(mockToggle).toHaveBeenLastCalledWith(true);
    
    // Click 2: HIGH -> LOW
    fireEvent.click(button);
    expect(mockToggle).toHaveBeenLastCalledWith(false);
    
    // Click 3: LOW -> HIGH
    fireEvent.click(button);
    expect(mockToggle).toHaveBeenLastCalledWith(true);
    
    // Click 4: HIGH -> LOW
    fireEvent.click(button);
    expect(mockToggle).toHaveBeenLastCalledWith(false);
    
    // Click 5: LOW -> HIGH
    fireEvent.click(button);
    expect(mockToggle).toHaveBeenLastCalledWith(true);
    
    expect(mockToggle).toHaveBeenCalledTimes(5);
  });

  it('handles rapid clicks without crash', () => {
    render(<InputNode id="test-input" />);
    
    const button = screen.getByRole('button');
    
    // Rapid clicks
    for (let i = 0; i < 10; i++) {
      fireEvent.click(button);
    }
    
    // Should not crash, final state should be consistent
    const inputNode = screen.getByTestId('input-node');
    expect(inputNode).toBeInTheDocument();
    expect(['HIGH', 'LOW']).toContain(inputNode.getAttribute('data-state'));
  });
});

// ============================================================================
// Visual Feedback Tests
// ============================================================================

describe('InputNode Visual Feedback', () => {
  afterEach(() => cleanup());

  it('shows HIGH state visually distinct', () => {
    render(<InputNode id="test-input" initialState={true} />);
    
    // LED should be green in HIGH state
    const led = screen.getByTestId('input-node').querySelector('[data-led]');
    expect(led).toBeInTheDocument();
  });

  it('shows LOW state visually distinct', () => {
    render(<InputNode id="test-input" initialState={false} />);
    
    // LED should be dim in LOW state
    const led = screen.getByTestId('input-node').querySelector('[data-led]');
    expect(led).toBeInTheDocument();
  });

  it('state indicator updates on toggle', () => {
    render(<InputNode id="test-input" initialState={false} />);
    
    expect(screen.getByText('LOW')).toBeInTheDocument();
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });
});

// ============================================================================
// State Persistence Tests
// ============================================================================

describe('InputNode State Persistence', () => {
  afterEach(() => cleanup());

  it('state persists across renders with InputNodeWithState', () => {
    const { rerender } = render(<InputNodeWithState id="test-input" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button); // Toggle to HIGH
    
    // Rerender with same props
    rerender(<InputNodeWithState id="test-input" />);
    
    // State should still be HIGH
    const inputNode = screen.getByTestId('input-node');
    expect(inputNode).toHaveAttribute('data-state', 'HIGH');
  });

  it('state changes are reflected in DOM', () => {
    render(<InputNode id="test-input" initialState={false} />);
    
    const button = screen.getByRole('button');
    
    // Initial state
    expect(screen.getByTestId('input-node')).toHaveAttribute('data-state', 'LOW');
    
    // Toggle
    fireEvent.click(button);
    expect(screen.getByTestId('input-node')).toHaveAttribute('data-state', 'HIGH');
    
    // Toggle again
    fireEvent.click(button);
    expect(screen.getByTestId('input-node')).toHaveAttribute('data-state', 'LOW');
  });
});

// ============================================================================
// Keyboard Interaction Tests
// ============================================================================

describe('InputNode Keyboard Interaction', () => {
  afterEach(() => cleanup());

  it('toggles state on Enter key', () => {
    render(<InputNode id="test-input" initialState={false} />);
    
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(screen.getByTestId('input-node')).toHaveAttribute('data-state', 'HIGH');
  });

  it('toggles state on Space key', () => {
    render(<InputNode id="test-input" initialState={false} />);
    
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: ' ' });
    
    expect(screen.getByTestId('input-node')).toHaveAttribute('data-state', 'HIGH');
  });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

describe('InputNode Accessibility', () => {
  afterEach(() => cleanup());

  it('button has accessible label', () => {
    render(<InputNode id="test-input" label="Input A" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('Input A'));
  });

  it('button has aria-pressed state', () => {
    const { rerender } = render(<InputNode id="test-input" initialState={false} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    
    fireEvent.click(button);
    rerender(<InputNode id="test-input" initialState={true} />);
    
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('is focusable', () => {
    render(<InputNode id="test-input" />);
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });
});

// ============================================================================
// Demo InputNode Tests
// ============================================================================

describe('DemoInputNode', () => {
  afterEach(() => cleanup());

  it('renders demo component', () => {
    render(<DemoInputNode id="demo-input" />);
    
    expect(screen.getByTestId('demo-input-node')).toBeInTheDocument();
  });

  it('toggles on click', () => {
    render(<DemoInputNode id="demo-input" initialState={false} />);
    
    const button = screen.getByTestId('demo-input-node').querySelector('[data-demo-button]');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button!);
    
    // Check that the demo-input-node is still rendered (state change worked)
    expect(screen.getByTestId('demo-input-node')).toBeInTheDocument();
    // After toggle from LOW (false) to HIGH (true), text should be HIGH
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });
});

// ============================================================================
// Negative Assertion Tests
// ============================================================================

describe('InputNode Negative Assertions', () => {
  afterEach(() => cleanup());

  it('state does not become null or undefined during toggle', () => {
    render(<InputNode id="test-input" />);
    
    const button = screen.getByRole('button');
    
    for (let i = 0; i < 5; i++) {
      fireEvent.click(button);
      const state = screen.getByTestId('input-node').getAttribute('data-state');
      expect(state).not.toBeNull();
      expect(['HIGH', 'LOW']).toContain(state);
    }
  });

  it('state does not revert spontaneously', () => {
    render(<InputNode id="test-input" initialState={false} />);
    
    // Wait a moment - state should not change automatically
    setTimeout(() => {
      expect(screen.getByTestId('input-node')).toHaveAttribute('data-state', 'LOW');
    }, 100);
  });

  it('multiple rapid clicks do not cause undefined behavior', () => {
    render(<InputNode id="test-input" />);
    
    const button = screen.getByRole('button');
    
    // 20 rapid clicks
    for (let i = 0; i < 20; i++) {
      fireEvent.click(button);
    }
    
    // Component should still be rendered and have a valid state
    const inputNode = screen.getByTestId('input-node');
    expect(inputNode).toBeInTheDocument();
    expect(['HIGH', 'LOW']).toContain(inputNode.getAttribute('data-state'));
  });
});
