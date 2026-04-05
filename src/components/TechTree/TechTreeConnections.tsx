/**
 * Tech Tree Connections Component
 * 
 * Renders SVG-based connection lines between tech tree nodes
 * showing prerequisite relationships.
 * 
 * ROUND 136: Initial implementation
 */

import React, { useMemo } from 'react';
import type { TechTreeNodeData } from '../../types/techTree';

interface TechTreeConnectionsProps {
  nodes: TechTreeNodeData[];
  unlockedNodes: Record<string, boolean>;
  // Connection port offsets from node position
  outputXOffset: number;
  outputYOffset: number;
  inputXOffset: number;
  inputYOffset: number;
}

interface ConnectionLine {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isActive: boolean; // Both prerequisite and connected node unlocked
  isSatisfied: boolean; // Prerequisite node unlocked
}

export const TechTreeConnections: React.FC<TechTreeConnectionsProps> = ({
  nodes,
  unlockedNodes,
  outputXOffset,
  outputYOffset,
  inputXOffset,
  inputYOffset,
}) => {
  // Calculate connection lines
  const connections = useMemo((): ConnectionLine[] => {
    const lines: ConnectionLine[] = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    // Node dimensions (same as in TechTreeNode)
    const NODE_WIDTH = 110;
    const NODE_HEIGHT = 90;
    
    for (const node of nodes) {
      for (const prereqId of node.prerequisites) {
        const prereqNode = nodeMap.get(prereqId);
        if (!prereqNode) continue;
        
        // Calculate connection points
        // From: right side of prerequisite node
        const fromX = prereqNode.position.x + NODE_WIDTH + outputXOffset;
        const fromY = prereqNode.position.y + NODE_HEIGHT / 2 + outputYOffset;
        
        // To: left side of current node
        const toX = node.position.x + inputXOffset;
        const toY = node.position.y + NODE_HEIGHT / 2 + inputYOffset;
        
        const prereqUnlocked = unlockedNodes[prereqId] ?? false;
        const nodeUnlocked = unlockedNodes[node.id] ?? false;
        
        lines.push({
          id: `${prereqId}-${node.id}`,
          fromNodeId: prereqId,
          toNodeId: node.id,
          fromX,
          fromY,
          toX,
          toY,
          isActive: prereqUnlocked && nodeUnlocked,
          isSatisfied: prereqUnlocked,
        });
      }
    }
    
    return lines;
  }, [nodes, unlockedNodes, outputXOffset, outputYOffset, inputXOffset, inputYOffset]);
  
  // Render a single connection line with bezier curve
  const renderConnection = (conn: ConnectionLine) => {
    const { id, fromX, fromY, toX, toY, isActive, isSatisfied } = conn;
    
    // Determine line color based on state
    let strokeColor = '#1e2a42'; // Default: dimmed
    let strokeWidth = 2;
    let strokeDasharray = '6,4';
    let opacity = 0.5;
    
    if (isActive) {
      // Both nodes unlocked: bright active connection
      strokeColor = '#22c55e'; // Green
      strokeWidth = 3;
      strokeDasharray = 'none';
      opacity = 1;
    } else if (isSatisfied) {
      // Prerequisite unlocked but current node locked: satisfied but not complete
      strokeColor = '#f59e0b'; // Amber
      strokeWidth = 2;
      strokeDasharray = 'none';
      opacity = 0.8;
    }
    
    // Calculate bezier control points for smooth curve
    const dx = toX - fromX;
    const controlOffset = Math.min(Math.abs(dx) / 2, 60);
    
    const cp1x = fromX + controlOffset;
    const cp1y = fromY;
    const cp2x = toX - controlOffset;
    const cp2y = toY;
    
    const pathD = `M ${fromX} ${fromY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toX} ${toY}`;
    
    return (
      <g key={id} className="tech-tree-connection">
        {/* Glow effect for active connections */}
        {isActive && (
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth + 4}
            opacity={0.2}
            strokeLinecap="round"
          />
        )}
        
        {/* Main line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          opacity={opacity}
          strokeLinecap="round"
          className={isSatisfied && !isActive ? 'connection-pulse' : ''}
        />
        
        {/* Arrow head at destination */}
        <circle
          cx={toX}
          cy={toY}
          r={4}
          fill={strokeColor}
          opacity={opacity}
        />
      </g>
    );
  };
  
  if (connections.length === 0) {
    return null;
  }
  
  return (
    <g className="tech-tree-connections" data-testid="tech-tree-connections">
      <defs>
        {/* Glow filter for active connections */}
        <filter id="connection-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {connections.map(renderConnection)}
      
      <style>{`
        .connection-pulse {
          animation: connection-pulse 2s ease-in-out infinite;
        }
        
        @keyframes connection-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </g>
  );
};

export default TechTreeConnections;
