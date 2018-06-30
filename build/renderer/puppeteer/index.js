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
const log_1 = require("../../log");
const fs_1 = require("fs");
// the actual metrics extraction has been taken from a github issue!
const getTimeFromMetrics = (metrics, name) => metrics.metrics.find(x => x.name === name).value * 1000;
class Puppeteer {
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
            const browser = yield puppeteer_1.launch({
                headless: options.headless,
                devtools: true
            });
            const page = yield browser.newPage();
            yield page.setRequestInterception(true);
            const mediaItem = (name) => { return { name, count: 0 }; };
            const media = [];
            const collectResources = (type) => {
                let record = media.find((media) => media.name === type);
                if (!record) {
                    record = mediaItem(type);
                    media.push(record);
                }
                record.count++;
            };
            page.on('request', interceptedRequest => {
                interceptedRequest.continue();
                collectResources(interceptedRequest.resourceType());
            });
            yield page.tracing.start({ path: 'trace.json' });
            yield page.goto(url, {
                timeout: 600000,
                waitUntil: 'networkidle0'
            });
            const metrics = yield page._client.send('Performance.getMetrics');
            const navigationStart = getTimeFromMetrics(metrics, 'NavigationStart');
            yield page.tracing.stop();
            // --- extracting data from trace.json ---
            const tracing = JSON.parse(fs_1.readFileSync('./trace.json', 'utf8'));
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
            log_1.inspect('HtmlResourceReceivedData', htmlTracingEnds);
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
            yield browser.close();
            return {
                statistics: results,
                media: media
            };
        });
    }
}
exports.Puppeteer = Puppeteer;
//# sourceMappingURL=index.js.map