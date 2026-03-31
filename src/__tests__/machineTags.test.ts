/**
 * Machine Tags Store Tests
 */

import { useMachineTagsStore } from '../store/useMachineTagsStore';

describe('useMachineTagsStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useMachineTagsStore.setState({ machineTags: {}, allTags: new Set() });
  });

  describe('addTag', () => {
    it('should add a tag to a machine', () => {
      const { addTag } = useMachineTagsStore.getState();
      
      const result = addTag('machine-1', 'fire-type');
      
      expect(result.success).toBe(true);
      expect(useMachineTagsStore.getState().getTags('machine-1')).toContain('fire-type');
    });

    it('should sanitize tag input', () => {
      const { addTag } = useMachineTagsStore.getState();
      
      const result = addTag('machine-1', 'Fire-Type!');
      
      expect(result.success).toBe(true);
      expect(useMachineTagsStore.getState().getTags('machine-1')).toContain('fire-type');
    });

    it('should not add duplicate tags', () => {
      const { addTag } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'fire-type');
      const result = addTag('machine-1', 'fire-type');
      
      expect(result.success).toBe(false);
      expect(useMachineTagsStore.getState().getTags('machine-1').filter(t => t === 'fire-type').length).toBe(1);
    });

    it('should not exceed max tags per machine (5)', () => {
      const { addTag } = useMachineTagsStore.getState();
      
      // Add 5 tags
      addTag('machine-1', 'tag-1');
      addTag('machine-1', 'tag-2');
      addTag('machine-1', 'tag-3');
      addTag('machine-1', 'tag-4');
      addTag('machine-1', 'tag-5');
      
      // 6th should fail
      const result = addTag('machine-1', 'tag-6');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Maximum');
    });
  });

  describe('removeTag', () => {
    it('should remove a tag from a machine', () => {
      const { addTag, removeTag, getTags } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'fire-type');
      removeTag('machine-1', 'fire-type');
      
      expect(getTags('machine-1')).not.toContain('fire-type');
    });

    it('should handle removing non-existent tag', () => {
      const { removeTag } = useMachineTagsStore.getState();
      
      expect(() => removeTag('machine-1', 'non-existent')).not.toThrow();
    });
  });

  describe('setTags', () => {
    it('should set multiple tags at once', () => {
      const { setTags } = useMachineTagsStore.getState();
      
      const result = setTags('machine-1', ['fire-type', 'explosive', 'rare']);
      
      expect(result.success).toBe(true);
      expect(useMachineTagsStore.getState().getTags('machine-1')).toEqual(['fire-type', 'explosive', 'rare']);
    });

    it('should reject duplicate tags in set', () => {
      const { setTags } = useMachineTagsStore.getState();
      
      const result = setTags('machine-1', ['fire-type', 'fire-type', 'explosive']);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Duplicate');
    });

    it('should reject more than 5 tags', () => {
      const { setTags } = useMachineTagsStore.getState();
      
      const result = setTags('machine-1', ['t1', 't2', 't3', 't4', 't5', 't6']);
      
      expect(result.success).toBe(false);
    });
  });

  describe('getTags', () => {
    it('should return empty array for machine with no tags', () => {
      const { getTags } = useMachineTagsStore.getState();
      
      expect(getTags('machine-1')).toEqual([]);
    });

    it('should return tags for machine', () => {
      const { addTag, getTags } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'fire-type');
      addTag('machine-1', 'explosive');
      
      expect(getTags('machine-1')).toEqual(['fire-type', 'explosive']);
    });
  });

  describe('getAutocomplete', () => {
    it('should return matching tags', () => {
      const { addTag, getAutocomplete } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'fire-type');
      addTag('machine-1', 'fire-magic');
      addTag('machine-2', 'ice-type');
      
      const suggestions = getAutocomplete('fire');
      
      expect(suggestions).toContain('fire-type');
      expect(suggestions).toContain('fire-magic');
      expect(suggestions).not.toContain('ice-type');
    });

    it('should limit results', () => {
      const { addTag, getAutocomplete } = useMachineTagsStore.getState();
      
      for (let i = 0; i < 15; i++) {
        addTag(`machine-${i}`, `test-tag-${i}`);
      }
      
      const suggestions = getAutocomplete('test', 5);
      
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('hasTag', () => {
    it('should return true if machine has tag', () => {
      const { addTag, hasTag } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'fire-type');
      
      expect(hasTag('machine-1', 'fire-type')).toBe(true);
    });

    it('should return false if machine does not have tag', () => {
      const { hasTag } = useMachineTagsStore.getState();
      
      expect(hasTag('machine-1', 'fire-type')).toBe(false);
    });
  });

  describe('getMachinesByTag', () => {
    it('should return machines with the tag', () => {
      const { addTag, getMachinesByTag } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'fire-type');
      addTag('machine-2', 'fire-type');
      addTag('machine-3', 'ice-type');
      
      const machines = getMachinesByTag('fire-type');
      
      expect(machines).toContain('machine-1');
      expect(machines).toContain('machine-2');
      expect(machines).not.toContain('machine-3');
    });
  });
});
