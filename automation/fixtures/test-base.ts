import path from 'path';
import { test as base } from '@playwright/test';
import { BasePage } from '../page-objects/basepage';
import { DashboardPage } from '../page-objects/dashboard';
import { TransactionPage } from '../page-objects/transaction';
import { AccountsPage } from '../page-objects/accounts';
import { StatisticsPage } from '../page-objects/statistics';
import { LoginPage } from '../page-objects/login-page';
import { SettingsPage } from '../page-objects/settings';

type fixtures = {
    basePage: BasePage;
    dashboardPage: DashboardPage;
    transactionPage: TransactionPage;
    accountsPage: AccountsPage;
    statisticsPage: StatisticsPage;
    loginPage: LoginPage;
    settingsPage: SettingsPage;
}

export const test = base.extend<fixtures>({
    storageState: async ({}, use) => {
        const statePath = path.resolve(__dirname, '../.auth/default.json');
        await use(statePath);
    },
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
    statisticsPage: async ({ page }, use) => {
        await use(new StatisticsPage(page));
    },
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    settingsPage: async ({ page }, use) => {
        await use(new SettingsPage(page));
    },
});