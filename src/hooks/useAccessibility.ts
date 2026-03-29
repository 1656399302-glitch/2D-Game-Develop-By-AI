import { useCallback, useEffect, useRef } from 'react';
import { useMachineStore } from '../store/useMachineStore';

interface UseAccessibilityOptions {
  enabled?: boolean;
  canvasRef?: React.RefObject<SVGSVGElement | null>;
}

/**
 * Hook for accessibility features including keyboard navigation and ARIA helpers
 */
export function useAccessibility({ enabled = true, canvasRef }: UseAccessibilityOptions = {}) {
  const modules = useMachineStore((state) => state.modules);
  const selectedModuleId = useMachineStore((state) => state.selectedModuleId);
  const selectModule = useMachineStore((state) => state.selectModule);
  const updateModuleRotation = useMachineStore((state) => state.updateModuleRotation);
  const deleteSelected = useMachineStore((state) => state.deleteSelected);
  
  const focusedModuleIndexRef = useRef<number>(-1);
  
  // Announce to screen readers
  const announce = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);
  
  // Get focused module
  const getFocusedModule = useCallback(() => {
    if (focusedModuleIndexRef.current >= 0 && focusedModuleIndexRef.current < modules.length) {
      return modules[focusedModuleIndexRef.current];
    }
    return null;
  }, [modules]);
  
  // Focus next module
  const focusNextModule = useCallback(() => {
    if (modules.length === 0) return;
    
    if (focusedModuleIndexRef.current < modules.length - 1) {
      focusedModuleIndexRef.current++;
    } else {
      focusedModuleIndexRef.current = 0;
    }
    
    const module = modules[focusedModuleIndexRef.current];
    if (module) {
      selectModule(module.instanceId);
      announce(`Selected ${module.type}, position ${Math.round(module.x)}, ${Math.round(module.y)}`);
      
      // Scroll module into view in canvas if needed
      if (canvasRef?.current) {
        const svg = canvasRef.current;
        const moduleElement = svg.querySelector(`[data-module-id="${module.instanceId}"]`);
        if (moduleElement) {
          moduleElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [modules, selectModule, announce, canvasRef]);
  
  // Focus previous module
  const focusPreviousModule = useCallback(() => {
    if (modules.length === 0) return;
    
    if (focusedModuleIndexRef.current > 0) {
      focusedModuleIndexRef.current--;
    } else {
      focusedModuleIndexRef.current = modules.length - 1;
    }
    
    const module = modules[focusedModuleIndexRef.current];
    if (module) {
      selectModule(module.instanceId);
      announce(`Selected ${module.type}, position ${Math.round(module.x)}, ${Math.round(module.y)}`);
      
      // Scroll module into view in canvas if needed
      if (canvasRef?.current) {
        const svg = canvasRef.current;
        const moduleElement = svg.querySelector(`[data-module-id="${module.instanceId}"]`);
        if (moduleElement) {
          moduleElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [modules, selectModule, announce, canvasRef]);
  
  // Rotate focused module
  const rotateFocusedModule = useCallback(() => {
    const module = getFocusedModule();
    if (module) {
      updateModuleRotation(module.instanceId, 90);
      const newRotation = (module.rotation + 90) % 360;
      announce(`Rotated ${module.type} to ${newRotation} degrees`);
    }
  }, [getFocusedModule, updateModuleRotation, announce]);
  
  // Delete focused module
  const deleteFocusedModule = useCallback(() => {
    const module = getFocusedModule();
    if (module) {
      deleteSelected();
      announce(`Deleted ${module.type}`);
      
      // Adjust focus index if needed
      if (focusedModuleIndexRef.current >= modules.length) {
        focusedModuleIndexRef.current = Math.max(0, modules.length - 1);
      }
    }
  }, [getFocusedModule, deleteSelected, announce, modules.length]);
  
  // Clear selection
  const clearSelection = useCallback(() => {
    selectModule(null);
    focusedModuleIndexRef.current = -1;
    announce('Selection cleared');
  }, [selectModule, announce]);
  
  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Only handle if canvas or its children are focused
    const activeElement = document.activeElement;
    const isInCanvas = canvasRef?.current?.contains(activeElement);
    
    switch (e.key) {
      case 'Tab':
        // Allow normal tab navigation when not in canvas
        if (!isInCanvas) return;
        // Shift focus between modules
        if (e.shiftKey) {
          e.preventDefault();
          focusPreviousModule();
        } else {
          e.preventDefault();
          focusNextModule();
        }
        break;
        
      case 'ArrowDown':
      case 'ArrowRight':
        if (isInCanvas) {
          e.preventDefault();
          focusNextModule();
        }
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        if (isInCanvas) {
          e.preventDefault();
          focusPreviousModule();
        }
        break;
        
      case 'r':
      case 'R':
        if (isInCanvas && selectedModuleId) {
          e.preventDefault();
          rotateFocusedModule();
        }
        break;
        
      case 'Delete':
      case 'Backspace':
        if (isInCanvas && selectedModuleId) {
          e.preventDefault();
          deleteFocusedModule();
        }
        break;
        
      case 'Escape':
        if (selectedModuleId) {
          e.preventDefault();
          clearSelection();
        }
        break;
        
      case 'Home':
        if (isInCanvas && modules.length > 0) {
          e.preventDefault();
          focusedModuleIndexRef.current = 0;
          const module = modules[0];
          selectModule(module.instanceId);
          announce(`Selected first module: ${module.type}`);
        }
        break;
        
      case 'End':
        if (isInCanvas && modules.length > 0) {
          e.preventDefault();
          focusedModuleIndexRef.current = modules.length - 1;
          const module = modules[modules.length - 1];
          selectModule(module.instanceId);
          announce(`Selected last module: ${module.type}`);
        }
        break;
    }
  }, [
    enabled, 
    canvasRef, 
    selectedModuleId, 
    modules, 
    focusNextModule, 
    focusPreviousModule, 
    rotateFocusedModule, 
    deleteFocusedModule, 
    clearSelection, 
    selectModule, 
    announce
  ]);
  
  // Register keyboard event listener
  useEffect(() => {
    if (!enabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
  
  // Reset focus index when modules change
  useEffect(() => {
    if (focusedModuleIndexRef.current >= modules.length) {
      focusedModuleIndexRef.current = modules.length > 0 ? modules.length - 1 : -1;
    }
  }, [modules.length]);
  
  return {
    announce,
    focusNextModule,
    focusPreviousModule,
    focusModule: selectModule,
    rotateFocusedModule,
    deleteFocusedModule,
    clearSelection,
    getFocusedModule,
    focusedModuleIndex: focusedModuleIndexRef.current,
  };
}

/**
 * Generate unique ID for accessibility purposes
 */
let idCounter = 0;
export function generateAriaId(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Hook to manage focus trapping within a modal or dialog
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, isActive: boolean) {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;
    
    // Get all focusable elements in the container
    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus the first element
    firstElement?.focus();
    
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
    
    document.addEventListener('keydown', handleTabKey);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      // Restore focus to previous element
      previousActiveElement.current?.focus();
    };
  }, [isActive, containerRef]);
}

/**
 * Hook for reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
}

// Need to import useState
import { useState } from 'react';

export default useAccessibility;
