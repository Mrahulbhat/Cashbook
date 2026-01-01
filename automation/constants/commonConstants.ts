const commonConstants = {

    urls: {
        baseURL: 'https://cashbook-kappa.vercel.app',
        accountsAPI: '/api/account',
        transactionAPI: '/api/transaction',
        categoriesAPI: '/api/category',
        newTransactionAPI: '/api/transaction/new',
        newAccountAPI: '/api/account/new',
        newCategoryAPI: '/api/category/new',
    },

    pageName: {
        DASHBOARD: 'dashboard',
        TRANSACTIONS: 'transactions',
        ACCOUNTS: 'accounts',
        TRANSFER: 'transfer',
        CATEGORIES: 'categories',
        STATISTICS: 'statistics'
    },

    toastMessages: {
        TRANSACTION_ADDED_SUCCESSFULLY: 'Transaction added successfully',
        TRANSACTION_UPDATED_SUCCESSFULLY: 'Transaction updated successfully',
        TRANSACTION_DELETED_SUCCESSFULLY: 'Transaction deleted successfully',

        ACCOUNT_CREATED_SUCCESSFULLY: 'Account created successfully',
        ACCOUNT_ALREADY_EXISTS: 'Account with this name already exists',
        ACCOUNT_DELETED_SUCCESSFULLY: 'Account deleted successfully',
        ACCOUNT_UPDATED_SUCCESSFULLY: 'Account updated successfully',

        CATEGORY_CREATED_SUCCESSFULLY: 'Category created successfully',
        CATEGORY_ALREADY_EXISTS: 'Category with this name already exists',
        CATEGORY_DELETED_SUCCESSFULLY: 'Category deleted successfully',
        CATEGORY_UPDATED_SUCCESSFULLY: 'Category updated successfully',
    },

    //update all to test once testing is complete
    CATEGORIES: [
        { name: "Food", type: "expense", parentCategory: "Needs", budget: "1000" },
        { name: "Shopping", type: "expense", parentCategory: "Wants", budget: "1000" },
        { name: "SIP", type: "expense", parentCategory: "Savings/Investment", budget: "1000" },
        { name: "Salary", type: "income", parentCategory: "Income" },
        { name: "TEST", type: "expense", parentCategory: "TEST", budget: "1000" },
        { name: "TEST1", type: "income", parentCategory: "Income", budget: "1000" },
    ],

    //update all to test once testing is complete
    ACCOUNTS: [
        { name: "CANARA_BANK", balance: "1000" },
        { name: "Cash", balance: "1000" },
        { name: "SIP", balance: "1000" },
        { name: "PPF", balance: "1000" }
    ],

    TRANSACTIONS: [
        { amount: "1000", type: "income", accountName: "CANARA_BANK", categoryName: "TEST1", date: '2025-12-29', description: 'TEST AUTOMATION' },
        { amount: "1000", type: "income", accountName: "Cash", categoryName: "TEST1", date: '2025-12-29', description: 'TEST AUTOMATION' },
        { amount: "1000", type: "income", accountName: "CANARA_BANK", categoryName: "TEST1", date: '2025-12-29', description: 'TEST AUTOMATION' },
        { amount: "1000", type: "income", accountName: "Cash", categoryName: "TEST1", date: '2025-12-29', description: 'TEST AUTOMATION' },
        { amount: "1000", type: "income", accountName: "CANARA_BANK", categoryName: "TEST1", date: '2025-12-29', description: 'TEST AUTOMATION' },
        { amount: "1000", type: "expense", accountName: "Cash", categoryName: "TEST", date: '2025-12-29', description: 'TEST AUTOMATION' },
        { amount: "1000", type: "expense", accountName: "CANARA_BANK", categoryName: "TEST", date: '2025-12-29', description: 'TEST AUTOMATION' },
        { amount: "1000", type: "expense", accountName: "Cash", categoryName: "TEST", date: '2025-12-29', description: 'TEST AUTOMATION' },
        { amount: "1000", type: "expense", accountName: "CANARA_BANK", categoryName: "TEST", date: '2025-12-29', description: 'TEST AUTOMATION' },
        { amount: "1000", type: "expense", accountName: "Cash", categoryName: "TEST", date: '2025-12-29', description: 'TEST AUTOMATION' },

    ]
};

export default commonConstants;