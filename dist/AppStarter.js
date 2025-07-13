"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.starter = void 0;
let bytenode = require('bytenode');
const logger_1 = require("./logic/logger");
const AppConfig_1 = require("./AppConfig");
let starter = (log_name) => {
    logger_1.default.createLogger(`./logs/${log_name}`);
    let config = require("../config/config");
    if (process.argv.length >= 3) {
        config = require(process.argv[2]);
    }
    AppConfig_1.AppConfig.initConifig(config);
};
exports.starter = starter;
//# sourceMappingURL=AppStarter.js.map