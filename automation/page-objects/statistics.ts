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

    get incomeCard(): Locator {
        return this.page.locator('#statsIncomeCard');
    }

    get expenseCard(): Locator {
        return this.page.locator('#statsExpenseCard');
    }

    get savingsCard(): Locator {
        return this.page.locator('#statsSavingsCard');
    }

    get filterMonthly(): Locator {
        return this.page.locator('#FilterBtn-monthly');
    }

    get filterYearly(): Locator {
        return this.page.locator('#FilterBtn-yearly');
    }

    get filterLifetime(): Locator {
        return this.page.locator('#FilterBtn-lifetime');
    }

    get filterComparison(): Locator {
        return this.page.locator('#FilterBtn-comparison');
    }

    async selectFilter(filter: 'monthly' | 'yearly' | 'lifetime' | 'comparison') {
        const filterBtn = this.page.locator(`#FilterBtn-${filter}`);
        await filterBtn.click();
        await this.page.waitForLoadState('networkidle');
    }
}