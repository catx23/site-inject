"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = require("puppeteer");
const fs_1 = require("fs");
// the actual metrics extraction has been taken from a github issue!
const included_categories = ['devtools.timeline'];
const report_item = (name) => {
    return {
        name: name,
        value: 0,
        formatted: '',
        count: 0,
        cached_count: 0
    };
};
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
    ];
};
const find_report = (where, name) => where.find((media) => media.name === name);
const get_report = (where, type) => {
    let record = find_report(where, type);
    if (!record) {
        record = report_item(type);
        where.push(record);
    }
    return record;
};
const humanReadableFileSize = (bytes, si = true) => {
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
class Puppeteer {
    static begin(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield puppeteer_1.launch({
                headless: options.headless,
                devtools: false
            });
            const page = yield browser.newPage();
            yield page.goto(url, {
                timeout: 600000,
                waitUntil: 'networkidle0'
            });
            return page;
        });
    }
    static summary(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield puppeteer_1.launch({
                headless: options.headless,
                devtools: true
            });
            const page = yield browser.newPage();
            const metrics = yield page.metrics();
            yield page.close();
            yield browser.close();
            return metrics;
        });
    }
    static detail(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.begin(url, options);
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
            };
            yield page.tracing.start({
                path: 'trace2.json',
                categories: included_categories
            });
            yield page.goto(url, {
                timeout: 600000,
                waitUntil: 'networkidle0'
            });
            const metrics = yield page._client.send('Performance.getMetrics');
            const navigationStart = getTimeFromMetrics(metrics, 'NavigationStart');
            yield page.tracing.stop();
            // --- extracting data from trace.json ---
            const tracing = JSON.parse(fs_1.readFileSync('./trace2.json', 'utf8'));
            const htmlTracing = tracing.traceEvents.filter(x => (x.cat === 'devtools.timeline' &&
                typeof x.args.data !== 'undefined' &&
                typeof x.args.data.url !== 'undefined' &&
                x.args.data.url.startsWith(url)));
            const HtmlResourceSendRequest = htmlTracing.find(x => x.name === 'ResourceSendRequest');
            const HtmlId = HtmlResourceSendRequest.args.data.requestId;
            const htmlTracingEnds = tracing.traceEvents.filter(x => (x.cat === 'devtools.timeline' &&
                typeof x.args.data !== 'undefined' &&
                typeof x.args.data.requestId !== 'undefined' &&
                x.args.data.requestId === HtmlId));
            const HtmlResourceReceiveResponse = htmlTracingEnds.find(x => x.name === 'ResourceReceiveResponse');
            const HtmlResourceReceivedData = htmlTracingEnds.find(x => x.name === 'ResourceReceivedData');
            const HtmlResourceFinish = htmlTracingEnds.find(x => x.name === 'ResourceFinish');
            const dataReceivedEvents = tracing.traceEvents.filter(x => x.name === 'ResourceReceivedData');
            const dataResponseEvents = tracing.traceEvents.filter(x => x.name === 'ResourceReceiveResponse');
            // find resource in responses or return default empty
            const content_response = (requestId) => dataResponseEvents.find((x) => x.args.data.requestId === requestId)
                ||
                    {
                        args: { data: { encodedDataLength: 0 } }
                    };
            const report_per_mime = (mime) => MimeMap[mime] || get_report(network_stats, mime);
            // total received
            ReceivedTotal.value = dataReceivedEvents.reduce((first, x) => {
                const content = content_response(x.args.data.requestId);
                const data = content.args.data;
                const report = report_per_mime(data.mimeType);
                if (report) {
                    if (data.fromCache === false) {
                        report.value += x.args.data.encodedDataLength;
                        report.count++;
                    }
                    else {
                        content && console.log('have no mapping for ', content.args.data.mimeType);
                        report.cached_count++;
                    }
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
            ].forEach((r) => r.formatted = humanReadableFileSize(r.value));
            // --- end extracting data from trace.json ---
            yield page.close();
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
            const browser = yield page.browser();
            browser.close();
            return {
                times: results,
                network: network_stats
            };
        });
    }
}
exports.Puppeteer = Puppeteer;
//# sourceMappingURL=index.js.map