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

    //form fields
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

    get parentDropdown(): Locator {
        return this.page.locator('#ParentDropdown');
    }

    async createCategory(page: Page, category: { name: string; type: string; parentCategory: string; budget?: string; }) {

        await navigateToPage(page, commonConstants.pageName.CATEGORIES);

        // ---- go to add category
        await this.addButton.click();
        await page.waitForLoadState("networkidle");

        // ---- fill form
        await expect(this.nameInput).toBeVisible();
        await this.nameInput.fill(category.name);

        // select income / expense
        if (category.type === "income") {
            await this.incomeRadio.click();
        } else {
            await this.expenseRadio.click();
        }

        await expect(this.parentDropdown).toBeVisible();
        await this.parentDropdown.selectOption(category.parentCategory);

        if (category.budget) {
            await expect(this.budgetInput).toBeVisible();
            await this.budgetInput.fill(category.budget);
        }

        // ---- save
        await this.saveButton.click();
        await page.waitForResponse((response) => response.url().includes(commonConstants.urls.newCategoryAPI) && response.status() === 201 && response.request().method() === "POST", { timeout: 15000 });
        await expect(page.getByText(commonConstants.toastMessages.CATEGORY_CREATED_SUCCESSFULLY)).toBeVisible();

        //verify if category is visible in grid
        const slug = category.name.replace(/\s+/g, '-').toLowerCase();
        await expect(this.page.locator(`#categoryCard-${slug}`)).toBeVisible(); //verify if category is visible in grid
    }

    async editCategory(page: Page, categoryName: string, updatedCategory: { name?: string; budget?: string; }) {
        await navigateToPage(page, commonConstants.pageName.CATEGORIES);

        const slug = categoryName.replace(/\s+/g, '-').toLowerCase();
        const categoryCard = this.page.locator(`#categoryCard-${slug}`);
        await expect(categoryCard).toBeVisible();

        await categoryCard.locator('#EditBtn').click();
        await page.waitForLoadState("networkidle");

        if (updatedCategory.name) {
            await this.nameInput.fill(updatedCategory.name);
        }

        if (updatedCategory.budget) {
            await this.budgetInput.fill(updatedCategory.budget);
        }

        await this.saveButton.click();
        await page.waitForResponse((response) => response.url().includes(commonConstants.urls.newCategoryAPI) && response.status() === 200 && response.request().method() === "PUT", { timeout: 15000 });
        await expect(page.getByText(commonConstants.toastMessages.CATEGORY_UPDATED_SUCCESSFULLY)).toBeVisible();
    }

    async deleteAllCategories(page: Page) {

        //no records; return 
        await page.waitForLoadState('networkidle');
        let count = await this.deleteButton.count();

        if (count === 0) {
            try {
                await expect(this.page.getByText("No categories found")).toBeVisible({ timeout: 30000 });
            }
            catch {
                console.log("Data might have loaded now proceed!");

                //update count after data loaded
                count = await this.deleteButton.count();
            }
        }

        const toast = page.getByText(commonConstants.toastMessages.CATEGORY_DELETED_SUCCESSFULLY).first();

        for (var i = 0; i < count; i++) {
            await this.deleteButton.first().click();
            await Promise.all([
                this.modalOkBtn.click(),
                expect(toast).toBeVisible({ timeout: 15000 }),
                await page.waitForLoadState('networkidle')
            ]);
            await expect(toast).toBeHidden({ timeout: 10000 });
            await page.waitForLoadState('networkidle');
        }

        try {
            await expect(this.deleteButton).toHaveCount(0);
        }
        catch {
            this.deleteAllCategories(page);

        }
    }
}