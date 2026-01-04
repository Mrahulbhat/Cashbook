import { test } from '../../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../../page-objects/common-functions.js';
import commonConstants from '../../constants/commonConstants.js';

//CAUTION : THIS IS FOR DATA SETUP
//ONLY FOR TESTING

test.describe.serial('Create Data Setup', () => {

    // create default accounts
    test('Setup default accounts @TEST', async ({ page, accountsPage }) => {

        const accounts = commonConstants.ACCOUNTS

        for (const account of accounts) {
            await accountsPage.createAccount(page, account);
        }
    });

    // create default categories
    test('Setup default categories @TEST', async ({ page, categoryPage }) => {
        const categories = commonConstants.CATEGORIES;

        for (const category of categories) {
            await categoryPage.createCategory(page, category);
        }

        await expect(categoryPage.totalCategoryCount).toHaveText(String(categories.length));
    });

    // create default transactions
    test('Setup default transactions @TEST', async ({ page, transactionPage }) => {
        const transactions = commonConstants.TRANSACTIONS;

        for (const transaction of transactions) {
            await transactionPage.createTransaction(page, transaction);
        }
    });
});