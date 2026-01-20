import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Cashbook Application Basic Tests', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.loginUser();
    });

    test('TC01 - Does the application start @BAT', async ({ page, dashboardPage }) => {

        //Check if the welcome page loads, click on get Started button and verify navigation to login page
        //check if the frontend gets connected to backend

        await navigateToPage(page, commonConstants.urls.baseURL);

        await expect(page.locator('#getStarted')).toBeVisible();
        await page.locator('#getStarted').click();

        // wait for last url to load which confirms page is loaded with data from backend
        await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.accountsAPI) && response.status() === 200 || 304, { timeout: 15000 });

        //check if expense value is greater than zero which indicates data is loaded from backend
        await expect(dashboardPage.totalExpense).toBeVisible();
        const totalExpenseText = await dashboardPage.totalExpense.textContent() || "";
        const totalExpenseValue = Number(totalExpenseText.replace(/[₹,]/g, '').trim());
        expect(totalExpenseValue).toBeGreaterThan(0);
    });

    test('TC02 - Verify Sidebar Functionality @BAT', async ({ page, dashboardPage, transactionPage, accountsPage, categoryPage, transferPage, statisticsPage }) => {

        //check if sidebar is visible and all tabs are clickable and navigate to correct pages

        await navigateToPage(page, commonConstants.pageName.DASHBOARD);

        const tabs = [
            { tabname: "transactions", api: "transaction", locator: transactionPage.addTransactionBtn },
            { tabname: "accounts", api: "accounts", locator: accountsPage.addAccountBtn },
            { tabname: "transfer", api: "accounts", locator: transferPage.transferForm },
            { tabname: "categories", api: "categories", locator: categoryPage.addCategoryBtn },
            { tabname: "statistics", api: "categories", locator: statisticsPage.statsContainer },
            { tabname: "dashboard", api: "accounts", locator: dashboardPage.resultsTable },
        ];

        await expect(dashboardPage.sidebar).toBeVisible();

        for (const tab of tabs) {
            const tabLocator = dashboardPage.sidebarTab(tab.tabname);
            await expect(tabLocator).toBeVisible();
            await tabLocator.click();
            try {
                await page.waitForResponse((response: any) => response.url().includes(`/api/${tab.api}`) && response.status() === 200 || 304, { timeout: 15000 });
            }
            catch {
                console.log('Its okay if no response is found for transfer tab');
            }
            await expect(tab.locator).toBeVisible();
        }
    });
});