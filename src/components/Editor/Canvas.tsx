import { useRef, useState, useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { ModuleRenderer } from '../Modules/ModuleRenderer';
import { EnergyPath } from '../Connections/EnergyPath';
import { ConnectionPreview } from '../Connections/ConnectionPreview';

export function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingModule, setDraggingModule] = useState<string | null>(null);
  
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
      setViewport({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
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
  
  // Handle connection click
  const handleConnectionClick = useCallback((connectionId: string) => {
    selectConnection(connectionId);
  }, [selectConnection]);
  
  // Grid pattern
  const gridSize = 20;
  const gridOpacity = 0.3;
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[#050810]"
      style={{ cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : 'default' }}
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
        
        {/* Content group with transform */}
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
          {/* Connections layer */}
          <g id="connections-layer">
            {connections.map((connection) => (
              <EnergyPath
                key={connection.id}
                connection={connection}
                isSelected={connection.id === selectedConnectionId}
                isActive={machineState !== 'idle'}
                onClick={() => handleConnectionClick(connection.id)}
              />
            ))}
            
            {/* Connection preview */}
            {isConnecting && connectionPreview && (
              <ConnectionPreview />
            )}
          </g>
          
          {/* Modules layer */}
          <g id="modules-layer">
            {modules.map((module) => (
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
      <div className="absolute bottom-4 left-4 px-3 py-1 rounded bg-[#121826] border border-[#1e2a42] text-xs text-[#9ca3af]">
        Zoom: {Math.round(viewport.zoom * 100)}%
      </div>
      
      {/* Instructions overlay */}
      {modules.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 rounded-lg bg-[#121826]/80 border border-[#1e2a42]">
            <p className="text-[#9ca3af] text-lg mb-2">Drag modules from the left panel</p>
            <p className="text-[#4a5568] text-sm">or click on a module type to add it</p>
          </div>
        </div>
      )}
    </div>
  );
}
