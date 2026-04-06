/**
 * useRatingsStore Tests
 * 
 * Round 167 Fix: Wrapped all renderHook() calls in await act(async () => {...})
 * to fix act() warnings in React 18 testing.
 * 
 * Tests for the ratings store functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRatingsStore } from '../store/useRatingsStore';

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
}));

// Key format helper
function makeKey(machineId: string, userId: string): string {
  return `${machineId}:${userId}`;
}

// Helper function to wrap renderHook in act()
async function renderRatingsStore() {
  let result: any;
  await act(async () => {
    const renderResult = renderHook(() => useRatingsStore());
    result = renderResult;
  });
  return result;
}

// Helper function to reset store in act()
async function resetStore() {
  await act(async () => {
    useRatingsStore.setState({
      userRatings: {},
      reviews: {},
    });
  });
}

describe('useRatingsStore', () => {
  beforeEach(async () => {
    // Reset store state before each test
    await resetStore();
  });

  describe('submitRating', () => {
    it('stores a rating for a machine', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-1', 4);
      });
      
      const ratingKey = makeKey('machine-1', 'user-1');
      expect(result.current.userRatings[ratingKey]).toBeDefined();
      expect(result.current.userRatings[ratingKey].value).toBe(4);
      expect(result.current.userRatings[ratingKey].userId).toBe('user-1');
    });

    it('updates an existing rating for the same user and machine', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-1', 3);
      });
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-1', 5);
      });
      
      const ratingKey = makeKey('machine-1', 'user-1');
      expect(result.current.userRatings[ratingKey].value).toBe(5);
    });

    it('removes rating when clicking the same star value', async () => {
      const { result } = await renderRatingsStore();
      const ratingKey = makeKey('machine-1', 'user-1');
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-1', 4);
      });
      expect(result.current.userRatings[ratingKey]).toBeDefined();
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-1', 4);
      });
      expect(result.current.userRatings[ratingKey]).toBeUndefined();
    });

    it('clamps rating values to 1-5 range', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-1', 10);
      });
      const key1 = makeKey('machine-1', 'user-1');
      expect(result.current.userRatings[key1].value).toBe(5);
      
      await act(async () => {
        result.current.submitRating('machine-2', 'user-1', -2);
      });
      const key2 = makeKey('machine-2', 'user-1');
      expect(result.current.userRatings[key2].value).toBe(1);
    });
  });

  describe('getUserRating', () => {
    it('returns the user rating for a machine', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-1', 4);
      });
      
      const rating = result.current.getUserRating('machine-1', 'user-1');
      expect(rating).toBeDefined();
      expect(rating?.value).toBe(4);
    });

    it('returns undefined for non-existent rating', async () => {
      const { result } = await renderRatingsStore();
      
      const rating = result.current.getUserRating('non-existent', 'user-1');
      expect(rating).toBeUndefined();
    });

    it('returns undefined for different user', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-1', 4);
      });
      
      const rating = result.current.getUserRating('machine-1', 'user-2');
      expect(rating).toBeUndefined();
    });
  });

  describe('getAverageRating', () => {
    it('calculates average from user ratings only', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-1', 4);
      });
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-2', 2);
      });
      
      const stats = result.current.getAverageRating('machine-1');
      // Average of 4 and 2 = 3
      expect(stats?.averageRating).toBe(3);
      expect(stats?.ratingCount).toBe(2);
    });

    it('calculates average including review ratings', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-1', 5);
      });
      
      // When submitting a review, it also submits a rating
      // So we get: user-1 rating (5), user-2 rating (3 from review)
      // Reviews also contribute to the average
      await act(async () => {
        result.current.submitReview('machine-1', 'user-2', 'User Two', 3, 'Good machine');
      });
      
      const stats = result.current.getAverageRating('machine-1');
      // user-1 rating: 5, user-2 rating from review: 3, user-2 review rating: 3
      // Average = (5 + 3 + 3) / 3 = 3.666... ≈ 3.7
      expect(stats?.averageRating).toBe(3.7);
      expect(stats?.ratingCount).toBe(3);
    });

    it('returns 0 for machine with no ratings', async () => {
      const { result } = await renderRatingsStore();
      
      const stats = result.current.getAverageRating('non-existent');
      expect(stats?.averageRating).toBe(0);
      expect(stats?.ratingCount).toBe(0);
    });
  });

  describe('submitReview', () => {
    it('adds a review to a machine', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitReview('machine-1', 'user-1', 'Test User', 4, 'Great machine!');
      });
      
      const reviews = result.current.getReviews('machine-1');
      expect(reviews).toHaveLength(1);
      expect(reviews[0].text).toBe('Great machine!');
      expect(reviews[0].authorId).toBe('user-1');
      expect(reviews[0].rating).toBe(4);
    });

    it('also submits rating when submitting review', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitReview('machine-1', 'user-1', 'Test User', 4, 'Great machine!');
      });
      
      const rating = result.current.getUserRating('machine-1', 'user-1');
      expect(rating).toBeDefined();
      expect(rating?.value).toBe(4);
    });
  });

  describe('deleteReview', () => {
    it('deletes a review when user owns it', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitReview('machine-1', 'user-1', 'Test User', 4, 'Great machine!');
      });
      
      const reviews = result.current.getReviews('machine-1');
      const reviewId = reviews[0].id;
      
      await act(async () => {
        const deleted = result.current.deleteReview('machine-1', reviewId, 'user-1');
        expect(deleted).toBe(true);
      });
      
      expect(result.current.getReviews('machine-1')).toHaveLength(0);
    });

    it('returns false and does not delete when user does not own review', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitReview('machine-1', 'user-1', 'Test User', 4, 'Great machine!');
      });
      
      const reviews = result.current.getReviews('machine-1');
      const reviewId = reviews[0].id;
      
      await act(async () => {
        const deleted = result.current.deleteReview('machine-1', reviewId, 'user-2');
        expect(deleted).toBe(false);
      });
      
      expect(result.current.getReviews('machine-1')).toHaveLength(1);
    });
  });

  describe('getReviews', () => {
    it('returns reviews sorted by newest first', async () => {
      const { result } = await renderRatingsStore();
      
      // Manually add reviews with different timestamps
      const now = Date.now();
      await act(async () => {
        useRatingsStore.setState({
          reviews: {
            'machine-1': [
              {
                id: 'review-1',
                machineId: 'machine-1',
                authorId: 'user-1',
                authorName: 'User 1',
                rating: 4,
                text: 'First review',
                timestamp: now - 1000,
              },
              {
                id: 'review-2',
                machineId: 'machine-1',
                authorId: 'user-2',
                authorName: 'User 2',
                rating: 5,
                text: 'Second review',
                timestamp: now,
              },
            ],
          },
        });
      });
      
      const reviews = result.current.getReviews('machine-1');
      expect(reviews[0].id).toBe('review-2'); // Newest first
      expect(reviews[1].id).toBe('review-1');
    });

    it('returns empty array for machine with no reviews', async () => {
      const { result } = await renderRatingsStore();
      
      const reviews = result.current.getReviews('non-existent');
      expect(reviews).toEqual([]);
    });
  });
});

// =============================================================================
// Hydration Tests (Round 140)
// =============================================================================
describe('Ratings Store Hydration (Round 140)', () => {
  beforeEach(async () => {
    // Reset store state before each test
    await resetStore();
  });

  describe('persist interface', () => {
    it('should have persist interface available on the store', () => {
      expect(useRatingsStore.persist).toBeDefined();
    });

    it('should have persist rehydrate function', () => {
      expect(typeof useRatingsStore.persist?.rehydrate).toBe('function');
    });

    it('should have persist hasHydrated function', () => {
      expect(typeof useRatingsStore.persist?.hasHydrated).toBe('function');
    });

    it('should have persist setOptions function', () => {
      expect(typeof useRatingsStore.persist?.setOptions).toBe('function');
    });

    it('should have persist getOptions function', () => {
      expect(typeof useRatingsStore.persist?.getOptions).toBe('function');
    });

    it('should have skipHydration configured', () => {
      const options = useRatingsStore.persist?.getOptions?.();
      expect(options?.skipHydration).toBe(true);
    });

    it('should use arcane-ratings-store as storage key', () => {
      const options = useRatingsStore.persist?.getOptions?.();
      expect(options?.name).toBe('arcane-ratings-store');
    });
  });

  describe('State persistence behavior', () => {
    it('should preserve userRatings state across setState calls', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitRating('machine-1', 'user-1', 5);
      });
      
      // Verify state is preserved
      const rating = result.current.getUserRating('machine-1', 'user-1');
      expect(rating?.value).toBe(5);
      
      // Trigger another setState to ensure no state loss
      await act(async () => {
        result.current.submitRating('machine-2', 'user-1', 3);
      });
      
      // Original rating should still exist
      const originalRating = result.current.getUserRating('machine-1', 'user-1');
      expect(originalRating?.value).toBe(5);
    });

    it('should preserve reviews state across setState calls', async () => {
      const { result } = await renderRatingsStore();
      
      await act(async () => {
        result.current.submitReview('machine-1', 'user-1', 'User One', 4, 'Great!');
      });
      
      // Verify reviews exist
      const reviews = result.current.getReviews('machine-1');
      expect(reviews).toHaveLength(1);
      
      // Add another review
      await act(async () => {
        result.current.submitReview('machine-2', 'user-2', 'User Two', 5, 'Amazing!');
      });
      
      // Original reviews should still exist
      const originalReviews = result.current.getReviews('machine-1');
      expect(originalReviews).toHaveLength(1);
      expect(originalReviews[0].text).toBe('Great!');
    });

    it('should handle rehydrate call without throwing', () => {
      expect(() => {
        useRatingsStore.persist?.rehydrate?.();
      }).not.toThrow();
    });
  });

  describe('Partial hydration scenarios', () => {
    it('should handle missing reviews field gracefully', async () => {
      const { result } = await renderRatingsStore();
      
      // Manually set only userRatings (simulating partial hydration)
      await act(async () => {
        useRatingsStore.setState({
          userRatings: {
            'machine-1:user-1': {
              id: 'rating-1',
              machineId: 'machine-1',
              userId: 'user-1',
              value: 4,
              timestamp: Date.now(),
            },
          },
          // reviews is not set - should default to {}
        });
      });
      
      // Should not crash
      expect(result.current.getReviews('machine-1')).toEqual([]);
      expect(result.current.getAverageRating('machine-1')?.averageRating).toBe(4);
    });

    it('should handle missing userRatings field gracefully', async () => {
      const { result } = await renderRatingsStore();
      
      // Manually set only reviews (simulating partial hydration)
      await act(async () => {
        useRatingsStore.setState({
          reviews: {
            'machine-1': [
              {
                id: 'review-1',
                machineId: 'machine-1',
                authorId: 'user-1',
                authorName: 'User One',
                rating: 5,
                text: 'Perfect!',
                timestamp: Date.now(),
              },
            ],
          },
          // userRatings is not set - should default to {}
        });
      });
      
      // Should not crash
      expect(result.current.getUserRating('machine-1', 'user-1')).toBeUndefined();
      expect(result.current.getAverageRating('machine-1')?.averageRating).toBe(5);
    });

    it('should handle empty state', async () => {
      const { result } = await renderRatingsStore();
      
      // Ensure empty state
      await act(async () => {
        useRatingsStore.setState({
          userRatings: {},
          reviews: {},
        });
      });
      
      // Should handle gracefully
      expect(result.current.getAverageRating('any-machine')).toEqual({
        machineId: 'any-machine',
        averageRating: 0,
        ratingCount: 0,
      });
      expect(result.current.getReviews('any-machine')).toEqual([]);
    });
  });
});
