const EventEmitter = require("events");
const Sampler = require("../sampler/Sampler");
const mongoose = require("mongoose");

class Variable {
  /**
   * @description Base class representing Variable
   * @param {object} device device associated with variable
   */
  constructor(device) {
    if (!device) throw new Error("Variable device cannot be empty");

    this._device = device;
    this._events = new EventEmitter();
    this._valueTickId = 0;
  }

  /**
   * @description Method for initializing variable by payload
   * @param {object} payload variable payload
   */
  async init(payload) {
    if (!payload) throw new Error("Payload cannot be empty");
    if (!payload.name) throw new Error("Payload Name cannot be empty");
    this._name = payload.name;

    //If time sample not defined - defininf as 1
    if (!payload.timeSample) payload.timeSample = 1;
    this._tickId = Sampler.convertTimeSampleToTickId(payload.timeSample);

    //Setting archive tick id to the same value as tick id - if archiveTickId is not defined
    if (!payload.archiveTimeSample)
      this._archiveTickId = Sampler.convertTimeSampleToTickId(
        payload.timeSample
      );
    else
      this._archiveTickId = Sampler.convertTimeSampleToTickId(
        payload.archiveTimeSample
      );

    //Generating random id in case it was not provided
    if (!payload.id) payload.id = Variable.generateRandId();
    this._id = payload.id;

    if (!payload.unit) payload.unit = "";
    this._unit = payload.unit;

    //Setting archive settings according to value
    if (payload.archived) this._archived = true;
    else this._archived = false;
  }

  get Unit() {
    return this._unit;
  }

  /**
   * @description Should variable be archived?
   */
  get Archived() {
    return this._archived;
  }

  /**
   * @description Generating random id
   */
  static generateRandId() {
    return mongoose.Types.ObjectId().toHexString();
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

  /**@description TickId for archiving */
  get ArchiveTickId() {
    return this._archiveTickId;
  }

  /**@description TimeSample for archiving */
  get ArchiveTimeSample() {
    return Sampler.convertTickIdToTimeSample(this._archiveTickId);
  }

  /**@description TimeSample for archiving */
  set ArchiveTimeSample(value) {
    this._archiveTickId = Sampler.convertTimeSampleToTickId(value);
  }

  /**
   * @description Sample time of variable
   */
  set TimeSample(value) {
    this._tickId = Sampler.convertTimeSampleToTickId(value);
  }

  /**
   * @description Type of variable
   */
  get Type() {
    return this._type;
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
   * @description TickId of last variable refresh
   */
  get ValueTickId() {
    return this._valueTickId;
  }

  /**
   * @description TickId of last variable refresh
   */
  set ValueTickId(value) {
    this._valueTickId = value;
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
      name: this.Name,
      archived: this.Archived,
      unit: this.Unit,
      archiveTimeSample: this.ArchiveTimeSample
    };
  }

  /**
   * @description Method for editing variable based on given payload
   */
  async editWithPayload(payload) {
    //Coping all neccessary data to payload
    if (payload.id && payload.id !== this.Id)
      throw new Error(
        `Given id: ${payload.id} is different than variable id: ${this.Id}`
      );

    //If payload has no varaibles define - define it on the basis of current values;
    if (payload.timeSample) this.TimeSample = payload.timeSample;
    if (payload.name) this._name = payload.name;
    if (payload.archived !== undefined) this._archived = payload.archived;
    if (payload.unit) this._unit = payload.unit;
    if (payload.archiveTimeSample)
      this.ArchiveTimeSample = payload.archiveTimeSample;

    //returning edited variable
    return this;
  }
}

module.exports = Variable;
