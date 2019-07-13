const Joi = require("joi");
const { exists } = require("../../../utilities/utilities");

let boardingKeyContentSchema = Joi.object().keys({
  baseUrl: Joi.string()
    .uri()
    .required(),
  iat: Joi.string().required(),
  clientCredentialProfile: Joi.array().required(),
  clientId: Joi.string().required(),
  tenant: Joi.string().required()
});

let boardingKeySchema = Joi.object().keys({
  content: boardingKeyContentSchema,
  expiration: Joi.string().required()
});

let dataAgentEditSchema = Joi.object().keys({
  sampleTimeGroups: Joi.array(),
  bufferSize: Joi.number()
    .integer()
    .min(1)
    .max(10000),
  sendDataLimit: Joi.number()
    .integer()
    .min(1)
    .max(100),
  readyToSend: Joi.bool(),
  boardingKey: boardingKeySchema,
  variableNames: Joi.object()
});

let specialDeviceCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("msAgent")
    .required(),
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
});

let specialDeviceEditSchema = Joi.object().keys({
  name: Joi.string()
    .min(3)
    .max(100),
  dataAgent: dataAgentEditSchema
});

let setDefaultValues = function(req) {
  if (exists(req.body.dataAgent)) {
    if (!exists(req.body.dataAgent.bufferSize))
      req.body.dataAgent.bufferSize = 100;
    if (!exists(req.body.dataAgent.sendDataLimit))
      req.body.dataAgent.sendDataLimit = 5;
    if (!exists(req.body.dataAgent.readyToSend))
      req.body.dataAgent.readyToSend = false;
  }
};

let validateSampleTimeGroup = sampleTimeGroupPayload => {
  if (!exists(sampleTimeGroupPayload.sampleTime))
    return "sampleTime should be defined!";
  if (!Number.isInteger(sampleTimeGroupPayload.sampleTime))
    return "sampleTime should be an integer!";
  if (sampleTimeGroupPayload.sampleTime <= 0)
    return "sampleTime should be greater than 0!";
  if (!exists(sampleTimeGroupPayload.variableIds))
    return "variableIds should be defined!";
  if (!Array.isArray(sampleTimeGroupPayload.variableIds))
    return "variableIds should be an array of strings";
};

let checkIfElementExists = async function(deviceId, elementId) {
  //There's no need to check if device exists - already resolving if device does not exists earlier in calcElement validation method

  //If there is no variableId of givenId
  if (!(await Project.CurrentProject.doesElementExist(deviceId, elementId)))
    return "Element of given id does not exist";

  //No errors - varaible exists so returning undefined;
  return;
};

let checkDataAgentVariables = async (deviceId, payload) => {
  let variablesFromSampleTimeGroups = {};
  for (let sampleTimeGroup of payload.sampleTimeGroups) {
    //validation every group
    let validationError = validateSampleTimeGroup(sampleTimeGroup);
    if (validateEdit) return validationError;

    let sampleTime = sampleTimeGroup.sampleTime;

    for (let variableId of sampleTimeGroup.variableIds) {
      variablesFromSampleTimeGroups[variableId] = {
        variableId,
        sampleTime
      };
    }
  }

  let variablesFromVariableNames = {};
  for (let variableId of Object.keys(payload.variableNames)) {
    let variableName = payload.variableNames[variableId];

    variablesFromVariableNames[variableId] = {
      variableId,
      variableName
    };
  }

  let variableIdsFromSampleTimeGroups = Object.keys(
    variablesFromSampleTimeGroups
  );
  let variableIdsFromVariableNames = Object.keys(variablesFromVariableNames);
  if (
    variableIdsFromSampleTimeGroups.length !==
    variableIdsFromVariableNames.length
  )
    return "different lengths of variables collections";

  for (let variableId of variableIdsFromSampleTimeGroups) {
    let variableName = variablesFromVariableNames[variableId].variableName;
    if (!exists(variableName)) return `no name of ${variableId} is given`;
    variablesFromSampleTimeGroups[variableId].variableName = variableName;
  }

  //Checking if variables exists inside agent device
  for (let variable of variablesFromSampleTimeGroups) {
    let variableCheck = await checkIfElementExists(
      deviceId,
      variable.variableId
    );
    if (variableCheck) return variableCheck;
  }

  return;
};

let checkDataAgentConsistency = async (deviceId, dataAgentPayload) => {
  if (
    !exists(dataAgentPayload.sampleTimeGroups) &&
    !exists(dataAgentPayload.variableNames)
  )
    return;

  if (
    !exists(dataAgentPayload.sampleTimeGroups) &&
    exists(dataAgentPayload.variableNames)
  )
    return "variableNames exists but sampleTimeGroups not";

  if (
    exists(dataAgentPayload.sampleTimeGroups) &&
    !exists(dataAgentPayload.variableNames)
  )
    return "sampleTimeGroups exists but variableNames not";

  let variablesConsistencyAlert = await checkDataAgentVariables(
    deviceId,
    dataAgentPayload
  );
  if (variablesConsistencyAlert) return variablesConsistencyAlert;

  return;
};

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  //Setting default values for empty properties
  setDefaultValues(req);

  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, specialDeviceCreateSchema, (err, value) => {
      if (err) return resolve(err.details[0].message);

      return resolve();
    });
  });
};

/**
 * @description Method for validate if element is valid while editing - return error message if object is not valid or undefined instead
 */
let validateEdit = function(req) {
  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, specialDeviceEditSchema, async (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        //Checking dataAgent consistency
        if (exists(req.body.dataAgent))
          return resolve(
            await checkDataAgentConsistency(
              req.params.deviceId,
              req.body.dataAgent
            )
          );
        return resolve();
      }
    });
  });
};

//Validator for creation
module.exports.create = validateCreate;

//Validator for edition
module.exports.edit = validateEdit;
