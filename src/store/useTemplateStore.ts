/**
 * Template Store - Zustand Store for Template Management
 * 
 * Manages template CRUD operations with localStorage persistence.
 * Follows the skipHydration pattern used by other stores in the codebase.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  Template,
  TemplateStore,
  MAX_TEMPLATE_MODULES,
  MAX_TEMPLATE_NAME_LENGTH,
  MAX_TEMPLATES,
} from '../types/templates';
import { useMachineStore } from './useMachineStore';

const TEMPLATE_STORAGE_KEY = 'arcane-templates-storage';

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [],
      isLoading: false,

      addTemplate: (
        name,
        category,
        modules,
        connections,
        viewport,
        gridSettings
      ) => {
        // Validation: name cannot be empty
        const trimmedName = name.trim();
        if (!trimmedName) {
          return { success: false, error: 'Template name cannot be empty' };
        }

        // Validation: name length limit
        if (trimmedName.length > MAX_TEMPLATE_NAME_LENGTH) {
          return { 
            success: false, 
            error: `Template name must be ${MAX_TEMPLATE_NAME_LENGTH} characters or less` 
          };
        }

        // Validation: module count limit (>50 is rejected)
        if (modules.length > MAX_TEMPLATE_MODULES) {
          return { 
            success: false, 
            error: `This template has ${modules.length} modules. Maximum allowed is ${MAX_TEMPLATE_MODULES}.` 
          };
        }

        // Check templates limit
        const currentTemplates = get().templates;
        if (currentTemplates.length >= MAX_TEMPLATES) {
          return { 
            success: false, 
            error: `Maximum of ${MAX_TEMPLATES} templates reached. Please delete some templates first.` 
          };
        }

        const now = Date.now();
        const newTemplate: Template = {
          id: uuidv4(),
          name: trimmedName,
          category,
          createdAt: now,
          updatedAt: now,
          isFavorite: false,
          modules,
          connections,
          viewport,
          gridSettings,
          moduleCount: modules.length,
          connectionCount: connections.length,
        };

        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));

        return { success: true, template: newTemplate };
      },

      removeTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) {
          return false;
        }

        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));

        return true;
      },

      updateTemplate: (id, updates) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) {
          return false;
        }

        // Validate name if provided
        if (updates.name !== undefined) {
          const trimmedName = updates.name.trim();
          if (!trimmedName) {
            return false;
          }
          if (trimmedName.length > MAX_TEMPLATE_NAME_LENGTH) {
            return false;
          }
        }

        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...updates,
                  name: updates.name?.trim() ?? t.name,
                  updatedAt: Date.now(),
                }
              : t
          ),
        }));

        return true;
      },

      duplicateTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) {
          return { success: false, error: 'Template not found' };
        }

        // Check templates limit
        const currentTemplates = get().templates;
        if (currentTemplates.length >= MAX_TEMPLATES) {
          return { 
            success: false, 
            error: `Maximum of ${MAX_TEMPLATES} templates reached.` 
          };
        }

        const now = Date.now();
        const newTemplate: Template = {
          ...template,
          id: uuidv4(),
          name: `${template.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
          isFavorite: false,
        };

        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));

        return { success: true, template: newTemplate };
      },

      toggleFavorite: (id) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, isFavorite: !t.isFavorite, updatedAt: Date.now() } : t
          ),
        }));
      },

      loadTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) {
          return false;
        }

        // Restore editor state using individual setter methods (not store replacement)
        // This maintains React reactivity as per contract requirements
        
        const editorStore = useMachineStore.getState();
        
        // Load modules (replaces current modules)
        // Create new instance IDs to avoid conflicts
        const moduleIdMap = new Map<string, string>();
        const newModules = template.modules.map((m) => {
          const newInstanceId = uuidv4();
          moduleIdMap.set(m.instanceId, newInstanceId);
          return {
            ...m,
            id: uuidv4(),
            instanceId: newInstanceId,
            ports: m.ports.map((p) => ({
              ...p,
              id: `${m.type}-${p.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            })),
          };
        });

        // Update connections with new module IDs
        const newConnections = template.connections.map((c) => ({
          ...c,
          id: uuidv4(),
          sourceModuleId: moduleIdMap.get(c.sourceModuleId) || c.sourceModuleId,
          targetModuleId: moduleIdMap.get(c.targetModuleId) || c.targetModuleId,
        }));

        // Load all state into editor
        editorStore.loadMachine(newModules, newConnections);
        
        // Load viewport
        if (template.viewport) {
          editorStore.setViewport(template.viewport);
        }
        
        // Load grid settings (restore gridEnabled)
        if (template.gridSettings) {
          const currentGridEnabled = useMachineStore.getState().gridEnabled;
          if (currentGridEnabled !== template.gridSettings.gridEnabled) {
            editorStore.toggleGrid();
          }
        }

        return true;
      },

      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id);
      },

      getTemplatesByCategory: (category) => {
        return get().templates.filter((t) => t.category === category);
      },

      getFavoriteTemplates: () => {
        return get().templates.filter((t) => t.isFavorite);
      },

      getFilteredTemplates: ({ category, searchQuery, favoritesOnly }) => {
        let filtered = get().templates;

        // Filter by category (skip 'all')
        if (category && category !== 'all') {
          filtered = filtered.filter((t) => t.category === category);
        }

        // Filter by favorites
        if (favoritesOnly) {
          filtered = filtered.filter((t) => t.isFavorite);
        }

        // Filter by search query
        if (searchQuery && searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          filtered = filtered.filter(
            (t) =>
              t.name.toLowerCase().includes(query) ||
              (t.description && t.description.toLowerCase().includes(query))
          );
        }

        // Sort by updated date (most recent first), favorites at top
        return [...filtered].sort((a, b) => {
          // Favorites first
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          // Then by updated date
          return b.updatedAt - a.updatedAt;
        });
      },
    }),
    {
      name: TEMPLATE_STORAGE_KEY,
      // Skip automatic hydration to prevent cascading state updates
      // Manual hydration is handled in useStoreHydration hook
      skipHydration: true,
    }
  )
);

// Helper to manually trigger hydration
export const hydrateTemplateStore = () => {
  useTemplateStore.persist.rehydrate();
};

// Helper to check if hydration is complete
export const isTemplateHydrated = () => {
  return useTemplateStore.persist.hasHydrated();
};
