import commonConstants from '../constants/commonConstants.js';

export function navigateToLoginPage(page: any) {
    return page.goto(commonConstants.loginUrl);
}