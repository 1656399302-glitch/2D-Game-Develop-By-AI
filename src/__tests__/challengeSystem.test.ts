import { describe, it, expect, beforeEach } from 'vitest';
import { validateChallenge, canAttemptChallenge } from '../utils/challengeValidator';
import { CHALLENGES, getDifficultyColor, getDifficultyLabel, rarityMeetsRequirement } from '../types/challenges';
import { PlacedModule, Connection, GeneratedAttributes } from '../types';
import { useChallengeStore } from '../store/useChallengeStore';

describe('Challenge Definitions', () => {
  it('should have exactly 8 challenges', () => {
    expect(CHALLENGES).toHaveLength(8);
  });

  it('each challenge should have required fields', () => {
    CHALLENGES.forEach((challenge) => {
      expect(challenge.id).toBeDefined();
      expect(challenge.title).toBeDefined();
      expect(challenge.description).toBeDefined();
      expect(challenge.difficulty).toBeDefined();
      expect(challenge.requirements).toBeDefined();
      expect(challenge.reward).toBeDefined();
    });
  });

  it('each challenge should have unique id', () => {
    const ids = CHALLENGES.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(8);
  });

  it('should have at least 2 beginner challenges', () => {
    const beginnerCount = CHALLENGES.filter((c) => c.difficulty === 'beginner').length;
    expect(beginnerCount).toBeGreaterThanOrEqual(2);
  });

  it('should have at least 2 intermediate challenges', () => {
    const intermediateCount = CHALLENGES.filter((c) => c.difficulty === 'intermediate').length;
    expect(intermediateCount).toBeGreaterThanOrEqual(2);
  });

  it('should have at least 2 advanced challenges', () => {
    const advancedCount = CHALLENGES.filter((c) => c.difficulty === 'advanced').length;
    expect(advancedCount).toBeGreaterThanOrEqual(2);
  });

  it('should have at least 2 master challenges', () => {
    const masterCount = CHALLENGES.filter((c) => c.difficulty === 'master').length;
    expect(masterCount).toBeGreaterThanOrEqual(2);
  });

  it('should have valid difficulty values', () => {
    const validDifficulties = ['beginner', 'intermediate', 'advanced', 'master'];
    CHALLENGES.forEach((challenge) => {
      expect(validDifficulties).toContain(challenge.difficulty);
    });
  });
});

describe('Difficulty Helpers', () => {
  it('getDifficultyColor should return valid colors', () => {
    expect(getDifficultyColor('beginner')).toBe('#22c55e');
    expect(getDifficultyColor('intermediate')).toBe('#3b82f6');
    expect(getDifficultyColor('advanced')).toBe('#a855f7');
    expect(getDifficultyColor('master')).toBe('#f59e0b');
  });

  it('getDifficultyLabel should return valid labels', () => {
    expect(getDifficultyLabel('beginner')).toBe('Beginner');
    expect(getDifficultyLabel('intermediate')).toBe('Intermediate');
    expect(getDifficultyLabel('advanced')).toBe('Advanced');
    expect(getDifficultyLabel('master')).toBe('Master');
  });
});

describe('Rarity Requirements', () => {
  it('rarityMeetsRequirement should work correctly', () => {
    expect(rarityMeetsRequirement('common', 'common')).toBe(true);
    expect(rarityMeetsRequirement('uncommon', 'common')).toBe(true);
    expect(rarityMeetsRequirement('rare', 'uncommon')).toBe(true);
    expect(rarityMeetsRequirement('epic', 'rare')).toBe(true);
    expect(rarityMeetsRequirement('legendary', 'epic')).toBe(true);
    expect(rarityMeetsRequirement('common', 'uncommon')).toBe(false);
    expect(rarityMeetsRequirement('rare', 'epic')).toBe(false);
  });
});

