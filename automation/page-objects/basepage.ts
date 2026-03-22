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

    get navbarUserName(): Locator {
        return this.page.locator('#userName_navbar');
    }

    //dropdown containers=============================================================================
    get accountDropdownContainer(): Locator {
        return this.page.locator('#AccountDropdown');
    }
    get categoryDropdownContainer(): Locator {
        return this.page.locator('#CategoryDropdown');
    }
    get accountDropdownOptions(): Locator {
        return this.page.locator('#accountDropdownOptions');
    }
    get categoryDropdownOptions(): Locator {
        return this.page.locator('#CategoryDropdownOptions');
    }

    // buttons =======================================================================================      

    get modalOkBtn(): Locator {
        return this.page.locator('#ConfirmationModal #DeleteBtn');
    }
    get logoutButton(): Locator {
        return this.page.locator('#LogoutBtn');
    }
    get addButton(): Locator {
        return this.page.locator('#AddBtn').first();
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
        await expect(this.accountDropdownContainer).toBeVisible();
        try {
            // Wait for at least one option beyond the placeholder
            await expect(this.accountDropdownContainer.locator('option').nth(1)).toBeAttached({ timeout: 15000 });
        } catch (e) {
            const currentOptions = await this.accountDropdownContainer.locator('option').allTextContents();
            console.error(`Timeout waiting for options in Account dropdown. Current options: [${currentOptions.join(', ')}]`);
            throw e;
        }
        await this.accountDropdownContainer.selectOption({ label: optionText });
    }

    async selectCategory(optionText: string) {
        await expect(this.categoryDropdownContainer).toBeVisible();
        try {
            // Wait for at least one option beyond the placeholder
            await expect(this.categoryDropdownContainer.locator('option').nth(1)).toBeAttached({ timeout: 15000 });
        } catch (e) {
            const currentOptions = await this.categoryDropdownContainer.locator('option').allTextContents();
            console.error(`Timeout waiting for options in Category dropdown. Current options: [${currentOptions.join(', ')}]`);
            throw e;
        }
        await this.categoryDropdownContainer.selectOption({ label: optionText });
    }

    async selectDate(dateString: string = new Date().toISOString().split('T')[0]) {
        await expect(this.dateInput).toBeVisible();
        await this.dateInput.fill(dateString);
        await expect(this.dateInput).toHaveValue(dateString);
    }
}