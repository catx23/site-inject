import { launch, Page } from 'puppeteer'
import { debug, inspect } from '../../log';
import { readFileSync } from 'fs';
import { Options } from '../../types';

// the actual metrics extraction has been taken from a github issue!
const included_categories = ['devtools.timeline'];

const report_item = (name: string) => {
    return {
        name: name,
        value: 0,
        formatted: '',
        count: 0,
        cached_count: 0
    }
}

const report = () => {
    return [
        report_item('Received Total'),
        report_item('Received Stylesheets'),
        report_item('Received Scripts'),
        report_item('Received HTML'),
        report_item('Received JSON'),
        report_item('Received Images'),
        report_item('Received Fonts'),
        report_item('Received Binary')
    ]
}
const find_report = (where: any[], name: string) => where.find((media) => media.name === name);
const get_report = (where: any[], type: string) => {
    let record = find_report(where, type);
    if (!record) {
        record = report_item(type);
        where.push(record);
    }
    return record;
}

const humanReadableFileSize = (bytes: number, si: boolean = true) => {
    var units;
    var u;
    var b = bytes;
    var thresh = si ? 1000 : 1024;
    if (Math.abs(b) < thresh) {
        return b + ' B';
    }
    units = si
        ? ['kB', 'MB', 'GB', 'TB']
        : ['KiB', 'MiB', 'GiB', 'TiB'];
    u = -1;
    do {
        b /= thresh;
        ++u;
    } while (Math.abs(b) >= thresh && u < units.length - 1);
    return b.toFixed(1) + ' ' + units[u];
};

const getTimeFromMetrics = (metrics, name) => metrics.metrics.find(x => x.name === name).value * 1000;
export class Puppeteer {
    static async begin(url: string, options: Options) {
        const browser = await launch({
            headless: options.headless,
            devtools: false
        });

        const page = await browser.newPage();
        await page.goto(url, {
            timeout: 600000,
            waitUntil: 'networkidle0'
        });
        return page;
    }
    static async summary(url: string, options?: Options) {
        const browser = await launch({
            headless: options.headless,
            devtools: true
        });
        const page = await browser.newPage();
        const metrics = await page.metrics();
        await page.close();
        await browser.close();
        return metrics;
    }

    static async detail(url: string, options?: Options) {

        const page = await this.begin(url, options);

        const network_stats = report();
        const ReceivedTotal = get_report(network_stats, 'Received Total');
        const ReceivedStyleSheets = get_report(network_stats, 'Received Stylesheets');
        const ReceivedScripts = get_report(network_stats, 'Received Scripts');
        const ReceivedHTML = get_report(network_stats, 'Received HTML');
        const ReceivedImages = get_report(network_stats, 'Received Images');
        const ReceivedJSON = get_report(network_stats, 'Received JSON');
        const ReceivedFonts = get_report(network_stats, 'Received Fonts');
        const ReceivedBinary = get_report(network_stats, 'Received Binary');
        const MimeMap = {
            'application/javascript': ReceivedScripts,
            'text/javascript': ReceivedScripts,
            'text/css': ReceivedStyleSheets,
            'text/html': ReceivedHTML,
            'image/png': ReceivedImages,
            'image/gif': ReceivedImages,
            'image/svg+xml': ReceivedImages,
            'application/json': ReceivedJSON,
            'application/octet-stream': ReceivedBinary,
            'font/woff2': ReceivedFonts,
            'application/font-woff2': ReceivedFonts
        }


        await page.tracing.start({
            path: 'trace2.json',
            categories: included_categories
        });
        await page.goto(url, {
            timeout: 600000,
            waitUntil: 'networkidle0'
        });
        const metrics = await (page as any)._client.send('Performance.getMetrics');

        const navigationStart = getTimeFromMetrics(metrics, 'NavigationStart');
        await page.tracing.stop();

        // --- extracting data from trace.json ---
        const tracing = JSON.parse(readFileSync('./trace2.json', 'utf8'));
        const htmlTracing = tracing.traceEvents.filter(x => (
            x.cat === 'devtools.timeline' &&
            typeof x.args.data !== 'undefined' &&
            typeof x.args.data.url !== 'undefined' &&
            (x.args.data.url as string).startsWith(url)
        ));
        const HtmlResourceSendRequest = htmlTracing.find(x => x.name === 'ResourceSendRequest');
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

        const dataReceivedEvents = tracing.traceEvents.filter(x => x.name === 'ResourceReceivedData');
        const dataResponseEvents = tracing.traceEvents.filter(x => x.name === 'ResourceReceiveResponse');

        // find resource in responses or return default empty
        const content_response = (requestId: string) =>
            dataResponseEvents.find((x) =>
                x.args.data.requestId === requestId)
            ||
            {
                args: { data: { encodedDataLength: 0 } }
            };

        const report_per_mime = (mime: string) => MimeMap[mime] || get_report(network_stats, mime);

        // total received
        ReceivedTotal.value = dataReceivedEvents.reduce((first, x) => {
            const content = content_response(x.args.data.requestId);
            const data = content.args.data;
            const report = report_per_mime(data.mimeType);
            if (data.fromCache === false) {
                report.value += x.args.data.encodedDataLength
                report.count++;
            } else {
                content && console.log('have no mapping for ', content.args.data.mimeType);
                report.cached_count++;
            }
            ReceivedTotal.count++;
            return first + x.args.data.encodedDataLength;
        }, ReceivedTotal.value);

        [
            ReceivedTotal,
            ReceivedHTML,
            ReceivedImages,
            ReceivedJSON,
            ReceivedScripts,
            ReceivedFonts,
            ReceivedBinary
        ].forEach((r) => r.formatted = humanReadableFileSize(r.value))

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
        const browser = await page.browser();
        browser.close();
        return {
            times: results,
            network: network_stats
        }
    }
}
