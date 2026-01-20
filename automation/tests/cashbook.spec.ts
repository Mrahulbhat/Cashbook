import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Cashbook Application Basic Tests', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.loginUser();
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