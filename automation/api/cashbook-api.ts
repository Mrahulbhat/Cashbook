import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

export type AccountDetails = {
    name?: string;
    balance?: number | string;
    isDefault?: boolean;
};

export type CategoryDetails = {
    name?: string;
    type?: 'income' | 'expense';
    budget?: number | string;
    planningBucket?: string;
    yearlyBudget?: number | string;
    isDefault?: boolean;
};

export type TransactionDetails = {
    amount?: number | string;
    type?: 'income' | 'expense' | 'investment';
    description?: string;
    date?: string;
    account?: string;
    accountId?: string;
    accountName?: string;
    category?: string;
    categoryId?: string;
    categoryName?: string;
    toAccount?: string;
    toAccountId?: string;
};

export type Account = AccountDetails & { _id: string };
export type Category = CategoryDetails & { _id: string };
export type Transaction = TransactionDetails & { _id: string };

type ApiDefaults = {
    account: Required<AccountDetails>;
    category: Required<CategoryDetails>;
    transaction: Required<Pick<TransactionDetails, 'amount' | 'type' | 'description' | 'date'>>;
};

const today = new Date().toISOString().split('T')[0];

export const defaultApiValues: ApiDefaults = {
    account: {
        name: 'API Test Account',
        balance: 0,
        isDefault: false,
    },
    category: {
        name: 'API Test Category',
        type: 'expense',
        budget: 0,
        planningBucket: 'None',
        yearlyBudget: 0,
        isDefault: false,
    },
    transaction: {
        amount: 100,
        type: 'expense',
        description: 'Created by API automation',
        date: today,
    },
};

export class CashbookApi {
    constructor(private readonly context: APIRequestContext) {}

    async createAccount(details: AccountDetails = {}): Promise<Account> {
        return this.post<Account>('/api/accounts', {
            ...defaultApiValues.account,
            ...details,
        });
    }

    async createCategory(details: CategoryDetails = {}): Promise<Category> {
        return this.post<Category>('/api/categories', {
            ...defaultApiValues.category,
            ...details,
        });
    }

    async createTransaction(details: TransactionDetails = {}): Promise<Transaction> {
        const values = { ...defaultApiValues.transaction, ...details };
        const account = details.accountId || details.account ||
            (details.accountName ? await this.findAccountId(details.accountName) : undefined);
        const category = details.categoryId || details.category ||
            (details.categoryName ? await this.findCategoryId(details.categoryName) : undefined);
        const toAccount = details.toAccountId || details.toAccount;

        if (!account) {
            throw new Error('createTransaction requires account, accountId, or accountName');
        }
        if (values.type !== 'investment' && !category) {
            throw new Error('createTransaction requires category, categoryId, or categoryName');
        }

        return this.post<Transaction>('/api/transactions', {
            amount: values.amount,
            type: values.type,
            description: values.description,
            date: values.date,
            account,
            ...(category ? { category } : {}),
            ...(toAccount ? { toAccount } : {}),
        });
    }

    async deleteAccount(name: string): Promise<void> {
        const account = (await this.getAccounts()).find((item) => item.name === name);
        if (account) await this.delete(`/api/accounts/${account._id}`);
    }

    async updateAccount(id: string, details: AccountDetails): Promise<Account> {
        return this.put<Account>(`/api/accounts/${id}`, details);
    }

    async deleteCategory(name: string): Promise<void> {
        const category = (await this.getCategories()).find((item) => item.name === name);
        if (category) await this.delete(`/api/categories/${category._id}`);
    }

    async updateCategory(id: string, details: CategoryDetails): Promise<Category> {
        return this.put<Category>(`/api/categories/${id}`, details);
    }

    async deleteTransaction(description: string): Promise<void> {
        const transaction = (await this.getTransactions()).find((item) => item.description === description);
        if (transaction) await this.delete(`/api/transactions/${transaction._id}`);
    }

    async getAccounts(): Promise<Account[]> {
        return this.get<Account[]>('/api/accounts');
    }

    async getCategories(): Promise<Category[]> {
        return this.get<Category[]>('/api/categories');
    }

    async getTransactions(): Promise<Transaction[]> {
        return this.get<Transaction[]>('/api/transactions');
    }

    private async findAccountId(name: string): Promise<string> {
        const account = (await this.getAccounts()).find((item) => item.name === name);
        if (!account) throw new Error(`Account not found: ${name}`);
        return account._id;
    }

    private async findCategoryId(name: string): Promise<string> {
        const category = (await this.getCategories()).find((item) => item.name === name);
        if (!category) throw new Error(`Category not found: ${name}`);
        return category._id;
    }

    private async get<T>(url: string): Promise<T> {
        const response = await this.context.get(url);
        return this.readResponse<T>(response);
    }

    private async post<T>(url: string, data: object): Promise<T> {
        const response = await this.context.post(url, { data });
        return this.readResponse<T>(response);
    }

    private async put<T>(url: string, data: object): Promise<T> {
        const response = await this.context.put(url, { data });
        return this.readResponse<T>(response);
    }

    private async delete(url: string): Promise<void> {
        const response = await this.context.delete(url);
        await expect(response).toBeOK();
    }

    private async readResponse<T>(response: APIResponse): Promise<T> {
        await expect(response).toBeOK();
        return response.json() as Promise<T>;
    }
}
