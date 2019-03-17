const Variable = require("../Variable");
class MBVariable extends Variable {
  /**
   * @description Base class representing Modbus variable
   * @param {object} device device associated with variable
   * @param {string} name variable name
   * @param {number} fcode Modbus function code
   * @param {number} offset variable offset
   * @param {number} length variable length
   */
  constructor(device, name, fcode, offset, length) {
    super(device, name);
    if (!fcode) throw new Error("FCode cannot be empty");
    if (!offset) throw new Error("Offset cannot be empty");
    if (!length) throw new Error("Length cannot be empty");
    //Controlling if functions are possible
    let allPossibleFCodes = this._getPossibleFCodes();

    if (!allPossibleFCodes.includes(fcode))
      throw new Error(`Fcode ${fcode} cannot be applied to given variable`);

    this._offset = offset;
    this._length = length;
    this._fcode = fcode;
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
   * @description Variable Data
   */
  get Data() {
    return this._data;
  }

  /**
   * @description Variable Data
   */
  set Data(data) {
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
    this._value = value;
    this._data = this._convertValueToData(value);
  }

  /**
   * @description Private method called for getting all possible FCodes - implemented in child
   */
  _getPossibleFCodes() {
    return [1, 2, 3, 4, 15, 16];
  }
}

module.exports = MBVariable;
