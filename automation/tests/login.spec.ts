import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';
import { generateRandomPrefix } from '../page-objects/common-functions.js';

test.describe('Login Related Tests', () => {

    test('Create Account / Singup Functionality @BAT', async ({ page, loginPage }) => {
        const name = commonConstants.userName;
        const phone = commonConstants.userPhone;
        const password = commonConstants.userPassword;

        await loginPage.createAccount(name, phone, password);
    });

    test('Login using email @BAT', async ({ page, loginPage }) => {
        await loginPage.loginUser();

    });

    test('SignOut Functionality @BAT', async ({ page, loginPage }) => {

    });
});