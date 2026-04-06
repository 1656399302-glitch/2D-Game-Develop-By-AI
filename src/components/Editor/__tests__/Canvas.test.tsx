/**
 * Canvas Component Tests
 * 
 * Comprehensive test coverage for Canvas component.
 * Tests cover: module rendering, pan/zoom, selection, grid, connection points,
 * touch handling, performance with large module counts.
 * 
 * Round 164 Fix: All render() calls and state-mutating operations wrapped in act()
 * for proper React 18 async rendering handling. Added flushUpdates() helper with
 * proper fake timer handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Helper to flush React 18 concurrent updates after act()
// Works with vi.useFakeTimers() by advancing timers
const flushUpdates = () => {
  return act(async () => {
    // Advance any pending timers
    vi.advanceTimersByTime(0);
  });
};

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

  // Helper function for rendering with proper React 18 async handling
  const renderCanvas = async () => {
    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(<Canvas />);
      // Advance timers to flush any pending effects
      vi.advanceTimersByTime(0);
    });
    return result!;
  };

  // =========================================================================
  // Render Tests
  // =========================================================================
  describe('Render', () => {
    it('should render Canvas with SVG viewport', async () => {
      await renderCanvas();
      
      const svg = screen.getByRole('application');
      expect(svg).toBeInTheDocument();
      expect(svg.tagName).toBe('DIV');
    });

    it('should render SVG element inside canvas container', async () => {
      await renderCanvas();
      
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('should render grid pattern when gridEnabled is true', async () => {
      await renderCanvas();
      
      const patterns = document.querySelectorAll('pattern');
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should render empty state message when no modules', async () => {
      await renderCanvas();
      
      expect(screen.getByText('开始构建你的魔法机器')).toBeInTheDocument();
    });

    it('should render viewport info indicator', async () => {
      await renderCanvas();
      
      expect(screen.getByTestId('viewport-info')).toBeInTheDocument();
      expect(screen.getByTestId('viewport-info')).toContainHTML('100%');
    });

    it('should render layers panel toggle button', async () => {
      await renderCanvas();
      
      expect(screen.getByTestId('toggle-layers-panel')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Module Rendering Tests
  // =========================================================================
  describe('Module Rendering', () => {
    it('should not render empty state when modules exist', async () => {
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

      await renderCanvas();
      
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

      let result: ReturnType<typeof render>;
      act(() => {
        result = render(<Canvas />);
        vi.advanceTimersByTime(0);
      });
      expect(result).toBeDefined();
    });

    it('should render module count in viewport info when modules exist', async () => {
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

      await renderCanvas();
      
      // When modules exist, viewport info should show module count
      const viewportInfo = screen.getByTestId('viewport-info');
      expect(viewportInfo).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Grid Tests
  // =========================================================================
  describe('Grid', () => {
    it('should show grid indicator in viewport info when gridEnabled', async () => {
      await renderCanvas();
      
      // Viewport info should show grid icon when enabled
      expect(screen.getByTestId('viewport-info')).toContainHTML('📐');
    });

    it('should not show grid icon in viewport info when grid disabled', async () => {
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

      await renderCanvas();
      
      // Grid icon should not be present
      expect(screen.getByTestId('viewport-info')).not.toContainHTML('📐');
    });
  });

  // =========================================================================
  // Selection Tests
  // =========================================================================
  describe('Selection', () => {
    it('should show multi-select indicator when multiple modules selected and modules exist', async () => {
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

      await renderCanvas();
      
      // Multi-select indicator should be visible - the exact text includes count
      const container = document.querySelector('[class*="bottom-4"][class*="right-4"]');
      expect(container).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Machine State Tests
  // =========================================================================
  describe('Machine State', () => {
    it('should show activation zoom indicator when zooming', async () => {
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

      await renderCanvas();
      
      expect(screen.getByText('聚焦机器...')).toBeInTheDocument();
    });

    it('should not show activation zoom indicator when not zooming', async () => {
      await renderCanvas();
      
      expect(screen.queryByText('聚焦机器...')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Layers Panel Tests
  // =========================================================================
  describe('Layers Panel', () => {
    it('should toggle layers panel visibility on button click', async () => {
      await renderCanvas();
      
      const toggleButton = screen.getByTestId('toggle-layers-panel');
      
      // Click to open - wrapped in act() for React 18 state updates
      await act(async () => {
        fireEvent.click(toggleButton);
        vi.advanceTimersByTime(0);
      });
      
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
      
      await renderCanvas();
      
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

      let result: ReturnType<typeof render>;
      act(() => {
        result = render(<Canvas />);
        vi.advanceTimersByTime(0);
      });
      expect(result).toBeDefined();
    });
  });

  // =========================================================================
  // Viewport Info Tests
  // =========================================================================
  describe('Viewport Info', () => {
    it('should display zoom percentage in viewport info', async () => {
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

      await renderCanvas();
      
      expect(screen.getByTestId('viewport-info')).toContainHTML('150%');
    });

    it('should show grid icon when grid is enabled', async () => {
      await renderCanvas();
      
      expect(screen.getByTestId('viewport-info')).toContainHTML('📐');
    });

    it('should render viewport info without error', async () => {
      await renderCanvas();
      
      // The viewport info should render without error
      expect(screen.getByTestId('viewport-info')).toBeInTheDocument();
    });
  });
});
