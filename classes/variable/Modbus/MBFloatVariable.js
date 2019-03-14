const MBVariable = require("./MBVariable");
const MBConvertFunctions = require("./MBConvertFunctions");

class MBFloatVariable extends MBVariable {
  constructor(device, name, fcode, offset) {
    super(device, name, fcode, offset, 2);
  }

  _convertDataToValue(data) {
    return MBConvertFunctions.MBDataToFloat(data);
  }

  _convertValueToData(value) {
    return MBConvertFunctions.FloatToMBData(value);
  }
}

module.exports = MBFloatVariable;
