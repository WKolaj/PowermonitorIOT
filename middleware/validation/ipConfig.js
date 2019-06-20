const Joi = require("joi");
const validationMiddleware = require("../validation.js");
const User = require("../../classes/user/User");
const Project = require("../../classes/project/Project");

//Do no allow white spaces!
let ipConfigSchema = Joi.object().keys({
  static: Joi.bool().required(),
  ipAdress: Joi.string().ip(),
  subnet: Joi.string().ip(),
  gateway: Joi.string().ip(),
  dns: Joi.string().ip()
});

/**
 * @description Method for validate if ipAdress config object is valid while
 */
let validateEdit = function(req) {
  return new Promise(async (resolve, reject) => {
    Joi.validate(req.body, ipConfigSchema, (err, value) => {
      if (err) {
        return resolve(err.details[0].message);
      } else {
        //If ipAdress is set to static - ipAdress, subnet, gateway must be set
        if (
          req.body.static &&
          !(req.body.ipAdress && req.body.subnet && req.body.gateway)
        ) {
          return resolve(
            "All parameters - ipAdress, subnet and gateway have to be defined"
          );
        }

        return resolve();
      }
    });
  });
};

//Validator for edition
module.exports.edit = validationMiddleware(validateEdit);
