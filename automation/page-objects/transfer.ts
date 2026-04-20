import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basepage';

export class TransferPage extends BasePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    get transferForm(): Locator {
        return this.page.locator('#TransferForm');
    }

    get fromAccountDropdown(): Locator {
        return this.page.locator('#FromAccountDropdown');
    }

    get toAccountDropdown(): Locator {
        return this.page.locator('#ToAccountDropdown');
    }

    async performTransfer(page: Page, transfer: { fromAccount: string; toAccount: string; amount: string; description?: string; }) {
        await this.page.locator('#transfer').click(); // Navigate to transfer via sidebar
        await expect(this.transferForm).toBeVisible();

        await this.fromAccountDropdown.selectOption({ label: transfer.fromAccount });
        await this.toAccountDropdown.selectOption({ label: transfer.toAccount });
        await this.amountInput.fill(transfer.amount);

        if (transfer.description) {
            await this.descriptionInput.fill(transfer.description);
        }

        await this.submitButton.click();
        
        // Wait for both transaction API calls (one for outflow, one for inflow)
        await page.waitForResponse(response => response.url().includes('/api/transactions') && response.status() === 201, { timeout: 15000 });
        
        await expect(page.getByText('Transfer completed!')).toBeVisible();
    }
}