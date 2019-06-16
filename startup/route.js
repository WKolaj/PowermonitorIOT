const express = require("express");
const logger = require("../logger/logger");
const users = require("../routes/users");
const auth = require("../routes/auth");
const error = require("../middleware/error");

module.exports = async function(app) {
  logger.info("initializing routes...");

  app.use("/api/users", users);
  logger.info("Users route initialized");

  app.use("/api/auth", auth);
  logger.info("Auth route initialized");

  app.use(error);
  logger.info("Route error handler initialized");

  logger.info("routes initialized");
};
