import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import { waitForResponse } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Account Related Tests', () => {
    test('Create an Account @BAT @ACCOUNT', async ({ page, accountsPage, dashboardPage }) => {

        const accountName = commonConstants.TEST_ACCOUNT_NAME
        const initialBalance = commonConstants.TEST_AMOUNT_1000;


        await navigateToPage(page,commonConstants.pageName.ACCOUNTS);

        await expect(accountsPage.addAccountBtn).toBeVisible();
        await accountsPage.addAccountBtn.click();

        await accountsPage.inputFieldById('accountName').clear();
        await accountsPage.inputFieldById('accountName').pressSequentially(accountName);
        await accountsPage.inputFieldById('balance').clear();
        await accountsPage.inputFieldById('balance').pressSequentially("1000");



    });
});