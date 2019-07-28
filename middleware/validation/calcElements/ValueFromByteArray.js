const Joi = require("joi");
const Project = require("../../../classes/project/Project");
const { getCurrentProject } = require("../../../utilities/utilities");
const ValueFromByteArray = require("../../../classes/calculationElement/ValueFromByteArray");

let ValueFromByteArrayCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("valueFromByteArray")
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
  bitNumber: Joi.number()
    .integer()
    .min(0)
    .max(8)
    .required(),
  byteNumber: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .required(),
  length: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required(),
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required()
});

let ValueFromByteArrayEditSchema = Joi.object().keys({
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
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000),
  bitNumber: Joi.number()
    .integer()
    .min(0)
    .max(8),
  byteNumber: Joi.number()
    .integer()
    .min(0)
    .max(100),
  length: Joi.number()
    .integer()
    .min(1)
    .max(100)
});

let setDefaultValues = function(req) {
  if (req.body.sampleTime === undefined) req.body.sampleTime = 1;
  if (req.body.archiveSampleTime === undefined) req.body.archiveSampleTime = 1;
  if (req.body.unit === undefined) req.body.unit = "";
  if (req.body.archived === undefined) req.body.archived = false;
  if (req.body.length === undefined) req.body.length = 1;
  if (req.body.bitNumber === undefined) req.body.bitNumber = 0;
  if (req.body.byteNumber === undefined) req.body.byteNumber = 0;
};

let checkVariable = async function(req) {
  //There's no need to check if device exists - already resolving if device does not exists earlier in calcElement validation method

  //If there is no variableId of givenId
  if (
    !(await getCurrentProject().doesVariableExist(
      req.params.deviceId,
      req.body.variableId
    ))
  )
    return "Variable of given id inside calcElement payload does not exist";

  let variable = await getCurrentProject().getVariable(
    req.params.deviceId,
    req.body.variableId
  );

  if (
    !ValueFromByteArray.getPossibleVariableTypes().some(
      a => a === variable.Type
    )
  )
    return `variable type ${
      variable.Type
    } does not fit for bitFromByteArrayElement`;

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
      ValueFromByteArrayCreateSchema,
      async (err, value) => {
        if (err) {
          return resolve(err.details[0].message);
        } else {
          //Checking if variable does not exists
          let variableCheck = await checkVariable(req);
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
    Joi.validate(req.body, ValueFromByteArrayEditSchema, async (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        //Checking if variable does not exists
        let variableCheck = await checkVariable(req);
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
