import { useEffect, useRef, useCallback, ReactNode } from 'react';

/**
 * FocusManager - Handles focus trapping and return for modal dialogs
 * P0: AC3 - Focus management for modals (Export, Codex, Community Gallery)
 */

interface FocusManagerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  modalRole?: 'dialog' | 'alertdialog';
  modalLabel?: string;
}

/**
 * FocusManager component for accessible modal focus handling
 * - Traps focus within modal when open
 * - Returns focus to trigger element when closed
 * - Handles Escape key for closing
 * - Announces modal open/close to screen readers
 */
export function FocusManager({
  children,
  isOpen,
  onClose,
  initialFocusRef,
  modalRole = 'dialog',
  modalLabel = 'Dialog',
}: FocusManagerProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  // Handle focus trapping
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (!modalRef.current || e.key !== 'Tab') return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  // Set up focus management when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal or its first focusable element
      if (modalRef.current) {
        // Announce to screen readers
        const announcer = document.getElementById('sr-announcer');
        if (announcer) {
          announcer.textContent = `${modalLabel} 已打开`;
        }

        // Focus the specified element or first focusable element
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else {
          const focusable = modalRef.current.querySelector<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
            'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          focusable?.focus();
        }
      }

      // Add event listeners
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleTabKey);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // Clean up event listeners
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTabKey);

      // Restore body scroll
      document.body.style.overflow = '';

      // Return focus to the triggering element
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
        
        // Announce to screen readers
        const announcer = document.getElementById('sr-announcer');
        if (announcer) {
          announcer.textContent = `${modalLabel} 已关闭`;
        }
      }
    };
  }, [isOpen, handleKeyDown, handleTabKey, initialFocusRef, modalLabel]);

  return (
    <div
      ref={modalRef}
      role={modalRole}
      aria-modal="true"
      aria-label={modalLabel}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

/**
 * Hook for managing focus within a container
 * P0: AC3 - Focus trap for modals
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean,
  options: {
    onEscape?: () => void;
    initialFocus?: 'first' | 'container' | 'none';
    returnFocus?: boolean;
  } = {}
) {
  const { onEscape, initialFocus = 'first', returnFocus = true } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store current focus
    if (returnFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    const container = containerRef.current;

    // Set initial focus
    if (initialFocus === 'container') {
      container.focus();
    } else if (initialFocus === 'first') {
      const focusable = container.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
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
      if (returnFocus && previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, containerRef, initialFocus, onEscape, returnFocus]);
}

/**
 * Trap focus within a specific element
 * P0: AC3 - Focus trap utility
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableSelectors = 
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const focusableElements = element.querySelectorAll<HTMLElement>(focusableSelectors);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Restore focus to a specific element
 */
export function restoreFocus(element: HTMLElement | null | undefined) {
  if (element && typeof element.focus === 'function') {
    element.focus();
  }
}

/**
 * Get the first focusable element in a container
 */
export function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  const focusable = container.querySelector<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  return focusable;
}

/**
 * Get the last focusable element in a container
 */
export function getLastFocusable(container: HTMLElement): HTMLElement | null {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  return focusableElements[focusableElements.length - 1] || null;
}

export default FocusManager;
