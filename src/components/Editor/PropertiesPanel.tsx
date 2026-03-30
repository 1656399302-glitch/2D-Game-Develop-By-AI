import { useMemo } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { generateAttributes, getRarityColor, getRarityLabel } from '../../utils/attributeGenerator';
import { BASE_MODULES, ModuleInfo } from './ModulePanel';

const MODULE_INFO = Object.fromEntries(
  BASE_MODULES.map((m: ModuleInfo) => [m.type, m])
);

export function PropertiesPanel() {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const selectedModuleId = useMachineStore((state) => state.selectedModuleId);
  const selectedConnectionId = useMachineStore((state) => state.selectedConnectionId);
  const updateModuleRotation = useMachineStore((state) => state.updateModuleRotation);
  const updateModuleScale = useMachineStore((state) => state.updateModuleScale);
  const updateModuleFlip = useMachineStore((state) => state.updateModuleFlip);
  const removeModule = useMachineStore((state) => state.removeModule);
  const removeConnection = useMachineStore((state) => state.removeConnection);
  const clearCanvas = useMachineStore((state) => state.clearCanvas);
  const toggleGrid = useMachineStore((state) => state.toggleGrid);
  const resetViewport = useMachineStore((state) => state.resetViewport);
  const gridEnabled = useMachineStore((state) => state.gridEnabled);
  
  const selectedModule = useMemo(() => {
    return modules.find((m) => m.instanceId === selectedModuleId);
  }, [modules, selectedModuleId]);
  
  const selectedConnection = useMemo(() => {
    return connections.find((c) => c.id === selectedConnectionId);
  }, [connections, selectedConnectionId]);
  
  const attributes = useMemo(() => {
    return generateAttributes(modules, connections);
  }, [modules, connections]);
  
  const moduleInfo = selectedModule ? MODULE_INFO[selectedModule.type] : null;
  
  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedModule) {
      updateModuleScale(selectedModule.instanceId, parseFloat(e.target.value));
    }
  };
  
  return (
    <div className="w-72 bg-[#121826] border-l border-[#1e2a42] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1e2a42]">
        <h2 className="text-sm font-semibold text-[#00d4ff] tracking-wider">
          PROPERTIES
        </h2>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Machine Overview */}
        <div className="p-4 border-b border-[#1e2a42]">
          <h3 className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider mb-3">
            Machine Overview
          </h3>
          
          {/* Generated Attributes */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#4a5568]">Name</span>
                <span 
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ 
                    backgroundColor: `${getRarityColor(attributes.rarity)}20`,
                    color: getRarityColor(attributes.rarity),
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
                    className="text-xs px-2 py-0.5 rounded bg-[#1e2a42] text-[#9ca3af]"
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
          <div className="p-4 border-b border-[#1e2a42]">
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
                  className="w-full h-2 bg-[#1e2a42] rounded-lg appearance-none cursor-pointer mt-1
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
                      className={`text-xs px-2 py-0.5 rounded ${
                        port.type === 'input' 
                          ? 'bg-[#22c55e]/20 text-[#22c55e]' 
                          : 'bg-[#00d4ff]/20 text-[#00d4ff]'
                      }`}
                    >
                      {port.type === 'input' ? 'IN' : 'OUT'}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => updateModuleRotation(selectedModule.instanceId, 90)}
                  className="flex-1 arcane-button-secondary text-xs py-1.5"
                >
                  ↻ Rotate (R)
                </button>
                <button
                  onClick={() => updateModuleFlip(selectedModule.instanceId)}
                  className={`flex-1 text-xs py-1.5 border transition-colors ${
                    selectedModule.flipped
                      ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]'
                      : 'arcane-button-secondary'
                  }`}
                >
                  ⇆ Flip (F)
                </button>
              </div>
              
              <button
                onClick={() => removeModule(selectedModule.instanceId)}
                className="w-full arcane-button-danger text-xs py-1.5"
              >
                🗑 Delete (Del)
              </button>
            </div>
          </div>
        )}
        
        {/* Selected Connection */}
        {selectedConnection && (
          <div className="p-4 border-b border-[#1e2a42]">
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
              onClick={() => removeConnection(selectedConnection.id)}
              className="w-full mt-3 arcane-button-danger text-xs py-1.5"
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
              onClick={toggleGrid}
              className={`w-full arcane-button-secondary text-xs py-2 ${
                gridEnabled ? 'border-[#00d4ff] text-[#00d4ff]' : ''
              }`}
            >
              Grid: {gridEnabled ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={resetViewport}
              className="w-full arcane-button-secondary text-xs py-2"
            >
              Reset View
            </button>
            
            <button
              onClick={clearCanvas}
              className="w-full arcane-button-danger text-xs py-2"
            >
              Clear Canvas
            </button>
          </div>
          
          {/* Keyboard Shortcuts Reference */}
          <div className="mt-4 p-3 bg-[#0a0e17] rounded-lg border border-[#1e2a42]">
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
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-[#1e2a42] text-xs text-[#4a5568]">
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
      <div className="h-1.5 bg-[#1e2a42] rounded mt-1 overflow-hidden">
        <div 
          className="h-full rounded transition-all duration-300"
          style={{ 
            width: `${displayValue}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
