import { test, expect } from '@playwright/test';

test.describe('User Profile Flows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock Auth
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, username: 'testuser', role: 'user' }),
      });
    });

    // Mock Login
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
    });
  });

  test('User can logout', async ({ page }) => {
    await page.goto('/');
    
    // Open User Dropdown
    await page.getByRole('button', { name: 'testuser' }).click();
    
    // Click Logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Verify Token Removal
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();

    // Verify Redirect to Login (or Home with Login button)
    // Navigation.tsx redirects to '/' after logout
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });
});
