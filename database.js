const mysql = require('mysql');
const { getCircularReplacer } = require('./util');

/**
 * Build a MySQL connection based on the environment variables specified with DB_*
 * @returns {mysql.Connection} A MySQL connection object.
 */
function getConnection() {
    return mysql.createConnection({
        host: process.env['DB_HOST'],
        user: process.env['DB_USER'],
        password: process.env['DB_PASSWORD'],
        database: process.env['DB_DATABASE']
    });
}

/**
 * Executes a query statement with the specified bindings.
 *   A query can be a Prepared Statement, and bindings values can be specified in the `bindings` argument.
 * @param {String} query The SQL query.
 * @param {Array<*>} bindings Bindings for the Prepared Statement (if any), otherwise an empty array should be used.
 * @returns {Object} An object representing the results where keys = columns and values = data.
 */
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

/**
 * Generates a SELECT query.
 * @param {String} table 
 * @param {String} rawConditions 
 * @param {String} rawColumns 
 * @returns {String}
 */
function qSelect(table, rawConditions = '', rawColumns = '*') {
    rawConditions = rawColumns.length > 0 ? (' WHERE ' + rawConditions) : rawConditions;
    return `SELECT ${rawColumns} FROM ${table}${rawConditions}`;
}

/**
 * Generates a query for counting the number of rows in a table (optionally) given conditions.
 * @param {String} table 
 * @param {String} rawConditions 
 * @returns {String}
 */
function qCount(table, rawConditions = null) {
    // format the query properly if conditions are specified
    return qSelect(table, rawConditions, 'count(*)');
}

/**
 * Generates a query for selecting rows based on `repeat` filters and a single repeating clause.
 * @param {String} table 
 * @param {String[]} columns 
 * @param {String} join_phrase 
 * @param {String} rawColumns 
 * @returns {String}
 * @throws {Error}
 */
function qSelectID_Plural(table, columns, join_phrase = 'OR', rawColumns = '*') {
    if (columns.length < 1) throw new Error(`Invalid column count: ${columns}`);
    let where_conditions = columns.map(col => `\`${col}\` = ?`).join(` ${join_phrase} `);
    return qSelect(table, where_conditions, rawColumns);
}

/**
 * Genereates a query to lookup rows by one specific identifying column.
 * @param {String} table 
 * @param {String} idCol 
 * @returns {String}
 */
function qSelectID(table, idCol = 'id') {
    return qSelectID_Plural(table, [idCol], 'AND');
}

/**
 * Generates a query for inserting a row into `table` using `requiredCols` columns.
 * @param {String} table 
 * @param {String[]} requiredCols 
 * @returns {String}
 */
function qInsertion(table, requiredCols) {
    let columns = requiredCols.map(column => `\`${column}\``).join(', ');
    let values = requiredCols.map(_ => '?').join(', ');

    return `INSERT INTO \`${table}\` (${columns}) VALUES (${values});`;
}

const ALIAS_RESULT_COLUMN = 'FINAL';
/**
 * Generates a statement for aliasing different table's values into appropriately named columns
 *   to be used in SELECT queries involving JOIN statements.
 * @param {String[]} tables The JOINed tables.
 * @returns {String} (table of tables), (column of table) => `table`.`column` as 'table.column', {...}
 */
async function getColumnsAsSelectAliases(tables) {
    console.log("tables: ", tables);

    let prepared_fields = new Array(tables.length).fill('?').join(', ');
    let q = qSelect(
        '`information_schema`.`columns`', 
        ['table_schema = ?', `table_name IN (${prepared_fields})`].join(' AND '),
        `group_concat(concat('\`', table_name, '\`.\`', column_name, '\` as \\'', table_name, '.', column_name, '\\'') SEPARATOR ', ') as ${ALIAS_RESULT_COLUMN}`)
    /* Equivalent to:
        `SELECT
            group_concat(concat('\`', table_name, '\`.\`', column_name, '\` as \\'', table_name, '.', column_name, '\\'') SEPARATOR ', ') as ${ALIAS_RESULT_COLUMN}
        FROM
            \`information_schema\`.\`columns\`
        WHERE
            table_schema = ?
            AND table_name IN(
                ${prepared_fields}
        );`
    */

    console.log("query: ", q);

    let database = getConnection().config.database;
    let results = await query(q, [database, ...tables]);
    if (results.length <= 0) {
        throw new Error(`Cannot build columns as select aliases for tables: '${tables}'`);
    }
    let aliases = results[0][ALIAS_RESULT_COLUMN];
    console.log('built aliases: ', aliases);
    return aliases;
}

module.exports = {getConnection, query, qCount, qSelectID_Plural, qSelectID, qInsertion, getColumnsAsSelectAliases};