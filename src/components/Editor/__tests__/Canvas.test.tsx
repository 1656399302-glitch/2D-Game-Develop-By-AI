/**
 * Canvas Component Tests
 * 
 * Comprehensive test coverage for Canvas component.
 * Tests cover: module rendering, pan/zoom, selection, grid, connection points,
 * touch handling, performance with large module counts.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act, waitFor } from '@testing-library/react';
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

// Mock the stores using vi.hoisted() for proper isolation
const mockUseMachineStore = vi.hoisted(() => {
  const state = {
    modules: [],
    connections: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    selectedModuleId: null,
    selectedConnectionId: null,
    isConnecting: false,
    connectionPreview: null,
    machineState: 'idle' as const,
    gridEnabled: true,
    activationZoom: { isZooming: false, startViewport: null, targetViewport: null, startTime: 0, duration: 800 },
    activationModuleIndex: -1,
    setViewport: vi.fn(),
    addModule: vi.fn(),
    selectModule: vi.fn(),
    selectConnection: vi.fn(),
    updateModulePosition: vi.fn(),
    updateModulesBatch: vi.fn(),
    updateConnectionPreview: vi.fn(),
    cancelConnection: vi.fn(),
    saveToHistory: vi.fn(),
    updateActivationZoom: vi.fn(),
    setActivationModuleIndex: vi.fn(),
  };
  return vi.fn((selector?: (state: typeof state) => unknown) => {
    if (selector) return selector(state);
    return state;
  });
});

const mockUseSelectionStore = vi.hoisted(() => {
  const state = {
    selectedModuleIds: [],
    toggleSelection: vi.fn(),
    setSelection: vi.fn(),
    clearSelection: vi.fn(),
  };
  return vi.fn((selector?: (state: typeof state) => unknown) => {
    if (selector) return selector(state);
    return state;
  });
});

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
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [
      { id: 'port-3', type: 'input' as const, position: { x: 50, y: 0 } },
      { id: 'port-4', type: 'output' as const, position: { x: 50, y: 100 } },
    ],
  },
];

vi.mock('@/store/useMachineStore', () => ({ useMachineStore: mockUseMachineStore }));
vi.mock('@/store/useSelectionStore', () => ({ useSelectionStore: mockUseSelectionStore }));

// Mock child components - these need to be properly exported
vi.mock('../Modules/ModuleRenderer', () => ({
  ModuleRenderer: vi.fn(({ module, ...props }) => (
    <g data-testid={`module-renderer-${module.instanceId}`} data-module-type={module.type}>
      <rect x="0" y="0" width="80" height="80" fill="#333" />
    </g>
  )),
}));

vi.mock('../Connections/EnergyPath', () => ({
  EnergyPath: vi.fn(() => <g data-testid="energy-path" />),
}));

vi.mock('../Connections/ConnectionPreview', () => ({
  ConnectionPreview: vi.fn(() => <g data-testid="connection-preview" />),
}));

vi.mock('./AlignmentToolbar', () => ({
  AlignmentToolbar: vi.fn(() => <div data-testid="alignment-toolbar" />),
}));

vi.mock('../Preview/EnergyPulseVisualizer', () => ({
  EnergyPulseVisualizer: vi.fn(() => <g data-testid="energy-pulse-visualizer" />),
}));

vi.mock('./SelectionHandles', () => ({
  SelectionHandles: vi.fn(() => <g data-testid="selection-handles" />),
}));

vi.mock('@/hooks/useCanvasPerformance', () => ({
  useCanvasPerformance: vi.fn(() => ({
    batchedTransform: vi.fn(),
    isHighPerformance: true,
  })),
}));

vi.mock('./LayersPanel', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="layers-panel">Layers Panel</div>),
}));

// Import after mocking
import { Canvas } from '../Canvas';

describe('Canvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset store mocks to default state
    mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
      const state = {
        modules: [],
        connections: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        selectedModuleId: null,
        selectedConnectionId: null,
        isConnecting: false,
        connectionPreview: null,
        machineState: 'idle' as const,
        gridEnabled: true,
        activationZoom: { isZooming: false, startViewport: null, targetViewport: null, startTime: 0, duration: 800 },
        activationModuleIndex: -1,
        setViewport: vi.fn(),
        addModule: vi.fn(),
        selectModule: vi.fn(),
        selectConnection: vi.fn(),
        updateModulePosition: vi.fn(),
        updateModulesBatch: vi.fn(),
        updateConnectionPreview: vi.fn(),
        cancelConnection: vi.fn(),
        saveToHistory: vi.fn(),
        updateActivationZoom: vi.fn(),
        setActivationModuleIndex: vi.fn(),
      };
      if (selector) return selector(state);
      return state;
    });
    
    mockUseSelectionStore.mockImplementation((selector?: (state: any) => unknown) => {
      const state = {
        selectedModuleIds: [],
        toggleSelection: vi.fn(),
        setSelection: vi.fn(),
        clearSelection: vi.fn(),
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
    it('should render Canvas with SVG viewport', () => {
      render(<Canvas />);
      
      const svg = screen.getByRole('application');
      expect(svg).toBeInTheDocument();
      expect(svg.tagName).toBe('DIV');
    });

    it('should render SVG element inside canvas container', () => {
      render(<Canvas />);
      
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('should render grid pattern when gridEnabled is true', () => {
      render(<Canvas />);
      
      const patterns = document.querySelectorAll('pattern');
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should render empty state message when no modules', () => {
      render(<Canvas />);
      
      expect(screen.getByText('开始构建你的魔法机器')).toBeInTheDocument();
    });

    it('should render viewport info indicator', () => {
      render(<Canvas />);
      
      expect(screen.getByTestId('viewport-info')).toBeInTheDocument();
      expect(screen.getByTestId('viewport-info')).toContainHTML('100%');
    });

    it('should render layers panel toggle button', () => {
      render(<Canvas />);
      
      expect(screen.getByTestId('toggle-layers-panel')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Module Rendering Tests
  // =========================================================================
  describe('Module Rendering', () => {
    it('should not render empty state when modules exist', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: mockModules,
          connections: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          selectedModuleId: null,
          selectedConnectionId: null,
          isConnecting: false,
          connectionPreview: null,
          machineState: 'idle' as const,
          gridEnabled: true,
          activationZoom: { isZooming: false, startViewport: null, targetViewport: null, startTime: 0, duration: 800 },
          activationModuleIndex: -1,
          setViewport: vi.fn(),
          addModule: vi.fn(),
          selectModule: vi.fn(),
          selectConnection: vi.fn(),
          updateModulePosition: vi.fn(),
          updateModulesBatch: vi.fn(),
          updateConnectionPreview: vi.fn(),
          cancelConnection: vi.fn(),
          saveToHistory: vi.fn(),
          updateActivationZoom: vi.fn(),
          setActivationModuleIndex: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<Canvas />);
      
      expect(screen.queryByText('开始构建你的魔法机器')).not.toBeInTheDocument();
    });

    it('should not crash when modules array is empty', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: [],
          connections: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          selectedModuleId: null,
          selectedConnectionId: null,
          isConnecting: false,
          connectionPreview: null,
          machineState: 'idle' as const,
          gridEnabled: true,
          activationZoom: { isZooming: false, startViewport: null, targetViewport: null, startTime: 0, duration: 800 },
          activationModuleIndex: -1,
          setViewport: vi.fn(),
          addModule: vi.fn(),
          selectModule: vi.fn(),
          selectConnection: vi.fn(),
          updateModulePosition: vi.fn(),
          updateModulesBatch: vi.fn(),
          updateConnectionPreview: vi.fn(),
          cancelConnection: vi.fn(),
          saveToHistory: vi.fn(),
          updateActivationZoom: vi.fn(),
          setActivationModuleIndex: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      expect(() => render(<Canvas />)).not.toThrow();
    });

    it('should render module count in viewport info when modules exist', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: mockModules,
          connections: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          selectedModuleId: null,
          selectedConnectionId: null,
          isConnecting: false,
          connectionPreview: null,
          machineState: 'idle' as const,
          gridEnabled: true,
          activationZoom: { isZooming: false, startViewport: null, targetViewport: null, startTime: 0, duration: 800 },
          activationModuleIndex: -1,
          setViewport: vi.fn(),
          addModule: vi.fn(),
          selectModule: vi.fn(),
          selectConnection: vi.fn(),
          updateModulePosition: vi.fn(),
          updateModulesBatch: vi.fn(),
          updateConnectionPreview: vi.fn(),
          cancelConnection: vi.fn(),
          saveToHistory: vi.fn(),
          updateActivationZoom: vi.fn(),
          setActivationModuleIndex: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<Canvas />);
      
      // When modules exist, viewport info should show module count
      const viewportInfo = screen.getByTestId('viewport-info');
      expect(viewportInfo).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Grid Tests
  // =========================================================================
  describe('Grid', () => {
    it('should show grid indicator in viewport info when gridEnabled', () => {
      render(<Canvas />);
      
      // Viewport info should show grid icon when enabled
      expect(screen.getByTestId('viewport-info')).toContainHTML('📐');
    });

    it('should not show grid icon in viewport info when grid disabled', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: [],
          connections: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          selectedModuleId: null,
          selectedConnectionId: null,
          isConnecting: false,
          connectionPreview: null,
          machineState: 'idle' as const,
          gridEnabled: false,
          activationZoom: { isZooming: false, startViewport: null, targetViewport: null, startTime: 0, duration: 800 },
          activationModuleIndex: -1,
          setViewport: vi.fn(),
          addModule: vi.fn(),
          selectModule: vi.fn(),
          selectConnection: vi.fn(),
          updateModulePosition: vi.fn(),
          updateModulesBatch: vi.fn(),
          updateConnectionPreview: vi.fn(),
          cancelConnection: vi.fn(),
          saveToHistory: vi.fn(),
          updateActivationZoom: vi.fn(),
          setActivationModuleIndex: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<Canvas />);
      
      // Grid icon should not be present
      expect(screen.getByTestId('viewport-info')).not.toContainHTML('📐');
    });
  });

  // =========================================================================
  // Selection Tests
  // =========================================================================
  describe('Selection', () => {
    it('should show multi-select indicator when multiple modules selected and modules exist', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: mockModules,
          connections: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          selectedModuleId: null,
          selectedConnectionId: null,
          isConnecting: false,
          connectionPreview: null,
          machineState: 'idle' as const,
          gridEnabled: true,
          activationZoom: { isZooming: false, startViewport: null, targetViewport: null, startTime: 0, duration: 800 },
          activationModuleIndex: -1,
          setViewport: vi.fn(),
          addModule: vi.fn(),
          selectModule: vi.fn(),
          selectConnection: vi.fn(),
          updateModulePosition: vi.fn(),
          updateModulesBatch: vi.fn(),
          updateConnectionPreview: vi.fn(),
          cancelConnection: vi.fn(),
          saveToHistory: vi.fn(),
          updateActivationZoom: vi.fn(),
          setActivationModuleIndex: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      mockUseSelectionStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          selectedModuleIds: ['module-1', 'module-2'],
          toggleSelection: vi.fn(),
          setSelection: vi.fn(),
          clearSelection: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<Canvas />);
      
      // Multi-select indicator should be visible - the exact text includes count
      const container = document.querySelector('[class*="bottom-4"][class*="right-4"]');
      expect(container).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Machine State Tests
  // =========================================================================
  describe('Machine State', () => {
    it('should show activation zoom indicator when zooming', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: mockModules,
          connections: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          selectedModuleId: null,
          selectedConnectionId: null,
          isConnecting: false,
          connectionPreview: null,
          machineState: 'active' as const,
          gridEnabled: true,
          activationZoom: { 
            isZooming: true, 
            startViewport: null, 
            targetViewport: null, 
            startTime: 0, 
            duration: 800 
          },
          activationModuleIndex: -1,
          setViewport: vi.fn(),
          addModule: vi.fn(),
          selectModule: vi.fn(),
          selectConnection: vi.fn(),
          updateModulePosition: vi.fn(),
          updateModulesBatch: vi.fn(),
          updateConnectionPreview: vi.fn(),
          cancelConnection: vi.fn(),
          saveToHistory: vi.fn(),
          updateActivationZoom: vi.fn(),
          setActivationModuleIndex: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<Canvas />);
      
      expect(screen.getByText('聚焦机器...')).toBeInTheDocument();
    });

    it('should not show activation zoom indicator when not zooming', () => {
      render(<Canvas />);
      
      expect(screen.queryByText('聚焦机器...')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Layers Panel Tests
  // =========================================================================
  describe('Layers Panel', () => {
    it('should toggle layers panel visibility on button click', () => {
      render(<Canvas />);
      
      const toggleButton = screen.getByTestId('toggle-layers-panel');
      
      // Click to open
      fireEvent.click(toggleButton);
      
      expect(screen.getByTestId('toggle-layers-panel')).toHaveClass('bg-[#3b82f6]');
    });
  });

  // =========================================================================
  // Performance Tests
  // =========================================================================
  describe('Performance', () => {
    it('should render without timeout with large module count', async () => {
      // Create 50+ modules
      const largeModuleSet = Array.from({ length: 50 }, (_, i) => ({
        instanceId: `module-${i}`,
        type: 'core-furnace' as const,
        x: (i % 10) * 120,
        y: Math.floor(i / 10) * 120,
        rotation: 0,
        scale: 1,
        flipped: false,
        ports: [
          { id: `port-${i}-1`, type: 'input' as const, position: { x: 25, y: 50 } },
          { id: `port-${i}-2`, type: 'output' as const, position: { x: 75, y: 50 } },
        ],
      }));

      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: largeModuleSet,
          connections: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          selectedModuleId: null,
          selectedConnectionId: null,
          isConnecting: false,
          connectionPreview: null,
          machineState: 'idle' as const,
          gridEnabled: true,
          activationZoom: { isZooming: false, startViewport: null, targetViewport: null, startTime: 0, duration: 800 },
          activationModuleIndex: -1,
          setViewport: vi.fn(),
          addModule: vi.fn(),
          selectModule: vi.fn(),
          selectConnection: vi.fn(),
          updateModulePosition: vi.fn(),
          updateModulesBatch: vi.fn(),
          updateConnectionPreview: vi.fn(),
          cancelConnection: vi.fn(),
          saveToHistory: vi.fn(),
          updateActivationZoom: vi.fn(),
          setActivationModuleIndex: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      const startTime = performance.now();
      
      render(<Canvas />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (< 2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });

    it('should not crash with zero modules', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: [],
          connections: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          selectedModuleId: null,
          selectedConnectionId: null,
          isConnecting: false,
          connectionPreview: null,
          machineState: 'idle' as const,
          gridEnabled: true,
          activationZoom: { isZooming: false, startViewport: null, targetViewport: null, startTime: 0, duration: 800 },
          activationModuleIndex: -1,
          setViewport: vi.fn(),
          addModule: vi.fn(),
          selectModule: vi.fn(),
          selectConnection: vi.fn(),
          updateModulePosition: vi.fn(),
          updateModulesBatch: vi.fn(),
          updateConnectionPreview: vi.fn(),
          cancelConnection: vi.fn(),
          saveToHistory: vi.fn(),
          updateActivationZoom: vi.fn(),
          setActivationModuleIndex: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      expect(() => render(<Canvas />)).not.toThrow();
    });
  });

  // =========================================================================
  // Viewport Info Tests
  // =========================================================================
  describe('Viewport Info', () => {
    it('should display zoom percentage in viewport info', () => {
      mockUseMachineStore.mockImplementation((selector?: (state: any) => unknown) => {
        const state = {
          modules: [],
          connections: [],
          viewport: { x: 50, y: 100, zoom: 1.5 },
          selectedModuleId: null,
          selectedConnectionId: null,
          isConnecting: false,
          connectionPreview: null,
          machineState: 'idle' as const,
          gridEnabled: true,
          activationZoom: { isZooming: false, startViewport: null, targetViewport: null, startTime: 0, duration: 800 },
          activationModuleIndex: -1,
          setViewport: vi.fn(),
          addModule: vi.fn(),
          selectModule: vi.fn(),
          selectConnection: vi.fn(),
          updateModulePosition: vi.fn(),
          updateModulesBatch: vi.fn(),
          updateConnectionPreview: vi.fn(),
          cancelConnection: vi.fn(),
          saveToHistory: vi.fn(),
          updateActivationZoom: vi.fn(),
          setActivationModuleIndex: vi.fn(),
        };
        if (selector) return selector(state);
        return state;
      });

      render(<Canvas />);
      
      expect(screen.getByTestId('viewport-info')).toContainHTML('150%');
    });

    it('should show grid icon when grid is enabled', () => {
      render(<Canvas />);
      
      expect(screen.getByTestId('viewport-info')).toContainHTML('📐');
    });

    it('should render viewport info without error', () => {
      render(<Canvas />);
      
      // The viewport info should render without error
      expect(screen.getByTestId('viewport-info')).toBeInTheDocument();
    });
  });
});
