import { test } from '../../fixtures/test-base';
import CommonConstants from '../../constants/CommonConstants';
import { generateRecordName, navigateToPage, waitForApiResponse } from '../../page-objects/common-functions';
import {expect} from '@playwright/test';

test.describe('Transactions Functionality Validations', () => {

  test.beforeEach(async ({ page, loginPage }) => {
    await page.goto(CommonConstants.urls.baseURL);
    await loginPage.navigateToApp(CommonConstants.appName.CASHBOOK);
  });

  test('Transaction test', async ({ page, transactionPage, dashboardPage, api }) => {

    const accountName = generateRecordName(CommonConstants.prefix.ACCOUNT);
    const categoryName = generateRecordName(CommonConstants.prefix.CATEGORY);
    const transaction = {
      type: 'expense',
      amount: '1000',
      accountName,
      categoryName,
      date: new Date().toISOString().split('T')[0],
      description: generateRecordName(CommonConstants.prefix.TRANSACTION)
    };

    try {
      await api.createAccount({ name: accountName, balance: 1000 });
      await api.createCategory({ name: categoryName, type: 'expense' });

      // Navigate to Transactions Page
      await navigateToPage(page, CommonConstants.pageName.TRANSACTIONS);

    // Create a Transaction 
    await expect(transactionPage.addButton).toBeVisible();
    await transactionPage.addButton.click();
    await waitForApiResponse(page, CommonConstants.urls.accountsAPI);
    await expect(transactionPage.addTransactionForm).toBeVisible();

    if (transaction.type === 'expense') {
      await transactionPage.expenseRadio.click();
    }
    else {
      await transactionPage.incomeRadio.click();
    }

    await transactionPage.enterAmount(transaction.amount);
    await transactionPage.selectAccount(transaction.accountName);
    await transactionPage.selectCategory(transaction.categoryName);
    await transactionPage.selectDate(transaction.date);
    await transactionPage.descriptionInput.fill(transaction.description);

    await expect(transactionPage.cancelButton).toBeVisible();
    await expect(transactionPage.saveButton).toBeEnabled();
    await transactionPage.saveButton.click();

    await Promise.all([
      page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.newTransactionAPI) && response.status() === 201, { timeout: 15000 }),
      expect(transactionPage.toastMessage).toContainText(CommonConstants.toastMessages.TRANSACTION_ADDED_SUCCESSFULLY)
    ]);

    await expect(transactionPage.resultsTable).toBeVisible({ timeout: 5000 });
    await expect(transactionPage.recordCountOnTable).toBeVisible({ timeout: 5000 });

    // Verify if all details are correct in the latest transaction row
    await expect(transactionPage.firstTransactionRow).toContainText(transaction.type.toLowerCase());
    await expect(transactionPage.firstTransactionRow).toContainText(transaction.categoryName);
    await expect(transactionPage.firstTransactionRow).toContainText(transaction.accountName);
    await expect(transactionPage.firstTransactionRow).toContainText(`₹${Number(transaction.amount).toLocaleString('en-IN')}`);
    const dateObj = new Date(transaction.date);

    // Match the standard locale string that the UI uses
    const expectedUIDate = dateObj.toLocaleDateString();

      await expect(transactionPage.firstRowOfGrid).toContainText(expectedUIDate);
    } finally {
      await api.deleteTransaction(transaction.description);
      await api.deleteCategory(categoryName);
      await api.deleteAccount(accountName);
    }

  });
});