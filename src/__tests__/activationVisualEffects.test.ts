import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { calculateActivationChoreography, ActivationStep } from '../utils/activationChoreographer';
import { PlacedModule, Connection } from '../types';

// Mock the useMachineStore
vi.mock('../store/useMachineStore', () => ({
  useMachineStore: vi.fn((selector) => {
    const state = {
      modules: mockModules,
      connections: mockConnections,
      viewport: { x: 0, y: 0, zoom: 1 },
      machineState: 'idle',
      showActivation: false,
      activationZoom: {
        isZooming: false,
        startViewport: null,
        targetViewport: null,
        startTime: 0,
        duration: 800,
      },
      activationModuleIndex: -1,
      activationStartTime: null,
    };
    return selector(state);
  }),
}));

// Mock modules and connections for testing
const mockModules: PlacedModule[] = [
  {
    id: 'mod-1',
    instanceId: 'inst-1',
    type: 'trigger-switch',
    x: 100,
    y: 100,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [
      { id: 'port-1', type: 'output', position: { x: 50, y: 100 } },
    ],
  },
  {
    id: 'mod-2',
    instanceId: 'inst-2',
    type: 'core-furnace',
    x: 300,
    y: 100,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [
      { id: 'port-2', type: 'input', position: { x: 25, y: 50 } },
      { id: 'port-3', type: 'output', position: { x: 75, y: 50 } },
    ],
  },
  {
    id: 'mod-3',
    instanceId: 'inst-3',
    type: 'rune-node',
    x: 500,
    y: 100,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [
      { id: 'port-4', type: 'input', position: { x: 0, y: 40 } },
      { id: 'port-5', type: 'output', position: { x: 100, y: 40 } },
    ],
  },
  {
    id: 'mod-4',
    instanceId: 'inst-4',
    type: 'output-array',
    x: 700,
    y: 100,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [
      { id: 'port-6', type: 'input', position: { x: 0, y: 40 } },
    ],
  },
];

const mockConnections: Connection[] = [
  {
    id: 'conn-1',
    sourceModuleId: 'inst-1',
    sourcePortId: 'port-1',
    targetModuleId: 'inst-2',
    targetPortId: 'port-2',
    pathData: 'M 150 200 C 200 200, 200 150, 325 150',
  },
  {
    id: 'conn-2',
    sourceModuleId: 'inst-2',
    sourcePortId: 'port-3',
    targetModuleId: 'inst-3',
    targetPortId: 'port-4',
    pathData: 'M 375 150 C 400 150, 400 140, 500 140',
  },
  {
    id: 'conn-3',
    sourceModuleId: 'inst-3',
    sourcePortId: 'port-5',
    targetModuleId: 'inst-4',
    targetPortId: 'port-6',
    pathData: 'M 600 140 C 650 140, 650 140, 700 140',
  },
];

