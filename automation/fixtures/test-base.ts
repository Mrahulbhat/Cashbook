import { test as base } from '@playwright/test';
import { WelcomePage } from '../page-objects/welcomePage';
import { DashboardPage} from '../page-objects/dashboard';

type fixtures = {
    welcomePage: WelcomePage;
    dashboardPage: DashboardPage;
}

export const test = base.extend<fixtures>({
    page: async ({ page }, use) => {
        await page.addInitScript(() => {
            (window as any).inAutomation = true;
        });
        await use(page);
    },

    welcomePage: async ({ page }, use) => {
        await use(new WelcomePage(page));
    },
    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },
});