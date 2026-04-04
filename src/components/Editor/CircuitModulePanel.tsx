/**
 * Circuit Module Panel Component
 * 
 * Round 122: Circuit Canvas Integration
 * 
 * Module panel section for circuit components (gates, InputNode, OutputNode).
 * This is integrated into the main ModulePanel.
 */

import React, { useState, useCallback } from 'react';
import { useCircuitCanvasStore } from '../../store/useCircuitCanvasStore';
import { GateType, CircuitNodeType } from '../../types/circuit';
import { useMachineStore } from '../../store/useMachineStore';

// ============================================================================
// Circuit Component Selector
// ============================================================================

interface CircuitComponentItem {
  id: string;
  type: CircuitNodeType;
  gateType?: GateType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const CIRCUIT_COMPONENTS: CircuitComponentItem[] = [
  {
    id: 'input',
    type: 'input',
    label: '输入节点',
    description: '可切换的输入开关',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="#22c55e" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="#22c55e" />
      </svg>
    ),
    color: '#22c55e',
  },
  {
    id: 'output',
    type: 'output',
    label: '输出节点',
    description: 'LED 输出指示灯',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#fbbf24" strokeWidth="2" />
        <circle cx="12" cy="12" r="6" fill="#fbbf24" opacity="0.6" />
        <circle cx="12" cy="12" r="3" fill="#fbbf24" />
      </svg>
    ),
    color: '#fbbf24',
  },
  {
    id: 'AND',
    type: 'gate',
    gateType: 'AND',
    label: 'AND',
    description: '与门：全部输入为高时输出高',
    icon: (
      <svg width="24" height="20" viewBox="0 0 80 50" fill="none">
        <path
          d="M 5 5 Q 5 5 20 5 L 45 5 Q 60 5 75 15 Q 75 35 60 45 L 45 45 Q 20 45 5 45 Q 5 45 5 5 Z"
          stroke="#00d4ff"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="2" cy="15" r="3" fill="#00d4ff" />
        <circle cx="2" cy="35" r="3" fill="#00d4ff" />
        <circle cx="78" cy="25" r="3" fill="#00d4ff" />
      </svg>
    ),
    color: '#00d4ff',
  },
  {
    id: 'OR',
    type: 'gate',
    gateType: 'OR',
    label: 'OR',
    description: '或门：任一输入为高时输出高',
    icon: (
      <svg width="24" height="20" viewBox="0 0 80 50" fill="none">
        <path
          d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z"
          stroke="#00d4ff"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="2" cy="15" r="3" fill="#00d4ff" />
        <circle cx="2" cy="35" r="3" fill="#00d4ff" />
        <circle cx="78" cy="25" r="3" fill="#00d4ff" />
      </svg>
    ),
    color: '#00d4ff',
  },
  {
    id: 'NOT',
    type: 'gate',
    gateType: 'NOT',
    label: 'NOT',
    description: '非门：反转输入信号',
    icon: (
      <svg width="24" height="18" viewBox="0 0 60 40" fill="none">
        <path
          d="M 5 5 L 45 20 L 5 35 Z"
          stroke="#00d4ff"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="50" cy="20" r="5" stroke="#00d4ff" strokeWidth="2" fill="none" />
        <circle cx="2" cy="20" r="3" fill="#00d4ff" />
        <circle cx="60" cy="20" r="3" fill="#00d4ff" />
      </svg>
    ),
    color: '#00d4ff',
  },
  {
    id: 'NAND',
    type: 'gate',
    gateType: 'NAND',
    label: 'NAND',
    description: '与非门：AND 的反转',
    icon: (
      <svg width="24" height="20" viewBox="0 0 80 50" fill="none">
        <path
          d="M 5 5 Q 5 5 20 5 L 45 5 Q 60 5 75 15 Q 75 35 60 45 L 45 45 Q 20 45 5 45 Q 5 45 5 5 Z"
          stroke="#a855f7"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="78" cy="25" r="5" stroke="#a855f7" strokeWidth="2" fill="none" />
        <circle cx="2" cy="15" r="3" fill="#a855f7" />
        <circle cx="2" cy="35" r="3" fill="#a855f7" />
        <circle cx="78" cy="25" r="3" fill="#a855f7" />
      </svg>
    ),
    color: '#a855f7',
  },
  {
    id: 'NOR',
    type: 'gate',
    gateType: 'NOR',
    label: 'NOR',
    description: '或非门：OR 的反转',
    icon: (
      <svg width="24" height="20" viewBox="0 0 80 50" fill="none">
        <path
          d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z"
          stroke="#a855f7"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="78" cy="25" r="5" stroke="#a855f7" strokeWidth="2" fill="none" />
        <circle cx="2" cy="15" r="3" fill="#a855f7" />
        <circle cx="2" cy="35" r="3" fill="#a855f7" />
        <circle cx="78" cy="25" r="3" fill="#a855f7" />
      </svg>
    ),
    color: '#a855f7',
  },
  {
    id: 'XOR',
    type: 'gate',
    gateType: 'XOR',
    label: 'XOR',
    description: '异或门：输入不同时输出高',
    icon: (
      <svg width="24" height="20" viewBox="0 0 80 50" fill="none">
        <path
          d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z"
          stroke="#f59e0b"
          strokeWidth="2"
          fill="none"
        />
        <path d="M 10 5 Q 18 25 10 45" stroke="#f59e0b" strokeWidth="2" fill="none" />
        <circle cx="2" cy="15" r="3" fill="#f59e0b" />
        <circle cx="2" cy="35" r="3" fill="#f59e0b" />
        <circle cx="78" cy="25" r="3" fill="#f59e0b" />
      </svg>
    ),
    color: '#f59e0b',
  },
  {
    id: 'XNOR',
    type: 'gate',
    gateType: 'XNOR',
    label: 'XNOR',
    description: '同或门：输入相同时输出高',
    icon: (
      <svg width="24" height="20" viewBox="0 0 80 50" fill="none">
        <path
          d="M 15 5 Q 25 25 15 45 Q 35 45 55 45 L 70 45 Q 75 25 70 5 Q 55 5 35 5 Q 15 5 15 5 Z"
          stroke="#f59e0b"
          strokeWidth="2"
          fill="none"
        />
        <path d="M 10 5 Q 18 25 10 45" stroke="#f59e0b" strokeWidth="2" fill="none" />
        <circle cx="78" cy="25" r="5" stroke="#f59e0b" strokeWidth="2" fill="none" />
        <circle cx="2" cy="15" r="3" fill="#f59e0b" />
        <circle cx="2" cy="35" r="3" fill="#f59e0b" />
        <circle cx="78" cy="25" r="3" fill="#f59e0b" />
      </svg>
    ),
    color: '#f59e0b',
  },
];

