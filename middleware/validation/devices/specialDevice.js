const Joi = require("joi");
const Project = require("../../../classes/project/Project");

let specialDeviceCreateSchema = Joi.object().keys({
  type: Joi.string()
    .valid("specialDevice")
    .required(),
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
});

let specialDeviceEditSchema = Joi.object().keys({
  name: Joi.string()
    .min(3)
    .max(100)
});

let setDefaultValues = function(req) {};

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  //Setting default values for empty properties
  setDefaultValues(req);

  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, specialDeviceCreateSchema, (err, value) => {
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
    Joi.validate(req.body, specialDeviceEditSchema, (err, value) => {
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