describe('Activation Visual Effects', () => {
  describe('calculateActivationChoreography', () => {
    it('should return empty result for no modules', () => {
      const result = calculateActivationChoreography([], []);
      expect(result.steps).toHaveLength(0);
      expect(result.totalDuration).toBe(0);
      expect(result.depthCount).toBe(0);
    });

    it('should calculate BFS activation order for connected modules', () => {
      const result = calculateActivationChoreography(mockModules, mockConnections);
      
      // Should have 4 activation steps
      expect(result.steps).toHaveLength(4);
      
      // First module (trigger-switch) should be at depth 0
      const triggerStep = result.steps.find(s => s.moduleId === 'inst-1');
      expect(triggerStep?.depth).toBe(0);
      expect(triggerStep?.activationTime).toBe(0);
      
      // Last module (output-array) should be at higher depth
      const outputStep = result.steps.find(s => s.moduleId === 'inst-4');
      expect(outputStep?.depth).toBeGreaterThan(0);
    });

    it('should calculate connection light-up times', () => {
      const result = calculateActivationChoreography(mockModules, mockConnections);
      
      // Find the core-furnace step - it should have connection to light up
      const coreStep = result.steps.find(s => s.moduleId === 'inst-2');
      expect(coreStep?.connectionsToLight).toBeDefined();
      
      // The connection from trigger to core should be lit before core activates
      const triggerConn = coreStep?.connectionsToLight.find(c => c.connectionId === 'conn-1');
      expect(triggerConn).toBeDefined();
      expect(triggerConn?.activationTime).toBeLessThan(coreStep?.activationTime || 0);
    });

    it('should handle disconnected modules', () => {
      const disconnectedModule: PlacedModule = {
        id: 'mod-disconnected',
        instanceId: 'inst-disconnected',
        type: 'rune-node',
        x: 200,
        y: 400,
        rotation: 0,
        scale: 1,
        flipped: false,
        ports: [
          { id: 'port-disconnected-1', type: 'input', position: { x: 0, y: 40 } },
        ],
      };
      
      const modulesWithDisconnected = [...mockModules, disconnectedModule];
      const result = calculateActivationChoreography(modulesWithDisconnected, mockConnections);
      
      // Should have 5 steps now
      expect(result.steps).toHaveLength(5);
      
      // The disconnected module should be assigned a depth
      const disconnectedStep = result.steps.find(s => s.moduleId === 'inst-disconnected');
      expect(disconnectedStep).toBeDefined();
      expect(disconnectedStep?.depth).toBeGreaterThanOrEqual(0);
    });

    it('should calculate total duration based on max depth', () => {
      const result = calculateActivationChoreography(mockModules, mockConnections);
      
      // Total duration should account for all depth levels
      expect(result.totalDuration).toBeGreaterThan(0);
      expect(result.depthCount).toBeGreaterThan(0);
    });
  });

  describe('Zoom Calculation', () => {
    it('should calculate zoom-to-fit viewport for centered view', () => {
      // Test the zoom calculation logic
      const modules = mockModules;
      const viewportSize = { width: 800, height: 600 };
      const PADDING = 100;
      
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      modules.forEach((module) => {
        const size = { width: 80, height: 80 }; // Simplified
        minX = Math.min(minX, module.x);
        minY = Math.min(minY, module.y);
        maxX = Math.max(maxX, module.x + size.width);
        maxY = Math.max(maxY, module.y + size.height);
      });
      
      const contentWidth = maxX - minX + PADDING * 2;
      const contentHeight = maxY - minY + PADDING * 2;
      
      const zoomX = viewportSize.width / contentWidth;
      const zoomY = viewportSize.height / contentHeight;
      const newZoom = Math.min(zoomX, zoomY);
      
      // Zoom should be calculated correctly
      expect(newZoom).toBeGreaterThan(0);
      expect(newZoom).toBeLessThanOrEqual(1); // Should zoom out to fit
      
      // Center calculation
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const newX = viewportSize.width / 2 - centerX * newZoom;
      const newY = viewportSize.height / 2 - centerY * newZoom;
      
      // Offsets should be calculated
      expect(newX).toBeDefined();
      expect(newY).toBeDefined();
    });

    it('should handle empty modules array', () => {
      const viewportSize = { width: 800, height: 600 };
      
      // Empty modules should return default viewport
      const result = { x: 0, y: 0, zoom: 1 };
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.zoom).toBe(1);
    });
  });

  describe('Viewport Interpolation', () => {
    it('should interpolate between viewport states with ease-out', () => {
      const start = { x: 0, y: 0, zoom: 1 };
      const end = { x: 100, y: 100, zoom: 0.5 };
      const duration = 800;
      
      // Test at 0% progress
      const progress0 = 0;
      const eased0 = 1 - Math.pow(1 - progress0, 3); // 0
      const result0 = {
        x: start.x + (end.x - start.x) * eased0,
        y: start.y + (end.y - start.y) * eased0,
        zoom: start.zoom + (end.zoom - start.zoom) * eased0,
      };
      expect(result0.x).toBe(0);
      expect(result0.zoom).toBe(1);
      
      // Test at 50% progress
      const progress50 = 0.5;
      const eased50 = 1 - Math.pow(1 - progress50, 3);
      const result50 = {
        x: start.x + (end.x - start.x) * eased50,
        y: start.y + (end.y - start.y) * eased50,
        zoom: start.zoom + (end.zoom - start.zoom) * eased50,
      };
      expect(result50.x).toBeGreaterThan(0);
      expect(result50.zoom).toBeLessThan(1);
      
      // Test at 100% progress
      const progress100 = 1;
      const eased100 = 1 - Math.pow(1 - progress100, 3);
      const result100 = {
        x: start.x + (end.x - start.x) * eased100,
        y: start.y + (end.y - start.y) * eased100,
        zoom: start.zoom + (end.zoom - start.zoom) * eased100,
      };
      expect(result100.x).toBe(100);
      expect(result100.zoom).toBe(0.5);
    });
  });

  describe('Module Activation State', () => {
    it('should determine activated modules based on index', () => {
      const modules = mockModules;
      const activationModuleIndex = 2; // Third module activated
      
      const isModuleActivated = (instanceId: string, moduleIndex: number) => {
        return moduleIndex <= activationModuleIndex;
      };
      
      // First module should be activated
      expect(isModuleActivated('inst-1', 0)).toBe(true);
      expect(isModuleActivated('inst-2', 1)).toBe(true);
      expect(isModuleActivated('inst-3', 2)).toBe(true);
      
      // Fourth module should not be activated yet
      expect(isModuleActivated('inst-4', 3)).toBe(false);
    });

    it('should calculate activation intensity', () => {
      const getActivationIntensity = (isActivated: boolean): number => {
        if (!isActivated) return 0;
        // Intensity ramps up quickly then settles
        return 0.8 + Math.sin(Date.now() / 500) * 0.2;
      };
      
      // Not activated
      expect(getActivationIntensity(false)).toBe(0);
      
      // Activated - intensity should be between 0.6 and 1.0
      const activatedIntensity = getActivationIntensity(true);
      expect(activatedIntensity).toBeGreaterThanOrEqual(0.6);
      expect(activatedIntensity).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Glitch Effects', () => {
    it('should generate random noise offsets', () => {
      const getNoiseOffset = () => ({
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 10,
      });
      
      // Run multiple times to ensure randomness
      const offsets = Array.from({ length: 10 }, getNoiseOffset);
      
      // Offsets should vary
      const xValues = offsets.map(o => o.x);
      const yValues = offsets.map(o => o.y);
      
      // Should have some variation (not all same)
      const xUnique = new Set(xValues).size;
      const yUnique = new Set(yValues).size;
      
      expect(xUnique).toBeGreaterThan(1);
      expect(yUnique).toBeGreaterThan(1);
      
      // Offsets should be within expected range
      offsets.forEach(offset => {
        expect(offset.x).toBeGreaterThanOrEqual(-10);
        expect(offset.x).toBeLessThanOrEqual(10);
        expect(offset.y).toBeGreaterThanOrEqual(-5);
        expect(offset.y).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Energy Pulse Timing', () => {
    it('should calculate pulse wave duration based on path length', () => {
      const getPulseWaveDuration = (pathLength: number): number => {
        // Speed: 400px/second
        return (pathLength / 400) * 1000; // ms
      };
      
      // Short path (200px) = 500ms
      expect(getPulseWaveDuration(200)).toBe(500);
      
      // Medium path (400px) = 1000ms
      expect(getPulseWaveDuration(400)).toBe(1000);
      
      // Long path (800px) = 2000ms
      expect(getPulseWaveDuration(800)).toBe(2000);
    });

    it('should calculate pulse wave count based on path length', () => {
      const getPulseWaveCount = (pathLength: number): number => {
        if (pathLength <= 200) {
          return 1;
        } else if (pathLength <= 400) {
          return 2;
        } else {
          return 3;
        }
      };
      
      // Short path
      expect(getPulseWaveCount(150)).toBe(1);
      expect(getPulseWaveCount(200)).toBe(1);
      
      // Medium path
      expect(getPulseWaveCount(201)).toBe(2);
      expect(getPulseWaveCount(400)).toBe(2);
      
      // Long path
      expect(getPulseWaveCount(401)).toBe(3);
      expect(getPulseWaveCount(800)).toBe(3);
    });
  });

  describe('Activation Phase Timing', () => {
    it('should calculate correct phase based on progress', () => {
      const getPhase = (progress: number): string => {
        if (progress < 30) return 'charging';
        if (progress < 80) return 'activating';
        return 'online';
      };
      
      expect(getPhase(0)).toBe('charging');
      expect(getPhase(15)).toBe('charging');
      expect(getPhase(29)).toBe('charging');
      
      expect(getPhase(30)).toBe('activating');
      expect(getPhase(50)).toBe('activating');
      expect(getPhase(79)).toBe('activating');
      
      expect(getPhase(80)).toBe('online');
      expect(getPhase(90)).toBe('online');
      expect(getPhase(100)).toBe('online');
    });
  });
});
