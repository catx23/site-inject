import { Page, Request } from 'puppeteer';
import { Options } from './types';
import { loginUrl, defaultPageOptions, userSessionsTab, loginUrlDemoDev } from './constants';

export async function loginFrontEnd(page: Page, options: Options) {
  await page.goto(loginUrl(options.dynatraceUrl), defaultPageOptions());
  await page.type('#user', 'admin');
  await page.type('#password', 'admin');
  await page.click('#login-form > .maindiv > .logindiv > .submitdiv > .button');
  await page.waitForSelector('.tenant-selector');
  await page.click('.textboxdiv > .tenant-selector:nth-child(2)');
}

export async function loginDemoDev(page: Page, options: Options) {
  await page.goto(loginUrlDemoDev(), defaultPageOptions());
  await page.type('#IDToken1', 'guenter.baumgart@ruxit.com');
  await page.click('.maindiv > .logindiv > form > div > #formsubmit');

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
      console.log('time out');
    }, 20 * 1000)
  });

  console.log('logged in 1/2!');


  /*
    const puppeteer = require('puppeteer');
  
  (async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    
    await page.waitForSelector('.logindiv > form > .textboxdiv > .emailLoginIcon > #IDToken1')
    await page.click('.logindiv > form > .textboxdiv > .emailLoginIcon > #IDToken1')
    
    await page.waitForSelector('.maindiv > .logindiv > form > div > #formsubmit')
    await page.click('.maindiv > .logindiv > form > div > #formsubmit')
    
    const navigationPromise = page.waitForNavigation()
    await navigationPromise
    
    await page.waitForSelector('.logindiv > form > .margin-bottom\3A > .passwordIcon > #IDToken2')
    await page.click('.logindiv > form > .margin-bottom\3A > .passwordIcon > #IDToken2')
    
    await page.waitForSelector('.logindiv > form > fieldset > div > #IDToken3')
    await page.click('.logindiv > form > fieldset > div > #IDToken3')
    
    await page.waitForSelector('form > fieldset > #button-base > div > #loginButton_0')
    await page.click('form > fieldset > #button-base > div > #loginButton_0')
    
    await navigationPromise
    
    await navigationPromise
    
    await navigationPromise
    
    await browser.close()
  })()
  */

  //await page.type('#password', 'admin');
  //await page.click('#login-form > .maindiv > .logindiv > .submitdiv > .button');
  //await page.waitForSelector('.tenant-selector');
  //await page.click('.textboxdiv > .tenant-selector:nth-child(2)');
}

export async function navigateToUserSessions(page: Page, options: Options) {
  await page.goto(userSessionsTab(options.dynatraceUrl), defaultPageOptions());
}


export async function navigateToUserLocalhost(page: Page, options?: Options) {
  await page.goto('http://localhost/', defaultPageOptions());
}

