import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import { waitForResponse } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

//CAUTION : THIS IS FOR DATA SETUP
//ONLY FOR TESTING

test.describe('Data Setup', () => {

    // create default accounts
    test('TC01 - Setup default accounts @TEST', async ({ page, accountsPage }) => {

        const accounts = [{ name: "CANARA_BANK", balance: "1000" }, { name: "Cash", balance: "1000" }, { name: "SIP", balance: "1000" }, { name: "PPF", balance: "1000" }];

        for (const account of accounts) {
            await accountsPage.createAccount(page, account);
        }
    });

    // delete all accounts
    test('Delete all accounts in DB @TEST', async ({ page, accountsPage }) => {
        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);
        await expect(accountsPage.addAccountBtn).toBeVisible();
        await accountsPage.deleteAllAccounts(page);
    });

    // create default categories
    test('TC01 - Setup default categories @TEST', async ({ page, categoryPage }) => {
        const categories = [
            { name: "Food", type: "expense", parentCategory: "Needs", budget: "1000" },
            { name: "Shopping", type: "expense", parentCategory: "Wants", budget: "1000" },
            { name: "SIP", type: "expense", parentCategory: "Savings/Investment", budget: "1000" },
            { name: "Salary", type: "income", parentCategory: "Income" },
            { name: "TEST", type: "expense", parentCategory: "TEST", budget: "1000" },
        ];

        for (const category of categories) {
            await categoryPage.createCategory(page, category);
        }
    });

    // delete all categories in DB
    test('Delete all categories in DB @TEST', async ({ page, categoryPage }) => {
        await navigateToPage(page, commonConstants.pageName.CATEGORIES);
        await expect(categoryPage.addCategoryBtn).toBeVisible();
        await categoryPage.deleteAllCategories(page);
    });

    //create a feature to delete all accounts and categories

});