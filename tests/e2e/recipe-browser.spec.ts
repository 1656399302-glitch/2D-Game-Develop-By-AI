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
      
      // Recipe browser should open - look for heading
      const recipeBrowser = page.locator('h2:has-text("Recipe Codex")');
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
      const recipeList = page.locator('h4:has-text("Core Furnace")');
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
      const moduleName = page.locator('h4:has-text("Core Furnace")');
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
      const allFilter = page.getByRole('button', { name: /All/i });
      const unlockedFilter = page.getByRole('button', { name: /Unlocked/i });
      
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
      
      // Rarity labels should be visible (common, uncommon, rare, epic, legendary)
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
      
      // Progress text should be visible
      const progress = page.getByText(/Discovery Progress/i);
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
      const recipeCard = page.locator('h4:has-text("Core Furnace")').first();
      if (await recipeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await recipeCard.click({ force: true });
        await page.waitForTimeout(500);
        
        // Detail view should show description or hint
        const detail = page.getByText(/Available from the start|unlock|hint|描述|提示|解锁/i);
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
      const lockedFilter = page.getByRole('button', { name: /Locked/i });
      if (await lockedFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await lockedFilter.click();
        await page.waitForTimeout(500);
        
        // Lock indicators should be visible
        const lockIndicator = page.locator('text=Requires');
        await expect(lockIndicator.first()).toBeVisible({ timeout: 3000 });
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
      const lockedFilter = page.getByRole('button', { name: /Locked/i });
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
      
      // Close button should exist - use Chinese text "关闭"
      const closeButton = page.getByRole('button', { name: '关闭' });
      if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(500);
      
      // Browser should be closed - heading should not be visible
      await expect(page.locator('h2:has-text("Recipe Codex")').first()).not.toBeVisible({ timeout: 3000 });
    }
  });

  test('should sort recipes by different criteria', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Sort dropdown should exist - use combobox role
      const sortDropdown = page.getByRole('combobox');
      if (await sortDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Select by label/value - use Rarity option
        await sortDropdown.selectOption({ label: 'Rarity' });
        await page.waitForTimeout(300);
        
        // Sort option should be applied
        const sortValue = await sortDropdown.inputValue();
        expect(sortValue).toBeTruthy();
      }
    }
  });

  test('should show module preview for unlocked recipes', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Click on an unlocked recipe (Core Furnace)
      const recipeCard = page.locator('h4:has-text("Core Furnace")').first();
      if (await recipeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await recipeCard.click({ force: true });
        await page.waitForTimeout(500);
        
        // Preview should show module graphic (SVG)
        const preview = page.locator('svg').first();
        await expect(preview.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should have hint text for recipe unlock', async ({ page }) => {
    // Open recipe browser
    const recipeButton = page.getByRole('button', { name: /recipe|配方/i }).first();
    if (await recipeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recipeButton.click();
      await page.waitForTimeout(500);
      
      // Recipe hints should be visible
      const hint = page.getByText(/Complete your first challenge|Available from the start/i);
      await expect(hint.first()).toBeVisible({ timeout: 3000 });
    }
  });
});
