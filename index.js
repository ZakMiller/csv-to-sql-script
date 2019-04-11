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

function parseValueWithType(value, type) {
    if (type === 'string' || type === 'date' || type === 'character') {
        return `'${value}'`;
    }
    if (type === 'bit') {
        return (value === '1') ? 'true' : 'false';
    }
    return value;
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
    const end = ');\n';
    writeStream.write(end);
}

function insert(tableName, writeStream, rows, typeMap) {
    const columnNames = Object.keys(rows[0]);
    const start = `INSERT INTO ${tableName} ( ${columnNames.map(getSQLColumnName).join(', ')} )\n VALUES\n`;
    writeStream.write(start);
    rows.forEach((row, i) => {
        const newValues = columnNames.map(c => {
            const value = row[c];
            const type = typeMap[c];
            return parseValueWithType(value, type);

        });
        const values = `(${newValues.join(', ')})${i !== rows.length - 1 ? ',' : ''}\n`;
        writeStream.write(values);
    });

    const end = `;`;
    writeStream.write(end);
}

function insertions(writeStream, tableName, rows, typeMap) {
    while (rows.length) {
        const thousand = rows.splice(0, 1000);
        insert(tableName, writeStream, thousand, typeMap);
    }

}

exports.writePostgresMigration = function writePostgresMigration(tableName, typeMap, rows, filename) {
    let writeStream = fs.createWriteStream(filename);
    createTable(writeStream, tableName, Object.keys(rows[0]), typeMap);
    insertions(writeStream, tableName, rows, typeMap);

    writeStream.end();
};

const typeMap = {
    firstType: 'string',
    secondType: 'number',
    thirdType: 'bit',
    fourthType: 'date',
    fifthType: 'character'
};

const rows = [
    {firstType: 'hello', secondType: '4', thirdType: '1', fourthType: '04/28/1993', fifthType: 'f'},
    {firstType: 'zak', secondType: '5', thirdType: '0', fourthType: '05/21/2018', fifthType: 'k'}
];

const filename = "script.txt";

const tableName = "myTable";

exports.writePostgresMigration(tableName, typeMap, rows, filename);
