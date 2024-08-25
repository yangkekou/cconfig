const { sheetType } = require('./define');

const SheetFormat = /(\w+)@(\w+)/;

/**
 * @param {string} name
 * @returns {sheetType}
 */
exports.getSheetType = function (name) {
    if (SheetFormat.test(name)) {
        const t = name.replace(SheetFormat, '$1').toLocaleLowerCase();
        if (t === 'enum') {
            return sheetType.Enum;
        } else if (t === 'const') {
            return sheetType.Const;
        } else if (t === 'Object') {
            return sheetType.Object;
        } else {
            return sheetType.None;
        }
    } else {
        return sheetType.Table;
    }
};

/**
 * @param {string} name name of sheet
 * @returns {string} name of config
 */
exports.getConfigName = function (name) {
    if (!SheetFormat.test(name)) {
        return name;
    } else {
        return name.replace(SheetFormat, '$2');
    }
};
