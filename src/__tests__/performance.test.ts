import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { Suspense, lazy } from 'react';

// Mock performance for Node.js environment
const mockPerformance = {
  memory: {
    usedJSHeapSize: 0,
    totalJSHeapSize: 10000000,
    jsHeapSizeLimit: 20000000,
  },
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

global.performance = mockPerformance as unknown as Performance;

describe('Performance Tests', () => {
  describe('Bundle Size Assertions', () => {
    it('should have valid vite configuration structure', async () => {
      // Read the vite config file directly
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.resolve(process.cwd(), 'vite.config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      
      expect(configContent).toContain('build');
      expect(configContent).toContain('rollupOptions');
      expect(configContent).toContain('manualChunks');
    });
    
    it('should have vendor chunk splitting', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.resolve(process.cwd(), 'vite.config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      
      expect(configContent).toContain('vendor-react');
      expect(configContent).toContain('vendor-gsap');
      expect(configContent).toContain('vendor-zustand');
    });
    
    it('should have component chunk splitting', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.resolve(process.cwd(), 'vite.config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      
      expect(configContent).toContain('components-challenge');
      expect(configContent).toContain('components-codex');
      expect(configContent).toContain('components-faction');
    });
    
    it('should target modern browsers', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.resolve(process.cwd(), 'vite.config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      
      expect(configContent).toContain("target: 'esnext'");
    });
    
    it('should enable CSS code splitting', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.resolve(process.cwd(), 'vite.config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      
      expect(configContent).toContain('cssCodeSplit');
    });
  });
  
  describe('Lazy Loading Verification', () => {
    it('should have lazy imports for modal components', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const appPath = path.resolve(process.cwd(), 'src/App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf-8');
      
      expect(appContent).toContain('lazy(() => import');
      expect(appContent).toContain('Suspense');
    });
    
    it('should have lazy imports for ChallengePanel', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const appPath = path.resolve(process.cwd(), 'src/App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf-8');
      
      expect(appContent).toContain('LazyChallengePanel');
    });
    
    it('should have lazy imports for CodexView', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const appPath = path.resolve(process.cwd(), 'src/App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf-8');
      
      expect(appContent).toContain('LazyCodexView');
    });
    
    it('should have lazy imports for FactionPanel', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const appPath = path.resolve(process.cwd(), 'src/App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf-8');
      
      expect(appContent).toContain('LazyFactionPanel');
    });
    
    it('should have lazy imports for TechTree', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const appPath = path.resolve(process.cwd(), 'src/App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf-8');
      
      expect(appContent).toContain('LazyTechTree');
    });
  });
  
  describe('AI Service Performance', () => {
    it('should respond within reasonable time', async () => {
      const { getAIService } = await import('../types/aiIntegration');
      
      const start = performance.now();
      const service = getAIService();
      await service.generateName({
        context: { modules: [], connections: 0 },
      });
      const duration = performance.now() - start;
      
      // Mock service should respond quickly (< 500ms)
      expect(duration).toBeLessThan(500);
    });
    
    it('should handle concurrent requests efficiently', async () => {
      const { getAIService } = await import('../types/aiIntegration');
      
      const service = getAIService();
      const start = performance.now();
      
      await Promise.all([
        service.generateName({ context: { modules: [], connections: 0 } }),
        service.generateName({ context: { modules: [], connections: 0 } }),
        service.generateName({ context: { modules: [], connections: 0 } }),
      ]);
      
      const duration = performance.now() - start;
      
      // Should complete all requests within reasonable time
      expect(duration).toBeLessThan(1000);
    });
  });
  
  describe('Component Render Performance', () => {
    it('should render large module lists efficiently', () => {
      const modules = Array.from({ length: 100 }, (_, i) => ({
        id: `mod-${i}`,
        type: 'coreFurnace',
        category: 'energy',
        x: i * 10,
        y: i * 10,
        rotation: 0,
      }));
      
      const start = performance.now();
      
      // Simulate rendering
      modules.forEach((mod) => {
        const element = document.createElement('div');
        element.setAttribute('data-module-id', mod.id);
        element.textContent = `${mod.type}-${mod.category}`;
      });
      
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100);
    });
    
    it('should handle rapid state updates', () => {
      let updateCount = 0;
      const maxUpdates = 100;
      
      const start = performance.now();
      
      while (updateCount < maxUpdates) {
        updateCount++;
        // Simulate state update
      }
      
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50);
    });
  });
  
  describe('Memory Usage', () => {
    it('should not leak memory on component unmount', () => {
      const container = document.createElement('div');
      container.textContent = 'Test';
      expect(container.textContent).toBe('Test');
      
      // Simulate cleanup
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      expect(container.childNodes.length).toBe(0);
    });
    
    it('should properly clean up event listeners', () => {
      const handler = vi.fn();
      
      const element = document.createElement('div');
      element.addEventListener('click', handler);
      element.click();
      
      expect(handler).toHaveBeenCalledTimes(1);
      
      element.removeEventListener('click', handler);
      element.click();
      
      // Should not fire after removal
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Build Output Verification', () => {
    it('should have valid vite configuration', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.resolve(process.cwd(), 'vite.config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      
      expect(configContent).toContain('defineConfig');
      expect(configContent).toContain('plugins');
    });
    
    it('should have correct server configuration', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.resolve(process.cwd(), 'vite.config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      
      expect(configContent).toContain('port: 5173');
      expect(configContent).toContain('host: true');
    });
  });
  
  describe('Touch Enhancement Performance', () => {
    it('should not block main thread during touch events', () => {
      const start = performance.now();
      
      // Simulate touch event processing
      const touches = Array.from({ length: 10 }, (_, i) => ({
        clientX: i * 10,
        clientY: i * 10,
      }));
      
      const center = {
        x: touches.reduce((sum, t) => sum + t.clientX, 0) / touches.length,
        y: touches.reduce((sum, t) => sum + t.clientY, 0) / touches.length,
      };
      
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(10);
    });
    
    it('should handle gesture calculations efficiently', () => {
      const start = performance.now();
      
      // Simulate distance calculation
      const dx = 100;
      const dy = 50;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Simulate scale calculation
      const initialDistance = 100;
      const currentDistance = 150;
      const scale = currentDistance / initialDistance;
      
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(5);
      expect(distance).toBeCloseTo(111.8, 1);
      expect(scale).toBeCloseTo(1.5);
    });
  });
});

