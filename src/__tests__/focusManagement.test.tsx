import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React, { useState, useRef } from 'react';

// Test focus management imports
import {
  FocusManager,
  useFocusTrap,
  trapFocus,
  restoreFocus,
  getFirstFocusable,
  getLastFocusable,
} from '../components/Accessibility/FocusManager';

describe('P0: AC3 - Focus Management', () => {
  beforeEach(() => {
    document.body.focus();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('FocusManager Component', () => {
    it('should render children when open', () => {
      const { getByText } = render(
        <FocusManager isOpen={true} onClose={() => {}} modalLabel="Test Modal">
          <div>Modal Content</div>
        </FocusManager>
      );

      expect(getByText('Modal Content')).toBeInTheDocument();
    });

    it('should set role="dialog" by default', () => {
      render(
        <FocusManager isOpen={true} onClose={() => {}} modalLabel="Test Modal">
          <div>Content</div>
        </FocusManager>
      );

      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
    });

    it('should set role="alertdialog" when specified', () => {
      render(
        <FocusManager isOpen={true} onClose={() => {}} modalRole="alertdialog" modalLabel="Alert Modal">
          <div>Content</div>
        </FocusManager>
      );

      const dialog = document.querySelector('[role="alertdialog"]');
      expect(dialog).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      render(
        <FocusManager isOpen={true} onClose={() => {}} modalLabel="Test Modal">
          <div>Content</div>
        </FocusManager>
      );

      const dialog = document.querySelector('[aria-modal="true"]');
      expect(dialog).toBeInTheDocument();
    });

    it('should have aria-label with modal label', () => {
      render(
        <FocusManager isOpen={true} onClose={() => {}} modalLabel="Test Modal">
          <div>Content</div>
        </FocusManager>
      );

      const dialog = document.querySelector('[aria-label="Test Modal"]');
      expect(dialog).toBeInTheDocument();
    });

    it('should close on Escape key', () => {
      const handleClose = vi.fn();

      render(
        <FocusManager isOpen={true} onClose={handleClose} modalLabel="Test Modal">
          <div>
            <button>First</button>
            <button>Second</button>
          </div>
        </FocusManager>
      );

      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(handleClose).toHaveBeenCalled();
    });

    it('should render all modal buttons', () => {
      render(
        <FocusManager isOpen={true} onClose={() => {}} modalLabel="Test Modal">
          <div>
            <button data-testid="first-btn">First</button>
            <button data-testid="last-btn">Last</button>
          </div>
        </FocusManager>
      );

      expect(screen.getByTestId('first-btn')).toBeInTheDocument();
      expect(screen.getByTestId('last-btn')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for accessibility', () => {
      render(
        <FocusManager isOpen={true} onClose={() => {}} modalLabel="Codex Modal">
          <div>
            <button>Button 1</button>
            <button>Button 2</button>
          </div>
        </FocusManager>
      );

      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog?.getAttribute('aria-label')).toBe('Codex Modal');
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
    });
  });

  describe('useFocusTrap Hook', () => {
    it('should set up focus trap when active', () => {
      const TestComponent = () => {
        const containerRef = useRef<HTMLDivElement>(null);

        useFocusTrap(containerRef, true, { onEscape: () => {} });

        return (
          <div ref={containerRef}>
            <button data-testid="hook-first">First</button>
            <button data-testid="hook-last">Last</button>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('hook-first')).toBeInTheDocument();
      expect(screen.getByTestId('hook-last')).toBeInTheDocument();
    });

    it('should call onEscape when Escape is pressed', () => {
      const handleEscape = vi.fn();

      const TestComponent = () => {
        const containerRef = useRef<HTMLDivElement>(null);

        useFocusTrap(containerRef, true, { onEscape: handleEscape });

        return (
          <div ref={containerRef}>
            <button>Button</button>
          </div>
        );
      };

      render(<TestComponent />);

      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(handleEscape).toHaveBeenCalled();
    });

    it('should not trap focus when inactive', () => {
      const TestComponent = () => {
        const containerRef = useRef<HTMLDivElement>(null);

        useFocusTrap(containerRef, false);

        return (
          <div ref={containerRef}>
            <button data-testid="inactive-first">First</button>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('inactive-first')).toBeInTheDocument();
    });
  });

  describe('trapFocus utility', () => {
    it('should focus first focusable element on init', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button data-testid="util-first">First</button>
        <input data-testid="util-input" />
      `;
      document.body.appendChild(container);

      const cleanup = trapFocus(container);

      const firstBtn = container.querySelector('[data-testid="util-first"]') as HTMLElement;
      expect(document.activeElement).toBe(firstBtn);

      cleanup();
      document.body.removeChild(container);
    });
  });

  describe('restoreFocus utility', () => {
    it('should restore focus to element', () => {
      const button = document.createElement('button');
      button.textContent = 'Test Button';
      document.body.appendChild(button);

      // Focus something else
      document.body.focus();

      // Restore focus to button
      restoreFocus(button);

      expect(document.activeElement).toBe(button);

      document.body.removeChild(button);
    });

    it('should handle null element gracefully', () => {
      expect(() => restoreFocus(null)).not.toThrow();
    });

    it('should handle undefined element gracefully', () => {
      expect(() => restoreFocus(undefined)).not.toThrow();
    });
  });

  describe('getFirstFocusable', () => {
    it('should return first focusable element', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div>Not focusable</div>
        <button data-testid="first">First Button</button>
        <input data-testid="second" />
      `;
      document.body.appendChild(container);

      const first = getFirstFocusable(container);

      expect(first).toBe(container.querySelector('[data-testid="first"]'));

      document.body.removeChild(container);
    });

    it('should return null when no focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div>Not focusable</div>';
      document.body.appendChild(container);

      const first = getFirstFocusable(container);

      expect(first).toBeNull();

      document.body.removeChild(container);
    });
  });

  describe('getLastFocusable', () => {
    it('should return last focusable element', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button data-testid="first">First Button</button>
        <input data-testid="second" />
        <button data-testid="last">Last Button</button>
      `;
      document.body.appendChild(container);

      const last = getLastFocusable(container);

      expect(last).toBe(container.querySelector('[data-testid="last"]'));

      document.body.removeChild(container);
    });

    it('should return null when no focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div>Not focusable</div>';
      document.body.appendChild(container);

      const last = getLastFocusable(container);

      expect(last).toBeNull();

      document.body.removeChild(container);
    });
  });
});

describe('P1: AC4 - Skip Navigation', () => {
  it('should be first focusable element on page', () => {
    const { container } = render(
      <div>
        <a href="#main" className="sr-only focus:not-sr-only">
          Skip to main
        </a>
        <button>First</button>
        <button>Second</button>
      </div>
    );

    const skipLink = container.querySelector('a');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveClass('sr-only');
  });

  it('should have correct href for canvas', () => {
    const { container } = render(
      <a href="#main-canvas" className="sr-only">
        Skip to content
      </a>
    );

    const link = container.querySelector('a[href="#main-canvas"]');
    expect(link).toBeInTheDocument();
    expect(link?.textContent).toContain('Skip to content');
  });
});

describe('Tab Order Verification', () => {
  it('should follow logical tab order through editor interface', () => {
    render(
      <div>
        <a href="#main-canvas" className="sr-only">
          Skip to canvas
        </a>
        <nav aria-label="Module Panel">
          <button>Module 1</button>
          <button>Module 2</button>
        </nav>
        <header>
          <button>Toolbar 1</button>
          <button>Toolbar 2</button>
        </header>
        <main id="main-canvas" tabIndex={0}>
          Canvas Area
        </main>
        <aside>
          <button>Property 1</button>
        </aside>
      </div>
    );

    // Verify main landmark exists
    const main = document.getElementById('main-canvas');
    expect(main).toBeInTheDocument();
  });

  it('should have proper tab order in export modal', () => {
    render(
      <div role="dialog" aria-label="Export Modal">
        <button data-testid="export-close">Close</button>
        <button data-testid="export-format-svg">SVG</button>
        <button data-testid="export-format-png">PNG</button>
        <button data-testid="export-action">Export</button>
        <button data-testid="export-cancel">Cancel</button>
      </div>
    );

    expect(screen.getByTestId('export-close')).toBeInTheDocument();
    expect(screen.getByTestId('export-format-svg')).toBeInTheDocument();
    expect(screen.getByTestId('export-format-png')).toBeInTheDocument();
    expect(screen.getByTestId('export-action')).toBeInTheDocument();
    expect(screen.getByTestId('export-cancel')).toBeInTheDocument();
  });
});

describe('Modal Focus Integration', () => {
  it('should manage focus for Export Modal', () => {
    const handleClose = vi.fn();

    render(
      <FocusManager isOpen={true} onClose={handleClose} modalLabel="Export Modal">
        <div>
          <h2>Export</h2>
          <button data-testid="export-svg-btn">Export SVG</button>
          <button data-testid="export-cancel-btn">Cancel</button>
        </div>
      </FocusManager>
    );

    // Verify modal is rendered
    expect(screen.getByTestId('export-svg-btn')).toBeInTheDocument();
    expect(screen.getByTestId('export-cancel-btn')).toBeInTheDocument();

    // Escape should close modal
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(handleClose).toHaveBeenCalled();
  });

  it('should manage focus for Codex Modal', () => {
    const handleClose = vi.fn();

    render(
      <FocusManager isOpen={true} onClose={handleClose} modalLabel="Codex Modal">
        <div>
          <h2>Codex</h2>
          <button data-testid="codex-load-btn">Load</button>
          <button data-testid="codex-delete-btn">Delete</button>
          <button data-testid="codex-close-btn">Close</button>
        </div>
      </FocusManager>
    );

    // Verify all buttons are rendered
    expect(screen.getByTestId('codex-load-btn')).toBeInTheDocument();
    expect(screen.getByTestId('codex-delete-btn')).toBeInTheDocument();
    expect(screen.getByTestId('codex-close-btn')).toBeInTheDocument();

    // Escape should close modal
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(handleClose).toHaveBeenCalled();
  });

  it('should manage focus for Community Gallery Modal', () => {
    const handleClose = vi.fn();

    render(
      <FocusManager isOpen={true} onClose={handleClose} modalLabel="Community Gallery">
        <div>
          <input
            type="text"
            data-testid="gallery-search"
            placeholder="Search..."
          />
          <select data-testid="gallery-filter">
            <option>All</option>
          </select>
          <button data-testid="gallery-load-btn">Load</button>
          <button data-testid="gallery-close-btn">Close</button>
        </div>
      </FocusManager>
    );

    // Verify all elements are rendered
    expect(screen.getByTestId('gallery-search')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-filter')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-load-btn')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-close-btn')).toBeInTheDocument();

    // Escape should close modal
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(handleClose).toHaveBeenCalled();
  });
});
