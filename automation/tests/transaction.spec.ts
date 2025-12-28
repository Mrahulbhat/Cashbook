import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import { waitForResponse } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Transaction Related Tests', () => {
    test('Transaction CRUD Operation @BAT', async ({ page, transactionPage, dashboardPage }) => {

        const amount = '1000';
        const accountName = 'Cash';
        const categoryName = 'Fuel';
        const date = '2025-12-29';
        const description = 'TEST AUTOMATION';

        // Navigate to Dashboard Page
        await navigateToPage(page, commonConstants.pageName.DASHBOARD);

        // Navigate to Transactions Page
        await navigateToPage(page, commonConstants.pageName.TRANSACTIONS);

        const initialTxnCountText = await transactionPage.txnCountOnTable.innerText();

        // Create a Transaction 
        await expect(transactionPage.addTransactionBtn).toBeVisible();
        await transactionPage.addTransactionBtn.click();
        await waitForResponse(page, commonConstants.urls.categoriesAPI);

        await expect(transactionPage.backButton).toBeVisible();
        await expect(transactionPage.addTransactionForm).toBeVisible();

        //click on save button with empty form to check validation
        await expect(transactionPage.saveButton).toBeDisabled();

        await expect(transactionPage.incomeRadioBox).toBeVisible();
        await expect(transactionPage.expenseRadioBox).toBeVisible();

        // assert default selection is expense
        await expect(transactionPage.expenseRadioBox).toBeChecked();

        await transactionPage.enterAmount(amount);
        await transactionPage.selectAccount(accountName);
        await transactionPage.selectCategory(categoryName);
        await transactionPage.selectDate(date);
        await transactionPage.inputFieldById('description').pressSequentially(description);

        await expect(transactionPage.cancelButton).toBeVisible();
        await expect(transactionPage.saveButton).toBeEnabled();
        await transactionPage.saveButton.click();

        await Promise.all([
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.newTransactionAPI) && response.status() === 201, { timeout: 15000 }),
            expect(page.getByText(commonConstants.toastMessages.TRANSACTION_ADDED_SUCCESSFULLY)).toBeVisible()
        ]);

        //page will be redirected to dashboard page after creation
        await expect(dashboardPage.totalExpense).toBeVisible();

        // Navigate back to Transactions Page to verify creation
        await navigateToPage(page, commonConstants.pageName.TRANSACTIONS);

        const postCreationTxnCountText = await transactionPage.txnCountOnTable.innerText();
        expect(parseInt(postCreationTxnCountText)).toBe(parseInt(initialTxnCountText) + 1);

    });

    test('dummy test', async ({ page, transactionPage, dashboardPage }) => {
        await navigateToPage(page, commonConstants.pageName.DASHBOARD);
        await navigateToPage(page, commonConstants.pageName.TRANSACTIONS);
        await expect(transactionPage.addTransactionBtn).toBeVisible();

        const rowText = await page.locator('tr.tablebody').first().innerText();
console.log(rowText);

    });
});