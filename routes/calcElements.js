const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const isSuperAdmin = require("../middleware/authSuperAdmin");
const isDataAdmin = require("../middleware/authDataAdmin");
const canVisualizeData = require("../middleware/authCanVisualize");
const canOperateData = require("../middleware/authCanOperate");
const Project = require("../classes/project/Project");
const _ = require("lodash");
const validate = require("../middleware/validation/calcElement");

let generateCalcElementPayloadGeneral = calcElement => {
  let payloadToReturn = calcElement.Payload;
  payloadToReturn.value = calcElement.Value;
  payloadToReturn.valueTickId = calcElement.ValueTickId;
  return payloadToReturn;
};

let generateCalcElementPayloadDetailed = calcElement => {
  let payloadToReturn = calcElement.Payload;
  payloadToReturn.value = calcElement.Value;
  payloadToReturn.valueTickId = calcElement.ValueTickId;
  return payloadToReturn;
};

router.get("/:deviceId", [auth, canVisualizeData], async (req, res) => {
  if (!req.params.deviceId)
    return res.status(400).send("Invalid request - deviceId cannot be empty");

  if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
    return res.status(404).send("There is no device od given id");

  let payloadToReturn = (await Project.CurrentProject.getAllCalcElements(
    req.params.deviceId
  )).map(calcElement => generateCalcElementPayloadGeneral(calcElement));

  return res.status(200).send(payloadToReturn);
});

router.get(
  "/:deviceId/:calcElementId",
  [auth, canVisualizeData],
  async (req, res) => {
    if (!req.params.deviceId)
      return res.status(400).send("Invalid request - deviceId cannot be empty");
    if (!req.params.calcElementId)
      return res
        .status(400)
        .send("Invalid request - calcElementId cannot be empty");

    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return res.status(404).send("There is no device of given id");

    if (
      !(await Project.CurrentProject.doesCalculationElementExist(
        req.params.deviceId,
        req.params.calcElementId
      ))
    )
      return res.status(404).send("There is no calcElement of given id");

    let payloadToReturn = generateCalcElementPayloadDetailed(
      await Project.CurrentProject.getCalcElement(
        req.params.deviceId,
        req.params.calcElementId
      )
    );

    return res.status(200).send(payloadToReturn);
  }
);

router.delete(
  "/:deviceId/:calcElementId",
  [auth, isDataAdmin],
  async (req, res) => {
    if (!req.params.deviceId)
      return res.status(400).send("Invalid request - deviceId cannot be empty");
    if (!req.params.calcElementId)
      return res
        .status(400)
        .send("Invalid request - calcElementId cannot be empty");

    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return res.status(404).send("There is no device od given id");

    if (
      !(await Project.CurrentProject.doesCalculationElementExist(
        req.params.deviceId,
        req.params.calcElementId
      ))
    )
      return res.status(404).send("There is no calcElement od given id");

    let payloadToReturn = generateCalcElementPayloadDetailed(
      await Project.CurrentProject.deleteCalcElement(
        req.params.deviceId,
        req.params.calcElementId
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

    let payloadToReturn = generateCalcElementPayloadDetailed(
      await Project.CurrentProject.createCalcElement(
        req.params.deviceId,
        req.body
      )
    );

    return res.status(200).send(payloadToReturn);
  }
);

//CALCULATION ELEMENTS CANNOT BE EDITED!!!
// router.put(
//   "/:deviceId/:calcElementId",
//   [auth, isDataAdmin, validate.edit],
//   async (req, res) => {
//     if (!req.params.deviceId)
//       return res.status(400).send("Invalid request - deviceId cannot be empty");
//     if (!req.params.calcElementId)
//       return res
//         .status(400)
//         .send("Invalid request - calcElementId cannot be empty");

//     if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
//       return res.status(404).send("There is no device od given id");

//     if (
//       !(await Project.CurrentProject.doesCalculationElementExist(
//         req.params.deviceId,
//         req.params.calcElementId
//       ))
//     )
//       return res.status(404).send("There is no calcElement od given id");

//     let payloadToReturn = generateCalcElementPayloadDetailed(
//       await Project.CurrentProject.updateCalcElement(
//         req.params.deviceId,
//         req.params.calcElementId,
//         req.body
//       )
//     );

//     return res.status(200).send(payloadToReturn);
//   }
// );

module.exports = router;
