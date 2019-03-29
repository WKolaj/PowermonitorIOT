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

    delete this.Variables[id];
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
    return {};
  }

  /**
   * @description Generating random id
   */
  static generateRandId() {
    return mongoose.Types.ObjectId();
  }
}

module.exports = Device;
