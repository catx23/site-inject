export enum OutputTarget {
    STDOUT = 'console',
    FILE = 'file'
}

export enum OutputFormat {
    text = 'text',
    json = 'json'
}

export interface Options {
    // @TODO: support many
    url?: string;
    format?: OutputFormat;
    // @TODO: support many
    target?: OutputTarget;
    headless?: boolean;
    // output path
    path?: string;
    // @TODO: required to pick profile/config files
    cwd?: string;
    // @TODO: time of sesssion, mapped to Puppeteer waitUntil, if it's a number, the session will be opened for that 
    // time window, time=-1 means infinty, useful for repl. sessions
    time?: number;
    // @TODO: reload interval
    reload?: number;
    // @TODO: repl. --repl=true=interactive or repl=path to specify script
    repl?: string;
}

export type OutputResult = boolean;

// @TODOs
export interface RenderType {
    LOCAL: 1,
    REMOTE: 2
}
