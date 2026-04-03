import { test } from '../fixtures/test-base.js';

test.describe('Transaction Related Tests', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.loginUser();
    });

    test.afterEach(async ({ settingsPage }) => {
        await settingsPage.wipeData();
    });

    test('Create a Transaction @BAT', async ({ page, transactionPage,accountsPage,categoryPage ,settingsPage}) => {
    
        // Create a Category
        const category = { name: "Food", type: "expense", parentCategory: "Needs", budget: "1000" };
        await categoryPage.createCategory(page, category);

        // Create an Account
        const account = { name: "CANARA_BANK", balance: "1000" };
        await accountsPage.createAccount(page, account);

        // Create a Transaction
        const transaction = { amount: "1000", type: "expense", accountName: "CANARA_BANK", categoryName: "Food", date: new Date().toISOString().split('T')[0], description: 'TEST AUTOMATION' };
        await transactionPage.createTransaction(page, transaction);

    });

    test('Transaction CRUD Operation @BAT @BUG', async ({ page, transactionPage, dashboardPage }) => {

        const transaction = { amount: "1000", type: "income", accountName: "CANARA_BANK", categoryName: "TEST1", date: '2025-12-29', description: 'TEST AUTOMATION' };

        await transactionPage.createTransaction(page, transaction);


        // EDIT THE RECORD===================================================================================

        await transactionPage.editTransaction(page, transaction);
    });
});