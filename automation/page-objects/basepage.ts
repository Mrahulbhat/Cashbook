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
    inputFieldById(name: string): Locator {
        return this.page.locator(`#${name}Input`);
    }
    get nameInput(): Locator {
        return this.inputFieldById('Name');
    }
    get amountInput(): Locator {
        return this.inputFieldById('Amount');
    }
    get balanceInput(): Locator {
        return this.inputFieldById('Balance');
    }
    get budgetInput(): Locator {
        return this.inputFieldById('Budget');
    }
    get dateInput(): Locator {
        return this.inputFieldById('Date');
    }
    get descriptionInput(): Locator {
        return this.inputFieldById('Description');
    }
    get incomeRadio(): Locator {
        return this.page.locator('#TypeRadio-income');
    }
    get expenseRadio(): Locator {
        return this.page.locator('#TypeRadio-expense');
    }

    // when no records found
    get noRecordsFound(): Locator {
        return this.page.locator('#noRecordsFound');
    }
    get navbarUserName(): Locator {
        return this.page.locator('#userName_navbar');
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
        return this.page.locator('#CategoryDropdownOptions');
    }

    // buttons =======================================================================================      

    get modalOkBtn(): Locator {
        return this.page.locator('#DeleteBtn'); // Modal OK/Confirm was standardized to DeleteBtn or SaveBtn in some places, but usually DeleteBtn for confirmations. Actually I should check modal.
    }
    get addButton(): Locator {
        return this.page.locator('#AddBtn');
    }
    get saveButton(): Locator {
        return this.page.locator('#SaveBtn');
    }
    get submitButton(): Locator {
        return this.page.locator('#SubmitBtn');
    }
    get editButton(): Locator {
        return this.page.locator('#EditBtn');
    }
    get deleteButton(): Locator {
        return this.page.locator('#DeleteBtn');
    }
    get backButton(): Locator {
        return this.page.locator('#BackBtn');
    }
    get cancelButton(): Locator {
        return this.page.locator('#CancelBtn');
    }
    get monthlyFilterButton(): Locator {
        return this.page.locator(`#FilterBtn-monthly`);
    }
    get yearlyFilterButton(): Locator {
        return this.page.locator(`#FilterBtn-yearly`);
    }
    get lifetimeFilterButton(): Locator {
        return this.page.locator(`#FilterBtn-lifetime`);
    }

    async enterAmount(amount: string) {
        await expect(this.amountInput).toBeVisible();
        await this.amountInput.fill(amount);
        await expect(this.amountInput).toHaveValue(amount);
    }
    async selectAccount(optionText: string) {
        await this.accountDropdownContainer.click();
        try {
            await this.accountDropdownContainer.selectOption(optionText);
        }
        catch {
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
    }

    async selectCategory(optionText: string) {
        await this.categoryDropdownContainer.click();
        try {
            await this.categoryDropdownContainer.selectOption(optionText);
        }
        catch {
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
    }

    async selectDate(dateString: string = new Date().toISOString().split('T')[0]) {
        await expect(this.dateInput).toBeVisible();
        await this.dateInput.fill(dateString);
        await expect(this.dateInput).toHaveValue(dateString);
    }
}