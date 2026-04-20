import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Statistics Dashboard Tests', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.loginUser();
    });

    test('TC05 - Verify Statistics Summary Cards and Filters', async ({ page, statisticsPage }) => {
        await navigateToPage(page, commonConstants.pageName.STATISTICS);

        // 1. Verify page container
        await expect(statisticsPage.statsContainer).toBeVisible();

        // 2. Verify summary cards are visible (they might show 0 or actual values depending on data)
        await expect(statisticsPage.incomeCard).toBeVisible();
        await expect(statisticsPage.expenseCard).toBeVisible();
        await expect(statisticsPage.savingsCard).toBeVisible();

        // 3. Test Filter switching
        await statisticsPage.selectFilter('yearly');
        // Small wait for charts to re-render if necessary, though networkidle handles it
        await expect(page.locator('#FilterBtn-yearly')).toHaveClass(/bg-gradient-to-r/);

        await statisticsPage.selectFilter('lifetime');
        await expect(page.locator('#FilterBtn-lifetime')).toHaveClass(/bg-gradient-to-r/);

        await statisticsPage.selectFilter('comparison');
        await expect(statisticsPage.page.locator('h2', { hasText: 'Multi-Month Growth' })).toBeVisible();
    });
});
