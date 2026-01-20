import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basepage';
import { navigateToPage } from './common-functions';
import commonConstants from '../constants/commonConstants';

export class AccountsPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get addAccountBtn(): Locator {
        return this.page.locator('#addAccountBtn');
    }

    //add account form elements
    get accountNameInputField(): Locator {
        return this.page.locator('#accountNameInputField');
    }
    get balanceInputField(): Locator {
        return this.page.locator('#balanceInputField');
    }

    // edit account form elements
    get editAccNameInputField(): Locator {
        return this.page.locator('#editAccNameInputField');
    }
    get editBalanceInputField(): Locator {
        return this.page.locator('#editBalanceInputField');
    }

    //edit and delete account buttons in accounts tab grid
    get deleteAccBtn(): Locator {
        return this.page.locator('#deleteBtn');
    }
    get editAccBtn(): Locator {
        return this.page.locator('#editBtn');
    }
    deleteAccountBtn(name: string): Locator {
        return this.page.locator('#accountDiv' + name).locator('#deleteBtn');
    }
    editAccountBtn(name: string): Locator {
        return this.page.locator('#accountDiv' + name).locator('#editBtn');
    }

    //balance container
    get balanceContainer(): Locator {
        return this.page.locator('#balanceContainer');
    }
    //used to create a single account

    async createAccount(page: Page, account: { name: string; balance: string }) {
        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);
        await this.addAccountBtn.click();
        await page.waitForLoadState("networkidle");

        await expect(this.accountNameInputField).toBeVisible();
        await this.accountNameInputField.fill(account.name);

        await expect(this.balanceInputField).toBeVisible();
        await this.balanceInputField.fill(account.balance);

        await Promise.all([
            this.saveButton.click(),
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.newAccountAPI) &&
                response.status() === 201
                && response.request().method() === "POST", { timeout: 15000 }),
            expect(page.getByText(commonConstants.toastMessages.ACCOUNT_CREATED_SUCCESSFULLY)).toBeVisible(),
        ]);

        //verify if account is visible in grid
        await expect(this.page.locator('#accountDiv' + account.name)).toBeVisible();
    }

    async updateAccount(page: Page, accountName: string, name: string, balance?: string) {
        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);
        const targetAccount = this.page.locator('#accountDiv' + accountName).locator('#editBtn');
        await expect(targetAccount).toBeVisible();
        await targetAccount.click();

        await expect(this.editAccNameInputField).toBeVisible();
        await expect(this.editAccNameInputField).toHaveValue(accountName);
        await expect(this.editBalanceInputField).toBeVisible();
        await expect(this.editBalanceInputField).not.toHaveValue('');

        await this.editAccNameInputField.fill(name);
        if (balance) {
            await this.editBalanceInputField.fill(balance);
        }

        await this.saveButton.click();
        await expect(this.page.getByText(commonConstants.toastMessages.ACCOUNT_UPDATED_SUCCESSFULLY)).toBeVisible();
        await this.page.waitForLoadState('networkidle');
        await expect(this.page.locator('#accountDiv' + name)).toBeVisible();
    }

    async deleteAccount(page: Page, accountName: string) {
        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);
        const targetAccount = this.page.locator('#accountDiv' + accountName).locator('#deleteBtn');
        await expect(targetAccount).toBeVisible();
        await targetAccount.click();
        await this.modalOkBtn.click();
        await expect(this.page.getByText(commonConstants.toastMessages.ACCOUNT_DELETED_SUCCESSFULLY)).toBeVisible();
        await this.page.waitForLoadState('networkidle');

        await expect(targetAccount).toHaveCount(0);
    }

    async deleteAllAccounts(page: Page) {

        await expect(this.balanceContainer).toBeVisible(); //added this else count will be 0 before data loads hence test will pass without doing anything which is wrong

        let count = await this.deleteAccBtn.count();
        if (count === 0) return;

        while (await this.deleteAccBtn.count() > 0) {

            await this.deleteAccBtn.first().click();
            await this.modalOkBtn.click();

            const toast = this.page.getByText(commonConstants.toastMessages.ACCOUNT_DELETED_SUCCESSFULLY).last();

            await expect(toast).toBeVisible();
            await expect(toast).toBeHidden({ timeout: 10000 });

            await this.page.waitForLoadState('networkidle');
        }

        await expect(this.deleteAccBtn).toHaveCount(0);
        await expect(this.balanceContainer).not.toBeVisible();
    }

}