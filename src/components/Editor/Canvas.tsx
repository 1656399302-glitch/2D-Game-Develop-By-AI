import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { ModuleRenderer } from '../Modules/ModuleRenderer';
import { EnergyPath } from '../Connections/EnergyPath';
import { ConnectionPreview } from '../Connections/ConnectionPreview';
import { calculateShakeOffset } from '../../utils/activationChoreographer';
import { MODULE_SIZES } from '../../types';

export function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingModule, setDraggingModule] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  
  // Camera shake state
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const shakeStartTimeRef = useRef<number | null>(null);
  const shakeAnimationRef = useRef<number | null>(null);
  
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
      // Reset shake
      setShakeOffset({ x: 0, y: 0 });
      if (shakeAnimationRef.current) {
        cancelAnimationFrame(shakeAnimationRef.current);
        shakeAnimationRef.current = null;
      }
      shakeStartTimeRef.current = null;
      return;
    }
    
    // Start shake animation
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
  
  // Viewport culling - determine which modules are visible
  const visibleModuleIds = useMemo(() => {
    if (modules.length === 0) return new Set<string>();
    
    // Calculate visible bounds in canvas coordinates
    const margin = 100; // Extra margin for partially visible modules
    const visibleBounds = {
      left: -viewport.x / viewport.zoom - margin,
      right: (viewportSize.width - viewport.x) / viewport.zoom + margin,
      top: -viewport.y / viewport.zoom - margin,
      bottom: (viewportSize.height - viewport.y) / viewport.zoom + margin,
    };
    
    const visible = new Set<string>();
    modules.forEach((module) => {
      const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
      const moduleLeft = module.x;
      const moduleRight = module.x + size.width;
      const moduleTop = module.y;
      const moduleBottom = module.y + size.height;
      
      // Check if module intersects with visible bounds
      if (
        moduleRight >= visibleBounds.left &&
        moduleLeft <= visibleBounds.right &&
        moduleBottom >= visibleBounds.top &&
        moduleTop <= visibleBounds.bottom
      ) {
        visible.add(module.instanceId);
      }
    });
    
    return visible;
  }, [modules, viewport, viewportSize]);
  
  // Get visible modules for rendering
  const visibleModules = useMemo(() => {
    return modules.filter(m => visibleModuleIds.has(m.instanceId));
  }, [modules, visibleModuleIds]);
  
  // Get visible connections (only show connections where both endpoints are visible)
  const visibleConnectionIds = useMemo(() => {
    const visibleConnections = new Set<string>();
    connections.forEach((conn) => {
      if (visibleModuleIds.has(conn.sourceModuleId) || visibleModuleIds.has(conn.targetModuleId)) {
        visibleConnections.add(conn.id);
      }
    });
    return visibleConnections;
  }, [connections, visibleModuleIds]);
  
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
  
  // Handle mouse down on canvas
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse or shift+left click for panning
      setIsPanning(true);
      setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      e.preventDefault();
    } else if (e.button === 0 && e.target === svgRef.current) {
      // Left click on empty canvas
      selectModule(null);
      selectConnection(null);
      if (isConnecting) {
        cancelConnection();
      }
    }
  }, [viewport, selectModule, selectConnection, isConnecting, cancelConnection]);
  
  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      // Debounce viewport updates during panning
      if (viewportDebounceRef.current) {
        clearTimeout(viewportDebounceRef.current);
      }
      viewportDebounceRef.current = setTimeout(() => {
        setViewport({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }, 16); // ~60fps
    } else if (isDragging && draggingModule) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      updateModulePosition(draggingModule, coords.x, coords.y);
    } else if (isConnecting) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      updateConnectionPreview(coords.x, coords.y);
    }
  }, [isPanning, isDragging, draggingModule, isConnecting, dragStart, getCanvasCoordinates, setViewport, updateModulePosition, updateConnectionPreview]);
  
  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      saveToHistory();
    }
    setIsPanning(false);
    setIsDragging(false);
    setDraggingModule(null);
  }, [isDragging, saveToHistory]);
  
  // Handle wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(3, viewport.zoom * delta));
    
    // Zoom towards cursor position
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      
      const newX = cursorX - (cursorX - viewport.x) * (newZoom / viewport.zoom);
      const newY = cursorY - (cursorY - viewport.y) * (newZoom / viewport.zoom);
      
      setViewport({ x: newX, y: newY, zoom: newZoom });
    }
  }, [viewport, setViewport]);
  
  // Handle module drag start
  const handleModuleDragStart = useCallback((instanceId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDraggingModule(instanceId);
    selectModule(instanceId);
  }, [selectModule]);
  
  // Grid pattern
  const gridSize = 20;
  const gridOpacity = 0.3;
  
  // Empty state hints
  const emptyStateHints = [
    'Drag modules from the left panel to begin',
    'Click on a module type to add it',
    'Press Ctrl+D to duplicate selected module',
    'Press R to rotate, F to flip',
    'Connect ports by dragging between them',
  ];
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[#050810]"
      style={{ cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : 'default' }}
      role="application"
      aria-label="Machine Editor Canvas"
    >
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
          
          {/* Energy gradient */}
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffcc" />
            <stop offset="50%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#00ffcc" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <rect width="100%" height="100%" fill="#0a0e17" />
        
        {/* Grid */}
        {gridEnabled && (
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#largeGrid)"
            transform={`translate(${viewport.x % (gridSize * 5)}, ${viewport.y % (gridSize * 5)})`}
          />
        )}
        
        {/* Content group with transform - includes viewport and camera shake */}
        <g 
          id="canvas-content"
          transform={`translate(${viewport.x + shakeOffset.x}, ${viewport.y + shakeOffset.y}) scale(${viewport.zoom})`}
          style={{ willChange: 'transform' }}
        >
          {/* Connections layer - only render visible connections */}
          <g id="connections-layer">
            {connections
              .filter(conn => visibleConnectionIds.has(conn.id))
              .map((connection) => (
                <EnergyPath
                  key={connection.id}
                  connection={connection}
                  isSelected={connection.id === selectedConnectionId}
                  isActive={machineState !== 'idle'}
                  machineState={machineState}
                />
              ))
            }
            
            {/* Connection preview */}
            {isConnecting && connectionPreview && (
              <ConnectionPreview />
            )}
          </g>
          
          {/* Modules layer - only render visible modules (viewport culling) */}
          <g id="modules-layer">
            {visibleModules.map((module) => (
              <ModuleRenderer
                key={module.instanceId}
                module={module}
                isSelected={module.instanceId === selectedModuleId}
                machineState={machineState}
                onMouseDown={(e) => handleModuleDragStart(module.instanceId, e)}
              />
            ))}
          </g>
        </g>
      </svg>
      
      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 px-3 py-1 rounded bg-[#121826] border border-[#1e2a42] text-xs text-[#9ca3af]" role="status" aria-live="polite">
        Zoom: {Math.round(viewport.zoom * 100)}%
        {visibleModuleIds.size < modules.length && (
          <span className="ml-2 text-[#4a5568]">
            ({visibleModuleIds.size}/{modules.length})
          </span>
        )}
      </div>
      
      {/* Enhanced Empty state with animated hints */}
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
              {emptyStateHints.map((hint, index) => (
                <p key={index} className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]/40" aria-hidden="true" />
                  {hint}
                </p>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#1e2a42]">
              <p className="text-xs text-[#4a5568]">
                快捷键: <span className="text-[#9ca3af]">Ctrl+D</span> 复制 | <span className="text-[#9ca3af]">R</span> 旋转 | <span className="text-[#9ca3af]">F</span> 翻转 | <span className="text-[#9ca3af]">Delete</span> 删除
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;
