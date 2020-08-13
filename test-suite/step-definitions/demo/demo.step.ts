import { Given, Then } from 'cucumber';
import { Page } from 'puppeteer';
import { defaultPageOptions } from '../../common/constants';
import { initCli } from '../cli';
import { loginDemoDev } from '../../common';
initCli();
Given('I am connected to a demo session at {string}', async function (site) {
    const ctx: any = this.context;
    ctx.logger.info('I am connected to a demo session at ' + site);
    const page: Page = this.page;
    await page.goto(site, defaultPageOptions());
    // await page.setViewport({ width: 800, height: 800 });
    //    expect(await page.evaluate('typeof dT_ ')).equals('object');
});

Given('I am logged into demo.dev', async function () {
    const ctx: any = this.context;
    ctx.logger.info('I am logged into demo.dev', this.args.dynatraceUrl);
    const page: Page = this.page;
    await loginDemoDev(page, this.args);
});

Then('I have no request to {string}', async function (url) {
    
})