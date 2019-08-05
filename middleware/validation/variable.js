const Project = require("../../classes/project/Project");
const { exists } = require("../../utilities/utilities");
const validationMiddleware = require("../validation");
const MBBooleanVariableValidator = require("./variables/MBBooleanVariable");
const MBByteArrayVariableValidator = require("./variables/MBByteArrayVariable");
const MBFloatVariableValidator = require("./variables/MBFloatVariable");
const MBDoubleVariableValidator = require("./variables/MBDoubleVariable");
const MBSwappedDoubleVariableValidator = require("./variables/MBSwappedDoubleVariable");
const MBInt16VariableValidator = require("./variables/MBInt16Variable");
const MBInt32VariableValidator = require("./variables/MBInt32Variable");
const MBSwappedFloatVariableValidator = require("./variables/MBSwappedFloatVariable");
const MBSwappedInt32VariableValidator = require("./variables/MBSwappedInt32Variable");
const MBSwappedUInt32VariableValidator = require("./variables/MBSwappedUInt32Variable");
const MBUInt16VariableValidator = require("./variables/MBUInt16Variable");
const MBUInt32VariableValidator = require("./variables/MBUInt32Variable");
const S7ByteArrayVariableValidator = require("./variables/S7ByteArrayVariable");
const S7FloatVariableValidator = require("./variables/S7FloatVariable");
const S7Int16VariableValidator = require("./variables/S7Int16Variable");
const S7Int32VariableValidator = require("./variables/S7Int32Variable");
const S7UInt16VariableValidator = require("./variables/S7UInt16Variable");
const S7UInt32VariableValidator = require("./variables/S7UInt32Variable");
const S7Int8VariableValidator = require("./variables/S7Int8Variable");
const S7UInt8VariableValidator = require("./variables/S7UInt8Variable");
const SDVariableValidator = require("./variables/SDVariable");

