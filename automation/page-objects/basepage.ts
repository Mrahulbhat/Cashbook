import { expect, Locator, Page } from '@playwright/test';

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

    inputFieldById(name: string): Locator {
        return this.page.locator(`#${name}InputField`);
    }

    // buttons ==============================================================================

    get backButton(): Locator {
        return this.page.locator('#BackBtn');
    }

    get monthlyFilterButton(): Locator {
        return this.page.locator(`#monthlyFilterBtn`);
    }
    get yearlyFilterButton(): Locator {
        return this.page.locator(`#yearlyFilterBtn`);
    }
    get lifetimeFilterButton(): Locator {
        return this.page.locator(`#lifetimeFilterBtn`);
    }
}