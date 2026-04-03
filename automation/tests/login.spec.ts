import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';
import { waitForApiResponse } from '../page-objects/common-functions.js';

test.describe('Login Related Tests', () => {

    test('Create Account and login functionality @BAT', async ({ page, loginPage }) => {

        const name = 'TEST_CREATE_USERNAME';
        const phone = '9876543211';
        const password = commonConstants.userPassword;

        await navigateToPage(page, commonConstants.urls.baseURL);
        await expect(loginPage.signupLink).toBeVisible();
        await loginPage.signupLink.click();
        await expect(page).toHaveURL(commonConstants.urls.baseURL + '/signup');

        // Fill the signup form
        await expect(loginPage.nameInputField).toBeVisible();
        await loginPage.nameInputField.fill(name);
        await loginPage.phoneInputField.fill(phone);
        await loginPage.passwordInputField.fill(password);
        await loginPage.confirmPasswordInputField.fill(password);
        await loginPage.signupButton.click();

        await waitForApiResponse(page, commonConstants.urls.transactionAPI);
        await expect(loginPage.navbarUserName).toContainText(name);
        await expect(loginPage.logoutButton).toBeVisible();
        await loginPage.logoutButton.click();
        await waitForApiResponse(page, 'logout');
        await expect(page).toHaveURL(commonConstants.urls.baseURL + '/login');

        // Verify login functionality
        await loginPage.phoneInputField.clear();
        await loginPage.phoneInputField.pressSequentially(phone);
        await loginPage.passwordInputField.clear();
        await loginPage.passwordInputField.pressSequentially(password);
        await loginPage.loginButton.click();
        await waitForApiResponse(page, commonConstants.urls.loginApi);
        await expect(page).toHaveURL(commonConstants.urls.baseURL + '/dashboard');
        await expect(loginPage.navbarUserName).toBeVisible();
        await expect(loginPage.navbarUserName).toContainText(name);

        
    });

test('Login functionality @BAT', async ({ loginPage }) => {
    await loginPage.loginUser();
});

test('Signout functionality @BAT', async ({ page, loginPage }) => {
    await loginPage.loginUser();
    await page.waitForTimeout(3000);
    await expect(loginPage.navbarUserName).toBeVisible();
    await expect(loginPage.logoutButton).toBeVisible();
    await loginPage.logoutButton.click();
    await expect(loginPage.phoneInputField).toBeVisible();
    await expect(loginPage.passwordInputField).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
});
});