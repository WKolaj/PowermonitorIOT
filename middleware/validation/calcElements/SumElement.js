const Joi = require("joi");
const Project = require("../../../classes/project/Project");

let SumElementVariableCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("sumElement")
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
  variables: Joi.array().required(),
  archiveTimeSample: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required()
});

let SumElementVariableEditSchema = Joi.object().keys({
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
  archiveTimeSample: Joi.number()
    .integer()
    .min(1)
    .max(10000)
});

let checkVariableArray = async function(deviceId, variableArray) {
  for (let varObject of variableArray) {
    if (varObject.id === undefined)
      return "id inside variables array objects cannot be undefined!";
    if (varObject.factor === undefined)
      return "factor inside variables array objects cannot be undefined!";
    if (typeof varObject.factor !== "number")
      return "factor inside variables has to be a number!";
    if (typeof varObject.id !== "string")
      return "id inside variables has to be a string!";
    if (
      !(await Project.CurrentProject.doesVariableExist(deviceId, varObject.id))
    )
      return "variable of id inside variables array objects does not exist!";

    //Everything is valid - returning undefined
    return;
  }
};

let setDefaultValues = function(req) {
  if (req.body.sampleTime === undefined) req.body.sampleTime = 1;
  if (req.body.archiveTimeSample === undefined) req.body.archiveTimeSample = 1;
  if (req.body.unit === undefined) req.body.unit = "";
  if (req.body.archived === undefined) req.body.archived = false;
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
      SumElementVariableCreateSchema,
      async (err, value) => {
        if (err) {
          return resolve(err.details[0].message);
        } else {
          //Checking if variables array is valid
          let variableCheck = await checkVariableArray(
            req.params.deviceId,
            req.body.variables
          );
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
    Joi.validate(req.body, SumElementVariableEditSchema, async (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        //Checking if variables array is valid
        let variableCheck = await checkVariableArray(
          req.params.deviceId,
          req.body.variables
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
