/**
 * Circuit Module Panel Component
 * 
 * Round 122: Circuit Canvas Integration
 * Round 128: Added Timer, Counter, SR Latch, D Latch, D Flip-Flop
 * Round 129: Added Custom Sub-Circuit section
 * Round 130: Fixed Custom section to always render (show empty state when no sub-circuits)
 * 
 * Module panel section for circuit components (gates, InputNode, OutputNode).
 * This is integrated into the main ModulePanel.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useCircuitCanvasStore } from '../../store/useCircuitCanvasStore';
import { GateType, CircuitNodeType } from '../../types/circuit';
import { useMachineStore } from '../../store/useMachineStore';
import { useSubCircuitStore } from '../../store/useSubCircuitStore';
import { SubCircuitModule } from '../../types/subCircuit';

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
  // Basic I/O
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
  // Basic gates
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
  // Sequential/Memory elements (Round 128)
  {
    id: 'TIMER',
    type: 'gate',
    gateType: 'TIMER',
    label: 'TIMER',
    description: '定时器：触发后延迟N ticks输出高',
    icon: (
      <svg width="24" height="20" viewBox="0 0 80 70" fill="none">
        <rect x="5" y="5" width="70" height="60" rx="6" stroke="#06b6d4" strokeWidth="2" fill="none" />
        <circle cx="25" cy="30" r="12" stroke="#06b6d4" strokeWidth="2" fill="none" />
        <line x1="25" y1="30" x2="25" y2="22" stroke="#06b6d4" strokeWidth="2" />
        <line x1="25" y1="30" x2="31" y2="30" stroke="#06b6d4" strokeWidth="2" />
        <text x="60" y="28" textAnchor="middle" fill="#06b6d4" fontSize="10" fontFamily="monospace">...</text>
        <circle cx="2" cy="25" r="3" fill="#06b6d4" />
        <circle cx="2" cy="45" r="3" fill="#06b6d4" />
        <circle cx="78" cy="25" r="3" fill="#06b6d4" />
        <circle cx="78" cy="45" r="3" fill="#06b6d4" />
      </svg>
    ),
    color: '#06b6d4',
  },
  {
    id: 'COUNTER',
    type: 'gate',
    gateType: 'COUNTER',
    label: 'COUNTER',
    description: '计数器：可递增/递减，支持溢出',
    icon: (
      <svg width="24" height="20" viewBox="0 0 80 70" fill="none">
        <rect x="5" y="5" width="70" height="60" rx="6" stroke="#ec4899" strokeWidth="2" fill="none" />
        <text x="40" y="30" textAnchor="middle" fill="#ec4899" fontSize="14" fontFamily="monospace">0</text>
        <text x="40" y="50" textAnchor="middle" fill="#ec4899" fontSize="8" fontFamily="monospace">CNT</text>
        <circle cx="2" cy="20" r="3" fill="#ec4899" />
        <circle cx="2" cy="40" r="3" fill="#ec4899" />
        <circle cx="2" cy="55" r="3" fill="#ec4899" />
        <circle cx="78" cy="25" r="3" fill="#ec4899" />
        <circle cx="78" cy="45" r="3" fill="#ec4899" />
      </svg>
    ),
    color: '#ec4899',
  },
  {
    id: 'SR_LATCH',
    type: 'gate',
    gateType: 'SR_LATCH',
    label: 'SR LATCH',
    description: 'SR锁存器：Set/Reset保持状态',
    icon: (
      <svg width="24" height="20" viewBox="0 0 80 70" fill="none">
        <rect x="5" y="5" width="70" height="60" rx="6" stroke="#8b5cf6" strokeWidth="2" fill="none" />
        <text x="40" y="22" textAnchor="middle" fill="#8b5cf6" fontSize="12" fontFamily="monospace">SR</text>
        <text x="20" y="45" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontFamily="monospace">Q:0</text>
        <text x="60" y="45" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontFamily="monospace">Q̅:1</text>
        <circle cx="2" cy="20" r="3" fill="#8b5cf6" />
        <circle cx="2" cy="40" r="3" fill="#8b5cf6" />
        <circle cx="78" cy="25" r="3" fill="#8b5cf6" />
        <circle cx="78" cy="45" r="3" fill="#8b5cf6" />
      </svg>
    ),
    color: '#8b5cf6',
  },
  {
    id: 'D_LATCH',
    type: 'gate',
    gateType: 'D_LATCH',
    label: 'D LATCH',
    description: 'D锁存器：E高时Q=D，E低时保持',
    icon: (
      <svg width="24" height="20" viewBox="0 0 80 70" fill="none">
        <rect x="5" y="5" width="70" height="60" rx="6" stroke="#10b981" strokeWidth="2" fill="none" />
        <text x="40" y="22" textAnchor="middle" fill="#10b981" fontSize="12" fontFamily="monospace">D</text>
        <text x="40" y="35" textAnchor="middle" fill="#10b981" fontSize="8" fontFamily="monospace">E:0</text>
        <text x="20" y="50" textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="monospace">Q:0</text>
        <text x="60" y="50" textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="monospace">Q̅:1</text>
        <circle cx="2" cy="20" r="3" fill="#10b981" />
        <circle cx="2" cy="40" r="3" fill="#10b981" />
        <circle cx="78" cy="25" r="3" fill="#10b981" />
        <circle cx="78" cy="45" r="3" fill="#10b981" />
      </svg>
    ),
    color: '#10b981',
  },
  {
    id: 'D_FLIP_FLOP',
    type: 'gate',
    gateType: 'D_FLIP_FLOP',
    label: 'D-FF',
    description: 'D触发器：时钟上升沿采样D',
    icon: (
      <svg width="24" height="20" viewBox="0 0 80 70" fill="none">
        <rect x="5" y="5" width="70" height="60" rx="6" stroke="#14b8a6" strokeWidth="2" fill="none" />
        <text x="40" y="18" textAnchor="middle" fill="#14b8a6" fontSize="10" fontFamily="monospace">D-FF</text>
        <polygon points="35,22 43,22 39,28" fill="#14b8a6" />
        <text x="20" y="48" textAnchor="middle" fill="#14b8a6" fontSize="10" fontFamily="monospace">Q:0</text>
        <text x="60" y="48" textAnchor="middle" fill="#14b8a6" fontSize="10" fontFamily="monospace">Q̅:1</text>
        <text x="40" y="60" textAnchor="middle" fill="#14b8a6" fontSize="6" fontFamily="monospace">↑</text>
        <circle cx="2" cy="20" r="3" fill="#14b8a6" />
        <circle cx="2" cy="40" r="3" fill="#14b8a6" />
        <circle cx="78" cy="25" r="3" fill="#14b8a6" />
        <circle cx="78" cy="45" r="3" fill="#14b8a6" />
      </svg>
    ),
    color: '#14b8a6',
  },
];

// ============================================================================
// Sub-Circuit Icon Component
// ============================================================================

const SubCircuitIcon: React.FC<{ color?: string }> = ({ color = '#8b5cf6' }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="3" stroke={color} strokeWidth="1.5" fill="none" />
    <line x1="4" y1="7" x2="20" y2="7" stroke={color} strokeWidth="1" opacity="0.8" />
    <line x1="4" y1="12" x2="12" y2="12" stroke={color} strokeWidth="1" opacity="0.8" />
    <line x1="12" y1="12" x2="12" y2="17" stroke={color} strokeWidth="1" opacity="0.8" />
    <line x1="4" y1="17" x2="20" y2="17" stroke={color} strokeWidth="1" opacity="0.8" />
    <rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.2" />
  </svg>
);

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
 * Round 129/130: Also displays custom sub-circuits with empty state support
 */
