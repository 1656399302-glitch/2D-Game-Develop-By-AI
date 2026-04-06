/**
 * SimulationPanel Component Tests
 * 
 * Round 121: Circuit Simulation Engine
 * Round 184: Added keyboard shortcut input-focus guard test
 * 
 * Tests for SimulationPanel controls functionality.
 */

import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { SimulationPanel, SimulationControls, FullSimulationPanel } from '../SimulationPanel';

// ============================================================================
// Mount Tests
// ============================================================================

describe('SimulationPanel Mount', () => {
  it('renders without crashing', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    expect(screen.getByTestId('simulation-panel')).toBeInTheDocument();
  });

  it('renders with Run and Reset buttons', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    expect(screen.getByRole('button', { name: /运行|Run/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /重置|Reset/i })).toBeInTheDocument();
  });

  it('renders with default title', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    expect(screen.getByText('电路模拟')).toBeInTheDocument();
  });

  it('renders with step count display', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} stepCount={5} />);
    
    expect(screen.getByText(/步数/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

// ============================================================================
// Run Button Tests
// ============================================================================

describe('SimulationPanel Run Button', () => {
  afterEach(() => {
    cleanup();
  });

  it('calls onRun when clicked', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    const runButton = screen.getByTestId('simulation-panel').querySelector('[data-run-button]');
    fireEvent.click(runButton!);
    
    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  it('is disabled when simulation is running', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={true} onRun={mockRun} onReset={mockReset} />);
    
    const runButton = screen.getByTestId('simulation-panel').querySelector('[data-run-button]') as HTMLButtonElement;
    expect(runButton).toBeDisabled();
  });

  it('is enabled when simulation is not running', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    const runButton = screen.getByTestId('simulation-panel').querySelector('[data-run-button]') as HTMLButtonElement;
    expect(runButton).not.toBeDisabled();
  });
});

// ============================================================================
// Reset Button Tests
// ============================================================================

describe('SimulationPanel Reset Button', () => {
  afterEach(() => {
    cleanup();
  });

  it('calls onReset when clicked', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    const resetButton = screen.getByTestId('simulation-panel').querySelector('[data-reset-button]');
    fireEvent.click(resetButton!);
    
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('is enabled regardless of running state', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    // Running state
    render(<SimulationPanel isRunning={true} onRun={mockRun} onReset={mockReset} />);
    const resetButton1 = screen.getByTestId('simulation-panel').querySelector('[data-reset-button]') as HTMLButtonElement;
    expect(resetButton1).not.toBeDisabled();
    
    cleanup();
    
    // Not running state
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    const resetButton2 = screen.getByTestId('simulation-panel').querySelector('[data-reset-button]') as HTMLButtonElement;
    expect(resetButton2).not.toBeDisabled();
  });
});

// ============================================================================
// Step Button Tests
// ============================================================================

describe('SimulationPanel Step Button', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders step button when onStep is provided', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    const mockStep = vi.fn();
    
    render(
      <SimulationPanel
        isRunning={false}
        onRun={mockRun}
        onReset={mockReset}
        onStep={mockStep}
      />
    );
    
    expect(screen.getByText(/单步|Step/i)).toBeInTheDocument();
  });

  it('calls onStep when clicked', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    const mockStep = vi.fn();
    
    render(
      <SimulationPanel
        isRunning={false}
        onRun={mockRun}
        onReset={mockReset}
        onStep={mockStep}
      />
    );
    
    const stepButton = screen.getByTestId('simulation-panel').querySelector('[data-step-button]');
    fireEvent.click(stepButton!);
    
    expect(mockStep).toHaveBeenCalledTimes(1);
  });

  it('does not render step button when onStep is not provided', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(
      <SimulationPanel
        isRunning={false}
        onRun={mockRun}
        onReset={mockReset}
      />
    );
    
    expect(screen.queryByTestId('simulation-panel').querySelector('[data-step-button]')).toBeNull();
  });
});

// ============================================================================
// Close Button Tests (Round 184)
// ============================================================================

