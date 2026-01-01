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
    get firstRowOfGrid(): Locator {
        return this.page.locator('tr.tablebody').first();
    }
    get recordCountOnTable(): Locator {
        return this.page.locator('#txnCount');
    }
    get editRecordButton(): Locator {
        return this.page.locator('#editRecordBtn');
    }
    inputFieldById(name: string): Locator {
        return this.page.locator(`#${name}InputField`);
    }

    //dropdown containers=============================================================================
    get accountDropdownContainer(): Locator {
        return this.page.locator('#accountDropdown');
    }
    get categoryDropdownContainer(): Locator {
        return this.page.locator('#categoryDropdown');
    }
    get accountDropdownOptions(): Locator {
        return this.page.locator('#accountDropdownOptions');
    }
    get categoryDropdownOptions(): Locator {
        return this.page.locator('#categoryDropdownOptions');
    }

    // buttons =======================================================================================      

    get modalOkBtn():Locator{
        return this.page.locator('#confirmDeleteBtn');
    }
    get saveButton(): Locator {
        return this.page.locator('#saveBtn');
    }
    get editButton(): Locator {
        return this.page.locator('#editBtn');
    }
    get deleteButton(): Locator {
        return this.page.locator('#deleteBtn');
    }
    get updateButton(): Locator {
        return this.page.locator('#updateBtn');
    }
    get backButton(): Locator {
        return this.page.locator('#BackBtn');
    }
    get cancelButton(): Locator {
        return this.page.locator('#cancelBtn');
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
        await this.inputFieldById('Amount').clear();
        await this.inputFieldById('Amount').pressSequentially(amount);
        await expect(this.inputFieldById('Amount')).toHaveValue(amount);
    }
    async selectAccount(optionText: string) {
        await this.accountDropdownContainer.click();
        const dropdownOptions = this.accountDropdownOptions;
        await dropdownOptions.first().waitFor({ state: 'attached' });
        const rawOptions = await dropdownOptions.allTextContents();
        // Normalize text (remove amount in brackets)
        const normalizedOptions = rawOptions.map(text =>
            text.replace(/\s*\(.*?\)/, '').trim()
        );
        expect(normalizedOptions).toContain('Cash');
        const optionIndex = normalizedOptions.findIndex(
            text => text === optionText
        );
        expect(optionIndex).toBeGreaterThanOrEqual(0);
        await this.accountDropdownContainer.selectOption({ index: optionIndex + 1 });
        await this.page.waitForTimeout(500);
        await expect(this.accountDropdownContainer).toContainText(optionText);
    }

    async selectCategory(optionText: string) {
        await this.categoryDropdownContainer.click();
        const dropdownOptions = this.categoryDropdownOptions;
        await dropdownOptions.first().waitFor({ state: 'attached' });
        const rawOptions = await dropdownOptions.allTextContents();
        console.log('Category Options:', rawOptions);

        // Normalize text (remove amount in brackets)
        const normalizedOptions = rawOptions.map(text =>
            text.replace(/\s*\(.*?\)/, '').trim()
        );
        console.log('Normalized Category Options:', normalizedOptions);
        expect(normalizedOptions).toContain(optionText);
        const optionIndex = normalizedOptions.findIndex(
            text => text === optionText
        );
        expect(optionIndex).toBeGreaterThanOrEqual(0);
        await this.categoryDropdownContainer.selectOption({ index: optionIndex + 1 });
        await this.page.waitForTimeout(500);
        await expect(this.categoryDropdownContainer).toContainText(optionText);
    }

    async selectDate(dateString: string = new Date().toISOString().split('T')[0]) {
        const dateInput = this.inputFieldById('date');
        await expect(dateInput).toBeVisible();
        await dateInput.fill(dateString);
        await expect(dateInput).toHaveValue(dateString);
    }
}