import commonConstants from '../constants/commonConstants.js';
import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';

test.describe('Transaction Related Tests', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.loginUser();
    });

    test.afterEach(async ({ settingsPage }) => {
        await settingsPage.wipeData();
    });

    test('Transaction CRUD Operations @BAT', async ({ page, transactionPage, accountsPage, categoryPage, settingsPage }) => {

        // Declare constants
        const category = { name: "Food", type: "expense", parentCategory: "Needs", budget: "1000" };
        const account = { name: "CANARA_BANK", balance: "1000" };
        const transaction = { amount: "1000", type: "expense", accountName: "CANARA_BANK", categoryName: "Food", date: new Date().toISOString().split('T')[0], description: 'TEST AUTOMATION' };


        const updatedCategory = { name: "Salary", type: "income", parentCategory: "Income" };
        const updatedAccount = { name: "Cash", balance: "2000" };
        const updatedTransaction = { amount: "2000", type: "income", accountName: "Cash", categoryName: "Salary", date: new Date().toISOString().split('T')[0], description: 'TEST AUTOMATION - EDITED' };


        // Create Category, Account and Transaction
        await categoryPage.createCategory(page, category);
        await categoryPage.createCategory(page, updatedCategory);
        await accountsPage.createAccount(page, account);
        await accountsPage.createAccount(page, updatedAccount);
        await transactionPage.createTransaction(page, transaction);

        // Edit a Transaction

        const initialTxnCountText = await transactionPage.recordCountOnTable.innerText();

        await transactionPage.editButton.first().click();
        await Promise.all([
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.transactionAPI) && response.status() === 200)
        ]);

        // assert default selection is expense
        await expect(transactionPage.expenseRadio).toBeChecked();

        await transactionPage.incomeRadio.click();
        await expect(transactionPage.incomeRadio).toBeChecked();
        await transactionPage.enterAmount(updatedTransaction.amount);
        await transactionPage.selectAccount(updatedTransaction.accountName);
        await transactionPage.selectCategory(updatedTransaction.categoryName);
        await transactionPage.selectDate(updatedTransaction.date);
        await transactionPage.descriptionInput.fill(updatedTransaction.description);
        await expect(transactionPage.cancelButton).toBeVisible();
        await expect(transactionPage.saveButton).toBeEnabled();
        await transactionPage.saveButton.click();

        await Promise.all([
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.transactionAPI) && response.status() === 200, { timeout: 15000 }),
            expect(page.getByText(commonConstants.toastMessages.TRANSACTION_UPDATED_SUCCESSFULLY)).toBeVisible()
        ]);

        // Verify if it stays on the same page and count remains the same
        await expect(transactionPage.addButton).toBeVisible();
        const postCreationTxnCountText = await transactionPage.recordCountOnTable.innerText();
        expect(parseInt(postCreationTxnCountText)).toBe(parseInt(initialTxnCountText));

        // Verify if all details are correct in the latest transaction row
        await expect(transactionPage.firstRowOfGrid).toContainText(updatedTransaction.type.toLowerCase());
        await expect(transactionPage.firstRowOfGrid).toContainText(updatedTransaction.categoryName);
        await expect(transactionPage.firstRowOfGrid).toContainText(updatedTransaction.accountName);
        await expect(transactionPage.firstRowOfGrid).toContainText(`₹${Number(updatedTransaction.amount).toLocaleString('en-IN')}`);
        
        // Match the actual UI date format (Short date)
        const expectedUIDate = new Date(updatedTransaction.date).toLocaleDateString();
        await expect(transactionPage.firstRowOfGrid).toContainText(expectedUIDate);

        // Delete Transaction
        await transactionPage.deleteAllTransactions(page);
    });

    /*
    1. Verify the display of records in the transaction grid
    2. Edit transaction functionality
    3. Delete transaction functionality
    4. Delete all transactions functionality
    5. Verify if account can be created from Transaction dropdown
    6. Verify if category can be created from Transaction dropdown
    */
});