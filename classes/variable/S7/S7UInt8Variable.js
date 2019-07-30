const S7Variable = require("./S7Variable");

//Converting register array to uInt8
const s7DataToUInt8 = function(data) {
  var buf = new ArrayBuffer(1);

  var view = new DataView(buf);

  view.setUint8(0, data[0]);

  return view.getUint8(0);
};

//Converting uInt8 to register array
const uint8ToS7Data = function(intValue) {
  //Split int16 into bytes
  let uint8Array = new Uint8Array(1);
  uint8Array[0] = intValue;
  let bytes = new Int8Array(uint8Array.buffer);

  return [bytes[0]];
};

class S7UInt8Variable extends S7Variable {
  /**
   * @description Modbus Int16 variable
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
    await super.init(payload);
  }

  /**
   * @description Method for generating type name that represents variable
   */
  _getTypeName() {
    return "s7UInt8";
  }

  /**
   * @description method for converting data to value
   * @param {Array} data array of UInt16 representing data
   */
  _convertDataToValue(data) {
    return s7DataToUInt8(data);
  }

  /**
   * @description method for converting value to data
   * @param {number} value value  to be converted
   */
  _convertValueToData(value) {
    return uint8ToS7Data(value);
  }

  /**
   * @description Method for edditing variable
   * @param {Object} payload Payload to edit
   */
  async editWithPayload(payload) {
    payload.length = 1;

    return super.editWithPayload(payload);
  }

  /**
   * @description Method for generating type of value of variable
   */
  _getValueType() {
    return "integer";
  }
}

module.exports = S7UInt8Variable;
