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

        //==========================BUG01=================================================

        //page will be redirected to dashboard page after creation
        await expect(dashboardPage.totalExpense).toBeVisible();

        // // Verify if it stays in Transactions page after creation
        // await expect(transactionPage.addTransactionForm).toBeVisible();

        //==========================BUG01=================================================

        // Navigate back to Transactions Page to verify creation
        await navigateToPage(page, commonConstants.pageName.TRANSACTIONS);

        const postCreationTxnCountText = await transactionPage.txnCountOnTable.innerText();

        // Verify that transaction count has increased by 1
        expect(parseInt(postCreationTxnCountText)).toBe(parseInt(initialTxnCountText) + 1);

        // Verify if all details are correct in the latest transaction row
        await expect(transactionPage.firstRowOfGrid).toContainText(type.toLowerCase());
        await expect(transactionPage.firstRowOfGrid).toContainText(categoryName);
        await expect(transactionPage.firstRowOfGrid).toContainText(accountName);
        await expect(transactionPage.firstRowOfGrid).toContainText(`₹${Number(amount).toLocaleString('en-IN')}`);
        await expect(transactionPage.firstRowOfGrid).toContainText(description);
        const formattedDate = new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        await expect(transactionPage.firstRowOfGrid).toContainText(formattedDate);

        // EDIT THE RECORD===================================================================================

        await transactionPage.editRecordButton.click();
        await Promise.all([
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.categoriesAPI) && response.status() === 304),
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.transactionAPI) && response.status() === 200)
        ]);

        const updated_type = 'Income';
        const updated_amount = '2000';
        const updated_accountName = 'Canara Bank';
        const updated_categoryName = 'Salary';
        const updated_date = '2025-12-30';
        const updated_description = 'TEST AUTOMATION - EDITED';

        //click on save button with empty form to check validation
        await expect(transactionPage.updateButton).toBeDisabled();

        // assert default selection is expense
        await expect(transactionPage.expenseRadioBox).toBeChecked();

        await transactionPage.incomeRadioBox.click();
        await transactionPage.enterAmount(updated_amount);
        await transactionPage.selectAccount(updated_accountName);
        await transactionPage.selectCategory(updated_categoryName);
        await transactionPage.selectDate(updated_date);
        await transactionPage.inputFieldById('description').pressSequentially(updated_description);
        await expect(transactionPage.cancelButton).toBeVisible();
        await expect(transactionPage.updateButton).toBeEnabled();
        await transactionPage.updateButton.click();

        await Promise.all([
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.transactionAPI) && response.status() === 200, { timeout: 15000 }),
            expect(page.getByText(commonConstants.toastMessages.TRANSACTION_UPDATED_SUCCESSFULLY)).toBeVisible()
        ]);

        // Verify if it stays on the same page and count remains the same
        await expect(transactionPage.addTransactionBtn).toBeVisible();
        await expect(transactionPage.txnCountOnTable).toHaveText(postCreationTxnCountText);

        // Verify if all details are correct in the latest transaction row
        await expect(transactionPage.firstRowOfGrid).toContainText(updated_type.toLowerCase());
        await expect(transactionPage.firstRowOfGrid).toContainText(updated_categoryName);
        await expect(transactionPage.firstRowOfGrid).toContainText(updated_accountName);
        await expect(transactionPage.firstRowOfGrid).toContainText(`₹${Number(updated_amount).toLocaleString('en-IN')}`);
        await expect(transactionPage.firstRowOfGrid).toContainText(updated_description);
        const formattedDate1 = new Date(updated_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        await expect(transactionPage.firstRowOfGrid).toContainText(formattedDate1);

    });


});