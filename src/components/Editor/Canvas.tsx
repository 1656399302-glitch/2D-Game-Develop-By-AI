import { useRef, useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useSelectionStore } from '../../store/useSelectionStore';
import { ModuleRenderer } from '../Modules/ModuleRenderer';
import { EnergyPath } from '../Connections/EnergyPath';
import { ConnectionPreview } from '../Connections/ConnectionPreview';
import { AlignmentToolbar } from './AlignmentToolbar';
import { EnergyPulseVisualizer } from '../Preview/EnergyPulseVisualizer';
import { SelectionHandles } from './SelectionHandles';
import { ModuleValidationBadge } from './ModuleValidationBadge';
import { calculateShakeOffset } from '../../utils/activationChoreographer';
import { useCircuitValidation } from '../../hooks/useCircuitValidation';
import { MODULE_SIZES, PlacedModule } from '../../types';
import {
  throttleViewportUpdates,
  createVirtualizedModuleList,
  filterVisibleConnections,
  memoizeModuleRender,
  VIEWPORT_CULLING_BUFFER,
  THROTTLE_INTERVAL_60FPS,
} from '../../utils/performanceUtils';
import { calculateGroupCenter } from '../../utils/groupingUtils';
import { ModuleSpatialIndex, getCanvasSpatialIndex } from '../../utils/spatialIndex';
import { getCanvasDimensions, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, calculateSafeViewportBounds } from '../../utils/canvasSizeUtils';

// D8 Integration: Import useCanvasPerformance hook (Round 82)
import { useCanvasPerformance } from '../../hooks/useCanvasPerformance';

// Round 123: Import circuit canvas components for integration
import { useCircuitCanvasStore } from '../../store/useCircuitCanvasStore';
import { CanvasCircuitNode } from '../Circuit/CanvasCircuitNode';
import { CircuitWire, WirePreview } from '../Circuit/CircuitWire';
import { CIRCUIT_NODE_SIZES } from '../../types/circuitCanvas';
import { PlacedCircuitNode, CircuitWire as CircuitWireType } from '../../types/circuitCanvas';

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 8; // 8px threshold for smart snap-to-grid
// AC8: Viewport culling with 50px buffer
const VIEWPORT_CULLING_MARGIN = VIEWPORT_CULLING_BUFFER; // 50px
// D8 Integration: 16ms debounce for 60fps performance
const DEBOUNCE_MS = 16;

// Round 92 Fix: Safe module position range - modules within this distance from origin should always be visible
const SAFE_MODULE_POSITION = 500;

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

/**
 * Round 92 Fix: Check if a module should be considered "potentially visible"
 * even when viewport calculation is uncertain
 */
function isModulePotentiallyVisible(
  module: PlacedModule,
  viewportSize: { width: number; height: number }
): boolean {
  const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
  
  // If viewport size is default (800x600), modules near origin should always be visible
  if (viewportSize.width === DEFAULT_CANVAS_WIDTH && viewportSize.height === DEFAULT_CANVAS_HEIGHT) {
    if (Math.abs(module.x) < SAFE_MODULE_POSITION && Math.abs(module.y) < SAFE_MODULE_POSITION) {
      return true;
    }
    return (
      module.x < viewportSize.width + VIEWPORT_CULLING_MARGIN &&
      module.y < viewportSize.height + VIEWPORT_CULLING_MARGIN &&
      module.x + size.width > -VIEWPORT_CULLING_MARGIN &&
      module.y + size.height > -VIEWPORT_CULLING_MARGIN
    );
  }
  
  if (viewportSize.width > 0 && viewportSize.height > 0) {
    return true;
  }
  
  return Math.abs(module.x) < SAFE_MODULE_POSITION && Math.abs(module.y) < SAFE_MODULE_POSITION;
}

// ============================================================================
// Canvas Props Interface
// ============================================================================

export interface CanvasProps {
  /** Callback when a module validation badge is clicked */
  onModuleValidationClick?: (moduleId: string, position: { x: number; y: number }) => void;
}

// ============================================================================
// Canvas Component
// ============================================================================