describe('Challenge Validation', () => {
  // Helper to create test modules
  const createModule = (type: string, id: string): PlacedModule => ({
    id,
    instanceId: id,
    type: type as any,
    x: 100,
    y: 100,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [],
  });

  // Helper to create test attributes
  const createAttributes = (overrides: Partial<GeneratedAttributes> = {}): GeneratedAttributes => ({
    name: 'Test Machine',
    rarity: 'common',
    stats: {
      stability: 50,
      powerOutput: 50,
      energyCost: 50,
      failureRate: 50,
    },
    tags: ['stable'],
    description: 'Test description',
    codexId: 'TEST-001',
    ...overrides,
  });

  it('should validate minModules requirement (pass)', () => {
    // ch-1 requires minModules: 3
    const modules = [
      createModule('core-furnace', '1'),
      createModule('gear', '2'),
      createModule('rune-node', '3'),
    ];
    const connections: Connection[] = [];
    
    const challenge = CHALLENGES.find((c) => c.id === 'ch-1')!;
    const attributes = createAttributes();
    
    const result = validateChallenge(modules, connections, attributes, challenge);
    expect(result.passed).toBe(true);
  });

  it('should fail minModules requirement when not met', () => {
    // ch-1 requires minModules: 3
    const modules = [
      createModule('core-furnace', '1'),
      createModule('gear', '2'),
    ];
    const connections: Connection[] = [];
    
    const challenge = CHALLENGES.find((c) => c.id === 'ch-1')!;
    const attributes = createAttributes();
    
    const result = validateChallenge(modules, connections, attributes, challenge);
    expect(result.passed).toBe(false);
    expect(result.details.some((d) => d.requirement.includes('At least'))).toBe(true);
  });

  it('should validate minConnections requirement (pass)', () => {
    // ch-2 requires minModules: 2 AND minConnections: 2
    const modules = [
      createModule('core-furnace', '1'),
      createModule('gear', '2'),
    ];
    const connections: Connection[] = [
      { id: 'c1', sourceModuleId: '1', sourcePortId: 'p1', targetModuleId: '2', targetPortId: 'p2', pathData: '' },
      { id: 'c2', sourceModuleId: '2', sourcePortId: 'p3', targetModuleId: '1', targetPortId: 'p4', pathData: '' },
    ];
    
    const challenge = CHALLENGES.find((c) => c.id === 'ch-2')!;
    const attributes = createAttributes();
    
    const result = validateChallenge(modules, connections, attributes, challenge);
    expect(result.passed).toBe(true);
  });

  it('should validate requiredTags requirement (pass)', () => {
    // ch-3 requires minModules: 4 AND requiredTags: ['fire', 'lightning', 'arcane']
    const modules = [
      createModule('core-furnace', '1'),
      createModule('gear', '2'),
      createModule('rune-node', '3'),
      createModule('energy-pipe', '4'),
    ];
    const connections: Connection[] = [];
    
    const challenge = CHALLENGES.find((c) => c.id === 'ch-3')!;
    // Core furnace has ['arcane', 'fire'] tags per MODULE_TAG_MAP
    const attributes = createAttributes({ tags: ['fire', 'arcane'] });
    
    const result = validateChallenge(modules, connections, attributes, challenge);
    expect(result.passed).toBe(true);
  });

  it('should validate requiredRarity requirement (pass)', () => {
    // ch-6 requires minModules: 5, minConnections: 3, requiredRarity: 'rare'
    const modules = [
      createModule('core-furnace', '1'),
      createModule('gear', '2'),
      createModule('rune-node', '3'),
      createModule('amplifier-crystal', '4'),
      createModule('stabilizer-core', '5'),
    ];
    const connections: Connection[] = [
      { id: 'c1', sourceModuleId: '1', sourcePortId: 'p1', targetModuleId: '2', targetPortId: 'p2', pathData: '' },
      { id: 'c2', sourceModuleId: '2', sourcePortId: 'p3', targetModuleId: '3', targetPortId: 'p4', pathData: '' },
      { id: 'c3', sourceModuleId: '3', sourcePortId: 'p5', targetModuleId: '4', targetPortId: 'p6', pathData: '' },
    ];
    
    const challenge = CHALLENGES.find((c) => c.id === 'ch-6')!;
    const attributes = createAttributes({ rarity: 'rare' });
    
    const result = validateChallenge(modules, connections, attributes, challenge);
    expect(result.passed).toBe(true);
  });

  it('should validate specificModuleTypes requirement (pass)', () => {
    // ch-5 requires minModules: 4, specificModuleTypes: ['core-furnace', 'stabilizer-core'], minConnections: 2
    const modules = [
      createModule('core-furnace', '1'),
      createModule('stabilizer-core', '2'),
      createModule('gear', '3'),
      createModule('rune-node', '4'),
    ];
    const connections: Connection[] = [
      { id: 'c1', sourceModuleId: '1', sourcePortId: 'p1', targetModuleId: '2', targetPortId: 'p2', pathData: '' },
      { id: 'c2', sourceModuleId: '2', sourcePortId: 'p3', targetModuleId: '3', targetPortId: 'p4', pathData: '' },
    ];
    
    const challenge = CHALLENGES.find((c) => c.id === 'ch-5')!;
    const attributes = createAttributes();
    
    const result = validateChallenge(modules, connections, attributes, challenge);
    expect(result.passed).toBe(true);
  });

  it('should validate minStability requirement (pass)', () => {
    // ch-4 requires minModules: 3, minStability: 60
    const modules = [
      createModule('core-furnace', '1'),
      createModule('gear', '2'),
      createModule('shield-shell', '3'),
    ];
    const connections: Connection[] = [];
    
    const challenge = CHALLENGES.find((c) => c.id === 'ch-4')!;
    const attributes = createAttributes({
      stats: {
        stability: 75,
        powerOutput: 50,
        energyCost: 50,
        failureRate: 25,
      }
    });
    
    const result = validateChallenge(modules, connections, attributes, challenge);
    expect(result.passed).toBe(true);
  });

  it('should return detailed validation results', () => {
    const modules: PlacedModule[] = [];
    const connections: Connection[] = [];
    const challenge = CHALLENGES.find((c) => c.id === 'ch-1')!;
    const attributes = createAttributes();
    
    const result = validateChallenge(modules, connections, attributes, challenge);
    
    expect(result.details).toBeDefined();
    expect(Array.isArray(result.details)).toBe(true);
    expect(result.details.length).toBeGreaterThan(0);
    expect(result.details[0]).toHaveProperty('requirement');
    expect(result.details[0]).toHaveProperty('met');
    expect(result.details[0]).toHaveProperty('actualValue');
    expect(result.details[0]).toHaveProperty('expectedValue');
  });
});

