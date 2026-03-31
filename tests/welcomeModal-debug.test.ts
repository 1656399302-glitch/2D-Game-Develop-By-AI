/**
 * Debug test for WelcomeModal - check with production build
 */

import { test, expect, Page } from '@playwright/test';

test.describe('WelcomeModal Debug', () => {
  test('Check with production build', async ({ page }) => {
    // Set viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Clear storage first
    await page.goto('http://localhost:4173');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Reload
    await page.reload();
    
    // Wait for hydration - check at various intervals
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(500);
      const state = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return {
          time: Date.now(),
          dialogExists: !!dialog,
          localStorageKeys: Object.keys(localStorage)
        };
      });
      console.log(`Check ${i+1}:`, JSON.stringify(state));
      
      if (state.dialogExists) {
        console.log('Dialog found!');
        break;
      }
    }
    
    // Check final state
    const finalState = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const closeBtn = document.querySelector('[aria-label="关闭欢迎弹窗"]');
      return {
        dialogExists: !!dialog,
        closeBtnExists: !!closeBtn,
        dialogHTML: dialog?.outerHTML?.substring(0, 500)
      };
    });
    console.log('Final state:', JSON.stringify(finalState, null, 2));
  });
});
