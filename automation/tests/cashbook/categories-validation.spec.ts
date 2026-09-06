import { expect } from '@playwright/test';
import { test } from '../../fixtures/test-base';
import CommonConstants from '../../constants/commonConstants';
import { navigateToPage, waitForApiResponse, generateRecordName } from '../../page-objects/common-functions';

test.describe('Categories Functionality Validations', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await page.goto(CommonConstants.urls.baseURL);
    await loginPage.navigateToApp(CommonConstants.appName.CASHBOOK);
  });

  test('Set a new category as default and verify it is selected for transactions', async ({ page, basePage, transactionPage, api }) => {
    const categoryName = generateRecordName(CommonConstants.prefix.CATEGORY);
    const previousDefaultCategory = (await api.getCategories()).find(
      (category) => category.type === 'expense' && category.isDefault
    );

    try {
      await page.goto(`${CommonConstants.urls.baseURL}/${CommonConstants.pageName.CATEGORIES}`);
      await expect(page.locator('#AddBtnSmall')).toBeVisible();
      await page.locator('#AddBtnSmall').click();
      await page.waitForURL('**/categories/add');

      await basePage.nameInput.fill(categoryName);
      await basePage.expenseRadio.check();
      await page.locator('#DefaultCheckbox').check();

      await Promise.all([
        page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.categoriesAPI) && response.status() === 201),
        basePage.saveButton.click(),
      ]);

      await expect(page.getByText('Category created successfully!', { exact: true })).toBeVisible();
      await page.goto(`${CommonConstants.urls.baseURL}/${CommonConstants.pageName.CATEGORIES}`);
      const categoryRow = page.locator('tbody tr').filter({ hasText: categoryName });
      await expect(categoryRow).toBeVisible();
      await expect(categoryRow).toContainText(categoryName);

      const createdCategory = (await api.getCategories()).find((category) => category.name === categoryName);
      expect(createdCategory).toBeDefined();

      await navigateToPage(page, CommonConstants.pageName.TRANSACTIONS);
      await transactionPage.addButton.click();
      await waitForApiResponse(page, CommonConstants.urls.accountsAPI);
      await expect(transactionPage.addTransactionForm).toBeVisible();
      await expect(transactionPage.categoryDropdownContainer).toHaveValue(createdCategory!._id);
      await expect(transactionPage.categoryDropdownContainer.locator('option:checked')).toHaveText(categoryName);
    } finally {
      await api.deleteCategory(categoryName);
      if (previousDefaultCategory) {
        await api.updateCategory(previousDefaultCategory._id, { isDefault: true });
      }
    }
  });

  test('Only shows categories matching the selected transaction type', async ({ page, basePage, transactionPage, api }) => {
    const categories = {
      income: generateRecordName(CommonConstants.prefix.CATEGORY),
      expense: generateRecordName(CommonConstants.prefix.CATEGORY),
      investment: generateRecordName(CommonConstants.prefix.CATEGORY),
    };

    const createCategoryFromUi = async (type: keyof typeof categories) => {
      await page.goto(`${CommonConstants.urls.baseURL}/${CommonConstants.pageName.CATEGORIES}/add`);
      await basePage.nameInput.fill(categories[type]);
      await page.locator(`#TypeRadio-${type}`).check();

      await Promise.all([
        page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.categoriesAPI) && response.status() === 201),
        basePage.saveButton.click(),
      ]);

      await expect(page.getByText('Category created successfully!', { exact: true })).toBeVisible();
    };

    const expectCategoryOptions = async (expectedCategory: string, excludedCategories: string[]) => {
      const categoryOptions = transactionPage.categoryDropdownContainer.locator('optgroup[label="Existing Categories"] option');
      await expect(categoryOptions).toContainText([expectedCategory]);
      for (const excludedCategory of excludedCategories) {
        await expect(categoryOptions).not.toContainText([excludedCategory]);
      }
    };

    try {
      await createCategoryFromUi('income');
      await createCategoryFromUi('expense');
      await createCategoryFromUi('investment');

      await navigateToPage(page, CommonConstants.pageName.TRANSACTIONS);
      await transactionPage.addButton.click();
      await waitForApiResponse(page, CommonConstants.urls.accountsAPI);
      await expect(transactionPage.addTransactionForm).toBeVisible();

      await transactionPage.incomeRadio.check();
      await expectCategoryOptions(categories.income, [categories.expense, categories.investment]);

      await transactionPage.expenseRadio.check();
      await expectCategoryOptions(categories.expense, [categories.income, categories.investment]);

      await page.locator('#TypeRadio-investment').check();
      await expectCategoryOptions(categories.investment, [categories.income, categories.expense]);
    } finally {
      await api.deleteCategory(categories.income);
      await api.deleteCategory(categories.expense);
      await api.deleteCategory(categories.investment);
    }
  });

  test('Shows an error and preserves the category count for duplicate names', async ({ page, basePage, api }) => {
    const categoryName = generateRecordName(CommonConstants.prefix.CATEGORY);
    const openCategoriesAndWaitForLoad = async (categoryToWaitFor?: string) => {
      await page.goto(`${CommonConstants.urls.baseURL}/${CommonConstants.pageName.CATEGORIES}`);
      await page.waitForLoadState('networkidle');
      await expect(page.getByText('No of records', { exact: true })).toBeVisible();
      if (categoryToWaitFor) {
        await expect(page.locator('tbody tr').filter({ hasText: categoryToWaitFor })).toBeVisible();
      }
      return page.locator('tbody tr').count();
    };

    try {
      await openCategoriesAndWaitForLoad();

      await page.locator('#AddBtnSmall').click();
      await page.waitForURL('**/categories/add');
      await basePage.nameInput.fill(categoryName);
      await basePage.expenseRadio.check();

      await Promise.all([
        page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.categoriesAPI) && response.status() === 201),
        basePage.saveButton.click(),
      ]);
      await expect(page.getByText('Category created successfully!', { exact: true })).toBeVisible();

      const categoryCountAfterCreate = await openCategoriesAndWaitForLoad(categoryName);

      await page.locator('#AddBtnSmall').click();
      await page.waitForURL('**/categories/add');
      await basePage.nameInput.fill(categoryName);
      await basePage.expenseRadio.check();

      await Promise.all([
        page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.categoriesAPI) && response.status() === 400),
        basePage.saveButton.click(),
      ]);
      await expect(page.getByText('Category with this name already exists', { exact: true })).toBeVisible();

      await basePage.cancelButton.click();
      await page.waitForURL('**/categories');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('tbody tr').filter({ hasText: categoryName })).toBeVisible();
      await expect(page.locator('tbody tr')).toHaveCount(categoryCountAfterCreate);
    } finally {
      await api.deleteCategory(categoryName);
    }
  });
});
