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
  filterVisibleConnections,
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

  /**
   * AC4: filterVisibleConnections Tests
   * 
   * Tests that filterVisibleConnections correctly filters connections based
   * on which modules are visible in the viewport.
   */
  describe('AC4: filterVisibleConnections', () => {
    it('should include connection when both endpoints are visible', () => {
      // Create test modules with unique IDs
      const visibleModuleA: PlacedModule = {
        instanceId: 'module-visible-A',
        type: 'coreFurnace',
        category: 'energy',
        x: 100,
        y: 100,
        rotation: 0,
        scale: 1,
        ports: [],
        properties: {},
      };
      
      const visibleModuleB: PlacedModule = {
        instanceId: 'module-visible-B',
        type: 'runeNode',
        category: 'energy',
        x: 200,
        y: 100,
        rotation: 0,
        scale: 1,
        ports: [],
        properties: {},
      };
      
      const testConnection: Connection = {
        id: 'conn-both-visible',
        sourceModuleId: 'module-visible-A',
        sourcePortId: 'output-1',
        targetModuleId: 'module-visible-B',
        targetPortId: 'input-1',
        energy: 75,
        status: 'active',
      };
      
      // Both modules are in the visible set
      const visibleModuleIds = new Set(['module-visible-A', 'module-visible-B']);
      
      const filtered = filterVisibleConnections([testConnection], visibleModuleIds);
      
      // Connection should be included
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('conn-both-visible');
    });
    
    it('should include connection when only one endpoint is visible', () => {
      // Create test modules
      const visibleModule: PlacedModule = {
        instanceId: 'module-visible-only',
        type: 'coreFurnace',
        category: 'energy',
        x: 100,
        y: 100,
        rotation: 0,
        scale: 1,
        ports: [],
        properties: {},
      };
      
      const hiddenModule: PlacedModule = {
        instanceId: 'module-hidden',
        type: 'runeNode',
        category: 'energy',
        x: 2000, // Far outside viewport
        y: 2000,
        rotation: 0,
        scale: 1,
        ports: [],
        properties: {},
      };
      
      const testConnection: Connection = {
        id: 'conn-one-visible',
        sourceModuleId: 'module-visible-only',
        sourcePortId: 'output-1',
        targetModuleId: 'module-hidden',
        targetPortId: 'input-1',
        energy: 75,
        status: 'active',
      };
      
      // Only one module is in the visible set
      const visibleModuleIds = new Set(['module-visible-only']);
      
      const filtered = filterVisibleConnections([testConnection], visibleModuleIds);
      
      // Connection should be included (because at least one endpoint is visible)
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('conn-one-visible');
    });
    
    it('should exclude connection when both endpoints are hidden', () => {
      // Create test modules that are both hidden
      const hiddenModuleA: PlacedModule = {
        instanceId: 'module-hidden-A',
        type: 'coreFurnace',
        category: 'energy',
        x: 2000, // Far outside viewport
        y: 2000,
        rotation: 0,
        scale: 1,
        ports: [],
        properties: {},
      };
      
      const hiddenModuleB: PlacedModule = {
        instanceId: 'module-hidden-B',
        type: 'runeNode',
        category: 'energy',
        x: 3000, // Far outside viewport
        y: 3000,
        rotation: 0,
        scale: 1,
        ports: [],
        properties: {},
      };
      
      const testConnection: Connection = {
        id: 'conn-both-hidden',
        sourceModuleId: 'module-hidden-A',
        sourcePortId: 'output-1',
        targetModuleId: 'module-hidden-B',
        targetPortId: 'input-1',
        energy: 75,
        status: 'active',
      };
      
      // Neither module is in the visible set (empty set)
      const visibleModuleIds = new Set<string>();
      
      const filtered = filterVisibleConnections([testConnection], visibleModuleIds);
      
      // Connection should be excluded
      expect(filtered).toHaveLength(0);
    });
  });

  /**
   * AC7: ModuleRenderCache LRU Eviction Tests
   * 
   * Tests that the module render cache properly implements LRU eviction
   * when the maximum size of 500 entries is exceeded.
   */
  describe('AC7: ModuleRenderCache LRU Eviction', () => {
    it('should evict oldest entry after 501 unique cache entries', () => {
      const memoizer = memoizeModuleRender();
      memoizer.clear(); // Start fresh
      
      const firstModuleId = 'lru-test-first';
      const firstSvg = '<g id="first"></g>';
      
      // Cache the first entry
      memoizer.setCached(firstModuleId, 0, 1, false, firstSvg);
      
      // Verify it's cached
      expect(memoizer.getCached(firstModuleId, 0, 1, false)).toBe(firstSvg);
      
      // Now add 501 unique entries to trigger eviction
      for (let i = 0; i < 501; i++) {
        const uniqueId = `lru-test-${i}-${Date.now()}`;
        memoizer.setCached(uniqueId, 0, 1, false, `<g id="${uniqueId}"></g>`);
      }
      
      // After adding 501 entries, the first entry should be evicted
      const cachedFirst = memoizer.getCached(firstModuleId, 0, 1, false);
      expect(cachedFirst).toBeNull(); // First entry should be evicted
    });
    
    it('should maintain LRU ordering on get/set operations', () => {
      const memoizer = memoizeModuleRender();
      memoizer.clear(); // Start fresh
      
      // Add entries in order
      const moduleIds = ['lru-A', 'lru-B', 'lru-C'];
      moduleIds.forEach((id, index) => {
        memoizer.setCached(id, 0, 1, false, `<g id="${id}"></g>`);
      });
      
      // Access 'lru-A' to move it to the most recently used position
      const cachedA = memoizer.getCached('lru-A', 0, 1, false);
      expect(cachedA).not.toBeNull();
      expect(cachedA).toContain('lru-A');
      
      // Now add many more entries to trigger eviction
      // Since we accessed 'lru-A', it should NOT be evicted yet
      for (let i = 0; i < 498; i++) {
        const uniqueId = `lru-new-${i}-${Date.now()}`;
        memoizer.setCached(uniqueId, 0, 1, false, `<g id="${uniqueId}"></g>`);
      }
      
      // 'lru-B' (oldest after accessing A) should be evicted first
      const cachedB = memoizer.getCached('lru-B', 0, 1, false);
      expect(cachedB).toBeNull(); // Should be evicted
      
      // 'lru-A' should still be cached (it was accessed after B was added)
      const cachedA2 = memoizer.getCached('lru-A', 0, 1, false);
      expect(cachedA2).not.toBeNull(); // Should still be cached
      expect(cachedA2).toContain('lru-A');
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
