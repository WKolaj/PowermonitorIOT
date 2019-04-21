const EventEmitter = require("events");
const mongoose = require("mongoose");

class CalculationElement {
  constructor(device) {
    this._device = device;
    this._events = new EventEmitter();
  }

  get ValueType() {
    return this._getValueType();
  }

  get TypeName() {
    return this._getTypeName();
  }

  get ValueType() {
    return this._getValueType();
  }

  /**
   * @description uniq id of variable
   */
  get Id() {
    return this._id;
  }

  get Archived() {
    return this._archived;
  }

  get Device() {
    return this._device;
  }

  get Value() {
    return this._getValue();
  }

  set Value(newValue) {
    this._setValue(newValue);
    this.Events.emit("ValueChanged");
  }

  get Name() {
    return this._name;
  }

  get Payload() {
    return this._generatePayload();
  }

  get LastTickNumber() {
    return this._lastTickNumber;
  }

  get Events() {
    return this._events;
  }

  /**
   * @description Generating random id
   */
  static generateRandId() {
    return mongoose.Types.ObjectId();
  }

  async init(payload) {
    if (!payload.name)
      throw new Error("Name of calulcation element should be defined");

    if (!payload.id) payload.id = CalculationElement.generateRandId();

    this._id = payload.id;
    this._name = payload.name;

    payload.archived ? (this._archived = true) : (this._archived = false);
  }

  async refresh(tickNumber) {
    let refreshResult = {};
    if (this.LastTickNumber) {
      refreshResult = await this._onRefresh(this.LastTickNumber, tickNumber);
    } else {
      refreshResult = await this._onFirstRefresh(this.tickNumber);
    }

    this._lastTickNumber = tickNumber;

    return refreshResult;
  }

  async _onFirstRefresh(tickNumber) {
    throw new Error("Method not implemented");
  }

  async _onRefresh(lastTickNumber, tickNumber) {
    throw new Error("Method not implemented");
  }

  _getValue() {
    throw new Error("Method not implemented");
  }

  _setValue(newValue) {
    throw new Error("Method not implemented");
  }

  _getTypeName() {
    throw new Error("Method not implemented");
  }

  _getValueType() {
    throw new Error("Method not implemented");
  }

  _generatePayload() {
    let payloadToReturn = {};

    payloadToReturn.id = this.Id;
    payloadToReturn.name = this.Name;
    payloadToReturn.type = this.TypeName;
    payloadToReturn.archived = this.Archived;
    return payloadToReturn;
  }
}

module.exports = CalculationElement;
