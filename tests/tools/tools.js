const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");

/**
 * @description Method for deleting file
 * @param {string} file file to delete
 */
let clearFile = async function(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, err => {
      if (err) {
        return reject(err);
      }

      return resolve(true);
    });
  });
};

/**
 * @description Method for clearing whole directory
 * @param {string} directory directory to clear
 */
let clearDirectory = async function(directory) {
  return new Promise(async (resolve, reject) => {
    fs.readdir(directory, async (err, files) => {
      if (err) {
        return reject(err);
      }

      for (const file of files) {
        try {
          await clearFile(path.join(directory, file));
        } catch (err) {
          return reject(err);
        }
      }

      return resolve(true);
    });
  });
};

/**
 * @description Method for checking if file exists
 * @param {string} filePath file to check
 */
let checkIfFileExists = function(filePath) {
  return fs.existsSync(filePath);
};

/**
 * @description Method for checking if table exists
 * @param {object} dbFile database object
 * @param {string} tableName table name
 */
let checkIfTableExists = function(dbFile, tableName) {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database(dbFile);

    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`,
      function(err, row) {
        if (err) {
          return reject(err);
        }
        return row ? resolve(true) : resolve(false);
      }
    );
  });
};

/**
 * @description Method for checking if column exists in table
 * @param {object} dbFile database object
 * @param {string} tableName table name
 * @param {string} columnName column name
 * @param {string} columnType column type
 */
let checkIfColumnExists = function(dbFile, tableName, columnName, columnType) {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database(dbFile);

    db.all(`PRAGMA table_info(${tableName});`, function(err, rows) {
      if (err) {
        return reject(err);
      }

      //Checking all rows one by one - if one of them has desired name - return true
      for (let row of rows) {
        if (row.name === columnName && row.type === columnType) {
          return resolve(true);
        }
      }

      return resolve(false);
    });
  });
};

/**
 * @description Method for creating empty db file
 * @param {object} dbFile database object
 */
let createDatabaseFile = function(dbFile) {
  let db = new sqlite3.Database(dbFile);
};

/**
 * @description Method for creating table in database
 * @param {object} dbFile database object
 * @param {string} tableName name of table
 */
let createDatabaseTable = function(dbFile, tableName) {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database(dbFile);

    db.run(
      `CREATE TABLE IF NOT EXISTS ${tableName} (date INTEGER, PRIMARY KEY(date) );`,
      err => {
        if (err) {
          return reject(err);
        }

        return resolve(true);
      }
    );
  });
};

/**
 * @description Method for creating column in database
 * @param {object} dbFile database object
 * @param {string} tableName table name
 * @param {string} columnName column name
 * @param {string} columnType column type
 */
let createDatabaseColumn = function(dbFile, tableName, columnName, columnType) {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database(dbFile);

    db.run(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType};`,
      err => {
        if (err) {
          return reject(err);
        }

        return resolve(true);
      }
    );
  });
};

/**
 * @description Method for reading all data from table
 * @param {object} dbFile database object
 * @param {string} tableName table name
 */
let readAllDataFromTable = function(dbFile, tableName) {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database(dbFile);

    db.all(`SELECT * FROM ${tableName};`, (err, rows) => {
      if (err) {
        return reject(err);
      }

      return resolve(rows);
    });
  });
};

/**
 * @description Method for sleeping thread
 * @param {number} ms number of miliseconds for thread to sleep
 */
let snooze = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  clearFile,
  clearDirectory,
  checkIfFileExists,
  checkIfTableExists,
  checkIfColumnExists,
  createDatabaseFile,
  createDatabaseTable,
  createDatabaseColumn,
  readAllDataFromTable,
  snooze
};
