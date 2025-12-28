import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import { waitForResponse } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Cashbook Application Basic Tests', () => {
    test('Transaction CRUD Operation', async ({ page, transactionPage }) => {

        // Navigate to Dashboard Page
        await navigateToPage(page, commonConstants.pageName.DASHBOARD);

        // Navigate to Transactions Page
        await navigateToPage(page, commonConstants.pageName.TRANSACTIONS);
        await expect(transactionPage.backButton).toBeVisible();

        await expect(transactionPage.addTransactionBtn).toBeVisible();
        await transactionPage.addTransactionBtn.click();
        await waitForResponse(page, commonConstants.urls.categoriesAPI);

        await expect(transactionPage.addTransactionForm).toBeVisible();

        await expect(transactionPage.incomeRadioBox).toBeVisible();
        await expect(transactionPage.expenseRadioBox).toBeVisible();
        
        await expect(transactionPage.incomeRadioBox).toBeChecked();

    });
});