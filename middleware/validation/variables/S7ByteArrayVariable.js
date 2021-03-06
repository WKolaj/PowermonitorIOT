const Joi = require("joi");
const Project = require("../../../classes/project/Project");
const { getCurrentProject, exists } = require("../../../utilities/utilities");

let S7ByteArrayVariableCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("s7ByteArray")
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
  areaType: Joi.valid("I", "Q", "M", "DB").required(),
  dbNumber: Joi.number()
    .min(1)
    .max(65535)
    .required(),
  write: Joi.boolean().required(),
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required()
});

let S7ByteArrayVariableEditSchema = Joi.object().keys({
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
  areaType: Joi.valid("I", "Q", "M", "DB"),
  dbNumber: Joi.number()
    .min(1)
    .max(65535),
  write: Joi.boolean(),
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
});

let generateDefaultValue = function(length) {
  if (!length) return;

  let arrayToReturn = [];

  for (let i = 0; i < length; i++) {
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

  //Setting default DBNumber to 1 if areaType is I M ir Q
  if (
    req.body.areaType === "I" ||
    req.body.areaType === "M" ||
    req.body.areaType === "Q"
  )
    req.body.dbNumber = 1;
};

let setDefaultDBNumberToEdit = function(req, variable) {
  if (exists(req.body.areaType)) {
    //Getting area from req
    if (
      req.body.areaType === "I" ||
      req.body.areaType === "M" ||
      req.body.areaType === "Q"
    )
      req.body.dbNumber = 1;
  } else {
    //Getting area from variable
    if (
      variable.AreaType === "I" ||
      variable.AreaType === "M" ||
      variable.AreaType === "Q"
    )
      req.body.dbNumber = 1;
  }
};

let validateValue = function(value, length) {
  if (!value || !length) return "value cannot be empty";
  if (!Array.isArray(value)) return "value has to be an array";
  if (value.length !== length)
    return "value (array) length has to be equal to length of variable";

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
    Joi.validate(req.body, S7ByteArrayVariableCreateSchema, (err, value) => {
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
    //Getting current variable
    let currentProject = getCurrentProject();

    //Checking parameters
    if (!req.params.deviceId) return resolve("deviceId has to be defined!");
    if (!req.params.variableId) return resolve("variableId has to be defined!");

    //If there is no device set - resolving undefined in order to return 404 later
    if (!(await currentProject.doesDeviceExist(req.params.deviceId)))
      return resolve();

    let variableToEdit = await currentProject.getVariable(
      req.params.deviceId,
      req.params.variableId
    );

    setDefaultDBNumberToEdit(req, variableToEdit);

    Joi.validate(
      req.body,
      S7ByteArrayVariableEditSchema,
      async (err, value) => {
        if (err) {
          return resolve(err.details[0].message);
        } else {
          //if value is defined - we have to additionaly do validation for new value
          if (req.body.value) {
            //Checking also if value correspond with length

            //Getting variable Length from body and if it does not exist in body - from variable
            let variableLength = req.body.length;

            if (!exists(variableLength)) {
              //Getting length from variable
              variableLength = variableToEdit.Length;
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
