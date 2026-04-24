import { test, expect } from '@playwright/test';

test.describe('Public & Generic Pages Testing', () => {

  test('Landing Page Sections', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.locator('text=The New Home for').first()).toBeVisible();
    await expect(page.locator('text=Serious Study Teams').first()).toBeVisible();
    await expect(page.locator('text=Start Learning Free').first()).toBeVisible();
  });

  test('Navbar Navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Check Log In link
    await page.locator('text=Log In').first().click();
    await expect(page).toHaveURL(/.*\/login/);
    
    // Go back to landing
    await page.goto('http://localhost:5173/');
    
    // Check Admin link
    await page.locator('text=Admin').first().click();
    await expect(page).toHaveURL(/.*\/admin/);
  });

  test('Footer Links Rendering', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Verify common footer links exist
    await expect(page.locator('text=Privacy Policy').first()).toBeVisible();
    await expect(page.locator('text=Terms of Service').first()).toBeVisible();
    await expect(page.locator('text=Blog').first()).toBeVisible();
    await expect(page.locator('text=Help Center').first()).toBeVisible();
  });

  test('Registration Rendering', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    await expect(page.locator('text=Create Account').first()).toBeVisible();
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Student")')).toBeVisible();
    await expect(page.locator('button:has-text("Lecturer")')).toBeVisible();
  });

  test('Interests Page Rendering', async ({ page }) => {
    await page.goto('http://localhost:5173/interests');
    await expect(page.locator('text=What sparks your interest?').first()).toBeVisible();
    await expect(page.locator('text=Computer Science').first()).toBeVisible();
    await expect(page.locator('text=Web Development').first()).toBeVisible();
  });

  test('Legal & Static Pages Rendering', async ({ page }) => {
    const pages = [
      { url: '/privacy', text: 'Privacy Policy' },
      { url: '/terms', text: 'Terms of Service' },
      { url: '/cookies', text: 'Cookie Policy' },
      { url: '/blog', text: 'Blog' },
      { url: '/community', text: 'Community' },
      { url: '/help', text: 'Help Center' },
      { url: '/study-guides', text: 'Study Guides' },
      { url: '/verify', text: 'Verify Your Email' }
    ];

    for (const p of pages) {
      await page.goto(`http://localhost:5173${p.url}`);
      await expect(page.locator(`text=${p.text}`).first()).toBeVisible({ timeout: 10000 });
    }
  });

});
