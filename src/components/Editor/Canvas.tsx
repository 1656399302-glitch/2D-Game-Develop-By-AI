import { useRef, useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useSelectionStore } from '../../store/useSelectionStore';
import { ModuleRenderer } from '../Modules/ModuleRenderer';
import { EnergyPath } from '../Connections/EnergyPath';
import { ConnectionPreview } from '../Connections/ConnectionPreview';
import { AlignmentToolbar } from './AlignmentToolbar';
import { EnergyPulseVisualizer } from '../Preview/EnergyPulseVisualizer';
import { SelectionHandles } from './SelectionHandles';
import { calculateShakeOffset } from '../../utils/activationChoreographer';
import { MODULE_SIZES } from '../../types';
import {
  throttleViewportUpdates,
  createVirtualizedModuleList,
  filterVisibleConnections,
  memoizeModuleRender,
  VIEWPORT_CULLING_BUFFER,
  THROTTLE_INTERVAL_60FPS,
} from '../../utils/performanceUtils';

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 8; // 8px threshold for smart snap-to-grid
// AC8: Viewport culling with 50px buffer
const VIEWPORT_CULLING_MARGIN = VIEWPORT_CULLING_BUFFER; // 50px

// Lazy import LayersPanel to avoid circular dependency
const LayersPanel = lazy(() => import('./LayersPanel').then(m => ({ default: m.LayersPanel })));

/**
 * Snap a value to the nearest grid line if within threshold
 */
function smartSnapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  const remainder = value % gridSize;
  const nearestGrid = Math.round(value / gridSize) * gridSize;
  
  // Check if within snap threshold
  if (Math.abs(remainder) <= SNAP_THRESHOLD) {
    return nearestGrid;
  } else if (Math.abs(remainder - gridSize) <= SNAP_THRESHOLD) {
    return nearestGrid;
  }
  
  return value;
}

/**
 * Get snapped position with smart threshold
 */
function getSnappedPosition(
  x: number, 
  y: number, 
  gridEnabled: boolean, 
  gridSize: number = GRID_SIZE
): { x: number; y: number } {
  if (!gridEnabled) {
    return { x, y };
  }
  
  return {
    x: smartSnapToGrid(x, gridSize),
    y: smartSnapToGrid(y, gridSize),
  };
}

// Performance utilities instances
const memoizer = memoizeModuleRender();
const viewportThrottler = throttleViewportUpdates({ minInterval: THROTTLE_INTERVAL_60FPS });

