import { launch, Page } from 'puppeteer'
import { debug, inspect } from '../../log';
import { readFileSync } from 'fs';
import { Options } from '../../types';
const getTimeFromMetrics = (metrics, name) => metrics.metrics.find(x => x.name === name).value * 1000;
export class Puppeteer {
    static async summary(url: string, options?: Options) {
        const browser = await launch({
            headless: options.headless,
            devtools: false
        });
        const page = await browser.newPage();
        await page.tracing.start({ path: 'trace.json' });
        await page.goto(url, {
            timeout: 60000,
            waitUntil: 'networkidle0'
        });
        // const metrics = await (page as any)._client.send('Performance.getMetrics');
        const metrics = await page.metrics();
        await page.close();
        browser.close();
        return metrics;
    }

    static async detail(url: string, options?: Options) {
        const browser = await launch({
            headless: options.headless,
            devtools: false
        });
        const page = await browser.newPage();
        await page.tracing.start({ path: 'trace.json' });
        await page.goto(url, {
            timeout: 60000,
            waitUntil: 'networkidle0'
        });
        const metrics = await (page as any)._client.send('Performance.getMetrics');

        const navigationStart = getTimeFromMetrics(metrics, 'NavigationStart');
        await page.tracing.stop();


        // --- extracting data from trace.json ---
        const tracing = JSON.parse(readFileSync('./trace.json', 'utf8'));
        const htmlTracing = tracing.traceEvents.filter(x => (
            x.cat === 'devtools.timeline' &&
            typeof x.args.data !== 'undefined' &&
            typeof x.args.data.url !== 'undefined' &&
            (x.args.data.url as string).startsWith(url)
        ));
        const HtmlResourceSendRequest = htmlTracing.find(x => x.name === 'ResourceSendRequest');
        // inspect('html tracing ', htmlTracing);

        const HtmlId = HtmlResourceSendRequest.args.data.requestId;
        const htmlTracingEnds = tracing.traceEvents.filter(x => (
            x.cat === 'devtools.timeline' &&
            typeof x.args.data !== 'undefined' &&
            typeof x.args.data.requestId !== 'undefined' &&
            x.args.data.requestId === HtmlId
        ));
        const HtmlResourceReceiveResponse = htmlTracingEnds.find(x => x.name === 'ResourceReceiveResponse');
        const HtmlResourceReceivedData = htmlTracingEnds.find(x => x.name === 'ResourceReceivedData');
        const HtmlResourceFinish = htmlTracingEnds.find(x => x.name === 'ResourceFinish');

        // --- end extracting data from trace.json ---

        await page.close();

        let results = [
            {
                variable: 'HtmlResourceReceiveResponse',
                value: HtmlResourceReceiveResponse.ts / 1000 - navigationStart
            },
            {
                variable: 'HtmlResourceReceivedData',
                value: HtmlResourceReceivedData.ts / 1000 - navigationStart
            },
            {
                variable: 'HtmlResourceSendRequest',
                value: HtmlResourceSendRequest.ts / 1000 - navigationStart
            },
            {
                variable: 'HtmlResourceFinish',
                value: HtmlResourceFinish.ts / 1000 - navigationStart
            },
        ];
        browser.close();
        return results;
    }
}
