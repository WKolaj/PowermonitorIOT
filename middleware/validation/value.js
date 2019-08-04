const Joi = require("joi");
const validationMiddleware = require("../validation.js");
const User = require("../../classes/user/User");
const { getCurrentProject } = require("../../utilities/utilities");

let blockedElementTypes = ["eventLogElement"];

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
          .min(-32768)
          .max(32767)
          .required()
      };
    }

    case "mbInt32": {
      return {
        value: Joi.number()
          .integer()
          .max(2147483647)
          .min(-2147483648)
          .required()
      };
    }

    case "mbUInt16": {
      return {
        value: Joi.number()
          .integer()
          .min(0)
          .max(65535)
          .required()
      };
    }

    case "mbUInt32": {
      return {
        value: Joi.number()
          .integer()
          .min(0)
          .max(4294967295)
          .required()
      };
    }

    case "mbFloat": {
      return {
        value: Joi.number().required()
      };
    }

    case "mbDouble": {
      return {
        value: Joi.number().required()
      };
    }

    case "mbSwappedDouble": {
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
          .min(-2147483648)
          .required()
      };
    }

    case "mbSwappedUInt32": {
      return {
        value: Joi.number()
          .integer()
          .min(0)
          .max(4294967295)
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

    case "s7UInt8": {
      return {
        value: Joi.number()
          .integer()
          .max(255)
          .min(0)
          .required()
      };
    }

    case "s7Int8": {
      return {
        value: Joi.number()
          .integer()
          .min(-128)
          .max(127)
          .required()
      };
    }

    case "s7Int16": {
      return {
        value: Joi.number()
          .integer()
          .min(-32768)
          .max(32767)
          .required()
      };
    }

    case "s7UInt16": {
      return {
        value: Joi.number()
          .integer()
          .min(0)
          .max(65535)
          .required()
      };
    }

    case "s7Float": {
      return {
        value: Joi.number().required()
      };
    }

    case "s7Int32": {
      return {
        value: Joi.number()
          .integer()
          .max(2147483647)
          .min(-2147483648)
          .required()
      };
    }

    case "s7UInt32": {
      return {
        value: Joi.number()
          .integer()
          .min(0)
          .max(4294967295)
          .required()
      };
    }

    //if type is not recognized - leave it without Joi validation eg. ByteArray
    default: {
      return;
    }
  }
};

let validateMBByteValue = function(value, length) {
  if (!value || !length) return "value cannot be empty";
  if (!Array.isArray(value)) return "value has to be an array";
  if (value.length !== length * 2)
    return "value (array) length has to be two times longer than length of variable";

  //Returning undefined if value is ok
  return;
};

let validateS7ByteValue = function(value, length) {
  if (!value || !length) return "value cannot be empty";
  if (!Array.isArray(value)) return "value has to be an array";
  if (value.length !== length)
    return "value (array) length has to be the same as length of variable";

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
    if (!(await getCurrentProject().doesDeviceExist(req.params.deviceId)))
      return resolve();

    //If there is no element - resolving undefined in order to return 404 later
    if (
      !(await getCurrentProject().doesElementExist(
        req.params.deviceId,
        req.params.elementId
      ))
    )
      return resolve();

    let element = await getCurrentProject().getElement(
      req.params.deviceId,
      req.params.elementId
    );

    if (
      blockedElementTypes.some(
        blockedElement => blockedElement === element.Type
      )
    )
      return resolve(`Element of type ${element.Type} does not have values!`);

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

          return resolve(validateMBByteValue(req.body.value, element.Length));
        }
        case "s7ByteArray": {
          if (!req.body.value) return resolve("value has to be defined");

          return resolve(validateS7ByteValue(req.body.value, element.Length));
        }
        default: {
          return resolve("element type not recognized");
        }
      }
    }
  });
};

let validateGet = function(req) {
  return new Promise(async (resolve, reject) => {
    //Checking parameters
    if (!req.params.deviceId) return resolve("deviceId has to be defined!");
    if (!req.params.elementId) return resolve("variableId has to be defined!");

    //Getting variable to edit

    //If there is no device - resolving undefined in order to return 404 later
    if (!(await getCurrentProject().doesDeviceExist(req.params.deviceId)))
      return resolve();

    //If there is no element - resolving undefined in order to return 404 later
    if (
      !(await getCurrentProject().doesElementExist(
        req.params.deviceId,
        req.params.elementId
      ))
    )
      return resolve();

    let element = await getCurrentProject().getElement(
      req.params.deviceId,
      req.params.elementId
    );

    if (
      blockedElementTypes.some(
        blockedElement => blockedElement === element.Type
      )
    )
      return resolve(`Element of type ${element.Type} does not have values!`);

    return resolve();
  });
};

//Validator for edition
module.exports.edit = validationMiddleware(validateEdit);

module.exports.get = validationMiddleware(validateGet);

module.exports.blockedElementTypes = blockedElementTypes;
