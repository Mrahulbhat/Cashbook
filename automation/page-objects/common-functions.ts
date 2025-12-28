import commonConstants from '../constants/commonConstants.js';

export async function navigateToPage(page: any,pageName?: string) {
    if(!pageName){
        pageName = commonConstants.baseURL;
    }
    await page.goto(pageName);
}
