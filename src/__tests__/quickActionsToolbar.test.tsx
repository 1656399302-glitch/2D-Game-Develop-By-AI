/**
 * Quick Actions Toolbar Tests
 * 
 * Tests toolbar actions: Undo, Redo, Zoom Fit, Clear Canvas, Duplicate.
 * 
 * ROUND 81 PHASE 2: Test file per contract.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { QuickActionsToolbar } from '../components/QuickActionsToolbar';
import { useMachineStore } from '../store/useMachineStore';

describe('QuickActionsToolbar Component', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMachineStore.setState({
      modules: [],
      connections: [],
      selectedModuleId: null,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all toolbar buttons', () => {
      render(<QuickActionsToolbar />);

      expect(screen.getByTitle('Undo (Ctrl+Z)')).toBeTruthy();
      expect(screen.getByTitle('Redo (Ctrl+Y)')).toBeTruthy();
      expect(screen.getByTitle('Zoom to Fit (Ctrl+0)')).toBeTruthy();
      expect(screen.getByTitle('Clear Canvas')).toBeTruthy();
      expect(screen.getByTitle('Duplicate Selection (Ctrl+D)')).toBeTruthy();
    });

    it('should render in fixed position', () => {
      const { container } = render(<QuickActionsToolbar />);

      // Check for fixed positioning class
      const toolbar = container.querySelector('.fixed');
      expect(toolbar).toBeTruthy();
    });
  });

  describe('Undo action', () => {
    it('should be disabled when history index is 0', () => {
      render(<QuickActionsToolbar />);

      const undoButton = screen.getByTitle('Undo (Ctrl+Z)');
      expect(undoButton.hasAttribute('disabled')).toBe(true);
    });

    it('should be enabled when history has previous states', () => {
      // Add some history state
      useMachineStore.setState({
        history: [
          { modules: [], connections: [] },
          { modules: [{ id: '1', instanceId: '1', type: 'gear' as any, x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] }], connections: [] },
        ],
        historyIndex: 1,
      });

      render(<QuickActionsToolbar />);

      const undoButton = screen.getByTitle('Undo (Ctrl+Z)');
      expect(undoButton.hasAttribute('disabled')).toBe(false);
    });

    it('should call undo when clicked and enabled', () => {
      // Set up state where undo is available
      useMachineStore.setState({
        history: [
          { modules: [], connections: [] },
          { modules: [{ id: '1', instanceId: '1', type: 'gear' as any, x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] }], connections: [] },
        ],
        historyIndex: 1,
      });

      const undoSpy = vi.spyOn(useMachineStore.getState(), 'undo');

      render(<QuickActionsToolbar />);

      const undoButton = screen.getByTitle('Undo (Ctrl+Z)');
      expect(undoButton.hasAttribute('disabled')).toBe(false);
      fireEvent.click(undoButton);

      expect(undoSpy).toHaveBeenCalled();
    });
  });

  describe('Redo action', () => {
    it('should be disabled when at end of history', () => {
      render(<QuickActionsToolbar />);

      const redoButton = screen.getByTitle('Redo (Ctrl+Y)');
      expect(redoButton.hasAttribute('disabled')).toBe(true);
    });

    it('should be enabled when history has future states', () => {
      // Add future history state
      useMachineStore.setState({
        history: [
          { modules: [], connections: [] },
          { modules: [{ id: '1', instanceId: '1', type: 'gear' as any, x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] }], connections: [] },
        ],
        historyIndex: 0, // At beginning, can redo
      });

      render(<QuickActionsToolbar />);

      const redoButton = screen.getByTitle('Redo (Ctrl+Y)');
      expect(redoButton.hasAttribute('disabled')).toBe(false);
    });

    it('should call redo when clicked and enabled', () => {
      // Set up state where redo is available
      useMachineStore.setState({
        history: [
          { modules: [], connections: [] },
          { modules: [{ id: '1', instanceId: '1', type: 'gear' as any, x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] }], connections: [] },
        ],
        historyIndex: 0,
      });

      const redoSpy = vi.spyOn(useMachineStore.getState(), 'redo');

      render(<QuickActionsToolbar />);

      const redoButton = screen.getByTitle('Redo (Ctrl+Y)');
      expect(redoButton.hasAttribute('disabled')).toBe(false);
      fireEvent.click(redoButton);

      expect(redoSpy).toHaveBeenCalled();
    });
  });

  describe('Zoom Fit action', () => {
    it('should be always enabled', () => {
      render(<QuickActionsToolbar />);

      const zoomButton = screen.getByTitle('Zoom to Fit (Ctrl+0)');
      expect(zoomButton.hasAttribute('disabled')).toBe(false);
    });

    it('should call zoomToFit when clicked', () => {
      const zoomSpy = vi.spyOn(useMachineStore.getState(), 'zoomToFit');

      render(<QuickActionsToolbar />);

      const zoomButton = screen.getByTitle('Zoom to Fit (Ctrl+0)');
      fireEvent.click(zoomButton);

      expect(zoomSpy).toHaveBeenCalled();
    });
  });

  describe('Clear Canvas action', () => {
    it('should be disabled when canvas is empty', () => {
      useMachineStore.setState({
        modules: [],
      });

      render(<QuickActionsToolbar />);

      const clearButton = screen.getByTitle('Clear Canvas');
      expect(clearButton.hasAttribute('disabled')).toBe(true);
    });

    it('should be enabled when canvas has modules', () => {
      useMachineStore.setState({
        modules: [{ id: '1', instanceId: '1', type: 'gear' as any, x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] }],
      });

      render(<QuickActionsToolbar />);

      const clearButton = screen.getByTitle('Clear Canvas');
      expect(clearButton.hasAttribute('disabled')).toBe(false);
    });

    it('should call clearCanvas when clicked and confirmed', () => {
      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const clearSpy = vi.spyOn(useMachineStore.getState(), 'clearCanvas');

      useMachineStore.setState({
        modules: [{ id: '1', instanceId: '1', type: 'gear' as any, x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] }],
      });

      render(<QuickActionsToolbar />);

      const clearButton = screen.getByTitle('Clear Canvas');
      fireEvent.click(clearButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('should not call clearCanvas when cancelled', () => {
      // Mock window.confirm to return false
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const clearSpy = vi.spyOn(useMachineStore.getState(), 'clearCanvas');

      useMachineStore.setState({
        modules: [{ id: '1', instanceId: '1', type: 'gear' as any, x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] }],
      });

      render(<QuickActionsToolbar />);

      const clearButton = screen.getByTitle('Clear Canvas');
      fireEvent.click(clearButton);

      expect(clearSpy).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Duplicate action', () => {
    it('should be disabled when nothing is selected', () => {
      render(<QuickActionsToolbar />);

      const duplicateButton = screen.getByTitle('Duplicate Selection (Ctrl+D)');
      expect(duplicateButton.hasAttribute('disabled')).toBe(true);
    });

    it('should be enabled when a module is selected', () => {
      useMachineStore.setState({
        selectedModuleId: 'test-module-id',
      });

      render(<QuickActionsToolbar />);

      const duplicateButton = screen.getByTitle('Duplicate Selection (Ctrl+D)');
      expect(duplicateButton.hasAttribute('disabled')).toBe(false);
    });

    it('should call duplicateModule when clicked', () => {
      const duplicateSpy = vi.spyOn(useMachineStore.getState(), 'duplicateModule');

      useMachineStore.setState({
        selectedModuleId: 'test-module-id',
      });

      render(<QuickActionsToolbar />);

      const duplicateButton = screen.getByTitle('Duplicate Selection (Ctrl+D)');
      fireEvent.click(duplicateButton);

      expect(duplicateSpy).toHaveBeenCalledWith('test-module-id');
    });
  });
});
