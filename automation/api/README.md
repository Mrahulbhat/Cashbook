# API test helpers

Import the shared fixture instead of Playwright's base test:

```ts
import { expect } from '@playwright/test';
import { test } from '../../fixtures/test-base';

test('create records through the API', async ({ api }) => {
    const account = await api.createAccount({
        name: `API Account ${Date.now()}`,
        balance: 1000,
    });

    const category = await api.createCategory({
        name: `API Category ${Date.now()}`,
        type: 'expense',
    });

    const transaction = await api.createTransaction({
        amount: 250,
        accountId: account._id,
        categoryId: category._id,
        description: 'API setup transaction',
    });

    expect(transaction._id).toBeTruthy();
});
```

`createAccount()` and `createCategory()` apply defaults from `defaultApiValues`. Transactions also default `amount`, `type`, `description`, and `date`, but require an account and category for non-investment transactions. A transaction can use `accountName` and `categoryName`; the helper resolves those names through the authenticated API before posting.
