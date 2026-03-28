import { useRef, useCallback, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { PlacedModule, Port, MachineState, MODULE_SIZES } from '../../types';
import { useMachineStore } from '../../store/useMachineStore';
import { CoreFurnaceSVG } from './CoreFurnace';
import { EnergyPipeSVG } from './EnergyPipe';
import { GearSVG } from './Gear';
import { RuneNodeSVG } from './RuneNode';
import { ShieldShellSVG } from './ShieldShell';
import { TriggerSwitchSVG } from './TriggerSwitch';
import { OutputArraySVG } from './OutputArray';
import { AmplifierCrystalSVG } from './AmplifierCrystal';
import { StabilizerCoreSVG } from './StabilizerCore';

interface ModuleRendererProps {
  module: PlacedModule;
  isSelected: boolean;
  machineState: MachineState;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ModuleRenderer({ module, isSelected, machineState, onMouseDown }: ModuleRendererProps) {
  const groupRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const startConnection = useMachineStore((state) => state.startConnection);
  const completeConnection = useMachineStore((state) => state.completeConnection);
  
  // Track activation glow state
  const [showActivationGlow, setShowActivationGlow] = useState(false);
  
  const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
  
  // Module accent colors based on type
  const getModuleAccentColor = () => {
    switch (module.type) {
      case 'core-furnace':
        return '#ff6b35';
      case 'energy-pipe':
        return '#00d4ff';
      case 'gear':
        return '#ffd700';
      case 'rune-node':
        return '#a855f7';
      case 'shield-shell':
        return '#22c55e';
      case 'trigger-switch':
        return '#ff3355';
      case 'output-array':
        return '#00ffcc';
      case 'amplifier-crystal':
        return '#9333ea';
      case 'stabilizer-core':
        return '#22c55e';
      default:
        return '#00d4ff';
    }
  };
  
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
  
  // Module activation glow effect
  useEffect(() => {
    if (!glowRef.current) return;
    
    if (showActivationGlow) {
      // Animate glow expansion
      const ctx = gsap.context(() => {
        // Reset to initial state
        gsap.set(glowRef.current, {
          attr: { r: 0 },
          opacity: 0.8,
        });
        
        // Animate expansion with ease-out
        gsap.to(glowRef.current, {
          attr: { r: 60 },
          opacity: 0,
          duration: 0.3, // 300ms
          ease: 'power2.out',
        });
      });
      
      // Clean up after animation
      const timeout = setTimeout(() => {
        setShowActivationGlow(false);
      }, 350); // 300ms + 50ms tolerance
      
      return () => {
        ctx.revert();
        clearTimeout(timeout);
      };
    } else {
      // Hide glow immediately
      gsap.set(glowRef.current, { opacity: 0 });
    }
  }, [showActivationGlow]);
  
  // Handle port mouse down
  const handlePortMouseDown = useCallback((port: Port, e: React.MouseEvent) => {
    e.stopPropagation();
    if (port.type === 'output') {
      startConnection(module.instanceId, port.id);
    }
  }, [module.instanceId, startConnection]);
  
  // Handle port mouse up
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
      case 'output-array':
        return <OutputArraySVG {...props} />;
      case 'amplifier-crystal':
        return <AmplifierCrystalSVG {...props} />;
      case 'stabilizer-core':
        return <StabilizerCoreSVG {...props} />;
      default:
        return <rect width={size.width} height={size.height} fill="#333" />;
    }
  };
  
  // Get port label with index for multi-port modules
  const getPortLabel = (port: Port, index: number) => {
    if (port.type === 'input') {
      const inputCount = module.ports.filter(p => p.type === 'input').length;
      return inputCount > 1 ? `IN${index + 1}` : 'IN';
    } else {
      const outputCount = module.ports.filter(p => p.type === 'output').length;
      return outputCount > 1 ? `OUT${index + 1}` : 'OUT';
    }
  };
  
  // Group ports by type for proper labeling
  const inputPorts = module.ports.filter(p => p.type === 'input');
  const outputPorts = module.ports.filter(p => p.type === 'output');
  
  // Calculate center for glow
  const centerX = size.width / 2;
  const centerY = size.height / 2;
  
  return (
    <g
      ref={groupRef}
      transform={`translate(${module.x}, ${module.y}) rotate(${module.rotation}, ${size.width / 2}, ${size.height / 2})`}
      onMouseDown={onMouseDown}
      style={{ cursor: 'move' }}
      className={`module-group ${isSelected ? 'module-selected' : ''}`}
    >
      {/* Activation glow - radial gradient expanding from module center */}
      <circle
        ref={glowRef}
        cx={centerX}
        cy={centerY}
        r="0"
        fill={getModuleAccentColor()}
        opacity="0"
        filter="url(#glow)"
        style={{ pointerEvents: 'none' }}
      />
      
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
      
      {/* Input Ports */}
      {inputPorts.map((port, idx) => {
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
              fill="#22c55e20"
              className="transition-all duration-200"
            />
            
            {/* Port circle - increased radius for visibility (6px default, 8px hover) */}
            <circle
              r="6"
              fill="#22c55e"
              stroke="#fff"
              strokeWidth="1"
              className="transition-all duration-200 hover:opacity-90"
            />
            
            {/* Port inner dot */}
            <circle
              r="2"
              fill="#fff"
              className="transition-all duration-200"
            />
            
            {/* Port label */}
            <text
              y="-14"
              textAnchor="middle"
              fill="#22c55e"
              fontSize="8"
              fontWeight="bold"
            >
              {getPortLabel(port, idx)}
            </text>
          </g>
        );
      })}
      
      {/* Output Ports */}
      {outputPorts.map((port, idx) => {
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
              fill="#00d4ff20"
              className="transition-all duration-200"
            />
            
            {/* Port circle - increased radius for visibility (6px default, 8px hover) */}
            <circle
              r="6"
              fill="#00d4ff"
              stroke="#fff"
              strokeWidth="1"
              className="transition-all duration-200 hover:opacity-90"
            />
            
            {/* Port inner dot */}
            <circle
              r="2"
              fill="#fff"
              className="transition-all duration-200"
            />
            
            {/* Port label */}
            <text
              y="-14"
              textAnchor="middle"
              fill="#00d4ff"
              fontSize="8"
              fontWeight="bold"
            >
              {getPortLabel(port, idx)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
