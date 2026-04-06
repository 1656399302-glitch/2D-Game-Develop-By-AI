/**
 * TechTree Component Tests
 * 
 * Tests for the SVG-interactive tech tree with research system.
 * 
 * ROUND 166: All render() calls, fireEvent.click(), and store mutations wrapped
 * in act() for proper React 18 async rendering handling.
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TechTree } from './TechTree';
import { useFactionReputationStore } from '../../store/useFactionReputationStore';
import { useFactionStore } from '../../store/useFactionStore';
import { RESEARCH_DURATION_MS, ResearchState } from '../../types/factionReputation';

// Reset store helper wrapped in act() for React 18
async function resetStore() {
  await act(async () => {
    useFactionReputationStore.setState({
      reputations: { void: 0, inferno: 0, storm: 0, stellar: 0 },
      totalReputationEarned: 0,
      currentResearch: {},
      completedResearch: {},
    });
    useFactionStore.setState({
      factionCounts: { void: 0, inferno: 0, storm: 0, stellar: 0 },
      techTreeUnlocks: {},
      selectedFaction: null,
    });
  });
}

// Helper to simulate research and completion - wrapped in act()
async function simulateResearchAndCompletion(factionId: string, tier: number) {
  const techId = `${factionId}-tier-${tier}`;
  
  await act(async () => {
    const store = useFactionReputationStore.getState();
    
    // Start research
    store.currentResearch = {
      ...store.currentResearch,
      [techId]: {
        techId,
        startedAt: Date.now() - RESEARCH_DURATION_MS - 100, // Started in the past
        durationMs: RESEARCH_DURATION_MS,
      },
    };
    useFactionReputationStore.setState({ currentResearch: store.currentResearch });
    
    // Complete research
    store.completeResearch(techId, factionId);
  });
}

// Render helper with proper act() wrapping
const renderTechTree = async () => {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(<TechTree />);
  });
  return result!;
};

// Store mutation helpers with proper act() wrapping
const addReputation = async (factionId: string, amount: number) => {
  await act(async () => {
    useFactionReputationStore.getState().addReputation(factionId, amount);
  });
};

const researchTech = async (techId: string, factionId: string) => {
  let result: string;
  await act(async () => {
    result = useFactionReputationStore.getState().researchTech(techId, factionId);
  });
  return result!;
};

const cancelResearch = async (techId: string, factionId: string) => {
  await act(async () => {
    useFactionReputationStore.getState().cancelResearch(techId, factionId);
  });
};

// Click helper with proper act() wrapping
const clickElement = async (element: HTMLElement) => {
  await act(async () => {
    fireEvent.click(element);
  });
};

describe('TechTree Component', () => {
  beforeEach(async () => {
    await resetStore();
  });

  afterEach(async () => {
    await resetStore();
  });

  describe('Rendering', () => {
    it('renders at least 12 nodes with data-testid attributes', async () => {
      await renderTechTree();
      
      // All nodes: 4 factions × 3 tiers = 12 nodes
      const nodes = screen.getAllByTestId(/^tech-node-(void|inferno|storm|stellar)-tier-[123]$/);
      expect(nodes.length).toBe(12);
    });

    it('renders nodes for all 4 factions and 3 tiers', async () => {
      await renderTechTree();
      
      const factions = ['void', 'inferno', 'storm', 'stellar'];
      
      factions.forEach((faction) => {
        for (let tier = 1; tier <= 3; tier++) {
          const node = screen.getByTestId(`tech-node-${faction}-tier-${tier}`);
          expect(node).toBeTruthy();
        }
      });
    });
  });

  describe('Research States', () => {
    it('shows locked state for high-rep requirement techs when rep is low', async () => {
      // Set reputation to 0, so T3 (requirement 15) should be locked
      await addReputation('void', 0);
      
      await renderTechTree();
      
      const node = screen.getByTestId('tech-node-void-tier-3');
      expect(node.getAttribute('data-state')).toBe(ResearchState.Locked);
    });

    it('shows available state for low-rep requirement techs when rep is sufficient', async () => {
      // Set reputation to 15 (enough for all tiers) for VOID faction
      await addReputation('void', 15);
      
      await renderTechTree();
      
      // void-tier-1 has requirement 3, so should be available
      const node = screen.getByTestId('tech-node-void-tier-1');
      expect(node.getAttribute('data-state')).toBe(ResearchState.Available);
    });

    it('shows researching state when tech is actively being researched', async () => {
      // Set reputation and start research
      await addReputation('inferno', 15);
      await researchTech('inferno-tier-1', 'inferno');
      
      await renderTechTree();
      
      const node = screen.getByTestId('tech-node-inferno-tier-1');
      expect(node.getAttribute('data-state')).toBe(ResearchState.Researching);
    });

    it('shows completed state when tech research is finished', async () => {
      // Set reputation and simulate research completion
      await addReputation('stellar', 15);
      await simulateResearchAndCompletion('stellar', 1);
      
      await renderTechTree();
      
      const node = screen.getByTestId('tech-node-stellar-tier-1');
      expect(node.getAttribute('data-state')).toBe(ResearchState.Completed);
    });
  });

  describe('Click-to-Research Interaction', () => {
    it('clicking available tech starts research (available → researching)', async () => {
      // Set reputation to meet requirements for void faction
      await addReputation('void', 15);
      
      await renderTechTree();
      
      const node = screen.getByTestId('tech-node-void-tier-1');
      expect(node.getAttribute('data-state')).toBe(ResearchState.Available);
      
      // Click the node
      await clickElement(node);
      
      // Should transition to researching
      expect(node.getAttribute('data-state')).toBe(ResearchState.Researching);
    });

    it('clicking locked tech does NOT start research', async () => {
      // Set reputation too low
      await addReputation('void', 0);
      
      await renderTechTree();
      
      const node = screen.getByTestId('tech-node-void-tier-3');
      expect(node.getAttribute('data-state')).toBe(ResearchState.Locked);
      
      // Click the node
      await clickElement(node);
      
      // State should remain locked
      expect(node.getAttribute('data-state')).toBe(ResearchState.Locked);
    });

    it('clicking completed tech shows error message', async () => {
      // Simulate research completion
      await addReputation('inferno', 15);
      await simulateResearchAndCompletion('inferno', 1);
      
      await renderTechTree();
      
      const node = screen.getByTestId('tech-node-inferno-tier-1');
      expect(node.getAttribute('data-state')).toBe(ResearchState.Completed);
      
      // Click should show error
      await clickElement(node);
      
      // Error message should appear
      expect(screen.getByText(/already completed/i)).toBeTruthy();
    });
  });

  describe('Research Flow', () => {
    it('research completion transitions to completed state', async () => {
      // Set reputation and simulate research completion
      await addReputation('storm', 15);
      await simulateResearchAndCompletion('storm', 1);
      
      await renderTechTree();
      
      const node = screen.getByTestId('tech-node-storm-tier-1');
      expect(node.getAttribute('data-state')).toBe(ResearchState.Completed);
    });

    it('research completion calls unlockTechTreeNode on faction store', async () => {
      // Set reputation and simulate research completion
      await addReputation('void', 15);
      await simulateResearchAndCompletion('void', 2);
      
      // Check faction store was updated
      const isUnlocked = useFactionStore.getState().isTechTreeNodeUnlocked('void-tier-2');
      expect(isUnlocked).toBe(true);
    });
  });

  describe('Queue Management', () => {
    it('returns already_researching when tech is already being researched', async () => {
      // Start a research
      await addReputation('void', 15);
      await researchTech('void-tier-1', 'void');
      
      // Try to start the same research again
      const result = await researchTech('void-tier-1', 'void');
      
      // Should return already_researching
      expect(result).toBe('already_researching');
    });

    it('does not crash when clicking tech already in queue', async () => {
      // Start a research
      await addReputation('void', 15);
      await researchTech('void-tier-1', 'void');
      
      await renderTechTree();
      
      // This should not throw
      await clickElement(screen.getByTestId('tech-node-void-tier-1'));
    });

    it('allows starting new research after one completes', async () => {
      // Start and complete a research
      await addReputation('void', 15);
      await simulateResearchAndCompletion('void', 1);
      
      // Should be able to start a new research
      const result = await researchTech('void-tier-2', 'void');
      expect(result).toBe('ok');
    });
  });

  describe('Store Methods', () => {
    it('getResearchableTechs returns only available techs', async () => {
      // Set reputation to 15 for void faction
      await addReputation('void', 15);
      // Set reputation to 0 for inferno
      await addReputation('inferno', 0);
      
      const availableTechs = useFactionReputationStore.getState().getResearchableTechs('void');
      
      // Should include void tier 1, 2, 3 (all available with 15 rep)
      expect(availableTechs.length).toBe(3);
      availableTechs.forEach((tech) => {
        expect(tech.faction).toBe('void');
      });
    });

    it('getRequiredReputation returns correct values for tiers', () => {
      const store = useFactionReputationStore.getState();
      
      expect(store.getRequiredReputation('void-tier-1')).toBe(3);
      expect(store.getRequiredReputation('void-tier-2')).toBe(7);
      expect(store.getRequiredReputation('void-tier-3')).toBe(15);
    });

    it('getCurrentResearch returns items for specific faction', async () => {
      // Start research for void faction
      await addReputation('void', 15);
      await researchTech('void-tier-1', 'void');
      
      const voidResearch = useFactionReputationStore.getState().getCurrentResearch('void');
      const infernoResearch = useFactionReputationStore.getState().getCurrentResearch('inferno');
      
      expect(voidResearch.length).toBe(1);
      expect(infernoResearch.length).toBe(0);
    });

    it('cancelResearch removes item from current research', async () => {
      // Start research
      await addReputation('void', 15);
      await researchTech('void-tier-1', 'void');
      
      expect(Object.keys(useFactionReputationStore.getState().currentResearch)).toHaveLength(1);
      
      // Cancel
      await cancelResearch('void-tier-1', 'void');
      
      expect(Object.keys(useFactionReputationStore.getState().currentResearch)).toHaveLength(0);
    });
  });

  describe('Visual States', () => {
    it('locked nodes have data-state="locked"', async () => {
      await renderTechTree();
      
      const lockedNodes = screen.getAllByTestId(/^tech-node-.*-tier-[123]$/).filter(
        (node) => node.getAttribute('data-state') === 'locked'
      );
      
      // All nodes should be locked at rep 0
      expect(lockedNodes.length).toBe(12);
    });

    it('nodes display correct data-state attribute', async () => {
      // Set up mixed states
      await addReputation('void', 15);
      await researchTech('void-tier-1', 'void');
      
      await renderTechTree();
      
      const voidTier1 = screen.getByTestId('tech-node-void-tier-1');
      const voidTier2 = screen.getByTestId('tech-node-void-tier-2');
      
      expect(voidTier1.getAttribute('data-state')).toBe('researching');
      expect(voidTier2.getAttribute('data-state')).toBe('available');
    });
  });

  describe('Queue Indicator', () => {
    it('displays queue count when research active', async () => {
      // Start one research
      await addReputation('void', 15);
      await researchTech('void-tier-1', 'void');
      
      await renderTechTree();
      
      // Find the queue indicator text - it should contain "1"
      // Look for the span with class text-sm font-bold text-white
      const queueIndicator = document.querySelector('span.text-sm.font-bold.text-white');
      expect(queueIndicator).toBeTruthy();
      expect(queueIndicator?.textContent).toContain('1');
    });

    it('displays 0 when no research active', async () => {
      await renderTechTree();
      
      // Find the queue indicator text - it should contain "0"
      const queueIndicator = document.querySelector('span.text-sm.font-bold.text-white');
      expect(queueIndicator).toBeTruthy();
      expect(queueIndicator?.textContent).toContain('0');
    });
  });
});
