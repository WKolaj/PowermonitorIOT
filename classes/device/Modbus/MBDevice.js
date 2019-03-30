const Device = require("../Device");
const Sampler = require("../../sampler/Sampler");
const MBDriver = require("../../driver/Modbus/MBDriver");
const MBRequestGrouper = require("../../driver/Modbus/MBRequestGrouper");
const MBBooleanVariable = require("../../variable/Modbus/MBBooleanVariable");
const MBByteArrayVariable = require("../../variable/Modbus/MBByteArrayVariable");
const MBFloatVariable = require("../../variable/Modbus/MBFloatVariable");
const MBInt16Variable = require("../../variable/Modbus/MBInt16Variable");
const MBInt32Variable = require("../../variable/Modbus/MBInt32Variable");
const MBSwappedFloatVariable = require("../../variable/Modbus/MBSwappedFloatVariable");
const MBSwappedInt32Variable = require("../../variable/Modbus/MBSwappedInt32Variable");
const MBSwappedUInt32Variable = require("../../variable/Modbus/MBSwappedUInt32Variable");
const MBUInt16Variable = require("../../variable/Modbus/MBUInt16Variable");
const MBUInt32Variable = require("../../variable/Modbus/MBUInt32Variable");

class MBDevice extends Device {
  /**
   * @description Modbus device
   * @param {object} payload device payload
   */
  constructor(payload) {
    super(payload);

    if (!payload.ipAdress) throw new Error("ipAdress cannot be empty");
    if (!payload.portNumber) throw new Error("port number cannot be empty");
    if (!payload.timeout) throw new Error("timeout cannot be empty");
    if (!payload.unitId) throw new Error("unitId cannot be empty");

    //Binding methods to device object
    this.disconnect = this.disconnect.bind(this);
    this.connect = this.connect.bind(this);

    //Setting modbus driver
    this._driver = new MBDriver(
      this,
      payload.ipAdress,
      payload.portNumber,
      payload.timeout,
      payload.unitId
    );
    this._mbRequestGrouper = new MBRequestGrouper(this);
    this._requests = {};

    //Initializing variables if they are given in payload
    if (payload.variables) this._initVariables(payload.variables);
  }

  /**
   * @description Method for initializing variables
   */
  _initVariables(variables) {
    for (let variable of variables) {
      this.createVariable(variable);
    }
  }

  /**
   * @description All requests divided by tickId
   */
  get Requests() {
    return this._requests;
  }

  /**
   * @description MBRequestGrouper associated with driver
   */
  get RequestGrouper() {
    return this._mbRequestGrouper;
  }

  /**
   * @description MBDevice associated with driver
   */
  get MBDriver() {
    return this._driver;
  }

  /**
   * @description IPAdress used by driver
   */
  get IPAdress() {
    return this._driver.IPAdress;
  }

  /**
   * @description PortNumber used by driver
   */
  get PortNumber() {
    return this._driver.PortNumber;
  }

  /**
   * @description Timeout of driver
   */
  get Timeout() {
    return this._driver.Timeout;
  }