const MBGatewayBooleanVariableValidator = require("./variables/MBGateway/MBBooleanVariable");
const MBGatewayByteArrayVariableValidator = require("./variables/MBGateway/MBByteArrayVariable");
const MBGatewayFloatVariableValidator = require("./variables/MBGateway/MBFloatVariable");
const MBGatewayDoubleVariableValidator = require("./variables/MBGateway/MBDoubleVariable");
const MBGatewaySwappedDoubleVariableValidator = require("./variables/MBGateway/MBSwappedDoubleVariable");
const MBGatewayInt16VariableValidator = require("./variables/MBGateway/MBInt16Variable");
const MBGatewayInt32VariableValidator = require("./variables/MBGateway/MBInt32Variable");
const MBGatewaySwappedFloatVariableValidator = require("./variables/MBGateway/MBSwappedFloatVariable");
const MBGatewaySwappedInt32VariableValidator = require("./variables/MBGateway/MBSwappedInt32Variable");
const MBGatewaySwappedUInt32VariableValidator = require("./variables/MBGateway/MBSwappedUInt32Variable");
const MBGatewayUInt16VariableValidator = require("./variables/MBGateway/MBUInt16Variable");
const MBGatewayUInt32VariableValidator = require("./variables/MBGateway/MBUInt32Variable");

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
        case "mbDouble": {
          return resolve(await MBDoubleVariableValidator.create(req));
        }
        case "mbSwappedDouble": {
          return resolve(await MBSwappedDoubleVariableValidator.create(req));
        }
        default: {
          return resolve("Given variable type is not recognized");
        }
      }
    } else if (deviceType === "mbGateway") {
      switch (req.body.type) {
        case "mbBoolean": {
          return resolve(await MBGatewayBooleanVariableValidator.create(req));
        }
        case "mbByteArray": {
          return resolve(await MBGatewayByteArrayVariableValidator.create(req));
        }
        case "mbFloat": {
          return resolve(await MBGatewayFloatVariableValidator.create(req));
        }
        case "mbSwappedFloat": {
          return resolve(
            await MBGatewaySwappedFloatVariableValidator.create(req)
          );
        }
        case "mbInt16": {
          return resolve(await MBGatewayInt16VariableValidator.create(req));
        }
        case "mbUInt16": {
          return resolve(await MBGatewayUInt16VariableValidator.create(req));
        }
        case "mbInt32": {
          return resolve(await MBGatewayInt32VariableValidator.create(req));
        }
        case "mbUInt32": {
          return resolve(await MBGatewayUInt32VariableValidator.create(req));
        }
        case "mbSwappedInt32": {
          return resolve(
            await MBGatewaySwappedInt32VariableValidator.create(req)
          );
        }
        case "mbSwappedUInt32": {
          return resolve(
            await MBGatewaySwappedUInt32VariableValidator.create(req)
          );
        }
        case "mbDouble": {
          return resolve(await MBGatewayDoubleVariableValidator.create(req));
        }
        case "mbSwappedDouble": {
          return resolve(
            await MBGatewaySwappedDoubleVariableValidator.create(req)
          );
        }
        default: {
          return resolve("Given variable type is not recognized");
        }
      }
    } else if (deviceType === "specialDevice" || deviceType === "msAgent") {
      switch (req.body.type) {
        case "sdVariable": {
          return resolve(await SDVariableValidator.create(req));
        }
        default: {
          return resolve("Given variable type is not recognized");
        }
      }
    } else if (deviceType === "s7Device") {
      switch (req.body.type) {
        case "s7Int8": {
          return resolve(await S7Int8VariableValidator.create(req));
        }
        case "s7UInt8": {
          return resolve(await S7UInt8VariableValidator.create(req));
        }
        case "s7Int16": {
          return resolve(await S7Int16VariableValidator.create(req));
        }
        case "s7UInt16": {
          return resolve(await S7UInt16VariableValidator.create(req));
        }
        case "s7Int32": {
          return resolve(await S7Int32VariableValidator.create(req));
        }
        case "s7UInt32": {
          return resolve(await S7UInt32VariableValidator.create(req));
        }
        case "s7Float": {
          return resolve(await S7FloatVariableValidator.create(req));
        }
        case "s7ByteArray": {
          return resolve(await S7ByteArrayVariableValidator.create(req));
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
        case "mbDouble": {
          return resolve(await MBDoubleVariableValidator.edit(req));
        }
        case "mbSwappedDouble": {
          return resolve(await MBSwappedDoubleVariableValidator.edit(req));
        }
        default: {
          return resolve("Given variable type is not recognized");
        }
      }
    } else if (deviceType === "mbGateway") {
      switch (variableType) {
        case "mbBoolean": {
          return resolve(await MBGatewayBooleanVariableValidator.edit(req));
        }
        case "mbByteArray": {
          return resolve(await MBGatewayByteArrayVariableValidator.edit(req));
        }
        case "mbFloat": {
          return resolve(await MBGatewayFloatVariableValidator.edit(req));
        }
        case "mbSwappedFloat": {
          return resolve(
            await MBGatewaySwappedFloatVariableValidator.edit(req)
          );
        }
        case "mbInt16": {
          return resolve(await MBGatewayInt16VariableValidator.edit(req));
        }
        case "mbUInt16": {
          return resolve(await MBGatewayUInt16VariableValidator.edit(req));
        }
        case "mbInt32": {
          return resolve(await MBGatewayInt32VariableValidator.edit(req));
        }
        case "mbUInt32": {
          return resolve(await MBGatewayUInt32VariableValidator.edit(req));
        }
        case "mbSwappedInt32": {
          return resolve(
            await MBGatewaySwappedInt32VariableValidator.edit(req)
          );
        }
        case "mbSwappedUInt32": {
          return resolve(
            await MBGatewaySwappedUInt32VariableValidator.edit(req)
          );
        }
        case "mbDouble": {
          return resolve(await MBGatewayDoubleVariableValidator.edit(req));
        }
        case "mbSwappedDouble": {
          return resolve(
            await MBGatewaySwappedDoubleVariableValidator.edit(req)
          );
        }
        default: {
          return resolve("Given variable type is not recognized");
        }
      }
    } else if (deviceType === "specialDevice" || deviceType === "msAgent") {
      switch (variableType) {
        case "sdVariable": {
          return resolve(await SDVariableValidator.edit(req));
        }
        default: {
          return resolve("Given variable type is not recognized");
        }
      }
    } else if (deviceType === "s7Device") {
      switch (variableType) {
        case "s7Int8": {
          return resolve(await S7Int8VariableValidator.edit(req));
        }
        case "s7UInt8": {
          return resolve(await S7UInt8VariableValidator.edit(req));
        }
        case "s7Int16": {
          return resolve(await S7Int16VariableValidator.edit(req));
        }
        case "s7UInt16": {
          return resolve(await S7UInt16VariableValidator.edit(req));
        }
        case "s7Int32": {
          return resolve(await S7Int32VariableValidator.edit(req));
        }
        case "s7UInt32": {
          return resolve(await S7UInt32VariableValidator.edit(req));
        }
        case "s7Float": {
          return resolve(await S7FloatVariableValidator.edit(req));
        }
        case "s7ByteArray": {
          return resolve(await S7ByteArrayVariableValidator.edit(req));
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
