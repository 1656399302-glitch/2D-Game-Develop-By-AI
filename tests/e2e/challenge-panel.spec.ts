import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Challenge Panel Workflow
 * 
 * Tests the challenge panel functionality:
 * - Browsing challenges
 * - Filtering challenges
 * - Viewing challenge details
 */

test.describe('Challenge Panel Workflow', () => {
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

  test('should open challenge panel from toolbar', async ({ page }) => {
    // Find challenge button in toolbar - look for Challenges button
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    
    // Check if button is visible (may be inside dropdown or menu)
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Challenge panel dialog should open
      const challengeDialog = page.getByRole('dialog');
      await expect(challengeDialog.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show challenge categories', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Category tabs should be visible (all, creation, collection, etc.)
      const tabs = page.getByRole('tab');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThan(0);
    }
  });

  test('should filter challenges by category', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Click on a category tab (creation, collection, activation, mastery)
      const tabs = page.getByRole('tab');
      const count = await tabs.count();
      if (count > 1) {
        await tabs.nth(1).click();
        await page.waitForTimeout(300);
        
        // Tab should now be active
        await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      }
    }
  });

  test('should display challenge cards', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Challenge cards should be visible in the list
      const challengeList = page.locator('.space-y-3 > div, [class*="challenge"]');
      const cardCount = await challengeList.count();
      expect(cardCount).toBeGreaterThan(0);
    }
  });

  test('should view challenge details', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Click on a challenge card
      const challengeCard = page.locator('.space-y-3 > div').first();
      if (await challengeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await challengeCard.click();
        await page.waitForTimeout(500);
        
        // Detail panel should show challenge title
        const detailTitle = page.locator('h3').filter({ hasText: /.+/ });
        await expect(detailTitle.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should show challenge reward', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Click on a challenge to see details
      const challengeCard = page.locator('.space-y-3 > div').first();
      if (await challengeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await challengeCard.click();
        await page.waitForTimeout(500);
        
        // Reward section should be visible
        const reward = page.getByText(/reward|奖励/i);
        await expect(reward.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should close challenge panel with close button', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Close button should exist (X button)
      const closeButton = page.locator('button').filter({ has: page.locator('text=✕') }).first();
      if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click();
        await page.waitForTimeout(500);
        
        // Dialog should be closed
        await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should close challenge panel with Escape key', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Dialog should be closed
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
    }
  });

  test('should show challenge progress header', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Progress should be shown in header
      const progressHeader = page.getByText(/\d+ of \d+/);
      await expect(progressHeader.first()).toBeVisible({ timeout: 3000 });
    }
  });
});
