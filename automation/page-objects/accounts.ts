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
    deleteAccountBtn(name: string): Locator {
        return this.page.locator('#accountDiv' + name).locator('#deleteBtn');
    }
    editAccountBtn(name: string): Locator {
        return this.page.locator('#accountDiv' + name).locator('#editBtn');
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
        await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.newAccountAPI) && response.status() === 201 && response.request().method() === "POST", { timeout: 15000 });
        await expect(page.getByText(commonConstants.toastMessages.ACCOUNT_CREATED_SUCCESSFULLY)).toBeVisible();

        //verify if account is visible in grid
        await expect(this.page.locator('#accountDiv' + account.name)).toBeVisible();
    }
}