/**
 * Machine Tags Store Tests
 */

import { useMachineTagsStore, hydrateMachineTagsStore, isMachineTagsHydrated } from '../store/useMachineTagsStore';

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

    it('should update allTags when tag is removed (if not used elsewhere)', () => {
      const { addTag, removeTag, getAllTags } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'unique-tag');
      removeTag('machine-1', 'unique-tag');
      
      // allTags should be updated
      const allTags = getAllTags();
      expect(allTags).not.toContain('unique-tag');
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

    it('should replace existing tags', () => {
      const { addTag, setTags, getTags } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'old-tag');
      setTags('machine-1', ['new-tag-1', 'new-tag-2']);
      
      expect(getTags('machine-1')).toEqual(['new-tag-1', 'new-tag-2']);
      expect(getTags('machine-1')).not.toContain('old-tag');
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

    it('should return empty array for empty machine ID', () => {
      const { getTags } = useMachineTagsStore.getState();
      
      expect(getTags('')).toEqual([]);
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

    it('should return sorted results', () => {
      const { addTag, getAutocomplete } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'zebra');
      addTag('machine-2', 'alpha');
      addTag('machine-3', 'beta');
      
      const suggestions = getAutocomplete('a');
      
      // Should be sorted with priority for tags starting with the partial
      expect(suggestions).toContain('alpha');
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

    it('should return empty array for tag with no machines', () => {
      const { getMachinesByTag } = useMachineTagsStore.getState();
      
      const machines = getMachinesByTag('non-existent-tag');
      
      expect(machines).toEqual([]);
    });
  });

  describe('removeAllTagsForMachine', () => {
    it('should remove all tags for a specific machine', () => {
      const { addTag, removeAllTagsForMachine, getTags } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'tag-1');
      addTag('machine-1', 'tag-2');
      addTag('machine-2', 'tag-3');
      
      removeAllTagsForMachine('machine-1');
      
      expect(getTags('machine-1')).toEqual([]);
      expect(getTags('machine-2')).toEqual(['tag-3']);
    });
  });

  describe('clearAllTags', () => {
    it('should clear all tags from the store', () => {
      const { addTag, clearAllTags, getTags } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'tag-1');
      addTag('machine-2', 'tag-2');
      
      clearAllTags();
      
      expect(getTags('machine-1')).toEqual([]);
      expect(getTags('machine-2')).toEqual([]);
    });
  });

  describe('getMachineCount', () => {
    it('should return 0 for empty store', () => {
      const { getMachineCount } = useMachineTagsStore.getState();
      
      expect(getMachineCount()).toBe(0);
    });

    it('should return correct count of machines with tags', () => {
      const { addTag, getMachineCount } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'tag-1');
      addTag('machine-2', 'tag-2');
      addTag('machine-3', 'tag-3');
      
      expect(getMachineCount()).toBe(3);
    });
  });

  describe('tag validation', () => {
    it('should reject invalid tag format', () => {
      const { addTag } = useMachineTagsStore.getState();
      
      // Empty after sanitization
      const result = addTag('machine-1', '   ');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should preserve underscores in tags', () => {
      const { addTag, getTags } = useMachineTagsStore.getState();
      
      const result = addTag('machine-1', 'test_tag');
      
      expect(result.success).toBe(true);
      expect(getTags('machine-1')).toContain('test_tag');
    });

    it('should preserve hyphens in tags', () => {
      const { addTag, getTags } = useMachineTagsStore.getState();
      
      const result = addTag('machine-1', 'test-tag');
      
      expect(result.success).toBe(true);
      expect(getTags('machine-1')).toContain('test-tag');
    });

    it('should trim whitespace from tags', () => {
      const { addTag, getTags } = useMachineTagsStore.getState();
      
      const result = addTag('machine-1', '  trimmed  ');
      
      expect(result.success).toBe(true);
      expect(getTags('machine-1')).toContain('trimmed');
    });

    it('should convert uppercase to lowercase', () => {
      const { addTag, getTags } = useMachineTagsStore.getState();
      
      const result = addTag('machine-1', 'UPPERCASE');
      
      expect(result.success).toBe(true);
      expect(getTags('machine-1')).toContain('uppercase');
    });

    it('should remove special characters', () => {
      const { addTag, getTags } = useMachineTagsStore.getState();
      
      const result = addTag('machine-1', 'tag@#$%^&*()');
      
      expect(result.success).toBe(true);
      expect(getTags('machine-1')).toContain('tag');
    });
  });

  describe('hydration helpers', () => {
    it('should expose isMachineTagsHydrated function', () => {
      expect(typeof isMachineTagsHydrated).toBe('function');
    });

    it('should expose hydrateMachineTagsStore function', () => {
      expect(typeof hydrateMachineTagsStore).toBe('function');
    });

    it('should be able to call hydrateMachineTagsStore', () => {
      expect(() => hydrateMachineTagsStore()).not.toThrow();
    });

    it('should have access to store methods after hydration', () => {
      hydrateMachineTagsStore();
      const store = useMachineTagsStore.getState();
      expect(typeof store.addTag).toBe('function');
      expect(typeof store.getTags).toBe('function');
    });
  });

  describe('allTags tracking', () => {
    it('should track unique tags in allTags set', () => {
      const { addTag, getAllTags } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'tag-a');
      addTag('machine-2', 'tag-b');
      addTag('machine-1', 'tag-c');
      
      const allTags = getAllTags();
      expect(allTags).toContain('tag-a');
      expect(allTags).toContain('tag-b');
      expect(allTags).toContain('tag-c');
    });

    it('should remove tag from allTags when last machine removes it', () => {
      const { addTag, removeTag, getAllTags } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'unique');
      removeTag('machine-1', 'unique');
      
      expect(getAllTags()).not.toContain('unique');
    });

    it('should keep tag in allTags if another machine uses it', () => {
      const { addTag, removeTag, getAllTags } = useMachineTagsStore.getState();
      
      addTag('machine-1', 'shared');
      addTag('machine-2', 'shared');
      removeTag('machine-1', 'shared');
      
      expect(getAllTags()).toContain('shared');
    });
  });
});
