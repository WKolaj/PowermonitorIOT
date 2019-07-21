const Joi = require("joi");
const Project = require("../../../classes/project/Project");
const { exists, existsAndIsNotEmpty } = require("../../../utilities/utilities");

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
  sendingEnabled: Joi.boolean(),
  sendFileLimit: Joi.number()
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
            if (variableNamesCheck) return resolve(variableNamesCheck);
          }
          //Checking if sending Enabled can be set to true
          if (exists(req.body.dataAgent.sendingEnabled)) {
            let sendingEnabledCheck = await checkEnableSettings(req.body);
            if (sendingEnabledCheck) return resolve(sendingEnabledCheck);
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
