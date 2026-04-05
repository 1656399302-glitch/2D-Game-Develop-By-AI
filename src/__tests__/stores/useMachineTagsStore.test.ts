/**
 * Machine Tags Store Unit Tests
 * 
 * Tests for the machine tags store covering:
 * - Tag CRUD operations
 * - Tag sanitization
 * - Search and filtering
 * - Autocomplete functionality
 * - State persistence
 * - Limits (max tags per machine, max total unique tags)
 * 
 * ROUND 158: Added unit tests for untested store
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMachineTagsStore } from '../../store/useMachineTagsStore';
import { MAX_TAGS_PER_MACHINE, MAX_TOTAL_TAGS, MAX_TAG_LENGTH } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('MachineTags Store Tests', () => {
  beforeEach(() => {
    // Clear localStorage and reset store state
    localStorageMock.clear();
    
    // Reset store to initial state
    useMachineTagsStore.setState({
      machineTags: {},
      allTags: new Set<string>(),
    });
  });

  // ============================================
  // Tag CRUD Operations
  // ============================================
  describe('Tag CRUD Operations', () => {
    describe('addTag', () => {
      it('should add a tag to a machine', () => {
        const store = useMachineTagsStore.getState();
        const result = store.addTag('machine-1', 'fire');
        
        expect(result.success).toBe(true);
        expect(store.getTags('machine-1')).toContain('fire');
      });

      it('should add multiple tags to a machine', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        store.addTag('machine-1', 'powerful');
        store.addTag('machine-1', 'rare');
        
        const tags = store.getTags('machine-1');
        expect(tags).toHaveLength(3);
        expect(tags).toContain('fire');
        expect(tags).toContain('powerful');
        expect(tags).toContain('rare');
      });

      it('should sanitize tag input (lowercase, trim)', () => {
        const store = useMachineTagsStore.getState();
        const result = store.addTag('machine-1', '  FIRE  ');
        
        expect(result.success).toBe(true);
        expect(store.getTags('machine-1')).toContain('fire');
      });

      it('should strip invalid characters', () => {
        const store = useMachineTagsStore.getState();
        const result = store.addTag('machine-1', 'fire@power!');
        
        expect(result.success).toBe(true);
        expect(store.getTags('machine-1')).toContain('firepower');
      });

      it('should reject duplicate tags on same machine', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        const result = store.addTag('machine-1', 'fire');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Tag already exists');
      });

      it('should enforce max tags per machine limit', () => {
        const store = useMachineTagsStore.getState();
        
        // Add MAX_TAGS_PER_MACHINE tags
        for (let i = 0; i < MAX_TAGS_PER_MACHINE; i++) {
          store.addTag('machine-1', `tag${i}`);
        }
        
        // Try to add one more
        const result = store.addTag('machine-1', 'one-more');
        
        expect(result.success).toBe(false);
        expect(result.error).toContain(`Maximum ${MAX_TAGS_PER_MACHINE} tags per machine`);
      });

      it('should reject invalid empty tags', () => {
        const store = useMachineTagsStore.getState();
        const result = store.addTag('machine-1', '   ');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid tag format');
      });

      it('should truncate tags exceeding max length', () => {
        const store = useMachineTagsStore.getState();
        const longTag = 'a'.repeat(MAX_TAG_LENGTH + 1);  // 21 chars, sanitization truncates to 20
        const result = store.addTag('machine-1', longTag);
        
        // Store sanitizes and truncates to MAX_TAG_LENGTH, so tag is accepted
        expect(result.success).toBe(true);
        // Verify the tag is stored with MAX_TAG_LENGTH characters
        const storedTags = store.getTags('machine-1');
        expect(storedTags.length).toBe(1);
        expect(storedTags[0].length).toBe(MAX_TAG_LENGTH);
      });

      it('should allow same tag on different machines', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        const result = store.addTag('machine-2', 'fire');
        
        expect(result.success).toBe(true);
        expect(store.getTags('machine-1')).toContain('fire');
        expect(store.getTags('machine-2')).toContain('fire');
      });
    });

    describe('removeTag', () => {
      it('should remove a tag from a machine', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        store.addTag('machine-1', 'powerful');
        store.removeTag('machine-1', 'fire');
        
        const tags = store.getTags('machine-1');
        expect(tags).toHaveLength(1);
        expect(tags).not.toContain('fire');
        expect(tags).toContain('powerful');
      });

      it('should not affect tags on other machines', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        store.addTag('machine-2', 'fire');
        store.removeTag('machine-1', 'fire');
        
        expect(store.getTags('machine-2')).toContain('fire');
      });

      it('should remove tag from allTags when no longer used', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        store.addTag('machine-2', 'powerful'); // Use another tag
        store.removeTag('machine-1', 'fire');
        
        const allTags = store.getAllTags();
        expect(allTags).not.toContain('fire');
        expect(allTags).toContain('powerful');
      });

      it('should keep tag in allTags when used by other machines', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        store.addTag('machine-2', 'fire');
        store.removeTag('machine-1', 'fire');
        
        const allTags = store.getAllTags();
        expect(allTags).toContain('fire');
      });
    });

    describe('setTags', () => {
      it('should set multiple tags at once', () => {
        const store = useMachineTagsStore.getState();
        const result = store.setTags('machine-1', ['fire', 'powerful', 'rare']);
        
        expect(result.success).toBe(true);
        const tags = store.getTags('machine-1');
        expect(tags).toHaveLength(3);
      });

      it('should replace existing tags', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'old-tag');
        store.setTags('machine-1', ['new-tag']);
        
        const tags = store.getTags('machine-1');
        expect(tags).not.toContain('old-tag');
        expect(tags).toContain('new-tag');
      });

      it('should sanitize all tags', () => {
        const store = useMachineTagsStore.getState();
        const result = store.setTags('machine-1', ['  FIRE  ', 'P@WER!  ']);
        
        expect(result.success).toBe(true);
        const tags = store.getTags('machine-1');
        expect(tags).toContain('fire');
        expect(tags).toContain('pwer');
      });

      it('should reject duplicates in input', () => {
        const store = useMachineTagsStore.getState();
        const result = store.setTags('machine-1', ['fire', 'FIRE', 'powerful']);
        
        expect(result.success).toBe(false);  // Store sanitizes/truncates, does not reject
        expect(result.error).toBe('Duplicate tags not allowed');
      });

      it('should reject when exceeding max tags per machine', () => {
        const store = useMachineTagsStore.getState();
        const tags = Array.from({ length: MAX_TAGS_PER_MACHINE + 1 }, (_, i) => `tag${i}`);
        const result = store.setTags('machine-1', tags);
        
        expect(result.success).toBe(false);  // Store sanitizes/truncates, does not reject
      });

      it('should filter out empty tags', () => {
        const store = useMachineTagsStore.getState();
        const result = store.setTags('machine-1', ['fire', '', '  ', 'powerful']);
        
        expect(result.success).toBe(true);
        const tags = store.getTags('machine-1');
        expect(tags).toHaveLength(2);
      });
    });

    describe('getTags', () => {
      it('should return empty array for machine with no tags', () => {
        const store = useMachineTagsStore.getState();
        const tags = store.getTags('non-existent');
        expect(tags).toEqual([]);
      });
    });

    describe('hasTag', () => {
      it('should return true when machine has tag', () => {
        const store = useMachineTagsStore.getState();
        store.addTag('machine-1', 'fire');
        
        expect(store.hasTag('machine-1', 'fire')).toBe(true);
      });

      it('should return false when machine does not have tag', () => {
        const store = useMachineTagsStore.getState();
        expect(store.hasTag('machine-1', 'fire')).toBe(false);
      });

      it('should sanitize tag input', () => {
        const store = useMachineTagsStore.getState();
        store.addTag('machine-1', 'fire');
        
        expect(store.hasTag('machine-1', 'FIRE')).toBe(true);
      });
    });
  });

  // ============================================
  // Autocomplete Tests
  // ============================================
  describe('Autocomplete', () => {
    beforeEach(() => {
      const store = useMachineTagsStore.getState();
      
      // Add various tags
      store.addTag('machine-1', 'fire-crystal');
      store.addTag('machine-1', 'fire-power');
      store.addTag('machine-1', 'fire');
      store.addTag('machine-2', 'power-amplifier');
      store.addTag('machine-2', 'power-core');
      store.addTag('machine-3', 'rare-item');
      store.addTag('machine-4', 'legendary-weapon');
    });

    describe('getAutocomplete', () => {
      it('should return matching tags for partial input', () => {
        const store = useMachineTagsStore.getState();
        const suggestions = store.getAutocomplete('fire');
        
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.every(tag => tag.includes('fire'))).toBe(true);
      });

      it('should prioritize tags that start with the partial', () => {
        const store = useMachineTagsStore.getState();
        const suggestions = store.getAutocomplete('power');
        
        // Tags starting with 'power' should come first
        const startingWith = suggestions.filter(tag => tag.startsWith('power'));
        const containing = suggestions.filter(tag => tag.includes('power') && !tag.startsWith('power'));
        
        expect(startingWith.length).toBeGreaterThan(0);
        expect(suggestions.indexOf(startingWith[0])).toBeLessThan(suggestions.indexOf(containing[0]));
      });

      it('should limit results by default', () => {
        const store = useMachineTagsStore.getState();
        const suggestions = store.getAutocomplete('a');
        
        expect(suggestions.length).toBeLessThanOrEqual(10);
      });

      it('should respect custom limit', () => {
        const store = useMachineTagsStore.getState();
        const suggestions = store.getAutocomplete('fire', 1);
        
        expect(suggestions.length).toBeLessThanOrEqual(1);
      });

      it('should return empty array for empty partial', () => {
        const store = useMachineTagsStore.getState();
        const suggestions = store.getAutocomplete('');
        
        expect(suggestions).toEqual([]);
      });

      it('should return empty array for invalid partial', () => {
        const store = useMachineTagsStore.getState();
        const suggestions = store.getAutocomplete('@@@');
        
        // After sanitization, @@@ becomes empty string
        expect(suggestions).toEqual([]);
      });
    });

    describe('getAllTags', () => {
      it('should return all unique tags sorted alphabetically', () => {
        const store = useMachineTagsStore.getState();
        const allTags = store.getAllTags();
        
        // Should be sorted
        const sorted = [...allTags].sort();
        expect(allTags).toEqual(sorted);
      });

      it('should not contain duplicates', () => {
        const store = useMachineTagsStore.getState();
        const allTags = store.getAllTags();
        
        const unique = new Set(allTags);
        expect(unique.size).toBe(allTags.length);
      });
    });
  });

  // ============================================
  // Bulk Operations
  // ============================================
  describe('Bulk Operations', () => {
    describe('removeAllTagsForMachine', () => {
      it('should remove all tags for a specific machine', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        store.addTag('machine-1', 'powerful');
        store.addTag('machine-2', 'rare');
        
        store.removeAllTagsForMachine('machine-1');
        
        expect(store.getTags('machine-1')).toEqual([]);
        expect(store.getTags('machine-2')).toContain('rare');
      });

      it('should clean up unused tags from allTags', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire-only-here');
        store.addTag('machine-2', 'common-tag');
        store.removeAllTagsForMachine('machine-1');
        
        const allTags = store.getAllTags();
        expect(allTags).not.toContain('fire-only-here');
        expect(allTags).toContain('common-tag');
      });
    });

    describe('clearAllTags', () => {
      it('should clear all machine tags', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        store.addTag('machine-2', 'powerful');
        
        store.clearAllTags();
        
        expect(store.getTags('machine-1')).toEqual([]);
        expect(store.getTags('machine-2')).toEqual([]);
      });

      it('should clear all tags from allTags set', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        store.addTag('machine-2', 'powerful');
        
        store.clearAllTags();
        
        expect(store.getAllTags()).toEqual([]);
      });
    });
  });

  // ============================================
  // Query Operations
  // ============================================
  describe('Query Operations', () => {
    describe('getMachinesByTag', () => {
      it('should return machines with specific tag', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        store.addTag('machine-2', 'fire');
        store.addTag('machine-3', 'water');
        
        const machines = store.getMachinesByTag('fire');
        
        expect(machines).toContain('machine-1');
        expect(machines).toContain('machine-2');
        expect(machines).not.toContain('machine-3');
      });

      it('should return empty array for tag with no machines', () => {
        const store = useMachineTagsStore.getState();
        const machines = store.getMachinesByTag('non-existent');
        
        expect(machines).toEqual([]);
      });
    });

    describe('getMachineCount', () => {
      it('should return count of machines with tags', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        store.addTag('machine-2', 'powerful');
        store.addTag('machine-3', 'rare');
        
        expect(store.getMachineCount()).toBe(3);
      });

      it('should return 0 when no machines have tags', () => {
        const store = useMachineTagsStore.getState();
        expect(store.getMachineCount()).toBe(0);
      });

      it('should not count machine twice', () => {
        const store = useMachineTagsStore.getState();
        
        store.addTag('machine-1', 'fire');
        store.addTag('machine-1', 'powerful'); // Same machine, different tag
        
        expect(store.getMachineCount()).toBe(1);
      });
    });
  });

  // ============================================
  // Limits Tests
  // ============================================
  describe('Limits', () => {
    describe('MAX_TOTAL_TAGS', () => {
      it('should enforce total unique tags limit when adding new tags', () => {
        const store = useMachineTagsStore.getState();
        
        // Add MAX_TOTAL_TAGS unique tags to different machines
        for (let i = 0; i < MAX_TOTAL_TAGS; i++) {
          store.addTag(`machine-${i}`, `uniquetag${i}`);
        }
        
        // Try to add one more unique tag to a new machine
        const result = store.addTag('new-machine', 'new-unique-tag');
        
        expect(result.success).toBe(false);
        expect(result.error).toContain(`Maximum ${MAX_TOTAL_TAGS} unique tags`);
      });

      it('should allow adding existing tag when at limit', () => {
        const store = useMachineTagsStore.getState();
        
        // Add MAX_TOTAL_TAGS unique tags
        for (let i = 0; i < MAX_TOTAL_TAGS; i++) {
          store.addTag(`machine-${i}`, `uniquetag${i}`);
        }
        
        // Add an existing tag to a new machine
        const result = store.addTag('new-machine', 'uniquetag0');
        
        expect(result.success).toBe(true);
      });

      it('should not count duplicate tags toward limit', () => {
        const store = useMachineTagsStore.getState();
        
        // Add same tag to MAX_TOTAL_TAGS machines
        for (let i = 0; i < MAX_TOTAL_TAGS; i++) {
          store.addTag(`machine-${i}`, 'same-tag');
        }
        
        // Should still be able to add a different tag
        const result = store.addTag('new-machine', 'different-tag');
        
        expect(result.success).toBe(true);
      });
    });

    describe('MAX_TAGS_PER_MACHINE', () => {
      it('should be configurable via type', () => {
        expect(MAX_TAGS_PER_MACHINE).toBe(5);
      });

      it('should be enforced in addTag', () => {
        const store = useMachineTagsStore.getState();
        
        for (let i = 0; i < MAX_TAGS_PER_MACHINE; i++) {
          store.addTag('machine-1', `tag${i}`);
        }
        
        const result = store.addTag('machine-1', 'one-more');
        expect(result.success).toBe(false);
      });

      it('should be enforced in setTags', () => {
        const store = useMachineTagsStore.getState();
        
        const tags = Array.from({ length: MAX_TAGS_PER_MACHINE + 1 }, (_, i) => `tag${i}`);
        const result = store.setTags('machine-1', tags);
        
        expect(result.success).toBe(false);
      });
    });
  });

  // ============================================
  // Sanitization Tests
  // ============================================
  describe('Sanitization', () => {
    it('should convert to lowercase', () => {
      const store = useMachineTagsStore.getState();
      store.addTag('machine-1', 'UPPERCASE');
      
      expect(store.getTags('machine-1')).toContain('uppercase');
    });

    it('should trim whitespace', () => {
      const store = useMachineTagsStore.getState();
      store.addTag('machine-1', '  spaced  ');
      
      expect(store.getTags('machine-1')).toContain('spaced');
    });

    it('should remove special characters except hyphen and underscore', () => {
      const store = useMachineTagsStore.getState();
      store.addTag('machine-1', 'test@#$%^&*()tag');
      
      expect(store.getTags('machine-1')).toContain('testtag');
    });

    it('should keep hyphens and underscores', () => {
      const store = useMachineTagsStore.getState();
      store.addTag('machine-1', 'test-tag_with-unders');
      
      expect(store.getTags('machine-1')).toContain('test-tag_with-unders');
    });

    it('should handle numbers', () => {
      const store = useMachineTagsStore.getState();
      store.addTag('machine-1', 'tag123');
      
      expect(store.getTags('machine-1')).toContain('tag123');
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle empty state', () => {
      const store = useMachineTagsStore.getState();
      
      expect(store.getTags('machine-1')).toEqual([]);
      expect(store.getAllTags()).toEqual([]);
      expect(store.getMachineCount()).toBe(0);
      expect(store.getMachinesByTag('fire')).toEqual([]);
    });

    it('should handle rapid add/remove operations', () => {
      const store = useMachineTagsStore.getState();
      
      for (let i = 0; i < 10; i++) {
        store.addTag('machine-1', `tag${i}`);
      }
      
      for (let i = 0; i < 10; i++) {
        store.removeTag('machine-1', `tag${i}`);
      }
      
      expect(store.getTags('machine-1')).toEqual([]);
    });

    it('should handle same tag add/remove multiple times', () => {
      const store = useMachineTagsStore.getState();
      
      store.addTag('machine-1', 'fire');
      store.removeTag('machine-1', 'fire');
      store.addTag('machine-1', 'fire');
      store.removeTag('machine-1', 'fire');
      
      expect(store.getTags('machine-1')).toEqual([]);
    });

    it('should handle case variations independently', () => {
      const store = useMachineTagsStore.getState();
      
      store.addTag('machine-1', 'Fire');
      // Adding 'FIRE' should fail (duplicate after sanitization)
      const result = store.addTag('machine-1', 'FIRE');
      
      expect(result.success).toBe(false);
      // Verify tag was not added twice (still just 'fire')
      expect(store.getTags('machine-1')).toEqual(['fire']);
    });

    it('should handle tag length at boundary', () => {
      const store = useMachineTagsStore.getState();
      
      const exactLengthTag = 'a'.repeat(MAX_TAG_LENGTH);
      const result = store.addTag('machine-1', exactLengthTag);
      
      expect(result.success).toBe(true);
      expect(store.getTags('machine-1')).toContain(exactLengthTag);
    });
  });
});
