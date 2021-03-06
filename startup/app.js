const express = require("express");
//Initializing proccess of automatically calling next when error occurs while request handling - in order to go to last middlware of logging error
require("express-async-errors");
const jsonValidation = require("../middleware/jsonError");
const config = require("config");
const log = require("../logger/logger");
const app = express();
const path = require("path");
const logger = require("../logger/logger");
const cors = require("cors");

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

  const port = process.env.PORT || config.get("port");

  //Static front-end files are stored under client/build dir
  app.use(express.static(path.join(workingDirName, "client/build")));
  app.use(express.json());

  //Using method to check if there is an error of parsing json - returning if there is one
  app.use(jsonValidation);

  //Enabling use of cors - and also sending x-auth-token via auth response
  app.use(
    cors({
      allowedHeaders: [
        "x-auth-token",
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept"
      ],
      exposedHeaders: ["x-auth-token"]
    })
  );

  //Routes have to be initialized after initializing main middleware
  await require("./route")(app);

  //In order for react routing to work - implementing sending always for any not-recognized endpoints
  app.get("*", (req, res) => {
    res.sendFile(path.join(workingDirName + "/client/build/index.html"));
  });

  return app.listen(port, () => {
    log.info(`Listening on port ${port}...`);
  });
};
