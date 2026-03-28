import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { CodexEntry, PlacedModule, Connection, GeneratedAttributes, Rarity } from '../types';

interface CodexStore {
  entries: CodexEntry[];
  addEntry: (
    name: string,
    modules: PlacedModule[],
    connections: Connection[],
    attributes: GeneratedAttributes
  ) => CodexEntry;
  removeEntry: (id: string) => void;
  getEntry: (id: string) => CodexEntry | undefined;
  getEntriesByRarity: (rarity: Rarity) => CodexEntry[];
  getEntryCount: () => number;
}

export const useCodexStore = create<CodexStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (name, modules, connections, attributes) => {
        const entry: CodexEntry = {
          id: uuidv4(),
          codexId: `MC-${String(get().entries.length + 1).padStart(4, '0')}`,
          name,
          rarity: attributes.rarity,
          modules,
          connections,
          attributes,
          createdAt: Date.now(),
        };

        set((state) => ({
          entries: [...state.entries, entry],
        }));

        return entry;
      },

      removeEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },

      getEntry: (id) => {
        return get().entries.find((e) => e.id === id);
      },

      getEntriesByRarity: (rarity) => {
        return get().entries.filter((e) => e.rarity === rarity);
      },

      getEntryCount: () => {
        return get().entries.length;
      },
    }),
    {
      name: 'arcane-codex-storage',
    }
  )
);
