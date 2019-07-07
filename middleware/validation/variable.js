const Project = require("../../classes/project/Project");
const validationMiddleware = require("../validation");
const MBBooleanVariableValidator = require("./variables/MBBooleanVariable");
const MBByteArrayVariableValidator = require("./variables/MBByteArrayVariable");
const MBFloatVariableValidator = require("./variables/MBFloatVariable");
const MBInt16VariableValidator = require("./variables/MBInt16Variable");
const MBInt32VariableValidator = require("./variables/MBInt32Variable");
const MBSwappedFloatVariableValidator = require("./variables/MBSwappedFloatVariable");
const MBSwappedInt32VariableValidator = require("./variables/MBSwappedInt32Variable");
const MBSwappedUInt32VariableValidator = require("./variables/MBSwappedUInt32Variable");
const MBUInt16VariableValidator = require("./variables/MBUInt16Variable");
const MBUInt32VariableValidator = require("./variables/MBUInt32Variable");
const SDVariableValidator = require("./variables/SDVariable");

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  return new Promise(async (resolve, reject) => {
    if (!req.params.deviceId) return resolve("deviceId has to be defined!");

    //If there is no device set - resolving undefined in order to return 404 later
    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return resolve();

    let deviceType = (await Project.CurrentProject.getDevice(
      req.params.deviceId
    )).Type;

    if (
      deviceType === "mbDevice" ||
      deviceType === "PAC3200TCP" ||
      deviceType === "PAC2200TCP" ||
      deviceType === "PAC4200TCP"
    ) {
      switch (req.body.type) {
        case "mbBoolean": {
          return resolve(await MBBooleanVariableValidator.create(req));
        }
        case "mbByteArray": {
          return resolve(await MBByteArrayVariableValidator.create(req));
        }
        case "mbFloat": {
          return resolve(await MBFloatVariableValidator.create(req));
        }
        case "mbSwappedFloat": {
          return resolve(await MBSwappedFloatVariableValidator.create(req));
        }
        case "mbInt16": {
          return resolve(await MBInt16VariableValidator.create(req));
        }
        case "mbUInt16": {
          return resolve(await MBUInt16VariableValidator.create(req));
        }
        case "mbInt32": {
          return resolve(await MBInt32VariableValidator.create(req));
        }
        case "mbUInt32": {
          return resolve(await MBUInt32VariableValidator.create(req));
        }
        case "mbSwappedInt32": {
          return resolve(await MBSwappedInt32VariableValidator.create(req));
        }
        case "mbSwappedUInt32": {
          return resolve(await MBSwappedUInt32VariableValidator.create(req));
        }
        default: {
          return resolve("Given variable type is not recognized");
        }
      }
    } else if (deviceType === "specialDevice") {
      switch (req.body.type) {
        case "sdVariable": {
          return resolve(await SDVariableValidator.create(req));
        }
        default: {
          return resolve("Given variable type is not recognized");
        }
      }
    } else {
      return resolve(
        `Type of given device has not been recongized ( id ${
          req.params.deviceId
        } )`
      );
    }
  });
};

/**
 * @description Method for validate if element is valid while editing - return error message if object is not valid or undefined instead
 */

let validateEdit = function(req) {
  return new Promise(async (resolve, reject) => {
    if (!req.params.deviceId) return resolve("deviceId has to be defined!");
    if (!req.params.variableId) return resolve("variableId has to be defined!");

    //If there is no device set - resolving undefined in order to return 404 later
    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return resolve();

    let deviceType = (await Project.CurrentProject.getDevice(
      req.params.deviceId
    )).Type;

    //If there is no device set - resolving undefined in order to return 404 later
    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return resolve();

    //If there is no variable - resolving undefined in order to return 404 later
    if (
      !(await Project.CurrentProject.doesVariableExist(
        req.params.deviceId,
        req.params.variableId
      ))
    )
      return resolve();

    let variableType = (await Project.CurrentProject.getVariable(
      req.params.deviceId,
      req.params.variableId
    )).Type;

    if (
      deviceType === "mbDevice" ||
      deviceType === "PAC3200TCP" ||
      deviceType === "PAC4200TCP" ||
      deviceType === "PAC2200TCP"
    ) {
      switch (variableType) {
        case "mbBoolean": {
          return resolve(await MBBooleanVariableValidator.edit(req));
        }
        case "mbByteArray": {
          return resolve(await MBByteArrayVariableValidator.edit(req));
        }
        case "mbFloat": {
          return resolve(await MBFloatVariableValidator.edit(req));
        }
        case "mbSwappedFloat": {
          return resolve(await MBSwappedFloatVariableValidator.edit(req));
        }
        case "mbInt16": {
          return resolve(await MBInt16VariableValidator.edit(req));
        }
        case "mbUInt16": {
          return resolve(await MBUInt16VariableValidator.edit(req));
        }
        case "mbInt32": {
          return resolve(await MBInt32VariableValidator.edit(req));
        }
        case "mbUInt32": {
          return resolve(await MBUInt32VariableValidator.edit(req));
        }
        case "mbSwappedInt32": {
          return resolve(await MBSwappedInt32VariableValidator.edit(req));
        }
        case "mbSwappedUInt32": {
          return resolve(await MBSwappedUInt32VariableValidator.edit(req));
        }
        default: {
          return resolve("Given variable type is not recognized");
        }
      }
    } else if (deviceType === "specialDevice") {
      switch (variableType) {
        case "sdVariable": {
          return resolve(await SDVariableValidator.edit(req));
        }
        default: {
          return resolve("Given variable type is not recognized");
        }
      }
    } else {
      return resolve(
        `Type of given device has not been recongized ( id ${
          req.params.deviceId
        } )`
      );
    }
  });
};

//Validator for creation
module.exports.create = validationMiddleware(validateCreate);

//Validator for edition
module.exports.edit = validationMiddleware(validateEdit);
