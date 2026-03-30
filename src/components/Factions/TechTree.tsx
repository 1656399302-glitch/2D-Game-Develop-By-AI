/**
 * Tech Tree Component
 * 
 * SVG-based interactive tech tree with 4 visual states:
 * - locked: Greyed out, not available for research
 * - available: Full color, pulsing glow, ready to research
 * - researching: Animated progress ring, timer countdown
 * - completed: Glowing effect, checkmark indicator
 * 
 * Supports click-to-research with queue management (max 3 concurrent).
 */

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { FACTIONS, FactionId, TechTreeTier, TECH_TREE_REQUIREMENTS } from '../../types/factions';
import { useFactionReputationStore } from '../../store/useFactionReputationStore';
import { RESEARCH_DURATION_MS, MAX_RESEARCH_QUEUE, ResearchState } from '../../types/factionReputation';

interface TechTreeProps {
  onClose?: () => void;
}

// Node dimensions and layout
const NODE_WIDTH = 120;
const NODE_HEIGHT = 100;
const GRID_COLS = 4;
const GRID_ROWS = 3;
const PADDING_X = 40;
const PADDING_Y = 40;
const GAP_X = 20;
const GAP_Y = 30;

const SVG_WIDTH = PADDING_X * 2 + GRID_COLS * NODE_WIDTH + (GRID_COLS - 1) * GAP_X;
const SVG_HEIGHT = PADDING_Y * 2 + GRID_ROWS * NODE_HEIGHT + (GRID_ROWS - 1) * GAP_Y + 120; // Extra space for header

// Tier colors
const TIER_COLORS: Record<number, string> = {
  1: '#22c55e', // green
  2: '#3b82f6', // blue
  3: '#f59e0b', // amber
};

// Tech tree node data for this component
interface TechNodeData {
  id: string;
  faction: FactionId;
  tier: TechTreeTier;
  name: string;
  x: number;
  y: number;
}