export function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; modulePositions: Map<string, { x: number; y: number }> } | null>(null);
  
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
  
  // Activation pulse visualization state
  const [activationPulseStartTime, setActivationPulseStartTime] = useState<number | null>(null);
  
  // Show layers panel state
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const viewport = useMachineStore((state) => state.viewport);
  const selectedModuleId = useMachineStore((state) => state.selectedModuleId);
  const selectedConnectionId = useMachineStore((state) => state.selectedConnectionId);
  const isConnecting = useMachineStore((state) => state.isConnecting);
  const connectionPreview = useMachineStore((state) => state.connectionPreview);
  const machineState = useMachineStore((state) => state.machineState);
  const gridEnabled = useMachineStore((state) => state.gridEnabled);
  const activationZoom = useMachineStore((state) => state.activationZoom);
  const activationModuleIndex = useMachineStore((state) => state.activationModuleIndex);
  
  const setViewport = useMachineStore((state) => state.setViewport);
  const addModule = useMachineStore((state) => state.addModule);
  const selectModule = useMachineStore((state) => state.selectModule);
  const selectConnection = useMachineStore((state) => state.selectConnection);
  const updateModulePosition = useMachineStore((state) => state.updateModulePosition);
  const updateModulesBatch = useMachineStore((state) => state.updateModulesBatch);
  const updateConnectionPreview = useMachineStore((state) => state.updateConnectionPreview);
  const cancelConnection = useMachineStore((state) => state.cancelConnection);
  const saveToHistory = useMachineStore((state) => state.saveToHistory);
  const updateActivationZoom = useMachineStore((state) => state.updateActivationZoom);
  const setActivationModuleIndex = useMachineStore((state) => state.setActivationModuleIndex);
  
  // Selection store
  const selectedModuleIds = useSelectionStore((state) => state.selectedModuleIds);
  const toggleSelection = useSelectionStore((state) => state.toggleSelection);
  const setSelection = useSelectionStore((state) => state.setSelection);
  const clearSelection = useSelectionStore((state) => state.clearSelection);
  
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
  
  // Activation zoom animation effect
  useEffect(() => {
    if (!activationZoom.isZooming) return;
    
    const animate = (currentTime: number) => {
      updateActivationZoom(currentTime);
      
      // Continue animation if still zooming
      const { activationZoom: currentZoom } = useMachineStore.getState();
      if (currentZoom.isZooming) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [activationZoom.isZooming, updateActivationZoom]);
  
  // Track activation pulse start time
  useEffect(() => {
    if (machineState === 'charging' || machineState === 'active') {
      if (activationPulseStartTime === null) {
        setActivationPulseStartTime(performance.now());
      }
    } else {
      setActivationPulseStartTime(null);
    }
  }, [machineState]);
  
  // Track activation module index based on machine state
  useEffect(() => {
    if (machineState !== 'active' || modules.length === 0) {
      if (machineState === 'idle' || machineState === 'shutdown') {
        setActivationModuleIndex(-1);
      }
      return;
    }
    
    // Progressive module activation based on time
    const activationInterval = setInterval(() => {
      const currentIndex = useMachineStore.getState().activationModuleIndex;
      if (currentIndex < modules.length - 1) {
        setActivationModuleIndex(currentIndex + 1);
      }
    }, 150); // Activate a new module every 150ms
    
    return () => clearInterval(activationInterval);
  }, [machineState, modules.length, setActivationModuleIndex]);
  
  // AC8: Viewport culling with 50px buffer - Using performance utils
  const { visibleModules, visibleCount, totalCount } = useMemo(() => {
    const result = createVirtualizedModuleList(
      modules,
      viewport,
      viewportSize,
      { bufferSize: VIEWPORT_CULLING_MARGIN } // 50px buffer per AC8
    );
    
    return {
      visibleModules: result.visibleModules,
      visibleCount: result.visibleCount,
      totalCount: result.totalCount,
    };
  }, [modules, viewport, viewportSize]);
  
  // Create set of visible module IDs for connection filtering
  const visibleModuleIdSet = useMemo(() => {
    return new Set(visibleModules.map(m => m.instanceId));
  }, [visibleModules]);
  
  // AC8: Filter visible connections based on visible modules
  const visibleConnections = useMemo(() => {
    return filterVisibleConnections(connections, visibleModuleIdSet);
  }, [connections, visibleModuleIdSet]);
  
  // Calculate box selection rectangle
  const boxSelectionRect = useMemo(() => {
    if (!isBoxSelecting) return null;
    
    const minX = Math.min(boxStart.x, boxEnd.x);
    const maxX = Math.max(boxStart.x, boxEnd.x);
    const minY = Math.min(boxStart.y, boxEnd.y);
    const maxY = Math.max(boxStart.y, boxEnd.y);
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [isBoxSelecting, boxStart, boxEnd]);
  
  // Find modules within box selection
  const modulesInBoxSelection = useMemo(() => {
    if (!isBoxSelecting || !boxSelectionRect) return new Set<string>();
    
    const selectedIds = new Set<string>();
    modules.forEach((module) => {
      const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
      const moduleRight = module.x + size.width;
      const moduleBottom = module.y + size.height;
      
      if (
        module.x < boxSelectionRect.x + boxSelectionRect.width &&
        moduleRight > boxSelectionRect.x &&
        module.y < boxSelectionRect.y + boxSelectionRect.height &&
        moduleBottom > boxSelectionRect.y
      ) {
        selectedIds.add(module.instanceId);
      }
    });
    
    return selectedIds;
  }, [isBoxSelecting, boxSelectionRect, modules]);
  
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (clientY - rect.top - viewport.y) / viewport.zoom;
    
    return { x, y };
  }, [viewport]);
  
  // Handle drop from module panel
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const moduleType = e.dataTransfer.getData('moduleType');
    if (moduleType) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      addModule(moduleType as any, coords.x, coords.y);
    }
  }, [addModule, getCanvasCoordinates]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  
  // Check if a module is at the given screen coordinates
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
  
  // Handle mouse down on canvas
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
          
          // Store initial positions for all selected modules
          const positions = new Map<string, { x: number; y: number }>();
          const idsToTrack = selectedModuleIds.includes(clickedModuleId) 
            ? selectedModuleIds 
            : [clickedModuleId];
          
          idsToTrack.forEach(id => {
            const mod = modules.find(m => m.instanceId === id);
            if (mod) {
              positions.set(id, { x: mod.x, y: mod.y });
            }
          });
          
          dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            modulePositions: positions,
          };
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
  }, [viewport, getModuleAtPoint, getCanvasCoordinates, selectModule, selectConnection, isConnecting, cancelConnection, toggleSelection, clearSelection, selectedModuleIds, modules]);
  
  // Handle mouse move with throttled viewport updates
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      // Use throttled viewport update for better performance (AC3)
      if (viewportDebounceRef.current) {
        clearTimeout(viewportDebounceRef.current);
      }
      viewportDebounceRef.current = setTimeout(() => {
        const newViewport = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        };
        // Request throttled update
        viewportThrottler.requestUpdate(newViewport);
        setViewport(newViewport);
      }, THROTTLE_INTERVAL_60FPS);
    } else if (isBoxSelecting) {
      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
      setBoxEnd(canvasCoords);
    } else if (isDragging && draggingModule) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      
      // Check if we're dragging multiple modules
      if (selectedModuleIds.includes(draggingModule) && selectedModuleIds.length > 1) {
        // Batch update all selected modules
        const updates: Array<{ instanceId: string; x: number; y: number }> = [];
        
        dragStartRef.current?.modulePositions.forEach((startPos, id) => {
          const deltaX = (e.clientX - dragStartRef.current!.x) / viewport.zoom;
          const deltaY = (e.clientY - dragStartRef.current!.y) / viewport.zoom;
          
          let newX = startPos.x + deltaX;
          let newY = startPos.y + deltaY;
          
          // Apply smart snap-to-grid if enabled
          if (gridEnabled) {
            const snapped = getSnappedPosition(newX, newY, gridEnabled, GRID_SIZE);
            newX = snapped.x;
            newY = snapped.y;
          }
          
          updates.push({ instanceId: id, x: newX, y: newY });
        });
        
        if (updates.length > 0) {
          updateModulesBatch(updates);
        }
      } else {
        // Single module drag with smart snap-to-grid
        let newX = coords.x;
        let newY = coords.y;
        
        if (gridEnabled) {
          const snapped = getSnappedPosition(newX, newY, gridEnabled, GRID_SIZE);
          newX = snapped.x;
          newY = snapped.y;
        }
        
        updateModulePosition(draggingModule, newX, newY);
      }
    } else if (isConnecting) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      updateConnectionPreview(coords.x, coords.y);
    }
  }, [isPanning, isBoxSelecting, isDragging, draggingModule, isConnecting, dragStart, getCanvasCoordinates, setViewport, updateModulePosition, updateModulesBatch, updateConnectionPreview, selectedModuleIds, viewport.zoom, gridEnabled]);
  
  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      saveToHistory();
    }
    
    if (isBoxSelecting && modulesInBoxSelection.size > 0) {
      setSelection(Array.from(modulesInBoxSelection));
    }
    
    setIsPanning(false);
    setIsDragging(false);
    setDraggingModule(null);
    setIsBoxSelecting(false);
    boxStartCanvasRef.current = null;
    dragStartRef.current = null;
  }, [isDragging, isBoxSelecting, modulesInBoxSelection, setSelection, saveToHistory]);
  
  // Handle wheel for zoom with throttled updates
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(3, viewport.zoom * delta));
    
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      
      const newX = cursorX - (cursorX - viewport.x) * (newZoom / viewport.zoom);
      const newY = cursorY - (cursorY - viewport.y) * (newZoom / viewport.zoom);
      
      const newViewport = { x: newX, y: newY, zoom: newZoom };
      
      // Use throttled update for zoom
      viewportThrottler.requestUpdate(newViewport);
      setViewport(newViewport);
    }
  }, [viewport, setViewport]);
  
  // Handle module drag start
  const handleModuleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    if (e.shiftKey) {
      toggleSelection(id);
      return;
    }
    
    setIsDragging(true);
    setDraggingModule(id);
    selectModule(id);
    
    // Store initial positions
    const positions = new Map<string, { x: number; y: number }>();
    const idsToTrack = selectedModuleIds.includes(id) 
      ? selectedModuleIds 
      : [id];
    
    idsToTrack.forEach(moduleId => {
      const mod = modules.find(m => m.instanceId === moduleId);
      if (mod) {
        positions.set(moduleId, { x: mod.x, y: mod.y });
      }
    });
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      modulePositions: positions,
    };
  }, [selectModule, toggleSelection, selectedModuleIds, modules]);
  
  // Handle selection move (for group movement via SelectionHandles)
  const handleSelectionMove = useCallback((deltaX: number, deltaY: number) => {
    if (selectedModuleIds.length === 0) return;
    
    const updates: Array<{ instanceId: string; x: number; y: number }> = [];
    
    selectedModuleIds.forEach(id => {
      const mod = modules.find(m => m.instanceId === id);
      if (mod) {
        let newX = mod.x + deltaX;
        let newY = mod.y + deltaY;
        
        // Apply smart snap-to-grid if enabled
        if (gridEnabled) {
          const snapped = getSnappedPosition(newX, newY, gridEnabled, GRID_SIZE);
          newX = snapped.x;
          newY = snapped.y;
        }
        
        updates.push({ instanceId: id, x: newX, y: newY });
      }
    });
    
    if (updates.length > 0) {
      updateModulesBatch(updates);
    }
  }, [selectedModuleIds, modules, gridEnabled, updateModulesBatch]);
  
  // Handle selection rotate
  const handleSelectionRotate = useCallback((_newRotation: number) => {
    // Rotation handling can be implemented based on requirements
  }, []);
  
  // Handle selection scale
  const handleSelectionScale = useCallback((_newScale: number) => {
    // Scale handling can be implemented based on requirements
  }, []);
  
  // Grid pattern
  const gridSize = 20;
  const gridOpacity = 0.3;
  
  // Empty state hints
  const emptyStateHints = [
    '从左侧面板拖拽模块到画布开始',
    '点击模块类型添加模块',
    '按 Ctrl+D 复制选中的模块',
    '按 R 旋转, F 翻转',
    '在端口之间拖拽来连接',
    '按 Ctrl+G 创建组',
    '按 Ctrl+Shift+G 取消分组',
  ];
  
  // Check if module is selected
  const isModuleSelected = useCallback((instanceId: string) => {
    return instanceId === selectedModuleId || selectedModuleIds.includes(instanceId);
  }, [selectedModuleId, selectedModuleIds]);
  
  // Check if module is activated (for activation glow effect)
  const isModuleActivated = useCallback((_instanceId: string, moduleIndex: number) => {
    if (machineState === 'idle') return false;
    if (machineState === 'charging') return false;
    if (machineState === 'failure' || machineState === 'overload') return true;
    return moduleIndex <= activationModuleIndex;
  }, [machineState, activationModuleIndex]);
  
  // Get module index in the modules array
  const getModuleIndex = useCallback((instanceId: string) => {
    return modules.findIndex(m => m.instanceId === instanceId);
  }, [modules]);
  
  // Check if activation is active
  const isActivationActive = machineState === 'charging' || machineState === 'active';
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[#050810]"
      style={{ cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : isBoxSelecting ? 'crosshair' : 'default' }}
      role="application"
      aria-label="Machine Editor Canvas"
    >
      {/* Alignment Toolbar */}
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
      >
        {/* Definitions */}
        <defs>
          <pattern id="smallGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="#1e2a42"
              strokeWidth="0.5"
              opacity={gridOpacity}
            />
          </pattern>
          <pattern id="largeGrid" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
            <rect width={gridSize * 5} height={gridSize * 5} fill="url(#smallGrid)" />
            <path
              d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`}
              fill="none"
              stroke="#1e2a42"
              strokeWidth="1"
              opacity={gridOpacity * 1.5}
            />
          </pattern>
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Selection glow filter */}
          <filter id="selectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Energy gradient */}
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffcc" />
            <stop offset="50%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#00ffcc" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <rect 
          id="canvas-background"
          width="100%" 
          height="100%" 
          fill="#0a0e17" 
        />
        
        {/* Grid */}
        {gridEnabled && (
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#largeGrid)"
            transform={`translate(${viewport.x % (gridSize * 5)}, ${viewport.y % (gridSize * 5)})`}
          />
        )}
        
        {/* Content group with transform */}
        <g 
          id="canvas-content"
          transform={`translate(${viewport.x + shakeOffset.x}, ${viewport.y + shakeOffset.y}) scale(${viewport.zoom})`}
          style={{ willChange: 'transform' }}
        >
          {/* Energy Pulse Visualizer - renders pulse waves on connections */}
          <EnergyPulseVisualizer
            connections={connections}
            modules={modules}
            isActive={isActivationActive}
            startTime={activationPulseStartTime || performance.now()}
            pulseSpeed={400}
            pulseColor="#00ffcc"
          />
          
          {/* Connections layer - Using filtered visible connections */}
          <g id="connections-layer">
            {visibleConnections.map((connection) => (
              <EnergyPath
                key={connection.id}
                connection={connection}
                isSelected={connection.id === selectedConnectionId}
                isActive={isActivationActive}
                machineState={machineState}
              />
            ))
            }
            
            {/* Connection preview */}
            {isConnecting && connectionPreview && (
              <ConnectionPreview />
            )}
          </g>
          
          {/* Modules layer - Using visible modules only (AC8 viewport culling) */}
          <g id="modules-layer">
            {visibleModules.map((module) => {
              // Check visibility property
              const isVisible = (module as any).isVisible !== false;
              if (!isVisible) return null;
              
              const moduleIdx = getModuleIndex(module.instanceId);
              
              // Cache module render for performance
              memoizer.getCached(
                module.instanceId,
                module.rotation,
                module.scale,
                isModuleSelected(module.instanceId)
              );
              
              return (
                <ModuleRenderer
                  key={module.instanceId}
                  module={module}
                  isSelected={isModuleSelected(module.instanceId)}
                  machineState={machineState}
                  onMouseDown={(e) => handleModuleDragStart(module.instanceId, e)}
                  isActivated={isModuleActivated(module.instanceId, moduleIdx)}
                  activationIntensity={isModuleActivated(module.instanceId, moduleIdx) ? 1 : 0}
                />
              );
            })}
          </g>
          
          {/* Box selection rectangle */}
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
          
          {/* Multi-selection highlight for selected modules */}
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
        
        {/* Selection Handles - for multi-selection */}
        <SelectionHandles
          viewport={viewport}
          onMove={handleSelectionMove}
          onRotate={handleSelectionRotate}
          onScale={handleSelectionScale}
        />
      </svg>
      
      {/* Layers Panel Button */}
      <button
        data-testid="toggle-layers-panel"
        onClick={() => setShowLayersPanel(!showLayersPanel)}
        className={`
          absolute top-4 right-4 px-3 py-2 rounded-lg text-sm transition-all z-10
          ${showLayersPanel 
            ? 'bg-[#3b82f6] text-white' 
            : 'bg-[#121826] text-[#9ca3af] hover:text-white border border-[#1e2a42] hover:border-[#3b82f6]/30'
          }
        `}
        title="图层面板"
      >
        📑 图层
      </button>
      
      {/* Layers Panel (rendered outside SVG) */}
      {showLayersPanel && (
        <div className="absolute top-16 right-4 w-64 h-[calc(100%-8rem)] z-20">
          <Suspense fallback={
            <div className="w-full h-full bg-[#121826] border border-[#1e2a42] rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <LayersPanel />
          </Suspense>
        </div>
      )}
      
      {/* AC8: Zoom indicator with viewport culling info */}
      <div 
        className="absolute bottom-4 left-4 px-3 py-1 rounded bg-[#121826] border border-[#1e2a42] text-xs text-[#9ca3af]" 
        role="status" 
        aria-live="polite"
        data-testid="viewport-info"
      >
        Zoom: {Math.round(viewport.zoom * 100)}%
        {totalCount > 0 && visibleCount < totalCount && (
          <span className="ml-2 text-[#4a5568]" title={`Viewport culling: ${VIEWPORT_CULLING_MARGIN}px buffer`}>
            ({visibleCount}/{totalCount})
          </span>
        )}
        {gridEnabled && (
          <span className="ml-2 text-[#22c55e]" title={`网格吸附已开启 (${SNAP_THRESHOLD}px阈值)`}>
            📐
          </span>
        )}
      </div>
      
      {/* Activation zoom indicator */}
      {activationZoom.isZooming && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded bg-[#00d4ff]/20 border border-[#00d4ff] text-xs text-[#00d4ff]">
          聚焦机器...
        </div>
      )}
      
      {/* Multi-select indicator */}
      {selectedModuleIds.length > 1 && (
        <div className="absolute bottom-4 right-4 px-3 py-1 rounded bg-[#1e4d8c] border border-[#3b82f6] text-xs text-[#93c5fd]">
          {selectedModuleIds.length} 模块已选择 (Ctrl+G 创建组)
        </div>
      )}
      
      {/* Enhanced Empty state */}
      {modules.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 rounded-lg bg-[#121826]/80 border border-[#1e2a42] max-w-md">
            <div className="mb-4">
              <svg 
                className="w-16 h-16 mx-auto text-[#00d4ff]/30 animate-pulse" 
                viewBox="0 0 64 64" 
                fill="none"
                aria-hidden="true"
              >
                <polygon 
                  points="32,4 60,18 60,46 32,60 4,46 4,18" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  fill="none"
                />
                <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="32" cy="32" r="4" fill="currentColor" />
              </svg>
            </div>
            <p className="text-[#9ca3af] text-lg mb-4 font-medium">开始构建你的魔法机器</p>
            <div className="text-sm text-[#6b7280] space-y-2">
              {emptyStateHints.map((hint, idx) => (
                <p key={idx} className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]/40" aria-hidden="true" />
                  {hint}
                </p>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#1e2a42]">
              <p className="text-xs text-[#4a5568]">
                快捷键: <span className="text-[#9ca3af]">Ctrl+D</span> 复制 | <span className="text-[#9ca3af]">R</span> 旋转 | <span className="text-[#9ca3af]">F</span> 翻转 | <span className="text-[#9ca3af]">Delete</span> 删除 | <span className="text-[#9ca3af]">Shift+拖动</span> 框选 | <span className="text-[#9ca3af]">Ctrl+G</span> 分组
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;
