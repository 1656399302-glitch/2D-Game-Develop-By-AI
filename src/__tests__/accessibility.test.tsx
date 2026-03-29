import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Simple component tests for the new accessibility features
describe('AI Integration Types', () => {
  it('should export AI service interface types', async () => {
    const { AIProviderConfig, AIMachineContext, CONNECTION_ERROR_MESSAGES } = await import('../types/aiIntegration');
    
    expect(CONNECTION_ERROR_MESSAGES['same-port-type'].title).toBe('连接类型冲突');
    expect(CONNECTION_ERROR_MESSAGES['same-port-type'].suggestion).toContain('输出端口');
  });
  
  it('should have correct error message mappings', async () => {
    const { CONNECTION_ERROR_MESSAGES } = await import('../types/aiIntegration');
    
    expect(CONNECTION_ERROR_MESSAGES['connection-exists'].title).toBe('连接已存在');
    expect(CONNECTION_ERROR_MESSAGES['same-module'].title).toBe('无法自连接');
    expect(CONNECTION_ERROR_MESSAGES['invalid-port'].title).toBe('无效端口');
  });
  
  it('should create mock AI service', async () => {
    const { MockAIService } = await import('../types/aiIntegration');
    
    const service = new MockAIService({ provider: 'mock' });
    expect(service.isAvailable()).toBe(true);
    expect(service.getConfig().provider).toBe('mock');
  });
});

describe('Loading Overlay', () => {
  it('should not Render when isLoading is false', async () => {
    const { LoadingOverlay } = await import('../components/UI/LoadingOverlay');
    render(<LoadingOverlay isLoading={false} message="Loading..." />);
    
    expect(screen.queryByRole('status')).toBeNull();
  });
  
  it('should Render when isLoading is true', async () => {
    const { LoadingOverlay } = await import('../components/UI/LoadingOverlay');
    render(<LoadingOverlay isLoading={true} message="Loading..." />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('should display progress when provided', async () => {
    const { LoadingOverlay } = await import('../components/UI/LoadingOverlay');
    render(<LoadingOverlay isLoading={true} message="Exporting..." progress={50} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});

describe('Accessibility Utilities', () => {
  it('should export announceToScreenReader function', async () => {
    const { announceToScreenReader } = await import('../components/Accessibility/AccessibilityLayer');
    
    expect(typeof announceToScreenReader).toBe('function');
    
    // Should not throw
    announceToScreenReader('Test message');
    announceToScreenReader('Test message', 'assertive');
  });
  
  it('should export SkipLink component', async () => {
    const { SkipLink } = await import('../components/Accessibility/AccessibilityLayer');
    
    const { container } = render(<SkipLink href="#main">Skip to main</SkipLink>);
    
    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link?.getAttribute('href')).toBe('#main');
  });
  
  it('should export MainLandmark component', async () => {
    const { MainLandmark } = await import('../components/Accessibility/AccessibilityLayer');
    
    const { container } = render(<MainLandmark>Content</MainLandmark>);
    
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main?.textContent).toBe('Content');
  });
});

describe('Error Boundary', () => {
  it('should render children when no error', async () => {
    const { ErrorBoundary } = await import('../components/ErrorBoundary');
    
    render(
      <ErrorBoundary>
        <div data-testid="child">Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
  
  it('should catch and display errors', async () => {
    const { ErrorBoundary } = await import('../components/ErrorBoundary');
    
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
  
  it('should allow retry on error', async () => {
    const { ErrorBoundary } = await import('../components/ErrorBoundary');
    
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    // Click retry
    const retryButton = screen.getByRole('button', { name: '重试' });
    fireEvent.click(retryButton);
  });
});

describe('useKeyboardNavigation', () => {
  it('should export hook', async () => {
    const { useKeyboardNavigation } = await import('../hooks/useKeyboardNavigation');
    
    expect(typeof useKeyboardNavigation).toBe('function');
  });
});

describe('Mobile Layout', () => {
  it('should export useIsMobile hook', async () => {
    const { useIsMobile } = await import('../components/Accessibility/MobileCanvasLayout');
    
    expect(typeof useIsMobile).toBe('function');
  });
  
  it('should export useViewportSize hook', async () => {
    const { useViewportSize } = await import('../components/Accessibility/MobileCanvasLayout');
    
    expect(typeof useViewportSize).toBe('function');
  });
  
  it('should export MobileCanvasLayout component', async () => {
    const { MobileCanvasLayout } = await import('../components/Accessibility/MobileCanvasLayout');
    
    expect(typeof MobileCanvasLayout).toBe('function');
  });
});

describe('Accessible Components', () => {
  it('should export AccessibleCanvas', async () => {
    const { AccessibleCanvas } = await import('../components/Accessibility/AccessibleCanvas');
    
    expect(typeof AccessibleCanvas).toBe('function');
  });
  
  it('should export AccessibleModulePanel', async () => {
    const { AccessibleModulePanel } = await import('../components/Accessibility/AccessibleModulePanel');
    
    expect(typeof AccessibleModulePanel).toBe('function');
  });
});

describe('Screen Reader Announcements', () => {
  it('should create announcer element', async () => {
    const { announceToScreenReader } = await import('../components/Accessibility/AccessibilityLayer');
    
    // Clean up any existing announcer
    const existing = document.getElementById('sr-announcer');
    if (existing) existing.remove();
    
    // Call announce
    announceToScreenReader('Test announcement');
    
    // Check announcer was created
    const announcer = document.getElementById('sr-announcer');
    expect(announcer).toBeInTheDocument();
    expect(announcer?.getAttribute('role')).toBe('status');
  });
});

describe('Inline Loader', () => {
  it('should render with correct class for small size', async () => {
    const { InlineLoader } = await import('../components/UI/LoadingOverlay');
    
    const { container } = render(<InlineLoader size="sm" />);
    expect(container.querySelector('.w-3')).not.toBeNull();
  });

  it('should render with correct class for large size', async () => {
    const { InlineLoader } = await import('../components/UI/LoadingOverlay');
    
    const { container } = render(<InlineLoader size="lg" />);
    expect(container.querySelector('.w-6')).not.toBeNull();
  });
});

describe('Skeleton Loader', () => {
  it('should render text variant with correct class', async () => {
    const { Skeleton } = await import('../components/UI/LoadingOverlay');
    
    const { container } = render(<Skeleton variant="text" />);
    expect(container.querySelector('.h-4')).not.toBeNull();
  });

  it('should render circle variant with correct class', async () => {
    const { Skeleton } = await import('../components/UI/LoadingOverlay');
    
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.querySelector('.rounded-full')).not.toBeNull();
  });
});
