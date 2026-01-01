import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import { waitForResponse } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Transaction Related Tests', () => {

    test('Create New Transaction @BAT', async ({ page, transactionPage }) => {
        const transactions = commonConstants.TRANSACTIONS

        //create just one for a bat test

        for (const transaction of transactions) {
            await transactionPage.createTransaction(page, transaction);
            break;
        }

    });

    test('Transaction CRUD Operation @BAT @BUG', async ({ page, transactionPage, dashboardPage }) => {

        const transaction = { amount: "1000", type: "income", accountName: "CANARA_BANK", categoryName: "TEST1", date: '2025-12-29', description: 'TEST AUTOMATION' };

        await transactionPage.createTransaction(page, transaction);


        // EDIT THE RECORD===================================================================================

        await transactionPage.editTransaction(page,transaction);
    });
});