const EventEmitter = require("events");
const Sampler = require("../sampler/Sampler");
const mongoose = require("mongoose");

class Element {
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
    if (!payload.sampleTime) payload.sampleTime = 1;
    this._tickId = Sampler.convertSampleTimeToTickId(payload.sampleTime);

    //Setting archive tick id to the same value as tick id - if archiveTickId is not defined
    if (!payload.archiveSampleTime)
      this._archiveTickId = Sampler.convertSampleTimeToTickId(
        payload.sampleTime
      );
    else
      this._archiveTickId = Sampler.convertSampleTimeToTickId(
        payload.archiveSampleTime
      );

    //Generating random id in case it was not provided
    if (!payload.id) payload.id = Element.generateRandId();
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

  /**@description SampleTime for archiving */
  get ArchiveSampleTime() {
    return Sampler.convertTickIdToSampleTime(this._archiveTickId);
  }

  /**@description SampleTime for archiving */
  set ArchiveSampleTime(value) {
    this._archiveTickId = Sampler.convertSampleTimeToTickId(value);
  }

  /**
   * @description Sample time of variable
   */
  set SampleTime(value) {
    this._tickId = Sampler.convertSampleTimeToTickId(value);
  }

  /**
   * @description Type of variable
   */
  get Type() {
    return this._getTypeName();
  }

  /**
   * @description Method for generating type name that represents variable
   */
  _getTypeName() {
    throw new Error("Not implemented");
  }

  /**
   * @description Sample time of variable
   */
  get SampleTime() {
    return Sampler.convertTickIdToSampleTime(this._tickId);
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
      name: this.Name,
      sampleTime: this.SampleTime,
      archived: this.Archived,
      unit: this.Unit,
      archiveSampleTime: this.ArchiveSampleTime,
      type: this.Type
    };
  }

  /**
   * @description Method for generating type name that represents value type of variable - should be overwrite in child classes
   */
  _getValueType() {
    throw new Error("Not implemented");
  }

  /**
   * @description Value type name of calculation element
   */
  get ValueType() {
    return this._getValueType();
  }

  async getValueFromDB(variableId, date) {
    return this.Device.ArchiveManager.doesElementIdExists(variableId)
      ? this.Device.ArchiveManager.getValue(date, variableId)
      : Promise.resolve(undefined);
  }

  async getValuesFromDB(variableId, fromDate, endDate) {
    return this.Device.ArchiveManager.doesElementIdExists(variableId)
      ? this.Device.ArchiveManager.getValues(variableId, fromDate, endDate)
      : Promise.resolve(undefined);
  }
}

module.exports = Element;
