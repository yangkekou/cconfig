const util = require('../util');
const { Logger } = require('../logger');
const readXlsxFile = require('read-excel-file/node');
const { readSheetNames } = require('read-excel-file/node');
const { dataType, sheetType } = require('../define');
const { DataSchema, DataSchemaAttr } = require('../schema');

const reader = async (input, option = null) =>
    await readXlsxFile(input, option);

/**
 * @class Parser
 * @property {Logger} _logger
 * @property {function} _parse parse excel file for inner code using
 * @property {function} _checkSheet check sheet data for inner code using
 * @property {function} parseJson parse excel file to json
 * @property {function} parseBin parse excel file to json
 * @constructor
 * @param {Logger} logger
 */
function Parser(logger) {
    this._logger = logger;
}

Parser.prototype = {
    /**
     *@private
     * @param {sheetType} type
     * @param {Array.<Array>} data
     * @returns
     */
    _checkSheet: function (type, data) {
        if (!data || data[0].length <= 0) {
            return false;
        }

        switch (type) {
            case sheetType.None:
                return false;
            case sheetType.Table:
            case sheetType.Object:
                return data.length >= 4;
            case sheetType.Enum:
                return data[0].length >= 4;
            case sheetType.Const:
                return data[0].length >= 5;
        }
    },

    /**
     *
     * @private
     * @param {string} name
     * @param {sheetType} type
     * @param {Array.<Array>} data
     */
    _createSchema: function (name, type, data) {
        /**
         * @type {Array.<DataSchemaAttr>}
         */
        const attrs = [];

        switch (type) {
            case sheetType.Table:
                {
                    const columns = data[0].length;
                    for (let i = 0; i < columns; i++) {
                        const attr = new DataSchemaAttr(
                            data[0][i],
                            data[1][i],
                            data[2][i],
                            data[3][i]
                        );
                        attrs.push(attr);
                    }
                }
                break;
            case sheetType.Enum:
                {
                    let value = 0;
                    const rows = data.length;
                    const columns = data[0].length;
                    for (let i = 0; i < rows; i++) {
                        value =
                            (columns === 5 ? data[i][4] : data[i][3]) || value;
                        const attr =
                            columns === 5
                                ? new DataSchemaAttr(
                                      data[i][0],
                                      data[i][1],
                                      data[i][2],
                                      data[i][3],
                                      value
                                  )
                                : new DataSchemaAttr(
                                      data[i][0],
                                      dataType.Int,
                                      data[i][1],
                                      data[i][2],
                                      value
                                  );

                        attrs.push(attr);

                        value++;
                    }
                }
                break;
            case sheetType.Const:
            case sheetType.Object:
                {
                    const rows = data.length;
                    for (let i = 0; i < rows; i++) {
                        const attr = new DataSchemaAttr(
                            data[i][0],
                            data[i][1],
                            data[i][2],
                            data[i][3]
                        );
                        attrs.push(attr);
                    }
                }
                break;
        }

        if (attrs.length <= 0) {
            return null;
        }

        return new DataSchema(name, type, attrs);
    },

    /**
     * @private
     * @param {DataSchema} schema
     * @param {Array.<Array<object>>} sheetData
     * @returns {(object | object[] | null)}
     */
    _createData: function (schema, sheetData) {
        if (!schema || !sheetData) {
            return null;
        }

        switch (schema.sheetType) {
            case sheetType.Enum:
            case sheetType.Const: {
                const data = [];
                for (let i = 0; i < sheetData.length; i++) {
                    const row = sheetData[i];
                    const last = row[row.length - 1];
                    data.push(last);
                }

                return schema.create(data);
            }
            case sheetType.Table: {
                return schema.create(sheetData.filter((_, i) => i >= 4));
            }
            case sheetType.Object:
            default:
                return null;
        }
    },

    /**
     * @param {(string|Buffer|Stream)} input path or buffer and redear stream
     * @returns {Promise.<Map.<{schema:DataSchema, info:Array.<Array>} | null>}
     */
    _parse: async function (input) {
        /**
         * @type {Map.<{schema:DataSchema, info:Array.<Array>}>}
         */
        const result = {};
        let dirty = false;
        const sheets = await readSheetNames(input);

        for (let i = 0; i < sheets.length; i++) {
            const s = sheets[i];
            const sheetData = await reader(input, { sheet: s });
            const type = util.getSheetType(s);
            const name = util.getConfigName(s);
            this._logger.log(`parsing sheet named(${s})`);
            if (this._checkSheet(type, sheetData)) {
                const schema = this._createSchema(name, type, sheetData);
                if (!schema) {
                    dirty = true;
                    this._logger.error(`sheet named ${s} is not valid`);
                } else if (result[name]) {
                    this.dirty = true;
                    this._logger.error(
                        `sheet named ${s} for type [${name}] is duplicated`
                    );
                } else {
                    result[name] = { schema, info: sheetData };
                }
            } else {
                this.dirty = true;
                this._logger.error(`sheet name(${s}) is not valid`);
            }
        }

        if (!dirty) {
            return result;
        } else {
            return null;
        }
    },

    /**
     * @param {(string|Buffer|Stream)} input path or buffer and redear stream
     */
    parse: async function (input) {
        const data = await this._parse(input);
        if (!data) {
            this._logger.error('parse excel failed');
            return null;
        }

        return data;
    },

    /**
     * @param {schema:DataSchema,info:Array<Array<any>>} data
     */
    createData: function (data) {
        if (data.schema.sheetType != sheetType.Enum) {
            return this._createData(data.schema, data.info);
        }
        return null;
    },
};

module.exports = Parser;
