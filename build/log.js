"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const _ora = require("ora");
// tslint:disable-next-line:no-var-requires
const jsome = require('jsome');
jsome.level.show = true;
const glog = console.log;
exports.log = (msg, ...rest) => glog(chalk_1.default.magenta(msg), ...rest);
exports.info = (msg, ...rest) => glog(chalk_1.default.green(msg), ...rest);
exports.error = (msg, ...rest) => glog(chalk_1.default.red(msg), ...rest);
exports.warn = (msg, ...rest) => glog(chalk_1.default.yellow(msg), ...rest);
exports.debug = (msg, ...rest) => glog(chalk_1.default.blue(msg), ...rest);
exports.stack = (msg, ...rest) => glog(chalk_1.default.red(msg), new Error().stack);
exports.inspect = (msg, d = null) => {
    glog(chalk_1.default.blue(msg));
    d && jsome(d);
};
exports.spinner = (msg) => _ora(msg);
//# sourceMappingURL=log.js.map