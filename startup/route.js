const express = require("express");
const logger = require("../logger/logger");
const users = require("../routes/users");
const auth = require("../routes/auth");
const devices = require("../routes/devices");
const variables = require("../routes/variables");
const calcElements = require("../routes/calcElements");
const values = require("../routes/values");
const info = require("../routes/info");
const error = require("../middleware/error");

module.exports = async function(app) {
  logger.info("initializing routes...");

  app.use("/api/users", users);
  logger.info("Users route initialized");

  app.use("/api/auth", auth);
  logger.info("Auth route initialized");

  app.use("/api/devices", devices);
  logger.info("Devices route initialized");

  app.use("/api/variables", variables);
  logger.info("Variable route initialized");

  app.use("/api/calcElements", calcElements);
  logger.info("CalcElements route initialized");

  app.use("/api/values", values);
  logger.info("Values route initialized");

  app.use("/api/info", info);
  logger.info("Info route initialized");

  app.use(error);
  logger.info("Route error handler initialized");

  logger.info("routes initialized");
};
