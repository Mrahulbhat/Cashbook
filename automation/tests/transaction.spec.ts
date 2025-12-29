import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import { waitForResponse } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Transaction Related Tests', () => {
    test('Transaction CRUD Operation @BAT @BUG', async ({ page, transactionPage, dashboardPage }) => {

        const type = 'Expense';
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

        //BUG01

        //page will be redirected to dashboard page after creation
        await expect(dashboardPage.totalExpense).toBeVisible();

        // Navigate back to Transactions Page to verify creation
        await navigateToPage(page, commonConstants.pageName.TRANSACTIONS);

        const postCreationTxnCountText = await transactionPage.txnCountOnTable.innerText();

        // Verify that transaction count has increased by 1
        expect(parseInt(postCreationTxnCountText)).toBe(parseInt(initialTxnCountText) + 1);

        // Verify if all details are correct in the latest transaction row
        const latestRow = page.locator('tr.tablebody').first();
        await expect(latestRow).toContainText(type.toLowerCase());
        await expect(latestRow).toContainText(categoryName);
        await expect(latestRow).toContainText(accountName);
        await expect(latestRow).toContainText(`₹${Number(amount).toLocaleString('en-IN')}`);
        await expect(latestRow).toContainText(description);
        const formattedDate = new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        await expect(latestRow).toContainText(formattedDate);

        //EDIT THE RECORD
        await transactionPage.editRecordButton.click();
        await Promise.all([
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.categoriesAPI) && response.status() === 304),
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.transactionAPI) && response.status() === 200)
        ]);

        const updated_type = 'Income';
        const updated_amount = '2000';
        const updated_accountName = 'Canara Bank';
        const updated_categoryName = 'Junk Food';
        const updated_date = '2025-12-30';
        const updated_description = 'TEST AUTOMATION - EDITED';

        await transactionPage.incomeRadioBox.click();
        await transactionPage.enterAmount(updated_amount);
        await transactionPage.selectAccount(updated_accountName);
        await transactionPage.selectCategory(updated_categoryName);
        await transactionPage.selectDate(updated_date);
        await transactionPage.inputFieldById('description').pressSequentially(updated_description);
        await expect(transactionPage.cancelButton).toBeVisible();
        await expect(transactionPage.saveButton).toBeEnabled();
        await transactionPage.saveButton.click();


    });

    
});