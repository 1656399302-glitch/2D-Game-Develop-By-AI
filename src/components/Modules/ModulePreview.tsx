import React from 'react';
import { ModuleType } from '../../types';
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

interface ModulePreviewProps {
  type: ModuleType;
  isActive?: boolean;
  isCharging?: boolean;
  size?: number;
}

// Simple module preview for recipe cards and discovery toasts
export const ModulePreview: React.FC<ModulePreviewProps> = ({
  type,
  isActive = false,
  isCharging = false,
  size = 60,
}) => {
  const renderModuleSVG = () => {
    const props = {
      isActive,
      isCharging,
    };

    switch (type) {
      case 'core-furnace':
        return <CoreFurnaceSVG {...props} />;
      case 'energy-pipe':
        return <EnergyPipeSVG isActive={isActive} />;
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
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 80 80">
            <rect x="10" y="10" width="60" height="60" rx="8" fill="#333" />
            <text x="40" y="45" textAnchor="middle" fill="#666" fontSize="12">?</text>
          </svg>
        );
    }
  };

  return (
    <div 
      className="module-preview"
      style={{ 
        width: size, 
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* Glow effect for active state */}
        {isActive && (
          <defs>
            <filter id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
        <g filter={isActive ? `url(#glow-${type})` : undefined}>
          {renderModuleSVG()}
        </g>
      </svg>
    </div>
  );
};

export default ModulePreview;