export const TechTree: React.FC<TechTreeProps> = ({ onClose }) => {
  const reputations = useFactionReputationStore((state) => state.reputations);
  const currentResearch = useFactionReputationStore((state) => state.currentResearch);
  const completedResearch = useFactionReputationStore((state) => state.completedResearch);
  const researchTech = useFactionReputationStore((state) => state.researchTech);
  const getRequiredReputation = useFactionReputationStore((state) => state.getRequiredReputation);
  const completeResearchAction = useFactionReputationStore((state) => state.completeResearch);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [researchProgress, setResearchProgress] = useState<Record<string, number>>({});

  // Calculate research progress for active researches
  useEffect(() => {
    const interval = setInterval(() => {
      const newProgress: Record<string, number> = {};
      for (const techId of Object.keys(currentResearch)) {
        const item = currentResearch[techId];
        const elapsed = Date.now() - item.startedAt;
        const progress = Math.min(100, (elapsed / item.durationMs) * 100);
        newProgress[techId] = progress;
        
        // Auto-complete if research is done
        if (progress >= 100) {
          const nodeConfig = getTechIdConfig(techId);
          if (nodeConfig) {
            completeResearchAction(techId, nodeConfig.faction);
          }
        }
      }
      setResearchProgress(newProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [currentResearch, completeResearchAction]);

  // Get tech node config from techId
  const getTechIdConfig = useCallback((techId: string): { faction: FactionId; tier: number } | null => {
    const parts = techId.split('-tier-');
    if (parts.length !== 2) return null;
    return {
      faction: parts[0] as FactionId,
      tier: parseInt(parts[1], 10),
    };
  }, []);

  // Get all tech nodes with positions
  const techNodes = useMemo((): TechNodeData[] => {
    const nodes: TechNodeData[] = [];
    const factionIds: FactionId[] = ['void', 'inferno', 'storm', 'stellar'];
    
    factionIds.forEach((factionId) => {
      for (let tier = 1; tier <= 3; tier++) {
        const colIndex = tier - 1;
        const rowIndex = factionIds.indexOf(factionId);
        nodes.push({
          id: `${factionId}-tier-${tier}`,
          faction: factionId,
          tier: tier as TechTreeTier,
          name: `${FACTIONS[factionId].name} T${tier}`,
          x: PADDING_X + colIndex * (NODE_WIDTH + GAP_X),
          y: PADDING_Y + rowIndex * (NODE_HEIGHT + GAP_Y),
        });
      }
    });

    return nodes;
  }, []);

  // Get research state for a tech node
  const getResearchState = useCallback((techId: string): ResearchState => {
    // Check if completed
    for (const factionId of Object.keys(completedResearch)) {
      if (completedResearch[factionId]?.includes(techId)) {
        return ResearchState.Completed;
      }
    }
    
    // Check if researching
    if (currentResearch[techId]) {
      return ResearchState.Researching;
    }
    
    // Check if available (has enough reputation)
    const nodeConfig = getTechIdConfig(techId);
    if (nodeConfig) {
      const requiredRep = getRequiredReputation(techId);
      const currentRep = reputations[nodeConfig.faction] || 0;
      if (currentRep >= requiredRep) {
        return ResearchState.Available;
      }
    }
    
    // Default to locked
    return ResearchState.Locked;
  }, [completedResearch, currentResearch, reputations, getRequiredReputation, getTechIdConfig]);

  // Handle click on a tech node
  const handleNodeClick = useCallback((techId: string) => {
    const nodeConfig = getTechIdConfig(techId);
    if (!nodeConfig) return;
    
    const state = getResearchState(techId);
    
    // Only allow clicking on available nodes
    if (state !== ResearchState.Available) {
      if (state === ResearchState.Locked) {
        setErrorMessage('Reputation requirement not met');
        setTimeout(() => setErrorMessage(null), 2000);
      } else if (state === ResearchState.Researching) {
        setErrorMessage('Already researching');
        setTimeout(() => setErrorMessage(null), 2000);
      } else if (state === ResearchState.Completed) {
        setErrorMessage('Already completed');
        setTimeout(() => setErrorMessage(null), 2000);
      }
      return;
    }
    
    const result = researchTech(techId, nodeConfig.faction);
    
    if (result === 'queue_full') {
      setErrorMessage('Research queue is full (max 3)');
      setTimeout(() => setErrorMessage(null), 3000);
    } else if (result !== 'ok') {
      setErrorMessage(`Cannot start research: ${result}`);
      setTimeout(() => setErrorMessage(null), 2000);
    }
  }, [researchTech, getResearchState, getTechIdConfig]);

  // Get queue count
  const queueCount = Object.keys(currentResearch).length;

  // Render connection lines between nodes
  const renderConnections = () => {
    const lines: JSX.Element[] = [];
    const factionIds: FactionId[] = ['void', 'inferno', 'storm', 'stellar'];
    
    factionIds.forEach((factionId) => {
      for (let tier = 1; tier < 3; tier++) {
        const fromNode = techNodes.find(n => n.faction === factionId && n.tier === tier);
        const toNode = techNodes.find(n => n.faction === factionId && n.tier === tier + 1);
        
        if (fromNode && toNode) {
          const fromX = fromNode.x + NODE_WIDTH / 2;
          const fromY = fromNode.y + NODE_HEIGHT;
          const toX = toNode.x + NODE_WIDTH / 2;
          const toY = toNode.y;
          
          const fromState = getResearchState(fromNode.id);
          const isActive = fromState === ResearchState.Completed || fromState === ResearchState.Researching;
          
          lines.push(
            <line
              key={`line-${factionId}-${tier}`}
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke={isActive ? '#7c3aed' : '#1e2a42'}
              strokeWidth={2}
              strokeDasharray={isActive ? 'none' : '4,4'}
            />
          );
        }
      }
    });
    
    return lines;
  };

  // Render a single tech node
  const renderNode = (node: TechNodeData) => {
    const faction = FACTIONS[node.faction];
    const state = getResearchState(node.id);
    const requiredRep = getRequiredReputation(node.id);
    const currentRep = reputations[node.faction] || 0;
    const progress = researchProgress[node.id] || 0;
    
    const tierColor = TIER_COLORS[node.tier] || '#7c3aed';
    
    // State-based styles
    let opacity = 1;
    let cursor = 'pointer';
    let filter = 'none';
    let nodeBg = `${tierColor}15`;
    let borderColor = tierColor;
    let glowColor = 'none';
    
    switch (state) {
      case ResearchState.Locked:
        opacity = 0.4;
        cursor = 'not-allowed';
        nodeBg = '#0a0e17';
        borderColor = '#1e2a42';
        break;
      case ResearchState.Available:
        filter = 'drop-shadow(0 0 8px ' + tierColor + '40)';
        glowColor = tierColor;
        break;
      case ResearchState.Researching:
        filter = 'drop-shadow(0 0 12px ' + tierColor + '60)';
        glowColor = tierColor;
        nodeBg = `${tierColor}20`;
        break;
      case ResearchState.Completed:
        filter = 'drop-shadow(0 0 10px ' + tierColor + '50)';
        glowColor = tierColor;
        nodeBg = `${tierColor}15`;
        break;
    }
    
    // Progress ring parameters
    const ringRadius = NODE_WIDTH / 2 + 8;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringDashoffset = ringCircumference * (1 - progress / 100);
    
    return (
      <g
        key={node.id}
        data-testid={`tech-node-${node.faction}-tier-${node.tier}`}
        data-state={state}
        transform={`translate(${node.x}, ${node.y})`}
        opacity={opacity}
        style={{ cursor }}
        onClick={() => handleNodeClick(node.id)}
      >
        {/* Background glow for available/researching/completed */}
        {(state === ResearchState.Available || state === ResearchState.Completed) && (
          <ellipse
            cx={NODE_WIDTH / 2}
            cy={NODE_HEIGHT / 2}
            rx={NODE_WIDTH / 2 + 10}
            ry={NODE_HEIGHT / 2 + 10}
            fill="none"
            stroke={glowColor}
            strokeWidth={1}
            opacity={state === ResearchState.Completed ? 0.3 : 0.2}
            className={state === ResearchState.Available ? 'pulse-glow' : ''}
          />
        )}
        
        {/* Main node background */}
        <rect
          x={0}
          y={0}
          width={NODE_WIDTH}
          height={NODE_HEIGHT}
          rx={12}
          ry={12}
          fill={nodeBg}
          stroke={borderColor}
          strokeWidth={state === ResearchState.Locked ? 1 : 2}
          filter={filter}
        />
        
        {/* Progress ring (only for researching) */}
        {state === ResearchState.Researching && (
          <circle
            cx={NODE_WIDTH / 2}
            cy={NODE_HEIGHT / 2}
            r={ringRadius}
            fill="none"
            stroke={tierColor}
            strokeWidth={3}
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${NODE_WIDTH / 2} ${NODE_HEIGHT / 2})`}
            className="progress-ring"
          />
        )}
        
        {/* Faction icon */}
        <text
          x={NODE_WIDTH / 2}
          y={28}
          textAnchor="middle"
          fontSize={20}
        >
          {faction.icon}
        </text>
        
        {/* Tier label */}
        <rect
          x={8}
          y={8}
          width={24}
          height={16}
          rx={4}
          fill={`${tierColor}30`}
        />
        <text
          x={20}
          y={20}
          textAnchor="middle"
          fontSize={10}
          fontWeight="bold"
          fill={tierColor}
        >
          T{node.tier}
        </text>
        
        {/* Node name */}
        <text
          x={NODE_WIDTH / 2}
          y={52}
          textAnchor="middle"
          fontSize={11}
          fontWeight="bold"
          fill={state === ResearchState.Locked ? '#6b7280' : '#ffffff'}
        >
          {node.name}
        </text>
        
        {/* Reputation requirement */}
        {state === ResearchState.Locked && (
          <text
            x={NODE_WIDTH / 2}
            y={72}
            textAnchor="middle"
            fontSize={9}
            fill="#6b7280"
          >
            {currentRep}/{requiredRep} Rep
          </text>
        )}
        
        {/* Progress percentage for researching */}
        {state === ResearchState.Researching && (
          <text
            x={NODE_WIDTH / 2}
            y={72}
            textAnchor="middle"
            fontSize={10}
            fontWeight="bold"
            fill={tierColor}
          >
            {Math.round(progress)}%
          </text>
        )}
        
        {/* Status indicator */}
        {state === ResearchState.Completed && (
          <>
            <circle
              cx={NODE_WIDTH - 16}
              cy={16}
              r={8}
              fill={tierColor}
            />
            <path
              d={`M${NODE_WIDTH - 20} ${16} L${NODE_WIDTH - 17} ${19} L${NODE_WIDTH - 12} ${13}`}
              stroke="white"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        
        {state === ResearchState.Researching && (
          <g transform={`translate(${NODE_WIDTH - 16}, ${16})`}>
            {/* Animated spinner */}
            <circle
              r={6}
              fill="none"
              stroke={tierColor}
              strokeWidth={2}
              strokeDasharray="20 10"
              className="spin-animation"
            />
          </g>
        )}
        
        {/* Available state pulse animation */}
        {state === ResearchState.Available && (
          <rect
            x={0}
            y={0}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            rx={12}
            ry={12}
            fill="none"
            stroke={tierColor}
            strokeWidth={2}
            className="node-pulse"
          />
        )}
      </g>
    );
  };

  return (
    <div
      className="
        fixed inset-0 z-[1050] flex items-center justify-center
        bg-black/80 backdrop-blur-sm
        overflow-y-auto
      "
      onClick={onClose}
    >
      <div
        className="
          relative w-full max-w-[900px] mx-4 my-8
          bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17]
          rounded-2xl border border-[#7c3aed]/30
          shadow-2xl shadow-purple-900/20
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a78bfa] via-[#7c3aed] to-[#a78bfa]" />

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center text-xl">
                🌳
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">科技树</h2>
                <p className="text-sm text-[#9ca3af]">
                  派系研究解锁进度
                </p>
              </div>
            </div>

            {/* Queue indicator */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e2a42]/50">
                <span className="text-sm text-[#9ca3af]">研究队列:</span>
                <span className="text-sm font-bold text-white">
                  {queueCount}/{MAX_RESEARCH_QUEUE}
                </span>
                {[...Array(MAX_RESEARCH_QUEUE)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i < queueCount ? 'bg-[#7c3aed] animate-pulse' : 'bg-[#1e2a42]'
                    }`}
                  />
                ))}
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#6b7280] hover:text-white"
                  aria-label="关闭"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 5l10 10M15 5l-10 10" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Error message display */}
          {errorMessage && (
            <div className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm animate-shake">
              {errorMessage}
            </div>
          )}
        </div>

        {/* SVG Tech Tree */}
        <div className="px-6 pb-6">
          <svg
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="tech-tree-svg"
          >
            {/* Background grid pattern */}
            <defs>
              <pattern id="tech-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e2a42" strokeWidth="0.5" />
              </pattern>
              
              {/* Glow filter for nodes */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* Pulse animation */}
              <style>
                {`
                  @keyframes pulse-glow {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                  }
                  .pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                    transform-origin: center;
                  }
                  
                  @keyframes node-pulse {
                    0%, 100% { stroke-opacity: 1; stroke-width: 2; }
                    50% { stroke-opacity: 0.5; stroke-width: 3; }
                  }
                  .node-pulse {
                    animation: node-pulse 1.5s ease-in-out infinite;
                  }
                  
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  .spin-animation {
                    animation: spin 1s linear infinite;
                    transform-origin: center;
                  }
                  
                  @keyframes progress-ring {
                    0% { stroke-dashoffset: ${2 * Math.PI * (NODE_WIDTH / 2 + 8)}; }
                  }
                  .progress-ring {
                    animation: progress-ring ${RESEARCH_DURATION_MS}ms linear forwards;
                  }
                  
                  @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                  }
                  .animate-shake {
                    animation: shake 0.3s ease-in-out;
                  }
                `}
              </style>
            </defs>
            
            {/* Grid background */}
            <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#tech-grid)" opacity="0.3" />
            
            {/* Connection lines */}
            {renderConnections()}
            
            {/* Tech nodes */}
            {techNodes.map(renderNode)}
          </svg>
          
          {/* Legend */}
          <div className="mt-6 p-4 rounded-xl bg-[#0a0e17]/50 border border-[#1e2a42]">
            <h4 className="text-sm font-medium text-[#9ca3af] mb-3">节点状态</h4>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded tech-tree-node--locked bg-[#1e2a42] opacity-40" />
                <span className="text-xs text-[#6b7280]">未解锁 (Locked)</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border-2 border-[#22c55e]" 
                  style={{ backgroundColor: '#22c55e20', boxShadow: '0 0 8px #22c55e40' }}
                />
                <span className="text-xs text-[#6b7280]">可研究 (Available)</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border-2 border-[#3b82f6]" 
                  style={{ backgroundColor: '#3b82f620' }}
                >
                  <svg className="spin-animation" viewBox="0 0 24 24">
                    <circle r="8" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="20 10" />
                  </svg>
                </div>
                <span className="text-xs text-[#6b7280]">研究进行中 (Researching)</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border-2 border-[#f59e0b] bg-[#f59e0b15]" 
                  style={{ boxShadow: '0 0 10px #f59e0b50' }}
                />
                <span className="text-xs text-[#6b7280]">已完成 (Completed)</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1e2a42]">
              <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                <span>T1: {TECH_TREE_REQUIREMENTS[1]} Rep</span>
                <span>T2: {TECH_TREE_REQUIREMENTS[2]} Rep</span>
                <span>T3: {TECH_TREE_REQUIREMENTS[3]} Rep</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechTree;
