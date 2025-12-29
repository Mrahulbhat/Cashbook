const commonConstants = {

    urls:{
        baseURL: 'https://cashbook-kappa.vercel.app',
        accountsAPI: '/api/account',
        transactionAPI: '/api/transaction',
        categoriesAPI: '/api/category',
        newTransactionAPI: '/api/transaction/new', 
        newAccountAPI:'/api/account/new',
    },

    pageName: {
        DASHBOARD: 'dashboard',
        TRANSACTIONS: 'transactions',
        ACCOUNTS: 'accounts',
        TRANSFER: 'transfer',
        CATEGORIES: 'categories',
        STATISTICS: 'statistics'
    },

    toastMessages:{
        TRANSACTION_ADDED_SUCCESSFULLY: 'Transaction added successfully',
        TRANSACTION_UPDATED_SUCCESSFULLY: 'Transaction updated successfully',
        TRANSACTION_DELETED_SUCCESSFULLY: 'Transaction deleted successfully'
    },

    TEST_ACCOUNT_NAME:"Account Name Test",
    TEST_AMOUNT_1000:1000
};

export default commonConstants;