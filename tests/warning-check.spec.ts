import { test, expect } from '@playwright/test';

test.describe('Console Warning Check', () => {
  test('should not have Maximum update depth exceeded warnings', async ({ page }) => {
    const warnings: string[] = [];
    
    // Capture console warnings
    page.on('console', msg => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for app to fully load
    
    // Filter for update depth warnings
    const updateDepthWarnings = warnings.filter(w => 
      w.includes('Maximum update depth exceeded')
    );
    
    console.log('Total warnings:', warnings.length);
    console.log('Update depth warnings:', updateDepthWarnings.length);
    
    // Log all warnings for debugging
    if (warnings.length > 0) {
      console.log('All warnings:');
      warnings.forEach(w => console.log(' -', w.substring(0, 200)));
    }
    
    expect(updateDepthWarnings).toHaveLength(0);
  });
});
