const Joi = require("joi");
const Project = require("../../../../classes/project/Project");

let MBDoubleVariableCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("mbSwappedDouble")
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
  value: Joi.number().required(),
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
  fCode: Joi.valid(3, 4, 16).required(),
  getSingleFCode: Joi.valid(3, 4).required(),
  setSingleFCode: Joi.valid(16).required(),
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required(),
  unitId: Joi.number()
    .integer()
    .min(1)
    .max(255)
    .required()
});

let MBDoubleVariableEditSchema = Joi.object().keys({
  name: Joi.string()
    .min(3)
    .max(100),
  sampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000),
  value: Joi.number(),
  unit: Joi.string()
    .min(0)
    .max(10)
    .allow(""),
  archived: Joi.boolean(),
  offset: Joi.number()
    .integer()
    .min(0)
    .max(10000),
  fCode: Joi.valid(3, 4, 16),
  getSingleFCode: Joi.valid(3, 4),
  setSingleFCode: Joi.valid(16),
  archiveSampleTime: Joi.number()
    .integer()
    .min(1)
    .max(10000),
  unitId: Joi.number()
    .integer()
    .min(1)
    .max(255)
});

let setDefaultValues = function(req) {
  if (req.body.sampleTime === undefined) req.body.sampleTime = 1;
  if (req.body.archiveSampleTime === undefined) req.body.archiveSampleTime = 1;
  if (req.body.value === undefined) req.body.value = 0;
  if (req.body.unit === undefined) req.body.unit = "";
  if (req.body.archived === undefined) req.body.archived = false;
  if (req.body.getSingleFCode === undefined) req.body.getSingleFCode = 3;
  if (req.body.setSingleFCode === undefined) req.body.setSingleFCode = 16;
};

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  //Setting default values for empty properties
  setDefaultValues(req);

  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, MBDoubleVariableCreateSchema, (err, value) => {
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
    Joi.validate(req.body, MBDoubleVariableEditSchema, (err, value) => {
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
