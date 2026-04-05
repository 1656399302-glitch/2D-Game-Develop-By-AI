/**
 * Rating and Review Type Definitions
 * 
 * Types for the Community Rating & Review System.
 * Supports 1-5 star ratings with review text.
 */

export interface Rating {
  id: string;
  machineId: string;
  userId: string;
  value: number; // 1-5 stars
  timestamp: number;
}

export interface Review {
  id: string;
  machineId: string;
  authorId: string;
  authorName: string;
  rating: number; // 1-5 stars
  text: string;
  timestamp: number;
}

export interface MachineRatingStats {
  machineId: string;
  averageRating: number;
  ratingCount: number;
}

export interface RatingsState {
  // User's own ratings (keyed by machineId)
  userRatings: Record<string, Rating>;
  
  // Reviews for each machine (keyed by machineId)
  reviews: Record<string, Review[]>;
  
  // Actions
  submitRating: (machineId: string, userId: string, value: number) => void;
  removeRating: (machineId: string, userId: string) => void;
  getUserRating: (machineId: string, userId: string) => Rating | undefined;
  getAverageRating: (machineId: string) => MachineRatingStats | undefined;
  submitReview: (machineId: string, authorId: string, authorName: string, rating: number, text: string) => void;
  deleteReview: (machineId: string, reviewId: string, authorId: string) => boolean;
  getReviews: (machineId: string) => Review[];
}
