export enum OutputTarget {
    STDOUT = 'console',
    FILE = 'file'
}

export enum OutputFormat {
    text = 'text',
    json = 'json'
}

export interface Options {
    cwd?: string;
    // @TODO: support many
    url: string;
    format: OutputFormat;
    // @TODO: support many
    target: OutputTarget;
    headless?: boolean;
    // output path
    path?: string
}

export type OutputResult = boolean;

// @TODOs
export interface RenderType {
    LOCAL: 1,
    REMOTE: 2
}
