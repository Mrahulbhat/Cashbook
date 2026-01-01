import { test } from '../fixtures/test-base.js';
import { expect } from '@playwright/test';
import { navigateToPage } from '../page-objects/common-functions.js';
import { waitForResponse } from '../page-objects/common-functions.js';
import commonConstants from '../constants/commonConstants.js';

test.describe('Data Setup', () => {

    test.skip('TC01 - Setup 5 accounts', async ({ page, accountsPage }) => {

        const accounts = [{name:"Bank Account",balance:"1000"},{name:"Cash",balance:"1000"},{name:"SIP",balance:"1000"},{name:"PPF",balance:"1000"}];

        for(account in accounts){
            await accountsPage.addAccountBtn.click();
            await accountsPage.inputFieldById()
        }

       
    });

    //create a feature to delete all accounts

    // test.skip('', async ({ page, dashboardPage }) => {

    //     const accounts = [{name:"Bank Account",balance:"1000"},{name:"Cash",balance:"1000"},{name:"SIP",balance:"1000"},{name:"PPF",balance:"1000"}];

    //     await navigateToPage(page,commonConstants.pageName.ACCOUNTS);

    //     for(account in accounts){
            
    //     }

       
    // });
});