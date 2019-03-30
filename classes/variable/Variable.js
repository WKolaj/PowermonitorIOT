const EventEmitter = require("events");
const Sampler = require("../sampler/Sampler");
const mongoose = require("mongoose");

class Variable {
  /**
   * @description Base class representing Variable
   * @param {object} device device associated with variable
   * @param {object} payload variable payload
   */
  constructor(device, payload) {
    if (!device) throw new Error("Variable device cannot be empty");
    if (!payload) throw new Error("Payload cannot be empty");
    if (!payload.name) throw new Error("Payload Name cannot be empty");

    this._device = device;
    this._name = payload.name;
    this._events = new EventEmitter();

    //If time sample not defined - defininf as 1
    if (!payload.timeSample) payload.timeSample = 1;
    this._tickId = Sampler.convertTimeSampleToTickId(payload.timeSample);

    //Generating random id in case it was not provided
    if (!payload.id) payload.id = Variable.generateRandId();
    this._id = payload.id;
  }

  /**
   * @description Generating random id
   */
  static generateRandId() {
    return mongoose.Types.ObjectId();
  }

  /**
   * @description uniq id of variable
   */
  get Id() {
    return this._id;
  }

  /**
   * @description TickId of variable
   */
  get TickId() {
    return this._tickId;
  }

  /**
   * @description Sample time of variable
   */
  set TimeSample(value) {
    this._tickId = Sampler.convertTimeSampleToTickId(value);
  }

  /**
   * @description Sample time of variable
   */
  get TimeSample() {
    return Sampler.convertTickIdToTimeSample(this._tickId);
  }

  /**
   * @description Events associated with variable
   */
  get Events() {
    return this._events;
  }

  /**
   * @description Device associated with variable
   */
  get Device() {
    return this._device;
  }

  /**
   * @description Variable name
   */
  get Name() {
    return this._name;
  }

  /**
   * @description Variable value
   */
  get Value() {
    //_getValue - should be override in child classes
    return this._getValue();
  }

  /**
   * @description Variable value
   */
  set Value(newValue) {
    //_setValue - should be override in child classes
    this._setValue(newValue);
    this._emitValueChange(newValue);
  }

  /**
   * @description Setting value in variable and in device - should be override in child classes
   * @param {object} newValue value to set
   */
  setSingle(newValue) {
    throw new Error("Not implemented");
  }

  /**
   * @description Getting value from device - should be override in child classes
   */
  getSingle() {
    throw new Error("Not implemented");
  }

  /**
   * @description Private method to emit ValueChange event
   * @param {object} newValue new value
   */
  _emitValueChange(newValue) {
    this.Events.emit("ValueChanged", [this, newValue]);
  }

  /**
   * @description Variable payload
   */
  get Payload() {
    return this._generatePayload();
  }

  /**
   * @description Method for generating payload - overriding in child classes
   */
  _generatePayload() {
    return {
      id: this.Id,
      timeSample: this.TimeSample,
      name: this.Name
    };
  }

  /**
   * @description Method for generating new variable based on given payload - to be overriten in child classes
   */
  editWithPayload(payload) {
    //Coping all neccessary data to payload
    payload.id = this.Id;

    //If payload has no varaibles define - define it on the basis of current values;
    if (!payload.timeSample) payload.timeSample = this.TimeSample;
    if (!payload.name) payload.name = this.Name;

    let editedVariable = new Variable(this.Device, payload);

    //Reassigining events;
    editedVariable._events = this.Events;
    //Creating new value from payload
    return editedVariable;
  }
}

module.exports = Variable;
