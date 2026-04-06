/**
 * TechTreeCanvas Component Tests
 * 
 * Unit tests for the main tech tree canvas component.
 * 
 * ROUND 136: Initial implementation
 * ROUND 166: Fixed all render() calls and store mutations wrapped in act()
 * for proper React 18 async rendering handling.
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TechTreeCanvas } from '../../../components/TechTree/TechTreeCanvas';
import { useTechTreeStore } from '../../../store/useTechTreeStore';
import { TECH_TREE_NODES } from '../../../data/techTreeNodes';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

/**
 * Reset the store to initial state - wrapped in act() for React 18
 */
async function resetStore() {
  await act(async () => {
    useTechTreeStore.setState({
      unlockedNodes: TECH_TREE_NODES.reduce((acc, node) => {
        acc[node.id] = false;
        return acc;
      }, {} as Record<string, boolean>),
      selectedNodeId: null,
    });
    localStorageMock.clear();
  });
}

// Render helper with proper act() wrapping
const renderTreeCanvas = async () => {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(<TechTreeCanvas />);
  });
  return result!;
};

// Store mutation helper with proper act() wrapping
const unlockNode = async (nodeId: string) => {
  await act(async () => {
    useTechTreeStore.getState().unlockNode(nodeId);
  });
};

// Click helper with proper act() wrapping
const clickElement = async (element: HTMLElement) => {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
};

describe('TechTreeCanvas Component', () => {
  beforeEach(async () => {
    await resetStore();
  });

  afterEach(async () => {
    await resetStore();
  });

  describe('Rendering', () => {
    it('renders the SVG canvas', async () => {
      await renderTreeCanvas();
      
      const canvas = screen.getByTestId('tech-tree-canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.tagName.toLowerCase()).toBe('svg');
    });

    it('renders all tech tree nodes', async () => {
      await renderTreeCanvas();
      
      // Use queryAllByTestId to get all nodes
      const nodeElements = document.querySelectorAll('[data-testid^="tech-tree-node-"]');
      expect(nodeElements.length).toBe(TECH_TREE_NODES.length);
    });

    it('renders nodes with correct data attributes', async () => {
      await renderTreeCanvas();
      
      for (const node of TECH_TREE_NODES) {
        const nodeElement = document.querySelector(`[data-testid="tech-tree-node-${node.id}"]`);
        expect(nodeElement).toBeTruthy();
      }
    });

    it('renders connection lines', async () => {
      await renderTreeCanvas();
      
      const connections = screen.getByTestId('tech-tree-connections');
      expect(connections).toBeTruthy();
    });

    it('all nodes have valid state attributes', async () => {
      await renderTreeCanvas();
      
      const nodes = document.querySelectorAll('[data-testid^="tech-tree-node-"]');
      for (const node of Array.from(nodes)) {
        const state = node.getAttribute('data-state');
        expect(state).toBeTruthy();
        expect(['locked', 'unlocked', 'available']).toContain(state);
      }
    });

    it('nodes have category attributes', async () => {
      await renderTreeCanvas();
      
      const nodes = document.querySelectorAll('[data-testid^="tech-tree-node-"]');
      for (const node of Array.from(nodes)) {
        const category = node.getAttribute('data-category');
        expect(category).toBeTruthy();
      }
    });
  });

  describe('Visual States', () => {
    it('shows locked state for nodes with unmet prerequisites', async () => {
      await renderTreeCanvas();
      
      // Find a node with prerequisites that aren't met
      const prereqNode = TECH_TREE_NODES.find(n => n.prerequisites.length > 0);
      expect(prereqNode).toBeDefined();
      
      if (prereqNode) {
        const nodeElement = document.querySelector(`[data-testid="tech-tree-node-${prereqNode.id}"]`);
        expect(nodeElement?.getAttribute('data-state')).toBe('locked');
      }
    });

    it('shows unlocked state for unlocked nodes with no prerequisites', async () => {
      await renderTreeCanvas();
      
      // Find a node with no prerequisites and unlock it
      const noPrereqNode = TECH_TREE_NODES.find(n => n.prerequisites.length === 0);
      expect(noPrereqNode).toBeDefined();
      
      if (noPrereqNode) {
        await unlockNode(noPrereqNode.id);
        
        // Re-render after state change
        await renderTreeCanvas();
        
        const nodeElement = document.querySelector(`[data-testid="tech-tree-node-${noPrereqNode.id}"]`);
        expect(nodeElement?.getAttribute('data-state')).toBe('unlocked');
      }
    });
  });

  describe('Interactions', () => {
    it('updates selected node in store when clicked', async () => {
      await renderTreeCanvas();
      
      const state = useTechTreeStore.getState();
      const targetNode = state.nodes[0];
      
      // Click the node
      const nodeElement = document.querySelector(`[data-testid="tech-tree-node-${targetNode.id}"]`);
      expect(nodeElement).toBeTruthy();
      
      // Simulate click with proper act() wrapping
      await clickElement(nodeElement!);
      
      expect(useTechTreeStore.getState().selectedNodeId).toBe(targetNode.id);
    });
  });

  describe('SVG Structure', () => {
    it('SVG has correct viewBox dimensions', async () => {
      await renderTreeCanvas();
      
      const canvas = screen.getByTestId('tech-tree-canvas');
      const viewBox = canvas.getAttribute('viewBox');
      
      expect(viewBox).toBeTruthy();
      expect(viewBox).toMatch(/^\d+ \d+ \d+ \d+$/);
    });

    it('SVG contains grid pattern definition', async () => {
      await renderTreeCanvas();
      
      const canvas = screen.getByTestId('tech-tree-canvas');
      const gridPattern = canvas.querySelector('#tech-tree-grid');
      
      expect(gridPattern).toBeTruthy();
    });

    it('SVG contains gradient definitions for categories', async () => {
      await renderTreeCanvas();
      
      const canvas = screen.getByTestId('tech-tree-canvas');
      
      expect(canvas.querySelector('#gradient-basic-gates')).toBeTruthy();
      expect(canvas.querySelector('#gradient-advanced-gates')).toBeTruthy();
      expect(canvas.querySelector('#gradient-special-components')).toBeTruthy();
    });
  });

  describe('Category Zones', () => {
    it('renders category zone backgrounds', async () => {
      await renderTreeCanvas();
      
      const canvas = screen.getByTestId('tech-tree-canvas');
      const categoryZones = canvas.querySelectorAll('.tech-tree-category-zone');
      
      expect(categoryZones.length).toBeGreaterThanOrEqual(3);
    });

    it('renders category labels', async () => {
      await renderTreeCanvas();
      
      const canvas = screen.getByTestId('tech-tree-canvas');
      const labels = canvas.querySelectorAll('.tech-tree-category-zone text');
      
      expect(labels.length).toBeGreaterThanOrEqual(3);
    });
  });
});
