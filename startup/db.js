const logger = require("../logger/logger");
const config = require("config");

const {
  checkIfDirectoryExistsAsync,
  createDirAsync
} = require("../utilities/utilities");

module.exports = async function() {
  logger.info("database initializing database...");

  //Creating database1 dir if it doesn't exist
  if (!(await checkIfDirectoryExistsAsync(config.get("db1Path")))) {
    logger.info("directory for db1 does not exist - creating one");
    await createDirAsync(config.get("db1Path"), { recursive: true });
  }

  //Creating database2 dir if it doesn't exist
  if (!(await checkIfDirectoryExistsAsync(config.get("db2Path")))) {
    logger.info("directory for db2 does not exist - creating one");
    await createDirAsync(config.get("db2Path"), { recursive: true });
  }

  logger.info("database initialized");
};
