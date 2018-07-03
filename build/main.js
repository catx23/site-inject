#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _cli_1 = require("./_cli");
_cli_1.defaults();
const cli = require("yargs");
const yargonaut = require('yargonaut').style('blue').helpStyle('green');
const summary_1 = require("./commands/summary");
summary_1.register(cli);
const detail_1 = require("./commands/detail");
detail_1.register(cli);
const repl_1 = require("./commands/repl");
repl_1.register(cli);
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