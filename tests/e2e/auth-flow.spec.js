const { test, expect } = require('@playwright/test');

test.describe('Auth Flow', () => {
    test('Login page loads correctly', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/GTE - Login/);
        await expect(page.getByText('Login with Twitch')).toBeVisible();
    });

    test('Redirects to Twitch for login', async ({ page }) => {
        await page.goto('/');
        const loginButton = page.getByText('Login with Twitch');

        // Intercept navigation or check href
        // Since we can't easily login to Twitch in automated test without credentials,
        // we verify the link or the redirection initiation.

        const href = await loginButton.getAttribute('href');
        expect(href).toContain('http://localhost:3001/auth/twitch');
    });
});
