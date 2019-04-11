const writer = require('./index');
const csvTypes = require('types-from-csv');
const csv = require('csvtojson');

async function read(filepath) {
    return await csv().fromFile(filepath);
}

const csvPath = '2018pit.csv';
const typeCall = csvTypes.getTypesFromCSV(csvPath);
const readCall = read(csvPath);

Promise.all([typeCall, readCall])
    .then(([types, rows]) => {
        writer.writePostgresMigration('2018pit', types, rows, '2018pitScript.txt');
    });


