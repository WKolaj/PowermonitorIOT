const S7Variable = require("./S7Variable");

//Converting register array to Int8
const s7DataToInt8 = function(data) {
  var buf = new ArrayBuffer(1);

  var view = new DataView(buf);

  view.setUint8(0, data[0]);

  return view.getInt8(0);
};

//Converting Int8 to register array
const int8ToS7Data = function(intValue) {
  //Split int16 into bytes
  let int8Array = new Int8Array(1);
  int8Array[0] = intValue;
  let bytes = new Int8Array(int8Array.buffer);

  return [bytes[0]];
};

class S7Int8Variable extends S7Variable {
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
    return "s7Int8";
  }

  /**
   * @description method for converting data to value
   * @param {Array} data array of UInt16 representing data
   */
  _convertDataToValue(data) {
    return s7DataToInt8(data);
  }

  /**
   * @description method for converting value to data
   * @param {number} value value  to be converted
   */
  _convertValueToData(value) {
    return int8ToS7Data(value);
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

module.exports = S7Int8Variable;
