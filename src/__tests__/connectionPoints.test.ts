/**
 * Connection Points Test Suite
 * 
 * Round 111: Energy Connection System + Module Animation Hooks
 * 
 * Tests for useConnectionPoints hook and connection point utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createConnectionPoint,
  isInputPort,
  isOutputPort,
  hasInputPorts,
  hasOutputPorts,
  canBeConnected,
  getModuleConnectionConfig,
  MODULE_CONNECTION_CONFIGS,
  ConnectionPoint,
} from '../types/connection';
import { ModuleType, PlacedModule } from '../types';

// Mock modules for testing
const createMockModule = (type: ModuleType, instanceId: string): PlacedModule => ({
  id: 'test-id',
  instanceId,
  type,
  x: 100,
  y: 100,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [],
});

describe('Connection Types (AC-111-001)', () => {
  it('should define input port correctly', () => {
    const point = createConnectionPoint(
      'module-1',
      'core-furnace',
      'input',
      { x: 25, y: 50 }
    );
    
    expect(point.type).toBe('input');
    expect(isInputPort(point)).toBe(true);
    expect(isOutputPort(point)).toBe(false);
  });
  
  it('should define output port correctly', () => {
    const point = createConnectionPoint(
      'module-1',
      'core-furnace',
      'output',
      { x: 75, y: 50 }
    );
    
    expect(point.type).toBe('output');
    expect(isOutputPort(point)).toBe(true);
    expect(isInputPort(point)).toBe(false);
  });
  
  it('should create connection point with all required properties', () => {
    const point = createConnectionPoint(
      'module-1',
      'energy-pipe',
      'input',
      { x: 0, y: 25 },
      '能量输入'
    );
    
    expect(point.id).toBeDefined();
    expect(point.moduleId).toBe('module-1');
    expect(point.moduleType).toBe('energy-pipe');
    expect(point.type).toBe('input');
    expect(point.relativePosition).toEqual({ x: 0, y: 25 });
    expect(point.label).toBe('能量输入');
    expect(point.isConnected).toBe(false);
  });
  
  it('should create unique IDs for different points', () => {
    const point1 = createConnectionPoint('m1', 'core-furnace', 'input', { x: 0, y: 50 });
    const point2 = createConnectionPoint('m1', 'core-furnace', 'output', { x: 100, y: 50 });
    
    expect(point1.id).not.toBe(point2.id);
  });
});

describe('Multiple Connection Points Per Module (AC-111-002)', () => {
  it('should define multiple input ports for stabilizer-core', () => {
    const config = getModuleConnectionConfig('stabilizer-core');
    
    expect(config).toBeDefined();
    expect(config!.inputs.length).toBe(2);
    expect(config!.outputs.length).toBe(1);
  });
  
  it('should define multiple output ports for amplifier-crystal', () => {
    const config = getModuleConnectionConfig('amplifier-crystal');
    
    expect(config).toBeDefined();
    expect(config!.inputs.length).toBe(1);
    expect(config!.outputs.length).toBe(2);
  });
  
  it('should define multiple ports for phase-modulator', () => {
    const config = getModuleConnectionConfig('phase-modulator');
    
    expect(config).toBeDefined();
    expect(config!.inputs.length).toBe(2);
    expect(config!.outputs.length).toBe(2);
  });
  
  it('should have zero input ports for core-furnace (energy source)', () => {
    const config = getModuleConnectionConfig('core-furnace');
    
    expect(config).toBeDefined();
    expect(config!.inputs.length).toBe(0);
    expect(config!.outputs.length).toBe(2);
  });
  
  it('should have zero ports for gear (mechanical module)', () => {
    const config = getModuleConnectionConfig('gear');
    
    expect(config).toBeDefined();
    expect(config!.inputs.length).toBe(0);
    expect(config!.outputs.length).toBe(0);
  });
  
  it('should have zero ports for shield-shell (structural module)', () => {
    const config = getModuleConnectionConfig('shield-shell');
    
    expect(config).toBeDefined();
    expect(config!.inputs.length).toBe(0);
    expect(config!.outputs.length).toBe(0);
  });
  
  it('should have zero output ports for output-array (energy sink)', () => {
    const config = getModuleConnectionConfig('output-array');
    
    expect(config).toBeDefined();
    expect(config!.inputs.length).toBe(1);
    expect(config!.outputs.length).toBe(0);
  });
  
  it('should have zero input ports for trigger-switch', () => {
    const config = getModuleConnectionConfig('trigger-switch');
    
    expect(config).toBeDefined();
    expect(config!.inputs.length).toBe(0);
    expect(config!.outputs.length).toBe(1);
  });
});

describe('Module Connection Configurations', () => {
  it('should define config for all module types', () => {
    const moduleTypes: ModuleType[] = [
      'core-furnace',
      'energy-pipe',
      'gear',
      'rune-node',
      'shield-shell',
      'trigger-switch',
      'output-array',
      'amplifier-crystal',
      'stabilizer-core',
      'void-siphon',
      'phase-modulator',
    ];
    
    moduleTypes.forEach(type => {
      const config = getModuleConnectionConfig(type);
      expect(config).toBeDefined();
      expect(config!.moduleType).toBe(type);
    });
  });
  
  it('should correctly identify modules with input ports', () => {
    expect(hasInputPorts('core-furnace')).toBe(false);
    expect(hasInputPorts('energy-pipe')).toBe(true);
    expect(hasInputPorts('stabilizer-core')).toBe(true);
    expect(hasInputPorts('gear')).toBe(false);
  });
  
  it('should correctly identify modules with output ports', () => {
    expect(hasOutputPorts('core-furnace')).toBe(true);
    expect(hasOutputPorts('energy-pipe')).toBe(true);
    expect(hasOutputPorts('output-array')).toBe(false);
    expect(hasOutputPorts('gear')).toBe(false);
  });
  
  it('should correctly identify connectable modules', () => {
    expect(canBeConnected('core-furnace')).toBe(true);
    expect(canBeConnected('energy-pipe')).toBe(true);
    expect(canBeConnected('output-array')).toBe(true);
    expect(canBeConnected('gear')).toBe(false);
    expect(canBeConnected('shield-shell')).toBe(false);
  });
});

describe('Connection Point Port Labels', () => {
  it('should have labels for core-furnace outputs', () => {
    const config = getModuleConnectionConfig('core-furnace');
    expect(config!.outputs[0].label).toBe('能量输出');
    expect(config!.outputs[1].label).toBe('能量输出');
  });
  
  it('should have labels for pipe ports', () => {
    const config = getModuleConnectionConfig('energy-pipe');
    expect(config!.inputs[0].label).toBe('能量输入');
    expect(config!.outputs[0].label).toBe('能量输出');
  });
  
  it('should have labels for rune-node ports', () => {
    const config = getModuleConnectionConfig('rune-node');
    expect(config!.inputs[0].label).toBe('能量输入');
    expect(config!.outputs[0].label).toBe('能量输出');
  });
});

describe('Advanced Module Configurations', () => {
  it('should define config for void-siphon with top input and bottom outputs', () => {
    const config = getModuleConnectionConfig('void-siphon');
    
    expect(config).toBeDefined();
    expect(config!.inputs.length).toBe(1);
    expect(config!.inputs[0].y).toBe(0); // Top position
    
    expect(config!.outputs.length).toBe(2);
    expect(config!.outputs[0].y).toBe(80); // Bottom positions
    expect(config!.outputs[1].y).toBe(80);
  });
  
  it('should define config for ether-infusion-chamber with dual inputs', () => {
    const config = getModuleConnectionConfig('ether-infusion-chamber');
    
    expect(config).toBeDefined();
    expect(config!.inputs.length).toBe(2);
    expect(config!.inputs[0].y).toBe(35);
    expect(config!.inputs[1].y).toBe(65);
    
    expect(config!.outputs.length).toBe(1);
  });
});
