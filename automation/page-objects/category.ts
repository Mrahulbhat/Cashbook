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

        //verify if account is visible in grid
        await expect(this.page.locator('#categoryDiv' + category.name)).toBeVisible(); //verify if category is visible in grid
    }

    async deleteAllCategories(page: Page) {

        //no records; return 
        await page.waitForLoadState('networkidle');
        let count = await this.deleteButton.count();

        const toast = this.page.getByText(commonConstants.toastMessages.CATEGORY_DELETED_SUCCESSFULLY).first();

        for (var i = 0; i < count; i++) {
            await this.deleteButton.first().click();
            await Promise.all([
                this.modalOkBtn.click(),
                expect(toast).toBeVisible({ timeout: 15000 }),
                await this.page.waitForLoadState('networkidle')
            ]);
            await expect(toast).toBeHidden({ timeout: 10000 });
            await this.page.waitForLoadState('networkidle');

        }

        await expect(this.deleteButton).toHaveCount(0);
    }
}