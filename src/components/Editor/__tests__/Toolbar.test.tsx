import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { Toolbar, ToolbarProps } from '../Toolbar';
import { useMachineStore } from '../../../store/useMachineStore';
import { useCommunityStore } from '../../../store/communitySlice';
import { useMachineStatsStore } from '../../../store/machineStatsSlice';

// Set up initial store state
beforeEach(() => {
  const store = useMachineStore.getState();
  // Reset any necessary state
});

// Helper to set up store state
const setupStoreState = () => {
  // The stores are already initialized, we just need to ensure
  // the component can access them
};

describe('Toolbar Recipe Button Integration', () => {
  beforeEach(() => {
    setupStoreState();
  });

  it('should render the recipe button with correct aria-label', () => {
    render(<Toolbar onOpenRecipeBrowser={vi.fn()} />);
    
    const recipeButton = screen.getByRole('button', { name: /配方/i });
    expect(recipeButton).toBeInTheDocument();
  });

  it('should call onOpenRecipeBrowser when recipe button is clicked', () => {
    const mockCallback = vi.fn();
    render(<Toolbar onOpenRecipeBrowser={mockCallback} />);
    
    const recipeButton = screen.getByRole('button', { name: /配方/i });
    fireEvent.click(recipeButton);
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should not throw when onOpenRecipeBrowser is not provided', () => {
    render(<Toolbar />);
    
    const recipeButton = screen.getByRole('button', { name: /配方/i });
    expect(() => fireEvent.click(recipeButton)).not.toThrow();
  });

  it('should accept ToolbarProps interface with onOpenRecipeBrowser', () => {
    // This is a compile-time check - if the interface is correct, this will pass
    const props: ToolbarProps = { onOpenRecipeBrowser: vi.fn() };
    expect(props.onOpenRecipeBrowser).toBeDefined();
  });
});

describe('Toolbar - Recipe Browser State Flow', () => {
  it('should propagate recipe browser open state via callback', () => {
    const handleOpen = vi.fn();
    render(<Toolbar onOpenRecipeBrowser={handleOpen} />);
    
    // Click the recipe button in toolbar
    const recipeButton = screen.getByRole('button', { name: /配方/i });
    fireEvent.click(recipeButton);
    
    // Verify the callback was called - this is the integration point
    expect(handleOpen).toHaveBeenCalled();
  });

  it('recipe button should be accessible with proper aria attributes', () => {
    render(<Toolbar onOpenRecipeBrowser={vi.fn()} />);
    
    const recipeButton = screen.getByRole('button', { name: /配方/i });
    expect(recipeButton).toHaveAttribute('aria-label', '配方');
  });

  it('should render toolbar with expected elements', () => {
    render(<Toolbar onOpenRecipeBrowser={vi.fn()} />);
    
    // Stats display should be present
    expect(screen.getByText(/模块:/)).toBeInTheDocument();
    expect(screen.getByText(/连接:/)).toBeInTheDocument();
  });
});

describe('Toolbar Props Interface', () => {
  it('ToolbarProps should include onOpenRecipeBrowser', () => {
    const props: ToolbarProps = {};
    // TypeScript should complain if onOpenRecipeBrowser is not optional
    expect(props.onOpenRecipeBrowser).toBeUndefined();
  });

  it('ToolbarProps onOpenRecipeBrowser should be callable', () => {
    const callback = vi.fn();
    const props: ToolbarProps = { onOpenRecipeBrowser: callback };
    props.onOpenRecipeBrowser?.();
    expect(callback).toHaveBeenCalled();
  });
});
