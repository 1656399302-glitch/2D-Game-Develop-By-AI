/**
 * Duplicate Detector Tests
 */

import {
  createMachineSignature,
  calculateSignatureSimilarity,
  checkDuplicate,
  isIdenticalMachine,
  shouldWarnDuplicate,
  getSimilarityDetails,
} from '../utils/duplicateDetector';
import { PlacedModule, Connection } from '../types';

// Helper to create a basic module
const createModule = (id: string, type: string, x: number, y: number): PlacedModule => ({
  id,
  instanceId: id,
  type: type as any,
  x,
  y,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [],
});

// Helper to create a connection
const createConnection = (
  id: string,
  sourceId: string,
  targetId: string
): Connection => ({
  id,
  sourceModuleId: sourceId,
  sourcePortId: `${sourceId}-output`,
  targetModuleId: targetId,
  targetPortId: `${targetId}-input`,
  pathData: '',
});

describe('duplicateDetector', () => {
  describe('createMachineSignature', () => {
    it('should create signature for empty machine', () => {
      const signature = createMachineSignature([], []);
      
      expect(signature.moduleCount).toBe(0);
      expect(signature.connectionCount).toBe(0);
      expect(signature.moduleTypes).toBe('');
    });

    it('should create signature with module types', () => {
      const modules = [
        createModule('m1', 'core-furnace', 0, 0),
        createModule('m2', 'gear', 50, 50),
      ];
      
      const signature = createMachineSignature(modules, []);
      
      expect(signature.moduleCount).toBe(2);
      expect(signature.moduleTypes).toContain('core-furnace');
      expect(signature.moduleTypes).toContain('gear');
    });

    it('should include connection count', () => {
      const modules = [createModule('m1', 'core-furnace', 0, 0)];
      const connections = [createConnection('c1', 'm1', 'm1')];
      
      const signature = createMachineSignature(modules, connections);
      
      expect(signature.connectionCount).toBe(1);
    });
  });

  describe('calculateSignatureSimilarity', () => {
    it('should return 100% for identical signatures', () => {
      const sig1 = createMachineSignature([], []);
      const sig2 = createMachineSignature([], []);
      
      const similarity = calculateSignatureSimilarity(sig1, sig2);
      
      expect(similarity).toBe(100);
    });

    it('should return lower similarity for different module counts', () => {
      const sig1 = createMachineSignature(
        [createModule('m1', 'core-furnace', 0, 0)],
        []
      );
      const sig2 = createMachineSignature(
        [
          createModule('m1', 'core-furnace', 0, 0),
          createModule('m2', 'gear', 50, 50),
        ],
        []
      );
      
      const similarity = calculateSignatureSimilarity(sig1, sig2);
      
      expect(similarity).toBeLessThan(100);
    });

    it('should return lower similarity for different module types', () => {
      const sig1 = createMachineSignature(
        [createModule('m1', 'core-furnace', 0, 0)],
        []
      );
      const sig2 = createMachineSignature(
        [createModule('m1', 'gear', 0, 0)],
        []
      );
      
      const similarity = calculateSignatureSimilarity(sig1, sig2);
      
      expect(similarity).toBeLessThan(100);
    });
  });

  describe('checkDuplicate', () => {
    it('should not trigger warning for empty machine', () => {
      const result = checkDuplicate([], [], [{ id: 'existing', name: 'Test', modules: [], connections: [] }]);
      
      expect(result.isDuplicate).toBe(false);
      expect(result.similarity).toBe(0);
    });

    it('should trigger warning at 80% similarity', () => {
      const modules1 = [
        createModule('m1', 'core-furnace', 0, 0),
        createModule('m2', 'gear', 50, 50),
      ];
      const modules2 = [
        createModule('m3', 'core-furnace', 0, 0),
        createModule('m4', 'gear', 50, 50),
      ];
      
      const result = checkDuplicate(modules1, [], [
        { id: 'existing', name: 'Existing Machine', modules: modules2, connections: [] },
      ]);
      
      expect(result.similarity).toBe(100);
      expect(result.isDuplicate).toBe(true);
    });

    it('should not trigger warning below 80% similarity', () => {
      const modules1 = [
        createModule('m1', 'core-furnace', 0, 0),
      ];
      const modules2 = [
        createModule('m2', 'gear', 50, 50),
        createModule('m3', 'rune-node', 100, 100),
      ];
      
      const result = checkDuplicate(modules1, [], [
        { id: 'existing', name: 'Existing Machine', modules: modules2, connections: [] },
      ]);
      
      expect(result.similarity).toBeLessThan(80);
      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('isIdenticalMachine', () => {
    it('should return true for identical machines', () => {
      const machine1 = {
        modules: [createModule('m1', 'core-furnace', 0, 0)],
        connections: [],
      };
      const machine2 = {
        modules: [createModule('m2', 'core-furnace', 0, 0)],
        connections: [],
      };
      
      expect(isIdenticalMachine(machine1, machine2)).toBe(true);
    });

    it('should return false for different machines', () => {
      const machine1 = {
        modules: [createModule('m1', 'core-furnace', 0, 0)],
        connections: [],
      };
      const machine2 = {
        modules: [createModule('m1', 'gear', 0, 0)],
        connections: [],
      };
      
      expect(isIdenticalMachine(machine1, machine2)).toBe(false);
    });

    it('should return true for both empty machines', () => {
      expect(isIdenticalMachine({ modules: [], connections: [] }, { modules: [], connections: [] })).toBe(true);
    });
  });

  describe('shouldWarnDuplicate', () => {
    it('should return true when similarity >= threshold', () => {
      const modules = [createModule('m1', 'core-furnace', 0, 0)];
      const existing = [{ id: 'e1', name: 'Test', modules: [createModule('m2', 'core-furnace', 0, 0)], connections: [] }];
      
      expect(shouldWarnDuplicate(modules, [], existing, 80)).toBe(true);
    });

    it('should return false when similarity < threshold', () => {
      const modules = [createModule('m1', 'core-furnace', 0, 0)];
      const existing = [
        { id: 'e1', name: 'Test', modules: [
          createModule('m2', 'gear', 0, 0),
          createModule('m3', 'rune-node', 50, 50),
        ], connections: [] },
      ];
      
      expect(shouldWarnDuplicate(modules, [], existing, 80)).toBe(false);
    });
  });

  describe('getSimilarityDetails', () => {
    it('should return correct similarity details', () => {
      const modules1 = [createModule('m1', 'core-furnace', 0, 0)];
      const modules2 = [createModule('m2', 'core-furnace', 0, 0)];
      
      const details = getSimilarityDetails(modules1, [], { modules: modules2, connections: [] });
      
      expect(details.moduleCountDiff).toBe(0);
      expect(details.connectionCountDiff).toBe(0);
      expect(details.moduleTypeMatch).toBe(100);
      expect(details.overallSimilarity).toBe(100);
    });
  });
});
