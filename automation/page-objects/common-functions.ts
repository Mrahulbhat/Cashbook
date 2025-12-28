import commonConstants from '../constants/commonConstants.js';

export async function waitForResponse(page: any, urlPart: string, timeout?: number) {
    await page.waitForResponse((response: any) => response.url().includes(urlPart) && response.status() === 200, { timeout: timeout || 15000 });
}

export async function navigateToPage(page: any, pageName: string) {
    switch (pageName) {

        case commonConstants.urls.baseURL:
            await page.goto(commonConstants.urls.baseURL);
            break;

        case commonConstants.pageName.DASHBOARD:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.DASHBOARD}`);
            await Promise.all([
                waitForResponse(page, commonConstants.urls.accountsAPI),
                waitForResponse(page, commonConstants.urls.transactionAPI)
            ]);
            break;

        case commonConstants.pageName.TRANSACTIONS:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.TRANSACTIONS}`);
            await waitForResponse(page, commonConstants.urls.transactionAPI);
            break;

        case commonConstants.pageName.ACCOUNTS:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.ACCOUNTS}`);
            await waitForResponse(page, commonConstants.urls.accountsAPI);
            break;

        case commonConstants.pageName.TRANSFER:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.TRANSFER}`);
            await waitForResponse(page, commonConstants.urls.accountsAPI);
            break;

        case commonConstants.pageName.CATEGORIES:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.CATEGORIES}`);
            await waitForResponse(page, commonConstants.urls.categoriesAPI);
            break;

        case commonConstants.pageName.STATISTICS:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.STATISTICS}`);
            await Promise.all([
                waitForResponse(page, commonConstants.urls.categoriesAPI),
                waitForResponse(page, commonConstants.urls.transactionAPI)
            ]);
            break;

        default: console.error('Invalid page name provided for navigation.');
            return;
    }
}