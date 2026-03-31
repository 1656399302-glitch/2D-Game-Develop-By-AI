// Mock window.matchMedia for JSDOM environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Test accessibility layer imports
import {
  announceToScreenReader,
  announceMachineState,
  announceConnectionEvent,
  announceModuleOperation,
  announceError,
  AccessibilityLayer,
  SkipLink,
  MainLandmark,
  Region,
} from '../components/Accessibility/AccessibilityLayer';
import { MachineState } from '../types';

describe('P0: AC1 - Screen Reader Announcements', () => {
  beforeEach(() => {
    // Clean up any existing announcer elements
    document.body.innerHTML = '';
    
    // Remove any existing announcers
    const existingAnnouncer = document.getElementById('sr-announcer');
    const existingAssertive = document.getElementById('sr-announcer-assertive');
    if (existingAnnouncer) existingAnnouncer.remove();
    if (existingAssertive) existingAssertive.remove();
  });

  afterEach(() => {
    // Clean up announcer elements
    const existingAnnouncer = document.getElementById('sr-announcer');
    const existingAssertive = document.getElementById('sr-announcer-assertive');
    if (existingAnnouncer) existingAnnouncer.remove();
    if (existingAssertive) existingAssertive.remove();
  });

  describe('announceToScreenReader', () => {
    it('should create announcer element if not exists', async () => {
      await act(async () => {
        announceToScreenReader('Test message');
        // Wait for the async operation
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      const announcer = document.getElementById('sr-announcer');
      expect(announcer).toBeInTheDocument();
    });

    it('should set aria-live attribute to polite by default', async () => {
      await act(async () => {
        announceToScreenReader('Test message');
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      const announcer = document.getElementById('sr-announcer');
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
    });

    it('should set aria-live to assertive when specified', async () => {
      await act(async () => {
        announceToScreenReader('Error message', 'assertive');
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      const announcer = document.getElementById('sr-announcer');
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should set role to status', async () => {
      await act(async () => {
        announceToScreenReader('Test message');
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      const announcer = document.getElementById('sr-announcer');
      expect(announcer?.getAttribute('role')).toBe('status');
    });
  });

  describe('announceMachineState', () => {
    it('should be callable without errors for all states', () => {
      const states: MachineState[] = ['idle', 'charging', 'active', 'failure', 'overload', 'shutdown'];
      
      states.forEach(state => {
        expect(() => {
          act(() => {
            announceMachineState(state);
          });
        }).not.toThrow();
      });
    });

    it('should use polite priority for normal states', () => {
      const normalStates: MachineState[] = ['idle', 'charging', 'active', 'shutdown'];
      
      normalStates.forEach(state => {
        act(() => {
          announceMachineState(state);
        });
        
        // The function should call announceToScreenReader with 'polite'
        const announcer = document.getElementById('sr-announcer');
        expect(announcer?.getAttribute('aria-live')).toBe('polite');
      });
    });

    it('should use assertive priority for error states', () => {
      const errorStates: MachineState[] = ['failure', 'overload'];
      
      errorStates.forEach(state => {
        act(() => {
          announceMachineState(state);
        });
        
        // The function uses sr-announcer and sets aria-live based on priority
        const announcer = document.getElementById('sr-announcer');
        expect(announcer?.getAttribute('aria-live')).toBe('assertive');
      });
    });
  });

  describe('announceConnectionEvent', () => {
    it('should be callable without errors for all events', () => {
      const events = ['start', 'complete', 'cancel', 'error'] as const;
      
      events.forEach(event => {
        expect(() => {
          act(() => {
            announceConnectionEvent(event);
          });
        }).not.toThrow();
      });
    });

    it('should use polite priority for non-error events', () => {
      const normalEvents = ['start', 'complete', 'cancel'] as const;
      
      normalEvents.forEach(event => {
        act(() => {
          announceConnectionEvent(event, 'Module A', 'Module B');
        });
        
        const announcer = document.getElementById('sr-announcer');
        expect(announcer?.getAttribute('aria-live')).toBe('polite');
      });
    });

    it('should use assertive priority for error events', () => {
      act(() => {
        announceConnectionEvent('error', undefined, undefined, 'Connection failed');
      });
      
      // The function uses sr-announcer and sets aria-live based on priority
      const announcer = document.getElementById('sr-announcer');
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');
    });
  });

  describe('announceModuleOperation', () => {
    it('should be callable without errors for all operations', () => {
      const operations = ['add', 'delete', 'move', 'rotate', 'select', 'duplicate'] as const;
      
      operations.forEach(op => {
        expect(() => {
          act(() => {
            announceModuleOperation(op, 'Test Module');
          });
        }).not.toThrow();
      });
    });
  });

  describe('announceError', () => {
    it('should be callable without errors', () => {
      expect(() => {
        act(() => {
          announceError('错误', 'Error message');
        });
      }).not.toThrow();
    });

    it('should use assertive priority', () => {
      act(() => {
        announceError('错误', 'Error message');
      });
      
      // The function uses sr-announcer and sets aria-live based on priority
      const announcer = document.getElementById('sr-announcer');
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');
    });
  });
});

describe('P1: AC4 - Skip Navigation', () => {
  it('should render skip link with correct href', () => {
    render(<SkipLink href="#main-canvas">跳转到画布</SkipLink>);

    const link = screen.getByRole('link', { name: '跳转到画布' });
    expect(link).toHaveAttribute('href', '#main-canvas');
  });

  it('should have sr-only class by default', () => {
    const { container } = render(
      <SkipLink href="#main">Skip to main</SkipLink>
    );

    const link = container.querySelector('a');
    expect(link).toHaveClass('sr-only');
  });
});

describe('AccessibilityLayer Component', () => {
  beforeEach(() => {
    // Clean up announcer elements
    const existingAnnouncer = document.getElementById('sr-announcer');
    const existingAssertive = document.getElementById('sr-announcer-assertive');
    if (existingAnnouncer) existingAnnouncer.remove();
    if (existingAssertive) existingAssertive.remove();
  });

  it('should render children', () => {
    render(
      <AccessibilityLayer>
        <div data-testid="child">Test Content</div>
      </AccessibilityLayer>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should include polite announcer', () => {
    render(<AccessibilityLayer />);

    const announcer = document.getElementById('sr-announcer');
    expect(announcer).toBeInTheDocument();
    expect(announcer?.getAttribute('role')).toBe('status');
    expect(announcer?.getAttribute('aria-live')).toBe('polite');
  });

  it('should include assertive announcer for errors', () => {
    render(<AccessibilityLayer />);

    const assertiveAnnouncer = document.getElementById('sr-announcer-assertive');
    expect(assertiveAnnouncer).toBeInTheDocument();
    expect(assertiveAnnouncer?.getAttribute('role')).toBe('alert');
    expect(assertiveAnnouncer?.getAttribute('aria-live')).toBe('assertive');
  });

  it('should include skip links', () => {
    render(<AccessibilityLayer />);

    const links = document.querySelectorAll('a[href="#main-canvas"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should include skip link to module panel', () => {
    render(<AccessibilityLayer />);

    const links = document.querySelectorAll('a[href="#module-panel"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should include skip link to toolbar', () => {
    render(<AccessibilityLayer />);

    const links = document.querySelectorAll('a[href="#main-toolbar"]');
    expect(links.length).toBeGreaterThan(0);
  });
});

describe('MainLandmark', () => {
  it('should render main element with role="main"', () => {
    render(<MainLandmark>Content</MainLandmark>);

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main.textContent).toBe('Content');
  });

  it('should accept id prop', () => {
    render(<MainLandmark id="main-content">Content</MainLandmark>);

    const main = document.getElementById('main-content');
    expect(main).toBeInTheDocument();
  });
});

describe('Region', () => {
  it('should render section with aria-labelledby', () => {
    render(
      <Region id="test-region" label="Test Label">
        Content
      </Region>
    );

    const section = document.getElementById('test-region');
    expect(section).toBeInTheDocument();
    expect(section?.getAttribute('aria-labelledby')).toBe('test-region-heading');
  });

  it('should include hidden heading with label', () => {
    const { container } = render(
      <Region id="test-region" label="Test Label">
        Content
      </Region>
    );

    const heading = container.querySelector('#test-region-heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('sr-only');
    expect(heading?.textContent).toBe('Test Label');
  });
});

describe('ARIA Live Region Verification', () => {
  beforeEach(() => {
    // Clean up announcer elements
    const existingAnnouncer = document.getElementById('sr-announcer');
    const existingAssertive = document.getElementById('sr-announcer-assertive');
    if (existingAnnouncer) existingAnnouncer.remove();
    if (existingAssertive) existingAssertive.remove();
  });

  it('should have at least one polite live region', () => {
    render(<AccessibilityLayer />);

    const politeRegions = document.querySelectorAll('[aria-live="polite"]');
    expect(politeRegions.length).toBeGreaterThan(0);
  });

  it('should have at least one assertive live region', () => {
    render(<AccessibilityLayer />);

    const assertiveRegions = document.querySelectorAll('[aria-live="assertive"]');
    expect(assertiveRegions.length).toBeGreaterThan(0);
  });

  it('should have role="alert" regions for errors', () => {
    render(<AccessibilityLayer />);

    const alertRegions = document.querySelectorAll('[role="alert"]');
    expect(alertRegions.length).toBeGreaterThan(0);
  });

  it('should have role="status" regions for announcements', () => {
    render(<AccessibilityLayer />);

    const statusRegions = document.querySelectorAll('[role="status"]');
    expect(statusRegions.length).toBeGreaterThan(0);
  });
});
