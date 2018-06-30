import * as path from 'path';
import { URL } from 'url';
import * as CLI from 'yargs';
import { warn } from './log';
import { Options, OutputFormat, OutputTarget } from './types';


const LIGHT = 'http://google.co.uk';
const HEAVY = 'http://0.0.0.0:5555/app/xcf?debug=true&xblox=debug&xgrid=debug&davinci=debug&userDirectory=/PMaster/x4mm/user;'

const StringToBooleanRegEx = /^\s*(true|1|on)\s*$/i;

// utils to create output file name for url, format : hostname_time
const _url_short = (url: string) =>
    new URL(url).hostname;

const _date_suffix = () =>
    new Date().toLocaleTimeString().replace(/:/g, '_');

const _default_filename = (url: string) =>
    `${_url_short(url)}_${_date_suffix()}`;

const default_path = (cwd: string, url: string) =>
    `${path.join(cwd, _default_filename(url))}.json`;

// default options for all commands
export const defaultOptions = (yargs: CLI.Argv) => {
    return yargs.option('url', {
        default: HEAVY,
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
    })
};

// Sanitizes faulty user argv options for all commands.
export const sanitize = (argv: CLI.Arguments): Options => {
    const args = argv as Options;
    args.cwd = args.cwd || process.cwd();
    // path given but target is not file, correct to file
    if (args.path && args.target !== OutputTarget.FILE) {
        args.target = OutputTarget.FILE;
    }
    // target is file but no path given, correct to default file
    if (args.target === OutputTarget.FILE && !args.path) {
        // args.target = OutputTarget.STDOUT;
        args.path = default_path(args.cwd, args.url);
        warn(`Target is file but no path specified! Using default file:  ${args.path}`);
    }
    // format string not properly passed
    if (!(argv.format in OutputFormat)) {
        warn(`Unknown output format ${argv.format}! Default to ${OutputFormat.text}`);
        args.format = OutputFormat.text;
    }    
    args.headless = StringToBooleanRegEx.test(argv.headless);
    return args;
};
