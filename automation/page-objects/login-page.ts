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
    get confirmPasswordInputField(): Locator {
        return this.page.locator('#confirmPasswordInputField');
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
    get signupLink(): Locator {
        return this.page.locator('#signupLink');
    }
    get nameInputField(): Locator {
        return this.page.locator('#nameInputField');
    }
    get togglePasswordVisibilityButton(): Locator {
        return this.page.locator('#togglePasswordVisibilityButton');
    }
    get toggleConfirmPasswordVisibilityButton(): Locator {
        return this.page.locator('#toggleConfirmPasswordVisibilityButton');
    }
    get termsConditionsCheckbox(): Locator {
        return this.page.locator('#termsConditionsCheckbox');
    }
    get signupButton(): Locator {
        return this.page.locator('#signupButton');
    }

    async createAccount(name: string, email: string, password: string) {
        await this.page.goto(commonConstants.urls.baseURL);
        await this.signupLink.click();
        await expect(this.page).toHaveURL(commonConstants.urls.baseURL + 'signup');
        await expect(this.nameInputField).toBeVisible();
        await this.nameInputField.fill(name);
        await this.emailInputField.fill(email);
        await this.passwordInputField.fill(password);
        await this.confirmPasswordInputField.fill(password);
        await this.termsConditionsCheckbox.check();
        await expect(this.termsConditionsCheckbox).toBeChecked();
        await this.signupButton.click();
        await waitForApiResponse(this.page, commonConstants.urls.transactionAPI);
        await expect(this.navbarUserName).toContainText(name);
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
        await expect(this.navbarUserName).toBeVisible();
        await expect(this.navbarUserName).toContainText('test_name');
    }


}