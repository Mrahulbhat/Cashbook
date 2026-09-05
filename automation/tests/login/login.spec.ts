import { test } from '../../fixtures/test-base';

test.describe('Login Functionality Validations', () => {
    test('Login Page test', async ({ loginPage }) => {
        await loginPage.loginUser();
    });
});