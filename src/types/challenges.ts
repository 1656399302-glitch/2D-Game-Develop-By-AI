/**
 * Challenge Types for Arcane Machine Codex Workshop
 * 
 * This file re-exports challenge types and definitions from src/data/challenges.ts.
 * The actual challenge data is centralized in CHALLENGE_DEFINITIONS.
 */

// Re-export all challenge types and definitions from the data file
export {
  CHALLENGE_DEFINITIONS,
  getChallengeById,
  getChallengesByCategory,
  getChallengesByDifficulty,
  getChallengeCountByCategory,
  default,
} from '../data/challenges';

export type {
  ChallengeCategory,
  ChallengeRewardType,
  ChallengeReward,
  ChallengeUnlockCondition,
  ChallengeDefinition,
} from '../data/challenges';

export {
  getChallengeCategoryLabel,
  getChallengeCategoryIcon,
} from '../data/challenges';
