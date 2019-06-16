const Joi = require("joi");
const validationMiddleware = require("../validation.js");
const User = require("../../classes/user/User");
const Project = require("../../classes/project/Project");

//Do no allow white spaces!
let userCreateSchema = Joi.object().keys({
  login: Joi.string()
    .min(3)
    .max(16)
    .regex(/^\S+$/)
    .required(),
  password: Joi.string()
    .min(3)
    .max(20)
    .required(),
  permissions: Joi.number()
    .min(1)
    .max(15)
    .required()
});

let userEditSchema = Joi.object().keys({
  password: Joi.string()
    .min(3)
    .max(20),
  oldPassword: Joi.string()
    .min(3)
    .max(20),
  permissions: Joi.number()
    .min(1)
    .max(15)
});

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  return new Promise(async (resolve, reject) => {
    //Checking if user already exists
    if (Project.CurrentProject.Users[req.body.login])
      return resolve("User of given login already exists");

    Joi.validate(req.body, userCreateSchema, (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        return resolve();
      }
    });
  });
};

/**
 * @description Method for validation if user's password can be changed
 * @param {object} req
 */
let validatePasswordChange = async function(req) {
  //If password is to be edited - old password must be given and it has to match with users password
  if (req.body.password) {
    if (!req.body.oldPassword) return "Old password has to be given";

    let user = Project.CurrentProject.Users[req.user.login];
    if (!user) return "User of given login does not exist";

    if (!(await user.passwordMatches(req.body.oldPassword)))
      return "Old password does not match current one";

    //Password change valid - can be changed
    return;
  }

  return;
};

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateEdit = function(req) {
  return new Promise(async (resolve, reject) => {
    //Checking if given password is valid
    let passwordValidatonMessage = await validatePasswordChange(req);
    if (passwordValidatonMessage) return resolve(passwordValidatonMessage);

    Joi.validate(req.body, userEditSchema, (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        return resolve();
      }
    });
  });
};

//Validator for creation
module.exports.create = validationMiddleware(validateCreate);

//Validator for edition
module.exports.edit = validationMiddleware(validateEdit);
