const Joi = require("joi");
const Project = require("../../../classes/project/Project");

let S7DeviceCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("s7Device")
    .required(),
  name: Joi.string()
    .min(3)
    .max(100)
    .required(),
  timeout: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required(),
  ipAdress: Joi.string()
    .ip({
      version: ["ipv4"]
    })
    .required(),
  rack: Joi.number()
    .integer()
    .min(0)
    .max(255)
    .required(),
  slot: Joi.number()
    .integer()
    .min(0)
    .max(255)
    .required()
});

let S7DeviceEditSchema = Joi.object().keys({
  name: Joi.string()
    .min(3)
    .max(100),
  timeout: Joi.number()
    .integer()
    .min(1)
    .max(10000),
  ipAdress: Joi.string().ip({
    version: ["ipv4"]
  }),
  rack: Joi.number()
    .integer()
    .min(0)
    .max(255),
  slot: Joi.number()
    .integer()
    .min(0)
    .max(255),
  isActive: Joi.boolean()
});

let setDefaultValues = function(req) {
  if (req.body.timeout === undefined) req.body.timeout = 500;
  if (req.body.rack === undefined) req.body.rack = 0;
  if (req.body.slot === undefined) req.body.slot = 1;
};

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  //Setting default values for empty properties
  setDefaultValues(req);

  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, S7DeviceCreateSchema, (err, value) => {
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
    Joi.validate(req.body, S7DeviceEditSchema, (err, value) => {
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
