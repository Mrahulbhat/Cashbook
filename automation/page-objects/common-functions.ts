import commonConstants from '../constants/commonConstants.js';
import { LoginPage } from './login-page.js';
import { SettingsPage } from './settings.js';

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

        case commonConstants.pageName.SETTINGS:
            await page.goto(`${commonConstants.urls.baseURL}/${commonConstants.pageName.SETTINGS}`);
            break;

        default: console.error('Invalid page name provided for navigation.');
            return;
    }
}

export async function waitForApiResponse(page: any, url: string) {
    try {
        await page.waitForResponse((response: any) => 
            response.url().includes(url) && 
            [200, 201, 304].includes(response.status()), 
            { timeout: 15000 }
        );
    }
    catch {
        console.log('Intercept might have arrived before or timeout');
    }
}

export function generateRandomPrefix(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}${ms}`;
}


export async function deleteMyAccount(page: any) {
    await navigateToPage(page, commonConstants.pageName.SETTINGS);
    const settingsPage = new SettingsPage(page);
    await settingsPage.deleteAccountButton.click();
    await settingsPage.modalOkBtn.click();
    await waitForApiResponse(page, commonConstants.urls.logout);
}