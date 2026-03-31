import { useEffect, useCallback, useRef, ReactNode, useState } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { MachineState } from '../../types';

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
 * Machine activation state announcements for screen readers
 * P0: AC1 - Machine activation states must be announced via ARIA live regions
 */
export function announceMachineState(state: MachineState) {
  const stateMessages: Record<MachineState, string> = {
    idle: '机器已停止',
    charging: '机器正在充能，请稍候',
    active: '机器已激活，正在运行',
    overload: '警告：机器过载！',
    failure: '错误：机器故障',
    shutdown: '机器正在关闭',
  };
  
  const message = stateMessages[state] || `机器状态变更为${state}`;
  
  // Use assertive for error states, polite for normal states
  const priority: 'polite' | 'assertive' = 
    state === 'failure' || state === 'overload' ? 'assertive' : 'polite';
  
  announceToScreenReader(message, priority);
}

/**
 * Connection creation announcement for screen readers
 * P0: AC1 - Connection events must be announced
 */
export function announceConnectionEvent(
  event: 'start' | 'complete' | 'cancel' | 'error',
  sourceModule?: string,
  targetModule?: string,
  errorMessage?: string
) {
  let message = '';
  
  switch (event) {
    case 'start':
      message = `开始连接 ${sourceModule || '模块'}`;
      break;
    case 'complete':
      message = `连接成功：${sourceModule || '源模块'} 已连接到 ${targetModule || '目标模块'}`;
      break;
    case 'cancel':
      message = '连接已取消';
      break;
    case 'error':
      message = `连接错误：${errorMessage || '无法创建连接'}`;
      break;
  }
  
  // Errors use assertive, others use polite
  const priority: 'polite' | 'assertive' = event === 'error' ? 'assertive' : 'polite';
  announceToScreenReader(message, priority);
}

/**
 * Module operation announcements for screen readers
 * P0: AC1 - Module operations must be announced
 */
export function announceModuleOperation(
  operation: 'add' | 'delete' | 'move' | 'rotate' | 'select' | 'duplicate',
  moduleName?: string,
  details?: string
) {
  let message = '';
  
  switch (operation) {
    case 'add':
      message = `已添加模块：${moduleName || '新模块'}`;
      break;
    case 'delete':
      message = `已删除模块：${moduleName || '选中模块'}`;
      break;
    case 'move':
      message = `移动模块：${moduleName || '选中模块'}${details ? ` 到 ${details}` : ''}`;
      break;
    case 'rotate':
      message = `旋转模块：${moduleName || '选中模块'}`;
      break;
    case 'select':
      message = `已选中模块：${moduleName || '模块'}`;
      break;
    case 'duplicate':
      message = `已复制模块：${moduleName || '选中模块'}`;
      break;
  }
  
  announceToScreenReader(message, 'polite');
}

/**
 * Error announcement for screen readers
 * P0: AC5 - Error messages must use live regions
 */
export function announceError(errorType: string, message: string) {
  announceToScreenReader(`${errorType}：${message}`, 'assertive');
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
 * P0: AC3 - Focus management for modals
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
import React from 'react';

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
 * P1: AC4 - Skip navigation link
 */
export function SkipLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 bg-[#7c3aed] text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:ring-offset-2 focus:ring-offset-[#0a0e17]"
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
 * P0: AC1, AC4, AC5 - Enhanced accessibility layer with proper ARIA live regions
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
      {/* Skip links - P1: AC4 */}
      <SkipLink href="#main-canvas">跳转到画布</SkipLink>
      <SkipLink href="#module-panel">跳转到模块面板</SkipLink>
      <SkipLink href="#main-toolbar">跳转到工具栏</SkipLink>

      {/* Screen reader announcer - P0: AC1 */}
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
      
      {/* Assertive announcer for errors - P0: AC5 */}
      <div
        id="sr-announcer-assertive"
        role="alert"
        aria-live="assertive"
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
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
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
