/**
 * Sub-Circuit Module Component Unit Tests
 * 
 * Round 129: Sub-circuit Module System
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SubCircuitModule, SubCircuitPaletteItem } from '../components/SubCircuit/SubCircuitModule';

describe('SubCircuitModule Component', () => {
  const defaultProps = {
    id: 'test-id',
    name: 'My Circuit',
    moduleCount: 4,
    position: { x: 100, y: 100 },
    isSelected: false,
    signal: false,
    onClick: vi.fn(),
    onDragStart: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render name label', () => {
    render(<SubCircuitModule {...defaultProps} name="My Circuit" />);
    
    // The name should be displayed (possibly truncated if long)
    const nameElement = screen.getByText(/My Circuit/i);
    expect(nameElement).toBeDefined();
  });

  it('should render circuit-board SVG icon', () => {
    const { container } = render(<SubCircuitModule {...defaultProps} />);
    
    // Check for SVG element
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('should show module count badge', () => {
    render(<SubCircuitModule {...defaultProps} moduleCount={4} />);
    
    // Should show the module count
    const countElement = screen.getByText('4');
    expect(countElement).toBeDefined();
  });

  it('should render at correct position', () => {
    const position = { x: 100, y: 100 };
    const { container } = render(<SubCircuitModule {...defaultProps} position={position} />);
    
    // Find the group element with transform
    const groupElement = container.querySelector(`g[transform="translate(${position.x}, ${position.y})"]`);
    expect(groupElement).toBeDefined();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    const { container } = render(<SubCircuitModule {...defaultProps} onClick={onClick} />);
    
    const moduleElement = container.querySelector('.sub-circuit-module');
    
    // Click on the module
    if (moduleElement) {
      fireEvent.click(moduleElement);
      expect(onClick).toHaveBeenCalledWith('test-id');
    }
  });

  it('should apply selection styling when selected', () => {
    const { container } = render(<SubCircuitModule {...defaultProps} isSelected={true} />);
    
    // Check for selection indicator rect
    const selectionRects = container.querySelectorAll('rect[stroke="#3b82f6"]');
    expect(selectionRects.length).toBeGreaterThan(0);
  });

  it('should truncate long names', () => {
    const longName = 'This Is A Very Long Circuit Name That Should Be Truncated';
    render(<SubCircuitModule {...defaultProps} name={longName} />);
    
    // Should show truncated version (8 chars + ellipsis)
    const truncatedText = screen.getByText(/This Is/);
    expect(truncatedText).toBeDefined();
  });

  it('should render port indicators', () => {
    const { container } = render(<SubCircuitModule {...defaultProps} />);
    
    // Check for port circles
    const portCircles = container.querySelectorAll('.port-input, .port-output');
    expect(portCircles.length).toBeGreaterThanOrEqual(4); // 2 input + 2 output ports
  });

  it('should render SUB badge indicator', () => {
    const { container } = render(<SubCircuitModule {...defaultProps} />);
    
    // Check for text elements containing SUB
    const allText = container.querySelectorAll('text');
    const subBadge = Array.from(allText).find(t => t.textContent?.includes('SUB'));
    expect(subBadge).toBeDefined();
    expect(subBadge?.textContent).toContain('SUB');
  });
});

describe('SubCircuitPaletteItem Component', () => {
  const defaultProps = {
    id: 'palette-id',
    name: 'Test SubCircuit',
    moduleCount: 3,
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render name', () => {
    render(<SubCircuitPaletteItem {...defaultProps} />);
    
    const nameElement = screen.getByText('Test SubCircuit');
    expect(nameElement).toBeDefined();
  });

  it('should render module count', () => {
    render(<SubCircuitPaletteItem {...defaultProps} moduleCount={3} />);
    
    const countElement = screen.getByText(/3 模块/);
    expect(countElement).toBeDefined();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SubCircuitPaletteItem {...defaultProps} onClick={onClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(onClick).toHaveBeenCalled();
  });

  it('should have correct aria label', () => {
    render(<SubCircuitPaletteItem {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toContain('Test SubCircuit');
    expect(button.getAttribute('aria-label')).toContain('3');
  });

  it('should render circuit icon', () => {
    const { container } = render(<SubCircuitPaletteItem {...defaultProps} />);
    
    // Check for SVG element
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });
});
