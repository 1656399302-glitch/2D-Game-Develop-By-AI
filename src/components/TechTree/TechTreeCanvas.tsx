/**
 * Tech Tree Canvas Component
 * 
 * Main tech tree visualization component with SVG-based rendering
 * of nodes and connection lines.
 * 
 * ROUND 136: Initial implementation
 */

import React, { useMemo } from 'react';
import { TechTreeNode } from './TechTreeNode';
import { TechTreeConnections } from './TechTreeConnections';
import { useTechTreeStore } from '../../store/useTechTreeStore';
import type { TechTreeCategory } from '../../types/techTree';
import { TECH_TREE_CATEGORIES } from '../../types/techTree';

interface TechTreeCanvasProps {
  onNodeClick?: (nodeId: string) => void;
}

export const TechTreeCanvas: React.FC<TechTreeCanvasProps> = ({ onNodeClick }) => {
  const nodes = useTechTreeStore((state) => state.nodes);
  const unlockedNodes = useTechTreeStore((state) => state.unlockedNodes);
  const selectedNodeId = useTechTreeStore((state) => state.selectedNodeId);
  const selectNode = useTechTreeStore((state) => state.selectNode);
  const canUnlock = useTechTreeStore((state) => state.canUnlock);
  
  // Node dimensions (same as in TechTreeNode)
  const NODE_WIDTH = 110;
  const NODE_HEIGHT = 90;
  
  // Connection port offsets
  // Output: right side of node
  const OUTPUT_X_OFFSET = 0;
  const OUTPUT_Y_OFFSET = NODE_HEIGHT / 2 - NODE_HEIGHT / 2; // Center
  
  // Input: left side of node  
  const INPUT_X_OFFSET = 0;
  const INPUT_Y_OFFSET = NODE_HEIGHT / 2 - NODE_HEIGHT / 2; // Center
  
  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    selectNode(nodeId);
    onNodeClick?.(nodeId);
  };
  
  // Group nodes by category for rendering order (basic first, then advanced, then special)
  const categoryOrder: TechTreeCategory[] = ['basic-gates', 'advanced-gates', 'special-components'];
  
  const nodesByCategory = useMemo(() => {
    const grouped: Record<string, typeof nodes> = {};
    for (const cat of categoryOrder) {
      grouped[cat] = nodes.filter(n => n.category === cat);
    }
    return grouped;
  }, [nodes]);
  
  // Calculate SVG dimensions based on node positions
  const svgDimensions = useMemo(() => {
    let maxX = 0;
    let maxY = 0;
    
    for (const node of nodes) {
      const nodeEndX = node.position.x + NODE_WIDTH;
      const nodeEndY = node.position.y + NODE_HEIGHT;
      maxX = Math.max(maxX, nodeEndX);
      maxY = Math.max(maxY, nodeEndY);
    }
    
    // Add padding
    return {
      width: maxX + 50,
      height: maxY + 50,
    };
  }, [nodes]);
  
  return (
    <svg
      className="tech-tree-canvas"
      data-testid="tech-tree-canvas"
      width={svgDimensions.width}
      height={svgDimensions.height}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <defs>
        {/* Grid pattern */}
        <pattern id="tech-tree-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e2a42" strokeWidth="0.5" />
        </pattern>
        
        {/* Category gradients */}
        {Object.entries(TECH_TREE_CATEGORIES).map(([cat, info]) => (
          <linearGradient key={cat} id={`gradient-${cat}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={info.color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={info.color} stopOpacity="0.05" />
          </linearGradient>
        ))}
      </defs>
      
      {/* Background grid */}
      <rect
        width={svgDimensions.width}
        height={svgDimensions.height}
        fill="url(#tech-tree-grid)"
        opacity="0.3"
      />
      
      {/* Category zone backgrounds */}
      {Object.entries(nodesByCategory).map(([cat, catNodes]) => {
        if (catNodes.length === 0) return null;
        const catInfo = TECH_TREE_CATEGORIES[cat as TechTreeCategory];
        
        // Calculate bounding box for category
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const node of catNodes) {
          minX = Math.min(minX, node.position.x);
          minY = Math.min(minY, node.position.y);
          maxX = Math.max(maxX, node.position.x + NODE_WIDTH);
          maxY = Math.max(maxY, node.position.y + NODE_HEIGHT);
        }
        
        const padding = 15;
        
        return (
          <g key={cat} className="tech-tree-category-zone">
            {/* Category zone background */}
            <rect
              x={minX - padding}
              y={minY - padding - 25}
              width={maxX - minX + padding * 2}
              height={maxY - minY + padding * 2 + 25}
              rx={8}
              fill={`url(#gradient-${cat})`}
              stroke={catInfo.color}
              strokeWidth={1}
              strokeOpacity={0.3}
              opacity={0.5}
            />
            
            {/* Category label */}
            <text
              x={minX}
              y={minY - 8}
              fontSize={12}
              fontWeight="bold"
              fill={catInfo.color}
            >
              {catInfo.nameCn} · {catInfo.name}
            </text>
          </g>
        );
      })}
      
      {/* Render connections first (so they appear behind nodes) */}
      <TechTreeConnections
        nodes={nodes}
        unlockedNodes={unlockedNodes}
        outputXOffset={OUTPUT_X_OFFSET}
        outputYOffset={OUTPUT_Y_OFFSET}
        inputXOffset={INPUT_X_OFFSET}
        inputYOffset={INPUT_Y_OFFSET}
      />
      
      {/* Render nodes */}
      {nodes.map((node) => {
        const isUnlocked = unlockedNodes[node.id] ?? false;
        const nodeCanUnlock = canUnlock(node.id);
        
        // Calculate absolute connection positions
        const outputX = node.position.x + NODE_WIDTH + OUTPUT_X_OFFSET;
        const outputY = node.position.y + NODE_HEIGHT / 2 + OUTPUT_Y_OFFSET;
        const inputX = node.position.x + INPUT_X_OFFSET;
        const inputY = node.position.y + NODE_HEIGHT / 2 + INPUT_Y_OFFSET;
        
        return (
          <TechTreeNode
            key={node.id}
            node={node}
            isUnlocked={isUnlocked}
            canUnlock={nodeCanUnlock}
            isSelected={selectedNodeId === node.id}
            onClick={handleNodeClick}
            outputX={outputX}
            outputY={outputY}
            inputX={inputX}
            inputY={inputY}
          />
        );
      })}
    </svg>
  );
};

export default TechTreeCanvas;
