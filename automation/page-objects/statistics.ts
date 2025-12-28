import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basepage';

export class StatisticsPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get statsContainer(): Locator {
        return this.page.locator('#statsContainer');
    }
}