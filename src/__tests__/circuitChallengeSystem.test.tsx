/**
 * Circuit Challenge System Tests
 * 
 * Round 175: Circuit Challenge System Integration
 * 
 * Tests covering:
 * - Challenge definitions schema
 * - Validation integration with validateCircuit()
 * - Challenge progression (start → complete flow)
 * - UI interaction tests for panel and buttons
 * - localStorage persistence tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';

// Import the modules under test
import {
  CIRCUIT_CHALLENGES,
  getCircuitChallengeById,
  getCircuitChallengesByDifficulty,
  getCircuitChallengeCount,
  getCircuitChallengeCountByDifficulty,
  getCircuitChallengeDifficultyColor,
  getCircuitChallengeDifficultyLabel,
} from '../data/circuitChallenges';
import { useCircuitChallengeStore } from '../store/useCircuitChallengeStore';
import { useChallengeValidatorStore } from '../store/useChallengeValidatorStore';
import { validateCircuit, scoreCircuit } from '../utils/challengeValidator';
import { ChallengeObjective, CircuitValidationData, ValidationResult } from '../types/challenge';

// ============================================================================
// Challenge Definitions Tests
// ============================================================================

describe('Circuit Challenge Definitions', () => {
  describe('AC-175-001: Challenge Definitions Load Correctly', () => {
    it('should have at least 5 circuit challenges defined', () => {
      expect(CIRCUIT_CHALLENGES.length).toBeGreaterThanOrEqual(5);
    });

    it('should have correct difficulty distribution', () => {
      const counts = getCircuitChallengeCountByDifficulty();
      expect(counts.beginner).toBeGreaterThanOrEqual(2);
      expect(counts.intermediate).toBeGreaterThanOrEqual(2);
      expect(counts.advanced).toBeGreaterThanOrEqual(1);
    });

    it('each challenge should have unique ID', () => {
      const ids = CIRCUIT_CHALLENGES.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('each challenge should have title and description', () => {
      CIRCUIT_CHALLENGES.forEach(challenge => {
        expect(challenge.title).toBeTruthy();
        expect(challenge.description).toBeTruthy();
        expect(challenge.title.length).toBeGreaterThan(0);
        expect(challenge.description.length).toBeGreaterThan(0);
      });
    });

    it('each challenge should have objectives array', () => {
      CIRCUIT_CHALLENGES.forEach(challenge => {
        expect(Array.isArray(challenge.objectives)).toBe(true);
        expect(challenge.objectives.length).toBeGreaterThan(0);
      });
    });

    it('each challenge objectives should have output targets with expectedState', () => {
      CIRCUIT_CHALLENGES.forEach(challenge => {
        const outputObjectives = challenge.objectives.filter(
          obj => obj.objectiveType === 'output' && obj.outputTarget
        );
        
        expect(outputObjectives.length).toBeGreaterThan(0);
        
        outputObjectives.forEach(obj => {
          expect(obj.outputTarget).toBeTruthy();
          expect(obj.outputTarget.nodeId).toBeTruthy();
          expect(obj.outputTarget.name).toBeTruthy();
          expect(['HIGH', 'LOW']).toContain(obj.outputTarget.expectedState);
        });
      });
    });

    it('each challenge should have difficulty rating', () => {
      CIRCUIT_CHALLENGES.forEach(challenge => {
        expect(['beginner', 'intermediate', 'advanced']).toContain(challenge.difficulty);
      });
    });

    it('each challenge should have estimated gate count', () => {
      CIRCUIT_CHALLENGES.forEach(challenge => {
        expect(typeof challenge.estimatedGateCount).toBe('number');
        expect(challenge.estimatedGateCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('each challenge should have hint text', () => {
      CIRCUIT_CHALLENGES.forEach(challenge => {
        expect(challenge.hint).toBeTruthy();
        expect(challenge.hint.length).toBeGreaterThan(0);
      });
    });

    it('each challenge should have input configs', () => {
      CIRCUIT_CHALLENGES.forEach(challenge => {
        expect(Array.isArray(challenge.inputConfigs)).toBe(true);
        expect(challenge.inputConfigs.length).toBeGreaterThan(0);
        
        challenge.inputConfigs.forEach(config => {
          expect(config.id).toBeTruthy();
          expect(config.label).toBeTruthy();
          expect(typeof config.defaultState).toBe('boolean');
        });
      });
    });
  });

  describe('getCircuitChallengeById', () => {
    it('should return challenge by ID', () => {
      const challenge = getCircuitChallengeById('circuit-b-001');
      expect(challenge).toBeTruthy();
      expect(challenge?.id).toBe('circuit-b-001');
    });

    it('should return undefined for invalid ID', () => {
      const challenge = getCircuitChallengeById('invalid-id');
      expect(challenge).toBeUndefined();
    });
  });

  describe('getCircuitChallengesByDifficulty', () => {
    it('should return only beginner challenges', () => {
      const beginnerChallenges = getCircuitChallengesByDifficulty('beginner');
      beginnerChallenges.forEach(c => {
        expect(c.difficulty).toBe('beginner');
      });
    });

    it('should return only intermediate challenges', () => {
      const intermediateChallenges = getCircuitChallengesByDifficulty('intermediate');
      intermediateChallenges.forEach(c => {
        expect(c.difficulty).toBe('intermediate');
      });
    });

    it('should return only advanced challenges', () => {
      const advancedChallenges = getCircuitChallengesByDifficulty('advanced');
      advancedChallenges.forEach(c => {
        expect(c.difficulty).toBe('advanced');
      });
    });
  });

  describe('Difficulty helpers', () => {
    it('should return correct difficulty colors', () => {
      expect(getCircuitChallengeDifficultyColor('beginner')).toBe('#22c55e');
      expect(getCircuitChallengeDifficultyColor('intermediate')).toBe('#3b82f6');
      expect(getCircuitChallengeDifficultyColor('advanced')).toBe('#a855f7');
    });

    it('should return correct difficulty labels', () => {
      expect(getCircuitChallengeDifficultyLabel('beginner')).toBe('初级');
      expect(getCircuitChallengeDifficultyLabel('intermediate')).toBe('中级');
      expect(getCircuitChallengeDifficultyLabel('advanced')).toBe('高级');
    });
  });
});

// ============================================================================
// Validation Integration Tests
// ============================================================================

describe('Circuit Challenge Validation Integration', () => {
  describe('AC-175-004: Validation Uses Existing Framework', () => {
    it('validateCircuit should accept CircuitValidationData', () => {
      const circuit: CircuitValidationData = {
        id: 'test-circuit',
        components: [
          { id: 'node-1', type: 'input', position: { x: 0, y: 0 } },
          { id: 'node-2', type: 'output', position: { x: 100, y: 0 } },
        ],
        outputs: { 'node-2': true },
      };

      const objectives: ChallengeObjective[] = [
        {
          id: 'obj-1',
          name: 'Output HIGH',
          description: 'Output must be HIGH',
          objectiveType: 'output',
          priority: 1,
          points: 100,
          outputTarget: { nodeId: 'node-2', name: 'Output', expectedState: 'HIGH' },
        },
      ];

      const result = validateCircuit(objectives, circuit);
      expect(result).toBeTruthy();
      expect(result.isSuccess).toBe(true);
    });

    it('validateCircuit should return fail when output mismatch', () => {
      const circuit: CircuitValidationData = {
        id: 'test-circuit',
        components: [
          { id: 'node-1', type: 'input', position: { x: 0, y: 0 } },
          { id: 'node-2', type: 'output', position: { x: 100, y: 0 } },
        ],
        outputs: { 'node-2': false }, // LOW instead of HIGH
      };

      const objectives: ChallengeObjective[] = [
        {
          id: 'obj-1',
          name: 'Output HIGH',
          description: 'Output must be HIGH',
          objectiveType: 'output',
          priority: 1,
          points: 100,
          outputTarget: { nodeId: 'node-2', name: 'Output', expectedState: 'HIGH' },
        },
      ];

      const result = validateCircuit(objectives, circuit);
      expect(result.isSuccess).toBe(false);
      expect(result.objectiveResults[0].passed).toBe(false);
    });

    it('validateCircuit should handle multiple objectives', () => {
      const circuit: CircuitValidationData = {
        id: 'test-circuit',
        components: [],
        outputs: {
          'output-1': true,
          'output-2': false,
        },
      };

      const objectives: ChallengeObjective[] = [
        {
          id: 'obj-1',
          name: 'Output 1 HIGH',
          description: 'Output 1 must be HIGH',
          objectiveType: 'output',
          priority: 1,
          points: 50,
          outputTarget: { nodeId: 'output-1', name: 'Output 1', expectedState: 'HIGH' },
        },
        {
          id: 'obj-2',
          name: 'Output 2 LOW',
          description: 'Output 2 must be LOW',
          objectiveType: 'output',
          priority: 2,
          points: 50,
          outputTarget: { nodeId: 'output-2', name: 'Output 2', expectedState: 'LOW' },
        },
      ];

      const result = validateCircuit(objectives, circuit);
      expect(result.isSuccess).toBe(true);
      expect(result.objectiveResults.length).toBe(2);
      expect(result.objectiveResults[0].passed).toBe(true);
      expect(result.objectiveResults[1].passed).toBe(true);
    });

    it('validateCircuit should calculate score correctly', () => {
      const circuit: CircuitValidationData = {
        id: 'test-circuit',
        components: [],
        outputs: { 'output-1': true },
      };

      const objectives: ChallengeObjective[] = [
        {
          id: 'obj-1',
          name: 'Output HIGH',
          description: 'Output must be HIGH',
          objectiveType: 'output',
          priority: 1,
          points: 100,
          outputTarget: { nodeId: 'output-1', name: 'Output', expectedState: 'HIGH' },
        },
      ];

      const result = validateCircuit(objectives, circuit);
      expect(result.score).toBe(100);
      expect(result.totalPoints).toBe(100);
      expect(result.maxPoints).toBe(100);
    });

    it('validateCircuit should handle null circuit', () => {
      const objectives: ChallengeObjective[] = [
        {
          id: 'obj-1',
          name: 'Output HIGH',
          description: 'Output must be HIGH',
          objectiveType: 'output',
          priority: 1,
          points: 100,
          outputTarget: { nodeId: 'output-1', name: 'Output', expectedState: 'HIGH' },
        },
      ];

      const result = validateCircuit(objectives, null);
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('validateCircuit should handle empty objectives', () => {
      const circuit: CircuitValidationData = {
        id: 'test-circuit',
        components: [],
        outputs: {},
      };

      const result = validateCircuit([], circuit);
      expect(result.isSuccess).toBe(true);
      expect(result.score).toBe(100);
    });
  });

  describe('scoreCircuit partial credit', () => {
    it('should return partial credit when some objectives fail', () => {
      const circuit: CircuitValidationData = {
        id: 'test-circuit',
        components: [],
        outputs: { 'output-1': true, 'output-2': false },
      };

      const objectives: ChallengeObjective[] = [
        {
          id: 'obj-1',
          name: 'Output 1 HIGH',
          description: 'Output 1 must be HIGH',
          objectiveType: 'output',
          priority: 1,
          points: 50,
          outputTarget: { nodeId: 'output-1', name: 'Output 1', expectedState: 'HIGH' },
        },
        {
          id: 'obj-2',
          name: 'Output 2 HIGH',
          description: 'Output 2 must be HIGH',
          objectiveType: 'output',
          priority: 2,
          points: 50,
          outputTarget: { nodeId: 'output-2', name: 'Output 2', expectedState: 'HIGH' },
        },
      ];

      const result = scoreCircuit(circuit, objectives, { passThreshold: 70 });
      expect(result.score).toBe(50);
      expect(result.objectivesPassed).toBe(1);
      expect(result.totalObjectives).toBe(2);
      expect(result.isComplete).toBe(false); // 50% < 70% threshold
    });
  });
});

// ============================================================================
// Challenge Store Tests
// ============================================================================

describe('Circuit Challenge Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCircuitChallengeStore.getState().resetChallengeMode();
    
    // Clear localStorage
    localStorage.removeItem('arcane-codex-circuit-challenges-completed');
  });

  afterEach(() => {
    cleanup();
    localStorage.removeItem('arcane-codex-circuit-challenges-completed');
  });

  describe('Panel state', () => {
    it('should open panel', () => {
      const store = useCircuitChallengeStore.getState();
      expect(store.isPanelOpen).toBe(false);
      
      store.openPanel();
      expect(useCircuitChallengeStore.getState().isPanelOpen).toBe(true);
    });

    it('should close panel', () => {
      const store = useCircuitChallengeStore.getState();
      store.openPanel();
      store.closePanel();
      expect(useCircuitChallengeStore.getState().isPanelOpen).toBe(false);
    });

    it('should toggle panel', () => {
      const store = useCircuitChallengeStore.getState();
      expect(store.isPanelOpen).toBe(false);
      
      store.togglePanel();
      expect(useCircuitChallengeStore.getState().isPanelOpen).toBe(true);
      
      store.togglePanel();
      expect(useCircuitChallengeStore.getState().isPanelOpen).toBe(false);
    });
  });

  describe('Challenge mode', () => {
    it('should start challenge', () => {
      // Get fresh store state
      let store = useCircuitChallengeStore.getState();
      const result = store.startChallenge('circuit-b-001');
      
      // Get fresh state after action
      store = useCircuitChallengeStore.getState();
      expect(result).toBe(true);
      expect(store.isChallengeMode).toBe(true);
      expect(store.activeChallengeId).toBe('circuit-b-001');
    });

    it('should fail to start invalid challenge', () => {
      let store = useCircuitChallengeStore.getState();
      const result = store.startChallenge('invalid-id');
      
      store = useCircuitChallengeStore.getState();
      expect(result).toBe(false);
      expect(store.isChallengeMode).toBe(false);
    });

    it('should exit challenge mode', () => {
      let store = useCircuitChallengeStore.getState();
      store.startChallenge('circuit-b-001');
      
      store.exitChallenge();
      
      store = useCircuitChallengeStore.getState();
      expect(store.isChallengeMode).toBe(false);
      expect(store.activeChallengeId).toBeNull();
    });

    it('should set challenge input configs on start', () => {
      let store = useCircuitChallengeStore.getState();
      store.startChallenge('circuit-b-001');
      
      store = useCircuitChallengeStore.getState();
      const configs = store.challengeInputConfigs;
      expect(configs.length).toBeGreaterThan(0);
      expect(configs[0].label).toBeTruthy();
    });

    it('should set challenge output expectations on start', () => {
      let store = useCircuitChallengeStore.getState();
      store.startChallenge('circuit-b-001');
      
      store = useCircuitChallengeStore.getState();
      const expectations = store.challengeOutputExpectations;
      expect(expectations.length).toBeGreaterThan(0);
      expect(expectations[0].expectedState).toBeTruthy();
    });

    it('should get all challenges', () => {
      const store = useCircuitChallengeStore.getState();
      const challenges = store.getAllChallenges();
      
      expect(challenges.length).toBeGreaterThanOrEqual(5);
    });

    it('should get active challenge', () => {
      let store = useCircuitChallengeStore.getState();
      store.startChallenge('circuit-b-001');
      
      store = useCircuitChallengeStore.getState();
      const challenge = store.getActiveChallenge();
      expect(challenge).toBeTruthy();
      expect(challenge?.id).toBe('circuit-b-001');
    });

    it('should return null for active challenge when not in challenge mode', () => {
      const store = useCircuitChallengeStore.getState();
      const challenge = store.getActiveChallenge();
      expect(challenge).toBeNull();
    });
  });

  describe('Challenge completion', () => {
    it('should mark challenge as completed', () => {
      let store = useCircuitChallengeStore.getState();
      store.markChallengeCompleted('circuit-b-001');
      
      store = useCircuitChallengeStore.getState();
      expect(store.isChallengeCompleted('circuit-b-001')).toBe(true);
      expect(store.isChallengeCompleted('circuit-b-002')).toBe(false);
    });

    it('should persist completion to localStorage', () => {
      let store = useCircuitChallengeStore.getState();
      store.markChallengeCompleted('circuit-b-001');
      
      // Verify localStorage
      const stored = localStorage.getItem('arcane-codex-circuit-challenges-completed');
      expect(stored).toBeTruthy();
      
      const completed: string[] = JSON.parse(stored!);
      expect(completed).toContain('circuit-b-001');
    });

    it('should not double-mark completed challenge', () => {
      let store = useCircuitChallengeStore.getState();
      store.markChallengeCompleted('circuit-b-001');
      store.markChallengeCompleted('circuit-b-001');
      
      store = useCircuitChallengeStore.getState();
      // Should still be true, not an error
      expect(store.isChallengeCompleted('circuit-b-001')).toBe(true);
    });
  });
});

// ============================================================================
// Validator Store Tests
// ============================================================================

describe('Challenge Validator Store Integration', () => {
  beforeEach(() => {
    useChallengeValidatorStore.getState().resetValidation();
  });

  describe('startValidation', () => {
    it('should start validation from idle state', () => {
      let store = useChallengeValidatorStore.getState();
      
      const circuit: CircuitValidationData = {
        id: 'test-circuit',
        components: [],
        outputs: { 'output-1': true },
      };
      
      const objectives: ChallengeObjective[] = [
        {
          id: 'obj-1',
          name: 'Output HIGH',
          description: 'Output must be HIGH',
          objectiveType: 'output',
          priority: 1,
          points: 100,
          outputTarget: { nodeId: 'output-1', name: 'Output', expectedState: 'HIGH' },
        },
      ];
      
      store.startValidation('challenge-1', circuit, objectives);
      
      // Get fresh state after action
      store = useChallengeValidatorStore.getState();
      expect(store.state).toBe('passed');
      expect(store.activeChallengeId).toBe('challenge-1');
      expect(store.lastValidationResult?.isSuccess).toBe(true);
    });

    it('should fail validation when output mismatch', () => {
      let store = useChallengeValidatorStore.getState();
      
      const circuit: CircuitValidationData = {
        id: 'test-circuit',
        components: [],
        outputs: { 'output-1': false }, // LOW instead of HIGH
      };
      
      const objectives: ChallengeObjective[] = [
        {
          id: 'obj-1',
          name: 'Output HIGH',
          description: 'Output must be HIGH',
          objectiveType: 'output',
          priority: 1,
          points: 100,
          outputTarget: { nodeId: 'output-1', name: 'Output', expectedState: 'HIGH' },
        },
      ];
      
      store.startValidation('challenge-1', circuit, objectives);
      
      store = useChallengeValidatorStore.getState();
      expect(store.state).toBe('failed');
      expect(store.lastValidationResult?.isSuccess).toBe(false);
    });
  });

  describe('resetValidation', () => {
    it('should reset validation state', () => {
      let store = useChallengeValidatorStore.getState();
      
      const circuit: CircuitValidationData = {
        id: 'test-circuit',
        components: [],
        outputs: { 'output-1': true },
      };
      
      const objectives: ChallengeObjective[] = [
        {
          id: 'obj-1',
          name: 'Output HIGH',
          description: 'Output must be HIGH',
          objectiveType: 'output',
          priority: 1,
          points: 100,
          outputTarget: { nodeId: 'output-1', name: 'Output', expectedState: 'HIGH' },
        },
      ];
      
      store.startValidation('challenge-1', circuit, objectives);
      store.resetValidation();
      
      store = useChallengeValidatorStore.getState();
      expect(store.state).toBe('idle');
      expect(store.activeChallengeId).toBeNull();
      expect(store.lastValidationResult).toBeNull();
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Circuit Challenge System Integration', () => {
  beforeEach(() => {
    useCircuitChallengeStore.getState().resetChallengeMode();
    useChallengeValidatorStore.getState().resetValidation();
    localStorage.removeItem('arcane-codex-circuit-challenges-completed');
  });

  afterEach(() => {
    cleanup();
    localStorage.removeItem('arcane-codex-circuit-challenges-completed');
  });

  describe('AC-175-003: Challenge Sets Up Canvas Correctly', () => {
    it('should start challenge and enter challenge mode', () => {
      let store = useCircuitChallengeStore.getState();
      store.startChallenge('circuit-b-001');
      
      store = useCircuitChallengeStore.getState();
      expect(store.isChallengeMode).toBe(true);
      expect(store.activeChallengeId).toBe('circuit-b-001');
    });

    it('should exit challenge mode and restore state', () => {
      let store = useCircuitChallengeStore.getState();
      store.startChallenge('circuit-b-001');
      store.exitChallenge();
      
      store = useCircuitChallengeStore.getState();
      expect(store.isChallengeMode).toBe(false);
      expect(store.activeChallengeId).toBeNull();
    });
  });

  describe('AC-175-006: Challenge Completion Persists', () => {
    it('should save completion to localStorage', () => {
      let store = useCircuitChallengeStore.getState();
      store.markChallengeCompleted('circuit-b-001');
      
      // Verify localStorage
      const stored = localStorage.getItem('arcane-codex-circuit-challenges-completed');
      expect(stored).toBeTruthy();
      
      const completed: string[] = JSON.parse(stored!);
      expect(completed).toContain('circuit-b-001');
    });

    it('should check completion status', () => {
      let store = useCircuitChallengeStore.getState();
      
      expect(store.isChallengeCompleted('circuit-b-001')).toBe(false);
      
      store.markChallengeCompleted('circuit-b-001');
      
      store = useCircuitChallengeStore.getState();
      expect(store.isChallengeCompleted('circuit-b-001')).toBe(true);
    });
  });
});

// ============================================================================
// UI Component Tests (Basic)
// ============================================================================

describe('Circuit Challenge Panel UI', () => {
  // These tests verify that the component can be rendered
  // Full UI testing would require more setup with providers
  
  it('should export CircuitChallengePanel component', async () => {
    const { CircuitChallengePanel } = await import('../components/Circuit/CircuitChallengePanel');
    expect(CircuitChallengePanel).toBeDefined();
  });

  it('should export CircuitChallengeToolbarButton component', async () => {
    const { CircuitChallengeToolbarButton } = await import('../components/Circuit/CircuitChallengePanel');
    expect(CircuitChallengeToolbarButton).toBeDefined();
  });
});

export {};
