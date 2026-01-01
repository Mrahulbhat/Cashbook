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

        await this.saveButton.click();
        try {
            await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.newAccountAPI) && response.status() === 201 && response.request().method() === "POST", { timeout: 15000 });
            await expect(page.getByText(commonConstants.toastMessages.ACCOUNT_CREATED_SUCCESSFULLY)).toBeVisible();
        }
        catch {
            // maybe it failed as a account is existing with same name; lets delete all account and try
            await this.backButton.click();
            await this.deleteAllAccounts(this.page);
            await this.createAccount(page,account);
        }
        //verify if account is visible in grid
        await expect(this.page.locator('#accountDiv' + account.name)).toBeVisible();
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