/**
 * Community Store
 * 
 * Zustand store for managing community gallery state.
 * Handles publishing machines, browsing community machines, search/filter,
 * and loading community machines into the editor.
 * 
 * Note: Published machines are session-scoped (localStorage-backed for the
 * current browser session only). They do NOT persist across page refresh
 * or browser restart.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { PlacedModule, Connection, GeneratedAttributes } from '../types';
import { FactionId } from '../types/factions';
import {
  CommunityMachine,
  MOCK_COMMUNITY_MACHINES,
  SortOption,
  FactionFilter,
  RarityFilter,
  getFilteredMachines,
} from '../data/communityGalleryData';

interface CommunityStore {
  // Mock community data (includes both preset mocks and user-published)
  communityMachines: CommunityMachine[];

  // User-published machines (session-scoped, localStorage-backed)
  publishedMachines: CommunityMachine[];

  // Search and filter state
  searchQuery: string;
  factionFilter: FactionFilter;
  rarityFilter: RarityFilter;
  sortOption: SortOption;

  // UI state
  isGalleryOpen: boolean;
  isPublishModalOpen: boolean;
  pendingMachine: {
    modules: PlacedModule[];
    connections: Connection[];
    attributes: GeneratedAttributes;
    dominantFaction: FactionId;
  } | null;

  // Computed filtered list (includes both mocks and published)
  getFilteredMachinesList: () => CommunityMachine[];

  // Actions
  setSearchQuery: (query: string) => void;
  setFactionFilter: (filter: FactionFilter) => void;
  setRarityFilter: (filter: RarityFilter) => void;
  setSortOption: (option: SortOption) => void;

  // Gallery UI
  openGallery: () => void;
  closeGallery: () => void;

  // Publish flow
  openPublishModal: (modules: PlacedModule[], connections: Connection[], attributes: GeneratedAttributes, dominantFaction: FactionId) => void;
  closePublishModal: () => void;
  publishMachine: (authorName: string) => void;

  // Interaction actions
  likeMachine: (machineId: string) => void;
  viewMachine: (machineId: string) => void;
}

// Storage key for published machines
const COMMUNITY_STORAGE_KEY = 'arcane-community-gallery-published';

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set, get) => ({
      // Initial state
      communityMachines: MOCK_COMMUNITY_MACHINES,
      publishedMachines: [],

      searchQuery: '',
      factionFilter: 'all',
      rarityFilter: 'all',
      sortOption: 'newest',

      isGalleryOpen: false,
      isPublishModalOpen: false,
      pendingMachine: null,

      // Computed filtered machines list
      getFilteredMachinesList: () => {
        const state = get();
        // Combine mock data with user-published machines
        const allMachines = [...state.publishedMachines, ...state.communityMachines];
        return getFilteredMachines(allMachines, state.searchQuery, state.factionFilter, state.rarityFilter, state.sortOption);
      },

      // Filter actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFactionFilter: (filter) => set({ factionFilter: filter }),
      setRarityFilter: (filter) => set({ rarityFilter: filter }),
      setSortOption: (option) => set({ sortOption: option }),

      // Gallery UI actions
      openGallery: () => set({ isGalleryOpen: true }),
      closeGallery: () => set({ isGalleryOpen: false }),

      // Publish flow actions
      openPublishModal: (modules, connections, attributes, dominantFaction) => {
        set({
          isPublishModalOpen: true,
          pendingMachine: { modules, connections, attributes, dominantFaction },
        });
      },

      closePublishModal: () => {
        set({
          isPublishModalOpen: false,
          pendingMachine: null,
        });
      },

      publishMachine: (authorName) => {
        const { pendingMachine, publishedMachines } = get();
        if (!pendingMachine) return;

        const newMachine: CommunityMachine = {
          id: `published-${uuidv4()}`,
          author: authorName.trim() || 'Anonymous',
          authorName: authorName.trim() || undefined,
          publishedAt: Date.now(),
          likes: 0,
          views: 0,
          modules: pendingMachine.modules,
          connections: pendingMachine.connections,
          attributes: pendingMachine.attributes,
          dominantFaction: pendingMachine.dominantFaction,
        };

        set({
          publishedMachines: [newMachine, ...publishedMachines],
          isPublishModalOpen: false,
          pendingMachine: null,
          sortOption: 'newest', // Switch to newest so published appears first
        });
      },

      // Interaction actions
      likeMachine: (machineId) => {
        const { communityMachines, publishedMachines } = get();

        const updateMachine = (machines: CommunityMachine[]) =>
          machines.map((m) =>
            m.id === machineId ? { ...m, likes: m.likes + 1 } : m
          );

        set({
          communityMachines: updateMachine(communityMachines),
          publishedMachines: updateMachine(publishedMachines),
        });
      },

      viewMachine: (machineId) => {
        // Only increment view count for mock machines (to avoid spamming in dev)
        if (machineId.startsWith('mock-')) {
          const { communityMachines } = get();
          const updateMachine = (machines: CommunityMachine[]) =>
            machines.map((m) =>
              m.id === machineId ? { ...m, views: m.views + 1 } : m
            );

          set({
            communityMachines: updateMachine(communityMachines),
          });
        }
      },
    }),
    {
      name: COMMUNITY_STORAGE_KEY,
      // Only persist published machines (not filter state)
      partialize: (state) => ({
        publishedMachines: state.publishedMachines,
      }),
    }
  )
);

// Selector helpers for common operations
export const selectCommunityMachines = (state: CommunityStore) => state.communityMachines;
export const selectPublishedMachines = (state: CommunityStore) => state.publishedMachines;
export const selectIsGalleryOpen = (state: CommunityStore) => state.isGalleryOpen;
export const selectIsPublishModalOpen = (state: CommunityStore) => state.isPublishModalOpen;
