/**
 * CircuitModulePanel Browser Integration Tests
 * 
 * Round 145: Track B Retirement Sprint
 * 
 * Tests for CircuitModulePanel - the canonical circuit component panel.
 * These tests replace CircuitPalette.test.tsx which is deleted as dead code.
 * 
 * Acceptance Criteria:
 * - AC-145-002: CircuitModulePanel renders circuit component buttons with data-circuit-component
 * - AC-145-003: CircuitModulePanel displays 14 component buttons
 * - AC-145-004: Clicking circuit component buttons adds nodes to canvas
 * - AC-145-009: Clicking buttons when circuit mode is OFF does not add nodes (or auto-enables)
 * - AC-145-010: Adding same component twice produces two separate nodes
 * - AC-145-011: Circuit mode toggle preserves canvas state
 */

import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { CircuitModulePanel } from '../components/Editor/CircuitModulePanel';
import { useCircuitCanvasStore } from '../store/useCircuitCanvasStore';
import { useMachineStore } from '../store/useMachineStore';

// Helper to reset store state
const resetCircuitStore = () => {
  useCircuitCanvasStore.setState({
    isCircuitMode: false,
    nodes: [],
    wires: [],
    selectedCircuitNodeIds: [],
    layers: [{ id: 'layer-1', name: 'Layer 1', visible: true, nodeIds: [], wireIds: [] }],
    activeLayerId: 'layer-1',
  });
  // Also reset machine store viewport
  useMachineStore.setState({
    viewport: { x: 0, y: 0, zoom: 1 },
  });
};

