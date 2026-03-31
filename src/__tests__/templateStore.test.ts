/**
 * Template Store Tests
 * 
 * Tests for the template store functionality including CRUD operations,
 * persistence, size limits, and load functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTemplateStore } from '../store/useTemplateStore';
import { useMachineStore } from '../store/useMachineStore';
import { PlacedModule, Connection, ViewportState } from '../types';

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9),
}));

// Helper to create mock modules
const createMockModule = (id: number): PlacedModule => ({
  id: `module-${id}`,
  instanceId: `instance-${id}`,
  type: 'core-furnace',
  x: id * 100,
  y: id * 100,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [
    { id: `port-in-${id}`, type: 'input', position: { x: 0, y: 50 } },
    { id: `port-out-${id}`, type: 'output', position: { x: 100, y: 50 } },
  ],
});

// Helper to create mock connections
const createMockConnection = (id: number, sourceId: string, targetId: string): Connection => ({
  id: `conn-${id}`,
  sourceModuleId: sourceId,
  sourcePortId: `port-out-${sourceId}`,
  targetModuleId: targetId,
  targetPortId: `port-in-${targetId}`,
  pathData: `M 100 100 L 200 100`,
});

// Helper to create mock viewport
const createMockViewport = (): ViewportState => ({
  x: 0,
  y: 0,
  zoom: 1,
});

describe('useTemplateStore', () => {
  beforeEach(() => {
    // Reset store state
    useTemplateStore.setState({ templates: [], isLoading: false });
  });

  describe('addTemplate', () => {
    it('should add a template with valid data', () => {
      const modules = [createMockModule(1), createMockModule(2)];
      const connections = [createMockConnection(1, 'instance-1', 'instance-2')];
      const viewport = createMockViewport();

      const result = useTemplateStore.getState().addTemplate(
        'Test Template',
        'starter',
        modules,
        connections,
        viewport,
        { gridEnabled: true }
      );

      expect(result.success).toBe(true);
      expect(result.template).toBeDefined();
      expect(result.template?.name).toBe('Test Template');
      expect(result.template?.category).toBe('starter');
      expect(result.template?.moduleCount).toBe(2);
      expect(result.template?.connectionCount).toBe(1);
    });

    it('should reject template with empty name', () => {
      const result = useTemplateStore.getState().addTemplate(
        '',
        'starter',
        [],
        [],
        createMockViewport(),
        { gridEnabled: true }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject template with whitespace-only name', () => {
      const result = useTemplateStore.getState().addTemplate(
        '   ',
        'starter',
        [],
        [],
        createMockViewport(),
        { gridEnabled: true }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject template with more than 50 modules (AC12)', () => {
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 51; i++) {
        modules.push(createMockModule(i));
      }

      const result = useTemplateStore.getState().addTemplate(
        'Big Template',
        'starter',
        modules,
        [],
        createMockViewport(),
        { gridEnabled: true }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('51');
      expect(result.error).toContain('50');
    });

    it('should accept template with exactly 50 modules (boundary test)', () => {
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 50; i++) {
        modules.push(createMockModule(i));
      }

      const result = useTemplateStore.getState().addTemplate(
        'Boundary Template',
        'starter',
        modules,
        [],
        createMockViewport(),
        { gridEnabled: true }
      );

      expect(result.success).toBe(true);
    });
  });

  describe('removeTemplate', () => {
    it('should remove an existing template', () => {
      // Add a template first
      const result = useTemplateStore.getState().addTemplate(
        'To Delete',
        'starter',
        [],
        [],
        createMockViewport(),
        { gridEnabled: true }
      );
      
      const templateId = result.template!.id;
      
      // Remove it
      const removed = useTemplateStore.getState().removeTemplate(templateId);
      
      expect(removed).toBe(true);
      expect(useTemplateStore.getState().templates.length).toBe(0);
    });

    it('should return false when removing non-existent template', () => {
      const removed = useTemplateStore.getState().removeTemplate('non-existent-id');
      expect(removed).toBe(false);
    });
  });

  describe('updateTemplate', () => {
    it('should update template name', () => {
      // Add a template
      const result = useTemplateStore.getState().addTemplate(
        'Original Name',
        'starter',
        [],
        [],
        createMockViewport(),
        { gridEnabled: true }
      );
      
      const templateId = result.template!.id;
      
      // Update name
      const updated = useTemplateStore.getState().updateTemplate(templateId, {
        name: 'New Name',
      });
      
      expect(updated).toBe(true);
      expect(useTemplateStore.getState().templates[0].name).toBe('New Name');
    });

    it('should update template category', () => {
      const result = useTemplateStore.getState().addTemplate(
        'Test',
        'starter',
        [],
        [],
        createMockViewport(),
        { gridEnabled: true }
      );
      
      const templateId = result.template!.id;
      
      const updated = useTemplateStore.getState().updateTemplate(templateId, {
        category: 'combat',
      });
      
      expect(updated).toBe(true);
      expect(useTemplateStore.getState().templates[0].category).toBe('combat');
    });

    it('should reject empty name update', () => {
      const result = useTemplateStore.getState().addTemplate(
        'Test',
        'starter',
        [],
        [],
        createMockViewport(),
        { gridEnabled: true }
      );
      
      const updated = useTemplateStore.getState().updateTemplate(result.template!.id, {
        name: '',
      });
      
      expect(updated).toBe(false);
    });

    it('should return false for non-existent template', () => {
      const updated = useTemplateStore.getState().updateTemplate('non-existent', {
        name: 'New Name',
      });
      
      expect(updated).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite from false to true', () => {
      const result = useTemplateStore.getState().addTemplate(
        'Test',
        'starter',
        [],
        [],
        createMockViewport(),
        { gridEnabled: true }
      );
      
      const templateId = result.template!.id;
      
      expect(useTemplateStore.getState().templates[0].isFavorite).toBe(false);
      
      useTemplateStore.getState().toggleFavorite(templateId);
      
      expect(useTemplateStore.getState().templates[0].isFavorite).toBe(true);
    });

    it('should toggle favorite from true to false', () => {
      const result = useTemplateStore.getState().addTemplate(
        'Test',
        'starter',
        [],
        [],
        createMockViewport(),
        { gridEnabled: true }
      );
      
      const templateId = result.template!.id;
      
      // Toggle twice
      useTemplateStore.getState().toggleFavorite(templateId);
      useTemplateStore.getState().toggleFavorite(templateId);
      
      expect(useTemplateStore.getState().templates[0].isFavorite).toBe(false);
    });
  });

  describe('duplicateTemplate', () => {
    it('should duplicate an existing template', () => {
      const result = useTemplateStore.getState().addTemplate(
        'Original',
        'starter',
        [createMockModule(1)],
        [],
        createMockViewport(),
        { gridEnabled: true }
      );
      
      const originalId = result.template!.id;
      const duplicateResult = useTemplateStore.getState().duplicateTemplate(originalId);
      
      expect(duplicateResult.success).toBe(true);
      expect(duplicateResult.template).toBeDefined();
      expect(duplicateResult.template!.name).toBe('Original (Copy)');
      expect(duplicateResult.template!.id).not.toBe(originalId);
      expect(useTemplateStore.getState().templates.length).toBe(2);
    });

    it('should return error for non-existent template', () => {
      const result = useTemplateStore.getState().duplicateTemplate('non-existent');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('loadTemplate', () => {
    it('should load template data into editor store', () => {
      // Setup template
      const modules = [createMockModule(1), createMockModule(2)];
      const connections = [createMockConnection(1, 'instance-1', 'instance-2')];
      const viewport = { x: 100, y: 200, zoom: 0.8 };
      
      const addResult = useTemplateStore.getState().addTemplate(
        'Load Test',
        'starter',
        modules,
        connections,
        viewport,
        { gridEnabled: false }
      );
      
      // Clear editor first
      useMachineStore.setState({ modules: [], connections: [], viewport: { x: 0, y: 0, zoom: 1 }, gridEnabled: true });
      
      // Load template
      const loaded = useTemplateStore.getState().loadTemplate(addResult.template!.id);
      
      expect(loaded).toBe(true);
      
      // Verify editor state was updated
      const editorModules = useMachineStore.getState().modules;
      expect(editorModules.length).toBe(2);
      
      // Verify viewport was restored
      const editorViewport = useMachineStore.getState().viewport;
      expect(editorViewport.x).toBe(100);
      expect(editorViewport.y).toBe(200);
      expect(editorViewport.zoom).toBe(0.8);
      
      // Verify grid settings were restored
      expect(useMachineStore.getState().gridEnabled).toBe(false);
    });

    it('should return false for non-existent template', () => {
      const loaded = useTemplateStore.getState().loadTemplate('non-existent');
      expect(loaded).toBe(false);
    });

    it('should generate new instance IDs when loading', () => {
      const modules = [createMockModule(1)];
      
      const addResult = useTemplateStore.getState().addTemplate(
        'IDs Test',
        'starter',
        modules,
        [],
        createMockViewport(),
        { gridEnabled: true }
      );
      
      useMachineStore.setState({ modules: [], connections: [], viewport: { x: 0, y: 0, zoom: 1 } });
      useTemplateStore.getState().loadTemplate(addResult.template!.id);
      
      const editorModules = useMachineStore.getState().modules;
      // Instance IDs should be different from original
      expect(editorModules[0].instanceId).not.toBe('instance-1');
    });
  });

  describe('getFilteredTemplates', () => {
    beforeEach(() => {
      // Add multiple templates
      useTemplateStore.getState().addTemplate('Template A', 'starter', [], [], createMockViewport(), { gridEnabled: true });
      useTemplateStore.getState().addTemplate('Template B', 'combat', [], [], createMockViewport(), { gridEnabled: true });
      useTemplateStore.getState().addTemplate('Template C', 'energy', [], [], createMockViewport(), { gridEnabled: true });
      
      // Make one favorite
      const templates = useTemplateStore.getState().templates;
      if (templates.length > 0) {
        useTemplateStore.getState().toggleFavorite(templates[0].id);
      }
    });

    it('should filter by category', () => {
      const filtered = useTemplateStore.getState().getFilteredTemplates({ category: 'starter' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Template A');
    });

    it('should filter favorites only', () => {
      const filtered = useTemplateStore.getState().getFilteredTemplates({ favoritesOnly: true });
      expect(filtered.length).toBe(1);
    });

    it('should filter by search query', () => {
      const filtered = useTemplateStore.getState().getFilteredTemplates({ searchQuery: 'Template B' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Template B');
    });

    it('should combine multiple filters', () => {
      // Toggle another as favorite
      const templates = useTemplateStore.getState().templates;
      useTemplateStore.getState().toggleFavorite(templates[1].id);
      
      const filtered = useTemplateStore.getState().getFilteredTemplates({
        category: 'starter',
        favoritesOnly: true,
      });
      expect(filtered.length).toBe(1);
    });

    it('should sort favorites first', () => {
      const templates = useTemplateStore.getState().templates;
      // Make all favorites
      templates.forEach(t => {
        if (!t.isFavorite) {
          useTemplateStore.getState().toggleFavorite(t.id);
        }
      });
      
      const filtered = useTemplateStore.getState().getFilteredTemplates({});
      expect(filtered.every(t => t.isFavorite)).toBe(true);
    });
  });

  describe('getTemplate', () => {
    it('should return template by id', () => {
      const result = useTemplateStore.getState().addTemplate(
        'Find Me',
        'starter',
        [],
        [],
        createMockViewport(),
        { gridEnabled: true }
      );
      
      const found = useTemplateStore.getState().getTemplate(result.template!.id);
      expect(found).toBeDefined();
      expect(found!.name).toBe('Find Me');
    });

    it('should return undefined for non-existent id', () => {
      const found = useTemplateStore.getState().getTemplate('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates in specific category', () => {
      useTemplateStore.getState().addTemplate('A', 'starter', [], [], createMockViewport(), { gridEnabled: true });
      useTemplateStore.getState().addTemplate('B', 'combat', [], [], createMockViewport(), { gridEnabled: true });
      useTemplateStore.getState().addTemplate('C', 'starter', [], [], createMockViewport(), { gridEnabled: true });
      
      const starterTemplates = useTemplateStore.getState().getTemplatesByCategory('starter');
      expect(starterTemplates.length).toBe(2);
    });
  });
});
