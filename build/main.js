#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli = require("yargs");
const yargonaut = require('yargonaut')
    .style('blue')
    .helpStyle('green');
cli.options('v', {
    alias: 'version',
    description: 'Display version number'
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection, reason: ', reason);
});
const summary_1 = require("./commands/summary");
summary_1.register(cli);
const argv = cli.argv;
if (argv.h || argv.help) {
    cli.showHelp();
    process.exit();
}
else if (argv.v || argv.version) {
    // tslint:disable-next-line:no-var-requires
    const pkginfo = require('../package.json');
    process.exit();
}
//# sourceMappingURL=main.js.map