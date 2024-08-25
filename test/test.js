const { excel } = require('../src/parser');
const { Logger, LogLevel } = require('../src/logger');

const { parse, stringify } = require('yaml');
const fs = require('fs');

const testCfgPath = './test/testCfg.xlsx';

function test() {
    const logger = new Logger(LogLevel.VERBOSE);
    const parser = new excel(logger);
    parser.parse(testCfgPath).then((data) => console.log(data));
}

function testYaml() {
    const data = fs.readFileSync('./test/config.yaml', 'utf8');
    const parsed = parse(data);
    console.debug('Parsed YAML:', parsed);
}

function main() {
    // test();
    testYaml();
}

main();
