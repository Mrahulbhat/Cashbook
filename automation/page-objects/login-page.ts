import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basepage';
import commonConstants from '../constants/commonConstants';
import { waitForApiResponse } from './common-functions';

export class LoginPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get emailInputField(): Locator {
        return this.page.locator('#emailInputField');
    }
    get passwordInputField(): Locator {
        return this.page.locator('#passwordInputField');
    }
    get rememberMeCheckbox(): Locator {
        return this.page.locator('#rememberMeCheckbox');
    }
    get loginButton(): Locator {
        return this.page.locator('#loginButton');
    }
    get googleLoginButton(): Locator {
        return this.page.locator('#googleLoginButton');
    }

    async loginUser() {
        await this.page.goto(commonConstants.urls.baseURL);
        await this.emailInputField.clear();
        await this.emailInputField.pressSequentially(commonConstants.userEmail);
        await this.passwordInputField.clear();
        await this.passwordInputField.pressSequentially(commonConstants.userPassword);

        await this.rememberMeCheckbox.check();
        await expect(this.rememberMeCheckbox).toBeChecked();

        await this.loginButton.click();
        await waitForApiResponse(this.page, commonConstants.urls.loginApi);

        await expect(this.page).toHaveURL(commonConstants.urls.baseURL + 'dashboard');

        
    }


}