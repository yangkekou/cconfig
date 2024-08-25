const fs = require('fs');
const { excel } = require('./parser');
const Coder = require('./coder/coder');
const { util, templates } = require('../templates');
const { Logger, LogLevel } = require('./logger');
const Config = require('./config');
const { DataSchema } = require('./schema');

/**
 * @constructor
 * @param {Config} config
 */
function Exporter(config) {
    /**
     * @type {Config}
     * @property {Config} config
     */
    this.config = config;
}

/**
 *
 * @param {string} tag
 */
Exporter.prototype.export = function (tag) {
    const tagConfig = this.config.outputs.find((output) => output.tag === tag);
    if (!tagConfig) {
        throw new Error(`No config found for tag ${tag}`);
    }

    const template = templates[tag];

    const t_data = fs.readFileSync(template, 'utf-8');

    const code = new Coder(t_data, util[tag], tagConfig.script);

    fs.stat(this.config.files.path, (err, stats) => {
        if (err) {
            console.error('Error reading path', err);
            return;
        }

        const parser = new excel(
            new Logger(this.config.log?.level || LogLevel.ERROR)
        );

        if (!stats.isDirectory()) {
            parser.parse(this.config.files.path).then((data) => {
                DataSchema.schemas().forEach((schema) => {
                    schema.init();
                });

                /**
                 * @type {Array<DataSchema>}
                 */
                const schemas = [];
                for (const key in data) {
                    schemas.push(data[key].schema);
                }
                code.gen(schemas);

                /**
                 * @type {Map<string,any>}
                 */
                const cfgData = {};
                for (const key in data) {
                    const d = parser.createData(data[key]);
                    if (!d) {
                        continue;
                    }

                    cfgData[key] = d;
                }

                fs.writeFileSync(tagConfig.data, JSON.stringify(cfgData));
            });
        } else {
            //split
        }
    });
};

module.exports.Exporter = Exporter;
