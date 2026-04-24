import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

test.describe('Role-based Login Testing', () => {

  test('Admin Login Test', async ({ page }) => {
    // Navigate to admin login page
    await page.goto('http://localhost:5173/admin');

    // Wait for the admin email input to be visible
    await page.waitForSelector('#admin-email');

    // Fill in credentials
    await page.fill('#admin-email', process.env.VITE_ADMIN_EMAIL);
    await page.fill('#admin-password', process.env.VITE_ADMIN_PASSWORD);

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for dashboard to load. The dashboard should have an admin context
    // We check for URL containing /admin/dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/admin/dashboard');

    // Alternatively, verify that the dashboard title or a specific element is present
    await expect(page.locator('text=Admin Dashboard').first() || page.locator('text=Admin Portal').first()).toBeVisible({ timeout: 10000 });
  });

  test('Student Login Test', async ({ page }) => {
    // Navigate to standard login page
    await page.goto('http://localhost:5173/login');

    // Wait for the email input to be visible
    await page.waitForSelector('#email');

    // Fill in student credentials
    await page.fill('#email', process.env.VITE_STUDENT_EMAIL);
    await page.fill('#password', process.env.VITE_STUDENT_PASSWORD);

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard/student', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard/student');
  });

  test('Lecturer Login Test', async ({ page }) => {
    // Navigate to standard login page
    await page.goto('http://localhost:5173/login');

    // Wait for the email input to be visible
    await page.waitForSelector('#email');

    // Fill in lecturer credentials
    await page.fill('#email', process.env.VITE_LECTURER_EMAIL);
    await page.fill('#password', process.env.VITE_LECTURER_PASSWORD);

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard/lecturer', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard/lecturer');
  });

});
