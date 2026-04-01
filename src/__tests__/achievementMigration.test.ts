/**
 * Achievement Migration Test
 * 
 * Tests for the Round 80 achievement migration.
 * Verifies AC0b: All 13 required achievement IDs exist in src/data/achievements.ts
 */

import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS, getAchievementById } from '../data/achievements';

describe('Achievement Migration (AC0b)', () => {
  // Required achievement IDs per contract
  const requiredAchievementIds = [
    'first-forge',
    'first-activation',
    'first-export',
    'skilled-artisan',
    'faction-void',
    'faction-forge',
    'faction-phase',
    'faction-barrier',
    'faction-order',
    'faction-chaos',
    'complex-machine-created',
    'apprentice-forge',
    'perfect-activation',
  ];

  it('should have at least 13 total achievements', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(13);
  });

  it('should have all 13 required achievements defined', () => {
    requiredAchievementIds.forEach(id => {
      const achievement = getAchievementById(id);
      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe(id);
    });
  });

  it('should preserve legacy faction achievements', () => {
    // These should still exist for backward compatibility
    expect(getAchievementById('void-conqueror')).toBeDefined();
    expect(getAchievementById('inferno-master')).toBeDefined();
    expect(getAchievementById('storm-ruler')).toBeDefined();
    expect(getAchievementById('stellar-harmonizer')).toBeDefined();
  });

  it('should have first-export achievement with correct properties', () => {
    const firstExport = getAchievementById('first-export');
    expect(firstExport).toBeDefined();
    expect(firstExport?.nameCn).toBe('初次导出');
    expect(firstExport?.icon).toBe('📤');
  });

  it('should have complex-machine-created achievement with correct properties', () => {
    const complexMachine = getAchievementById('complex-machine-created');
    expect(complexMachine).toBeDefined();
    expect(complexMachine?.nameCn).toBe('复杂机器制造者');
    expect(complexMachine?.icon).toBe('🏗️');
  });

  it('should have faction-void achievement with correct properties', () => {
    const factionVoid = getAchievementById('faction-void');
    expect(factionVoid).toBeDefined();
    expect(factionVoid?.nameCn).toBe('虚空深渊大师');
    expect(factionVoid?.faction).toBe('void');
  });

  it('should have faction-forge achievement with correct properties', () => {
    const factionForge = getAchievementById('faction-forge');
    expect(factionForge).toBeDefined();
    expect(factionForge?.nameCn).toBe('熔星锻造大师');
    expect(factionForge?.faction).toBe('inferno');
  });

  it('should have faction-phase achievement with correct properties', () => {
    const factionPhase = getAchievementById('faction-phase');
    expect(factionPhase).toBeDefined();
    expect(factionPhase?.nameCn).toBe('雷霆相位大师');
    expect(factionPhase?.faction).toBe('storm');
  });

  it('should have faction-barrier achievement with correct properties', () => {
    const factionBarrier = getAchievementById('faction-barrier');
    expect(factionBarrier).toBeDefined();
    expect(factionBarrier?.nameCn).toBe('森灵结界大师');
    expect(factionBarrier?.faction).toBe('arcane');
  });

  it('should have faction-order achievement with correct properties', () => {
    const factionOrder = getAchievementById('faction-order');
    expect(factionOrder).toBeDefined();
    expect(factionOrder?.nameCn).toBe('奥术秩序大师');
    expect(factionOrder?.faction).toBe('arcane');
  });

  it('should have faction-chaos achievement with correct properties', () => {
    const factionChaos = getAchievementById('faction-chaos');
    expect(factionChaos).toBeDefined();
    expect(factionChaos?.nameCn).toBe('混沌无序大师');
    expect(factionChaos?.faction).toBe('chaos');
  });

  it('should have first-forge achievement', () => {
    const firstForge = getAchievementById('first-forge');
    expect(firstForge).toBeDefined();
    expect(firstForge?.nameCn).toBe('初次锻造');
  });

  it('should have first-activation achievement', () => {
    const firstActivation = getAchievementById('first-activation');
    expect(firstActivation).toBeDefined();
    expect(firstActivation?.nameCn).toBe('初次激活');
  });

  it('should have skilled-artisan achievement', () => {
    const skilledArtisan = getAchievementById('skilled-artisan');
    expect(skilledArtisan).toBeDefined();
    expect(skilledArtisan?.nameCn).toBe('熟练工匠');
  });

  it('should have apprentice-forge achievement', () => {
    const apprenticeForge = getAchievementById('apprentice-forge');
    expect(apprenticeForge).toBeDefined();
    expect(apprenticeForge?.nameCn).toBe('学徒锻造师');
  });

  it('should have perfect-activation achievement', () => {
    const perfectActivation = getAchievementById('perfect-activation');
    expect(perfectActivation).toBeDefined();
    expect(perfectActivation?.nameCn).toBe('完美激活');
  });
});
