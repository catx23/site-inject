import { expect } from 'chai';
import { Before, Given, Then, When } from 'cucumber';
import { Page, Request } from 'puppeteer';
import * as debug from '../../common';
import { Scope, default_session_events_path } from '../../common';
import { replay_api_overview, sessionName, defaultPageOptions, maxSessionWaitingTime, defaultMutationRoot, defaultMutationTag, defaultHeavyMutations } from '../../common/constants';
import { SessionWithName, waitForResponse, default_postdata, waitForResponseNTimes } from '../../common/network';
import { loginFrontEnd, navigateToUserSessions, navigateToUserLocalhost } from '../../common/processes';
import { initCli } from '../cli';
import { sync as write } from '@xblox/fs/write';
initCli();
Given('I am connected to an injected site', async function () {
    const ctx: any = this.context;
    ctx.logger.info('Given : I am connected to an injected site', this.args.url);
    const page: Page = this.page;
    await page.goto(this.args.url, defaultPageOptions());
    await page.setViewport({ width: 800, height: 800 });
    //expect(await page.evaluate('typeof dT_')).equals('object');
    console.log('dt : ', await page.evaluate('typeof dT_'));
});

When('I received my recorded session', async function () {
    const sessionName = this.args.url + this.sessionSuffix;
    const SessionWithName2 = (responseData: any) => {
        if (responseData && responseData.users) {
            const sessions = responseData.users.find((user: any) => user.id === sessionName) || [];
            sessions.length && console.log('found my session ' + sessionName, sessions.length);
            return sessions.length > 0;
        }
        return false;
    }

    const userSessionList = await waitForResponseNTimes(replay_api_overview, this as Scope, SessionWithName2, maxSessionWaitingTime);
    const ctx: any = this.context;
    ctx.logger.info('I received my recorded session', this.args.dynatraceUrl);
    expect((userSessionList as any[]).length).not.equal(0);
});

Given('I am connected to the Dynatrace front-end', async function () {
    const ctx: any = this.context;
    ctx.logger.info('I am connected to the dynatrace front-end', this.args.dynatraceUrl);
    const page: Page = this.page;
    await loginFrontEnd(page, this.args);
});

Then('I navigated to User Sessions', async function () {
    const ctx: any = this.context;
    ctx.logger.info('I navigated to User Sessions', this.args.dynatraceUrl);
    const page: Page = this.page;
    await navigateToUserSessions(page, this.args);
});

Then('I wait {int} seconds', async function (secs) {
    const ctx: any = this.context;
    ctx.logger.info(`I wait ${secs} seconds`);
    return new Promise((resolve) => setTimeout(resolve, secs * 1000));
});

Then('I create {int} mutations', async function (nb) {
    const ctx: any = this.context;
    ctx.logger.info(`I create ${nb} mutations`);
    const page: Page = this.page;
    await page.focus('#nbOfMutations')
    await page.type('#nbOfMutations', '' + nb, {
        delay: 100
    });
    await page.click('#btnStartMutations');
    return new Promise((resolve) => setTimeout(resolve, 6 * 1000));
});

Then('I create {int} options', async function (nb) {
    const ctx: any = this.context;
    ctx.logger.info(`I create ${nb} options`);
    const page: Page = this.page;
    const fn = `createOptions(${nb})`;
    expect(await page.evaluate(fn)).equals(true);
    return new Promise((resolve) => setTimeout(resolve, 3 * 1000));
});


Then('I select the {int} option', async function (index) {
    const ctx: any = this.context;
    ctx.logger.info(`I select the ${index || 10} option`);
    const page: Page = this.page;
    await page.select('.blueTable > tbody > tr > td > #select', `${index}`);
    return Promise.resolve();
});


Then('I create {int} {string} elements', async function (nb, tag) {
    const ctx: any = this.context;
    ctx.logger.info(`I create ${nb} elements with a tag ` + tag);
    const page: Page = this.page;
    let root = defaultMutationRoot;
    nb = nb || defaultHeavyMutations;
    tag = tag || defaultMutationTag;
    const fn = `createNElements('${root}',${nb},'${tag}')`;
    console.log('run create elements fn ' + fn);
    expect(await page.evaluate(fn)).equals(true);
    return new Promise((resolve) => setTimeout(resolve, 6 * 1000));
});

Then('I navigate away', async function () {
    const ctx: any = this.context;
    ctx.logger.info('I navigate away', this.args.dynatraceUrl);
    const page: Page = this.page;
    await navigateToUserLocalhost(page, null);
});
Then('I close the browser and exit', async function () {
    const ctx: any = this.context;
    ctx.logger.info('I close the browser', this.args.dynatraceUrl);
    const page: Page = this.page;
    // await page.tracing.stop();
    await page.close();
    const browser = await page.browser();
    browser.close();
    process.exit();
});

Given('A red box is shown', async function () {
    const ctx: any = this.context;
    ctx.logger.info('A red box is shown');
    const page: Page = this.page;
    const div = await page.$('#animate');
    expect(div).not.equal(null);
});

Given('a black button', async function () {
    const ctx: any = this.context;
    ctx.logger.info(`Given a black button`);
});

When('I click the animate button', async function () {
    const ctx: any = this.context;
    ctx.logger.info(`I click the black button`);
    const page: Page = this.page;
    await page.click('#animate');
});
When('I click the red button', async function () {
    const ctx: any = this.context;
    ctx.logger.info(`I click the black button`);
    const page: Page = this.page;
    await page.click('#root2');
});

When('I click the resize button', async function () {
    const ctx: any = this.context;
    ctx.logger.info(`I click the resize button`);
    const page: Page = this.page;
    await page.click('#resize');
});

Then('the backend has {int} click events', async function (value: number) {
    const ctx: any = this.context;
    ctx.logger.info(`the backend has ${value} click events`);
    expect(1).equals(value);
});

Then('I stop the recording session', async function () {
    const ctx: any = this.context;
    const page: Page = this.page;
    const name = sessionName(this.args.url + this.sessionSuffix);
    ctx.logger.info(`I stop the recording session with : ` + name);
    const stop = `stopRecording('${name}')`;
    expect(await page.evaluate(stop)).equals(true);
});

Then('I save the events', async function () {
    const scope = this as Scope;
    if (scope.eventBeacons) {
        const path = default_session_events_path(process.cwd(), this.args.url);
        write(path, {
            events:scope.eventBeacons,
            mutations:scope.mutationBeacons
        });
    }
});


Before({ tags: '@foo' }, async function () {
    this.foo = true;
});
