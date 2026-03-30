import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { LayersPanel } from '../components/Editor/LayersPanel';
import { useMachineStore } from '../store/useMachineStore';
import { useSelectionStore } from '../store/useSelectionStore';
import { PlacedModule, ModuleType } from '../types';

// Helper to create mock modules
const createMockModule = (
  instanceId: string,
  type: ModuleType = 'core-furnace',
  x: number = 100,
  y: number = 100
): PlacedModule => ({
  id: `id-${instanceId}`,
  instanceId,
  type,
  x,
  y,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [
    { id: `${instanceId}-input-0`, type: 'input', position: { x: 25, y: 50 } },
    { id: `${instanceId}-output-0`, type: 'output', position: { x: 75, y: 50 } },
  ],
});

describe('LayersPanel', () => {
  beforeEach(() => {
    // Reset stores to initial state
    useMachineStore.setState({
      modules: [],
      connections: [],
      selectedModuleId: null,
    });
    useSelectionStore.setState({
      selectedModuleIds: [],
    });
  });

  describe('Rendering', () => {
    it('should render the layers panel', () => {
      render(<LayersPanel />);
      
      expect(screen.getByTestId('layers-panel')).toBeInTheDocument();
    });

    it('should show module count in header', () => {
      useMachineStore.setState({
        modules: [
          createMockModule('m1', 'core-furnace', 100, 100),
          createMockModule('m2', 'gear', 200, 200),
        ],
      });
      
      render(<LayersPanel />);
      
      // Look for the count span - it contains "(2)" format
      expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
    });

    it('should show empty state when no modules', () => {
      render(<LayersPanel />);
      
      expect(screen.getByText(/没有模块/)).toBeInTheDocument();
      expect(screen.getByText(/从模块面板拖入模块/)).toBeInTheDocument();
    });

    it('should show filtered state when no matches', () => {
      useMachineStore.setState({
        modules: [createMockModule('m1', 'core-furnace', 100, 100)],
      });
      
      render(<LayersPanel />);
      
      const filterInput = screen.getByTestId('layers-filter-input');
      fireEvent.change(filterInput, { target: { value: 'nonexistent' } });
      
      expect(screen.getByText(/没有匹配的模块/)).toBeInTheDocument();
    });
  });

  describe('Module List', () => {
    it('should render all modules', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
        createMockModule('m3', 'rune-node', 300, 300),
      ];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      expect(screen.getByTestId('layer-item-m1')).toBeInTheDocument();
      expect(screen.getByTestId('layer-item-m2')).toBeInTheDocument();
      expect(screen.getByTestId('layer-item-m3')).toBeInTheDocument();
    });

    it('should render correct count of layer items', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      const layerItems = screen.getAllByTestId(/layer-item-/);
      expect(layerItems).toHaveLength(2);
    });

    it('should display module position', () => {
      const modules = [createMockModule('m1', 'core-furnace', 150, 250)];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      expect(screen.getByText(/150, 250/)).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should highlight selected module', () => {
      const modules = [createMockModule('m1', 'core-furnace', 100, 100)];
      useMachineStore.setState({ modules });
      useSelectionStore.setState({ selectedModuleIds: ['m1'] });
      
      render(<LayersPanel />);
      
      const layerItem = screen.getByTestId('layer-item-m1');
      expect(layerItem).toHaveClass('bg-[#3b82f6]/20');
    });
  });

  describe('Visibility Toggle', () => {
    it('should toggle module visibility', () => {
      const modules = [createMockModule('m1', 'core-furnace', 100, 100)];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      const visibilityButton = screen.getByTestId('layer-visibility-m1');
      fireEvent.click(visibilityButton);
      
      const updatedModule = useMachineStore.getState().modules[0];
      expect(updatedModule.isVisible).toBe(false);
    });

    it('should toggle visibility back to visible', () => {
      const modules = [{ ...createMockModule('m1', 'core-furnace', 100, 100), isVisible: false }];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      const visibilityButton = screen.getByTestId('layer-visibility-m1');
      fireEvent.click(visibilityButton);
      
      const updatedModule = useMachineStore.getState().modules[0];
      expect(updatedModule.isVisible).toBe(true);
    });

    it('should show correct visibility icon', () => {
      const modules = [
        { ...createMockModule('m1', 'core-furnace', 100, 100), isVisible: true },
        { ...createMockModule('m2', 'gear', 200, 200), isVisible: false },
      ];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      // Visible module should show eye emoji
      expect(screen.getByTestId('layer-visibility-m1')).toHaveTextContent('👁');
      // Hidden module should show eye with slash emoji
      expect(screen.getByTestId('layer-visibility-m2')).toHaveTextContent('👁‍🗨');
    });
  });

  describe('Z-Order Controls', () => {
    it('should expand module to show z-order controls', () => {
      const modules = [createMockModule('m1', 'core-furnace', 100, 100)];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      const expandButton = screen.getByTestId('layer-expand-m1');
      fireEvent.click(expandButton);
      
      expect(screen.getByTestId('layer-move-top-m1')).toBeInTheDocument();
      expect(screen.getByTestId('layer-move-up-m1')).toBeInTheDocument();
      expect(screen.getByTestId('layer-move-down-m1')).toBeInTheDocument();
      expect(screen.getByTestId('layer-move-bottom-m1')).toBeInTheDocument();
    });

    it('should move module up', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      // Expand m1
      const expandButton = screen.getByTestId('layer-expand-m1');
      fireEvent.click(expandButton);
      
      // Click move up
      const moveUpButton = screen.getByTestId('layer-move-up-m1');
      fireEvent.click(moveUpButton);
      
      // Module order should have changed
      const updatedModules = useMachineStore.getState().modules;
      expect(updatedModules[0].instanceId).toBe('m2');
      expect(updatedModules[1].instanceId).toBe('m1');
    });
  });

  describe('Filter and Sort', () => {
    it('should filter modules by name', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      const filterInput = screen.getByTestId('layers-filter-input');
      fireEvent.change(filterInput, { target: { value: 'gear' } });
      
      expect(screen.getByTestId('layer-item-m2')).toBeInTheDocument();
      expect(screen.queryByTestId('layer-item-m1')).not.toBeInTheDocument();
    });

    it('should sort by name', () => {
      const modules = [
        createMockModule('m1', 'gear', 100, 100),
        createMockModule('m2', 'core-furnace', 200, 200),
      ];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      const sortButton = screen.getByTestId('layers-sort-name');
      fireEvent.click(sortButton);
      
      // After sorting, both modules should still be present
      const layerItems = screen.getAllByTestId(/layer-item-/);
      expect(layerItems).toHaveLength(2);
    });

    it('should sort by type', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      const sortButton = screen.getByTestId('layers-sort-type');
      fireEvent.click(sortButton);
      
      const layerItems = screen.getAllByTestId(/layer-item-/);
      expect(layerItems).toHaveLength(2);
    });
  });

  describe('Collapse/Expand', () => {
    it('should collapse the panel', () => {
      render(<LayersPanel />);
      
      const collapseButton = screen.getByTestId('layers-panel-collapse');
      fireEvent.click(collapseButton);
      
      expect(screen.getByTestId('layers-panel-expand')).toBeInTheDocument();
    });

    it('should expand collapsed panel', () => {
      render(<LayersPanel />);
      
      // First collapse
      const collapseButton = screen.getByTestId('layers-panel-collapse');
      fireEvent.click(collapseButton);
      
      // Then expand
      const expandButton = screen.getByTestId('layers-panel-expand');
      fireEvent.click(expandButton);
      
      expect(screen.getByTestId('layers-panel')).toBeInTheDocument();
    });

    it('should close on Escape key', () => {
      render(<LayersPanel />);
      
      const panel = screen.getByTestId('layers-panel');
      fireEvent.keyDown(panel, { key: 'Escape' });
      
      expect(screen.getByTestId('layers-panel-expand')).toBeInTheDocument();
    });
  });

  describe('Stats Footer', () => {
    it('should show module count in footer', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      expect(screen.getByText(/模块: 2/)).toBeInTheDocument();
    });

    it('should show visible count in footer', () => {
      const modules = [
        { ...createMockModule('m1', 'core-furnace', 100, 100), isVisible: true },
        { ...createMockModule('m2', 'gear', 200, 200), isVisible: false },
      ];
      useMachineStore.setState({ modules });
      
      render(<LayersPanel />);
      
      expect(screen.getByText(/可见: 1/)).toBeInTheDocument();
    });
  });
});
