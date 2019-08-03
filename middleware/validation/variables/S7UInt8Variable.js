const Joi = require("joi");
const Project = require("../../../classes/project/Project");
const { getCurrentProject, exists } = require("../../../utilities/utilities");

let S7UInt8VariableCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("s7UInt8")
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
  value: Joi.number()
    .integer()
    .min(0)
    .max(255)
    .required(),
  unit: Joi.string()
    .min(0)
    .max(10)
    .allow("")
    .required(),
  archived: Joi.boolean().required(),
  offset: Joi.number()
    .integer()
    .min(0)
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

let S7UInt8VariableEditSchema = Joi.object().keys({
  name: Joi.string()
    .min(3)
    .max(100),
  sampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000),
  value: Joi.number()
    .integer()
    .min(0)
    .max(255),
  unit: Joi.string()
    .min(0)
    .max(10)
    .allow(""),
  archived: Joi.boolean(),
  offset: Joi.number()
    .integer()
    .min(0)
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

let setDefaultValues = function(req) {
  if (req.body.sampleTime === undefined) req.body.sampleTime = 1;
  if (req.body.archiveSampleTime === undefined) req.body.archiveSampleTime = 1;
  if (req.body.value === undefined) req.body.value = 0;
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

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  //Setting default values for empty properties
  setDefaultValues(req);

  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, S7UInt8VariableCreateSchema, (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
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

    Joi.validate(req.body, S7UInt8VariableEditSchema, (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        return resolve();
      }
    });
  });
};

//Validator for creation
module.exports.create = validateCreate;

//Validator for edition
module.exports.edit = validateEdit;