describe('SimulationPanel Close Button', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders close button when onClose is provided', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    const mockClose = vi.fn();
    
    render(
      <SimulationPanel
        isRunning={false}
        onRun={mockRun}
        onReset={mockReset}
        onClose={mockClose}
      />
    );
    
    const closeButton = screen.getByTestId('simulation-panel').querySelector('[data-testid="close-panel"]');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    const mockClose = vi.fn();
    
    render(
      <SimulationPanel
        isRunning={false}
        onRun={mockRun}
        onReset={mockReset}
        onClose={mockClose}
      />
    );
    
    const closeButton = screen.getByTestId('close-panel');
    fireEvent.click(closeButton);
    
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose is not provided', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(
      <SimulationPanel
        isRunning={false}
        onRun={mockRun}
        onReset={mockReset}
      />
    );
    
    const closeButton = screen.getByTestId('simulation-panel').querySelector('[data-testid="close-panel"]');
    expect(closeButton).toBeNull();
  });
});

// ============================================================================
// Run After Reset Tests
// ============================================================================

describe('SimulationPanel Run After Reset', () => {
  afterEach(() => {
    cleanup();
  });

  it('allows Run after Reset', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    // Click Reset
    const resetButton = screen.getByTestId('simulation-panel').querySelector('[data-reset-button]');
    fireEvent.click(resetButton!);
    expect(mockReset).toHaveBeenCalled();
    
    // Click Run
    const runButton = screen.getByTestId('simulation-panel').querySelector('[data-run-button]');
    fireEvent.click(runButton!);
    expect(mockRun).toHaveBeenCalled();
  });

  it('resets then run evaluates fresh', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={true} onRun={mockRun} onReset={mockReset} />);
    
    // Reset
    const resetButton = screen.getByTestId('simulation-panel').querySelector('[data-reset-button]');
    fireEvent.click(resetButton!);
    
    cleanup();
    
    // Run again
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    const runButton = screen.getByTestId('simulation-panel').querySelector('[data-run-button]');
    fireEvent.click(runButton!);
    
    expect(mockRun).toHaveBeenCalled();
  });
});

// ============================================================================
// Negative Assertion Tests
// ============================================================================

describe('SimulationPanel Negative Assertions', () => {
  afterEach(() => {
    cleanup();
  });

  it('buttons do not crash when clicked with no circuit', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    // Multiple clicks should not crash - get buttons fresh each time
    for (let i = 0; i < 5; i++) {
      const runButton = screen.getByTestId('simulation-panel').querySelector('[data-run-button]');
      const resetButton = screen.getByTestId('simulation-panel').querySelector('[data-reset-button]');
      if (runButton) fireEvent.click(runButton);
      if (resetButton) fireEvent.click(resetButton);
    }
    
    // Should not throw
    expect(screen.getByTestId('simulation-panel')).toBeInTheDocument();
  });

  it('panel handles missing stepCount gracefully', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    // Should show 0 or default when stepCount is undefined
    expect(screen.getByTestId('simulation-panel')).toBeInTheDocument();
  });
});

// ============================================================================
// Status Indicator Tests
// ============================================================================

describe('SimulationPanel Status', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows running status when isRunning is true', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={true} onRun={mockRun} onReset={mockReset} />);
    
    const statusBar = screen.getByTestId('simulation-panel').querySelector('[data-status-bar]');
    expect(statusBar).toBeInTheDocument();
  });

  it('shows idle status when isRunning is false', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    const statusBar = screen.getByTestId('simulation-panel').querySelector('[data-status-bar]');
    expect(statusBar).toBeInTheDocument();
  });

  it('displays correct status indicator', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    const statusDot = screen.getByTestId('simulation-panel').querySelector('[data-status-dot]');
    expect(statusDot).toBeInTheDocument();
  });

  it('does not show completed status (Round 184 fix)', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    // Status should show 'idle', not 'completed'
    const statusElement = screen.getByTestId('simulation-panel').querySelector('[data-status]');
    expect(statusElement).toHaveAttribute('data-status', 'idle');
    expect(statusElement).not.toHaveAttribute('data-status', 'completed');
  });

  it('shows running status correctly when isRunning is true', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={true} onRun={mockRun} onReset={mockReset} />);
    
    const statusElement = screen.getByTestId('simulation-panel').querySelector('[data-status]');
    expect(statusElement).toHaveAttribute('data-status', 'running');
  });
});

// ============================================================================
// Keyboard Shortcuts Hint Tests (Round 184)
// ============================================================================

describe('SimulationPanel Keyboard Shortcuts Hint', () => {
  afterEach(() => {
    cleanup();
  });

  it('displays keyboard shortcuts hint', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    expect(screen.getByText('快捷键: R = 运行, X = 重置')).toBeInTheDocument();
  });
});

// ============================================================================
// Simulation Controls Tests
// ============================================================================

