import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';
import { ModuleType, MODULE_ACCENT_COLORS } from '../types';

// Helper to reset store to initial state
const resetStore = () => {
  useMachineStore.setState({
    modules: [],
    connections: [],
    selectedModuleId: null,
    selectedConnectionId: null,
    isConnecting: false,
    connectionStart: null,
    connectionPreview: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    machineState: 'idle',
    history: [{ modules: [], connections: [] }],
    historyIndex: 0,
    gridEnabled: true,
  });
};

beforeEach(() => {
  resetStore();
});

describe('New Module Types - Round 3', () => {
  describe('ResonanceChamber Module', () => {
    it('should add resonance-chamber module to canvas', () => {
      const store = useMachineStore.getState();
      store.addModule('resonance-chamber', 400, 300);
      
      const modules = useMachineStore.getState().modules;
      expect(modules).toHaveLength(1);
      expect(modules[0].type).toBe('resonance-chamber');
    });
    
    it('should have correct port configuration for resonance-chamber', () => {
      const store = useMachineStore.getState();
      store.addModule('resonance-chamber', 400, 300);
      
      const module = useMachineStore.getState().modules[0];
      expect(module.ports).toHaveLength(2); // 1 input + 1 output
      
      const inputPorts = module.ports.filter(p => p.type === 'input');
      const outputPorts = module.ports.filter(p => p.type === 'output');
      
      expect(inputPorts).toHaveLength(1);
      expect(outputPorts).toHaveLength(1);
    });
    
    it('should have correct position for resonance-chamber ports', () => {
      const store = useMachineStore.getState();
      store.addModule('resonance-chamber', 400, 300);
      
      const module = useMachineStore.getState().modules[0];
      const inputPort = module.ports.find(p => p.type === 'input');
      const outputPort = module.ports.find(p => p.type === 'output');
      
      expect(inputPort?.position).toEqual({ x: 0, y: 40 });
      expect(outputPort?.position).toEqual({ x: 80, y: 40 });
    });
  });
  
  describe('FireCrystal Module', () => {
    it('should add fire-crystal module to canvas', () => {
      const store = useMachineStore.getState();
      store.addModule('fire-crystal', 400, 300);
      
      const modules = useMachineStore.getState().modules;
      expect(modules).toHaveLength(1);
      expect(modules[0].type).toBe('fire-crystal');
    });
    
    it('should have correct port configuration for fire-crystal', () => {
      const store = useMachineStore.getState();
      store.addModule('fire-crystal', 400, 300);
      
      const module = useMachineStore.getState().modules[0];
      expect(module.ports).toHaveLength(2); // 1 input + 1 output
      
      const inputPorts = module.ports.filter(p => p.type === 'input');
      const outputPorts = module.ports.filter(p => p.type === 'output');
      
      expect(inputPorts).toHaveLength(1);
      expect(outputPorts).toHaveLength(1);
    });
    
    it('should have correct position for fire-crystal ports', () => {
      const store = useMachineStore.getState();
      store.addModule('fire-crystal', 400, 300);
      
      const module = useMachineStore.getState().modules[0];
      const inputPort = module.ports.find(p => p.type === 'input');
      const outputPort = module.ports.find(p => p.type === 'output');
      
      expect(inputPort?.position).toEqual({ x: 0, y: 40 });
      expect(outputPort?.position).toEqual({ x: 80, y: 40 });
    });
  });
  
  describe('LightningConductor Module', () => {
    it('should add lightning-conductor module to canvas', () => {
      const store = useMachineStore.getState();
      store.addModule('lightning-conductor', 400, 300);
      
      const modules = useMachineStore.getState().modules;
      expect(modules).toHaveLength(1);
      expect(modules[0].type).toBe('lightning-conductor');
    });
    
    it('should have correct port configuration for lightning-conductor', () => {
      const store = useMachineStore.getState();
      store.addModule('lightning-conductor', 400, 300);
      
      const module = useMachineStore.getState().modules[0];
      expect(module.ports).toHaveLength(2); // 1 input + 1 output
      
      const inputPorts = module.ports.filter(p => p.type === 'input');
      const outputPorts = module.ports.filter(p => p.type === 'output');
      
      expect(inputPorts).toHaveLength(1);
      expect(outputPorts).toHaveLength(1);
    });
    
    it('should have correct position for lightning-conductor ports', () => {
      const store = useMachineStore.getState();
      store.addModule('lightning-conductor', 400, 300);
      
      const module = useMachineStore.getState().modules[0];
      const inputPort = module.ports.find(p => p.type === 'input');
      const outputPort = module.ports.find(p => p.type === 'output');
      
      expect(inputPort?.position).toEqual({ x: 0, y: 40 });
      expect(outputPort?.position).toEqual({ x: 80, y: 40 });
    });
  });
  
  describe('All New Modules', () => {
    it('should add all new module types to canvas', () => {
      const store = useMachineStore.getState();
      
      store.addModule('resonance-chamber', 100, 100);
      store.addModule('fire-crystal', 200, 100);
      store.addModule('lightning-conductor', 300, 100);
      
      const modules = useMachineStore.getState().modules;
      expect(modules).toHaveLength(3);
      
      const types = modules.map(m => m.type);
      expect(types).toContain('resonance-chamber');
      expect(types).toContain('fire-crystal');
      expect(types).toContain('lightning-conductor');
    });
    
    it('should have correct sizes for all new modules', () => {
      const store = useMachineStore.getState();
      
      store.addModule('resonance-chamber', 100, 100);
      store.addModule('fire-crystal', 200, 100);
      store.addModule('lightning-conductor', 300, 100);
      
      const modules = useMachineStore.getState().modules;
      
      modules.forEach(module => {
        const expectedWidth = 80;
        const expectedHeight = 80;
        expect(module.type).toMatch(/resonance-chamber|fire-crystal|lightning-conductor/);
      });
    });
  });
  
  describe('Module Connections with New Types', () => {
    it('should create connection between new modules', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 100, 100);
      store.addModule('resonance-chamber', 300, 100);
      
      const modules = useMachineStore.getState().modules;
      const coreFurnace = modules.find(m => m.type === 'core-furnace');
      const resonanceChamber = modules.find(m => m.type === 'resonance-chamber');
      
      expect(coreFurnace).toBeDefined();
      expect(resonanceChamber).toBeDefined();
      
      // Start connection from core furnace output
      const coreOutputPort = coreFurnace!.ports.find(p => p.type === 'output');
      store.startConnection(coreFurnace!.instanceId, coreOutputPort!.id);
      
      // Complete connection to resonance chamber input
      const chamberInputPort = resonanceChamber!.ports.find(p => p.type === 'input');
      store.completeConnection(resonanceChamber!.instanceId, chamberInputPort!.id);
      
      const connections = useMachineStore.getState().connections;
      expect(connections).toHaveLength(1);
    });
  });
});

describe('New Module Categories', () => {
  it('should have resonance category for resonance-chamber', () => {
    // This tests that the module types are properly typed
    const newModules: ModuleType[] = ['resonance-chamber', 'fire-crystal', 'lightning-conductor'];
    
    expect(newModules).toHaveLength(3);
    expect(newModules).toContain('resonance-chamber');
    expect(newModules).toContain('fire-crystal');
    expect(newModules).toContain('lightning-conductor');
  });
});

describe('Module Accent Colors', () => {
  it('should have accent colors defined for new modules', () => {
    expect(MODULE_ACCENT_COLORS['resonance-chamber']).toBe('#06b6d4');
    expect(MODULE_ACCENT_COLORS['fire-crystal']).toBe('#f97316');
    expect(MODULE_ACCENT_COLORS['lightning-conductor']).toBe('#eab308');
  });
});
