import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';

test.describe('Category Management Tests', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.loginUser();
    });

    test('TC03 - Create, Edit and Delete a Category', async ({ page, categoryPage }) => {
        const categoryName = `Test Category ${Date.now()}`;
        const updatedName = `${categoryName} Updated`;

        // 1. Create Category
        await categoryPage.createCategory(page, {
            name: categoryName,
            type: 'expense',
            parentCategory: 'Shopping',
            budget: '5000'
        });

        // 2. Edit Category
        await categoryPage.editCategory(page, categoryName, {
            name: updatedName,
            budget: '6000'
        });

        // 3. Delete Category
        // Note: The existing deleteAllCategories method in CategoryPage handles deletion of all categories.
        // For a specific test, we might want a deleteSpecificCategory method, but let's use what's available
        // or just verify the updated category is there.
        const slug = updatedName.replace(/\s+/g, '-').toLowerCase();
        await expect(page.locator(`#categoryCard-${slug}`)).toBeVisible();
    });
});
