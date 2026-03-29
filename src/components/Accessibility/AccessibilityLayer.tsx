import { useEffect, useCallback, useRef, ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';

/**
 * Screen reader announcement region
 * Announces messages to screen readers without interrupting flow
 */
let announceTimeout: ReturnType<typeof setTimeout> | null = null;

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  // Clear any pending announcement
  if (announceTimeout) {
    clearTimeout(announceTimeout);
  }

  // Create or find the announcer element
  let announcer = document.getElementById('sr-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(announcer);
  }

  // Update priority if different
  if (announcer.getAttribute('aria-live') !== priority) {
    announcer.setAttribute('aria-live', priority);
  }

  // Clear and set new message (with slight delay to ensure announcement)
  announcer.textContent = '';
  announceTimeout = setTimeout(() => {
    announcer!.textContent = message;
  }, 100);

  // Clean up after announcement
  announceTimeout = setTimeout(() => {
    if (announcer) {
      announcer.textContent = '';
    }
  }, 3000);
}

/**
 * Focus management utilities
 */
export function focusFirstDescendant(element: HTMLElement): boolean {
  const focusable = element.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusable.length > 0) {
    (focusable[0] as HTMLElement).focus();
    return true;
  }
  return false;
}

export function focusLastDescendant(element: HTMLElement): boolean {
  const focusable = element.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusable.length > 0) {
    (focusable[focusable.length - 1] as HTMLElement).focus();
    return true;
  }
  return false;
}

/**
 * Hook to manage focus trapping within a modal or dialog
 */
export function useFocusTrapEnhanced(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean,
  options: {
    onEscape?: () => void;
    initialFocus?: 'first' | 'container' | 'none';
  } = {}
) {
  const { onEscape, initialFocus = 'first' } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store current focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;

    // Determine initial focus
    if (initialFocus === 'container') {
      container.focus();
    } else if (initialFocus === 'first') {
      focusFirstDescendant(container);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, containerRef, initialFocus, onEscape]);
}

// Need React for useState
import React, { useState } from 'react';

/**
 * Roving tabindex management for lists
 */
export function useRovingTabIndex(
  items: unknown[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (items.length === 0) return;

    let newIndex = focusedIndex;
    let handled = false;

    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          newIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : (loop ? 0 : focusedIndex);
          handled = true;
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          newIndex = focusedIndex > 0 ? focusedIndex - 1 : (loop ? items.length - 1 : focusedIndex);
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : (loop ? 0 : focusedIndex);
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = focusedIndex > 0 ? focusedIndex - 1 : (loop ? items.length - 1 : focusedIndex);
          handled = true;
        }
        break;
      case 'Home':
        newIndex = 0;
        handled = true;
        break;
      case 'End':
        newIndex = items.length - 1;
        handled = true;
        break;
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          setSelectedIndex(focusedIndex);
          onSelect?.(focusedIndex);
          handled = true;
        }
        break;
    }

    if (handled) {
      e.preventDefault();
      setFocusedIndex(newIndex);
    }
  }, [focusedIndex, items.length, orientation, loop, onSelect]);

  const getTabIndex = useCallback((index: number) => {
    if (focusedIndex < 0) return index === 0 ? 0 : -1;
    return index === focusedIndex ? 0 : -1;
  }, [focusedIndex]);

  return {
    focusedIndex,
    selectedIndex,
    setFocusedIndex,
    containerRef,
    handleKeyDown,
    getTabIndex,
    isSelected: (index: number) => index === selectedIndex,
    isFocused: (index: number) => index === focusedIndex,
  };
}

/**
 * Skip link component for keyboard navigation
 */
export function SkipLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-[#7c3aed] focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
    >
      {children}
    </a>
  );
}

/**
 * Landmark region for main content
 */
export function MainLandmark({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <main id={id} className="flex-1 overflow-hidden" role="main">
      {children}
    </main>
  );
}

/**
 * Complementary landmark (aside)
 */
export function AsideLandmark({ children, id, label }: { children: ReactNode; id?: string; label: string }) {
  return (
    <aside id={id} aria-label={label} className="contents">
      {children}
    </aside>
  );
}

/**
 * Navigation landmark
 */
export function NavLandmark({ children, id, label }: { children: ReactNode; id?: string; label: string }) {
  return (
    <nav id={id} aria-label={label} className="contents">
      {children}
    </nav>
  );
}

/**
 * Region with label
 */
export function Region({ children, id, label, className = '' }: {
  children: ReactNode;
  id: string;
  label: string;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={className}>
      <h2 id={`${id}-heading`} className="sr-only">
        {label}
      </h2>
      {children}
    </section>
  );
}

/**
 * Accessibility Layer - wraps main app with accessibility features
 */
export function AccessibilityLayer({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  // Apply reduced motion preference
  useEffect(() => {
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [prefersReducedMotion]);

  return (
    <>
      {/* Skip links */}
      <SkipLink href="#main-canvas">跳转到画布</SkipLink>
      <SkipLink href="#module-panel">跳转到模块面板</SkipLink>
      <SkipLink href="#main-toolbar">跳转到工具栏</SkipLink>

      {/* Screen reader announcer */}
      <div
        id="sr-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        }}
      />

      {/* Main content */}
      {children}

      {/* Reduced motion styles */}
      <style>{`
        .reduce-motion,
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `}</style>
    </>
  );
}

/**
 * High contrast mode support
 */
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setIsHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isHighContrast;
}

export default AccessibilityLayer;
