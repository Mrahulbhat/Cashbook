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
        return this.page.locator('#AddBtn');
    }

    //add account form elements
    get accountNameInputField(): Locator {
        return this.page.locator('#NameInput');
    }
    get balanceInputField(): Locator {
        return this.page.locator('#BalanceInput');
    }

    // edit account form elements
    get editAccNameInputField(): Locator {
        return this.page.locator('#NameInput');
    }
    get editBalanceInputField(): Locator {
        return this.page.locator('#BalanceInput');
    }

    //edit and delete account buttons in accounts tab grid
    get deleteAccBtn(): Locator {
        return this.page.locator('#DeleteBtn');
    }
    get editAccBtn(): Locator {
        return this.page.locator('#EditBtn');
    }
    deleteAccountBtn(name: string): Locator {
        const slug = name.replace(/\s+/g, '-').toLowerCase();
        return this.page.locator(`#accountCard-${slug}`).locator('#DeleteBtn');
    }
    editAccountBtn(name: string): Locator {
        const slug = name.replace(/\s+/g, '-').toLowerCase();
        return this.page.locator(`#accountCard-${slug}`).locator('#EditBtn');
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
        const slug = account.name.replace(/\s+/g, '-').toLowerCase();
        await expect(this.page.locator(`#accountCard-${slug}`)).toBeVisible();
    }

    async updateAccount(page: Page, accountName: string, name: string, balance?: string) {
        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);
        const slug = accountName.replace(/\s+/g, '-').toLowerCase();
        const targetAccount = this.page.locator(`#accountCard-${slug}`).locator('#EditBtn');
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
        const newSlug = name.replace(/\s+/g, '-').toLowerCase();
        await expect(this.page.locator(`#accountCard-${newSlug}`)).toBeVisible();
    }

    async deleteAccount(page: Page, accountName: string) {
        await navigateToPage(page, commonConstants.pageName.ACCOUNTS);
        const slug = accountName.replace(/\s+/g, '-').toLowerCase();
        const targetAccount = this.page.locator(`#accountCard-${slug}`).locator('#DeleteBtn');
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