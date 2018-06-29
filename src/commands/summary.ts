import * as debug from '../log';
import chalk from 'chalk';
import * as CLI from 'yargs';
import { defaultOptions, sanitize } from '../argv';
import { Options } from '../types';
import { render as output } from '../output';
import { Puppeteer } from '../renderer/puppeteer';
// no extra options, using defaults
const options = (yargs: CLI.Argv) => defaultOptions(yargs);

export const register = (cli: CLI.Argv) => {
    return cli.command('summary', '', options, async (argv: CLI.Arguments) => {
        //@TODO: this guard might not be necessary
        if (argv.help) { return; }
        const args = sanitize(argv) as Options;
        const result = await Puppeteer.summary(args.url, args);
        output(result, args);
    });
};
