const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const isSuperAdmin = require("../middleware/authSuperAdmin");
const isDataAdmin = require("../middleware/authDataAdmin");
const canVisualizeData = require("../middleware/authCanVisualize");
const canOperateData = require("../middleware/authCanOperate");
const Project = require("../classes/project/Project");
const _ = require("lodash");
const validate = require("../middleware/validation/event");
const Sampler = require("../classes/sampler/Sampler");
let { getCurrentProject, exists } = require("../utilities/utilities");

//Method for validation if given query params - timeStamp, timeRangeStart, timeRangeStop are valid or not
let validateTick = tick => {
  let convertedTickId = parseInt(tick);

  if (isNaN(convertedTickId)) {
    return "tickId has to be an integer";
  }
  if (convertedTickId < 0) {
    return "tickId cannot be less than 0";
  }
  return;
};

router.get(
  "/:deviceId/:elementId",
  [auth, canVisualizeData, validate.get],
  async (req, res) => {
    //Checking if device exists
    if (!req.params.deviceId)
      return res.status(400).send("Invalid request - deviceId cannot be empty");

    if (!(await getCurrentProject().doesDeviceExist(req.params.deviceId)))
      return res.status(404).send("There is no device od given id");

    //Checking if element exists
    if (
      !(await getCurrentProject().doesElementExist(
        req.params.deviceId,
        req.params.elementId
      ))
    )
      return res.status(404).send("There is no element od given id");

    let element = await getCurrentProject().getElement(
      req.params.deviceId,
      req.params.elementId
    );

    if (!validate.allowedElementTypes.some(el => el === element.Type))
      return res
        .status(400)
        .send(`Element type of ${element.Type} does not have events!`);

    //Getting single value from database
    if (req.query.timestamp !== undefined) {
      //Checking if time sample is correct
      let result = validateTick(req.query.timestamp);
      if (result) return res.status(400).send(result);

      let eventObject = await element.getEventFromDB(
        req.params.elementId,
        req.query.timestamp
      );

      return res.status(200).send(eventObject);
    }

    //Getting range of values from database
    else if (req.query.timeRangeStart || req.query.timeRangeStop) {
      //Validate timeRangeStart
      let result1 = validateTick(req.query.timeRangeStart);
      if (result1) return res.status(400).send(result1);

      //Validate timeRangeStop
      let result2 = validateTick(req.query.timeRangeStop);
      if (result2) return res.status(400).send(result2);

      let eventObjects = await element.getEventsFromDB(
        req.params.elementId,
        req.query.timeRangeStart,
        req.query.timeRangeStop
      );

      if (eventObjects === undefined || eventObjects === []) {
        return res.status(200).send({});
      }

      return res.status(200).send(eventObjects);
    }

    //Getting actual value
    else {
      if (!exists(element.LastEvent)) return res.status(200).send({});

      let payloadToReturn = {
        [element.LastEventTickId]: element.LastEvent
      };
      return res.status(200).send(payloadToReturn);
    }
  }
);

module.exports = router;
