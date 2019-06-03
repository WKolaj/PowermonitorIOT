const fs = require("fs");
const path = require("path");
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

/**
 * @description Method for clearing whole directory
 * @param {string} directory directory to clear
 */
module.exports.clearDirectoryAsync = async function(directory) {
  return new Promise(async (resolve, reject) => {
    fs.readdir(directory, async (err, files) => {
      if (err) {
        return reject(err);
      }

      for (const file of files) {
        try {
          await module.exports.unlinkAnsync(path.join(directory, file));
        } catch (err) {
          return reject(err);
        }
      }

      return resolve(true);
    });
  });
};

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
