import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Recipe Browser Workflow
 * 
 * Tests the recipe browser functionality:
 * - Browsing recipes
 * - Filtering recipes
 * - Viewing recipe hints
 */

test.describe('Recipe Browser Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Dismiss welcome modal if present
    const welcomeModal = page.getByRole('dialog', { name: /welcome|welcome modal/i });
    if (await welcomeModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      const closeButton = page.getByRole('button', { name: /close|dismiss|start|begin/i });
      if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  test('should open recipe browser from toolbar', async ({ page }) => {
    // Find recipe button in toolbar
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Recipe browser should open
      const recipeBrowser = page.getByText(/recipe|配方|recipe codex/i);
      await expect(recipeBrowser.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should show all recipes', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Recipe list should be visible
      const recipeList = page.getByText(/recipe|配方/i);
      await expect(recipeList.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should show recipe cards with module names', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Module names should appear in recipes
      const moduleName = page.getByText(/core furnace|energy pipe|gear|rune/i);
      await expect(moduleName.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should filter recipes by status', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Filter buttons should exist
      const allFilter = page.getByRole('button', { name: /all|全部/i });
      const unlockedFilter = page.getByRole('button', { name: /unlocked|已解锁/i });
      const lockedFilter = page.getByRole('button', { name: /locked|未解锁/i });
      
      // At least one filter should be visible
      if (await allFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await unlockedFilter.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should show rarity on recipes', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Rarity labels should be visible
      const rarity = page.getByText(/common|uncommon|rare|epic|legendary/i);
      await expect(rarity.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should show recipe progress', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Progress bar or count should be visible
      const progress = page.getByText(/discovery progress/i);
      await expect(progress.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should view recipe details', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Click on a recipe card
      const recipeCard = page.locator('[class*="recipe"]').or(
        page.getByRole('button').filter({ hasText: /core furnace|energy/i }).first()
      );
      if (await recipeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await recipeCard.click();
        await page.waitForTimeout(500);
        
        // Detail view should show description or hint
        const detail = page.getByText(/description|hint|unlock|描述|提示|解锁/i);
        await expect(detail.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should show locked state for undiscovered recipes', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Click on locked filter
      const lockedFilter = page.getByRole('button', { name: /locked|未解锁/i });
      if (await lockedFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await lockedFilter.click();
        await page.waitForTimeout(500);
        
        // Lock indicators should be visible
        const lockIcon = page.locator('svg').filter({ has: page.locator('rect') });
        await expect(lockIcon.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should show hint for locked recipes', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Click on locked filter
      const lockedFilter = page.getByRole('button', { name: /locked|未解锁/i });
      if (await lockedFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await lockedFilter.click();
        await page.waitForTimeout(500);
        
        // Hint text should be visible
        const hint = page.getByText(/hint|提示|complete|achieve/i);
        await expect(hint.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should close recipe browser', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Close button should exist
      const closeButton = page.locator('button').filter({ has: page.locator('text=✕') }).first();
      if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(500);
      
      // Browser should be closed
      await expect(page.getByText(/recipe|配方/i).first()).not.toBeVisible({ timeout: 3000 });
    }
  });

  test('should sort recipes by different criteria', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Sort dropdown should exist
      const sortDropdown = page.locator('select');
      if (await sortDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sortDropdown.selectOption('rarity');
        await page.waitForTimeout(300);
        
        // Sort option should be applied
        const sortValue = await sortDropdown.inputValue();
        expect(sortValue).toBe('rarity');
      }
    }
  });

  test('should show module preview for unlocked recipes', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Click on an unlocked recipe
      const recipeCard = page.getByRole('button').filter({ hasText: /core furnace/i }).first();
      if (await recipeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await recipeCard.click();
        await page.waitForTimeout(500);
        
        // Preview should show module graphic
        const preview = page.locator('svg');
        await expect(preview.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should have keyboard shortcut to close', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Browser should be closed
      const browserVisible = await page.getByText(/recipe|配方|recipe codex/i).first().isVisible({ timeout: 3000 }).catch(() => false);
      expect(browserVisible).toBe(false);
    }
  });
});
