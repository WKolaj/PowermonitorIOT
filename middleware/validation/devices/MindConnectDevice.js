const Joi = require("joi");
const Project = require("../../../classes/project/Project");
const {
  exists,
  existsAndIsNotEmpty,
  getCurrentProject,
  isObjectEmpty
} = require("../../../utilities/utilities");

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

let eventDescriptionSchema = Joi.object().keys({
  source: Joi.string()
    .min(1)
    .max(100)
    .required(),
  severity: Joi.valid(20, 30, 40).required(),
  description: Joi.string()
    .min(1)
    .max(255)
    .required()
});

let dataAgentEditSchema = Joi.object().keys({
  sendingEnabled: Joi.boolean(),
  sendFileLimit: Joi.number()
    .integer()
    .min(1)
    .max(10),
  sendEventLimit: Joi.number()
    .integer()
    .min(1)
    .max(10),
  sendingInterval: Joi.number()
    .integer()
    .min(10)
    .max(10000),
  boardingKey: boardingKeySchema,
  numberOfSendingRetries: Joi.number()
    .integer()
    .min(1)
    .max(10),
  variableNames: Joi.object(),
  eventDescriptions: Joi.object()
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
  dataAgent: dataAgentEditSchema,
  eventVariables: Joi.array()
});

let variableNamePairSchema = Joi.object().keys({
  id: Joi.string()
    .min(3)
    .max(100)
    .required(),
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
});

let eventVariablePairSchema = Joi.object().keys({
  tickVarId: Joi.string().required(),
  valueVarId: Joi.string().required(),
  tickDevId: Joi.string().required(),
  valueDevId: Joi.string().required()
});

let validateEventVariablePair = variablePair => {
  return new Promise(async (resolve, reject) => {
    Joi.validate(variablePair, eventVariablePairSchema, async (err, value) => {
      if (err) return resolve(err.details[0].message);

      let project = getCurrentProject();

      let tickDevExists = await project.doesDeviceExist(variablePair.tickDevId);
      if (!exists(tickDevExists))
        return resolve(`There is no device of id ${variablePair.tickDevId}`);

      let valueDevExists = await project.doesDeviceExist(
        variablePair.valueDevId
      );
      if (!exists(valueDevExists))
        return resolve(`There is no device of id ${variablePair.valueDevId}`);

      let tickVarExists = await project.doesElementExist(
        variablePair.tickDevId,
        variablePair.tickVarId
      );
      if (!exists(tickVarExists))
        return resolve(
          `There is no element of id ${variablePair.tickVarId} in device ${
            variablePair.tickDevId
          }`
        );

      let valueVarExists = await project.doesElementExist(
        variablePair.valueDevId,
        variablePair.valueVarId
      );
      if (!exists(valueVarExists))
        return resolve(
          `There is no element of id ${variablePair.valueVarId} in device ${
            variablePair.valueDevId
          }`
        );

      return resolve();
    });
  });
};

let validateVariableNamePair = valueNamePair => {
  return new Promise(async (resolve, reject) => {
    Joi.validate(valueNamePair, variableNamePairSchema, (err, value) => {
      if (err) return resolve(err.details[0].message);
      return resolve();
    });
  });
};

let checkVariableNames = async variableNames => {
  if (!exists(variableNames)) return "variableNames should be defined";
  for (let varaibleId of Object.keys(variableNames)) {
    let variableName = variableNames[varaibleId];
    let pair = {
      id: varaibleId,
      name: variableName
    };

    let error = await validateVariableNamePair(pair);
    if (error) return error;
  }
};

let validateDescriptionPair = descriptionPair => {
  return new Promise(async (resolve, reject) => {
    Joi.validate(descriptionPair, eventDescriptionSchema, (err, value) => {
      if (err) return resolve(err.details[0].message);
      return resolve();
    });
  });
};

let validateEventDescriptionObject = eventDescriptionObject => {
  return new Promise(async (resolve, reject) => {
    if (isObjectEmpty(eventDescriptionObject)) return resolve();

    let allKeys = Object.keys(eventDescriptionObject);

    for (let key of allKeys) {
      if (isNaN(key))
        return resolve(`given value of event ${key} is not valid number`);

      let eventDescription = eventDescriptionObject[key];

      let result = await validateDescriptionPair(eventDescription);

      if (result) return resolve(result);
    }

    return resolve();
  });
};

let setDefaultValues = function(req) {};

let checkEnableSettings = async payload => {
  if (!exists(payload.dataAgent)) return;

  if (
    exists(payload.sendingEnabled) &&
    payload.sendingEnabled &&
    !existsAndIsNotEmpty(payload.boardingKey)
  ) {
    return "Boarding key cannot be empty if sendingEnabled is set to true!";
  }
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
  return new Promise((resolve, reject) => {
    Joi.validate(req.body, specialDeviceEditSchema, async (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        if (exists(req.body.dataAgent)) {
          //Checking variable names
          if (exists(req.body.dataAgent.variableNames)) {
            let variableNamesCheck = await checkVariableNames(
              req.body.dataAgent.variableNames
            );
          }

          //Checking if sending Enabled can be set to true
          if (exists(req.body.dataAgent.sendingEnabled)) {
            let sendingEnabledCheck = await checkEnableSettings(req.body);
            if (sendingEnabledCheck) return resolve(sendingEnabledCheck);
          }

          //Checking event variables
          if (exists(req.body.eventVariables)) {
            for (let variablePair of req.body.eventVariables) {
              let varaiblePairCheck = await validateEventVariablePair(
                variablePair
              );
              if (varaiblePairCheck) return resolve(varaiblePairCheck);
            }
          }

          //Checking event descriptions
          if (exists(req.body.eventDescriptions)) {
            let eventDescriptionsCheck = validateEventDescriptionObject;
            if (eventDescriptionsCheck) return resolve(eventDescriptionsCheck);
          }
        }
        return resolve();
      }
    });
  });
};

//Validator for creation
module.exports.create = validateCreate;

//Validator for edition
module.exports.edit = validateEdit;
