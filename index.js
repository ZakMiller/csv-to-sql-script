const fs = require('fs');
const csv = require('csvtojson');

function getSQLColumnName(csvColumnName) {
    return csvColumnName
        .replace(/ /g, '')
        .replace('\\', '')
        .replace('/', '')
        .replace('-', '');
}

function getSafeStringValue (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "'":
                return "'"+char;
            case "\"":
            case "\\":
            case "%":
                return "\\"+char;
        }
    });
}

function createTable(writeStream, tableName, headers) {

    const start = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    writeStream.write(start);
    headers.forEach((header, index) => {
        const name = getSQLColumnName(header);
        const type = 'varchar';
        const line = `${name} ${type}${index !== headers.length - 1 ? ',' : ''}\n`;
        writeStream.write(line);
    });
    const end = ');\n';
    writeStream.write(end);
}

function insert(tableName, writeStream, rows) {
    const columnNames = Object.keys(rows[0]);
    const start = `INSERT INTO ${tableName} ( ${columnNames.map(getSQLColumnName).join(', ')} )\n VALUES\n`;
    writeStream.write(start);
    rows.forEach((row, i) => {
        const newValues = columnNames.map(c => {
            const value = row[c];
            const toPrint =`'${getSafeStringValue(value)}'`;
            return toPrint;

        });
        const values = `(${newValues.join(', ')})${i !== rows.length - 1 ? ',' : ''}\n`;
        writeStream.write(values);
    });

    const end = `;`;
    writeStream.write(end);
}

function insertions(writeStream, tableName, rows) {
    while (rows.length) {
        const thousand = rows.splice(0, 1000);
        insert(tableName, writeStream, thousand);
    }
}

async function read(filepath) {
    return await csv().fromFile(filepath);
}

exports.writeMigration = async function writeMigration(inputPath, outputPath, tableName) {
    const data = await read(inputPath);
    const columns = Object.keys(data[0]);
    let writeStream = fs.createWriteStream(outputPath);
    createTable(writeStream, tableName, columns);
    insertions(writeStream, tableName, data);
    writeStream.end();
};