  /**
   * @description Default unit ID used by driver
   */
  get UnitId() {
    return this._driver.UnitId;
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

  /**@description Connecting to modbus device */
  connect() {
    return this._driver.connect();
  }

  /**@description Connecting to modbus device */
  disconnect() {
    return this._driver.disconnect();
  }

  /**@description Rebuilding all request groups */
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
  createVariable(payload) {
    if (!payload) throw new Error("Given payload cannot be empty");
    if (!payload.type)
      throw new Error("Given variable payload has no type defined");

    switch (payload.type) {
      case "boolean": {
        return this._createBooleanVariable(payload);
      }
      case "byteArray": {
        return this._createByteArrayVariable(payload);
      }
      case "float": {
        return this._createFloatVariable(payload);
      }
      case "swappedFloat": {
        return this._createSwappedFloatVariable(payload);
      }
      case "int16": {
        return this._createInt16Variable(payload);
      }
      case "uInt16": {
        return this._createUInt16Variable(payload);
      }
      case "int32": {
        return this._createInt32Variable(payload);
      }
      case "uInt32": {
        return this._createUInt32Variable(payload);
      }
      case "swappedInt32": {
        return this._createSwappedInt32Variable(payload);
      }
      case "swappedUInt32": {
        return this._createSwappedUInt32Variable(payload);
      }
      default: {
        throw new Error(
          `Given variable type is not recognized: ${payload.type}`
        );
      }
    }
  }

  editVariable(id, payload) {
    if (!this.Variables[id])
      throw new Error(`Variable of given id: ${id} does not exist in device`);

    let variableToEdit = this.Variables[id];

    this.removeVariable(id);

    let variableToAdd = variableToEdit.editWithPayload(payload);

    this.addVariable(variableToAdd);

    return variableToAdd;
  }

  _createBooleanVariable(payload) {
    if (!payload.timeSample)
      throw new Error("time sample in payload is not defined");
    if (!payload.name)
      throw new Error("variable name in payload is not defined");
    if (!payload.offset)
      throw new Error("variable offset in payload is not defined");
    if (!payload.fCode)
      throw new Error("variable fCode in payload is not defined");

    let variableToAdd = new MBBooleanVariable(this, payload);
    this.addVariable(variableToAdd);
    return variableToAdd;
  }

  _createByteArrayVariable(payload) {
    if (!payload.timeSample)
      throw new Error("time sample in payload is not defined");
    if (!payload.name)
      throw new Error("variable name in payload is not defined");
    if (!payload.offset)
      throw new Error("variable offset in payload is not defined");
    if (!payload.fCode)
      throw new Error("variable fCode in payload is not defined");
    if (!payload.length)
      throw new Error("variable length in payload is not defined");

    let variableToAdd = new MBByteArrayVariable(this, payload);
    this.addVariable(variableToAdd);
    return variableToAdd;
  }

  _createFloatVariable(payload) {
    if (!payload.timeSample)
      throw new Error("time sample in payload is not defined");
    if (!payload.name)
      throw new Error("variable name in payload is not defined");
    if (!payload.offset)
      throw new Error("variable offset in payload is not defined");
    if (!payload.fCode)
      throw new Error("variable fCode in payload is not defined");

    let variableToAdd = new MBFloatVariable(this, payload);
    this.addVariable(variableToAdd);
    return variableToAdd;
  }

  _createSwappedFloatVariable(payload) {
    if (!payload.timeSample)
      throw new Error("time sample in payload is not defined");
    if (!payload.name)
      throw new Error("variable name in payload is not defined");
    if (!payload.offset)
      throw new Error("variable offset in payload is not defined");
    if (!payload.fCode)
      throw new Error("variable fCode in payload is not defined");

    let variableToAdd = new MBSwappedFloatVariable(this, payload);
    this.addVariable(variableToAdd);
    return variableToAdd;
  }

  _createInt16Variable(payload) {
    if (!payload.timeSample)
      throw new Error("time sample in payload is not defined");
    if (!payload.name)
      throw new Error("variable name in payload is not defined");
    if (!payload.offset)
      throw new Error("variable offset in payload is not defined");
    if (!payload.fCode)
      throw new Error("variable fCode in payload is not defined");

    let variableToAdd = new MBInt16Variable(this, payload);
    this.addVariable(variableToAdd);
    return variableToAdd;
  }

  _createInt32Variable(payload) {
    if (!payload.timeSample)
      throw new Error("time sample in payload is not defined");
    if (!payload.name)
      throw new Error("variable name in payload is not defined");
    if (!payload.offset)
      throw new Error("variable offset in payload is not defined");
    if (!payload.fCode)
      throw new Error("variable fCode in payload is not defined");

    let variableToAdd = new MBInt32Variable(this, payload);
    this.addVariable(variableToAdd);
    return variableToAdd;
  }

  _createSwappedInt32Variable(payload) {
    if (!payload.timeSample)
      throw new Error("time sample in payload is not defined");
    if (!payload.name)
      throw new Error("variable name in payload is not defined");
    if (!payload.offset)
      throw new Error("variable offset in payload is not defined");
    if (!payload.fCode)
      throw new Error("variable fCode in payload is not defined");

    let variableToAdd = new MBSwappedInt32Variable(this, payload);
    this.addVariable(variableToAdd);
    return variableToAdd;
  }

  _createUInt16Variable(payload) {
    if (!payload.timeSample)
      throw new Error("time sample in payload is not defined");
    if (!payload.name)
      throw new Error("variable name in payload is not defined");
    if (!payload.offset)
      throw new Error("variable offset in payload is not defined");
    if (!payload.fCode)
      throw new Error("variable fCode in payload is not defined");

    let variableToAdd = new MBUInt16Variable(this, payload);
    this.addVariable(variableToAdd);
    return variableToAdd;
  }

  _createUInt32Variable(payload) {
    if (!payload.timeSample)
      throw new Error("time sample in payload is not defined");
    if (!payload.name)
      throw new Error("variable name in payload is not defined");
    if (!payload.offset)
      throw new Error("variable offset in payload is not defined");
    if (!payload.fCode)
      throw new Error("variable fCode in payload is not defined");

    let variableToAdd = new MBUInt32Variable(this, payload);
    this.addVariable(variableToAdd);
    return variableToAdd;
  }

  _createSwappedUInt32Variable(payload) {
    if (!payload.timeSample)
      throw new Error("time sample in payload is not defined");
    if (!payload.name)
      throw new Error("variable name in payload is not defined");
    if (!payload.offset)
      throw new Error("variable offset in payload is not defined");
    if (!payload.fCode)
      throw new Error("variable fCode in payload is not defined");

    let variableToAdd = new MBSwappedUInt32Variable(this, payload);
    this.addVariable(variableToAdd);
    return variableToAdd;
  }

  /**
   * @description Adding variable to device
   */
  addVariable(variable) {
    super.addVariable(variable);
    this._refreshRequestGroups();
  }

  /**
   * @description Removing variable from device
   * @param {string} id device id
   */
  removeVariable(id) {
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
      await this.MBDriver.invokeRequests(requestsToInvoke);
      //Returing all refreshed variable Ids and values;
      return this.RequestGrouper.ConvertRequestsToIDValuePair(requestsToInvoke);
    } catch (err) {
      console.log(err);
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
    parentPayload.unitId = this.UnitId;
    parentPayload.portNumber = this.PortNumber;

    parentPayload.variables = this._generateVariablesPayload();

    return parentPayload;
  }

  _generateVariablesPayload() {
    let varaiblesPayload = [];
    let allVariables = Object.values(this.Variables);

    for (let variable of allVariables) {
      varaiblesPayload.push(variable.Payload);
    }

    return varaiblesPayload;
  }
}

module.exports = MBDevice;
