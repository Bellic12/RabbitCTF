import { test, expect } from '@playwright/test';

test.describe('Scoreboard Flows', () => {
  
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

  test('User can view scoreboard', async ({ page }) => {
    // Mock Scoreboard Data
    await page.route('**/api/v1/scoreboard/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          teams: [
            { id: 1, name: 'AlphaTeam', totalScore: 1500, solves: 15, lastSolve: '2023-10-26T10:00:00Z', timeline: [] },
            { id: 2, name: 'BetaTeam', totalScore: 1200, solves: 12, lastSolve: '2023-10-26T11:00:00Z', timeline: [] },
            { id: 3, name: 'GammaTeam', totalScore: 800, solves: 8, lastSolve: '2023-10-26T12:00:00Z', timeline: [] },
          ]
        }),
      });
    });

    await page.goto('/leaderboard');
    
    // Verify Headers
    await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible();
    
    // Verify Team Names
    await expect(page.getByRole('link', { name: 'AlphaTeam' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'BetaTeam' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'GammaTeam' })).toBeVisible();

    // Verify Scores
    await expect(page.getByText('1500')).toBeVisible();
    await expect(page.getByText('1200')).toBeVisible();
  });
});
