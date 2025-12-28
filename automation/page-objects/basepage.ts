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
    get accountDropdownContainer(): Locator {
        return this.page.locator('#accountDropDown');
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
        const dropdownContainer = this.accountDropdownContainer;
        await dropdownContainer.click({force: true});
        await this.page.waitForTimeout(500); 
        await this.page.pause();
        await expect(this.dropdownOptions).toContainText('Cash');
        await expect(this.dropdownOptions).toContainText('Bank Account');
        const option = this.dropdownOptions.filter({ hasText: optionText });
        await option.click();
    }
    async selectCategory(optionText: string) {
        const dropdownContainer = this.page.locator('#categoryDropDown');
        await dropdownContainer.click();
        const option = this.page.getByTestId('dropdown_option').filter({ hasText: optionText });
        await option.click();
    }
}