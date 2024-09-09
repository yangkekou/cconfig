const path = require('path');
const { dataType } = require('../src/define');

/**
 * @typedef {object} TemplateUtil
 * @property {function} getTypeStr get the string name of data type
 */

function JsUtil() {}
/**
 * @param {dataType | string} t
 */
JsUtil.prototype.getTypeStr = function (t) {
    if (typeof t === 'string') {
        return t;
    }

    const p_type = t & dataType.SimpleMask;
    const c_type = t & dataType.CompositeMask;

    let str = '';

    switch (p_type) {
        case dataType.Boolean:
            str = 'boolean';
            break;
        case dataType.Float:
        case dataType.Float64:
        case dataType.Int:
        case dataType.Int64:
            str = 'number';
            break;
        case dataType.String:
        case dataType.Char:
            str = 'string';
            break;
    }

    if (c_type != dataType.None) {
        switch (c_type) {
            case dataType.Array:
                return `${str}[]`;
            default:
                return null;
        }
    } else {
        return str;
    }
};

module.exports.util = {
    js: new JsUtil(),
    ts: new JsUtil(),
};
module.exports.templates = {
    js: path.resolve(__dirname, './ts/javascript.ejs'),
    ts: path.resolve(__dirname, './ts/typescript.ejs'),
};
