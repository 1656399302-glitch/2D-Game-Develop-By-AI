/**
 * Template System Type Definitions
 * 
 * Templates allow users to save work-in-progress machine configurations
 * and reuse them as reusable blueprints.
 */

import { PlacedModule, Connection, ViewportState } from './index';

// Template categories for organization
export type TemplateCategory = 
  | 'starter'      // Beginner-friendly templates
  | 'combat'        // Combat-oriented machines
  | 'energy'        // Energy generation/storage
  | 'defense'       // Defensive machines
  | 'custom'        // User-created custom templates
  | 'all';          // For filtering - means "show all categories"

// Grid settings to save/restore with template
export interface TemplateGridSettings {
  gridEnabled: boolean;
  // Future: gridSize, snapToGrid, etc.
}

// Template data structure
export interface Template {
  id: string;                    // Unique template ID
  name: string;                  // User-defined name
  category: Exclude<TemplateCategory, 'all'>;  // Template category
  description?: string;          // Optional description
  createdAt: number;             // Creation timestamp
  updatedAt: number;             // Last update timestamp
  isFavorite: boolean;           // User-marked favorite
  
  // Machine data
  modules: PlacedModule[];       // Module instances
  connections: Connection[];     // Connection instances
  viewport: ViewportState;       // Viewport position and zoom
  gridSettings: TemplateGridSettings;  // Grid settings
  
  // Metadata
  moduleCount: number;           // Cached count for display
  connectionCount: number;       // Cached count for display
}

// Template store state
export interface TemplateStore {
  templates: Template[];
  isLoading: boolean;
  
  // CRUD operations
  addTemplate: (
    name: string,
    category: Exclude<TemplateCategory, 'all'>,
    modules: PlacedModule[],
    connections: Connection[],
    viewport: ViewportState,
    gridSettings: TemplateGridSettings
  ) => { success: boolean; error?: string; template?: Template };
  
  removeTemplate: (id: string) => boolean;
  updateTemplate: (id: string, updates: Partial<Pick<Template, 'name' | 'category' | 'description' | 'isFavorite'>>) => boolean;
  duplicateTemplate: (id: string) => { success: boolean; error?: string; template?: Template };
  
  // Favorites
  toggleFavorite: (id: string) => void;
  
  // Load template (restores to editor)
  loadTemplate: (id: string) => boolean;
  
  // Getters
  getTemplate: (id: string) => Template | undefined;
  getTemplatesByCategory: (category: Exclude<TemplateCategory, 'all'>) => Template[];
  getFavoriteTemplates: () => Template[];
  getFilteredTemplates: (options: {
    category?: TemplateCategory;
    searchQuery?: string;
    favoritesOnly?: boolean;
  }) => Template[];
}

// Size limit constants
export const MAX_TEMPLATE_MODULES = 50;  // Maximum modules allowed in a template
export const MAX_TEMPLATE_NAME_LENGTH = 100;  // Maximum name length
export const MAX_TEMPLATES = 100;  // Maximum templates to prevent localStorage overflow

// Category display configuration
export const TEMPLATE_CATEGORY_CONFIG: Record<Exclude<TemplateCategory, 'all'>, {
  label: string;
  icon: string;
  color: string;
}> = {
  starter: {
    label: '入门',
    icon: '📘',
    color: '#22c55e',
  },
  combat: {
    label: '战斗',
    icon: '⚔️',
    color: '#ef4444',
  },
  energy: {
    label: '能量',
    icon: '⚡',
    color: '#f59e0b',
  },
  defense: {
    label: '防御',
    icon: '🛡️',
    color: '#3b82f6',
  },
  custom: {
    label: '自定义',
    icon: '🔧',
    color: '#a855f7',
  },
};
