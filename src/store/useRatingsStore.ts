/**
 * Ratings Store
 * 
 * Zustand store for managing community machine ratings and reviews.
 * Persists user ratings and reviews to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Rating, Review, MachineRatingStats, RatingsState } from '../types/ratings';

// Key for storing user ratings - combines machineId and userId to allow multiple users to rate
type UserRatingKey = string; // Format: "machineId:userId"

function makeRatingKey(machineId: string, userId: string): UserRatingKey {
  return `${machineId}:${userId}`;
}

function parseRatingKey(key: UserRatingKey): { machineId: string; userId: string } {
  const [machineId, userId] = key.split(':');
  return { machineId, userId };
}

export const useRatingsStore = create<RatingsState>()(
  persist(
    (set, get) => ({
      // User ratings keyed by "machineId:userId" (each user can have one rating per machine)
      userRatings: {},
      
      // Reviews keyed by machineId (array of reviews)
      reviews: {},

      submitRating: (machineId: string, userId: string, value: number) => {
        const state = get();
        
        // Validate rating value (1-5)
        const validValue = Math.max(1, Math.min(5, Math.round(value)));
        
        // Create composite key
        const ratingKey = makeRatingKey(machineId, userId);
        
        // Check if user already has a rating for this machine
        const existingRating = state.userRatings[ratingKey];
        
        // If clicking the same star, remove the rating
        if (existingRating && existingRating.value === validValue) {
          set((s) => {
            const { [ratingKey]: _, ...remainingRatings } = s.userRatings;
            return { userRatings: remainingRatings };
          });
          return;
        }
        
        // Create or update rating
        const newRating: Rating = {
          id: existingRating?.id || uuidv4(),
          machineId,
          userId,
          value: validValue,
          timestamp: Date.now(),
        };
        
        set((s) => ({
          userRatings: {
            ...s.userRatings,
            [ratingKey]: newRating,
          },
        }));
      },

      removeRating: (machineId: string, userId: string) => {
        const state = get();
        const ratingKey = makeRatingKey(machineId, userId);
        const rating = state.userRatings[ratingKey];
        
        // Only remove if the user owns the rating
        if (rating) {
          set((s) => {
            const { [ratingKey]: _, ...remainingRatings } = s.userRatings;
            return { userRatings: remainingRatings };
          });
        }
      },

      getUserRating: (machineId: string, userId: string): Rating | undefined => {
        const state = get();
        const ratingKey = makeRatingKey(machineId, userId);
        return state.userRatings[ratingKey];
      },

      getAverageRating: (machineId: string): MachineRatingStats | undefined => {
        const state = get();
        
        // Get all ratings for this machine (from userRatings store)
        const allRatings: number[] = [];
        
        Object.keys(state.userRatings).forEach((key) => {
          const parsed = parseRatingKey(key);
          if (parsed.machineId === machineId) {
            allRatings.push(state.userRatings[key].value);
          }
        });
        
        // Get all reviews for this machine (they also contribute to the average)
        const machineReviews = state.reviews[machineId] || [];
        
        machineReviews.forEach((review) => {
          allRatings.push(review.rating);
        });
        
        if (allRatings.length === 0) {
          return {
            machineId,
            averageRating: 0,
            ratingCount: 0,
          };
        }
        
        const sum = allRatings.reduce((acc, val) => acc + val, 0);
        const average = sum / allRatings.length;
        
        return {
          machineId,
          averageRating: Math.round(average * 10) / 10, // Round to 1 decimal place
          ratingCount: allRatings.length,
        };
      },

      submitReview: (machineId: string, authorId: string, authorName: string, rating: number, text: string) => {
        const validRating = Math.max(1, Math.min(5, Math.round(rating)));
        
        const newReview: Review = {
          id: uuidv4(),
          machineId,
          authorId,
          authorName,
          rating: validRating,
          text: text.trim(),
          timestamp: Date.now(),
        };
        
        set((s) => ({
          reviews: {
            ...s.reviews,
            [machineId]: [newReview, ...(s.reviews[machineId] || [])],
          },
        }));
        
        // Also add/update user's rating to match review rating
        get().submitRating(machineId, authorId, validRating);
      },

      deleteReview: (machineId: string, reviewId: string, authorId: string): boolean => {
        const state = get();
        const machineReviews = state.reviews[machineId] || [];
        const reviewToDelete = machineReviews.find((r) => r.id === reviewId);
        
        // Only allow deletion if user owns the review
        if (!reviewToDelete || reviewToDelete.authorId !== authorId) {
          return false;
        }
        
        set((s) => ({
          reviews: {
            ...s.reviews,
            [machineId]: (s.reviews[machineId] || []).filter((r) => r.id !== reviewId),
          },
        }));
        
        return true;
      },

      getReviews: (machineId: string): Review[] => {
        const state = get();
        const reviews = state.reviews[machineId] || [];
        // Sort by newest first
        return [...reviews].sort((a, b) => b.timestamp - a.timestamp);
      },
    }),
    {
      name: 'arcane-ratings-store',
      partialize: (state) => ({
        userRatings: state.userRatings,
        reviews: state.reviews,
      }),
      skipHydration: true,
    }
  )
);

// Helper to manually trigger hydration
export const hydrateRatingsStore = () => {
  useRatingsStore.persist.rehydrate();
};

// Helper to check if hydration is complete
export const isRatingsHydrated = () => {
  return useRatingsStore.persist.hasHydrated();
};

// Get a default user ID for local storage (anonymous user)
export const getLocalUserId = (): string => {
  let userId = localStorage.getItem('arcane-user-id');
  if (!userId) {
    userId = `user-${uuidv4()}`;
    localStorage.setItem('arcane-user-id', userId);
  }
  return userId;
};

// Get display name for current user
export const getLocalUserName = (): string => {
  return localStorage.getItem('arcane-user-name') || 'Anonymous';
};

export const setLocalUserName = (name: string) => {
  localStorage.setItem('arcane-user-name', name);
};
