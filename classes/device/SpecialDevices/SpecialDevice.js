const Device = require("../Device");
const Sampler = require("../../sampler/Sampler");
const logger = require("../../../logger/logger");
const Project = require("../../project/Project");
const { exists } = require("../../../utilities/utilities");

class SpecialDevice extends Device {
  /**
   * @description Adder device
   */
  constructor() {
    super();
  }

  /**
   * @description Method for initializing device
   * @param {object} payload Device payload
   */
  async init(payload) {
    await super.init(payload);
    //Initializing variables if they are given in payload
    if (payload.elements) await this._initElements(payload.elements);

    //Has to be invoked here instead of based class - due to the fact that, variables should be initialized first
    if (payload.calculationElements)
      await this._initCalculationElements(payload.calculationElements);

    //If type is given in payload - set it according to payload - mechanism implemented to support child classes - otherwise set default mbDevice type
    this._type = "specialDevice";
  }

  /**
   * @description Method for initializing variables and calculation elements associated with special device
   */
  async _initElements(elements) {
    this._deviceElements = {};

    for (let element of elements) {
      await this.addDeviceElement(element.deviceId, element.elementId);
    }
  }

  /**
   * @description creating variable and adding it to the Device
   * @param {object} payload Payload of variable to be created
   */
  async createVariable(payload) {
    throw new Error("Cannot create variable for special device!");
  }

  /**
   * @description Adding variable to device
   */
  async addVariable(variable) {
    throw new Error("Cannot add variable to special device!");
  }

  /**
   * @description Removing variable from device
   * @param {string} id device id
   */
  async removeVariable(id) {
    throw new Error("Cannot remove variable from special device!");
  }

  /**
   * @description Elements associated with device
   */
  get DeviceElements() {
    return this._deviceElements;
  }

  /**
   * @description Adding variable or calculation element to device
   */
  async addDeviceElement(deviceId, elementId) {
    if (
      Project.CurrentProject.CommInterface.doesElementExist(deviceId, elementId)
    )
      throw new Error(
        `There is no element of id ${elementId} in specialDevice ${deviceId}`
      );

    let element = Project.CurrentProject.CommInterface.getElement(
      deviceId,
      variable
    );

    //Creating empty object if it does not exist
    if (!exists(this._deviceElements[deviceId]))
      this._deviceElements[deviceId] = {};

    //Adding element to elements collection
    this._deviceElements[deviceId][elementId] = element;
  }

  /**
   * @description Removing variable or calculation element from device
   */
  async removeDeviceElement(deviceId, elementId) {
    //Creating empty object if it does not exist
    if (!exists(this._deviceElements[deviceId]))
      throw new Error(
        `There is no device of id ${deviceId} in specialDevice ${this.Id}`
      );

    //Creating empty object if it does not exist
    if (!exists(this._deviceElements[deviceId][elementId]))
      throw new Error(
        `There is no element of id ${deviceId} in specialDevice ${this.Id}`
      );

    delete this._deviceElements[deviceId][elementId];
  }

  /**
   * @description Method for removing all elements
   */
  async removeAllDeviceElements() {
    this._deviceElements = {};
  }

  /**
   * @description Refreshing value - should be ovverride in child classes
   */
  async _refresh(tickNumber) {
    throw new Error("Function not implemented");
  }

  /**
   * @description Method for generating payload
   */
  _generatePayload() {
    let parentPayload = super._generatePayload();

    parentPayload.elements = this._generateDeviceElementsPayload();

    parentPayload.type = this.Type;

    return parentPayload;
  }

  /**
   * @description Method for generating payload associated with added variables
   */
  _generateDeviceElementsPayload() {
    let elementsPayload = [];
    let allDeviceIds = Object.keys(this.DeviceElements);

    for (let deviceId of allDeviceIds) {
      for (let elementId of Object.keys(this.DeviceElements[deviceId])) {
        let elementPayload = {
          elementId,
          deviceId
        };
        elementsPayload.push(elementPayload);
      }
    }

    return elementsPayload;
  }

  /**
   * @description Method for editing Device
   */
  async editWithPayload(payload) {
    await super.editWithPayload(payload);

    //Editing elements
    if (exists(payload.elements)) {
      for (let elementObject of payload.elements) {
        await this.addDeviceElement(
          elementObject.deviceId,
          elementObject.elementId
        );
      }
    }
  }

  /**
   * @description Method for editing elements according to payload - !All elements that are not presented in series will be cleared
   */
  async editDeviceElements(elements) {
    //Searching for elements that should be removed
    let elementsToRemove = [];

    let allDeviceIds = Object.keys(this.DeviceElements);
    for (let deviceId of allDeviceIds) {
      for (let elementId of Object.keys(this.DeviceElements[deviceId])) {
        let elementExists = elements.find(
          element =>
            element.deviceId === deviceI && delement.elementId === elementId
        );

        if (!elementExists) elementsToRemove.push({ deviceId, elementId });
      }
    }

    //Searching for elements that should be added
    let elementsToAdd = [];
    for (let element of elements) {
      let elementExists =
        exists(this.DeviceElements[element.elementId]) &&
        exists(this.DeviceElements[deviceId][element.deviceId]);

      if (!elementExists) elementsToAdd.push(element);
    }

    //Removing unnecessary elements
    for (let element of elementsToRemove) {
      await this.removeDeviceElement(element.deviceId, element.elementId);
    }

    //Adding new elements
    for (let element of elementsToAdd) {
      await this.addDeviceElement(element.deviceId, element.elementId);
    }
  }

  /**
   * @description Method for getting sampler group for given variable - based on theses groups sampler controls paralel data exchange
   * For SpecialDevice - it is their uniq Id
   */
  getRefreshGroupId() {
    return this.Id;
  }
}

module.exports = SpecialDevice;
