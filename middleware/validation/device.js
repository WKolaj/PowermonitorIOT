const Project = require("../../classes/project/Project");
const validationMiddleware = require("../validation");
const mbDeviceValidator = require("./devices/mbDevice");
const PAC3200TCPValidator = require("./devices/PAC3200TCP");

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
      case "PAC3200TCP": {
        return resolve(await PAC3200TCPValidator.create(req));
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
      case "PAC3200TCP": {
        return resolve(await PAC3200TCPValidator.edit(req));
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
