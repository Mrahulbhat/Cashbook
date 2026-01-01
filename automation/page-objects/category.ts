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

    async createCategory(page: Page, category: { name: string; type: string; parentCategory: string, budget?: string }) {
        
        await navigateToPage(page, commonConstants.pageName.CATEGORIES);

        const initialTotalcount = await this.totalCategoryCount.innerText();
        const totalIncomeCategoryCount = await this.totalCategoryCount.innerText();
        const totalExpenseCategoryCount = await this.totalCategoryCount.innerText();

        await this.addCategoryBtn.click();
        await page.waitForLoadState("networkidle");

        await expect(this.categoryNameInputField).toBeVisible();
        await this.categoryNameInputField.fill(category.name);

        //select type income or expense
        category.type === 'income' ? await this.incomeCheckbox.click() : await this.expenseCheckbox.click();

        await expect(this.parentCategoryDropdown).toBeVisible();
        await this.parentCategoryDropdown.selectOption(category.parentCategory);

        await expect(this.budgetInputField).toBeVisible();
        if (category.budget) {
            await this.budgetInputField.fill(category.budget);
        }

        await this.saveButton.click();
        await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.newCategoryAPI) && response.status() === 201 && response.request().method() === "POST", { timeout: 15000 });
        await expect(page.getByText(commonConstants.toastMessages.CATEGORY_CREATED_SUCCESSFULLY)).toBeVisible();

        //verify if account is visible in grid
        await expect(this.page.locator('#categoryDiv' + category.name)).toBeVisible();
    }

    // async deleteAllCategories(page: Page) {
    //     await expect(this.balanceContainer).toBeVisible();

    //     let count = await this.deleteAccBtn.count();
    //     if (count === 0) return;

    //     while (await this.deleteAccBtn.count() > 0) {

    //         await this.deleteAccBtn.first().click();
    //         await this.modalOkBtn.click();

    //         const toast = this.page.getByText(commonConstants.toastMessages.ACCOUNT_DELETED_SUCCESSFULLY).last();

    //         await expect(toast).toBeVisible();
    //         await expect(toast).toBeHidden({ timeout: 10000 });

    //         await this.page.waitForLoadState('networkidle');
    //     }

    //     await expect(this.deleteAccBtn).toHaveCount(0);
    //     await expect(this.balanceContainer).not.toBeVisible();
    // }


}