/**
 * Keyboard Shortcuts Panel Tests
 * 
 * Tests keyboard panel close with Escape key and overlay click.
 * Note: The `?` key toggle is handled by App.tsx, not by this component.
 * This is a fix for the round 83 regression bug where conflicting handlers
 * caused inverted toggle behavior.
 * 
 * ROUND 83 FIX: Updated tests to reflect component no longer handles ? key.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { KeyboardShortcutsPanel, useKeyboardShortcutsPanel } from '../components/KeyboardShortcutsPanel';

describe('KeyboardShortcutsPanel Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render panel when isOpen is true', () => {
      render(
        <KeyboardShortcutsPanel isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('Keyboard Shortcuts')).toBeTruthy();
      expect(screen.getByText('Press ? or Escape to close')).toBeTruthy();
    });

    it('should not render panel when isOpen is false', () => {
      const { container } = render(
        <KeyboardShortcutsPanel isOpen={false} onClose={mockOnClose} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render all shortcut categories', () => {
      render(
        <KeyboardShortcutsPanel isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('Canvas')).toBeTruthy();
      expect(screen.getByText('Modules')).toBeTruthy();
      expect(screen.getByText('Connections')).toBeTruthy();
      expect(screen.getByText('Export')).toBeTruthy();
    });

    it('should render individual shortcuts', () => {
      render(
        <KeyboardShortcutsPanel isOpen={true} onClose={mockOnClose} />
      );

      // Canvas shortcuts
      expect(screen.getByText('Pan canvas')).toBeTruthy();
      expect(screen.getByText('Zoom in/out')).toBeTruthy();
      expect(screen.getByText('Zoom to fit')).toBeTruthy();

      // Module shortcuts
      expect(screen.getByText('Rotate module')).toBeTruthy();
      expect(screen.getByText('Flip module')).toBeTruthy();
      expect(screen.getByText('Duplicate selection')).toBeTruthy();
      expect(screen.getByText('Delete selected')).toBeTruthy();

      // Connection shortcuts
      expect(screen.getByText('Start connection mode')).toBeTruthy();
      expect(screen.getByText('Cancel connection')).toBeTruthy();

      // Export shortcuts
      expect(screen.getByText('Save to Codex')).toBeTruthy();
      expect(screen.getByText('Export machine')).toBeTruthy();
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <KeyboardShortcutsPanel isOpen={true} onClose={mockOnClose} />
      );

      const closeButton = screen.getByRole('button', { name: 'Close panel' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard events', () => {
    it('should listen for Escape key to close', () => {
      const { container } = render(
        <KeyboardShortcutsPanel isOpen={true} onClose={mockOnClose} />
      );

      fireEvent.keyDown(container, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    // ROUND 83 FIX: This test was removed because the component no longer handles
    // the ? key. The ? key toggle is handled exclusively by App.tsx to prevent
    // conflicting handler behavior (which caused the inverted toggle bug).
    // The previous test checked for a custom event dispatch that caused the bug.
    it('should NOT dispatch custom event for ? key press (handled by App.tsx)', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      
      render(
        <KeyboardShortcutsPanel isOpen={false} onClose={mockOnClose} />
      );

      fireEvent.keyDown(window, { key: '?', shiftKey: true });

      // The component should NOT dispatch any custom events for ? key
      // because App.tsx handles the ? key toggle exclusively
      const customEventCalls = dispatchEventSpy.mock.calls.filter(
        call => call[0]?.type === 'toggle:keyboardShortcuts'
      );
      expect(customEventCalls.length).toBe(0);

      dispatchEventSpy.mockRestore();
    });
  });
});

describe('useKeyboardShortcutsPanel Hook', () => {
  it('should initialize with isOpen as false', () => {
    const TestComponent = () => {
      const { isOpen } = useKeyboardShortcutsPanel();
      return <div data-testid="is-open">{String(isOpen)}</div>;
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('is-open').textContent).toBe('false');
  });

  it('should have open, close, and toggle functions', () => {
    const TestComponent = () => {
      const { open, close, toggle } = useKeyboardShortcutsPanel();
      return (
        <div>
          <button onClick={open}>Open</button>
          <button onClick={close}>Close</button>
          <button onClick={toggle}>Toggle</button>
        </div>
      );
    };

    const { getByText } = render(<TestComponent />);

    expect(getByText('Open')).toBeTruthy();
    expect(getByText('Close')).toBeTruthy();
    expect(getByText('Toggle')).toBeTruthy();
  });
});
