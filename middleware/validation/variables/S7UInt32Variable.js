const Joi = require("joi");
const Project = require("../../../classes/project/Project");

let S7UInt32VariableCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("s7UInt32")
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
    .max(4294967295)
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

let S7UInt32VariableEditSchema = Joi.object().keys({
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
    .max(4294967295),
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

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  //Setting default values for empty properties
  setDefaultValues(req);

  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, S7UInt32VariableCreateSchema, (err, value) => {
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
    Joi.validate(req.body, S7UInt32VariableEditSchema, (err, value) => {
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
