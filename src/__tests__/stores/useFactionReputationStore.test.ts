/**
 * Faction Reputation Store Unit Tests
 * 
 * Tests for the faction reputation store covering:
 * - Research system (start/cancel/complete research)
 * - Tech bonus calculations
 * - Reputation updates
 * - Faction bonus application
 * - State persistence
 * - Edge cases
 * 
 * ROUND 158: Added unit tests for untested store
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFactionReputationStore } from '../../store/useFactionReputationStore';
import { RESEARCH_DURATION_MS, MAX_RESEARCH_QUEUE } from '../../types/factionReputation';
import { FactionId, MODULE_TO_FACTION } from '../../types/factions';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock cross-store dependencies
vi.mock('../../store/useFactionStore', () => ({
  useFactionStore: {
    getState: vi.fn(() => ({
      unlockTechTreeNode: vi.fn(),
    })),
  },
}));

vi.mock('../../store/useRecipeStore', () => ({
  useRecipeStore: {
    getState: vi.fn(() => ({
      checkTechLevelUnlocks: vi.fn(),
    })),
  },
}));

describe('FactionReputation Store Tests', () => {
  beforeEach(() => {
    // Clear localStorage and reset store state
    localStorageMock.clear();
    vi.useFakeTimers();
    
    // Reset store to initial state
    useFactionReputationStore.setState({
      reputations: {
        void: 0,
        inferno: 0,
        storm: 0,
        stellar: 0,
        arcane: 0,
        chaos: 0,
      },
      totalReputationEarned: 0,
      currentResearch: {},
      completedResearch: {
        void: [],
        inferno: [],
        storm: [],
        stellar: [],
        arcane: [],
        chaos: [],
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================
  // Research System Tests
  // ============================================
  describe('Research System', () => {
    describe('researchTech', () => {
      it('should start research successfully with sufficient reputation', () => {
        const store = useFactionReputationStore.getState();
        
        // Add reputation for void faction (Tier 1 requires 3)
        store.addReputation('void', 10);
        
        const result = store.researchTech('void-tier-1', 'void');
        expect(result).toBe('ok');
        
        const state = useFactionReputationStore.getState();
        expect(state.currentResearch['void-tier-1']).toBeDefined();
        expect(state.currentResearch['void-tier-1'].techId).toBe('void-tier-1');
      });

      it('should return locked when reputation is insufficient', () => {
        const store = useFactionReputationStore.getState();
        const result = store.researchTech('void-tier-1', 'void');
        
        // Tier 1 requires 3 reputation, but we have 0
        expect(result).toBe('locked');
        
        const state = useFactionReputationStore.getState();
        expect(state.currentResearch['void-tier-1']).toBeUndefined();
      });

      it('should return already_researching when tech is already being researched', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 10);
        
        // Start first research
        store.researchTech('void-tier-1', 'void');
        
        // Try to start same research again
        const result = store.researchTech('void-tier-1', 'void');
        expect(result).toBe('already_researching');
      });

      it('should return already_researching when tech is already completed', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 10);
        
        // Start research first
        store.researchTech('void-tier-1', 'void');
        // Complete the research
        store.completeResearch('void-tier-1', 'void');
        
        // Try to start same research again - should be rejected
        const result = store.researchTech('void-tier-1', 'void');
        expect(result).toBe('already_researching');
      });

      it('should return queue_full when research queue is at maximum', () => {
        const store = useFactionReputationStore.getState();
        
        // Add high reputation to all factions
        store.addReputation('void', 100);
        store.addReputation('inferno', 100);
        store.addReputation('storm', 100);
        
        // Fill the queue
        store.researchTech('void-tier-1', 'void');
        store.researchTech('void-tier-2', 'void');
        store.researchTech('void-tier-3', 'void');
        
        // Queue should now be full (MAX_RESEARCH_QUEUE = 3)
        const result = store.researchTech('inferno-tier-1', 'inferno');
        expect(result).toBe('queue_full');
      });

      it('should return locked for invalid tech ID', () => {
        const store = useFactionReputationStore.getState();
        const result = store.researchTech('invalid-tech', 'void');
        expect(result).toBe('locked');
      });
    });

    describe('completeResearch', () => {
      it('should complete research and add to completed list', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 10);
        
        // Start research
        store.researchTech('void-tier-1', 'void');
        
        // Complete research
        store.completeResearch('void-tier-1', 'void');
        
        const state = useFactionReputationStore.getState();
        expect(state.currentResearch['void-tier-1']).toBeUndefined();
        expect(state.completedResearch['void']).toContain('void-tier-1');
      });

      it('should not add duplicate to completed list', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 10);
        
        store.researchTech('void-tier-1', 'void');
        store.completeResearch('void-tier-1', 'void');
        
        // Complete same research again
        store.completeResearch('void-tier-1', 'void');
        
        const state = useFactionReputationStore.getState();
        const count = state.completedResearch['void'].filter(t => t === 'void-tier-1').length;
        expect(count).toBe(1);
      });

      it('should do nothing for non-existent research', () => {
        const store = useFactionReputationStore.getState();
        
        // Should not throw
        expect(() => {
          store.completeResearch('non-existent', 'void');
        }).not.toThrow();
      });
    });

    describe('cancelResearch', () => {
      it('should cancel ongoing research', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 10);
        
        store.researchTech('void-tier-1', 'void');
        store.cancelResearch('void-tier-1', 'void');
        
        const state = useFactionReputationStore.getState();
        expect(state.currentResearch['void-tier-1']).toBeUndefined();
      });

      it('should not throw for invalid tech ID', () => {
        const store = useFactionReputationStore.getState();
        
        expect(() => {
          store.cancelResearch('invalid-tech', 'void');
        }).not.toThrow();
      });
    });

    describe('getCurrentResearch', () => {
      it('should return research items for specific faction', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        store.addReputation('inferno', 100);
        
        store.researchTech('void-tier-1', 'void');
        store.researchTech('inferno-tier-1', 'inferno');
        
        const voidResearch = store.getCurrentResearch('void');
        const infernoResearch = store.getCurrentResearch('inferno');
        
        expect(voidResearch).toHaveLength(1);
        expect(infernoResearch).toHaveLength(1);
        expect(voidResearch[0].techId).toBe('void-tier-1');
        expect(infernoResearch[0].techId).toBe('inferno-tier-1');
      });
    });
  });

  // ============================================
  // Tech Bonus Tests
  // ============================================
  describe('Tech Bonus System', () => {
    describe('getUnlockedTechTiers', () => {
      it('should return 0 when no tech is completed', () => {
        const store = useFactionReputationStore.getState();
        expect(store.getUnlockedTechTiers('void')).toBe(0);
      });

      it('should return correct tier for completed research', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        
        store.researchTech('void-tier-1', 'void');
        store.completeResearch('void-tier-1', 'void');
        
        expect(store.getUnlockedTechTiers('void')).toBe(1);
      });

      it('should return highest tier when multiple techs completed', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 1000);
        
        store.researchTech('void-tier-1', 'void');
        store.completeResearch('void-tier-1', 'void');
        
        store.researchTech('void-tier-2', 'void');
        store.completeResearch('void-tier-2', 'void');
        
        store.researchTech('void-tier-3', 'void');
        store.completeResearch('void-tier-3', 'void');
        
        expect(store.getUnlockedTechTiers('void')).toBe(3);
      });
    });

    describe('getTechBonus', () => {
      it('should return 0 for neutral modules', () => {
        const store = useFactionReputationStore.getState();
        expect(store.getTechBonus('gear', 'power_output')).toBe(0);
      });

      it('should return 0 when no tech completed for faction', () => {
        const store = useFactionReputationStore.getState();
        expect(store.getTechBonus('void-siphon', 'power_output')).toBe(0);
      });

      it('should return correct bonus for completed tier', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        
        store.researchTech('void-tier-1', 'void');
        store.completeResearch('void-tier-1', 'void');
        
        // Tier 1 bonus is 0.05 for all stats
        expect(store.getTechBonus('void-siphon', 'power_output')).toBe(0.05);
        expect(store.getTechBonus('void-siphon', 'stability')).toBe(0.05);
      });

      it('should return tier 2 bonus when tier 2 completed', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        
        store.researchTech('void-tier-2', 'void');
        store.completeResearch('void-tier-2', 'void');
        
        // Tier 2 bonus is 0.10 for all stats
        expect(store.getTechBonus('void-siphon', 'power_output')).toBe(0.10);
      });

      it('should return tier 3 bonus when tier 3 completed', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        
        store.researchTech('void-tier-3', 'void');
        store.completeResearch('void-tier-3', 'void');
        
        // Tier 3 bonus is 0.15 for all stats
        expect(store.getTechBonus('void-siphon', 'power_output')).toBe(0.15);
      });
    });

    describe('getTotalTechBonus', () => {
      it('should sum bonuses from multiple factions', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        store.addReputation('inferno', 100);
        
        store.researchTech('void-tier-1', 'void');
        store.completeResearch('void-tier-1', 'void');
        
        store.researchTech('inferno-tier-1', 'inferno');
        store.completeResearch('inferno-tier-1', 'inferno');
        
        // Each faction contributes 0.05 for tier 1
        const total = store.getTotalTechBonus(['void-siphon', 'fire-crystal'], 'power_output');
        expect(total).toBe(0.10);
      });

      it('should not double-count same faction modules', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        
        store.researchTech('void-tier-1', 'void');
        store.completeResearch('void-tier-1', 'void');
        
        // Multiple void modules should only count once
        const total = store.getTotalTechBonus(['void-siphon', 'phase-modulator'], 'power_output');
        expect(total).toBe(0.05);
      });
    });

    describe('getActiveBonusesForFaction', () => {
      it('should return zero bonuses when no tech completed', () => {
        const store = useFactionReputationStore.getState();
        const bonuses = store.getActiveBonusesForFaction('void');
        
        expect(bonuses.power_output).toBe(0);
        expect(bonuses.stability).toBe(0);
        expect(bonuses.energy_efficiency).toBe(0);
        expect(bonuses.glow_intensity).toBe(0);
        expect(bonuses.animation_speed).toBe(0);
      });

      it('should return correct bonuses for completed tier', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        
        store.researchTech('void-tier-2', 'void');
        store.completeResearch('void-tier-2', 'void');
        
        const bonuses = store.getActiveBonusesForFaction('void');
        expect(bonuses.power_output).toBe(0.10);
        expect(bonuses.stability).toBe(0.10);
      });
    });
  });

  // ============================================
  // Reputation Tests
  // ============================================
  describe('Reputation Management', () => {
    describe('addReputation', () => {
      it('should add reputation points to faction', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 50);
        
        expect(store.getReputation('void')).toBe(50);
      });

      it('should update total reputation earned', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 50);
        store.addReputation('inferno', 30);
        
        const state = useFactionReputationStore.getState();
        expect(state.totalReputationEarned).toBe(80);
      });

      it('should not allow negative reputation', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', -100);
        
        expect(store.getReputation('void')).toBe(0);
      });
    });

    describe('getReputation', () => {
      it('should return 0 for non-existent faction', () => {
        const store = useFactionReputationStore.getState();
        expect(store.getReputation('non-existent')).toBe(0);
      });
    });

    describe('getReputationLevel', () => {
      it('should return Apprentice for 0-199 points', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        expect(store.getReputationLevel('void')).toBe('apprentice');
      });

      it('should return Journeyman for 200-499 points', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 300);
        expect(store.getReputationLevel('void')).toBe('journeyman');
      });

      it('should return Expert for 500-999 points', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 700);
        expect(store.getReputationLevel('void')).toBe('expert');
      });

      it('should return Master for 1000-1999 points', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 1500);
        expect(store.getReputationLevel('void')).toBe('master');
      });

      it('should return Grandmaster for 2000+ points', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 2500);
        expect(store.getReputationLevel('void')).toBe('grandmaster');
      });
    });

    describe('isVariantUnlocked', () => {
      it('should return false for Apprentice level', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        expect(store.isVariantUnlocked('void')).toBe(false);
      });

      it('should return true for Grandmaster level', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 2500);
        expect(store.isVariantUnlocked('void')).toBe(true);
      });
    });

    describe('getReputationData', () => {
      it('should return complete reputation data', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 500);
        
        const data = store.getReputationData('void');
        
        expect(data.factionId).toBe('void');
        expect(data.points).toBe(500);
        expect(data.level).toBe('expert');
        expect(data.totalEarned).toBe(500);
        expect(data.lastUpdated).toBeDefined();
      });
    });
  });

  // ============================================
  // Reset Tests
  // ============================================
  describe('Reset Operations', () => {
    describe('resetReputation', () => {
      it('should reset faction reputation to 0', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 500);
        store.resetReputation('void');
        
        expect(store.getReputation('void')).toBe(0);
      });

      it('should reset completed research for faction', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        store.researchTech('void-tier-1', 'void');
        store.completeResearch('void-tier-1', 'void');
        
        store.resetReputation('void');
        
        const state = useFactionReputationStore.getState();
        expect(state.completedResearch['void']).toHaveLength(0);
      });

      it('should cancel ongoing research for faction', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        store.researchTech('void-tier-1', 'void');
        
        store.resetReputation('void');
        
        const state = useFactionReputationStore.getState();
        expect(state.currentResearch['void-tier-1']).toBeUndefined();
      });

      it('should update total reputation earned', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 500);
        store.addReputation('inferno', 300);
        
        store.resetReputation('void');
        
        const state = useFactionReputationStore.getState();
        expect(state.totalReputationEarned).toBe(300);
      });
    });

    describe('resetAllReputations', () => {
      it('should reset all faction reputations', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 500);
        store.addReputation('inferno', 300);
        store.addReputation('storm', 200);
        
        store.resetAllReputations();
        
        const state = useFactionReputationStore.getState();
        expect(state.getReputation('void')).toBe(0);
        expect(state.getReputation('inferno')).toBe(0);
        expect(state.getReputation('storm')).toBe(0);
      });

      it('should reset all completed research', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        store.researchTech('void-tier-1', 'void');
        store.completeResearch('void-tier-1', 'void');
        
        store.resetAllReputations();
        
        const state = useFactionReputationStore.getState();
        expect(state.completedResearch['void']).toHaveLength(0);
      });

      it('should reset total reputation earned', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 500);
        
        store.resetAllReputations();
        
        const state = useFactionReputationStore.getState();
        expect(state.totalReputationEarned).toBe(0);
      });
    });

    describe('resetFactionTech', () => {
      it('should clear completed research for faction', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        store.researchTech('void-tier-1', 'void');
        store.completeResearch('void-tier-1', 'void');
        
        store.resetFactionTech('void');
        
        const state = useFactionReputationStore.getState();
        expect(state.completedResearch['void']).toHaveLength(0);
      });

      it('should not affect other factions', () => {
        const store = useFactionReputationStore.getState();
        store.addReputation('void', 100);
        store.addReputation('inferno', 100);
        
        store.researchTech('void-tier-1', 'void');
        store.completeResearch('void-tier-1', 'void');
        
        store.researchTech('inferno-tier-1', 'inferno');
        store.completeResearch('inferno-tier-1', 'inferno');
        
        store.resetFactionTech('void');
        
        const state = useFactionReputationStore.getState();
        expect(state.completedResearch['void']).toHaveLength(0);
        expect(state.completedResearch['inferno']).toHaveLength(1);
      });
    });
  });

  // ============================================
  // Bonus Reputation Tests
  // ============================================
  describe('awardBonusReputation', () => {
    it('should award bonus reputation to all factions', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 100);
      store.addReputation('inferno', 100);
      
      store.awardBonusReputation(50);
      
      const state = useFactionReputationStore.getState();
      expect(state.getReputation('void')).toBe(150);
      expect(state.getReputation('inferno')).toBe(150);
    });

    it('should update total reputation earned', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 100);
      
      store.awardBonusReputation(50);
      
      const state = useFactionReputationStore.getState();
      // Store has 4 factions (void, inferno, storm, stellar): 100 + 50*4 = 300
      expect(state.totalReputationEarned).toBe(300);
    });
  });

  // ============================================
  // getResearchableTechs Tests
  // ============================================
  describe('getResearchableTechs', () => {
    it('should return available techs with sufficient reputation', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 10);
      
      const researchable = store.getResearchableTechs('void');
      
      // Should have tier 1 (requires 3), tier 2 (requires 7), tier 3 (requires 15)
      // With 10 reputation, only tier 1 is available
      expect(researchable.some(t => t.id === 'void-tier-1')).toBe(true);
    });

    it('should exclude completed techs', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 100);
      
      store.researchTech('void-tier-1', 'void');
      store.completeResearch('void-tier-1', 'void');
      
      const researchable = store.getResearchableTechs('void');
      
      expect(researchable.some(t => t.id === 'void-tier-1')).toBe(false);
    });

    it('should exclude currently researching techs', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 100);
      
      store.researchTech('void-tier-1', 'void');
      
      const researchable = store.getResearchableTechs('void');
      
      expect(researchable.some(t => t.id === 'void-tier-1')).toBe(false);
    });
  });

  // ============================================
  // getRequiredReputation Tests
  // ============================================
  describe('getRequiredReputation', () => {
    it('should return correct requirements for each tier', () => {
      const store = useFactionReputationStore.getState();
      
      expect(store.getRequiredReputation('void-tier-1')).toBe(3);
      expect(store.getRequiredReputation('void-tier-2')).toBe(7);
      expect(store.getRequiredReputation('void-tier-3')).toBe(15);
    });

    it('should return 9999 for invalid tech ID', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getRequiredReputation('invalid')).toBe(9999);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle multiple factions independently', () => {
      const store = useFactionReputationStore.getState();
      
      store.addReputation('void', 100);
      store.addReputation('inferno', 500);
      
      expect(store.getReputationLevel('void')).toBe('apprentice');
      expect(store.getReputationLevel('inferno')).toBe('expert');
      
      expect(store.getUnlockedTechTiers('void')).toBe(0);
      expect(store.getUnlockedTechTiers('inferno')).toBe(0);
    });

    it('should handle rapid reputation changes', () => {
      const store = useFactionReputationStore.getState();
      
      for (let i = 0; i < 100; i++) {
        store.addReputation('void', 10);
      }
      
      expect(store.getReputation('void')).toBe(1000);
      expect(store.getReputationLevel('void')).toBe('master');
    });

    it('should handle rapid research operations', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 1000);
      
      for (let tier = 1; tier <= 3; tier++) {
        store.researchTech(`void-tier-${tier}`, 'void');
        store.completeResearch(`void-tier-${tier}`, 'void');
      }
      
      expect(store.getUnlockedTechTiers('void')).toBe(3);
    });
  });
});
