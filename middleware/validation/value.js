const Joi = require("joi");
const validationMiddleware = require("../validation.js");
const User = require("../../classes/user/User");
const Project = require("../../classes/project/Project");

let generateSchema = variableType => {
  switch (variableType) {
    case "mbBoolean": {
      return {
        value: Joi.bool().required()
      };
    }

    case "mbInt16": {
      return {
        value: Joi.number()
          .integer()
          .max(32767)
          .required()
      };
    }

    case "mbInt32": {
      return {
        value: Joi.number()
          .integer()
          .max(2147483647)
          .required()
      };
    }

    case "mbUInt16": {
      return {
        value: Joi.number()
          .integer()
          .max(65535)
          .min(0)
          .required()
      };
    }

    case "mbUInt32": {
      return {
        value: Joi.number()
          .integer()
          .max(4294967295)
          .min(0)
          .required()
      };
    }

    case "mbFloat": {
      return {
        value: Joi.number().required()
      };
    }

    case "mbSwappedFloat": {
      return {
        value: Joi.number().required()
      };
    }

    case "mbSwappedInt32": {
      return {
        value: Joi.number()
          .integer()
          .max(2147483647)
          .required()
      };
    }

    case "mbSwappedUInt32": {
      return {
        value: Joi.number()
          .integer()
          .max(4294967295)
          .min(0)
          .required()
      };
    }

    case "averageElement": {
      return {
        value: Joi.number().required()
      };
    }

    case "sumElement": {
      return {
        value: Joi.number().required()
      };
    }

    case "factorElement": {
      return {
        value: Joi.number().required()
      };
    }

    case "increaseElement": {
      return {
        value: Joi.number().required()
      };
    }

    //if type is not recognized - leave it without Joi validation eg. ByteArray
    default: {
      return;
    }
  }
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
let validateEdit = function(req) {
  return new Promise(async (resolve, reject) => {
    //Checking parameters
    if (!req.params.deviceId) return resolve("deviceId has to be defined!");
    if (!req.params.elementId) return resolve("variableId has to be defined!");

    //Getting variable to edit

    //If there is no device - resolving undefined in order to return 404 later
    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return resolve();

    //If there is no element - resolving undefined in order to return 404 later
    if (
      !(await Project.CurrentProject.doesElementExist(
        req.params.deviceId,
        req.params.elementId
      ))
    )
      return resolve();

    let element = await Project.CurrentProject.getElement(
      req.params.deviceId,
      req.params.elementId
    );

    //Generating schema based on type - variable has type defined on variable Type and calcElement on ValueType
    let schema = generateSchema(element.Type);

    //Standard mechanism - Joi validation
    if (schema) {
      Joi.validate(req.body, schema, (err, value) => {
        if (err) {
          return resolve(err.details[0].message);
        } else {
          return resolve();
        }
      });
    }
    //Non standard validation - eg. ByteArray
    else {
      switch (element.Type) {
        case "mbByteArray": {
          if (!req.body.value) return resolve("value has to be defined");

          return resolve(validateValue(req.body.value, element.Length));
        }
        default: {
          return resolve("element type not recognized");
        }
      }
    }
  });
};

//Validator for edition
module.exports.edit = validationMiddleware(validateEdit);
