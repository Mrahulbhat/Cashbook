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

    get phoneInputField(): Locator {
        return this.page.locator('#PhoneInput');
    }
    get passwordInputField(): Locator {
        return this.page.locator('#PasswordInput');
    }
    get confirmPasswordInputField(): Locator {
        return this.page.locator('#ConfirmPasswordInput');
    }
    get rememberMeCheckbox(): Locator {
        return this.page.locator('#rememberMeCheckbox');
    }
    get loginButton(): Locator {
        return this.page.locator('#LoginBtn');
    }
    get googleLoginButton(): Locator {
        return this.page.locator('#GoogleLoginBtn');
    }
    get signupLink(): Locator {
        return this.page.locator('#SignupLink');
    }
    get nameInputField(): Locator {
        return this.page.locator('#NameInput');
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
        return this.page.locator('#SignupBtn');
    }

    async createAccount(name: string, email: string, password: string) {
        await this.page.goto(commonConstants.urls.baseURL);
        await this.signupLink.click();
        await expect(this.page).toHaveURL(commonConstants.urls.baseURL + '/signup');
        await expect(this.nameInputField).toBeVisible();
        await this.nameInputField.fill(name);
        await this.phoneInputField.fill(email);
        await this.passwordInputField.fill(password);
        await this.confirmPasswordInputField.fill(password);
        await this.signupButton.click();
        await waitForApiResponse(this.page, commonConstants.urls.transactionAPI);
        await expect(this.navbarUserName).toContainText(name);
    }

    async loginUser() {
        const userName = commonConstants.userName;
        await this.page.goto(commonConstants.urls.baseURL);
        await this.phoneInputField.clear();
        await this.phoneInputField.pressSequentially(commonConstants.userPhone);
        await this.passwordInputField.clear();
        await this.passwordInputField.pressSequentially(commonConstants.userPassword);
        await this.loginButton.click();
        await waitForApiResponse(this.page, commonConstants.urls.loginApi);
        await expect(this.page).toHaveURL(commonConstants.urls.baseURL + '/dashboard');
        await expect(this.navbarUserName).toBeVisible();
        await expect(this.navbarUserName).toContainText(userName);
    }


}