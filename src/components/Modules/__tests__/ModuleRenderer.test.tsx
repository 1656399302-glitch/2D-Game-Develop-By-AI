/**
 * ModuleRenderer Component Tests
 * 
 * Comprehensive test coverage for ModuleRenderer component.
 * Tests cover: SVG module rendering, selection highlight, connection points,
 * transform handling, accessibility.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Complete GSAP mock with all used functions
vi.mock('gsap', () => {
  const mockCtx = {
    revert: vi.fn(),
  };
  return {
    gsap: {
      context: vi.fn(() => mockCtx),
      to: vi.fn(),
      set: vi.fn(),
      killTweensOf: vi.fn(),
    },
  };
});

// Mock the stores
const mockMachineStoreState = {
  startConnection: vi.fn(),
  completeConnection: vi.fn(),
};

vi.mock('@/store/useMachineStore', () => ({
  useMachineStore: vi.fn((selector?: (state: any) => unknown) => {
    if (selector) return selector(mockMachineStoreState);
    return mockMachineStoreState;
  }),
}));

import { ModuleRenderer } from '../ModuleRenderer';

// Create mock module factory
const createMockModule = (type: string) => ({
  instanceId: `${type}-instance-1`,
  type: type as any,
  x: 100,
  y: 100,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [
    { id: `${type}-port-1`, type: 'input' as const, position: { x: 25, y: 50 } },
    { id: `${type}-port-2`, type: 'output' as const, position: { x: 75, y: 50 } },
  ],
});

// Helper to get module group
const getModuleGroup = () => document.querySelector('g.module-group');

describe('ModuleRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockMachineStoreState.startConnection = vi.fn();
    mockMachineStoreState.completeConnection = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  // =========================================================================
  // Basic Render Tests
  // =========================================================================
  describe('Basic Render', () => {
    it('should render module group in DOM', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const gElement = getModuleGroup();
      expect(gElement).toBeInTheDocument();
    });

    it('should render module group with role button', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      // Use first button to get the module group
      const buttons = screen.getAllByRole('button');
      const moduleButton = buttons.find(b => b.getAttribute('data-module-id') === 'core-furnace-instance-1');
      expect(moduleButton).toBeInTheDocument();
    });

    it('should have aria-label with module info', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const moduleButton = getModuleGroup();
      expect(moduleButton).toHaveAttribute('aria-label', expect.stringContaining('core-furnace'));
    });

    it('should render data attributes for module tracking', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const moduleButton = getModuleGroup();
      expect(moduleButton).toHaveAttribute('data-module-id', 'core-furnace-instance-1');
      expect(moduleButton).toHaveAttribute('data-module-type', 'core-furnace');
    });
  });

  // =========================================================================
  // Module Types Tests
  // =========================================================================
  describe('Module Types', () => {
    it('should render core-furnace module type', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      expect(getModuleGroup()).toBeInTheDocument();
    });

    it('should render gear module type', () => {
      const module = createMockModule('gear');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      expect(getModuleGroup()).toBeInTheDocument();
    });

    it('should render void-arcane-gear faction variant', () => {
      const module = createMockModule('void-arcane-gear');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      expect(getModuleGroup()).toBeInTheDocument();
      expect(getModuleGroup()).toHaveAttribute('data-module-type', 'void-arcane-gear');
    });

    it('should render temporal-distorter advanced module', () => {
      const module = createMockModule('temporal-distorter');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      expect(getModuleGroup()).toBeInTheDocument();
      expect(getModuleGroup()).toHaveAttribute('data-module-type', 'temporal-distorter');
    });
  });

  // =========================================================================
  // Selection Highlight Tests
  // =========================================================================
  describe('Selection Highlight', () => {
    it('should render selection indicator when selected', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={true}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      // Should have selection indicator (dashed stroke rect)
      const selectionRects = document.querySelectorAll('rect[stroke="#00d4ff"]');
      expect(selectionRects.length).toBeGreaterThan(0);
    });

    it('should not render selection indicator when not selected', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      // Selection rect with dashed stroke should not exist
      const selectionRects = document.querySelectorAll('rect[stroke="#00d4ff"]');
      expect(selectionRects.length).toBe(0);
    });
  });

  // =========================================================================
  // Connection Ports Tests
  // =========================================================================
  describe('Connection Ports', () => {
    it('should render input port labels', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const inputTexts = screen.getAllByText('IN');
      expect(inputTexts.length).toBeGreaterThan(0);
    });

    it('should render output port labels', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const outputTexts = screen.getAllByText('OUT');
      expect(outputTexts.length).toBeGreaterThan(0);
    });

    it('should render port groups with role button', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const portGroups = document.querySelectorAll('.port-group');
      expect(portGroups.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Transform Tests
  // =========================================================================
  describe('Transform', () => {
    it('should apply transform attribute with position', () => {
      const module = createMockModule('core-furnace');
      module.x = 200;
      module.y = 300;
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const moduleGroup = getModuleGroup();
      expect(moduleGroup).toHaveAttribute('transform', expect.stringContaining('translate(200'));
      expect(moduleGroup).toHaveAttribute('transform', expect.stringContaining('300'));
    });

    it('should apply rotation transform', () => {
      const module = createMockModule('core-furnace');
      module.rotation = 45;
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const moduleGroup = getModuleGroup();
      expect(moduleGroup).toHaveAttribute('transform', expect.stringContaining('rotate(45'));
    });
  });

  // =========================================================================
  // Mouse Events Tests
  // =========================================================================
  describe('Mouse Events', () => {
    it('should call onMouseDown when module is clicked', () => {
      const module = createMockModule('core-furnace');
      const onMouseDown = vi.fn();
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={onMouseDown}
        />
      );
      
      const moduleButton = getModuleGroup();
      fireEvent.mouseDown(moduleButton);
      
      expect(onMouseDown).toHaveBeenCalled();
    });

    it('should have cursor style for drag', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const moduleButton = getModuleGroup();
      expect(moduleButton).toHaveStyle({ cursor: 'move' });
    });
  });

  // =========================================================================
  // Accessibility Tests
  // =========================================================================
  describe('Accessibility', () => {
    it('should have tabIndex for keyboard navigation', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const moduleButton = getModuleGroup();
      expect(moduleButton).toHaveAttribute('tabIndex', '0');
    });

    it('should have accessible aria-label', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const moduleButton = getModuleGroup();
      expect(moduleButton).toHaveAttribute('aria-label', expect.stringContaining('模块'));
    });

    it('should have accessible port buttons', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      const portGroups = document.querySelectorAll('.port-group');
      portGroups.forEach(port => {
        expect(port).toHaveAttribute('tabIndex', '0');
        expect(port).toHaveAttribute('role', 'button');
      });
    });
  });

  // =========================================================================
  // Error State Tests
  // =========================================================================
  describe('Error State', () => {
    it('should render fallback for unknown module type', () => {
      const module = {
        instanceId: 'unknown-instance',
        type: 'unknown-module' as any,
        x: 100,
        y: 100,
        rotation: 0,
        scale: 1,
        flipped: false,
        ports: [],
      };
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      // Should still render without crash
      expect(getModuleGroup()).toBeInTheDocument();
    });

    it('should handle empty ports array', () => {
      const module = {
        instanceId: 'no-ports-instance',
        type: 'core-furnace' as const,
        x: 100,
        y: 100,
        rotation: 0,
        scale: 1,
        flipped: false,
        ports: [],
      };
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
        />
      );
      
      // Should still render without crash
      expect(getModuleGroup()).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Activation State Tests
  // =========================================================================
  describe('Activation State', () => {
    it('should have data-activated attribute when activated', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="active"
          onMouseDown={vi.fn()}
          isActivated={true}
          activationIntensity={1}
        />
      );
      
      const moduleButton = getModuleGroup();
      expect(moduleButton).toHaveAttribute('data-activated', 'true');
    });

    it('should have data-activated=false when not activated', () => {
      const module = createMockModule('core-furnace');
      
      render(
        <ModuleRenderer
          module={module}
          isSelected={false}
          machineState="idle"
          onMouseDown={vi.fn()}
          isActivated={false}
          activationIntensity={0}
        />
      );
      
      const moduleButton = getModuleGroup();
      expect(moduleButton).toHaveAttribute('data-activated', 'false');
    });
  });
});
