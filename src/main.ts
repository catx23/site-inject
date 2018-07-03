#!/usr/bin/env node
import { defaults } from './_cli'; defaults();

import * as cli from 'yargs';
const yargonaut = require('yargonaut').style('blue').helpStyle('green');

import { Puppeteer } from './renderer/puppeteer';
import { info } from './log';
import { defaultOptions, sanitize } from './argv';

import { register as registerSummary } from './commands/summary'; registerSummary(cli);
import { register as registerDetail } from './commands/detail'; registerDetail(cli);
import { register as registerRepl } from './commands/repl'; registerRepl(cli);
import { register as registerClean } from './commands/clean'; registerClean(cli);

const argv = cli.argv;


if (argv.h || argv.help) {
    cli.showHelp();
    process.exit();
} else if (argv.v || argv.version) {
    // tslint:disable-next-line:no-var-requires
    const pkginfo = require('../package.json');
    process.exit();
}