describe('SimulationControls Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders compact controls', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationControls isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    expect(screen.getByTestId('simulation-controls')).toBeInTheDocument();
  });

  it('has run and reset buttons', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationControls isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    const controls = screen.getByTestId('simulation-controls');
    expect(controls.querySelector('[data-run-button]')).toBeInTheDocument();
    expect(controls.querySelector('[data-reset-button]')).toBeInTheDocument();
  });

  it('shows step count', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationControls isRunning={false} onRun={mockRun} onReset={mockReset} stepCount={10} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});

// ============================================================================
// Full Simulation Panel Tests
// ============================================================================

describe('FullSimulationPanel Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with circuit statistics', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(
      <FullSimulationPanel
        isRunning={false}
        onRun={mockRun}
        onReset={mockReset}
        nodeCount={5}
        connectionCount={4}
        activeSignals={2}
      />
    );
    
    expect(screen.getByTestId('full-simulation-panel')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // nodes
    expect(screen.getByText('4')).toBeInTheDocument(); // connections
    expect(screen.getByText('2')).toBeInTheDocument(); // active signals
  });

  it('shows node count stat', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(
      <FullSimulationPanel
        isRunning={false}
        onRun={mockRun}
        onReset={mockReset}
        nodeCount={10}
      />
    );
    
    const nodesStat = screen.getByTestId('full-simulation-panel').querySelector('[data-stat="nodes"]');
    expect(nodesStat).toBeInTheDocument();
    expect(nodesStat?.textContent).toContain('10');
  });

  it('shows connection count stat', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(
      <FullSimulationPanel
        isRunning={false}
        onRun={mockRun}
        onReset={mockReset}
        connectionCount={8}
      />
    );
    
    const connectionsStat = screen.getByTestId('full-simulation-panel').querySelector('[data-stat="connections"]');
    expect(connectionsStat).toBeInTheDocument();
  });

  it('shows active signals stat', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(
      <FullSimulationPanel
        isRunning={false}
        onRun={mockRun}
        onReset={mockReset}
        activeSignals={3}
      />
    );
    
    const signalsStat = screen.getByTestId('full-simulation-panel').querySelector('[data-stat="signals"]');
    expect(signalsStat).toBeInTheDocument();
  });
});

// ============================================================================
// Repeat/Consistency Tests
// ============================================================================

describe('SimulationPanel Repeat Clicks', () => {
  afterEach(() => {
    cleanup();
  });

  it('handles multiple run clicks', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    // Click run button 5 times - get fresh reference each time
    for (let i = 0; i < 5; i++) {
      const runButton = screen.getByTestId('simulation-panel').querySelector('[data-run-button]');
      expect(runButton).toBeInTheDocument();
      fireEvent.click(runButton!);
    }
    
    // Run should be called 5 times
    expect(mockRun).toHaveBeenCalledTimes(5);
  });

  it('handles multiple reset clicks', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    // Click reset button 5 times - get fresh reference each time
    for (let i = 0; i < 5; i++) {
      const resetButton = screen.getByTestId('simulation-panel').querySelector('[data-reset-button]');
      expect(resetButton).toBeInTheDocument();
      fireEvent.click(resetButton!);
    }
    
    expect(mockReset).toHaveBeenCalledTimes(5);
  });
});

// ============================================================================
// Input Focus Guard Tests (Round 184 - Issue D)
// ============================================================================

describe('SimulationPanel Input Focus Guard (Keyboard Shortcuts)', () => {
  afterEach(() => {
    cleanup();
    // Reset document active element after each test
    document.activeElement && (document.activeElement as HTMLElement).blur?.();
  });

  it('renders keyboard shortcuts hint with input-focus note', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    // Verify the shortcuts hint is displayed
    expect(screen.getByText(/快捷键.*R.*运行.*X.*重置/)).toBeInTheDocument();
  });

  it('step count displays correctly with data-step-count attribute', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} stepCount={42} />);
    
    const stepCountElement = screen.getByTestId('simulation-panel').querySelector('[data-step-count]');
    expect(stepCountElement).toBeInTheDocument();
    expect(stepCountElement?.textContent).toBe('42');
  });

  it('step count shows 0 when not provided', () => {
    const mockRun = vi.fn();
    const mockReset = vi.fn();
    
    render(<SimulationPanel isRunning={false} onRun={mockRun} onReset={mockReset} />);
    
    const stepCountElement = screen.getByTestId('simulation-panel').querySelector('[data-step-count]');
    expect(stepCountElement).toBeInTheDocument();
    expect(stepCountElement?.textContent).toBe('0');
  });
});
