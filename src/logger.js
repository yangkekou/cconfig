/**
 * @readonly
 * @enum {number} LogLevel
 */
const LogLevel = {
    NONE: 0x0000,
    INFO: 0x0001,
    WARN: 0x0003,
    ERROR: 0x0007,
    VERBOSE: 0x000e,
};

/**
 * @class Logger
 * @property {LogLevel} level - The current log level
 * @property {function} log - Logs an info message
 * @property {function} warn- Logs an warn message
 * @property {function} error - Logs an error message
 *
 * @constructor
 * @param {LogLevel} level
 * @description Logger class for logging messages
 */
function Logger(level) {
    this.level = level;
}

Logger.prototype = {
    log: function (message) {
        if (this.level >= LogLevel.INFO) {
            console.log(`\x1b[32m[INFO]: ${message}\x1b[0m`);
        }
    },

    warn: function (message) {
        if (this.level >= LogLevel.WARN) {
            console.warn(`\x1b[33m[WARN]: ${message}\x1b[0m`);
        }
    },

    error: function (error) {
        if (this.level >= LogLevel.ERROR) {
            console.error(`\x1b[31m[ERROR]: ${error}\x1b[0m`);
        }
    },
};

module.exports = { Logger, LogLevel };
