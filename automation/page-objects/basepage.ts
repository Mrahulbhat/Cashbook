import {expect,Locator,Page} from '@playwright/test';

export class BasePage {
    public page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    setPage(newPage: Page) {
        this.page = newPage;
    }

    get resultsTable(): Locator {
        return this.page.locator('table[data-testid="resultsTable"]');
    }

    get buttonElementById(): (id: string) => Locator {
        return (id: string) => this.page.locator(`#${id}`);
    }
}