const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const { DataSchema } = require('../define');
/**
 *
 * @param {string} template 模版的路径
 * @param {import('../../templates').TemplateUtil} util
 * @param {string} out 输出路径
 */
function Coder(template, util, out) {
    /**
     * @property {string} template path for template
     */
    this.template = template;

    /**
     * @property {TemplateUtil} util 工具函数
     */
    this.util = util;
    /**
     * @property {string} out path for output code file
     */
    this.out = out;

    /**
     * @readonly
     * @property {boolean} split
     */
    this.split = false;

    if (!fs.existsSync(this.out)) {
        !path.extname(out) && fs.mkdirSync(this.out, { recursive: true });
    } else {
        const stat = fs.statSync(this.out);
        this.split = stat.isDirectory();
    }

    if (!this.split) {
        const folder = path.dirname(this.out);
        !fs.existsSync(folder) && fs.mkdirSync(folder, { recursive: true });
    }
}

Coder.prototype = {
    /**
     *
     * @param {DataSchema[]} schemas
     */
    gen: function (schemas) {
        if (this.split) {
            for (let i = 0; i < schemas.length; i++) {
                const data = ejs.render(
                    this.template,
                    { schemas: null, schema: schemas[i], util: this.util },
                    { views: [`${path.join(process.cwd(), 'templates')}`] }
                );
                const out = path.join(this.out, `${schemas[i].name}.js`);
                fs.writeFileSync(out, data, { encoding: 'utf-8' });
            }
        } else {
            const data = ejs.render(
                this.template,
                { schemas: schemas, schema: null, util: this.util },
                { views: [`${path.join(process.cwd(), 'templates')}`] }
            );

            fs.writeFileSync(this.out, data, {
                encoding: 'utf-8',
            });
        }
    },

    _u16ToU8Array: function (code) {
        if (code <= 0x7f) {
            return [code];
        } else if (code <= 0x7ff) {
            return [(codePoint >> 6) | 0xc0, (code & 0x3f) | 0x80];
        } else if (code <= 0xffff) {
            return [
                (code >> 12) | 0xe0,
                ((code >> 6) & 0x3f) | 0x80,
                (code & 0x3f) | 0x80,
            ];
        } else if (code <= 0x10ffff) {
            return [
                (code >> 18) | 0xf0,
                ((code >> 12) & 0x3f) | 0x80,
                ((code >> 6) & 0x3f) | 0x80,
                (code & 0x3f) | 0x80,
            ];
        }
    },
};

module.exports = Coder;
