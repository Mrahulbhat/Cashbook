import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basepage';
import commonConstants from '../constants/commonConstants';
import { waitForApiResponse } from './common-functions';

export class SettingsPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get settingsTitle(): Locator {
        return this.page.locator('#SettingsTitle');
    }
    get wipeDataBtn(): Locator {
        return this.page.locator('#WipeDataBtn');
    }
    get deleteAccountButton(): Locator {
        return this.page.locator('#DeleteAccountBtn');
    }
}