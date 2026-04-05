/**
 * Tech Tree Node Component
 * 
 * Displays an individual tech tree node with locked/unlocked state,
 * prerequisite indicators, and click handling.
 * 
 * ROUND 136: Initial implementation
 */

import React from 'react';
import type { TechTreeNodeData } from '../../types/techTree';
import { TECH_TREE_CATEGORIES } from '../../types/techTree';

interface TechTreeNodeProps {
  node: TechTreeNodeData;
  isUnlocked: boolean;
  canUnlock: boolean;
  isSelected: boolean;
  onClick: (nodeId: string) => void;
  // Connection points for SVG lines
  outputX: number;
  outputY: number;
  inputX: number;
  inputY: number;
}

/**
 * TechTreeNode component
 * 
 * Shows node with appropriate visual state:
 * - Locked: Grayed out, non-interactive
 * - Unlocked: Highlighted, interactive
 * - Available: Pulsing glow, ready to unlock (prerequisites met but not yet unlocked)
 * - Selected: Highlighted border
 */
export const TechTreeNode: React.FC<TechTreeNodeProps> = ({
  node,
  isUnlocked,
  canUnlock,
  isSelected,
  onClick,
  outputX,
  outputY,
  inputX,
  inputY,
}) => {
  const categoryInfo = TECH_TREE_CATEGORIES[node.category];
  const accentColor = categoryInfo?.color || '#00d4ff';
  
  // Determine visual state
  const isAvailable = !isUnlocked && canUnlock;
  const isLocked = !isUnlocked && !canUnlock;
  
  // Node dimensions
  const NODE_WIDTH = 110;
  const NODE_HEIGHT = 90;
  
  // Calculate position relative to node origin
  const relOutputX = outputX - node.position.x;
  const relOutputY = outputY - node.position.y;
  const relInputX = inputX - node.position.x;
  const relInputY = inputY - node.position.y;
  
  const handleClick = () => {
    onClick(node.id);
  };
  
  // Build class names based on state
  const containerClasses = `
    tech-tree-node
    ${isLocked ? 'tech-tree-node--locked' : ''}
    ${isUnlocked ? 'tech-tree-node--unlocked' : ''}
    ${isAvailable ? 'tech-tree-node--available' : ''}
    ${isSelected ? 'tech-tree-node--selected' : ''}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <g
      className={containerClasses}
      data-testid={`tech-tree-node-${node.id}`}
      data-state={isLocked ? 'locked' : isUnlocked ? 'unlocked' : 'available'}
      data-category={node.category}
      transform={`translate(${node.position.x}, ${node.position.y})`}
      onClick={handleClick}
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
    >
      {/* Background glow for unlocked/available nodes */}
      {(isUnlocked || isAvailable) && (
        <ellipse
          cx={NODE_WIDTH / 2}
          cy={NODE_HEIGHT / 2}
          rx={NODE_WIDTH / 2 + 8}
          ry={NODE_HEIGHT / 2 + 8}
          fill="none"
          stroke={accentColor}
          strokeWidth={1}
          opacity={isUnlocked ? 0.4 : 0.2}
          className={isAvailable ? 'pulse-glow' : ''}
        />
      )}
      
      {/* Main node background */}
      <rect
        x={0}
        y={0}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={10}
        ry={10}
        fill={isLocked ? '#0a0e17' : `${accentColor}15`}
        stroke={isLocked ? '#1e2a42' : accentColor}
        strokeWidth={isSelected ? 3 : isLocked ? 1 : 2}
        filter={isUnlocked || isAvailable ? `drop-shadow(0 0 6px ${accentColor}40)` : 'none'}
      />
      
      {/* Category badge */}
      <rect
        x={6}
        y={6}
        width={categoryInfo.name.length * 5 + 12}
        height={18}
        rx={4}
        fill={`${accentColor}30`}
      />
      <text
        x={12}
        y={18}
        fontSize={8}
        fontWeight="bold"
        fill={accentColor}
        className="select-none"
      >
        {categoryInfo.nameCn}
      </text>
      
      {/* Icon */}
      <text
        x={NODE_WIDTH / 2}
        y={38}
        textAnchor="middle"
        fontSize={18}
        opacity={isLocked ? 0.4 : 1}
      >
        {node.icon}
      </text>
      
      {/* Node name */}
      <text
        x={NODE_WIDTH / 2}
        y={56}
        textAnchor="middle"
        fontSize={10}
        fontWeight="bold"
        fill={isLocked ? '#6b7280' : '#ffffff'}
        className="select-none"
      >
        {node.name}
      </text>
      
      {/* Chinese name */}
      <text
        x={NODE_WIDTH / 2}
        y={68}
        textAnchor="middle"
        fontSize={8}
        fill={isLocked ? '#4b5563' : '#9ca3af'}
        className="select-none"
      >
        {node.nameCn}
      </text>
      
      {/* Status indicator */}
      {isUnlocked && (
        <>
          {/* Checkmark circle */}
          <circle
            cx={NODE_WIDTH - 14}
            cy={14}
            r={8}
            fill={accentColor}
          />
          <path
            d={`M${NODE_WIDTH - 18} ${14} L${NODE_WIDTH - 15} ${17} L${NODE_WIDTH - 10} ${11}`}
            stroke="white"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      
      {isLocked && (
        <>
          {/* Lock icon */}
          <circle
            cx={NODE_WIDTH - 14}
            cy={14}
            r={8}
            fill="#1e2a42"
            stroke="#374151"
            strokeWidth={1}
          />
          <path
            d={`M${NODE_WIDTH - 17} ${14} h6 v4 h-6 z`}
            fill="none"
            stroke="#6b7280"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <path
            d={`M${NODE_WIDTH - 15} ${14} a2 2 0 0 1 4 0`}
            fill="none"
            stroke="#6b7280"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </>
      )}
      
      {isAvailable && (
        <>
          {/* Pulsing available indicator */}
          <circle
            cx={NODE_WIDTH - 14}
            cy={14}
            r={8}
            fill={accentColor}
            opacity={0.8}
            className="pulse-dot"
          />
          <text
            x={NODE_WIDTH - 14}
            y={17}
            textAnchor="middle"
            fontSize={10}
            fill="white"
            fontWeight="bold"
          >
            !
          </text>
        </>
      )}
      
      {/* Connection ports (invisible, for hit detection) */}
      {/* Input port (left side) */}
      <circle
        cx={relInputX}
        cy={relInputY}
        r={8}
        fill="transparent"
        className="tech-tree-port tech-tree-port--input"
        data-node-id={node.id}
        data-port="input"
      />
      
      {/* Output port (right side) */}
      <circle
        cx={relOutputX}
        cy={relOutputY}
        r={8}
        fill="transparent"
        className="tech-tree-port tech-tree-port--output"
        data-node-id={node.id}
        data-port="output"
      />
    </g>
  );
};

export default TechTreeNode;
