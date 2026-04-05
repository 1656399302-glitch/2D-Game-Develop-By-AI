import { useMemo, useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { generateAttributes, getRarityColor, getRarityLabel } from '../../utils/attributeGenerator';
import { BASE_MODULES, ModuleInfo } from './ModulePanel';

// CSS variable for panel consistency (Round 146)
const PANEL_BORDER_RADIUS = '12px';

const MODULE_INFO = Object.fromEntries(
  BASE_MODULES.map((m: ModuleInfo) => [m.type, m])
);

// Granular selectors for performance optimization (AC1: Re-render Reduction)
const useModules = () => useMachineStore((state) => state.modules);
const useConnections = () => useMachineStore((state) => state.connections);
const useSelectedModuleId = () => useMachineStore((state) => state.selectedModuleId);
const useSelectedConnectionId = () => useMachineStore((state) => state.selectedConnectionId);
const useGridEnabled = () => useMachineStore((state) => state.gridEnabled);

// Action selectors (stable references)
const useActions = () => {
  const updateModuleRotation = useMachineStore((state) => state.updateModuleRotation);
  const updateModuleScale = useMachineStore((state) => state.updateModuleScale);
  const updateModuleFlip = useMachineStore((state) => state.updateModuleFlip);
  const removeModule = useMachineStore((state) => state.removeModule);
  const removeConnection = useMachineStore((state) => state.removeConnection);
  const clearCanvas = useMachineStore((state) => state.clearCanvas);
  const toggleGrid = useMachineStore((state) => state.toggleGrid);
  const resetViewport = useMachineStore((state) => state.resetViewport);
  
  return {
    updateModuleRotation,
    updateModuleScale,
    updateModuleFlip,
    removeModule,
    removeConnection,
    clearCanvas,
    toggleGrid,
    resetViewport,
  };
};

export function PropertiesPanel() {
  // Use granular selectors to prevent unnecessary re-renders (AC1)
  const modules = useModules();
  const connections = useConnections();
  const selectedModuleId = useSelectedModuleId();
  const selectedConnectionId = useSelectedConnectionId();
  const gridEnabled = useGridEnabled();
  const actions = useActions();
  
  // Memoize selected module lookup
  const selectedModule = useMemo(() => {
    return modules.find((m) => m.instanceId === selectedModuleId);
  }, [modules, selectedModuleId]);
  
  // Memoize selected connection lookup
  const selectedConnection = useMemo(() => {
    return connections.find((c) => c.id === selectedConnectionId);
  }, [connections, selectedConnectionId]);
  
  // Memoize attributes generation
  const attributes = useMemo(() => {
    return generateAttributes(modules, connections);
  }, [modules, connections]);
  
  // Memoize module info lookup
  const moduleInfo = useMemo(() => {
    return selectedModule ? MODULE_INFO[selectedModule.type] : null;
  }, [selectedModule]);
  
  // Stable callback for scale change
  const handleScaleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedModule) {
      actions.updateModuleScale(selectedModule.instanceId, parseFloat(e.target.value));
    }
  }, [selectedModule, actions.updateModuleScale]);
  
  // Stable callbacks for module actions
  const handleRotate = useCallback(() => {
    if (selectedModule) {
      actions.updateModuleRotation(selectedModule.instanceId, 90);
    }
  }, [selectedModule, actions.updateModuleRotation]);
  
  const handleFlip = useCallback(() => {
    if (selectedModule) {
      actions.updateModuleFlip(selectedModule.instanceId);
    }
  }, [selectedModule, actions.updateModuleFlip]);
  
  const handleDeleteModule = useCallback(() => {
    if (selectedModule) {
      actions.removeModule(selectedModule.instanceId);
    }
  }, [selectedModule, actions.removeModule]);
  
  const handleDeleteConnection = useCallback(() => {
    if (selectedConnection) {
      actions.removeConnection(selectedConnection.id);
    }
  }, [selectedConnection, actions.removeConnection]);
  
  return (
    <div 
      className="w-72 bg-[#121826] border-l flex flex-col overflow-hidden properties-panel"
      style={{ 
        borderColor: '#1e2a42',
        borderRadius: `0 ${PANEL_BORDER_RADIUS} ${PANEL_BORDER_RADIUS} 0`,
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#1e2a42' }}>
        <h2 className="text-sm font-semibold text-[#00d4ff] tracking-wider">
          PROPERTIES
        </h2>
      </div>
      
      {/* Content */}
      <div 
        className="flex-1 overflow-y-auto"
        // Custom scrollbar styling for consistency (Round 146)
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#1e2a42 #121826',
        }}
      >
        <style>{`
          .properties-panel::-webkit-scrollbar {
            width: 6px;
          }
          .properties-panel::-webkit-scrollbar-track {
            background: #121826;
          }
          .properties-panel::-webkit-scrollbar-thumb {
            background-color: #1e2a42;
            border-radius: 3px;
          }
          .properties-panel::-webkit-scrollbar-thumb:hover {
            background-color: #2d3a56;
          }
        `}</style>
        
        {/* Machine Overview */}
        <div className="p-4 border-b" style={{ borderColor: '#1e2a42' }}>
          <h3 className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider mb-3">
            Machine Overview
          </h3>
          
          {/* Generated Attributes */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#4a5568]">Name</span>
                <span 
                  className="text-xs font-medium px-2 py-0.5"
                  style={{ 
                    backgroundColor: `${getRarityColor(attributes.rarity)}20`,
                    color: getRarityColor(attributes.rarity),
                    borderRadius: '8px',
                  }}
                >
                  {getRarityLabel(attributes.rarity)}
                </span>
              </div>
              <p className="text-sm text-white mt-1">{attributes.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <StatBar label="Stability" value={attributes.stats.stability} color="#22c55e" />
              <StatBar label="Power" value={attributes.stats.powerOutput} color="#f59e0b" />
              <StatBar label="Energy" value={attributes.stats.energyCost} color="#00d4ff" />
              <StatBar label="Failure" value={attributes.stats.failureRate} color="#ef4444" inverse />
            </div>
            
            <div>
              <span className="text-xs text-[#4a5568]">Tags</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {attributes.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-xs px-2 py-0.5"
                    style={{
                      backgroundColor: '#1e2a42',
                      color: '#9ca3af',
                      borderRadius: '8px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-xs text-[#4a5568]">Description</span>
              <p className="text-xs text-[#9ca3af] mt-1 line-clamp-3">
                {attributes.description}
              </p>
            </div>
          </div>
        </div>
        
        {/* Selected Module */}
        {selectedModule && moduleInfo && (
          <div className="p-4 border-b" style={{ borderColor: '#1e2a42' }}>
            <h3 className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider mb-3">
              Selected Module
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[#4a5568]">Type</span>
                <p className="text-sm text-white">{moduleInfo.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#4a5568]">Position X</span>
                  <p className="text-white">{Math.round(selectedModule.x)}</p>
                </div>
                <div>
                  <span className="text-[#4a5568]">Position Y</span>
                  <p className="text-white">{Math.round(selectedModule.y)}</p>
                </div>
              </div>
              
              <div>
                <span className="text-xs text-[#4a5568]">Rotation</span>
                <p className="text-sm text-white">{selectedModule.rotation}°</p>
              </div>
              
              {/* Scale Slider */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#4a5568]">Scale</span>
                  <span className="text-xs text-white">{selectedModule.scale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={selectedModule.scale}
                  onChange={handleScaleChange}
                  className="w-full h-2 bg-[#1e2a42] appearance-none cursor-pointer mt-1
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-[#00d4ff]
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-125
                    [&::-moz-range-thumb]:w-3
                    [&::-moz-range-thumb]:h-3
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-[#00d4ff]
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#4a5568] mt-0.5">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>2.0x</span>
                </div>
              </div>
              
              <div>
                <span className="text-xs text-[#4a5568]">Ports</span>
                <div className="flex gap-2 mt-1">
                  {selectedModule.ports.map((port) => (
                    <span 
                      key={port.id}
                      className={`text-xs px-2 py-0.5 rounded`}
                      style={{
                        backgroundColor: port.type === 'input' 
                          ? 'rgba(34, 197, 94, 0.2)' 
                          : 'rgba(0, 212, 255, 0.2)',
                        color: port.type === 'input' 
                          ? '#22c55e' 
                          : '#00d4ff',
                        borderRadius: '8px',
                      }}
                    >
                      {port.type === 'input' ? 'IN' : 'OUT'}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleRotate}
                  className="flex-1 arcane-button-secondary text-xs py-1.5"
                  style={{ borderRadius: '8px' }}
                >
                  ↻ Rotate (R)
                </button>
                <button
                  onClick={handleFlip}
                  className={`flex-1 text-xs py-1.5 border transition-colors`}
                  style={{
                    borderRadius: '8px',
                    backgroundColor: selectedModule.flipped
                      ? 'rgba(0, 212, 255, 0.2)'
                      : undefined,
                    borderColor: selectedModule.flipped
                      ? '#00d4ff'
                      : undefined,
                    color: selectedModule.flipped
                      ? '#00d4ff'
                      : undefined,
                  }}
                >
                  ⇆ Flip (F)
                </button>
              </div>
              
              <button
                onClick={handleDeleteModule}
                className="w-full arcane-button-danger text-xs py-1.5"
                style={{ borderRadius: '8px' }}
              >
                🗑 Delete (Del)
              </button>
            </div>
          </div>
        )}
        
        {/* Selected Connection */}
        {selectedConnection && (
          <div className="p-4 border-b" style={{ borderColor: '#1e2a42' }}>
            <h3 className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider mb-3">
              Selected Connection
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#4a5568]">From</span>
                <span className="text-white">
                  {modules.find((m) => m.instanceId === selectedConnection.sourceModuleId)?.type || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4a5568]">To</span>
                <span className="text-white">
                  {modules.find((m) => m.instanceId === selectedConnection.targetModuleId)?.type || 'Unknown'}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleDeleteConnection}
              className="w-full mt-3 arcane-button-danger text-xs py-1.5"
              style={{ borderRadius: '8px' }}
            >
              🗑 Delete Connection
            </button>
          </div>
        )}
        
        {/* Canvas Controls */}
        <div className="p-4">
          <h3 className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider mb-3">
            Canvas Controls
          </h3>
          
          <div className="space-y-2">
            <button
              onClick={actions.toggleGrid}
              className={`w-full arcane-button-secondary text-xs py-2`}
              style={{ 
                borderRadius: '8px',
                backgroundColor: gridEnabled ? undefined : undefined,
                borderColor: gridEnabled ? '#00d4ff' : undefined,
                color: gridEnabled ? '#00d4ff' : undefined,
              }}
            >
              Grid: {gridEnabled ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={actions.resetViewport}
              className="w-full arcane-button-secondary text-xs py-2"
              style={{ borderRadius: '8px' }}
            >
              Reset View
            </button>
            
            <button
              onClick={actions.clearCanvas}
              className="w-full arcane-button-danger text-xs py-2"
              style={{ borderRadius: '8px' }}
            >
              Clear Canvas
            </button>
          </div>
          
          {/* Keyboard Shortcuts Reference */}
          <div className="mt-4 p-3 border" style={{ 
            backgroundColor: '#0a0e17',
            borderColor: '#1e2a42',
            borderRadius: '12px',
          }}>
            <p className="text-xs text-[#4a5568] mb-2">Keyboard Shortcuts:</p>
            <div className="space-y-1 text-[10px] text-[#4a5568]">
              <div className="flex justify-between">
                <span>R</span>
                <span className="text-[#9ca3af]">Rotate 90°</span>
              </div>
              <div className="flex justify-between">
                <span>F</span>
                <span className="text-[#9ca3af]">Flip Horizontal</span>
              </div>
              <div className="flex justify-between">
                <span>Del</span>
                <span className="text-[#9ca3af]">Delete</span>
              </div>
              <div className="flex justify-between">
                <span>Esc</span>
                <span className="text-[#9ca3af]">Deselect</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl+D</span>
                <span className="text-[#9ca3af]">Duplicate</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl+Z/Y</span>
                <span className="text-[#9ca3af]">Undo/Redo</span>
              </div>
              <div className="flex justify-between">
                <span>+/-</span>
                <span className="text-[#9ca3af]">Zoom</span>
              </div>
              <div className="flex justify-between">
                <span>0</span>
                <span className="text-[#9ca3af]">Reset Zoom</span>
              </div>
              <div className="flex justify-between">
                <span>Shift+0</span>
                <span className="text-[#9ca3af]">Fit All</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl+R</span>
                <span className="text-[#a855f7]">随机锻造</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t text-xs text-[#4a5568]" style={{ borderColor: '#1e2a42' }}>
        <p>ID: {attributes.codexId}</p>
      </div>
    </div>
  );
}

function StatBar({ 
  label, 
  value, 
  color, 
  inverse = false 
}: { 
  label: string; 
  value: number; 
  color: string;
  inverse?: boolean;
}) {
  const displayValue = inverse ? 100 - value : value;
  
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-[#4a5568]">{label}</span>
        <span style={{ color }}>{displayValue}%</span>
      </div>
      <div className="h-1.5 bg-[#1e2a42] rounded mt-1 overflow-hidden" style={{ borderRadius: '4px' }}>
        <div 
          className="h-full rounded transition-all duration-300"
          style={{ 
            width: `${displayValue}%`,
            backgroundColor: color,
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
}
