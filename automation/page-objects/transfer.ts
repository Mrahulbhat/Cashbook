import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basepage';

export class TransferPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get transferForm(): Locator {
        return this.page.locator('#transferForm');
    }
}