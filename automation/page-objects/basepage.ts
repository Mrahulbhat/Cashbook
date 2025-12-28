import {expect,Locator,Page} from '@playwright/test';

export class BasePage {
    public page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    setPage(newPage: Page) {
        this.page = newPage;
    }

    buttonByTestId(title: string): Locator {
        return this.page.getByTestId(`button${title}`);
    }
}