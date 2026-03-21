import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';
import { generateRandomPrefix } from '../page-objects/common-functions.js';

test.describe('Login Related Tests', () => {

    test.skip('Create Account / Singup Functionality @BAT', async ({ loginPage }) => {
        const name = commonConstants.userName;
        const phone = commonConstants.userPhone;
        const password = commonConstants.userPassword;

        await loginPage.createAccount(name, phone, password);
    });

    test('Login functionality @BAT', async ({ loginPage }) => {
        await loginPage.loginUser();
    });

    test('Signout functionality @BAT', async ({ loginPage }) => {
        await loginPage.loginUser();
        await expect(loginPage.navbarUserName).toBeVisible();
        await expect(loginPage.logoutButton).toBeVisible();
        await loginPage.logoutButton.click();
        await expect(loginPage.phoneInputField).toBeVisible();
        await expect(loginPage.passwordInputField).toBeVisible();
        await expect(loginPage.loginButton).toBeVisible();
    });
});