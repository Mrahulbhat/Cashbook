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
    get addTransactionForm(): Locator {
        return this.page.locator('#addTransactionForm');
    }
    get incomeRadioBox(): Locator {
        return this.page.locator('#incomeRadioBox');
    }
    get expenseRadioBox(): Locator {
        return this.page.locator('#expenseRadioBox');
    }
}