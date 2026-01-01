import { test } from '../../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../../page-objects/common-functions.js';
import { waitForResponse } from '../../page-objects/common-functions.js';
import commonConstants from '../../constants/commonConstants.js';

//CAUTION : THIS IS FOR DATA SETUP
//ONLY FOR TESTING

test.describe('Data Setup', () => {

    // delete all accounts
    test('Delete all accounts in DB @TEST', async ({ page, accountsPage }) => {
        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);
        await expect(accountsPage.addAccountBtn).toBeVisible();
        await accountsPage.deleteAllAccounts(page);
    });

    // delete all categories in DB
    test('Delete all categories in DB @TEST', async ({ page, categoryPage }) => {
        await navigateToPage(page, commonConstants.pageName.CATEGORIES);
        await expect(categoryPage.addCategoryBtn).toBeVisible();
        await categoryPage.deleteAllCategories(page);
    });
});