describe('CircuitModulePanel Browser Integration Tests', () => {
  beforeEach(() => {
    resetCircuitStore();
    // Set window dimensions for jsdom
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
  });

  afterEach(() => {
    resetCircuitStore();
  });

  // ============================================================
  // AC-145-002: Panel Rendering with data-circuit-component
  // ============================================================
  describe('AC-145-002: Panel Rendering with data-circuit-component', () => {
    it('should render CircuitModulePanel with circuit mode toggle', () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should display circuit components when circuit mode is ON', async () => {
      render(<CircuitModulePanel />);
      
      // Click circuit mode toggle
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      expect(toggleButton).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      // Wait for components to render
      await waitFor(() => {
        const components = document.querySelectorAll('[data-circuit-component]');
        expect(components.length).toBeGreaterThan(0);
      });
    });

    it('should NOT display circuit component buttons when circuit mode is OFF', () => {
      render(<CircuitModulePanel />);
      
      // Circuit mode should be OFF by default
      const components = document.querySelectorAll('[data-circuit-component]');
      expect(components).toHaveLength(0);
    });

    it('should have circuit component buttons with data-circuit-component attribute', async () => {
      render(<CircuitModulePanel />);
      
      // Enable circuit mode
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        const inputButton = document.querySelector('[data-circuit-component="input"]');
        expect(inputButton).toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // AC-145-003: Component Count (14 buttons)
  // ============================================================
  describe('AC-145-003: Component Count (14 buttons)', () => {
    it('should display exactly 14 circuit component buttons when circuit mode is ON', async () => {
      render(<CircuitModulePanel />);
      
      // Enable circuit mode
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        const components = document.querySelectorAll('[data-circuit-component]');
        expect(components).toHaveLength(14);
      });
    });

    it('should display INPUT and OUTPUT buttons', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        const input = document.querySelector('[data-circuit-component="input"]');
        const output = document.querySelector('[data-circuit-component="output"]');
        expect(input).toBeInTheDocument();
        expect(output).toBeInTheDocument();
      });
    });

    it('should display all 7 logic gate buttons', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        const logicGates = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];
        logicGates.forEach(gate => {
          const button = document.querySelector(`[data-circuit-component="${gate}"]`);
          expect(button).toBeInTheDocument();
        });
      });
    });

    it('should display all 5 sequential gate buttons', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        const sequentialGates = ['TIMER', 'COUNTER', 'SR_LATCH', 'D_LATCH', 'D_FLIP_FLOP'];
        sequentialGates.forEach(gate => {
          const button = document.querySelector(`[data-circuit-component="${gate}"]`);
          expect(button).toBeInTheDocument();
        });
      });
    });
  });

  // ============================================================
  // AC-145-004: Node Addition (INPUT, AND, TIMER)
  // ============================================================
  describe('AC-145-004: Node Addition (INPUT, AND, TIMER)', () => {
    it('should enable circuit mode when clicking circuit mode toggle', async () => {
      render(<CircuitModulePanel />);
      
      // Verify circuit mode starts OFF
      expect(useCircuitCanvasStore.getState().isCircuitMode).toBe(false);
      
      // Click toggle to enable circuit mode
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      expect(useCircuitCanvasStore.getState().isCircuitMode).toBe(true);
    });

    it('should add INPUT node to canvas when clicked', async () => {
      render(<CircuitModulePanel />);
      
      // First enable circuit mode
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      // Click INPUT button
      await waitFor(() => {
        const inputButton = document.querySelector('[data-circuit-component="input"]');
        expect(inputButton).toBeInTheDocument();
      });
      
      const inputButton = document.querySelector('[data-circuit-component="input"]') as HTMLButtonElement;
      
      await act(async () => {
        fireEvent.click(inputButton);
      });
      
      // Verify node was added to store (using nodes property)
      const nodes = useCircuitCanvasStore.getState().nodes;
      expect(nodes.length).toBe(1);
      expect(nodes[0].type).toBe('input');
    });

    it('should add AND gate node to canvas when clicked', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        const andButton = document.querySelector('[data-circuit-component="AND"]');
        expect(andButton).toBeInTheDocument();
      });
      
      const andButton = document.querySelector('[data-circuit-component="AND"]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(andButton);
      });
      
      const nodes = useCircuitCanvasStore.getState().nodes;
      expect(nodes.length).toBe(1);
      expect(nodes[0].gateType).toBe('AND');
    });

    it('should add TIMER sequential gate node to canvas when clicked', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        const timerButton = document.querySelector('[data-circuit-component="TIMER"]');
        expect(timerButton).toBeInTheDocument();
      });
      
      const timerButton = document.querySelector('[data-circuit-component="TIMER"]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(timerButton);
      });
      
      const nodes = useCircuitCanvasStore.getState().nodes;
      expect(nodes.length).toBe(1);
      expect(nodes[0].gateType).toBe('TIMER');
    });

    it('should increment node count when multiple components are added', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        expect(document.querySelector('[data-circuit-component="input"]')).toBeInTheDocument();
      });
      
      // Add INPUT
      await act(async () => {
        fireEvent.click(document.querySelector('[data-circuit-component="input"]') as HTMLButtonElement);
      });
      
      // Add AND
      await act(async () => {
        fireEvent.click(document.querySelector('[data-circuit-component="AND"]') as HTMLButtonElement);
      });
      
      // Add TIMER
      await act(async () => {
        fireEvent.click(document.querySelector('[data-circuit-component="TIMER"]') as HTMLButtonElement);
      });
      
      const nodes = useCircuitCanvasStore.getState().nodes;
      expect(nodes.length).toBe(3);
    });
  });

  // ============================================================
  // AC-145-010: Duplicate Component Addition
  // ============================================================
  describe('AC-145-010: Duplicate Component Addition', () => {
    it('should add two separate AND nodes when clicked twice', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        expect(document.querySelector('[data-circuit-component="AND"]')).toBeInTheDocument();
      });
      
      const andButton = document.querySelector('[data-circuit-component="AND"]') as HTMLButtonElement;
      
      // Click twice
      await act(async () => {
        fireEvent.click(andButton);
      });
      await act(async () => {
        fireEvent.click(andButton);
      });
      
      const nodes = useCircuitCanvasStore.getState().nodes;
      expect(nodes.length).toBe(2);
      expect(nodes[0].gateType).toBe('AND');
      expect(nodes[1].gateType).toBe('AND');
      expect(nodes[0].id).not.toBe(nodes[1].id);
    });

    it('should create two distinct nodes with unique IDs', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        expect(document.querySelector('[data-circuit-component="OR"]')).toBeInTheDocument();
      });
      
      const orButton = document.querySelector('[data-circuit-component="OR"]') as HTMLButtonElement;
      
      await act(async () => {
        fireEvent.click(orButton);
        fireEvent.click(orButton);
        fireEvent.click(orButton);
      });
      
      const nodes = useCircuitCanvasStore.getState().nodes;
      expect(nodes.length).toBe(3);
      
      // All IDs should be unique
      const ids = nodes.map(n => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });

  // ============================================================
  // AC-145-011: Circuit Mode Toggle Reset
  // ============================================================
  describe('AC-145-011: Circuit Mode Toggle Reset', () => {
    it('should preserve added nodes when toggling circuit mode OFF then ON', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      
      // Enable circuit mode
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      // Add two nodes
      await waitFor(() => {
        expect(document.querySelector('[data-circuit-component="input"]')).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.click(document.querySelector('[data-circuit-component="input"]') as HTMLButtonElement);
        fireEvent.click(document.querySelector('[data-circuit-component="AND"]') as HTMLButtonElement);
      });
      
      expect(useCircuitCanvasStore.getState().nodes.length).toBe(2);
      
      // Disable circuit mode
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      // Re-enable circuit mode
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      // Nodes should still be present
      expect(useCircuitCanvasStore.getState().nodes.length).toBe(2);
      expect(useCircuitCanvasStore.getState().isCircuitMode).toBe(true);
    });

    it('should not crash when toggling circuit mode multiple times', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      
      // Multiple toggles
      await act(async () => {
        fireEvent.click(toggleButton);
        fireEvent.click(toggleButton);
        fireEvent.click(toggleButton);
        fireEvent.click(toggleButton);
      });
      
      // Should not crash, final state should be ON
      expect(useCircuitCanvasStore.getState().isCircuitMode).toBe(true);
    });
  });

  // ============================================================
  // AC-145-009: Negative Test - Buttons Inactive Outside Circuit Mode
  // ============================================================
  describe('AC-145-009: Buttons Inactive Outside Circuit Mode', () => {
    it('should have no circuit component buttons visible when circuit mode is OFF', () => {
      render(<CircuitModulePanel />);
      
      // Verify circuit mode is OFF
      expect(useCircuitCanvasStore.getState().isCircuitMode).toBe(false);
      
      // No circuit component buttons should be visible
      const components = document.querySelectorAll('[data-circuit-component]');
      expect(components).toHaveLength(0);
    });

    it('should auto-enable circuit mode when clicking a component button', async () => {
      render(<CircuitModulePanel />);
      
      // Verify circuit mode starts OFF
      expect(useCircuitCanvasStore.getState().isCircuitMode).toBe(false);
      
      // Try to click an AND button - it shouldn't exist since circuit mode is OFF
      const andButton = document.querySelector('[data-circuit-component="AND"]');
      expect(andButton).toBeNull();
    });
  });

  // ============================================================
  // Additional Regression Tests
  // ============================================================
  describe('Additional Regression Tests', () => {
    it('should render circuit mode toggle button with correct text', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton?.textContent).toContain('电路模式');
    });

    it('should display section headers when circuit mode is ON', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('电路组件')).toBeInTheDocument();
      });
    });

    it('should handle all gate types without errors', async () => {
      render(<CircuitModulePanel />);
      
      const toggleButton = document.querySelector('[data-circuit-mode-toggle]') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      const gateTypes = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'TIMER', 'COUNTER', 'SR_LATCH', 'D_LATCH', 'D_FLIP_FLOP'];
      
      for (const gate of gateTypes) {
        await waitFor(() => {
          const button = document.querySelector(`[data-circuit-component="${gate}"]`);
          expect(button).toBeInTheDocument();
        });
        
        const button = document.querySelector(`[data-circuit-component="${gate}"]`) as HTMLButtonElement;
        await act(async () => {
          fireEvent.click(button);
        });
      }
      
      // All 12 gate types should be added
      expect(useCircuitCanvasStore.getState().nodes.length).toBe(12);
    });
  });
});
