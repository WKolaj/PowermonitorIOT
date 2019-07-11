const Device = require("../Device");
const Sampler = require("../../sampler/Sampler");
const SDVariable = require("../../variable/SpecialDevice/SDVariable");
const logger = require("../../../logger/logger");
const { exists } = require("../../../utilities/utilities");

class SpecialDevice extends Device {
  /**
   * @description Special device
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
    if (payload.variables) await this._initVariables(payload.variables);

    //Has to be invoked here instead of based class - due to the fact that, variables should be initialized first
    if (payload.calculationElements)
      await this._initCalculationElements(payload.calculationElements);

    this._type = payload.type;
  }

  /**
   * @description Method for initializing variables
   */
  async _initVariables(variables) {
    for (let variable of variables) {
      await this.createVariable(variable);
    }
  }

  /**
   * @description Is device connected?
   */
  get Connected() {
    return true;
  }

  /**
   * @description Is device active? this means, if driver is enabled to exchange data
   */
  get IsActive() {
    return true;
  }

  /**
   * @description creating variable and adding it to the Device
   * @param {object} payload Payload of variable to be created
   */
  async createVariable(payload) {
    if (!payload) throw new Error("Given payload cannot be empty");
    if (!payload.type)
      throw new Error("Given variable payload has no type defined");

    if (payload.id && this.Variables[payload.id])
      throw new Error(`Variable with id ${payload.id} already exists!`);

    switch (payload.type) {
      case "sdVariable": {
        return this._createSDVariable(payload);
      }
      default: {
        throw new Error(
          `Given variable type is not recognized: ${payload.type}`
        );
      }
    }
  }

  /**
   * @description Method for editting variable
   * @param {string} id Id of variable to be edited
   * @param {*} payload Payload of eddition
   */
  async editVariable(id, payload) {
    if (!this.Variables[id])
      throw new Error(`Variable of given id: ${id} does not exist in device`);

    let variableToEdit = this.Variables[id];

    let variableArchivedBefore = variableToEdit.Archived;

    await variableToEdit.editWithPayload(payload);

    let variableArchivedAfter = variableToEdit.Archived;

    //If variable was not archived before but now is archived - should be added to archive manager
    if (!variableArchivedBefore && variableArchivedAfter) {
      await this.ArchiveManager.addVariable(variableToEdit);
    }
    //If variable was archived before but not is not archived - should be removed from archive manager
    else if (variableArchivedBefore && !variableArchivedAfter) {
      await this.ArchiveManager.removeVariable(variableToEdit.Id);
    }

    return variableToEdit;
  }

  /**
   * @description Method for creating SD variable
   * @param {*} payload Payload for creation
   */
  async _createSDVariable(payload) {
    if (!exists(payload.name))
      throw new Error("variable name in payload is not defined");
    if (!exists(payload.elementDeviceId))
      throw new Error("variable elementDeviceId in payload is not defined");
    if (!exists(payload.elementId))
      throw new Error("variable elementId in payload is not defined");

    let variableToAdd = new SDVariable(this);
    await variableToAdd.init(payload);
    await this.addVariable(variableToAdd);
    return variableToAdd;
  }

  /**
   * @description Adding variable to device
   */
  async addVariable(variable) {
    await super.addVariable(variable);
  }

  /**
   * @description Removing variable from device
   * @param {string} id device id
   */
  async removeVariable(id) {
    let deletedVariable = super.removeVariable(id);

    return deletedVariable;
  }

  /**
   * @description Refreshing variables based on tickNumber
   */
  async _refresh(tickNumber) {
    if (!this.IsActive) return null;
    let payloadOfNewValues = {};
    await this._refreshVariables(tickNumber, payloadOfNewValues);
    return payloadOfNewValues;
  }

  /**
   * @description Refreshing variables based on tickNumber
   */
  async refresh(tickNumber) {
    //Method has to be override - due to calling _refreshSpecialDevice after refreshing and archiving all other data
    await super.refresh(tickNumber);
    try {
      await this._refreshSpecialDevice(tickNumber);
    } catch (err) {
      logger.error(err.message, err);
    }
  }

  /**
   * @description Refreshing special device - method should be overwritten in child classes
   * @param {number} tickNumber Tick number
   */
  async _refreshSpecialDevice(tickNumber) {}

  /**
   * @description Method for refreshing all variables elements associated with device - if the correspond to tick number
   * @param {*} tickNumber Tick number
   * @param {*} payloadToAppend Payload to append by results of refresh
   */
  async _refreshVariables(tickNumber, payloadToAppend) {
    if (!payloadToAppend) payloadToAppend = {};

    //if device is not connected or not active - return null
    if (!this.IsActive || !this.Connected) return payloadToAppend;

    let allVariables = Object.values(this.Variables);
    for (let variable of allVariables) {
      try {
        if (Sampler.doesTickIdMatchesTick(tickNumber, variable.TickId)) {
          let result = await variable.refresh(tickNumber);

          //appending result only if refreshing object is not empty
          if (result !== null && result !== undefined)
            payloadToAppend[variable.Id] = variable;
        }
      } catch (err) {
        logger.error(err.message, err);
      }
    }

    return payloadToAppend;
  }

  /**
   * @description Method for generating payload
   */
  _generatePayload() {
    let parentPayload = super._generatePayload();

    parentPayload.variables = this._generateVariablesPayload();

    parentPayload.type = this.Type;

    return parentPayload;
  }

  /**
   * @description Method for generating payload associated with added variables
   */
  _generateVariablesPayload() {
    let varaiblesPayload = [];
    let allVariables = Object.values(this.Variables);

    for (let variable of allVariables) {
      varaiblesPayload.push(variable.Payload);
    }

    return varaiblesPayload;
  }

  /**
   * @description Method for editing Device
   */
  async editWithPayload(payload) {
    return super.editWithPayload(payload);
  }

  /**
   * @description Method for getting sampler group for given variable - based on theses groups sampler controls paralel data exchange
   */
  getRefreshGroupId() {
    return this.Id;
  }
  /**
   * @description Method for determining if device is special - special devices has to be refreshed after normal devices
   */
  isSpecial() {
    return true;
  }
}

module.exports = SpecialDevice;
