/**
 * Machine Tags Store - Manages custom tags for codex machines
 * 
 * Provides localStorage persistence for machine tags.
 * Maximum 5 tags per machine, 100 total unique tags.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_TAGS_PER_MACHINE, MAX_TOTAL_TAGS, MAX_TAG_LENGTH } from '../types';

interface MachineTagsStore {
  // Map of machineId -> array of tag names
  machineTags: Record<string, string[]>;
  // Set of all unique tag names for autocomplete
  allTags: Set<string>;
  
  // Actions
  addTag: (machineId: string, tag: string) => { success: boolean; error?: string };
  removeTag: (machineId: string, tag: string) => void;
  setTags: (machineId: string, tags: string[]) => { success: boolean; error?: string };
  getTags: (machineId: string) => string[];
  getAllTags: () => string[];
  getAutocomplete: (partial: string, limit?: number) => string[];
  removeAllTagsForMachine: (machineId: string) => void;
  clearAllTags: () => void;
  hasTag: (machineId: string, tag: string) => boolean;
  getMachinesByTag: (tag: string) => string[];
  getMachineCount: () => number;
}

// Sanitize tag input
const sanitizeTag = (tag: string): string => {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-_]/g, '') // Only allow alphanumeric, hyphen, underscore
    .slice(0, MAX_TAG_LENGTH);
};

export const useMachineTagsStore = create<MachineTagsStore>()(
  persist(
    (set, get) => ({
      machineTags: {},
      allTags: new Set<string>(),

      addTag: (machineId: string, tag: string): { success: boolean; error?: string } => {
        const sanitizedTag = sanitizeTag(tag);
        
        if (!sanitizedTag) {
          return { success: false, error: 'Invalid tag format' };
        }
        
        if (sanitizedTag.length > MAX_TAG_LENGTH) {
          return { success: false, error: `Tag exceeds ${MAX_TAG_LENGTH} characters` };
        }
        
        const store = get();
        const currentTags = store.machineTags[machineId] || [];
        
        // Check max tags per machine
        if (currentTags.length >= MAX_TAGS_PER_MACHINE) {
          return { success: false, error: `Maximum ${MAX_TAGS_PER_MACHINE} tags per machine` };
        }
        
        // Check if tag already exists for this machine
        if (currentTags.includes(sanitizedTag)) {
          return { success: false, error: 'Tag already exists' };
        }
        
        // Check total unique tags limit
        if (!store.allTags.has(sanitizedTag) && store.allTags.size >= MAX_TOTAL_TAGS) {
          return { success: false, error: `Maximum ${MAX_TOTAL_TAGS} unique tags` };
        }
        
        const newTags = [...currentTags, sanitizedTag];
        const newAllTags = new Set(store.allTags);
        newAllTags.add(sanitizedTag);
        
        set({
          machineTags: {
            ...store.machineTags,
            [machineId]: newTags,
          },
          allTags: newAllTags,
        });
        
        return { success: true };
      },

      removeTag: (machineId: string, tag: string): void => {
        const sanitizedTag = sanitizeTag(tag);
        const store = get();
        
        const currentTags = store.machineTags[machineId] || [];
        const newTags = currentTags.filter((t) => t !== sanitizedTag);
        
        // Check if tag is used by any other machine
        const isTagUsedElsewhere = Object.entries(store.machineTags).some(
          ([id, tags]) => id !== machineId && tags.includes(sanitizedTag)
        );
        
        // Only remove from allTags if not used elsewhere
        const newAllTags = new Set<string>();
        if (!isTagUsedElsewhere) {
          store.allTags.forEach((t) => {
            if (t !== sanitizedTag) {
              newAllTags.add(t);
            }
          });
        } else {
          store.allTags.forEach((t) => newAllTags.add(t));
        }
        
        set({
          machineTags: {
            ...store.machineTags,
            [machineId]: newTags,
          },
          allTags: newAllTags,
        });
      },

      setTags: (machineId: string, tags: string[]): { success: boolean; error?: string } => {
        // Validate total tags
        if (tags.length > MAX_TAGS_PER_MACHINE) {
          return { success: false, error: `Maximum ${MAX_TAGS_PER_MACHINE} tags per machine` };
        }
        
        const sanitizedTags = tags
          .map(sanitizeTag)
          .filter((t) => t.length > 0);
        
        // Check for duplicates
        const uniqueTags = [...new Set(sanitizedTags)];
        if (uniqueTags.length !== sanitizedTags.length) {
          return { success: false, error: 'Duplicate tags not allowed' };
        }
        
        if (uniqueTags.length > MAX_TAGS_PER_MACHINE) {
          return { success: false, error: `Maximum ${MAX_TAGS_PER_MACHINE} tags per machine` };
        }
        
        const store = get();
        
        // Calculate new unique tags to add
        const existingNewTags = uniqueTags.filter((t) => store.allTags.has(t));
        const newUniqueTags = uniqueTags.filter((t) => !store.allTags.has(t));
        
        // Check total unique tags limit
        if (newUniqueTags.length + store.allTags.size - existingNewTags.length > MAX_TOTAL_TAGS) {
          return { success: false, error: `Maximum ${MAX_TOTAL_TAGS} unique tags` };
        }
        
        const newAllTags = new Set<string>(store.allTags);
        uniqueTags.forEach((t) => newAllTags.add(t));
        
        set({
          machineTags: {
            ...store.machineTags,
            [machineId]: uniqueTags,
          },
          allTags: newAllTags,
        });
        
        return { success: true };
      },

      getTags: (machineId: string): string[] => {
        return get().machineTags[machineId] || [];
      },

      getAllTags: (): string[] => {
        return Array.from(get().allTags).sort();
      },

      getAutocomplete: (partial: string, limit = 10): string[] => {
        const sanitizedPartial = sanitizeTag(partial);
        if (!sanitizedPartial) return [];
        
        const allTagsArray = Array.from(get().allTags);
        const matching = allTagsArray
          .filter((tag) => tag.includes(sanitizedPartial))
          .sort((a, b) => {
            // Prioritize tags that start with the partial
            const aStarts = a.startsWith(sanitizedPartial);
            const bStarts = b.startsWith(sanitizedPartial);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            // Then sort by length (shorter first)
            return a.length - b.length;
          })
          .slice(0, limit);
        
        return matching;
      },

      removeAllTagsForMachine: (machineId: string): void => {
        const store = get();
        
        // Check which tags are used by other machines
        const newMachineTags = { ...store.machineTags };
        delete newMachineTags[machineId];
        
        const remainingTags = new Set<string>();
        Object.values(newMachineTags).forEach((tags) => {
          tags.forEach((t) => remainingTags.add(t));
        });
        
        const newAllTags = new Set<string>();
        remainingTags.forEach((t) => newAllTags.add(t));
        
        set({
          machineTags: newMachineTags,
          allTags: newAllTags,
        });
      },

      clearAllTags: (): void => {
        set({
          machineTags: {},
          allTags: new Set<string>(),
        });
      },

      hasTag: (machineId: string, tag: string): boolean => {
        const tags = get().machineTags[machineId] || [];
        return tags.includes(sanitizeTag(tag));
      },

      getMachinesByTag: (tag: string): string[] => {
        const sanitizedTag = sanitizeTag(tag);
        const { machineTags } = get();
        
        return Object.entries(machineTags)
          .filter(([, tags]) => tags.includes(sanitizedTag))
          .map(([machineId]) => machineId);
      },

      getMachineCount: (): number => {
        return Object.keys(get().machineTags).length;
      },
    }),
    {
      name: 'arcane-machine-tags-storage',
      // Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
      // Custom serialization to handle Set
      partialize: (state) => ({
        machineTags: state.machineTags,
        allTags: Array.from(state.allTags),
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as { machineTags?: Record<string, string[]>; allTags?: string[] }),
        allTags: new Set((persisted as { allTags?: string[] })?.allTags || []),
      }),
    }
  )
);

// Helper to manually trigger hydration
export const hydrateMachineTagsStore = () => {
  useMachineTagsStore.persist.rehydrate();
};

// Helper to check if hydration is complete
export const isMachineTagsHydrated = () => {
  return useMachineTagsStore.persist.hasHydrated();
};
