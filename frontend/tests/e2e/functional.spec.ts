import { test, expect } from '@playwright/test';

test.describe('Functional E2E Flows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, username: 'testuser', role: 'user' }),
      });
    });

    await page.route('**/api/v1/challenges/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Sanity Check',
            description: 'Welcome to the CTF',
            base_score: 100,
            difficulty_name: 'Easy',
            category_name: 'Misc',
            solve_count: 0,
            is_solved: false,
            operational_data: 'nc localhost 1337'
          }
        ]),
      });
    });

    await page.route('**/api/v1/challenges/categories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ name: 'Misc' }, { name: 'Web' }, { name: 'Crypto' }]),
      });
    });

    await page.route('**/api/v1/event/status*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'active', start_time: null, end_time: null }),
      });
    });
  });

  test('User can login and view challenges', async ({ page }) => {
    // Mock Login
    await page.route('**/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'fake-jwt-token', token_type: 'bearer' }),
      });
    });

    await page.goto('/login');
    
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /login/i }).click();

    // Should redirect to home (which might show challenges or dashboard)
    await expect(page).toHaveURL('/');
    
    // Should see the challenge (assuming home page lists challenges or redirects)
    // If home page is dashboard, we might need to navigate to challenges
    await page.goto('/challenges');
    await expect(page.getByText('Sanity Check')).toBeVisible();
    await expect(page.getByText('100')).toBeVisible();
  });

  test('User can submit a flag', async ({ page }) => {
    // Mock Login (simulate already logged in by setting token)
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
    });

    // Mock Submission
    await page.route('**/api/v1/submissions/submit', async route => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      if (postData.submitted_flag === 'flag{correct}') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            is_correct: true,
            score_awarded: 100,
            message: 'Correct!',
            status: 'correct',
            is_first_blood: false
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            is_correct: false,
            score_awarded: 0,
            message: 'Incorrect flag',
            status: 'incorrect',
            is_first_blood: false
          }),
        });
      }
    });

    // Mock Challenge Details/Files
    await page.route('**/api/v1/challenges/1/files', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
    });
    await page.route('**/api/v1/challenges/1', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify({ blocked_until: null }) });
    });

    await page.goto('/challenges');
    
    // Open Challenge Modal
    await page.getByText('Sanity Check').click();
    await expect(page.getByRole('heading', { name: 'Sanity Check' })).toBeVisible();

    // Submit Incorrect Flag
    await page.getByPlaceholder('flag{...}').fill('flag{wrong}');
    
    // Debug: Check if token exists in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('Token in localStorage:', token);

    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/v1/submissions/submit') && response.status() === 200
    );
    
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    
    // Check for client-side validation errors
    const errorMsg = await page.getByText('You must be logged in to submit flags').isVisible();
    if (errorMsg) console.log('Error: Not logged in');

    await responsePromise;
    
    await expect(page.getByText(/Incorrect flag/i)).toBeVisible();

    // Submit Correct Flag
    await page.getByPlaceholder('flag{...}').fill('flag{correct}');
    
    const successPromise = page.waitForResponse(response => 
      response.url().includes('/api/v1/submissions/submit') && response.status() === 200
    );

    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await successPromise;
    
    await expect(page.getByText(/Correct!/i)).toBeVisible();
  });
});
