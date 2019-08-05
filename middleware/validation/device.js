const Project = require("../../classes/project/Project");
const validationMiddleware = require("../validation");
const mbDeviceValidator = require("./devices/mbDevice");
const S7DeviceValidator = require("./devices/S7Device");
const PAC3200TCPValidator = require("./devices/PAC3200TCP");
const PAC2200TCPValidator = require("./devices/PAC2200TCP");
const PAC4200TCPValidator = require("./devices/PAC4200TCP");
const mbGatewayValidator = require("./devices/mbGateway");
const SpecialDeviceValidator = require("./devices/specialDevice");
const MindConnectDeviceValidator = require("./devices/MindConnectDevice");

/**
 * @description Method for validate if element is valid while creating - return error message if object is not valid or undefined instead
 */
let validateCreate = function(req) {
  return new Promise(async (resolve, reject) => {
    if (!req.body.type)
      return resolve("type has to be defined in device payload");

    switch (req.body.type) {
      case "mbDevice": {
        return resolve(await mbDeviceValidator.create(req));
      }
      case "mbGateway": {
        return resolve(await mbGatewayValidator.create(req));
      }
      case "PAC2200TCP": {
        return resolve(await PAC2200TCPValidator.create(req));
      }
      case "PAC3200TCP": {
        return resolve(await PAC3200TCPValidator.create(req));
      }
      case "PAC4200TCP": {
        return resolve(await PAC4200TCPValidator.create(req));
      }
      case "s7Device": {
        return resolve(await S7DeviceValidator.create(req));
      }
      case "specialDevice": {
        return resolve(await SpecialDeviceValidator.create(req));
      }
      case "msAgent": {
        return resolve(await MindConnectDeviceValidator.create(req));
      }
      default: {
        return resolve("Given type is not recognized");
      }
    }
  });
};

/**
 * @description Method for validate if element is valid while editing - return error message if object is not valid or undefined instead
 */

let validateEdit = function(req) {
  return new Promise(async (resolve, reject) => {
    //Getting device from project - in order to retrieve its type
    if (!req.params.id) return resolve("deviceId is not defined");
    //Resolving with no error in order to return 404 later
    if (!(await Project.CurrentProject.doesDeviceExist(req.params.id)))
      return resolve();
    let device = await Project.CurrentProject.getDevice(req.params.id);

    //Resolving value from given type
    switch (device.Type) {
      case "mbDevice": {
        return resolve(await mbDeviceValidator.edit(req));
      }
      case "mbGateway": {
        return resolve(await mbGatewayValidator.edit(req));
      }
      case "s7Device": {
        return resolve(await S7DeviceValidator.edit(req));
      }
      case "PAC2200TCP": {
        return resolve(await PAC2200TCPValidator.edit(req));
      }
      case "PAC3200TCP": {
        return resolve(await PAC3200TCPValidator.edit(req));
      }
      case "PAC4200TCP": {
        return resolve(await PAC4200TCPValidator.edit(req));
      }
      case "specialDevice": {
        return resolve(await SpecialDeviceValidator.edit(req));
      }
      case "msAgent": {
        return resolve(await MindConnectDeviceValidator.edit(req));
      }
      default: {
        return resolve("Given type is not recognized");
      }
    }
  });
};

//Validator for creation
module.exports.create = validationMiddleware(validateCreate);

//Validator for edition
module.exports.edit = validationMiddleware(validateEdit);
