const {
    dataTag,
    dataType,
    sheetType,
    dataTypeName,
    dataDefaultValue,
    simpleTypeToName,
} = require('./define');
/**
 * @param {dataTag} tag
 * @param {(dataType | string)} type
 * @param {string} name
 * @param {string} comment comment for this attribute
 * @param {string} [value] declare value for this attribute
 */
function DataSchemaAttr(tag, type, name, comment, value) {
    this.tag = tag;
    this.type = typeof type === 'string' ? this._getType(type) : type;
    this.typeName = !this._isCustomType()
        ? simpleTypeToName.get(this.type)
        : type.trim();
    this.name = name;
    this.value = value;
    this.comment = comment;
}

DataSchemaAttr.arrayPreRegx = /^array\((?<name>\s*[A-Za-z]+\w*\s*)\)/;
DataSchemaAttr.arraySuffRegx = /\[\s*\]$/;

DataSchemaAttr.prototype = {
    /**
     * @private
     * @property {string} type
     */
    _getPrimitiveType(type) {
        switch (type) {
            case dataTypeName.String:
                return dataType.String;
            case dataTypeName.Int:
                return dataType.Int;
            case dataTypeName.Int64:
                return dataType.Int64;
            case dataTypeName.Bool:
            case dataTypeName.Boolean:
                return dataType.Boolean;
            case dataTypeName.Float:
                return dataType.Float;
            case dataTypeName.Float:
                return dataType.Float64;
            case dataTypeName.Char:
                return dataType.Char;
            default:
                return dataType.None;
        }
    },

    /**
     * whether custom type
     * @returns {boolean}
     */
    _isCustomType() {
        const flag = this.type & dataType.SimpleMask;
        return (
            flag === dataType.None ||
            flag === dataType.Enum ||
            flag === dataType.Object
        );
    },

    /**
     *
     * @param {string} name
     * @returns {dataType}
     */
    _getCustomType(name) {
        const schema = DataSchema.get(name);
        switch (schema.sheetType) {
            case sheetType.Object:
                return dataType.Object;
            case sheetType.Enum:
                return dataType.Enum;
            default:
                return dataType.None;
        }
    },

    /**
     *
     * @private
     * @param {string} type
     * @returns {{type:dataType, typeName:string}}
     */
    _getCompostieType(type) {
        if (DataSchemaAttr.arrayPreRegx.test(type)) {
            return {
                type: dataType.Array,
                typeName: type.replace(DataSchemaAttr.arrayPreRegx, '').trim(),
            };
        } else if (DataSchemaAttr.arraySuffRegx.test(type)) {
            return {
                type: dataType.Array,
                typeName: DataSchemaAttr.arraySuffRegx
                    .exec(type)
                    .groups['name'].trim(),
            };
        }

        return {
            type: dataType.None,
            typeName: type,
        };
    },
    /**
     * @private
     * @param {string} type
     * @returns {dataType}
     */
    _getType: function (type) {
        const t = type.toLocaleLowerCase();
        const result = this._getCompostieType(t);
        const primitive = this._getPrimitiveType(result.typeName);
        return primitive | result.type;
    },

    /**
     * bind the schema attr for custom type 
     */
    bind: function () {
        if (!this._isCustomType()) {
            return;
        }

        const composite = this.type & dataType.CompositeMask;
        this.type = this._getCustomType(this.typeName) | composite;
    },

    getDefaultValue: function () {
        switch (this.type) {
            case dataType.None:
                return dataDefaultValue.none;
            case dataType.Int:
            case dataType.Int64:
                return dataDefaultValue.int;
            case dataType.Boolean:
                return dataDefaultValue.boolean;
            case dataType.Float:
            case dataType.Float64:
                return dataDefaultValue.float;
            case dataType.Char:
                return dataDefaultValue.char;
            case dataType.String:
                return dataDefaultValue.string;
            case dataType.Array:
                return dataDefaultValue.array;
            case dataType.Object:
                return dataDefaultValue.object;
            default:
                return undefined;
        }
    },
};

