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
        TRANSACTION_DELETED_SUCCESSFULLY: 'Transaction deleted successfully',

        ACCOUNT_CREATED_SUCCESSFULLY:'Account created successfully',
        ACCOUNT_ALREADY_EXISTS:'Account with this name already exists',
        ACCOUNT_DELETED_SUCCESSFULLY: 'Account deleted successfully',
    },

};

export default commonConstants;