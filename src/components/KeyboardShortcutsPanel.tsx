/**
 * Keyboard Shortcuts Panel Component
 * 
 * Displays all keyboard shortcuts grouped by category.
 * Toggle with `?` key press, close with `?` again or Escape.
 * 
 * Categories: Canvas, Modules, Connections, Export
 * 
 * ROUND 81 PHASE 2: New component implementation per contract D6.
 */

import React, { useEffect, useCallback, useState } from 'react';

interface ShortcutItem {
  keys: string;
  description: string;
}

interface ShortcutCategory {
  title: string;
  icon: React.ReactNode;
  shortcuts: ShortcutItem[];
}

// Shortcut categories
const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: 'Canvas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      </svg>
    ),
    shortcuts: [
      { keys: 'Space + Drag', description: 'Pan canvas' },
      { keys: 'Scroll', description: 'Zoom in/out' },
      { keys: 'Ctrl + 0', description: 'Zoom to fit' },
      { keys: 'Ctrl + +', description: 'Zoom in' },
      { keys: 'Ctrl + -', description: 'Zoom out' },
    ],
  },
  {
    title: 'Modules',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    shortcuts: [
      { keys: 'R', description: 'Rotate module' },
      { keys: 'F', description: 'Flip module' },
      { keys: '[', description: 'Scale down' },
      { keys: ']', description: 'Scale up' },
      { keys: 'Ctrl + D', description: 'Duplicate selection' },
      { keys: 'Delete', description: 'Delete selected' },
      { keys: 'Ctrl + A', description: 'Select all modules' },
    ],
  },
  {
    title: 'Connections',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="5" cy="12" r="3" />
        <circle cx="19" cy="12" r="3" />
        <path d="M8 12h8" />
        <path d="M12 8l4 4-4 4" />
      </svg>
    ),
    shortcuts: [
      { keys: 'C', description: 'Start connection mode' },
      { keys: 'Escape', description: 'Cancel connection' },
      { keys: 'Click port', description: 'Connect modules' },
    ],
  },
  {
    title: 'Export',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    shortcuts: [
      { keys: 'Ctrl + S', description: 'Save to Codex' },
      { keys: 'Ctrl + E', description: 'Export machine' },
    ],
  },
];

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  // Toggle panel with ? key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with ? key (Shift + /)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Parent should handle opening - emit custom event
          window.dispatchEvent(new CustomEvent('toggle:keyboardShortcuts', { detail: { open: true } }));
        }
      }
      
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl"
        style={{
          backgroundColor: '#121826',
          border: '1px solid rgba(30, 42, 66, 0.8)',
          boxShadow: '0 0 60px rgba(0, 212, 255, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(30, 42, 66, 0.8)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0, 212, 255, 0.1)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
              <p className="text-sm text-[#6b7280]">Press ? or Escape to close</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#1e2a42] transition-colors"
            aria-label="Close panel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 80px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SHORTCUT_CATEGORIES.map((category) => (
              <div key={category.title} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center gap-2">
                  <span style={{ color: '#00d4ff' }}>{category.icon}</span>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    {category.title}
                  </h3>
                </div>

                {/* Shortcuts List */}
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(30, 42, 66, 0.3)' }}
                    >
                      <span className="text-sm text-[#9ca3af]">{shortcut.description}</span>
                      <kbd
                        className="px-2 py-1 rounded text-xs font-mono"
                        style={{
                          backgroundColor: '#1e2a42',
                          color: '#00d4ff',
                          border: '1px solid rgba(0, 212, 255, 0.3)',
                        }}
                      >
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'rgba(30, 42, 66, 0.5)' }}>
            <p className="text-xs text-[#6b7280]">
              Press <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: '#1e2a42', color: '#00d4ff' }}>?</kbd> anytime to toggle this panel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage keyboard shortcuts panel visibility
export function useKeyboardShortcutsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Listen for custom toggle event from global keyboard handler
  useEffect(() => {
    const handleToggle = (e: CustomEvent) => {
      if (e.detail?.open) {
        setIsOpen(true);
      } else {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('toggle:keyboardShortcuts', handleToggle as EventListener);
    return () => window.removeEventListener('toggle:keyboardShortcuts', handleToggle as EventListener);
  }, []);

  return { isOpen, open, close, toggle };
}

export default KeyboardShortcutsPanel;
