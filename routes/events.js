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

let generateEventPayloadGeneralFromElement = element => {
  return element.LastEvent;
};

let generateEventPayloadDetailedFromElement = element => {
  return {
    [element.LastEventId]: element.LastEvent
  };
};

let generateEventPayloadDetailedFromValueObject = valueObject => {
  if (valueObject === {} || valueObject === undefined || valueObject === null)
    return undefined;
  return valueObject;
};

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

router.get("/:deviceId", [auth, canVisualizeData], async (req, res) => {
  if (!req.params.deviceId)
    return res.status(400).send("Invalid request - deviceId cannot be empty");

  if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
    return res.status(404).send("There is no device od given id");

  let payloadToReturn = {};

  let allElements = await Project.CurrentProject.getAllCalcElements(
    req.params.deviceId
  );

  let allVariables = await Project.CurrentProject.getAllVariables(
    req.params.deviceId
  );

  for (let element of allElements) {
    if (
      validate.allowedElementTypes.some(
        allowedType => allowedType === element.Type
      )
    )
      payloadToReturn[element.Id] = generateEventPayloadGeneralFromElement(
        element
      );
  }

  for (let variable of allVariables) {
    if (
      validate.allowedElementTypes.some(
        allowedType => allowedType === variable.Type
      )
    )
      payloadToReturn[variable.Id] = generateEventPayloadGeneralFromElement(
        variable
      );
  }

  return res.status(200).send(payloadToReturn);
});

router.get(
  "/:deviceId/:elementId",
  [auth, canVisualizeData, validate.get],
  async (req, res) => {
    //Checking if device exists
    if (!req.params.deviceId)
      return res.status(400).send("Invalid request - deviceId cannot be empty");

    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return res.status(404).send("There is no device od given id");

    //Checking if element exists
    if (
      !(await Project.CurrentProject.doesElementExist(
        req.params.deviceId,
        req.params.elementId
      ))
    )
      return res.status(404).send("There is no element od given id");

    let element = await Project.CurrentProject.getElement(
      req.params.deviceId,
      req.params.elementId
    );

    //Getting single value from database
    if (req.query.timestamp !== undefined) {
      //Checking if time sample is correct
      let result = validateTick(req.query.timestamp);
      if (result) return res.status(400).send(result);

      let valueObject = await Project.CurrentProject.getValueBasedOnDate(
        req.params.deviceId,
        req.params.elementId,
        req.query.timestamp
      );

      let payloadToReturn = generateEventPayloadDetailedFromValueObject(
        valueObject
      );

      return res.status(200).send(payloadToReturn);
    }

    //Getting range of values from database
    else if (req.query.timeRangeStart || req.query.timeRangeStop) {
      //Validate timeRangeStart
      let result1 = validateTick(req.query.timeRangeStart);
      if (result1) return res.status(400).send(result1);

      //Validate timeRangeStop
      let result2 = validateTick(req.query.timeRangeStop);
      if (result2) return res.status(400).send(result2);

      //Or logic - in order to check if req is valid even if only one is given
      let allValueObjects = await Project.CurrentProject.getValuesBasedOnDate(
        req.params.deviceId,
        req.params.elementId,
        req.query.timeRangeStart,
        req.query.timeRangeStop
      );

      if (allValueObjects === undefined || allValueObjects === []) {
        return res.status(200).send({});
      }

      let payloadToReturn = {};

      for (let valueObject of allValueObjects) {
        if (valueObject !== {}) {
          let tickId = Object.keys(valueObject)[0];
          let value = Object.values(valueObject)[0];
          payloadToReturn[tickId] = value;
        }
      }

      return res.status(200).send(payloadToReturn);
    }

    //Getting actual value
    else {
      let payloadToReturn = generateEventPayloadDetailedFromElement(element);
      return res.status(200).send(payloadToReturn);
    }
  }
);

router.put(
  "/:deviceId/:elementId",
  [auth, canOperateData, validate.edit],
  async (req, res) => {
    //Checking if device exists
    if (!req.params.deviceId)
      return res.status(400).send("Invalid request - deviceId cannot be empty");

    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return res.status(404).send("There is no device od given id");

    //Checking if element exists
    if (
      !(await Project.CurrentProject.doesElementExist(
        req.params.deviceId,
        req.params.elementId
      ))
    )
      return res.status(404).send("There is no element od given id");

    let element = await Project.CurrentProject.getElement(
      req.params.deviceId,
      req.params.elementId
    );

    element.ValueTickId = Sampler.convertDateToTickNumber(Date.now());
    element.Value = req.body.value;

    let payloadToReturn = generateEventPayloadDetailedFromElement(element);
    res.status(200).send(payloadToReturn);
  }
);

module.exports = router;
