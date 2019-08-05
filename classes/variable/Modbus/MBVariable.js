const Variable = require("../Variable");
const MBRequest = require("../../driver/Modbus/MBRequest");
const Sampler = require("../../sampler/Sampler");
const { exists } = require("../../../utilities/utilities");

class MBVariable extends Variable {
  /**
   * @description Base class representing Modbus variable
   * @param {object} device device associated with variable
   */
  constructor(device) {
    super(device);
  }

  /**
   * @description Method for initializing variable by payload
   * @param {object} payload variable payload
   */
  async init(payload) {
    await super.init(payload);

    if (!exists(payload.fCode)) throw new Error("FCode cannot be empty");
    if (!exists(payload.offset)) throw new Error("Offset cannot be empty");
    if (!exists(payload.length)) throw new Error("Length cannot be empty");
    if (!exists(payload.setSingleFCode))
      throw new Error("SetSingleFCode cannot be empty");
    if (!exists(payload.getSingleFCode))
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

    if (exists(payload.unitId)) this._ownUnitId = payload.unitId;

    this._offset = payload.offset;
    this._length = payload.length;
    this._fcode = payload.fCode;
    this._setSingleFCode = payload.setSingleFCode;
    this._getSingleFCode = payload.getSingleFCode;

    this._getSingleRequest = new MBRequest(
      this.Device.MBDriver,
      payload.getSingleFCode,
      this.UnitId
    );
    this._getSingleRequest.addVariable(this);
    this._setSingleRequest = new MBRequest(
      this.Device.MBDriver,
      payload.setSingleFCode,
      this.UnitId
    );
    this._setSingleRequest.addVariable(this);

    //Setting value if defined
    if (payload.value !== undefined) {
      this.Value = payload.value;
    } else {
      //Setting defualt value - data with all elements equal 0 if not defined in payload
      let dataToSet = [];
      for (let i = 0; i < this._length; i++) {
        dataToSet.push(0);
      }

      //Setting data without invoking event
      this.Data = dataToSet;
    }
  }

  /**
   * @description Method for generating type name that represents variable
   */
  _getTypeName() {
    return "mbVariable";
  }

  /**
   * @description Method for reassigning driver to variable
   */
  reassignDriver() {
    //After driver change - get and set single requests must also change
    this._getSingleRequest = new MBRequest(
      this.Device.MBDriver,
      this.GetSingleFCode,
      this.UnitId
    );
    this._getSingleRequest.addVariable(this);

    this._setSingleRequest = new MBRequest(
      this.Device.MBDriver,
      this.SetSingleFCode,
      this.UnitId
    );
    this._setSingleRequest.addVariable(this);
  }

  get OwnUnitId() {
    return this._ownUnitId;
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
    return exists(this.OwnUnitId) ? this.OwnUnitId : this.Device.UnitId;
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
   * @description Private method for converting data to value - should be overwritten in child classes
   */
  _convertDataToValue() {}

  /**
   * @description Private method for converting value to data - should be overwritten in child classes
   */
  _convertValueToData() {}

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
    payload.getSingleFCode = this.GetSingleFCode;
    payload.setSingleFCode = this.SetSingleFCode;
    if (exists(this.OwnUnitId)) payload.unitId = this.OwnUnitId;

    return payload;
  }

  /**
   * @description Method for editting variable based on given payload
   */
  async editWithPayload(payload) {
    //Controlling if functions are possible
    let allPossibleFCodes = this._getPossibleFCodes();

    if (payload.fCode && !allPossibleFCodes.includes(payload.fCode))
      throw new Error(
        `Fcode ${payload.fCode} cannot be applied to given variable`
      );

    if (
      payload.setSingleFCode &&
      !allPossibleFCodes.includes(payload.setSingleFCode)
    )
      throw new Error(
        `Fcode ${payload.setSingleFCode} cannot be applied to given variable`
      );

    if (
      payload.getSingleFCode &&
      !allPossibleFCodes.includes(payload.getSingleFCode)
    )
      throw new Error(
        `Fcode ${payload.getSingleFCode} cannot be applied to given variable`
      );

    await super.editWithPayload(payload);

    if (payload.unitId) {
      this._ownUnitId = payload.unitId;
    }
    if (payload.offset) {
      this._offset = payload.offset;
    }
    if (payload.length) {
      this._length = payload.length;
    }
    if (payload.fCode) {
      this._fcode = payload.fCode;
    }
    if (payload.value !== undefined) {
      this.Value = payload.value;
      //new valueTickId should be set
      this.ValueTickId = Sampler.convertDateToTickNumber(Date.now());
    }
    if (payload.getSingleFCode) {
      this._getSingleFCode = payload.getSingleFCode;
      this._getSingleRequest = new MBRequest(
        this.Device.MBDriver,
        payload.getSingleFCode,
        this.UnitId
      );
      this._getSingleRequest.addVariable(this);
    }
    if (payload.setSingleFCode) {
      this._setSingleFCode = payload.setSingleFCode;
      this._setSingleRequest = new MBRequest(
        this.Device.MBDriver,
        payload.setSingleFCode,
        this.UnitId
      );
      this._setSingleRequest.addVariable(this);
    }

    return this;
  }
}

module.exports = MBVariable;
