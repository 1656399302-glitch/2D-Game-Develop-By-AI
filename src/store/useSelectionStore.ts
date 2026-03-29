import { create } from 'zustand';

interface SelectionStore {
  selectedModuleIds: string[];
  isBoxSelecting: boolean;
  boxStart: { x: number; y: number } | null;
  boxEnd: { x: number; y: number } | null;
  
  // Actions
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: (moduleIds: string[]) => void;
  toggleSelection: (id: string) => void;
  setSelection: (ids: string[]) => void;
  
  // Box selection actions
  startBoxSelection: (x: number, y: number) => void;
  updateBoxSelection: (x: number, y: number) => void;
  endBoxSelection: () => void;
  cancelBoxSelection: () => void;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedModuleIds: [],
  isBoxSelecting: false,
  boxStart: null,
  boxEnd: null,

  addToSelection: (id) => {
    set((state) => {
      if (state.selectedModuleIds.includes(id)) {
        return state;
      }
      return { selectedModuleIds: [...state.selectedModuleIds, id] };
    });
  },

  removeFromSelection: (id) => {
    set((state) => ({
      selectedModuleIds: state.selectedModuleIds.filter((moduleId) => moduleId !== id),
    }));
  },

  clearSelection: () => {
    set({ selectedModuleIds: [] });
  },

  selectAll: (moduleIds) => {
    set({ selectedModuleIds: [...moduleIds] });
  },

  toggleSelection: (id) => {
    const { selectedModuleIds } = get();
    if (selectedModuleIds.includes(id)) {
      set({ selectedModuleIds: selectedModuleIds.filter((moduleId) => moduleId !== id) });
    } else {
      set({ selectedModuleIds: [...selectedModuleIds, id] });
    }
  },

  setSelection: (ids) => {
    set({ selectedModuleIds: ids });
  },

  startBoxSelection: (x, y) => {
    set({
      isBoxSelecting: true,
      boxStart: { x, y },
      boxEnd: { x, y },
    });
  },

  updateBoxSelection: (x, y) => {
    set({ boxEnd: { x, y } });
  },

  endBoxSelection: () => {
    set({
      isBoxSelecting: false,
      boxStart: null,
      boxEnd: null,
    });
  },

  cancelBoxSelection: () => {
    set({
      isBoxSelecting: false,
      boxStart: null,
      boxEnd: null,
    });
  },
}));

export default useSelectionStore;
