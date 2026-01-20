import commonConstants from '../constants/commonConstants.js';

export async function navigateToPage(page: any, pageName: string) {
    switch (pageName) {

        case commonConstants.urls.baseURL:
            await page.goto(commonConstants.urls.baseURL);
            break;

        case commonConstants.pageName.DASHBOARD:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.DASHBOARD}`);
            await Promise.all([
                page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.accountsAPI) && response.status() === 200, { timeout: 15000 }),
                page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.transactionAPI) && response.status() === 200, { timeout: 15000 }),
            ]);
            break;

        case commonConstants.pageName.TRANSACTIONS:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.TRANSACTIONS}`);
            await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.transactionAPI) && response.status() === 200 || 304, { timeout: 15000 });

            break;

        case commonConstants.pageName.ACCOUNTS:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.ACCOUNTS}`);
            try {
                await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.accountsAPI) && response.status() === 200 || 304, { timeout: 15000 });
            }
            catch {
                console.log('Intercept might have arrived before');
            }
            break;

        case commonConstants.pageName.TRANSFER:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.TRANSFER}`);
            await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.accountsAPI) && response.status() === 200 || 304, { timeout: 15000 });
            break;

        case commonConstants.pageName.CATEGORIES:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.CATEGORIES}`);
            await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.categoriesAPI) && response.status() === 200 || 304, { timeout: 15000 });
            break;

        case commonConstants.pageName.STATISTICS:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.STATISTICS}`);
            await Promise.all([
                await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.categoriesAPI) && response.status() === 200 || 304, { timeout: 15000 }),
                await page.waitForResponse((response: any) => response.url().includes(commonConstants.urls.transactionAPI) && response.status() === 200 || 304, { timeout: 15000 }),
            ]);
            break;

        default: console.error('Invalid page name provided for navigation.');
            return;
    }
}

export async function waitForApiResponse(page: any, url: string) {
    try {
        await page.waitForResponse((response: any) => response.url().includes(url) && response.status() === 200 || 304, { timeout: 15000 });
    }
    catch {
        console.log('Intercept might have arrived before');
    }
}

export async function generateRandomPrefix(length: number = 5): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}