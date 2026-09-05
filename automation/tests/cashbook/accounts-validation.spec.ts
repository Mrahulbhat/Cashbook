import { expect } from '@playwright/test';
import { test } from '../../fixtures/test-base';
import CommonConstants from '../../constants/CommonConstants';
import { generateRecordName, navigateToPage } from '../../page-objects/common-functions';

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
});
