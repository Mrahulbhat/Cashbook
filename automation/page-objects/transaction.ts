import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basepage';
import commonConstants from '../constants/commonConstants';
import { navigateToPage } from './common-functions';
import { waitForResponse } from './common-functions';

export class TransactionPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get addTransactionBtn(): Locator {
        return this.page.locator('#addTransactionBtn');
    }
    get addTransactionForm(): Locator {
        return this.page.locator('#addTransactionForm');
    }
    get incomeRadioBox(): Locator {
        return this.page.locator('#incomeRadioBox');
    }
    get expenseRadioBox(): Locator {
        return this.page.locator('#expenseRadioBox');
    }

    async createTransaction(page: Page, transaction: { type: string, amount: string, accountName: string, categoryName: string, date: string, description: string }) {

        // Navigate to Dashboard Page
        await navigateToPage(page, commonConstants.pageName.DASHBOARD);

        // Navigate to Transactions Page
        await navigateToPage(page, commonConstants.pageName.TRANSACTIONS);

        const initialTxnCountText = await this.recordCountOnTable.innerText();

        // Create a Transaction 
        await expect(this.addTransactionBtn).toBeVisible();
        await this.addTransactionBtn.click();
        await waitForResponse(page, commonConstants.urls.categoriesAPI);

        await expect(this.backButton).toBeVisible();
        await expect(this.addTransactionForm).toBeVisible();

        //click on save button with empty form to check validation
        await expect(this.saveButton).toBeDisabled();

        await expect(this.incomeRadioBox).toBeVisible();
        await expect(this.expenseRadioBox).toBeVisible();

        // assert default selection is expense
        await expect(this.expenseRadioBox).toBeChecked();

        await this.enterAmount(transaction.amount);
        await this.selectAccount(transaction.accountName);
        await this.selectCategory(transaction.categoryName);
        await this.selectDate(transaction.date);
        await this.inputFieldById('description').pressSequentially(transaction.description);

        await expect(this.cancelButton).toBeVisible();
        await expect(this.saveButton).toBeEnabled();
        await this.saveButton.click();

        await Promise.all([
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.newTransactionAPI) && response.status() === 201, { timeout: 15000 }),
            expect(page.getByText(commonConstants.toastMessages.TRANSACTION_ADDED_SUCCESSFULLY)).toBeVisible()
        ]);

        // Verify if it stays in Transactions page after creation
        await expect(this.addTransactionForm).toBeVisible();

        const postCreationTxnCountText = await this.recordCountOnTable.innerText();

        // Verify that transaction count has increased by 1
        expect(parseInt(postCreationTxnCountText)).toBe(parseInt(initialTxnCountText) + 1);

        // Verify if all details are correct in the latest transaction row
        await expect(this.firstRowOfGrid).toContainText(transaction.type.toLowerCase());
        await expect(this.firstRowOfGrid).toContainText(transaction.categoryName);
        await expect(this.firstRowOfGrid).toContainText(transaction.accountName);
        await expect(this.firstRowOfGrid).toContainText(`₹${Number(transaction.amount).toLocaleString('en-IN')}`);
        await expect(this.firstRowOfGrid).toContainText(transaction.description);
        const formattedDate = new Date(transaction.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        await expect(this.firstRowOfGrid).toContainText(formattedDate);
    }

    async editTransaction(page: Page, transaction: { type: string, amount: string, accountName: string, categoryName: string, date: string, description: string }) {
        
        await this.editRecordButton.first().click();
        await Promise.all([
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.transactionAPI) && response.status() === 200)
        ]);

        const updated_type = 'Income';
        const updated_amount = '2000';
        const updated_accountName = 'Canara Bank';
        const updated_categoryName = 'Salary';
        const updated_date = '2025-12-30';
        const updated_description = 'TEST AUTOMATION - EDITED';

        // assert default selection is expense
        await expect(this.expenseRadioBox).toBeChecked();

        await this.incomeRadioBox.click();
        await expect(this.incomeRadioBox).toBeChecked();
        await this.enterAmount(updated_amount);
        await this.selectAccount(updated_accountName);
        await this.selectCategory(updated_categoryName);
        await this.selectDate(updated_date);
        await this.inputFieldById('description').clear();
        await this.inputFieldById('description').pressSequentially(updated_description);
        await expect(this.cancelButton).toBeVisible();
        await expect(this.updateButton).toBeEnabled();
        await this.updateButton.click();

        await Promise.all([
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.transactionAPI) && response.status() === 200, { timeout: 15000 }),
            expect(page.getByText(commonConstants.toastMessages.TRANSACTION_UPDATED_SUCCESSFULLY)).toBeVisible()
        ]);

        // Verify if it stays on the same page and count remains the same
        await expect(this.addTransactionBtn).toBeVisible();
        await expect(this.recordCountOnTable).toHaveText(postCreationTxnCountText);

        // Verify if all details are correct in the latest transaction row
        await expect(this.firstRowOfGrid).toContainText(updated_type.toLowerCase());
        await expect(this.firstRowOfGrid).toContainText(updated_categoryName);
        await expect(this.firstRowOfGrid).toContainText(updated_accountName);
        await expect(this.firstRowOfGrid).toContainText(`₹${Number(updated_amount).toLocaleString('en-IN')}`);
        await expect(this.firstRowOfGrid).toContainText(updated_description);
        const formattedDate1 = new Date(updated_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        await expect(this.firstRowOfGrid).toContainText(formattedDate1);
    };
}