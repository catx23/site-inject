"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const log_1 = require("./log");
exports.render = (result, options) => {
    switch (options.format) {
        case types_1.OutputFormat.text: {
            //@TODO: human readable format
            return JSON.stringify(result, null, 2);
        }
        case types_1.OutputFormat.json: {
            return JSON.stringify(result, null, 2);
        }
        default: {
            //should never happen since options had to be sanitized
            log_1.error('format::render Invalid value in options.format');
            return '';
        }
    }
};
//# sourceMappingURL=format.js.map