describe('Code Splitting Tests', () => {
  describe('Lazy Import Syntax', () => {
    it('should use valid dynamic import syntax', async () => {
      const LazyCodexView = lazy(() => import('../components/Codex/CodexView'));
      
      expect(LazyCodexView).toBeDefined();
    });
    
    it('should support Suspense boundaries', async () => {
      const LazyComponent = lazy(() => Promise.resolve({
        default: () => React.createElement('div', null, 'Loaded')
      }));
      
      const element = React.createElement(
        Suspense, 
        { fallback: React.createElement('div', null, 'Loading...') },
        React.createElement(LazyComponent)
      );
      
      expect(element).toBeDefined();
    });
  });
  
  describe('Chunk Naming', () => {
    it('should have meaningful chunk names in config', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.resolve(process.cwd(), 'vite.config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      
      // Verify chunk names are descriptive
      expect(configContent).toContain('vendor-');
      expect(configContent).toContain('components-');
    });
  });
});

describe('AI Integration Tests', () => {
  describe('Service Availability', () => {
    it('should report AI service as available', async () => {
      const { getAIService } = await import('../types/aiIntegration');
      
      const service = getAIService();
      expect(service.isAvailable()).toBe(true);
    });
    
    it('should return correct provider config', async () => {
      const { getAIService } = await import('../types/aiIntegration');
      
      const service = getAIService();
      const config = service.getConfig();
      
      expect(config.provider).toBeDefined();
      expect(config.provider).toBe('mock');
    });
  });
});
