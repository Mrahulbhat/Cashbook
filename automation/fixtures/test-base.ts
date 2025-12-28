import { test as base } from '@playwright/test';
import { BasePage } from '../page-objects/basepage';
import { DashboardPage} from '../page-objects/dashboard';
import { TransactionPage } from '../page-objects/transaction';
import { AccountsPage } from '../page-objects/accounts';
import { CategoryPage } from '../page-objects/category';

type fixtures = {
    basePage: BasePage;
    dashboardPage: DashboardPage;
    transactionPage: TransactionPage;
    accountsPage: AccountsPage;
    categoryPage: CategoryPage;
}

export const test = base.extend<fixtures>({
    page: async ({ page }, use) => {
        await page.addInitScript(() => {
            (window as any).inAutomation = true;
        });
        await use(page);
    },

    basePage: async ({ page }, use) => {
        await use(new BasePage(page));
    },
    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },
    transactionPage: async ({ page }, use) => {
        await use(new TransactionPage(page));
    },
    accountsPage: async ({ page }, use) => {
        await use(new AccountsPage(page));
    },
    categoryPage: async ({ page }, use) => {
        await use(new CategoryPage(page));
    },

});