// ============================================================================
// Component
// ============================================================================

export interface CircuitModulePanelProps {
  /** Whether circuit mode is active */
  isCircuitMode?: boolean;
  /** Callback when circuit mode is toggled */
  onCircuitModeChange?: (enabled: boolean) => void;
}

/**
 * Circuit Module Panel Component
 * Displays circuit components (gates, InputNode, OutputNode) for placement on canvas
 */
export function CircuitModulePanel({
  isCircuitMode = false,
  onCircuitModeChange,
}: CircuitModulePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const addCircuitNode = useCircuitCanvasStore((state) => state.addCircuitNode);
  const setCircuitMode = useCircuitCanvasStore((state) => state.setCircuitMode);
  const viewport = useMachineStore((state) => state.viewport);
  
  // Handle circuit mode toggle
  const handleCircuitModeToggle = useCallback(() => {
    const newMode = !isCircuitMode;
    setCircuitMode(newMode);
    onCircuitModeChange?.(newMode);
  }, [isCircuitMode, setCircuitMode, onCircuitModeChange]);
  
  // Handle circuit component click - add to canvas
  const handleComponentClick = useCallback((item: CircuitComponentItem) => {
    // Calculate center of viewport
    const x = (window.innerWidth / 2 - viewport.x) / viewport.zoom;
    const y = (window.innerHeight / 2 - viewport.y) / viewport.zoom;
    
    // Enable circuit mode
    if (!isCircuitMode) {
      setCircuitMode(true);
      onCircuitModeChange?.(true);
    }
    
    // Add circuit node
    addCircuitNode(item.type, x, y, item.gateType, item.label);
  }, [addCircuitNode, setCircuitMode, isCircuitMode, viewport, onCircuitModeChange]);
  
  return (
    <div
      className="border-t border-[#1e2a42]"
      data-circuit-module-panel
    >
      {/* Circuit Mode Toggle Header */}
      <div className="p-3 border-b border-[#1e2a42] bg-gradient-to-r from-[#1a1a2e] to-[#121826]">
        <button
          onClick={handleCircuitModeToggle}
          className={`
            w-full px-3 py-2 rounded-lg font-medium text-sm 
            transition-all duration-200
            flex items-center justify-between gap-2
            ${isCircuitMode
              ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/50'
              : 'bg-[#1e2a42] text-[#9ca3af] border border-[#2d3a4f] hover:border-[#00d4ff]/50'
            }
          `}
          data-circuit-mode-toggle
        >
          <span className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">⚡</span>
            <span>电路模式</span>
          </span>
          <span className={`text-xs ${isCircuitMode ? 'text-[#22c55e]' : 'text-[#64748b]'}`}>
            {isCircuitMode ? '已开启' : '点击开启'}
          </span>
        </button>
      </div>
      
      {/* Circuit Components List */}
      {isCircuitMode && (
        <div className="p-2">
          {/* Section Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-[#00d4ff] hover:bg-[#1e2a42] rounded transition-colors"
            aria-expanded={isExpanded}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00d4ff]" />
              电路组件
            </span>
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Components Grid */}
          {isExpanded && (
            <div className="grid grid-cols-2 gap-2 mt-2" role="group" aria-label="电路组件">
              {CIRCUIT_COMPONENTS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleComponentClick(item)}
                  className={`
                    circuit-component-btn p-2 rounded-lg border transition-all duration-200
                    hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                    text-left
                  `}
                  style={{
                    borderColor: `${item.color}40`,
                    backgroundColor: `${item.color}10`,
                  }}
                  data-circuit-component={item.id}
                  aria-label={`添加 ${item.label} - ${item.description}`}
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-1" aria-hidden="true">
                    {item.icon}
                  </div>
                  
                  {/* Label */}
                  <div className="text-center">
                    <span
                      className="text-xs font-medium"
                      style={{ color: item.color }}
                    >
                      {item.label}
                    </span>
                  </div>
                  
                  {/* Description (tooltip) */}
                  <p className="text-[9px] text-[#6b7280] mt-1 text-center line-clamp-2">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          )}
          
          {/* Help Text */}
          <p className="text-[10px] text-[#4a5568] text-center mt-3">
            点击组件添加至画布 · Delete 删除选中节点
          </p>
        </div>
      )}
    </div>
  );
}

// Export for direct import
export default CircuitModulePanel;
