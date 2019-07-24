const Joi = require("joi");
const Project = require("../../../classes/project/Project");

let EventLogElementCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("eventLogElement")
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
  logVariables: Joi.array().required(),
  eventDescriptions: Joi.array().required(),
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required()
});

let EventLogElementEditSchema = Joi.object().keys({
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
  variables: Joi.array(),
  logVariables: Joi.array(),
  eventDescriptions: Joi.array(),
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
});

let checkVariableLogArray = async function(deviceId, variableArray) {
  for (let varObject of variableArray) {
    if (varObject.tickVarId === undefined)
      return "tickVariId inside variableLog array objects cannot be undefined!";
    if (varObject.valueVarId === undefined)
      return "valueVarId inside variableLog array objects cannot be undefined!";
    if (typeof tickVarId !== "string")
      return "tickVariId variables has to be a string!";
    if (typeof valueVarId !== "string")
      return "valueVarId variables has to be a string!";
    if (!(await Project.CurrentProject.doesVariableExist(deviceId, tickVarId)))
      return "variable of id tickVarId does not exist!";

    if (!(await Project.CurrentProject.doesVariableExist(deviceId, valueVarId)))
      return "variable of id valueVarId does not exist!";

    //Everything is valid - returning undefined
    return;
  }
};

let setDefaultValues = function(req) {
  //ALWAYS Override all rest of parameters !!
  req.body.sampleTime = 1;
  req.body.archiveSampleTime = 1;
  req.body.unit = "";
  req.body.archived = false;
};

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  //Setting default values for empty properties
  setDefaultValues(req);

  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, EventLogElementCreateSchema, async (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        //Checking if variables array is valid
        let variableCheck = await checkVariableLogArray(
          req.params.deviceId,
          req.body.logVariables
        );
        if (variableCheck) return resolve(variableCheck);

        return resolve();
      }
    });
  });
};

/**
 * @description Method for validate if element is valid while editing - return error message if object is not valid or undefined instead
 */
let validateEdit = function(req) {
  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, EventLogElementEditSchema, async (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        //Checking if variables array is valid
        let variableCheck = await checkVariableLogArray(
          req.params.deviceId,
          req.body.logVariables
        );
        if (variableCheck) return resolve(variableCheck);

        return resolve();
      }
    });
  });
};

//Validator for creation
module.exports.create = validateCreate;

//Validator for edition
module.exports.edit = validateEdit;
