const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const isSuperAdmin = require("../middleware/authSuperAdmin");
const isDataAdmin = require("../middleware/authDataAdmin");
const canVisualizeData = require("../middleware/authCanVisualize");
const canOperateData = require("../middleware/authCanOperate");
const Project = require("../classes/project/Project");
const _ = require("lodash");
const validate = require("../middleware/validation/device");

let generateDevicePayloadGeneral = device => {
  let payloadToReturn = device.ResponsePayload;
  payloadToReturn.connected = device.Connected;
  payloadToReturn.variables = Object.keys(device.Variables);
  payloadToReturn.calculationElements = Object.keys(device.CalculationElements);
  return payloadToReturn;
};

let generateDevicePayloadDetailed = device => {
  let payloadToReturn = device.ResponsePayload;
  payloadToReturn.connected = device.Connected;
  payloadToReturn.variables = Object.values(device.Variables).map(variable => {
    return {
      id: variable.Id,
      name: variable.Name
    };
  });
  payloadToReturn.calculationElements = Object.values(
    device.CalculationElements
  ).map(calcElement => {
    return {
      id: calcElement.Id,
      name: calcElement.Name
    };
  });
  return payloadToReturn;
};

router.get("/", [auth, canVisualizeData], async (req, res) => {
  let payloadToReturn = (await Project.CurrentProject.getAllDevices()).map(
    device => generateDevicePayloadGeneral(device)
  );

  return res.status(200).send(payloadToReturn);
});

router.get("/:id", [auth, canVisualizeData], async (req, res) => {
  if (!(await Project.CurrentProject.doesDeviceExist(req.params.id)))
    return res.status(404).send("Device of given id does not exist");

  let payloadToReturn = generateDevicePayloadDetailed(
    await Project.CurrentProject.getDevice(req.params.id)
  );

  return res.status(200).send(payloadToReturn);
});

router.delete("/:id", [auth, isDataAdmin], async (req, res) => {
  if (!(await Project.CurrentProject.doesDeviceExist(req.params.id)))
    return res.status(404).send("Device of given id does not exist");

  let payloadToReturn = generateDevicePayloadDetailed(
    await Project.CurrentProject.deleteDevice(req.params.id)
  );

  return res.status(200).send(payloadToReturn);
});

router.post("/", [auth, isDataAdmin, validate.create], async (req, res) => {
  let payloadToReturn = generateDevicePayloadDetailed(
    await Project.CurrentProject.createDevice(req.body)
  );

  return res.status(200).send(payloadToReturn);
});

router.put("/:id", [auth, isDataAdmin, validate.edit], async (req, res) => {
  if (!(await Project.CurrentProject.doesDeviceExist(req.params.id)))
    return res.status(404).send("Device of given id does not exist");

  let payloadToReturn = generateDevicePayloadDetailed(
    await Project.CurrentProject.updateDevice(req.params.id, req.body)
  );

  return res.status(200).send(payloadToReturn);
});

module.exports = router;
