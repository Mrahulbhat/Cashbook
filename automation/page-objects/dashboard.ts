import {expect,Locator,Page} from '@playwright/test';
import { BasePage } from './basepage';

export class DashboardPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get totalExpense(): Locator {
        return this.page.locator('#totalExpense');
    }
    get sidebar(): Locator {
        return this.page.locator('#sidebar');
    }  
    sidebarTab(tabName: string): Locator {
        return this.page.locator('#' + tabName);
    }
    get balanceCard(): Locator {
        return this.page.locator('#balanceCard');
    }
    get totalExpenseCard(): Locator {
        return this.page.locator('#totalExpenseCard');
    }
    get totalIncomeCard(): Locator {
        return this.page.locator('#totalIncomeCard');
    }
}