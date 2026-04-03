/**
 * Canvas Validation Overlay Component
 * 
 * Round 113: Circuit Validation UI Integration
 * 
 * Shows highlighted problem areas on the canvas with visual indicators
 * for modules that have validation issues.
 */

import React, { useCallback, useMemo } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useCircuitValidation } from '../../hooks/useCircuitValidation';

// ============================================================================
// Styles
// ============================================================================

const overlayStyles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 50,
    overflow: 'hidden',
  },
  highlightZone: {
    position: 'absolute',
    borderRadius: '8px',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease',
  },
  isolatedHighlight: {
    border: '2px dashed #e94560',
    backgroundColor: 'rgba(233, 69, 96, 0.05)',
    boxShadow: '0 0 20px rgba(233, 69, 96, 0.2)',
  },
  cycleHighlight: {
    border: '2px solid #ff9800',
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    boxShadow: '0 0 25px rgba(255, 152, 0, 0.3)',
    animation: 'cycle-highlight-pulse 2s ease-in-out infinite',
  },
  unreachableHighlight: {
    border: '2px dashed #ffc107',
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
    boxShadow: '0 0 15px rgba(255, 193, 7, 0.15)',
  },
  connectionHighlight: {
    position: 'absolute',
    backgroundColor: '#ff9800',
    borderRadius: '4px',
    opacity: 0.6,
    boxShadow: '0 0 10px rgba(255, 152, 0, 0.6)',
  },
  label: {
    position: 'absolute',
    top: '-24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '10px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    zIndex: 60,
  },
};

// ============================================================================
// Types
// ============================================================================

interface ModuleHighlightData {
  instanceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'isolated' | 'cycle' | 'unreachable-output' | 'no-input';
  label?: string;
}

// ============================================================================
// Module Size Map
// ============================================================================

const MODULE_SIZES: Record<string, { width: number; height: number }> = {
  'core-furnace': { width: 80, height: 80 },
  'gear': { width: 60, height: 60 },
  'pipe': { width: 40, height: 40 },
  'rune-node': { width: 50, height: 50 },
  'shield-shell': { width: 70, height: 70 },
  'trigger-switch': { width: 50, height: 50 },
  'output-array': { width: 70, height: 50 },
  'inferno-blazing-core': { width: 90, height: 90 },
  'void-arcane-gear': { width: 65, height: 65 },
  'energy-conduit': { width: 30, height: 30 },
  'amplifier-crystal': { width: 55, height: 55 },
  'stabilizer-coil': { width: 60, height: 40 },
  'flux-capacitor': { width: 50, height: 50 },
  'quantum-encoder': { width: 65, height: 65 },
  'arcane-condenser': { width: 55, height: 55 },
  'resonance-chamber': { width: 70, height: 70 },
  'default': { width: 80, height: 80 },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getModuleSize = (type: string): { width: number; height: number } => {
  return MODULE_SIZES[type] || MODULE_SIZES.default;
};

const getHighlightStyle = (type: ModuleHighlightData['type']): React.CSSProperties => {
  switch (type) {
    case 'isolated':
      return overlayStyles.isolatedHighlight;
    case 'cycle':
      return overlayStyles.cycleHighlight;
    case 'unreachable-output':
      return overlayStyles.unreachableHighlight;
    case 'no-input':
      return {
        ...overlayStyles.unreachableHighlight,
        borderColor: '#e94560',
      };
    default:
      return {};
  }
};

const getLabelStyle = (type: ModuleHighlightData['type']): React.CSSProperties => {
  const baseStyle = overlayStyles.label;
  switch (type) {
    case 'isolated':
      return { ...baseStyle, borderColor: '#e94560', color: '#e94560' };
    case 'cycle':
      return { ...baseStyle, borderColor: '#ff9800', color: '#ff9800' };
    case 'unreachable-output':
      return { ...baseStyle, borderColor: '#ffc107', color: '#ffc107' };
    case 'no-input':
      return { ...baseStyle, borderColor: '#e94560', color: '#e94560' };
    default:
      return baseStyle;
  }
};

const getLabelText = (type: ModuleHighlightData['type']): string => {
  switch (type) {
    case 'isolated':
      return '🏝️ 孤立模块';
    case 'cycle':
      return '🔄 循环连接';
    case 'unreachable-output':
      return '❌ 无能量输入';
    case 'no-input':
      return '⚡ 无输入连接';
    default:
      return '';
  }
};

// ============================================================================
// Component Implementation
// ============================================================================

export const CanvasValidationOverlay: React.FC = () => {
  const modules = useMachineStore((state) => state.modules);
  const viewport = useMachineStore((state) => state.viewport);
  const { validationResult, isValid } = useCircuitValidation();

  // Build highlight data for each affected module
  const highlightData = useMemo<ModuleHighlightData[]>(() => {
    if (!validationResult || isValid) {
      return [];
    }

    const highlights: ModuleHighlightData[] = [];

    // Process each error
    for (const error of validationResult.errors) {
      for (const moduleId of error.affectedModuleIds) {
        const module = modules.find((m) => m.instanceId === moduleId);
        if (!module) continue;

        const size = getModuleSize(module.type);
        
        // Determine highlight type based on error code
        let type: ModuleHighlightData['type'];
        switch (error.code) {
          case 'ISLAND_MODULES':
            type = 'isolated';
            break;
          case 'LOOP_DETECTED':
            type = 'cycle';
            break;
          case 'UNREACHABLE_OUTPUT':
            type = 'unreachable-output';
            break;
          case 'CIRCUIT_INCOMPLETE':
            type = 'no-input';
            break;
          default:
            type = 'isolated';
        }

        highlights.push({
          instanceId: moduleId,
          x: module.x,
          y: module.y,
          width: size.width * module.scale,
          height: size.height * module.scale,
          type,
          label: error.code,
        });
      }
    }

    return highlights;
  }, [modules, validationResult, isValid]);

  // Convert canvas coordinates to screen coordinates
  const toScreenCoords = useCallback(
    (x: number, y: number) => ({
      x: x * viewport.zoom + viewport.x,
      y: y * viewport.zoom + viewport.y,
    }),
    [viewport]
  );

  if (highlightData.length === 0) {
    return null;
  }

  return (
    <div style={overlayStyles.container} className="canvas-validation-overlay">
      <style>
        {`
          @keyframes cycle-highlight-pulse {
            0%, 100% { 
              box-shadow: 0 0 15px rgba(255, 152, 0, 0.3);
              border-color: #ff9800;
            }
            50% { 
              box-shadow: 0 0 30px rgba(255, 152, 0, 0.5);
              border-color: #ffb74d;
            }
          }
        `}
      </style>
      
      {highlightData.map((data) => {
        const screenPos = toScreenCoords(data.x, data.y);
        const width = data.width * viewport.zoom;
        const height = data.height * viewport.zoom;
        const style = getHighlightStyle(data.type);
        const labelStyle = getLabelStyle(data.type);
        const labelText = getLabelText(data.type);

        return (
          <div
            key={data.instanceId}
            style={{
              ...overlayStyles.highlightZone,
              ...style,
              left: `${screenPos.x - 4}px`,
              top: `${screenPos.y - 4}px`,
              width: `${width + 8}px`,
              height: `${height + 8}px`,
            }}
            className={`validation-highlight validation-highlight-${data.type}`}
            data-module-id={data.instanceId}
            data-highlight-type={data.type}
          >
            {/* Label */}
            <div style={labelStyle}>
              {labelText}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// Export Default
// ============================================================================

export default CanvasValidationOverlay;
