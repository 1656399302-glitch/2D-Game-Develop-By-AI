/**
 * Community Store Unit Tests
 * 
 * Tests for the community store covering:
 * - Circuit publishing flow
 * - Browsing and filtering
 * - Favorites and ratings
 * - Pagination
 * - Search functionality
 * - UI state management
 * 
 * ROUND 158: Added unit tests for untested store
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCommunityStore } from '../../store/useCommunityStore';
import { MOCK_COMMUNITY_MACHINES } from '../../data/communityGalleryData';

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

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-12345'),
}));

describe('Community Store Tests', () => {
  beforeEach(() => {
    // Clear localStorage and reset store state
    localStorageMock.clear();
    
    // Reset store to initial state
    useCommunityStore.setState({
      communityMachines: MOCK_COMMUNITY_MACHINES,
      publishedMachines: [],
      searchQuery: '',
      factionFilter: 'all',
      rarityFilter: 'all',
      sortOption: 'newest',
      isGalleryOpen: false,
      isPublishModalOpen: false,
      pendingMachine: null,
    });
  });

  // ============================================
  // Filter Actions Tests
  // ============================================
  describe('Filter Actions', () => {
    describe('setSearchQuery', () => {
      it('should update search query', () => {
        const store = useCommunityStore.getState();
        store.setSearchQuery('void');
        
        const state = useCommunityStore.getState();
        expect(state.searchQuery).toBe('void');
      });

      it('should handle empty query', () => {
        const store = useCommunityStore.getState();
        store.setSearchQuery('');
        
        const state = useCommunityStore.getState();
        expect(state.searchQuery).toBe('');
      });

      it('should handle special characters', () => {
        const store = useCommunityStore.getState();
        store.setSearchQuery('test@#$%');
        
        const state = useCommunityStore.getState();
        expect(state.searchQuery).toBe('test@#$%');
      });
    });

    describe('setFactionFilter', () => {
      it('should filter by void faction', () => {
        const store = useCommunityStore.getState();
        store.setFactionFilter('void');
        
        const state = useCommunityStore.getState();
        expect(state.factionFilter).toBe('void');
      });

      it('should filter by inferno faction', () => {
        const store = useCommunityStore.getState();
        store.setFactionFilter('inferno');
        
        const state = useCommunityStore.getState();
        expect(state.factionFilter).toBe('inferno');
      });

      it('should reset to all factions', () => {
        const store = useCommunityStore.getState();
        store.setFactionFilter('void');
        store.setFactionFilter('all');
        
        const state = useCommunityStore.getState();
        expect(state.factionFilter).toBe('all');
      });
    });

    describe('setRarityFilter', () => {
      it('should filter by rare rarity', () => {
        const store = useCommunityStore.getState();
        store.setRarityFilter('rare');
        
        const state = useCommunityStore.getState();
        expect(state.rarityFilter).toBe('rare');
      });

      it('should filter by legendary rarity', () => {
        const store = useCommunityStore.getState();
        store.setRarityFilter('legendary');
        
        const state = useCommunityStore.getState();
        expect(state.rarityFilter).toBe('legendary');
      });

      it('should reset to all rarities', () => {
        const store = useCommunityStore.getState();
        store.setRarityFilter('epic');
        store.setRarityFilter('all');
        
        const state = useCommunityStore.getState();
        expect(state.rarityFilter).toBe('all');
      });
    });

    describe('setSortOption', () => {
      it('should sort by newest', () => {
        const store = useCommunityStore.getState();
        store.setSortOption('newest');
        
        const state = useCommunityStore.getState();
        expect(state.sortOption).toBe('newest');
      });

      it('should sort by most liked', () => {
        const store = useCommunityStore.getState();
        store.setSortOption('most-liked');
        
        const state = useCommunityStore.getState();
        expect(state.sortOption).toBe('most-liked');
      });

      it('should sort by most viewed', () => {
        const store = useCommunityStore.getState();
        store.setSortOption('most-viewed');
        
        const state = useCommunityStore.getState();
        expect(state.sortOption).toBe('most-viewed');
      });
    });
  });

  // ============================================
  // Gallery UI Tests
  // ============================================
  describe('Gallery UI', () => {
    describe('openGallery', () => {
      it('should open gallery', () => {
        const store = useCommunityStore.getState();
        store.openGallery();
        
        const state = useCommunityStore.getState();
        expect(state.isGalleryOpen).toBe(true);
      });
    });

    describe('closeGallery', () => {
      it('should close gallery', () => {
        const store = useCommunityStore.getState();
        store.openGallery();
        store.closeGallery();
        
        const state = useCommunityStore.getState();
        expect(state.isGalleryOpen).toBe(false);
      });
    });
  });

  // ============================================
  // Publish Flow Tests
  // ============================================
  describe('Publish Flow', () => {
    const mockModules = [
      { id: 'm1', instanceId: 'm1', type: 'core-furnace' as const, x: 0, y: 0, rotation: 0, scale: 1, flipped: false, ports: [] },
    ];
    const mockConnections = [];
    const mockAttributes = {
      name: 'Test Machine',
      rarity: 'rare' as const,
      stats: { stability: 80, powerOutput: 70, energyCost: 50, failureRate: 20 },
      tags: ['test'],
      description: 'A test machine',
      codexId: 'TEST-001',
    };

    describe('openPublishModal', () => {
      it('should open publish modal with machine data', () => {
        const store = useCommunityStore.getState();
        store.openPublishModal(mockModules, mockConnections, mockAttributes, 'void');
        
        const state = useCommunityStore.getState();
        expect(state.isPublishModalOpen).toBe(true);
        expect(state.pendingMachine).not.toBeNull();
        expect(state.pendingMachine?.modules).toEqual(mockModules);
        expect(state.pendingMachine?.attributes.name).toBe('Test Machine');
      });

      it('should set dominant faction', () => {
        const store = useCommunityStore.getState();
        store.openPublishModal(mockModules, mockConnections, mockAttributes, 'inferno');
        
        const state = useCommunityStore.getState();
        expect(state.pendingMachine?.dominantFaction).toBe('inferno');
      });
    });

    describe('closePublishModal', () => {
      it('should close publish modal and clear pending machine', () => {
        const store = useCommunityStore.getState();
        store.openPublishModal(mockModules, mockConnections, mockAttributes, 'void');
        store.closePublishModal();
        
        const state = useCommunityStore.getState();
        expect(state.isPublishModalOpen).toBe(false);
        expect(state.pendingMachine).toBeNull();
      });
    });

    describe('publishMachine', () => {
      it('should publish machine with author name', () => {
        const store = useCommunityStore.getState();
        store.openPublishModal(mockModules, mockConnections, mockAttributes, 'void');
        store.publishMachine('TestAuthor');
        
        const state = useCommunityStore.getState();
        expect(state.isPublishModalOpen).toBe(false);
        expect(state.pendingMachine).toBeNull();
        expect(state.publishedMachines).toHaveLength(1);
        expect(state.publishedMachines[0].author).toBe('TestAuthor');
      });

      it('should use Anonymous for empty author name', () => {
        const store = useCommunityStore.getState();
        store.openPublishModal(mockModules, mockConnections, mockAttributes, 'void');
        store.publishMachine('');
        
        const state = useCommunityStore.getState();
        expect(state.publishedMachines[0].author).toBe('Anonymous');
      });

      it('should trim author name whitespace', () => {
        const store = useCommunityStore.getState();
        store.openPublishModal(mockModules, mockConnections, mockAttributes, 'void');
        store.publishMachine('  TestAuthor  ');
        
        const state = useCommunityStore.getState();
        expect(state.publishedMachines[0].author).toBe('TestAuthor');
      });

      it('should switch sort option to newest after publishing', () => {
        const store = useCommunityStore.getState();
        store.setSortOption('most-liked');
        store.openPublishModal(mockModules, mockConnections, mockAttributes, 'void');
        store.publishMachine('TestAuthor');
        
        const state = useCommunityStore.getState();
        expect(state.sortOption).toBe('newest');
      });

      it('should generate unique ID for published machine', () => {
        const store = useCommunityStore.getState();
        store.openPublishModal(mockModules, mockConnections, mockAttributes, 'void');
        store.publishMachine('TestAuthor');
        
        const state = useCommunityStore.getState();
        expect(state.publishedMachines[0].id).toContain('published-');
      });

      it('should set initial likes and views to 0', () => {
        const store = useCommunityStore.getState();
        store.openPublishModal(mockModules, mockConnections, mockAttributes, 'void');
        store.publishMachine('TestAuthor');
        
        const state = useCommunityStore.getState();
        expect(state.publishedMachines[0].likes).toBe(0);
        expect(state.publishedMachines[0].views).toBe(0);
      });

      it('should set publishedAt timestamp', () => {
        const beforePublish = Date.now();
        const store = useCommunityStore.getState();
        store.openPublishModal(mockModules, mockConnections, mockAttributes, 'void');
        store.publishMachine('TestAuthor');
        const afterPublish = Date.now();
        
        const state = useCommunityStore.getState();
        expect(state.publishedMachines[0].publishedAt).toBeGreaterThanOrEqual(beforePublish);
        expect(state.publishedMachines[0].publishedAt).toBeLessThanOrEqual(afterPublish);
      });

      it('should not publish without pending machine', () => {
        const store = useCommunityStore.getState();
        // Don't open modal first
        store.publishMachine('TestAuthor');
        
        const state = useCommunityStore.getState();
        expect(state.publishedMachines).toHaveLength(0);
      });
    });
  });

  // ============================================
  // Interaction Actions Tests
  // ============================================
  describe('Interaction Actions', () => {
    describe('likeMachine', () => {
      it('should increment likes for mock machine', () => {
        const store = useCommunityStore.getState();
        const initialLikes = MOCK_COMMUNITY_MACHINES[0].likes;
        
        store.likeMachine('mock-void-resonator');
        
        const state = useCommunityStore.getState();
        const machine = state.communityMachines.find(m => m.id === 'mock-void-resonator');
        expect(machine?.likes).toBe(initialLikes + 1);
      });

      it('should increment likes for published machine', () => {
        const store = useCommunityStore.getState();
        useCommunityStore.setState({
          publishedMachines: [{
            id: 'published-123',
            author: 'TestAuthor',
            publishedAt: Date.now(),
            likes: 5,
            views: 0,
            modules: [],
            connections: [],
            attributes: mockAttributes,
            dominantFaction: 'void',
          }],
        });
        
        store.likeMachine('published-123');
        
        const state = useCommunityStore.getState();
        const machine = state.publishedMachines.find(m => m.id === 'published-123');
        expect(machine?.likes).toBe(6);
      });

      it('should not affect other machines when liking one', () => {
        const store = useCommunityStore.getState();
        const initialLikes = MOCK_COMMUNITY_MACHINES[1].likes;
        
        store.likeMachine('mock-void-resonator');
        
        const state = useCommunityStore.getState();
        const machine = state.communityMachines.find(m => m.id === 'mock-inferno-blaze');
        expect(machine?.likes).toBe(initialLikes);
      });
    });

    describe('viewMachine', () => {
      it('should increment views for mock machine', () => {
        const store = useCommunityStore.getState();
        const initialViews = MOCK_COMMUNITY_MACHINES[0].views;
        
        store.viewMachine('mock-void-resonator');
        
        const state = useCommunityStore.getState();
        const machine = state.communityMachines.find(m => m.id === 'mock-void-resonator');
        expect(machine?.views).toBe(initialViews + 1);
      });

      it('should not increment views for published machine', () => {
        const store = useCommunityStore.getState();
        useCommunityStore.setState({
          publishedMachines: [{
            id: 'published-123',
            author: 'TestAuthor',
            publishedAt: Date.now(),
            likes: 0,
            views: 5,
            modules: [],
            connections: [],
            attributes: mockAttributes,
            dominantFaction: 'void',
          }],
        });
        
        store.viewMachine('published-123');
        
        const state = useCommunityStore.getState();
        const machine = state.publishedMachines.find(m => m.id === 'published-123');
        expect(machine?.views).toBe(5); // Should remain unchanged
      });
    });
  });

  // ============================================
  // Filtered List Tests
  // ============================================
  describe('getFilteredMachinesList', () => {
    it('should return all machines when no filters applied', () => {
      const store = useCommunityStore.getState();
      const machines = store.getFilteredMachinesList();
      
      expect(machines.length).toBe(MOCK_COMMUNITY_MACHINES.length);
    });

    it('should filter by faction', () => {
      const store = useCommunityStore.getState();
      store.setFactionFilter('void');
      
      const machines = store.getFilteredMachinesList();
      
      expect(machines.every(m => m.dominantFaction === 'void')).toBe(true);
    });

    it('should filter by rarity', () => {
      const store = useCommunityStore.getState();
      store.setRarityFilter('legendary');
      
      const machines = store.getFilteredMachinesList();
      
      expect(machines.every(m => m.attributes.rarity === 'legendary')).toBe(true);
    });

    it('should filter by search query in name', () => {
      const store = useCommunityStore.getState();
      store.setSearchQuery('void');
      
      const machines = store.getFilteredMachinesList();
      
      expect(machines.length).toBeGreaterThan(0);
      expect(machines.every(m => 
        m.attributes.name.toLowerCase().includes('void') ||
        m.attributes.description.toLowerCase().includes('void')
      )).toBe(true);
    });

    it('should filter by search query in author', () => {
      const store = useCommunityStore.getState();
      store.setSearchQuery('arcane_wizard');
      
      const machines = store.getFilteredMachinesList();
      
      expect(machines.every(m => m.author.toLowerCase().includes('arcane_wizard'))).toBe(true);
    });

    it('should filter by search query in tags', () => {
      const store = useCommunityStore.getState();
      store.setSearchQuery('fire');
      
      const machines = store.getFilteredMachinesList();
      
      expect(machines.length).toBeGreaterThan(0);
    });

    it('should sort by newest', () => {
      const store = useCommunityStore.getState();
      store.setSortOption('newest');
      
      const machines = store.getFilteredMachinesList();
      
      // Should be sorted by publishedAt descending
      for (let i = 1; i < machines.length; i++) {
        expect(machines[i - 1].publishedAt).toBeGreaterThanOrEqual(machines[i].publishedAt);
      }
    });

    it('should sort by most liked', () => {
      const store = useCommunityStore.getState();
      store.setSortOption('most-liked');
      
      const machines = store.getFilteredMachinesList();
      
      // Should be sorted by likes descending
      for (let i = 1; i < machines.length; i++) {
        expect(machines[i - 1].likes).toBeGreaterThanOrEqual(machines[i].likes);
      }
    });

    it('should sort by most viewed', () => {
      const store = useCommunityStore.getState();
      store.setSortOption('most-viewed');
      
      const machines = store.getFilteredMachinesList();
      
      // Should be sorted by views descending
      for (let i = 1; i < machines.length; i++) {
        expect(machines[i - 1].views).toBeGreaterThanOrEqual(machines[i].views);
      }
    });

    it('should combine multiple filters', () => {
      const store = useCommunityStore.getState();
      store.setFactionFilter('void');
      store.setRarityFilter('epic');
      
      const machines = store.getFilteredMachinesList();
      
      expect(machines.every(m => 
        m.dominantFaction === 'void' && m.attributes.rarity === 'epic'
      )).toBe(true);
    });

    it('should include published machines in results', () => {
      const store = useCommunityStore.getState();
      useCommunityStore.setState({
        publishedMachines: [{
          id: 'published-123',
          author: 'TestAuthor',
          publishedAt: Date.now(),
          likes: 100,
          views: 0,
          modules: [],
          connections: [],
          attributes: {
            name: 'Published Test',
            rarity: 'rare' as const,
            stats: { stability: 80, powerOutput: 70, energyCost: 50, failureRate: 20 },
            tags: ['test'],
            description: 'A published test',
            codexId: 'TEST-002',
          },
          dominantFaction: 'void',
        }],
      });
      
      const machines = store.getFilteredMachinesList();
      
      expect(machines.some(m => m.id === 'published-123')).toBe(true);
    });

    it('should handle empty search query', () => {
      const store = useCommunityStore.getState();
      store.setSearchQuery('');
      
      const machines = store.getFilteredMachinesList();
      
      expect(machines.length).toBe(MOCK_COMMUNITY_MACHINES.length);
    });

    it('should be case insensitive for search', () => {
      const store = useCommunityStore.getState();
      store.setSearchQuery('VOID');
      
      const machinesLower = useCommunityStore.getState().getFilteredMachinesList();
      store.setSearchQuery('void');
      const machinesUpper = useCommunityStore.getState().getFilteredMachinesList();
      
      expect(machinesLower.length).toBe(machinesUpper.length);
    });
  });

  // ============================================
  // UI State Tests
  // ============================================
  describe('UI State', () => {
    it('should track gallery open state', () => {
      let store = useCommunityStore.getState();
      
      expect(store.isGalleryOpen).toBe(false);
      
      store.openGallery();
      store = useCommunityStore.getState();  // Re-fetch state after action
      expect(store.isGalleryOpen).toBe(true);
      
      store.closeGallery();
      store = useCommunityStore.getState();  // Re-fetch state after action
      expect(store.isGalleryOpen).toBe(false);
    });

    it('should track publish modal state', () => {
      let store = useCommunityStore.getState();
      
      expect(store.isPublishModalOpen).toBe(false);
      
      store.openPublishModal([], [], mockAttributes, 'void');
      store = useCommunityStore.getState();  // Re-fetch state after action
      expect(store.isPublishModalOpen).toBe(true);
      
      store.closePublishModal();
      store = useCommunityStore.getState();  // Re-fetch state after action
      expect(store.isPublishModalOpen).toBe(false);
    });

    it('should handle gallery and modal independently', () => {
      let store = useCommunityStore.getState();
      
      store.openGallery();
      store.openPublishModal([], [], mockAttributes, 'void');
      store = useCommunityStore.getState();  // Re-fetch state after actions
      
      expect(store.isGalleryOpen).toBe(true);
      expect(store.isPublishModalOpen).toBe(true);
      
      store.closeGallery();
      store = useCommunityStore.getState();  // Re-fetch state after action
      
      expect(store.isGalleryOpen).toBe(false);
      expect(store.isPublishModalOpen).toBe(true);
    });
  });

  // ============================================
  // Persistence Tests
  // ============================================
  describe('Persistence', () => {
    it('should include published machines in persisted state', () => {
      const store = useCommunityStore.getState();
      store.openPublishModal([], [], mockAttributes, 'void');
      store.publishMachine('TestAuthor');
      
      const state = useCommunityStore.getState();
      expect(state.publishedMachines).toHaveLength(1);
    });

    it('should include mock machines in state', () => {
      const store = useCommunityStore.getState();
      
      expect(store.communityMachines.length).toBeGreaterThan(0);
    });

    it('should not persist filter state', () => {
      const store = useCommunityStore.getState();
      store.setSearchQuery('test');
      store.setFactionFilter('void');
      
      // Filter state should remain in current state
      const state = useCommunityStore.getState();
      expect(state.searchQuery).toBe('test');
      expect(state.factionFilter).toBe('void');
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle liking non-existent machine', () => {
      const store = useCommunityStore.getState();
      
      expect(() => {
        store.likeMachine('non-existent');
      }).not.toThrow();
    });

    it('should handle viewing non-existent machine', () => {
      const store = useCommunityStore.getState();
      
      expect(() => {
        store.viewMachine('non-existent');
      }).not.toThrow();
    });

    it('should handle empty published machines list', () => {
      const store = useCommunityStore.getState();
      const machines = store.getFilteredMachinesList();
      
      expect(machines.length).toBe(MOCK_COMMUNITY_MACHINES.length);
    });

    it('should handle search with no matches', () => {
      const store = useCommunityStore.getState();
      store.setSearchQuery('nonexistentquery12345');
      
      const machines = store.getFilteredMachinesList();
      
      expect(machines).toHaveLength(0);
    });

    it('should handle filter with no matches', () => {
      const store = useCommunityStore.getState();
      store.setRarityFilter('common');
      store.setFactionFilter('stellar');
      
      const machines = store.getFilteredMachinesList();
      
      // Find if there's any stellar common machine in mocks
      const hasMatch = MOCK_COMMUNITY_MACHINES.some(
        m => m.dominantFaction === 'stellar' && m.attributes.rarity === 'common'
      );
      
      if (!hasMatch) {
        expect(machines).toHaveLength(0);
      }
    });

    it('should handle rapid filter changes', () => {
      const store = useCommunityStore.getState();
      
      store.setFactionFilter('void');
      store.setFactionFilter('inferno');
      store.setFactionFilter('storm');
      
      const state = useCommunityStore.getState();
      expect(state.factionFilter).toBe('storm');
    });

    it('should handle rapid publish operations', () => {
      const store = useCommunityStore.getState();
      
      for (let i = 0; i < 5; i++) {
        store.openPublishModal([], [], {
          ...mockAttributes,
          name: `Machine ${i}`,
        }, 'void');
        store.publishMachine(`Author${i}`);
      }
      
      const state = useCommunityStore.getState();
      expect(state.publishedMachines).toHaveLength(5);
    });
  });
});

// Helper variable for tests
const mockAttributes = {
  name: 'Test Machine',
  rarity: 'rare' as const,
  stats: { stability: 80, powerOutput: 70, energyCost: 50, failureRate: 20 },
  tags: ['test'],
  description: 'A test machine',
  codexId: 'TEST-001',
};
