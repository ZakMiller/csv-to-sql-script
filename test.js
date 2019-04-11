const writer = require('./index');

const input = 'mycsv.csv';
const output = 'script.sql';
writer.writeMigration(input, output, 'tableName');
