import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

test.describe('Full Site Journey & Component Interconnectivity', () => {

  test('Student Journey: Dashboard to Chat & Resources', async ({ page }) => {
    // 1. Authentication
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', process.env.VITE_STUDENT_EMAIL);
    await page.fill('#password', process.env.VITE_STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/student');

    const clickNav = async (label) => {
        await page.locator(`button:visible:has-text("${label}")`).first().click();
    };

    // 2. Navigate to Study Circles
    await clickNav('Study Circles');
    await expect(page.locator('text=Discover Public Circles').first()).toBeVisible({ timeout: 10000 });
    
    // 3. Navigate to Resources
    await clickNav('Resources');
    await expect(page.locator('text=Resources Library').first()).toBeVisible({ timeout: 10000 });

    // 4. Navigate to Progress
    await clickNav('Progress');
    await expect(page.locator('text=Student Progress').first()).toBeVisible({ timeout: 10000 });
  });

  test('Lecturer Journey: Analytics & Management', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', process.env.VITE_LECTURER_EMAIL);
    await page.fill('#password', process.env.VITE_LECTURER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/lecturer');

    const clickNav = async (label) => {
         await page.locator(`button:visible:has-text("${label}")`).first().click();
    };

    // Check Analytics
    await clickNav('Student Analytics');
    await expect(page.locator('text=Student Analytics Dashboard').first()).toBeVisible({ timeout: 10000 });
    
    // Check Resource Management
    await clickNav('Resource Library');
    await expect(page.locator('text=Upload Resource').first()).toBeVisible({ timeout: 10000 });
  });

  test('Admin Journey: System Moderation', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');
    await page.fill('#admin-email', process.env.VITE_ADMIN_EMAIL);
    await page.fill('#admin-password', process.env.VITE_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');

    const clickNav = async (label) => {
         await page.locator(`button:visible:has-text("${label}")`).first().click();
    };

    // Check User Management
    await clickNav('User Management');
    await expect(page.locator('text=User Management').first()).toBeVisible({ timeout: 10000 });

    // Check Circle Management
    await clickNav('Circle Management');
    await expect(page.locator('text=Circle Management').first()).toBeVisible({ timeout: 10000 });
  });

  test('Responsive Navigation: Mobile Experience', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', process.env.VITE_STUDENT_EMAIL);
    await page.fill('#password', process.env.VITE_STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/student');
    
    // Open menu
    await page.locator('button[aria-label="Open menu"]').click();
    
    // Mobile menu should be visible
    await expect(page.locator('button:visible:has-text("Resources")').first()).toBeVisible({ timeout: 10000 });
  });

});
