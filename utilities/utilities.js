const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const { promisify } = require("util");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const si = require("systeminformation");
const config = require("config");
const logger = require("../logger/logger");
const Netmask = require("netmask").Netmask;
const os = require("os");
const dns = require("dns");
const network = require("network");

const getFullPath = pathName => {
  return path.resolve(pathName);
};

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
module.exports.appendFileAsync = promisify(fs.appendFile);
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

module.exports.getCurrentProject = function() {
  return require("../classes/project/Project").CurrentProject;
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

/**
 * @description Method for hashing password
 * @param {String} stringToHash string to hash
 */
module.exports.hashString = async function(stringToHash) {
  return bcrypt.hash(stringToHash, saltRounds);
};

/**
 * @description Method for checking string
 * @param {String} normalString normal string
 * @param {String} hashedString hashed string
 */
module.exports.hashedStringMatch = async function(normalString, hashedString) {
  return bcrypt.compare(normalString, hashedString);
};

/**
 * @description Method for getting cpu information
 */
module.exports.getCPUInfo = async function() {
  try {
    let cpuTemp = await si.cpuTemperature();
    let cpuSpeed = await si.currentLoad();

    return {
      temperature: {
        value: cpuTemp.main
      },
      load: {
        value: cpuSpeed.currentload
      }
    };
  } catch (err) {
    logger.error(err.message, err);
    return;
  }
};

/**
 * @description Method for getting RAM information
 */
module.exports.getRAMInfo = async function() {
  try {
    let ram = await si.mem();
    return {
      free: ram.available,
      total: ram.total,
      used: ram.active
    };
  } catch (err) {
    logger.error(err.message, err);
    return;
  }
};

/**
 * @description Method for getting Memory information
 */
module.exports.getMemoryInfo = async function() {
  try {
    let projectPath = getFullPath(config.get("projPath"));
    let db1Path = getFullPath(config.get("db1Path"));
    let db2Path = getFullPath(config.get("db2Path"));

    let fsLayout = await si.fsSize();

    let payloadToReturn = {};

    for (let fileSystem of fsLayout) {
      if (projectPath.startsWith(fileSystem.mount)) {
        payloadToReturn["projSpace"] = {
          total: fileSystem.size,
          used: fileSystem.used
        };
      }
      if (db1Path.startsWith(fileSystem.mount)) {
        payloadToReturn["db1Space"] = {
          total: fileSystem.size,
          used: fileSystem.used
        };
      }
      if (db2Path.startsWith(fileSystem.mount)) {
        payloadToReturn["db2Space"] = {
          total: fileSystem.size,
          used: fileSystem.used
        };
      }
    }

    return payloadToReturn;
  } catch (err) {
    logger.error(err.message, err);
    return;
  }
};

/**
 * @description Method for converting Subnet to CIDR
 * @param {*} subnet
 */
let convertSubnetToCIDR = function(subnet) {
  let block = new Netmask(`192.168.0.1`, subnet);

  return block.bitmask;
};

/**
 * @description Method for generating file content that should be written to dhcpcd.conf - raspi changes interface config this way
 * @param {boolean} ipStatic
 * @param {string} ipAdress
 * @param {string} subnetMask
 * @param {string} gateway
 * @param {string} DNS
 */
let generateDHCPCDfileContent = function(
  ipStatic,
  ipAdress,
  subnetMask,
  gateway,
  DNS
) {
  //If ip has to be defined - there should not be any command in dhcpd file
  if (!ipStatic)
    return `#dynamic
    #file was edited by PowermonitorIOT in order to set dynamic ip1`;

  let cidr = convertSubnetToCIDR(subnetMask);

  return `#static
  interface eth0
  static ip_address=${ipAdress}/${cidr}
  static routers=${gateway}
  static domain_name_servers=${DNS}`;
};

/**
 * @description Method for checking if ip is set to dynamic or static
 * !!!! Purly based on content of dhcpcd.conf file content - first string dynamic/static
 */
let getIfIpIsDynamic = async function() {
  let fileContent = (await module.exports.readFileAsync(
    "/etc/dhcpcd.conf"
  )).toString();
  return fileContent.startsWith("#static");
};

/**
 * @description Method for changing ipAdress of raspberry pi - by generating dhcpcd.conf file
 * !! MEthod reboots raspi
 */
module.exports.changeIpAdress = async function(
  isStatic,
  ipAdress,
  subnet,
  gateway,
  dns
) {
  try {
    let fileContent = generateDHCPCDfileContent(
      isStatic,
      ipAdress,
      subnet,
      gateway,
      dns
    );
    await module.exports.createFileAsync("/etc/dhcpcd.conf", fileContent);

    //Rebooting rapsi after changes
    require("child_process").exec("sudo shutdown -r now", function(msg) {
      logger.info(msg);
    });

    return;
  } catch (err) {
    logger.error(err.message, err);
    return;
  }
};

/**
 * @description Method for getting ip address info from device - also based on dhcpcd.conf file
 */
module.exports.getIpAdress = async function() {
  return new Promise(async (resolve, reject) => {
    try {
      let interfaceName = config.get("networkInterfaceName");
      let currentDNS = dns.getServers()[0];
      let ipDynamic = await getIfIpIsDynamic();

      network.get_interfaces_list(async function(err, allInterfaces) {
        if (err) return reject(err);

        for (let interFace of allInterfaces) {
          if (interFace.name === interfaceName) {
            return resolve({
              static: ipDynamic,
              ipAdress: interFace.ip_address,
              gateway: interFace.gateway_ip,
              subnet: interFace.netmask,
              dns: currentDNS
            });
          }
        }

        return reject(`There is no network interface of name ${interfaceName}`);
      });
    } catch (err) {
      return reject(err);
    }
  });
};

module.exports.exists = function(object) {
  return object !== null && object !== undefined;
};

module.exports.existsAndIsNotEmpty = function(object) {
  return module.exports.exists(object) && !module.exports.isObjectEmpty(object);
};

module.exports.isCorrectValue = function(value) {
  if (!module.exports.exists(value)) return false;
  if (!module.exports.isObjectEmpty(value)) return false;
  //If value is Boolean it is still valid
  if (value === true) return true;
  if (value === false) return true;
  if (isNaN(value)) return false;

  return true;
};