describe('Challenge Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChallengeStore.setState({
      completedChallengeIds: [],
      loading: false,
    });
  });

  it('should start with empty completed list', () => {
    const store = useChallengeStore.getState();
    expect(store.completedChallengeIds).toEqual([]);
    expect(store.getCompletedCount()).toBe(0);
  });

  it('should complete a challenge', () => {
    const { completeChallenge } = useChallengeStore.getState();
    
    completeChallenge('ch-1');
    
    const store = useChallengeStore.getState();
    expect(store.completedChallengeIds).toContain('ch-1');
    expect(store.isCompleted('ch-1')).toBe(true);
    expect(store.getCompletedCount()).toBe(1);
  });

  it('should not duplicate completed challenges', () => {
    const { completeChallenge } = useChallengeStore.getState();
    
    completeChallenge('ch-1');
    completeChallenge('ch-1');
    
    const store = useChallengeStore.getState();
    expect(store.completedChallengeIds.filter((id) => id === 'ch-1')).toHaveLength(1);
    expect(store.getCompletedCount()).toBe(1);
  });

  it('should reset progress', () => {
    const { completeChallenge, resetProgress } = useChallengeStore.getState();
    
    completeChallenge('ch-1');
    completeChallenge('ch-2');
    resetProgress();
    
    const store = useChallengeStore.getState();
    expect(store.completedChallengeIds).toEqual([]);
    expect(store.getCompletedCount()).toBe(0);
  });

  it('should check completed status correctly', () => {
    const { completeChallenge, isCompleted } = useChallengeStore.getState();
    
    expect(isCompleted('ch-1')).toBe(false);
    
    completeChallenge('ch-1');
    
    expect(isCompleted('ch-1')).toBe(true);
    expect(isCompleted('ch-2')).toBe(false);
  });

  it('should get completed challenges', () => {
    const { completeChallenge, getCompletedChallenges } = useChallengeStore.getState();
    
    completeChallenge('ch-1');
    completeChallenge('ch-2');
    
    const completed = getCompletedChallenges();
    expect(completed).toHaveLength(2);
    expect(completed.map((c) => c.id)).toContain('ch-1');
    expect(completed.map((c) => c.id)).toContain('ch-2');
  });

  it('should maintain state across multiple operations', () => {
    const { completeChallenge, isCompleted, getCompletedCount } = useChallengeStore.getState();
    
    // Complete several challenges
    completeChallenge('ch-1');
    completeChallenge('ch-3');
    completeChallenge('ch-5');
    
    expect(isCompleted('ch-1')).toBe(true);
    expect(isCompleted('ch-2')).toBe(false);
    expect(isCompleted('ch-3')).toBe(true);
    expect(isCompleted('ch-4')).toBe(false);
    expect(isCompleted('ch-5')).toBe(true);
    expect(getCompletedCount()).toBe(3);
  });
});

describe('canAttemptChallenge', () => {
  it('should return false for empty machine when minModules required', () => {
    const modules: PlacedModule[] = [];
    const challenge = CHALLENGES.find((c) => c.id === 'ch-1')!;
    
    expect(canAttemptChallenge(modules, challenge)).toBe(false);
  });

  it('should return true when machine has modules', () => {
    const modules = [{
      id: '1',
      instanceId: '1',
      type: 'core-furnace' as any,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      flipped: false,
      ports: [],
    }];
    const challenge = CHALLENGES.find((c) => c.id === 'ch-1')!;
    
    expect(canAttemptChallenge(modules, challenge)).toBe(true);
  });

  it('should return false when specific module not present', () => {
    const modules = [{
      id: '1',
      instanceId: '1',
      type: 'core-furnace' as any,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      flipped: false,
      ports: [],
    }];
    const challenge = CHALLENGES.find((c) => c.id === 'ch-7')!; // Void Siphon required
    
    expect(canAttemptChallenge(modules, challenge)).toBe(false);
  });

  it('should return true when specific module is present', () => {
    const modules = [{
      id: '1',
      instanceId: '1',
      type: 'void-siphon' as any,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      flipped: false,
      ports: [],
    }];
    const challenge = CHALLENGES.find((c) => c.id === 'ch-7')!; // Void Siphon required
    
    expect(canAttemptChallenge(modules, challenge)).toBe(true);
  });
});
