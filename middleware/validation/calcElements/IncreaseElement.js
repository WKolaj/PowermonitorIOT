const Joi = require("joi");
const Project = require("../../../classes/project/Project");

let IncreaseElementVariableCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("increaseElement")
    .required(),
  name: Joi.string()
    .min(3)
    .max(100)
    .required(),
  sampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required(),
  unit: Joi.string()
    .min(0)
    .max(10)
    .allow("")
    .required(),
  archived: Joi.boolean().required(),
  variableId: Joi.objectId().required(),
  factor: Joi.number().required(),
  calculationInterval: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required(),
  overflow: Joi.number().required(),
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required()
});

let IncreaseElementVariableEditSchema = Joi.object().keys({
  name: Joi.string()
    .min(3)
    .max(100),
  sampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000),
  unit: Joi.string()
    .min(0)
    .max(10)
    .allow(""),
  archived: Joi.boolean(),
  variableId: Joi.objectId(),
  factor: Joi.number(),
  calculationInterval: Joi.number()
    .integer()
    .min(0)
    .max(10000),
  overflow: Joi.number(),
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
});

let setDefaultValues = function(req) {
  if (req.body.sampleTime === undefined) req.body.sampleTime = 1;
  if (req.body.archiveSampleTime === undefined) req.body.archiveSampleTime = 1;
  if (req.body.unit === undefined) req.body.unit = "";
  if (req.body.archived === undefined) req.body.archived = false;
};

let checkIfVariableExists = async function(req) {
  //There's no need to check if device exists - already resolving if device does not exists earlier in calcElement validation method

  //If there is no variableId of givenId
  if (
    !(await Project.CurrentProject.doesVariableExist(
      req.params.deviceId,
      req.body.variableId
    ))
  )
    return "Variable of given id inside calcElement payload does not exist";

  //No errors - varaible exists so returning undefined;
  return;
};
/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  //Setting default values for empty properties
  setDefaultValues(req);

  return new Promise(async (resolve, reject) => {
    Joi.validate(
      req.body,
      IncreaseElementVariableCreateSchema,
      async (err, value) => {
        if (err) {
          return resolve(err.details[0].message);
        } else {
          //Checking if variable does not exists
          let variableCheck = await checkIfVariableExists(req);
          if (variableCheck) return resolve(variableCheck);

          return resolve();
        }
      }
    );
  });
};

/**
 * @description Method for validate if element is valid while editing - return error message if object is not valid or undefined instead
 */
let validateEdit = function(req) {
  return new Promise(async (resolve, reject) => {
    Joi.validate(
      req.body,
      IncreaseElementVariableEditSchema,
      async (err, value) => {
        if (err) {
          return resolve(err.details[0].message);
        } else {
          //Checking if variable does not exists
          let variableCheck = await checkIfVariableExists(req);
          if (variableCheck) return resolve(variableCheck);

          return resolve();
        }
      }
    );
  });
};

//Validator for creation
module.exports.create = validateCreate;

//Validator for edition
module.exports.edit = validateEdit;
