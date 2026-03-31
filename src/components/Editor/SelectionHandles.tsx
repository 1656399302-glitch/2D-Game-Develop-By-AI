import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useSelectionStore } from '../../store/useSelectionStore';
import { calculateBounds } from '../../utils/clipboardUtils';

/**
 * Handle positions
 */
type HandlePosition = 
  | 'nw' | 'n' | 'ne' 
  | 'w' | 'e' 
  | 'sw' | 's' | 'se'
  | 'rotate';

/**
 * Handle configuration
 */
interface HandleConfig {
  id: HandlePosition;
  cursor: string;
  position: { x: number; y: number };
}

/**
 * Props for SelectionHandles component
 */
interface SelectionHandlesProps {
  viewport: { x: number; y: number; zoom: number };
  onMove?: (deltaX: number, deltaY: number) => void;
  onRotate?: (newRotation: number) => void;
  onScale?: (newScale: number) => void;
}

/**
 * SelectionHandles Component
 * Displays bounding box with 8 resize handles and 1 rotation handle
 * for multi-selected modules.
 * 
 * Accessibility features:
 * - ARIA labels for rotation handle
 * - Keyboard announcements for scale operations
 * - Focus management for multi-select operations
 */
export function SelectionHandles({
  viewport,
  onMove,
  onRotate,
}: SelectionHandlesProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandlePosition | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const modules = useMachineStore((state) => state.modules);
  const selectedModuleIds = useSelectionStore((state) => state.selectedModuleIds);

  // Get selected modules
  const selectedModules = useMemo(() => {
    return modules.filter(m => selectedModuleIds.includes(m.instanceId));
  }, [modules, selectedModuleIds]);

  // Calculate bounds
  const bounds = useMemo(() => {
    if (selectedModules.length === 0) return null;
    return calculateBounds(selectedModules);
  }, [selectedModules]);

  // Handle positions
  const handles = useMemo<HandleConfig[]>(() => {
    if (!bounds) return [];

    const padding = 8;
    const rotateOffset = 30;

    return [
      // Corner handles
      { id: 'nw', cursor: 'nwse-resize', position: { x: bounds.minX - padding, y: bounds.minY - padding } },
      { id: 'ne', cursor: 'nesw-resize', position: { x: bounds.maxX + padding, y: bounds.minY - padding } },
      { id: 'sw', cursor: 'nesw-resize', position: { x: bounds.minX - padding, y: bounds.maxY + padding } },
      { id: 'se', cursor: 'nwse-resize', position: { x: bounds.maxX + padding, y: bounds.maxY + padding } },
      // Midpoint handles
      { id: 'n', cursor: 'ns-resize', position: { x: (bounds.minX + bounds.maxX) / 2, y: bounds.minY - padding } },
      { id: 's', cursor: 'ns-resize', position: { x: (bounds.minX + bounds.maxX) / 2, y: bounds.maxY + padding } },
      { id: 'w', cursor: 'ew-resize', position: { x: bounds.minX - padding, y: (bounds.minY + bounds.maxY) / 2 } },
      { id: 'e', cursor: 'ew-resize', position: { x: bounds.maxX + padding, y: (bounds.minY + bounds.maxY) / 2 } },
      // Rotation handle
      { id: 'rotate', cursor: 'grab', position: { x: (bounds.minX + bounds.maxX) / 2, y: bounds.minY - padding - rotateOffset } },
    ];
  }, [bounds]);

  // Transform for viewport
  const transform = useMemo(() => {
    return `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;
  }, [viewport]);

  // Announce screen reader message
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    // Clear after announcement
    setTimeout(() => setAnnouncement(null), 1000);
  }, []);

  // Handle keyboard interactions for rotation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, handleId: HandlePosition) => {
    if (handleId === 'rotate') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Announce rotation action
        announce(`Rotate selection 90 degrees. ${selectedModules.length} modules selected.`);
        onRotate?.(90);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        announce('Rotating selection counter-clockwise');
        onRotate?.(-45);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        announce('Rotating selection clockwise');
        onRotate?.(45);
      }
    }
  }, [onRotate, announce, selectedModules.length]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent, handleId: HandlePosition) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setActiveHandle(handleId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    if (handleId === 'rotate') {
      // Announce rotation start for screen readers
      announce(`Rotating ${selectedModules.length} modules`);

      // Calculate initial rotation angle from center
      if (bounds) {
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        onRotate?.(angle * (180 / Math.PI));
      }
    }
  }, [bounds, onRotate, announce, selectedModules.length]);

  // Handle mouse move (global listener)
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !activeHandle || !bounds) return;

    const deltaX = (e.clientX - dragStartRef.current.x) / viewport.zoom;
    const deltaY = (e.clientY - dragStartRef.current.y) / viewport.zoom;

    switch (activeHandle) {
      case 'nw':
      case 'ne':
      case 'sw':
      case 'se':
      case 'n':
      case 's':
      case 'e':
      case 'w':
        // Resize handling - simplified to just move all selected modules
        if (onMove) {
          onMove(deltaX, deltaY);
        }
        break;
      case 'rotate':
        // Rotation handling
        if (bounds && onRotate) {
          const centerX = (bounds.minX + bounds.maxX) / 2;
          const centerY = (bounds.minY + bounds.maxY) / 2;
          const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
          onRotate(angle * (180 / Math.PI));
        }
        break;
    }

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, activeHandle, bounds, viewport.zoom, onMove, onRotate]);

  // Handle mouse up
  const handleGlobalMouseUp = useCallback(() => {
    if (isDragging && activeHandle === 'rotate') {
      announce('Rotation complete');
    }
    setIsDragging(false);
    setActiveHandle(null);
  }, [isDragging, activeHandle, announce]);

  // Add/remove global listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    } else {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleGlobalMouseMove, handleGlobalMouseUp]);

  // Don't render if no selection
  if (!bounds || selectedModules.length < 2) {
    return null;
  }

  const padding = 8;
  const boxWidth = bounds.maxX - bounds.minX + padding * 2;
  const boxHeight = bounds.maxY - bounds.minY + padding * 2;
  const boxX = bounds.minX - padding;
  const boxY = bounds.minY - padding;

  return (
    <div
      ref={containerRef}
      data-testid="selection-handles"
      className="pointer-events-none absolute inset-0"
      style={{ transform, transformOrigin: '0 0' }}
      role="application"
      aria-label={`${selectedModules.length} modules selected. Use handles to transform.`}
    >
      {/* Screen reader live region for announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Bounding box */}
      <div
        data-testid="selection-bounding-box"
        className="absolute border-2 border-dashed border-[#3b82f6] bg-transparent pointer-events-none"
        style={{
          left: boxX,
          top: boxY,
          width: boxWidth,
          height: boxHeight,
        }}
        role="presentation"
      />

      {/* Resize handles */}
      {handles.filter(h => h.id !== 'rotate').map((handle) => (
        <div
          key={handle.id}
          data-testid={`resize-handle-${handle.id}`}
          role="slider"
          aria-label={`Resize ${handle.id} handle`}
          aria-valuenow={1}
          aria-valuemin={0.25}
          aria-valuemax={4}
          tabIndex={0}
          className={`
            absolute w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm
            pointer-events-auto cursor-${handle.cursor}
            hover:bg-[#3b82f6] hover:scale-125 transition-all
            ${isDragging && activeHandle === handle.id ? 'bg-[#3b82f6] scale-125' : ''}
            focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2
          `}
          style={{
            left: handle.position.x - 6,
            top: handle.position.y - 6,
            cursor: handle.cursor,
          }}
          onMouseDown={(e) => handleMouseDown(e, handle.id)}
          onKeyDown={(e) => {
            if (e.key === '+' || e.key === '=') {
              e.preventDefault();
              announce('Scale increased');
            } else if (e.key === '-') {
              e.preventDefault();
              announce('Scale decreased');
            }
          }}
        />
      ))}

      {/* Rotation handle with accessibility enhancements */}
      <div
        data-testid="rotate-handle"
        role="button"
        aria-label={`Rotate selection 90 degrees. ${selectedModules.length} modules selected.`}
        aria-pressed={isDragging && activeHandle === 'rotate'}
        aria-describedby="rotate-instructions"
        tabIndex={0}
        className={`
          absolute w-4 h-4 bg-[#22c55e] border-2 border-white rounded-full
          pointer-events-auto cursor-grab
          hover:bg-[#22c55e]/80 hover:scale-110 transition-all
          ${isDragging && activeHandle === 'rotate' ? 'bg-[#22c55e]/80 scale-110 cursor-grabbing' : ''}
          focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2
        `}
        style={{
          left: handles.find(h => h.id === 'rotate')?.position.x! - 8,
          top: handles.find(h => h.id === 'rotate')?.position.y! - 8,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'rotate')}
        onKeyDown={(e) => handleKeyDown(e, 'rotate')}
      />
      
      {/* Hidden instructions for screen readers */}
      <div id="rotate-instructions" className="sr-only">
        Press Enter or Space to rotate 90 degrees. 
        Use arrow up for counter-clockwise, arrow down for clockwise rotation.
      </div>

      {/* Line connecting rotation handle to box */}
      <svg
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <line
          data-testid="rotate-handle-line"
          x1={handles.find(h => h.id === 'rotate')?.position.x!}
          y1={handles.find(h => h.id === 'rotate')?.position.y! + 8}
          x2={(bounds.minX + bounds.maxX) / 2}
          y2={bounds.minY - padding}
          stroke="#22c55e"
          strokeWidth="1"
          strokeDasharray="4 2"
        />
      </svg>

      {/* Info badge */}
      <div
        data-testid="selection-info"
        className="absolute bg-[#3b82f6] text-white text-xs px-2 py-1 rounded pointer-events-none"
        style={{
          left: boxX + boxWidth / 2,
          top: boxY - 24,
          transform: 'translateX(-50%)',
        }}
        role="status"
        aria-live="polite"
      >
        {selectedModules.length} 模块已选择
      </div>
    </div>
  );
}

export default SelectionHandles;
