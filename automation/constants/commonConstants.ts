const test_date = '2026-01-28';

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
        { name: "Fuel", type: "expense", parentCategory: "Needs", budget: "1000" },
        { name: "SIP", type: "expense", parentCategory: "Savings/Investment", budget: "1000" },
        { name: "Salary", type: "income", parentCategory: "Income" },
        { name: "Balance_Adjustment_Income", type: "income", parentCategory: "System" },
        { name: "Balance_Adjustment_Expense", type: "expense", parentCategory: "System" }
    ],

    //update all to test once testing is complete
    ACCOUNTS: [
        { name: "CANARA_BANK", balance: "1000" },
        { name: "Cash", balance: "1000" },
        { name: "SIP", balance: "1000" },
        { name: "PPF", balance: "1000" }
    ],

    TRANSACTIONS: [
        { amount: "1000", type: "income", accountName: "CANARA_BANK", categoryName: "Salary", date: test_date, description: 'TEST AUTOMATION' },
        { amount: "1000", type: "income", accountName: "Cash", categoryName: "Salary", date: test_date, description: 'TEST AUTOMATION' },
        { amount: "1000", type: "income", accountName: "CANARA_BANK", categoryName: "Salary", date: test_date, description: 'TEST AUTOMATION' },
        { amount: "1000", type: "income", accountName: "Cash", categoryName: "Salary", date: test_date, description: 'TEST AUTOMATION' },
        { amount: "1000", type: "income", accountName: "CANARA_BANK", categoryName: "Salary", date: test_date, description: 'TEST AUTOMATION' },
        { amount: "1000", type: "expense", accountName: "Cash", categoryName: "Food", date: test_date, description: 'TEST AUTOMATION' },
        { amount: "1000", type: "expense", accountName: "CANARA_BANK", categoryName: "Shopping", date: test_date, description: 'TEST AUTOMATION' },
        { amount: "1000", type: "expense", accountName: "Cash", categoryName: "Fuel", date: test_date, description: 'TEST AUTOMATION' },
        { amount: "1000", type: "expense", accountName: "CANARA_BANK", categoryName: "Shopping", date: test_date, description: 'TEST AUTOMATION' },
        { amount: "1000", type: "expense", accountName: "Cash", categoryName: "Fuel", date: test_date, description: 'TEST AUTOMATION' },
    ]
};

export default commonConstants;