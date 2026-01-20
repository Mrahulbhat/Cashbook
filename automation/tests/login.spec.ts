import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';
import { generateRandomPrefix } from '../page-objects/common-functions.js';

test.describe('Login Related Tests', () => {

    test('Create Account / Singup Functionality @BAT', async ({ page, loginPage }) => {
        const prefix = await generateRandomPrefix(5);
        const name = prefix + commonConstants.userName;
        const email = prefix + commonConstants.userEmail;
        const password = commonConstants.userPassword;

        await loginPage.createAccount(name, email, password);
    });

    test('Login using email @BAT', async ({ page, loginPage }) => {
        await loginPage.loginUser();

    });

    test('Singup Functionality @BAT', async ({ page, loginPage }) => {

    });

    test('SignOut Functionality @BAT', async ({ page, loginPage }) => {

    });
});