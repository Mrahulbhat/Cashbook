import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Login Related Tests', () => {

    test('Login using email @BAT', async ({ page, loginPage }) => {
        await loginPage.loginUser();

    });

    test('Singup Functionality @BAT', async ({ page, loginPage }) => {

    });

    test('SignOut Functionality @BAT', async ({ page, loginPage }) => {

    });
});