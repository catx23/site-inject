#!/usr/bin/env node
import * as cli from 'yargs';
import { Puppeteer } from './renderer/puppeteer';

const yargonaut = require('yargonaut')
    .style('blue')
    .helpStyle('green');

cli.options('v', {
    alias: 'version',
    description: 'Display version number'
});
process.on('unhandledRejection', (reason: string) => {
    console.error('Unhandled rejection, reason: ', reason);
});


import { register } from './commands/summary'; register(cli);
const argv = cli.argv;
if (argv.h || argv.help) {
    cli.showHelp();
    process.exit();
} else if (argv.v || argv.version) {
    // tslint:disable-next-line:no-var-requires
    const pkginfo = require('../package.json');
    process.exit();
}
