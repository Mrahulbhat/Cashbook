import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import { waitForResponse } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Account Related Tests', () => {
    test('Account CRUD operations @BAT @ACCOUNT', async ({ page, accountsPage, dashboardPage }) => {

        // Create a new account

        const accountName = "TEST";
        const initialBalance = "1000";

        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);

        await expect(accountsPage.addAccountBtn).toBeVisible();

        //check if any account exists; if yes delete it
        const recordExists = await accountsPage.deleteAccountBtn(accountName).isVisible({ timeout: 5000 });
        if (recordExists) {
            // await accountsPage.deleteAccountBtn(accountName).click();
            await page.pause();
            await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.accountsAPI) && response.status() === 200, { timeout: 15000 });
            await expect(page.getByText(commonConstants.toastMessages.ACCOUNT_DELETED_SUCCESSFULLY)).toBeVisible();
            await expect(accountsPage.deleteAccountBtn(accountName)).not.toBeVisible();
        }

        //create an account
        await accountsPage.addAccountBtn.click();

        await accountsPage.inputFieldById('accountName').fill(accountName);
        await accountsPage.inputFieldById('balance').fill(initialBalance);
        await accountsPage.saveButton.click();
        await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.newAccountAPI) && response.status() === 201 && response.request().method() === "POST", { timeout: 15000 });
        await expect(page.getByText(commonConstants.toastMessages.ACCOUNT_CREATED_SUCCESSFULLY)).toBeVisible();

        //Create again with same name; expected to fail with message record already exists!

        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);

        await expect(accountsPage.addAccountBtn).toBeVisible();
        await accountsPage.addAccountBtn.click();

        await accountsPage.inputFieldById('accountName').fill(accountName);
        await accountsPage.inputFieldById('balance').fill(initialBalance);
        await accountsPage.saveButton.click();

        //get status code 400 saying record name already exists
        await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.newAccountAPI) && response.status() === 400 && response.request().method() === "POST", { timeout: 15000 });
        await expect(page.getByText(commonConstants.toastMessages.ACCOUNT_ALREADY_EXISTS)).toBeVisible();

        //DELETE THE ACCOUNT CREATED

        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);
        await expect(accountsPage.addAccountBtn).toBeVisible();
        await accountsPage.deleteAccountBtn(accountName).click();
        await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.accountsAPI) && response.status() === 200, { timeout: 15000 });
        await expect(page.getByText(commonConstants.toastMessages.ACCOUNT_DELETED_SUCCESSFULLY)).toBeVisible();
        await expect(accountsPage.deleteAccountBtn(accountName)).not.toBeVisible();

    });
});