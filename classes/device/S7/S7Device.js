const Device = require("../Device");
const Sampler = require("../../sampler/Sampler");
const S7Driver = require("../../driver/S7/S7Driver");
const S7RequestGrouper = require("../../driver/S7/S7RequestGrouper");
const S7Int16Variable = require("../../variable/S7/S7Int16Variable");
const S7UInt16Variable = require("../../variable/S7/S7UInt16Variable");
const S7UInt8Variable = require("../../variable/S7/S7UInt8Variable");
const S7Int8Variable = require("../../variable/S7/S7Int8Variable");
const S7UInt32Variable = require("../../variable/S7/S7UInt32Variable");
const S7Int32Variable = require("../../variable/S7/S7Int32Variable");
const S7FloatVariable = require("../../variable/S7/S7FloatVariable");
const S7DTLVariable = require("../../variable/S7/S7DTLVariable");
const S7ByteArrayVariable = require("../../variable/S7/S7ByteArrayVariable");
const logger = require("../../../logger/logger");
const { exists } = require("../../../utilities/utilities");

class S7Device extends Device {
  /**
   * @description S7 device
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

    if (!exists(payload.ipAdress)) throw new Error("ipAdress cannot be empty");
    if (!exists(payload.rack)) payload.rack = 0;
    if (!exists(payload.timeout)) throw new Error("timeout cannot be empty");
    if (!exists(payload.slot)) payload.slot = 1;

    //Binding methods to device object
    this.disconnect = this.disconnect.bind(this);
    this.connect = this.connect.bind(this);

    //Setting modbus driver
    this._driver = new S7Driver(
      this,
      payload.ipAdress,
      payload.rack,
      payload.timeout,
      payload.slot
    );
    this._s7RequestGrouper = new S7RequestGrouper(this);
    this._requests = {};

    //Initializing variables if they are given in payload
    if (payload.variables) await this._initVariables(payload.variables);

    //Has to be invoked here instead of based class - due to the fact that, variables should be initialized first
    if (payload.calculationElements)
      await this._initCalculationElements(payload.calculationElements);

    //If type is given in payload - set it according to payload - mechanism implemented to support child classes - otherwise set default mbDevice type
    this._type = payload.type ? payload.type : "s7Device";

    //Connecting if device should be active according to payload
    if (payload.isActive) this.connect();
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
   * @description All requests divided by tickId
   */
  get Requests() {
    return this._requests;
  }

  /**
   * @description S7RequestGrouper associated with driver
   */
  get RequestGrouper() {
    return this._s7RequestGrouper;
  }

  /**
   * @description S7 driver
   */
  get S7Driver() {
    return this._driver;
  }

  /**
   * @description IPAdress used by driver
   */
  get IPAdress() {
    return this._driver.IPAdress;
  }

  /**
   * @description Rack used by driver
   */
  get Rack() {
    return this._driver.Rack;
  }

  /**
   * @description Timeout of driver
   */
  get Timeout() {
    return this._driver.Timeout;
  }

  /**
   * @description Slot number used by driver
   */
  get Slot() {
    return this._driver.Slot;
  }

  /**
   * @description Is device connected?
   */
  get Connected() {
    return this._driver.Connected;
  }

  /**
   * @description Is device active? this means, if driver is enabled to exchange data
   */
  get IsActive() {
    return this._driver.IsActive;
  }

  /**
   * @description Connecting to modbus device
   * */
  connect() {
    return this._driver.connect();
  }

  /**
   * @description Connecting to modbus device
   * */
  disconnect() {
    return this._driver.disconnect();
  }

