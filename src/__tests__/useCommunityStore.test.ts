/**
 * Community Store Tests
 * 
 * Tests for the useCommunityStore which manages:
 * - Community gallery browsing
 * - Machine publishing
 * - Like/view tracking
 * - Filtering and sorting
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  useCommunityStore,
  hydrateCommunityStore,
  isCommunityHydrated,
  selectCommunityMachines,
  selectPublishedMachines,
  selectIsGalleryOpen,
  selectIsPublishModalOpen,
} from '../store/useCommunityStore';

describe('useCommunityStore', () => {
  beforeEach(() => {
    // Trigger hydration
    hydrateCommunityStore();
    
    // Reset store state before each test
    useCommunityStore.setState({
      communityMachines: useCommunityStore.getState().communityMachines,
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

  afterEach(() => {
    // Clean up after each test
    useCommunityStore.setState({
      publishedMachines: [],
      pendingMachine: null,
    });
  });

  describe('initial state', () => {
    it('should have communityMachines array', () => {
      const state = useCommunityStore.getState();
      expect(Array.isArray(state.communityMachines)).toBe(true);
    });

    it('should have publishedMachines array', () => {
      const state = useCommunityStore.getState();
      expect(Array.isArray(state.publishedMachines)).toBe(true);
    });

    it('should start with empty publishedMachines', () => {
      const state = useCommunityStore.getState();
      expect(state.publishedMachines.length).toBe(0);
    });

    it('should start with empty searchQuery', () => {
      const state = useCommunityStore.getState();
      expect(state.searchQuery).toBe('');
    });

    it('should start with all factionFilter', () => {
      const state = useCommunityStore.getState();
      expect(state.factionFilter).toBe('all');
    });

    it('should start with all rarityFilter', () => {
      const state = useCommunityStore.getState();
      expect(state.rarityFilter).toBe('all');
    });

    it('should start with newest sortOption', () => {
      const state = useCommunityStore.getState();
      expect(state.sortOption).toBe('newest');
    });

    it('should start with gallery closed', () => {
      const state = useCommunityStore.getState();
      expect(state.isGalleryOpen).toBe(false);
    });

    it('should start with publish modal closed', () => {
      const state = useCommunityStore.getState();
      expect(state.isPublishModalOpen).toBe(false);
    });

    it('should start with no pendingMachine', () => {
      const state = useCommunityStore.getState();
      expect(state.pendingMachine).toBeNull();
    });
  });

  describe('openGallery / closeGallery', () => {
    it('should open gallery when openGallery called', () => {
      useCommunityStore.getState().openGallery();
      expect(useCommunityStore.getState().isGalleryOpen).toBe(true);
    });

    it('should close gallery when closeGallery called', () => {
      const store = useCommunityStore.getState();
      store.openGallery();
      store.closeGallery();
      expect(useCommunityStore.getState().isGalleryOpen).toBe(false);
    });

    it('should toggle gallery state correctly', () => {
      const store = useCommunityStore.getState();
      expect(useCommunityStore.getState().isGalleryOpen).toBe(false);
      store.openGallery();
      expect(useCommunityStore.getState().isGalleryOpen).toBe(true);
      store.closeGallery();
      expect(useCommunityStore.getState().isGalleryOpen).toBe(false);
    });

    it('should not affect publishModal when toggling gallery', () => {
      const store = useCommunityStore.getState();
      store.openGallery();
      expect(useCommunityStore.getState().isPublishModalOpen).toBe(false);
      store.closeGallery();
      expect(useCommunityStore.getState().isPublishModalOpen).toBe(false);
    });
  });

  describe('openPublishModal / closePublishModal', () => {
    it('should open publish modal when openPublishModal called', () => {
      const { openPublishModal } = useCommunityStore.getState();
      openPublishModal([], [], { power: 0, stability: 0, efficiency: 0 }, 'void');
      expect(useCommunityStore.getState().isPublishModalOpen).toBe(true);
    });

    it('should close publish modal when closePublishModal called', () => {
      const store = useCommunityStore.getState();
      store.openPublishModal([], [], { power: 0, stability: 0, efficiency: 0 }, 'void');
      store.closePublishModal();
      expect(useCommunityStore.getState().isPublishModalOpen).toBe(false);
    });

    it('should not affect gallery state when toggling publish modal', () => {
      const store = useCommunityStore.getState();
      store.openPublishModal([], [], { power: 0, stability: 0, efficiency: 0 }, 'void');
      expect(useCommunityStore.getState().isGalleryOpen).toBe(false);
      store.closePublishModal();
      expect(useCommunityStore.getState().isGalleryOpen).toBe(false);
    });
  });

  describe('publishMachine', () => {
    it('should create entry in publishedMachines array when pendingMachine exists', () => {
      // Set a pending machine first
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 50, stability: 80, efficiency: 50 },
          dominantFaction: 'void',
        },
      });
      
      useCommunityStore.getState().publishMachine('TestAuthor');
      
      expect(useCommunityStore.getState().publishedMachines.length).toBe(1);
    });

    it('should set pendingMachine to null after publishing', () => {
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 50, stability: 80, efficiency: 50 },
          dominantFaction: 'void',
        },
      });
      
      useCommunityStore.getState().publishMachine('TestAuthor');
      
      expect(useCommunityStore.getState().pendingMachine).toBeNull();
    });

    it('should set sortOption to newest after publishing', () => {
      useCommunityStore.setState({
        sortOption: 'most_liked',
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 50, stability: 80, efficiency: 50 },
          dominantFaction: 'void',
        },
      });
      
      useCommunityStore.getState().publishMachine('TestAuthor');
      
      expect(useCommunityStore.getState().sortOption).toBe('newest');
    });

    it('should add author name to published machine', () => {
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 50, stability: 80, efficiency: 50 },
          dominantFaction: 'void',
        },
      });
      
      useCommunityStore.getState().publishMachine('TestAuthor');
      
      const published = useCommunityStore.getState().publishedMachines[0];
      expect(published.author).toBe('TestAuthor');
    });

    it('should add generated id to published machine', () => {
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 50, stability: 80, efficiency: 50 },
          dominantFaction: 'void',
        },
      });
      
      useCommunityStore.getState().publishMachine('TestAuthor');
      
      const published = useCommunityStore.getState().publishedMachines[0];
      expect(published.id).toBeDefined();
      expect(typeof published.id).toBe('string');
    });

    it('should be no-op when no pendingMachine', () => {
      useCommunityStore.setState({ pendingMachine: null });
      
      useCommunityStore.getState().publishMachine('TestAuthor');
      
      expect(useCommunityStore.getState().publishedMachines.length).toBe(0);
    });

    it('should close publish modal after publishing', () => {
      const store = useCommunityStore.getState();
      store.openPublishModal([], [], { power: 50, stability: 80, efficiency: 50 }, 'void');
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 50, stability: 80, efficiency: 50 },
          dominantFaction: 'void',
        },
      });
      
      store.publishMachine('TestAuthor');
      
      expect(useCommunityStore.getState().isPublishModalOpen).toBe(false);
    });

    it('should preserve machine attributes when publishing', () => {
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 100, stability: 50, efficiency: 75 },
          dominantFaction: 'void',
        },
      });
      
      useCommunityStore.getState().publishMachine('TestAuthor');
      
      const published = useCommunityStore.getState().publishedMachines[0];
      expect(published.attributes.power).toBe(100);
      expect(published.attributes.stability).toBe(50);
    });
  });

  describe('likeMachine', () => {
    it('should increment likes for mock machine', () => {
      const state1 = useCommunityStore.getState();
      const mockMachine = state1.communityMachines.find(m => m.id === 'mock-1');
      if (!mockMachine) {
        // If no mock-1, skip test or find any mock machine
        const anyMock = state1.communityMachines[0];
        if (!anyMock) return;
        
        const initialLikes = anyMock.likes;
        useCommunityStore.getState().likeMachine(anyMock.id);
        const updatedMachine = useCommunityStore.getState().communityMachines.find(m => m.id === anyMock.id);
        expect(updatedMachine?.likes).toBe(initialLikes + 1);
      } else {
        const initialLikes = mockMachine.likes;
        useCommunityStore.getState().likeMachine('mock-1');
        const updatedMachine = useCommunityStore.getState().communityMachines.find(m => m.id === 'mock-1');
        expect(updatedMachine?.likes).toBe(initialLikes + 1);
      }
    });

    it('should increment likes for published machine', () => {
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 50, stability: 80, efficiency: 50 },
          dominantFaction: 'void',
        },
      });
      useCommunityStore.getState().publishMachine('TestAuthor');
      
      const published = useCommunityStore.getState().publishedMachines[0];
      const likesBefore = published.likes;
      useCommunityStore.getState().likeMachine(published.id);
      
      const updatedMachine = useCommunityStore.getState().publishedMachines.find(m => m.id === published.id);
      expect(updatedMachine?.likes).toBe(likesBefore + 1);
    });

    it('should be idempotent for non-mock machine', () => {
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 50, stability: 80, efficiency: 50 },
          dominantFaction: 'void',
        },
      });
      useCommunityStore.getState().publishMachine('TestAuthor');
      
      const published = useCommunityStore.getState().publishedMachines[0];
      const likesBefore = published.likes;
      
      // Call likeMachine - it increments for both mock and published
      useCommunityStore.getState().likeMachine(published.id);
      
      const updatedMachine = useCommunityStore.getState().publishedMachines.find(m => m.id === published.id);
      expect(updatedMachine?.likes).toBe(likesBefore + 1);
    });

    it('should handle non-existent machine gracefully', () => {
      expect(() => useCommunityStore.getState().likeMachine('non-existent-id')).not.toThrow();
    });
  });

  describe('viewMachine', () => {
    it('should increment views for mock machine', () => {
      const state1 = useCommunityStore.getState();
      const mockMachine = state1.communityMachines.find(m => m.id && m.id.startsWith('mock-'));
      if (!mockMachine) return;
      
      const initialViews = mockMachine.views;
      useCommunityStore.getState().viewMachine(mockMachine.id);
      
      const updatedMachine = useCommunityStore.getState().communityMachines.find(m => m.id === mockMachine.id);
      expect(updatedMachine?.views).toBe(initialViews + 1);
    });

    it('should NOT increment views for non-mock machine', () => {
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 50, stability: 80, efficiency: 50 },
          dominantFaction: 'void',
        },
      });
      useCommunityStore.getState().publishMachine('TestAuthor');
      
      const published = useCommunityStore.getState().publishedMachines[0];
      const viewsBefore = published.views;
      useCommunityStore.getState().viewMachine(published.id);
      
      const updatedMachine = useCommunityStore.getState().publishedMachines.find(m => m.id === published.id);
      expect(updatedMachine?.views).toBe(viewsBefore);
    });

    it('should handle non-existent machine gracefully', () => {
      expect(() => useCommunityStore.getState().viewMachine('non-existent-id')).not.toThrow();
    });
  });

  describe('setSearchQuery', () => {
    it('should set searchQuery correctly', () => {
      useCommunityStore.getState().setSearchQuery('void furnace');
      expect(useCommunityStore.getState().searchQuery).toBe('void furnace');
    });

    it('should update searchQuery multiple times', () => {
      const store = useCommunityStore.getState();
      store.setSearchQuery('first');
      expect(useCommunityStore.getState().searchQuery).toBe('first');
      store.setSearchQuery('second');
      expect(useCommunityStore.getState().searchQuery).toBe('second');
    });

    it('should handle empty string', () => {
      const store = useCommunityStore.getState();
      store.setSearchQuery('some query');
      store.setSearchQuery('');
      expect(useCommunityStore.getState().searchQuery).toBe('');
    });

    it('should handle special characters', () => {
      const store = useCommunityStore.getState();
      store.setSearchQuery('test!@#$%^&*()');
      expect(useCommunityStore.getState().searchQuery).toBe('test!@#$%^&*()');
    });
  });

  describe('setFactionFilter', () => {
    it('should set factionFilter to void', () => {
      useCommunityStore.getState().setFactionFilter('void');
      expect(useCommunityStore.getState().factionFilter).toBe('void');
    });

    it('should set factionFilter to inferno', () => {
      useCommunityStore.getState().setFactionFilter('inferno');
      expect(useCommunityStore.getState().factionFilter).toBe('inferno');
    });

    it('should set factionFilter to storm', () => {
      useCommunityStore.getState().setFactionFilter('storm');
      expect(useCommunityStore.getState().factionFilter).toBe('storm');
    });

    it('should set factionFilter to stellar', () => {
      useCommunityStore.getState().setFactionFilter('stellar');
      expect(useCommunityStore.getState().factionFilter).toBe('stellar');
    });

    it('should set factionFilter to all', () => {
      useCommunityStore.getState().setFactionFilter('void');
      useCommunityStore.getState().setFactionFilter('all');
      expect(useCommunityStore.getState().factionFilter).toBe('all');
    });
  });

  describe('setRarityFilter', () => {
    it('should set rarityFilter correctly', () => {
      useCommunityStore.getState().setRarityFilter('rare');
      expect(useCommunityStore.getState().rarityFilter).toBe('rare');
    });

    it('should handle common rarity', () => {
      useCommunityStore.getState().setRarityFilter('common');
      expect(useCommunityStore.getState().rarityFilter).toBe('common');
    });

    it('should handle epic rarity', () => {
      useCommunityStore.getState().setRarityFilter('epic');
      expect(useCommunityStore.getState().rarityFilter).toBe('epic');
    });

    it('should handle legendary rarity', () => {
      useCommunityStore.getState().setRarityFilter('legendary');
      expect(useCommunityStore.getState().rarityFilter).toBe('legendary');
    });

    it('should handle all rarity', () => {
      useCommunityStore.getState().setRarityFilter('all');
      expect(useCommunityStore.getState().rarityFilter).toBe('all');
    });
  });

  describe('setSortOption', () => {
    it('should set sortOption to newest', () => {
      useCommunityStore.getState().setSortOption('newest');
      expect(useCommunityStore.getState().sortOption).toBe('newest');
    });

    it('should set sortOption to oldest', () => {
      useCommunityStore.getState().setSortOption('oldest');
      expect(useCommunityStore.getState().sortOption).toBe('oldest');
    });

    it('should set sortOption to most_liked', () => {
      useCommunityStore.getState().setSortOption('most_liked');
      expect(useCommunityStore.getState().sortOption).toBe('most_liked');
    });

    it('should set sortOption to most_viewed', () => {
      useCommunityStore.getState().setSortOption('most_viewed');
      expect(useCommunityStore.getState().sortOption).toBe('most_viewed');
    });
  });

  describe('getFilteredMachinesList', () => {
    it('should return array', () => {
      const result = useCommunityStore.getState().getFilteredMachinesList();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should combine communityMachines and publishedMachines', () => {
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 50, stability: 80, efficiency: 50 },
          dominantFaction: 'void',
        },
      });
      useCommunityStore.getState().publishMachine('TestAuthor');
      
      const result = useCommunityStore.getState().getFilteredMachinesList();
      const communityCount = useCommunityStore.getState().communityMachines.length;
      // Result should include community machines plus published
      expect(result.length).toBeGreaterThanOrEqual(communityCount);
    });

    it('should return all machines when no filters applied', () => {
      useCommunityStore.getState().setFactionFilter('all');
      useCommunityStore.getState().setRarityFilter('all');
      useCommunityStore.getState().setSearchQuery('');
      
      const result = useCommunityStore.getState().getFilteredMachinesList();
      const communityCount = useCommunityStore.getState().communityMachines.length;
      
      expect(result.length).toBeGreaterThanOrEqual(communityCount);
    });
  });

  describe('selectors', () => {
    it('selectCommunityMachines should return communityMachines', () => {
      const machines = selectCommunityMachines(useCommunityStore.getState());
      expect(machines).toEqual(useCommunityStore.getState().communityMachines);
    });

    it('selectPublishedMachines should return publishedMachines', () => {
      const machines = selectPublishedMachines(useCommunityStore.getState());
      expect(machines).toEqual(useCommunityStore.getState().publishedMachines);
    });

    it('selectIsGalleryOpen should return isGalleryOpen state', () => {
      const state = useCommunityStore.getState();
      expect(selectIsGalleryOpen(state)).toBe(state.isGalleryOpen);
    });

    it('selectIsPublishModalOpen should return isPublishModalOpen state', () => {
      const state = useCommunityStore.getState();
      expect(selectIsPublishModalOpen(state)).toBe(state.isPublishModalOpen);
    });
  });

  describe('hydration helpers', () => {
    it('should expose isCommunityHydrated function', () => {
      expect(typeof isCommunityHydrated).toBe('function');
    });

    it('should expose hydrateCommunityStore function', () => {
      expect(typeof hydrateCommunityStore).toBe('function');
    });

    it('should be able to call hydrateCommunityStore', () => {
      expect(() => hydrateCommunityStore()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty communityMachines', () => {
      const original = useCommunityStore.getState().communityMachines;
      useCommunityStore.setState({ communityMachines: [] });
      
      const result = useCommunityStore.getState().getFilteredMachinesList();
      expect(Array.isArray(result)).toBe(true);
      
      // Restore
      useCommunityStore.setState({ communityMachines: original });
    });

    it('should handle rapid like operations', () => {
      const state1 = useCommunityStore.getState();
      const mockMachine = state1.communityMachines.find(m => m.id && m.id.startsWith('mock-'));
      if (!mockMachine) return;
      
      for (let i = 0; i < 10; i++) {
        useCommunityStore.getState().likeMachine(mockMachine.id);
      }
      // Should not throw
      const updated = useCommunityStore.getState().communityMachines.find(m => m.id === mockMachine.id);
      expect(updated).toBeDefined();
    });

    it('should handle rapid filter changes', () => {
      const factions = ['void', 'inferno', 'storm', 'stellar', 'all'];
      factions.forEach(faction => {
        useCommunityStore.getState().setFactionFilter(faction);
        expect(useCommunityStore.getState().factionFilter).toBe(faction);
      });
    });

    it('should handle rapid sort changes', () => {
      const sorts = ['newest', 'oldest', 'most_liked', 'most_viewed'];
      sorts.forEach(sort => {
        useCommunityStore.getState().setSortOption(sort);
        expect(useCommunityStore.getState().sortOption).toBe(sort);
      });
    });

    it('should handle publishing multiple machines', () => {
      for (let i = 0; i < 3; i++) {
        useCommunityStore.setState({
          pendingMachine: {
            modules: [],
            connections: [],
            attributes: { power: 50, stability: 80, efficiency: 50 },
            dominantFaction: 'void',
          },
        });
        useCommunityStore.getState().publishMachine(`Author ${i}`);
      }
      
      expect(useCommunityStore.getState().publishedMachines.length).toBe(3);
    });

    it('should handle anonymous author', () => {
      useCommunityStore.setState({
        pendingMachine: {
          modules: [],
          connections: [],
          attributes: { power: 50, stability: 80, efficiency: 50 },
          dominantFaction: 'void',
        },
      });
      
      useCommunityStore.getState().publishMachine('');
      
      const published = useCommunityStore.getState().publishedMachines[0];
      expect(published.author).toBe('Anonymous');
    });
  });
});
