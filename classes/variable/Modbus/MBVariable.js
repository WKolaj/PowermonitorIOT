const Variable = require("../Variable");
const MBRequest = require("../../driver/Modbus/MBRequest");

class MBVariable extends Variable {
  /**
   * @description Base class representing Modbus variable
   * @param {object} device device associated with variable
   * @param {object} payload varaible payload
   */
  constructor(device, payload) {
    super(device, payload);

    if (!payload.fCode) throw new Error("FCode cannot be empty");
    if (!payload.offset) throw new Error("Offset cannot be empty");
    if (!payload.length) throw new Error("Length cannot be empty");
    if (!payload.setSingleFCode)
      throw new Error("SetSingleFCode cannot be empty");
    if (!payload.getSingleFCode)
      throw new Error("GetSingleFCode cannot be empty");

    //Controlling if functions are possible
    let allPossibleFCodes = this._getPossibleFCodes();

    if (!allPossibleFCodes.includes(payload.fCode))
      throw new Error(
        `Fcode ${payload.fCode} cannot be applied to given variable`
      );

    if (!allPossibleFCodes.includes(payload.setSingleFCode))
      throw new Error(
        `Fcode ${payload.setSingleFCode} cannot be applied to given variable`
      );

    if (!allPossibleFCodes.includes(payload.getSingleFCode))
      throw new Error(
        `Fcode ${payload.getSingleFCode} cannot be applied to given variable`
      );

    this._offset = payload.offset;
    this._length = payload.length;
    this._fcode = payload.fCode;
    this._setSingleFCode = payload.setSingleFCode;
    this._getSingleFCode = payload.getSingleFCode;

    this._getSingleRequest = new MBRequest(
      device.MBDriver,
      payload.getSingleFCode,
      device.UnitId
    );
    this._getSingleRequest.addVariable(this);
    this._setSingleRequest = new MBRequest(
      device.MBDriver,
      payload.setSingleFCode,
      device.UnitId
    );
    this._setSingleRequest.addVariable(this);

    //Setting value if defined
    if (payload.value !== undefined) this.Value = payload.value;
  }

  /**
   * @description Modbus function code
   */
  get FCode() {
    return this._fcode;
  }

  /**
   * @description Variable offset
   */
  get Offset() {
    return this._offset;
  }

  /**
   * @description Variable length
   */
  get Length() {
    return this._length;
  }

  /**
   * @description Variable UnitId
   */
  get UnitId() {
    return this.Device.UnitId;
  }

  /**
   * @description Request for getting single request
   */
  get GetSingleRequest() {
    return this._getSingleRequest;
  }

  /**
   * @description Request for setting single request
   */
  get SetSingleRequest() {
    return this._setSingleRequest;
  }

  /**
   * @description FCode for setting single variable
   */
  get SetSingleFCode() {
    return this._setSingleFCode;
  }

  /**
   * @description FCode for getting single variable
   */
  get GetSingleFCode() {
    return this._getSingleFCode;
  }

  /**
   * @description Setting value in variable and in Modbus device
   * @param {object} newValue value to set
   */
  setSingle(newValue) {
    this.Value = newValue;
    this._setSingleRequest.updateAction();
    return this.Device.MBDriver.invokeRequests([this.SetSingleRequest]);
  }

  /**
   * @description Getting value from device
   */
  getSingle() {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.Device.MBDriver.invokeRequests([
          this.GetSingleRequest
        ]);

        return resolve(this.Value);
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Variable Data
   */
  get Data() {
    return this._data;
  }

  /**
   * @description Variable Data
   */
  set Data(data) {
    if (data.length != this.Length)
      throw new Error(
        `Invalid data length: variable: ${this.Length}, data: ${data.length}`
      );

    this._data = data;
    this._value = this._convertDataToValue(data);
    //Emitting singal of value change
    this._emitValueChange(this._value);
  }

  /**
   * @description Private method called in order to retrieve Value
   */
  _getValue() {
    return this._value;
  }

  /**
   * @description Private method called to set value on the basis of new value
   */
  _setValue(value) {
    let convertedData = this._convertValueToData(value);
    if (convertedData.length != this.Length)
      throw new Error(
        `Invalid data length: variable: ${this.Length}, data: ${
          convertedData.length
        }`
      );

    this._value = value;
    this._data = convertedData;
  }

  /**
   * @description Private method called for getting all possible FCodes - implemented in child
   */
  _getPossibleFCodes() {
    return [1, 2, 3, 4, 15, 16];
  }

  /**
   * @description Method for generating payload - overriding in child classes
   */
  _generatePayload() {
    let payload = super._generatePayload();

    payload.offset = this.Offset;
    payload.length = this.Length;
    payload.fCode = this.FCode;
    payload.value = this.Value;

    return payload;
  }

  _generatePayloadToEdit(payload) {
    //Coping all neccessary data to payload
    payload.id = this.Id;

    //If payload has no varaibles define - define it on the basis of current values;
    if (!payload.timeSample) payload.timeSample = this.TimeSample;
    if (!payload.name) payload.name = this.Name;

    if (!payload.offset) payload.offset = this.Offset;
    if (!payload.length) payload.length = this.Length;
    if (!payload.fCode) payload.fCode = this.FCode;
    if (payload.value === undefined) payload.value = this.Value;
    if (!payload.getSingleFCode) payload.getSingleFCode = this.GetSingleFCode;
    if (!payload.setSingleFCode) payload.setSingleFCode = this.SetSingleFCode;

    return payload;
  }

  /**
   * @description Method for generating new variable based on given payload
   */
  editWithPayload(payload) {
    //Creating new value from payload
    let editedVariable = new MBVariable(
      this.Device,
      this._generatePayloadToEdit(payload)
    );

    //Reassigining events;
    editedVariable._events = this.Events;

    return editedVariable;
  }
}

module.exports = MBVariable;
