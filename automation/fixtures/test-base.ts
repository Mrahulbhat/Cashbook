import { test as base } from '@playwright/test';
import { BasePage } from '../page-objects/basepage';
import { DashboardPage} from '../page-objects/dashboard';
import { TransactionPage } from '../page-objects/transaction';
import { AccountsPage } from '../page-objects/accounts';
import { CategoryPage } from '../page-objects/category';
import { TransferPage } from '../page-objects/transfer';
import { StatisticsPage } from '../page-objects/statistics';

type fixtures = {
    basePage: BasePage;
    dashboardPage: DashboardPage;
    transactionPage: TransactionPage;
    accountsPage: AccountsPage;
    categoryPage: CategoryPage;
    transferPage: TransferPage;
    statisticsPage: StatisticsPage;
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
    transferPage: async ({ page }, use) => {
        await use(new TransferPage(page));
    },
    statisticsPage: async ({ page }, use) => {
        await use(new StatisticsPage(page));
    },

});