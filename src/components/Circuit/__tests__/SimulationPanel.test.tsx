/**
 * SimulationPanel Component Tests
 * 
 * Round 121: Circuit Simulation Engine
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
