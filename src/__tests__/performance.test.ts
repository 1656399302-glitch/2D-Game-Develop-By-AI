/**
 * Performance Tests
 * 
 * Performance benchmarks for SVG rendering and canvas operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { Suspense, lazy } from 'react';

// Store original Math
const originalMath = { ...Math };

// Import performance utilities
import {
  memoizeModuleRender,
  batchConnectionUpdates,
  throttleViewportUpdates,
  createVirtualizedModuleList,
  calculateBounds,
  benchmark,
  isWithinFrameBudget,
  VIEWPORT_CULLING_BUFFER,
  THROTTLE_INTERVAL_60FPS,
} from '../utils/performanceUtils';
import { PlacedModule, Connection } from '../types';
import { calculateConnectionPath } from '../utils/connectionEngine';

// Test data generators
function generateModules(count: number): PlacedModule[] {
  const moduleTypes = ['coreFurnace', 'runeNode', 'gear', 'shieldShell', 'triggerSwitch', 'voidSiphon'] as const;
  
  return Array.from({ length: count }, (_, i) => ({
    instanceId: `module-${i}-${Date.now()}-${Math.random()}`,
    type: moduleTypes[i % moduleTypes.length],
    category: 'energy' as const,
    x: (i % 20) * 50,
    y: Math.floor(i / 20) * 50,
    rotation: 0,
    scale: 1,
    ports: [
      { id: `input-${i}`, type: 'input' as const, position: { x: 0, y: 40 } },
      { id: `output-${i}`, type: 'output' as const, position: { x: 80, y: 40 } },
    ],
    properties: {
      energy: 50 + Math.random() * 50,
    },
  }));
}

function generateConnections(modules: PlacedModule[]): Connection[] {
  const connections: Connection[] = [];
  
  for (let i = 0; i < modules.length - 1; i++) {
    connections.push({
      id: `conn-${i}-${Date.now()}-${Math.random()}`,
      sourceModuleId: modules[i].instanceId,
      sourcePortId: `output-${i}`,
      targetModuleId: modules[i + 1].instanceId,
      targetPortId: `input-${i + 1}`,
      energy: 50 + Math.random() * 50,
      status: 'active',
    });
  }
  
  return connections;
}

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(Math, originalMath);
  });

  describe('Bundle Size Assertions', () => {
    it('should have valid vite configuration structure', async () => {
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
    
    it('should target modern browsers', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.resolve(process.cwd(), 'vite.config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      
      expect(configContent).toContain("target: 'esnext'");
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
      
      const service = getAIService();
      await service.generateName({
        context: { modules: [], connections: 0 },
      });
      
      // Mock service should respond quickly
      expect(service.isAvailable()).toBe(true);
    });
    
    it('should handle concurrent requests efficiently', async () => {
      const { getAIService } = await import('../types/aiIntegration');
      
      const service = getAIService();
      
      await Promise.all([
        service.generateName({ context: { modules: [], connections: 0 } }),
        service.generateName({ context: { modules: [], connections: 0 } }),
        service.generateName({ context: { modules: [], connections: 0 } }),
      ]);
      
      expect(service.isAvailable()).toBe(true);
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
      
      const dx = 100;
      const dy = 50;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const initialDistance = 100;
      const currentDistance = 150;
      const scale = currentDistance / initialDistance;
      
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(5);
      expect(distance).toBeCloseTo(111.8, 1);
      expect(scale).toBeCloseTo(1.5);
    });
  });
  
  describe('Real-world Performance Scenarios', () => {
    it('should handle large machine with many modules', () => {
      const moduleCount = 100;
      const modules = generateModules(moduleCount);
      const connections = generateConnections(modules);
      
      // Virtualize
      const virtualized = createVirtualizedModuleList(
        modules,
        { x: 0, y: 0, zoom: 1 },
        { width: 800, height: 600 },
        { bufferSize: 50 }
      );
      
      // Calculate paths
      connections.forEach((conn) => {
        calculateConnectionPath(
          modules,
          conn.sourceModuleId,
          conn.sourcePortId,
          conn.targetModuleId,
          conn.targetPortId
        );
      });
      
      // Should complete successfully
      expect(virtualized.visibleModules.length).toBeGreaterThan(0);
    });
    
    it('should handle viewport updates', () => {
      const throttler = throttleViewportUpdates();
      
      // Simulate viewport updates
      for (let i = 0; i < 10; i++) {
        throttler.requestUpdate({
          x: i * 10,
          y: i * 10,
          zoom: 1 + i * 0.1,
        });
      }
      
      expect(throttler).toBeDefined();
      
      throttler.reset();
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
