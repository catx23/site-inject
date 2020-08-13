import { Browser, launch, Page, Response } from 'puppeteer';
import { inspect, error } from './log';
import { capture_requests, capture_responses } from './network';
let instance: Scope;
import * as path from 'path';
import { URL } from 'url';
export const STATS_SUFFIX = '_stats.json';
export const SESSION_EVENTS_SUFFIX = '_session.json';
export const TRACE_SUFFIX = '_trace.json';
const included_categories = ['devtools.timeline'];
const _url_short = (url: string) =>
    new URL(url).hostname;

const _date_suffix = () =>
    new Date().toLocaleTimeString().replace(/:/g, '_');

const _random_suffix = () =>
    Math.random() * 100;

const _default_filename = (url: string) =>
    `${_url_short(url)}_${_random_suffix()}`;

export const default_path = (cwd: string, url: string) =>
    `${path.join(cwd, _default_filename(url))}${STATS_SUFFIX}`;

export const default_session_events_path = (cwd: string, url: string) =>
    `${path.join(cwd || process.cwd(), 'sessions', _default_filename(url))}${SESSION_EVENTS_SUFFIX}`;

export const default_trace_path = (cwd: string, url: string) =>
    `${path.join(cwd, _default_filename(url))}${TRACE_SUFFIX}`;

export class Scope {
    browser!: Browser;
    context!: any;
    page!: Page;
    args!: any;
    requests: any[] = [];
    responses: Response[] = [];
    eventBeacons: any[] = [];
    mutationBeacons: any[] = [];
    sessionSuffix: string = '';
    async init() {
        this.sessionSuffix = ' - ' + new Date().getTime();
        this.browser = await launch({ headless: this.args.headless === 'true', devtools: true });
        this.page = await this.browser.newPage();

        //const traceFile = default_trace_path('/tmp/', 'http://localhost');
        // console.log('trace to ' + traceFile);
        /*
        await this.page.tracing.start({
            path: traceFile,
            categories: included_categories
        });*/

        this.page.on('console', msg => {
            if (msg.text().indexOf('send binary') !== -1) {
                const data = msg.text();
                const string = data.substring(data.indexOf('{{{ ') + 4, data.lastIndexOf('}}}'));
                const json = JSON.parse(string);
                this.mutationBeacons.push(json);
                // var enc = new TextDecoder("utf-8");
                

            } else if (msg.text().indexOf('send event') !== -1) {
                const data = msg.text();
                const string = data.substring(data.indexOf('{{{ ') + 4, data.lastIndexOf('}}}'));
                let json = {
                    raw: JSON.parse(string)
                }
                json['parsed'] = JSON.parse(json.raw.Ka.substring(json.raw.Ka.indexOf('[{'), json.raw.Ka.lastIndexOf('}]') + 2));
                this.eventBeacons.push(json);
            } else {
                inspect('Console Message:', msg.text())
            }


            //if (!msg.text().startsWith('mutation')) {
            //    inspect('Console Message:', msg.text())
            //}
        });
        this.page.on('error', msg => error('Browser Error:', msg));
        this.page.on('pageerror', msg => error('Browser Page Error:', msg));
        this.page.on('requestfailed', msg => error('Browser Page Request Error:', msg));
        // this.args.disableRequests !== 'true' && capture_requests(this, this.page);
        //this.args.disableResponses !== 'true' && capture_requests(this, this.page);
        // capture_responses(this, this.page);
        const page2 = this.page as any;

        await page2._client.send('Security.setOverrideCertificateErrors', { override: true })
        await page2._client.on('Security.certificateError', (event: any) => {
            page2._client.send('Security.handleCertificateError', {
                eventId: event.eventId,
                action: 'continue' // ignore error and continue request
            })
        })
    }
}

export const getScope = (cliArgs?: any) => {
    if (!instance) {
        instance = new Scope();
        instance.args = cliArgs;
    }
    return instance;
}
