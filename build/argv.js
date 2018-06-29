"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const log_1 = require("./log");
const LIGHT = 'http://google.co.uk';
const HEAVY = 'http://0.0.0.0:5555/app/xcf?debug=true&xblox=debug&xgrid=debug&davinci=debug&userDirectory=/PMaster/x4mm/user;';
// default options for all commands
exports.defaultOptions = (yargs) => {
    return yargs.option('url', {
        default: LIGHT,
        describe: 'The URL to analyze'
    }).option('headless', {
        default: 'true',
        describe: 'use headless render [true|false]'
    }).option('format', {
        default: 'text',
        describe: 'Normal human readable text or JSON [text|json]'
    }).option('target', {
        default: 'console',
        describe: 'Output target [console|file]'
    }).option('path', {
        default: '',
        describe: 'The target location on the local filesystem for --target==file'
    });
};
// Sanitizes faulty user argv options for all commands.
exports.sanitize = (argv) => {
    const args = argv;
    // path given but target is not file, correct to file
    if (args.path && args.target === types_1.OutputTarget.FILE) {
        args.target = types_1.OutputTarget.FILE;
        log_1.warn('Path specified but target is not file! Correcting user argument to file ');
    }
    // target is file but no path given, correct to console
    if (args.target === types_1.OutputTarget.FILE && !args.path) {
        args.target = types_1.OutputTarget.STDOUT;
        log_1.warn('Target is file but no path specified! Correcting user argument to console');
    }
    // format string not properly passed
    if (!(argv.format in types_1.OutputFormat)) {
        log_1.warn(`Unknown output format ${argv.format}! Default to ${types_1.OutputFormat.text}`);
        args.format = types_1.OutputFormat.text;
    }
    return argv;
};
//# sourceMappingURL=argv.js.map