"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
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
        describe: 'The target location on the local filesystem for --target=file'
    }).option('debug', {
        default: 'false',
        describe: 'Enable internal debug message'
    });
};
// Sanitizes faulty user argv options for all commands.
exports.sanitize = (argv) => {
    const args = argv;
    args.cwd = args.cwd || process.cwd();
    if (!args.url) {
        // internal user error, should never happen!
        _1.error('Invalid url, abort');
        return process.exit();
    }
    // path given but target is not file, correct to file
    if (args.path && args.target !== _1.OutputTarget.FILE) {
        args.target = _1.OutputTarget.FILE;
    }
    // target is file but no path given, correct to default file
    if (args.target === _1.OutputTarget.FILE && !args.path) {
        args.path = _1.default_path(args.cwd, args.url);
    }
    // format string not valid
    if (!(argv.format in _1.OutputFormat)) {
        _1.warn(`Unknown output format ${argv.format}! Default to ${_1.OutputFormat.text}`);
        args.format = _1.OutputFormat.text;
    }
    args.headless = /^\s*(true|1|on)\s*$/i.test(argv.headless);
    return args;
};
//# sourceMappingURL=argv.js.map