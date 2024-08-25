/**
 * @typedef Files
 * @type {object}
 * @property {string} path
 * @property {Array<string>} includes
 * @property {Array<string} excludes
 */

/**
 * @typedef Log
 * @type {object}
 * @property {string} level
 * @property {string} output
 */

/**
 * @typedef Output
 * @type {object}
 * @property {string} tag
 * @property {string} format
 * @property {string} script
 * @property {string} data
 *
 */

/**
 * config for ccconfig
 * @class
 * @returns {{files:Files,log:Log,outputs:Array<Output>}}
 */
function Config() {
    /**
     * @type {Files}
     * @property {Files} files
     */
    this.files = null;

    /**
     * @type {Log}
     * @property {Log} log
     */
    this.log = null;

    /**
     * @type {Array<Output>}
     * @property {Array<Output>}
     */
    this.outputs = null;
}

module.exports = Config;
