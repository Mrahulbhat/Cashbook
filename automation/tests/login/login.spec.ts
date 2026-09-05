import { test } from '../../fixtures/test-base';

test.describe('Login Functionality Validations', () => {
    test.skip('Login Page test', async ({ loginPage }) => {
        await loginPage.loginUser();
    });
});