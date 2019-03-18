const Variable = require("../Variable");
const MBRequest = require("../../driver/Modbus/MBRequest");

class MBVariable extends Variable {
  /**
   * @description Base class representing Modbus variable
   * @param {object} device device associated with variable
   * @param {string} name variable name
   * @param {number} fcode Modbus function code
   * @param {number} offset variable offset
   * @param {number} length variable length
   * @param {number} setSingleFCode fCode for setting single variable
   * @param {number} getSingleFCode fCode for getting single variable
   */
  constructor(
    device,
    name,
    fcode,
    offset,
    length,
    setSingleFCode,
    getSingleFCode
  ) {
    super(device, name);
    if (!fcode) throw new Error("FCode cannot be empty");
    if (!offset) throw new Error("Offset cannot be empty");
    if (!length) throw new Error("Length cannot be empty");
    if (!setSingleFCode) throw new Error("SetSingleFCode cannot be empty");
    if (!getSingleFCode) throw new Error("getSingleFCode cannot be empty");

    //Controlling if functions are possible
    let allPossibleFCodes = this._getPossibleFCodes();

    if (!allPossibleFCodes.includes(fcode))
      throw new Error(`Fcode ${fcode} cannot be applied to given variable`);

    if (!allPossibleFCodes.includes(setSingleFCode))
      throw new Error(
        `Fcode ${setSingleFCode} cannot be applied to given variable`
      );

    if (!allPossibleFCodes.includes(getSingleFCode))
      throw new Error(
        `Fcode ${getSingleFCode} cannot be applied to given variable`
      );

    this._offset = offset;
    this._length = length;
    this._fcode = fcode;
    this._setSingleFCode = setSingleFCode;
    this._getSingleFCode = getSingleFCode;

    this._getSingleRequest = new MBRequest(
      device.MBDriver,
      getSingleFCode,
      device.UnitId
    );
    this._getSingleRequest.addVariable(this);
    this._setSingleRequest = new MBRequest(
      device.MBDriver,
      setSingleFCode,
      device.UnitId
    );
    this._setSingleRequest.addVariable(this);
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
}

module.exports = MBVariable;
