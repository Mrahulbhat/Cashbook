import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import { waitForResponse } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Transaction Related Tests', () => {
    test('Transaction CRUD Operation @BAT', async ({ page, transactionPage }) => {

        // Navigate to Dashboard Page
        await navigateToPage(page, commonConstants.pageName.DASHBOARD);

        // Navigate to Transactions Page
        await navigateToPage(page, commonConstants.pageName.TRANSACTIONS);

        // Create a Transaction 
        await expect(transactionPage.addTransactionBtn).toBeVisible();
        await transactionPage.addTransactionBtn.click();
        await waitForResponse(page, commonConstants.urls.categoriesAPI);

        await expect(transactionPage.backButton).toBeVisible();
        await expect(transactionPage.addTransactionForm).toBeVisible();

        await expect(transactionPage.incomeRadioBox).toBeVisible();
        await expect(transactionPage.expenseRadioBox).toBeVisible();

        // assert default selection is expense
        await expect(transactionPage.expenseRadioBox).toBeChecked();

        await transactionPage.enterAmount('1000');

        await transactionPage.selectAccount('Cash');

        await transactionPage.selectCategory('Food & Dining');


    });
});