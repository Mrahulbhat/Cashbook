import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Cashbook Application Basic Tests', () => {

    test.beforeEach(async ({ page }) => {
        await navigateToPage(page, commonConstants.baseURL);
    });

    test('TC01 - Does the application start @BAT', async ({ page, basePage, dashboardPage }) => {

        //Check if the welcome page loads, click on get Started button and verify navigation to login page
        //check if the frontend gets connected to backend

        await expect(page.locator('#getStarted')).toBeVisible();
        await page.locator('#getStarted').click();

        // wait for last url to load which confirms page is loaded with data from backend
        await page.waitForResponse(response =>
            response.url().includes('/api/account') && response.status() === 200
        );

        //check if expense value is greater than zero which indicates data is loaded from backend
        await expect(dashboardPage.totalExpense).toBeVisible();
        const totalExpenseText = await dashboardPage.totalExpense.textContent() || "";
        const totalExpenseValue = Number(totalExpenseText.replace(/[₹,]/g, '').trim());
        expect(totalExpenseValue).toBeGreaterThan(0);
    });

    test('TC02 - Verify Sidebar Functionality @BAT', async ({ page, dashboardPage }) => {
        const tabs = [ "dashboard", "transactions", "accounts", "transfer", "categories", "statistics" ];

        await expect(dashboardPage.sidebar).toBeVisible();

        for (const tab of tabs) {
            const tabLocator = dashboardPage.sidebar.locator(`a[href*='${tab}']`);
            await expect(tabLocator).toBeVisible();
            await tabLocator.click();
            await expect(page).toHaveURL(new RegExp(`${tab}$`));
        }
    });
});