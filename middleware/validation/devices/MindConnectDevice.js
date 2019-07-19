const Joi = require("joi");
const Project = require("../../../classes/project/Project");
const { exists, snooze } = require("../../../utilities/utilities");

//TODO - check class and write test for class (refreshing mechanism MUST BE checked) and for api endpoints

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
    .max(50),
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
    let pair = {
      id: varaibleId,
      name: variableNames[variableNames]
    };

    let error = await validateVariableNamePair(pair);
    if (error) return error;
  }
};

let setDefaultValues = function(req) {};

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
        //Checking variable names
        if (
          exists(req.body.dataAgent) &&
          exists(req.body.dataAgent.variableNames)
        ) {
          let variableNamesCheck = await checkVariableNames(
            req.body.dataAgent.variableNames
          );
          if (variableNamesCheck) return resolve(variableNamesCheck);
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
