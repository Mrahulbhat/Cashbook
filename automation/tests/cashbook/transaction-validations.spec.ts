import {test} from '@playwright/test';

test.describe('Transaction Validations', () => {
  test('should validate transaction fields correctly', async ({ page }) => {
    // Navigate to the transaction page
    await page.goto('/transactions');

    // Fill in the transaction form with invalid data
    await page.fill('#transaction-amount', '-100'); // Invalid negative amount
    await page.fill('#transaction-date', '2024-13-01'); // Invalid date format
    await page.fill('#transaction-description', ''); // Empty description

    // Submit the form
    await page.click('#submit-transaction');

    // Check for validation error messages
    const amountError = await page.locator('#amount-error').textContent();
    const dateError = await page.locator('#date-error').textContent();
    const descriptionError = await page.locator('#description-error').textContent();

    // Assert that the correct validation messages are displayed
    test.expect(amountError).toBe('Amount must be a positive number.');
    test.expect(dateError).toBe('Date must be in the format YYYY-MM-DD.');
    test.expect(descriptionError).toBe('Description cannot be empty.');
  });
});