const fs = require('fs');
const { parse } = require('yaml');
const  {Exporter} = require("./src/exporter")
const { Command } = require('commander');
const program = new Command();
const version = '0.0.1';

function initCommand() {
    program
        .name('cconfig')
        .description(
            'cconfig is a command line tool for exporting excel to code config.'
        )
        .version(version);
}

function buildCommands() {
    program
        .command('export')
        .argument('<file>', 'config file')
        .argument('<tag>', "output config's tag")
        .action((file, tag) => {
            fs.readFile(file, 'utf8', (err, data) => {
                if (err) throw err;
                const config = parse(data);
                const exporter = new Exporter(config, tag);
                exporter.export(tag)
            });
        });
}

module.exports = function () {
    initCommand();
    buildCommands();
    program.parse(process.argv);
};
