const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const isSuperAdmin = require("../middleware/authSuperAdmin");
const isDataAdmin = require("../middleware/authDataAdmin");
const canVisualizeData = require("../middleware/authCanVisualize");
const canOperateData = require("../middleware/authCanOperate");
const Project = require("../classes/project/Project");
const _ = require("lodash");
const validate = require("../middleware/validation/variable");

let generateVariablePayloadGeneral = variable => {
  let payloadToReturn = variable.Payload;
  payloadToReturn.valueTickId = variable.ValueTickId;
  return payloadToReturn;
};

let generateVariablePayloadDetailed = variable => {
  let payloadToReturn = variable.Payload;
  payloadToReturn.valueTickId = variable.ValueTickId;
  return payloadToReturn;
};

router.get("/:deviceId", [auth, canVisualizeData], async (req, res) => {
  if (!req.params.deviceId)
    return res.status(400).send("Invalid request - deviceId cannot be empty");

  if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
    return res.status(404).send("There is no device od given id");

  let payloadToReturn = (await Project.CurrentProject.getAllVariables(
    req.params.deviceId
  )).map(variable => generateVariablePayloadGeneral(variable));

  return res.status(200).send(payloadToReturn);
});

router.get(
  "/:deviceId/:variableId",
  [auth, canVisualizeData],
  async (req, res) => {
    if (!req.params.deviceId)
      return res.status(400).send("Invalid request - deviceId cannot be empty");
    if (!req.params.variableId)
      return res
        .status(400)
        .send("Invalid request - variableId cannot be empty");

    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return res.status(404).send("There is no device od given id");

    if (
      !(await Project.CurrentProject.doesVariableExist(
        req.params.deviceId,
        req.params.variableId
      ))
    )
      return res.status(404).send("There is no variable od given id");

    let payloadToReturn = generateVariablePayloadDetailed(
      await Project.CurrentProject.getVariable(
        req.params.deviceId,
        req.params.variableId
      )
    );

    return res.status(200).send(payloadToReturn);
  }
);

router.delete(
  "/:deviceId/:variableId",
  [auth, isDataAdmin],
  async (req, res) => {
    if (!req.params.deviceId)
      return res.status(400).send("Invalid request - deviceId cannot be empty");
    if (!req.params.variableId)
      return res
        .status(400)
        .send("Invalid request - variableId cannot be empty");

    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return res.status(404).send("There is no device od given id");

    if (
      !(await Project.CurrentProject.doesVariableExist(
        req.params.deviceId,
        req.params.variableId
      ))
    )
      return res.status(404).send("There is no variable od given id");

    let payloadToReturn = generateVariablePayloadDetailed(
      await Project.CurrentProject.deleteVariable(
        req.params.deviceId,
        req.params.variableId
      )
    );

    return res.status(200).send(payloadToReturn);
  }
);

router.post(
  "/:deviceId",
  [auth, isDataAdmin, validate.create],
  async (req, res) => {
    if (!req.params.deviceId)
      return res.status(400).send("Invalid request - deviceId cannot be empty");

    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return res.status(404).send("There is no device od given id");

    let payloadToReturn = generateVariablePayloadDetailed(
      await Project.CurrentProject.createVariable(req.params.deviceId, req.body)
    );

    return res.status(200).send(payloadToReturn);
  }
);

router.put(
  "/:deviceId/:variableId",
  [auth, isDataAdmin, validate.edit],
  async (req, res) => {
    if (!req.params.deviceId)
      return res.status(400).send("Invalid request - deviceId cannot be empty");
    if (!req.params.variableId)
      return res
        .status(400)
        .send("Invalid request - variableId cannot be empty");

    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return res.status(404).send("There is no device od given id");

    if (
      !(await Project.CurrentProject.doesVariableExist(
        req.params.deviceId,
        req.params.variableId
      ))
    )
      return res.status(404).send("There is no variable od given id");

    let payloadToReturn = generateVariablePayloadDetailed(
      await Project.CurrentProject.updateVariable(
        req.params.deviceId,
        req.params.variableId,
        req.body
      )
    );

    return res.status(200).send(payloadToReturn);
  }
);

module.exports = router;
