import CommonConstants from '../constants/commonConstants.js';
import { SettingsPage } from './settings.js';

export async function navigateToPage(page: any, pageName: string) {
    switch (pageName) {

        case CommonConstants.urls.baseURL:
            await page.goto(CommonConstants.urls.baseURL);
            break;

        case CommonConstants.pageName.DASHBOARD:
            await page.goto(`${CommonConstants.urls.baseURL}/${CommonConstants.pageName.DASHBOARD}`);
            await Promise.all([
                page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.accountsAPI) && response.status() === 200, { timeout: 15000 }),
                page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.transactionAPI) && response.status() === 200, { timeout: 15000 }),
            ]);
            break;

        case CommonConstants.pageName.TRANSACTIONS:
            await page.goto(`${CommonConstants.urls.baseURL}/${CommonConstants.pageName.TRANSACTIONS}`);
            await page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.transactionAPI) && response.status() === 200 || 304, { timeout: 15000 });

            break;

        case CommonConstants.pageName.ACCOUNTS:
            await page.goto(`${CommonConstants.urls.baseURL}/${CommonConstants.pageName.ACCOUNTS}`);
            try {
                await page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.accountsAPI) && response.status() === 200 || 304, { timeout: 15000 });
            }
            catch {
                console.log('Intercept might have arrived before');
            }
            break;

        case CommonConstants.pageName.TRANSFER:
            await page.goto(`${CommonConstants.urls.baseURL}/${CommonConstants.pageName.TRANSFER}`);
            await page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.accountsAPI) && response.status() === 200 || 304, { timeout: 15000 });
            break;

        case CommonConstants.pageName.CATEGORIES:
            await page.goto(`${CommonConstants.urls.baseURL}/${CommonConstants.pageName.CATEGORIES}`);
            await page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.categoriesAPI) && response.status() === 200 || 304, { timeout: 15000 });
            break;

        case CommonConstants.pageName.STATISTICS:
            await page.goto(`${CommonConstants.urls.baseURL}/${CommonConstants.pageName.STATISTICS}`);
            await Promise.all([
                await page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.categoriesAPI) && response.status() === 200 || 304, { timeout: 15000 }),
                await page.waitForResponse((response: any) => response.url().includes(CommonConstants.urls.transactionAPI) && response.status() === 200 || 304, { timeout: 15000 }),
            ]);
            break;

        case CommonConstants.pageName.SETTINGS:
            await page.goto(`${CommonConstants.urls.baseURL}/${CommonConstants.pageName.SETTINGS}`);
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
    await navigateToPage(page, CommonConstants.pageName.SETTINGS);
    const settingsPage = new SettingsPage(page);
    await settingsPage.deleteAccountButton.click();
    await settingsPage.modalOkBtn.click();
    await waitForApiResponse(page, CommonConstants.urls.logout);
}