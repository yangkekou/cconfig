/**
 * enum for sheet type
 * @readonly
 * @enum {number}
 */
const sheetType = {
    None: -1,
    Table: 0,
    Enum: 1,
    Const: 2,
    Object: 3,
};

/**
 * enum for data type
 * @readonly
 * @enum {number}
 */
const dataType = {
    None: 0x00,
    Int: 0x01,
    Int64: 0x02,
    Boolean: 0x03,
    Float: 0x04,
    Float64: 0x06,
    Char: 0x07,
    String: 0x08,
    Enum: 0x09,
    Object: 0x0a,
    Array: 0x10,

    SimpleMask: 0x0f,
    CompositeMask: 0xf0,
};

/**
 * @readonly
 * @enum {string} dataTypeName
 */
const dataTypeName = {
    None: 'none',
    Int: 'int',
    Int64: 'int64',
    Bool: 'bool',
    Boolean: 'boolean',
    Float: 'float',
    Float64: 'float64',
    Char: 'char',
    String: 'string',
    Enum: 'enum',
    Object: 'object',
    Array: 'array',
};

/**
 * @readonly
 * @enum {string} tag for data type
 */
const dataTag = {
    None: '',
    All: 'all',
    TS: 'ts',
    JS: 'js',
};

/**
 * @typedef {object} defaultValue
 * @property {object} none
 * @property {number} int
 * @property {number} int64
 * @property {boolean} boolean
 * @property {boolean} bool
 * @property {number} float
 * @property {number} float64
 * @property {string} char
 * @property {string} string
 * @property {Array<object>} array
 * @property {object} object
 */

/**
 * const for default value of data type
 * @constant
 * @type {defaultValue} dataDefaultValue
 */
const dataDefaultValue = {
    none: undefined,
    int: 0,
    int64: 0,
    boolean: false,
    bool: false,
    float: 0,
    float64: 0,
    char: '',
    string: '',
    array: [],
    object: null,
};

const simpleTypeToName = new Map([
    [dataType.Boolean, dataTypeName.Boolean],
    [dataType.Char, dataTypeName.Char],
    [dataType.Float, dataTypeName.Float],
    [dataType.Float64, dataTypeName.Float64],
    [dataType.Int, dataTypeName.Int64],
    [dataType.String, dataTypeName.String],
]);

module.exports = {
    dataTag,
    dataType,
    sheetType,
    dataTypeName,
    dataDefaultValue,
    simpleTypeToName,
};
