/**
 * Circuit Persistence Unit Tests
 * 
 * Round 151: Circuit Persistence System
 * 
 * Tests for circuitPersistence.ts module including:
 * - Storage key constants
 * - Save/load circuit state
 * - Multiple circuit slots
 * - Recent circuits list
 * - Corruption recovery
 * - Storage size checking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CIRCUIT_STORAGE_KEYS,
  MAX_RECENT_SLOTS,
  calculateStorageSize,
  isStorageSizeSafe,
  generateCircuitId,
  getSlotKey,
  saveCircuitState,
  loadCircuitState,
  clearCircuitState,
  loadRecentCircuits,
  saveRecentCircuits,
  updateRecentCircuit,
  removeRecentCircuit,
  getRecentCircuits,
  loadCircuitStateById,
  clearCircuitById,
  getStorageInfo,
  CircuitPersistenceData,
  CircuitMetadata,
  SaveResult,
} from './circuitPersistence';
import { PlacedCircuitNode, PlacedInputNode, PlacedGateNode, PlacedOutputNode, CircuitWire } from '../types/circuitCanvas';

// Mock localStorage
let mockStore: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStore[key]; }),
  clear: vi.fn(() => { mockStore = {}; }),
  get length() { return Object.keys(mockStore).length; },
  key: vi.fn((i: number) => Object.keys(mockStore)[i] || null),
};

// Replace localStorage with mock
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Helper to create test circuit data
function createTestNodes(): PlacedCircuitNode[] {
  const inputNode: PlacedInputNode = {
    id: 'input-1',
    type: 'input',
    position: { x: 50, y: 100 },
    label: 'IN1',
    signal: false,
    state: false,
    size: { width: 40, height: 40 },
    parameters: {},
  };
  
  const gateNode: PlacedGateNode = {
    id: 'gate-1',
    type: 'gate',
    position: { x: 200, y: 100 },
    label: 'AND',
    signal: false,
    output: false,
    gateType: 'AND',
    inputCount: 2,
    size: { width: 60, height: 60 },
    parameters: {},
  };
  
  const outputNode: PlacedOutputNode = {
    id: 'output-1',
    type: 'output',
    position: { x: 350, y: 100 },
    label: 'OUT1',
    signal: false,
    inputSignal: false,
    size: { width: 40, height: 40 },
    parameters: {},
  };
  
  return [inputNode, gateNode, outputNode];
}

function createTestWires(): CircuitWire[] {
  return [
    {
      id: 'wire-1',
      sourceNodeId: 'input-1',
      targetNodeId: 'gate-1',
      targetPort: 0,
      signal: false,
      startPoint: { x: 90, y: 100 },
      endPoint: { x: 200, y: 100 },
    },
    {
      id: 'wire-2',
      sourceNodeId: 'gate-1',
      targetNodeId: 'output-1',
      targetPort: 0,
      signal: false,
      startPoint: { x: 260, y: 100 },
      endPoint: { x: 350, y: 100 },
    },
  ];
}

describe('Circuit Persistence Module', () => {
  beforeEach(() => {
    mockStore = {};
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    mockStore = {};
  });

  // ========================================================================
  // Storage Key Tests
  // ========================================================================
  
  describe('Storage Keys', () => {
    it('should have correct CURRENT key', () => {
      expect(CIRCUIT_STORAGE_KEYS.CURRENT).toBe('arcane-circuit-current');
    });
    
    it('should have correct RECENT_LIST key', () => {
      expect(CIRCUIT_STORAGE_KEYS.RECENT_LIST).toBe('arcane-circuit-recent-list');
    });
    
    it('should have correct SLOT_PREFIX key', () => {
      expect(CIRCUIT_STORAGE_KEYS.SLOT_PREFIX).toBe('arcane-circuit-slot');
    });
    
    it('should have correct METADATA key', () => {
      expect(CIRCUIT_STORAGE_KEYS.METADATA).toBe('arcane-circuit-metadata');
    });
    
    it('should have MAX_RECENT_SLOTS = 5', () => {
      expect(MAX_RECENT_SLOTS).toBe(5);
    });
  });

  // ========================================================================
  // Utility Function Tests
  // ========================================================================
  
  describe('Utility Functions', () => {
    it('calculateStorageSize should return correct byte count', () => {
      const data = '{"test": "data"}';
      const size = calculateStorageSize(data);
      expect(size).toBe(data.length);
    });
    
    it('isStorageSizeSafe should detect safe data', () => {
      const smallData = '{"test": "data"}';
      const result = isStorageSizeSafe(smallData);
      expect(result.safe).toBe(true);
    });
    
    it('isStorageSizeSafe should warn on large data', () => {
      // Create data larger than 4MB
      const largeData = JSON.stringify({ data: 'x'.repeat(5 * 1024 * 1024) });
      const result = isStorageSizeSafe(largeData);
      expect(result.safe).toBe(false);
    });
    
    it('generateCircuitId should create unique IDs', () => {
      const id1 = generateCircuitId();
      const id2 = generateCircuitId();
      expect(id1).toMatch(/^circuit-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
    
    it('getSlotKey should return correct slot key', () => {
      expect(getSlotKey(0)).toBe('arcane-circuit-slot-0');
      expect(getSlotKey(4)).toBe('arcane-circuit-slot-4');
    });
  });

  // ========================================================================
  // Save Circuit State Tests
  // ========================================================================
  
  describe('saveCircuitState', () => {
    it('should save circuit state to localStorage', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      const result = saveCircuitState(nodes, wires);
      
      expect(result.success).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
    
    it('should save with custom name', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      const result = saveCircuitState(nodes, wires, [], [], null, undefined, 'My Circuit');
      
      expect(result.success).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
    
    it('should include junctions and layers in save', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      const junctions = [{ id: 'j1', type: 'junction' as const, position: { x: 100, y: 100 }, signal: false, connectionCount: 2, connectedWireIds: [], layerId: undefined }];
      const layers = [{ id: 'l1', name: 'Layer 1', visible: true, color: '#ff0000', order: 0, nodeIds: [], wireIds: [] }];
      
      const result = saveCircuitState(nodes, wires, junctions, layers, 'l1');
      
      expect(result.success).toBe(true);
    });
  });

  // ========================================================================
  // Load Circuit State Tests
  // ========================================================================
  
  describe('loadCircuitState', () => {
    it('should load circuit state from localStorage', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      // First save
      saveCircuitState(nodes, wires);
      
      // Then load
      const loaded = loadCircuitState(0);
      
      expect(loaded).not.toBeNull();
      expect(loaded?.nodes).toHaveLength(3);
      expect(loaded?.wires).toHaveLength(2);
    });
    
    it('should return null when no saved state exists', () => {
      const loaded = loadCircuitState(0);
      expect(loaded).toBeNull();
    });
    
    it('should return null for corrupted data', () => {
      mockStore['arcane-circuit-slot-0'] = 'invalid json';
      
      const loaded = loadCircuitState(0);
      expect(loaded).toBeNull();
    });
    
    it('should return null for invalid structure', () => {
      mockStore['arcane-circuit-slot-0'] = JSON.stringify({ nodes: 'not an array' });
      
      const loaded = loadCircuitState(0);
      expect(loaded).toBeNull();
    });
    
    it('should load current circuit when slotIndex not specified', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      // Save to current slot
      saveCircuitState(nodes, wires);
      
      // Load from current
      const loaded = loadCircuitState();
      
      expect(loaded).not.toBeNull();
    });
  });

  // ========================================================================
  // Clear Circuit State Tests
  // ========================================================================
  
  describe('clearCircuitState', () => {
    it('should clear all circuit data', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      // First save
      saveCircuitState(nodes, wires);
      
      // Then clear
      const result = clearCircuitState();
      
      expect(result).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
    
    it('should clear specific slot', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      // First save
      saveCircuitState(nodes, wires);
      
      // Then clear slot
      const result = clearCircuitState(0);
      
      expect(result).toBe(true);
    });
  });

  // ========================================================================
  // Recent Circuits List Tests
  // ========================================================================
  
  describe('Recent Circuits List', () => {
    it('should save and load recent circuits list', () => {
      const recent = {
        circuits: [
          {
            id: 'test-1',
            name: 'Test Circuit 1',
            nodeCount: 3,
            wireCount: 2,
            junctionCount: 0,
            timestamp: Date.now(),
            slotIndex: 0,
          },
        ],
        updatedAt: Date.now(),
        version: 1,
      };
      
      saveRecentCircuits(recent);
      const loaded = loadRecentCircuits();
      
      expect(loaded.circuits).toHaveLength(1);
      expect(loaded.circuits[0].name).toBe('Test Circuit 1');
    });
    
    it('should update recent circuit when exists', () => {
      const metadata: CircuitMetadata = {
        id: 'test-1',
        name: 'Test Circuit',
        nodeCount: 3,
        wireCount: 2,
        junctionCount: 0,
        timestamp: Date.now(),
        slotIndex: 0,
      };
      
      updateRecentCircuit(metadata);
      const loaded = getRecentCircuits();
      
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('test-1');
    });
    
    it('should add new circuit to beginning of list', () => {
      // Add first circuit
      updateRecentCircuit({
        id: 'test-1',
        name: 'First',
        nodeCount: 1,
        wireCount: 0,
        junctionCount: 0,
        timestamp: Date.now() - 1000,
        slotIndex: 0,
      });
      
      // Add second circuit (newer)
      updateRecentCircuit({
        id: 'test-2',
        name: 'Second',
        nodeCount: 2,
        wireCount: 1,
        junctionCount: 0,
        timestamp: Date.now(),
        slotIndex: 1,
      });
      
      const loaded = getRecentCircuits();
      
      expect(loaded).toHaveLength(2);
      expect(loaded[0].id).toBe('test-2'); // Newer first
      expect(loaded[1].id).toBe('test-1');
    });
    
    it('should limit to MAX_RECENT_SLOTS circuits', () => {
      // Add 7 circuits
      for (let i = 0; i < 7; i++) {
        updateRecentCircuit({
          id: `test-${i}`,
          name: `Circuit ${i}`,
          nodeCount: i,
          wireCount: i,
          junctionCount: 0,
          timestamp: Date.now() + i,
          slotIndex: i,
        });
      }
      
      const loaded = getRecentCircuits();
      
      expect(loaded).toHaveLength(MAX_RECENT_SLOTS);
    });
    
    it('should remove circuit from recent list', () => {
      updateRecentCircuit({
        id: 'test-1',
        name: 'To Remove',
        nodeCount: 1,
        wireCount: 0,
        junctionCount: 0,
        timestamp: Date.now(),
        slotIndex: 0,
      });
      
      removeRecentCircuit('test-1');
      
      const loaded = getRecentCircuits();
      expect(loaded.find(c => c.id === 'test-1')).toBeUndefined();
    });
    
    it('should return empty list when no recent circuits', () => {
      const loaded = getRecentCircuits();
      expect(loaded).toHaveLength(0);
    });
  });

  // ========================================================================
  // Load Circuit By ID Tests
  // ========================================================================
  
  describe('loadCircuitStateById', () => {
    it('should load circuit by ID', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      // Save with specific ID
      saveCircuitState(nodes, wires, [], [], null, 'my-circuit-id', 'Named Circuit');
      
      // Load by ID
      const loaded = loadCircuitStateById('my-circuit-id');
      
      expect(loaded).not.toBeNull();
      expect(loaded?.nodes).toHaveLength(3);
    });
    
    it('should return null for non-existent ID', () => {
      const loaded = loadCircuitStateById('non-existent');
      expect(loaded).toBeNull();
    });
  });

  // ========================================================================
  // Clear Circuit By ID Tests
  // ========================================================================
  
  describe('clearCircuitById', () => {
    it('should clear circuit by ID', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      // Save with specific ID
      saveCircuitState(nodes, wires, [], [], null, 'my-circuit-id', 'Named Circuit');
      
      // Clear by ID
      const result = clearCircuitById('my-circuit-id');
      
      expect(result).toBe(true);
      
      // Verify it's cleared
      const loaded = loadCircuitStateById('my-circuit-id');
      expect(loaded).toBeNull();
    });
  });

  // ========================================================================
  // Storage Info Tests
  // ========================================================================
  
  describe('getStorageInfo', () => {
    it('should return storage statistics', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      saveCircuitState(nodes, wires);
      
      const info = getStorageInfo();
      
      expect(info.available).toBe(true);
      expect(info.circuitCount).toBeGreaterThanOrEqual(1);
      expect(info.usedBytes).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // AC-151-001: Save After Adding Nodes and Wires
  // ========================================================================
  
  describe('AC-151-001: saveCircuitToStorage after adding 3 nodes and 2 wires', () => {
    it('should persist state with correct node count', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      // Save state
      const result = saveCircuitState(nodes, wires);
      
      expect(result.success).toBe(true);
      
      // Verify in localStorage
      const savedCircuit = mockStore['arcane-circuit-current'];
      
      expect(savedCircuit).toBeDefined();
      
      const parsed = JSON.parse(savedCircuit);
      expect(parsed.nodes).toHaveLength(3);
      expect(parsed.wires).toHaveLength(2);
    });
  });

  // ========================================================================
  // AC-151-003: getRecentCircuits Returns Circuit Metadata
  // ========================================================================
  
  describe('AC-151-003: getRecentCircuits returns saved circuits', () => {
    it('should return recent circuits with id, name, timestamp, nodeCount, wireCount', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      saveCircuitState(nodes, wires, [], [], null, undefined, 'Test Circuit');
      
      const recent = getRecentCircuits();
      
      expect(recent.length).toBeGreaterThanOrEqual(1);
      
      const circuit = recent[0];
      expect(circuit.id).toBeDefined();
      expect(circuit.name).toBe('Test Circuit');
      expect(circuit.timestamp).toBeDefined();
      expect(circuit.nodeCount).toBe(3);
      expect(circuit.wireCount).toBe(2);
    });
  });

  // ========================================================================
  // AC-151-004: clearStoredCircuit Removes Circuit
  // ========================================================================
  
  describe('AC-151-004: clearStoredCircuit removes circuit', () => {
    it('should remove circuit and subsequent load returns null', () => {
      const nodes = createTestNodes();
      const wires = createTestWires();
      
      // Save
      saveCircuitState(nodes, wires);
      
      // Clear
      clearCircuitState();
      
      // Try to load
      const loaded = loadCircuitState();
      
      expect(loaded).toBeNull();
    });
  });

  // ========================================================================
  // AC-151-008: Multiple Circuit Slots
  // ========================================================================
  
  describe('AC-151-008: Multiple circuit slots work', () => {
    it('should store different circuits in different slots', () => {
      const nodes1 = [createTestNodes()[0]]; // 1 node
      const nodes2 = createTestNodes(); // 3 nodes
      const wires1: CircuitWire[] = [];
      const wires2 = createTestWires();
      
      // Save circuit 1 with explicit ID
      const result1 = saveCircuitState(nodes1, wires1, [], [], null, 'circuit-1', 'Slot 0 Circuit');
      expect(result1.success).toBe(true);
      expect(result1.slotIndex).toBe(0);
      
      // Save circuit 2 with explicit ID (different from first)
      const result2 = saveCircuitState(nodes2, wires2, [], [], null, 'circuit-2', 'Slot 1 Circuit');
      expect(result2.success).toBe(true);
      
      // Slots should be different - circuit 2 should get slot 1
      expect(result2.slotIndex).toBe(1);
      
      // Load both directly from their slots
      const loaded1 = loadCircuitState(0);
      const loaded2 = loadCircuitState(1);
      
      expect(loaded1?.nodes).toHaveLength(1);
      expect(loaded2?.nodes).toHaveLength(3);
    });
  });
});
