const express = require("express");
//Initializing proccess of automatically calling next when error occurs while request handling - in order to go to last middlware of logging error
require("express-async-errors");
const config = require("config");
const log = require("../logger/logger");
const app = express();
const path = require("path");
const logger = require("../logger/logger");

module.exports = async function(workingDirName) {
  if (!workingDirName) workingDirName = __dirname;

  //Setting all event emitters limit to 100
  require("events").EventEmitter.defaultMaxListeners = 100;

  //Startup of application
  await require("./logs")();
  await require("./config")();
  await require("./db")();
  await require("./validation")();
  await require("./project")();
  await require("./route")(app);

  const port = process.env.PORT || config.get("port");

  //Static front-end files are stored under client/build dir
  app.use(express.static(path.join(workingDirName, "client/build")));

  //In order for react routing to work - implementing sending always for any not-recognized endpoints
  app.get("*", (req, res) => {
    res.sendFile(path.join(workingDirName + "/client/build/index.html"));
  });

  return app.listen(port, () => {
    log.info(`Listening on port ${port}...`);
  });
};
