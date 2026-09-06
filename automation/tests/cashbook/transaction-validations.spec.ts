import { test } from '../../fixtures/test-base';
import CommonConstants from '../../constants/CommonConstants';
import { generateRecordName, navigateToPage, waitForApiResponse } from '../../page-objects/common-functions';
import {expect} from '@playwright/test';

test.describe('Transactions Functionality Validations', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, loginPage }) => {
    await page.goto(CommonConstants.urls.baseURL);
    await loginPage.navigateToApp(CommonConstants.appName.CASHBOOK);
  });

  test('Verify all elements are displayed on the Transactions page', async ({ page, transactionPage, api }) => {
    const accountName = generateRecordName(CommonConstants.prefix.ACCOUNT);
    const categoryName = generateRecordName(CommonConstants.prefix.CATEGORY);
    const description = generateRecordName(CommonConstants.prefix.TRANSACTION);

    try {
      await api.createAccount({ name: accountName, balance: 1000 });
      await api.createCategory({ name: categoryName, type: 'expense' });
      await api.createTransaction({
        amount: 100,
        type: 'expense',
        description,
        accountName,
        categoryName,
      });

      await navigateToPage(page, CommonConstants.pageName.TRANSACTIONS);

      await expect(transactionPage.pageHeader).toBeVisible();
      await expect(transactionPage.dailyFilterButton).toBeVisible();
      await expect(transactionPage.monthlyFilterButton).toBeVisible();
      await expect(transactionPage.yearlyFilterButton).toBeVisible();
      await expect(transactionPage.lifetimeFilterButton).toBeVisible();

      await expect(transactionPage.totalExpenseCard).toBeVisible();
      await expect(transactionPage.totalIncomeCard).toBeVisible();
      await expect(transactionPage.balanceCard).toBeVisible();
      await expect(transactionPage.addButton).toBeVisible();
      await expect(transactionPage.bulkDeleteButton).toBeVisible();
      await expect(transactionPage.recordCountOnTable).toBeVisible();
      await expect(transactionPage.resultsTable).toBeVisible();
      await expect(transactionPage.selectAllCheckbox).toBeVisible();

      for (const column of ['Actions', 'Date', 'Type', 'Amount', 'Category', 'Account']) {
        await expect(transactionPage.columnHeader(column)).toBeVisible();
      }
    } finally {
      await api.deleteTransaction(description);
      await api.deleteCategory(categoryName);
      await api.deleteAccount(accountName);
    }
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

  test('Transaction date is auto generated with today\'s date', async ({ page, transactionPage }) => {
    await navigateToPage(page, CommonConstants.pageName.TRANSACTIONS);

    await expect(transactionPage.addButton).toBeVisible();
    await transactionPage.addButton.click();
    await waitForApiResponse(page, CommonConstants.urls.accountsAPI);
    await expect(transactionPage.addTransactionForm).toBeVisible();

    const today = new Date().toISOString().split('T')[0];
    await expect(transactionPage.dateInput).toHaveValue(today);
  });

  test('Paid for a friend creates a transaction and IOU', async ({ page, transactionPage, api }) => {
    await navigateToPage(page, CommonConstants.pageName.IOU);
    const initialIouCount = await page.locator('[id^="DeleteIouBtn-"]').count();

    await navigateToPage(page, CommonConstants.pageName.TRANSACTIONS);
    await transactionPage.addButton.click();
    await waitForApiResponse(page, CommonConstants.urls.accountsAPI);
    await expect(transactionPage.addTransactionForm).toBeVisible();

    await expect(transactionPage.iouToggle).toHaveAttribute('aria-checked', 'false');

    const accountOption = transactionPage.accountDropdownContainer.locator('option').nth(2);
    const categoryOption = transactionPage.categoryDropdownContainer.locator('option').nth(2);
    await expect(accountOption).toBeAttached();
    await expect(categoryOption).toBeAttached();

    const accountValue = await accountOption.getAttribute('value');
    const categoryValue = await categoryOption.getAttribute('value');
    const accountName = (await accountOption.textContent())?.trim() || '';
    const categoryName = (await categoryOption.textContent())?.trim() || '';
    const friendName = generateRecordName('FR');
    const description = generateRecordName(CommonConstants.prefix.TRANSACTION);
    const amount = '100';

    try {
      await transactionPage.amountInput.fill(amount);
    await transactionPage.accountDropdownContainer.selectOption(accountValue!);
    await transactionPage.categoryDropdownContainer.selectOption(categoryValue!);
    await transactionPage.descriptionInput.fill(description);
    await transactionPage.iouToggle.click();

    await expect(transactionPage.iouToggle).toHaveAttribute('aria-checked', 'true');
    await transactionPage.iouFriendNameInput.fill(friendName);
    await transactionPage.iouAmountToGetBackInput.fill(amount);

    await Promise.all([
      page.waitForResponse((response: any) => response.url().includes('/api/transactions') && response.status() === 201),
      page.waitForResponse((response: any) => response.url().includes('/api/iou') && response.status() === 201),
      transactionPage.saveButton.click(),
    ]);

    await expect(page.getByText(CommonConstants.toastMessages.TRANSACTION_ADDED_SUCCESSFULLY, { exact: true })).toBeVisible();
    await expect(page.getByText('IOU created!', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/transactions$/);
    await expect(transactionPage.firstTransactionRow).toContainText('expense');
    await expect(transactionPage.firstTransactionRow).toContainText(categoryName);
    await expect(transactionPage.firstTransactionRow).toContainText(accountName);
    await expect(transactionPage.firstTransactionRow).toContainText(`₹${Number(amount).toLocaleString('en-IN')}`);

    await navigateToPage(page, CommonConstants.pageName.IOU);
    await expect(page.locator('[id^="DeleteIouBtn-"]')).toHaveCount(initialIouCount + 1);
    const iouCard = page.locator('div.bg-gray-900.border.rounded-2xl.overflow-hidden').filter({ hasText: friendName });
    await expect(iouCard).toContainText(friendName);
    await expect(iouCard).toContainText(description);
    await expect(iouCard).toContainText(`₹${Number(amount).toLocaleString('en-IN')}`);
    } finally {
      await api.deleteTransaction(description);
    }
  });

  test('IOU partial payment updates the account balance', async ({ page, transactionPage, api }) => {
    const amount = 100;
    const partialPayment = 50;
    const friendName = generateRecordName('FR');
    const description = generateRecordName(CommonConstants.prefix.TRANSACTION);

    await navigateToPage(page, CommonConstants.pageName.IOU);
    const initialIouCount = await page.locator('[id^="DeleteIouBtn-"]').count();

    await navigateToPage(page, CommonConstants.pageName.TRANSACTIONS);
    await transactionPage.addButton.click();
    await waitForApiResponse(page, CommonConstants.urls.accountsAPI);
    await expect(transactionPage.addTransactionForm).toBeVisible();

    const accountOption = transactionPage.accountDropdownContainer.locator('option').nth(2);
    const categoryOption = transactionPage.categoryDropdownContainer.locator('option').nth(2);
    const accountValue = await accountOption.getAttribute('value');
    const categoryValue = await categoryOption.getAttribute('value');
    const accountName = (await accountOption.textContent())?.trim() || '';

    try {
      await transactionPage.amountInput.fill(String(amount));
    await transactionPage.accountDropdownContainer.selectOption(accountValue!);
    await transactionPage.categoryDropdownContainer.selectOption(categoryValue!);
    await transactionPage.descriptionInput.fill(description);
    await transactionPage.iouToggle.click();
    await transactionPage.iouFriendNameInput.fill(friendName);
    await transactionPage.iouAmountToGetBackInput.fill(String(amount));

    await Promise.all([
      page.waitForResponse((response: any) => response.url().includes('/api/transactions') && response.status() === 201),
      page.waitForResponse((response: any) => response.url().includes('/api/iou') && response.status() === 201),
      transactionPage.saveButton.click(),
    ]);

    await page.waitForURL(/\/transactions$/);
    await navigateToPage(page, CommonConstants.pageName.ACCOUNTS);
    const accountRow = page.locator('tbody tr').filter({ hasText: accountName });
    const balanceCell = accountRow.locator('td').nth(3);
    const balanceAfterTransaction = Number((await balanceCell.innerText()).replace(/[^0-9.-]/g, ''));

    await navigateToPage(page, CommonConstants.pageName.IOU);
    await expect(page.locator('[id^="DeleteIouBtn-"]')).toHaveCount(initialIouCount + 1);
    const iouCard = page.locator('div.bg-gray-900.border.rounded-2xl.overflow-hidden').filter({ hasText: friendName });
    await iouCard.getByRole('button', { name: 'They Paid Back' }).click();
    await expect(page.locator('#SettleAmountInput')).toHaveValue(String(amount));
    await page.locator('#SettleAmountInput').fill(String(partialPayment));

    await Promise.all([
      page.waitForResponse((response: any) => response.url().includes('/api/iou/') && response.status() === 200),
      page.locator('#SettleConfirmBtn').click(),
    ]);

    await expect(iouCard).toContainText('partially paid');
    await navigateToPage(page, CommonConstants.pageName.IOU);
    await expect(page.locator('[id^="DeleteIouBtn-"]')).toHaveCount(initialIouCount + 1);

    await navigateToPage(page, CommonConstants.pageName.ACCOUNTS);
    const balanceAfterPartialPayment = Number((await accountRow.locator('td').nth(3).innerText()).replace(/[^0-9.-]/g, ''));
    expect(balanceAfterPartialPayment).toBe(balanceAfterTransaction + partialPayment);
    } finally {
      await api.deleteTransaction(description);
    }
  });

  test('Verify if Balance is updated when IOU is settled if IOU which was created from txn', async ({ page, transactionPage, api }) => {
    const amount = 100;
    const friendName = generateRecordName('FR');
    const description = generateRecordName(CommonConstants.prefix.TRANSACTION);

    try {
      await navigateToPage(page, CommonConstants.pageName.TRANSACTIONS);
      await transactionPage.addButton.click();
      await waitForApiResponse(page, CommonConstants.urls.accountsAPI);
      await expect(transactionPage.addTransactionForm).toBeVisible();

      const accountOption = transactionPage.accountDropdownContainer.locator('option').nth(2);
      const categoryOption = transactionPage.categoryDropdownContainer.locator('option').nth(2);
      const accountValue = await accountOption.getAttribute('value');
      const categoryValue = await categoryOption.getAttribute('value');
      const accountName = (await accountOption.textContent())?.trim() || '';

      await transactionPage.amountInput.fill(String(amount));
      await transactionPage.accountDropdownContainer.selectOption(accountValue!);
      await transactionPage.categoryDropdownContainer.selectOption(categoryValue!);
      await transactionPage.descriptionInput.fill(description);
      await transactionPage.iouToggle.click();
      await transactionPage.iouFriendNameInput.fill(friendName);
      await transactionPage.iouAmountToGetBackInput.fill(String(amount));

      await Promise.all([
        page.waitForResponse((response: any) => response.url().includes('/api/transactions') && response.status() === 201),
        page.waitForResponse((response: any) => response.url().includes('/api/iou') && response.status() === 201),
        transactionPage.saveButton.click(),
      ]);

      await page.waitForURL(/\/transactions$/);
      await navigateToPage(page, CommonConstants.pageName.ACCOUNTS);
      const accountRow = page.locator('tbody tr').filter({ hasText: accountName });
      const balanceAfterTransaction = Number((await accountRow.locator('td').nth(3).innerText()).replace(/[^0-9.-]/g, ''));

      await navigateToPage(page, CommonConstants.pageName.IOU);
      const iouCard = page.locator('div.bg-gray-900.border.rounded-2xl.overflow-hidden').filter({ hasText: friendName });
      await iouCard.getByRole('button', { name: 'They Paid Back' }).click();
      await expect(page.locator('#SettleAmountInput')).toHaveValue(String(amount));
      await page.locator('#SettleAccountSelect').selectOption(accountValue!);

      await Promise.all([
        page.waitForResponse((response: any) => response.url().includes('/api/iou/') && response.status() === 200),
        page.locator('#SettleConfirmBtn').click(),
      ]);

      await expect(page.getByText(/IOU fully settled/)).toBeVisible();
      await page.locator('#FilterTab-pending').click();
      await expect(page.locator('div.bg-gray-900.border.rounded-2xl.overflow-hidden').filter({ hasText: friendName })).toHaveCount(0);

      await navigateToPage(page, CommonConstants.pageName.ACCOUNTS);
      const balanceAfterSettlement = Number((await accountRow.locator('td').nth(3).innerText()).replace(/[^0-9.-]/g, ''));
      expect(balanceAfterSettlement).toBe(balanceAfterTransaction + amount);
    } finally {
      await api.deleteTransaction(description);
    }
  });
});