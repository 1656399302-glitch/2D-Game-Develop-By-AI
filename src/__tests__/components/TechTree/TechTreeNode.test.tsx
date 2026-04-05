/**
 * TechTreeNode Component Tests
 * 
 * Unit tests for the individual tech tree node component.
 * Tests locked/unlocked states, prerequisite display, and interactions.
 * 
 * ROUND 136: Initial implementation
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TechTreeNode } from '../../../components/TechTree/TechTreeNode';
import { TECH_TREE_NODES } from '../../../data/techTreeNodes';
import type { TechTreeNodeData } from '../../../types/techTree';

describe('TechTreeNode Component', () => {
  describe('Locked State', () => {
    it('renders locked state correctly', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={false}
          canUnlock={false}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      expect(nodeElement.getAttribute('data-state')).toBe('locked');
    });

    it('locked node has not-allowed cursor', () => {
      const node = TECH_TREE_NODES.find(n => n.prerequisites.length > 0);
      expect(node).toBeDefined();
      
      if (node) {
        const nodeWidth = 110;
        const nodeHeight = 90;
        
        render(
          <TechTreeNode
            node={node}
            isUnlocked={false}
            canUnlock={false}
            isSelected={false}
            onClick={vi.fn()}
            outputX={node.position.x + nodeWidth}
            outputY={node.position.y + nodeHeight / 2}
            inputX={node.position.x}
            inputY={node.position.y + nodeHeight / 2}
          />
        );
        
        const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
        const gElement = nodeElement.closest('g');
        expect(gElement?.getAttribute('style')).toContain('cursor: not-allowed');
      }
    });
  });

  describe('Unlocked State', () => {
    it('renders unlocked state correctly', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={true}
          canUnlock={true}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      expect(nodeElement.getAttribute('data-state')).toBe('unlocked');
    });

    it('unlocked node has pointer cursor', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={true}
          canUnlock={true}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      const gElement = nodeElement.closest('g');
      expect(gElement?.getAttribute('style')).toContain('cursor: pointer');
    });

    it('displays checkmark for unlocked node', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={true}
          canUnlock={true}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      // Check for SVG path (checkmark)
      const paths = nodeElement.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('Available State', () => {
    it('renders available state when prerequisites are met but not unlocked', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={false}
          canUnlock={true}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      expect(nodeElement.getAttribute('data-state')).toBe('available');
    });

    it('available node has pointer cursor', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={false}
          canUnlock={true}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      const gElement = nodeElement.closest('g');
      expect(gElement?.getAttribute('style')).toContain('cursor: pointer');
    });
  });

  describe('Selected State', () => {
    it('applies selected styling when isSelected is true', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={true}
          canUnlock={true}
          isSelected={true}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      // Check that selected class is applied via className attribute
      const className = nodeElement.getAttribute('class') || '';
      expect(className).toContain('tech-tree-node--selected');
    });
  });

  describe('Click Handling', () => {
    it('calls onClick with node ID when clicked', () => {
      const mockOnClick = vi.fn();
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={true}
          canUnlock={true}
          isSelected={false}
          onClick={mockOnClick}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      nodeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      expect(mockOnClick).toHaveBeenCalledWith(node.id);
    });
  });

  describe('Node Content', () => {
    it('displays node icon', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={true}
          canUnlock={true}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      // Icon is at y=38 (middle of the node), fontSize=18
      const texts = Array.from(nodeElement.querySelectorAll('text'));
      const iconText = texts.find(t => t.getAttribute('y') === '38' && t.getAttribute('font-size') === '18');
      expect(iconText?.textContent).toBe(node.icon);
    });

    it('displays node name', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={true}
          canUnlock={true}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      const texts = Array.from(nodeElement.querySelectorAll('text'));
      
      // Find the name text (y=56, bold)
      const nameText = texts.find(
        t => t.textContent === node.name && t.getAttribute('font-weight') === 'bold'
      );
      expect(nameText).toBeTruthy();
    });

    it('displays category badge', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={true}
          canUnlock={true}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      const texts = Array.from(nodeElement.querySelectorAll('text'));
      
      // Find category badge text (y=18, fontSize=8)
      const categoryText = texts.find(
        t => t.getAttribute('y') === '18' && t.getAttribute('font-size') === '8'
      );
      expect(categoryText?.textContent).toContain('门') || categoryText?.textContent?.includes('Gate');
    });
  });

  describe('SVG Structure', () => {
    it('has correct transform with position', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={true}
          canUnlock={true}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      const gElement = nodeElement.closest('g');
      
      expect(gElement?.getAttribute('transform')).toBe(
        `translate(${node.position.x}, ${node.position.y})`
      );
    });

    it('has main rect element', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={true}
          canUnlock={true}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      const rect = nodeElement.querySelector('rect');
      expect(rect).toBeTruthy();
    });

    it('has input and output port elements', () => {
      const node = TECH_TREE_NODES[0];
      const nodeWidth = 110;
      const nodeHeight = 90;
      
      render(
        <TechTreeNode
          node={node}
          isUnlocked={true}
          canUnlock={true}
          isSelected={false}
          onClick={vi.fn()}
          outputX={node.position.x + nodeWidth}
          outputY={node.position.y + nodeHeight / 2}
          inputX={node.position.x}
          inputY={node.position.y + nodeHeight / 2}
        />
      );
      
      const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
      const ports = nodeElement.querySelectorAll('.tech-tree-port');
      
      expect(ports.length).toBe(2);
      
      const inputPort = nodeElement.querySelector('.tech-tree-port--input');
      const outputPort = nodeElement.querySelector('.tech-tree-port--output');
      
      expect(inputPort).toBeTruthy();
      expect(outputPort).toBeTruthy();
    });
  });

  describe('Different Categories', () => {
    it('renders basic-gates category correctly', () => {
      const node = TECH_TREE_NODES.find(n => n.category === 'basic-gates');
      expect(node).toBeDefined();
      
      if (node) {
        const nodeWidth = 110;
        const nodeHeight = 90;
        
        render(
          <TechTreeNode
            node={node}
            isUnlocked={true}
            canUnlock={true}
            isSelected={false}
            onClick={vi.fn()}
            outputX={node.position.x + nodeWidth}
            outputY={node.position.y + nodeHeight / 2}
            inputX={node.position.x}
            inputY={node.position.y + nodeHeight / 2}
          />
        );
        
        const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
        expect(nodeElement.getAttribute('data-category')).toBe('basic-gates');
      }
    });

    it('renders advanced-gates category correctly', () => {
      const node = TECH_TREE_NODES.find(n => n.category === 'advanced-gates');
      expect(node).toBeDefined();
      
      if (node) {
        const nodeWidth = 110;
        const nodeHeight = 90;
        
        render(
          <TechTreeNode
            node={node}
            isUnlocked={true}
            canUnlock={true}
            isSelected={false}
            onClick={vi.fn()}
            outputX={node.position.x + nodeWidth}
            outputY={node.position.y + nodeHeight / 2}
            inputX={node.position.x}
            inputY={node.position.y + nodeHeight / 2}
          />
        );
        
        const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
        expect(nodeElement.getAttribute('data-category')).toBe('advanced-gates');
      }
    });

    it('renders special-components category correctly', () => {
      const node = TECH_TREE_NODES.find(n => n.category === 'special-components');
      expect(node).toBeDefined();
      
      if (node) {
        const nodeWidth = 110;
        const nodeHeight = 90;
        
        render(
          <TechTreeNode
            node={node}
            isUnlocked={true}
            canUnlock={true}
            isSelected={false}
            onClick={vi.fn()}
            outputX={node.position.x + nodeWidth}
            outputY={node.position.y + nodeHeight / 2}
            inputX={node.position.x}
            inputY={node.position.y + nodeHeight / 2}
          />
        );
        
        const nodeElement = screen.getByTestId(`tech-tree-node-${node.id}`);
        expect(nodeElement.getAttribute('data-category')).toBe('special-components');
      }
    });
  });
});