export function Canvas({ onModuleValidationClick }: CanvasProps = {}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; modulePositions: Map<string, { x: number; y: number }> } | null>(null);
  
  // Round 123: Circuit canvas drag state ref
  const circuitDragStartRef = useRef<{ nodeId: string; startX: number; startY: number; nodePositions: Map<string, { x: number; y: number }> } | null>(null);
  
  // Spatial index for O(log n) hit testing
  const spatialIndexRef = useRef<ModuleSpatialIndex | null>(null);
  
  // D8 Integration: Canvas performance hook
  const { 
    batchedTransform, 
    isHighPerformance 
  } = useCanvasPerformance({ forceHighPerformance: undefined });
  
  // Round 113: Circuit validation state
  const { isModuleAffected, validationResult } = useCircuitValidation();
  
  // Round 123: Circuit canvas state from store
  const circuitNodes = useCircuitCanvasStore((state) => state.nodes);
  const circuitWires = useCircuitCanvasStore((state) => state.wires);
  const selectedCircuitNodeId = useCircuitCanvasStore((state) => state.selectedNodeId);
  const selectedCircuitWireId = useCircuitCanvasStore((state) => state.selectedWireId);
  const isDrawingCircuitWire = useCircuitCanvasStore((state) => state.isDrawingWire);
  const circuitWireStart = useCircuitCanvasStore((state) => state.wireStart);
  const circuitWirePreviewEnd = useCircuitCanvasStore((state) => state.wirePreviewEnd);
  // cycleAffectedNodeIds available from store for future cycle warning rendering
  const selectCircuitNode = useCircuitCanvasStore((state) => state.selectCircuitNode);
  const selectCircuitWire = useCircuitCanvasStore((state) => state.selectCircuitWire);
  const updateCircuitNodePosition = useCircuitCanvasStore((state) => state.updateNodePosition);
  const removeCircuitNode = useCircuitCanvasStore((state) => state.removeCircuitNode);
  const removeCircuitWire = useCircuitCanvasStore((state) => state.removeCircuitWire);
  const toggleCircuitInput = useCircuitCanvasStore((state) => state.toggleCircuitInput);
  const startCircuitWireDrawing = useCircuitCanvasStore((state) => state.startWireDrawing);
  const updateCircuitWirePreview = useCircuitCanvasStore((state) => state.updateWirePreview);
  const finishCircuitWireDrawing = useCircuitCanvasStore((state) => state.finishWireDrawing);
  const cancelCircuitWireDrawing = useCircuitCanvasStore((state) => state.cancelWireDrawing);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingModule, setDraggingModule] = useState<string | null>(null);
  
  // Round 92 Fix: Robust viewport size detection
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
  });
  
  const [measurementAttempt, setMeasurementAttempt] = useState(0);
  
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
  
  // Round 117 Fix: Memory leak cleanup for debounce refs
  // Clean up pending timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (connectionDebounceRef.current !== null) {
        clearTimeout(connectionDebounceRef.current);
        connectionDebounceRef.current = null;
      }
      if (viewportDebounceRef.current !== null) {
        clearTimeout(viewportDebounceRef.current);
        viewportDebounceRef.current = null;
      }
    };
  }, []);
  
  // Initialize spatial index
  useEffect(() => {
    if (!spatialIndexRef.current) {
      spatialIndexRef.current = getCanvasSpatialIndex();
    }
  }, []);
  
  // Rebuild spatial index when modules change
  useEffect(() => {
    if (spatialIndexRef.current && modules.length > 0) {
      spatialIndexRef.current.rebuild(modules);
    } else if (spatialIndexRef.current && modules.length === 0) {
      spatialIndexRef.current.clear();
    }
  }, [modules]);
  
  // FIX (Round 29): Use refs for stable function references
  const setActivationModuleIndexRef = useRef(setActivationModuleIndex);
  useEffect(() => {
    setActivationModuleIndexRef.current = setActivationModuleIndex;
  }, [setActivationModuleIndex]);
  
  const modulesLengthRef = useRef(modules.length);
  useEffect(() => {
    modulesLengthRef.current = modules.length;
  }, [modules.length]);
  
  // Round 92 Fix: Robust viewport size detection
  useEffect(() => {
    const updateSize = () => {
      const dims = getCanvasDimensions(containerRef, svgRef);
      
      const isDefault = dims.width === DEFAULT_CANVAS_WIDTH && dims.height === DEFAULT_CANVAS_HEIGHT;
      const currentIsDefault = viewportSize.width === DEFAULT_CANVAS_WIDTH && viewportSize.height === DEFAULT_CANVAS_HEIGHT;
      
      if (!isDefault || currentIsDefault) {
        setViewportSize(dims);
      }
    };
    
    let rafId = requestAnimationFrame(() => {
      updateSize();
      
      const dims = getCanvasDimensions(containerRef, svgRef);
      if (dims.width === DEFAULT_CANVAS_WIDTH && dims.height === DEFAULT_CANVAS_HEIGHT) {
        setTimeout(() => {
          updateSize();
        }, 100);
      }
    });
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [measurementAttempt]);
  
  // Round 92 Fix: Set up ResizeObserver with fallback
  useEffect(() => {
    const updateSize = () => {
      const dims = getCanvasDimensions(containerRef, svgRef);
      setViewportSize(dims);
      
      if (dims.width === DEFAULT_CANVAS_WIDTH && dims.height === DEFAULT_CANVAS_HEIGHT) {
        setMeasurementAttempt(prev => prev + 1);
      }
    };
    
    window.addEventListener('resize', updateSize);
    
    let resizeObserver: ResizeObserver | null = null;
    
    try {
      if (containerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          updateSize();
        });
        resizeObserver.observe(containerRef.current);
      }
    } catch (error) {
      console.warn('ResizeObserver not available, using fallback methods');
    }
    
    const fallbackInterval = setInterval(() => {
      const currentDims = getCanvasDimensions(containerRef, svgRef);
      if (currentDims.width > 0 && currentDims.height > 0) {
        if (currentDims.width !== viewportSize.width || currentDims.height !== viewportSize.height) {
          setViewportSize(currentDims);
        }
        
        if (currentDims.width !== DEFAULT_CANVAS_WIDTH || currentDims.height !== DEFAULT_CANVAS_HEIGHT) {
          clearInterval(fallbackInterval);
        }
      }
    }, 500);
    
    return () => {
      window.removeEventListener('resize', updateSize);
      clearInterval(fallbackInterval);
      if (resizeObserver) {
        try {
          resizeObserver.disconnect();
        } catch (e) {
          // Ignore errors
        }
      }
    };
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
  
  // FIX (Round 29): Track activation module index
  useEffect(() => {
    if (machineState !== 'active' || modulesLengthRef.current === 0) {
      if (machineState === 'idle' || machineState === 'shutdown') {
        setActivationModuleIndexRef.current(-1);
      }
      return;
    }
    
    const activationInterval = setInterval(() => {
      const currentIndex = useMachineStore.getState().activationModuleIndex;
      if (currentIndex < modulesLengthRef.current - 1) {
        setActivationModuleIndexRef.current(currentIndex + 1);
      }
    }, 150);
    
    return () => clearInterval(activationInterval);
  }, [machineState]);
  
  // AC8: Viewport culling with 50px buffer
  const { visibleModules, visibleCount, totalCount } = useMemo(() => {
    const safeBounds = calculateSafeViewportBounds(
      viewport,
      viewportSize,
      VIEWPORT_CULLING_MARGIN
    );
    
    if (safeBounds.isDefaultFallback) {
      const result = createVirtualizedModuleList(
        modules,
        viewport,
        viewportSize,
        { bufferSize: VIEWPORT_CULLING_MARGIN }
      );
      
      const allModules = modules;
      const visibleIds = new Set(result.visibleModules.map(m => m.instanceId));
      
      const nearOriginModules = allModules.filter(m => 
        isModulePotentiallyVisible(m, viewportSize) && !visibleIds.has(m.instanceId)
      );
      
      if (nearOriginModules.length > 0) {
        const combinedModules = [...result.visibleModules, ...nearOriginModules];
        return {
          visibleModules: combinedModules,
          visibleCount: combinedModules.length,
          totalCount: allModules.length,
        };
      }
      
      return {
        visibleModules: result.visibleModules,
        visibleCount: result.visibleCount,
        totalCount: result.totalCount,
      };
    }
    
    const result = createVirtualizedModuleList(
      modules,
      viewport,
      viewportSize,
      { bufferSize: VIEWPORT_CULLING_MARGIN }
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
    
    if (spatialIndexRef.current && spatialIndexRef.current.size > 0) {
      const moduleIds = spatialIndexRef.current.getModulesInRect(
        boxSelectionRect.x,
        boxSelectionRect.y,
        boxSelectionRect.width,
        boxSelectionRect.height
      );
      return new Set(moduleIds);
    }
    
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
  
  // D8 Integration: Pending connection preview coords
  const pendingConnectionCoordsRef = useRef<{ x: number; y: number } | null>(null);
  
  // D8 Integration: Debounced connection preview update
  const updateConnectionPreviewDebounced = useCallback((x: number, y: number) => {
    pendingConnectionCoordsRef.current = { x, y };
    
    if (connectionDebounceRef.current !== null) {
      return;
    }
    
    connectionDebounceRef.current = setTimeout(() => {
      if (pendingConnectionCoordsRef.current) {
        updateConnectionPreview(
          pendingConnectionCoordsRef.current.x,
          pendingConnectionCoordsRef.current.y
        );
        pendingConnectionCoordsRef.current = null;
      }
      connectionDebounceRef.current = null;
    }, DEBOUNCE_MS);
  }, [updateConnectionPreview]);
  
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (clientY - rect.top - viewport.y) / viewport.zoom;
    
    return { x, y };
  }, [viewport]);
  
  // D8 Integration: Batched viewport transform updates
  const setBatchedViewport = useCallback((newViewport: { x: number; y: number }) => {
    batchedTransform(newViewport);
    setViewport(newViewport);
  }, [batchedTransform, setViewport]);
  
  // Handle drop from module panel
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const moduleType = e.dataTransfer.getData('moduleType');
    if (moduleType) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      addModule(moduleType as any, coords.x, coords.y);
      
      setTimeout(() => {
        const updatedModules = useMachineStore.getState().modules;
        if (spatialIndexRef.current) {
          spatialIndexRef.current.rebuild(updatedModules);
        }
      }, 0);
    }
  }, [addModule, getCanvasCoordinates]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  
  // Check if a module is at the given screen coordinates
  const getModuleAtPoint = useCallback((clientX: number, clientY: number): string | null => {
    const coords = getCanvasCoordinates(clientX, clientY);
    
    if (spatialIndexRef.current && spatialIndexRef.current.size > 0) {
      return spatialIndexRef.current.getModuleAtPoint(coords.x, coords.y);
    }
    
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
        // Round 123: Cancel circuit wire drawing if clicking on canvas background
        if (isDrawingCircuitWire) {
          cancelCircuitWireDrawing();
        }
      }
    }
  }, [viewport, getModuleAtPoint, getCanvasCoordinates, selectModule, selectConnection, isConnecting, cancelConnection, toggleSelection, clearSelection, selectedModuleIds, modules, isDrawingCircuitWire, cancelCircuitWireDrawing]);
  
  // Handle mouse move with throttled viewport updates
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      if (viewportDebounceRef.current) {
        clearTimeout(viewportDebounceRef.current);
      }
      viewportDebounceRef.current = setTimeout(() => {
        const newViewport = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        };
        viewportThrottler.requestUpdate(newViewport);
        setBatchedViewport(newViewport);
      }, THROTTLE_INTERVAL_60FPS);
    } else if (isBoxSelecting) {
      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
      setBoxEnd(canvasCoords);
    } else if (isDragging && draggingModule) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      
      if (selectedModuleIds.includes(draggingModule) && selectedModuleIds.length > 1) {
        const updates: Array<{ instanceId: string; x: number; y: number }> = [];
        
        dragStartRef.current?.modulePositions.forEach((startPos, id) => {
          const deltaX = (e.clientX - dragStartRef.current!.x) / viewport.zoom;
          const deltaY = (e.clientY - dragStartRef.current!.y) / viewport.zoom;
          
          let newX = startPos.x + deltaX;
          let newY = startPos.y + deltaY;
          
          if (gridEnabled) {
            const snapped = getSnappedPosition(newX, newY, gridEnabled, GRID_SIZE);
            newX = snapped.x;
            newY = snapped.y;
          }
          
          updates.push({ instanceId: id, x: newX, y: newY });
        });
        
        if (updates.length > 0) {
          updateModulesBatch(updates);
          
          setTimeout(() => {
            const updatedModules = useMachineStore.getState().modules;
            if (spatialIndexRef.current) {
              spatialIndexRef.current.rebuild(updatedModules);
            }
          }, 0);
        }
      } else {
        let newX = coords.x;
        let newY = coords.y;
        
        if (gridEnabled) {
          const snapped = getSnappedPosition(newX, newY, gridEnabled, GRID_SIZE);
          newX = snapped.x;
          newY = snapped.y;
        }
        
        updateModulePosition(draggingModule, newX, newY);
        
        setTimeout(() => {
          const updatedModules = useMachineStore.getState().modules;
          if (spatialIndexRef.current) {
            spatialIndexRef.current.rebuild(updatedModules);
          }
        }, 0);
      }
    } else if (isConnecting) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      updateConnectionPreviewDebounced(coords.x, coords.y);
    } else if (isDrawingCircuitWire) {
      // Round 123: Update circuit wire preview
      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
      updateCircuitWirePreview(canvasCoords.x, canvasCoords.y);
    } else if (circuitDragStartRef.current) {
      // Round 123: Drag circuit nodes
      const dragInfo = circuitDragStartRef.current;
      
      if (selectedCircuitNodeId && selectedModuleIds.length === 0) {
        // Single node dragging
        const deltaX = (e.clientX - dragInfo.startX) / viewport.zoom;
        const deltaY = (e.clientY - dragInfo.startY) / viewport.zoom;
        
        const startPos = dragInfo.nodePositions.get(dragInfo.nodeId);
        if (startPos) {
          let newX = startPos.x + deltaX;
          let newY = startPos.y + deltaY;
          
          if (gridEnabled) {
            const snapped = getSnappedPosition(newX, newY, gridEnabled, GRID_SIZE);
            newX = snapped.x;
            newY = snapped.y;
          }
          
          updateCircuitNodePosition(dragInfo.nodeId, newX, newY);
        }
      } else if (circuitDragStartRef.current.nodePositions.size > 1) {
        // Multi-node dragging
        const deltaX = (e.clientX - dragInfo.startX) / viewport.zoom;
        const deltaY = (e.clientY - dragInfo.startY) / viewport.zoom;
        
        circuitDragStartRef.current.nodePositions.forEach((startPos, nodeId) => {
          let newX = startPos.x + deltaX;
          let newY = startPos.y + deltaY;
          
          if (gridEnabled) {
            const snapped = getSnappedPosition(newX, newY, gridEnabled, GRID_SIZE);
            newX = snapped.x;
            newY = snapped.y;
          }
          
          updateCircuitNodePosition(nodeId, newX, newY);
        });
      }
    }
  }, [isPanning, isBoxSelecting, isDragging, draggingModule, isConnecting, isDrawingCircuitWire, dragStart, getCanvasCoordinates, setBatchedViewport, viewportThrottler, updateModulePosition, updateModulesBatch, selectedModuleIds, viewport.zoom, gridEnabled, updateConnectionPreviewDebounced, updateCircuitWirePreview, selectedCircuitNodeId, updateCircuitNodePosition]);
  
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
    circuitDragStartRef.current = null;
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
      
      viewportThrottler.requestUpdate(newViewport);
      setBatchedViewport(newViewport);
    }
  }, [viewport, setBatchedViewport, viewportThrottler]);
  
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
  
  // Handle selection move
  const handleSelectionMove = useCallback((deltaX: number, deltaY: number) => {
    if (selectedModuleIds.length === 0) return;
    
    const updates: Array<{ instanceId: string; x: number; y: number }> = [];
    
    selectedModuleIds.forEach(id => {
      const mod = modules.find(m => m.instanceId === id);
      if (mod) {
        let newX = mod.x + deltaX;
        let newY = mod.y + deltaY;
        
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
      
      setTimeout(() => {
        const updatedModules = useMachineStore.getState().modules;
        if (spatialIndexRef.current) {
          spatialIndexRef.current.rebuild(updatedModules);
        }
      }, 0);
    }
  }, [selectedModuleIds, modules, gridEnabled, updateModulesBatch]);
  
  // Handle selection rotate
  const handleSelectionRotate = useCallback((_newRotation: number) => {
    const targetIds = selectedModuleIds.length > 0 
      ? selectedModuleIds 
      : (selectedModuleId ? [selectedModuleId] : []);
    
    if (targetIds.length === 0) return;
    
    const currentModules = useMachineStore.getState().modules;
    const targetModules = currentModules.filter(m => targetIds.includes(m.instanceId));
    
    if (targetModules.length === 0) return;
    
    const center = calculateGroupCenter(targetModules, targetIds);
    if (!center) return;
    
    const degrees = 90;
    const radians = (degrees * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    const updates: Array<{ instanceId: string; x: number; y: number; rotation: number }> = [];
    
    targetModules.forEach(module => {
      const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
      const moduleCenterX = module.x + size.width / 2;
      const moduleCenterY = module.y + size.height / 2;
      
      const dx = moduleCenterX - center.x;
      const dy = moduleCenterY - center.y;
      const newModuleCenterX = center.x + dx * cos - dy * sin;
      const newModuleCenterY = center.y + dx * sin + dy * cos;
      
      const newX = newModuleCenterX - size.width / 2;
      const newY = newModuleCenterY - size.height / 2;
      const newRotation = (module.rotation + degrees) % 360;
      
      updates.push({ 
        instanceId: module.instanceId, 
        x: Math.round(newX), 
        y: Math.round(newY), 
        rotation: newRotation 
      });
    });
    
    if (updates.length > 0) {
      const positionUpdates = updates.map(u => ({ 
        instanceId: u.instanceId, 
        x: u.x, 
        y: u.y 
      }));
      updateModulesBatch(positionUpdates);
      
      const state = useMachineStore.getState();
      const updatedModules = state.modules.map(m => {
        const update = updates.find(u => u.instanceId === m.instanceId);
        if (update) {
          return { ...m, rotation: update.rotation };
        }
        return m;
      });
      useMachineStore.setState({ modules: updatedModules });
      
      setTimeout(() => {
        const updatedModules = useMachineStore.getState().modules;
        if (spatialIndexRef.current) {
          spatialIndexRef.current.rebuild(updatedModules);
        }
      }, 0);
      
      saveToHistory();
    }
  }, [selectedModuleIds, selectedModuleId, updateModulesBatch, saveToHistory]);
  
  // Handle selection scale
  const handleSelectionScale = useCallback((newScale: number) => {
    const targetIds = selectedModuleIds.length > 0 
      ? selectedModuleIds 
      : (selectedModuleId ? [selectedModuleId] : []);
    
    if (targetIds.length === 0) return;
    
    const scaleFactor = Math.max(0.25, Math.min(4.0, newScale));
    
    const currentModules = useMachineStore.getState().modules;
    const targetModules = currentModules.filter(m => targetIds.includes(m.instanceId));
    
    if (targetModules.length === 0) return;
    
    const center = calculateGroupCenter(targetModules, targetIds);
    if (!center) return;
    
    const updates: Array<{ instanceId: string; x: number; y: number; scale: number }> = [];
    
    targetModules.forEach(module => {
      const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
      const moduleCenterX = module.x + size.width / 2;
      const moduleCenterY = module.y + size.height / 2;
      
      const dx = moduleCenterX - center.x;
      const dy = moduleCenterY - center.y;
      const newModuleCenterX = center.x + dx * scaleFactor;
      const newModuleCenterY = center.y + dy * scaleFactor;
      
      const newX = newModuleCenterX - size.width / 2;
      const newY = newModuleCenterY - size.height / 2;
      const newScaleValue = Math.max(0.25, Math.min(4.0, module.scale * scaleFactor));
      
      updates.push({ 
        instanceId: module.instanceId, 
        x: Math.round(newX), 
        y: Math.round(newY), 
        scale: newScaleValue 
      });
    });
    
    if (updates.length > 0) {
      const positionUpdates = updates.map(u => ({ 
        instanceId: u.instanceId, 
        x: u.x, 
        y: u.y 
      }));
      updateModulesBatch(positionUpdates);
      
      const state = useMachineStore.getState();
      const updatedModules = state.modules.map(m => {
        const update = updates.find(u => u.instanceId === m.instanceId);
        if (update) {
          return { ...m, scale: update.scale };
        }
        return m;
      });
      useMachineStore.setState({ modules: updatedModules });
      
      setTimeout(() => {
        const updatedModules = useMachineStore.getState().modules;
        if (spatialIndexRef.current) {
          spatialIndexRef.current.rebuild(updatedModules);
        }
      }, 0);
      
      saveToHistory();
    }
  }, [selectedModuleIds, selectedModuleId, updateModulesBatch, saveToHistory]);
  
  // Round 113: Handle validation badge click
  const handleValidationBadgeClick = useCallback((moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onModuleValidationClick) {
      // Get screen position for menu placement
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        onModuleValidationClick(moduleId, { x: e.clientX, y: e.clientY });
      }
    }
  }, [onModuleValidationClick]);
  
  // Round 123: Circuit canvas mouse handlers
  const handleCircuitNodeClick = useCallback((nodeId: string) => {
    selectCircuitNode(nodeId);
  }, [selectCircuitNode]);
  
  const handleCircuitNodeDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    // If clicking on a different node, select it
    if (nodeId !== selectedCircuitNodeId) {
      selectCircuitNode(nodeId);
    }
    
    // Build positions map for dragging
    const positions = new Map<string, { x: number; y: number }>();
    const nodesToDrag = selectedCircuitNodeId === nodeId && selectedCircuitNodeId !== null
      ? circuitNodes.filter(n => n.id === selectedCircuitNodeId)
      : circuitNodes.filter(n => n.id === nodeId);
    
    nodesToDrag.forEach(n => {
      positions.set(n.id, { x: n.position.x, y: n.position.y });
    });
    
    circuitDragStartRef.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodePositions: positions,
    };
  }, [selectedCircuitNodeId, circuitNodes, selectCircuitNode]);
  
  const handleCircuitInputToggle = useCallback((nodeId: string) => {
    toggleCircuitInput(nodeId);
  }, [toggleCircuitInput]);
  
  const handleCircuitWireClick = useCallback((wireId: string) => {
    selectCircuitWire(wireId);
  }, [selectCircuitWire]);
  
  // Round 123: Handle circuit port click for wire drawing
  const handleCircuitPortClick = useCallback((nodeId: string, portIndex: number, isOutput: boolean) => {
    if (isDrawingCircuitWire) {
      // If already drawing a wire, finishing it to an input port
      if (!isOutput) {
        finishCircuitWireDrawing(nodeId, portIndex);
      }
      // If clicking on an output port while drawing, cancel and start new wire
      if (isOutput) {
        cancelCircuitWireDrawing();
        startCircuitWireDrawing(nodeId, portIndex);
      }
    } else {
      // Start wire drawing from the clicked port
      startCircuitWireDrawing(nodeId, portIndex);
    }
  }, [isDrawingCircuitWire, finishCircuitWireDrawing, cancelCircuitWireDrawing, startCircuitWireDrawing]);
  
  // Round 123: Keyboard handler for circuit node deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't interfere with text inputs
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        
        // Delete selected circuit node
        if (selectedCircuitNodeId) {
          e.preventDefault();
          removeCircuitNode(selectedCircuitNodeId);
          return;
        }
        
        // Delete selected circuit wire
        if (selectedCircuitWireId) {
          e.preventDefault();
          removeCircuitWire(selectedCircuitWireId);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCircuitNodeId, selectedCircuitWireId, removeCircuitNode, removeCircuitWire]);
  
  // Round 123: Get port position for circuit wire connections
  const getCircuitPortPosition = useCallback((nodeId: string, portIndex: number, isOutput: boolean): { x: number; y: number } | null => {
    const node = circuitNodes.find(n => n.id === nodeId);
    if (!node) return null;
    
    const size = node.size || (node.type === 'gate' 
      ? CIRCUIT_NODE_SIZES[node.gateType!] 
      : CIRCUIT_NODE_SIZES[node.type] || { width: 60, height: 60 });
    
    if (isOutput) {
      // Output port on right side
      return {
        x: node.position.x + (size?.width || 60),
        y: node.position.y + (size?.height || 60) / 2,
      };
    } else {
      // Input port on left side
      if (portIndex === 0) {
        return {
          x: node.position.x,
          y: node.position.y + (size?.height || 60) / 3,
        };
      } else {
        return {
          x: node.position.x,
          y: node.position.y + (2 * (size?.height || 60)) / 3,
        };
      }
    }
  }, [circuitNodes]);
  
  // Round 123: Get circuit wire start point from wireStart state
  const getCircuitWireStartPoint = useCallback((): { x: number; y: number } | null => {
    if (!circuitWireStart) return null;
    return getCircuitPortPosition(circuitWireStart.nodeId, circuitWireStart.portIndex, true);
  }, [circuitWireStart, getCircuitPortPosition]);
  
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
  
  // Check if module is activated
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
  
  // Round 113: Get validation state for a module
  const getModuleValidationState = useCallback((moduleId: string) => {
    const affected = isModuleAffected(moduleId);
    if (!affected || !validationResult) {
      return { hasError: false, hasWarning: false, errorCode: undefined, errorMessage: undefined };
    }
    
    // Find the error affecting this module
    const error = validationResult.errors.find(e => e.affectedModuleIds.includes(moduleId));
    
    if (error) {
      return {
        hasError: true,
        hasWarning: false,
        errorCode: error.code,
        errorMessage: error.message,
      };
    }
    
    return { hasError: false, hasWarning: false, errorCode: undefined, errorMessage: undefined };
  }, [isModuleAffected, validationResult]);
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[#050810]"
      style={{ cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : isBoxSelecting ? 'crosshair' : 'default' }}
      role="application" data-tutorial="canvas" data-tutorial-action="canvas"
      aria-label="Machine Editor Canvas"
    >
      {/* Alignment Toolbar - Round 117: Accessibility - aria-label for toolbar */}
      <div aria-label="Module alignment and arrangement toolbar" role="toolbar">
        <AlignmentToolbar visible={selectedModuleIds.length >= 2} />
      </div>
      
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
          {/* Energy Pulse Visualizer */}
          <EnergyPulseVisualizer
            connections={connections}
            modules={modules}
            isActive={isActivationActive}
            startTime={activationPulseStartTime || performance.now()}
            pulseSpeed={400}
            pulseColor="#00ffcc"
          />
          
          {/* Connections layer - Round 117: Accessibility - aria-label for connection ports */}
          <g id="connections-layer" aria-label="Energy connection ports and paths">
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
          
          {/* Round 123: Circuit Wires Layer */}
          {/* Render circuit wires behind circuit nodes */}
          <g id="circuit-wires-layer" aria-label="Circuit wire connections" data-circuit-wires-layer>
            {circuitWires.map((wire: CircuitWireType) => {
              const sourcePos = getCircuitPortPosition(wire.sourceNodeId, 0, true);
              const targetPos = getCircuitPortPosition(wire.targetNodeId, wire.targetPort, false);
              
              if (!sourcePos || !targetPos) return null;
              
              return (
                <CircuitWire
                  key={wire.id}
                  wire={wire}
                  startPoint={sourcePos}
                  endPoint={targetPos}
                  isSelected={wire.id === selectedCircuitWireId}
                  onClick={handleCircuitWireClick}
                />
              );
            })}
            
            {/* Circuit Wire Preview */}
            {isDrawingCircuitWire && circuitWirePreviewEnd && getCircuitWireStartPoint() && (
              <WirePreview
                startPoint={getCircuitWireStartPoint()!}
                endPoint={circuitWirePreviewEnd}
                isValid={true}
              />
            )}
          </g>
          
          {/* Modules layer - Round 117: Accessibility - aria-label for modules */}
          <g id="modules-layer" aria-label="Machine modules container">
            {visibleModules.map((module) => {
              const isVisible = (module as any).isVisible !== false;
              if (!isVisible) return null;
              
              const moduleIdx = getModuleIndex(module.instanceId);
              
              memoizer.getCached(
                module.instanceId,
                module.rotation,
                module.scale,
                isModuleSelected(module.instanceId)
              );
              
              // Round 113: Get validation state for this module
              const validationState = getModuleValidationState(module.instanceId);
              
              return (
                <g key={module.instanceId}>
                  <ModuleRenderer
                    module={module}
                    isSelected={isModuleSelected(module.instanceId)}
                    machineState={machineState}
                    onMouseDown={(e) => handleModuleDragStart(module.instanceId, e)}
                    isActivated={isModuleActivated(module.instanceId, moduleIdx)}
                    activationIntensity={isModuleActivated(module.instanceId, moduleIdx) ? 1 : 0}
                  />
                  
                  {/* Round 113: Validation Badge */}
                  {(validationState.hasError || validationState.hasWarning) && (
                    <foreignObject
                      x={module.x + (MODULE_SIZES[module.type]?.width || 80) - 20}
                      y={module.y - 30}
                      width="48"
                      height="48"
                      style={{ pointerEvents: 'none', overflow: 'visible' }}
                    >
                      <div 
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => handleValidationBadgeClick(module.instanceId, e as unknown as React.MouseEvent)}
                      >
                        <ModuleValidationBadge
                          hasError={validationState.hasError}
                          hasWarning={validationState.hasWarning}
                          errorCode={validationState.errorCode}
                          errorMessage={validationState.errorMessage}
                          pulse={validationState.errorCode === 'LOOP_DETECTED'}
                          onClick={() => {
                            // This will be handled by the foreignObject click
                          }}
                        />
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </g>
          
          {/* Round 123: Circuit Nodes Layer */}
          {/* Render circuit nodes (gates, InputNode, OutputNode) on top of regular modules */}
          <g id="circuit-nodes-layer" aria-label="Circuit logic gate nodes" data-circuit-nodes-layer>
            {circuitNodes.map((node: PlacedCircuitNode) => (
              <CanvasCircuitNode
                key={node.id}
                node={node}
                isSelected={node.id === selectedCircuitNodeId}
                onClick={handleCircuitNodeClick}
                onDragStart={handleCircuitNodeDragStart}
                onInputToggle={handleCircuitInputToggle}
                onPortClick={handleCircuitPortClick}
              />
            ))}
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
        
        {/* Selection Handles */}
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
      
      {/* Layers Panel */}
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
      
      {/* D8 Integration: Zoom indicator */}
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
        {spatialIndexRef.current && spatialIndexRef.current.size > 0 && (
          <span className="ml-2 text-[#a855f7]" title="Spatial indexing enabled for O(log n) hit testing">
            🗂
          </span>
        )}
        {isHighPerformance && (
          <span className="ml-2 text-[#00d4ff]" title="High performance mode enabled">
            ⚡
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
      
      {/* Round 123: Circuit node count indicator */}
      {circuitNodes.length > 0 && (
        <div className="absolute bottom-4 right-4 px-3 py-1 rounded bg-[#064e3b] border border-[#22c55e] text-xs text-[#86efac]">
          ⚡ {circuitNodes.length} 电路节点
        </div>
      )}
      
      {/* Enhanced Empty state */}
      {modules.length === 0 && circuitNodes.length === 0 && (
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
