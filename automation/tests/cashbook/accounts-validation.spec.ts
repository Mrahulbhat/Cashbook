import { expect } from '@playwright/test';
import { test } from '../../fixtures/test-base';
import CommonConstants from '../../constants/CommonConstants';
import { generateRecordName, navigateToPage, waitForApiResponse } from '../../page-objects/common-functions';

test.describe('Accounts Functionality Validations', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await page.goto(CommonConstants.urls.baseURL);
    await loginPage.navigateToApp(CommonConstants.appName.CASHBOOK);
  });

  test('Create account from Accounts page', async ({ page, accountsPage, api }) => {
    const accountName = generateRecordName(CommonConstants.prefix.ACCOUNT);
    const accountBalance = '500';

    try {
      await navigateToPage(page, CommonConstants.pageName.ACCOUNTS);
      await expect(accountsPage.balanceContainer).toBeVisible();
      const initialTotalBalance = await accountsPage.totalBalance.innerText();
      expect(initialTotalBalance).toMatch(/₹/);

      await accountsPage.addButton.click();
      await page.waitForURL('**/accounts/add');
      await expect(accountsPage.nameInput).toBeVisible();
      await accountsPage.nameInput.fill(accountName);
      await accountsPage.balanceInput.fill(accountBalance);

      await accountsPage.saveButton.click();
      await expect(
        page.getByText(CommonConstants.toastMessages.ACCOUNT_CREATED_SUCCESSFULLY, { exact: true })
      ).toBeVisible();
      await navigateToPage(page, CommonConstants.pageName.ACCOUNTS);

      const accountRow = page.locator('tbody tr').filter({ hasText: accountName });
      await expect(accountRow).toBeVisible();
      await expect(accountRow).toContainText(accountName);
      await expect(accountRow).toContainText('₹500');
    } finally {
      await api.deleteAccount(accountName);
    }
  });

  test('Set a new account as default and verify it is selected for transactions', async ({ page, accountsPage, transactionPage, api }) => {
    const accountName = generateRecordName(CommonConstants.prefix.ACCOUNT);
    const accountBalance = '500';
    const previousDefaultAccount = (await api.getAccounts()).find((account) => account.isDefault);

    try {
      await navigateToPage(page, CommonConstants.pageName.ACCOUNTS);
      await accountsPage.addButton.click();
      await page.waitForURL('**/accounts/add');

      await accountsPage.nameInput.fill(accountName);
      await accountsPage.balanceInput.fill(accountBalance);
      await accountsPage.defaultCheckbox.check();

      await Promise.all([
        page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.newAccountAPI) && response.status() === 201),
        accountsPage.saveButton.click(),
      ]);

      await expect(page.getByText(CommonConstants.toastMessages.ACCOUNT_CREATED_SUCCESSFULLY, { exact: true })).toBeVisible();
      await navigateToPage(page, CommonConstants.pageName.ACCOUNTS);

      const accountRow = page.locator('tbody tr').filter({ hasText: accountName });
      await expect(accountRow).toBeVisible();
      await expect(accountRow).toContainText(accountName);
      await expect(accountRow).toContainText('₹500');

      const createdAccount = (await api.getAccounts()).find((account) => account.name === accountName);
      expect(createdAccount).toBeDefined();

      await navigateToPage(page, CommonConstants.pageName.TRANSACTIONS);
      await transactionPage.addButton.click();
      await waitForApiResponse(page, CommonConstants.urls.accountsAPI);
      await expect(transactionPage.addTransactionForm).toBeVisible();
      await expect(transactionPage.accountDropdownContainer).toHaveValue(createdAccount!._id);
      await expect(transactionPage.accountDropdownContainer.locator('option:checked')).toHaveText(accountName);
    } finally {
      await api.deleteAccount(accountName);
      if (previousDefaultAccount) {
        await api.updateAccount(previousDefaultAccount._id, { isDefault: true });
      }
    }
  });
});
