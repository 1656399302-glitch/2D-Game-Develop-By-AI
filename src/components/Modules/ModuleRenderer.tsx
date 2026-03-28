import { useRef, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { PlacedModule, Port, MachineState } from '../../types';
import { useMachineStore } from '../../store/useMachineStore';
import { CoreFurnaceSVG } from './CoreFurnace';
import { EnergyPipeSVG } from './EnergyPipe';
import { GearSVG } from './Gear';
import { RuneNodeSVG } from './RuneNode';
import { ShieldShellSVG } from './ShieldShell';
import { TriggerSwitchSVG } from './TriggerSwitch';

interface ModuleRendererProps {
  module: PlacedModule;
  isSelected: boolean;
  machineState: MachineState;
  onMouseDown: (e: React.MouseEvent) => void;
}

const MODULE_SIZES: Record<string, { width: number; height: number }> = {
  'core-furnace': { width: 100, height: 100 },
  'energy-pipe': { width: 120, height: 50 },
  'gear': { width: 80, height: 80 },
  'rune-node': { width: 80, height: 80 },
  'shield-shell': { width: 100, height: 60 },
  'trigger-switch': { width: 60, height: 100 },
};

export function ModuleRenderer({ module, isSelected, machineState, onMouseDown }: ModuleRendererProps) {
  const groupRef = useRef<SVGGElement>(null);
  const startConnection = useMachineStore((state) => state.startConnection);
  const completeConnection = useMachineStore((state) => state.completeConnection);
  
  const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
  
  // GSAP animations based on machine state
  useEffect(() => {
    if (!groupRef.current) return;
    
    const ctx = gsap.context(() => {
      if (machineState === 'idle') {
        gsap.to(groupRef.current, {
          filter: 'drop-shadow(0 0 0px transparent)',
          duration: 0.3,
        });
      } else if (machineState === 'charging') {
        gsap.to(groupRef.current, {
          filter: 'drop-shadow(0 0 8px #00d4ff)',
          duration: 0.5,
          repeat: -1,
          yoyo: true,
        });
      } else if (machineState === 'active') {
        gsap.to(groupRef.current, {
          filter: 'drop-shadow(0 0 12px #00ffcc)',
          duration: 0.3,
        });
      } else if (machineState === 'failure') {
        gsap.to(groupRef.current, {
          x: '+=5',
          yoyo: true,
          repeat: 5,
          duration: 0.1,
          onComplete: () => {
            gsap.set(groupRef.current, { x: 0, y: 0 });
          },
        });
      } else if (machineState === 'overload') {
        gsap.to(groupRef.current, {
          filter: 'drop-shadow(0 0 20px #ff3355)',
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: -1,
        });
      } else if (machineState === 'shutdown') {
        gsap.to(groupRef.current, {
          filter: 'drop-shadow(0 0 0px #666)',
          opacity: 0.5,
          duration: 0.5,
        });
      }
    });
    
    return () => ctx.revert();
  }, [machineState]);
  
  const handlePortMouseDown = useCallback((port: Port, e: React.MouseEvent) => {
    e.stopPropagation();
    if (port.type === 'output') {
      startConnection(module.instanceId, port.id);
    }
  }, [module.instanceId, startConnection]);
  
  const handlePortMouseUp = useCallback((port: Port, e: React.MouseEvent) => {
    e.stopPropagation();
    if (port.type === 'input') {
      completeConnection(module.instanceId, port.id);
    }
  }, [module.instanceId, completeConnection]);
  
  const renderModuleSVG = () => {
    const props = {
      isActive: machineState !== 'idle',
      isCharging: machineState === 'charging',
    };
    
    switch (module.type) {
      case 'core-furnace':
        return <CoreFurnaceSVG {...props} />;
      case 'energy-pipe':
        return <EnergyPipeSVG isActive={props.isActive} />;
      case 'gear':
        return <GearSVG {...props} />;
      case 'rune-node':
        return <RuneNodeSVG {...props} />;
      case 'shield-shell':
        return <ShieldShellSVG {...props} />;
      case 'trigger-switch':
        return <TriggerSwitchSVG {...props} />;
      default:
        return <rect width={size.width} height={size.height} fill="#333" />;
    }
  };
  
  return (
    <g
      ref={groupRef}
      transform={`translate(${module.x}, ${module.y}) rotate(${module.rotation}, ${size.width / 2}, ${size.height / 2})`}
      onMouseDown={onMouseDown}
      style={{ cursor: 'move' }}
      className={`module-group ${isSelected ? 'module-selected' : ''}`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <rect
          x="-4"
          y="-4"
          width={size.width + 8}
          height={size.height + 8}
          fill="none"
          stroke="#00d4ff"
          strokeWidth="2"
          strokeDasharray="4,2"
          rx="4"
          className="animate-pulse"
        />
      )}
      
      {/* Module SVG content */}
      {renderModuleSVG()}
      
      {/* Ports */}
      {module.ports.map((port) => {
        const localPos = {
          x: port.position.x,
          y: port.position.y,
        };
        
        return (
          <g
            key={port.id}
            transform={`translate(${localPos.x}, ${localPos.y})`}
            onMouseDown={(e) => handlePortMouseDown(port, e)}
            onMouseUp={(e) => handlePortMouseUp(port, e)}
            style={{ cursor: 'crosshair' }}
            className="port-group"
          >
            {/* Port glow */}
            <circle
              r="10"
              fill={port.type === 'input' ? '#22c55e20' : '#00d4ff20'}
              className="transition-all duration-200"
            />
            
            {/* Port circle */}
            <circle
              r="6"
              fill={port.type === 'input' ? '#22c55e' : '#00d4ff'}
              stroke="#fff"
              strokeWidth="1"
              className="transition-all duration-200"
            />
            
            {/* Port inner dot */}
            <circle
              r="2"
              fill="#fff"
              className="transition-all duration-200"
            />
            
            {/* Port label */}
            <text
              y="-12"
              textAnchor="middle"
              fill={port.type === 'input' ? '#22c55e' : '#00d4ff'}
              fontSize="8"
              fontWeight="bold"
            >
              {port.type === 'input' ? 'IN' : 'OUT'}
            </text>
          </g>
        );
      })}
    </g>
  );
}
