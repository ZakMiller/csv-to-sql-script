# CSV to SQL Script

## Installation
```shell
npm i csv-to-sql-script
```

## Usage
```javascript

const writer = require('csv-to-sql-script');

const input = 'mycsv.csv';
const output = 'script.sql';
writer.writeMigration(input, output, 'tableName');
```
