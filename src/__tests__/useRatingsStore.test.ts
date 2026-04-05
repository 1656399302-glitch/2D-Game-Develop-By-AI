/**
 * useRatingsStore Tests
 * 
 * Tests for the ratings store functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRatingsStore } from '../store/useRatingsStore';

// Mock zustand persist
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware');
  return {
    ...actual,
    persist: (store) => store,
  };
});

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
}));

// Key format helper
function makeKey(machineId: string, userId: string): string {
  return `${machineId}:${userId}`;
}

describe('useRatingsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useRatingsStore.setState({
      userRatings: {},
      reviews: {},
    });
  });

  describe('submitRating', () => {
    it('stores a rating for a machine', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      act(() => {
        result.current.submitRating('machine-1', 'user-1', 4);
      });
      
      const ratingKey = makeKey('machine-1', 'user-1');
      expect(result.current.userRatings[ratingKey]).toBeDefined();
      expect(result.current.userRatings[ratingKey].value).toBe(4);
      expect(result.current.userRatings[ratingKey].userId).toBe('user-1');
    });

    it('updates an existing rating for the same user and machine', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      act(() => {
        result.current.submitRating('machine-1', 'user-1', 3);
      });
      
      act(() => {
        result.current.submitRating('machine-1', 'user-1', 5);
      });
      
      const ratingKey = makeKey('machine-1', 'user-1');
      expect(result.current.userRatings[ratingKey].value).toBe(5);
    });

    it('removes rating when clicking the same star value', () => {
      const { result } = renderHook(() => useRatingsStore());
      const ratingKey = makeKey('machine-1', 'user-1');
      
      act(() => {
        result.current.submitRating('machine-1', 'user-1', 4);
      });
      expect(result.current.userRatings[ratingKey]).toBeDefined();
      
      act(() => {
        result.current.submitRating('machine-1', 'user-1', 4);
      });
      expect(result.current.userRatings[ratingKey]).toBeUndefined();
    });

    it('clamps rating values to 1-5 range', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      act(() => {
        result.current.submitRating('machine-1', 'user-1', 10);
      });
      const key1 = makeKey('machine-1', 'user-1');
      expect(result.current.userRatings[key1].value).toBe(5);
      
      act(() => {
        result.current.submitRating('machine-2', 'user-1', -2);
      });
      const key2 = makeKey('machine-2', 'user-1');
      expect(result.current.userRatings[key2].value).toBe(1);
    });
  });

  describe('getUserRating', () => {
    it('returns the user rating for a machine', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      act(() => {
        result.current.submitRating('machine-1', 'user-1', 4);
      });
      
      const rating = result.current.getUserRating('machine-1', 'user-1');
      expect(rating).toBeDefined();
      expect(rating?.value).toBe(4);
    });

    it('returns undefined for non-existent rating', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      const rating = result.current.getUserRating('non-existent', 'user-1');
      expect(rating).toBeUndefined();
    });

    it('returns undefined for different user', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      act(() => {
        result.current.submitRating('machine-1', 'user-1', 4);
      });
      
      const rating = result.current.getUserRating('machine-1', 'user-2');
      expect(rating).toBeUndefined();
    });
  });

  describe('getAverageRating', () => {
    it('calculates average from user ratings only', async () => {
      const { result } = renderHook(() => useRatingsStore());
      
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
      const { result } = renderHook(() => useRatingsStore());
      
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

    it('returns 0 for machine with no ratings', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      const stats = result.current.getAverageRating('non-existent');
      expect(stats?.averageRating).toBe(0);
      expect(stats?.ratingCount).toBe(0);
    });
  });

  describe('submitReview', () => {
    it('adds a review to a machine', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      act(() => {
        result.current.submitReview('machine-1', 'user-1', 'Test User', 4, 'Great machine!');
      });
      
      const reviews = result.current.getReviews('machine-1');
      expect(reviews).toHaveLength(1);
      expect(reviews[0].text).toBe('Great machine!');
      expect(reviews[0].authorId).toBe('user-1');
      expect(reviews[0].rating).toBe(4);
    });

    it('also submits rating when submitting review', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      act(() => {
        result.current.submitReview('machine-1', 'user-1', 'Test User', 4, 'Great machine!');
      });
      
      const rating = result.current.getUserRating('machine-1', 'user-1');
      expect(rating).toBeDefined();
      expect(rating?.value).toBe(4);
    });
  });

  describe('deleteReview', () => {
    it('deletes a review when user owns it', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      act(() => {
        result.current.submitReview('machine-1', 'user-1', 'Test User', 4, 'Great machine!');
      });
      
      const reviews = result.current.getReviews('machine-1');
      const reviewId = reviews[0].id;
      
      act(() => {
        const deleted = result.current.deleteReview('machine-1', reviewId, 'user-1');
        expect(deleted).toBe(true);
      });
      
      expect(result.current.getReviews('machine-1')).toHaveLength(0);
    });

    it('returns false and does not delete when user does not own review', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      act(() => {
        result.current.submitReview('machine-1', 'user-1', 'Test User', 4, 'Great machine!');
      });
      
      const reviews = result.current.getReviews('machine-1');
      const reviewId = reviews[0].id;
      
      act(() => {
        const deleted = result.current.deleteReview('machine-1', reviewId, 'user-2');
        expect(deleted).toBe(false);
      });
      
      expect(result.current.getReviews('machine-1')).toHaveLength(1);
    });
  });

  describe('getReviews', () => {
    it('returns reviews sorted by newest first', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      // Manually add reviews with different timestamps
      const now = Date.now();
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
      
      const reviews = result.current.getReviews('machine-1');
      expect(reviews[0].id).toBe('review-2'); // Newest first
      expect(reviews[1].id).toBe('review-1');
    });

    it('returns empty array for machine with no reviews', () => {
      const { result } = renderHook(() => useRatingsStore());
      
      const reviews = result.current.getReviews('non-existent');
      expect(reviews).toEqual([]);
    });
  });
});
