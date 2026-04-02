/**
 * PropertiesPanel Component Tests
 * 
 * Comprehensive test coverage for PropertiesPanel component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock stores using vi.hoisted() for proper isolation
const mockUseMachineStore = vi.hoisted(() => {
  const state = {
    modules: [],
    connections: [],
    selectedModuleId: null,
    selectedConnectionId: null,
    gridEnabled: true,
    updateModuleRotation: vi.fn(),
    updateModuleScale: vi.fn(),
    updateModuleFlip: vi.fn(),
    removeModule: vi.fn(),
    removeConnection: vi.fn(),
    clearCanvas: vi.fn(),
    toggleGrid: vi.fn(),
    resetViewport: vi.fn(),
  };
  return vi.fn((selector?: (state: typeof state) => unknown) => {
    if (selector) return selector(state);
    return state;
  });
});

vi.mock('@/store/useMachineStore', () => ({ useMachineStore: mockUseMachineStore }));

vi.mock('@/utils/attributeGenerator', () => ({
  generateAttributes: vi.fn(() => ({
    name: 'Test Machine',
    rarity: 'common' as const,
    stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 10 },
    tags: ['fire', 'arcane'],
    description: 'A test machine description',
    codexId: 'TEST-001',
  })),
  getRarityColor: vi.fn(() => '#00d4ff'),
  getRarityLabel: vi.fn(() => '普通'),
}));

// Import component
import { PropertiesPanel } from '../PropertiesPanel';

// Mock modules
const mockModules = [
  {
    instanceId: 'module-1',
    type: 'core-furnace' as const,
    x: 100,
    y: 100,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [
      { id: 'port-1', type: 'input' as const, position: { x: 25, y: 50 } },
      { id: 'port-2', type: 'output' as const, position: { x: 75, y: 50 } },
    ],
  },
  {
    instanceId: 'module-2',
    type: 'gear' as const,
    x: 250,
    y: 100,
    rotation: 90,
    scale: 1.5,
    flipped: false,
    ports: [
      { id: 'port-3', type: 'input' as const, position: { x: 50, y: 0 } },
      { id: 'port-4', type: 'output' as const, position: { x: 50, y: 100 } },
    ],
  },
];

describe('PropertiesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset store mocks to default state
    mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
      const state = {
        modules: [],
        connections: [],
        selectedModuleId: null,
        selectedConnectionId: null,
        gridEnabled: true,
        updateModuleRotation: vi.fn(),
        updateModuleScale: vi.fn(),
        updateModuleFlip: vi.fn(),
        removeModule: vi.fn(),
        removeConnection: vi.fn(),
        clearCanvas: vi.fn(),
        toggleGrid: vi.fn(),
        resetViewport: vi.fn(),
      };
      if (selector) return selector(state);
      return state;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  // =========================================================================
  // Render Tests
  // =========================================================================
  describe('Render', () => {
    it('should render PropertiesPanel with header', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('PROPERTIES')).toBeInTheDocument();
    });

    it('should render Machine Overview section', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Machine Overview')).toBeInTheDocument();
    });

    it('should render Canvas Controls section', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Canvas Controls')).toBeInTheDocument();
    });

    it('should render keyboard shortcuts reference', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Keyboard Shortcuts:')).toBeInTheDocument();
    });

    it('should render grid toggle button', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText(/Grid:/)).toBeInTheDocument();
    });

    it('should render reset view button', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Reset View')).toBeInTheDocument();
    });

    it('should render clear canvas button', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Clear Canvas')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Selected Module Tests
  // =========================================================================
  describe('Selected Module', () => {
    it('should show Selected Module section when module is selected', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: mockModules,
          connections: [],
          selectedModuleId: 'module-1',
          selectedConnectionId: null,
          gridEnabled: true,
          updateModuleRotation: vi.fn(),
          updateModuleScale: vi.fn(),
          updateModuleFlip: vi.fn(),
          removeModule: vi.fn(),
          removeConnection: vi.fn(),
          clearCanvas: vi.fn(),
          toggleGrid: vi.fn(),
          resetViewport: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<PropertiesPanel />);
      
      expect(screen.getByText('Selected Module')).toBeInTheDocument();
    });

    it('should display module type name', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: mockModules,
          connections: [],
          selectedModuleId: 'module-1',
          selectedConnectionId: null,
          gridEnabled: true,
          updateModuleRotation: vi.fn(),
          updateModuleScale: vi.fn(),
          updateModuleFlip: vi.fn(),
          removeModule: vi.fn(),
          removeConnection: vi.fn(),
          clearCanvas: vi.fn(),
          toggleGrid: vi.fn(),
          resetViewport: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<PropertiesPanel />);
      
      expect(screen.getByText('核心熔炉')).toBeInTheDocument();
    });

    it('should display module rotation', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: mockModules,
          connections: [],
          selectedModuleId: 'module-2',
          selectedConnectionId: null,
          gridEnabled: true,
          updateModuleRotation: vi.fn(),
          updateModuleScale: vi.fn(),
          updateModuleFlip: vi.fn(),
          removeModule: vi.fn(),
          removeConnection: vi.fn(),
          clearCanvas: vi.fn(),
          toggleGrid: vi.fn(),
          resetViewport: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<PropertiesPanel />);
      
      expect(screen.getByText('90°')).toBeInTheDocument();
    });

    it('should display module scale', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: mockModules,
          connections: [],
          selectedModuleId: 'module-2',
          selectedConnectionId: null,
          gridEnabled: true,
          updateModuleRotation: vi.fn(),
          updateModuleScale: vi.fn(),
          updateModuleFlip: vi.fn(),
          removeModule: vi.fn(),
          removeConnection: vi.fn(),
          clearCanvas: vi.fn(),
          toggleGrid: vi.fn(),
          resetViewport: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<PropertiesPanel />);
      
      expect(screen.getByText('1.5x')).toBeInTheDocument();
    });

    it('should render scale slider', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: mockModules,
          connections: [],
          selectedModuleId: 'module-1',
          selectedConnectionId: null,
          gridEnabled: true,
          updateModuleRotation: vi.fn(),
          updateModuleScale: vi.fn(),
          updateModuleFlip: vi.fn(),
          removeModule: vi.fn(),
          removeConnection: vi.fn(),
          clearCanvas: vi.fn(),
          toggleGrid: vi.fn(),
          resetViewport: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<PropertiesPanel />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Rotation Tests
  // =========================================================================
  describe('Rotation', () => {
    it('should call updateModuleRotation when rotate button is clicked', () => {
      const updateModuleRotation = vi.fn();

      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: mockModules,
          connections: [],
          selectedModuleId: 'module-1',
          selectedConnectionId: null,
          gridEnabled: true,
          updateModuleRotation,
          updateModuleScale: vi.fn(),
          updateModuleFlip: vi.fn(),
          removeModule: vi.fn(),
          removeConnection: vi.fn(),
          clearCanvas: vi.fn(),
          toggleGrid: vi.fn(),
          resetViewport: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<PropertiesPanel />);
      
      const rotateButton = screen.getByRole('button', { name: /Rotate/i });
      fireEvent.click(rotateButton);
      
      expect(updateModuleRotation).toHaveBeenCalledWith('module-1', 90);
    });
  });

  // =========================================================================
  // Delete Tests
  // =========================================================================
  describe('Delete', () => {
    it('should call removeModule when delete button is clicked', () => {
      const removeModule = vi.fn();

      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: mockModules,
          connections: [],
          selectedModuleId: 'module-1',
          selectedConnectionId: null,
          gridEnabled: true,
          updateModuleRotation: vi.fn(),
          updateModuleScale: vi.fn(),
          updateModuleFlip: vi.fn(),
          removeModule,
          removeConnection: vi.fn(),
          clearCanvas: vi.fn(),
          toggleGrid: vi.fn(),
          resetViewport: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<PropertiesPanel />);
      
      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButton);
      
      expect(removeModule).toHaveBeenCalledWith('module-1');
    });
  });

  // =========================================================================
  // Canvas Controls Tests
  // =========================================================================
  describe('Canvas Controls', () => {
    it('should call toggleGrid when grid button is clicked', () => {
      const toggleGrid = vi.fn();

      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: [],
          connections: [],
          selectedModuleId: null,
          selectedConnectionId: null,
          gridEnabled: true,
          updateModuleRotation: vi.fn(),
          updateModuleScale: vi.fn(),
          updateModuleFlip: vi.fn(),
          removeModule: vi.fn(),
          removeConnection: vi.fn(),
          clearCanvas: vi.fn(),
          toggleGrid,
          resetViewport: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<PropertiesPanel />);
      
      const gridButton = screen.getByRole('button', { name: /Grid:/i });
      fireEvent.click(gridButton);
      
      expect(toggleGrid).toHaveBeenCalled();
    });

    it('should show grid status ON', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: [],
          connections: [],
          selectedModuleId: null,
          selectedConnectionId: null,
          gridEnabled: true,
          updateModuleRotation: vi.fn(),
          updateModuleScale: vi.fn(),
          updateModuleFlip: vi.fn(),
          removeModule: vi.fn(),
          removeConnection: vi.fn(),
          clearCanvas: vi.fn(),
          toggleGrid: vi.fn(),
          resetViewport: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<PropertiesPanel />);
      
      expect(screen.getByText('Grid: ON')).toBeInTheDocument();
    });

    it('should show grid OFF when disabled', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: [],
          connections: [],
          selectedModuleId: null,
          selectedConnectionId: null,
          gridEnabled: false,
          updateModuleRotation: vi.fn(),
          updateModuleScale: vi.fn(),
          updateModuleFlip: vi.fn(),
          removeModule: vi.fn(),
          removeConnection: vi.fn(),
          clearCanvas: vi.fn(),
          toggleGrid: vi.fn(),
          resetViewport: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<PropertiesPanel />);
      
      expect(screen.getByText('Grid: OFF')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Machine Overview Tests
  // =========================================================================
  describe('Machine Overview', () => {
    it('should display machine name', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Test Machine')).toBeInTheDocument();
    });

    it('should display rarity badge', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('普通')).toBeInTheDocument();
    });

    it('should display stat bars', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Stability')).toBeInTheDocument();
      expect(screen.getByText('Power')).toBeInTheDocument();
      expect(screen.getByText('Energy')).toBeInTheDocument();
      expect(screen.getByText('Failure')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Error State Tests
  // =========================================================================
  describe('Error State', () => {
    it('should not crash when modules array is empty', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: [],
          connections: [],
          selectedModuleId: null,
          selectedConnectionId: null,
          gridEnabled: true,
          updateModuleRotation: vi.fn(),
          updateModuleScale: vi.fn(),
          updateModuleFlip: vi.fn(),
          removeModule: vi.fn(),
          removeConnection: vi.fn(),
          clearCanvas: vi.fn(),
          toggleGrid: vi.fn(),
          resetViewport: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      expect(() => render(<PropertiesPanel />)).not.toThrow();
    });
  });
});
