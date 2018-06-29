import * as CLI from 'yargs';
import * as path from 'path';
import { Options, OutputTarget, OutputFormat } from './types';
import { warn } from './log';

const SMALL = 'http://google.co.uk';
const HEAVY = 'http://0.0.0.0:5555/app/xcf?debug=true&xblox=debug&xgrid=debug&davinci=debug&userDirectory=/PMaster/x4mm/user;'

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
        describe: 'The target location on the local filesystem for --target==file'
    })

};

// Sanitizes faulty user argv options for all commands.
export const sanitize = (argv: any): Options => {
    const args = argv as Options;
    // path given but target is not file, correct to file
    if (args.path && args.target === OutputTarget.FILE) {
        args.target = OutputTarget.FILE;
        warn('Path specified but target is not file! Correcting user argument to file ');
    }
    // target is file but no path given, correct to console
    if (args.target === OutputTarget.FILE && !args.path) {
        args.target = OutputTarget.STDOUT;
        warn('Target is file but no path specified! Correcting user argument to console');
    }
    // format string not properly passed
    if (!(argv.format in OutputFormat)) {
        warn(`Unknown output format ${argv.format}! Default to ${OutputFormat.text}`);
        args.format = OutputFormat.text;
    }
    return argv;
};
