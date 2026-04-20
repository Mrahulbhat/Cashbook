import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';

test.describe('Transfer Management Tests', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.loginUser();
    });

    test('TC04 - Transfer money between accounts', async ({ page, transferPage }) => {
        const transferAmount = '100';
        const fromAccount = 'Cash';
        const toAccount = 'CANARA_BANK';
        const description = 'Automation Transfer';

        await transferPage.performTransfer(page, {
            fromAccount: fromAccount,
            toAccount: toAccount,
            amount: transferAmount,
            description: description
        });

        // Verify we are redirected back to dashboard or wherever the app goes
        await expect(page).toHaveURL(/.*dashboard/);
    });
});
