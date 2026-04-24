import { test, expect, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

test.describe('Dashboard Component Content Verification', () => {

  test('Student Dashboard - Inner Components Check', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', process.env.VITE_STUDENT_EMAIL);
    await page.fill('#password', process.env.VITE_STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/student');

    const navigateTo = async (label) => {
        await page.locator(`nav button:has-text("${label}")`).first().click();
    };

    // 2. Dashboard Overview
    await expect(page.locator('text=Dashboard Overview').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Joined Circles').first()).toBeVisible();

    // 3. Study Circles
    await navigateTo('Study Circles');
    await expect(page.locator('text=Discover Public Circles').first()).toBeVisible({ timeout: 15000 });

    // 4. Resources
    await navigateTo('Resources');
    await expect(page.locator('text=Resources Library').first()).toBeVisible({ timeout: 15000 });

    // 5. Progress
    await navigateTo('Progress');
    await expect(page.locator('text=Student Progress').first()).toBeVisible({ timeout: 15000 });
  });

  test('Lecturer Dashboard - Inner Components Check', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', process.env.VITE_LECTURER_EMAIL);
    await page.fill('#password', process.env.VITE_LECTURER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/lecturer');

    const navigateTo = async (label) => {
        await page.locator(`nav button:has-text("${label}")`).first().click();
    };

    // 2. Dashboard Overview
    await expect(page.locator('text=Dashboard Overview').first()).toBeVisible({ timeout: 15000 });

    // 3. Student Analytics
    await navigateTo('Student Analytics');
    await expect(page.locator('text=Student Analytics Dashboard').first()).toBeVisible({ timeout: 15000 });

    // 4. Resource Library
    await navigateTo('Resource Library');
    await expect(page.locator('text=Upload Resource').first()).toBeVisible({ timeout: 15000 });
  });

  test('Admin Dashboard - Inner Components Check', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:5173/admin');
    await page.fill('#admin-email', process.env.VITE_ADMIN_EMAIL);
    await page.fill('#admin-password', process.env.VITE_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');

    const navigateTo = async (label) => {
        await page.locator(`nav button:has-text("${label}")`).first().click();
    };

    // 2. System Overview
    await expect(page.locator('text=System Overview').first()).toBeVisible({ timeout: 15000 });

    // 3. User Management
    await navigateTo('User Management');
    await expect(page.locator('text=User Management').first()).toBeVisible({ timeout: 15000 });

    // 4. Circle Management
    await navigateTo('Circle Management');
    await expect(page.locator('text=Circle Management').first()).toBeVisible({ timeout: 15000 });
  });

});
