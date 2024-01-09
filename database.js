const mysql = require('mysql');
const { getCircularReplacer } = require('./util');

function getConnection() {
    return mysql.createConnection({
        host: process.env['DB_HOST'],
        user: process.env['DB_USER'],
        password: process.env['DB_PASSWORD'],
        database: process.env['DB_DATABASE']
    });
}

async function query(query, bindings = []) {
    console.log(`Query: ${query} | Bindings: ${JSON.stringify(bindings, getCircularReplacer())}`);
    return await new Promise((resolve, reject) => {
        let connection = getConnection();
        connection.query(query, bindings, (err, result) => {
            if (err) {
                console.log("A database error ocurred while executing this query.");
                console.log(err);
                connection.end();
                reject(err);
            } else {
                connection.end();
                resolve(result);
            }
        });
    });
}

function qSelectID(table, idCol = 'id') {
    return "SELECT * FROM `" + table + "` WHERE `" + idCol + "` = ?;";
}

function qInsertion(table, requiredCols) {
    var build =  "INSERT INTO `" + table + "` ";
    build += "(";
    var first = true;
    for (let key of requiredCols) {
        build += (first ? "" : ", ") + "`" + key + "`";
        first = false;
    }
    build += ") VALUES (";
    var first = true;
    for (let key of requiredCols) {
        build += (first ? "" : ", ") + "?";
        first = false;
    }
    build += ");";
    return build;
}

module.exports = {getConnection, query, qSelectID, qInsertion};