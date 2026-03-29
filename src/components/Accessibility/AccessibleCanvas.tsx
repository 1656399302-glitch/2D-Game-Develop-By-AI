import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useSelectionStore } from '../../store/useSelectionStore';
import { ModuleRenderer } from '../Modules/ModuleRenderer';
import { EnergyPath } from '../Connections/EnergyPath';
import { ConnectionPreview } from '../Connections/ConnectionPreview';
import { AlignmentToolbar } from '../Editor/AlignmentToolbar';
import { calculateShakeOffset } from '../../utils/activationChoreographer';
import { MODULE_SIZES } from '../../types';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { announceToScreenReader } from './AccessibilityLayer';

/**
 * Accessible Canvas Component
 * 
 * Enhanced canvas with comprehensive accessibility features:
 * - Full keyboard navigation with arrow keys
 * - Screen reader announcements
 * - Focus management
 * - High contrast mode support
 * 
 * WCAG 2.1 AA Compliance:
 * - role="application" for canvas area
 * - role="list" for module container
 * - Proper ARIA labels
 * - Keyboard operability
 */
export function AccessibleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const viewportDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingModule, setDraggingModule] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  
  // Box selection state
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [boxStart, setBoxStart] = useState({ x: 0, y: 0 });
  const [boxEnd, setBoxEnd] = useState({ x: 0, y: 0 });
  const boxStartCanvasRef = useRef<{ x: number; y: number } | null>(null);
  
  // Camera shake state
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const shakeStartTimeRef = useRef<number | null>(null);
  const shakeAnimationRef = useRef<number | null>(null);
  
  // Store state
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const viewport = useMachineStore((state) => state.viewport);
  const selectedModuleId = useMachineStore((state) => state.selectedModuleId);
  const selectedConnectionId = useMachineStore((state) => state.selectedConnectionId);
  const isConnecting = useMachineStore((state) => state.isConnecting);
  const connectionPreview = useMachineStore((state) => state.connectionPreview);
  const machineState = useMachineStore((state) => state.machineState);
  const gridEnabled = useMachineStore((state) => state.gridEnabled);
  
  const setViewport = useMachineStore((state) => state.setViewport);
  const addModule = useMachineStore((state) => state.addModule);
  const selectModule = useMachineStore((state) => state.selectModule);
  const selectConnection = useMachineStore((state) => state.selectConnection);
  const updateModulePosition = useMachineStore((state) => state.updateModulePosition);
  const updateConnectionPreview = useMachineStore((state) => state.updateConnectionPreview);
  const cancelConnection = useMachineStore((state) => state.cancelConnection);
  const saveToHistory = useMachineStore((state) => state.saveToHistory);
  
  // Selection store
  const selectedModuleIds = useSelectionStore((state) => state.selectedModuleIds);
  const toggleSelection = useSelectionStore((state) => state.toggleSelection);
  const setSelection = useSelectionStore((state) => state.setSelection);
  const clearSelection = useSelectionStore((state) => state.clearSelection);
  
  // Keyboard navigation
  void useKeyboardNavigation({
    enabled: true,
    onAnnounce: announceToScreenReader,
  });

  // Update viewport size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Camera shake parameters based on machine state
  const shakeParams = {
    charging: { duration: 150, magnitude: 4 },
    active: { duration: 150, magnitude: 4 },
    overload: { duration: 300, magnitude: 8 },
    failure: { duration: 300, magnitude: 8 },
    shutdown: { duration: 0, magnitude: 0 },
    idle: { duration: 0, magnitude: 0 },
  };
  
  // Camera shake effect
  useEffect(() => {
    const params = shakeParams[machineState];
    
    if (params.duration === 0) {
      setShakeOffset({ x: 0, y: 0 });
      if (shakeAnimationRef.current) {
        cancelAnimationFrame(shakeAnimationRef.current);
        shakeAnimationRef.current = null;
      }
      shakeStartTimeRef.current = null;
      return;
    }
    
    shakeStartTimeRef.current = performance.now();
    
    const animate = (currentTime: number) => {
      if (shakeStartTimeRef.current === null) return;
      
      const elapsed = currentTime - shakeStartTimeRef.current;
      const offset = calculateShakeOffset(elapsed, params.magnitude, params.duration);
      
      setShakeOffset({ x: offset.x, y: offset.y });
      
      if (!offset.isComplete) {
        shakeAnimationRef.current = requestAnimationFrame(animate);
      } else {
        setShakeOffset({ x: 0, y: 0 });
        shakeStartTimeRef.current = null;
        shakeAnimationRef.current = null;
      }
    };
    
    shakeAnimationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (shakeAnimationRef.current) {
        cancelAnimationFrame(shakeAnimationRef.current);
      }
    };
  }, [machineState]);

  // Viewport culling
  const visibleModuleIds = useMemo(() => {
    if (modules.length === 0) return new Set<string>();
    
    const margin = 100;
    const visibleBounds = {
      left: -viewport.x / viewport.zoom - margin,
      right: (viewportSize.width - viewport.x) / viewport.zoom + margin,
      top: -viewport.y / viewport.zoom - margin,
      bottom: (viewportSize.height - viewport.y) / viewport.zoom + margin,
    };
    
    const visible = new Set<string>();
    modules.forEach((module) => {
      const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
      if (
        module.x + size.width >= visibleBounds.left &&
        module.x <= visibleBounds.right &&
        module.y + size.height >= visibleBounds.top &&
        module.y <= visibleBounds.bottom
      ) {
        visible.add(module.instanceId);
      }
    });
    
    return visible;
  }, [modules, viewport, viewportSize]);

  const visibleModules = useMemo(() => {
    return modules.filter(m => visibleModuleIds.has(m.instanceId));
  }, [modules, visibleModuleIds]);

  const visibleConnectionIds = useMemo(() => {
    const visibleConnections = new Set<string>();
    connections.forEach((conn) => {
      if (visibleModuleIds.has(conn.sourceModuleId) || visibleModuleIds.has(conn.targetModuleId)) {
        visibleConnections.add(conn.id);
      }
    });
    return visibleConnections;
  }, [connections, visibleModuleIds]);

  const boxSelectionRect = useMemo(() => {
    if (!isBoxSelecting) return null;
    const minX = Math.min(boxStart.x, boxEnd.x);
    const maxX = Math.max(boxStart.x, boxEnd.x);
    const minY = Math.min(boxStart.y, boxEnd.y);
    const maxY = Math.max(boxStart.y, boxEnd.y);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }, [isBoxSelecting, boxStart, boxEnd]);

  const modulesInBoxSelection = useMemo(() => {
    if (!isBoxSelecting || !boxSelectionRect) return new Set<string>();
    const selectedIds = new Set<string>();
    modules.forEach((module) => {
      const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
      if (
        module.x < boxSelectionRect.x + boxSelectionRect.width &&
        module.x + size.width > boxSelectionRect.x &&
        module.y < boxSelectionRect.y + boxSelectionRect.height &&
        module.y + size.height > boxSelectionRect.y
      ) {
        selectedIds.add(module.instanceId);
      }
    });
    return selectedIds;
  }, [isBoxSelecting, boxSelectionRect, modules]);

  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - viewport.x) / viewport.zoom,
      y: (clientY - rect.top - viewport.y) / viewport.zoom,
    };
  }, [viewport]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const moduleType = e.dataTransfer.getData('moduleType');
    if (moduleType) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      addModule(moduleType as any, coords.x, coords.y);
      announceToScreenReader(`已添加 ${moduleType} 模块`);
    }
  }, [addModule, getCanvasCoordinates]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const getModuleAtPoint = useCallback((clientX: number, clientY: number): string | null => {
    const coords = getCanvasCoordinates(clientX, clientY);
    for (let i = modules.length - 1; i >= 0; i--) {
      const module = modules[i];
      const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
      if (
        coords.x >= module.x &&
        coords.x <= module.x + size.width &&
        coords.y >= module.y &&
        coords.y <= module.y + size.height
      ) {
        return module.instanceId;
      }
    }
    return null;
  }, [modules, getCanvasCoordinates]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const clickedModuleId = getModuleAtPoint(e.clientX, e.clientY);
    
    if (e.button === 1 || (e.button === 0 && e.shiftKey && !clickedModuleId)) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      e.preventDefault();
    } else if (e.button === 0 && e.shiftKey && !clickedModuleId) {
      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
      setIsBoxSelecting(true);
      setBoxStart(canvasCoords);
      setBoxEnd(canvasCoords);
      boxStartCanvasRef.current = canvasCoords;
      e.preventDefault();
    } else if (e.button === 0) {
      if (clickedModuleId) {
        if (e.shiftKey) {
          toggleSelection(clickedModuleId);
        } else {
          selectModule(clickedModuleId);
          setIsDragging(true);
          setDraggingModule(clickedModuleId);
        }
      } else if (e.target === svgRef.current || (e.target as Element)?.id === 'canvas-background') {
        if (!e.shiftKey) {
          clearSelection();
        }
        selectModule(null);
        selectConnection(null);
        if (isConnecting) {
          cancelConnection();
        }
      }
    }
  }, [viewport, getModuleAtPoint, getCanvasCoordinates, selectModule, selectConnection, isConnecting, cancelConnection, toggleSelection, clearSelection]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      if (viewportDebounceRef.current) clearTimeout(viewportDebounceRef.current);
      viewportDebounceRef.current = setTimeout(() => {
        setViewport({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }, 16);
    } else if (isBoxSelecting) {
      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
      setBoxEnd(canvasCoords);
    } else if (isDragging && draggingModule) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      updateModulePosition(draggingModule, coords.x, coords.y);
    } else if (isConnecting) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      updateConnectionPreview(coords.x, coords.y);
    }
  }, [isPanning, isBoxSelecting, isDragging, draggingModule, isConnecting, dragStart, getCanvasCoordinates, setViewport, updateModulePosition, updateConnectionPreview]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) saveToHistory();
    if (isBoxSelecting && modulesInBoxSelection.size > 0) {
      setSelection(Array.from(modulesInBoxSelection));
      announceToScreenReader(`已选择 ${modulesInBoxSelection.size} 个模块`);
    }
    setIsPanning(false);
    setIsDragging(false);
    setDraggingModule(null);
    setIsBoxSelecting(false);
    boxStartCanvasRef.current = null;
  }, [isDragging, isBoxSelecting, modulesInBoxSelection, setSelection, saveToHistory]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(3, viewport.zoom * delta));
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      setViewport({
        x: cursorX - (cursorX - viewport.x) * (newZoom / viewport.zoom),
        y: cursorY - (cursorY - viewport.y) * (newZoom / viewport.zoom),
        zoom: newZoom,
      });
    }
  }, [viewport, setViewport]);

  const handleModuleDragStart = useCallback((instanceId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (e.shiftKey) {
      toggleSelection(instanceId);
      return;
    }
    setIsDragging(true);
    setDraggingModule(instanceId);
    selectModule(instanceId);
  }, [selectModule, toggleSelection]);

  const gridSize = 20;
  const gridOpacity = 0.3;
  
  const isModuleSelected = useCallback((instanceId: string) => {
    return instanceId === selectedModuleId || selectedModuleIds.includes(instanceId);
  }, [selectedModuleId, selectedModuleIds]);

  // Screen reader announcements for module count
  useEffect(() => {
    if (modules.length > 0) {
      announceToScreenReader(`画布上有 ${modules.length} 个模块`);
    }
  }, [modules.length]);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[#050810]"
      style={{ cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : isBoxSelecting ? 'crosshair' : 'default' }}
      role="application"
      aria-label="机器编辑器画布"
      aria-describedby="canvas-instructions"
    >
      {/* Instructions for screen readers */}
      <div id="canvas-instructions" className="sr-only">
        使用Tab键在模块间导航，方向键移动选中的模块，
        Delete键删除，R键旋转，F键翻转
      </div>

      <AlignmentToolbar visible={selectedModuleIds.length >= 2} />

      <svg
        ref={svgRef}
        className="w-full h-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ willChange: 'contents' }}
        tabIndex={0}
        aria-label={`机器画布，包含 ${modules.length} 个模块和 ${connections.length} 个连接`}
      >
        <defs>
          <pattern id="smallGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#1e2a42" strokeWidth="0.5" opacity={gridOpacity} />
          </pattern>
          <pattern id="largeGrid" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
            <rect width={gridSize * 5} height={gridSize * 5} fill="url(#smallGrid)" />
            <path d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`} fill="none" stroke="#1e2a42" strokeWidth="1" opacity={gridOpacity * 1.5} />
          </pattern>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="selectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <rect id="canvas-background" width="100%" height="100%" fill="#0a0e17" />
        
        {gridEnabled && (
          <rect
            width="100%"
            height="100%"
            fill="url(#largeGrid)"
            transform={`translate(${viewport.x % (gridSize * 5)}, ${viewport.y % (gridSize * 5)})`}
          />
        )}

        <g transform={`translate(${viewport.x + shakeOffset.x}, ${viewport.y + shakeOffset.y}) scale(${viewport.zoom})`} style={{ willChange: 'transform' }}>
          <g id="connections-layer" role="list" aria-label="连接列表">
            {connections.filter(conn => visibleConnectionIds.has(conn.id)).map((connection) => (
              <EnergyPath
                key={connection.id}
                connection={connection}
                isSelected={connection.id === selectedConnectionId}
                isActive={machineState !== 'idle'}
                machineState={machineState}
              />
            ))}
            {isConnecting && connectionPreview && <ConnectionPreview />}
          </g>

          <g id="modules-layer" role="list" aria-label="模块列表">
            {visibleModules.map((module) => (
              <ModuleRenderer
                key={module.instanceId}
                module={module}
                isSelected={isModuleSelected(module.instanceId)}
                machineState={machineState}
                onMouseDown={(e) => handleModuleDragStart(module.instanceId, e)}
              />
            ))}
          </g>

          {isBoxSelecting && boxSelectionRect && (
            <rect
              x={boxSelectionRect.x}
              y={boxSelectionRect.y}
              width={boxSelectionRect.width}
              height={boxSelectionRect.height}
              fill="rgba(59, 130, 246, 0.15)"
              stroke="#3b82f6"
              strokeWidth={1 / viewport.zoom}
              strokeDasharray={`${4 / viewport.zoom} ${2 / viewport.zoom}`}
              pointerEvents="none"
            />
          )}

          {selectedModuleIds.map((moduleId) => {
            const module = modules.find(m => m.instanceId === moduleId);
            if (!module) return null;
            const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
            return (
              <rect
                key={`selection-${moduleId}`}
                x={module.x - 3}
                y={module.y - 3}
                width={size.width + 6}
                height={size.height + 6}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={2 / viewport.zoom}
                rx={4 / viewport.zoom}
                filter="url(#selectionGlow)"
                pointerEvents="none"
              />
            );
          })}
        </g>
      </svg>

      <div className="absolute bottom-4 left-4 px-3 py-1 rounded bg-[#121826] border border-[#1e2a42] text-xs text-[#9ca3af]" role="status" aria-live="polite">
        缩放: {Math.round(viewport.zoom * 100)}%
        {visibleModuleIds.size < modules.length && (
          <span className="ml-2 text-[#4a5568]">
            ({visibleModuleIds.size}/{modules.length})
          </span>
        )}
      </div>

      {selectedModuleIds.length > 0 && (
        <div className="absolute bottom-4 right-4 px-3 py-1 rounded bg-[#1e4d8c] border border-[#3b82f6] text-xs text-[#93c5fd]">
          已选择 {selectedModuleIds.length} 个模块
        </div>
      )}
    </div>
  );
}

export default AccessibleCanvas;
