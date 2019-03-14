const MBVariable = require("./MBVariable");

class MBInt16Variable extends MBVariable {
  constructor(device, name, fcode, offset) {
    super(device, name, fcode, offset, 1);
  }

  _convertDataToValue(value) {
    return value;
  }

  _convertValueToData(value) {
    return value;
  }
}

module.exports = MBInt16Variable;
