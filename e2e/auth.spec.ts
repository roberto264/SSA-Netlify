import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('shows login page by default', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Swiss Solar Academy')).toBeVisible();
    await expect(page.locator('text=Anmelden')).toBeVisible();
  });

  test('can switch between login and register tabs', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Registrieren');
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('select#firma')).toBeVisible();
    await page.click('text=Anmelden');
    await expect(page.locator('input#name')).not.toBeVisible();
  });

  test('shows validation on empty login', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    // Browser native validation should prevent submission
    const emailInput = page.locator('input#email');
    await expect(emailInput).toBeFocused();
  });

  test('register form requires AGB acceptance', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Registrieren');
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('/login');
    await expect(page.locator('text=Swiss Solar Academy')).toBeVisible();
  });

  test('privacy page is accessible without login', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('text=Datenschutzerklärung')).toBeVisible();
  });

  test('terms page is accessible without login', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('text=Allgemeine Geschäftsbedingungen')).toBeVisible();
  });
});
