const MBVariable = require("./MBVariable");

//Converting register array to Int16
const mbDataToBoolean = function(mbData) {
  return mbData[0];
};

//Converting Int16 to register array
const booleanToMBData = function(booleanValue) {
  return [booleanValue];
};

class MBBooleanVariable extends MBVariable {
  constructor(device, name, fcode, offset) {
    super(device, name, fcode, offset, 1, 15, 1);
  }

  _convertDataToValue(data) {
    return mbDataToBoolean(data);
  }

  _convertValueToData(value) {
    return booleanToMBData(value);
  }

  /**
   * @description Private method called for getting all possible FCodes - implemented in child
   */
  _getPossibleFCodes() {
    return [1, 2, 15];
  }
}

module.exports = MBBooleanVariable;
