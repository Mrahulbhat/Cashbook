import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Account Related Tests', () => {
    const account = { name: "TEST", balance: '1000' };

    test('Create Account @BAT @ACCOUNT', async ({ page, accountsPage }) => {

        // create a account
        await accountsPage.createAccount(page, account);

        //Create again with same name; expected to fail with message record already exists!

        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);

        await expect(accountsPage.addAccountBtn).toBeVisible();
        await accountsPage.addAccountBtn.click();
        await accountsPage.inputFieldById('accountName').fill(account.name);
        await accountsPage.inputFieldById('balance').fill(account.balance);
        await accountsPage.saveButton.click();

        //get status code 400 saying record name already exists
        await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.newAccountAPI) && response.status() === 400 && response.request().method() === "POST", { timeout: 15000 });
        await expect(page.getByText(commonConstants.toastMessages.ACCOUNT_ALREADY_EXISTS)).toBeVisible();
    });

    test('Update Account @BAT @ACCOUNT', async ({ page, accountsPage }) => {

        // update the account created
        await accountsPage.updateAccount(page, account.name, account.name + "_Edited");

        // update with both name and balance
        await accountsPage.updateAccount(page, account.name + "_Edited", account.name + "_Updated", "500");

        // reset it back
        await accountsPage.updateAccount(page, account.name + "_Updated", account.name, account.balance);
    });

    test('Delete Account @BAT @ACCOUNT', async ({ page, accountsPage }) => {

        // delete the account created
        await accountsPage.deleteAccount(page, account.name);
    });

});