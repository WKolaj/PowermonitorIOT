const MBVariable = require("./MBVariable");

//Converting register array to Int16
const mbDataToBoolean = function(mbData) {
  return mbData[0] > 0;
};

//Converting Int16 to register array
const booleanToMBData = function(booleanValue) {
  return [booleanValue];
};

class MBBooleanVariable extends MBVariable {
  /**
   * @description Modbus Boolean variable
   * @param {Object} device Device associated with variable
   */
  constructor(device) {
    super(device);
  }

  /**
   * @description Method for initializing variable by payload
   * @param {object} payload variable payload
   */
  async init(payload) {
    if (!payload) throw new Error("Payload cannot be empty");
    payload.length = 1;
    payload.getSingleFCode =
      payload.fCode === 2 || payload.fCode == 1 ? payload.fCode : 1;
    payload.setSingleFCode = 15;

    await super.init(payload);
  }

  /**
   * @description Method for generating type name that represents variable
   */
  _getTypeName() {
    return "mbBoolean";
  }

  /**
   * @description method for converting data to value
   * @param {Array} data array of UInt16 representing data
   */
  _convertDataToValue(data) {
    return mbDataToBoolean(data);
  }

  /**
   * @description method for converting value to data
   * @param {Boolean} value value  to be converted
   */
  _convertValueToData(value) {
    return booleanToMBData(value);
  }

  /**
   * @description Private method called for getting all possible FCodes - implemented in child
   */
  _getPossibleFCodes() {
    return [1, 2, 15];
  }

  /**
   * @description Method for edditing variable
   * @param {Object} payload Payload to edit
   */
  async editWithPayload(payload) {
    payload.length = 1;
    let fCode = this.FCode;
    if (payload.fCode) fCode = payload.fCode;
    payload.getSingleFCode = fCode === 1 || fCode == 2 ? fCode : 1;
    payload.setSingleFCode = 15;
    return super.editWithPayload(payload);
  }

  /**
   * @description Method for generating type of value of variable
   */
  _getValueType() {
    return "boolean";
  }
}

module.exports = MBBooleanVariable;
