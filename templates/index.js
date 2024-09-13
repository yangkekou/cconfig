const path = require('path');
const { dataType } = require('../src/define');
const {DataSchemaAttr} = require("../src/schema")

/**
 * @typedef {object} TemplateUtil
 * @property {function} getTypeStr get the string name of data type
 */

function JsUtil() {}
/**
 * @param {DataSchemaAttr} attr
 */
JsUtil.prototype.getTypeStr = function (attr) {
    const p_type = attr.type & dataType.SimpleMask;
    const c_type = attr.type & dataType.CompositeMask;

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
        case dataType.Enum:
        case dataType.None:
        case dataType.Object:
            str = attr.typeName;
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
