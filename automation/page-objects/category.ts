import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basepage';
import { navigateToPage } from './common-functions';
import commonConstants from '../constants/commonConstants';

export class CategoryPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get addCategoryBtn(): Locator {
        return this.page.locator('#addCategoryBtn');
    }

    //form fields
    get categoryNameInputField(): Locator {
        return this.page.locator('#categoryNameInputField');
    }
    get incomeCheckbox(): Locator {
        return this.page.locator('#incomeCheckbox');
    }
    get expenseCheckbox(): Locator {
        return this.page.locator('#expenseCheckbox');
    }
    get parentCategoryDropdown(): Locator {
        return this.page.locator('#parentCategoryDropdown');
    }
    get budgetInputField(): Locator {
        return this.page.locator('#budgetInputField');
    }
    get categoryDiv(): Locator {
        return this.page.locator('#categoryDiv');
    }

    //count cards
    get totalCategoryCount(): Locator {
        return this.page.locator('#totalCategoryCount');
    }
    get totalIncomeCategoryCount(): Locator {
        return this.page.locator('#totalIncomeCategoryCount');
    }
    get totalExpenseCategoryCount(): Locator {
        return this.page.locator('#totalExpenseCategoryCount');
    }

    async createCategory(page: Page, category: { name: string; type: string; parentCategory: string; budget?: string; }) {

        await navigateToPage(page, commonConstants.pageName.CATEGORIES);

        // ---- get initial counts (convert to numbers)
        const initialTotalCount = Number(await this.totalCategoryCount.innerText());
        const initialIncomeCount = Number(await this.totalIncomeCategoryCount.innerText());
        const initialExpenseCount = Number(await this.totalExpenseCategoryCount.innerText());

        // ---- go to add category
        await this.addCategoryBtn.click();
        await page.waitForLoadState("networkidle");

        // ---- fill form
        await expect(this.categoryNameInputField).toBeVisible();
        await this.categoryNameInputField.fill(category.name);

        // select income / expense
        if (category.type === "income") {
            await this.incomeCheckbox.click();
        } else {
            await this.expenseCheckbox.click();
        }

        await expect(this.parentCategoryDropdown).toBeVisible();
        await this.parentCategoryDropdown.selectOption(category.parentCategory);

        if (category.budget) {
            await expect(this.budgetInputField).toBeVisible();
            await this.budgetInputField.fill(category.budget);
        }

        // ---- save
        await this.saveButton.click();
        await page.waitForResponse((response) => response.url().includes(commonConstants.urls.newCategoryAPI) && response.status() === 201 && response.request().method() === "POST", { timeout: 15000 });
        await expect(page.getByText(commonConstants.toastMessages.CATEGORY_CREATED_SUCCESSFULLY)).toBeVisible();

        // ---- verify category card is visible
        await expect(this.categoryDiv).toHaveText(category.name);

        // ---- verify counts updated
        await expect(this.totalCategoryCount).toHaveText(String(initialTotalCount + 1));

        if (category.type === "income") {
            await expect(this.totalIncomeCategoryCount).toHaveText(String(initialIncomeCount + 1));
            await expect(this.totalExpenseCategoryCount).toHaveText(String(initialExpenseCount));
        } else {
            await expect(this.totalExpenseCategoryCount).toHaveText(String(initialExpenseCount + 1));
            await expect(this.totalIncomeCategoryCount).toHaveText(String(initialIncomeCount));
        }
    }

    async deleteAllCategories(page: Page) {

        let count = await this.totalCategoryCount.count();
        if (count === 0) return;

        while (await this.deleteButton.count() > 0) {
            await this.deleteButton.first().click();
            await this.modalOkBtn.click();
            const toast = this.page.getByText(commonConstants.toastMessages.ACCOUNT_DELETED_SUCCESSFULLY).last();
            await expect(toast).toBeVisible();
            await expect(toast).toBeHidden({ timeout: 10000 });
            await this.page.waitForLoadState('networkidle');
        }

        await expect(this.deleteButton).toHaveCount(0);
    }
}