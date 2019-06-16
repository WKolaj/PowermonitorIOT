const express = require("express");
//Initializing proccess of automatically calling next when error occurs while request handling - in order to go to last middlware of logging error
require("express-async-errors");
const config = require("config");
const log = require("../logger/logger");
const app = express();

module.exports = async function() {
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

  return app.listen(port, () => {
    log.info(`Listening on port ${port}...`);
  });
};
