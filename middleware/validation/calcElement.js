const Project = require("../../classes/project/Project");
const validationMiddleware = require("../validation");
const FactorElementValidator = require("./calcElements/FactorElement");
const AverageElementValidator = require("./calcElements/AverageElement");
const IncreaseElementValidator = require("./calcElements/IncreaseElement");
const SumElementValidator = require("./calcElements/SumElement");

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

    if (deviceType === "mbDevice" || deviceType === "PAC3200TCP") {
      switch (req.body.type) {
        case "factorElement": {
          return resolve(await FactorElementValidator.create(req));
        }
        case "averageElement": {
          return resolve(await AverageElementValidator.create(req));
        }
        case "increaseElement": {
          return resolve(await IncreaseElementValidator.create(req));
        }
        case "sumElement": {
          return resolve(await SumElementValidator.create(req));
        }
        default: {
          return resolve("Given calculation element type is not recognized");
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
    if (!req.params.calcElementId)
      return resolve("calcElementId has to be defined!");

    //If there is no device set - resolving undefined in order to return 404 later
    if (!(await Project.CurrentProject.doesDeviceExist(req.params.deviceId)))
      return resolve();

    let deviceType = (await Project.CurrentProject.getDevice(
      req.params.deviceId
    )).Type;

    //If there is no calc element - resolving undefined in order to return 404 later
    if (
      !(await Project.CurrentProject.doesCalculationElementExist(
        req.params.deviceId,
        req.params.calcElementId
      ))
    )
      return resolve();

    let calcElementType = (await Project.CurrentProject.getCalcElement(
      req.params.deviceId,
      req.params.calcElementId
    )).Type;

    if (deviceType === "mbDevice" || deviceType === "PAC3200TCP") {
      switch (calcElementType) {
        case "factorElement": {
          return resolve(await FactorElementValidator.edit(req));
        }
        case "averageElement": {
          return resolve(await AverageElementValidator.edit(req));
        }
        case "increaseElement": {
          return resolve(await IncreaseElementValidator.edit(req));
        }
        case "sumElement": {
          return resolve(await SumElementValidator.edit(req));
        }
        default: {
          return resolve("Given calculation element type is not recognized");
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