export function CircuitModulePanel({
  isCircuitMode: _isCircuitModeProp = false,
  onCircuitModeChange,
}: CircuitModulePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCustomExpanded, setIsCustomExpanded] = useState(true);
  
  const addCircuitNode = useCircuitCanvasStore((state) => state.addCircuitNode);
  const setCircuitMode = useCircuitCanvasStore((state) => state.setCircuitMode);
  const isCircuitMode = useCircuitCanvasStore((state) => state.isCircuitMode);
  const viewport = useMachineStore((state) => state.viewport);
  
  // Get sub-circuits from store
  const subCircuits = useSubCircuitStore((state) => state.subCircuits);
  
  // Sort sub-circuits by creation date (newest first)
  const sortedSubCircuits = useMemo(() => {
    return [...subCircuits].sort((a, b) => b.createdAt - a.createdAt);
  }, [subCircuits]);
  
  // Handle circuit mode toggle - use store value for correct state
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
    
    // Enable circuit mode if not already active (use store value)
    if (!isCircuitMode) {
      setCircuitMode(true);
      onCircuitModeChange?.(true);
    }
    
    // Add circuit node
    addCircuitNode(item.type, x, y, item.gateType, item.label);
  }, [addCircuitNode, setCircuitMode, isCircuitMode, viewport, onCircuitModeChange]);
  
  // Handle sub-circuit click - add to canvas
  const handleSubCircuitClick = useCallback((subCircuit: SubCircuitModule) => {
    // Calculate center of viewport
    const x = (window.innerWidth / 2 - viewport.x) / viewport.zoom;
    const y = (window.innerHeight / 2 - viewport.y) / viewport.zoom;
    
    // Enable circuit mode if not already active
    if (!isCircuitMode) {
      setCircuitMode(true);
      onCircuitModeChange?.(true);
    }
    
    // Add sub-circuit as a special node type
    addCircuitNode(
      'gate',
      x,
      y,
      undefined, // No gateType for sub-circuits
      subCircuit.name,
      {
        isSubCircuit: true,
        subCircuitId: subCircuit.id,
        moduleCount: subCircuit.moduleIds.length,
      }
    );
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
          data-circuit-toggle data-circuit-mode-toggle
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
          
          {/* Custom Sub-Circuits Section (Round 129/130) */}
          {/* Fixed: Always render the section, show empty state when no sub-circuits */}
          <div className="mt-4">
            <button
              onClick={() => setIsCustomExpanded(!isCustomExpanded)}
              className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-[#8b5cf6] hover:bg-[#1e2a42] rounded transition-colors"
              aria-expanded={isCustomExpanded}
              data-custom-section-toggle
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                自定义
                <span className="text-[#6b7280]">({sortedSubCircuits.length})</span>
              </span>
              <svg
                className={`w-3 h-3 transition-transform ${isCustomExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCustomExpanded && (
              <div className="mt-2" role="group" aria-label="自定义子电路" data-custom-subcircuits>
                {sortedSubCircuits.length === 0 ? (
                  /* Empty state - Round 130 fix */
                  <div className="text-center py-6 px-3 bg-[#1a1a2e]/30 rounded-lg border border-[#1e2a42]/50" data-empty-state>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#1e2a42] flex items-center justify-center">
                      <SubCircuitIcon color="#6b7280" />
                    </div>
                    <p className="text-xs text-[#6b7280]">暂无自定义子电路</p>
                    <p className="text-[10px] text-[#4a5568] mt-1">在画布上选择多个节点后点击"创建子电路"</p>
                  </div>
                ) : (
                  /* Sub-circuits grid */
                  <div className="grid grid-cols-2 gap-2">
                    {sortedSubCircuits.map((subCircuit) => (
                      <button
                        key={subCircuit.id}
                        onClick={() => handleSubCircuitClick(subCircuit)}
                        className={`
                          circuit-component-btn p-2 rounded-lg border transition-all duration-200
                          hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                          text-left
                        `}
                        style={{
                          borderColor: '#8b5cf640',
                          backgroundColor: '#8b5cf610',
                        }}
                        data-sub-circuit-item={subCircuit.name}
                        data-sub-circuit-id={subCircuit.id}
                        aria-label={`添加子电路 ${subCircuit.name}（包含${subCircuit.moduleIds.length}个模块）`}
                      >
                        {/* Icon */}
                        <div className="flex justify-center mb-1" aria-hidden="true">
                          <SubCircuitIcon color="#8b5cf6" />
                        </div>
                        
                        {/* Name */}
                        <div className="text-center">
                          <span
                            className="text-xs font-medium text-[#8b5cf6]"
                            style={{ color: '#8b5cf6' }}
                          >
                            {subCircuit.name.length > 10 
                              ? `${subCircuit.name.substring(0, 8)}…` 
                              : subCircuit.name}
                          </span>
                        </div>
                        
                        {/* Module count */}
                        <p className="text-[9px] text-[#6b7280] mt-1 text-center">
                          {subCircuit.moduleIds.length} 模块
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
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
