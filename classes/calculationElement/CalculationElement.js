const EventEmitter = require("events");
const mongoose = require("mongoose");

class CalculationElement {
  /**
   * Class representing calculation element for calculating sum of variables
   * @param {object} device device associated with element
   */
  constructor(device) {
    this._device = device;
    this._events = new EventEmitter();
    this._unit = "";
  }

  /**
   * Method for initializing element according to payload
   * @param {object} payload Initial payload of calculation element
   */
  async init(payload) {
    if (!payload.name)
      throw new Error("Name of calulcation element should be defined");

    if (!payload.sampleTime)
      throw new Error("Sample time of calulcation element should be defined");

    if (!payload.id) payload.id = CalculationElement.generateRandId();

    this._id = payload.id;
    this._name = payload.name;
    this._sampleTime = payload.sampleTime;

    payload.archived ? (this._archived = true) : (this._archived = false);

    if (payload.unit) this._unit = payload.unit;
  }

  /**
   * @description Sample time of calculation element
   */
  get SampleTime() {
    return this._sampleTime;
  }

  /**
   * @description Value type name of calculation element
   */
  get ValueType() {
    return this._getValueType();
  }

  /**
   * @description Type name of calculation element
   */
  get TypeName() {
    return this._getTypeName();
  }

  /**
   * @description Unit of calculation element
   */
  get Unit() {
    return this._unit;
  }

  /**
   * @description uniq id calculation element
   */
  get Id() {
    return this._id;
  }

  /**
   *  @description Is calculation element archived
   */
  get Archived() {
    return this._archived;
  }

  /**
   *  @description Device associated with calculation element
   */
  get Device() {
    return this._device;
  }

  /**
   *  @description Value of calculationElement
   */
  get Value() {
    return this._getValue();
  }

  /**
   *  @description Value of calculationElement
   */
  set Value(newValue) {
    this._setValue(newValue);
    this._emitValueChange(newValue);
  }

  /**
   *  @description Name of calculationElement
   */
  get Name() {
    return this._name;
  }

  /**
   * @description Payload that represents calculation element
   */
  get Payload() {
    return this._generatePayload();
  }

  /**
   * @description Tick number of last operation
   */
  get LastTickNumber() {
    return this._lastTickNumber;
  }

  /**
   * @description Event emitter of calculation element
   */
  get Events() {
    return this._events;
  }

  /**
   * @description Generating random id
   */
  static generateRandId() {
    return mongoose.Types.ObjectId();
  }

  /**
   * @description Method for refreshing whole calcuation element
   * @param {number} tickNumber Tick number of current refresh action
   */
  async refresh(tickNumber) {
    let refreshResult = {};
    if (this.LastTickNumber) {
      refreshResult = await this._onRefresh(this.LastTickNumber, tickNumber);
    } else {
      refreshResult = await this._onFirstRefresh(tickNumber);
    }

    this._lastTickNumber = tickNumber;

    this.Events.emit("Refreshed", [this, tickNumber, refreshResult]);

    return refreshResult;
  }

  /**
   * Method invoked on first refreshing
   * @param {number} tickNumber tickNumber of refeshing action
   */
  async _onFirstRefresh(tickNumber) {
    throw new Error("Method not implemented");
  }

  /**
   * Method invoked on every refreshing action despite first
   * @param {number} lastTickNumber tick number of last refreshing action
   * @param {number} tickNumber tick number of actual refreshing action
   */
  async _onRefresh(lastTickNumber, tickNumber) {
    throw new Error("Method not implemented");
  }

  /**
   * @description Method for getting value of calculation element
   */
  _getValue() {
    throw new Error("Method not implemented");
  }

  /**
   * @description Method for setting value of calculation element
   * @param {number} newValue new value of calculation element
   */
  _setValue(newValue) {
    throw new Error("Method not implemented");
  }

  /**
   * @description Method for generating type name that represents calculation element
   */
  _getTypeName() {
    throw new Error("Method not implemented");
  }

  /**
   * @description Method for generating type name that represents calculation element value
   */
  _getValueType() {
    throw new Error("Method not implemented");
  }

  /**
   * @description Method for generation payload that represents calculationElement
   */
  _generatePayload() {
    let payloadToReturn = {};

    payloadToReturn.id = this.Id;
    payloadToReturn.name = this.Name;
    payloadToReturn.type = this.TypeName;
    payloadToReturn.archived = this.Archived;
    payloadToReturn.unit = this.Unit;
    payloadToReturn.sampleTime = this.SampleTime;

    return payloadToReturn;
  }

  /**
   * @description Private method to emit ValueChange event
   * @param {object} newValue new value
   */
  _emitValueChange(newValue) {
    this.Events.emit("ValueChanged", [this, newValue]);
  }
}

module.exports = CalculationElement;
