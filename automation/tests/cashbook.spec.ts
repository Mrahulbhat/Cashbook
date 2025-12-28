import {test} from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import {navigateToLoginPage} from '../page-objects/common-functions.js';

test.describe('Cashbook Application Basic Tests', () => {

    test.beforeEach(async ({page}) => {
        await navigateToLoginPage(page);
    });

    test('TC01 - Does the application start @BAT', async ({page,welcomepage}) => {
        //Check if the welcome page loads, click on get Started button and verify navigation to login page
        //check if the frontend gets connected to backend

        await expect(welcomepage.buttonByTestId('GetStarted')).toBeVisible();
        await welcomepage.buttonByTestId('GetStarted').click();

        await page.waitForResponse(response =>
            response.url().includes('/api/account') && response.status() === 200
        );
    });
});