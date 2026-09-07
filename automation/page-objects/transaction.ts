import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basepage';
import commonConstants from '../constants/commonConstants';
import { navigateToPage, waitForApiResponse } from './common-functions';

export class TransactionPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get pageHeader(): Locator {
        return this.page.getByRole('heading', { name: 'Transactions', exact: true });
    }

    get dailyFilterButton(): Locator {
        return this.page.locator('#FilterBtn-daily');
    }

    get monthlyFilterButton(): Locator {
        return this.page.locator('#FilterBtn-monthly');
    }

    get yearlyFilterButton(): Locator {
        return this.page.locator('#FilterBtn-yearly');
    }

    get lifetimeFilterButton(): Locator {
        return this.page.locator('#FilterBtn-lifetime');
    }

    get totalExpenseCard(): Locator {
        return this.page.locator('#totalExpenseCard');
    }

    get bulkDeleteButton(): Locator {
        return this.page.locator('#BulkDeleteBtn');
    }

    get selectAllCheckbox(): Locator {
        return this.page.getByRole('checkbox', { name: 'Select all transactions' });
    }

    columnHeader(name: string): Locator {
        return this.resultsTable.getByRole('columnheader', { name, exact: true });
    }

    get addTransactionForm(): Locator {
        return this.page.locator('#AddTransactionForm');
    }

    get editTransactionForm(): Locator {
        return this.page.locator('#EditTransactionForm');
    }

    get resultsTable(): Locator {
        return this.page.getByTestId('resultsTable');
    }

    get firstTransactionRow(): Locator {
        return this.resultsTable.locator('tbody tr').first();
    }

    transactionRow(categoryName: string): Locator {
        return this.resultsTable.locator('tbody tr').filter({ hasText: categoryName });
    }

    get iouToggle(): Locator {
        return this.page.locator('#IouToggle');
    }

    get iouFriendNameInput(): Locator {
        return this.page.locator('#IouFriendName');
    }

    get iouAmountToGetBackInput(): Locator {
        return this.page.locator('#IouAmountToGetBack');
    }

    get purchaseImportanceDropdown(): Locator {
        return this.page.locator('#PurchaseImportanceDropdown');
    }

    get categoryDropdown(): Locator {
        return this.page.locator('#CategoryDropdown');
    }

    get quickCreateCategoryModal(): Locator {
        return this.page.locator('#QuickCreateModal');
    }

    get quickCategoryNameInput(): Locator {
        return this.page.locator('#QuickCatName');
    }

    get quickCategoryExpenseTypeButton(): Locator {
        return this.page.locator('#QuickCatType-expense');
    }

    get quickCategoryPlanningBucketDropdown(): Locator {
        return this.page.locator('#QuickCatBucket');
    }

    get quickCategoryCreateButton(): Locator {
        return this.page.locator('#QuickCatCreateBtn');
    }


    async createTransaction(page: Page, transaction: { type: string, amount: string, accountName: string, categoryName: string, date: string, description: string }) {

        // Navigate to Transactions Page
        await navigateToPage(page, commonConstants.pageName.TRANSACTIONS);

        // Create a Transaction 
        await expect(this.addButton).toBeVisible();
        await this.addButton.click();
        await waitForApiResponse(page, commonConstants.urls.accountsAPI);
        await expect(this.addTransactionForm).toBeVisible();

        if (transaction.type === 'expense') {
            await this.expenseRadio.click();
        }
        else {
            await this.incomeRadio.click();
        }

        await this.enterAmount(transaction.amount);
        await this.selectAccount(transaction.accountName);
        await this.selectCategory(transaction.categoryName);
        await this.selectDate(transaction.date);
        await this.descriptionInput.fill(transaction.description);

        await expect(this.cancelButton).toBeVisible();
        await expect(this.saveButton).toBeEnabled();
        await this.saveButton.click();

        await Promise.all([
            page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.newTransactionAPI) && response.status() === 201, { timeout: 15000 }),
            expect(page.getByText(commonConstants.toastMessages.TRANSACTION_ADDED_SUCCESSFULLY)).toBeVisible()
        ]);

        await expect(this.resultsTable).toBeVisible({ timeout: 5000 });

        // Verify if all details are correct in the latest transaction row
        await expect(this.firstTransactionRow).toContainText(transaction.type.toLowerCase());
        await expect(this.firstTransactionRow).toContainText(transaction.categoryName);
        await expect(this.firstTransactionRow).toContainText(transaction.accountName);
        await expect(this.firstTransactionRow).toContainText(`₹${Number(transaction.amount).toLocaleString('en-IN')}`);
        const dateObj = new Date(transaction.date);

        // Match the standard locale string that the UI uses
        const expectedUIDate = dateObj.toLocaleDateString();

        await expect(this.firstRowOfGrid).toContainText(expectedUIDate);

    }



    async deleteAllTransactions(page: Page) {
        const initialTxnCountText = await this.recordCountOnTable.innerText();
        const initialTxnCount = parseInt(initialTxnCountText);

        if (await this.page.getByText('No transactions found').isVisible()) {
            console.log('No transactions found to delete.');
            return;
        }

        console.log(`Found ${initialTxnCount} transactions. Starting deletion...`);

        for (let i = 0; i < initialTxnCount; i++) {
            await expect(this.deleteButton.first()).toBeVisible();
            await this.deleteButton.first().click();
            await expect(this.modalOkBtn).toBeVisible();
            await this.modalOkBtn.click();
            await Promise.all([
                page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.transactionAPI) && response.status() === 200, { timeout: 10000 }),
                expect(page.getByText(commonConstants.toastMessages.TRANSACTION_DELETED_SUCCESSFULLY)).toBeVisible()
            ]);
            await expect(this.recordCountOnTable).toBeVisible();
        }

        // Verify all transactions are deleted
        await expect(this.recordCountOnTable).toContainText('0 Records');
        console.log('All transactions deleted successfully.');
    }
}