const Joi = require("joi");
const validationMiddleware = require("../validation.js");
const User = require("../../classes/user/User");
const { getCurrentProject } = require("../../utilities/utilities");

let allowedElementTypes = ["eventLogElement"];

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
      !allowedElementTypes.some(
        allowedElement => allowedElement === element.Type
      )
    )
      return resolve(`Element of type ${element.Type} does not have events!`);

    return resolve();
  });
};

module.exports.get = validationMiddleware(validateGet);

module.exports.allowedElementTypes = allowedElementTypes;
