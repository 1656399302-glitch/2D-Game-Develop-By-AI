/**
 * AutoLayoutButton Component
 * 
 * UI trigger for auto-layout functionality
 * 
 * AC-119-003: Auto-layout button visible in canvas toolbar; triggers layout recalculation
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import {
  autoArrange,
  autoArrangeCircular,
  autoArrangeLine,
  autoArrangeCascade,
  LayoutType
} from '../../utils/autoLayout';

export type { LayoutType };

const LAYOUT_OPTIONS: { type: LayoutType; label: string; icon: string }[] = [
  { type: 'grid', label: '网格', icon: '⊞' },
  { type: 'line', label: '线性', icon: '☰' },
  { type: 'circle', label: '环形', icon: '◎' },
  { type: 'cascade', label: '层叠', icon: '⫷' },
];

export interface AutoLayoutButtonProps {
  disabled?: boolean;
  className?: string;
}

/**
 * AutoLayoutButton - A button that triggers auto-layout with layout type selection
 */
export function AutoLayoutButton({ disabled = false, className = '' }: AutoLayoutButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [activeLayout, setActiveLayout] = useState<LayoutType | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get store state and actions
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const updateModulesBatch = useMachineStore((state) => state.updateModulesBatch);
  const saveToHistory = useMachineStore((state) => state.saveToHistory);

  const modulesCount = modules.length;
  const isDisabled = disabled || modulesCount === 0;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Keyboard navigation
  useEffect(() => {
    if (!showMenu) return;

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'Escape':
          setShowMenu(false);
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          event.preventDefault();
          const currentIndex = activeLayout
            ? LAYOUT_OPTIONS.findIndex(o => o.type === activeLayout)
            : -1;
          const nextIndex = event.key === 'ArrowDown'
            ? Math.min(currentIndex + 1, LAYOUT_OPTIONS.length - 1)
            : Math.max(currentIndex - 1, 0);
          setActiveLayout(LAYOUT_OPTIONS[nextIndex].type);
          break;
        case 'Enter':
        case ' ':
          if (activeLayout) {
            applyLayout(activeLayout);
            setShowMenu(false);
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMenu, activeLayout]);

  /**
   * Apply the selected layout to the canvas
   */
  const applyLayout = useCallback((layoutType: LayoutType) => {
    if (modules.length === 0) return;

    const containerWidth = 800;
    const containerHeight = 600;

    let result;
    switch (layoutType) {
      case 'grid':
        result = autoArrange(modules, connections, { containerWidth, containerHeight });
        break;
      case 'circle':
        result = autoArrangeCircular(modules, connections, { containerWidth, containerHeight });
        break;
      case 'line':
        result = autoArrangeLine(modules, connections, { containerWidth, containerHeight });
        break;
      case 'cascade':
        result = autoArrangeCascade(modules, connections, { containerWidth, containerHeight });
        break;
      default:
        result = autoArrange(modules, connections, { containerWidth, containerHeight });
    }

    // Update module positions using batch update
    const updates = result.modules.map(m => ({
      instanceId: m.instanceId,
      x: m.x,
      y: m.y,
    }));

    updateModulesBatch(updates);
    saveToHistory(); // Save to history after layout change
    setActiveLayout(layoutType);
  }, [modules, connections, updateModulesBatch, saveToHistory]);

  const handleLayoutSelect = useCallback((layoutType: LayoutType) => {
    applyLayout(layoutType);
    setShowMenu(false);
  }, [applyLayout]);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isDisabled}
        data-tutorial-action="toolbar-layout"
        className={`
          flex items-center gap-1.5 px-3 py-1 text-xs rounded 
          bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2d3a4f] 
          disabled:opacity-30 disabled:cursor-not-allowed 
          transition-colors border border-[#2d3a4f]
        `}
        title="自动布局"
        aria-label="自动布局"
        aria-haspopup="true"
        aria-expanded={showMenu}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="2" y="2" width="4" height="4" rx="0.5" />
          <rect x="8" y="2" width="4" height="4" rx="0.5" />
          <rect x="2" y="8" width="4" height="4" rx="0.5" />
          <rect x="8" y="8" width="4" height="4" rx="0.5" />
        </svg>
        <span>布局</span>
        <svg 
          width="10" 
          height="10" 
          viewBox="0 0 10 10" 
          fill="currentColor" 
          aria-hidden="true"
          className={`transition-transform ${showMenu ? 'rotate-180' : ''}`}
        >
          <path d="M2 4l3 3 3-3" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div 
          className="absolute top-full left-0 mt-1 py-1 bg-[#1a2235] border border-[#2d3a4f] rounded-md shadow-lg z-50 min-w-[120px]"
          role="menu"
          aria-label="布局选项"
        >
          {LAYOUT_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => handleLayoutSelect(option.type)}
              onMouseEnter={() => setActiveLayout(option.type)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors
                ${activeLayout === option.type 
                  ? 'bg-[#2d3a4f] text-white' 
                  : 'text-[#9ca3af] hover:bg-[#252f45] hover:text-white'
                }
              `}
              role="menuitem"
              aria-selected={activeLayout === option.type}
            >
              <span className="w-4 text-center" aria-hidden="true">{option.icon}</span>
              <span>{option.label}</span>
              {activeLayout === option.type && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="ml-auto" aria-hidden="true">
                  <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AutoLayoutButton;
