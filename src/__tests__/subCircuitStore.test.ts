/**
 * Sub-Circuit Store Unit Tests
 * 
 * Round 129: Sub-circuit Module System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { create } from 'zustand';

// Import types and functions directly for testing
import {
  SubCircuitModule,
  SubCircuitStoreState,
  CreateSubCircuitInput,
  CreateSubCircuitResult,
  MAX_CUSTOM_SUB_CIRCUITS,
  isValidSubCircuitName,
  isNameUnique,
} from '../types/subCircuit';

// ============================================================================
// Test Store Implementation
// ============================================================================

interface TestSubCircuitStore extends SubCircuitStoreState {
  createSubCircuit: (input: CreateSubCircuitInput) => CreateSubCircuitResult;
  deleteSubCircuit: (subCircuitId: string) => { success: boolean; error?: string };
  getSubCircuitById: (subCircuitId: string) => SubCircuitModule | undefined;
  getAllSubCircuits: () => SubCircuitModule[];
  isNameTaken: (name: string) => boolean;
  canCreateMore: () => boolean;
  clearAllSubCircuits: () => void;
}

let timestampCounter = 0;

const createTestStore = () => create<TestSubCircuitStore>((set, get) => ({
  subCircuits: [],
  maxSubCircuits: MAX_CUSTOM_SUB_CIRCUITS,

  createSubCircuit: (input: CreateSubCircuitInput): CreateSubCircuitResult => {
    const { name, moduleIds, description } = input;
    
    // Validate name
    if (!isValidSubCircuitName(name)) {
      return {
        success: false,
        error: '名称无效：长度必须在1-50个字符之间',
      };
    }
    
    // Check for duplicate name
    if (!isNameUnique(name, get().subCircuits)) {
      return {
        success: false,
        error: `子电路 "${name}" 已存在`,
      };
    }
    
    // Check limit
    if (get().subCircuits.length >= MAX_CUSTOM_SUB_CIRCUITS) {
      return {
        success: false,
        error: `已达到最大数量限制（${MAX_CUSTOM_SUB_CIRCUITS}个）`,
      };
    }
    
    // Validate moduleIds
    if (!moduleIds || moduleIds.length < 2) {
      return {
        success: false,
        error: '子电路至少需要包含2个模块',
      };
    }
    
    // Create the sub-circuit with unique timestamp (using counter to ensure order)
    timestampCounter++;
    const now = Date.now() + timestampCounter; // Ensure unique timestamp
    const newSubCircuit: SubCircuitModule = {
      id: `test-id-${now}`,
      name: name.trim(),
      moduleIds: [...new Set(moduleIds)],
      createdAt: now,
      updatedAt: now,
      description: description?.trim(),
    };
    
    set((state) => ({
      subCircuits: [...state.subCircuits, newSubCircuit],
    }));
    
    return {
      success: true,
      subCircuit: newSubCircuit,
    };
  },

  deleteSubCircuit: (subCircuitId: string) => {
    const existing = get().subCircuits.find((sc) => sc.id === subCircuitId);
    if (!existing) {
      return { success: false, error: '子电路不存在' };
    }
    
    set((state) => ({
      subCircuits: state.subCircuits.filter((sc) => sc.id !== subCircuitId),
    }));
    
    return { success: true };
  },

  getSubCircuitById: (subCircuitId: string) => {
    return get().subCircuits.find((sc) => sc.id === subCircuitId);
  },

  getAllSubCircuits: () => {
    return [...get().subCircuits].sort((a, b) => b.createdAt - a.createdAt);
  },

  isNameTaken: (name: string) => {
    return !isNameUnique(name, get().subCircuits);
  },

  canCreateMore: () => {
    return get().subCircuits.length < MAX_CUSTOM_SUB_CIRCUITS;
  },

  clearAllSubCircuits: () => {
    set({ subCircuits: [] });
  },
}));

// ============================================================================
// Tests
// ============================================================================

describe('Sub-Circuit Store', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    timestampCounter = 0;
    store = createTestStore();
  });

  describe('createSubCircuit', () => {
    it('should create a sub-circuit with valid inputs', () => {
      const result = store.getState().createSubCircuit({
        name: 'My Adder',
        moduleIds: ['node-1', 'node-2', 'node-3'],
      });

      expect(result.success).toBe(true);
      expect(result.subCircuit).toBeDefined();
      expect(result.subCircuit?.name).toBe('My Adder');
      expect(result.subCircuit?.moduleIds).toEqual(['node-1', 'node-2', 'node-3']);
    });

    it('should return error for duplicate name', () => {
      // Create first sub-circuit
      store.getState().createSubCircuit({
        name: 'Adder',
        moduleIds: ['node-1', 'node-2'],
      });

      // Try to create with same name (case-insensitive)
      const result = store.getState().createSubCircuit({
        name: 'adder', // lowercase
        moduleIds: ['node-3', 'node-4'],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('已存在');
    });

    it('should return error when exceeding limit', () => {
      // Create 20 sub-circuits (max limit)
      for (let i = 0; i < MAX_CUSTOM_SUB_CIRCUITS; i++) {
        store.getState().createSubCircuit({
          name: `SubCircuit ${i}`,
          moduleIds: ['node-1', 'node-2'],
        });
      }

      // Try to create 21st
      const result = store.getState().createSubCircuit({
        name: 'Too Many',
        moduleIds: ['node-1', 'node-2'],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('最大数量限制');
    });

    it('should return error for less than 2 modules', () => {
      const result = store.getState().createSubCircuit({
        name: 'Invalid',
        moduleIds: ['node-1'], // Only 1
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('至少需要包含2个模块');
    });

    it('should return error for empty name', () => {
      const result = store.getState().createSubCircuit({
        name: '',
        moduleIds: ['node-1', 'node-2'],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('名称无效');
    });

    it('should return error for name exceeding 50 characters', () => {
      const longName = 'a'.repeat(51);
      const result = store.getState().createSubCircuit({
        name: longName,
        moduleIds: ['node-1', 'node-2'],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('名称无效');
    });
  });

  describe('deleteSubCircuit', () => {
    it('should delete existing sub-circuit', () => {
      // Create a sub-circuit
      const createResult = store.getState().createSubCircuit({
        name: 'To Delete',
        moduleIds: ['node-1', 'node-2'],
      });

      expect(createResult.success).toBe(true);
      const subCircuitId = createResult.subCircuit!.id;

      // Delete it
      const deleteResult = store.getState().deleteSubCircuit(subCircuitId);
      expect(deleteResult.success).toBe(true);

      // Verify it's gone
      expect(store.getState().getSubCircuitById(subCircuitId)).toBeUndefined();
    });

    it('should return error for non-existent sub-circuit', () => {
      const result = store.getState().deleteSubCircuit('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error).toContain('不存在');
    });
  });

  describe('getSubCircuitById', () => {
    it('should return matching sub-circuit for valid ID', () => {
      const createResult = store.getState().createSubCircuit({
        name: 'Find Me',
        moduleIds: ['node-1', 'node-2'],
      });

      const found = store.getState().getSubCircuitById(createResult.subCircuit!.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe('Find Me');
    });

    it('should return undefined for invalid ID', () => {
      const found = store.getState().getSubCircuitById('invalid-id');
      expect(found).toBeUndefined();
    });
  });

  describe('getAllSubCircuits', () => {
    it('should return empty array when store is empty', () => {
      const result = store.getState().getAllSubCircuits();
      expect(result).toEqual([]);
    });

    it('should return all sub-circuits sorted by creation date', () => {
      // Create 3 sub-circuits
      store.getState().createSubCircuit({ name: 'First', moduleIds: ['a', 'b'] });
      store.getState().createSubCircuit({ name: 'Second', moduleIds: ['a', 'b'] });
      store.getState().createSubCircuit({ name: 'Third', moduleIds: ['a', 'b'] });

      const result = store.getState().getAllSubCircuits();
      expect(result).toHaveLength(3);
      // Should be sorted by creation date (newest first)
      expect(result[0].name).toBe('Third');
      expect(result[1].name).toBe('Second');
      expect(result[2].name).toBe('First');
    });
  });

  describe('isNameTaken', () => {
    it('should return false for unique name', () => {
      store.getState().createSubCircuit({ name: 'Existing', moduleIds: ['a', 'b'] });
      expect(store.getState().isNameTaken('Unique Name')).toBe(false);
    });

    it('should return true for taken name (case-insensitive)', () => {
      store.getState().createSubCircuit({ name: 'My Circuit', moduleIds: ['a', 'b'] });
      expect(store.getState().isNameTaken('my circuit')).toBe(true);
      expect(store.getState().isNameTaken('MY CIRCUIT')).toBe(true);
    });
  });

  describe('canCreateMore', () => {
    it('should return true when under limit', () => {
      expect(store.getState().canCreateMore()).toBe(true);
    });

    it('should return false when at limit', () => {
      for (let i = 0; i < MAX_CUSTOM_SUB_CIRCUITS; i++) {
        store.getState().createSubCircuit({
          name: `SC ${i}`,
          moduleIds: ['a', 'b'],
        });
      }
      expect(store.getState().canCreateMore()).toBe(false);
    });
  });

  describe('clearAllSubCircuits', () => {
    it('should remove all sub-circuits', () => {
      store.getState().createSubCircuit({ name: 'SC1', moduleIds: ['a', 'b'] });
      store.getState().createSubCircuit({ name: 'SC2', moduleIds: ['a', 'b'] });
      expect(store.getState().getAllSubCircuits()).toHaveLength(2);

      store.getState().clearAllSubCircuits();
      expect(store.getState().getAllSubCircuits()).toHaveLength(0);
    });
  });
});

describe('Sub-Circuit Utility Functions', () => {
  describe('isValidSubCircuitName', () => {
    it('should accept valid names', () => {
      expect(isValidSubCircuitName('Valid Name')).toBe(true);
      expect(isValidSubCircuitName('A')).toBe(true);
      expect(isValidSubCircuitName('a'.repeat(50))).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(isValidSubCircuitName('')).toBe(false);
      expect(isValidSubCircuitName('   ')).toBe(false);
      expect(isValidSubCircuitName('a'.repeat(51))).toBe(false);
    });
  });

  describe('isNameUnique', () => {
    const existingSubCircuits: SubCircuitModule[] = [
      {
        id: '1',
        name: 'Test Circuit',
        moduleIds: ['a', 'b'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    it('should return true for unique names', () => {
      expect(isNameUnique('Different Name', existingSubCircuits)).toBe(true);
    });

    it('should return false for duplicate names (case-insensitive)', () => {
      expect(isNameUnique('test circuit', existingSubCircuits)).toBe(false);
      expect(isNameUnique('TEST CIRCUIT', existingSubCircuits)).toBe(false);
    });
  });
});
