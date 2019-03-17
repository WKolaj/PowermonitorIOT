const Variable = require("../Variable");
class MBVariable extends Variable {
  constructor(device, name, fcode, offset, length) {
    super(device, name);
    this._offset = offset;
    this._length = length;
    this._fcode = fcode;
  }

  get FCode() {
    return this._fcode;
  }

  get Offset() {
    return this._offset;
  }

  get Length() {
    return this._length;
  }

  get UnitId() {
    return this.Device.UnitId;
  }

  get Data() {
    return this._data;
  }

  set Data(data) {
    this._data = data;
    this._value = this._convertDataToValue(data);
    //Emitting singal of value change
    this._emitValueChange(this._value);
  }

  _getValue() {
    return this._value;
  }

  _setValue(value) {
    this._value = value;
    this._data = this._convertValueToData(value);
  }
}

module.exports = MBVariable;
