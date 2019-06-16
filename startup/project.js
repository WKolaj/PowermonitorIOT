const Project = require("../classes/project/Project");
const config = require("config");
const logger = require("../logger/logger");

module.exports = async function() {
  logger.info("initializing project...");

  const project = new Project(config.get("projPath"));
  await project.initFromFiles();

  logger.info("project initialized");

  return project;
};
