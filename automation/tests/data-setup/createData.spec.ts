import { test } from '../../fixtures/test-base.js';
import { expect } from '@playwright/test';
import commonConstants from '../../constants/commonConstants.js';

//CAUTION : THIS IS FOR DATA SETUP
//ONLY FOR TESTING

test.describe.serial('Create Data Setup', () => {

    // create default accounts
    test('Setup default accounts @TEST', async ({ page, accountsPage }) => {
        await page.goto(commonConstants.urls.baseURL);
        const accounts = commonConstants.ACCOUNTS;

        for (const account of accounts) {
            await accountsPage.createAccount(page, account);
        }
    });

    // create default categories
    test('Setup default categories @TEST', async ({ page, categoryPage, loginPage }) => {
        await loginPage.loginUser();
        const categories = commonConstants.CATEGORIES;

        for (const category of categories) {
            await categoryPage.createCategory(page, category);
        }

        await expect(categoryPage.totalCategoryCount).toHaveText(String(categories.length));
    });

    // create default transactions
    test('Setup default transactions @TEST', async ({ page, transactionPage, loginPage }) => {
        await loginPage.loginUser();
        const transactions = commonConstants.TRANSACTIONS;

        for (const transaction of transactions) {
            await transactionPage.createTransaction(page, transaction);
        }
    });
});