/**
 * @constructor
 * @param {string} name
 * @param {sheetType} type
 * @param {Array<DataSchemaAttr>} attrs
 */
function DataSchema(name, type, attrs) {
    if (DataSchema.get(name)) {
        throw new Error(`the type named ${name} has defined`);
    }

    /**
     * @property {string} name name of schema
     */
    this.name = name;

    /**
     * @property {sheetType} sheetType type of schema
     */
    this.sheetType = type;

    /**
     * @property {DataSchemaAttr[]} attrs attributes of schema
     */
    this.attrs = attrs;

    DataSchema.set(name, this);
}

/**
 * @private
 * @property {Map<string,DataSchema>} _schemas
 */
DataSchema._schemas = new Map();

/**
 * @param {string} name
 * @returns {DataSchema}
 */
DataSchema.get = function (name) {
    return this._schemas.get(name);
};

/**
 * @returns {Array<DataSchema>}
 */
DataSchema.schemas = function () {
    const schemas = [];
    this._schemas.forEach((v) => schemas.push(v));
    return schemas;
};

/**
 *
 * @param {string} name
 * @param {DataSchema} schema
 */
DataSchema.set = function (name, schema) {
    this._schemas.set(name, schema);
};

/**
 *
 * @param {string} name
 */
DataSchema.del = function (name) {
    this._schemas.delete(name);
};

DataSchema.clear = function () {
    this._schemas.clear();
};

DataSchema.prototype = {
    /**
     * @private
     * @param {object[]} data
     * @returns {object}
     *
     */
    _createObj: function (data) {
        if (!data) {
            return null;
        }
        const result = {};

        return result;
    },

    /**
     * @private
     * @param {object[]} data
     */
    _createEnum: function (data) {
        let incr = 0;
        const result = {};

        for (let i = 0; i < this.attrs.length; i++) {
            const attr = this.attrs[i];
            switch (attr.type) {
                case dataType.Int:
                case dataType.Int64: {
                    const v = !data[i] ? incr : data[i];
                    result[attr.name] = v;
                    incr = v + 1;
                    break;
                }
                case dataType.Char:
                    result[attr.name] = !data[i] ? defaultValue.Char : data[i];
                    break;
                case dataType.String:
                    result[attr.name] = !data[i]
                        ? defaultValue.String
                        : data[i];
                    break;
            }
        }

        return result;
    },

    /**
     * @private
     * @param {} data
     */
    _createConst: function (data) {
        if (!data) {
            return null;
        }
    },

    /**
     * @private
     * @param {Array.<Array<*>>} data
     * @returns {Array.<*>}
     */
    _createTable: function (data) {
        const result = [];
        if (!data) {
            return result;
        }

        for (let i = 0; i < data.length; i++) {
            const item = {};
            for (let j = 0; j < this.attrs.length; j++) {
                const attr = this.attrs[j]
                switch (attr.type) {
                    case dataType.Object:
                        {
                            const schema = DataSchema.get(attr.typeName)
                            item[attr.name] = schema.create(data[i][j])//todo:
                        }
                        break;
                    case dataType.Enum:{
                        const schema = DataSchema.get(attr.typeName)
                        item[attr.name] = schema.attrs.find(
                            (a) => a.name === data[i][j]
                        )?.value;
                    }
                        break;
                    default:
                        item[attr.name] = !data[i][j]
                            ? attr.getDefaultValue()
                            : data[i][j];
                }

            }

            result.push(item);
        }

        return result;
    },

    bind: function () {
        this.attrs.forEach((attr) => attr.bind());
    },

    /**
     * @param {(string | object[] | object[][])} data
     */
    create: function (data) {
        if (typeof data === 'string') {
            return this._createObj(data);
        } else {
            switch (this.sheetType) {
                case sheetType.Table:
                    return this._createTable(data);
                case sheetType.Enum:
                    return this._createEnum(data);
                case sheetType.Const:
                    return this._createConst(data);
                case sheetType.Object:
                    return this._createObj(data);
            }
        }
    },
};

module.exports.DataSchema = DataSchema;
module.exports.DataSchemaAttr = DataSchemaAttr;
