const commonConstants = {

    urls:{
        baseURL: 'https://cashbook-kappa.vercel.app',
        accountsAPI: '/api/account',
        transactionAPI: '/api/transaction',
        categoriesAPI: '/api/category',
        newTransactionAPI: '/api/transaction/new' //when we add a new transaction
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
    }
};

export default commonConstants;