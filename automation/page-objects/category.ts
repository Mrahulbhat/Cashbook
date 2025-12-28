import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basepage';

export class CategoryPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get addCategoryBtn(): Locator {
        return this.page.locator('#addCategoryBtn');
    }
}