import { test as base } from '@playwright/test';
import { BasePage } from '../page-objects/basepage';
import { DashboardPage} from '../page-objects/dashboard';

type fixtures = {
    basePage: BasePage;
    dashboardPage: DashboardPage;
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
});