/**
 * Quick Actions Toolbar Component
 * 
 * Floating toolbar with quick access to common editor actions:
 * Undo, Redo, Zoom Fit, Clear Canvas, Duplicate Selection
 * 
 * Position: Fixed bottom-right corner, 8px from edges
 * 
 * ROUND 81 PHASE 2: New component implementation per contract D5.
 */

import React, { useCallback } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { useSelectionStore } from '../store/useSelectionStore';

// Icon components for toolbar buttons
const UndoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

const RedoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
  </svg>
);

const ZoomFitIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    <path d="M15 3l6 6M9 15l6 6" />
  </svg>
);

const ClearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const DuplicateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

function ToolbarButton({ icon, label, onClick, disabled = false, variant = 'default' }: ToolbarButtonProps) {
  const baseClasses = `
    w-10 h-10 rounded-lg flex items-center justify-center
    transition-all duration-200 ease-out
    hover:scale-110 active:scale-95
    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
  `;
  
  const variantClasses = {
    default: 'bg-[#1e2a42] hover:bg-[#2a3654] text-[#00d4ff] hover:text-[#00ffcc]',
    danger: 'bg-[#1e2a42] hover:bg-[#7f1d1d] text-[#ef4444] hover:text-red-300',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

export function QuickActionsToolbar() {
  // Get store state and actions
  const undo = useMachineStore((state) => state.undo);
  const redo = useMachineStore((state) => state.redo);
  const zoomToFit = useMachineStore((state) => state.zoomToFit);
  const clearCanvas = useMachineStore((state) => state.clearCanvas);
  const duplicateModule = useMachineStore((state) => state.duplicateModule);
  const selectedModuleId = useMachineStore((state) => state.selectedModuleId);
  const historyIndex = useMachineStore((state) => state.historyIndex);
  const history = useMachineStore((state) => state.history);
  const modules = useMachineStore((state) => state.modules);
  
  // Selection store
  const selectedModuleIds = useSelectionStore((state) => state.selectedModuleIds);

  // Check if undo is available
  const canUndo = historyIndex > 0;
  
  // Check if redo is available
  const canRedo = historyIndex < history.length - 1;
  
  // Check if something is selected
  const hasSelection = selectedModuleId !== null || selectedModuleIds.length > 0;

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
    }
  }, [canRedo, redo]);

  const handleZoomFit = useCallback(() => {
    zoomToFit();
  }, [zoomToFit]);

  const handleClearCanvas = useCallback(() => {
    if (modules.length === 0) return;
    
    if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
      clearCanvas();
    }
  }, [modules.length, clearCanvas]);

  const handleDuplicate = useCallback(() => {
    if (selectedModuleId) {
      duplicateModule(selectedModuleId);
    } else if (selectedModuleIds.length > 0) {
      // Duplicate all selected modules with offset
      const sortedIds = [...selectedModuleIds].sort();
      sortedIds.forEach((id, index) => {
        // Small delay between duplicates to spread them out
        setTimeout(() => {
          duplicateModule(id);
        }, index * 50);
      });
    }
  }, [selectedModuleId, selectedModuleIds, duplicateModule]);

  return (
    <div
      className="fixed bottom-2 right-2 z-50 flex flex-col gap-2 p-2 rounded-xl"
      style={{
        backgroundColor: 'rgba(18, 24, 38, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(30, 42, 66, 0.8)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
      role="toolbar"
      aria-label="Quick actions toolbar"
    >
      {/* Undo/Redo Row */}
      <div className="flex gap-2">
        <ToolbarButton
          icon={<UndoIcon />}
          label="Undo (Ctrl+Z)"
          onClick={handleUndo}
          disabled={!canUndo}
        />
        <ToolbarButton
          icon={<RedoIcon />}
          label="Redo (Ctrl+Y)"
          onClick={handleRedo}
          disabled={!canRedo}
        />
      </div>

      {/* View Row */}
      <div className="flex gap-2">
        <ToolbarButton
          icon={<ZoomFitIcon />}
          label="Zoom to Fit (Ctrl+0)"
          onClick={handleZoomFit}
        />
      </div>

      {/* Edit Row */}
      <div className="flex gap-2">
        <ToolbarButton
          icon={<DuplicateIcon />}
          label="Duplicate Selection (Ctrl+D)"
          onClick={handleDuplicate}
          disabled={!hasSelection}
        />
        <ToolbarButton
          icon={<ClearIcon />}
          label="Clear Canvas"
          onClick={handleClearCanvas}
          variant="danger"
          disabled={modules.length === 0}
        />
      </div>
    </div>
  );
}

export default QuickActionsToolbar;
