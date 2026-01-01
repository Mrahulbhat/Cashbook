import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import { waitForResponse } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Data Setup', () => {

    //CAUTION : THIS IS FOR DATA SETUP
    //ONLY FOR TESTING
    test('TC01 - Setup default accounts @TEST', async ({ page, accountsPage }) => {

        const accounts = [{ name: "CANARA_BANK", balance: "1000" }, { name: "Cash", balance: "1000" }, { name: "SIP", balance: "1000" }, { name: "PPF", balance: "1000" }];

        for (const account of accounts) {
            await accountsPage.createAccount(page, account);
        }
    });

    test('Delete all accounts in DB @TEST', async ({ page, accountsPage }) => {
        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);
        await expect(accountsPage.addAccountBtn).toBeVisible();
        await accountsPage.deleteAllAccounts(page);
    });

    test('TC01 - Setup default categories @TEST', async ({ page, categoryPage }) => {

        const categories = [
            { name: "CANARA_BANK", type: "expense", parentCategory:"Needs",budget:"1000"},
            { name: "Cash", type: "expense", parentCategory:"Wants",budget:"1000"},
            { name: "CANARA_BANK", type: "expense", parentCategory:"Savings/Investment",budget:"1000"},
            { name: "Cash", type: "income", parentCategory:"Income"},
            { name: "CANARA_BANK", type: "expense", parentCategory:"TEST",budget:"1000"},
        ];

        for (const category of categories) {
            await categoryPage.createCategory(page, category);
        }
    });

    //create a feature to delete all accounts and categories

});