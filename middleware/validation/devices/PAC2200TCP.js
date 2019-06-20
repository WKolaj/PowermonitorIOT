const Joi = require("joi");
const Project = require("../../../classes/project/Project");

let PAC2200TCPCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("PAC2200TCP")
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
  unitId: Joi.number()
    .integer()
    .min(1)
    .max(255)
    .required(),
  portNumber: Joi.number()
    .integer()
    .min(1)
    .max(100000)
    .required()
});

let PAC2200TCPEditSchema = Joi.object().keys({
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
  unitId: Joi.number()
    .integer()
    .min(1)
    .max(255),
  portNumber: Joi.number()
    .integer()
    .min(1)
    .max(100000),
  isActive: Joi.boolean()
});

let setDefaultValues = function(req) {
  if (req.body.timeout === undefined) req.body.timeout = 500;
  if (req.body.unitId === undefined) req.body.unitId = 1;
  if (req.body.portNumber === undefined) req.body.portNumber = 502;
};

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  //Setting default values for empty properties
  setDefaultValues(req);

  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, PAC2200TCPCreateSchema, (err, value) => {
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
    Joi.validate(req.body, PAC2200TCPEditSchema, (err, value) => {
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
