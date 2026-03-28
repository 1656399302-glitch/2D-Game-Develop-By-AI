import { test, expect } from '@playwright/test';

test.describe('Arcane Machine Codex Workshop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle('Arcane Machine Codex Workshop');
    
    // Check main header is visible
    await expect(page.getByText('ARCANE MACHINE CODEX')).toBeVisible();
    
    // Check editor and codex tabs
    await expect(page.getByRole('button', { name: 'Editor', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Codex', exact: true })).toBeVisible();
  });

  test('should show module panel', async ({ page }) => {
    await expect(page.getByText('MODULE PALETTE')).toBeVisible();
    await expect(page.getByText('Core Furnace')).toBeVisible();
    await expect(page.getByText('Energy Pipe')).toBeVisible();
    await expect(page.getByText('Gear Assembly')).toBeVisible();
    await expect(page.getByText('Rune Node')).toBeVisible();
    await expect(page.getByText('Shield Shell')).toBeVisible();
    await expect(page.getByText('Trigger Switch')).toBeVisible();
  });

  test('should add module to canvas when clicked', async ({ page }) => {
    // Click on Core Furnace in the panel
    await page.getByText('Core Furnace').click();
    
    // Module count should increase
    await expect(page.getByText(/Modules: 1/)).toBeVisible();
    
    // Add another module
    await page.getByText('Energy Pipe').click();
    await expect(page.getByText(/Modules: 2/)).toBeVisible();
  });

  test('should show properties panel', async ({ page }) => {
    await expect(page.getByText('PROPERTIES')).toBeVisible();
    await expect(page.getByText('Machine Overview')).toBeVisible();
  });

  test('should generate attributes for machine', async ({ page }) => {
    // Add a module
    await page.getByText('Core Furnace').click();
    
    // Properties panel should show generated name
    await expect(page.locator('text=/Unnamed Machine|Void|Solar|Lunar|Arcane|Ethereal/')).toBeVisible();
  });

  test('should switch to Codex view', async ({ page }) => {
    await page.getByRole('button', { name: 'Codex', exact: true }).click();
    await expect(page.getByText('Machine Codex')).toBeVisible();
    await expect(page.getByText('No Machines Recorded')).toBeVisible();
  });

  test('should save machine to Codex', async ({ page }) => {
    // Add a module
    await page.getByText('Core Furnace').click();
    
    // Click save to codex
    await page.getByRole('button', { name: /Save to Codex/ }).click();
    
    // Should show confirmation (alert)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('saved to the Codex');
      await dialog.accept();
    });
    
    // Switch to Codex
    await page.getByRole('button', { name: 'Codex', exact: true }).click();
    
    // Should show the saved machine
    await expect(page.getByText(/Modules: 1/)).toBeVisible();
  });

  test('should export SVG', async ({ page }) => {
    // Add a module
    await page.getByText('Core Furnace').click();
    
    // Open export modal
    await page.getByRole('button', { name: /Export/ }).click();
    
    // Should show export options
    await expect(page.getByText('Export Machine')).toBeVisible();
    await expect(page.getByText('SVG')).toBeVisible();
    await expect(page.getByText('PNG')).toBeVisible();
    await expect(page.getByText('Poster')).toBeVisible();
  });

  test('should show empty canvas message', async ({ page }) => {
    await expect(page.getByText('Drag modules from the left panel')).toBeVisible();
  });

  test('should hide empty canvas message after adding module', async ({ page }) => {
    await page.getByText('Core Furnace').click();
    await expect(page.getByText('Drag modules from the left panel')).not.toBeVisible();
  });

  test('should have working toolbar buttons', async ({ page }) => {
    // Add a module first
    await page.getByText('Core Furnace').click();
    
    // Undo button should be enabled (has modules in history)
    const undoButton = page.locator('button[title="Undo (Ctrl+Z)"]');
    await expect(undoButton).not.toBeDisabled();
  });

  test('should show grid toggle', async ({ page }) => {
    // Footer should show grid status
    await expect(page.getByText('Grid: ON')).toBeVisible();
  });
});
