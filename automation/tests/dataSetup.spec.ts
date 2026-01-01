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

    // test.skip('TC01 - Setup default categories', async ({ page, accountsPage }) => {

    //     const categories = [
    //         { name: "Bank Account", balance: "1000" },
    //         { name: "Cash", balance: "1000" },
    //         { name: "SIP", balance: "1000" },
    //         { name: "PPF", balance: "1000" }
    //     ];

    //     for (const category of categories) {
    //         await accountsPage.createAccount(page, category);
    //     }
    // });

    //create a feature to delete all accounts

});