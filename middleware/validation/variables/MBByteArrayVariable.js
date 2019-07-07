const Joi = require("joi");
const Project = require("../../../classes/project/Project");

let MBByteArrayVariableCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("mbByteArray")
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
  value: Joi.array().required(),
  offset: Joi.number()
    .integer()
    .min(0)
    .max(10000)
    .required(),
  length: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required(),
  fCode: Joi.valid(3, 4, 16).required(),
  getSingleFCode: Joi.valid(3, 4).required(),
  setSingleFCode: Joi.valid(16).required(),
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required()
});

let MBByteArrayVariableEditSchema = Joi.object().keys({
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
  value: Joi.array(),
  offset: Joi.number()
    .integer()
    .min(0)
    .max(10000),
  length: Joi.number()
    .integer()
    .min(1)
    .max(10000),
  fCode: Joi.valid(3, 4, 16),
  getSingleFCode: Joi.valid(3, 4),
  setSingleFCode: Joi.valid(16),
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
});

let generateDefaultValue = function(length) {
  if (!length) return;

  let arrayToReturn = [];

  for (let i = 0; i < length; i++) {
    //Pushing two times - one Modbus registers equal two bytes
    arrayToReturn.push(0);
    arrayToReturn.push(0);
  }

  return arrayToReturn;
};

let setDefaultValues = function(req) {
  if (req.body.sampleTime === undefined) req.body.sampleTime = 1;
  if (req.body.archiveSampleTime === undefined) req.body.archiveSampleTime = 1;
  if (req.body.value === undefined)
    req.body.value = generateDefaultValue(req.body.length);
  if (req.body.unit === undefined) req.body.unit = "";
  if (req.body.archived === undefined) req.body.archived = false;
  if (req.body.getSingleFCode === undefined) req.body.getSingleFCode = 3;
  if (req.body.setSingleFCode === undefined) req.body.setSingleFCode = 16;
};

let validateValue = function(value, length) {
  if (!value || !length) return "value cannot be empty";
  if (!Array.isArray(value)) return "value has to be an array";
  if (value.length !== length * 2)
    return "value (array) length has to be two times longer than length of variable";

  //Returning undefined if value is ok
  return;
};

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  //Setting default values for empty properties
  setDefaultValues(req);

  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, MBByteArrayVariableCreateSchema, (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        //Checking also if value correspond with length
        let result = validateValue(req.body.value, req.body.length);
        if (result) return resolve(result);

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
    Joi.validate(
      req.body,
      MBByteArrayVariableEditSchema,
      async (err, value) => {
        if (err) {
          return resolve(err.details[0].message);
        } else {
          //if value is defined - we have to additionaly do validation for new value
          if (req.body.value) {
            //Checking also if value correspond with length

            //Getting variable Length from body and if it does not exist in body - from variable
            let variableLength = req.body.length;
            if (!variableLength) {
              //Getting variable first

              //Checking parameters
              if (!req.params.deviceId)
                return resolve("deviceId has to be defined!");
              if (!req.params.variableId)
                return resolve("variableId has to be defined!");

              //If there is no device set - resolving undefined in order to return 404 later
              if (
                !(await Project.CurrentProject.doesDeviceExist(
                  req.params.deviceId
                ))
              )
                return resolve();

              //Getting length from variable
              variableLength = (await Project.CurrentProject.getVariable(
                req.params.deviceId,
                req.params.variableId
              )).Length;
            }

            //Validating value vs length
            let result = validateValue(req.body.value, variableLength);

            if (result) return resolve(result);
          }

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