  /**
   * @description Rebuilding all request groups
   * */
  _refreshRequestGroups() {
    this._requests = {};
    let allVariables = Device.divideVariablesByTickId(
      Object.values(this.Variables)
    );
    let allTickIds = Object.keys(allVariables);

    for (let tickId of allTickIds) {
      let variablesOfTickId = allVariables[tickId];
      this._requests[tickId] = this.RequestGrouper.ConvertVariablesToRequests(
        variablesOfTickId
      );
    }
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
      case "s7ByteArray": {
        return this._createByteArrayVariable(payload);
      }
      case "s7Int16": {
        return this._createInt16Variable(payload);
      }
      case "s7UInt16": {
        return this._createUInt16Variable(payload);
      }
      case "s7Int32": {
        return this._createInt32Variable(payload);
      }
      case "s7UInt32": {
        return this._createUInt32Variable(payload);
      }
      case "s7UInt8": {
        return this._createUInt8Variable(payload);
      }
      case "s7Int8": {
        return this._createInt8Variable(payload);
      }
      case "s7Float": {
        return this._createFloatVariable(payload);
      }
      case "s7DTL": {
        return this._createDTLVariable(payload);
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

    this._refreshRequestGroups();

    return variableToEdit;
  }

  /**
   * @description Method for creating Int16 variable
   * @param {*} payload Payload of edition
   */
  async _createInt16Variable(payload) {
    if (!exists(payload.sampleTime))
      throw new Error("time sample in payload is not defined");
    if (!exists(payload.name))
      throw new Error("variable name in payload is not defined");
    if (!exists(payload.offset))
      throw new Error("variable offset in payload is not defined");
    if (!exists(payload.areaType))
      throw new Error("variable areaType in payload is not defined");

    let variableToAdd = new S7Int16Variable(this);
    await variableToAdd.init(payload);
    await this.addVariable(variableToAdd);
    return variableToAdd;
  }

  /**
   * @description Method for creating UInt16 variable
   * @param {*} payload Payload of edition
   */
  async _createUInt16Variable(payload) {
    if (!exists(payload.sampleTime))
      throw new Error("time sample in payload is not defined");
    if (!exists(payload.name))
      throw new Error("variable name in payload is not defined");
    if (!exists(payload.offset))
      throw new Error("variable offset in payload is not defined");
    if (!exists(payload.areaType))
      throw new Error("variable areaType in payload is not defined");

    let variableToAdd = new S7UInt16Variable(this);
    await variableToAdd.init(payload);
    await this.addVariable(variableToAdd);
    return variableToAdd;
  }

  /**
   * @description Method for creating byteArray variable
   * @param {*} payload Payload of edition
   */
  async _createByteArrayVariable(payload) {
    if (!exists(payload.sampleTime))
      throw new Error("time sample in payload is not defined");
    if (!exists(payload.name))
      throw new Error("variable name in payload is not defined");
    if (!exists(payload.offset))
      throw new Error("variable offset in payload is not defined");
    if (!exists(payload.areaType))
      throw new Error("variable areaType in payload is not defined");
    if (!exists(payload.length))
      throw new Error("variable length in payload is not defined");

    let variableToAdd = new S7ByteArrayVariable(this);
    await variableToAdd.init(payload);
    await this.addVariable(variableToAdd);
    return variableToAdd;
  }

  /**
   * @description Method for creating UInt8 variable
   * @param {*} payload Payload of edition
   */
  async _createUInt8Variable(payload) {
    if (!exists(payload.sampleTime))
      throw new Error("time sample in payload is not defined");
    if (!exists(payload.name))
      throw new Error("variable name in payload is not defined");
    if (!exists(payload.offset))
      throw new Error("variable offset in payload is not defined");
    if (!exists(payload.areaType))
      throw new Error("variable areaType in payload is not defined");

    let variableToAdd = new S7UInt8Variable(this);
    await variableToAdd.init(payload);
    await this.addVariable(variableToAdd);
    return variableToAdd;
  }

  /**
   * @description Method for creating Int8 variable
   * @param {*} payload Payload of edition
   */
  async _createInt8Variable(payload) {
    if (!exists(payload.sampleTime))
      throw new Error("time sample in payload is not defined");
    if (!exists(payload.name))
      throw new Error("variable name in payload is not defined");
    if (!exists(payload.offset))
      throw new Error("variable offset in payload is not defined");
    if (!exists(payload.areaType))
      throw new Error("variable areaType in payload is not defined");

    let variableToAdd = new S7Int8Variable(this);
    await variableToAdd.init(payload);
    await this.addVariable(variableToAdd);
    return variableToAdd;
  }

  /**
   * @description Method for creating Int32 variable
   * @param {*} payload Payload of edition
   */
  async _createInt32Variable(payload) {
    if (!exists(payload.sampleTime))
      throw new Error("time sample in payload is not defined");
    if (!exists(payload.name))
      throw new Error("variable name in payload is not defined");
    if (!exists(payload.offset))
      throw new Error("variable offset in payload is not defined");
    if (!exists(payload.areaType))
      throw new Error("variable areaType in payload is not defined");

    let variableToAdd = new S7Int32Variable(this);
    await variableToAdd.init(payload);
    await this.addVariable(variableToAdd);
    return variableToAdd;
  }

  /**
   * @description Method for creating UInt32 variable
   * @param {*} payload Payload of edition
   */
  async _createUInt32Variable(payload) {
    if (!exists(payload.sampleTime))
      throw new Error("time sample in payload is not defined");
    if (!exists(payload.name))
      throw new Error("variable name in payload is not defined");
    if (!exists(payload.offset))
      throw new Error("variable offset in payload is not defined");
    if (!exists(payload.areaType))
      throw new Error("variable areaType in payload is not defined");

    let variableToAdd = new S7UInt32Variable(this);
    await variableToAdd.init(payload);
    await this.addVariable(variableToAdd);
    return variableToAdd;
  }

  /**
   * @description Method for creating Float variable
   * @param {*} payload Payload of edition
   */
  async _createFloatVariable(payload) {
    if (!exists(payload.sampleTime))
      throw new Error("time sample in payload is not defined");
    if (!exists(payload.name))
      throw new Error("variable name in payload is not defined");
    if (!exists(payload.offset))
      throw new Error("variable offset in payload is not defined");
    if (!exists(payload.areaType))
      throw new Error("variable areaType in payload is not defined");

    let variableToAdd = new S7FloatVariable(this);
    await variableToAdd.init(payload);
    await this.addVariable(variableToAdd);
    return variableToAdd;
  }

  /**
   * @description Method for creating DTL variable
   * @param {*} payload Payload of edition
   */
  async _createDTLVariable(payload) {
    if (!exists(payload.sampleTime))
      throw new Error("time sample in payload is not defined");
    if (!exists(payload.name))
      throw new Error("variable name in payload is not defined");
    if (!exists(payload.offset))
      throw new Error("variable offset in payload is not defined");
    if (!exists(payload.areaType))
      throw new Error("variable areaType in payload is not defined");

    let variableToAdd = new S7DTLVariable(this);
    await variableToAdd.init(payload);
    await this.addVariable(variableToAdd);
    return variableToAdd;
  }

  /**
   * @description Adding variable to device
   */
  async addVariable(variable) {
    await super.addVariable(variable);
    this._refreshRequestGroups();
  }

  /**
   * @description Removing variable from device
   * @param {string} id device id
   */
  async removeVariable(id) {
    let deletedVariable = super.removeVariable(id);
    this._refreshRequestGroups();

    return deletedVariable;
  }

  /**
   * @description Refreshing variables based on tickNumber
   */
  async _refresh(tickNumber) {
    if (!this.IsActive) return null;

    let allTickIds = Object.keys(this.Requests);

    let requestsToInvoke = [];

    for (let tickId of allTickIds) {
      if (Sampler.doesTickIdMatchesTick(tickNumber, tickId)) {
        requestsToInvoke.push(...this.Requests[tickId]);
      }
    }

    try {
      await this.S7Driver.invokeRequests(requestsToInvoke);
      //Returing all refreshed variable Ids and values;
      return this.RequestGrouper.ConvertRequestsToIDValuePair(requestsToInvoke);
    } catch (err) {
      logger.warn(err, err.message);
      return null;
    }
  }

  /**
   * @description Method for generating payload
   */
  _generatePayload() {
    let parentPayload = super._generatePayload();

    parentPayload.isActive = this.IsActive;

    parentPayload.timeout = this.Timeout;
    parentPayload.ipAdress = this.IPAdress;
    parentPayload.timeout = this.Timeout;
    parentPayload.rack = this.Rack;
    parentPayload.slot = this.Slot;

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
    let wasActiveBefore = this.IsActive;

    await super.editWithPayload(payload);

    let changeAssociatedWithMBDriver =
      exists(payload.ipAdress) ||
      exists(payload.timeout) ||
      exists(payload.rack) ||
      exists(payload.slot);

    //Reconnecting only if device is Active and change is associated with modbus driver
    let shouldBeReconnected = this.IsActive && changeAssociatedWithMBDriver;

    //If there should be a reconnection or device is active but should not be - disconnect it
    //Has to be compared with === - if not - lack of isActive stops device
    if (shouldBeReconnected || (payload.isActive === false && this.IsActive)) {
      await this.disconnect();
    }

    //Setting driver parameters if they are empty
    if (!exists(payload.ipAdress)) payload.ipAdress = this.IPAdress;
    if (!exists(payload.timeout)) payload.timeout = this.Timeout;
    if (!exists(payload.rack)) payload.rack = this.Rack;
    if (!exists(payload.slot)) payload.slot = this.Slot;

    if (changeAssociatedWithMBDriver) {
      this._driver = new S7Driver(
        this,
        payload.ipAdress,
        payload.rack,
        payload.timeout,
        payload.slot
      );
      this._reassignVariablesDriver();
      this._refreshRequestGroups();
    }

    if (shouldBeReconnected || (!wasActiveBefore && payload.isActive)) {
      await this.connect();
    }

    return this;
  }

  /**
   * @description Method for reassigning driver of all variables - after changing driver object
   */
  _reassignVariablesDriver() {
    let variables = Object.values(this.Variables);
    for (let variable of variables) {
      variable.reassignDriver();
    }
  }

  /**
   * @description Method for getting sampler group for given variable - based on theses groups sampler controls paralel data exchange
   * For S7Device - it is ipAdress
   */
  getRefreshGroupId() {
    return `${this.IPAdress}`;
  }
}

module.exports = S7Device;
