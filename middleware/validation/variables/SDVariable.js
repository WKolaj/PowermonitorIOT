const Joi = require("joi");
const Project = require("../../../classes/project/Project");

let SDVariableCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("sdVariable")
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
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required(),
  elementId: Joi.objectId().required(),
  elementDeviceId: Joi.objectId().required()
});

let SDVariableEditSchema = Joi.object().keys({
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
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000),
  elementId: Joi.objectId(),
  elementDeviceId: Joi.objectId()
});

let setDefaultValues = function(req) {
  if (req.body.sampleTime === undefined) req.body.sampleTime = 1;
  if (req.body.archiveSampleTime === undefined) req.body.archiveSampleTime = 1;
  if (req.body.unit === undefined) req.body.unit = "";
  if (req.body.archived === undefined) req.body.archived = false;
};

let checkIfElementExists = async function(req) {
  //There's no need to check if device exists - already resolving if device does not exists earlier in calcElement validation method

  //if there are no elementId or elementDeviceId in payload - do not need to check anything
  if (!req.body.elementDeviceId && !req.body.elementId) return;

  //If there is no variableId of givenId
  if (
    !(await Project.CurrentProject.doesElementExist(
      req.body.elementDeviceId,
      req.body.elementId
    ))
  )
    return "Element of given id in device of given id in payload does not exist";

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
    Joi.validate(req.body, SDVariableCreateSchema, async (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        //Checking if element does not exists
        let elementCheck = await checkIfElementExists(req);
        if (elementCheck) return resolve(elementCheck);

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
    Joi.validate(req.body, SDVariableEditSchema, async (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        //Checking if element does not exists
        let elementCheck = await checkIfElementExists(req);
        if (elementCheck) return resolve(elementCheck);

        return resolve();
      }
    });
  });
};

//Validator for creation
module.exports.create = validateCreate;

//Validator for edition
module.exports.edit = validateEdit;
