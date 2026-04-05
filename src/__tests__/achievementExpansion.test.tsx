/**
 * Achievement Expansion Tests
 * 
 * Tests for the expanded milestone achievements and toast queue system.
 * Updated for Round 80 with 6 factions and 27 achievements.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] || null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

describe('Achievement Expansion Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Achievement Definitions', () => {
    // Updated: 27 achievements in Round 80 (from 15)
    it('should have 34 total achievements after Round 136 expansion', async () => {
      const { ACHIEVEMENTS } = await import('../data/achievements');
      
      expect(ACHIEVEMENTS).toBeDefined();
      expect(ACHIEVEMENTS.length).toBe(34);
    });

    it('should include all milestone achievements', async () => {
      const { getMilestoneAchievements } = await import('../data/achievements');
      
      const milestones = getMilestoneAchievements();
      
      expect(milestones.length).toBe(5);
      
      const milestoneIds = milestones.map(m => m.id);
      expect(milestoneIds).toContain('apprentice-forge');    // 5 machines
      expect(milestoneIds).toContain('skilled-artisan');    // 10 machines
      expect(milestoneIds).toContain('master-creator');     // 25 machines
      expect(milestoneIds).toContain('legendary-machinist'); // 50 machines
      expect(milestoneIds).toContain('eternal-forger');     // 100 machines
    });

    it('should include tutorial completion achievement', async () => {
      const { getAchievementById } = await import('../data/achievements');
      
      const gettingStarted = getAchievementById('getting-started');
      
      expect(gettingStarted).toBeDefined();
      expect(gettingStarted?.id).toBe('getting-started');
      expect(gettingStarted?.nameCn).toBe('入门者');
      expect(gettingStarted?.icon).toBe('🎓');
    });

    it('should include faction-specific achievements', async () => {
      const { getAchievementsByFaction } = await import('../data/achievements');
      
      const voidAchievements = getAchievementsByFaction('void');
      expect(voidAchievements.length).toBeGreaterThan(0);
      expect(voidAchievements[0].faction).toBe('void');
    });

    // NEW: Test new Round 80 achievements
    it('should include first-export achievement', async () => {
      const { getAchievementById } = await import('../data/achievements');
      
      const firstExport = getAchievementById('first-export');
      
      expect(firstExport).toBeDefined();
      expect(firstExport?.id).toBe('first-export');
      expect(firstExport?.nameCn).toBe('初次导出');
    });

    it('should include complex-machine-created achievement', async () => {
      const { getAchievementById } = await import('../data/achievements');
      
      const complexMachine = getAchievementById('complex-machine-created');
      
      expect(complexMachine).toBeDefined();
      expect(complexMachine?.id).toBe('complex-machine-created');
      expect(complexMachine?.nameCn).toBe('复杂机器制造者');
    });
  });

  describe('Milestone Achievement Thresholds', () => {
    it('should unlock apprentice-forge at exactly 5 machines', async () => {
      const { getAchievementById } = await import('../data/achievements');
      
      const apprenticeForge = getAchievementById('apprentice-forge');
      
      // Test exact threshold
      expect(apprenticeForge?.condition({ machinesCreated: 5 })).toBe(true);
      
      // Test threshold - 1 (should not unlock)
      expect(apprenticeForge?.condition({ machinesCreated: 4 })).toBe(false);
      
      // Test threshold + 1 (should not unlock - exact threshold required)
      expect(apprenticeForge?.condition({ machinesCreated: 6 })).toBe(false);
    });

    it('should unlock skilled-artisan at exactly 10 machines', async () => {
      const { getAchievementById } = await import('../data/achievements');
      
      const skilledArtisan = getAchievementById('skilled-artisan');
      
      expect(skilledArtisan?.condition({ machinesCreated: 10 })).toBe(true);
      expect(skilledArtisan?.condition({ machinesCreated: 9 })).toBe(false);
      expect(skilledArtisan?.condition({ machinesCreated: 11 })).toBe(false);
    });

    it('should unlock master-creator at exactly 25 machines', async () => {
      const { getAchievementById } = await import('../data/achievements');
      
      const masterCreator = getAchievementById('master-creator');
      
      expect(masterCreator?.condition({ machinesCreated: 25 })).toBe(true);
      expect(masterCreator?.condition({ machinesCreated: 24 })).toBe(false);
      expect(masterCreator?.condition({ machinesCreated: 26 })).toBe(false);
    });

    it('should unlock legendary-machinist at exactly 50 machines', async () => {
      const { getAchievementById } = await import('../data/achievements');
      
      const legendaryMachinist = getAchievementById('legendary-machinist');
      
      expect(legendaryMachinist?.condition({ machinesCreated: 50 })).toBe(true);
      expect(legendaryMachinist?.condition({ machinesCreated: 49 })).toBe(false);
      expect(legendaryMachinist?.condition({ machinesCreated: 51 })).toBe(false);
    });

    it('should unlock eternal-forger at exactly 100 machines', async () => {
      const { getAchievementById } = await import('../data/achievements');
      
      const eternalForger = getAchievementById('eternal-forger');
      
      expect(eternalForger?.condition({ machinesCreated: 100 })).toBe(true);
      expect(eternalForger?.condition({ machinesCreated: 99 })).toBe(false);
      expect(eternalForger?.condition({ machinesCreated: 101 })).toBe(false);
    });
  });

  describe('Tutorial Completion Achievement', () => {
    it('should unlock getting-started when tutorialCompleted is true', async () => {
      const { getAchievementById } = await import('../data/achievements');
      
      const gettingStarted = getAchievementById('getting-started');
      
      expect(gettingStarted?.condition({ tutorialCompleted: true })).toBe(true);
      expect(gettingStarted?.condition({ tutorialCompleted: false })).toBe(false);
      expect(gettingStarted?.condition({})).toBe(false);
    });
  });

  describe('Achievement Toast Component', () => {
    it('should have data-testid="achievement-toast" in component', async () => {
      const fs = await import('fs');
      const toastContent = fs.readFileSync('src/components/Achievements/AchievementToast.tsx', 'utf8');
      
      expect(toastContent).toContain('data-testid="achievement-toast"');
    });

    it('should export useAchievementToastQueue hook', async () => {
      const { useAchievementToastQueue } = await import('../components/Achievements/AchievementToast');
      
      expect(typeof useAchievementToastQueue).toBe('function');
    });

    it('should export AchievementToastContainer component', async () => {
      const { AchievementToastContainer } = await import('../components/Achievements/AchievementToast');
      
      expect(typeof AchievementToastContainer).toBe('function');
    });

    it('should export AchievementToast component', async () => {
      const { AchievementToast } = await import('../components/Achievements/AchievementToast');
      
      expect(typeof AchievementToast).toBe('function');
    });
  });

  describe('Achievement Toast Queue Types', () => {
    it('should define ToastQueueItem interface', async () => {
      const fs = await import('fs');
      const toastContent = fs.readFileSync('src/components/Achievements/AchievementToast.tsx', 'utf8');
      
      expect(toastContent).toContain('interface ToastQueueItem');
      expect(toastContent).toContain('achievement: Achievement');
      expect(toastContent).toContain('timestamp: number');
      expect(toastContent).toContain('id: string');
    });

    it('should define AchievementToastQueueOptions interface', async () => {
      const fs = await import('fs');
      const toastContent = fs.readFileSync('src/components/Achievements/AchievementToast.tsx', 'utf8');
      
      expect(toastContent).toContain('interface AchievementToastQueueOptions');
      expect(toastContent).toContain('maxVisible?: number');
      expect(toastContent).toContain('staggerDelay?: number');
    });

    it('should have default maxVisible of 3', async () => {
      const fs = await import('fs');
      const toastContent = fs.readFileSync('src/components/Achievements/AchievementToast.tsx', 'utf8');
      
      expect(toastContent).toContain('maxVisible = 3');
    });

    it('should have default staggerDelay of 3000', async () => {
      const fs = await import('fs');
      const toastContent = fs.readFileSync('src/components/Achievements/AchievementToast.tsx', 'utf8');
      
      expect(toastContent).toContain('staggerDelay = DEFAULT_DURATION');
    });
  });

  describe('Achievement Milestone Thresholds', () => {
    it('should return correct threshold for each milestone achievement', async () => {
      const { getMilestoneThreshold } = await import('../data/achievements');
      
      expect(getMilestoneThreshold('apprentice-forge')).toBe(5);
      expect(getMilestoneThreshold('skilled-artisan')).toBe(10);
      expect(getMilestoneThreshold('master-creator')).toBe(25);
      expect(getMilestoneThreshold('legendary-machinist')).toBe(50);
      expect(getMilestoneThreshold('eternal-forger')).toBe(100);
    });

    it('should return null for non-milestone achievements', async () => {
      const { getMilestoneThreshold } = await import('../data/achievements');
      
      expect(getMilestoneThreshold('first-forge')).toBeNull();
      expect(getMilestoneThreshold('getting-started')).toBeNull();
      expect(getMilestoneThreshold('unknown-achievement')).toBeNull();
    });
  });

  describe('Achievement Faction Integration', () => {
    // Updated: 6 factions in Round 80
    it('should check faction conditions correctly', async () => {
      const { getAchievementById } = await import('../data/achievements');
      
      const voidConqueror = getAchievementById('void-conqueror');
      
      // Should unlock when void count >= 5
      expect(voidConqueror?.condition({
        factionCounts: { void: 5, inferno: 0, storm: 0, stellar: 0, arcane: 0, chaos: 0 }
      })).toBe(true);
      
      // Should not unlock when void count < 5
      expect(voidConqueror?.condition({
        factionCounts: { void: 4, inferno: 0, storm: 0, stellar: 0, arcane: 0, chaos: 0 }
      })).toBe(false);
      
      // Should not unlock when faction count is 0
      expect(voidConqueror?.condition({
        factionCounts: { void: 0, inferno: 0, storm: 0, stellar: 0, arcane: 0, chaos: 0 }
      })).toBe(false);
    });

    // Updated: 6 factions
    it('should include all six faction achievements', async () => {
      const { getAchievementsByFaction } = await import('../data/achievements');
      
      const voidAchievements = getAchievementsByFaction('void');
      const infernoAchievements = getAchievementsByFaction('inferno');
      const stormAchievements = getAchievementsByFaction('storm');
      const stellarAchievements = getAchievementsByFaction('stellar');
      const arcaneAchievements = getAchievementsByFaction('arcane');
      const chaosAchievements = getAchievementsByFaction('chaos');
      
      expect(voidAchievements.length).toBeGreaterThan(0);
      expect(infernoAchievements.length).toBeGreaterThan(0);
      expect(stormAchievements.length).toBeGreaterThan(0);
      expect(stellarAchievements.length).toBeGreaterThan(0);
      expect(arcaneAchievements.length).toBeGreaterThan(0);
      expect(chaosAchievements.length).toBeGreaterThan(0);
    });
  });

  describe('First Machine Achievements', () => {
    it('should have first-activation achievement', async () => {
      const { getAchievementById } = await import('../data/achievements');
      
      const firstActivation = getAchievementById('first-activation');
      
      expect(firstActivation).toBeDefined();
      expect(firstActivation?.nameCn).toBe('初次激活');
      expect(firstActivation?.condition({ activations: 1 })).toBe(true);
      expect(firstActivation?.condition({ activations: 0 })).toBe(false);
    });
  });

  describe('Total Achievements Count', () => {
    // Updated: 27 achievements in Round 80
    it('should export TOTAL_ACHIEVEMENTS constant (34 in Round 136)', async () => {
      const { TOTAL_ACHIEVEMENTS } = await import('../data/achievements');
      
      expect(TOTAL_ACHIEVEMENTS).toBe(34);
    });

    it('should match count of ACHIEVEMENTS array', async () => {
      const { ACHIEVEMENTS, TOTAL_ACHIEVEMENTS } = await import('../data/achievements');
      
      expect(ACHIEVEMENTS.length).toBe(TOTAL_ACHIEVEMENTS);
    });
  });
});
