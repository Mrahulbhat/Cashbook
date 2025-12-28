import {expect,Locator,Page} from '@playwright/test';
import { BasePage } from './basepage';

export class Dashboard extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get totalExpense(): Locator {
        return this.page.locator('#totalExpense');
    }


        
   
}