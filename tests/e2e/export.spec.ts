import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Export Workflow
 * 
 * Tests the complete export flow:
 * - Opening export modal from toolbar
 * - Selecting different formats (SVG, PNG, poster)
 * - Verifying format selection persists
 * - Verifying dimension indicator updates
 * - Verifying preset buttons apply settings
 */

test.describe('Export Workflow', () => {
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
    
    // Add at least one module so we have something to export (Chinese: 核心熔炉)
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(300);
  });

  test('should open export modal from toolbar', async ({ page }) => {
    // Click on export button in toolbar
    const exportButton = page.getByRole('button', { name: /导出|Export/i }).first();
    await expect(exportButton).toBeVisible({ timeout: 10000 });
    await exportButton.click();
    
    // Modal should appear with export title
    await expect(page.getByText('Export Machine').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show all export format options', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // All format buttons should be visible
    await expect(page.getByText('SVG').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('PNG').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Poster').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Enhanced').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Faction Card').first()).toBeVisible({ timeout: 5000 });
  });

  test('should select SVG format', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Click SVG format button
    const svgButton = page.getByRole('tab', { name: /svg/i }).or(
      page.getByRole('button', { name: /SVG.*Vector/i })
    );
    await svgButton.click();
    await page.waitForTimeout(200);
    
    // SVG should now be selected
    const svgButtonAfter = page.getByRole('tab', { name: /svg/i }).or(
      page.getByRole('button', { name: /SVG.*Vector/i })
    );
    await expect(svgButtonAfter).toHaveAttribute('aria-selected', 'true');
  });

  test('should select PNG format', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Click PNG format button
    const pngButton = page.getByRole('tab', { name: /png/i }).or(
      page.getByRole('button', { name: /PNG.*Raster/i })
    );
    await pngButton.click();
    await page.waitForTimeout(200);
    
    // PNG should now be selected
    const pngButtonAfter = page.getByRole('tab', { name: /png/i }).or(
      page.getByRole('button', { name: /PNG.*Raster/i })
    );
    await expect(pngButtonAfter).toHaveAttribute('aria-selected', 'true');
    
    // Resolution options should appear for PNG
    await expect(page.getByText(/Resolution|分辨率/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should show resolution options when PNG is selected', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Select PNG format
    await page.getByRole('tab', { name: /png/i }).or(
      page.getByRole('button', { name: /PNG.*Raster/i })
    ).click();
    await page.waitForTimeout(500);
    
    // Resolution selector should appear
    await expect(page.getByText(/Resolution|分辨率/i).first()).toBeVisible({ timeout: 5000 });
    
    // Resolution options should be visible (1x, 2x, 4x)
    await expect(page.getByText('1x').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('2x').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('4x').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show aspect ratio options for poster formats', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Select Poster format
    const posterButton = page.getByRole('tab', { name: /poster/i }).or(
      page.getByRole('button', { name: /Poster.*Share/i })
    );
    await posterButton.click();
    await page.waitForTimeout(500);
    
    // Aspect ratio selector should appear
    await expect(page.getByText(/Aspect Ratio|纵横比/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should update dimension indicator based on format', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Find dimension indicator
    const dimensionIndicator = page.locator('[data-testid="dimension-indicator"]');
    
    // For SVG, dimensions should be shown
    const dimsText = await dimensionIndicator.textContent();
    expect(dimsText).toMatch(/\d+\s*×\s*\d+\s*px/);
    
    // Change to PNG
    await page.getByRole('tab', { name: /png/i }).or(
      page.getByRole('button', { name: /PNG.*Raster/i })
    ).click();
    await page.waitForTimeout(500);
    
    // Dimension indicator should update
    const pngDimsText = await dimensionIndicator.textContent();
    expect(pngDimsText).toMatch(/\d+\s*×\s*\d+\s*px/);
  });

  test('should apply preset settings when preset button clicked', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Find and click Social Media preset
    const socialMediaPreset = page.getByRole('button', { name: /social media|SM/i }).or(
      page.getByText('📱')
    );
    if (await socialMediaPreset.isVisible({ timeout: 2000 }).catch(() => false)) {
      await socialMediaPreset.click();
      await page.waitForTimeout(500);
      
      // PNG format should be selected after preset
      const pngButton = page.getByRole('tab', { name: /png/i });
      await expect(pngButton).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('should have filename input field', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Filename input should exist
    const filenameInput = page.getByRole('textbox', { name: /filename|文件名/i });
    await expect(filenameInput).toBeVisible({ timeout: 5000 });
  });

  test('should persist filename when changing formats', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Enter a custom filename
    const filenameInput = page.getByRole('textbox', { name: /filename|文件名/i });
    await filenameInput.fill('my-custom-machine');
    await page.waitForTimeout(200);
    
    // Change to PNG format
    await page.getByRole('tab', { name: /png/i }).or(
      page.getByRole('button', { name: /PNG.*Raster/i })
    ).click();
    await page.waitForTimeout(500);
    
    // Filename should persist
    await expect(filenameInput).toHaveValue('my-custom-machine');
  });

  test('should have cancel and export buttons', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Cancel button should exist
    await expect(page.getByRole('button', { name: /cancel/i }).first()).toBeVisible({ timeout: 5000 });
    
    // Export button should exist
    const exportButton = page.getByRole('button', { name: /export/i });
    await expect(exportButton).toBeVisible({ timeout: 5000 });
  });

  test('should close modal when cancel is clicked', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).first().click();
    await page.waitForTimeout(500);
    
    // Modal should be closed
    await expect(page.getByText('Export Machine').first()).not.toBeVisible({ timeout: 5000 });
  });

  test('should show preview area in export modal', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Preview area should exist (aspect-video class)
    const previewArea = page.locator('.aspect-video').or(
      page.locator('[class*="preview"]')
    );
    await expect(previewArea.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show export info text for each format', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // SVG info should be visible by default (use first() to avoid strict mode)
    await expect(page.getByText(/svg export|scalable vector/i).first()).toBeVisible({ timeout: 5000 });
    
    // Select PNG
    await page.getByRole('tab', { name: /png/i }).click();
    await page.waitForTimeout(500);
    
    // PNG info should appear
    await expect(page.getByText(/png export|raster image/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should have transparent background option for PNG', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Select PNG format
    await page.getByRole('tab', { name: /png/i }).or(
      page.getByRole('button', { name: /PNG.*Raster/i })
    ).click();
    await page.waitForTimeout(500);
    
    // Transparent background option should be visible
    const transparentOption = page.getByText(/transparent|透明背景/i);
    await expect(transparentOption.first()).toBeVisible({ timeout: 5000 });
  });

  test('should close modal with close button', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: /导出|Export/i }).first().click();
    await page.waitForTimeout(500);
    
    // Find and click the X close button
    const closeButton = page.locator('button').filter({ has: page.locator('text=✕') }).first();
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
    } else {
      // Try alternative close button
      await page.getByRole('button', { name: '✕' }).click();
    }
    await page.waitForTimeout(500);
    
    // Modal should be closed
    await expect(page.getByText('Export Machine').first()).not.toBeVisible({ timeout: 5000 });
  });
});
