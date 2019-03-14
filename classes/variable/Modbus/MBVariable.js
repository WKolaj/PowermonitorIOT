const Variable = require("../Variable");
class MBVariable extends Variable {
  constructor(name, offset, length) {
    super(name);
    this._offset = offset;
    this._length = length;
  }

  get Offset() {
    return this._offset;
  }

  get Length() {
    return this._length;
  }

  get Data() {
    return this._data;
  }

  set Data(value) {
    this._data = value;
  }
}

module.exports = MBVariable;
