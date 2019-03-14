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

  set Data(value) {
    this._data = value;
    //_convertDataToVariable should be override in children class
    this.Value = this._convertDataToValue(value);
  }

  _getValue() {
    return this._convertDataToValue(this._data);
  }

  _setValue(value) {
    this._data = this._convertValueToData(value);
  }
}

module.exports = MBVariable;
