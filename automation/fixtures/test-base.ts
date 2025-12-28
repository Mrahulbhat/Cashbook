import { test as base } from '@playwright/test';
import { WelcomePage } from '../page-objects/welcomePage';
import { Dashboard } from '../page-objects/dashboard';

type fixtures = {
    welcomepage: WelcomePage;
    dashboard: Dashboard;
}

export const test = base.extend<fixtures>({
    page: async ({ page }, use) => {
        await page.addInitScript(() => {
            (window as any).inAutomation = true;
        });
        await use(page);
    },

    welcomepage: async ({ page }, use) => {
        await use(new WelcomePage(page));
    },
    dashboard: async ({ page }, use) => {
        await use(new Dashboard(page));
    },
});