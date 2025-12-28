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

    //dropdown containers=============================================================================
    get dropdownOptions(): Locator {
        return this.page.getByTestId("dropdown_option");
    }
    get dropdownOptions1(): Locator {
        return this.page.getByTestId("dropdown_option1");
    }
    get accountDropdownContainer(): Locator {
        return this.page.locator('#accountDropDown');
    }
    get categoryDropdownContainer(): Locator {
        return this.page.locator('#categoryDropDown');
    }

    // buttons =======================================================================================      

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

    async enterAmount(amount: string) {
        await expect(this.inputFieldById('Amount')).toBeVisible();
        await this.inputFieldById('Amount').pressSequentially(amount);
        await expect(this.inputFieldById('Amount')).toHaveValue(amount);
    }
    async selectAccount(optionText: string) {
        await this.accountDropdownContainer.click();
        await this.dropdownOptions.first().waitFor({ state: 'attached' });
        const rawOptions = await this.dropdownOptions.allTextContents();
        // Normalize text (remove amount in brackets)
        const normalizedOptions = rawOptions.map(text =>
            text.replace(/\s*\(.*?\)/, '').trim()
        );
        expect(normalizedOptions).toContain('Cash');
        const optionIndex = normalizedOptions.findIndex(
            text => text === optionText
        );
        expect(optionIndex).toBeGreaterThanOrEqual(0);
        await this.accountDropdownContainer.selectOption({ index: optionIndex });
    }

    async selectCategory(optionText: string) {
        await this.categoryDropdownContainer.click();
        await this.dropdownOptions.first().waitFor({ state: 'attached' });
        const rawOptions = await this.dropdownOptions.allTextContents();
        // Normalize text (remove amount in brackets)
        const normalizedOptions = rawOptions.map(text =>
            text.replace(/\s*\(.*?\)/, '').trim()
        );
        expect(normalizedOptions).toContain('Food');
        const optionIndex = normalizedOptions.findIndex(
            text => text === optionText
        );
        expect(optionIndex).toBeGreaterThanOrEqual(0);
        await this.categoryDropdownContainer.selectOption({ index: optionIndex });
    }

}