"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const write_1 = require("@xblox/fs/write");
const types_1 = require("./types");
const log_1 = require("./log");
const format_1 = require("./format");
exports.stdout = (result) => console.log(result);
exports.file = (result, path) => write_1.sync(path, result);
exports.render = (result, options) => {
    const report = format_1.render(result, options);
    switch (options.target) {
        case types_1.OutputTarget.STDOUT: {
            exports.stdout(report);
            return true;
        }
        case types_1.OutputTarget.FILE: {
            exports.file(report, options.path);
            return true;
        }
        default: {
            //should never happen since options had to be sanitized
            log_1.error('output::render Invalid value in options.target');
            return false;
        }
    }
};
//# sourceMappingURL=output.js.map