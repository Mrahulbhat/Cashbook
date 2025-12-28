import {expect,Locator,Page} from '@playwright/test';
import { BasePage } from './basepage';

export class WelcomePage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    buttonByTestId(title: string): Locator {
        return this.page.getByTestId(`button${title}`);
    }
}