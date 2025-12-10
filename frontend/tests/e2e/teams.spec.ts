import { test, expect } from '@playwright/test';

test.describe('Team Management Flows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock Auth
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, username: 'testuser', email: 'test@example.com', role_id: 2 }),
      });
    });

    // Mock Login (simulate logged in)
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
    });
  });

  test('User can create a team', async ({ page }) => {
    // Mock Team Check (initially no team)
    await page.route('**/api/v1/teams/me', async route => {
      await route.fulfill({ status: 404 });
    });

    // Mock Create Team
    await page.route('**/api/v1/teams/', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, name: 'NewTeam', invite_code: 'CODE123' }),
        });
    });

    await page.goto('/team');
    
    // Should see create/join options
    await expect(page.getByRole('heading', { name: 'Create Team' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Join Team' })).toBeVisible();

    // Open Create Modal
    await page.getByRole('button', { name: 'Create Team' }).click();
    
    // Fill Create Form
    await page.getByPlaceholder('Enter your team name').fill('NewTeam');
    await page.getByPlaceholder('Create a secure team password').fill('teampass');
    await page.getByPlaceholder('Confirm team password').fill('teampass');
    
    // Mock 'me' to return the team after creation
    await page.route('**/api/v1/teams/me', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              id: 1, 
              name: 'NewTeam', 
              members: [{ username: 'testuser', score: 0, is_captain: true }],
              total_score: 0,
              solved_challenges: []
            }),
        });
    });

    const createBtn = page.locator('.modal-box').getByRole('button', { name: 'Create Team' });
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    // Check if modal closes (implies success)
    await expect(page.locator('.modal-box')).not.toBeVisible({ timeout: 5000 });

    // Verify success - should see team name header
    await expect(page.getByRole('heading', { name: 'NewTeam' })).toBeVisible();
  });

  test('User can join a team', async ({ page }) => {
    // Mock Team Check (initially no team)
    await page.route('**/api/v1/teams/me', async route => {
      await route.fulfill({ status: 404 });
    });

    // Mock Join Team
    await page.route('**/api/v1/teams/join', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/team');

    // Open Join Modal
    await page.getByRole('button', { name: 'Join Team' }).click();

    // Fill Join Form
    await page.getByPlaceholder('Enter the team name').fill('ExistingTeam');
    await page.getByPlaceholder('Enter the team password').fill('teampass');

    // Mock 'me' to return the team after joining
    await page.route('**/api/v1/teams/me', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              id: 2, 
              name: 'ExistingTeam', 
              members: [{ username: 'other', score: 100, is_captain: true }, { username: 'testuser', score: 0, is_captain: false }],
              total_score: 100,
              solved_challenges: []
            }),
        });
    });

    await page.locator('.modal-box').getByRole('button', { name: 'Join Team' }).click();

    // Verify success
    await expect(page.getByRole('heading', { name: 'ExistingTeam' })).toBeVisible();
  });
});
