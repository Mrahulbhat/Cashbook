import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToLoginPage } from '../page-objects/common-functions.js';

test.describe('Cashbook Application Basic Tests', () => {

    test.beforeEach(async ({ page }) => {
        await navigateToLoginPage(page);
    });

    test('TC01 - Does the application start @BAT', async ({ page, basePage, dashboardPage }) => {
        //Check if the welcome page loads, click on get Started button and verify navigation to login page
        //check if the frontend gets connected to backend

        await expect(page.locator('getStarted')).toBeVisible();
        await page.locator('getStarted').click();

        // wait for last url to load which confirms page is loaded with data from backend
        await page.waitForResponse(response =>
            response.url().includes('/api/account') && response.status() === 200
        );

        await expect(dashboardPage.totalExpense).toBeVisible();
        const totalExpense = await dashboardPage.totalExpense.textContent();
        expect(totalExpense).toBeGreaterThan(0);
    });
});