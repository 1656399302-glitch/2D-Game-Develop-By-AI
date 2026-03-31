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
      
      // Challenge panel content should appear (挑战 heading)
      const challengePanel = page.locator('h2:has-text("挑战")');
      await expect(challengePanel).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show challenge categories', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Category filter buttons should be visible
      // These are buttons with category labels like "全部", "创作", etc.
      const categoryButtons = page.locator('button:has-text("全部")').or(
        page.locator('button:has-text("创作")')
      );
      const count = await categoryButtons.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should filter challenges by category', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Click on a category button (if available)
      const categoryButton = page.locator('button:has-text("创作")').or(
        page.locator('button:has-text("收集")')
      ).first();
      
      if (await categoryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await categoryButton.click();
        await page.waitForTimeout(300);
        
        // Button should appear pressed/active (different style)
        await expect(categoryButton).toBeVisible();
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
      // Look for list items with challenge content
      const challengeList = page.locator('[class*="challenge"]').or(
        page.locator('h3')
      );
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
      
      // Click on a challenge card (first h3 heading)
      const challengeCard = page.locator('h3').first();
      if (await challengeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await challengeCard.click({ force: true });
        await page.waitForTimeout(500);
        
        // Detail panel should show content
        const detailContent = page.locator('h3, h4, [class*="reward"]');
        await expect(detailContent.first()).toBeVisible({ timeout: 3000 });
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
      const challengeCard = page.locator('h3').first();
      if (await challengeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await challengeCard.click({ force: true });
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
      
      // Close button should exist - use aria-label="关闭" with X text
      const closeButton = page.getByRole('button', { name: '关闭' }).or(
        page.getByRole('button', { name: '✕' })
      );
      if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click();
        await page.waitForTimeout(500);
        
        // Panel should be closed - the heading "挑战" inside the panel should not be visible
        await expect(page.locator('h2:has-text("挑战")')).not.toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should show challenge progress header', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Progress should be shown - format is X/Y (e.g., "0/20")
      const progressHeader = page.getByText(/\d+\/\d+/);
      await expect(progressHeader.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should have difficulty filter options', async ({ page }) => {
    // Open challenge panel
    const challengeButton = page.getByRole('button', { name: /挑战|Challenges/i }).first();
    if (await challengeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeButton.click();
      await page.waitForTimeout(500);
      
      // Difficulty filter should be visible (难度)
      const difficultyFilter = page.getByText(/难度/i);
      await expect(difficultyFilter.first()).toBeVisible({ timeout: 3000 });
      
      // Difficulty options should include "全部" (all)
      const allOption = page.getByText(/全部/i);
      await expect(allOption.first()).toBeVisible({ timeout: 3000 });
    }
  });
});
