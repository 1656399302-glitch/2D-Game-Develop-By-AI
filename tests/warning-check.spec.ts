import { test, expect } from '@playwright/test';

test.describe('Console Warning Check', () => {
  test('should have 0 Maximum update depth exceeded warnings', async ({ page }) => {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Listen for console messages
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'warning' && text.includes('Maximum update depth exceeded')) {
        warnings.push(text);
      }
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });

    // Navigate to the page
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for additional time to ensure all async operations complete
    await page.waitForTimeout(2000);

    // Check results
    console.log('=== Console Warning Check ===');
    console.log(`Total console errors: ${errors.length}`);
    console.log(`Total "Maximum update depth exceeded" warnings: ${warnings.length}`);

    if (warnings.length > 0) {
      console.log('\nWarning details:');
      warnings.forEach((w, i) => console.log(`${i + 1}. ${w}`));
    }

    // Assert: No "Maximum update depth exceeded" warnings
    expect(warnings.length).toBe(0);
  });

  test('should have 0 Maximum update depth exceeded warnings - run 2', async ({ page }) => {
    const warnings: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'warning' && text.includes('Maximum update depth exceeded')) {
        warnings.push(text);
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log(`=== Run 2: "Maximum update depth exceeded" warnings: ${warnings.length} ===`);
    expect(warnings.length).toBe(0);
  });

  test('should have 0 Maximum update depth exceeded warnings - run 3', async ({ page }) => {
    const warnings: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'warning' && text.includes('Maximum update depth exceeded')) {
        warnings.push(text);
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log(`=== Run 3: "Maximum update depth exceeded" warnings: ${warnings.length} ===`);
    expect(warnings.length).toBe(0);
  });
});
