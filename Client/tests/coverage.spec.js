import { test, expect } from '@playwright/test';

test.describe('Extended Component & Page Coverage', () => {

  test('Notification Dropdown - Interaction', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', 'it23343184@my.sliit.lk');
    await page.fill('#password', 'it23343184');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/student');

    // Click Notification Bell (aria-label="Notifications")
    const bellIcon = page.locator('button[aria-label="Notifications"]').first();
    await bellIcon.click();
    
    // Check if dropdown is visible
    await expect(page.locator('text=Notifications').first()).toBeVisible();
  });

  test('Verify Page - Rendering', async ({ page }) => {
    await page.goto('http://localhost:5173/verify');
    await expect(page.locator('text=Verify Your Email').first()).toBeVisible();
    await expect(page.locator('text=Resend Code').first()).toBeVisible();
  });

  test('Interests Page - Rendering', async ({ page }) => {
    await page.goto('http://localhost:5173/interests');
    await expect(page.locator('text=What sparks your interest?').first()).toBeVisible();
    await expect(page.locator('text=Skip for now').first()).toBeVisible();
  });

  test('Chat Page - Direct Navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', 'it23343184@my.sliit.lk');
    await page.fill('#password', 'it23343184');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/student');

    // Go to a circle chat manually
    await page.goto('http://localhost:5173/dashboard/student/circles/123/chat');
    // Check for "Back" button aria-label
    const backBtn = page.locator('button[aria-label="Back"]').first();
    await expect(backBtn).toBeVisible({ timeout: 10000 });
  });

  test('Resource Preview Page - Direct Navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', 'it23343184@my.sliit.lk');
    await page.fill('#password', 'it23343184');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/student');

    // Go to a resource preview manually
    await page.goto('http://localhost:5173/resources/preview/123');
    // Check for "Back to Dashboard" or similar in preview
    await expect(page.locator('button:has-text("Back")').first()).toBeVisible({ timeout: 10000 });
  });

});
