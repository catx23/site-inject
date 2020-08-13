import { Page, Request, Response } from 'puppeteer';
import { sessionName, maxSessionWaitingTime, defaultPageOptions, userSessionsTab } from './constants';
import * as debug from './log';
import { Scope } from './Scope';
import { parse } from 'url';
import { navigateToUserSessions } from './processes';

const debugRequests = true;
const debugResponses = false;
export const default_postdata = (request: Request): any => request.postData && request.postData() || {};
export type ResponseMatch = (request: any) => boolean;
export const HasUserSessions = (request: Request) => (default_postdata(request).users)
export const MyUserSessions = (url: string, request: Request) => SessionWithName(request, sessionName(url));
export const SessionWithName = (request: Request, name: string) => {
  const data = default_postdata(request).users || [];
  return data.find((user: any) => user.id === name)
}
export type ResponseResolve = Response & {
  data: any;
}
const default_prepare = (requests: Request[]): Request[] => {
  return requests;
};

const default_filter_json = (r: Request) => ((r.headers()['content-type'] || '').startsWith('application/json;')) === true;
const responses = async function (requests: Request[]) { return Promise.all(requests.map(r => r.response()!.json())) };

export const findRequest = (url: string, requests: Request[], match?: ResponseMatch): Request[] => {
  url = decodeURIComponent(url);
  if (!match) {
    return requests.filter((request) => request.url().indexOf(url) !== -1);
  } else {
    const results = requests.filter((request) => request.url().indexOf(url) !== -1);
    return results.filter((r) => match!(r));
  }
}

export function waitForResponse(url: string, scope: Scope, match: ResponseMatch, timeout: number = 5000): Promise<any[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {

        let requests = default_prepare(scope.requests).filter(default_filter_json).filter(r => r.response() != null);
        requests = requests.filter((request) => request.url().indexOf(url) !== -1);
        responses(requests).then((responses) => {
          const ret = responses.filter(match);
          if (ret.length) {
            resolve(ret);
          } else {
            reject('cant find anything yet');
          }
        });
      } catch (error) {
        debug.error('waitForResponse Error ', error);
      }
    }, timeout);
  })
}
export function waitForResponseNTimes(url: string, scope: Scope, match: ResponseMatch, timeout: number = 5000) {
  return new Promise((resolve, reject) => {
    const maxTime = maxSessionWaitingTime;
    const retryTime = 8000;
    let reachedTimeOut = false;
    let interval: any = null;
    interval = setInterval(() => {
      if (reachedTimeOut) {
        clearInterval(interval);
        debug.error('reached max');
        reject('reached maximum timeout');
        return;
      }
      onReload(scope).then(() => {
        scope.page.reload().then(() => {
          debug.info('retry ');
          waitForResponse(url, scope, match, retryTime).then((session) => {
            debug.inspect('got my session', session);
            clearInterval(interval);
            resolve(session);
          }).catch((e) => {
            debug.error('found nothing');
          })
        }).catch((e) => {
          console.error('error loading page : ', e);
        });
      });
    }, retryTime);


    setTimeout(() => {
      reachedTimeOut = true;
      clearInterval(interval);
      reject('max timeout reached');
    }, maxTime);
  });
};

export async function capture_request(where: any[], request: Request) {
  debugRequests && debug.inspect('Request', { url: request.url(), data: request.postData() });
  where.push({ url: request.url(), data: await request.postData(), request: request });
  debugRequests && debug.inspect('requests', where.map(r => r.url));
}

export async function capture_response(where: any[], response: Response) {
  debugResponses && debug.inspect('Response', { url: response.url(), data: await response.json() });
  where.push(response);
}
export const parse_events = (postData: string) => {
  if (postData.indexOf('viewId') > 1 && postData.indexOf('[{') && postData.indexOf(']}')) {
    try {
      return JSON.parse(postData.substring(postData.indexOf('[{'), postData.lastIndexOf('}]') + 2));
    } catch (e) {
      debug.error('error parsing events ', e)
    }
  }
  return {};
}
const Parsers = {
  'srTe': parse_events
}
export async function capture_requests(scope: Scope, page: Page) {
  await page.setRequestInterception(true);
  scope.requests = [];
  page.on('request', (interceptedRequest: Request) => {
    try {
      const url = decodeURIComponent(interceptedRequest.url());
      const parsed = parse(url, true);
      const query = parsed.query;
      const isEventBeacon = query['contentType'] === 'srTe';
      const data = interceptedRequest.postData();
      if (isEventBeacon) {
        data && scope.eventBeacons.push(parse_events(data));
        debugRequests && debug.inspect('event beacon ' + query['contentType'] + ' ');
      }
      const isMutationBeacon = query['contentType'] === 'srBm';
      if (isMutationBeacon) {
        // console.log('mutation : ', data, new Error().stack);
      }
      if (url.indexOf('bf/') !== -1) {
        debugRequests && debug.inspect('q ' + query['contentType'] + ' ' + url + ' cType ' + interceptedRequest.headers()['content-type']);
      }
      const isJson = (interceptedRequest.headers()['content-type'] || '').startsWith('application/json') === true;
      if (isJson) {
        // capture_request(scope.requests, interceptedRequest);
        //debugRequests && debug.inspect('q ' + query['contentType'] + ' ' + url);
      }
      interceptedRequest.continue();
    } catch (e) {
      debug.error('error parsing request ', e);
    }
  });
}

export async function capture_responses(scope: Scope, page: Page) {
  try {
    await page.setRequestInterception(true);
  } catch (e) { }
  scope.responses = [];
  page.on('response', response => {
    try {
      const isJson = (response.headers()['content-type'] || '').startsWith('application/json;') === true;
      const url = response.url();
      if (response.status() === 200) {
        if (isJson) {
          capture_response(scope.responses, response);
        }
      } else {
        debugResponses && debug.error(`Error loading ${url} : ${response.status()}`);
      }
    } catch (e) {
      debugResponses && debug.error('Error parsing response');
    }
  });
}
export async function onReload(scope: Scope) {
  scope.requests = [];
  try {
    await scope.page.setRequestInterception(false);
  } catch (e) {

  }
  await scope.page.setRequestInterception(true);
}
/*
export const trace_network = (scope: any, page: Page, request: Request) => {
  const url = decodeURIComponent(request.url());
  const parsed = parse(url, true);
  const url_path = parsed.path;
  if (!request || !request.url()) {
    return;
  }
  const type = request.headers()['content-type'];

  // cases 
  if (type && type.startsWith('text/plain')) {

    //inspect('Request ' + url, decodeURIComponent(request.postData()));
    //inspect('Request ' + url, data);

  }
  const postData = request.postData();
  if (!postData) {
    return;
  }


  if (debug_events) {
    const events = parse_events(postData);
    if (events) {
      inspect('Events : ', events);
      return;
    } else {
      //console.log('invalid events ', postData);
    }
  }
  

  //const t = [{"viewId":"1534261630723","type":"resolution","time":1534261631731,"payload":"1534261630724,[{"time":1534261630727,"type":"resize","width":800,"height":600},{"time":1534261631647,"type":"move","targetId":7,"x":100,"y":148},{"time":1534261631683,"type":"click","targetId":7,"x":100,"y":148},{"time":1534261631689,"type":"move","targetId":6,"x":0,"y":0},{"time":1534261631691,"type":"move","targetId":7,"x":0,"y":100}]
  debug_plain && inspect('Request ' + url_path.substr(0, 20) + ' type ' + type, {
    headers: request.headers(),
    data: request.postData(),
    query: parsed.query
  });
}
*/