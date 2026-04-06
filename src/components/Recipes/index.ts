/**
 * Recipe Components Barrel Export
 * 
 * ROUND 182: Created barrel export file for all Recipe components
 * 
 * Components exported:
 * - RecipeCard: Individual recipe display with progress indicator
 * - RecipePanel: Sidebar panel with filtering, sorting, and statistics
 * - RecipeStats: Statistics display component for totals and category breakdown
 * - RecipeBrowser: Modal component for browsing recipes
 * - RecipeDiscoveryToast: Toast notification for recipe discovery
 */

export { RecipeCard } from './RecipeCard';
export { RecipePanel } from './RecipePanel';
export { RecipeStats, getRecipeCategory, getAllRecipeCategories } from './RecipeStats';
export { RecipeBrowser } from './RecipeBrowser';
export { RecipeDiscoveryToast } from './RecipeDiscoveryToast';

// Re-export types for convenience
export type { RecipeCategory } from './RecipeStats';
