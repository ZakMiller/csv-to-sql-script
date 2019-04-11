const fs = require('fs');

function getSQLColumnName(csvColumnName) {
    return csvColumnName.trim();
}

function getSQLTypeName(csvTypeName) {
    switch (csvTypeName) {
        case 'string':
            return 'varchar';
            break;
        case 'number':
            return 'integer';
            break;
        case 'bit':
            return 'boolean';
            break;
        case 'date':
            return 'timestamp without time zone';
            break;
        case 'character':
            return 'varchar(1)';
            break;
    }
    return csvTypeName;
}

function createTable(writeStream, tableName, headers, typeMap) {

    const start = `CREATE TABLE ${tableName} (\n`;
    writeStream.write(start);
    headers.forEach((header, index) => {
        const name = getSQLColumnName(header);
        const type = getSQLTypeName(typeMap[header]);
        const line = `${name} ${type}${index !== headers.length - 1 ? ',' : ''}\n`;
        writeStream.write(line);
    });
    const end = ');';
    writeStream.write(end);
}

exports.writePostgresMigration = async function writePostgresMigration(tableName, typeMap, rows, filename) {
    let writeStream = fs.createWriteStream(filename);
    createTable(writeStream, tableName, rows[0], typeMap);
    //writeStream.write(rows.toString());

    writeStream.end();
};

const typeMap = {
    firstType: 'string',
    secondType: 'number',
    thirdType: 'bit',
    fourthType: 'date'
};

const rows = [
    ['firstType', 'secondType', 'thirdType', 'fourthType'],
    ['hello', '4', '1', '04/28/1993'],
    ['zak', '5', '0', '05/05/2018']
];

const filename = "script.txt";

const tableName = "myTable";

exports.writePostgresMigration(tableName, typeMap, rows, filename);
