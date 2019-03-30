const EventEmitter = require("events");
const mongoose = require("mongoose");

class Device {
  /**
   * @description Base class representing Device
   * @param {object} payload Device payload
   */
  constructor(payload) {
    if (!payload) throw new Error("Payload cannot be empty");
    if (!payload.name) throw new Error("Payload Name cannot be empty");

    this._name = payload.name;
    this._variables = {};

    //Events of device
    this._events = new EventEmitter();

    //Generating random id in case it was not provided
    if (!payload.id) payload.id = Device.generateRandId();
    this._id = payload.id;

    this._type = undefined;
  }

  /**
   * @description Type of device
   */
  get Type() {
    return this._type;
  }

  /**
   * @description Device payload
   */
  get Payload() {
    return this._generatePayload();
  }

  /**
   * @description uniq id of device
   */
  get Id() {
    return this._id;
  }

  /**
   * @description Event emitter
   */
  get Events() {
    return this._events;
  }

  /**
   * @description Name describing device
   */
  get Name() {
    return this._name;
  }

  /**
   * @description Variables associated with device
   */
  get Variables() {
    return this._variables;
  }

  /**
   * @description Adding variable to device
   */
  addVariable(variable) {
    this.Variables[variable.Id] = variable;
  }

  /**
   * @description Removing variable from device
   * @param {string} id device id
   */
  removeVariable(id) {
    if (!(id in this.Variables))
      throw Error(`There is no such variable in device - variable id:${id}`);

    let variableToDelete = this.Variables[id];
    delete this.Variables[id];

    return variableToDelete;
  }

  /**
   * @description creating variable and adding it to the Device - should be override in child classes
   * @param {object} payload Payload of variable to be created
   */
  createVariable(payload) {
    throw new Error("Not implemented");
  }

  /**
   * @description Method for editting variable - should be override in child classes
   * @param {string} id Id of variable to be edited
   * @param {object} payload Payload of eddition
   */
  editVariable(id, payload) {
    throw new Error("Not implemented");
  }

  static divideVariablesByTickId(variables) {
    let variablesToReturn = {};

    for (let variable of variables) {
      if (!(variable.TickId in variablesToReturn))
        variablesToReturn[variable.TickId] = [];

      variablesToReturn[variable.TickId].push(variable);
    }

    return variablesToReturn;
  }

  /**
   * @description Getting variable by device id
   * @param {string} id device id
   */
  getVariable(id) {
    return this.Variables[id];
  }

  /**
   * @description Refreshing variables based on tickNumber
   */
  async refresh(tickNumber) {
    let result = await this._refresh(tickNumber);
    if (result) {
      this.Events.emit("Refreshed", [this, result, tickNumber]);
    }
  }

  /**
   * @description Refreshing variables based on tickNumber - should be override in child classes
   */
  _refresh(tickNumber) {
    throw new Error("Not implemented");
  }

  /**
   * @description Generating random id
   */
  static generateRandId() {
    return mongoose.Types.ObjectId();
  }

  /**
   * @description Method for generating payload - overriding in child classes
   */
  _generatePayload() {
    return {
      id: this.Id,
      name: this.Name
    };
  }

  /**
   * @description Method for editing Device
   */
  async editWithPayload(payload) {
    //Setting new values if they are given in payload
    if (payload.name) this._name = payload.name;
  }
}

module.exports = Device;
