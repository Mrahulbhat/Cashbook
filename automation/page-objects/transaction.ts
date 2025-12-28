import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basepage';

export class TransactionPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get addTransactionBtn(): Locator {
        return this.page.locator('#addTransactionBtn');
    }
}