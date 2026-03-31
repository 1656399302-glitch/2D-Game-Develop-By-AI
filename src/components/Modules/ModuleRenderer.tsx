import { memo, useRef, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { PlacedModule, Port, MachineState, MODULE_SIZES, MODULE_ACCENT_COLORS } from '../../types';
import { useMachineStore } from '../../store/useMachineStore';

// Import all module SVGs
import { CoreFurnaceSVG } from './CoreFurnace';
import { EnergyPipeSVG } from './EnergyPipe';
import { GearSVG } from './Gear';
import { RuneNodeSVG } from './RuneNode';
import { ShieldShellSVG } from './ShieldShell';
import { TriggerSwitchSVG } from './TriggerSwitch';
import { OutputArraySVG } from './OutputArray';
import { AmplifierCrystalSVG } from './AmplifierCrystal';
import { StabilizerCoreSVG } from './StabilizerCore';
import { VoidSiphonSVG } from './VoidSiphon';
import { PhaseModulatorSVG } from './PhaseModulator';
import { ResonanceChamberSVG } from './ResonanceChamber';
import { FireCrystalSVG } from './FireCrystal';
import { LightningConductorSVG } from './LightningConductor';
// Import faction variant SVGs
import { 
  VoidArcaneGearSVG, 
  InfernoBlazingCoreSVG, 
  StormThunderingPipeSVG, 
  StellarHarmonicCrystalSVG 
} from './FactionVariantModules';

interface ModuleRendererProps {
  module: PlacedModule;
  isSelected: boolean;
  machineState: MachineState;
  onMouseDown: (e: React.MouseEvent) => void;
  /** Whether this module is currently activated during activation sequence */
  isActivated?: boolean;
  /** Glow intensity from 0-1 for activation effect */
  activationIntensity?: number;
}

// Memoized component to prevent unnecessary re-renders
export const ModuleRenderer = memo(function ModuleRenderer({ 
  module, 
  isSelected, 
  machineState, 
  onMouseDown,
  isActivated = false,
  activationIntensity = 0,
}: ModuleRendererProps) {
  const groupRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const startConnection = useMachineStore((state) => state.startConnection);
  const completeConnection = useMachineStore((state) => state.completeConnection);
  
  // Memoize size lookup
  const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
  
  // Memoize accent color lookup
  const getModuleAccentColor = useCallback(() => {
    return MODULE_ACCENT_COLORS[module.type] || '#00d4ff';
  }, [module.type]);
  
  // GSAP animations based on machine state with enhanced activation glow
  useEffect(() => {
    if (!groupRef.current) return;
    
    const ctx = gsap.context(() => {
      // Base glow intensity based on activation
      const baseGlowIntensity = activationIntensity;
      
      if (machineState === 'idle') {
        gsap.to(groupRef.current, {
          filter: 'drop-shadow(0 0 0px transparent)',
          duration: 0.3,
        });
      } else if (machineState === 'charging') {
        // Charging state - pulsing glow based on faction color
        const factionColor = getModuleAccentColor();
        gsap.to(groupRef.current, {
          filter: `drop-shadow(0 0 ${8 + baseGlowIntensity * 8}px ${factionColor})`,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
        });
      } else if (machineState === 'active') {
        // Active state - enhanced glow for activated modules
        const glowAmount = isActivated ? 16 : 8;
        const factionColor = getModuleAccentColor();
        gsap.to(groupRef.current, {
          filter: `drop-shadow(0 0 ${glowAmount + baseGlowIntensity * 8}px ${factionColor})`,
          duration: isActivated ? 0.2 : 0.3,
        });
      } else if (machineState === 'failure') {
        // Failure state - red flickering glow with shake
        gsap.to(groupRef.current, {
          x: '+=5',
          yoyo: true,
          repeat: 5,
          duration: 0.1,
          onComplete: () => {
            gsap.set(groupRef.current, { x: 0, y: 0 });
          },
        });
        gsap.to(groupRef.current, {
          filter: `drop-shadow(0 0 ${12 + baseGlowIntensity * 8}px #ff3355)`,
          duration: 0.2,
          repeat: -1,
          yoyo: true,
        });
      } else if (machineState === 'overload') {
        // Overload state - intense pulsing glow with scale
        gsap.to(groupRef.current, {
          filter: `drop-shadow(0 0 ${20 + baseGlowIntensity * 10}px #ff6b35)`,
          scale: isActivated ? 1.15 : 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: -1,
        });
      } else if (machineState === 'shutdown') {
        // Shutdown state - fading dim glow
        gsap.to(groupRef.current, {
          filter: `drop-shadow(0 0 ${4}px #666)`,
          opacity: 0.5,
          duration: 0.5,
        });
      }
    });
    
    return () => ctx.revert();
  }, [machineState, isActivated, activationIntensity, getModuleAccentColor]);
  
  // Module activation glow effect - burst when module becomes activated
  useEffect(() => {
    if (!glowRef.current) return;
    
    if (isActivated && machineState === 'active') {
      // Trigger burst animation
      const ctx = gsap.context(() => {
        // Reset to initial state
        gsap.set(glowRef.current, {
          attr: { r: 0 },
          opacity: 0.8,
        });
        
        // Animate expansion with ease-out
        gsap.to(glowRef.current, {
          attr: { r: 60 + activationIntensity * 20 },
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
        });
      });
      
      // Clean up after animation
      const timeout = setTimeout(() => {
        if (glowRef.current) {
          gsap.set(glowRef.current, { opacity: 0 });
        }
      }, 450);
      
      return () => {
        ctx.revert();
        clearTimeout(timeout);
      };
    } else {
      // Hide glow immediately
      gsap.set(glowRef.current, { opacity: 0 });
    }
  }, [isActivated, machineState, activationIntensity]);
  
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
  
  // Render module SVG based on type
  const renderModuleSVG = useCallback(() => {
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
      case 'void-siphon':
        return <VoidSiphonSVG {...props} />;
      case 'phase-modulator':
        return <PhaseModulatorSVG {...props} />;
      case 'resonance-chamber':
        return <ResonanceChamberSVG {...props} />;
      case 'fire-crystal':
        return <FireCrystalSVG {...props} />;
      case 'lightning-conductor':
        return <LightningConductorSVG {...props} />;
      // FACTION VARIANT MODULES - Render with faction-specific styling
      case 'void-arcane-gear':
        return <VoidArcaneGearSVG {...props} />;
      case 'inferno-blazing-core':
        return <InfernoBlazingCoreSVG {...props} />;
      case 'storm-thundering-pipe':
        return <StormThunderingPipeSVG {...props} />;
      case 'stellar-harmonic-crystal':
        return <StellarHarmonicCrystalSVG {...props} />;
      default:
        return <rect width={size.width} height={size.height} fill="#333" />;
    }
  }, [module.type, machineState, size]);
  
  // Get port label with index
  const getPortLabel = useCallback((port: Port, index: number) => {
    if (port.type === 'input') {
      const inputCount = module.ports.filter(p => p.type === 'input').length;
      return inputCount > 1 ? `IN${index + 1}` : 'IN';
    } else {
      const outputCount = module.ports.filter(p => p.type === 'output').length;
      return outputCount > 1 ? `OUT${index + 1}` : 'OUT';
    }
  }, [module.ports]);
  
  // Group ports by type
  const inputPorts = module.ports.filter(p => p.type === 'input');
  const outputPorts = module.ports.filter(p => p.type === 'output');
  
  // Calculate center for glow
  const centerX = size.width / 2;
  const centerY = size.height / 2;
  
  // Generate aria-label for accessibility
  const ariaLabel = `模块 ${module.type}, 位置 (${Math.round(module.x)}, ${Math.round(module.y)}), 旋转 ${module.rotation}°`;
  
  // Get glow color based on state
  const getGlowColor = () => {
    if (machineState === 'failure') return '#ff3355';
    if (machineState === 'overload') return '#ff6b35';
    if (machineState === 'active' && isActivated) return '#00ffcc';
    return getModuleAccentColor();
  };
  
  return (
    <g
      ref={groupRef}
      transform={`translate(${module.x}, ${module.y}) rotate(${module.rotation}, ${size.width / 2}, ${size.height / 2})`}
      onMouseDown={onMouseDown}
      style={{ cursor: 'move' }}
      className={`module-group ${isSelected ? 'module-selected' : ''}`}
      role="button"
      aria-label={ariaLabel}
      tabIndex={0}
      data-module-id={module.instanceId}
      data-module-type={module.type}
      data-activated={isActivated}
    >
      {/* Activation glow - radial gradient expanding from module center */}
      <circle
        ref={glowRef}
        cx={centerX}
        cy={centerY}
        r="0"
        fill={getGlowColor()}
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
            role="button"
            aria-label={`输入端口 ${idx + 1}`}
            tabIndex={0}
          >
            {/* Port glow */}
            <circle
              r="10"
              fill="#22c55e20"
              className="transition-all duration-200"
            />
            
            {/* Port circle */}
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
            role="button"
            aria-label={`输出端口 ${idx + 1}`}
            tabIndex={0}
          >
            {/* Port glow */}
            <circle
              r="10"
              fill="#00d4ff20"
              className="transition-all duration-200"
            />
            
            {/* Port circle */}
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
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only re-render if these props change
  return (
    prevProps.module.instanceId === nextProps.module.instanceId &&
    prevProps.module.x === nextProps.module.x &&
    prevProps.module.y === nextProps.module.y &&
    prevProps.module.rotation === nextProps.module.rotation &&
    prevProps.module.scale === nextProps.module.scale &&
    prevProps.module.flipped === nextProps.module.flipped &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.machineState === nextProps.machineState &&
    prevProps.isActivated === nextProps.isActivated &&
    prevProps.activationIntensity === nextProps.activationIntensity
  );
});

export default ModuleRenderer;
