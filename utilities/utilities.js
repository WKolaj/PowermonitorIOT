const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const { promisify } = require("util");

//Method for checking if object is empty
module.exports.isObjectEmpty = function(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

//Method for getting current application version
module.exports.getCurrentAppVersion = function() {
  let pjson = require("../package.json");

  return pjson.version;
};

//Creating promise from non promise functions
module.exports.statAsync = promisify(fs.stat);
module.exports.readFileAsync = promisify(fs.readFile);
module.exports.writeFileAsync = promisify(fs.writeFile);
module.exports.readDirAsync = promisify(fs.readdir);
module.exports.createDirAsync = promisify(fs.mkdir);
module.exports.unlinkAnsync = promisify(fs.unlink);

module.exports.checkIfDirectoryExistsAsync = async function(directoryPath) {
  return new Promise(async (resolve, reject) => {
    fs.stat(directoryPath, function(err) {
      if (!err) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

module.exports.checkIfFileExistsAsync = async function(filePath) {
  return new Promise(async (resolve, reject) => {
    fs.stat(filePath, function(err) {
      if (!err) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

module.exports.createFileAsync = async function(filePath, fileContent) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, fileContent, function(err) {
      if (err) {
        return reject(err);
      }

      return resolve(true);
    });
  });
};

/**
 * @description Method for deleting file
 * @param {string} file file or directory to delete
 */
module.exports.removeFileOrDirectoryAsync = async function(filePath) {
  return new Promise(function(resolve, reject) {
    fs.lstat(filePath, function(err, stats) {
      if (err) {
        return reject(err);
      }
      if (stats.isDirectory()) {
        resolve(module.exports.removeDirectoryAsync(filePath));
      } else {
        fs.unlink(filePath, function(err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      }
    });
  });
};

/**
 * @description Method for clearing whole directory
 * @param {string} directory directory to clear
 */
module.exports.clearDirectoryAsync = async function(directory) {
  return new Promise(function(resolve, reject) {
    fs.access(directory, function(err) {
      if (err) {
        return reject(err);
      }
      fs.readdir(directory, function(err, files) {
        if (err) {
          return reject(err);
        }
        Promise.all(
          files.map(function(file) {
            var filePath = path.join(directory, file);
            return module.exports.removeFileOrDirectoryAsync(filePath);
          })
        )
          .then(function() {
            return resolve();
          })
          .catch(reject);
      });
    });
  });
};

/**
 * @description Method for removing directory
 * @param {string} directory directory to clear
 */
module.exports.removeDirectoryAsync = async function(directory) {
  return new Promise(function(resolve, reject) {
    fs.access(directory, function(err) {
      if (err) {
        return reject(err);
      }
      fs.readdir(directory, function(err, files) {
        if (err) {
          return reject(err);
        }
        Promise.all(
          files.map(function(file) {
            var filePath = path.join(directory, file);
            return module.exports.removeFileOrDirectoryAsync(filePath);
          })
        )
          .then(function() {
            fs.rmdir(directory, function(err) {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          })
          .catch(reject);
      });
    });
  });
};

/**
 * @description Method for checking if table exists
 * @param {object} dbFile database object
 * @param {string} tableName table name
 */
module.exports.checkIfTableExists = function(dbFile, tableName) {
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
module.exports.checkIfColumnExists = function(
  dbFile,
  tableName,
  columnName,
  columnType
) {
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
module.exports.createDatabaseFile = function(dbFile) {
  let db = new sqlite3.Database(dbFile);
};

/**
 * @description Method for creating table in database
 * @param {object} dbFile database object
 * @param {string} tableName name of table
 */
module.exports.createDatabaseTable = function(dbFile, tableName) {
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
module.exports.createDatabaseColumn = function(
  dbFile,
  tableName,
  columnName,
  columnType
) {
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
module.exports.readAllDataFromTable = function(dbFile, tableName) {
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
module.exports.snooze = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};
